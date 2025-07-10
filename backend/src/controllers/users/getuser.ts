// Get users based on role hierarchy
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { logger } from '../../config/logger';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { checkAccessRole } from '../../utils';
export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || accessibleUserIds.length === 0) {
            res.json({
                success: true,
                data: { users: [] }
            });
            return;
        }

        const users = await User.find({
            _id: { $in: accessibleUserIds }
        }).select('-password').populate('parentId', 'username role');

        res.json({
            success: true,
            data: { users }
        });

    } catch (error) {
        logger.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get user by ID (with access control)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this user'
            });
            return;
        }

        const user = await User.findById(userId).select('-password').populate('parentId', 'username role');

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
        logger.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get users by role (with access control)
export const getUsersByRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {


        const { role, userId } = req.params;
        console.log(userId);

        const currentRole = req.user?.role || 'player';
        // check if the current role has access to the role
        if (!checkAccessRole(currentRole, role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this user'
            });
            return;
        }
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;

        if (!accessibleUserIds || accessibleUserIds.length === 0) {
            res.json({
                success: true,
                data: { users: [] }
            });
            return;
        }

        // Validate role parameter
        const validRoles = ['superadmin', 'admin', 'distributor', 'agent', 'player'];
        if (!validRoles.includes(role)) {
            res.status(400).json({
                success: false,
                message: 'Invalid role parameter'
            });
            return;
        }

        const users = await User.find({
            _id: { $in: accessibleUserIds },
            role: role
        }).select('-password').populate('parentId', 'username role');
        // console.log(users);

        res.json({
            success: true,
            data: { users }
        });

    } catch (error) {
        logger.error('Get users by role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


