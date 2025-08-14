import { Request, Response } from 'express';
import { Bet } from '../../../models/Bet';
import { User } from '../../../models/User';
import { HierarchyService } from '../../../services/hierarchyService';

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
    static async getBetReports(req: Request, res: Response) {
        try {
            const currentUser = (req as any).user;
            if (!currentUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }

            const { startDate, endDate, adminId } = req.query;

            // Build date filter
            const dateFilter: { createdAt?: { $gte: Date; $lte: Date } } = {};
            if (startDate && endDate) {
                dateFilter.createdAt = {
                    $gte: new Date(startDate as string),
                    $lte: new Date(endDate as string)
                };
            }

            let reports: AdminReport[] = [];

            if (currentUser.role === 'superadmin') {
                // Superadmin can see all admins
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
                        admins.map(admin => this.getAdminReport((admin._id as any).toString(), dateFilter))
                    );
                    reports = adminReports.filter((report): report is AdminReport => report !== null);
                }
            } else if (currentUser.role === 'admin') {
                // Admin can see their own report and their downline
                const adminReport = await this.getAdminReport(currentUser._id.toString(), dateFilter);
                if (adminReport) {
                    reports = [adminReport];
                }
            } else {
                // Other roles can only see their own report
                const userReport = await this.getUserReport(currentUser._id.toString(), dateFilter);
                if (userReport) {
                    reports = [{
                        adminId: currentUser._id.toString(),
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
            console.log('0------------------------>', reports)
            res.json({
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
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * Get detailed report for a specific admin
     */
    private static async getAdminReport(adminId: string, dateFilter: any): Promise<AdminReport | null> {
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
            const userBetsMap = new Map<string, any[]>();

            // Group bets by user
            bets.forEach(bet => {
                const userId = (bet.userId as any)._id.toString();
                if (!userBetsMap.has(userId)) {
                    userBetsMap.set(userId, []);
                }
                userBetsMap.get(userId)!.push(bet);
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
                adminId: (admin._id as any).toString(),
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
     * Get report for a specific user
     */
    private static async getUserReport(userId: string, dateFilter: any): Promise<BetReport | null> {
        try {
            const user = await User.findById(userId);
            if (!user) return null;

            const bets = await Bet.find({
                userId,
                ...dateFilter
            });

            const totals = this.calculateBetTotals(bets);

            return {
                userId: (user._id as any).toString(),
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
    private static calculateBetTotals(bets: any[]): {
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
    static async getBetStats(req: Request, res: Response) {
        try {
            const currentUser = (req as any).user;
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
                // Get all admin IDs
                const admins = await User.find({ role: 'admin', isActive: true });
                for (const admin of admins) {
                    const downlineIds = await HierarchyService.getAllDownlineUserIds((admin._id as any).toString(), true);
                    userIds.push(...downlineIds);
                }
            } else if (currentUser.role === 'admin') {
                // Get current admin's downline
                userIds = await HierarchyService.getAllDownlineUserIds(currentUser._id.toString(), true);
            } else {
                // Other roles only see their own stats
                userIds = [currentUser._id.toString()];
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

            res.json({
                success: true,
                data: stats
            });

        } catch (error) {
            console.error('Error getting bet stats:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}
