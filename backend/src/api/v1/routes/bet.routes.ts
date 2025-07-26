import { Router, RequestHandler } from 'express';
import { BetController } from '../controllers/bet.controller';
import { PlayerAuthMiddleware } from '../middlewares/playerAuth.middleware';
import { PlayerValidator } from '../validators/player.validator';

const router = Router();
const betController = new BetController();
const playerAuthMiddleware = new PlayerAuthMiddleware();
const playerValidator = new PlayerValidator();

// Bet placement route (require player authentication)
router.post('/place-bet',
    playerAuthMiddleware.authenticatePlayer,
    playerValidator.validatePlaceBet,
    betController.placeBet as unknown as RequestHandler
);
// bet routes for amdin start here like history eyc 

export default router; 