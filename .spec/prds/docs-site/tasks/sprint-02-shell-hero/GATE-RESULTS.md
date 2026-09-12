# Gate Results: sprint-02-shell-hero

## ✅ VERIFIED — recomputed pass == claimed pass; 13/13 recomputed; 0 discrepancies
   proof: .spec/prds/docs-site/tasks/sprint-02-shell-hero/gate-verification.json (method verify-gate-evidence.sh:recompute@b7a58510f9bd, written_at 2026-09-12T08:45:13Z)

**Date:** 2026-09-12 · **Sprint:** sprint-02-shell-hero (13 tasks + 3 FIX tasks, all landed on main)
**Environment:** repo root, pnpm workspace, built dist served by strict-port `astro preview` (the playwright webServer), Chromium via the flows' own locked specs
**Exec pane:** surface:480 (9BBCADFF-21DC-47AC-906E-EB379C3B4777), live in cmux beside the run
**UI driver:** playwright-chromium — driven by the flows' own locked specs through `run_flow.py` (no direct ui-typed plan steps)

**Gate:** A visitor opening `/` at 1440x900 over `astro preview` sees the hero's not-an-npm-package statement, the version counter (0.2.1), the item counters (56 / 39 / 11 / 6), the copyable engine-tabbed install command, plus both Get started / Browse components CTAs — all without scrolling.

## Summary

✅ **13/13 steps passed** — verdict **pass**, independently recomputed from raw evidence (step logs + per-flow machine evidence + watched RED proofs), 0 discrepancies.

Provisioning (not gate steps, evidence retained): `provision-build` / `provision-build2` — the ordered build chain (`registry:build` → `gallery:manifest` → docs build), because the webServer is preview-only and the gate entrypoint documents a built dist.

## Per-Step Results

| # | Gate step | Method | Result | Locked flows played |
|---|---|---|---|---|
| 1 | In the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0, and the summary lists passing specs from BO… | locked-flow | ✅ pass (99252ms) | `FLOW-GEND-01-home-hero-evaluation-contract`<br>`FLOW-GEND-02-hero-install-command-copy`<br>`FLOW-GEND-20-exact-absolute-url-command-copy`<br>`FLOW-GEND-21-dependency-panel-peers`<br>`FLOW-SHELL-01-theme-toggle-persisted-flash-free`<br>`FLOW-SHELL-02-first-visit-prefers-dark-no-flash` |
| 2 | Run `pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/ in a browser window sized … | locked-flow | ✅ pass (7203ms) | `FLOW-GEND-01-home-hero-evaluation-contract` |
| 3 | On / at 1440x900, read the hero statement top to bottom without scrolling — it says in one pass that this is u… | locked-flow | ✅ pass (7259ms) | `FLOW-GEND-01-home-hero-evaluation-contract` |
| 4 | Look at the hero counters row on the same screen — it shows version 0.2.1 and the item counters 56, 39, 11, 6,… | locked-flow | ✅ pass (5166ms) | `FLOW-GEND-01-home-hero-evaluation-contract` |
| 5 | On / at 1440x900, compare the bottom edge of the window with the Get started and Browse components buttons — b… | locked-flow | ✅ pass (6169ms) | `FLOW-GEND-01-home-hero-evaluation-contract` |
| 6 | Click the uniwind tab on the hero install block — the displayed command's engine segment changes to https://rn… | locked-flow | ✅ pass (9182ms) | `FLOW-GEND-02-hero-install-command-copy` |
| 7 | Click the copy button in the hero install block — the button shows a visible success state and pasting anywher… | locked-flow | ✅ pass (9418ms) | `FLOW-GEND-02-hero-install-command-copy` |
| 8 | Reload http://localhost:4321/ after selecting uniwind — the hero install block still shows the uniwind tab act… | locked-flow | ✅ pass (9182ms) | `FLOW-GEND-02-hero-install-command-copy` |
| 9 | Click the theme toggle in the header twice (dark to light and back) — the whole page flips both ways, and afte… | locked-flow | ✅ pass (6168ms) | `FLOW-SHELL-01-theme-toggle-persisted-flash-free` |
| 10 | Set the OS/browser appearance to dark, open a fresh private window, and load http://localhost:4321/docs/themin… | locked-flow | ✅ pass (5150ms) | `FLOW-SHELL-02-first-visit-prefers-dark-no-flash` |
| 11 | Open http://localhost:4321/components/shimmer — the install block leads the page with engine tabs; click copy … | locked-flow | ✅ pass (77803ms) | `FLOW-GEND-20-exact-absolute-url-command-copy` |
| 12 | Read the Dependencies section on http://localhost:4321/components/shimmer and http://localhost:4321/components… | locked-flow | ✅ pass (5130ms) | `FLOW-GEND-21-dependency-panel-peers` |
| 13 | On / click Get started — the registry ledger at /registry opens; go back, click Browse components — /component… | locked-flow | ✅ pass (4118ms) | `FLOW-GEND-01-home-hero-evaluation-contract` |

## Evidence

- Per-step logs: `.spec/prds/docs-site/tasks/sprint-02-shell-hero/.gate-evidence/2026-09-12T07:40:01Z/stepN.log` (+ `.exit`, `.assertion.json`)
- Per-flow machine evidence (fresh per playback): `.tmp/sprint-02-shell-hero/e2e-evidence/FLOW-*.json`
- Watched RED proofs (run_flow `--expect red` captures, cmd_sha-bound, from feature-absent checkouts):
  FLOW-GEND-01/02 @ 2107567 (pre-hero) · FLOW-GEND-20/21 @ 747e7cd (pre-item-pages) · FLOW-SHELL-01/02 @ 9b27427 (pre-theme-mechanism)

## Failures

None. (Two earlier step-1 attempts failed honestly — stale dist, then missing run_flow-captured RED proofs / theme-spec surface+artifact gaps — and were remediated before this verified run: FIX-GATE-SHELL-013-1 landed at 6cc940a; RED proofs captured per flow.)

## Wiring Gaps

None blocking. Lane-level follow-up noted by review: a stale `astro preview` orphan can silently serve an old dist to lanes because playwright.config.ts sets `reuseExistingServer` locally — consider tightening for gate runs.
