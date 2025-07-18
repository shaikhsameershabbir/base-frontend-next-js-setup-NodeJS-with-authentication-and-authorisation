import { Router } from 'express';
import { login, logout, logoutAll, refresh, loginLimiter } from '../controllers/auth/authController';
import { register } from '../controllers/auth/register';
import { authenticateToken, requireRole, setAccessibleUsers } from '../middlewares/auth';
import { createUser } from '../controllers/users/register';
import { getProfile, updateProfile } from '../controllers/users/profile';
import { getUserById, getUsers, getUsersByRole } from '../controllers/users/getuser';
import { updateUser, deleteUserAndDownline, toggleUserActive, updateUserPassword } from '../controllers/users/updateUser';
import {
    getAvailableMarketsForAssignment,
    assignMarketsToUser,
    getAssignedMarkets,
    removeMarketAssignments
} from '../controllers/markets/marketAssignmentController';
import {
    getChildUsers,
    processTransfer,
    getTransferHistory,
    getTransferStats
} from '../controllers/transfers/transferController';
import marketRoutes from './marketRoutes';

const router = Router();

// Public routes with rate limiting
router.post('/auth/login', loginLimiter, login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.post('/auth/register', register); // Public registration for new users

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/auth/logout-all', authenticateToken, logoutAll);

// Market assignment routes (must come before conflicting user routes)
router.get('/users/:userId/available-markets', authenticateToken, getAvailableMarketsForAssignment);
router.post('/users/:userId/assign-markets', authenticateToken, assignMarketsToUser);
router.get('/users/:userId/assigned-markets', authenticateToken, getAssignedMarkets);
router.post('/users/:userId/remove-markets', authenticateToken, removeMarketAssignments);

// User management routes (with role-based access)
router.get('/users', authenticateToken, setAccessibleUsers, getUsers);
router.get('/users/:role/:userId', authenticateToken, setAccessibleUsers, getUsersByRole);
router.get('/users/:userId', authenticateToken, setAccessibleUsers, getUserById);
router.put('/users/:userId', authenticateToken, setAccessibleUsers, updateUser);
router.delete('/users/:userId', authenticateToken, setAccessibleUsers, deleteUserAndDownline);
router.put('/users/:userId/active', authenticateToken, setAccessibleUsers, toggleUserActive);
router.put('/users/:userId/password', authenticateToken, setAccessibleUsers, updateUserPassword);

// User creation routes (for authenticated users creating other users)
router.post('/users/create', authenticateToken, createUser); // Generic user creation
router.post('/users/create/admin', authenticateToken, requireRole(['superadmin']), createUser);
router.post('/users/create/distributor', authenticateToken, requireRole(['superadmin', 'admin']), createUser);
router.post('/users/create/agent', authenticateToken, requireRole(['superadmin', 'admin', 'distributor']), createUser);
router.post('/users/create/player', authenticateToken, requireRole(['superadmin', 'admin', 'distributor', 'agent']), createUser);

// Market routes
router.use(marketRoutes);

// Balance transfer routes
router.get('/transfers/children', authenticateToken, getChildUsers);
router.post('/transfers/process', authenticateToken, processTransfer);
router.get('/transfers/history', authenticateToken, getTransferHistory);
router.get('/transfers/stats', authenticateToken, getTransferStats);

export default router; 