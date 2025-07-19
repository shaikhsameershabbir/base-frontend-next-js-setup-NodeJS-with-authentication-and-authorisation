import { Router } from 'express';
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
    playerController.getProfile
);

router.put('/profile',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validateProfileUpdate,
    playerController.updateProfile
);

// Get player's assigned markets
router.get('/assigned-markets',
    playerAuthMiddleware.authenticatePlayer,
    playerController.getAssignedMarkets
);

// Bid confirmation routes
router.post('/confirm-bid',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validateBidConfirmation,
    playerController.confirmBid
);

export default router; 