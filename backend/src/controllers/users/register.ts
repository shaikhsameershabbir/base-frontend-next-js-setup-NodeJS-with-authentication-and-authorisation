import { Response } from 'express';
import { User } from '../../models/User';
import { HierarchyService } from '../../services/hierarchyService';
import { logger } from '../../config/logger';
import { AuthenticatedRequest } from '../../api/v1/middlewares/auth.middleware';

export const createUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        console.log(req.body);

        const { username, password, balance, role, parentId } = req.body;
        const currentUser = req.user;

        // Validate required fields
        if (!username || !password) {
            res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
            return;
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'Username already exists'
            });
            return;
        }

        // Determine the role and parent based on the current user's role
        let finalRole = role;
        let finalParentId = parentId;

        if (currentUser) {
            // Role-based user creation logic
            switch (currentUser.role) {
                case 'superadmin':
                    // Superadmin can create any role
                    if (!finalRole) {
                        finalRole = 'admin'; // Default to admin
                    }
                    if (!finalParentId || finalParentId === 'all') {
                        finalParentId = currentUser.userId; // Default parent is superadmin
                    }
                    break;

                case 'admin':
                    // Admin can create distributor, agent, and player
                    if (!finalRole || !HierarchyService.canCreateRole('admin', finalRole)) {
                        finalRole = 'distributor'; // Default to distributor
                    }
                    if (!finalParentId || finalParentId === 'all') {
                        finalParentId = currentUser.userId; // Default parent is admin
                    }
                    break;

                case 'distributor':
                    // Distributor can create agent and player
                    if (!finalRole || !HierarchyService.canCreateRole('distributor', finalRole)) {
                        finalRole = 'agent'; // Default to agent
                    }
                    if (!finalParentId || finalParentId === 'all') {
                        finalParentId = currentUser.userId; // Default parent is distributor
                    }
                    break;

                case 'agent':
                    // Agent can only create player
                    finalRole = 'player';
                    if (!finalParentId || finalParentId === 'all') {
                        finalParentId = currentUser.userId; // Default parent is agent
                    }
                    break;

                default:
                    res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions to create users'
                    });
                    return;
            }

            // Validate parent-child relationship
            if (finalParentId && finalParentId !== 'all' && !(await HierarchyService.validateParentChild(finalParentId, finalRole))) {
                res.status(400).json({
                    success: false,
                    message: `Cannot create ${finalRole} under the specified parent`
                });
                return;
            }
        } else {
            // No authenticated user - only allow superadmin creation (for initial setup)
            if (finalRole !== 'superadmin') {
                res.status(403).json({
                    success: false,
                    message: 'Only superadmin can be created without authentication'
                });
                return;
            }
            // For superadmin creation, ensure no parentId
            finalParentId = undefined;
        }

        // Create new user
        const user = new User({
            username,
            password,
            balance,
            role: finalRole,
            parentId: finalRole === 'superadmin' ? undefined : finalParentId,
            isActive: true
        });

        await user.save();

        // Create hierarchy entry
        await HierarchyService.createHierarchyEntry(
            (user._id as { toString(): string }).toString(),
            finalRole === 'superadmin' ? undefined : finalParentId,
            finalRole
        );

        // Update ancestor counts
        if (finalParentId && finalParentId !== 'all' && finalRole !== 'superadmin') {
            await HierarchyService.updateAncestorCounts((user._id as { toString(): string }).toString());
        }

        // Remove password from response
        const userResponse = {
            _id: user._id,
            username: user.username,
            balance: user.balance,
            role: user.role,
            parentId: user.parentId,
            isActive: user.isActive,
            createdAt: user.createdAt
        };

        res.status(201).json({
            success: true,
            message: `${finalRole} created successfully`,
            data: {
                user: userResponse
            }
        });

    } catch (error) {
        logger.error('User creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};