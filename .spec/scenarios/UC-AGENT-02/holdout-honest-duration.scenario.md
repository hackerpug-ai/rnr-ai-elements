---
service: rnr-ai-elements
feature: UC-AGENT-02
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Honest duration

Hardcode isStreaming true and check the duration label. If it counts forever, the duration is decorative rather than measured.
