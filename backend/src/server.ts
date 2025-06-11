import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://setlist-playlist-generator-1.onrender.com',
    'https://setlist-playlist-generator.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
}));

app.use(express.json());

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

let appleMusicService: any = null;

try {
  if (process.env.APPLE_MUSIC_TEAM_ID && process.env.APPLE_MUSIC_KEY_ID && (process.env.APPLE_MUSIC_PRIVATE_KEY || process.env.APPLE_MUSIC_PRIVATE_KEY_PATH)) {
    const { AppleMusicService } = require('./services/appleMusicService');
    appleMusicService = new AppleMusicService();
    console.log('✅ Apple Music service initialized successfully');
  } else {
    console.log('⚠️ Apple Music service disabled - missing environment variables');
  }
} catch (error) {
  console.log('⚠️ Apple Music service failed to initialize:', error);
  appleMusicService = null;
}

app.get('/api/apple-music/developer-token', (req: Request, res: Response) => {
  try {
    if (!appleMusicService) {
      return res.status(503).json({ 
        error: 'Apple Music service not available',
        message: 'Apple Music credentials not configured properly'
      });
    }
    const token = appleMusicService.generateDeveloperToken();
    res.json({ developerToken: token });
  } catch (error: any) {
    console.error('❌ Failed to generate Apple Music developer token:', error);
    res.status(500).json({ 
      error: 'Failed to generate developer token',
      message: error.message
    });
  }
});

app.get('/api/apple-music/status', (req: Request, res: Response) => {
  res.json({
    available: !!appleMusicService,
    message: appleMusicService ? 'Apple Music service is available' : 'Apple Music service not configured'
  });
});

app.post('/api/apple-music/playlist/create', async (req: Request, res: Response) => {
  try {
    if (!appleMusicService) {
      return res.status(503).json({ 
        error: 'Apple Music service not available',
        message: 'Apple Music credentials not configured'
      });
    }

    const { userToken, setlist } = req.body;
    
    if (!userToken || !setlist) {
      return res.status(400).json({ error: 'User token and setlist are required' });
    }

    const songs = setlist.sets?.set?.flatMap((set: any) => 
      set.song?.map((song: any) => song.name) || []
    ) || [];
    
    if (songs.length === 0) {
      return res.status(400).json({ error: 'No songs found in setlist' });
    }
    
    const trackIds: string[] = [];
    const notFoundSongs: string[] = [];
    
    for (const songName of songs) {
      try {
        const searchResult = await appleMusicService.searchTrack(
          songName, 
          setlist.artist?.name || '', 
          userToken
        );
        
        if (searchResult.results?.songs?.data?.length > 0) {
          const track = searchResult.results.songs.data[0];
          trackIds.push(track.id);
        } else {
          notFoundSongs.push(songName);
        }
      } catch (searchError: any) {
        notFoundSongs.push(songName);
      }
    }
    
    if (trackIds.length === 0) {
      return res.status(404).json({ 
        error: 'No tracks found in Apple Music',
        message: 'None of the songs from this setlist could be found in Apple Music',
        notFoundSongs
      });
    }
    
    const playlistName = `${setlist.artist?.name || 'Unknown'} - ${setlist.venue?.name || 'Unknown Venue'} (${setlist.eventDate || 'Unknown Date'})`;
    const playlistDescription = `Setlist from ${setlist.artist?.name || 'Unknown Artist'} concert. Created with Setlist Playlist Generator.`;
    
    const playlist = await appleMusicService.createPlaylist(
      userToken,
      playlistName,
      playlistDescription,
      trackIds
    );
    
    res.json({
      playlist: playlist.data?.[0] || playlist,
      tracksAdded: trackIds.length,
      totalSongs: songs.length,
      notFoundSongs,
      success: true
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to create Apple Music playlist', 
      message: error.message,
      success: false
    });
  }
});

app.get('/api/auth/url', async (req: Request, res: Response) => {
  try {
    const scopes = 'playlist-modify-public playlist-modify-private user-read-private user-read-email';
    
    const redirectUri = isProduction 
      ? 'https://setlist-playlist-generator.onrender.com/api/auth/callback'
      : 'https://setlist-playlist-generator.onrender.com/api/auth/callback';
    
    const authURL = `https://accounts.spotify.com/authorize?` +
      `response_type=code&` +
      `client_id=${process.env.SPOTIFY_CLIENT_ID}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `state=${isProduction ? 'prod' : 'dev'}`;

    console.log('🎵 Generated Spotify auth URL with redirect:', redirectUri);
    res.json({ authURL });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate auth URL', message: error.message });
  }
});

app.get('/api/auth/callback', async (req: Request, res: Response) => {
  try {
    const { code, state } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code provided' });
    }
    
    const redirectUri = 'https://setlist-playlist-generator.onrender.com/api/auth/callback';
    
    console.log('🔄 Exchanging Spotify code for tokens...');
    const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
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
    
    const frontendUrl = state === 'dev' 
      ? 'http://localhost:3000'
      : 'https://setlist-playlist-generator-1.onrender.com';
    
    const redirectUrl = `${frontendUrl}/callback?access_token=${access_token}&refresh_token=${refresh_token || ''}`;
    
    console.log('✅ Redirecting to frontend:', frontendUrl);
    res.redirect(redirectUrl);
    
  } catch (error: any) {
    console.error('❌ Token exchange failed:', error.response?.data || error.message);
    const frontendUrl = isProduction 
      ? 'https://setlist-playlist-generator-1.onrender.com'
      : 'http://localhost:3000';
    res.redirect(`${frontendUrl}/callback?error=auth_failed`);
  }
});

app.get('/api/setlist/search', async (req: Request, res: Response) => {
  try {
    const { artist, limit = 10 } = req.query;
    
    if (!artist) {
      return res.status(400).json({ error: 'Artist parameter is required' });
    }
    
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/setlists`, {
      params: {
        artistName: artist,
        p: 1
      },
      headers: {
        'x-api-key': process.env.SETLISTFM_API_KEY,
        'Accept': 'application/json'
      }
    });

    const setlists = response.data.setlist || [];
    
    const setlistsWithSongs = setlists.filter((setlist: any) => 
      setlist.sets?.set?.some((set: any) => set.song?.length > 0)
    ).slice(0, Number(limit));

    res.json(setlistsWithSongs);
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to search setlists', 
      message: error.response?.data?.message || error.message 
    });
  }
});

app.get('/api/artist/search', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log('🔍 Searching artists for:', q);
    
    const response = await axios.get(`https://api.setlist.fm/rest/1.0/search/artists`, {
      params: {
        artistName: q.trim(),
        p: 1,
        sort: 'relevance'
      },
      headers: {
        'x-api-key': process.env.SETLISTFM_API_KEY,
        'Accept': 'application/json'
      }
    });

    const artists = response.data.artist || [];
    
    const formattedArtists = artists.slice(0, 10).map((artist: any) => ({
      id: artist.mbid,
      name: artist.name,
      disambiguation: artist.disambiguation || '',
      sortName: artist.sortName || artist.name
    }));

    console.log('✅ Found artists:', formattedArtists.length);
    res.json(formattedArtists);
    
  } catch (error: any) {
    console.error('❌ Artist search failed:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to search artists', 
      message: error.response?.data?.message || error.message 
    });
  }
});

app.post('/api/playlist/create', async (req: Request, res: Response) => {
  try {
    const { accessToken, setlist } = req.body;
    
    if (!accessToken || !setlist) {
      return res.status(400).json({ error: 'Access token and setlist are required' });
    }
    
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const userId = userResponse.data.id;
    
    const songs = setlist.sets?.set?.flatMap((set: any) => 
      set.song?.map((song: any) => song.name) || []
    ) || [];
    
    if (songs.length === 0) {
      return res.status(400).json({ error: 'No songs found in setlist' });
    }
    
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
        notFoundSongs.push(songName);
      }
    }
    
    if (trackUris.length > 0) {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        { uris: trackUris },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      );
    }
    
    res.json({
      playlist: playlistResponse.data,
      tracksAdded: trackUris.length,
      totalSongs: songs.length,
      notFoundSongs
    });
    
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to create playlist', 
      message: error.response?.data?.message || error.message 
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔗 Environment: ${isProduction ? 'Production' : 'Development'}`);
});
