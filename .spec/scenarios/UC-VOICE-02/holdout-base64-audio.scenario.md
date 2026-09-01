---
service: rnr-ai-elements
feature: UC-VOICE-02
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Base64 audio

A long TTS clip arrives as base64. Verify it is written to cache and played from a file URI rather than streamed as a data URI.
