# Gate Results: sprint-04-generated-reference

## ✅ VERIFIED — recomputed pass == claimed pass; 11/11 recomputed; 0 discrepancies
   proof: /Users/justinrich/Projects/rnr-ai-elements/.spec/prds/docs-site/tasks/sprint-04-generated-reference/gate-verification.json

**Date:** 2026-09-14T01:36:55Z · **Sprint:** sprint-04-generated-reference (Phase 2, generated reference layer)
**Exec pane:** surface:86 (9133FA36-7AAD-4C51-9A6D-33E5063DC7CA)
**UI driver:** none (all 11 steps are planner-locked flows played by run_flow.py — the union of flow gate_steps covers every numbered step)
**Gate replays:** attempt 1 failed honestly (6/8 flows surface_ok=PRODUCT_TARGET_MISSING — specs lacked product literals in assertion regions); REF-001 cycle-3/4 remediation anchored real product-literal assertions; attempt 2 replays clean.

## Summary

✅ Pass: 11 / 11 · Fail: 0 · Wiring gaps: 0

All 8 locked flows PASS on every machine check (exit_code 0, artifact_fresh, surface_ok, coldboot_ok, red_proof_ok) across chromium-desktop / chromium-mobile / chromium-nojs: the 39-page six-section anatomy (install, dependencies, source, props, theming, usage), 39 generated props tables, byte-identical Code views vs served /r/*.json, family-pager closure over 7 families, absolute-URL copy commands on every page + engine tab, dependency panels matching live registry JSON, engine-tab persistence without URL state, pre-JS tab panels, the 390px mobile frame, and the four-arm enrichment drill lane.

## Per-Step Results

| # | Gate | Method | Result | Evidence |
|---|------|--------|--------|----------|
| 1 | At the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0: the ordered c… | locked-flow | ✅ pass | run_flow exit 0, 151s — `.gate-evidence/2026-09-14T01:36:55Z/step1.log` |
| 2 | Run the reference-page-anatomy spec — 3 passed (chromium-desktop, chromium-mobil… | locked-flow | ✅ pass | run_flow exit 0, 11s — `.gate-evidence/2026-09-14T01:36:55Z/step2.log` |
| 3 | Run the family-pager spec — 3 passed; evidence records set(pages_reachable_via_p… | locked-flow | ✅ pass | run_flow exit 0, 5s — `.gate-evidence/2026-09-14T01:36:55Z/step3.log` |
| 4 | Run the exact-absolute-url-command-copy spec — 3 passed; every one of the 39 com… | locked-flow | ✅ pass | run_flow exit 0, 96s — `.gate-evidence/2026-09-14T01:36:55Z/step4.log` |
| 5 | Run the dependency-panel-peers spec — 3 passed; panels on shimmer and conversati… | locked-flow | ✅ pass | run_flow exit 0, 8s — `.gate-evidence/2026-09-14T01:36:55Z/step5.log` |
| 6 | Run the props-table-generated spec — 3 passed; props_tables == 39 in the evidenc… | locked-flow | ✅ pass | run_flow exit 0, 9s — `.gate-evidence/2026-09-14T01:36:55Z/step6.log` |
| 7 | Run the code-view-byte-identical spec — 3 passed; >=5 sampled multi-file items b… | locked-flow | ✅ pass | run_flow exit 0, 7s — `.gate-evidence/2026-09-14T01:36:55Z/step7.log` |
| 8 | Run the engine-tab-persistence spec — 3 passed (chromium-nojs asserts the stacke… | locked-flow | ✅ pass | run_flow exit 0, 10s — `.gate-evidence/2026-09-14T01:36:55Z/step8.log` |
| 9 | Run the tab-panels-in-initial-html spec — 3 passed; raw pre-JS HTML contains bot… | locked-flow | ✅ pass | run_flow exit 0, 7s — `.gate-evidence/2026-09-14T01:36:55Z/step9.log` |
| 10 | Over `astro preview` open http://localhost:4321/components/conversation and read… | locked-flow | ✅ pass | run_flow exit 0, 35s — `.gate-evidence/2026-09-14T01:36:55Z/step10.log` |
| 11 | At a 390px viewport check the FLOW-GEND-14 mobile frame: props table stacked car… | locked-flow | ✅ pass | run_flow exit 0, 11s — `.gate-evidence/2026-09-14T01:36:55Z/step11.log` |

## Failures

None in the verified run. (Attempt-1 failure evidence retained at `.gate-evidence/2026-09-14T01:36:55Z/step1.log`.)

## Wiring Gaps

None. Every numbered step had a locked flow with a delivered spec.

## Known pre-existing pattern (non-blocking)

The three RIDING specs (qr-panel, dev-client-matrix, preview-omission-nojs) would fail the same e2e-surface product-literal check if ever bound to gate flows — they are not flow-locked this sprint. Flagged for any future sprint that promotes them.
