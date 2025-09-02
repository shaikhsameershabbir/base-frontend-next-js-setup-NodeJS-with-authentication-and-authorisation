import { Request, Response } from 'express';
import { Activity } from '../../../models/Activity';
import { logger } from '../../../config/logger';

export class ActivitiesController {
    async getActivities(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 10, user, action } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: any = {};

            // Filter by user if provided
            if (user) {
                query.user = user;
            }

            // Filter by action if provided
            if (action) {
                query.action = action;
            }

            const activities = await Activity.find(query)
                .populate('user', 'username')
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await Activity.countDocuments(query);

            res.json({
                success: true,
                message: 'Activities retrieved successfully',
                data: activities,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get activities error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getActivityById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;

            const activity = await Activity.findById(id)
                .populate('user', 'username');

            if (!activity) {
                res.status(404).json({
                    success: false,
                    message: 'Activity not found'
                });
                return;
            }

            res.json({
                success: true,
                message: 'Activity retrieved successfully',
                data: { activity }
            });
        } catch (error) {
            logger.error('Get activity by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }

    async getUserActivities(req: Request, res: Response): Promise<void> {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 10, action } = req.query;
            const skip = (Number(page) - 1) * Number(limit);

            const query: any = { user: userId };

            // Filter by action if provided
            if (action) {
                query.action = action;
            }

            const activities = await Activity.find(query)
                .populate('user', 'username')
                .skip(skip)
                .limit(Number(limit))
                .sort({ createdAt: -1 });

            const total = await Activity.countDocuments(query);

            res.json({
                success: true,
                message: 'User activities retrieved successfully',
                data: activities,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit))
                }
            });
        } catch (error) {
            logger.error('Get user activities error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
} 