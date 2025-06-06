import express from 'express';
import { getSetlists } from '../controllers/setlistController';

const router = express.Router();

router.get('/search', getSetlists);

export default router;