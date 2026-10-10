# APX-007 cycle-1

## RED (by design at landing)
- Flow: FLOW-DELIV-03-112-file-completeness
- Command: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness
- Result: exit 1; all 112 URLs return 200 application/json with body.name match, but cache-control is `public, max-age=0, must-revalidate` (expected `public, max-age=300`).
- Evidence: tests/.../evidence/FLOW-DELIV-03-112-file-completeness/{proof.red,run.json} and .tmp/APX-007/cycle-1/red/

## GREEN at landing
- APX-007-url-set: 56 names, 2 engines, 112 URLs
- APX-007-tally-oracle: short engine B present=50 expected=56 fails; full list passes
- biome ci on the new spec: exit 0
- pnpm check:fallow: no new findings in changed files
- pnpm typecheck: exit 0 after generating gitignored docs data (not committed)
