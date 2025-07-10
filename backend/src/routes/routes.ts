import { Router } from 'express';
import { login, logout, logoutAll, refresh, loginLimiter } from '../controllers/auth/authController';
import { authenticateToken, requireRole, setAccessibleUsers } from '../middlewares/auth';
import { register } from '../controllers/users/register';
import { getProfile, updateProfile } from '../controllers/users/profile';
import { getUserById, getUsers, getUsersByRole } from '../controllers/users/getuser';
import { updateUser } from '../controllers/users/updateUser';


const router = Router();

// Public routes with rate limiting
router.post('/auth/login', loginLimiter, login);
router.post('/auth/refresh', refresh);
router.post('/auth/logout', logout);
router.post('/register', register);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.post('/auth/logout-all', authenticateToken, logoutAll);

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