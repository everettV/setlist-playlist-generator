#!/bin/bash

echo "🧹 Project Directory Cleanup"
echo "============================"
echo ""

read -p "Proceed with cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 1
fi

echo "📁 Creating organized directory structure..."

mkdir -p scripts
mkdir -p docs
mkdir -p .ai_context/{scripts,templates}
mkdir -p config

echo "🚚 Moving files to proper locations..."

if [ -f "ai_chat_prep.sh" ]; then
    mv ai_chat_prep.sh scripts/
    echo "  ✅ Moved ai_chat_prep.sh to scripts/"
fi

if [ -f "check_files.sh" ]; then
    mv check_files.sh scripts/
    echo "  ✅ Moved check_files.sh to scripts/"
fi

if [ -f "context_advisor.sh" ]; then
    mv context_advisor.sh scripts/
    echo "  ✅ Moved context_advisor.sh to scripts/"
fi

if [ -f "context_generator.sh" ]; then
    mv context_generator.sh scripts/
    echo "  ✅ Moved context_generator.sh to scripts/"
fi

if [ -f "start_dev_session.sh" ]; then
    mv start_dev_session.sh scripts/
    echo "  ✅ Moved start_dev_session.sh to scripts/"
fi

if [ -f "update_context_for_ai.sh" ]; then
    mv update_context_for_ai.sh scripts/
    echo "  ✅ Moved update_context_for_ai.sh to scripts/"
fi

if [ -f "update_roadmap.sh" ]; then
    mv update_roadmap.sh scripts/
    echo "  ✅ Moved update_roadmap.sh to scripts/"
fi

if [ -f "ai_handoff.sh" ]; then
    mv ai_handoff.sh scripts/
    echo "  ✅ Moved ai_handoff.sh to scripts/"
fi

if [ -f "embed_preferences.sh" ]; then
    mv embed_preferences.sh scripts/
    echo "  ✅ Moved embed_preferences.sh to scripts/"
fi

if [ -f "update_session.sh" ]; then
    mv update_session.sh scripts/
    echo "  ✅ Moved update_session.sh to scripts/"
fi

echo ""
echo "📋 Moving documentation..."

if [ -f "ROADMAP.md" ]; then
    mv ROADMAP.md docs/
    echo "  ✅ Moved ROADMAP.md to docs/"
fi

if [ -f "tasks.md" ]; then
    mv tasks.md docs/
    echo "  ✅ Moved tasks.md to docs/"
fi

if [ -f "PROJECT_CONTEXT.md" ]; then
    mv PROJECT_CONTEXT.md .ai_context/
    echo "  ✅ Moved PROJECT_CONTEXT.md to .ai_context/"
fi

if [ -f "AI_CONTEXT.md" ]; then
    mv AI_CONTEXT.md .ai_context/
    echo "  ✅ Moved AI_CONTEXT.md to .ai_context/"
fi

echo ""
echo "🗑️ Removing backup and temporary files..."

find . -name "*.backup" -delete
find . -name "*.bak" -delete
find . -name "*.tmp" -delete
find . -name ".DS_Store" -delete

echo "  ✅ Removed backup and system files"

echo ""
echo "⚙️ Moving config files..."

if [ -f "render.yaml" ]; then
    mv render.yaml config/
    echo "  ✅ Moved render.yaml to config/"
fi

if [ -f "file_requirements.json" ]; then
    mv file_requirements.json .ai_context/
    echo "  ✅ Moved file_requirements.json to .ai_context/"
fi

echo ""
echo "🔗 Creating convenience shortcuts in root..."

cat > dev << 'SCRIPT_EOF'
#!/bin/bash
./scripts/start_dev_session.sh "$@"
SCRIPT_EOF

cat > ai << 'SCRIPT_EOF'
#!/bin/bash
./scripts/ai_handoff.sh "$@"
SCRIPT_EOF

cat > context << 'SCRIPT_EOF'
#!/bin/bash
./scripts/context_advisor.sh "$@"
SCRIPT_EOF

chmod +x dev ai context

echo "  ✅ Created shortcuts: ./dev, ./ai, ./context"

echo ""
echo "📁 Updating script references..."

find scripts/ -name "*.sh" -exec sed -i 's|\.\/context_advisor\.sh|\.\/scripts\/context_advisor\.sh|g' {} \;
find scripts/ -name "*.sh" -exec sed -i 's|\.\/update_context_for_ai\.sh|\.\/scripts\/update_context_for_ai\.sh|g' {} \;
find scripts/ -name "*.sh" -exec sed -i 's|\.\/embed_preferences\.sh|\.\/scripts\/embed_preferences\.sh|g' {} \;

echo "  ✅ Updated script cross-references"

echo ""
echo "📝 Creating new project structure documentation..."

cat > docs/PROJECT_STRUCTURE.md << 'STRUCT_EOF'
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
STRUCT_EOF

echo ""
cat << 'INFO_EOF'
✅ Project cleanup completed!

📊 New Structure:
  scripts/     - All utility scripts
  docs/        - Documentation
  .ai_context/ - AI assistance files
  config/      - Configuration files

🚀 Quick commands available:
  ./dev        - Start development
  ./ai         - Prepare AI handoff
  ./context    - Get file advice

📋 Next: Run './dev' to start your next session!
INFO_EOF
