// backend/src/routes/setlist.ts
import { Router } from 'express';
import { searchSetlists } from '../controllers/setlistController';

const router = Router();

router.get('/search', searchSetlists);

export default router;