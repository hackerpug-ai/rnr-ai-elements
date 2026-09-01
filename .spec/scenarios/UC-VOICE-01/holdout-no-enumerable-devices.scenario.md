---
service: rnr-ai-elements
feature: UC-VOICE-01
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# No enumerable devices

iOS and Android do not expose an arbitrary input device list the way a browser does. Verify the picker offers real audio routes, not a fabricated device list.
