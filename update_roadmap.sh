#!/bin/bash

echo "📋 Setlist Playlist Generator - Roadmap Update"
echo "=============================================="
echo ""
echo "Current tasks:"
grep -E "^- \[ \]" tasks.md | head -5
echo ""
echo "Completed this session:"
grep -E "^- \[x\]" tasks.md | tail -3
echo ""
echo "Next priority:"
grep -A3 "## Immediate Next Actions" tasks.md | tail -3
echo ""
echo "Run './context_generator.sh' to update project context with latest roadmap"
