---
flow_id: FLOW-GEND-03-home-counters-follow-version-bump
service: docs-site
feature: UC-GEND-01
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Counters track a version bump and an added item after rebuild

Simulate registry movement: bump the release version `0.2.1` -> `0.2.3` and add one `registry:ui` item to `packages/registry/registry.json` (57 items, 12 ui), then run the full chain `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` and re-open `/`.

**Expected**: the hero shows `0.2.3` and `57 items` split `39 / 12 / 6` — every counter derived from the rebuilt artifact. **Failure mode under test**: any counter still reading `0.2.1` or `56` after a clean rebuild proves a hardcoded literal survived in the template, which is exactly the drift this scenario exists to catch. Revert the fixture changes afterwards.
