import { Response } from 'express';
import { User } from '../../../models/User';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { UserHierarchy } from '../../../models/UserHierarchy';
import { MarketRank } from '../../../models/marketRank';
import { Market } from '../../../models/Market';
import { Bet } from '../../../models/Bet';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import { getCurrentIndianTime, getMarketStatus, parseTimeToIndianMoment, isBettingAllowed } from '../../../utils/timeUtils';

export class PlayerController {
    async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Profile retrieved successfully',
                data: { user: req.user }
            });
        } catch (error) {
            logger.error('Get player profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { email, currentPassword, newPassword } = req.body;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {};

            // Update email if provided
            if (email) {
                const existingUser = await User.findOne({ email, _id: { $ne: req.user.userId } });
                if (existingUser) {
                    res.status(409).json({
                        success: false,
                        message: 'Email already exists'
                    });
                    return;
                }
                updateData.email = email;
            }

            // Update password if provided
            if (currentPassword && newPassword) {
                const user = await User.findById(req.user.userId);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }


                const isValidPassword = await bcrypt.compare(currentPassword, user.password);
                if (!isValidPassword) {
                    res.status(400).json({
                        success: false,
                        message: 'Current password is incorrect'
                    });
                    return;
                }

                updateData.password = await bcrypt.hash(newPassword, 12);
            }

            // Update user
            const updatedUser = await User.findByIdAndUpdate(
                req.user.userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            logger.error('Update player profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getAssignedMarkets(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Get player's hierarchy to find their admin
            const playerHierarchy = await UserHierarchy.findOne({ userId: req.user.userId });
            if (!playerHierarchy) {
                res.status(404).json({
                    success: false,
                    message: 'Player hierarchy not found'
                });
                return;
            }

            // Find the admin in the player's hierarchy
            // For players, we need to find the admin (level 1) in their hierarchy
            // The path contains ancestor IDs, but we need to find the admin specifically
            let adminId = null;

            // First, try to find admin in the path
            if (playerHierarchy.path && playerHierarchy.path.length > 0) {
                // Get the admin from the path (assuming admin is at level 1)
                adminId = playerHierarchy.path[0]; // First element should be the admin
            }

            // If not found in path, try to find admin by level
            if (!adminId) {
                // Find admin by looking for users with level 1 in the hierarchy
                const adminHierarchy = await UserHierarchy.findOne({
                    level: 1,
                    path: { $in: [req.user.userId] }
                });
                if (adminHierarchy) {
                    adminId = adminHierarchy.userId;
                }
            }

            // If still not found, try to find admin through parentId chain
            if (!adminId && playerHierarchy.parentId) {
                const parentHierarchy = await UserHierarchy.findOne({ userId: playerHierarchy.parentId });
                if (parentHierarchy && parentHierarchy.level === 1) {
                    adminId = parentHierarchy.userId;
                } else if (parentHierarchy && parentHierarchy.parentId) {
                    // Go up one more level
                    const grandParentHierarchy = await UserHierarchy.findOne({ userId: parentHierarchy.parentId });
                    if (grandParentHierarchy && grandParentHierarchy.level === 1) {
                        adminId = grandParentHierarchy.userId;
                    }
                }
            }

            if (!adminId) {
                res.status(404).json({
                    success: false,
                    message: 'Player admin not found in hierarchy'
                });
                return;
            }

            logger.info(`Player ${req.user.userId} admin found: ${adminId}, player level: ${playerHierarchy.level}, path length: ${playerHierarchy.path?.length || 0}`);

            // Get assigned markets
            const assignments = await UserMarketAssignment.find({ assignedTo: req.user.userId })
                .populate({
                    path: 'marketId',
                    select: 'marketName openTime closeTime isActive isGolden'
                })
                .populate('assignedBy', 'username');

            logger.info(`Found ${assignments.length} market assignments for player ${req.user.userId}`);

            // Get market ranks from the admin
            const marketIds = assignments
                .filter(assignment => assignment.marketId)
                .map(assignment => assignment.marketId);

            logger.info(`Looking for market ranks for admin ${adminId}, market count: ${marketIds.length}`);

            const marketRanks = await MarketRank.find({
                userId: adminId,
                marketId: { $in: marketIds }
            }).sort({ rank: 1 });

            logger.info(`Found ${marketRanks.length} market ranks for admin ${adminId}`);

            // Combine assignments with ranks
            const marketsWithRanks = assignments
                .filter(assignment => assignment.marketId)
                .map(assignment => {
                    const marketRank = marketRanks.find(rank => {
                        // Handle both populated and unpopulated marketId
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const assignmentMarketId = (assignment.marketId as any)?._id?.toString() || assignment.marketId?.toString() || '';
                        return rank.marketId.toString() === assignmentMarketId;
                    });

                    const assignmentObj = assignment.toObject();
                    let marketData;

                    if (typeof assignment.marketId === 'object' && assignment.marketId && 'toObject' in assignment.marketId) {
                        marketData = (assignment.marketId as { toObject(): Record<string, unknown> }).toObject();
                    } else {
                        marketData = { marketName: 'Unknown Market', openTime: 'N/A', closeTime: 'N/A', isActive: false, isGolden: false };
                    }

                    return {
                        ...assignmentObj,
                        rank: marketRank ? marketRank.rank : null,
                        marketData: {
                            ...marketData,
                            rank: marketRank ? marketRank.rank : null
                        }
                    };
                })
                .sort((a, b) => {
                    // Sort by rank (null ranks go to the end)
                    if (a.rank === null && b.rank === null) return 0;
                    if (a.rank === null) return 1;
                    if (b.rank === null) return -1;
                    return a.rank - b.rank;
                });

            logger.info(`Retrieved ${marketsWithRanks.length} markets with ranks for player ${req.user.userId}`);
            logger.info(`Markets with ranks: ${marketsWithRanks.filter(m => m.rank !== null).length}, markets without ranks: ${marketsWithRanks.filter(m => m.rank === null).length}`);

            res.json({
                success: true,
                message: 'Assigned markets retrieved successfully',
                data: {
                    assignments: marketsWithRanks,
                    adminId: adminId.toString()
                }
            });
        } catch (error) {
            logger.error('Get assigned markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getBetHistory(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const skip = (page - 1) * limit;

            // Get bets for the current user with pagination
            const bets = await Bet.find({ userId: req.user.userId })
                .populate('marketId', 'marketName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Get total count for pagination
            const total = await Bet.countDocuments({ userId: req.user.userId });

            res.json({
                success: true,
                message: 'Bet history retrieved successfully',
                data: {
                    bets,
                    total,
                    page,
                    limit
                }
            });
        } catch (error) {
            logger.error('Get bet history error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getBetById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { betId } = req.params;

            // Get bet by ID and ensure it belongs to the current user
            const bet = await Bet.findOne({ _id: betId, userId: req.user.userId })
                .populate('marketId', 'marketName');

            if (!bet) {
                res.status(404).json({
                    success: false,
                    message: 'Bet not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Bet details retrieved successfully',
                data: {
                    betId: bet._id,
                    marketId: bet.marketId,
                    type: bet.type,
                    amount: bet.amount,
                    userBeforeAmount: bet.userBeforeAmount,
                    userAfterAmount: bet.userAfterAmount,
                    status: bet.status,
                    result: bet.result,
                    createdAt: bet.createdAt
                }
            });
        } catch (error) {
            logger.error('Get bet by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async cancelBet(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { betId } = req.params;

            // Get bet by ID and ensure it belongs to the current user
            const bet = await Bet.findOne({ _id: betId, userId: req.user.userId });
            if (!bet) {
                res.status(404).json({
                    success: false,
                    message: 'Bet not found'
                });
                return;
            }

            // Check if bet can be cancelled (e.g., not already processed)
            if (!bet.status) {
                res.status(400).json({
                    success: false,
                    message: 'Bet cannot be cancelled'
                });
                return;
            }

            // Get current user
            const user = await User.findById(req.user.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Refund the bet amount
            user.balance += bet.amount;
            await user.save();

            // Mark bet as cancelled
            bet.status = false;
            bet.result = 'cancelled';
            await bet.save();

            logger.info(`Bet cancelled: User ${req.user.userId}, Bet ${betId}, Amount ₹${bet.amount}`);

            res.json({
                success: true,
                message: 'Bet cancelled successfully',
                data: {
                    betId: bet._id,
                    refundedAmount: bet.amount,
                    newBalance: user.balance
                }
            });
        } catch (error) {
            logger.error('Cancel bet error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getBetStats(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Get bet statistics for the current user
            const totalBets = await Bet.countDocuments({ userId: req.user.userId });
            const totalAmount = await Bet.aggregate([
                { $match: { userId: req.user.userId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const todayBets = await Bet.countDocuments({
                userId: req.user.userId,
                createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
            });

            const todayAmount = await Bet.aggregate([
                {
                    $match: {
                        userId: req.user.userId,
                        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
                    }
                },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            res.json({
                success: true,
                message: 'Bet statistics retrieved successfully',
                data: {
                    totalBets,
                    totalAmount: totalAmount[0]?.total || 0,
                    todayBets,
                    todayAmount: todayAmount[0]?.total || 0
                }
            });
        } catch (error) {
            logger.error('Get bet stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async confirmBet(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { marketId, gameType, numbers, amount } = req.body;

            // TODO: Implement bid confirmation logic
            // This would involve:
            // 1. Validating the bid
            // 2. Checking user balance
            // 3. Creating bid record
            // 4. Updating user balance
            // 5. Logging activity

            res.json({
                success: true,
                message: 'Bid confirmed successfully',
                data: {
                    bidId: 'temp-bid-id',
                    marketId,
                    gameType,
                    numbers,
                    amount
                }
            });
        } catch (error) {
            logger.error('Confirm bid error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getCurrentTime(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const currentTime = getCurrentIndianTime();

            // Test time conversion for debugging
            const testOpenTime = "2025-07-25T07:00:00.000Z";
            const testCloseTime = "2025-07-25T10:30:00.000Z";
            const openMoment = parseTimeToIndianMoment(testOpenTime);
            const closeMoment = parseTimeToIndianMoment(testCloseTime);

            // Test the new logic
            const testStatus = getMarketStatus(testOpenTime, testCloseTime);
            const testOpenBet = isBettingAllowed('open', testOpenTime, testCloseTime);
            const testCloseBet = isBettingAllowed('close', testOpenTime, testCloseTime);

            res.json({
                success: true,
                message: 'Current Indian time retrieved successfully',
                data: {
                    currentTime: currentTime.toISOString(),
                    formattedTime: currentTime.format('YYYY-MM-DD HH:mm:ss'),
                    timezone: 'Asia/Kolkata',
                    debug: {
                        testOpenTime,
                        testCloseTime,
                        openTimeIST: openMoment.format('YYYY-MM-DD HH:mm:ss'),
                        closeTimeIST: closeMoment.format('YYYY-MM-DD HH:mm:ss'),
                        currentTimeIST: currentTime.format('YYYY-MM-DD HH:mm:ss'),
                        testStatus: testStatus.status,
                        testOpenBet: testOpenBet.allowed,
                        testCloseBet: testCloseBet.allowed
                    }
                }
            });
        } catch (error) {
            logger.error('Get current time error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getMarketStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { marketId } = req.params;

            // Get market details
            const market = await Market.findById(marketId);
            if (!market) {
                res.status(404).json({
                    success: false,
                    message: 'Market not found'
                });
                return;
            }

            const status = getMarketStatus(market.openTime, market.closeTime);

            // Log market status for debugging
            logger.info(`Market status for ${marketId}:`, {
                marketName: market.marketName,
                openTime: market.openTime,
                closeTime: market.closeTime,
                status: status.status,
                message: status.message
            });

            res.json({
                success: true,
                message: 'Market status retrieved successfully',
                data: {
                    marketId,
                    marketName: market.marketName,
                    openTime: market.openTime,
                    closeTime: market.closeTime,
                    status: status.status,
                    message: status.message,
                    nextEvent: status.nextEvent
                }
            });
        } catch (error) {
            logger.error('Get market status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 