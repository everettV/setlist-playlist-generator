# AI ASSISTANT PREFERENCES - MANDATORY

## 🚨 CRITICAL TERMINAL REQUIREMENTS
**These preferences MUST be followed for all responses:**

### Command Format Rules:
- **NEVER use bash comments (#) in command blocks** - breaks VS Code terminal copy-paste
- **Use clean executable commands only** in ```bash blocks
- **No inline explanations in command lines**
- **Commands must work from project root without modification**

### Implementation Requirements:
- **Always generate executable scripts** in .ai_context/scripts/
- **Focus on implementation scripts over code display**
- **Use existing project patterns** (React/TypeScript/Node.js)
- **Include dependency installation** in implementations

## 🎨 UI DESIGN PRESERVATION - CRITICAL
**The UI design is SACRED and must NEVER be modified:**

### Mandatory UI Elements:
- **Abstract background**: `/assets/abstract-background.png` with glass effect
- **HeadphonesLogo**: Exact SVG design (DO NOT CHANGE)
- **Card styling**: `bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl`
- **Button animations**: `transform hover:scale-105 shadow-lg`
- **Title**: "🎵 Setlist Playlist Generator" (exact text + emoji)
- **Footer**: "Made by Elli Rego" attribution (DO NOT CHANGE)

### UI Reference Files:
- **Template**: `.ai_context/ui_templates/Home_template.tsx`
- **Specifications**: `.ai_context/design_specs/ui_requirements.md`
- **Verification**: `./scripts/preserve_ui_design.sh`

### UI Modification Rules:
1. **NEVER change** background, logo, or core layout
2. **NEVER modify** button styling or animations  
3. **NEVER alter** typography hierarchy or colors
4. **ONLY enhance** functionality within existing design
5. **ALWAYS verify** UI preservation after changes

**⚠️ Breaking UI design requirements is UNACCEPTABLE. Preserve visual identity at all costs.**
