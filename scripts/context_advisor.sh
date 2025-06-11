#!/bin/bash

echo "🤖 Context Advisor - File Requirements for AI Chat"
echo "================================================="
echo ""

if [ -z "$1" ]; then
    echo "Available development contexts:"
    echo ""
    jq -r 'to_entries[] | "  \(.key) - \(.value.description)"' file_requirements.json
    echo ""
    echo "Usage: ./context_advisor.sh <context_name>"
    echo "Example: ./context_advisor.sh artist_autocompletion"
    echo ""
    echo "Or run with 'auto' to detect based on recent changes:"
    echo "./context_advisor.sh auto"
    exit 0
fi

CONTEXT=$1

if [ "$CONTEXT" = "auto" ]; then
    echo "🔍 Auto-detecting context based on recent git changes..."
    
    # Check recent commits and modified files
    RECENT_FILES=$(git diff --name-only HEAD~3..HEAD 2>/dev/null || echo "")
    
    if echo "$RECENT_FILES" | grep -q "appleMusicService\|musicKit"; then
        CONTEXT="apple_music_debug"
        echo "Detected: Apple Music related changes"
    elif echo "$RECENT_FILES" | grep -q "Home.tsx\|ArtistSearch"; then
        CONTEXT="artist_autocompletion"
        echo "Detected: Frontend search changes"
    elif echo "$RECENT_FILES" | grep -q "server.ts\|api.ts"; then
        CONTEXT="backend_api_changes"
        echo "Detected: Backend API changes"
    elif echo "$RECENT_FILES" | grep -q "render.yaml\|package.json"; then
        CONTEXT="deployment_issues"
        echo "Detected: Deployment related changes"
    else
        echo "Could not auto-detect context. Please specify manually."
        exit 1
    fi
    echo ""
fi

# Check if context exists
if ! jq -e --arg ctx "$CONTEXT" '.[$ctx]' file_requirements.json > /dev/null 2>&1; then
    echo "❌ Context '$CONTEXT' not found."
    echo ""
    echo "Available contexts:"
    jq -r 'keys[]' file_requirements.json | sed 's/^/  /'
    exit 1
fi

DESCRIPTION=$(jq -r --arg ctx "$CONTEXT" '.[$ctx].description' file_requirements.json)
echo "📋 Context: $DESCRIPTION"
echo ""

echo "🔴 REQUIRED FILES (upload these):"
jq -r --arg ctx "$CONTEXT" '.[$ctx].required_files[]' file_requirements.json | while read file; do
    if [ -f "$file" ]; then
        echo "  ✅ $file (exists)"
    else
        echo "  ❌ $file (missing)"
    fi
done

echo ""
echo "🟡 OPTIONAL FILES (upload if relevant):"
jq -r --arg ctx "$CONTEXT" '.[$ctx].optional_files[]' file_requirements.json | while read file; do
    if [[ "$file" == *"*"* ]]; then
        # Handle wildcards
        echo "  📁 $file (check directory)"
    elif [ -f "$file" ]; then
        echo "  ✅ $file (exists)"
    else
        echo "  ⚪ $file (not found, may not exist yet)"
    fi
done

echo ""
echo "📝 COPY-PASTE FOR AI CHAT:"
echo "=========================================="
echo "Context: $DESCRIPTION"
echo ""
echo "Required files to upload:"
jq -r --arg ctx "$CONTEXT" '.[$ctx].required_files[]' file_requirements.json | sed 's/^/- /'
echo ""
echo "Optional files (if relevant to the issue):"
jq -r --arg ctx "$CONTEXT" '.[$ctx].optional_files[]' file_requirements.json | sed 's/^/- /'
echo "=========================================="
