---
service: rnr-ai-elements
feature: UC-FOUND-02
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Library-local scheme state

Grep every shipped component for useColorScheme. Any component holding its own scheme state can desync from the host app and must fail review.
