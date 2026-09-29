---
service: docs-site
feature: journey-docs-delivery-arc
covers_ucs: [UC-DELIV-01, UC-DELIV-02, UC-DELIV-03]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# Ship a change from registry edit to cached edge, gated end to end

The maintainer path: edit `packages/registry`, run the ordered CI chain (registry:build -> gallery:manifest -> docs build, fail-closed gates naming any drift), merge behind green quality jobs, deploy as Workers static assets at the apex with tiered cache and security headers, and see the changed `/r/*.json` live within the 300s TTL window with the docs regenerated from the same deploy. The arc fails if a stale `public/r` tree, a red job, or a hand-edited generated file can reach production.

**Covers:** `UC-DELIV-01`, `UC-DELIV-02`, `UC-DELIV-03`
