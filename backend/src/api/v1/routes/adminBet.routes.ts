import { Router, RequestHandler } from 'express';
import { AdminBetController } from '../controllers/adminBet.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const adminBetController = new AdminBetController();
const authMiddleware = new AuthMiddleware();

// Get bets with hierarchical filtering and pagination
router.get('/',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    adminBetController.getBets as unknown as RequestHandler
);

// Get specific bet details
router.get('/:betId',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    adminBetController.getBetById as unknown as RequestHandler
);

// Get hierarchy options for filtering
router.get('/hierarchy/options',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    adminBetController.getHierarchyOptions as unknown as RequestHandler
);

export default router; 