---
flow_id: FLOW-DOCS-01-no-js-installation-panels
service: docs-site
feature: UC-DOCS-01
priority: P0
type: edge_case
tier: holdout
scope: task
---

# Installation engine tabs read without JavaScript

Read /docs/installation with JavaScript disabled in the HTTP client (fetch the raw server response, never a hydrated browser DOM). Expected output: the raw HTML contains both labeled panels, nativewind and uniwind, before any script executes. The nativewind panel includes at least one command pointing at /r/nativewind/ and the uniwind panel includes at least one pointing at /r/uniwind/. Neither panel's content depends on hydration to exist in the served bytes.
