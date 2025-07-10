// Get users based on role hierarchy
import { Request, Response } from 'express';
import mongoose from 'mongoose';
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
        const currentUserId = req.user?.userId;
        const currentRole = req.user?.role || 'player';

        console.log('Requested role:', role, 'Target userId:', userId, 'Current user:', currentUserId);

        // Check if the current role has access to the requested role
        if (!checkAccessRole(currentRole, role)) {
            res.status(403).json({
                success: false,
                message: 'Access denied to this role'
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

        let targetUserId: mongoose.Types.ObjectId;
        let users: unknown[] = [];

        if (userId === 'all') {
            // Get all users with specified role under current user's downline
            if (!currentUserId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }
            targetUserId = new mongoose.Types.ObjectId(currentUserId);
            console.log('Getting all users with role', role, 'under current user:', targetUserId);
        } else {
            // Get users with specified role under the provided userId
            targetUserId = new mongoose.Types.ObjectId(userId);

            // Check if current user has access to the target user
            const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
            if (!accessibleUserIds || !accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied to this user'
                });
                return;
            }
            console.log('Getting users with role', role, 'under target user:', targetUserId);
        }

        // Use hierarchy service to get users efficiently
        const { HierarchyService } = await import('../../services/hierarchyService');

        try {
            const downlineResult = await HierarchyService.getDownline(
                targetUserId,
                role,
                1, // page
                1000 // limit - adjust as needed
            );

            users = downlineResult.users;
            console.log(`Found ${users.length} users with role ${role}`);
        } catch (hierarchyError) {
            console.error('Hierarchy query failed, falling back to direct query:', hierarchyError);

            // Fallback: Use the existing accessibleUserIds approach
            const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
            if (!accessibleUserIds || accessibleUserIds.length === 0) {
                res.json({
                    success: true,
                    data: { users: [] }
                });
                return;
            }

            users = await User.find({
                _id: { $in: accessibleUserIds },
                role: role
            }).select('-password').populate('parentId', 'username role');
        }

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


