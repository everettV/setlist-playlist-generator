#!/bin/bash

echo "🔍 Project Directory Analysis"
echo "============================="
echo ""

echo "📊 Current Structure:"
find . -maxdepth 3 -type f \
  | grep -v node_modules \
  | grep -v .git \
  | sort

echo ""
echo "🗂️ File Categories:"
echo "TypeScript files: $(find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l)"
echo "JavaScript files: $(find . -name "*.js" -o -name "*.jsx" | grep -v node_modules | wc -l)"
echo "Config files: $(find . -maxdepth 2 -name "*.json" -o -name "*.yaml" -o -name "*.yml" | wc -l)"
echo "Script files: $(find . -maxdepth 2 -name "*.sh" | wc -l)"
echo "Markdown files: $(find . -name "*.md" | wc -l)"

echo ""
echo "❓ Potential Issues:"

echo "Root directory clutter:"
find . -maxdepth 1 -type f | grep -v "package.json\|README.md\|\.env\|\.gitignore\|render.yaml" | head -10

echo ""
echo "Backup/temp files:"
find . -name "*.backup" -o -name "*.bak" -o -name "*.tmp" | head -10

echo ""
echo "Empty directories:"
find . -type d -empty | grep -v node_modules | head -10

echo ""
echo "Large files:"
find . -type f -size +1M | grep -v node_modules | head -5

echo ""
echo "🔧 Recommended Actions:"
echo "1. Move utility scripts to scripts/ directory"
echo "2. Organize context files in .ai_context/"
echo "3. Remove backup files"
echo "4. Create proper docs/ structure"
echo "5. Clean up root directory"
