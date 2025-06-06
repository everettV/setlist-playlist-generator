import { Request, Response } from 'express';
import SetlistService from '../services/SetlistService';

export const getSetlists = async (req: Request, res: Response) => {
  const { artist, limit } = req.query;
  
  try {
    const setlists = await SetlistService.getArtistSetlists(
      artist as string, 
      parseInt(limit as string) || 10
    );
    res.json(setlists);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
};