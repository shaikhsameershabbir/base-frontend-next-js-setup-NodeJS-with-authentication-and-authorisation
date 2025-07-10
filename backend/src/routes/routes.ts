import { Router } from 'express';
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    getUsers,
    getUserById,
    updateUser,
    getUsersByRole
} from '../controllers/authController';
import { authenticateToken, requireRole, setAccessibleUsers } from '../middlewares/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);

// User management routes (with role-based access)
router.get('/users', authenticateToken, setAccessibleUsers, getUsers);
router.get('/users/:role/:userId', authenticateToken, setAccessibleUsers, getUsersByRole);
router.get('/users/:userId', authenticateToken, setAccessibleUsers, getUserById);
router.put('/users/:userId', authenticateToken, setAccessibleUsers, updateUser);

// Role-specific routes
router.post('/register/admin', authenticateToken, requireRole(['superadmin']), register);
router.post('/register/distributor', authenticateToken, requireRole(['admin']), register);
router.post('/register/player', authenticateToken, requireRole(['distributor']), register);

export default router; 