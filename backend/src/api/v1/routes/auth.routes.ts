import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RateLimiterMiddleware } from '../middlewares/rateLimiter.middleware';
import { AuthValidator } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();
const rateLimiterMiddleware = new RateLimiterMiddleware();
const authValidator = new AuthValidator();

// Public routes with rate limiting
router.post('/login',
    rateLimiterMiddleware.loginLimiter,
    authValidator.validateLogin,
    authController.login
);

router.post('/refresh',
    authValidator.validateRefreshToken,
    authController.refresh
);

router.post('/logout',
    authController.logout
);

router.post('/register',
    authValidator.validateRegister,
    authController.register
);

// Protected routes
router.get('/profile',
    authMiddleware.authenticateToken,
    authController.getProfile
);

router.put('/profile',
    authMiddleware.authenticateToken,
    authValidator.validateProfileUpdate,
    authController.updateProfile
);

router.post('/logout-all',
    authMiddleware.authenticateToken,
    authController.logoutAll
);

export default router; 