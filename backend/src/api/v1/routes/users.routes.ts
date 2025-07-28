import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UsersValidator } from '../validators/users.validator';

const router = Router();
const usersController = new UsersController();
const authMiddleware = new AuthMiddleware();
const usersValidator = new UsersValidator();

// User management routes (with role-based access)
router.get('/',
    authMiddleware.authenticateToken,

    usersController.getUsers
);

// User creation route (for authenticated users creating other users)
router.post('/create',
    authMiddleware.authenticateToken,
    usersValidator.validateUserCreation,
    usersController.createUser
);

// Market assignment routes - allow all roles except player to assign markets
// These must come BEFORE the /:userId routes to avoid route conflicts
router.get('/:userId/available-markets',
    authMiddleware.authenticateToken,

    // authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    usersController.getAvailableMarketsForAssignment
);

router.post('/:userId/assign-markets',
    authMiddleware.authenticateToken,

    // authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    usersValidator.validateMarketAssignment,
    usersController.assignMarketsToUser
);

router.get('/:userId/assigned-markets',
    authMiddleware.authenticateToken,

    // authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    usersController.getAssignedMarkets
);

router.post('/:userId/remove-markets',
    authMiddleware.authenticateToken,

    // authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    usersValidator.validateMarketRemoval,
    usersController.removeMarketAssignments
);

router.put('/:userId/active',
    authMiddleware.authenticateToken,

    usersController.toggleUserActive
);

router.put('/:userId/password',
    authMiddleware.authenticateToken,

    usersValidator.validatePasswordUpdate,
    usersController.updateUserPassword
);

// Role-specific user route - must come after the /:userId/* routes
router.get('/:role/:userId',
    authMiddleware.authenticateToken,

    usersController.getUsersByRole
);

// General user routes - must come last to avoid conflicts
router.get('/:userId',
    authMiddleware.authenticateToken,

    usersController.getUserById
);

router.put('/:userId',
    authMiddleware.authenticateToken,

    usersValidator.validateUserUpdate,
    usersController.updateUser
);

router.delete('/:userId',
    authMiddleware.authenticateToken,
    usersController.deleteUserAndDownline
);

export default router; 