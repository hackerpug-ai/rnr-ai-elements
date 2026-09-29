---
flow_id: FLOW-SHELL-05-sixth-island-appears
service: docs-site
feature: UC-SHELL-01
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Exactly five vanilla islands and zero framework hydration

Crawl ten routes: `/`, `/docs/introduction`, `/docs/installation`, `/docs/theming`, `/docs/quickstart`, `/components/message`, `/components/message-row`, `/registry`, `/changelog`, `/404`. Collect the union of custom elements defined by the site (dash-tagged elements that are not standard HTML). The union must be exactly five: `rnr-theme-toggle`, `rnr-search-dialog`, `rnr-tab-group`, `rnr-copy-button`, `rnr-ledger-filter` (adjust spellings to the shipped tag names — the count must be 5). Additionally assert zero `<astro-island>` elements, zero framework hydration payloads, and no react/react-dom runtime scripts anywhere in served HTML. A sixth island or any framework island is a planning decision, not an implementer addition — FAIL the suite.
