# Project Context Export - Tue Jun 10 00:49:15 PDT 2025

## Project Structure
```
./PROJECT_CONTEXT.md
./context_advisor.sh
./render.yaml
./.DS_Store
./AI_CONTEXT.md
./frontend/.DS_Store
./frontend/serve.json
./frontend/test-server.ts
./frontend/appleMusicService.ts
./frontend/Home.tsx
./frontend/public/index.html
./frontend/public/.DS_Store
./frontend/public/_redirects
./frontend/public/index.html.backup
./frontend/public/assets/abstract-background.png
./frontend/package-lock.json
./frontend/package.json
./frontend/.env
./frontend/tsconfig.json
./frontend/src/App.tsx
```

## Dependencies (package.json)
```json
{
  "name": "setlist-playlist-generator",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:frontend": "cd frontend && npm start",
    "dev:backend": "cd backend && npm run dev",
    "install:all": "npm install && cd frontend && npm install && cd ../backend && npm install",
    "build:frontend": "cd frontend && npm run build",
    "start:backend": "cd backend && npm start"
  },
  "devDependencies": {
    "concurrently": "^7.6.0"
  }
}```

## Git Status
```
 M AI_CONTEXT.md
 M context_generator.sh
 M frontend/src/pages/Home.tsx
?? PROJECT_CONTEXT.md
?? ROADMAP.md
?? ai_chat_prep.sh
?? check_files.sh
?? context_advisor.sh
?? file_requirements.json
?? start_dev_session.sh
?? tasks.md
?? update_context_for_ai.sh
?? update_roadmap.sh
```

## Recent Commits
```
8772864 lotsa fixes
344d5fb Initial setup
6c8e0b4 fixed input, and various configs
6c8bd7c Fix deployment with actual credentials
bac613a Fix Apple Music with proper jsonwebtoken imports
2c56150 Fix Apple Music service imports
0ef244d Apple Music api up & running
dd3458e fix keystroke issue on artist input
3f47f38 fix keystroke issue on artist input
bf02ac6 fix keystroke issue on artist input
```



## Current Roadmap
```markdown
# Setlist Playlist Generator - Product Roadmap

## Current Status: MVP Complete ✅
- Basic setlist search by exact artist name
- Spotify playlist creation
- Apple Music playlist creation (when configured)
- Clean UI with proper error handling

## Short-Term Roadmap (Next 2-4 weeks)

### 🎯 Phase 1: Enhanced Search & Discovery
- [ ] **Artist Name Autocompletion** 
  - Implement fuzzy search with Setlist.fm artist API
  - Add dropdown suggestions as user types
  - Handle typos and partial matches

- [ ] **Multiple Setlists Display**
  - Show 5-10 recent setlists per artist
  - Add date/venue filtering
  - Allow user to select which setlist to convert

- [ ] **Individual Set Lookup**
  - Search by specific venue, date, or tour name
  - Deep link to specific setlists
  - QR code sharing for setlists

### 🌟 Phase 2: Local Discovery & Recommendations  
- [ ] **Upcoming Shows in User Area**
  - Integrate location services
  - Connect with Songkick/Bandsintown APIs
  - Show recommended artists playing nearby
  - Filter by user's music preferences

- [ ] **User Profile & Preferences**
  - Save favorite artists
  - Track created playlists
  - Personal setlist history
  - Music taste analysis

### 📰 Phase 3: Content & Community
- [ ] **Music News Aggregation**
  - Curated feed from multiple music sources
  - Artist-specific news and updates
  - Concert reviews and setlist discussions
  - Integration with music blogs/publications

## Medium-Term Vision (1-3 months)

### 🔧 Technical Improvements
- [ ] Caching layer for frequent searches
```

## File Upload Guidance
Before uploading files to AI chat, run:
```bash
./context_advisor.sh <context_name>
# Available contexts: artist_autocompletion, multiple_setlists, apple_music_debug, etc.
```
