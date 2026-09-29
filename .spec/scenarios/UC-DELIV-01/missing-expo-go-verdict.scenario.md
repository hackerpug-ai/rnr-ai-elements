---
flow_id: FLOW-DELIV-01-missing-expo-go-verdict
service: docs-site
feature: UC-DELIV-01
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Missing Expo Go verdict fails the build naming the item

Every item must carry a boolean `expoGo` verdict from the gallery manifest, because ledger rows and component status chips render it unconditionally.

**Test inputs**: produce a gallery-manifest output where one item (e.g. `extended-audio`) lacks the `expoGo` boolean, then run the chain.

**Expected outputs**:
- Prebuild fails with `expoGo verdict absent for item: extended-audio`.
- Happy-path companion check: the 4 opt-in dev-client items (enriched markdown, streamdown, speech recognition, extended audio) enrich with `expoGo: false` plus their peer and permission contracts.
