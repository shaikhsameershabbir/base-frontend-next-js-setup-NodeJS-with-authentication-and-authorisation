import { Router } from 'express';
import { ActivitiesController } from '../controllers/activities.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const activitiesController = new ActivitiesController();
const authMiddleware = new AuthMiddleware();

// Activity routes
router.get('/',
    authMiddleware.authenticateToken,
    activitiesController.getActivities
);

router.get('/:id',
    authMiddleware.authenticateToken,
    activitiesController.getActivityById
);

router.get('/user/:userId',
    authMiddleware.authenticateToken,
    activitiesController.getUserActivities
);

export default router; 