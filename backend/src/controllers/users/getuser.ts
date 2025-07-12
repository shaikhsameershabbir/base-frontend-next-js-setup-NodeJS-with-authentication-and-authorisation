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
        const { role, userId } = req.params;
        const { page = '1', limit = '10', search = '' } = req.query as PaginationQuery;
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

        let targetUserId: string;

        if (userId === 'all') {
            // Get all users with specified role under current user's downline
            if (!currentUserId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }
            targetUserId = currentUserId;
            console.log('Getting all users with role', role, 'under current user:', targetUserId);
        } else {
            // Get users with specified role under the provided userId
            targetUserId = userId;

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

        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Use hierarchy service to get users efficiently with pagination
        try {
            const downlineUsers = await HierarchyService.getDownlineUsers(
                targetUserId,
                role,
                limitNum,
                skip
            );

            // Apply search filter if provided
            let filteredUsers = downlineUsers;
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                filteredUsers = downlineUsers.filter((user: any) =>
                    searchRegex.test(user.username)
                );
            }

            // Get total count for pagination
            const allDownlineUsers = await HierarchyService.getDownlineUsers(
                targetUserId,
                role,
                10000, // Large limit to get all users for counting
                0
            );

            let total = allDownlineUsers.length;
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                total = allDownlineUsers.filter((user: any) =>
                    searchRegex.test(user.username)
                ).length;
            }

            console.log(`Found ${filteredUsers.length} users with role ${role} (page ${pageNum})`);

            res.json({
                success: true,
                data: {
                    users: filteredUsers,
                    pagination: {
                        page: pageNum,
                        limit: limitNum,
                        total,
                        totalPages: Math.ceil(total / limitNum)
                    }
                }
            });

        } catch (hierarchyError) {
            console.error('Hierarchy query failed, falling back to direct query:', hierarchyError);

            // Fallback: Use the existing accessibleUserIds approach
            const accessibleUserIds = (req as Request & { accessibleUserIds?: string[] }).accessibleUserIds;
            if (!accessibleUserIds || accessibleUserIds.length === 0) {
                res.json({
                    success: true,
                    data: {
                        users: [],
                        pagination: {
                            page: pageNum,
                            limit: limitNum,
                            total: 0,
                            totalPages: 0
                        }
                    }
                });
                return;
            }

            // Build search query
            const searchQuery: any = {
                _id: { $in: accessibleUserIds },
                role: role
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
        }

    } catch (error) {
        logger.error('Get users by role error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};


