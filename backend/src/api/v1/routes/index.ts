import { Router } from 'express';
import authRoutes from './auth.routes';
import usersRoutes from './users.routes';
import marketsRoutes from './markets.routes';
import transfersRoutes from './transfers.routes';
import activitiesRoutes from './activities.routes';
import playerRoutes from './player.routes';
import betRoutes from './bet.routes';
import adminBetRoutes from './adminBet.routes';

const router = Router();

// API version prefix


// Mount all routes
router.use(`/auth`, authRoutes);
router.use(`/users`, usersRoutes);
router.use(`/markets`, marketsRoutes);
router.use(`/transfers`, transfersRoutes);
router.use(`/activities`, activitiesRoutes);
router.use(`/player`, playerRoutes);
router.use(`/bets`, betRoutes);
router.use(`/admin/bets`, adminBetRoutes);

export default router; 