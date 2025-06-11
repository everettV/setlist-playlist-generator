#!/bin/bash

# Embeds preferences into any AI context file
# Usage: ./embed_preferences.sh <context_file>

CONTEXT_FILE="${1:-AI_CONTEXT.md}"
TEMP_FILE=$(mktemp)

if [ ! -f "$CONTEXT_FILE" ]; then
    echo "❌ Context file not found: $CONTEXT_FILE"
    exit 1
fi

# Create new context with preferences at top
cat > "$TEMP_FILE" << HEADER_EOF
# AI HANDOFF CONTEXT WITH EMBEDDED PREFERENCES

## 🚨 MANDATORY AI ASSISTANT PREFERENCES
**READ THIS FIRST - These preferences MUST be followed:**

### Terminal Command Rules (CRITICAL):
- **NEVER use bash comments (#)** in \`\`\`bash blocks - breaks VS Code terminal
- **Use clean commands only** - no inline explanations
- **Generate executable scripts** in .ai_context/scripts/ for implementations
- **Commands must work from project root** without modification

### Implementation Requirements:
- Provide **complete file contents** not snippets
- Follow **existing TypeScript/React/Node.js patterns**
- Include **dependency installation** in scripts
- Use **clean terminal syntax** throughout

---

HEADER_EOF

# Add original context
cat "$CONTEXT_FILE" >> "$TEMP_FILE"

# Replace original
mv "$TEMP_FILE" "$CONTEXT_FILE"

echo "✅ Preferences embedded in $CONTEXT_FILE"
