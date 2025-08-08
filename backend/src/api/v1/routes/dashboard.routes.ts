import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();
const authMiddleware = new AuthMiddleware();

// Get dashboard statistics for current user
router.get('/stats', authMiddleware.authenticateToken, dashboardController.getDashboardStats);

export default router;
