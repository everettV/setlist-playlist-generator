# UI Design Requirements - MANDATORY

## 🎨 CRITICAL DESIGN ELEMENTS (NEVER CHANGE)
These elements define the core visual identity and must be preserved in ALL UI modifications:

### Background & Layout
- **Abstract background**: `/assets/abstract-background.png` as full-screen background
- **Glass morphism card**: `bg-white-95 backdrop-blur-sm rounded-2xl shadow-xl`
- **Centered layout**: `min-h-screen flex items-center justify-center p-4`
- **Card max-width**: `max-w-md mx-auto` (compact, not wide)

### Typography & Branding
- **Main title**: "🎵 Setlist Playlist Generator" (with music emoji)
- **Subtitle**: "Create Spotify playlists from concert setlists"
- **HeadphonesLogo**: Custom SVG component (see template)
- **Font hierarchy**: `text-3xl font-bold` for title, `text-gray-600` for subtitle

### Button Design (EXACT STYLING)
- **Spotify button**: `bg-green-500 hover:bg-green-600` with `🎵` emoji
- **Apple Music button**: `bg-gray-800 hover:bg-gray-900` with `🍎` emoji
- **Button effects**: `transform hover:scale-105 shadow-lg rounded-xl py-3 px-6`
- **Loading state**: Spinner with text "Creating Playlist..."

### Color Palette
- **Card background**: `bg-white-95` (95% opacity white)
- **Text primary**: `text-gray-800`
- **Text secondary**: `text-gray-600`
- **Success**: `text-green-600` with `bg-green-50 border-green-400`
- **Error**: `text-red-700` with `bg-red-50 border-red-400`
- **Accent**: `text-teal-600` for links

### Footer Attribution
- **Text**: "Made by **Elli Rego** using **Setlist.fm**, **Spotify**, and **Apple Music** APIs"
- **Links**: "Attributions" and "Feedback?" in `text-teal-600`
- **Border**: `border-t border-gray-200 mt-8 pt-6`

## 🚫 WHAT NEVER TO CHANGE
1. Abstract background image and positioning
2. Glass morphism card effect
3. HeadphonesLogo SVG design
4. Button hover animations and shadows
5. Color scheme and typography hierarchy
6. Footer attribution content and styling
7. Overall centered, compact layout

## ✅ WHAT CAN BE ENHANCED
1. Form fields and input styling (while maintaining design consistency)
2. Loading states and micro-interactions
3. Error/success message content
4. Additional features within the existing card layout
5. Accessibility improvements that don't affect visual design

## 📐 SPACING & PROPORTIONS
- **Card padding**: `p-8` (32px all around)
- **Section spacing**: `space-y-6` (24px between major sections)
- **Button spacing**: `space-y-3` (12px between buttons)
- **Icon size**: `w-16 h-16` for HeadphonesLogo
- **Border radius**: `rounded-2xl` for card, `rounded-xl` for buttons
