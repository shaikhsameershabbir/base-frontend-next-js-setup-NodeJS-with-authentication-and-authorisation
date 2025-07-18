import { Router } from 'express';
import { ActivityController } from '../controllers/activities/activityController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Get recent activities (admin only)
router.get('/recent', authenticateToken, ActivityController.getRecentActivities);

// Get formatted activities for dashboard (admin only)
router.get('/formatted', authenticateToken, ActivityController.getFormattedActivities);

// Get activities for a specific user
router.get('/user/:userId?', authenticateToken, ActivityController.getUserActivities);

// Get activities by type
router.get('/type/:type', authenticateToken, ActivityController.getActivitiesByType);

// Get activity statistics
router.get('/stats', authenticateToken, ActivityController.getActivityStats);

// Create custom activity (admin only)
router.post('/', authenticateToken, ActivityController.createActivity);

export default router; 