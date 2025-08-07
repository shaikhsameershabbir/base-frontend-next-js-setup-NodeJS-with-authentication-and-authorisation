import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { PlayerAuthMiddleware } from '../middlewares/playerAuth.middleware';
import { getMarketResults, getAllResults, getAllMarketResults } from '../controllers/result.controller';
import { declareResult } from '../controllers/declareResult.controller';

const router = Router();
const authMiddleware = new AuthMiddleware();
const playerAuthMiddleware = new PlayerAuthMiddleware();

// Admin routes
router.post('/declare', authMiddleware.authenticateToken, declareResult);
router.get('/market/:marketId', authMiddleware.authenticateToken, getMarketResults);
router.get('/all', authMiddleware.authenticateToken, getAllResults);

// Player routes
router.get('/player/market/:marketId', playerAuthMiddleware.authenticateToken, getMarketResults);
router.post('/player/markets', playerAuthMiddleware.authenticateToken, getAllMarketResults);

export default router;
