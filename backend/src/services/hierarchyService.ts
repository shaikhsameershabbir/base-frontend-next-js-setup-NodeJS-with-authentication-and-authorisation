import mongoose from 'mongoose';
import { User } from '../models/User';
import { UserHierarchy, IUserHierarchy } from '../models/UserHierarchy';
import { logger } from '../config/logger';

export class HierarchyService {
    /**
     * Create or update hierarchy entry for a user
     */
    static async createHierarchyEntry(user: any): Promise<IUserHierarchy> {
        try {
            const level = this.getLevelByRole(user.role);
            let path: mongoose.Types.ObjectId[] = [];
            let parentHierarchy = null;

            if (user.parentId) {
                parentHierarchy = await UserHierarchy.findOne({ userId: user.parentId });
                if (parentHierarchy) {
                    path = [...parentHierarchy.path, user.parentId];
                }
            }

            const hierarchyData = {
                userId: user._id,
                username: user.username,
                role: user.role,
                parentId: user.parentId,
                parentUsername: parentHierarchy?.username,
                parentRole: parentHierarchy?.role,
                path,
                level,
                isActive: user.isActive
            };

            const hierarchy = await UserHierarchy.findOneAndUpdate(
                { userId: user._id },
                hierarchyData,
                { upsert: true, new: true }
            );

            // Update parent's downline counts
            if (user.parentId) {
                await this.updateParentDownlineCounts(user.parentId);
            }

            return hierarchy;
        } catch (error) {
            logger.error('Error creating hierarchy entry:', error);
            throw error;
        }
    }

    /**
     * Get user's complete downline (all levels)
     */
    static async getDownline(
        userId: mongoose.Types.ObjectId,
        role?: string,
        page = 1,
        limit = 20
    ) {
        try {
            const skip = (page - 1) * limit;
            const downline = await UserHierarchy.findDownline(userId, role, limit, skip);

            const total = await UserHierarchy.countDocuments({
                path: { $in: [userId] },
                isActive: true,
                ...(role && { role })
            });

            return {
                users: downline.map((h: IUserHierarchy) => h.userId),
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error getting downline:', error);
            throw error;
        }
    }

    /**
     * Get user's direct downline (immediate children only)
     */
    static async getDirectDownline(
        userId: mongoose.Types.ObjectId,
        role?: string
    ) {
        try {
            const downline = await UserHierarchy.findDirectDownline(userId, role);
            return downline.map((h: IUserHierarchy) => h.userId);
        } catch (error) {
            logger.error('Error getting direct downline:', error);
            throw error;
        }
    }

    /**
     * Get downline statistics
     */
    static async getDownlineStats(userId: mongoose.Types.ObjectId) {
        try {
            const stats = await UserHierarchy.getDownlineStats(userId);
            return stats;
        } catch (error) {
            logger.error('Error getting downline stats:', error);
            throw error;
        }
    }

    /**
     * Get user's upline (path to root)
     */
    static async getUpline(userId: mongoose.Types.ObjectId) {
        try {
            const hierarchy = await UserHierarchy.findOne({ userId });
            if (!hierarchy || !hierarchy.path.length) {
                return [];
            }

            const upline = await UserHierarchy.find({
                userId: { $in: hierarchy.path }
            }).populate('userId', 'username role balance isActive');

            return upline.map(h => h.userId);
        } catch (error) {
            logger.error('Error getting upline:', error);
            throw error;
        }
    }

    /**
     * Check if user can access target user (is in downline)
     */
    static async canAccessUser(
        requestingUserId: mongoose.Types.ObjectId,
        targetUserId: mongoose.Types.ObjectId
    ): Promise<boolean> {
        try {
            const targetHierarchy = await UserHierarchy.findOne({ userId: targetUserId });
            if (!targetHierarchy) return false;

            return targetHierarchy.path.some(id => id.equals(requestingUserId));
        } catch (error) {
            logger.error('Error checking user access:', error);
            return false;
        }
    }

    /**
     * Update downline counts for a user
     */
    static async updateDownlineCounts(userId: mongoose.Types.ObjectId) {
        try {
            const hierarchy = await UserHierarchy.findOne({ userId });
            if (hierarchy) {
                await hierarchy.updateDownlineCounts();
            }
        } catch (error) {
            logger.error('Error updating downline counts:', error);
            throw error;
        }
    }

    /**
     * Update parent's downline counts recursively
     */
    static async updateParentDownlineCounts(userId: mongoose.Types.ObjectId) {
        try {
            const hierarchy = await UserHierarchy.findOne({ userId });
            if (hierarchy) {
                await hierarchy.updateDownlineCounts();

                // Update parent recursively
                if (hierarchy.parentId) {
                    await this.updateParentDownlineCounts(hierarchy.parentId);
                }
            }
        } catch (error) {
            logger.error('Error updating parent downline counts:', error);
            throw error;
        }
    }

    /**
     * Get hierarchy level by role
     */
    private static getLevelByRole(role: string): number {
        const levels = {
            superadmin: 0,
            admin: 1,
            distributor: 2,
            agent: 3,
            player: 4
        };
        return levels[role as keyof typeof levels] || 0;
    }

    /**
     * Get user details with hierarchy information
     */
    static async getUserDetails(userId: mongoose.Types.ObjectId) {
        try {
            const hierarchy = await UserHierarchy.findOne({ userId })
                .populate('userId', 'username balance role isActive createdAt parentId');

            if (!hierarchy) return null;

            const downlineStats = await this.getDownlineStats(userId);
            const directDownline = await this.getDirectDownline(userId);

            return {
                user: hierarchy.userId,
                hierarchy: {
                    level: hierarchy.level,
                    parentId: hierarchy.parentId,
                    parentUsername: hierarchy.parentUsername,
                    parentRole: hierarchy.parentRole,
                    downlineCount: hierarchy.downlineCount
                },
                stats: downlineStats,
                directDownline: directDownline.length
            };
        } catch (error) {
            logger.error('Error getting user details:', error);
            throw error;
        }
    }

    /**
     * Bulk create hierarchy entries (for seeding)
     */
    static async bulkCreateHierarchy(users: any[]) {
        try {
            const hierarchyEntries: Array<{
                userId: mongoose.Types.ObjectId;
                username: string;
                role: string;
                parentId?: mongoose.Types.ObjectId;
                path: mongoose.Types.ObjectId[];
                level: number;
                isActive: boolean;
            }> = [];

            for (const user of users) {
                const level = this.getLevelByRole(user.role);
                let path: mongoose.Types.ObjectId[] = [];

                if (user.parentId) {
                    const parentHierarchy = hierarchyEntries.find(h => h.userId.equals(user.parentId));
                    if (parentHierarchy) {
                        path = [...parentHierarchy.path, user.parentId];
                    }
                }

                hierarchyEntries.push({
                    userId: user._id,
                    username: user.username,
                    role: user.role,
                    parentId: user.parentId,
                    path,
                    level,
                    isActive: user.isActive
                });
            }

            await UserHierarchy.insertMany(hierarchyEntries);
            logger.info(`Created ${hierarchyEntries.length} hierarchy entries`);
        } catch (error) {
            logger.error('Error bulk creating hierarchy:', error);
            throw error;
        }
    }
} 