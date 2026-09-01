---
service: rnr-ai-elements
feature: UC-VOICE-01
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Only final transcripts

Interim recognition results must not fire the change handler or the composer flickers on every word.
