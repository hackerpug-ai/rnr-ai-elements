---
flow_id: FLOW-EXT-11-release-notes-disagree-with-site-changelog
service: docs-site
feature: UC-EXT-02
priority: P1
type: edge_case
tier: holdout
scope: task
---

# GitHub release notes disagree with the site changelog

Tags v0.2.0 and v0.2.1 exist with NO GitHub release notes today. The shipped state adds them; the risk is drift between the two changelogs.

Test inputs:
- All releases at https://github.com/hackerpug-ai/rnr-ai-elements/releases
- All entries at https://rnraielements.com/changelog

Expected outputs:
- Every version tag (starting with v0.2.0 and v0.2.1) has a corresponding GitHub release.
- Per version: the release date and the added / changed / fixed lists correspond item-for-item with the site changelog entry - no extra items, no missing items, no different dates.
- The set of versions matches in both directions: no site-only versions and no GitHub-only versions.
