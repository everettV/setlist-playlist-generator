#!/bin/bash

# Update session tracking
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
SESSION_FILE=".ai_context/session_state.json"

# Update session info
jq --arg timestamp "$TIMESTAMP" \
   --arg feature "${1:-unknown}" \
   '.last_handoff = $timestamp | .current_feature = $feature | .handoff_count += 1' \
   "$SESSION_FILE" > "${SESSION_FILE}.tmp" && mv "${SESSION_FILE}.tmp" "$SESSION_FILE"

echo "📊 Session updated: $(jq -r .handoff_count $SESSION_FILE) handoffs for feature: ${1:-unknown}"
