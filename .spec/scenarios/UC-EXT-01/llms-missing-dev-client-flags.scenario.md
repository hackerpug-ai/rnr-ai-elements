---
flow_id: FLOW-EXT-06-llms-missing-dev-client-flags
service: docs-site
feature: UC-EXT-01
priority: P1
type: edge_case
tier: holdout
scope: task
---

# llms-full.txt is missing Expo Go verdicts for the four dev-client items

An agent planning an Expo Go demo picks components from llms-full.txt. If the four opt-in dev-client items are not flagged, the agent builds a demo that cannot run in Expo Go.

Test inputs:
- https://rnraielements.com/llms-full.txt
- The gallery manifest booleans (single source: scripts/build-gallery-manifest.ts)

Expected outputs:
- All 56 items carry an explicit Expo Go verdict in llms-full.txt.
- The 4 opt-in items (enriched markdown, streamdown, speech recognition, extended audio) are flagged as requiring a dev client, with their peer dependencies (including the AI SDK v7 peers) and ios/android permission contracts matching the gallery manifest booleans.
- All other items are marked as running in Expo Go.
- A missing or contradictory verdict fails this scenario.
