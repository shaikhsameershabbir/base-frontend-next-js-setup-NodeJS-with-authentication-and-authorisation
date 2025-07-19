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
    authMiddleware.setAccessibleUsers,
    usersController.getUsers
);

router.get('/:role/:userId',
    authMiddleware.authenticateToken,
    authMiddleware.setAccessibleUsers,
    usersController.getUsersByRole
);

router.get('/:userId',
    authMiddleware.authenticateToken,
    authMiddleware.setAccessibleUsers,
    usersController.getUserById
);

router.put('/:userId',
    authMiddleware.authenticateToken,
    authMiddleware.setAccessibleUsers,
    usersValidator.validateUserUpdate,
    usersController.updateUser
);

router.delete('/:userId',
    authMiddleware.authenticateToken,
    authMiddleware.setAccessibleUsers,
    usersController.deleteUserAndDownline
);

router.put('/:userId/active',
    authMiddleware.authenticateToken,
    authMiddleware.setAccessibleUsers,
    usersController.toggleUserActive
);

router.put('/:userId/password',
    authMiddleware.authenticateToken,
    authMiddleware.setAccessibleUsers,
    usersValidator.validatePasswordUpdate,
    usersController.updateUserPassword
);

// User creation routes (for authenticated users creating other users)
router.post('/create',
    authMiddleware.authenticateToken,
    usersValidator.validateUserCreation,
    usersController.createUser
);

router.post('/create/admin',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin']),
    usersValidator.validateUserCreation,
    usersController.createUser
);

router.post('/create/distributor',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin']),
    usersValidator.validateUserCreation,
    usersController.createUser
);

router.post('/create/agent',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin', 'distributor']),
    usersValidator.validateUserCreation,
    usersController.createUser
);

router.post('/create/player',
    authMiddleware.authenticateToken,
    authMiddleware.requireRole(['superadmin', 'admin', 'distributor', 'agent']),
    usersValidator.validateUserCreation,
    usersController.createUser
);

// Market assignment routes
router.get('/:userId/available-markets',
    authMiddleware.authenticateToken,
    usersController.getAvailableMarketsForAssignment
);

router.post('/:userId/assign-markets',
    authMiddleware.authenticateToken,
    usersValidator.validateMarketAssignment,
    usersController.assignMarketsToUser
);

router.get('/:userId/assigned-markets',
    authMiddleware.authenticateToken,
    usersController.getAssignedMarkets
);

router.post('/:userId/remove-markets',
    authMiddleware.authenticateToken,
    usersValidator.validateMarketRemoval,
    usersController.removeMarketAssignments
);

export default router; 