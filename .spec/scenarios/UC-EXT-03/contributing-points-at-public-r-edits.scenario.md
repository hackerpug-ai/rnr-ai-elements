---
flow_id: FLOW-EXT-15-contributing-points-at-public-r-edits
service: docs-site
feature: UC-EXT-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# CONTRIBUTING points contributors at editing public/r/ by hand

An adversarial revision suggests: for small fixes, update the JSON under public/r/nativewind/ directly. A contributor or agent follows it and the registry freshness gate rejects the PR.

Test inputs:
- CONTRIBUTING.md at https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/CONTRIBUTING.md
- Optional live half: a scratch-branch hand-edit of a file under public/r/

Expected outputs:
- CONTRIBUTING names packages/registry/ as the only editable source and states that public/r/ is generated (and gitignored).
- No edit instruction in CONTRIBUTING targets public/r/; the only acceptable mentions explain it is generated-only.
- In the live half, the hand-edit fails the registry freshness gate via a non-empty git diff after `pnpm registry:build`.
