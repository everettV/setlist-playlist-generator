// backend/src/routes/playlist.ts
import { Router } from 'express';
import { createPlaylist } from '../controllers/playlistController';

const router = Router();

router.post('/create', createPlaylist);

export default router;