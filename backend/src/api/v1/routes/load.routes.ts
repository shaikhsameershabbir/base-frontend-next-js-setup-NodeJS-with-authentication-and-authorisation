import { Router } from 'express';
import { getAllLoads, getHierarchicalUsers, getAssignedMarkets } from '../controllers/load.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Apply authentication middleware to all load routes
router.get('/getAllLoads', authMiddleware.authenticateToken, getAllLoads);
router.get('/hierarchical-users', authMiddleware.authenticateToken, getHierarchicalUsers);
router.get('/assigned-markets', authMiddleware.authenticateToken, getAssignedMarkets);

export default router;
