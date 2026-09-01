---
service: rnr-ai-elements
feature: UC-CHAT-03
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Double keyboard avoidance

Wrap Conversation in its own KeyboardAvoidingView as a consumer might. The composer must not float above the keyboard — that reads as a bug in our library specifically.
