import { Request, Response } from 'express';
import { Bet } from '../../../models/Bet';
import { User } from '../../../models/User';
import { Market } from '../../../models/Market';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { HierarchyService } from '../../../services/hierarchyService';
import { AuthenticatedRequest } from '../../../middlewares/auth';

// Get hierarchical users for the current user
export const getHierarchicalUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        const { role } = req.query;
        let users: Array<{ _id: string; username: string; role: string; isActive: boolean; parentId?: string }> = [];

        switch (currentUser.role) {
            case 'superadmin': {
                // Superadmin can see all users
                const query: Record<string, unknown> = {};
                if (role) query.role = role;
                const superadminUsers = await User.find(query).select('username role isActive parentId').lean();
                users = superadminUsers.map(user => ({
                    _id: user._id.toString(),
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                    parentId: user.parentId?.toString()
                }));
                break;
            }

            case 'admin': {
                // Admin can see distributors, agents, and players under them
                const adminDownline = await HierarchyService.getAllDownlineUserIds(currentUser.userId, false);
                const adminUsers = await User.find({
                    _id: { $in: adminDownline },
                    ...(role && { role })
                }).select('username role isActive parentId').lean();
                users = adminUsers.map(user => ({
                    _id: user._id.toString(),
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                    parentId: user.parentId?.toString()
                }));
                break;
            }

            case 'distributor': {
                // Distributor can see agents and players under them
                const distributorDownline = await HierarchyService.getAllDownlineUserIds(currentUser.userId, false);
                const distributorUsers = await User.find({
                    _id: { $in: distributorDownline },
                    ...(role && { role })
                }).select('username role isActive parentId').lean();
                users = distributorUsers.map(user => ({
                    _id: user._id.toString(),
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                    parentId: user.parentId?.toString()
                }));
                break;
            }

            case 'agent': {
                // Agent can see players under them
                const agentDownline = await HierarchyService.getAllDownlineUserIds(currentUser.userId, false);
                const agentUsers = await User.find({
                    _id: { $in: agentDownline },
                    ...(role && { role })
                }).select('username role isActive parentId').lean();
                users = agentUsers.map(user => ({
                    _id: user._id.toString(),
                    username: user.username,
                    role: user.role,
                    isActive: user.isActive,
                    parentId: user.parentId?.toString()
                }));
                break;
            }

            default:
                res.status(403).json({ success: false, message: 'Insufficient permissions' });
                return;
        }

        // Group users by role
        const groupedUsers = users.reduce((acc, user) => {
            if (!acc[user.role]) {
                acc[user.role] = [];
            }
            acc[user.role].push({
                _id: user._id,
                username: user.username,
                role: user.role,
                isActive: user.isActive,
                parentId: user.parentId
            });
            return acc;
        }, {} as Record<string, Array<{ _id: string; username: string; role: string; isActive: boolean; parentId?: string }>>);

        res.json({
            success: true,
            message: 'Hierarchical users retrieved successfully',
            data: groupedUsers
        });
    } catch (error) {
        console.error('Get hierarchical users error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get assigned markets for the current user
export const getAssignedMarkets = async (req: Request, res: Response): Promise<void> => {
    try {
        const currentUser = (req as AuthenticatedRequest).user;
        if (!currentUser) {
            res.status(401).json({ success: false, message: 'Authentication required' });
            return;
        }

        // Get markets assigned to the current user and their downline
        const userAssignments = await UserMarketAssignment.find({
            assignedTo: currentUser.userId,
            isActive: true
        }).populate('marketId');

        // Get all downline user IDs
        const downlineUserIds = await HierarchyService.getAllDownlineUserIds(currentUser.userId, true);

        // Get assignments for all downline users
        const downlineAssignments = await UserMarketAssignment.find({
            assignedTo: { $in: downlineUserIds },
            isActive: true
        }).populate('marketId');

        // Combine and deduplicate market IDs
        const allAssignments = [...userAssignments, ...downlineAssignments];
        const uniqueMarketIds = new Set<string>();

        allAssignments.forEach(assignment => {
            if (assignment.marketId) {
                uniqueMarketIds.add(assignment.marketId._id.toString());
            }
        });

        // Get market details
        const markets = await Market.find({
            _id: { $in: Array.from(uniqueMarketIds) }
        }).select('marketName openTime closeTime isActive');

        res.json({
            success: true,
            message: 'Assigned markets retrieved successfully',
            data: markets
        });
    } catch (error) {
        console.error('Get assigned markets error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getAllLoads = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get date from query or use today
        const { date, userId, marketId } = req.query;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let start: Date, end: Date;
        if (date) {
            start = new Date(date as string);
            end = new Date(start);
            end.setDate(start.getDate() + 1);
        } else {
            start = today;
            end = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        }

        // Build query for bets
        const betQuery: Record<string, unknown> = {
            createdAt: { $gte: start, $lt: end }
        };

        // Add user filter if provided
        if (userId) {
            const currentUser = (req as AuthenticatedRequest).user;
            if (!currentUser) {
                res.status(401).json({ success: false, message: 'Authentication required' });
                return;
            }

            // Check if the requested user is accessible to current user
            const accessibleUserIds = await HierarchyService.getAllDownlineUserIds(currentUser.userId, true);

            if (!accessibleUserIds.includes(userId as string)) {
                res.status(403).json({ success: false, message: 'Access denied to this user' });
                return;
            }

            // If userId is provided, get all downline users for hierarchical aggregation
            const selectedUserDownline = await HierarchyService.getAllDownlineUserIds(userId as string, true);
            betQuery.userId = { $in: selectedUserDownline };
        }

        // Add market filter if provided
        if (marketId) {
            betQuery.marketId = marketId;
        }

        // Get all bets for the date with filters
        const bets = await Bet.find(betQuery).lean();

        console.log('Raw bets:', bets); // Debug: see the actual bet structure

        // Types to group by (removed 'panna' and 'sangam' as they are stored in different objects)
        const types = [
            'single', 'jodi', 'single_panna', 'double_panna', 'triple_panna',
            'motor_sp', 'motor_dp', 'common_sp', 'common_dp', 'common_sp_dp',
            'half_bracket', 'full_bracket', 'family_panel', 'cycle_panna'
        ];

        // Group and aggregate by bet type - only include relevant bet types for each game
        const result: Record<string, Record<string, Record<string, number>>> = {};

        // Games with only open and close
        const openCloseGames = ['single', 'single_panna', 'double_panna', 'triple_panna', 'motor_sp', 'motor_dp', 'common_sp', 'common_dp', 'common_sp_dp', 'cycle_panna'];
        for (const type of openCloseGames) {
            result[type] = {
                open: {},
                close: {}
            };
        }

        // Games with only both
        const bothOnlyGames = ['jodi', 'half_bracket', 'full_bracket', 'family_panel'];
        for (const type of bothOnlyGames) {
            result[type] = {
                both: {}
            };
        }

        // Special handling for sangam types (only both)
        result.half_sangam_close = {
            both: {}
        };
        result.half_sangam_open = {
            both: {}
        };
        result.full_sangam = {
            both: {}
        };

        for (const bet of bets) {
            const type = bet.type;
            const betType = bet.betType || 'open'; // Default to 'open' if not specified

            // Special handling for sangam
            if (type === 'sangam') {
                let numbersObj: Record<string, number> = {};

                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                // Categorize sangam bets by bet type
                for (const [key, value] of Object.entries(numbersObj)) {
                    if (key.includes('9X')) {
                        // half_sangam_close
                        if (!result.half_sangam_close[betType][key]) result.half_sangam_close[betType][key] = 0;
                        result.half_sangam_close[betType][key] += value;
                    } else if (key.includes('X') && !key.includes('9X')) {
                        // half_sangam_open
                        if (!result.half_sangam_open[betType][key]) result.half_sangam_open[betType][key] = 0;
                        result.half_sangam_open[betType][key] += value;
                    } else if (key.includes('-')) {
                        // full_sangam
                        if (!result.full_sangam[betType][key]) result.full_sangam[betType][key] = 0;
                        result.full_sangam[betType][key] += value;
                    } else {
                        // fallback to regular sangam
                        if (!result[type][betType][key]) result[type][betType][key] = 0;
                        result[type][betType][key] += value;
                    }
                }
                continue; // Skip the regular processing for sangam
            }

            // Special handling for jodi - format keys as 2-digit numbers (only both bet type)
            if (type === 'jodi') {
                let numbersObj: Record<string, number> = {};

                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                // Format jodi keys as 2-digit numbers (only both bet type)
                for (const [key, value] of Object.entries(numbersObj)) {
                    const formattedKey = key.padStart(2, '0'); // Convert 1 to 01, 2 to 02, etc.
                    if (!result[type].both[formattedKey]) result[type].both[formattedKey] = 0;
                    result[type].both[formattedKey] += value;
                }
                continue; // Skip the regular processing for jodi
            }

            // Special handling for family_panel - format keys as 2-digit numbers (only both bet type)
            if (type === 'family_panel') {
                let numbersObj: Record<string, number> = {};

                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                // Format family_panel keys as 2-digit numbers (only both bet type)
                for (const [key, value] of Object.entries(numbersObj)) {
                    const formattedKey = key.padStart(2, '0'); // Convert 1 to 01, 2 to 02, etc.
                    if (!result[type].both[formattedKey]) result[type].both[formattedKey] = 0;
                    result[type].both[formattedKey] += value;
                }
                continue; // Skip the regular processing for family_panel
            }

            // Handle selectedNumbers - parse the object structure
            let numbersObj: Record<string, number> = {};

            if (typeof bet.selectedNumbers === 'string') {
                try {
                    numbersObj = JSON.parse(bet.selectedNumbers);
                } catch {
                    numbersObj = { [bet.selectedNumbers]: bet.amount };
                }
            } else if (Array.isArray(bet.selectedNumbers)) {
                // If it's an array, convert to object with equal distribution
                const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                bet.selectedNumbers.forEach((num: unknown) => {
                    const key = String(num);
                    numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                });
            } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                // If it's already an object, use it directly
                numbersObj = bet.selectedNumbers;
            } else {
                // Fallback
                numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
            }

            console.log(`Bet type: ${type}, selectedNumbers:`, bet.selectedNumbers, 'processed as:', numbersObj); // Debug

            // Merge the numbers object into the result by bet type
            // Only include relevant bet types for each game
            const bothOnlyGames = ['jodi', 'half_bracket', 'full_bracket', 'family_panel'];
            if (bothOnlyGames.includes(type)) {
                // Games that only have 'both' bet type
                for (const [key, value] of Object.entries(numbersObj)) {
                    if (!result[type].both[key]) result[type].both[key] = 0;
                    result[type].both[key] += value;
                }
            } else {
                // Games that have 'open' and 'close' bet types
                for (const [key, value] of Object.entries(numbersObj)) {
                    if (!result[type][betType][key]) result[type][betType][key] = 0;
                    result[type][betType][key] += value;
                }
            }
        }

        // Calculate complete bet statistics
        const betStats = {
            totalBets: bets.length,
            totalAmount: bets.reduce((sum, bet) => sum + bet.amount, 0),
            betTypeStats: {
                open: {
                    count: bets.filter(b => b.betType === 'open').length,
                    amount: bets.filter(b => b.betType === 'open').reduce((sum, bet) => sum + bet.amount, 0)
                },
                close: {
                    count: bets.filter(b => b.betType === 'close').length,
                    amount: bets.filter(b => b.betType === 'close').reduce((sum, bet) => sum + bet.amount, 0)
                },
                both: {
                    count: bets.filter(b => b.betType === 'both').length,
                    amount: bets.filter(b => b.betType === 'both').reduce((sum, bet) => sum + bet.amount, 0)
                }
            },
            gameTypeStats: {} as Record<string, { count: number; amount: number; betTypes: Record<string, { count: number; amount: number }> }>
        };

        // Calculate complete totals for each game type
        const completeTotals: Record<string, { open?: number; close?: number; both?: number; total: number }> = {};

        // Initialize totals for all game types based on their allowed bet types
        for (const type of types) {
            if (bothOnlyGames.includes(type)) {
                completeTotals[type] = { both: 0, total: 0 };
            } else {
                completeTotals[type] = { open: 0, close: 0, total: 0 };
            }
        }

        // Add sangam subtypes (only both)
        completeTotals.half_sangam_open = { both: 0, total: 0 };
        completeTotals.half_sangam_close = { both: 0, total: 0 };
        completeTotals.full_sangam = { both: 0, total: 0 };

        // Calculate stats for each game type
        for (const type of types) {
            const typeBets = bets.filter(b => b.type === type);
            const openBets = typeBets.filter(b => b.betType === 'open');
            const closeBets = typeBets.filter(b => b.betType === 'close');
            const bothBets = typeBets.filter(b => b.betType === 'both');

            const openAmount = openBets.reduce((sum, bet) => sum + bet.amount, 0);
            const closeAmount = closeBets.reduce((sum, bet) => sum + bet.amount, 0);
            const bothAmount = bothBets.reduce((sum, bet) => sum + bet.amount, 0);

            betStats.gameTypeStats[type] = {
                count: typeBets.length,
                amount: typeBets.reduce((sum, bet) => sum + bet.amount, 0),
                betTypes: {
                    open: {
                        count: openBets.length,
                        amount: openAmount
                    },
                    close: {
                        count: closeBets.length,
                        amount: closeAmount
                    },
                    both: {
                        count: bothBets.length,
                        amount: bothAmount
                    }
                }
            };

            // Update complete totals based on game type
            if (bothOnlyGames.includes(type)) {
                completeTotals[type] = {
                    both: bothAmount,
                    total: bothAmount
                };
            } else {
                completeTotals[type] = {
                    open: openAmount,
                    close: closeAmount,
                    total: openAmount + closeAmount
                };
            }
        }

        // Add sangam subtype stats
        const sangamBets = bets.filter(b => b.type === 'sangam');
        if (sangamBets.length > 0) {
            betStats.gameTypeStats.half_sangam_open = {
                count: 0,
                amount: 0,
                betTypes: { open: { count: 0, amount: 0 }, close: { count: 0, amount: 0 }, both: { count: 0, amount: 0 } }
            };
            betStats.gameTypeStats.half_sangam_close = {
                count: 0,
                amount: 0,
                betTypes: { open: { count: 0, amount: 0 }, close: { count: 0, amount: 0 }, both: { count: 0, amount: 0 } }
            };
            betStats.gameTypeStats.full_sangam = {
                count: 0,
                amount: 0,
                betTypes: { open: { count: 0, amount: 0 }, close: { count: 0, amount: 0 }, both: { count: 0, amount: 0 } }
            };

            // Categorize sangam bets
            for (const bet of sangamBets) {
                let numbersObj: Record<string, number> = {};
                if (typeof bet.selectedNumbers === 'string') {
                    try {
                        numbersObj = JSON.parse(bet.selectedNumbers);
                    } catch {
                        numbersObj = { [bet.selectedNumbers]: bet.amount };
                    }
                } else if (Array.isArray(bet.selectedNumbers)) {
                    const amountPerNumber = bet.amount / bet.selectedNumbers.length;
                    bet.selectedNumbers.forEach((num: unknown) => {
                        const key = String(num);
                        numbersObj[key] = (numbersObj[key] || 0) + amountPerNumber;
                    });
                } else if (bet.selectedNumbers && typeof bet.selectedNumbers === 'object') {
                    numbersObj = bet.selectedNumbers;
                } else {
                    numbersObj = { [String(bet.selectedNumbers || 'unknown')]: bet.amount };
                }

                for (const [key, value] of Object.entries(numbersObj)) {
                    const betType = bet.betType || 'open';
                    if (key.includes('9X')) {
                        betStats.gameTypeStats.half_sangam_close.count++;
                        betStats.gameTypeStats.half_sangam_close.amount += value;
                        betStats.gameTypeStats.half_sangam_close.betTypes[betType].count++;
                        betStats.gameTypeStats.half_sangam_close.betTypes[betType].amount += value;
                        // Sangam subtypes only have 'both' bet type
                        completeTotals.half_sangam_close.both! += value;
                        completeTotals.half_sangam_close.total += value;
                    } else if (key.includes('X') && !key.includes('9X')) {
                        betStats.gameTypeStats.half_sangam_open.count++;
                        betStats.gameTypeStats.half_sangam_open.amount += value;
                        betStats.gameTypeStats.half_sangam_open.betTypes[betType].count++;
                        betStats.gameTypeStats.half_sangam_open.betTypes[betType].amount += value;
                        // Sangam subtypes only have 'both' bet type
                        completeTotals.half_sangam_open.both! += value;
                        completeTotals.half_sangam_open.total += value;
                    } else if (key.includes('-')) {
                        betStats.gameTypeStats.full_sangam.count++;
                        betStats.gameTypeStats.full_sangam.amount += value;
                        betStats.gameTypeStats.full_sangam.betTypes[betType].count++;
                        betStats.gameTypeStats.full_sangam.betTypes[betType].amount += value;
                        // Sangam subtypes only have 'both' bet type
                        completeTotals.full_sangam.both! += value;
                        completeTotals.full_sangam.total += value;
                    }
                }
            }
        }

        // Calculate grand total
        const grandTotal = Object.values(completeTotals).reduce((sum, gameTotal) => sum + gameTotal.total, 0);

        // Console log the result for now
        console.log('Load aggregation:', JSON.stringify(result, null, 2));
        console.log('Bet statistics:', JSON.stringify(betStats, null, 2));
        console.log('Complete totals:', JSON.stringify(completeTotals, null, 2));

        res.json({
            success: true,
            message: 'Loads aggregated with complete statistics',
            data: result,
            statistics: betStats,
            completeTotals: {
                total: grandTotal,
                ...completeTotals
            },
            debug: {
                totalBets: bets.length,
                dateRange: { start, end },
                betTypes: [...new Set(bets.map(b => b.type))],
                filters: { userId, marketId }
            }
        });
    } catch (error) {
        console.error('Get all loads error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
