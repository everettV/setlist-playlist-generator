import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Environment Variables Loaded:');
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'Present' : 'Missing');
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'Present' : 'Missing');
console.log('SETLISTFM_API_KEY:', process.env.SETLISTFM_API_KEY ? 'Present' : 'Missing');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);

import authRoutes from './routes/auth';
import playlistRoutes from './routes/playlist';
import setlistRoutes from './routes/setlist';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Enable CORS for all routes with permissive settings
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

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept,Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use(express.json());

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.get('origin'));
  console.log('User-Agent:', req.get('user-agent'));
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Setlist Playlist Generator API',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Setlist Playlist Generator API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/playlist', playlistRoutes);
app.use('/api/setlist', setlistRoutes);

// Debug route to check what routes are available
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

// Global error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Global Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🎵 Auth URL: http://localhost:${PORT}/api/auth/url`);
  console.log(`📍 Available at: http://0.0.0.0:${PORT}`);
});