# Current Sprint Tasks

## Sprint 1: Enhanced Search (In Progress)

### Artist Name Autocompletion
- [ ] Research Setlist.fm artist search API endpoints
- [ ] Implement debounced search input
- [ ] Create dropdown suggestion component
- [ ] Add keyboard navigation (up/down arrows)
- [ ] Handle API rate limiting

### Multiple Setlists Display
- [ ] Update backend API to return multiple setlists
- [ ] Create setlist selection UI component
- [ ] Add date/venue sorting options
- [ ] Implement pagination for large result sets

### Individual Set Lookup
- [ ] Design URL structure for deep linking
- [ ] Add search by venue/date functionality
- [ ] Create shareable setlist URLs
- [ ] Implement QR code generation

## Immediate Next Actions
1. **Today**: Research Setlist.fm artist API documentation
2. **This Week**: Implement artist autocompletion frontend
3. **Next Week**: Update backend for multiple setlists

## Technical Debt
- [ ] Add proper error boundaries in React
- [ ] Implement loading skeletons instead of spinners
- [ ] Add unit tests for API functions
- [ ] Set up CI/CD pipeline
- [ ] Add monitoring and analytics

## Ideas Parking Lot
- Voice search for artist names
- Offline mode with cached setlists
- Dark mode theme
- Keyboard shortcuts for power users
- Export playlists to CSV/JSON

## Development Workflow
1. `./start_dev_session.sh` - Begin coding session
2. Work on features/fixes
3. `git add . && git commit -m "description"` - Auto-updates context
4. `./ai_chat_prep.sh` - Prepare for AI assistance
5. Upload suggested files + paste AI_CONTEXT.md content

## Context Maintenance Commands
- `./update_context_for_ai.sh` - Manual context refresh
- `./context_advisor.sh auto` - Auto-detect what files to share
- `./check_files.sh` - Verify project file status
