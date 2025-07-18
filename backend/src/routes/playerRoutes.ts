import { Router, Request, Response } from 'express';
import { authenticatePlayer, checkPlayerRole } from '../middlewares/playerAuth';
import { getProfile, updateProfile } from '../controllers/users/profile';
import { ActivityService } from '../services/activityService';

// Extend Request interface to include user
interface PlayerRequest extends Request {
    user?: {
        userId: string;
        username: string;
        balance: number;
        role: string;
        parentId?: string;
    };
}

const router = Router();

// Player-specific routes (require player authentication)
router.get('/profile', authenticatePlayer, getProfile);
router.put('/profile', authenticatePlayer, updateProfile);

// Get player's own activities
router.get('/activities', authenticatePlayer, async (req: PlayerRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const { activities, total } = await ActivityService.getUserActivities(
            req.user!.userId,
            limit,
            skip
        );

        res.json({
            success: true,
            message: 'Player activities retrieved successfully',
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
        res.status(500).json({
            success: false,
            message: 'Failed to fetch player activities'
        });
    }
});

// Get player's activity statistics
router.get('/activities/stats', authenticatePlayer, async (req: PlayerRequest, res: Response) => {
    try {
        const stats = await ActivityService.getActivityStats(req.user!.userId);

        res.json({
            success: true,
            message: 'Player activity statistics retrieved successfully',
            data: { stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch player activity statistics'
        });
    }
});

// Optional routes (can be accessed without authentication)
router.get('/public/info', checkPlayerRole, (req: PlayerRequest, res: Response) => {
    res.json({
        success: true,
        message: 'Public player information',
        data: {
            isAuthenticated: !!req.user,
            user: req.user ? {
                username: req.user.username,
                balance: req.user.balance,
                role: req.user.role
            } : null
        }
    });
});

export default router; 