---
service: rnr-ai-elements
feature: UC-AGENT-03
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Streamed plan arrives out of order

Titles arrive before items when driven by a streamed object. Render must tolerate a step with no items yet.
