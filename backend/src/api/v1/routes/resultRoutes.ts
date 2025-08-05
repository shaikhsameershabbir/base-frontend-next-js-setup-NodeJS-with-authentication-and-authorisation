import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { declareResult, getMarketResults, getAllResults } from '../controllers/result.controller';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Apply authentication middleware to all result routes
router.post('/declare', authMiddleware.authenticateToken, declareResult);
router.get('/market/:marketId', authMiddleware.authenticateToken, getMarketResults);
router.get('/all', authMiddleware.authenticateToken, getAllResults);

export default router;
