---
flow_id: FLOW-DELIV-02-deploy-on-red-tests
service: docs-site
feature: UC-DELIV-02
priority: P0
type: error_handling
tier: holdout
scope: task
---

# Red quality job must skip the deploy entirely

A failing quality job anywhere in the gate list must prevent any deploy from happening.

**Test inputs**: push a commit to main that fails exactly one vitest suite; repeat as variants with a red registry, typecheck, or lint job.

**Expected outputs**:
- GitHub Actions shows the deploy job as `Skipped` — not `Success`.
- `wrangler deployments list` shows no deployment attributable to that commit.
- `curl -s https://rnraielements.com/` still serves the previous deploy's content.
- Trap regressions: an `if: always()` on the deploy step, a missing entry in `needs:`, or a manual `workflow_dispatch` path that bypasses the gates each fail this scenario.
