
### SCOPE — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/docs-collection.test.ts (MODIFY)
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts (MODIFY)
- tests/sprint-05-orient-search/live-example-api.test.ts (MODIFY)
- tests/sprint-05-orient-search/nativewind-live-example.test.ts (MODIFY — budget arithmetic only; assertions byte-effective)
- tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/ORI-AI-001/package-contract.json (drill-emitted rewrite)
- tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json (drill-emitted rewrite)
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json (drill-emitted rewrite)
- .tmp/FIX-ORI-SUITE-2/red.json (NEW)
- .tmp/FIX-ORI-SUITE-2/green.json (NEW)
- .tmp/FIX-ORI-SUITE-2/run.json (NEW)

Build outputs (`apps/docs/dist/**`, `apps/docs/.astro/**`, `apps/docs/node_modules/.vite/**`, `apps/docs/node_modules/.astro/**`, `playwright-report/**`, `test-results/**`, `.tmp/ORI-AST-001/**`, `.tmp/ORI-RN-005/**`) and the worktree-local regenerated `apps/docs/src/data/registry-items.json` are gitignored side effects of the allowed commands — never committed, never hand-edited. The docs-collection fixture's mirrored `scripts/` and `packages/docs-snippets/` copies live and die inside the drill's owned scratch root. No other path may change.

writeProhibited:

- apps/** (every product source — including `apps/example/lib/use-live-chat.ts`, whose current lazy import form is the oracle, not the target)
- packages/** (including `packages/docs-snippets/**` on the candidate — the fixture copies it into scratch only)
- scripts/** (including `scripts/docs-data/token-map.ts` on the candidate — copied into scratch only)
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts (owner-routed: its failing token is the ORI-DEP-002/003 public-origin prerequisite)
- tests/sprint-05-orient-search/recovery-presentation.spec.ts (owner-routed: ac-5 deployment-gated; the :52 stale constant is latent under strict-mode-exempt toBeHidden)
- tests/sprint-05-orient-search/contributing-content.test.ts (verified 4/4 standalone; reaper-class aggregate artifact — run hygiene, not repair)
- the in-flight seven-suite repair's files: tests/sprint-05-orient-search/single-tutorial-gate.test.ts, tests/sprint-01-docs-spike-skeleton/scaffold.build.test.ts, tests/sprint-04-generated-reference/data-table-contract.test.ts, tests/sprint-01-docs-spike-skeleton/ledger.spec.ts, tests/sprint-03-family-browse/verdict-badge-wiring.spec.ts, tests/sprint-05-orient-search/not-found-search-recovery.spec.ts, tests/sprint-05-orient-search/search-contract.spec.ts, tests/sprint-05-orient-search/suite-repair-proof.test.ts
- tests/** (every path except the five writeAllowed files and the three drill-emitted evidence files)
- .github/**
- .spec/**
- .kb-run-sprint/**
- pnpm-lock.yaml
- human-flows.json · gate-plan.json
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If the repaired docs-collection fixture unmasks a THIRD repo-root reference (a new `UNRESOLVED_IMPORT` or render-time `ENOENT`), extend the `makeScratch()` mirror inside the same file — same class — and name the addition in the handoff; never build outside the owned scratch.
- If the FUSE-05 tracked set reveals more authored files under `apps/docs/public` beyond the fonts and outside `public/r`, the scoped assertion's allow-comment must enumerate them exactly — never a blanket allowance that would admit a future tracked `public/r` file.
- If a NativeWind marathon leg fails standalone with a product-reason diagnostic (not budget, not device contention), STOP and report blocked owner-routed to the ORI-RN-005 surface — never widen into product source, never mask.
- If the aggregate surfaces a NEW failing suite outside the named residual closure, record it in run.json and report it for a scope check — the residual gate may never be widened to whatever failed.
- If pnpm-wrapped Biome dies environmentally (exit 254, `Limiter process terminated abnormally` in shimmed shells), rerun via the righthook pre-commit or a clean-env invocation before treating it as a gate failure (recorded FIX-ORI-CI-001-1 finding).
- If port 4321 is occupied when a Playwright-class child must run, wait or reschedule — the harness hard-fails on occupation rather than recording a misattributed port failure; never kill an unowned listener.

### DELIVERABLE

- The three repaired test files (plus the nativewind file's budget arithmetic only if evidenced), each passing its exact selector standalone.
- `tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts`: the proof harness (`runForeignSuiteRepairProof`) spawning the preserved selectors, the two static gates, and the diff-boundary check.
- `.tmp/FIX-ORI-SUITE-2/red.json`, `green.json`, `run.json`: RED/GREEN observations and the once-run aggregate record with the residual closure and its bound evidence.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; on the isolated candidate, run the preserved per-suite selectors pre-change and record each failure (exit codes + the failing assertions) in `red.json` with the candidate SHA bound. Wait for orchestrator verification of RED.
2. GREEN: land the repairs; rerun the harness selector (it spawns the identical selectors plus the static gates); stand the two marathon tokens back up standalone; then run the preserved aggregate `pnpm test` exactly once under a stable TMPDIR, `pnpm typecheck`, and the scoped Biome command, recording all exits and the residual inventory in `run.json`. REFACTOR only within the repaired files if a rewrite duplicates logic worth sharing.
3. Hand the candidate and evidence to ghactions-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/docs-collection.test.ts` [PRIMARY TARGET] — the fixture to extend (makeScratch :92-108) and the drill structure the repair must preserve.
2. `tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts` — the :321-323 tracked-files boundary and the 57-per-engine contract above it.
3. `tests/sprint-05-orient-search/live-example-api.test.ts` (AC-4, :598-667) + `apps/example/lib/use-live-chat.ts` (:45-50, :203) — the stale literal and its current lazy form (read-only).
4. `tests/sprint-05-orient-search/nativewind-live-example.test.ts` (:61-111, :201-268, :270-352) + `.tmp/ORI-RN-005/{abort-error-retry,fail-closed-cleanup}/manifest.json` — the marathon budgets, the kill-retry envelope, and the recorded aggregate leg failures.
5. `tests/sprint-05-orient-search/suite-repair-proof.test.ts` — the sibling proof-harness pattern this task's harness follows (read-only; the in-flight task owns it).

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts
```

Preserved per-suite selectors (the harness spawns these; each must exit 0 standalone):

```sh
pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts
pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts
pnpm exec vitest run tests/sprint-05-orient-search/live-example-api.test.ts -t 'AC-4'
pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t 'ORI-RN-005-abort-error-retry'
pnpm exec vitest run tests/sprint-05-orient-search/nativewind-live-example.test.ts -t 'ORI-RN-005-fail-closed-cleanup'
```

Preserved aggregate and static gates:

```sh
pnpm test
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/docs-collection.test.ts tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts tests/sprint-05-orient-search/live-example-api.test.ts tests/sprint-05-orient-search/nativewind-live-example.test.ts tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts
```

Command contract: the FUSE-05 file is an ~11-minute four-build run; docs-collection's build tokens are minutes-class and its `ORI-AST-001-mdx-code-copy` token needs a verified-free 4321 (Playwright-class preview, CI=1) plus the scratch preview on 4322; each NativeWind marathon token is 75-minute-class and may legally double through `runDriverWithKillRetry`'s one external-kill retry — the harness's per-child timeouts must respect the full envelope, and the reserved device selectors (`RNR_S05_IOS_UDID`, `RNR_S05_ANDROID_SERIAL`) must be live before the run. A fresh worktree needs the gitignored generated `apps/docs/src/data/registry-items.json` present for `pnpm typecheck` — copy or regenerate via `pnpm registry:build`, never commit. Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells; the working shapes are the righthook pre-commit and a clean-env invocation. Never run two drills sharing a consumer cache concurrently.

### EVIDENCE GATES

1. Prerequisites: the isolated candidate established at the recorded SHA; the four standalone failures reproduced (RED) with exit codes and failing assertions recorded; the reserved devices verified live.
2. Functional RED: the preserved selectors against the pre-change candidate, captured in `red.json`. Wait for orchestrator verification.
3. GREEN: the identical selectors post-change (each exit 0), the two marathon tokens standalone-green with fresh manifests, the aggregate run exactly once under a stable TMPDIR with its residual inventory recorded, `pnpm typecheck` exit 0, the scoped Biome command exit 0, and the tracked-file diff boundary verified.
4. Evidence: `run.json` binds candidate source and harness hashes, per-selector exit codes, the aggregate exit and complete failing inventory with the residual closure's bound probe/standalone evidence, the TMPDIR policy, and the diff inventory; scratch roots cleaned; the suites' drill-emitted evidence left as emitted. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, no oracle weakened, no product-source change, the residual closure exactly the named closure with evidence, exact scope compliance.

Planned evidence paths: `.tmp/FIX-ORI-SUITE-2/red.json`, `green.json`, `run.json`. Teardown: remove only owned scratch roots; leave the candidate with exactly the four repairs (+ any evidenced budget arithmetic) + harness.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. The locked gate flows, `human-flows.json`, and `gate-plan.json` are unchanged; no flow evidence writes, no journey proofs. The sprint's dark proof rows stay with their owning tasks; this task collapses the aggregate's residual failure set to the deployment-gated closure ORI-DEP-002/003 own.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-CI-002 (completed — approved `3573a23792b17c0fb2815b404aa65dd10815e4d7`, merged `c9bb5cc51c8eb101d04beafec274522633b37535`); the drifted suites' owning tasks are all completed (ORI-AST-001, FUSE-05/FLOW-DELIV-01, ORI-AI-001, ORI-RN-005, ORI-CONT-006), and the drift causes landed through completed tasks (ORI-AST-003, ORI-CONT-003, FIX-ORI-CI-001-1, ORI-VIS-001 `1c732dc1`, FIX-ORI-AI-001-1 `755edeae`).

Blocks: the aggregate acceptance closure behind ORI-CI-003/ORI-CI-004 once ORI-DEP-002/003 publish; the publication chain's clean-suite baseline.

Provides: the four suites green standalone; the proof harness; the once-run aggregate record with the attributed residual closure; RED/GREEN evidence under `.tmp/FIX-ORI-SUITE-2/`.

Consumes: the landed repo-root reference shape (AST-003's token-map import, the tutorial-designation snippet read), ORI-VIS-001's authored-fonts layout, FIX-ORI-AI-001-1's lazy expo/fetch hook, the NativeWind driver's kill-retry envelope, and the sibling proof-harness pattern.

Supersedes: tests/sprint-05-orient-search/docs-collection.test.ts, tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts, tests/sprint-05-orient-search/live-example-api.test.ts, tests/sprint-05-orient-search/nativewind-live-example.test.ts — the four existing suites this task deliberately changes, each pinned to the superseded shape in its boundary contract.

References: UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave21-add-foreign-suite-repair` (wave-21, sequence next); source item `FIX-ORI-SUITE-1:blocked:1:scope_impact:0:e15d4ad7d3b8a3d88a009a94b82efb2f6a4929485ee739b261236e0a9e1ad051` (the cycle-1 blocked report of the in-flight seven-suite repair); proposed by ghactions-planner; every chartered failure planner-verified standalone on candidate `2f15ba41` 2026-09-26 (the four writable suite files byte-identical to trunk `dbf3c0af`).

### OUT OF SCOPE

Any product-source change; repairing `ci-chain-order.test.ts` or `recovery-presentation.spec.ts` (the ORI-DEP-002/003 public-origin prerequisite — report-only); repairing `contributing-content.test.ts` (verified green standalone — run hygiene only); the public-origin deployment itself (ORI-DEP-002/003); ORI-CI-003/ORI-CI-004's own workflow authoring; the in-flight seven-suite repair's files; journey proofs; planning-artifact edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: each of the five preserved selectors exits 0 standalone (the three drifted suites, the AC-4 token, and both marathon tokens); the aggregate run exactly once records a failing inventory exactly equal to the named residual closure (the ci-chain full-e2e token through recovery-presentation ac-5 with the public-origin probe bound, plus at most the two marathon tokens each with standalone-green evidence); `pnpm typecheck` and the scoped Biome command exit 0; the tracked-file diff is exactly the four suites + harness + drill-emitted writes; `red.json`/`green.json`/`run.json` bind the candidate and harness hashes and the TMPDIR policy; no oracle weakened (each retired literal named and justified as superseded); no product-source change (candidate `apps/**`, `packages/**`, `scripts/**` byte-unchanged); no stub, fake success, skipped token, silent residual, or lowered assertion. Should verify: the fixture mirrors carry landing-work comments; the FUSE-05 supersede names `1c732dc1` and the five font paths; any marathon budget arithmetic shows its observed mechanism; the ac-5 residual attribution cites the empty-body 404 probe. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.
