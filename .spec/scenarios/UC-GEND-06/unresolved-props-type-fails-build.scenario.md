---
flow_id: FLOW-GEND-38-unresolved-props-type-fails-build
service: docs-site
feature: UC-GEND-06
priority: P1
type: error_handling
tier: holdout
scope: task
---

# An unresolved props type fails the build naming the item

Inject the gap: change a fixture component's props interface to reference a type ts-morph cannot resolve (e.g. an import from a package not present in the extraction context), then run the docs build chain.

**Expected**: the prebuild fails with a non-zero exit naming the item, in the shape `[docs-data] props: unresolved type in "checkpoint" props interface`. Per the gate design, an EMPTY resolved props list is legal, but an UNRESOLVED type is a build failure — the alternative is a table silently showing `any` for real typed props, which teaches integrators the wrong contract.
