import { Request, Response } from 'express';
import SpotifyService from '../services/SpotifyService';

export const getAuthURL = (req: Request, res: Response) => {
  try {
    const authURL = SpotifyService.getAuthURL();
    res.json({ authURL });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

export const handleCallback = async (req: Request, res: Response) => {
  const { code, error, state } = req.query;
  
  console.log('=== SPOTIFY CALLBACK ===');
  console.log('Code:', code ? `${code}`.substring(0, 20) + '...' : 'Missing');
  console.log('Error:', error);
  console.log('State:', state);
  
  if (error) {
    console.error('Spotify authorization error:', error);
    return res.status(400).json({ error: 'Authorization denied by user' });
  }
  
  if (!code) {
    console.error('No authorization code provided');
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    console.log('🔄 Attempting token exchange...');
    const tokenData = await SpotifyService.getAccessToken(code as string);
    console.log('✅ Token exchange successful');
    console.log('Access token received:', tokenData.access_token ? 'Yes' : 'No');
    res.json(tokenData);
  } catch (error: any) {
    console.error('❌ Token exchange failed:', error.message);
    console.error('Full error:', error);
    
    if (error.message && error.message.includes('invalid_grant')) {
      res.status(400).json({ 
        error: 'invalid_grant',
        message: 'Authorization code expired or already used. Please try logging in again.' 
      });
    } else {
      res.status(500).json({ 
        error: 'token_exchange_failed',
        message: 'Failed to exchange code for token'
      });
    }
  }
};