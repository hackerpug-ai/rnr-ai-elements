---
flow_id: FLOW-DOCS-02-untabbed-engine-snippet
service: docs-site
feature: UC-DOCS-02
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Engine-specific quickstart code outside a tab is a failure

A tutorial edit pastes an engine-varying snippet directly into the page body, bypassing the tab component, so every reader sees the uniwind command regardless of choice. Scan the built /docs/quickstart HTML for engine-varying material outside labeled tab groups: bare /r/uniwind/ or /r/nativewind/ commands, and prose that names only one engine. Expected output: zero engine-varying snippets occur outside a tab group; when one is planted, the check fails and reports the offending heading and the engine it silently favored.
