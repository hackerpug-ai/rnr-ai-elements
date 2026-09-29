---
flow_id: FLOW-EXT-13-contributing-gate-list-complete
service: docs-site
feature: UC-EXT-03
priority: P1
type: happy_path
tier: visible
scope: task
---

# CONTRIBUTING lists every CI gate a PR must pass

A contributor whose PR goes red on an undocumented gate burns a CI round-trip and loses trust. Gate-list completeness is the load-bearing trust invariant for UC-EXT-03.

Test inputs:
- CONTRIBUTING.md from https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/CONTRIBUTING.md
- The live workflow at .github/workflows/ci.yml in the repo

Expected outputs:
- CONTRIBUTING names all the literal gates: typecheck, biome, vitest, registry freshness, expo-doctor, peer and permission contracts in both directions, 56-item integrity, design-token gate.
- The set of gates enforced by live ci.yml is a subset of the gates documented in CONTRIBUTING.
- The list matches the live ci.yml, not a remembered snapshot of it.
