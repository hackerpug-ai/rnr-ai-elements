---
service: docs-site
feature: journey-docs-evaluator-arc
covers_ucs: [UC-GEND-01, UC-GEND-02, UC-GEND-03, UC-GEND-05, UC-GEND-06, UC-DOCS-06]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# Evaluate the library in one visit

The persona path the whole site exists for: land on `/` cold, read what this is and that it is not an npm package, see the health counters (v0.2.1, 56 items, 39/11/6), open `/components` and browse a family, open a component page (install block first, chip row, verdict badge), scan the QR to try the gallery in Expo Go, check `/changelog` for signs of life, and leave with the exact install command copied. The arc fails if any hop dead-ends, any counter is hardcoded, or the copied command is not the absolute-URL form.

**Covers:** `UC-GEND-01`, `UC-GEND-02`, `UC-GEND-03`, `UC-GEND-05`, `UC-GEND-06`, `UC-DOCS-06`
