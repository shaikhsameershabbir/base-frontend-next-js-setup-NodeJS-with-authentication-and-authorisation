import { Router, RequestHandler } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { MarketAssignmentController } from '../controllers/marketAssignment.controller';
import { TransfersController } from '../controllers/transfers.controller';
import { PlayerAuthMiddleware } from '../middlewares/playerAuth.middleware';
import { PlayerValidator } from '../validators/player.validator';

const router = Router();
const playerController = new PlayerController();
const marketAssignmentController = new MarketAssignmentController();
const transfersController = new TransfersController();
const playerAuthMiddleware = new PlayerAuthMiddleware();
const playerValidator = new PlayerValidator();

// Player-specific routes (require player authentication)
router.get('/profile',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getProfile as unknown as RequestHandler
);

router.put('/profile',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validateProfileUpdate,
    playerController.updateProfile as unknown as RequestHandler
);

// Get player's assigned markets
router.get('/assigned-markets',
    playerAuthMiddleware.authenticatePlayer,
    marketAssignmentController.getAssignedMarkets as unknown as RequestHandler
);

// Bet-related routes (except placeBet which is in bet controller)
router.get('/bet-history',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getBetHistory as unknown as RequestHandler
);

router.get('/bet/:betId',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getBetById as unknown as RequestHandler
);

router.post('/bet/:betId/cancel',
    playerAuthMiddleware.authenticatePlayer,
    playerController.cancelBet as unknown as RequestHandler
);

router.get('/bet-stats',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getBetStats as unknown as RequestHandler
);

// Time and market status routes
router.get('/current-time',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getCurrentTime as unknown as RequestHandler
);

router.get('/market/:marketId/status',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getMarketStatus as unknown as RequestHandler
);

// Bid confirmation routes (legacy - can be removed later)
router.post('/confirm-bet',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validateBidConfirmation,
    playerController.confirmBet as unknown as RequestHandler
);

// Transfer-related routes
router.get('/transfer-history',
    playerAuthMiddleware.authenticatePlayer,
    transfersController.getTransferHistory as unknown as RequestHandler
);

router.get('/transfer-stats',
    playerAuthMiddleware.authenticatePlayer,
    transfersController.getTransferStats as unknown as RequestHandler
);

export default router; 