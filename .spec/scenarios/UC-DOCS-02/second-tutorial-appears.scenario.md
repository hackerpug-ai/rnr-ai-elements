---
flow_id: FLOW-DOCS-02-second-tutorial-appears
service: docs-site
feature: UC-DOCS-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# A second tutorial never ships

A well-meaning contributor adds another page marked kind: tutorial at /docs/tutorial-2, plus a second Tutorial entry in the navigation. Expected output: the build fails, naming guides/../tutorial-2.md (or the offending nav entry) and stating that /docs/quickstart is the single allowed tutorial. On the healthy build, the navigation shows exactly one tutorial entry and zero other pages carry a tutorial designation.
