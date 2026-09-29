---
flow_id: FLOW-GEND-09-unmapped-family-item-fails-build
service: docs-site
feature: UC-GEND-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# A registry item added without a family mapping fails the build naming the item

Add a fixture item `weather-widget` (type `registry:component`) to `packages/registry/registry.json` but do NOT add it to the families map in `apps/docs`, then run the docs build chain.

**Expected**: the DocsDataPrebuild family-coverage gate fails the build with a non-zero exit and an error message naming the item, in the shape `[docs-data] family coverage: item "weather-widget" has no family mapping`. No `dist/` pages are emitted for the run — the site never publishes a component that silently appears outside all seven families. Revert the fixture afterwards.
