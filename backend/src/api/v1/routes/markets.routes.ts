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

router.get('/all',
    authMiddleware.authenticateToken,
    marketsController.getAllMarketsWithoutPagination
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

// Market golden status routes
router.put('/:id/golden',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    marketsController.toggleGoldenStatus
);

// Market auto result routes
router.put('/:id/auto-result',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    marketsController.toggleAutoResult
);

// Market ranking routes
router.get('/ranks/admins',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    marketsController.getAdminsWithMarkets
);

router.get('/ranks/:userId',
    authMiddleware.authenticateToken,
    marketsController.getMarketRanks
);

router.put('/ranks/:userId/:marketId',
    authMiddleware.authenticateToken,
    marketsController.updateMarketRank
);

export default router; 