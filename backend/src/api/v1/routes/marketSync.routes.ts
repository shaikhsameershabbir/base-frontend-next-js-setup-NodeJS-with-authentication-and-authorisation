import { Router } from 'express';
import { MarketSyncController } from '../controllers/marketSync.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';


const router = Router();
const marketSyncController = new MarketSyncController();
const authMiddleware = new AuthMiddleware();

// Market sync routes - only accessible by superadmin and admin
router.post('/sync',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    marketSyncController.syncMarkets
);

router.get('/status',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    marketSyncController.getSyncStatus
);

router.get('/cron/status',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    marketSyncController.getCronStatus
);

router.post('/cron/restart',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    marketSyncController.restartCronJobs
);

router.post('/cron/stop',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    marketSyncController.stopCronJobs
);

export default router;
