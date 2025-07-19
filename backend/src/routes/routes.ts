import { Router } from 'express';
import { login, logout, logoutAll, refresh, loginLimiter } from '../controllers/auth/authController';
import { register } from '../controllers/auth/register';
import { authenticateToken } from '../middlewares/auth';
import marketRoutes from './marketRoutes';
import activityRoutes from './activityRoutes';
import playerRoutes from './playerRoutes';

// Import API v1 routes
import authRoutes from '../api/v1/routes/auth.routes';
import usersRoutes from '../api/v1/routes/users.routes';
import marketsRoutes from '../api/v1/routes/markets.routes';
import transfersRoutes from '../api/v1/routes/transfers.routes';
import activitiesRoutes from '../api/v1/routes/activities.routes';

const router = Router();

// Public routes with rate limiting
router.post('/auth/login', loginLimiter, login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.post('/auth/register', register); // Public registration for new users

// Legacy routes (keeping for backward compatibility)
router.post('/auth/logout-all', authenticateToken, logoutAll);

// Legacy market routes
router.use(marketRoutes);

// Legacy activity routes
router.use('/activities', activityRoutes);

// Legacy player routes (for web application)
router.use('/player', playerRoutes);

// API v1 routes (new structure)
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/users', usersRoutes);
router.use('/api/v1/markets', marketsRoutes);
router.use('/api/v1/transfers', transfersRoutes);
router.use('/api/v1/activities', activitiesRoutes);

export default router; 