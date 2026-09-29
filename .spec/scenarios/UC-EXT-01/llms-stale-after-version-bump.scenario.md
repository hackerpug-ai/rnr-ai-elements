---
flow_id: FLOW-EXT-04-llms-stale-after-version-bump
service: docs-site
feature: UC-EXT-01
priority: P1
type: edge_case
tier: holdout
scope: task
---

# llms.txt still describes the previous release after a version bump

A maintainer bumps the registry (example: v0.2.1 to v0.2.2, adding one item and renaming another) and runs the release chain. The site HTML updates - the question is whether the machine-readable docs do too.

Test inputs:
- A build where packages/registry/registry.json gains one item and renames one item relative to the currently deployed llms.txt
- The full chain `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build`

Expected outputs:
- llms.txt and llms-full.txt report the new version and new item count, include the new item install command, and contain no reference to the renamed item old URL.
- Every URL named in llms-full.txt resolves HTTP 200 when fetched live; a 404 on a pre-rename URL proves staleness and fails the scenario.
- No independently-updated copy of llms.txt content exists in the repo; regeneration happens only via the CI chain.
