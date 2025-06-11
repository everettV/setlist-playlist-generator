AI Assistance Context - Updated $(date)

How to Use This File
Copy the entire contents of this file and paste it into a new AI chat session to provide full project context.

Quick Project Summary
- Last Updated: $(date)
- Current Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
- Uncommitted Changes: $(git status --porcelain | wc -l | tr -d ' ') files
- Recent Commits: $(git log --oneline -3 | wc -l | tr -d ' ') commits

# Project Context Export - Tue Jun 10 20:59:20 PDT 2025

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
 M PROJECT_CONTEXT.md
 M backend/src/server.ts
 M backend/src/server.ts.backup
 M frontend/src/pages/Home.tsx
?? backend/server.ts
?? backend/src/services/setlistService.ts
?? frontend/src/pages/Home.tsx.bak
?? frontend/src/utils/
```

## Recent Commits
```
f8e7aaf fixed playlist view
8772864 lotsa fixes
344d5fb Initial setup
6c8e0b4 fixed input, and various configs
6c8bd7c Fix deployment with actual credentials
bac613a Fix Apple Music with proper jsonwebtoken imports
2c56150 Fix Apple Music service imports
0ef244d Apple Music api up & running
dd3458e fix keystroke issue on artist input
3f47f38 fix keystroke issue on artist input
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

## Current Development Focus
Based on recent changes and roadmap:

- 🍎 Apple Music integration debugging and improvements

## Next Priority Tasks:
2. **This Week**: Implement artist autocompletion frontend
3. **Next Week**: Update backend for multiple setlists

## Technical Debt

## Instructions for AI
- Provide copy-paste terminal commands when suggesting code changes
- Follow existing project structure and patterns (React/TypeScript/Node.js)
- Include proper error handling and validation
- Suggest test cases for new features  
- Format responses for easy implementation
- Always ask which specific files to review using ./context_advisor.sh

## File Upload Guidance
Before uploading files, run: `./context_advisor.sh <context>` or `./context_advisor.sh auto`

Available contexts: artist_autocompletion, multiple_setlists, apple_music_debug, spotify_debug, ui_improvements, backend_api_changes, deployment_issues, performance_optimization

This ensures you upload exactly the files needed for optimal assistance.

