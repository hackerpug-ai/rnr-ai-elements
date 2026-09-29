---
flow_id: FLOW-DELIV-02-preview-promotes
service: docs-site
feature: UC-DELIV-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# PR preview upload must never promote to production

PR previews use non-promoting `wrangler versions upload`; reviewers see the exact build without touching production.

**Test inputs**: open a PR changing the hero copy to a unique marker string; let the pull_request workflow run `wrangler versions upload` and comment the returned preview URL.

**Expected outputs**:
- The preview URL serves the marker.
- `curl -s https://rnraielements.com/` does NOT contain the marker.
- `wrangler deployments list` shows no production deployment attributable to the PR run.
- Trap regression: the PR workflow using `wrangler deploy` instead of `wrangler versions upload` fails this scenario by definition.
