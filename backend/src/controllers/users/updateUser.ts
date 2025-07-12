// Get users based on role hierarchy
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { logger } from '../../config/logger';
import { HierarchyService } from '../../services/hierarchyService';

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

export const deleteUserAndDownline = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({ success: false, message: 'Access denied to this user' });
            return;
        }
        // Get all downline user IDs (including the user)
        const allUserIds = await HierarchyService.getAllDownlineUserIds(userId, true); // true = include self
        await User.deleteMany({ _id: { $in: allUserIds } });
        await HierarchyService.deleteHierarchyEntries(allUserIds);
        res.json({ success: true, message: 'User and downline deleted' });
    } catch (error) {
        logger.error('Cascade delete error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const toggleUserActive = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({ success: false, message: 'Access denied to this user' });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.isActive = !user.isActive;
        await user.save();
        res.json({ success: true, message: 'User status updated', data: { user } });
    } catch (error) {
        logger.error('Toggle active error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const updateUserPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { password } = req.body;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({ success: false, message: 'Access denied to this user' });
            return;
        }
        if (!password || password.length < 6) {
            res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
            return;
        }
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }
        user.password = password;
        await user.save();
        res.json({ success: true, message: 'Password updated' });
    } catch (error) {
        logger.error('Password update error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

