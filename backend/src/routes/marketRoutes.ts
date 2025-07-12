import { Router } from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth';
import {
    getMarkets, createMarket, updateMarket, deleteMarket, toggleMarketActive
} from '../controllers/markets/marketController';

const router = Router();

router.get('/markets', authenticateToken, getMarkets);
router.post('/markets', authenticateToken, requireRole(['admin', 'superadmin']), createMarket);
router.put('/markets/:marketId', authenticateToken, requireRole(['admin', 'superadmin']), updateMarket);
router.delete('/markets/:marketId', authenticateToken, requireRole(['admin', 'superadmin']), deleteMarket);
router.put('/markets/:marketId/active', authenticateToken, requireRole(['admin', 'superadmin']), toggleMarketActive);

export default router; 