import express from 'express';
import { createPlaylistFromSetlist } from '../controllers/playlistController';

const router = express.Router();

router.post('/create', createPlaylistFromSetlist);

export default router;