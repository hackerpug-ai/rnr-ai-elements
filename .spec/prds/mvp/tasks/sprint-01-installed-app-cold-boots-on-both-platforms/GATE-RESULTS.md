# Gate Results: sprint-01-installed-app-cold-boots-on-both-platforms

## ⚠️ VERIFIED AS FAIL — recomputed `fail` == claimed `fail`; 15/15 recomputed; 0 discrepancies

proof: `gate-verification.json` — the FAIL verdict is machine-trustworthy. The sprint did NOT pass its human testing gate.

> This is a **machine-verified FAIL**, not an UNVERIFIED claim. The deterministic verifier
> (`verify-gate-evidence.sh` D1–D8) recomputed every planned step from raw evidence and
> reproduced the claimed `fail` with zero discrepancies. The gate ran for real; what failed
> is the sprint's verification assets (below), plus one real on-device assertion failure.

**Date:** 2026-09-07 (run_id `2026-09-07T08:15:59Z`)
**Sprint:** sprint-01-installed-app-cold-boots-on-both-platforms
**Environment:**
- Sprint worktree `_base` (branch `sprint/sprint-01-installed-app-cold-boots-on-both-platforms`, head `048b8e2`), repo root `/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-01-installed-app-cold-boots-on-both-platforms/_base`
- iPhone 17 Pro simulator booted (UDID `9677B8E8-CD67-4561-89DF-17BFD99309CC`, iOS 26.3), app `ai.hackerpug.rnrexample` installed
- Android emulator `emulator-5556` attached (boot_completed=1), app installed
- Maestro 2.5.1 (`~/.maestro/bin/maestro`), pinned by `.maestro/config.yaml`
- node_modules installed during step 1 (workspace + apps/example); the committed F3 consumer install re-verified (10/10 files, 0 `@/registry/` literals, PortalHost present)

**Exec pane:** cmux surface:328 (`037D5BE7-7BEA-40EB-8ECD-70961265C665`) — split beside the qa surface (`4D04AC79-43C2-448E-A3CE-91EA40FB9F08`)
**UI driver:** none (no `ui`/`native-ui` steps; all 15 steps are planner-locked flows played via `run_flow.py`, the sanctioned per-flow driver)
**Method:** kb-run-human-tests v3.5 — every SPRINT.md gate step is covered by a locked flow in `human-flows.json` (locked-flow method, `run_flow.py --sprint-dir … --step N`)

## Summary

| Verdict | Steps executed | Steps passed | Steps total |
|---|---|---|---|
| ❌ FAIL (verified) | 1 | 0 | 15 |

Per-step rollup: 1 fail (step 1 executed for real), 14 wiring-gap (not executed — deterministic cause, see Failures/Wiring Gaps; no "skipped" category exists).

## What the gate actually proved (functional, on real devices)

Step 1 executed the real cold-boot journey on both platforms through the locked flows:

- **iOS (iPhone 17 Pro simulator):** `npx expo run:ios` build skipped (app already installed — native build was exercised by TASK-F8), cold-boot Maestro flow **PASSED in light AND dark** — header `AI Elements Example`, seeded bubble `Registry item installed.`, `tool-badge-completed` visible, context popover opens through the root PortalHost.
- **Badge glyph (AC-6):** measured chroma **0.1647** (>0.05) and hue **149.56** (inside [120,180]) from the iOS light capture — the `Completed` badge renders GREEN, i.e. the consumer `@theme` carried `--color-green-600`. (Gate step 7's machine half.)
- **Android (emulator-5556):** cold-boot flow **PASSED in light + dark in the mvp-install-arc run** (2 minutes after the failure below), including the context-popover portal pair; send-button/navigation-bar clearance measured **5.33dp** ≥ 1dp (AC-4).
- **Registry guard (edge flow, step 2 subject):** `tests/build-registry.test.ts` **6 passed | 7 skipped** — the short-name registryDependency refusal and https URL pinning hold functionally.

## Failures (deterministic: expected/actual/evidence; remedy labeled HYPOTHESIS)

### 1. Step 1 — core flow FAILED on Android light (real on-device assertion failure)

- **expected:** run_flow green on `UC-REG-01/core-happy-path` + `journeys/mvp-install-arc`: exit 0 with per-flow machine evidence `{exit_code 0, artifact_fresh, surface_ok, coldboot_ok, red_proof_ok}` all true.
- **actual:** `run_flow` exit 1. The core flow's Android light Maestro run failed at the final assertion `Assertion is false: id: context-popover-content is visible` (17.5 s wait). The failure hierarchy (`~/.maestro/tests/2026-09-07_021748/commands-*.json`) shows a **LogBox "Console Error: Can't perform a React state update on a component that hasn't mounted yet"** (expo-router `ContextNavigator`/`ExpoRoot.js:135`) on screen — the HMR-remount race the script itself documents (cycle-2/core-happy-path.log): golden captures are moved into `design/goldens/**` inside the Metro-watched monorepo root between flows, the delayed watcher invalidate remounts the app mid-flow, and Android LogBox covers the screen. iOS light+dark passed 2/2 in the same run; the identical Android pair passed in the arc run 2 minutes later — an intermittent harness race, not a deterministic product defect, but the flow's zero-retry policy converts it into a hard failure. The script aborted at the Android flow, so the inverted negative control (gate step 9) never ran in core mode.
- **evidence pointer:** `.gate-evidence/2026-09-07T08:15:59Z/step1.log` (exit 1) · `_base/.tmp/TASK-F8/runs/20260907-021642/flow-android-light.log` · `~/.maestro/tests/2026-09-07_021748/` (LogBox hierarchy + screenshot) · `e2e-evidence/UC-REG-01/core-happy-path.json` `{exit_code:1, surface_ok:false, red_proof_ok:false}`
- **HYPOTHESIS remedy:** GATE-FIX — stage golden-capture moves so no write lands inside the Metro watch root mid-session (the tmp-then-mv already exists; the mv itself still races the watcher), or pause/guard Metro's watcher across captures; re-run the flow.

### 2. Flow machine evidence cannot be satisfied by the committed assets (affects EVERY step)

- **expected:** each locked flow's green recompute requires `surface_ok`, `coldboot_ok`, `red_proof_ok`, and (edge) `artifact_fresh`.
- **actual (deterministic, probe-verified with the exact tool/policy/files run_flow uses):**
  - `surface_ok=false` for **all three** flow test sources: `tests/sprint-01/install-core.test.sh` and `install-dirty-app.test.sh` → `PRODUCT_TARGET_MISSING` (no product-owned success target inside an observation window); `tests/build-registry.test.ts` → `SURFACE_DRIVER_MISSING` + `PRODUCT_TARGET_MISSING`. (`e2e_surface_check.py --governed --policy .spec/e2e-policy/surface.json` exits 1 on each; coldboot lint passes on all.)
  - `red_proof_ok=false` for **all four** flows: every declared RED proof (`design/goldens/sprint-01/install/*.RED.log`, `registry/edge-short-name.RED.log`) is a plain log — first line `== preflight ==` etc. — not a run_flow capture (no `@@RUN-FLOW … expect=red …@@` header, no `@@GATE-EXIT=n@@`, no cmd_sha binding). `gate_evidence_check.red_proof_status` rejects them: "hand-written RED files prove nothing".
  - **edge flow can never be `artifact_fresh`:** its locked run_cmd is a vitest (`pnpm exec vitest run tests/build-registry.test.ts -t "UC-REG-01/edge-a-short-name-registry-dependency"`); a vitest writes no artifact, but `human-flows.json` declares `design/goldens/sprint-01/registry/edge-short-name.json` as its artifact. The edge flow's own run today: `exit=0 artifact_fresh=False surface_ok=False red_proof_ok=False → FAIL`.
- **evidence pointer:** `.tmp/sprint-01-installed-app-cold-boots-on-both-platforms/e2e-evidence/*.json` (machine flags) · direct probe outputs (this run's `e2e_surface_check.py` invocations) · RED headers at `design/goldens/sprint-01/{install,registry}/*.RED.log`
- **HYPOTHESIS remedy:** GATE-FIX — (1) re-scope `surface.json` or give each flow test source an observation-window reference to a product target; (2) capture each flow's RED through `run_flow.py --expect red` (or let it land in `e2e-evidence/<id>.red`); (3) for the edge flow bind a run_cmd that produces/refreshes the declared artifact.

**Because (2) is deterministic and asset-level, steps 2–15 were not executed:** each would replay the same heavy flows (~10–25 min per run, real iOS+Android builds/boots) and reproduce the identical machine failure. Executing them would burn hours for zero new signal. The one full step (step 1) was executed for real and independently demonstrates both the functional state and the machine-recompute blockers. See Wiring Gaps.

## Per-Step Results

| # | Gate | Method | Result | Evidence |
|---|---|---|---|---|
| 1 | pnpm install; CLI add; Created lines; expo run:ios; header; bubble; badge; e2e:smoke:ios; NEGATIVE CONTROL; expo run:android; e2e:smoke:android; cold relaunch | locked-flow (core + mvp-install-arc) | ❌ fail | `.gate-evidence/2026-09-07T08:15:59Z/step1.log`; Android light popover assert failed (LogBox HMR race); machine recompute fail (surface/red) |
| 2 | CLI add re-verified + edge short-name guard | locked-flow | 🔧 wiring_gap | not executed — deterministic (surface + red + edge artifact contract); edge vitest itself 6/6 passed in the direct flow run |
| 3 | final CLI line names components/ai/tool.tsx | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker |
| 4 | expo run:ios no alias error | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (iOS boot proven in step 1) |
| 5 | header reads AI Elements Example | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (assert passed in step 1 iOS flows) |
| 6 | bubble reads Registry item installed. | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (assert passed in step 1) |
| 7 | badge reads Completed + GREEN glyph | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (glyph chroma 0.1647/hue 149.56 measured in step 1 arc run) |
| 8 | pnpm e2e:smoke:ios → Flow Passed + golden png | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (flow passed iOS light+dark in step 1) |
| 9 | negative control: fixture removed → Maestro must FAIL | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker; also not reached in core mode (script aborted at Android light) |
| 10 | expo run:android header + GREEN badge | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (Android boot passed in step 1 arc run) |
| 11 | pnpm e2e:smoke:android → Flow Passed + png | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker |
| 12 | force-quit → e2e:smoke:android cold relaunch | locked-flow | 🔧 wiring_gap | not executed — deterministic machine blocker (cold relaunch passed in step 1 arc run) |
| 13 | dirty-app: CLI names button.tsx overwrite before writing | locked-flow (dirty-app) | 🔧 wiring_gap | not executed — deterministic machine blocker (surface/red); F8 committed golden shows functional pass on 09-07 |
| 14 | dirty-app: expo-doctor fails gesture-handler pin | locked-flow (dirty-app) | 🔧 wiring_gap | not executed — deterministic machine blocker |
| 15 | dirty-app: context surface states PortalHost prerequisite | locked-flow (dirty-app) | 🔧 wiring_gap | not executed — deterministic machine blocker |

## Wiring Gaps (block the gate, not the product)

1. **Surface-lint non-compliance of all three flow test sources** (governed `surface.json` product-target requirement). Product code and flows work; the lint contract and the test sources disagree. Fix in the sprint assets.
2. **RED proofs are not run_flow captures.** Four committed `.RED.log` files lack the `@@RUN-FLOW` provenance header; run_flow's green recompute can never see `red_proof_ok=true`. Re-capture via `run_flow.py --expect red` (needs a genuinely failing run of each locked run_cmd).
3. **Edge flow artifact contract mismatch.** Declared artifact is never produced by the run_cmd (vitest). Bind a producing run_cmd or drop the artifact requirement for this flow.
4. **Android context-popover flake under HMR invalidation** (LogBox remount race) — the sprint's own zero-retry policy makes this a hard failure; fix the capture staging or the watcher interaction.
5. Gate steps 9 (negative control) was not observed failing in core mode because the core script aborted earlier at the Android light failure; the committed `core-happy-path.RED.log` documents a real watched failure from the F8 cycle but is not in run_flow's accepted format (see gap 2).

## Session Video

No continuous UI video — all 15 steps are locked flows (terminal-style via `run_flow.py` in the exec pane); per-step evidence is `.log`/`.exit`/flow machine evidence. Screenshots: `design/goldens/mobile-ios/sprint-01/cold-boot{,-dark}.png` (regenerated this run) and the Android failure screenshot under `~/.maestro/tests/2026-09-07_021748/`.
