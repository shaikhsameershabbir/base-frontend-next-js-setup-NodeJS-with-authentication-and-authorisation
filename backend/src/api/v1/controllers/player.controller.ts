import { Response } from 'express';
import { User } from '../../../models/User';
import { Bet } from '../../../models/Bet';
import { Market } from '../../../models/Market';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';
import { getMarketStatus } from '../../../utils/timeUtils';

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
            const updateData: Record<string, string> = {};

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

                updateData.password = newPassword;
            }

            // Update user
            const user = await User.findById(req.user.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Update fields
            Object.assign(user, updateData);
            await user.save();

            const updatedUser = await User.findById(req.user.userId).select('-password');

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
            const startDate = req.query.startDate as string;
            const endDate = req.query.endDate as string;

            // Build query with date filters
            interface BetQuery {
                userId: string;
                createdAt?: {
                    $gte?: Date;
                    $lte?: Date;
                };
            }

            const query: BetQuery = { userId: req.user.userId };

            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    // Set end date to end of day
                    const endDateTime = new Date(endDate);
                    endDateTime.setHours(23, 59, 59, 999);
                    query.createdAt.$lte = endDateTime;
                }
            }

            // Get bets for the current user with pagination and date filters
            const bets = await Bet.find(query)
                .populate('marketId', 'marketName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit);

            // Get total count for pagination with date filters
            const total = await Bet.countDocuments(query);

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
                    betType: bet.betType,
                    selectedNumbers: bet.selectedNumbers,
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
            const currentTime = new Date(); // Assuming getCurrentIndianTime is no longer needed

            res.json({
                success: true,
                message: 'Current Indian time retrieved successfully',
                data: {
                    currentTime: currentTime.toISOString(),
                    formattedTime: currentTime.toISOString(), // Assuming format is not needed
                    timezone: 'Asia/Kolkata'
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

            // Get current Indian time
            // const currentTime = getCurrentIndianTime();

            // Get market status
            const status = getMarketStatus(market.openTime, market.closeTime);

            const responseData = {
                marketId,
                marketName: market.marketName,
                openTime: market.openTime,
                closeTime: market.closeTime,
                status: status.status,
                message: status.message,
                nextEvent: status.nextEvent
            };

            res.json({
                success: true,
                message: 'Market status retrieved successfully',
                data: responseData
            });
        } catch (error: unknown) {
            logger.error('Get market status error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 