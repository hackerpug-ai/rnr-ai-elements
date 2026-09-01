---
service: rnr-ai-elements
feature: UC-REG-01
priority: P1
type: edge_case
tier: holdout
test_tier: e2e
---
# Stale registry

Edit a component source without rebuilding public/r. CI must fail on staleness, or consumers silently get old code.
