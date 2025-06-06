import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Environment Variables Loaded:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID);
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');

import authRoutes from './routes/auth';
import playlistRoutes from './routes/playlist';
import setlistRoutes from './routes/setlist';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/setlist', setlistRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Setlist Playlist Generator API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 Auth URL: http://localhost:${PORT}/api/auth/url`);
});