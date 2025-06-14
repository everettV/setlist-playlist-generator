# 🎵 Setlist Playlist Generator

A modern web app that generates playlists based on artists' actual concert setlists and discovers nearby shows based on your Apple Music listening history.

## ✨ Features

### 🎪 **Nearby Shows**
- Shows concerts from artists in your Apple Music library
- Real venue and date information
- Integrated ticket purchasing with affiliate revenue
- Location-based filtering

### 🎵 **Setlist Playlists** 
- Generate playlists based on actual concert setlists
- Apple Music integration for personalized recommendations
- Spotify and Apple Music playlist export
- High-quality concert data from multiple sources

### 💰 **Monetization**
- Ticket affiliate program integration
- Revenue tracking and analytics
- Multiple platform support (Ticketmaster, StubHub, SeatGeek)

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Apple Music API credentials (optional for enhanced features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd setlist-playlist-generator
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend && npm install

   # Frontend  
   cd ../frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy example files
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   
   # Add your API keys (see setup guides)
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Backend
   cd backend && npm run dev

   # Terminal 2: Frontend  
   cd frontend && npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🔧 Configuration

### Required Setup
The app works immediately with mock data. For full functionality:

1. **Apple Music API** - Get listening history and create playlists
2. **Concert APIs** - Real venue and show data (Ticketmaster recommended)
3. **Affiliate Programs** - Generate revenue from ticket sales

See the setup guides in the project root for detailed instructions.

## 📁 Project Structure

```
setlist-playlist-generator/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── services/       # External API integrations
│   │   ├── middleware/     # Security and validation
│   │   └── models/         # Data schemas
│   └── package.json
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── services/       # API clients and business logic
│   │   ├── pages/          # Application routes
│   │   └── utils/          # Helper functions
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

## 🎯 Key Technologies

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript  
- **APIs**: Apple Music, MusicBrainz, Ticketmaster
- **Deployment**: Netlify (frontend), Render (backend)

## 💰 Revenue Features

The app includes a complete monetization system:

- **Ticket Affiliate Links** - Earn 3-8% commission on ticket sales
- **Real-time Analytics** - Track clicks and revenue
- **Multiple Platforms** - Ticketmaster, StubHub, SeatGeek support
- **Smart URL Generation** - Automatic affiliate code injection

## 🔒 Security & Privacy

- Environment variables for all sensitive data
- No API keys committed to repository  
- GDPR-compliant data handling
- Secure authentication flows

## 📊 Performance

- **Hybrid API Strategy** - Real data with intelligent fallbacks
- **Smart Caching** - Optimized API usage and performance
- **Progressive Enhancement** - Works without API keys
- **Mobile Optimized** - Responsive design for all devices

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: [Coming Soon]
- **Documentation**: See `/docs` folder
- **API Setup Guides**: See `REAL_DATA_SETUP.md` and `AFFILIATE_SETUP.md`

---

**Built with ❤️ for music lovers who want to discover great concerts and create perfect playlists**