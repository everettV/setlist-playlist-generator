#!/bin/bash

echo "🤖 AI Chat Handoff Preparation"
echo "=============================="
echo ""

# Update context with current state
./update_context_for_ai.sh > /dev/null

# Embed preferences
./embed_preferences.sh AI_CONTEXT.md

echo "✅ Context updated with embedded preferences"
echo ""

# Auto-detect development state
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')
LAST_COMMIT=$(git log --oneline -1 2>/dev/null | cut -d' ' -f2- || echo 'No recent commits')

# Detect current focus
RECENT_FILES=$(git diff --name-only HEAD~3..HEAD 2>/dev/null || echo "")
if echo "$RECENT_FILES" | grep -q "autocomplet\|Artist"; then
    FOCUS="Artist Autocompletion"
    CONTEXT_HINT="artist_autocompletion"
elif echo "$RECENT_FILES" | grep -q "setlist\|multiple"; then
    FOCUS="Multiple Setlists Display"  
    CONTEXT_HINT="multiple_setlists"
elif echo "$RECENT_FILES" | grep -q "apple\|music"; then
    FOCUS="Apple Music Integration"
    CONTEXT_HINT="apple_music_debug"
else
    FOCUS="General Development"
    CONTEXT_HINT="auto"
fi

echo "🎯 Detected Focus: $FOCUS"
echo "📊 Status: $UNCOMMITTED uncommitted files on $BRANCH"
echo "📝 Last Work: $LAST_COMMIT"
echo ""

# Get file suggestions
echo "📁 Recommended Files to Upload:"
if [ "$CONTEXT_HINT" != "auto" ]; then
    ./context_advisor.sh "$CONTEXT_HINT" 2>/dev/null | grep -E "✅|❌" | head -5
else
    echo "   Run: ./context_advisor.sh auto"
fi

echo ""
echo "📋 READY FOR AI HANDOFF:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. ✅ AI_CONTEXT.md ready (preferences embedded)"
echo "2. 📤 Upload files listed above (minimal set)"
echo "3. 📋 Paste this exact summary:"
echo ""
echo "   Current task: $LAST_COMMIT"
echo "   Focus area: $FOCUS"  
echo "   Status: $UNCOMMITTED modified files"
echo "   Next: Continue implementation or start new feature"
echo ""
echo "4. 🚀 AI will have full context + preferences"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Auto-copy to clipboard
if command -v pbcopy >/dev/null 2>&1; then
    cat AI_CONTEXT.md | pbcopy
    echo "📋 Full context copied to clipboard!"
elif command -v xclip >/dev/null 2>&1; then
    cat AI_CONTEXT.md | xclip -selection clipboard
    echo "📋 Full context copied to clipboard!"
fi

echo ""
echo "💡 Pro tip: Save this output for easy reference!"
