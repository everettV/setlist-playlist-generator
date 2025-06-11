AI Assistance Context - Updated $(date)

How to Use This File
Copy the entire contents of this file and paste it into a new AI chat session to provide full project context.

Quick Project Summary
- Last Updated: $(date)
- Current Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
- Uncommitted Changes: $(git status --porcelain | wc -l | tr -d ' ') files
- Recent Commits: $(git log --oneline -3 | wc -l | tr -d ' ') commits

# Project Context Export - Tue Jun 10 22:34:44 PDT 2025

## Project Structure
```
./PROJECT_CONTEXT.md
./context_advisor.sh
./AI_CONTEXT.md
./context_generator.sh
./update_context_for_ai.sh
./update_roadmap.sh
./ai_chat_prep.sh
./check_files.sh
./embed_preferences.sh
./ai_handoff.sh
./update_session.sh
./start_dev_session.sh
```


## Git Status
```
 M backend/.env.example
 M backend/package-lock.json
 M backend/package.json
 M backend/src/server.ts
 M backend/src/services/hybridArtistService.ts
 M backend/src/services/musicBrainzService.ts
 M frontend/package-lock.json
 M frontend/package.json
 M frontend/src/App.tsx
 M frontend/src/components/ArtistAutocomplete.tsx
 M frontend/src/pages/Home.tsx
?? frontend/.ai_context/
?? scripts/AI_CONTEXT.md
?? scripts/PROJECT_CONTEXT.md
```

## Recent Commits
```
c534f49 feat: implement hybrid fuzzy artist search
f8e7aaf fixed playlist view
8772864 lotsa fixes
344d5fb Initial setup
6c8e0b4 fixed input, and various configs
6c8bd7c Fix deployment with actual credentials
bac613a Fix Apple Music with proper jsonwebtoken imports
2c56150 Fix Apple Music service imports
0ef244d Apple Music api up & running
dd3458e fix keystroke issue on artist input
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

