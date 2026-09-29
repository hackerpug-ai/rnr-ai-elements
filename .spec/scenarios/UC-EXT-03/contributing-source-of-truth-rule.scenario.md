---
flow_id: FLOW-EXT-12-contributing-source-of-truth-rule
service: docs-site
feature: UC-EXT-03
priority: P1
type: happy_path
tier: visible
scope: task
---

# CONTRIBUTING states the source-of-truth rule, the two-engine fan-out, and the release process

No CONTRIBUTING exists today; tribal knowledge is the only guide. This is the shipped-state contract.

Test inputs:
- GET https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/CONTRIBUTING.md

Expected outputs:
- HTTP 200 with a source-of-truth section: edit packages/registry/ (registry.json plus item sources); never hand-edit the generated trees under public/r/.
- A fan-out section: one source fans out to both engine trees via `pnpm registry:build`, producing public/r/nativewind/ and public/r/uniwind/.
- A release-process section: tag vX.Y.Z and write GitHub release notes matching the site changelog entry for that version.
