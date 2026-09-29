---
flow_id: FLOW-EXT-16-contributing-phantom-gate
service: docs-site
feature: UC-EXT-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# CONTRIBUTING documents a CI gate that no longer exists

Drift in the other direction: eslint was folded into biome, but CONTRIBUTING still lists eslint. Contributors satisfy a check that no longer runs, and the real lint gate goes unread.

Test inputs:
- The documented gate list from CONTRIBUTING.md
- Gate and check identifiers extracted from live .github/workflows/ci.yml

Expected outputs:
- (documented gates) minus (enforced gates in ci.yml) is the empty set, allowing only explicit naming aliases (for example lint mapping to biome).
- A documented gate with no corresponding live CI enforcement - a phantom gate - fails this scenario.
