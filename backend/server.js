const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

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
    'https://setlist-playlist-generator-site.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.get('origin'));
  next();
});

// Spotify Service Class
class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://setlist-playlist-generator-site.onrender.com/callback';
    this.accessToken = '';
    
    console.log('🔍 Initializing Spotify Service:');
    console.log('Client ID:', this.clientId ? 'Present' : 'Missing');
    console.log('Client Secret:', this.clientSecret ? 'Present' : 'Missing');
    console.log('Redirect URI:', this.redirectUri);
  }

  getAuthURL() {
    const scopes = [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private'
    ].join(' ');
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes,
      state: 'state'
    });
    
    const authURL = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('🔗 Generated Auth URL:', authURL);
    return authURL;
  }

  async getAccessToken(code) {
    try {
      console.log('🔄 Exchanging code for token...');
      console.log('Using redirect URI:', this.redirectUri);
      
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });

      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post('https://accounts.spotify.com/api/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`
        }
      });

      console.log('✅ Token exchange successful');
      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.error_description || 
                          error.response?.data?.error || 
                          error.message;
      
      throw new Error(errorMessage);
    }
  }

  async getUserProfile() {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchTracks(query, limit = 1) {
    try {
      const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: limit.toString()
      });

      const response = await axios.get(`https://api.spotify.com/v1/search?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error searching tracks:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPlaylist(userId, name, description) {
    try {
      const response = await axios.post(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        name: name,
        description: description,
        public: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  async addTracksToPlaylist(playlistId, trackUris) {
    try {
      // Spotify API has a limit of 100 tracks per request
      const chunks = [];
      for (let i = 0; i < trackUris.length; i += 100) {
        chunks.push(trackUris.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        await axios.post(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
          uris: chunk
        }, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error adding tracks to playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  setAccessToken(token) {
    this.accessToken = token;
  }
}

// Setlist Service Class
class SetlistService {
  constructor() {
    this.apiKey = process.env.SETLISTFM_API_KEY;
    this.baseURL = 'https://api.setlist.fm/rest/1.0';
  }

  async getArtistSetlists(artistName, limit = 10) {
    try {
      const response = await axios.get(`${this.baseURL}/search/setlists`, {
        params: {
          artistName,
          p: 1,
        },
        headers: {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
        },
      });
      
      return response.data.setlist.slice(0, limit);
    } catch (error) {
      throw new Error(`Failed to fetch setlists: ${error.message}`);
    }
  }
}

// Initialize services
const spotifyService = new SpotifyService();
const setlistService = new SetlistService();

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Setlist Playlist Generator API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Setlist Playlist Generator API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Debug route
app.get('/api', (req, res) => {
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

// Auth Routes
app.get('/api/auth/url', (req, res) => {
  try {
    console.log('🎯 Auth URL requested');
    const authURL = spotifyService.getAuthURL();
    console.log('✅ Auth URL generated successfully');
    
    res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    res.json({ authURL });
  } catch (error) {
    console.error('❌ Failed to generate auth URL:', error);
    res.status(500).json({ error: 'Failed to generate auth URL', details: error.message });
  }
});

app.get('/api/auth/callback', async (req, res) => {
  const { code, error, state } = req.query;
  
  console.log('=== SPOTIFY CALLBACK ===');
  console.log('Code:', code ? `${code}`.substring(0, 20) + '...' : 'Missing');
  console.log('Error:', error);
  
  res.header('Access-Control-Allow-Origin', req.get('origin') || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (error) {
    console.error('Spotify authorization error:', error);
    return res.status(400).json({ error: 'Authorization denied by user' });
  }
  
  if (!code) {
    console.error('No authorization code provided');
    return res.status(400).json({ error: 'No authorization code provided' });
  }
  
  try {
    const tokenData = await spotifyService.getAccessToken(code);
    console.log('✅ Token exchange successful');
    res.json(tokenData);
  } catch (error) {
    console.error('❌ Token exchange failed:', error.message);
    res.status(500).json({ 
      error: 'token_exchange_failed',
      message: 'Failed to exchange code for token',
      details: error.message
    });
  }
});

// Setlist Routes
app.get('/api/setlist/search', async (req, res) => {
  const { artist, limit } = req.query;
  
  try {
    const setlists = await setlistService.getArtistSetlists(artist, parseInt(limit) || 10);
    res.json(setlists);
  } catch (error) {
    console.error('Setlist search error:', error);
    res.status(500).json({ error: 'Failed to fetch setlists' });
  }
});

// Playlist Routes
app.post('/api/playlist/create', async (req, res) => {
  const { accessToken, setlist } = req.body;
  
  if (!accessToken || !setlist) {
    return res.status(400).json({ error: 'Access token and setlist are required' });
  }
  
  try {
    spotifyService.setAccessToken(accessToken);
    
    // Get user profile
    const userProfile = await spotifyService.getUserProfile();
    const userId = userProfile.id;
    
    // Extract songs from setlist
    const songs = setlist.sets.set.flatMap(set => 
      set.song.map(song => song.name)
    );
    
    // Create playlist
    const playlistName = `${setlist.artist.name} - ${setlist.venue.name} (${setlist.eventDate})`;
    const playlistDescription = `Setlist from ${setlist.venue.name}, ${setlist.venue.city.name} on ${setlist.eventDate}. Generated by Setlist Playlist Generator.`;
    
    const playlist = await spotifyService.createPlaylist(
      userId,
      playlistName,
      playlistDescription
    );
    
    // Search for tracks and add to playlist
    const trackUris = [];
    const notFoundSongs = [];
    
    for (const song of songs) {
      try {
        const searchQuery = `track:"${song}" artist:"${setlist.artist.name}"`;
        const searchResult = await spotifyService.searchTracks(searchQuery);
        
        if (searchResult.tracks.items.length > 0) {
          trackUris.push(searchResult.tracks.items[0].uri);
        } else {
          // Try a broader search
          const broadSearchResult = await spotifyService.searchTracks(`${song} ${setlist.artist.name}`);
          if (broadSearchResult.tracks.items.length > 0) {
            trackUris.push(broadSearchResult.tracks.items[0].uri);
          } else {
            notFoundSongs.push(song);
          }
        }
      } catch (error) {
        console.log(`Could not find track: ${song}`);
        notFoundSongs.push(song);
      }
    }
    
    if (trackUris.length > 0) {
      await spotifyService.addTracksToPlaylist(playlist.id, trackUris);
    }
    
    res.json({
      playlist: {
        id: playlist.id,
        name: playlist.name,
        external_urls: playlist.external_urls,
      },
      tracksAdded: trackUris.length,
      totalSongs: songs.length,
      notFoundSongs,
    });
  } catch (error) {
    console.error('Playlist creation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create playlist',
      details: error.response?.data || null
    });
  }
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
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
app.use((err, req, res, next) => {
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