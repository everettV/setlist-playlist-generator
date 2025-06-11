# AI ASSISTANT PREFERENCES - MANDATORY

## 🚨 CRITICAL TERMINAL REQUIREMENTS
**These preferences MUST be followed for all responses:**

### Command Format Rules:
- **NEVER use bash comments (#) in command blocks** - breaks VS Code terminal copy-paste
- **Use clean executable commands only** in ```bash blocks
- **No inline explanations in command lines**
- **Commands must work from project root without modification**

### WRONG (breaks terminal):
```bash
# Install dependencies
npm install lodash

# Create the service file  
cat > file.ts << 'EOF'
```

### CORRECT (terminal-ready):
```bash
npm install lodash
cat > file.ts << 'EOF'
```

## 📝 Implementation Preferences:
- **Always generate executable scripts** in .ai_context/scripts/
- **Provide complete file contents** not partial snippets
- **Use existing project patterns** (React/TypeScript/Node.js)
- **Include dependency installation** in implementations
- **Test commands actually work** from project root

## 🎯 Response Format:
- Start with **executable terminal commands**
- Follow with **brief explanation** if needed
- End with **next steps or testing instructions**
- **No lengthy explanations before giving solutions**

## 🔧 Project Context:
- **TypeScript/React frontend** with Tailwind CSS
- **Node.js/Express backend** with TypeScript
- **APIs**: Setlist.fm, Spotify, Apple Music
- **Current focus**: Artist autocompletion and multiple setlists

These preferences override any default AI behaviors. Always prioritize terminal compatibility.
