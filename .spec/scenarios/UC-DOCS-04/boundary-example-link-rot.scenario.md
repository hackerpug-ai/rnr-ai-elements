---
flow_id: FLOW-DOCS-04-boundary-example-link-rot
service: docs-site
feature: UC-DOCS-04
priority: P1
type: error_handling
tier: holdout
scope: task
---

# The boundary's example-app link survives repo changes

The example app directory is renamed in the repo without updating the boundary page. Expected output: the link-integrity check fails, naming /docs/owns-vs-does-not-own and the href that references a path not present at repo HEAD. On the healthy build, the href targets the live example location and any internal hop between the boundary page and the example's page returns 200.
