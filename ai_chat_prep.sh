#!/bin/bash

echo "🤖 Pre-AI Chat Preparation Checklist"
echo "====================================="
echo ""

# Update context
echo "1. 🔄 Updating project context..."
./update_context_for_ai.sh > /dev/null

# Check git status
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
    echo "2. ⚠️  You have $UNCOMMITTED uncommitted changes"
    echo "   Consider committing before AI session for better context"
else
    echo "2. ✅ All changes committed"
fi

# Suggest relevant files
echo "3. 📁 Suggested files to upload:"
./context_advisor.sh auto 2>/dev/null || {
    echo "   Run './context_advisor.sh <context>' to get specific file suggestions"
    echo "   Available contexts: artist_autocompletion, apple_music_debug, etc."
}

echo ""
echo "4. 📋 Context ready for copy-paste!"
echo "   - AI_CONTEXT.md contains full project context"
echo "   - File copied to clipboard (if supported)"
echo ""
echo "🎯 You're ready for an AI chat session!"
