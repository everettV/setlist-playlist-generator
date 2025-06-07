// backend/src/routes/auth.ts
import { Router } from 'express';
import { getAuthURL, handleCallback } from '../controllers/authController';

const router = Router();

router.get('/url', getAuthURL);
router.get('/callback', handleCallback);

export default router;