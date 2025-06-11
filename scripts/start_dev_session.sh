#!/bin/bash

echo "🚀 Starting Development Session"
echo "==============================="
echo ""

# Update all context files
./update_context_for_ai.sh

echo ""
echo "🔍 Development Context Analysis:"

# Auto-detect what you should work on
./context_advisor.sh auto 2>/dev/null || echo "Run './context_advisor.sh' to see what files you might need"

echo ""
echo "📝 Quick Commands:"
echo "  ./context_advisor.sh <context>  - Get file upload guidance"
echo "  ./update_roadmap.sh            - Check current tasks"
echo "  ./update_context_for_ai.sh     - Refresh context for AI"
echo "  npm run dev                     - Start development servers"
echo ""
echo "Ready for development! 🎵"
