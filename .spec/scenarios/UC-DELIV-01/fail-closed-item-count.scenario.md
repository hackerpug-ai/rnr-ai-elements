---
flow_id: FLOW-DELIV-01-fail-closed-item-count
service: docs-site
feature: UC-DELIV-01
priority: P0
type: error_handling
tier: visible
scope: task
---

# Registry drift fails the build naming the mismatching item

When the enriched dataset is not exactly 56 items, the build must fail closed and name the item that drifted — never ship a quietly smaller site.

**Test inputs**: edit `packages/registry/registry.json` to remove one item (e.g. `streamdown`) while leaving the stale `public/r/` files in place, then run the CI chain.

**Expected outputs**:
- The existing registry freshness gate fails first if `public/r` is stale (the `git diff --exit-code` check shows dirty trees).
- If `public/r` was rebuilt to match the edit, the docs prebuild exits non-zero with an error like `expected exactly 56 registry items, got 55; missing: streamdown`.
- No `dist/` output is emitted and the CI run is red.
