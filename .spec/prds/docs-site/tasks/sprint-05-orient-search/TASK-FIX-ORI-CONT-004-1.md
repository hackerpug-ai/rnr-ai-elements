# FIX-ORI-CONT-004-1: Pin react-native-web 0.21.2 in both consumer templates so fresh uniwind web exports resolve

## What this does

Changes exactly one dependency entry in each committed consumer template — `packages/docs-snippets/nativewind/package.json` and `packages/docs-snippets/uniwind/package.json` — from the drifting range `"react-native-web": "~0.21.0"` to the exact pin `"react-native-web": "0.21.2"`, and proves the pin with a task-owned harness (`tests/sprint-05-orient-search/rnw-pin-proof.test.ts`) that drives the real fresh-install and export path end to end. No product source beyond the two manifests, no lockfile change: the docs-snippets templates are standalone template directories outside the pnpm workspace (no `packages/docs-snippets/package.json`, zero references in `pnpm-lock.yaml`), so the pin changes only what fresh public installs resolve.

Why exact-pin and not a narrower range: `~0.21.2` and every other operator form still resolves `0.21.3` (the tilde family `~0.21.x` spans `>=0.21.x <0.22.0`), so anything but the bare version re-drifts on the next registry publish. Exact pins are already the tree's convention for sensitive native entries in these same manifests (`react: 19.2.3`, `react-native: 0.86.3`, `uniwind: 1.11.0`, `react-native-worklets: 0.10.1`).

## Why

ORI-CONT-004's cycle-1 blocked report (commit `78f88b07`, report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-CONT-004/cycle-1.blocked.json`) proves the sixth Quickstart seed leg (uniwind/web) is deterministically broken by a registry publish that postdates ORI-RN-003's committed green: react-native-web@0.21.3 (published 2026-09-25T15:00Z) resolves from the templates' `~0.21.0` range, and its new InputAccessoryView export dies inside uniwind 1.11.0's incomplete `package.json` exports map — the `./components/*` wildcard maps to `./dist/module/components/web/*.js`, and the uniwind 1.11.0 tarball ships 28 web components there with InputAccessoryView absent — so `expo export --platform web` fails inside every fresh uniwind consumer under `withUniwindConfig` Metro with `Unable to resolve module ./exports/InputAccessoryView`. Planner-verified facts: the registry candidate set for `~0.21.0` is exactly `0.21.0/0.21.1/0.21.2/0.21.3`; uniwind 1.11.0's `dist/module/components/web/` carries no InputAccessoryView file. Reproduced standalone twice by the reporting child; pinning `react-native-web@0.21.2` in the same consumer exported cleanly (exit 0) both times. Five of six seed legs already pass; the flow fails closed on this leg. Both template-owner tasks (ORI-RN-001, ORI-RN-003) are completed, so no pending task owns the manifests; the wave-20 decision authorized exactly this add.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts
pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/rnw-pin-proof.test.ts
```

The first command is the exact selector: the task-owned harness runs the real registry-resolution lane, prepares fresh public consumers from the committed templates through the committed recipes (reused read-only from `support/quickstart-consumer.ts`), reads each consumer's resolved react-native-web version from its own `node_modules`, and runs the real `npx expo export --platform web` (reused read-only from `support/quickstart-web.ts`). `--mode red` captures the pre-pin state (resolved `0.21.3`, failing export with the named module error) in `.tmp/FIX-ORI-CONT-004-1/red.json`; the default GREEN mode proves the pinned state (exact `0.21.2`, uniwind and nativewind exports exit 0) in `green.json`. The second command runs the vitest-visible guard suite only — the heavyweight lanes are CLI-gated behind the direct-invocation check, so the aggregate `pnpm test` never spawns a fresh install. `pnpm typecheck` and the scoped Biome command are preserved static gates recorded in `run.json`.

## Scope

Own the two template manifest entries, the task-owned harness, the pin-record evidence README, the bounded `.tmp/FIX-ORI-CONT-004-1/` evidence, and the two install-log side-effect refreshes the reused helper rewrites. Nothing else: no app source, no registry code, no lockfile, no workspace manifest, no flow or planning artifact.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending

> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 2 · Type: FIX
> Dependency phase: after ORI-RN-001, ORI-RN-003
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-25
> Source SHA: 1749fb2cdcb3a3834f9cac50f808f9494c04a574

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/3 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

A fresh public install of either committed consumer template resolves react-native-web exactly 0.21.2 and its real `expo export --platform web` exits 0 on both engines; the pre-pin drift (0.21.3 resolving from `~0.21.0` and killing the uniwind export with `Unable to resolve module ./exports/InputAccessoryView`) is captured as functional RED; the harness is aggregate-safe, the static gates pass, and the diff is confined to the two manifest entries plus the harness and its evidence — unblocking ORI-CONT-004's sixth Quickstart seed leg and the per-engine live matrices behind it.

### CRITICAL CONSTRAINTS — Never

- Never widen the fix beyond the pin: no uniwind upgrade or downgrade, no metro.config.js change, no exports-map patching, no lockfile edit. If the exact 0.21.2 pin alone does not make the uniwind export exit 0, stop and report — the root-cause claim is wrong and a scope amendment is required.
- Never pin with a range operator (`~0.21.2`, `^0.21.2`, `>=0.21.2 <0.22.0`): every operator form can resolve 0.21.3 on a future fresh install; the pinned entries must be the bare version string `0.21.2`.
- Never substitute for the real resolution mechanics: no authored registry output where the real `npm view react-native-web@<range> version --json` belongs, no lockfile read where the consumer's own `node_modules/react-native-web/package.json` belongs, no authored export receipt where a real `expo export` exit belongs.
- Never substitute a local registry, hostname rewriting, or monorepo resolution for the public apex (ORI-RN-001's disallowed substitutions); the consumers live outside the monorepo and install from rnraielements.com and the npm registry, exactly as the tutorials display.
- Never trim the consumer to a bare template without the public CLI adds: the failing import graph only exists in the full consumer the recipe builds; a componentless template can export cleanly under 0.21.3 and would fake a RED absence.
- Never let the harness spawn fresh installs from inside a vitest process: the heavyweight lanes run only behind the direct-invocation check (`process.argv[1]` equals the file), and the vitest-visible guard suite is network-free.
- Never edit the workspace manifests (`apps/harness`, `apps/harness-nativewind`, `apps/example`) that carry the same `~0.21.0` range: they resolve through `pnpm-lock.yaml`, not fresh public installs, and are outside this task's boundary — record them as a report-only finding.
- Never touch in-flight surfaces (ORI-CONT-004's spec and evidence, ORI-AI-002's runner), planning artifacts, `human-flows.json`, `gate-plan.json`, or perform trunk/worktree lifecycle operations.

### DONE WHEN

- [ ] AC-1 proves the pre-pin RED (resolved 0.21.3, export exit != 0 with the literal module error) and the post-pin GREEN (exact 0.21.2 in both manifests, resolved 0.21.2, uniwind export exit 0) through one real fresh install per phase.
- [ ] AC-2 proves the nativewind consumer resolves exactly 0.21.2 and still exports cleanly under the pin.
- [ ] AC-3 proves the guard selector, static gates, and the exact write boundary (0 paths outside the allowlist, 0 lockfile changes, 0 range operators in the pinned entries).
- [ ] The exact selectors and preserved commands pass; independent review confirms functional RED, seeded evidence, and no stubs.

### SPECIFICATION

One-line exact pin in each of the two template manifests, plus a task-owned proof harness that reuses the ORI-RN-001/ORI-RN-003 support modules read-only. The harness is the sibling FIX shape: a CLI-gated `main()` (default GREEN mode, `--mode red` for the RED capture), an exported `runRnwPinProof` proof entry, and a vitest-visible network-free guard suite so the file contributes a passing test — not a No-test-suite failure — to the aggregate run.

### BOUNDARY CONTRACTS

1. The pin: `packages/docs-snippets/nativewind/package.json` and `packages/docs-snippets/uniwind/package.json` each change exactly the react-native-web dependency entry to the bare string `0.21.2`. No other key, file formatting beyond that line, or sibling manifest changes.
2. Harness `tests/sprint-05-orient-search/rnw-pin-proof.test.ts` (NEW): lane A — real registry resolution (`npm view react-native-web@<committed-range> version --json`), asserting the candidate set for the committed form (RED: contains `0.21.3`; GREEN: exactly `['0.21.2']`); lane B — fresh consumer per engine via the reused `prepareConsumer` (the committed recipe verbatim: `pnpm install`, `npx expo install`, the literal public CLI adds, `tsc --noEmit`, `expo-doctor`), reading the resolved version from the consumer's `node_modules/react-native-web/package.json`; lane C — the reused `exportWeb` (real `npx expo export --platform web --output-dir <scratch>`), asserting exit and log literals. RED mode runs lanes A–C for uniwind against the pre-pin manifests and writes `red.json`; GREEN mode runs A for the exact pin, B–C for both engines, asserts the pinned manifest form (bare `0.21.2`, 0 range operators), and writes `green.json`; both modes merge command/exit/run-identity bindings into `run.json`. Env hygiene at entry: delete `NODE_ENV`, use a short reaper-free `TMPDIR` for the consumer roots; overall GREEN budget <= 90 min, recorded. Cleanup: remove the tmpdir consumer roots on every exit path; keep the scratch dist dirs referenced in evidence until teardown.
3. Guard suite: a vitest-visible `describe`/`it` pair asserting the committed manifests' react-native-web entry is exactly `0.21.2` and that the heavyweight lanes are gated behind the direct-invocation check — no network, no spawns; it fails pre-pin (honest RED in the aggregate) and passes post-pin.
4. Side effects: the reused `prepareConsumer` rewrites `tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt` and `uniwind-install.txt` in place; those refreshes are write-allowed, committed with the run, never hand-edited or deleted. The harness's own evidence lands in `.tmp/FIX-ORI-CONT-004-1/` and `tests/sprint-05-orient-search/evidence/FIX-ORI-CONT-004-1/README.md` (the pin record: root cause, the registry candidate set, both engines' resolved versions and export exits, and the citation of the reporting child's two standalone 0.21.2 verifications).

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real install and export path on the real stack.

#### AC-1: The exact 0.21.2 pin makes a fresh uniwind consumer resolve it and export cleanly [PRIMARY]

GIVEN the two committed consumer templates and the task-owned harness WHEN the harness prepares a fresh public uniwind consumer from the committed template through the real committed recipe and runs the real `npx expo export --platform web` THEN pre-pin the consumer resolves react-native-web exactly '0.21.3' and the export exits != 0 with the literal 'Unable to resolve module ./exports/InputAccessoryView', and post-pin both manifests declare the exact pin (0 range operators) and an identical fresh consumer resolves exactly '0.21.2' with the export exiting 0.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: a real fresh public consumer install (real pnpm resolution over the real npm registry, the literal public RNR CLI adds from rnraielements.com, the consumer's own tsc and expo-doctor) plus the real expo export bundler through uniwind 1.11.0's withUniwindConfig Metro
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/rnw-pin-proof.test.ts
- TEST_FUNCTION: runRnwPinProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-CONT-004-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"a real fresh public consumer install (real pnpm resolution over the real npm registry, the literal public RNR CLI adds from rnraielements.com, the consumer's own tsc and expo-doctor) plus the real expo export bundler through uniwind 1.11.0's withUniwindConfig Metro","negative_control":{"would_fail_if":["The resolution lane is faked: an authored registry listing or a lockfile read stands in for the real npm registry query and the consumer's own node_modules/react-native-web/package.json, the export receipt is authored instead of the exit code of a real expo export run, or the RED artifact records 0 failing-export observations.","The pin keeps any range operator that can still resolve 0.21.3 (~0.21.2, ^0.21.2, >=0.21.2), the uniwind leg is skipped or trimmed to a bare template without the public CLI adds, or a local registry or monorepo resolution substitutes for the public apex.","The resolution lane reads a static version map or a mocked registry response instead of querying the real npm registry, or the export lane trusts an authored success flag or a mocked expo export exit code rather than running the real CLI."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumer_install","action":{"actor":"cli_user","steps":["Pre-pin: run the exact selector with --mode red against the committed manifests still carrying \"react-native-web\": \"~0.21.0\" — the harness queries the real npm registry for the committed range, prepares a fresh public uniwind consumer through the committed recipe (pnpm install, npx expo install, the literal public CLI adds, tsc, expo-doctor), reads the resolved version from the consumer's own node_modules, and runs the real npx expo export --platform web.","Apply the exact pin \"react-native-web\": \"0.21.2\" in both packages/docs-snippets/nativewind/package.json and packages/docs-snippets/uniwind/package.json.","Rerun the identical selector in default GREEN mode: registry lane for the exact pin, a fresh uniwind consumer, resolved-version read, and the identical real export."]},"end_state":{"must_observe":["red.json records the real npm registry candidate set for ~0.21.0 containing '0.21.3' alongside '0.21.0'/'0.21.1'/'0.21.2', the consumer's resolved react-native-web version exactly '0.21.3', exportExit != 0, and the literal 'Unable to resolve module ./exports/InputAccessoryView' present in the captured export log.","green.json records both committed manifest entries as the exact string \"react-native-web\": \"0.21.2\" (range-operator count (0) across both entries), the fresh consumer's resolved react-native-web version exactly '0.21.2', and exportExit == 0 for the uniwind leg.","red.json and green.json each bind the candidate source SHA, the literal selector command and mode, the consumer root, the resolved-version read path, and the export exit; the whole GREEN run completes within the recorded <= 90 min budget."],"must_not_observe":["A resolution record with 0 real install steps (no pnpm install output bound), the module-error literal absent from the RED export log, or a RED export exit of 0.","Any pinned entry that a future fresh install could resolve past 0.21.2, or a GREEN resolved version other than exactly '0.21.2'."]}}]}
```

#### AC-2: The nativewind consumer still exports cleanly under the same pin

GIVEN the exact 0.21.2 pin landed in both manifests WHEN the harness prepares a fresh public nativewind consumer from the committed template through the committed nativewind recipe and runs the same real export THEN the consumer resolves react-native-web exactly '0.21.2' and the export exits 0 — the pin changes the resolved version without breaking the nativewind web leg that passed under 0.21.3.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: the same real fresh public install and real expo export bundler for the nativewind consumer, with the real npm registry resolution lane
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/rnw-pin-proof.test.ts
- TEST_FUNCTION: runRnwPinProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-CONT-004-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"the same real fresh public install and real expo export bundler for the nativewind consumer, with the real npm registry resolution lane","negative_control":{"would_fail_if":["The nativewind leg is skipped, its export receipt is authored rather than a real expo export exit, or completion is claimed from the leg's prior 0.21.3-era pass instead of a fresh pinned install.","The pin breaks the nativewind web leg that previously exported cleanly, proving the pin changed behavior beyond the uniwind consumer.","The nativewind leg is stubbed with a disconnected offline receipt, an empty leg record, or a mocked expo export exit code rather than the real install and export run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumer_install","action":{"actor":"cli_user","steps":["Run the exact selector in default GREEN mode; the harness prepares a fresh public nativewind consumer from the committed template through the committed nativewind recipe, reads the resolved react-native-web version, and runs the real npx expo export --platform web.","Read the nativewind leg record in green.json and correlate it with the refreshed nativewind install evidence."]},"end_state":{"must_observe":["green.json records the nativewind leg with resolved react-native-web exactly '0.21.2' and exportExit == 0.","The harness ran exactly 1 fresh install per engine in GREEN mode (skipped-leg count (0)), and the nativewind install evidence is refreshed by the same run."],"must_not_observe":["A nativewind export exit != 0 under the pin, a resolved nativewind react-native-web version other than '0.21.2', or a missing nativewind leg record."]}}]}
```

#### AC-3: Aggregate-safe harness, static gates, and the exact write boundary

GIVEN the landed pin and harness WHEN the vitest guard selector, pnpm typecheck, and the scoped Biome command run THEN the harness file contributes a passing vitest-visible guard suite with its heavyweight lanes CLI-gated, the static gates exit 0, both pinned entries carry 0 range operators, and git diff --name-only reports 0 paths outside the literal allowlist with 0 changes to pnpm-lock.yaml or any workspace manifest.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real vitest runner over the harness guard suite, the real TypeScript compiler, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/rnw-pin-proof.test.ts
- TEST_FUNCTION: runRnwPinProof
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-CONT-004-1-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the real vitest runner over the harness guard suite, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["The harness file contributes a No-test-suite failure to the aggregate vitest run instead of a passing CLI-gated guard suite, or the heavyweight lanes fire under vitest.","A static gate fails and is waved through as pre-existing without the git stash && rerun proof, or the diff leaves the literal allowlist (any pnpm-lock.yaml or workspace-manifest change).","The guard suite is skipped or empty (0 tests) so the aggregate cannot fail on the harness file."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumer_install","action":{"actor":"cli_user","steps":["Run the guard selector pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts; confirm the guard suite passes in the vitest process and no fresh install or export starts (heavy lanes stay CLI-gated behind the direct-invocation check).","Run pnpm typecheck and the scoped Biome command over the harness file; prove any failure environmental or pre-existing with git stash && rerun before recording it.","Diff the candidate: confirm the pinned entries, count range operators, and check git diff --name-only against the literal allowlist."]},"end_state":{"must_observe":["The guard selector exits 0 with >= 1 passing test in the harness file and 0 network-bearing lanes executed under vitest.","pnpm typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record; run.json binds both commands and exits.","Both manifest entries are exactly \"react-native-web\": \"0.21.2\" (range-operator count (0)); git diff --name-only reports 0 paths outside the literal allowlist entries and 0 changes to pnpm-lock.yaml or any workspace manifest."],"must_not_observe":["A No-test-suite failure for the harness file under vitest, a heavyweight lane spawning during the aggregate run, or an unproven static-gate failure recorded as pre-existing.","Any edit outside the allowlist, including the apps/harness, apps/harness-nativewind and apps/example manifests that carry the same ~0.21.0 range (report-only finding)."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness RED mode captures the pre-pin drift (registry candidate set including '0.21.3', resolved node_modules version '0.21.3', export exit != 0 with the literal 'Unable to resolve module ./exports/InputAccessoryView'), and GREEN mode proves the exact pin resolves exactly '0.21.2' with export exit 0 for the uniwind consumer. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts`
- TC-2 → AC-2: The GREEN-mode nativewind leg resolves exactly '0.21.2' and its real export exits 0, recorded in green.json with the refreshed install evidence. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts`
- TC-3 → AC-3: The vitest guard selector passes in-process without spawning heavyweight lanes; the static gates exit 0 or carry the stash-proven pre-existing record; the diff stays inside the literal allowlist with 0 lockfile or workspace-manifest changes. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts`

### SHARED FIXTURES

```json
{"fresh_consumer_install": {"description": "A fresh isolated candidate plus, per leg, a real fresh public consumer: the committed template copied into an OS-derived tmpdir root outside the monorepo (reaper-managed), the committed recipe executed verbatim (real pnpm install over the real npm registry, npx expo install, the literal public RNR CLI adds from rnraielements.com, tsc, expo-doctor), the resolved react-native-web version read from the consumer's own node_modules, and the real npx expo export --platform web through the template's withUniwindConfig/withNativeWind Metro.","seed_method": "cli","records": ["Env hygiene before spawning any pnpm/npx/expo child: delete NODE_ENV (a vitest/Playwright worker's NODE_ENV=test breaks expo install) and use a short reaper-free TMPDIR, matching the hygiene the owning tasks established.","Per-leg budget: the committed recipe is bounded at 30 min inside the reused helper and the export at 30 min; the whole GREEN run (registry lane + both engine legs) is bounded at <= 90 min and recorded in run.json.","The public apex (rnraielements.com) and the npm registry must be reachable; unreachable registries block execution — never substitute a local registry, hostname rewriting, or monorepo resolution (ORI-RN-001's disallowed substitutions).","The reused helpers rewrite tests/sprint-05-orient-search/evidence/ORI-RN-001/{uniwind,nativewind}-install.txt in place as side effects; those refreshes are committed with the run and never hand-edited or deleted.","The standalone 0.21.2-exports-cleanly claim is already verified twice by the reporting child (ORI-CONT-004 cycle-1 blocked report); this harness re-proves it end-to-end on the committed tree."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- packages/docs-snippets/nativewind/package.json (MODIFY)
- packages/docs-snippets/uniwind/package.json (MODIFY)
- tests/sprint-05-orient-search/rnw-pin-proof.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/FIX-ORI-CONT-004-1/README.md (NEW)
- tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt (MODIFY)
- tests/sprint-05-orient-search/evidence/ORI-RN-001/uniwind-install.txt (MODIFY)
- .tmp/FIX-ORI-CONT-004-1/red.json (NEW)
- .tmp/FIX-ORI-CONT-004-1/green.json (NEW)
- .tmp/FIX-ORI-CONT-004-1/run.json (NEW)

The reused helpers' refreshes of the two ORI-RN-001 install logs are side effects of the allowed commands, refreshed in place and committed with the run — never deleted, never hand-edited. No other path may change.

writeProhibited:

- packages/docs-snippets/commands/** (the committed recipes run verbatim)
- tests/sprint-05-orient-search/support/** (the reused helpers are consumed read-only)
- apps/** (including the harness/harness-nativewind/example manifests carrying the same ~0.21.0 range)
- pnpm-lock.yaml
- packages/** except the two named manifests
- tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts and every ORI-CONT-004/ORI-AI-002 in-flight file
- .github/**
- .spec/**
- .kb-run-sprint/**
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If the exact 0.21.2 pin does not make the fresh uniwind export exit 0 (0.21.3 was not the sole cause), stop and report for a scope amendment rather than widening pins or patching uniwind's exports map.
- If the public apex (rnraielements.com) or the npm registry is unreachable, record the blocker; never substitute a local registry or monorepo resolution.
- If a registry-side change (unpublish, alias, dist-tag rewrite) makes `npm view react-native-web@0.21.2` stop resolving, fail closed and report — do not silently re-drift the pin.
- The workspace manifests' identical `~0.21.0` range (apps/harness, apps/harness-nativewind, apps/example) is a report-only finding for the orchestrator; any lockfile-bound pin is a separate ask.

### DELIVERABLE

- `packages/docs-snippets/nativewind/package.json` and `packages/docs-snippets/uniwind/package.json`: the exact `0.21.2` pin.
- `tests/sprint-05-orient-search/rnw-pin-proof.test.ts`: the three-lane harness (registry resolution, fresh installs, real exports) with RED/GREEN modes and the vitest-visible guard suite.
- `.tmp/FIX-ORI-CONT-004-1/red.json`, `green.json`, `run.json` plus `tests/sprint-05-orient-search/evidence/FIX-ORI-CONT-004-1/README.md` (the pin record), and the refreshed ORI-RN-001 install logs.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; run `pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts --mode red` against the unmodified manifests; capture the registry candidate set including 0.21.3, the resolved 0.21.2→0.21.3 drift, and the failing export with the literal module error, bound to the candidate SHA. Unreachable registries are a blocker, never functional RED; an authored resolution record is not RED. Wait for orchestrator verification of RED.
2. GREEN: apply the two-line pin; rerun the identical selector in default mode (both engines); then run the guard selector, `pnpm typecheck`, and the scoped Biome command; write the pin-record README. REFACTOR only to keep the harness lanes readable; rerun affected proofs.
3. Hand the candidate and evidence to react-native-reusables-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `packages/docs-snippets/uniwind/package.json` [PRIMARY TARGET] — the pinned entry; `packages/docs-snippets/nativewind/package.json` beside it.
2. `tests/sprint-05-orient-search/support/quickstart-consumer.ts` — `prepareConsumer`, `run`, the resolved-version read pattern; imported read-only.
3. `tests/sprint-05-orient-search/support/quickstart-web.ts` — `exportWeb`, the exact failing lane; imported read-only.
4. `.kb-run-sprint/sprint-05-orient-search/ORI-CONT-004/cycle-1.blocked.json` — the root cause, the 5/6 seed state, and the reporting child's two standalone 0.21.2 verifications.
5. `packages/docs-snippets/commands/uniwind.sh` — the committed recipe the harness executes verbatim.

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts
```

Preserved verification commands:

```sh
pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts --mode red
pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/rnw-pin-proof.test.ts
```

Command contract: delete `NODE_ENV` before spawning any pnpm/npx/expo child (the established env hygiene — a vitest worker's `NODE_ENV=test` breaks expo install) and keep consumer roots on a short reaper-free `TMPDIR`. Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells (`Linter process terminated abnormally`); the working shapes are the righthook pre-commit and a clean-env invocation (env -i with explicit pnpm/node PATH) — prove a biome failure environmental before treating it as a gate failure. The GREEN run needs the public apex and the npm registry reachable and takes up to ~90 min (two full fresh installs); budget the session accordingly. Do not rerun ORI-CONT-004's locked flow as a gate — its Quickstart step 3 re-executes after this pin lands, on its own dispatch.

### EVIDENCE GATES

1. Prerequisites: registries reachable, isolated candidate established, committed manifests still carrying `~0.21.0` at RED time; the harness and its imports present at the recorded candidate SHA.
2. Functional RED: the exact selector in `--mode red` against the pre-pin candidate; the drift captured with the registry candidate set, the resolved version read, and the failing export literal, bound to the invocation identity. Wait for orchestrator verification.
3. GREEN: the identical selector in default mode — both engines resolve exactly `0.21.2`, both exports exit 0 — plus the guard selector, `pnpm typecheck`, and the scoped Biome command; the pin record written.
4. Evidence: bind candidate source and harness hashes to exact commands, exits, modes, consumer roots, resolved-version read paths, registry candidate sets, and export logs; clean up the tmpdir consumer roots on every exit path. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, no stubs, exact scope compliance.

Planned evidence paths: .tmp/FIX-ORI-CONT-004-1/red.json, .tmp/FIX-ORI-CONT-004-1/green.json, .tmp/FIX-ORI-CONT-004-1/run.json, tests/sprint-05-orient-search/evidence/FIX-ORI-CONT-004-1/README.md. Teardown: remove the fresh consumer roots and scratch dist dirs; leave the ORI-RN-001 install logs refreshed in place.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004; the locked gate steps, human-flows.json, and gate-plan.json are unchanged; no flow evidence writes, no journey proofs. The task unblocks ORI-CONT-004's sixth seed leg; it does not execute it.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-RN-001, ORI-RN-003 (both completed — the consumer-template owners).

Blocks: ORI-CONT-004's Quickstart seed-leg completion and the per-engine live matrices its locked command executes after the sixth leg passes.

Provides: templates whose fresh public installs resolve exactly react-native-web 0.21.2 on both engines, with captured RED/GREEN evidence and the pin record.

Consumes: ORI-RN-001's `support/quickstart-consumer.ts` (prepareConsumer, run) and ORI-RN-003's `support/quickstart-web.ts` (exportWeb), both read-only.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave20-add-rnw-pin` (wave-20, sequence next); source task ORI-CONT-004 (blocked cycle 1, commit 78f88b07a2fdd698d09b75fda7bf3c3dd15c61ab; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-CONT-004/cycle-1.blocked.json`, item ORI-CONT-004:blocked:1:scope_impact:0); proposed by react-native-reusables-planner.

### OUT OF SCOPE

ORI-CONT-004's flow specs and evidence (in flight); the ORI-RN-003 driver and its evidence root beyond the two install-log side effects; app and registry code; the workspace manifests and pnpm-lock.yaml; uniwind itself (no upgrade, downgrade, or exports-map patch); journey proofs; planning policy edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED bound to the real registry and the real failing export on the pre-pin candidate; GREEN bound to two real fresh installs resolving exactly 0.21.2 with both exports exiting 0; the exact bare-version pin in both manifests with 0 range operators; the aggregate-safe guard suite; static gates green or stash-proven pre-existing; only allowed files change; no stub or fake success remains. Should verify: the harness reuses the ORI-RN-001/003 helpers rather than re-implementing installs; the RED capture names the reporting child's standalone verifications in the pin record; completion is not presented as ORI-CONT-004 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-CONT-004-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"fresh_consumer_install":{"description":"A fresh isolated candidate plus, per leg, a real fresh public consumer: the committed template copied into an OS-derived tmpdir root outside the monorepo (reaper-managed), the committed recipe executed verbatim (real pnpm install over the real npm registry, npx expo install, the literal public RNR CLI adds from rnraielements.com, tsc, expo-doctor), the resolved react-native-web version read from the consumer's own node_modules, and the real npx expo export --platform web through the template's withUniwindConfig/withNativeWind Metro.","seed_method":"cli","records":["Env hygiene before spawning any pnpm/npx/expo child: delete NODE_ENV (a vitest/Playwright worker's NODE_ENV=test breaks expo install) and use a short reaper-free TMPDIR, matching the hygiene the owning tasks established.","Per-leg budget: the committed recipe is bounded at 30 min inside the reused helper and the export at 30 min; the whole GREEN run (registry lane + both engine legs) is bounded at <= 90 min and recorded in run.json.","The public apex (rnraielements.com) and the npm registry must be reachable; unreachable registries block execution — never substitute a local registry, hostname rewriting, or monorepo resolution (ORI-RN-001's disallowed substitutions).","The reused helpers rewrite tests/sprint-05-orient-search/evidence/ORI-RN-001/{uniwind,nativewind}-install.txt in place as side effects; those refreshes are committed with the run and never hand-edited or deleted.","The standalone 0.21.2-exports-cleanly claim is already verified twice by the reporting child (ORI-CONT-004 cycle-1 blocked report); this harness re-proves it end-to-end on the committed tree."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"The exact 0.21.2 pin makes a fresh uniwind consumer resolve it and export cleanly","primary":true,"description":"GIVEN the two committed consumer templates (packages/docs-snippets/nativewind/package.json and packages/docs-snippets/uniwind/package.json) and the task-owned harness WHEN the harness prepares a fresh public uniwind consumer from the committed template through the real committed recipe (packages/docs-snippets/commands/uniwind.sh: pnpm install, npx expo install, the literal public RNR CLI adds, tsc, expo-doctor) and runs the real `npx expo export --platform web` THEN pre-pin (RED) the consumer's own node_modules resolves react-native-web exactly '0.21.3' (published 2026-09-25T15:00Z, inside the committed ~0.21.0 range) and the export exits != 0 with the literal 'Unable to resolve module ./exports/InputAccessoryView' in its log, and post-pin (GREEN) both committed manifests declare the exact pin \"react-native-web\": \"0.21.2\" — 0 range operators, unable to resolve 0.21.3 — and an identical fresh consumer resolves exactly '0.21.2' with the export exiting 0.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/rnw-pin-proof.test.ts","test_function":"runRnwPinProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts","test_tier":"e2e","verification_service":"a real fresh public consumer install (real pnpm resolution over the real npm registry, the literal public RNR CLI adds from rnraielements.com, the consumer's own tsc and expo-doctor) plus the real expo export bundler through uniwind 1.11.0's withUniwindConfig Metro","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-CONT-004-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"a real fresh public consumer install (real pnpm resolution over the real npm registry, the literal public RNR CLI adds from rnraielements.com, the consumer's own tsc and expo-doctor) plus the real expo export bundler through uniwind 1.11.0's withUniwindConfig Metro","negative_control":{"would_fail_if":["The resolution lane is faked: an authored registry listing or a lockfile read stands in for the real npm registry query and the consumer's own node_modules/react-native-web/package.json, the export receipt is authored instead of the exit code of a real expo export run, or the RED artifact records 0 failing-export observations.","The pin keeps any range operator that can still resolve 0.21.3 (~0.21.2, ^0.21.2, >=0.21.2), the uniwind leg is skipped or trimmed to a bare template without the public CLI adds, or a local registry or monorepo resolution substitutes for the public apex.","The resolution lane reads a static version map or a mocked registry response instead of querying the real npm registry, or the export lane trusts an authored success flag or a mocked expo export exit code rather than running the real CLI."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumer_install","action":{"actor":"cli_user","steps":["Pre-pin: run the exact selector with --mode red against the committed manifests still carrying \"react-native-web\": \"~0.21.0\" — the harness queries the real npm registry for the committed range, prepares a fresh public uniwind consumer through the committed recipe (pnpm install, npx expo install, the literal public CLI adds, tsc, expo-doctor), reads the resolved version from the consumer's own node_modules, and runs the real npx expo export --platform web.","Apply the exact pin \"react-native-web\": \"0.21.2\" in both packages/docs-snippets/nativewind/package.json and packages/docs-snippets/uniwind/package.json.","Rerun the identical selector in default GREEN mode: registry lane for the exact pin, a fresh uniwind consumer, resolved-version read, and the identical real export."]},"end_state":{"must_observe":["red.json records the real npm registry candidate set for ~0.21.0 containing '0.21.3' alongside '0.21.0'/'0.21.1'/'0.21.2', the consumer's resolved react-native-web version exactly '0.21.3', exportExit != 0, and the literal 'Unable to resolve module ./exports/InputAccessoryView' present in the captured export log.","green.json records both committed manifest entries as the exact string \"react-native-web\": \"0.21.2\" (range-operator count (0) across both entries), the fresh consumer's resolved react-native-web version exactly '0.21.2', and exportExit == 0 for the uniwind leg.","red.json and green.json each bind the candidate source SHA, the literal selector command and mode, the consumer root, the resolved-version read path, and the export exit; the whole GREEN run completes within the recorded <= 90 min budget."],"must_not_observe":["A resolution record with 0 real install steps (no pnpm install output bound), the module-error literal absent from the RED export log, or a RED export exit of 0.","Any pinned entry that a future fresh install could resolve past 0.21.2, or a GREEN resolved version other than exactly '0.21.2'."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"The nativewind consumer still exports cleanly under the same pin","primary":false,"description":"GIVEN the exact 0.21.2 pin landed in both manifests WHEN the harness prepares a fresh public nativewind consumer from the committed template through the committed nativewind recipe and runs the same real export THEN the consumer resolves react-native-web exactly '0.21.2' and `expo export --platform web` exits 0 — the pin changes the resolved version without breaking the nativewind web leg that passed under 0.21.3.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/rnw-pin-proof.test.ts","test_function":"runRnwPinProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts","test_tier":"e2e","verification_service":"the same real fresh public install and real expo export bundler for the nativewind consumer, with the real npm registry resolution lane","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-CONT-004-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"the same real fresh public install and real expo export bundler for the nativewind consumer, with the real npm registry resolution lane","negative_control":{"would_fail_if":["The nativewind leg is skipped, its export receipt is authored rather than a real expo export exit, or completion is claimed from the leg's prior 0.21.3-era pass instead of a fresh pinned install.","The pin breaks the nativewind web leg that previously exported cleanly, proving the pin changed behavior beyond the uniwind consumer.","The nativewind leg is stubbed with a disconnected offline receipt, an empty leg record, or a mocked expo export exit code rather than the real install and export run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumer_install","action":{"actor":"cli_user","steps":["Run the exact selector in default GREEN mode; the harness prepares a fresh public nativewind consumer from the committed template through the committed nativewind recipe, reads the resolved react-native-web version, and runs the real npx expo export --platform web.","Read the nativewind leg record in green.json and correlate it with the refreshed nativewind install evidence."]},"end_state":{"must_observe":["green.json records the nativewind leg with resolved react-native-web exactly '0.21.2' and exportExit == 0.","The harness ran exactly 1 fresh install per engine in GREEN mode (skipped-leg count (0)), and the nativewind install evidence is refreshed by the same run."],"must_not_observe":["A nativewind export exit != 0 under the pin, a resolved nativewind react-native-web version other than '0.21.2', or a missing nativewind leg record."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Aggregate-safe harness, static gates, and the exact write boundary","primary":false,"description":"GIVEN the landed pin and harness WHEN the vitest guard selector, pnpm typecheck, and the scoped Biome command run THEN the harness file contributes a passing vitest-visible guard suite (never a No-test-suite failure in the aggregate) with its heavyweight lanes CLI-gated behind the direct-invocation check, the static gates exit 0, both pinned entries carry 0 range operators, and git diff --name-only reports 0 paths outside the literal allowlist with 0 changes to pnpm-lock.yaml or any workspace manifest (the docs-snippets templates sit outside the pnpm workspace).","flow_ref":null,"test_file":"tests/sprint-05-orient-search/rnw-pin-proof.test.ts","test_function":"runRnwPinProof","verify":"pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts","test_tier":"integration","verification_service":"the real vitest runner over the harness guard suite, the real TypeScript compiler, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-CONT-004-1-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"the real vitest runner over the harness guard suite, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["The harness file contributes a No-test-suite failure to the aggregate vitest run instead of a passing CLI-gated guard suite, or the heavyweight lanes fire under vitest.","A static gate fails and is waved through as pre-existing without the git stash && rerun proof, or the diff leaves the literal allowlist (any pnpm-lock.yaml or workspace-manifest change).","The guard suite is skipped or empty (0 tests) so the aggregate cannot fail on the harness file."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_consumer_install","action":{"actor":"cli_user","steps":["Run the guard selector pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts; confirm the guard suite passes in the vitest process and no fresh install or export starts (heavy lanes stay CLI-gated behind the direct-invocation check).","Run pnpm typecheck and the scoped Biome command over the harness file; prove any failure environmental or pre-existing with git stash && rerun before recording it.","Diff the candidate: confirm the pinned entries, count range operators, and check git diff --name-only against the literal allowlist."]},"end_state":{"must_observe":["The guard selector exits 0 with >= 1 passing test in the harness file and 0 network-bearing lanes executed under vitest.","pnpm typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record; run.json binds both commands and exits.","Both manifest entries are exactly \"react-native-web\": \"0.21.2\" (range-operator count (0)); git diff --name-only reports 0 paths outside the literal allowlist entries and 0 changes to pnpm-lock.yaml or any workspace manifest."],"must_not_observe":["A No-test-suite failure for the harness file under vitest, a heavyweight lane spawning during the aggregate run, or an unproven static-gate failure recorded as pre-existing.","Any edit outside the allowlist, including the apps/harness, apps/harness-nativewind and apps/example manifests that carry the same ~0.21.0 range (report-only finding)."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness RED mode captures the pre-pin drift (registry candidate set including '0.21.3', resolved node_modules version '0.21.3', export exit != 0 with the literal 'Unable to resolve module ./exports/InputAccessoryView'), and GREEN mode proves the exact pin resolves exactly '0.21.2' with export exit 0 for the uniwind consumer.","verify":"pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The GREEN-mode nativewind leg resolves exactly '0.21.2' and its real export exits 0, recorded in green.json with the refreshed install evidence.","verify":"pnpm exec tsx tests/sprint-05-orient-search/rnw-pin-proof.test.ts","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The vitest guard selector passes in-process without spawning heavyweight lanes; pnpm typecheck and the scoped Biome command exit 0 or carry the stash-proven pre-existing record; the diff stays inside the literal allowlist with 0 lockfile or workspace-manifest changes.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/rnw-pin-proof.test.ts","maps_to_ac":"AC-3"}]}
-->
</details>
