#!/bin/bash

echo "🔍 Verifying Cleanup Results"
echo "============================"
echo ""

echo "📁 Root directory files:"
find . -maxdepth 1 -type f | sort

echo ""
echo "📂 Directory structure:"
find . -maxdepth 2 -type d | grep -v node_modules | grep -v .git | sort

echo ""
echo "🔧 Script availability:"
echo "Development shortcuts:"
for cmd in dev ai context; do
    if [ -x "./$cmd" ]; then
        echo "  ✅ ./$cmd"
    else
        echo "  ❌ ./$cmd (missing or not executable)"
    fi
done

echo ""
echo "Scripts directory:"
if [ -d "scripts" ]; then
    echo "  📁 scripts/ contains $(ls scripts/ | wc -l) files"
    ls scripts/ | head -5 | sed 's/^/    /'
else
    echo "  ❌ scripts/ directory missing"
fi

echo ""
echo "Documentation:"
if [ -d "docs" ]; then
    echo "  📁 docs/ contains $(ls docs/ | wc -l) files"
    ls docs/ | sed 's/^/    /'
else
    echo "  ❌ docs/ directory missing"
fi

echo ""
echo "AI Context:"
if [ -d ".ai_context" ]; then
    echo "  📁 .ai_context/ organized"
    ls .ai_context/ | sed 's/^/    /'
else
    echo "  ❌ .ai_context/ directory missing"
fi

cat << 'VERIFY_EOF'
✅ Cleanup verification complete!
VERIFY_EOF
