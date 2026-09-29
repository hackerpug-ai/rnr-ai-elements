---
flow_id: FLOW-DOCS-06-release-link-rot
service: docs-site
feature: UC-DOCS-06
priority: P1
type: error_handling
tier: holdout
scope: task
---

# Release entries never link to dead component pages

The 0.2.1 entry links each touched component to its page. Rename a component slug in the registry so the entry now points at /components/old-name while the page builds at /components/new-name. Expected output: the link check fails naming /changelog/0.2.1 and the dead href. Healthy builds have every component link inside every release entry resolving 200.
