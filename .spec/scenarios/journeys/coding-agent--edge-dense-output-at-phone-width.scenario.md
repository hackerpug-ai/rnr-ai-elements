---
service: rnr-ai-elements
feature: journey-coding-agent
covers_ucs: [UC-CODE-01, UC-CODE-02]
priority: P0
type: edge_case
tier: visible
test_tier: e2e
---
# Content that does not fit

Render simultaneously: a file tree 6 levels deep, a terminal line of 300 characters with raw ANSI green, a 5-level nested schema, and a stack trace inside the transcript. Every one must scroll rather than shrink — nothing below 12pt — ANSI must map to theme tokens so it is legible in light mode, and the height-capped stack trace must not create two competing vertical scrollers inside the transcript. This is one screen because these failures compound: each is survivable alone and unusable together.

**Covers:** `UC-CODE-01`, `UC-CODE-02`
