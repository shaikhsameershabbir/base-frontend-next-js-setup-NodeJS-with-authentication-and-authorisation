import { Request, Response } from 'express';
import { ActivityService } from '../../services/activityService';
import { logger } from '../../config/logger';
import { AuthenticatedRequest } from '../../middlewares/auth';



export class ActivityController {
    /**
     * Get recent activities for admin dashboard
     */
    static async getRecentActivities(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 50;
            const activityType = req.query.type as string;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activities = await ActivityService.getRecentActivities(limit, activityType as any);

            res.json({
                success: true,
                message: 'Recent activities retrieved successfully',
                data: { activities }
            });
        } catch (error) {
            logger.error('Error fetching recent activities:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch recent activities'
            });
        }
    }

    /**
     * Get formatted recent activities for admin dashboard
     */
    static async getFormattedActivities(req: Request, res: Response): Promise<void> {
        try {
            const limit = parseInt(req.query.limit as string) || 10;

            const activities = await ActivityService.getFormattedRecentActivities(limit);

            res.json({
                success: true,
                message: 'Formatted activities retrieved successfully',
                data: { activities }
            });
        } catch (error) {
            logger.error('Error fetching formatted activities:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch formatted activities'
            });
        }
    }

    /**
     * Get activities for a specific user
     */
    static async getUserActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.params.userId || req.user?.userId;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const skip = (page - 1) * limit;

            if (!userId) {
                res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
                return;
            }

            const { activities, total } = await ActivityService.getUserActivities(userId, limit, skip);

            res.json({
                success: true,
                message: 'User activities retrieved successfully',
                data: {
                    activities,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            logger.error('Error fetching user activities:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch user activities'
            });
        }
    }

    /**
     * Get activities by type
     */
    static async getActivitiesByType(req: Request, res: Response): Promise<void> {
        try {
            const { type } = req.params;
            const limit = parseInt(req.query.limit as string) || 50;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const activities = await ActivityService.getActivitiesByType(type as any, limit);

            res.json({
                success: true,
                message: 'Activities retrieved successfully',
                data: { activities }
            });
        } catch (error) {
            logger.error('Error fetching activities by type:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch activities'
            });
        }
    }

    /**
     * Get activity statistics
     */
    static async getActivityStats(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.query.userId as string;
            const stats = await ActivityService.getActivityStats(userId);

            res.json({
                success: true,
                message: 'Activity statistics retrieved successfully',
                data: { stats }
            });
        } catch (error) {
            logger.error('Error fetching activity stats:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch activity statistics'
            });
        }
    }

    /**
     * Create a custom activity (for admin use)
     */
    static async createActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const { userId, activity, activityType, status, otherInfo, metadata } = req.body;

            if (!userId || !activity || !activityType) {
                res.status(400).json({
                    success: false,
                    message: 'userId, activity, and activityType are required'
                });
                return;
            }

            const newActivity = await ActivityService.createActivity({
                userId,
                activity,
                activityType,
                status,
                otherInfo,
                metadata
            });

            res.status(201).json({
                success: true,
                message: 'Activity created successfully',
                data: { activity: newActivity }
            });
        } catch (error) {
            logger.error('Error creating activity:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to create activity'
            });
        }
    }
} 