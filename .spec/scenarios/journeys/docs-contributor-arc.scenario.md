---
service: docs-site
feature: journey-docs-contributor-arc
covers_ucs: [UC-EXT-02, UC-EXT-03, UC-DOCS-05, UC-GEND-07, UC-DELIV-01]
priority: P1
type: happy_path
tier: visible
test_tier: e2e
---
# Contribute without tribal knowledge

The contributor path: arrive from the GitHub README (which now exists, with LICENSE visible), read CONTRIBUTING (source-of-truth rule, the full CI gate list matching live ci.yml, the two-engine fan-out, release process), open `/porting` to pick the next unported upstream element from the mapping table, confirm the ledger is generated from `public/r` at build, and trust the fail-closed build chain to catch a stale tree. The arc fails if CONTRIBUTING lists a gate CI does not run (or omits one it does), or points anyone at hand-editing `public/r/`.

**Covers:** `UC-EXT-02`, `UC-EXT-03`, `UC-DOCS-05`, `UC-GEND-07`, `UC-DELIV-01`
