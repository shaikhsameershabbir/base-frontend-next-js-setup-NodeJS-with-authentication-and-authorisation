import { Request, Response } from 'express';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
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
            data: { user }
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, balance } = req.body;
        const userId = req.user?.userId;

        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Check if new username already exists
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }
        }

        // Update user
        if (username) user.username = username;
        if (balance !== undefined) user.balance = balance;

        await user.save();

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            parentId: user.parentId,
            isActive: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.json({
            success: true,
            message: 'Profile updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};