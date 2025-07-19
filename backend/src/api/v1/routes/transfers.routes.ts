import { Router } from 'express';
import { TransfersController } from '../controllers/transfers.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { TransfersValidator } from '../validators/transfers.validator';

const router = Router();
const transfersController = new TransfersController();
const authMiddleware = new AuthMiddleware();
const transfersValidator = new TransfersValidator();

// Balance transfer routes
router.get('/children',
    authMiddleware.authenticateToken,
    transfersController.getChildUsers
);

router.post('/process',
    authMiddleware.authenticateToken,
    transfersValidator.validateTransfer,
    transfersController.processTransfer
);

router.get('/history',
    authMiddleware.authenticateToken,
    transfersController.getTransferHistory
);

router.get('/stats',
    authMiddleware.authenticateToken,
    transfersController.getTransferStats
);

export default router; 