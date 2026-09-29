---
flow_id: FLOW-DELIV-01-unresolved-props-type
service: docs-site
feature: UC-DELIV-01
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Unresolved props type fails the build instead of shipping an empty table

ts-morph extraction must resolve every `registry:component` item's prop types. An unresolved import is a build failure, not an empty props table that reads as `no props`.

**Test inputs**: in one component source, change a type import from `../types` to `../types-renamed` (a module that does not exist) and run the chain.

**Expected outputs**:
- Build fails with an error like `unresolved props type for item: conversation (prop 'variant': cannot resolve '../types-renamed')`.
- A component that legitimately has zero props still builds — an empty resolved list is allowed; an unresolved type is not.
