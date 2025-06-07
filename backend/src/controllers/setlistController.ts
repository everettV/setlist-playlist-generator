// backend/src/controllers/setlistController.ts
import { Request, Response } from 'express';
import { SetlistService } from '../services/SetlistService';

const setlistService = new SetlistService();

export const searchSetlists = async (req: Request, res: Response): Promise<void> => {
  const { artist, limit } = req.query;
  
  if (!artist || typeof artist !== 'string') {
    res.status(400).json({ error: 'Artist parameter is required' });
    return;
  }
  
  try {
    const setlists = await setlistService.getArtistSetlists(artist, parseInt(limit as string) || 10);
    res.json(setlists);
  } catch (error: any) {
    console.error('Setlist search error:', error);
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
};