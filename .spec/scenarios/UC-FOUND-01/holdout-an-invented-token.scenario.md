---
service: rnr-ai-elements
feature: UC-FOUND-01
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# An invented token

Add `bg-reasoning` to a component and build against a consumer theme that does not define it. Tailwind drops unknown utilities with no warning, so the component renders unstyled. The token-allowlist gate must catch it before that ships.
