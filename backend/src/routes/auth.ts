import express from 'express';
import { getAuthURL, handleCallback } from '../controllers/authController';

const router = express.Router();

router.get('/url', getAuthURL);
router.get('/callback', handleCallback);

export default router;