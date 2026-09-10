# Gate Results: sprint-01-docs-spike-skeleton

## ✅ VERIFIED — recomputed pass == claimed pass; 10/10 recomputed; 0 discrepancies

proof: `.spec/prds/docs-site/tasks/sprint-01-docs-spike-skeleton/gate-verification.json`
(`verify-gate-evidence.sh:recompute@b7a58510f9bd`, written 2026-09-10T21:23:22Z)

**Date:** 2026-09-10 · **Sprint:** sprint-01-docs-spike-skeleton (docs-spike-skeleton, Phase 1)
**Environment:** local clean tree @ main `6d1e06d`; real pnpm workspace; real Astro 7.3.2 build (43 pages); real astro preview :4321; real Chromium (desktop / mobile / nojs projects)
**Exec surface:** cmux `surface:442` (B38F8259-9CD5-41CE-A41A-2D0F797C2389) — steps 1–2 via the exec pane; steps 3–10 played via `run_flow` inline after the pane transport dropped sends (evidence identical: cmd_sha-stamped logs; degradation recorded in gate-results.json `exec_surface`)
**UI driver:** playwright-chromium (the lane's own runner driving the real built site)

## Summary

✅ 10/10 steps passed · ❌ 0 failed · 🔧 0 wiring gaps (this run)

Every step is a **locked flow** (human-flows.json): the real documented invocation, replayed by `run_flow.py`, machine-graded on five gates — exit 0, fresh artifact, surface-entry lint, cold-boot lint, and a watched RED proof captured with `--expect red` before green.

## Per-Step Results

| # | Gate (short) | Method | Result | Evidence |
|---|---|---|---|---|
| 1 | Clean-clone build chain lists docs package, ordered markers, dist/ | locked-flow | ✅ pass | step1.log — 1/1 flows PASS, GATE-EXIT=0 |
| 2 | `pnpm e2e:docs` one run, retries 0, full walk | locked-flow | ✅ pass | step2.log — 1/1 flows PASS |
| 3 | 57 JSONs per engine (56 + registry index), 114 total | locked-flow | ✅ pass | step3.log — 2/2 flows PASS |
| 4 | Served registry copy is gitignored, generated-only | locked-flow | ✅ pass | step4.log — 1/1 flows PASS |
| 5 | /registry: 56 rows 39/11/6, base URLs, copy buttons, note | locked-flow | ✅ pass | step5.log — 2/2 flows PASS (after artifact-path repair) |
| 6 | /components/conversation anatomy + family pager | locked-flow | ✅ pass | step6.log — 2/2 flows PASS (after FIX-FUSE-07-1) |
| 7 | Copy button: clipboard == displayed command | locked-flow | ✅ pass | step7.log — 1/1 flows PASS |
| 8 | Home: NOT-an-npm-package, computed counters, CTAs | locked-flow | ✅ pass | step8.log — 2/2 flows PASS |
| 9 | curl conversation.json: real registry JSON, same origin | locked-flow | ✅ pass | step9.log — 1/1 flows PASS |
| 10 | Mutation drill: shimmer-less registry fails chain naming 55 vs 56; restore green | locked-flow | ✅ pass | step10.log — 1/1 flows PASS |

## Failures

None in the final run. Honest remediations during the gate:

- **Steps 5–8 first replay FAILED on `artifact_fresh`** — the planner's flow list declared the evidence JSON itself (or a prose-suffixed report dir) as the artifact, which can never change during playback. Orchestrator repaired the declared artifacts to real playback-produced files (`apps/docs/dist/index.html`, `packages/registry/registry.json`, `apps/docs/playwright-report/junit.xml`), then replayed green. Recorded commit `5eed561`.
- **Step 6 FAILED on `GENERIC_ROOT_ORACLE`** — component-page.spec.ts asserted through a bare `'main'` locator. Routed as FIX-FUSE-07-1 (implementer → reviewer → merged `ba5b516`: oracle scoped to `main.component-page`, 49/49 assertions kept), then step 6 replayed green.
- **RED proofs**: all 10 flows have watched-failing captures (`--expect red`, cmd_sha-bound) at `.tmp/sprint-01-docs-spike-skeleton/e2e-evidence/<flow>.red` — captured by honestly breaking each product subject (removed built routes / moved the package / dropped a registry item) and restoring.

## Wiring Gaps (block production, not the gate)

1. **The GitHub clean-clone story (SPRINT.md step 1 prose) is not yet provable end-to-end**: all sprint work is local; `origin/main` predates the sprint. The locked flow proves the chain from the repo tree; the clone-from-GitHub step needs the work pushed via the repo's PR flow (main is ruleset-gated). The CI docs-e2e lane (FUSE-12, landed) will prove it on GitHub after merge.
2. **`apps/docs/apps-docs-red-hold/`** — leftover directory from the orchestrator's RED-replay move accident; contains only regenerable/untracked files. Deletion was blocked by the Critical-File Guard (gitignored file inside) and awaits human approval: `rm -rf apps/docs/apps-docs-red-hold` after review.
3. **`apps/docs/playwright-report/` + `test-results/` are untracked noise** — gitignore candidates (flagged independently by three implementers).

## Session Video

Not recorded for this run (locked-flow playback in the exec pane/inline; per-flow screenshots live under each flow's playwright report and `.tmp/` evidence).
