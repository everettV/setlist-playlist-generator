#!/bin/bash

echo "📁 Project File Status Check"
echo "============================"
echo ""

# Check key project files
FILES=(
    "frontend/src/pages/Home.tsx"
    "frontend/src/services/api.ts"
    "frontend/src/services/musicKit.ts"
    "backend/src/server.ts"
    "backend/src/services/appleMusicService.ts"
    "backend/.env"
    "backend/AuthKey_CL75Y83769.p8"
    "ROADMAP.md"
    "tasks.md"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(wc -l < "$file" 2>/dev/null || echo "0")
        echo "✅ $file ($SIZE lines)"
    else
        echo "❌ $file (missing)"
    fi
done

echo ""
echo "📊 Project Structure:"
echo "Frontend: $(find frontend/src -name "*.tsx" -o -name "*.ts" | wc -l | tr -d ' ') TypeScript files"
echo "Backend: $(find backend/src -name "*.ts" | wc -l | tr -d ' ') TypeScript files"
echo "Config: $(find . -maxdepth 2 -name "*.json" -o -name "*.yaml" | wc -l | tr -d ' ') config files"
