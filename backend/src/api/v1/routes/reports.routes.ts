import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { AuthMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateToken.bind(authMiddleware));

// Get hierarchical reports with drill-down capability
router.get('/hierarchical-reports', async (req, res) => {
    await ReportsController.getHierarchicalReports(req as AuthenticatedRequest, res);
});

// Get real-time bet statistics
router.get('/bet-stats', async (req, res) => {
    await ReportsController.getBetStats(req as AuthenticatedRequest, res);
});

// Debug endpoint to check bet data
router.get('/debug-bets', async (req, res) => {
    await ReportsController.debugBets(req as AuthenticatedRequest, res);
});

// Test hierarchical reports without date filter
router.get('/test-hierarchical-reports', async (req, res) => {
    await ReportsController.testHierarchicalReports(req as AuthenticatedRequest, res);
});

// Test specific player data
router.get('/test-player-data/:playerId', async (req, res) => {
    await ReportsController.testPlayerData(req as AuthenticatedRequest, res);
});

export default router;
