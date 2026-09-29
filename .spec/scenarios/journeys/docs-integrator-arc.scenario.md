---
service: docs-site
feature: journey-docs-integrator-arc
covers_ucs: [UC-DOCS-01, UC-DOCS-02, UC-DOCS-04, UC-GEND-04, UC-GEND-07, UC-SHELL-03]
priority: P0
type: happy_path
tier: visible
test_tier: e2e
---
# Install and wire a chat screen end to end

The mid-integration path: open `/docs/installation`, answer the engine question exactly once (decision guide keyed to project facts), let the engine tab persist across pages, follow the single quickstart, open `/registry`, filter to the item, copy the per-row absolute-URL command, install the peers the dependency panel names, read the owns-vs-does-not boundary, and land in the example app wiring `useChat`. The arc fails if the engine choice leaks into a URL, resets mid-journey, or any copied command is short-name or relative.

**Covers:** `UC-DOCS-01`, `UC-DOCS-02`, `UC-DOCS-04`, `UC-GEND-04`, `UC-GEND-07`, `UC-SHELL-03`
