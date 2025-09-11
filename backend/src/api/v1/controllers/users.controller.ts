/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { User } from '../../../models/User';
import { Market } from '../../../models/Market';
import { UserMarketAssignment } from '../../../models/UserMarketAssignment';
import { UserHierarchy } from '../../../models/UserHierarchy';
import { logger } from '../../../config/logger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UsersController {
    async getUsers(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { page = 1, limit = 10, search, role, parentId } = req.query;
            const skip = (Number(page) - 1) * Number(limit);
            const query: any = {};
            // Filter by accessible users
            // Filter by role if specified
            if (role && role !== 'all') {
                query.role = role;
            }
            // Filter by parent if specified
            if (parentId && parentId !== 'all') {
                query.parentId = parentId;
            } else {
                query.parentId = authReq.user?.userId;
            }
            // Search functionality
            if (search) {
                query.$or = [
                    { username: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
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

    async getUserById(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
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

    async getUsersByRole(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { role, userId } = req.params;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
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

    async createUser(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { username, password, role, parentId, percentage } = req.body;

            // Validate that user is authenticated
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
                return;
            }

            // Define role hierarchy
            const roleHierarchy: Record<string, string[]> = {
                'superadmin': ['admin', 'distributor', 'agent', 'player'],
                'admin': ['distributor', 'agent', 'player'],
                'distributor': ['agent', 'player'],
                'agent': ['player'],
                'player': []
            };

            // Check if current user can create the specified role
            const allowedRoles = roleHierarchy[authReq.user.role] || [];
            if (!allowedRoles.includes(role)) {
                res.status(403).json({
                    success: false,
                    message: `You can only create users with roles: ${allowedRoles.join(', ')}`
                });
                return;
            }

            // Validate percentage
            const percentageNum = percentage !== undefined ? Number(percentage) : 0;
            if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
                res.status(400).json({
                    success: false,
                    message: 'Percentage must be a number between 0 and 100'
                });
                return;
            }

            // Check if user already exists
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                res.status(409).json({
                    success: false,
                    message: 'Username already exists'
                });
                return;
            }

            // Determine the parent for the new user
            let finalParentId = parentId;

            // If no parentId provided, use the current user as parent
            if (!finalParentId) {
                finalParentId = authReq.user.userId;
            } else {
                // Validate that the specified parent exists and is accessible
                const parentUser = await User.findById(finalParentId);
                if (!parentUser) {
                    res.status(404).json({
                        success: false,
                        message: 'Parent user not found'
                    });
                    return;
                }

                // Check if the parent's role is appropriate for the new user's role
                const parentAllowedRoles = roleHierarchy[parentUser.role] || [];
                if (!parentAllowedRoles.includes(role)) {
                    res.status(403).json({
                        success: false,
                        message: `Cannot create ${role} under ${parentUser.role}`
                    });
                    return;
                }
            }

            const currentUser = authReq.user;

            // Create new user
            const newUser = new User({
                username,
                password,
                role,
                parentId,
                percentage: percentageNum,
                balance: 0,
                isActive: true,
                createdBy: currentUser.userId
            });

            await newUser.save();

            // Create hierarchy entry
            const levelMap = { 'superadmin': 0, 'admin': 1, 'distributor': 2, 'agent': 3, 'player': 4 };
            const newUserLevel = levelMap[role as keyof typeof levelMap] || 4;

            // Get parent hierarchy to build path
            let parentPath: string[] = [];
            if (finalParentId !== authReq.user.userId) {
                const parentHierarchy = await UserHierarchy.findOne({ userId: finalParentId });
                if (parentHierarchy) {
                    parentPath = [...parentHierarchy.path.map(id => id.toString()), finalParentId];
                }
            } else {
                // If current user is parent, get their hierarchy
                const currentUserHierarchy = await UserHierarchy.findOne({ userId: authReq.user.userId });
                if (currentUserHierarchy) {
                    parentPath = [...currentUserHierarchy.path.map(id => id.toString()), authReq.user.userId];
                }
            }

            await UserHierarchy.create({
                userId: newUser._id,
                parentId: finalParentId,
                path: parentPath,
                level: newUserLevel,
                downlineCount: 0,
                totalDownlineCount: 0
            });

            // Remove password from response
            const userResponse = {
                _id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                parentId: newUser.parentId,
                percentage: newUser.percentage,
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

    async updateUser(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;
            const updateData = req.body;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            // Remove sensitive fields from update data
            delete updateData.role;

            // Validate percentage if provided
            if (updateData.percentage !== undefined) {
                const percentageNum = Number(updateData.percentage);
                if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 100) {
                    res.status(400).json({
                        success: false,
                        message: 'Percentage must be a number between 0 and 100'
                    });
                    return;
                }
            }

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

    async deleteUserAndDownline(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
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

    async toggleUserActive(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
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

    async updateUserPassword(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;
            const { newPassword } = req.body;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
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

            user.password = newPassword;
            await user.save();

            const updatedUser = await User.findById(userId).select('-password');

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

    async getAvailableMarketsForAssignment(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

            // Validate user exists
            const user = await User.findById(userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // Get all active markets
            const allMarkets = await Market.find({ isActive: true });

            // Get markets that the target user's parent has access to
            let parentAccessibleMarkets = allMarkets;

            if (user.parentId) {
                // Get the target user's parent
                const targetParent = await User.findById(user.parentId);
                if (targetParent) {
                    if (targetParent.role === 'superadmin') {
                        // If parent is superadmin, all markets are available
                        parentAccessibleMarkets = allMarkets;
                    } else {
                        // Get markets assigned to the target user's parent
                        const parentAssignments = await UserMarketAssignment.find({
                            assignedTo: user.parentId
                        });
                        const parentMarketIds = parentAssignments.map(assignment =>
                            (assignment.marketId as any).toString()
                        );
                        parentAccessibleMarkets = allMarkets.filter(market =>
                            parentMarketIds.includes((market._id as any).toString())
                        );
                    }
                }
            } else {
                // If no parent (should be superadmin), all markets are available
                parentAccessibleMarkets = allMarkets;
            }

            // Get already assigned markets for the target user
            const assignedMarkets = await UserMarketAssignment.find({ assignedTo: userId });
            const assignedMarketIds = assignedMarkets.map(assignment =>
                (assignment.marketId as any).toString()
            );

            // Separate assigned and unassigned markets from parent's accessible markets
            const assignedMarketsData = parentAccessibleMarkets.filter(market =>
                assignedMarketIds.includes((market._id as any).toString())
            ).map(market => ({
                ...market.toObject(),
                isAssigned: true
            }));

            const unassignedMarketsData = parentAccessibleMarkets.filter(market =>
                !assignedMarketIds.includes((market._id as any).toString())
            ).map(market => ({
                ...market.toObject(),
                isAssigned: false
            }));

            // Combine both lists
            const allMarketsData = [...assignedMarketsData, ...unassignedMarketsData];

            res.json({
                success: true,
                message: 'Markets retrieved successfully',
                data: { markets: allMarketsData }
            });
        } catch (error) {
            logger.error('Get available markets error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async assignMarketsToUser(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;
            const { marketIds } = req.body;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

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
                assignedBy: authReq.user?.userId,
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

    async getAssignedMarkets(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

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

    async removeMarketAssignments(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const { userId } = req.params;
            const { marketIds } = req.body;

            // Check if user is accessible
            if (authReq.accessibleUserIds && !authReq.accessibleUserIds.includes(userId)) {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
                return;
            }

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

    async getPaymentConfiguration(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const user = await User.findById(userId).select('barcodeImage whatsappNumber');
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Payment configuration retrieved successfully',
                data: {
                    barcodeImage: user.barcodeImage || null,
                    whatsappNumber: user.whatsappNumber || null
                }
            });
        } catch (error) {
            logger.error('Get payment configuration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async updatePaymentConfiguration(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;
            const { whatsappNumber } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Validate WhatsApp number if provided
            if (whatsappNumber && !/^\+?[1-9]\d{9,14}$/.test(whatsappNumber)) {
                res.status(400).json({
                    success: false,
                    message: 'WhatsApp number must be a valid phone number'
                });
                return;
            }

            const updateData: any = {};
            if (whatsappNumber !== undefined) {
                updateData.whatsappNumber = whatsappNumber;
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            ).select('barcodeImage whatsappNumber');

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Payment configuration updated successfully',
                data: {
                    barcodeImage: updatedUser.barcodeImage || null,
                    whatsappNumber: updatedUser.whatsappNumber || null
                }
            });
        } catch (error) {
            logger.error('Update payment configuration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async uploadBarcodeImage(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;
            const { imageData } = req.body;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Check if image data was provided
            if (!imageData) {
                res.status(400).json({
                    success: false,
                    message: 'No image data provided'
                });
                return;
            }

            // Validate base64 format
            const base64Regex = /^data:image\/(jpeg|jpg|png|gif);base64,/;
            if (!base64Regex.test(imageData)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid image format. Please provide a valid base64 encoded image (JPEG, PNG, or GIF)'
                });
                return;
            }

            // Extract the base64 data and validate size
            const base64Data = imageData.split(',')[1];
            const imageSize = (base64Data.length * 3) / 4; // Approximate size in bytes
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (imageSize > maxSize) {
                res.status(400).json({
                    success: false,
                    message: 'Image size must be less than 5MB'
                });
                return;
            }

            // Store the base64 image data directly in the database
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { barcodeImage: imageData },
                { new: true, runValidators: true }
            ).select('barcodeImage whatsappNumber');

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Barcode image uploaded successfully',
                data: {
                    barcodeImage: updatedUser.barcodeImage,
                    whatsappNumber: updatedUser.whatsappNumber || null
                }
            });
        } catch (error) {
            logger.error('Upload barcode image error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async deleteBarcodeImage(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { barcodeImage: null },
                { new: true, runValidators: true }
            ).select('barcodeImage whatsappNumber');

            if (!updatedUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Barcode image deleted successfully',
                data: {
                    barcodeImage: null,
                    whatsappNumber: updatedUser.whatsappNumber || null
                }
            });
        } catch (error) {
            logger.error('Delete barcode image error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getParentBarcodeImage(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userId = authReq.user?.userId;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Get current user to find their parent
            const currentUser = await User.findById(userId).select('parentId role');
            if (!currentUser) {
                res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }

            // If user is an agent, they don't have a parent with barcode
            if (currentUser.role === 'agent') {
                res.status(404).json({
                    success: false,
                    message: 'No parent barcode available for agents'
                });
                return;
            }

            // Get parent user's barcode image and contact info
            const parentUser = await User.findById(currentUser.parentId).select('barcodeImage whatsappNumber username role');
            if (!parentUser) {
                res.status(404).json({
                    success: false,
                    message: 'Parent user not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Parent barcode image retrieved successfully',
                data: {
                    barcodeImage: parentUser.barcodeImage || null,
                    whatsappNumber: parentUser.whatsappNumber || null,
                    parentUsername: parentUser.username,
                    parentRole: parentUser.role
                }
            });
        } catch (error) {
            logger.error('Get parent barcode image error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 