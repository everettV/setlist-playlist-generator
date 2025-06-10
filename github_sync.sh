#!/bin/bash
COMMIT_MESSAGE=${1:-"Update project context"}

./context_generator.sh

cat > AI_CONTEXT.md << 'INNER_EOF'
AI Assistance Context

How to Use This File
Copy the entire contents of this file and paste it into a new AI chat session to provide full project context.

Quick Project Summary
- Last Updated: $(date)
- Current Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
- Status: $(git status --porcelain | wc -l | tr -d ' ') uncommitted changes

INNER_EOF

cat PROJECT_CONTEXT.md >> AI_CONTEXT.md

cat >> AI_CONTEXT.md << 'INNER_EOF'

Instructions for AI
- Provide copy-paste terminal commands when suggesting code changes
- Follow the existing project structure and patterns
- Include proper error handling and validation
- Suggest test cases for new features
- Format responses for easy implementation

Current Development Focus
[Manually update this section with your current goals]

INNER_EOF

git add .
git commit -m "$COMMIT_MESSAGE"
git push

echo "✅ Project context synced to GitHub!"
echo "📋 AI_CONTEXT.md is ready to copy-paste into AI chats"
echo "🔗 Share this file: $(git remote get-url origin)/blob/$(git branch --show-current)/AI_CONTEXT.md"
