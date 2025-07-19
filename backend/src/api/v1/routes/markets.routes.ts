import { Router } from 'express';
import { MarketsController } from '../controllers/markets.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { MarketsValidator } from '../validators/markets.validator';

const router = Router();
const marketsController = new MarketsController();
const authMiddleware = new AuthMiddleware();
const marketsValidator = new MarketsValidator();

// Market management routes
router.get('/',
    authMiddleware.authenticateToken,
    marketsController.getAllMarkets
);

router.get('/:id',
    authMiddleware.authenticateToken,
    marketsController.getMarketById
);

router.post('/',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    marketsValidator.validateMarketCreation,
    marketsController.createMarket
);

router.put('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    marketsValidator.validateMarketUpdate,
    marketsController.updateMarket
);

router.delete('/:id',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    marketsController.deleteMarket
);

// Market status routes
router.put('/:id/status',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    // marketsValidator.validateStatusUpdate,
    marketsController.updateMarketStatus
);

export default router; 