---
flow_id: FLOW-DOCS-02-dead-example-link
service: docs-site
feature: UC-DOCS-02
priority: P1
type: error_handling
tier: holdout
scope: task
---

# The conclusion's example pointer resolves

The quickstart conclusion links to the apps/example worked integration. Someone renames the directory to apps/sample-app. Expected output: the link-integrity check fails, naming the quickstart page and the href that references the now-nonexistent apps/example path. On the healthy build, the conclusion's href contains apps/example, the repo path exists at HEAD, and any internal hop between the quickstart and the page that elaborates the example returns 200.
