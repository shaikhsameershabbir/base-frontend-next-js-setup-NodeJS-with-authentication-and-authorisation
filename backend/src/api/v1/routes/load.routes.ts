import { Router } from 'express';
import { getAllLoads } from '../controllers/load.controller';

const router = Router();

router.get('/getAllLoads', getAllLoads);

export default router;
