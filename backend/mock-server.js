const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ 
  origin: 'http://localhost:3000', 
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

console.log('🧪 MOCK SERVER - NO SPOTIFY');

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'MOCK server running' });
});

app.get('/api/auth/url', (req, res) => {
  console.log('🎵 MOCK AUTH - bypassing Spotify');
  res.json({ authURL: 'http://localhost:3001/api/mock-login' });
});

app.get('/api/mock-login', (req, res) => {
  console.log('✅ INSTANT mock login');
  const token = 'mock_token_' + Date.now();
  res.redirect('http://localhost:3000/callback?access_token=' + token + '&refresh_token=mock_refresh');
});

app.get('/api/setlist/search', (req, res) => {
  const artist = req.query.artist;
  console.log('🔍 Mock search for:', artist);
  
  if (!artist) {
    return res.status(400).json({ error: 'Artist required' });
  }

  const mockSetlist = {
    id: 'mock-123',
    eventDate: '2024-06-01',
    artist: { name: artist },
    venue: { 
      name: 'Mock Venue',
      city: { name: 'Mock City' }
    },
    sets: {
      set: [{
        song: [
          { name: 'Mock Song 1' },
          { name: 'Mock Song 2' },
          { name: 'Mock Song 3' }
        ]
      }]
    }
  };
  
  console.log('✅ Returning mock setlist');
  res.json([mockSetlist]);
});

app.post('/api/playlist/create', (req, res) => {
  const { setlist } = req.body;
  console.log('🎵 Creating mock playlist');
  
  const mockPlaylist = {
    id: 'mock-playlist',
    name: 'Mock Playlist - ' + (setlist?.artist?.name || 'Unknown'),
    external_urls: { spotify: 'https://mock.spotify.com/playlist/123' }
  };
  
  console.log('✅ Mock playlist created');
  res.json({
    playlist: mockPlaylist,
    tracksAdded: 3,
    totalSongs: 3,
    notFoundSongs: []
  });
});

app.get('/api/apple-music/status', (req, res) => {
  res.json({ available: false, message: 'Mock mode' });
});

app.listen(3001, () => {
  console.log('🧪 MOCK SERVER running on http://localhost:3001');
  console.log('🚫 NO SPOTIFY - completely bypassed');
  console.log('✅ Start frontend: cd frontend && npm start');
});
