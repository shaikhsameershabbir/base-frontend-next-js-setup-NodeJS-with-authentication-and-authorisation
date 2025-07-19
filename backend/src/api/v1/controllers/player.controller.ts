import { Request, Response } from 'express';
import { User } from '../../../models/User';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { logger } from '../../../config/logger';

export class PlayerController {
    async getProfile(req: Request, res: Response): Promise<void> {
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

    async updateProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const { email, currentPassword, newPassword } = req.body;
            const updateData: any = {};

            // Update email if provided
            if (email) {
                const existingUser = await User.findOne({ email, _id: { $ne: req.user._id } });
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
                const user = await User.findById(req.user._id);
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                    return;
                }

                const bcrypt = require('bcryptjs');
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
                req.user._id,
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

    async getAssignedMarkets(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            const assignments = await UserMarketAssignment.find({ assignedTo: req.user._id })
                .populate('marketId')
                .populate('assignedBy', 'username');

            res.json({
                success: true,
                message: 'Assigned markets retrieved successfully',
                data: { assignments }
            });
        } catch (error) {
            logger.error('Get assigned markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async confirmBid(req: Request, res: Response): Promise<void> {
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
} 