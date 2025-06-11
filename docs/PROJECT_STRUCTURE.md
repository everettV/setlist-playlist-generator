# Project Structure

## Root Directory
```
/
├── frontend/          # React TypeScript frontend
├── backend/           # Node.js Express backend
├── scripts/           # Development and utility scripts
├── docs/              # Project documentation
├── config/            # Configuration files
├── .ai_context/       # AI assistance context and scripts
├── dev                # Quick start development (shortcut)
├── ai                 # Prepare AI handoff (shortcut)
└── context           # Get file context advice (shortcut)
```

## Scripts Directory
- `ai_handoff.sh` - Prepare context for AI chat
- `context_advisor.sh` - Get file upload recommendations
- `start_dev_session.sh` - Begin development session
- `update_context_for_ai.sh` - Refresh AI context
- `check_files.sh` - Verify project file status

## Docs Directory
- `ROADMAP.md` - Product roadmap and feature planning
- `tasks.md` - Current sprint tasks and priorities
- `PROJECT_STRUCTURE.md` - This file

## AI Context Directory
- `scripts/` - Generated implementation scripts
- `preferences.md` - AI assistant preferences
- `PROJECT_CONTEXT_*.md` - Timestamped context snapshots
- `session_state.json` - Development session tracking

## Quick Commands
- `./dev` - Start development session
- `./ai` - Prepare for AI assistance
- `./context auto` - Auto-detect file upload needs
