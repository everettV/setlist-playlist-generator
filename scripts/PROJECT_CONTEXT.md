# Project Context Export - Tue Jun 10 22:35:31 PDT 2025

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
