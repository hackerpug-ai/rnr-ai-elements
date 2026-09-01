---
service: rnr-ai-elements
feature: journey-coding-agent
covers_ucs: [UC-CODE-01, UC-CODE-02]
priority: P1
type: happy_path
tier: visible
test_tier: e2e
---
# Coding-agent output on a phone-width screen

A developer watches a coding agent work: browses the file tree, reads a commit, sees terminal output scroll horizontally without wrapping, expands a failing test, and reads a stack trace with each frame legible at phone width. Nothing shrinks below 12pt; content that does not fit scrolls.

**Covers:** `UC-CODE-01`, `UC-CODE-02`
