// Get users based on role hierarchy
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { logger } from '../../config/logger';

// Update user (with access control)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { username, balance, isActive } = req.body;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this user'
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
        if (isActive !== undefined) user.isActive = isActive;

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
            message: 'User updated successfully',
            data: { user: userResponse }
        });

    } catch (error) {
        logger.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

