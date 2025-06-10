#!/bin/bash

echo "Generating project context..."

echo "# Project Context Export - $(date)" > PROJECT_CONTEXT.md
echo "" >> PROJECT_CONTEXT.md

echo "## Project Structure" >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
tree -I 'node_modules|.git|dist|build|coverage|.next|__pycache__|*.pyc' -L 3 >> PROJECT_CONTEXT.md 2>/dev/null || find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/build/*' | head -20 >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
echo "" >> PROJECT_CONTEXT.md

if [ -f "package.json" ]; then
    echo "## Dependencies (package.json)" >> PROJECT_CONTEXT.md
    echo '```json' >> PROJECT_CONTEXT.md
    cat package.json >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
elif [ -f "requirements.txt" ]; then
    echo "## Dependencies (requirements.txt)" >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
    cat requirements.txt >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
elif [ -f "Cargo.toml" ]; then
    echo "## Dependencies (Cargo.toml)" >> PROJECT_CONTEXT.md
    echo '```toml' >> PROJECT_CONTEXT.md
    cat Cargo.toml >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
fi
echo "" >> PROJECT_CONTEXT.md

echo "## Git Status" >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
git status --porcelain >> PROJECT_CONTEXT.md 2>/dev/null || echo "Not a git repository" >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
echo "" >> PROJECT_CONTEXT.md

echo "## Recent Commits" >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
git log --oneline -10 >> PROJECT_CONTEXT.md 2>/dev/null || echo "No git history" >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
echo "" >> PROJECT_CONTEXT.md

if [ -f ".env.example" ]; then
    echo "## Environment Variables Template" >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
    cat .env.example >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
fi
echo "" >> PROJECT_CONTEXT.md

if [ -f "README.md" ]; then
    echo "## README Content" >> PROJECT_CONTEXT.md
    cat README.md >> PROJECT_CONTEXT.md
fi

echo "Project context exported to PROJECT_CONTEXT.md"
echo "Copy and paste this file content into your next AI chat for full context!"

if command -v pbcopy >/dev/null 2>&1; then
    cat PROJECT_CONTEXT.md | pbcopy
    echo "Context copied to clipboard!"
elif command -v xclip >/dev/null 2>&1; then
    cat PROJECT_CONTEXT.md | xclip -selection clipboard
    echo "Context copied to clipboard!"
fi

if [ -f "ROADMAP.md" ]; then
    echo "" >> PROJECT_CONTEXT.md
    echo "## Current Roadmap" >> PROJECT_CONTEXT.md
    echo '```markdown' >> PROJECT_CONTEXT.md
    head -50 ROADMAP.md >> PROJECT_CONTEXT.md
    echo '```' >> PROJECT_CONTEXT.md
fi

echo "" >> PROJECT_CONTEXT.md
echo "## File Upload Guidance" >> PROJECT_CONTEXT.md
echo "Before uploading files to AI chat, run:" >> PROJECT_CONTEXT.md
echo '```bash' >> PROJECT_CONTEXT.md
echo "./context_advisor.sh <context_name>" >> PROJECT_CONTEXT.md
echo "# Available contexts: artist_autocompletion, multiple_setlists, apple_music_debug, etc." >> PROJECT_CONTEXT.md
echo '```' >> PROJECT_CONTEXT.md
