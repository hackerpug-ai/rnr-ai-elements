---
service: rnr-ai-elements
feature: UC-CODE-02
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Literal escape codes

If ANSI parsing is missing, the user sees \x1b[32m printed. Confirm parsing, not stripping.
