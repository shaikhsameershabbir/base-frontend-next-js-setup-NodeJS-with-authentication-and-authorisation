import { Activity, IActivity } from '../models/Activity';
import { logger } from '../config/logger';
import mongoose from 'mongoose';

export interface CreateActivityData {
    userId: string;
    activity: string;
    activityType: IActivity['activityType'];
    status?: IActivity['status'];
    otherInfo?: string;
    metadata?: IActivity['metadata'];
}

export class ActivityService {
    /**
 * Helper method to get real IP address from request
 */
    private static getRealIpAddress(req: {
        headers: Record<string, string | string[] | undefined>;
        connection?: { remoteAddress?: string };
        socket?: { remoteAddress?: string };
        ip?: string;
    }): string {
        const realIp = req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            req.ip ||
            'unknown';

        return Array.isArray(realIp) ? realIp[0] : String(realIp);
    }

    /**
     * Create a new activity record
     */
    static async createActivity(data: CreateActivityData): Promise<IActivity> {
        try {
            const activity = new Activity({
                userId: data.userId,
                activity: data.activity,
                activityType: data.activityType,
                status: data.status || 'success',
                otherInfo: data.otherInfo,
                metadata: data.metadata || {}
            });

            const savedActivity = await activity.save();
            logger.info(`Activity created: ${data.activityType} for user ${data.userId}`);
            return savedActivity;
        } catch (error) {
            logger.error('Error creating activity:', error);
            throw error;
        }
    }

    /**
     * Get activities for a specific user
     */
    static async getUserActivities(
        userId: string,
        limit: number = 50,
        skip: number = 0
    ): Promise<{ activities: IActivity[]; total: number }> {
        try {
            const [activities, total] = await Promise.all([
                Activity.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(limit)
                    .skip(skip)
                    .populate('userId', 'username role'),
                Activity.countDocuments({ userId })
            ]);

            return { activities, total };
        } catch (error) {
            logger.error('Error fetching user activities:', error);
            throw error;
        }
    }

    /**
     * Get recent activities across all users
     */
    static async getRecentActivities(
        limit: number = 50,
        activityType?: IActivity['activityType']
    ): Promise<IActivity[]> {
        try {
            const query = activityType ? { activityType } : {};

            const activities = await Activity.find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('userId', 'username role');

            return activities;
        } catch (error) {
            logger.error('Error fetching recent activities:', error);
            throw error;
        }
    }

    /**
     * Get formatted recent activities for dashboard
     */
    static async getFormattedRecentActivities(limit: number = 10): Promise<Array<{
        id: string;
        type: string;
        title: string;
        description: string;
        time: string;
        status: string;
        amount?: string;
        user?: string;
        market?: string;
        ipAddress?: string;
        loginSource?: string;
    }>> {
        try {
            const activities = await this.getRecentActivities(limit);

            return activities.map(activity => {
                const metadata = activity.metadata || {};
                const user = activity.userId as { username?: string; role?: string } | undefined; // After populate

                return {
                    id: String(activity._id),
                    type: activity.activityType,
                    title: this.getActivityTitle(activity.activityType),
                    description: activity.activity,
                    time: this.formatTime(activity.createdAt),
                    status: activity.status,
                    amount: metadata.amount ? `₹${metadata.amount}` : undefined,
                    user: user?.username,
                    market: metadata.marketName as string | undefined,
                    ipAddress: metadata.ipAddress as string | undefined,
                    loginSource: metadata.loginSource as string | undefined
                };
            });
        } catch (error) {
            logger.error('Error fetching formatted activities:', error);
            throw error;
        }
    }

    /**
     * Helper method to get activity title
     */
    private static getActivityTitle(activityType: IActivity['activityType']): string {
        const titles: Record<string, string> = {
            login: 'User Login',
            logout: 'User Logout',
            bid: 'Bid Placed',
            win: 'Winning Bid',
            transfer: 'Point Transfer',
            registration: 'User Registration',
            balance_update: 'Balance Update',
            game_play: 'Game Play',
            market_action: 'Market Action',
            commission: 'Commission Earned',
            other: 'Other Activity'
        };
        return titles[activityType] || 'Activity';
    }

    /**
     * Helper method to format time
     */
    private static formatTime(date: Date): string {
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} days ago`;

        return date.toLocaleDateString();
    }

    /**
     * Get activities by type
     */
    static async getActivitiesByType(
        activityType: IActivity['activityType'],
        limit: number = 50
    ): Promise<IActivity[]> {
        try {
            const activities = await Activity.find({ activityType })
                .sort({ createdAt: -1 })
                .limit(limit)
                .populate('userId', 'username role');

            return activities;
        } catch (error) {
            logger.error('Error fetching activities by type:', error);
            throw error;
        }
    }

    /**
     * Get activity statistics
     */
    static async getActivityStats(userId?: string): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
    }> {
        try {
            const matchStage = userId ? { userId } : {};

            const [total, byType, byStatus] = await Promise.all([
                Activity.countDocuments(matchStage),
                Activity.aggregate([
                    { $match: matchStage },
                    { $group: { _id: '$activityType', count: { $sum: 1 } } }
                ]),
                Activity.aggregate([
                    { $match: matchStage },
                    { $group: { _id: '$status', count: { $sum: 1 } } }
                ])
            ]);

            const byTypeMap = byType.reduce((acc: Record<string, number>, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            const byStatusMap = byStatus.reduce((acc: Record<string, number>, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {});

            return { total, byType: byTypeMap, byStatus: byStatusMap };
        } catch (error) {
            logger.error('Error fetching activity stats:', error);
            throw error;
        }
    }

    /**
     * Helper method to log login activity
     */
    static async logLogin(userId: string, ipAddress?: string, userAgent?: string, loginSource?: string): Promise<IActivity> {
        return this.createActivity({
            userId,
            activity: 'User logged in successfully',
            activityType: 'login',
            status: 'success',
            metadata: {
                ipAddress,
                userAgent,
                loginSource
            }
        });
    }

    /**
     * Helper method to log logout activity
     */
    static async logLogout(userId: string, ipAddress?: string): Promise<IActivity> {
        return this.createActivity({
            userId,
            activity: 'User logged out',
            activityType: 'logout',
            status: 'success',
            metadata: {
                ipAddress
            }
        });
    }

    /**
     * Helper method to log bid activity
     */
    static async logBid(
        userId: string,
        amount: number,
        gameType: string,
        marketName: string,
        status: IActivity['status'] = 'success'
    ): Promise<IActivity> {
        return this.createActivity({
            userId,
            activity: `Bid placed on ${gameType} in ${marketName}`,
            activityType: 'bid',
            status,
            metadata: {
                amount,
                gameType,
                marketName
            }
        });
    }

    /**
     * Helper method to log win activity
     */
    static async logWin(
        userId: string,
        amount: number,
        gameType: string,
        marketName: string
    ): Promise<IActivity> {
        return this.createActivity({
            userId,
            activity: `Won ${amount} on ${gameType} in ${marketName}`,
            activityType: 'win',
            status: 'success',
            metadata: {
                amount,
                gameType,
                marketName
            }
        });
    }

    /**
     * Helper method to log transfer activity
     */
    static async logTransfer(
        fromUserId: string,
        toUserId: string,
        amount: number,
        status: IActivity['status'] = 'success'
    ): Promise<IActivity> {
        return this.createActivity({
            userId: fromUserId,
            activity: `Transferred ${amount} points to user`,
            activityType: 'transfer',
            status,
            metadata: {
                amount,
                targetUserId: new mongoose.Types.ObjectId(toUserId)
            }
        });
    }
} 