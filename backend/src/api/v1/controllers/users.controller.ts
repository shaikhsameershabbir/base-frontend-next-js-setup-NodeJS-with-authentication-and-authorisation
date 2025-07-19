/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../../../models/User';
import { Market } from '../../../models/Market';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UsersController {
    async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, search, role } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const query: any = {};

            // Filter by accessible users
            if (req.accessibleUserIds && req.accessibleUserIds.length > 0) {
                query._id = { $in: req.accessibleUserIds };
            }

            // Search functionality
            if (search) {
                query.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            // Filter by role
            if (role) {
                query.role = role;
            }

            const users = await User.find(query)
                .select('-password')
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await User.countDocuments(query);

            res.json({
                success: true,
                message: 'Users retrieved successfully',
                data: users,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Check if user is accessible
            if (req.accessibleUserIds && !req.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            const user = await User.findById(userId).select('-password');
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: { user }
            });
        } catch (error) {
            logger.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getUsersByRole(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { role, userId } = req.params;

            // Check if user is accessible
            if (req.accessibleUserIds && !req.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            const user = await User.findOne({ _id: userId, role }).select('-password');
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'User retrieved successfully',
                data: { user }
            });
        } catch (error) {
            logger.error('Get user by role error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { username, email, password, role } = req.body;

            // Check if user already exists
            const existingUserQuery: any = { username };
            if (email) {
                existingUserQuery.$or = [{ username }, { email }];
            }

            const existingUser = await User.findOne(existingUserQuery);

            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Username or email already exists'
                });
                return;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create new user
            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                role,
                isActive: true,
                balance: 0
            });

            await newUser.save();

            // Remove password from response
            const userResponse = {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email || '',
                role: newUser.role,
                isActive: newUser.isActive,
                balance: newUser.balance,
                createdAt: newUser.createdAt
            };

            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: { user: userResponse }
            });
        } catch (error) {
            logger.error('Create user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const updateData = req.body;

            // Check if user is accessible
            if (req.accessibleUserIds && !req.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            // Remove sensitive fields from update data
            delete updateData.password;
            delete updateData.role;

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('-password');

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'User updated successfully',
                data: { user: updatedUser }
            });
        } catch (error) {
            logger.error('Update user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteUserAndDownline(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Check if user is accessible
            if (req.accessibleUserIds && !req.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            // TODO: Implement downline deletion logic
            const deletedUser = await User.findByIdAndDelete(userId);
            if (!deletedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            logger.error('Delete user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async toggleUserActive(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Check if user is accessible
            if (req.accessibleUserIds && !req.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
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

            user.isActive = !user.isActive;
            await user.save();

            res.json({
                success: true,
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                data: { user: { _id: user._id, isActive: user.isActive } }
            });
        } catch (error) {
            logger.error('Toggle user active error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updateUserPassword(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { newPassword } = req.body;

            // Check if user is accessible
            if (req.accessibleUserIds && !req.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { password: hashedPassword },
                { new: true }
            ).select('-password');

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            logger.error('Update user password error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getAvailableMarketsForAssignment(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            // Get all markets
            const markets = await Market.find({ isActive: true });

            // Get already assigned markets for this user
            const assignedMarkets = await UserMarketAssignment.find({ assignedTo: userId });
            const assignedMarketIds = assignedMarkets.map(assignment => (assignment.marketId as any).toString());

            // Filter out already assigned markets
            const availableMarkets = markets.filter(market =>
                !assignedMarketIds.includes((market._id as any).toString())
            );

            res.json({
                success: true,
                message: 'Available markets retrieved successfully',
                data: { markets: availableMarkets }
            });
        } catch (error) {
            logger.error('Get available markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async assignMarketsToUser(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { marketIds } = req.body;

            // Validate user exists
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Create market assignments
            const assignments = marketIds.map((marketId: string) => ({
                assignedTo: userId,
                marketId: marketId,
                assignedBy: req.user?.userId,
                hierarchyLevel: user.role
            }));

            await UserMarketAssignment.insertMany(assignments);

            res.json({
                success: true,
                message: 'Markets assigned successfully'
            });
        } catch (error) {
            logger.error('Assign markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getAssignedMarkets(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;

            const assignments = await UserMarketAssignment.find({ assignedTo: userId })
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

    async removeMarketAssignments(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { marketIds } = req.body;

            await UserMarketAssignment.deleteMany({
                assignedTo: userId,
                marketId: { $in: marketIds }
            });

            res.json({
                success: true,
                message: 'Market assignments removed successfully'
            });
        } catch (error) {
            logger.error('Remove market assignments error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 