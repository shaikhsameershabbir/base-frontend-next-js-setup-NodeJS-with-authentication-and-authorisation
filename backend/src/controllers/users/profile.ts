import { Response } from 'express';
import { User } from '../../models/User';
import { logger } from '../../config/logger';
import type { AuthenticatedRequest } from '../../middlewares/auth';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user?.userId).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    balance: user.balance,
                    role: user.role,
                    parentId: user.parentId,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { username, balance } = req.body;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Update fields if provided
        if (username !== undefined) {
            // Check if username is already taken by another user
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
            user.username = username;
        }

        if (balance !== undefined) {
            user.balance = balance;
        }

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    _id: user._id,
                    username: user.username,
                    balance: user.balance,
                    role: user.role,
                    parentId: user.parentId,
                    isActive: user.isActive,
                    createdAt: user.createdAt
                }
            }
        });

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};