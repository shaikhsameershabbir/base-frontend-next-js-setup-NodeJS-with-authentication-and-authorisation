import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateToken.bind(authMiddleware));

// Get comprehensive bet reports
router.get('/bet-reports', async (req, res) => {
    await ReportsController.getBetReports(req, res);
});

// Get real-time bet statistics
router.get('/bet-stats', async (req, res) => {
    await ReportsController.getBetStats(req, res);
});

export default router;
