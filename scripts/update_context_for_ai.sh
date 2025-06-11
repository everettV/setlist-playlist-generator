#!/bin/bash

echo "🔄 Updating project context for AI assistance..."
echo "=============================================="

# Generate fresh context
./context_generator.sh

# Update AI context with current timestamp and status
cat > AI_CONTEXT.md << 'INNER_EOF'
AI Assistance Context - Updated $(date)

How to Use This File
Copy the entire contents of this file and paste it into a new AI chat session to provide full project context.

Quick Project Summary
- Last Updated: $(date)
- Current Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
- Uncommitted Changes: $(git status --porcelain | wc -l | tr -d ' ') files
- Recent Commits: $(git log --oneline -3 | wc -l | tr -d ' ') commits

INNER_EOF

# Append the generated project context
cat PROJECT_CONTEXT.md >> AI_CONTEXT.md

# Add current development focus
cat >> AI_CONTEXT.md << 'INNER_EOF'

## Current Development Focus
Based on recent changes and roadmap:

INNER_EOF

# Auto-detect current focus based on recent changes
RECENT_FILES=$(git diff --name-only HEAD~3..HEAD 2>/dev/null || echo "")
if echo "$RECENT_FILES" | grep -q "appleMusicService\|musicKit"; then
    echo "- 🍎 Apple Music integration debugging and improvements" >> AI_CONTEXT.md
elif echo "$RECENT_FILES" | grep -q "Home.tsx\|ArtistSearch\|autocomplet"; then
    echo "- 🔍 Artist search and autocompletion features" >> AI_CONTEXT.md
elif echo "$RECENT_FILES" | grep -q "server.ts\|api.ts"; then
    echo "- 🔧 Backend API development and enhancements" >> AI_CONTEXT.md
elif echo "$RECENT_FILES" | grep -q "ROADMAP\|tasks"; then
    echo "- 📋 Project planning and roadmap updates" >> AI_CONTEXT.md
else
    echo "- 🚀 General development and maintenance" >> AI_CONTEXT.md
fi

# Add next priority from roadmap
if [ -f "tasks.md" ]; then
    echo "" >> AI_CONTEXT.md
    echo "## Next Priority Tasks:" >> AI_CONTEXT.md
    grep -A5 "## Immediate Next Actions" tasks.md | tail -4 >> AI_CONTEXT.md
fi

# Add file upload guidance
cat >> AI_CONTEXT.md << 'INNER_EOF'

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

INNER_EOF

echo "✅ Context updated successfully!"
echo "📋 AI_CONTEXT.md ready for copy-paste into AI chats"

# Show current stats
echo ""
echo "📊 Current Status:"
echo "  - Files changed recently: $(echo "$RECENT_FILES" | wc -l | tr -d ' ')"
echo "  - Total project files: $(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l | tr -d ' ')"
echo "  - Context file size: $(wc -w < AI_CONTEXT.md) words"

# Auto-copy to clipboard if available
if command -v pbcopy >/dev/null 2>&1; then
    cat AI_CONTEXT.md | pbcopy
    echo "  - Context copied to clipboard! 📋"
elif command -v xclip >/dev/null 2>&1; then
    cat AI_CONTEXT.md | xclip -selection clipboard
    echo "  - Context copied to clipboard! 📋"
fi
