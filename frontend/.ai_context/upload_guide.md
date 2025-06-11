# AI Handoff File Upload Guide

## 🎯 MINIMAL FILES FOR COMPLETE CONTEXT

### 1. ALWAYS UPLOAD (Core Context)
```
.ai_context/PROJECT_CONTEXT_YYYYMMDD_HHMMSS.md  # Latest timestamped context
.ai_context/preferences.md                       # AI behavior preferences
.ai_context/design_specs/ui_requirements.md      # UI preservation rules
```

### 2. UPLOAD BASED ON CURRENT FOCUS

#### If working on Frontend/UI:
```
frontend/src/pages/Home.tsx                      # Main UI component
frontend/src/components/ArtistAutocomplete.tsx   # Autocomplete component  
.ai_context/ui_templates/Home_template.tsx       # UI template reference
```

#### If working on Backend/API:
```
backend/src/server.ts                            # Main server file
backend/src/services/hybridArtistService.ts      # Artist search service
backend/src/services/musicBrainzService.ts       # MusicBrainz integration
```

#### If working on Fuzzy Search:
```
frontend/src/components/ArtistAutocomplete.tsx   # Frontend autocomplete
backend/src/services/hybridArtistService.ts      # Backend hybrid search
backend/src/services/musicBrainzService.ts       # MusicBrainz service
```

#### If working on Configuration/Deployment:
```
package.json                                     # Root dependencies
frontend/package.json                           # Frontend dependencies  
backend/package.json                            # Backend dependencies
render.yaml                                     # Deployment config
```

### 3. QUICK CONTEXT DETECTION
Run this command to get specific file recommendations:
```bash
./context_advisor.sh auto
```

## 📋 COPY-PASTE FOR AI CHAT

### Standard Context (Most Common):
Upload these 6 files for complete context:
1. `.ai_context/PROJECT_CONTEXT_YYYYMMDD_HHMMSS.md` (latest)
2. `.ai_context/preferences.md`
3. `.ai_context/design_specs/ui_requirements.md`
4. `frontend/src/pages/Home.tsx`
5. `frontend/src/components/ArtistAutocomplete.tsx`
6. `backend/src/services/hybridArtistService.ts`

### Paste this text in chat:
```
Current focus: [Describe what you're working on]
Context: Full project with fuzzy artist search implementation
UI: Abstract background design with glass morphism (NEVER change)
Tech: React/TypeScript frontend + Node.js backend + MusicBrainz API
Last session: [Brief description of last work]
```

## �� FILE SELECTION BY TASK

### Feature Development:
- Core context files (3)
- Relevant component files (2-3)
- Service files if backend changes needed

### Bug Fixing:
- Core context files (3)  
- Files related to the bug area
- Recent git changes: `git diff --name-only HEAD~3..HEAD`

### New Feature:
- Core context files (3)
- Files that will be modified
- Related service/component files

### Deployment Issues:
- Core context files (3)
- Configuration files (package.json, render.yaml)
- Environment/setup files

## ⚡ QUICK COMMANDS

### Get latest context file:
```bash
ls -la .ai_context/PROJECT_CONTEXT_*.md | tail -1
```

### Generate fresh context:
```bash
./scripts/update_context_for_ai.sh
```

### Auto-detect files needed:
```bash
./context_advisor.sh auto
```

### Check UI preservation:
```bash
./scripts/preserve_ui_design.sh
```

## 📊 CONTEXT QUALITY CHECKLIST

Before uploading, ensure:
- ✅ Latest PROJECT_CONTEXT file included
- ✅ UI preservation rules included  
- ✅ Relevant component/service files selected
- ✅ Files are under 100KB each (for AI processing)
- ✅ No sensitive data (API keys, etc.)

## 💡 PRO TIPS

1. **Always include preferences.md** - Ensures AI follows your terminal command requirements
2. **Include UI requirements** - Protects your beautiful design
3. **Use context_advisor.sh auto** - Gets exact files for current work
4. **Upload 5-8 files max** - Keeps context focused and processable
5. **Include brief description** - Helps AI understand current focus

