import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Environment Variables Loaded:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');
console.log('SETLISTFM_API_KEY:', process.env.SETLISTFM_API_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Interfaces
interface SpotifyTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

interface SetlistFMResponse {
  setlist: any[];
}

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
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

// Spotify Service Class
class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;
  private accessToken: string;
  
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'https://setlist-playlist-generator.onrender.com/api/auth/callback';
    this.accessToken = '';
    
    console.log('🔍 Initializing Spotify Service:');
    console.log('Client ID:', this.clientId ? 'Present' : 'Missing');
    console.log('Client Secret:', this.clientSecret ? 'Present' : 'Missing');
    console.log('Redirect URI:', this.redirectUri);
  }

  getAuthURL(): string {
    const scopes: string[] = [
      'playlist-modify-public',
      'playlist-modify-private',
      'user-read-private'
    ];
    
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
      state: 'state'
    });
    
    const authURL = `https://accounts.spotify.com/authorize?${params.toString()}`;
    console.log('🔗 Generated Auth URL:', authURL);
    return authURL;
  }

  async getAccessToken(code: string): Promise<SpotifyTokenResponse> {
    try {
      console.log('🔄 Exchanging code for token...');
      console.log('Using redirect URI:', this.redirectUri);
      
      const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.redirectUri,
      });

      const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post<SpotifyTokenResponse>('https://accounts.spotify.com/api/token', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`
        }
      });

      console.log('✅ Token exchange successful');
      this.accessToken = response.data.access_token;
      return response.data;
    } catch (error: any) {
      console.error('❌ Token exchange failed:', error.response?.data || error.message);
      
      const errorMessage = error.response?.data?.error_description || 
                          error.response?.data?.error || 
                          error.message;
      
      throw new Error(errorMessage);
    }
  }

  async getUserProfile(): Promise<any> {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error getting user profile:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchTracks(query: string, limit: number = 1): Promise<any> {
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
    } catch (error: any) {
      console.error('Error searching tracks:', error.response?.data || error.message);
      throw error;
    }
  }

  async createPlaylist(userId: string, name: string, description: string): Promise<any> {
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
    } catch (error: any) {
      console.error('Error creating playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  async addTracksToPlaylist(playlistId: string, trackUris: string[]): Promise<void> {
    try {
      // Spotify API has a limit of 100 tracks per request
      const chunks: string[][] = [];
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
    } catch (error: any) {
      console.error('Error adding tracks to playlist:', error.response?.data || error.message);
      throw error;
    }
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

// Setlist Service Class
class SetlistService {
  private apiKey: string;
  private baseURL: string;

  constructor() {
    this.apiKey = process.env.SETLISTFM_API_KEY || '';
    this.baseURL = 'https://api.setlist.fm/rest/1.0';
  }

  async getArtistSetlists(artistName: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get<SetlistFMResponse>(`${this.baseURL}/search/setlists`, {
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
    } catch (error: any) {
      throw new Error(`Failed to fetch setlists: ${error.message}`);
    }
  }
}

// Initialize services
const spotifyService = new SpotifyService();
const setlistService = new SetlistService();

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

// Auth Routes
app.get('/api/auth/url', (req: Request, res: Response) => {
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
});

// FIXED CALLBACK HANDLER
app.get('/api/auth/callback', async (req: Request, res: Response) => {
  const { code, error, state } = req.query;
  
  console.log('=== SPOTIFY CALLBACK ===');
  console.log('Code:', code ? `${code}`.substring(0, 20) + '...' : 'Missing');
  console.log('Error:', error);
  
  // Determine frontend URL based on environment
  const frontendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://setlist-playlist-generator-1.onrender.com'
    : 'http://localhost:3000';
  
  if (error) {
    console.error('Spotify authorization error:', error);
    // Redirect to frontend with error
    res.redirect(`${frontendUrl}?error=${encodeURIComponent(error as string)}`);
    return;
  }
  
  if (!code || typeof code !== 'string') {
    console.error('No authorization code provided');
    // Redirect to frontend with error
    res.redirect(`${frontendUrl}?error=no_code`);
    return;
  }
  
  try {
    const tokenData = await spotifyService.getAccessToken(code);
    console.log('✅ Token exchange successful');
    
    // Redirect to frontend with success and token
    const params = new URLSearchParams({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in.toString(),
      token_type: tokenData.token_type
    });
    
    if (tokenData.refresh_token) {
      params.append('refresh_token', tokenData.refresh_token);
    }
    
    console.log('🔄 Redirecting to frontend with tokens');
    res.redirect(`${frontendUrl}/callback?${params.toString()}`);
    
  } catch (error: any) {
    console.error('❌ Token exchange failed:', error.message);
    // Redirect to frontend with error
    res.redirect(`${frontendUrl}?error=${encodeURIComponent('token_exchange_failed')}&details=${encodeURIComponent(error.message)}`);
  }
});

// Setlist Routes
app.get('/api/setlist/search', async (req: Request, res: Response) => {
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
});

// Playlist Routes
app.post('/api/playlist/create', async (req: Request, res: Response) => {
  const { accessToken, setlist } = req.body;
  
  if (!accessToken || !setlist) {
    res.status(400).json({ error: 'Access token and setlist are required' });
    return;
  }
  
  try {
    spotifyService.setAccessToken(accessToken);
    
    // Get user profile
    const userProfile = await spotifyService.getUserProfile();
    const userId = userProfile.id;
    
    // Extract songs from setlist
    const songs = setlist.sets.set.flatMap((set: any) => 
      set.song.map((song: any) => song.name)
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
    const trackUris: string[] = [];
    const notFoundSongs: string[] = [];
    
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
  } catch (error: any) {
    console.error('Playlist creation error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create playlist',
      details: error.response?.data || null
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