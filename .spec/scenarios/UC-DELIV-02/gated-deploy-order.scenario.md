---
flow_id: FLOW-DELIV-02-gated-deploy-order
service: docs-site
feature: UC-DELIV-02
priority: P0
type: happy_path
tier: visible
scope: task
---

# Deploy to Cloudflare Workers runs only after all quality jobs green

A push to main must produce exactly this job order: registry, typecheck, lint, test, then deploy — with the deploy job declared `needs: [registry, typecheck, lint, test]`.

**Test inputs**: push a docs change to main and watch the workflow.

**Expected outputs**:
- The deploy job runs cloudflare/wrangler-action executing `wrangler deploy` with the `CLOUDFLARE_API_TOKEN` secret (scope: Account Workers Scripts Edit + Account Settings Read; Zone Workers Routes Edit).
- Logs show the `dist/` output uploaded as static assets (`assets.directory = ./dist`).
- `curl -sI https://rnraielements.com/` returns `200` with `content-type: text/html`.
