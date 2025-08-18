import { Request, Response } from 'express';
import { Bet } from '../../../models/Bet';
import { User } from '../../../models/User';
import { HierarchyService } from '../../../services/hierarchyService';

// Define proper types for request with user - using the same interface as auth middleware
interface AuthenticatedRequest extends Omit<Request, 'user'> {
    user?: {
        userId: string;
        username: string;
        balance: number;
        role: string;
        parentId?: string;
    };
}

// Define proper types for date filter
interface DateFilter {
    createdAt?: {
        $gte: Date;
        $lte: Date;
    };
}

// Define proper types for populated bet data that matches Mongoose Document structure
interface PopulatedBet {
    _id: unknown;
    userId: unknown; // Using any for populated userId field to handle complex Mongoose Document types
    amount?: number | null | undefined;
    winAmount?: number | null | undefined;
    claimStatus?: boolean;
}


interface BetReport {
    userId: string;
    username: string;
    role: string;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    claimStatus: {
        claimed: number;
        unclaimed: number;
    };
}

interface AdminReport {
    adminId: string;
    adminUsername: string;
    adminRole: string;
    totalBet: number;
    totalWin: number;
    claimedAmount: number;
    unclaimedAmount: number;
    totalBets: number;
    winningBets: number;
    claimStatus: {
        claimed: number;
        unclaimed: number;
    };
    downlineUsers: BetReport[];
}

export class ReportsController {
    /**
     * Get comprehensive bet reports for the current user's hierarchy
     */
    static async getBetReports(req: AuthenticatedRequest, res: Response) {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { startDate, endDate, adminId } = req.query;

            // Build date filter
            const dateFilter: DateFilter = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate as string),
                    $lte: new Date(endDate as string)
                };
            }

            let reports: AdminReport[] = [];

            if (currentUser.role === 'superadmin') {
                // Superadmin sees all admins
                if (adminId) {
                    // Get specific admin report
                    const adminReport = await this.getAdminReport(adminId as string, dateFilter);
                    if (adminReport) {
                        reports = [adminReport];
                    }
                } else {
                    // Get all admins reports
                    const admins = await User.find({ role: 'admin', isActive: true });
                    const adminReports = await Promise.all(
                        admins.map(admin => this.getAdminReport((admin._id as string).toString(), dateFilter))
                    );
                    reports = adminReports.filter((report): report is AdminReport => report !== null);
                }
            } else if (currentUser.role === 'admin') {
                // Admin sees all distributors
                if (adminId) {
                    // Get specific distributor report
                    const distributorReport = await this.getDistributorReport(adminId as string, dateFilter);
                    if (distributorReport) {
                        reports = [distributorReport];
                    }
                } else {
                    // Get all distributors reports
                    const distributors = await User.find({ role: 'distributor', isActive: true });
                    const distributorReports = await Promise.all(
                        distributors.map(distributor => this.getDistributorReport((distributor._id as string).toString(), dateFilter))
                    );
                    reports = distributorReports.filter((report): report is AdminReport => report !== null);
                }
            } else if (currentUser.role === 'distributor') {
                // Distributor sees all agents
                if (adminId) {
                    // Get specific agent report
                    const agentReport = await this.getAgentReport(adminId as string, dateFilter);
                    if (agentReport) {
                        reports = [agentReport];
                    }
                } else {
                    // Get all agents reports
                    const agents = await User.find({ role: 'agent', isActive: true });
                    const agentReports = await Promise.all(
                        agents.map(agent => this.getAgentReport((agent._id as string).toString(), dateFilter))
                    );
                    reports = agentReports.filter((report): report is AdminReport => report !== null);
                }
            } else if (currentUser.role === 'agent') {
                // Agent sees all players
                if (adminId) {
                    // Get specific player report
                    const playerReport = await this.getPlayerReport(adminId as string, dateFilter);
                    if (playerReport) {
                        reports = [playerReport];
                    }
                } else {
                    // Get all players reports
                    const players = await User.find({ role: 'player', isActive: true });
                    const playerReports = await Promise.all(
                        players.map(player => this.getPlayerReport((player._id as string).toString(), dateFilter))
                    );
                    reports = playerReports.filter((report): report is AdminReport => report !== null);
                }
            } else {
                // Player can only see their own report
                const userReport = await this.getUserReport(currentUser.userId, dateFilter);
                if (userReport) {
                    reports = [{
                        adminId: currentUser.userId,
                        adminUsername: currentUser.username,
                        adminRole: currentUser.role,
                        totalBet: userReport.totalBet,
                        totalWin: userReport.totalWin,
                        claimedAmount: userReport.claimedAmount,
                        unclaimedAmount: userReport.unclaimedAmount,
                        totalBets: userReport.totalBets,
                        winningBets: userReport.winningBets,
                        claimStatus: userReport.claimStatus,
                        downlineUsers: [userReport]
                    }];
                }
            }
            return res.json({
                success: true,
                data: {
                    reports,
                    summary: this.calculateSummary(reports),
                    filters: {
                        startDate: startDate || null,
                        endDate: endDate || null,
                        adminId: adminId || null
                    }
                }
            });

        } catch (error) {
            console.error('Error getting bet reports:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get detailed report for a specific admin
     */
    private static async getAdminReport(adminId: string, dateFilter: DateFilter): Promise<AdminReport | null> {
        try {
            const admin = await User.findById(adminId);
            if (!admin) return null;

            // Get all downline user IDs for this admin
            const downlineUserIds = await HierarchyService.getAllDownlineUserIds(adminId, true);

            // Get all bets for downline users
            const bets = await Bet.find({
                userId: { $in: downlineUserIds },
                ...dateFilter
            }).populate('userId', 'username role');

            // Calculate admin totals
            const adminTotals = this.calculateBetTotals(bets);

            // Get individual user reports
            const downlineUsers: BetReport[] = [];
            const userBetsMap = new Map<string, PopulatedBet[]>();

            // Group bets by user
            bets.forEach(bet => {
                const userId = (bet.userId as { _id: unknown })._id?.toString() || '';
                if (!userBetsMap.has(userId)) {
                    userBetsMap.set(userId, []);
                }
                userBetsMap.get(userId)!.push(bet as PopulatedBet);
            });

            // Calculate individual user reports
            for (const [userId, userBets] of userBetsMap) {
                const user = await User.findById(userId);
                if (user) {
                    const userTotals = this.calculateBetTotals(userBets);
                    downlineUsers.push({
                        userId,
                        username: user.username,
                        role: user.role,
                        ...userTotals
                    });
                }
            }

            return {
                adminId: (admin._id as string).toString(),
                adminUsername: admin.username,
                adminRole: admin.role,
                ...adminTotals,
                downlineUsers
            };

        } catch (error) {
            console.error('Error getting admin report:', error);
            return null;
        }
    }

    /**
     * Get detailed report for a specific distributor
     */
    private static async getDistributorReport(distributorId: string, dateFilter: DateFilter): Promise<AdminReport | null> {
        try {
            const distributor = await User.findById(distributorId);
            if (!distributor) return null;

            // Get all downline user IDs for this distributor
            const downlineUserIds = await HierarchyService.getAllDownlineUserIds(distributorId, true);

            // Get all bets for downline users
            const bets = await Bet.find({
                userId: { $in: downlineUserIds },
                ...dateFilter
            }).populate('userId', 'username role');

            // Calculate distributor totals
            const distributorTotals = this.calculateBetTotals(bets);

            // Get individual user reports
            const downlineUsers: BetReport[] = [];
            const userBetsMap = new Map<string, PopulatedBet[]>();

            // Group bets by user
            bets.forEach(bet => {
                const userId = (bet.userId as { _id: unknown })._id?.toString() || '';
                if (!userBetsMap.has(userId)) {
                    userBetsMap.set(userId, []);
                }
                userBetsMap.get(userId)!.push(bet as PopulatedBet);
            });

            // Calculate individual user reports
            for (const [userId, userBets] of userBetsMap) {
                const user = await User.findById(userId);
                if (user) {
                    const userTotals = this.calculateBetTotals(userBets);
                    downlineUsers.push({
                        userId,
                        username: user.username,
                        role: user.role,
                        ...userTotals
                    });
                }
            }

            return {
                adminId: (distributor._id as string).toString(),
                adminUsername: distributor.username,
                adminRole: distributor.role,
                ...distributorTotals,
                downlineUsers
            };

        } catch (error) {
            console.error('Error getting distributor report:', error);
            return null;
        }
    }

    /**
     * Get detailed report for a specific agent
     */
    private static async getAgentReport(agentId: string, dateFilter: DateFilter): Promise<AdminReport | null> {
        try {
            const agent = await User.findById(agentId);
            if (!agent) return null;

            // Get all downline user IDs for this agent
            const downlineUserIds = await HierarchyService.getAllDownlineUserIds(agentId, true);

            // Get all bets for downline users
            const bets = await Bet.find({
                userId: { $in: downlineUserIds },
                ...dateFilter
            }).populate('userId', 'username role');

            // Calculate agent totals
            const agentTotals = this.calculateBetTotals(bets);

            // Get individual user reports
            const downlineUsers: BetReport[] = [];
            const userBetsMap = new Map<string, PopulatedBet[]>();

            // Group bets by user
            bets.forEach(bet => {
                const userId = (bet.userId as { _id: unknown })._id?.toString() || '';
                if (!userBetsMap.has(userId)) {
                    userBetsMap.set(userId, []);
                }
                userBetsMap.get(userId)!.push(bet as PopulatedBet);
            });

            // Calculate individual user reports
            for (const [userId, userBets] of userBetsMap) {
                const user = await User.findById(userId);
                if (user) {
                    const userTotals = this.calculateBetTotals(userBets);
                    downlineUsers.push({
                        userId,
                        username: user.username,
                        role: user.role,
                        ...userTotals
                    });
                }
            }

            return {
                adminId: (agent._id as string).toString(),
                adminUsername: agent.username,
                adminRole: agent.role,
                ...agentTotals,
                downlineUsers
            };

        } catch (error) {
            console.error('Error getting agent report:', error);
            return null;
        }
    }

    /**
     * Get detailed report for a specific player
     */
    private static async getPlayerReport(playerId: string, dateFilter: DateFilter): Promise<AdminReport | null> {
        try {
            const player = await User.findById(playerId);
            if (!player) return null;

            // Get all bets for this player
            const bets = await Bet.find({
                userId: playerId,
                ...dateFilter
            });

            // Calculate player totals
            const playerTotals = this.calculateBetTotals(bets);

            return {
                adminId: (player._id as string).toString(),
                adminUsername: player.username,
                adminRole: player.role,
                ...playerTotals,
                downlineUsers: [] // No downline users for players
            };

        } catch (error) {
            console.error('Error getting player report:', error);
            return null;
        }
    }

    /**
     * Get report for a specific user
     */
    private static async getUserReport(userId: string, dateFilter: DateFilter): Promise<BetReport | null> {
        try {
            const user = await User.findById(userId);
            if (!user) return null;

            const bets = await Bet.find({
                userId,
                ...dateFilter
            });

            const totals = this.calculateBetTotals(bets);

            return {
                userId: (user._id as string).toString(),
                username: user.username,
                role: user.role,
                ...totals
            };

        } catch (error) {
            console.error('Error getting user report:', error);
            return null;
        }
    }

    /**
     * Calculate bet totals from an array of bets
     */
    private static calculateBetTotals(bets: PopulatedBet[]): {
        totalBet: number;
        totalWin: number;
        claimedAmount: number;
        unclaimedAmount: number;
        totalBets: number;
        winningBets: number;
        claimStatus: { claimed: number; unclaimed: number };
    } {
        const totals = {
            totalBet: 0,
            totalWin: 0,
            claimedAmount: 0,
            unclaimedAmount: 0,
            totalBets: bets.length,
            winningBets: 0,
            claimStatus: { claimed: 0, unclaimed: 0 }
        };

        bets.forEach(bet => {
            totals.totalBet += bet.amount || 0;

            if (bet.winAmount && bet.winAmount > 0) {
                totals.totalWin += bet.winAmount;
                totals.winningBets++;

                if (bet.claimStatus) {
                    totals.claimedAmount += bet.winAmount;
                    totals.claimStatus.claimed++;
                } else {
                    totals.unclaimedAmount += bet.winAmount;
                    totals.claimStatus.unclaimed++;
                }
            }
        });

        return totals;
    }

    /**
     * Calculate summary across all reports
     */
    private static calculateSummary(reports: AdminReport[]): {
        totalBet: number;
        totalWin: number;
        claimedAmount: number;
        unclaimedAmount: number;
        totalBets: number;
        winningBets: number;
        totalAdmins: number;
    } {
        return reports.reduce((summary, report) => ({
            totalBet: summary.totalBet + report.totalBet,
            totalWin: summary.totalWin + report.totalWin,
            claimedAmount: summary.claimedAmount + report.claimedAmount,
            unclaimedAmount: summary.unclaimedAmount + report.unclaimedAmount,
            totalBets: summary.totalBets + report.totalBets,
            winningBets: summary.winningBets + report.winningBets,
            totalAdmins: summary.totalAdmins + 1
        }), {
            totalBet: 0,
            totalWin: 0,
            claimedAmount: 0,
            unclaimedAmount: 0,
            totalBets: 0,
            winningBets: 0,
            totalAdmins: 0
        });
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

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            let userIds: string[] = [];

            if (currentUser.role === 'superadmin') {
                // Get all admin IDs and their downlines
                const admins = await User.find({ role: 'admin', isActive: true });
                for (const admin of admins) {
                    const downlineIds = await HierarchyService.getAllDownlineUserIds((admin._id as string).toString(), true);
                    userIds.push(...downlineIds);
                }
            } else if (currentUser.role === 'admin') {
                // Admin sees all distributors and their downlines
                const distributors = await User.find({ role: 'distributor', isActive: true });
                for (const distributor of distributors) {
                    const downlineIds = await HierarchyService.getAllDownlineUserIds((distributor._id as string).toString(), true);
                    userIds.push(...downlineIds);
                }
            } else if (currentUser.role === 'distributor') {
                // Distributor sees all agents and their downlines
                const agents = await User.find({ role: 'agent', isActive: true });
                for (const agent of agents) {
                    const downlineIds = await HierarchyService.getAllDownlineUserIds((agent._id as string).toString(), true);
                    userIds.push(...downlineIds);
                }
            } else if (currentUser.role === 'agent') {
                // Agent sees all players
                const players = await User.find({ role: 'player', isActive: true });
                userIds = players.map(player => (player._id as string).toString());
            } else {
                // Player only sees their own stats
                userIds = [currentUser.userId];
            }

            // Get today's bets
            const todayBets = await Bet.find({
                userId: { $in: userIds },
                createdAt: { $gte: today, $lt: tomorrow }
            });

            // Get today's winning bets
            const todayWinningBets = await Bet.find({
                userId: { $in: userIds },
                createdAt: { $gte: today, $lt: tomorrow },
                winAmount: { $gt: 0 }
            });

            const stats = {
                todayBets: todayBets.length,
                todayBetAmount: todayBets.reduce((sum, bet) => sum + (bet.amount || 0), 0),
                todayWinningBets: todayWinningBets.length,
                todayWinAmount: todayWinningBets.reduce((sum, bet) => sum + (bet.winAmount || 0), 0),
                totalUsers: userIds.length
            };

            return res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error getting bet stats:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
