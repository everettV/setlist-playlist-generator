import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// Get recently played artists from Spotify
app.get('/api/spotify/recently-played-artists', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🎵 Spotify recently played artists requested');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Mock data - in real implementation, would call Spotify API
    // GET https://api.spotify.com/v1/me/player/recently-played?limit=50
    const mockRecentlyPlayedArtists = [
      {
        name: 'Taylor Swift',
        id: 'spotify:artist:06HL4z0CvFAxyc27GXpf02',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        external_urls: { spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02' }
      },
      {
        name: 'Arctic Monkeys',
        id: 'spotify:artist:7Ln80lUS6He07XvHI8qqHH',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
        external_urls: { spotify: 'https://open.spotify.com/artist/7Ln80lUS6He07XvHI8qqHH' }
      },
      {
        name: 'Radiohead',
        id: 'spotify:artist:4Z8W4fKeB5YxbusRsdQVPb',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        external_urls: { spotify: 'https://open.spotify.com/artist/4Z8W4fKeB5YxbusRsdQVPb' }
      },
      {
        name: 'The Strokes',
        id: 'spotify:artist:0epOFNiUfyON9EYx7Tpr6V',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        external_urls: { spotify: 'https://open.spotify.com/artist/0epOFNiUfyON9EYx7Tpr6V' }
      },
      {
        name: 'Billie Eilish',
        id: 'spotify:artist:6qqNVTkY8uBg9cP3Jd8DAH',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        external_urls: { spotify: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd8DAH' }
      },
      {
        name: 'Tame Impala',
        id: 'spotify:artist:5INjqkS1o8h1imAzPqGZBb',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        external_urls: { spotify: 'https://open.spotify.com/artist/5INjqkS1o8h1imAzPqGZBb' }
      },
      {
        name: 'Glass Animals',
        id: 'spotify:artist:4yvcSjfu4PC0CYQyLy4wSq',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        external_urls: { spotify: 'https://open.spotify.com/artist/4yvcSjfu4PC0CYQyLy4wSq' }
      },
      {
        name: 'Phoebe Bridgers',
        id: 'spotify:artist:1r1uxoy19fzMxunt3ONAkG',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
        external_urls: { spotify: 'https://open.spotify.com/artist/1r1uxoy19fzMxunt3ONAkG' }
      },
      {
        name: 'Vampire Weekend',
        id: 'spotify:artist:5BvJzeQpmsdsFp4HGUYUEx',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        external_urls: { spotify: 'https://open.spotify.com/artist/5BvJzeQpmsdsFp4HGUYUEx' }
      },
      {
        name: 'Mac Miller',
        id: 'spotify:artist:5f7VJjfbwm532GiveGC0ZK',
        images: [{ url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&q=80' }],
        playedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        external_urls: { spotify: 'https://open.spotify.com/artist/5f7VJjfbwm532GiveGC0ZK' }
      }
    ];
    
    console.log('✅ Returning mock recently played artists');
    res.json({
      artists: mockRecentlyPlayedArtists,
      total: mockRecentlyPlayedArtists.length,
      synced_at: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Error fetching recently played artists:', error);
    res.status(500).json({ error: 'Failed to fetch recently played artists' });
  }
});

// Apple Music recently played endpoint
app.get('/api/apple-music/recently-played', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('🍎 Apple Music recently played requested');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'User authorization token required' });
    }
    
    const userToken = authHeader.split(' ')[1];
    
    try {
      // Try to get real data from Apple Music API first
      console.log('🍎 Attempting real Apple Music API call...');
      
      // Get developer token for API calls
      const { AppleMusicService } = await import('./services/appleMusicService');
      const appleMusicService = new AppleMusicService();
      const developerToken = appleMusicService.generateDeveloperToken();
      
      // Use the specific tracks endpoint to get recently played tracks with proper artist info
      console.log('🍎 Fetching recently played tracks from Apple Music /tracks endpoint...');
      
      const response = await fetch('https://api.music.apple.com/v1/me/recent/played/tracks', {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': userToken,
          'User-Agent': 'SetlistPlaylistGenerator/1.0'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('🍎 Recently played API response:', data.data?.length || 0, 'tracks');
        
        if (data.data && data.data.length > 0) {
          // Log all recently played tracks for debugging
          console.log('🔍 Raw recently played tracks:');
          data.data.forEach((item: any, index: number) => {
            console.log(`  ${index + 1}. "${item.attributes?.name || 'No Name'}" by "${item.attributes?.artistName || 'No Artist'}"`);
          });
          
          // Filter valid tracks (only remove truly invalid entries)
          const validTracks = data.data.filter((item: any) => {
            const artistName = item.attributes?.artistName || '';
            const songName = item.attributes?.name || '';
            const isValid = isValidArtist(artistName, songName);
            if (!isValid) {
              console.log(`🚫 Backend filtered: "${artistName}" - "${songName}"`);
            }
            return isValid;
          });
          
          console.log(`🍎 Recently played: ${data.data.length} total, ${validTracks.length} valid tracks`);
          
          if (validTracks.length > 0) {
            // Convert to our format
            const tracks = validTracks.map((item: any, index: number) => ({
              id: item.id || `recently_played_${index}`,
              type: 'songs',
              attributes: {
                name: item.attributes?.name || 'Unknown Song',
                artistName: item.attributes?.artistName || 'Unknown Artist',
                albumName: item.attributes?.albumName || 'Unknown Album',
                playedDate: item.attributes?.playedDate || new Date(Date.now() - (index * 30 * 60 * 1000)).toISOString(),
                artwork: item.attributes?.artwork
              }
            }));
            
            console.log(`✅ Returning ${tracks.length} recently played tracks`);
            console.log(`🎤 Artists from recently played:`, tracks.map((t: any) => t.attributes.artistName));
            
            return res.json({
              data: tracks,
              meta: {
                total: tracks.length,
                source: 'apple_music_recently_played'
              }
            });
          } else {
            console.log('📭 No valid artists found in recently played tracks');
          }
        } else {
          console.log('📭 No recently played tracks found');
        }
      } else {
        console.log('❌ Recently played API failed:', response.status);
        const errorText = await response.text();
        console.log('❌ Error details:', errorText);
      }
      
    } catch (realApiError) {
      console.error('❌ Real Apple Music API failed:', realApiError);
    }
    
    // Fallback to mock data if real API fails
    console.log('🍎 Falling back to mock recently played data...');
    const mockRecentlyPlayedTracks = [
      {
        id: 'track_1',
        type: 'songs',
        attributes: {
          name: 'Anti-Hero',
          artistName: 'Taylor Swift',
          albumName: 'Midnights',
          playedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8b/05/c0/8b05c0e4-b7e3-4d3e-9a6b-1e9b8b05c0e4/22UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_2', 
        type: 'songs',
        attributes: {
          name: 'Do I Wanna Know?',
          artistName: 'Arctic Monkeys',
          albumName: 'AM',
          playedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2f/9e/cb/2f9ecbed-27be-40e6-abca-6de49d50299e/13UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_3',
        type: 'songs', 
        attributes: {
          name: 'Everything In Its Right Place',
          artistName: 'Radiohead',
          albumName: 'Kid A',
          playedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/a7/4b/1b/a74b1b7f-71a5-4011-9441-d0b5e4122711/12UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_4',
        type: 'songs',
        attributes: {
          name: 'Last Nite',
          artistName: 'The Strokes',
          albumName: 'Is This It',
          playedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/b6/b6/b6/b6b6b6b6-c6c6-d6d6-e6e6-f6f6f6f6f6f6/17UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_5',
        type: 'songs',
        attributes: {
          name: 'bad guy',
          artistName: 'Billie Eilish',
          albumName: 'WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?',
          playedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/e0/14/0a/e0140a67-e4d1-4f13-8a01-364355bee46e/19UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_6',
        type: 'songs',
        attributes: {
          name: 'The Less I Know The Better',
          artistName: 'Tame Impala',
          albumName: 'Currents',
          playedDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/b1/e2/65/b1e26560-60e5-4236-bbdb-9aa5a8d5ee19/15UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_7',
        type: 'songs',
        attributes: {
          name: 'Heat Waves',
          artistName: 'Glass Animals',
          albumName: 'Dreamland',
          playedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music119/v4/d5/be/53/d5be5333-4171-427e-8e12-732087c6b78e/20UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      },
      {
        id: 'track_8',
        type: 'songs',
        attributes: {
          name: 'Motion Sickness',
          artistName: 'Phoebe Bridgers', 
          albumName: 'Stranger in the Alps',
          playedDate: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
          artwork: {
            url: 'https://is1-ssl.mzstatic.com/image/thumb/Music111/v4/a5/a5/a5/a5a5a5a5-b5b5-c5c5-d5d5-e5e5e5e5e5e5/17UMGIM12345.rgb.jpg/{w}x{h}bb.jpg',
            width: 3000,
            height: 3000
          }
        }
      }
    ];
    
    console.log('✅ Returning mock Apple Music recently played tracks');
    res.json({
      data: mockRecentlyPlayedTracks,
      meta: {
        total: mockRecentlyPlayedTracks.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching Apple Music recently played:', error);
    res.status(500).json({ error: 'Failed to fetch recently played' });
  }
});

// Apple Music developer token endpoint
app.get('/api/apple-music/developer-token', async (req: Request, res: Response) => {
  try {
    console.log('🍎 Developer token requested');
    
    try {
      const { AppleMusicService } = await import('./services/appleMusicService');
      const appleMusicService = new AppleMusicService();
      const developerToken = appleMusicService.generateDeveloperToken();
      
      console.log('✅ Developer token generated successfully');
      
      res.json({
        token: developerToken,
        expiresIn: 7776000 // 3 months
      });
      
    } catch (serviceError) {
      console.error('❌ Apple Music service error:', serviceError);
      res.status(500).json({ 
        error: 'Failed to generate developer token',
        details: serviceError instanceof Error ? serviceError.message : String(serviceError)
      });
    }
    
  } catch (error) {
    console.error('❌ Error generating developer token:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Apple Music artist search endpoint
app.get('/api/apple-music/search/artists', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    console.log('🍎 Apple Music artist search requested for:', q);
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    try {
      // Use the Apple Music service to generate developer token
      console.log('🍎 Attempting to initialize Apple Music service...');
      const { AppleMusicService } = await import('./services/appleMusicService');
      console.log('🍎 AppleMusicService imported successfully');
      
      const appleMusicService = new AppleMusicService();
      console.log('🍎 AppleMusicService instantiated successfully');
      
      const developerToken = appleMusicService.generateDeveloperToken();
      console.log('🍎 Developer token generated successfully');
      
      // First try a simple health check endpoint
      console.log('🍎 Testing Apple Music API connectivity...');
      const healthResponse = await fetch('https://api.music.apple.com/v1/catalog/us/charts', {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'User-Agent': 'SetlistPlaylistGenerator/1.0',
        },
      });
      console.log('🍎 Health check response status:', healthResponse.status);
      
      const apiUrl = `https://api.music.apple.com/v1/catalog/us/search?term=${encodeURIComponent(q)}&types=artists&limit=10`;
      console.log('🍎 Making Apple Music API search request...');
      console.log('🍎 API URL:', apiUrl);
      console.log('🍎 Authorization header preview:', `Bearer ${developerToken.substring(0, 50)}...`);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'User-Agent': 'SetlistPlaylistGenerator/1.0',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Apple Music API error:', response.status, response.statusText, errorText);
        throw new Error(`Apple Music API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Apple Music API response received, artists found:', data.results?.artists?.data?.length || 0);
      
      res.json({
        ...data,
        source: 'apple_music_api'
      });
      
    } catch (serviceError) {
      console.error('❌ Apple Music service error details:', serviceError instanceof Error ? serviceError.message : String(serviceError));
      console.error('❌ Full error:', serviceError);
      
      // Fallback to mock data if Apple Music service fails
      console.log('🍎 Falling back to mock data...');
      const mockResults = generateMockAppleResults(q);
      res.json({
        results: {
          artists: {
            data: mockResults
          }
        },
        source: 'mock_fallback'
      });
    }
    
  } catch (error) {
    console.error('❌ Error searching Apple Music artists:', error);
    
    // Fallback to mock data
    const mockResults = generateMockAppleResults(req.query.q as string);
    res.json({
      results: {
        artists: {
          data: mockResults
        }
      },
      source: 'mock_fallback'
    });
  }
});

// Helper function to validate artist names (filter out playlist/system entries)
function isValidArtist(artistName: string, songName: string): boolean {
  // Normalize strings for checking
  const normalizedArtist = artistName.toLowerCase().trim();
  const normalizedSong = songName.toLowerCase().trim();
  
  // Don't filter well-known artists
  const wellKnownArtists = [
    'taylor swift', 'arctic monkeys', 'radiohead', 'the strokes',
    'billie eilish', 'tame impala', 'glass animals', 'phoebe bridgers',
    'drake', 'adele', 'ed sheeran', 'coldplay', 'queen', 'beyoncé',
    'eminem', 'rihanna', 'bruno mars', 'lady gaga', 'kanye west',
    'the weeknd', 'dua lipa', 'ariana grande', 'justin bieber',
    "l'impératrice", 'l impératrice'
  ];
  
  if (wellKnownArtists.includes(normalizedArtist)) {
    return true; // Always allow well-known artists
  }
  
  // Exclude obviously invalid entries (exact matches only)
  const invalidPatterns = [
    'unknown artist',
    'unknown',
    'various artists', 
    'compilation',
    '',
    'n/a',
    'null',
    'undefined'
  ];
  
  // Check if artist name is exactly an invalid pattern
  if (invalidPatterns.includes(normalizedArtist)) {
    return false;
  }
  
  // Exclude very short or suspicious artist names (likely corrupted data)
  if (normalizedArtist.length < 2) {
    return false;
  }
  
  // If artist name looks like it has real content (contains letters and is reasonable length), allow it
  if (normalizedArtist.length >= 3 && /[a-z]/.test(normalizedArtist)) {
    // Allow most real-looking artist names, but still filter obvious system entries
    const strictSystemPatterns = [
      'apple music radio',
      'apple music 1',
      'beats 1',
      'playlist intro',
      'station intro'
    ];
    
    if (strictSystemPatterns.some(pattern => normalizedArtist.includes(pattern))) {
      return false;
    }
    
    return true; // Allow most real-looking names
  }
  
  // Final fallback - allow almost everything except obvious system entries
  // DO NOT filter "playlist", "mix", "curated" as these could be legitimate content
  const veryStrictSystemPatterns = [
    'apple music radio',
    'apple music 1',
    'beats 1',
    'technical difficulties',
    'loading',
    'buffering',
    'station identification'
  ];
  
  if (veryStrictSystemPatterns.some(pattern => normalizedArtist.includes(pattern))) {
    return false;
  }
  
  // Allow everything else - artists from playlists, albums, any source
  return true;
}

// Helper function to generate mock Apple Music results
function generateMockAppleResults(query: string) {
  const normalizedQuery = query.toLowerCase();
  console.log('🍎 generateMockAppleResults called with:', query, '-> normalized:', normalizedQuery);
  
  const mockDatabase = [
    { id: '20244d07', name: 'Taylor Swift', genreNames: ['Pop'], artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face' },
    { id: '2f9ecbed', name: 'Arctic Monkeys', genreNames: ['Alternative'], artwork: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop' },
    { id: 'a74b1b7f', name: 'Radiohead', genreNames: ['Alternative'], artwork: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face&facepad=3' },
    { id: 'e0140a67', name: 'Billie Eilish', genreNames: ['Pop'], artwork: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format' },
    { id: '6f70bfca', name: 'Drake', genreNames: ['Hip-Hop/Rap'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face' },
    { id: 'c14b4180', name: 'The Weeknd', genreNames: ['R&B/Soul'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
    { id: 'f4fdbb4c', name: 'Ariana Grande', genreNames: ['Pop'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face' },
    { id: 'ba550d0e', name: 'Queen', genreNames: ['Rock'], artwork: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop' },
    { id: 'cc2c9c3c', name: 'Coldplay', genreNames: ['Alternative'], artwork: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop' },
    { id: 'b7ffd2af', name: 'Ed Sheeran', genreNames: ['Pop'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=2' },
    { id: 'khruangbin1', name: 'Khruangbin', genreNames: ['Electronic', 'Funk'], artwork: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop&auto=format' },
    { id: 'billyjoel1', name: 'Billy Joel', genreNames: ['Rock', 'Pop'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=4' },
    { id: 'macmiller1', name: 'Mac Miller', genreNames: ['Hip-Hop/Rap'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=3' },
    { id: 'tameimpala1', name: 'Tame Impala', genreNames: ['Psychedelic Rock'], artwork: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=purple' },
    { id: 'pinkfloyd1', name: 'Pink Floyd', genreNames: ['Progressive Rock'], artwork: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format' },
    { id: 'michaeljackson1', name: 'Michael Jackson', genreNames: ['Pop', 'R&B/Soul'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=5' },
    { id: 'beyonce1', name: 'Beyoncé', genreNames: ['Pop', 'R&B/Soul'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=2' },
    { id: 'jayz1', name: 'Jay-Z', genreNames: ['Hip-Hop/Rap'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=6' },
    { id: 'adele1', name: 'Adele', genreNames: ['Pop', 'Soul'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=3' },
    { id: 'brunomars1', name: 'Bruno Mars', genreNames: ['Pop', 'Funk'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=4' },
    { id: 'johnmayer1', name: 'John Mayer', genreNames: ['Rock', 'Blues'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=7' },
    { id: 'aliciakeys1', name: 'Alicia Keys', genreNames: ['R&B/Soul'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=4' },
    { id: 'johnlegend1', name: 'John Legend', genreNames: ['R&B/Soul'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=5' },
    { id: 'eminem1', name: 'Eminem', genreNames: ['Hip-Hop/Rap'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=8' },
    { id: 'rihanna1', name: 'Rihanna', genreNames: ['Pop', 'R&B/Soul'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=5' },
    { id: 'catelbon1', name: 'Cate Le Bon', genreNames: ['Alternative', 'Indie Rock'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=6' },
    { id: 'animalcollective1', name: 'Animal Collective', genreNames: ['Experimental', 'Indie Rock'], artwork: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop&auto=format&colorize=green' },
    { id: 'beach1', name: 'Beach House', genreNames: ['Dream Pop', 'Indie Rock'], artwork: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=blue' },
    { id: 'grizzly1', name: 'Grizzly Bear', genreNames: ['Indie Rock', 'Art Rock'], artwork: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=brown' },
    { id: 'fleet1', name: 'Fleet Foxes', genreNames: ['Indie Folk', 'Folk Rock'], artwork: 'https://images.unsplash.com/photo-1574170611101-e86a5f8ed5b8?w=300&h=300&fit=crop&auto=format&colorize=orange' },
    { id: 'sufjan1', name: 'Sufjan Stevens', genreNames: ['Indie Folk', 'Alternative'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=6' },
    { id: 'bon1', name: 'Bon Iver', genreNames: ['Indie Folk', 'Electronic'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=9' },
    { id: 'national1', name: 'The National', genreNames: ['Indie Rock', 'Alternative'], artwork: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=gray' },
    { id: 'whitney1', name: 'Whitney Houston', genreNames: ['R&B/Soul', 'Pop'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=7' },
    { id: 'stevie1', name: 'Stevie Wonder', genreNames: ['R&B/Soul', 'Funk'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=10' },
    { id: 'stevieray1', name: 'Stevie Ray Vaughan', genreNames: ['Blues', 'Rock'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=7' },
    { id: 'willsmith1', name: 'Will Smith', genreNames: ['Hip-Hop/Rap', 'Pop'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=11' },
    { id: 'tylercreator1', name: 'Tyler, The Creator', genreNames: ['Hip-Hop/Rap', 'Alternative'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=8' },
    { id: 'ladygaga1', name: 'Lady Gaga', genreNames: ['Pop', 'Dance'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=8' },
    { id: 'adele2', name: 'Adele', genreNames: ['Pop', 'Soul'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=9' },
    { id: 'johnlegend2', name: 'John Legend', genreNames: ['R&B/Soul', 'Pop'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=9' },
    { id: 'aliciakeys2', name: 'Alicia Keys', genreNames: ['R&B/Soul', 'Pop'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=10' },
    { id: 'blondie1', name: 'Blondie', genreNames: ['Rock', 'New Wave'], artwork: 'https://images.unsplash.com/photo-1494790108755-2616c9a0d5a3?w=300&h=300&fit=crop&crop=face&facepad=11' },
    { id: 'fleetwood1', name: 'Fleetwood Mac', genreNames: ['Rock', 'Pop Rock'], artwork: 'https://images.unsplash.com/photo-1540558741000-0b958e08b2bb?w=300&h=300&fit=crop&auto=format&colorize=silver' },
    { id: 'eagles1', name: 'Eagles', genreNames: ['Rock', 'Country Rock'], artwork: 'https://images.unsplash.com/photo-1515924141598-8a71b37df3de?w=300&h=300&fit=crop&auto=format&colorize=gold' },
    { id: 'elton1', name: 'Elton John', genreNames: ['Pop', 'Rock'], artwork: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face&facepad=10' },
    { id: 'prince1', name: 'Prince', genreNames: ['Pop', 'R&B/Soul', 'Rock'], artwork: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&h=300&fit=crop&crop=face&facepad=12' },
  ];
  
  const filtered = mockDatabase.filter(artist => 
    artist.name.toLowerCase().includes(normalizedQuery)
  );
  
  console.log('🍎 Mock search for:', normalizedQuery, 'found:', filtered.length, 'results');
  
  return filtered.map(artist => ({
    id: artist.id,
    type: 'artists',
    href: `/v1/catalog/us/artists/${artist.id}`,
    attributes: {
      name: artist.name,
      genreNames: artist.genreNames,
      url: `https://music.apple.com/us/artist/${artist.id}`,
      artwork: artist.artwork ? {
        url: artist.artwork,
        width: 300,
        height: 300
      } : undefined,
    },
  }));
}

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
