// backend/src/controllers/authController.ts
import { Request, Response } from 'express';
import { SpotifyService } from '../services/SpotifyService';

const spotifyService = new SpotifyService();

export const getAuthURL = (req: Request, res: Response): void => {
  try {
    console.log('🎯 Auth URL requested');
    const authURL = spotifyService.getAuthURL();
    console.log('✅ Auth URL generated successfully');
    
    res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.json({ authURL });
  } catch (error: any) {
    console.error('❌ Failed to generate auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL', details: error.message });
  }
};

export const handleCallback = async (req: Request, res: Response): Promise<void> => {
  const { code, error, state } = req.query;
  
  console.log('=== SPOTIFY CALLBACK ===');
  console.log('Code:', code ? `${code}`.substring(0, 20) + '...' : 'Missing');
  console.log('Error:', error);
  
  res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (error) {
    console.error('Spotify authorization error:', error);
    res.status(400).json({ error: 'Authorization denied by user' });
    return;
  }
  
  if (!code || typeof code !== 'string') {
    console.error('No authorization code provided');
    res.status(400).json({ error: 'No authorization code provided' });
    return;
  }
  
  try {
    const tokenData = await spotifyService.getAccessToken(code);
    console.log('✅ Token exchange successful');
    res.json(tokenData);
  } catch (error: any) {
    console.error('❌ Token exchange failed:', error.message);
    res.status(500).json({ 
      error: 'token_exchange_failed',
      message: 'Failed to exchange code for token',
      details: error.message
    });
  }
};