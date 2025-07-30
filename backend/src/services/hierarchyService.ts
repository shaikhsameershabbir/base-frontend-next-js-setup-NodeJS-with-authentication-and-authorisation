import { User, IUser } from '../models/User';
import { UserHierarchy } from '../models/UserHierarchy';
import { logger } from '../config/logger';

interface UserWithHierarchy extends IUser {
    hierarchy: {
        level: number;
        downlineCount: number;
        totalDownlineCount: number;
    };
}

export class HierarchyService {
    /**
     * Get the level for a given role
     */
    static getRoleLevel(role: string): number {
        switch (role) {
            case 'superadmin': return 0;
            case 'admin': return 1;
            case 'distributor': return 2;
            case 'agent': return 3;
            case 'player': return 4;
            default: throw new Error(`Invalid role: ${role}`);
        }
    }

    /**
     * Get the child role for a given parent role
     */
    static getChildRole(parentRole: string): string {
        switch (parentRole) {
            case 'superadmin': return 'admin';
            case 'admin': return 'distributor';
            case 'distributor': return 'agent';
            case 'agent': return 'player';
            default: throw new Error(`Cannot create child for role: ${parentRole}`);
        }
    }

    /**
     * Check if a role can create another role
     */
    static canCreateRole(parentRole: string, childRole: string): boolean {
        const parentLevel = this.getRoleLevel(parentRole);
        const childLevel = this.getRoleLevel(childRole);
        return childLevel > parentLevel;
    }

    /**
     * Create hierarchy entry for a new user
     */
    static async createHierarchyEntry(
        userId: string,
        parentId: string | undefined,
        role: string
    ): Promise<void> {
        try {
            const level = this.getRoleLevel(role);
            let path: string[] = [];

            // Handle special case where parentId is "all"
            if (parentId && parentId !== 'all') {
                // Get parent's hierarchy to build path
                const parentHierarchy = await UserHierarchy.findOne({ userId: parentId });
                if (!parentHierarchy) {
                    throw new Error('Parent hierarchy not found');
                }
                path = [...parentHierarchy.path.map(id => id.toString()), parentId];
            }

            const hierarchyEntry = new UserHierarchy({
                userId,
                parentId: parentId === 'all' ? undefined : parentId,
                path,
                level,
                downlineCount: 0,
                totalDownlineCount: 0
            });

            await hierarchyEntry.save();

        } catch (error) {
            logger.error('Error creating hierarchy entry:', error);
            throw error;
        }
    }

    /**
     * Update downline counts for all ancestors
     */
    static async updateAncestorCounts(userId: string): Promise<void> {
        try {
            const hierarchy = await UserHierarchy.findOne({ userId });
            if (!hierarchy || !hierarchy.parentId) return;

            // Update direct parent's downline count
            await UserHierarchy.updateOne(
                { userId: hierarchy.parentId },
                { $inc: { downlineCount: 1, totalDownlineCount: 1 } }
            );

            // Update all ancestors' total downline count
            if (hierarchy.path.length > 0) {
                await UserHierarchy.updateMany(
                    { userId: { $in: hierarchy.path } },
                    { $inc: { totalDownlineCount: 1 } }
                );
            }


        } catch (error) {
            logger.error('Error updating ancestor counts:', error);
            throw error;
        }
    }

    /**
     * Get users under a specific user's downline
     */
    static async getDownlineUsers(
        userId: string,
        role?: string,
        limit = 50,
        skip = 0
    ): Promise<UserWithHierarchy[]> {
        try {
            const hierarchy = await UserHierarchy.findOne({ userId });
            if (!hierarchy) return [];

            const query: Record<string, unknown> = {
                path: { $in: [userId] }
            };

            if (role) {
                query.level = this.getRoleLevel(role);
            }

            const downlineHierarchies = await UserHierarchy.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .populate<{ userId: IUser }>('userId', 'username balance role isActive createdAt parentId');

            return downlineHierarchies.map(h => ({
                ...h.userId.toObject(),
                hierarchy: {
                    level: h.level,
                    downlineCount: h.downlineCount,
                    totalDownlineCount: h.totalDownlineCount
                }
            }));
        } catch (error) {
            logger.error('Error getting downline users:', error);
            throw error;
        }
    }

    /**
     * Get direct children of a user
     */
    static async getDirectChildren(
        userId: string,
        role?: string
    ): Promise<UserWithHierarchy[]> {
        try {
            const query: Record<string, unknown> = {
                parentId: userId
            };

            if (role) {
                query.level = this.getRoleLevel(role);
            }

            const children = await UserHierarchy.find(query)
                .populate<{ userId: IUser }>('userId', 'username balance role isActive createdAt parentId');

            return children.map(h => ({
                ...h.userId.toObject(),
                hierarchy: {
                    level: h.level,
                    downlineCount: h.downlineCount,
                    totalDownlineCount: h.totalDownlineCount
                }
            }));
        } catch (error) {
            logger.error('Error getting direct children:', error);
            throw error;
        }
    }

    /**
     * Validate parent-child relationship
     */
    static async validateParentChild(parentId: string | undefined, childRole: string): Promise<boolean> {
        try {
            // Handle special cases
            if (!parentId || parentId === 'all') {
                // Only superadmin can be created without a parent
                return childRole === 'superadmin';
            }

            const parent = await User.findById(parentId);
            if (!parent) return false;

            const parentRole = parent.role;
            return this.canCreateRole(parentRole, childRole);
        } catch (error) {
            logger.error('Error validating parent-child relationship:', error);
            return false;
        }
    }

    /**
     * Recursively get all downline user IDs for a user (optionally include self)
     */
    static async getAllDownlineUserIds(userId: string, includeSelf = false): Promise<string[]> {
        const ids: Set<string> = new Set();
        if (includeSelf) ids.add(userId);
        // Find direct children
        const children = await UserHierarchy.find({ parentId: userId });
        for (const child of children) {
            ids.add(child.userId.toString());
            const childDownline = await this.getAllDownlineUserIds(child.userId.toString(), false);
            childDownline.forEach(id => ids.add(id));
        }
        return Array.from(ids);
    }

    /**
     * Delete hierarchy entries for a list of user IDs
     */
    static async deleteHierarchyEntries(userIds: string[]): Promise<void> {
        await UserHierarchy.deleteMany({ userId: { $in: userIds } });
    }
} 