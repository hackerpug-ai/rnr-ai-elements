---
service: rnr-ai-elements
feature: UC-CHAT-02
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# A 4MB generated image

Pass a large base64 image. Watch memory and jank — base64 through the bridge is the failure, not the render.
