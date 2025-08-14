import { Router } from 'express';
import { ClaimController } from '../controllers/claim.controller';
import { AuthMiddleware, AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();
const authMiddleware = new AuthMiddleware();

// Apply authentication middleware to all routes
router.use(authMiddleware.authenticateToken.bind(authMiddleware));

// Get unclaimed tickets for the current user
router.get('/tickets', async (req, res) => {
    await ClaimController.getUnclaimedTickets(req as AuthenticatedRequest, res);
});

// Claim winning tickets
router.post('/claim', async (req, res) => {
    await ClaimController.claimTickets(req as AuthenticatedRequest, res);
});

// Get claim summary
router.get('/summary', async (req, res) => {
    await ClaimController.getClaimSummary(req as AuthenticatedRequest, res);
});

export default router;
