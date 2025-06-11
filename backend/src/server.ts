import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'Cache-Control',
    'Pragma',
    'Expires'
  ]
}));

app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  console.log('📊 Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Artist search endpoint (working)
app.get('/api/artists/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    console.log('🔍 Artist search requested for:', q);
    
    if (!q || typeof q !== 'string') {
      console.log('❌ No query provided');
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const mockArtists = [
      {
        mbid: 'khruangbin-123',
        name: 'Khruangbin',
        sortName: 'Khruangbin',
        disambiguation: 'Thai funk trio from Texas',
        source: 'musicbrainz',
        verified: true
      },
      {
        mbid: 'beatles-456', 
        name: 'The Beatles',
        sortName: 'Beatles, The',
        disambiguation: 'Legendary British rock band',
        source: 'musicbrainz',
        verified: true
      },
      {
        mbid: 'zeppelin-789',
        name: 'Led Zeppelin',
        sortName: 'Led Zeppelin',
        disambiguation: 'British rock band',
        source: 'musicbrainz',
        verified: true
      }
    ].filter(artist => 
      artist.name.toLowerCase().includes(q.toLowerCase()) ||
      q.toLowerCase().includes(artist.name.toLowerCase().substring(0, 3))
    );

    console.log('✅ Returning artists:', mockArtists.length, 'for query:', q);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({ artists: mockArtists });
    
  } catch (error) {
    console.error('❌ Error in artist search:', error);
    res.status(500).json({ error: 'Failed to search artists' });
  }
});

// Spotify Auth URL endpoint
app.get('/api/auth/url', (req: Request, res: Response) => {
  try {
    console.log('🎵 Spotify auth URL requested');
    
    // Mock Spotify auth URL for now - replace with real Spotify integration
    const clientId = process.env.SPOTIFY_CLIENT_ID || 'your_spotify_client_id';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';
    const scope = 'playlist-modify-public playlist-modify-private';
    
    const authURL = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `scope=${encodeURIComponent(scope)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${Math.random().toString(36).substring(7)}`;
    
    console.log('✅ Generated auth URL');
    res.json({ authURL });
    
  } catch (error) {
    console.error('❌ Error generating auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Spotify Auth Callback endpoint
app.get('/api/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    console.log('🎵 Spotify auth callback received');
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }
    
    // Mock token exchange - replace with real Spotify token exchange
    const mockToken = 'mock_access_token_' + Date.now();
    
    console.log('✅ Mock token generated');
    res.json({ 
      access_token: mockToken,
      refresh_token: 'mock_refresh_token',
      expires_in: 3600
    });
    
  } catch (error) {
    console.error('❌ Error in auth callback:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Create Playlist endpoint
app.post('/api/create-playlist', async (req: Request, res: Response) => {
  try {
    const { artistName, platform, artistMbid, accessToken } = req.body;
    console.log('🎵 Playlist creation requested for:', artistName, 'on', platform);
    
    if (!artistName) {
      return res.status(400).json({ error: 'Artist name required' });
    }
    
    if (platform === 'spotify' && !accessToken) {
      return res.status(401).json({ error: 'Spotify access token required' });
    }
    
    // Mock playlist creation - replace with real implementation
    const mockPlaylist = {
      id: 'mock_playlist_' + Date.now(),
      name: `${artistName} Setlist`,
      external_urls: {
        spotify: 'https://open.spotify.com/playlist/mock'
      }
    };
    
    console.log('✅ Mock playlist created');
    res.json({
      playlist: mockPlaylist,
      tracksAdded: 15,
      totalSongs: 18,
      notFoundSongs: ['Song 1', 'Song 2', 'Song 3'],
      playlistUrl: mockPlaylist.external_urls.spotify
    });
    
  } catch (error) {
    console.error('❌ Error creating playlist:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔗 CORS enabled for: http://localhost:3000 and http://127.0.0.1:3000`);
  console.log(`📡 Health check: http://localhost:${port}/health`);
  console.log(`🔍 Artist search: http://localhost:${port}/api/artists/search?q=test`);
  console.log(`🎵 Spotify auth: http://localhost:${port}/api/auth/url`);
});
