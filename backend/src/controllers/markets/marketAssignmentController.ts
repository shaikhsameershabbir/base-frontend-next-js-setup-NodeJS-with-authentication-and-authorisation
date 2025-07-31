import { Response } from 'express';
import { Types } from 'mongoose';
import { User } from '../../models/User';
import { Market, IMarket } from '../../models/Market';
import { UserMarketAssignment } from '../../models/UserMarketAssignment';
import { logger } from '../../config/logger';
import { AuthenticatedRequest } from '../../api/v1/middlewares/auth.middleware';



// Get markets available for assignment to a specific user
export const getAvailableMarketsForAssignment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;

        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Get the target user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
            return;
        }

        // Validate hierarchy permissions
        const canAssign = validateAssignmentPermission(currentUser, targetUser);

        if (!canAssign) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to assign markets to this user'
            });
            return;
        }

        // Get markets that the current user can assign
        let availableMarkets: IMarket[];

        if (
            currentUser.role === 'superadmin' ||
            currentUser.role === 'Superadmin' ||
            currentUser.role === 'SUPERADMIN'
        ) {
            // Superadmin can assign any market
            availableMarkets = await Market.find({ isActive: true });
        } else {
            // Get markets assigned to current user
            const userAssignments = await UserMarketAssignment.find({
                assignedTo: currentUser.userId,
                isActive: true
            }).populate('marketId');

            // Only include assignments where marketId is not null
            availableMarkets = userAssignments
                .filter(assignment => assignment.marketId !== null)
                .map(assignment => assignment.marketId as unknown as IMarket);
        }

        // Get already assigned markets
        const existingAssignments = await UserMarketAssignment.find({
            assignedTo: userId,
            isActive: true
        }).populate('marketId');

        // Only include assignments where marketId is not null
        const validExistingAssignments = existingAssignments.filter(
            assignment => assignment.marketId !== null
        );

        const assignedMarketIds = validExistingAssignments.map(assignment =>
            String((assignment.marketId as unknown as IMarket)._id)
        );


        const assignedMarkets = validExistingAssignments.map(assignment => {
            const market = assignment.marketId as unknown as IMarket;
            return {
                _id: market._id instanceof Types.ObjectId ? market._id.toString() : String(market._id),
                marketName: market.marketName,
                openTime: market.openTime,
                closeTime: market.closeTime,
                isActive: market.isActive,
                isAssigned: true,
                assignmentId: assignment._id
            };
        });

        // Filter unassigned markets, only include those with valid _id
        const unassignedMarkets = availableMarkets
            .filter(
                market =>
                    market &&
                    market._id &&
                    !assignedMarketIds.includes(String(market._id))
            )
            .map(market => {
                return {
                    _id: market._id instanceof Types.ObjectId ? market._id.toString() : String(market._id),
                    marketName: market.marketName,
                    openTime: market.openTime,
                    closeTime: market.closeTime,
                    isActive: market.isActive,
                    isAssigned: false
                };
            });

        // Combine assigned and unassigned markets
        const allMarkets = [...assignedMarkets, ...unassignedMarkets];

        res.json({
            success: true,
            data: {
                markets: allMarkets,
                targetUser: {
                    _id: String(targetUser._id),
                    username: targetUser.username,
                    role: targetUser.role
                }
            }
        });

    } catch (error) {
        logger.error('Error getting available markets:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Assign markets to a user
export const assignMarketsToUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { marketIds } = req.body;
        const currentUser = req.user;

        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Market IDs are required and must be an array'
            });
            return;
        }

        // Get the target user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
            return;
        }

        // Validate hierarchy permissions
        const canAssign = validateAssignmentPermission(currentUser, targetUser);
        if (!canAssign) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to assign markets to this user'
            });
            return;
        }

        // Validate that all markets exist and are active
        const markets = await Market.find({
            _id: { $in: marketIds },
            isActive: true
        });

        if (markets.length !== marketIds.length) {
            res.status(400).json({
                success: false,
                message: 'Some markets do not exist or are inactive'
            });
            return;
        }

        // Check if current user has access to these markets
        if (currentUser.role !== 'superadmin' && currentUser.role !== 'Superadmin' && currentUser.role !== 'SUPERADMIN') {
            const userAssignments = await UserMarketAssignment.find({
                assignedTo: currentUser.userId,
                marketId: { $in: marketIds },
                isActive: true
            });

            if (userAssignments.length !== marketIds.length) {
                res.status(403).json({
                    success: false,
                    message: 'You do not have access to some of the selected markets'
                });
                return;
            }
        }

        // Create assignments
        const assignments = [];
        const hierarchyLevel = getHierarchyLevel(targetUser.role);

        for (const marketId of marketIds) {
            // Check if assignment already exists
            const existingAssignment = await UserMarketAssignment.findOne({
                assignedTo: userId,
                marketId: marketId,
                isActive: true
            });

            if (existingAssignment) {
                continue; // Skip if already assigned
            }

            // Find parent assignment if exists
            let parentAssignment = null;
            if (currentUser.role !== 'superadmin' && currentUser.role !== 'Superadmin' && currentUser.role !== 'SUPERADMIN') {
                parentAssignment = await UserMarketAssignment.findOne({
                    assignedTo: currentUser.userId,
                    marketId: marketId,
                    isActive: true
                });
            }

            const assignment = new UserMarketAssignment({
                assignedBy: currentUser.userId,
                assignedTo: userId,
                marketId: marketId,
                hierarchyLevel: hierarchyLevel,
                parentAssignment: parentAssignment?._id
            });

            assignments.push(assignment);
        }

        if (assignments.length > 0) {
            await UserMarketAssignment.insertMany(assignments);
        }

        res.json({
            success: true,
            message: `Successfully assigned ${assignments.length} markets to ${targetUser.username}`,
            data: {
                assignedCount: assignments.length,
                targetUser: {
                    _id: String(targetUser._id),
                    username: targetUser.username,
                    role: targetUser.role
                }
            }
        });

    } catch (error) {
        logger.error('Error assigning markets:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Get assigned markets for a user using userId
export const getAssignedMarkets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const currentUser = req.user;

        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        // Get the target user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
            return;
        }

        // Validate access permissions
        const canView = validateViewPermission(currentUser, targetUser);
        if (!canView) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to view this user\'s markets'
            });
            return;
        }

        // Get assigned markets
        const assignments = await UserMarketAssignment.find({
            assignedTo: userId,
            isActive: true
        }).populate('marketId assignedBy');

        res.json({
            success: true,
            data: {
                assignments: assignments,
                targetUser: {
                    _id: String(targetUser._id),
                    username: targetUser.username,
                    role: targetUser.role
                }
            }
        });

    } catch (error) {
        logger.error('Error getting assigned markets:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
// Get assigned markets for a authenticated user

export const getAssignedMarketsForAuthenticatedUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const currentUser = req.user;

        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }



        // Get assigned markets
        const assignments = await UserMarketAssignment.find({
            assignedTo: currentUser.userId,
            isActive: true
        }).populate('marketId assignedBy');


        res.json({
            success: true,
            data: {
                assignments: assignments,

            }
        });

    } catch (error) {
        logger.error('Error getting assigned markets:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Remove market assignments
export const removeMarketAssignments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;
        const { marketIds } = req.body;
        const currentUser = req.user;

        if (!currentUser) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!marketIds || !Array.isArray(marketIds) || marketIds.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Market IDs are required and must be an array'
            });
            return;
        }

        // Get the target user
        const targetUser = await User.findById(userId);
        if (!targetUser) {
            res.status(404).json({
                success: false,
                message: 'Target user not found'
            });
            return;
        }

        // Validate hierarchy permissions
        const canAssign = validateAssignmentPermission(currentUser, targetUser);
        if (!canAssign) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to remove markets from this user'
            });
            return;
        }

        // Remove assignments (soft delete)
        const result = await UserMarketAssignment.updateMany(
            {
                assignedTo: userId,
                marketId: { $in: marketIds },
                isActive: true
            },
            {
                isActive: false
            }
        );

        res.json({
            success: true,
            message: `Successfully removed ${result.modifiedCount} market assignments from ${targetUser.username}`,
            data: {
                removedCount: result.modifiedCount,
                targetUser: {
                    _id: String(targetUser._id),
                    username: targetUser.username,
                    role: targetUser.role
                }
            }
        });

    } catch (error) {
        logger.error('Error removing market assignments:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// Helper function to validate assignment permissions
const validateAssignmentPermission = (currentUser: { userId: string; role: string }, targetUser: { _id: string; role: string }): boolean => {
    // Superadmin can assign to anyone
    if (currentUser.role === 'superadmin' || currentUser.role === 'Superadmin' || currentUser.role === 'SUPERADMIN') {
        return true;
    }

    // Check hierarchy
    switch (currentUser.role) {
        case 'admin':
            // Admin can assign to distributors and players under them
            return targetUser.role === 'distributor' || targetUser.role === 'agent' || targetUser.role === 'player';

        case 'distributor':
            // Distributor can assign to agents and players under them
            return targetUser.role === 'agent' || targetUser.role === 'player';

        case 'agent':
            // Agent can assign to players under them
            return targetUser.role === 'player';

        default:
            return false;
    }
};

// Helper function to validate view permissions
const validateViewPermission = (currentUser: { userId: string; role: string }, targetUser: { _id: string; role: string }): boolean => {
    // Superadmin can view anyone
    if (currentUser.role === 'superadmin' || currentUser.role === 'Superadmin' || currentUser.role === 'SUPERADMIN') {
        return true;
    }

    // Users can view their own assignments
    if (currentUser.userId === targetUser._id) {
        return true;
    }

    // Check hierarchy
    switch (currentUser.role) {
        case 'admin':
            // Admin can view distributors and players under them
            return targetUser.role === 'distributor' || targetUser.role === 'agent' || targetUser.role === 'player';

        case 'distributor':
            // Distributor can view agents and players under them
            return targetUser.role === 'agent' || targetUser.role === 'player';

        case 'agent':
            // Agent can view players under them
            return targetUser.role === 'player';

        default:
            return false;
    }
};

// Helper function to get hierarchy level
const getHierarchyLevel = (role: string): 'admin' | 'distributor' | 'agent' | 'player' => {
    switch (role) {
        case 'admin':
            return 'admin';
        case 'distributor':
            return 'distributor';
        case 'agent':
            return 'agent';
        case 'player':
            return 'player';
        default:
            return 'player';
    }
}; 