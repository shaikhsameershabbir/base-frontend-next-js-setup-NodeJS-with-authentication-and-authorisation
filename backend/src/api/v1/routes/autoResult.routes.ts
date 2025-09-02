import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { AutoResultController } from '../controllers/autoResult.controller';

const router = Router();
const authMiddleware = new AuthMiddleware();
const autoResultController = new AutoResultController();

// All routes require authentication and superadmin role
router.use(authMiddleware.authenticateToken);
router.use(authMiddleware.requireRole(['superadmin']));

// Auto result service management
router.get('/status', autoResultController.getStatus);
router.post('/start', autoResultController.startService);
router.post('/stop', autoResultController.stopService);
router.post('/restart', autoResultController.restartService);

// Market management
router.post('/market/:marketId/add', autoResultController.addMarket);
router.delete('/market/:marketId/remove', autoResultController.removeMarket);

// Logs and monitoring
router.get('/market/:marketId/logs', autoResultController.getMarketLogs);
router.get('/logs', autoResultController.getAllLogs);

export default router;
