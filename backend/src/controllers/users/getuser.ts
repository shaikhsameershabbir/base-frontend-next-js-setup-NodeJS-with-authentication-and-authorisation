// Get users based on role hierarchy
import { Request, Response } from 'express';
import { User } from '../../models/User';
import { logger } from '../../config/logger';
import { AuthenticatedRequest } from '../../middlewares/auth';
import { checkAccessRole } from '../../utils';
import { HierarchyService } from '../../services/hierarchyService';

interface PaginationQuery {
    page?: string;
    limit?: string;
    search?: string;
}

export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
        const { page = '1', limit = '10', search = '' } = req.query as PaginationQuery;

        if (!accessibleUserIds || accessibleUserIds.length === 0) {
            res.json({
                success: true,
                data: {
                    users: [],
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total: 0,
                        totalPages: 0
                    }
                }
            });
            return;
        }

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        const searchQuery: any = {
            _id: { $in: accessibleUserIds }
        };

        if (search && search.trim()) {
            searchQuery.username = { $regex: search.trim(), $options: 'i' };
        }

        // Get total count for pagination
        const total = await User.countDocuments(searchQuery);

        // Get users with pagination
        const users = await User.find(searchQuery)
            .select('-password')
            .populate('parentId', 'username role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages: Math.ceil(total / limitNum)
                }
            }
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
        const { role, page = 1, limit = 10, search = '' } = req.query;
        const currentUserId = req.user?.userId;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        if (!currentUserId) {
            res.status(401).json({ success: false, message: 'User not authenticated' });
            return;
        }

        // Get current user's hierarchy level
        const currentUser = await User.findById(currentUserId).populate('hierarchy');
        if (!currentUser) {
            res.status(404).json({ success: false, message: 'Current user not found' });
            return;
        }

        // Determine target user based on role
        let targetUserId = currentUserId;
        if (role === 'admin' && currentUser.role === 'superadmin') {
            // Superadmin can see all admins
            targetUserId = currentUserId;
        } else if (role === 'player' && (currentUser.role === 'superadmin' || currentUser.role === 'admin')) {
            // Superadmin and admin can see players under them
            targetUserId = currentUserId;
        } else if (role === 'player' && currentUser.role === 'player') {
            // Players can only see themselves
            targetUserId = currentUserId;
        }

        // Build query based on role and hierarchy
        let query: any = { role };

        if (role === 'admin') {
            if (currentUser.role === 'superadmin') {
                // Superadmin can see all admins
                query = { role: 'admin' };
            } else {
                // Admin can only see players under them
                query = { role: 'player', parentId: currentUserId };
            }
        } else if (role === 'player') {
            if (currentUser.role === 'superadmin' || currentUser.role === 'admin') {
                // Superadmin and admin can see players under them
                query = { role: 'player', parentId: targetUserId };
            } else {
                // Players can only see themselves
                query = { _id: currentUserId };
            }
        }

        // Add search filter if provided
        if (search) {
            query.username = { $regex: search, $options: 'i' };
        }

        // Execute query with pagination
        const skip = (pageNum - 1) * limitNum;
        const users = await User.find(query)
            .select('-password')
            .populate('hierarchy')
            .skip(skip)
            .limit(limitNum)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};


