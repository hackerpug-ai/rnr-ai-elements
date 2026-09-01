---
service: rnr-ai-elements
feature: UC-CHAT-02
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Expo Go without a dev client

Install message in an Expo Go session. It must render with the plain Text fallback, not crash. If message hard-binds the native markdown module, the whole chat shell becomes dev-client-only.
