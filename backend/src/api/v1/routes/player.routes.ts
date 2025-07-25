import { Router, RequestHandler } from 'express';
import { PlayerController } from '../controllers/player.controller';
import { PlayerAuthMiddleware } from '../middlewares/playerAuth.middleware';
import { PlayerValidator } from '../validators/player.validator';

const router = Router();
const playerController = new PlayerController();
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
    playerController.getAssignedMarkets as unknown as RequestHandler
);

// Bet-related routes
router.post('/place-bet',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validatePlaceBet,
    playerController.placeBet as unknown as RequestHandler
);

router.get('/bet-history',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getBetHistory as unknown as RequestHandler
);

router.get('/bet/:betId',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getBetById as unknown as RequestHandler
);

// Bid confirmation routes (legacy - can be removed later)
router.post('/confirm-bet',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validateBidConfirmation,
    playerController.confirmBet as unknown as RequestHandler
);

export default router; 