// backend/src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

console.log('🔍 Environment Variables Loaded:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');
console.log('SETLISTFM_API_KEY:', process.env.SETLISTFM_API_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);


const app = express();
const PORT = Number(process.env.PORT) || 3001;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://setlist-playlist-generator-site.onrender.com',
    'https://setlist-playlist-generator-1.onrender.com'

  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req: Request, res: Response) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.get('origin'));
  next();
});

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Setlist Playlist Generator API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Setlist Playlist Generator API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Debug route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'API Routes Available',
    routes: [
      'GET /api/auth/url',
      'GET /api/auth/callback',
      'POST /api/playlist/create',
      'GET /api/setlist/search'
    ]
  });
});

// Spotify Auth Routes
app.get('/api/auth/url', (req: Request, res: Response) => {
  try {
    const scopes = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://setlist-playlist-generator.onrender.com/api/auth/callback';
    
    const authURL = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.SPOTIFY_CLIENT_ID}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}`;

    console.log('🎵 Generated auth URL:', authURL);
    res.json({ authURL });
  } catch (error: any) {
    console.error('❌ Failed to generate auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL', message: error.message });
  }
});

app.get('/api/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }

    console.log('🔄 Exchanging code for tokens...');
    
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: process.env.SPOTIFY_REDIRECT_URI || 'https://setlist-playlist-generator.onrender.com/api/auth/callback',
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET!
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token, refresh_token } = tokenResponse.data;
    
    // Redirect to frontend with tokens
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://setlist-playlist-generator-site.onrender.com'
      : 'http://localhost:3000';
    
    const redirectUrl = `${frontendUrl}/callback?access_token=${access_token}&refresh_token=${refresh_token || ''}`;
    
    console.log('✅ Redirecting to frontend with tokens');
    res.redirect(redirectUrl);
    
  } catch (error: any) {
    console.error('❌ Token exchange failed:', error.response?.data || error.message);
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://setlist-playlist-generator-site.onrender.com'
      : 'http://localhost:3000';
    res.redirect(`${frontendUrl}/callback?error=auth_failed`);
  }
});

// Setlist Search Route
app.get('/api/setlist/search', async (req: Request, res: Response) => {
  try {
    const { artist, limit = 10 } = req.query;
    
    if (!artist) {
      return res.status(400).json({ error: 'Artist parameter is required' });
    }

    console.log('🔍 Searching setlists for:', artist);
    
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/setlists`, {
      params: {
        artistName: artist,
        p: 1  // First page
      },
      headers: {
        'x-api-key': process.env.SETLISTFM_API_KEY,
        'Accept': 'application/json'
      }
    });

    const setlists = response.data.setlist || [];
    
    // Filter setlists that have songs
    const setlistsWithSongs = setlists.filter((setlist: any) => 
      setlist.sets?.set?.some((set: any) => set.song?.length > 0)
    ).slice(0, Number(limit));

    console.log('✅ Found setlists:', setlistsWithSongs.length);
    res.json(setlistsWithSongs);
    
  } catch (error: any) {
    console.error('❌ Setlist search failed:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search setlists', 
      message: error.response?.data?.message || error.message 
    });
  }
});

// Playlist Creation Route
app.post('/api/playlist/create', async (req: Request, res: Response) => {
  try {
    const { accessToken, setlist } = req.body;
    
    if (!accessToken || !setlist) {
      return res.status(400).json({ error: 'Access token and setlist are required' });
    }

    console.log('🎵 Creating playlist for setlist:', setlist.id);
    
    // Get user profile
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const userId = userResponse.data.id;
    
    // Extract songs from setlist
    const songs = setlist.sets?.set?.flatMap((set: any) => 
      set.song?.map((song: any) => song.name) || []
    ) || [];
    
    if (songs.length === 0) {
      return res.status(400).json({ error: 'No songs found in setlist' });
    }
    
    // Create playlist
    const playlistName = `${setlist.artist?.name || 'Unknown'} - ${setlist.venue?.name || 'Unknown Venue'} (${setlist.eventDate || 'Unknown Date'})`;
    
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name: playlistName,
        description: `Setlist from ${setlist.artist?.name || 'Unknown Artist'} concert`,
        public: true
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    
    const playlistId = playlistResponse.data.id;
    
    // Search and add tracks
    const trackUris: string[] = [];
    const notFoundSongs: string[] = [];
    
    for (const songName of songs) {
      try {
        const searchResponse = await axios.get('https://api.spotify.com/v1/search', {
          params: {
            q: `track:"${songName}" artist:"${setlist.artist?.name || ''}"`,
            type: 'track',
            limit: 1
          },
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const tracks = searchResponse.data.tracks?.items;
        if (tracks && tracks.length > 0) {
          trackUris.push(tracks[0].uri);
        } else {
          notFoundSongs.push(songName);
        }
      } catch (searchError) {
        console.log(`Failed to find song: ${songName}`);
        notFoundSongs.push(songName);
      }
    }
    
    // Add tracks to playlist
    if (trackUris.length > 0) {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: trackUris },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
    }
    
    console.log('✅ Playlist created successfully');
    res.json({
      playlist: playlistResponse.data,
      tracksAdded: trackUris.length,
      totalSongs: songs.length,
      notFoundSongs
    });
    
  } catch (error: any) {
    console.error('❌ Playlist creation failed:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to create playlist', 
      message: error.response?.data?.message || error.message 
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req: Request, res: Response) => {
  console.log(`❌ 404 - API route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'API endpoint not found',
    method: req.method,
    path: req.path,
    available_routes: [
      'GET /api/auth/url',
      'GET /api/auth/callback',
      'POST /api/playlist/create',
      'GET /api/setlist/search'
    ]
  });
});

// Global error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Global Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 Auth URL: http://localhost:${PORT}/api/auth/url`);
  console.log(`📍 Available at: http://0.0.0.0:${PORT}`);
});