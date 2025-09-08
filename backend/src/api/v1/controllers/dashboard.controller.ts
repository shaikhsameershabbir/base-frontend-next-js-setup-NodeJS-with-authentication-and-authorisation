import { Request, Response } from 'express';
import { User } from '../../../models/User';
import { Bet } from '../../../models/Bet';
import { Market } from '../../../models/Market';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { HierarchyService } from '../../../services/hierarchyService';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import mongoose from 'mongoose';

export class DashboardController {
    async getDashboardStats(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const currentUserId = authReq.user.userId;
            const currentUser = await User.findById(currentUserId);

            if (!currentUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Get all downline user IDs for the current user
            const downlineUserIds = await HierarchyService.getAllDownlineUserIds(currentUserId, true);

            // Get downline user IDs for dashboard stats

            // Get total users under current user (excluding self)
            const totalUsers = downlineUserIds.length - 1; // Exclude self

            // Get markets based on user role
            let activeMarkets: Array<{ marketId: { _id: string; marketName: string; isActive: boolean } }> = [];

            if (currentUser.role === 'superadmin') {
                // Superadmin can see all active markets
                const allMarkets = await Market.find({ isActive: true });
                activeMarkets = allMarkets.map(market => {
                    const marketDoc = market as unknown as { _id: string; marketName: string; isActive: boolean };
                    return {
                        marketId: {
                            _id: marketDoc._id,
                            marketName: marketDoc.marketName,
                            isActive: marketDoc.isActive
                        }
                    };
                });
            } else {
                // Other users see only assigned markets
                const assignedMarkets = await UserMarketAssignment.find({ assignedTo: currentUserId, isActive: true })
                    .populate('marketId', 'marketName isActive');

                activeMarkets = assignedMarkets
                    .filter(assignment => assignment.marketId)
                    .map(assignment => {
                        const populatedMarket = assignment.marketId as unknown as { _id: string; marketName: string; isActive: boolean };
                        return {
                            marketId: {
                                _id: populatedMarket._id,
                                marketName: populatedMarket.marketName,
                                isActive: populatedMarket.isActive
                            }
                        };
                    });
            }

            // Get total bids from all downline users
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            // Check if there are any bets in database

            // Convert string IDs to ObjectIds for MongoDB query
            const downlineUserObjectIds = downlineUserIds.map(id => new mongoose.Types.ObjectId(id));

            const totalBidsQuery = {
                userId: { $in: downlineUserObjectIds },
                createdAt: { $gte: today, $lt: tomorrow }
            };

            // Query for total bids from downline users

            const totalBidsResult = await Bet.aggregate([
                { $match: totalBidsQuery },
                { $group: { _id: null, totalBids: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
            ]);

            const totalBids = totalBidsResult.length > 0 ? totalBidsResult[0].totalBids : 0;
            const totalBetAmount = totalBidsResult.length > 0 ? totalBidsResult[0].totalAmount : 0;

            // Get win amount from all downline users (today only)
            const winAmountQuery = {
                userId: { $in: downlineUserObjectIds },
                winAmount: { $exists: true, $ne: null, $gt: 0 },
                createdAt: { $gte: today, $lt: tomorrow }
            };

            const winAmountResult = await Bet.aggregate([
                { $match: winAmountQuery },
                { $group: { _id: null, totalWinAmount: { $sum: '$winAmount' } } }
            ]);

            const winAmount = winAmountResult.length > 0 ? winAmountResult[0].totalWinAmount : 0;

            // Get market statistics for assigned markets
            const marketStats = await Promise.all(
                activeMarkets.map(async (assignment) => {
                    const market = assignment.marketId as unknown as { _id: string; marketName: string; isActive: boolean };

                    // Convert market ID to ObjectId for proper MongoDB query
                    const marketObjectId = new mongoose.Types.ObjectId(market._id);

                    // Check bets for this market (today only)

                    // For superadmin, show all bets for the market. For others, show only downline bets
                    const marketBidsQuery = currentUser.role === 'superadmin' ? {
                        marketId: marketObjectId,
                        createdAt: { $gte: today, $lt: tomorrow }
                    } : {
                        marketId: marketObjectId,
                        userId: { $in: downlineUserObjectIds },
                        createdAt: { $gte: today, $lt: tomorrow }
                    };

                    // Execute market bids aggregation

                    const marketBidsResult = await Bet.aggregate([
                        { $match: marketBidsQuery },
                        { $group: { _id: null, totalBids: { $sum: 1 }, totalAmount: { $sum: '$amount' } } }
                    ]);

                    const totalBids = marketBidsResult.length > 0 ? marketBidsResult[0].totalBids : 0;
                    const totalAmount = marketBidsResult.length > 0 ? marketBidsResult[0].totalAmount : 0;

                    return {
                        _id: market._id,
                        marketName: market.marketName,
                        isActive: market.isActive,
                        totalBids,
                        totalAmount
                    };
                })
            );

            res.json({
                success: true,
                message: 'Dashboard statistics retrieved successfully',
                data: {
                    totalUsers,
                    activeMarkets: activeMarkets.length,
                    totalBids,
                    totalBetAmount,
                    winAmount,
                    markets: marketStats
                }
            });

        } catch (error) {
            logger.error('Get dashboard stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
}
