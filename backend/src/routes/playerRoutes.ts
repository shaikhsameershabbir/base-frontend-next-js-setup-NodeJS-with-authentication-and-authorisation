import { Router } from 'express';
import { authenticatePlayer } from '../middlewares/playerAuth';
import { getProfile, updateProfile } from '../controllers/users/profile';

import { getAssignedMarketsForAuthenticatedUser } from '../controllers/markets/marketAssignmentController';



const router = Router();

// Player-specific routes (require player authentication)
router.get('/profile', authenticatePlayer, getProfile);
router.put('/profile', authenticatePlayer, updateProfile);

// Get player's assigned markets
router.get('/assigned-markets', authenticatePlayer, getAssignedMarketsForAuthenticatedUser);



// confirmbid 

export default router; 