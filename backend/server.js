const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('Environment Variables Loaded:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://setlist-playlist-generator-site.onrender.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Setlist Playlist Generator API',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
