---
service: rnr-ai-elements
feature: UC-CHAT-04
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Queue during stream

Queue two follow-ups mid-response and remove the first. Order is preserved and the removed one never sends.
