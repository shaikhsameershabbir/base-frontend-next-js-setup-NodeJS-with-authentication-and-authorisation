import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Bet } from '../../../models/Bet';
import { User } from '../../../models/User';
import { UserHierarchy } from '../../../models/UserHierarchy';
import { logger } from '../../../config/logger';

// Define proper types for request with user
interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user?: {
        userId: string;
        username: string;
        balance: number;
        role: string;
        parentId?: string;
    };
}

interface DateFilter {
    createdAt?: {
        $gte?: Date;
        $lte?: Date;
        $gt?: Date;
        $lt?: Date;
    };
}

interface HierarchicalReport {
    userId: string;
    username: string;
    role: string;
    percentage: number;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    commission: number; // NEW: Commission calculated from totalBet * percentage / 100
    hasChildren: boolean; // NEW: Whether this user has children to drill down
}


export class ReportsController {
    /**
     * Get hierarchical reports with drill-down capability
     */
    static async getHierarchicalReports(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { startDate, endDate, parentId } = req.query;

            // Build date filter
            const dateFilter = this.buildDateFilter(startDate as string, endDate as string);

            // Determine the target role and parent for the current level
            const { targetRole, targetParentId, targetParentName } = await this.getTargetLevel(currentUser, parentId as string);

            // Get users at the target level
            const targetUsers = await this.getUsersAtLevel(targetRole, targetParentId);

            if (targetUsers.length === 0) {
                return res.json({
                    success: true,
                    data: {
                        reports: [],
                        summary: this.getEmptySummary(),
                        filters: {
                            startDate: startDate as string || null,
                            endDate: endDate as string || null
                        },
                        currentLevel: {
                            role: targetRole,
                            parentId: targetParentId,
                            parentName: targetParentName
                        }
                    }
                });
            }

            // Get hierarchical reports for all target users
            const reports = await this.getHierarchicalReportsForUsers(targetUsers, dateFilter);

            // Calculate summary
            const summary = this.calculateSummary(reports);

            return res.json({
                success: true,
                data: {
                    reports,
                    summary,
                    filters: {
                        startDate: startDate as string || null,
                        endDate: endDate as string || null
                    },
                    currentLevel: {
                        role: targetRole,
                        parentId: targetParentId,
                        parentName: targetParentName
                    }
                }
            });

        } catch (error) {
            logger.error('Error getting hierarchical reports:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Get real-time bet statistics
     */
    static async getBetStats(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get target users
            const { targetRole, targetParentId } = await this.getTargetLevel(currentUser);
            const targetUsers = await this.getUsersAtLevel(targetRole, targetParentId);
            const userIds = targetUsers.map(user => user._id.toString());

            // Get today's date range
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Get today's stats in a single aggregation
            const stats = await this.getTodayStats(userIds, today, tomorrow);

            return res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            logger.error('Error getting bet stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Determine the target level based on current user and parentId
     */
    private static async getTargetLevel(currentUser: { userId: string; role: string }, parentId?: string): Promise<{
        targetRole: string;
        targetParentId: string | undefined;
        targetParentName: string | undefined;
    }> {
        // Define role hierarchy
        const roleHierarchy: Record<string, string> = {
            'superadmin': 'admin',
            'admin': 'distributor',
            'distributor': 'agent',
            'agent': 'player'
        };

        let targetRole: string;
        let targetParentId: string | undefined;
        let targetParentName: string | undefined;

        if (parentId && parentId !== 'all') {
            // If parentId is specified, get the children of that parent
            const parentUser = await User.findById(parentId);
            if (parentUser) {
                targetRole = roleHierarchy[parentUser.role] || 'player';
                targetParentId = parentId;
                targetParentName = parentUser.username;
            } else {
                // Fallback to current user's children
                targetRole = roleHierarchy[currentUser.role] || 'player';
                targetParentId = currentUser.userId;
            }
        } else {
            // Default: show children of current user
            targetRole = roleHierarchy[currentUser.role] || 'player';
            targetParentId = currentUser.userId;
        }

        return { targetRole, targetParentId, targetParentName };
    }

    /**
     * Get users at a specific level
     */
    private static async getUsersAtLevel(role: string, parentId?: string): Promise<Array<{ _id: string; username: string; role: string; percentage: number }>> {
        const query: Record<string, unknown> = {
            isActive: true,
            role: role
        };

        if (parentId) {
            query.parentId = parentId;
        }

        const users = await User.find(query).select('_id username role percentage');
        return users.map(user => ({
            _id: String(user._id),
            username: user.username,
            role: user.role,
            percentage: user.percentage || 0
        }));
    }

    /**
     * Get hierarchical reports for users (includes all their downline data)
     */
    private static async getHierarchicalReportsForUsers(users: Array<{ _id: string; username: string; role: string; percentage: number }>, dateFilter: DateFilter): Promise<HierarchicalReport[]> {
        const reports: HierarchicalReport[] = [];

        for (const user of users) {
            let betData;
            let playerIds: string[] = [];

            if (user.role === 'player') {
                // For players, get their own bet data directly
                console.log(`Getting bet data for player: ${user.username} (${user._id})`);
                playerIds = [user._id];

                // Check if this is the specific player from the bet data
                if (user._id === '68bc165af01db02f42f2c3a7') {
                    console.log('This is the specific player with bet data!');
                    console.log('Date filter:', dateFilter);
                }

                betData = await this.getBetDataForUsers(playerIds, dateFilter);

                // If no data with date filter, try without date filter for debugging
                if (betData.totalBets === 0) {
                    console.log(`No bets found with date filter for player ${user.username}, trying without date filter...`);
                    betData = await this.getBetDataForUsers(playerIds, {});
                }

                console.log(`Final bet data for player ${user.username}:`, betData);
            } else {
                // For non-players, get all players under this user's hierarchy
                playerIds = await this.getAllPlayersUnderUser(user._id);
                console.log(`Found ${playerIds.length} players under ${user.username} (${user.role})`);

                if (playerIds.length === 0) {
                    // No players under this user, return empty report
                    reports.push({
                        userId: user._id,
                        username: user.username,
                        role: user.role,
                        percentage: user.percentage,
                        totalBet: 0,
                        totalWin: 0,
                        claimedAmount: 0,
                        unclaimedAmount: 0,
                        totalBets: 0,
                        winningBets: 0,
                        commission: 0,
                        hasChildren: await this.userHasChildren(user._id)
                    });
                    continue;
                }

                // Get bet data for all players under this user
                betData = await this.getBetDataForUsers(playerIds, dateFilter);

                // If no data with date filter, try without date filter for debugging
                if (betData.totalBets === 0 && playerIds.length > 0) {
                    console.log(`No bets found with date filter for user ${user.username}, trying without date filter...`);
                    betData = await this.getBetDataForUsers(playerIds, {});
                }
            }

            // Calculate commission: (totalBet / 100) * percentage
            const commission = (betData.totalBet / 100) * user.percentage;

            reports.push({
                userId: user._id,
                username: user.username,
                role: user.role,
                percentage: user.percentage,
                ...betData,
                commission,
                hasChildren: await this.userHasChildren(user._id)
            });
        }

        return reports;
    }

    /**
     * Get all players under a user's hierarchy
     */
    private static async getAllPlayersUnderUser(userId: string): Promise<string[]> {
        const playerIds: string[] = [];

        try {
            // Method 1: Use UserHierarchy if available
            const hierarchy = await UserHierarchy.findOne({ userId });
            if (hierarchy) {
                // Get all users in the downline
                const downlineUsers = await UserHierarchy.find({
                    path: userId
                });

                // Filter to get only players
                for (const downlineUser of downlineUsers) {
                    const user = await User.findById(downlineUser.userId);
                    if (user && user.role === 'player' && user.isActive) {
                        playerIds.push(String(user._id));
                    }
                }
            } else {
                // Method 2: Fallback to recursive user search
                const players = await this.getPlayersRecursively(userId);
                playerIds.push(...players);
            }

            // Method 3: If still no players found, check direct children
            if (playerIds.length === 0) {
                const directChildren = await User.find({
                    parentId: userId,
                    isActive: true
                });

                for (const child of directChildren) {
                    if (child.role === 'player') {
                        playerIds.push(String(child._id));
                    } else {
                        // Recursively get players from this child
                        const childPlayers = await this.getPlayersRecursively(String(child._id));
                        playerIds.push(...childPlayers);
                    }
                }
            }

            console.log(`Found ${playerIds.length} players under user ${userId}`);
            return playerIds;
        } catch (error) {
            console.error('Error getting players under user:', error);
            return playerIds;
        }
    }

    /**
     * Recursively get all players under a user
     */
    private static async getPlayersRecursively(userId: string): Promise<string[]> {
        const playerIds: string[] = [];

        try {
            const children = await User.find({
                parentId: userId,
                isActive: true
            });

            for (const child of children) {
                if (child.role === 'player') {
                    playerIds.push(String(child._id));
                } else {
                    // Recursively get players from this child
                    const childPlayers = await this.getPlayersRecursively(String(child._id));
                    playerIds.push(...childPlayers);
                }
            }
        } catch (error) {
            console.error('Error in recursive player search:', error);
        }

        return playerIds;
    }

    /**
     * Check if a user has children
     */
    private static async userHasChildren(userId: string): Promise<boolean> {
        const children = await User.find({ parentId: userId, isActive: true });
        return children.length > 0;
    }

    /**
     * Get bet data for multiple users using aggregation
     */
    private static async getBetDataForUsers(userIds: string[], dateFilter: DateFilter): Promise<{
        totalBet: number;
        totalWin: number;
        claimedAmount: number;
        unclaimedAmount: number;
        totalBets: number;
        winningBets: number;
    }> {
        if (userIds.length === 0) {
            console.log('No user IDs provided for bet data aggregation');
            return {
                totalBet: 0,
                totalWin: 0,
                claimedAmount: 0,
                unclaimedAmount: 0,
                totalBets: 0,
                winningBets: 0
            };
        }

        console.log(`Getting bet data for ${userIds.length} users:`, userIds);
        console.log('Date filter:', dateFilter);

        // First, let's check if there are any bets at all
        const totalBetsCount = await Bet.countDocuments();
        console.log(`Total bets in database: ${totalBetsCount}`);

        // Convert string IDs to ObjectIds for MongoDB query
        const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

        // Check bets for these specific users
        const userBetsCount = await Bet.countDocuments({ userId: { $in: objectIds } });
        console.log(`Bets for these users: ${userBetsCount}`);

        const pipeline = [
            {
                $match: {
                    userId: { $in: objectIds },
                    ...dateFilter
                }
            },
            {
                $group: {
                    _id: null,
                    totalBet: { $sum: '$amount' },
                    totalWin: { $sum: { $ifNull: ['$winAmount', 0] } },
                    totalBets: { $sum: 1 },
                    winningBets: {
                        $sum: {
                            $cond: [{ $gt: [{ $ifNull: ['$winAmount', 0] }, 0] }, 1, 0]
                        }
                    },
                    claimedAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [{ $ifNull: ['$winAmount', 0] }, 0] },
                                        { $eq: ['$claimStatus', true] }
                                    ]
                                },
                                { $ifNull: ['$winAmount', 0] },
                                0
                            ]
                        }
                    },
                    unclaimedAmount: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gt: [{ $ifNull: ['$winAmount', 0] }, 0] },
                                        { $ne: ['$claimStatus', true] }
                                    ]
                                },
                                { $ifNull: ['$winAmount', 0] },
                                0
                            ]
                        }
                    }
                }
            }
        ];

        const result = await Bet.aggregate(pipeline);
        const betData = result[0] || {
            totalBet: 0,
            totalWin: 0,
            claimedAmount: 0,
            unclaimedAmount: 0,
            totalBets: 0,
            winningBets: 0
        };

        console.log('Aggregated bet data:', betData);
        return betData;
    }

    /**
     * Build date filter from query parameters
     */
    private static buildDateFilter(startDate?: string, endDate?: string): DateFilter {
        const dateFilter: DateFilter = {};

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            dateFilter.createdAt = { $gte: start, $lte: end };
        } else if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            dateFilter.createdAt = { $gte: start };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            dateFilter.createdAt = { $lte: end };
        }

        return dateFilter;
    }

    /**
     * Get today's statistics using aggregation
     */
    private static async getTodayStats(userIds: string[], start: Date, end: Date) {
        if (userIds.length === 0) {
            return {
                todayBets: 0,
                todayBetAmount: 0,
                todayWinningBets: 0,
                todayWinAmount: 0,
                totalUsers: 0
            };
        }

        const pipeline = [
            {
                $match: {
                    userId: { $in: userIds },
                    createdAt: { $gte: start, $lt: end }
                }
            },
            {
                $group: {
                    _id: null,
                    todayBets: { $sum: 1 },
                    todayBetAmount: { $sum: '$amount' },
                    todayWinningBets: {
                        $sum: {
                            $cond: [{ $gt: ['$winAmount', 0] }, 1, 0]
                        }
                    },
                    todayWinAmount: { $sum: '$winAmount' }
                }
            }
        ];

        const result = await Bet.aggregate(pipeline);
        const stats = result[0] || {
            todayBets: 0,
            todayBetAmount: 0,
            todayWinningBets: 0,
            todayWinAmount: 0
        };

        return {
            ...stats,
            totalUsers: userIds.length
        };
    }

    /**
     * Calculate summary from reports
     */
    private static calculateSummary(reports: HierarchicalReport[]) {
        return reports.reduce((summary, report) => ({
            totalBet: summary.totalBet + report.totalBet,
            totalWin: summary.totalWin + report.totalWin,
            claimedAmount: summary.claimedAmount + report.claimedAmount,
            unclaimedAmount: summary.unclaimedAmount + report.unclaimedAmount,
            totalBets: summary.totalBets + report.totalBets,
            winningBets: summary.winningBets + report.winningBets,
            totalUsers: summary.totalUsers + 1,
            totalCommission: summary.totalCommission + report.commission
        }), {
            totalBet: 0,
            totalWin: 0,
            claimedAmount: 0,
            unclaimedAmount: 0,
            totalBets: 0,
            winningBets: 0,
            totalUsers: 0,
            totalCommission: 0
        });
    }

    /**
     * Get empty summary
     */
    private static getEmptySummary() {
        return {
            totalBet: 0,
            totalWin: 0,
            claimedAmount: 0,
            unclaimedAmount: 0,
            totalBets: 0,
            winningBets: 0,
            totalUsers: 0,
            totalCommission: 0
        };
    }

    /**
     * Debug endpoint to check bet data
     */
    static async debugBets(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            // Get total bets count
            const totalBets = await Bet.countDocuments();

            // Get recent bets
            const recentBets = await Bet.find()
                .populate('userId', 'username role')
                .populate('marketId', 'name')
                .sort({ createdAt: -1 })
                .limit(10);

            // Get all users
            const totalUsers = await User.countDocuments();
            const usersByRole = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            // Get players specifically
            const players = await User.find({ role: 'player', isActive: true });
            const playerIds = players.map(p => String(p._id));

            // Check the specific user from the bet data
            const specificUserId = '68bc165af01db02f42f2c3a7';
            const specificUser = await User.findById(specificUserId);
            const specificUserBets = await Bet.countDocuments({ userId: new mongoose.Types.ObjectId(specificUserId) });

            // Get bets for players
            const playerBets = await Bet.countDocuments({ userId: { $in: playerIds } });

            return res.json({
                success: true,
                data: {
                    totalBets,
                    totalUsers,
                    usersByRole,
                    players: {
                        count: players.length,
                        ids: playerIds,
                        bets: playerBets
                    },
                    specificUser: {
                        id: specificUserId,
                        exists: !!specificUser,
                        role: specificUser?.role,
                        isActive: specificUser?.isActive,
                        bets: specificUserBets
                    },
                    recentBets: recentBets.map(bet => ({
                        id: bet._id,
                        amount: bet.amount,
                        winAmount: bet.winAmount,
                        claimStatus: bet.claimStatus,
                        createdAt: bet.createdAt,
                        user: bet.userId,
                        market: bet.marketId
                    }))
                }
            });

        } catch (error) {
            logger.error('Error in debug bets:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    /**
     * Test hierarchical reports without date filter
     */
    static async testHierarchicalReports(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            console.log('Testing hierarchical reports for user:', currentUser.userId);

            // Get target level (next role in hierarchy)
            const targetLevel = await this.getTargetLevel(currentUser);
            console.log('Target level:', targetLevel);

            // Get users at target level
            const users = await this.getUsersAtLevel(targetLevel.targetRole, currentUser.userId);
            console.log(`Found ${users.length} users at ${targetLevel.targetRole} level`);

            const reports = [];
            for (const user of users) {
                console.log(`Processing user: ${user.username} (${user.role})`);

                // Get all players under this user
                const playerIds = await this.getAllPlayersUnderUser(user._id);
                console.log(`Found ${playerIds.length} players under ${user.username}`);

                // Get bet data without date filter
                const betData = await this.getBetDataForUsers(playerIds, {});
                console.log(`Bet data for ${user.username}:`, betData);

                // Calculate commission
                const commission = (betData.totalBet / 100) * user.percentage;

                reports.push({
                    userId: user._id,
                    username: user.username,
                    role: user.role,
                    percentage: user.percentage,
                    totalBet: betData.totalBet,
                    totalWin: betData.totalWin,
                    claimedAmount: betData.claimedAmount,
                    unclaimedAmount: betData.unclaimedAmount,
                    totalBets: betData.totalBets,
                    winningBets: betData.winningBets,
                    commission: commission,
                    hasChildren: await this.userHasChildren(user._id),
                    playerCount: playerIds.length
                });
            }

            return res.json({
                success: true,
                data: {
                    currentUser: currentUser,
                    targetLevel: targetLevel,
                    reports: reports,
                    summary: {
                        totalUsers: reports.length,
                        totalBet: reports.reduce((sum, r) => sum + r.totalBet, 0),
                        totalWin: reports.reduce((sum, r) => sum + r.totalWin, 0),
                        totalCommission: reports.reduce((sum, r) => sum + r.commission, 0)
                    }
                }
            });

        } catch (error) {
            logger.error('Error in test hierarchical reports:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }

    /**
     * Test specific player data
     */
    static async testPlayerData(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const playerId = req.params.playerId;
            console.log(`Testing player data for: ${playerId}`);

            // Get player info
            const player = await User.findById(playerId);
            if (!player) {
                return res.status(404).json({
                    success: false,
                    message: 'Player not found'
                });
            }

            console.log(`Player found: ${player.username} (${player.role})`);

            // Get all bets for this player (no date filter)
            const allBets = await Bet.find({ userId: new mongoose.Types.ObjectId(playerId) });
            console.log(`Found ${allBets.length} total bets for player`);

            // Get bets with today's date filter
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            const todayBets = await Bet.find({
                userId: new mongoose.Types.ObjectId(playerId),
                createdAt: { $gte: today, $lt: tomorrow }
            });
            console.log(`Found ${todayBets.length} bets for today`);

            // Get bet data using our aggregation
            const betData = await this.getBetDataForUsers([playerId], {});
            console.log('Aggregated bet data:', betData);

            // Get bet data with today's filter
            const todayBetData = await this.getBetDataForUsers([playerId], {
                createdAt: { $gte: today, $lt: tomorrow }
            });
            console.log('Today bet data:', todayBetData);

            return res.json({
                success: true,
                data: {
                    player: {
                        id: player._id,
                        username: player.username,
                        role: player.role,
                        percentage: player.percentage,
                        isActive: player.isActive
                    },
                    bets: {
                        total: allBets.length,
                        today: todayBets.length,
                        allBets: allBets.map(bet => ({
                            id: bet._id,
                            amount: bet.amount,
                            winAmount: bet.winAmount,
                            claimStatus: bet.claimStatus,
                            createdAt: bet.createdAt,
                            result: bet.result
                        })),
                        todayBets: todayBets.map(bet => ({
                            id: bet._id,
                            amount: bet.amount,
                            winAmount: bet.winAmount,
                            claimStatus: bet.claimStatus,
                            createdAt: bet.createdAt,
                            result: bet.result
                        }))
                    },
                    aggregatedData: {
                        allTime: betData,
                        today: todayBetData
                    }
                }
            });

        } catch (error) {
            logger.error('Error in test player data:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}