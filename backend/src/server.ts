import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import { AppleMusicService } from './services/appleMusicService';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

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

// Apple Music Integration
let appleMusicService: AppleMusicService | null = null;

try {
  appleMusicService = new AppleMusicService();
  console.log('✅ Apple Music service initialized');
} catch (error) {
  console.log('⚠️ Apple Music service not available:', error);
}

app.get('/api/apple-music/developer-token', (req: Request, res: Response) => {
  try {
    if (!appleMusicService) {
      return res.status(503).json({ 
        error: 'Apple Music service not available',
        message: 'Apple Music credentials not configured'
      });
    }
    const token = appleMusicService.generateDeveloperToken();
    res.json({ developerToken: token });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to generate developer token' });
  }
});

app.get('/api/apple-music/status', (req: Request, res: Response) => {
  res.json({
    available: !!appleMusicService,
    message: appleMusicService ? 'Apple Music service is available' : 'Apple Music service not configured'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Available at: http://0.0.0.0:${PORT}`);
});
