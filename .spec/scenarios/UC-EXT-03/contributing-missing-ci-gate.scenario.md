---
flow_id: FLOW-EXT-14-contributing-missing-ci-gate
service: docs-site
feature: UC-EXT-03
priority: P1
type: edge_case
tier: holdout
scope: task
---

# A PR goes red on a gate CONTRIBUTING never mentioned

CONTRIBUTING lists 8 of the 9 gates, omitting the design-token gate. A contributor passes every documented check, pushes, and CI rejects the PR.

Test inputs:
- Gate and check identifiers extracted from live .github/workflows/ci.yml (job names, step names, check names)
- The documented gate list from CONTRIBUTING.md

Expected outputs:
- (enforced gates in ci.yml) minus (documented gates in CONTRIBUTING) is the empty set.
- The assertion explicitly covers the design-token gate, the historically omitted example.
- Any gate enforced in CI but absent from CONTRIBUTING fails this scenario.
