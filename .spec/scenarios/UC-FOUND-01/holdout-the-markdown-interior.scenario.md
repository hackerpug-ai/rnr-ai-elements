---
service: rnr-ai-elements
feature: UC-FOUND-01
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# The markdown interior

Render an assistant message containing headings, a link, bold text and a fenced block. Swap the theme. The markdown body must recolor too. Prior art hardcoded DARK_MARKDOWN_STYLE and shipped no light object at all, so this is the exact place the promise breaks and nothing errors.
