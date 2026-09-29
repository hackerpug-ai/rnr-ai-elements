---
flow_id: FLOW-DOCS-02-tutorial-example-drift
service: docs-site
feature: UC-DOCS-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# Quickstart code that no longer matches apps/example fails

apps/example is upgraded (for example the AI SDK peer moves) but the quickstart snippets are not. The drift check parses the quickstart's declared peer (ai@7) and import paths and compares them against apps/example/package.json and the installed registry item's exports. Expected output: a healthy build has zero mismatches between the quickstart snippets and apps/example; a drifted build fails before deploy with a named diff, for example 'quickstart says ai@^7.0.0, apps/example has ai@7.1.2' or 'import { Conversation } from ... does not exist in the installed conversation item'.
