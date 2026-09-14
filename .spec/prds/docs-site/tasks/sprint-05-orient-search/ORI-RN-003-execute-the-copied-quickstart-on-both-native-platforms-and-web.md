<!-- Template Version: 5.2.0 | Planned: 2026-09-14 -->
# ORI-RN-003: Execute the copied quickstart on both native platforms and Web

## What this does

The copied Quickstart source proves scrolling, submission and native appearance across both engines on iOS, Android and Web through fresh, attributable execution.

## Why

The compact input requires an executable six-target proof. The task's support files and Sprint 05 test lane are not present in this checkout. Runtime behavior remains unobserved. Completion requires actual execution of the displayed source, native keyboard and appearance evidence, and a submission assertion that fails when its callback is disconnected.

## How to verify

Run `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web` after prerequisites are available. Inspect six engine/platform results, eight native appearance cases and the scratch submission negative control. ORI-CONT-004 then runs the unchanged locked browser flow, awaiting both this seed proof and the separate live proof. All product evidence remains planned.

## Scope

Four proof/driver files and the exact ORI-RN-003 evidence allowlist below. ORI-RN-001/002 supply installation and sample source. ORI-CONT-004 retains PRIMARY ownership of the Quickstart browser flow.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

### METADATA

> Status: Backlog
> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 5 · Type: TEST
> Dependency phase: After ORI-RN-001 and ORI-RN-002; before ORI-CONT-004
> Proposed By: react-native-reusables-planner · Co-authored By: none
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

RUNTIME_COMMANDS:

- test: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`
- typecheck: `pnpm typecheck`
- lint: `pnpm lint`

PROGRESS: 0/5 ACs established; all TDD_STATE values are none.

### OUTCOME

The copied Quickstart source proves scrolling, submission and native appearance across both engines on iOS, Android and Web through fresh, attributable execution.

### CRITICAL CONSTRAINTS

- Use only the exact write allowlist. Preserve shared WIP and leave the flow spec, application source, registry, policies and CI files to their named owners.
- Use explicitly reserved RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL, owned ports and recorded child PIDs. Never use ambient Metro, a default target or an unidentified listener.
- Execute exact supplied source in freshly installed, independent Expo 57 consumers. Never rewrite canonical public URLs, copy monorepo components or mix the styling engines.
- Every native leg must run compatible Expo Go; every Web leg must run the real served export. No stubs, skipped targets, static receipts or dev-client substitutions can pass.
- Confine the required negative-control mutation to a disposable consumer, restore exact source bytes, and fail closed on missing prerequisites or evidence.

### DONE WHEN

- [ ] AC-1: six real engine/platform legs execute; unavailable or busy reservations fail safely.
- [ ] AC-2 and AC-3: olderSeed, one new user marker, cleared input and eight native appearance/layout cases are observed.
- [ ] AC-4: disconnecting the scratch callback fails the real new-message assertion; exact restoration passes.
- [ ] AC-5: the helper validates displayed inputs, awaits fresh execution and rejects stale/incomplete evidence.
- [ ] Runtime, compiler, lint, evidence and independent-review gates pass within the exact write allowlist.

### SPECIFICATION

Implement the executable native and Web proof consumed by the existing Quickstart browser flow. Start from freshly installed consumers, compile the exact supplied source, start owned Metro processes, and open the actual SDK-57-compatible Expo Go application on explicitly reserved iOS and Android devices. Exercise both engines in light and dark appearance. Export and serve each real Web consumer and drive it in Chromium. Capture current-run evidence and fail when any leg is unavailable, stale, or unsuccessful.

### BOUNDARY CONTRACTS

- ORI-CONT-004 remains PRIMARY owner of the Quickstart flow and must depend on this task.
- The proof helper accepts explicit device reservations through RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL. It validates identity and exclusive ownership before use; missing or busy reservations fail with a concrete diagnostic.
- Each consumer has its own temporary directory, dependency tree, Metro cache, Expo state, and port. The helper records child PIDs and tears down only those children.
- Never use the first booted simulator, ambient Metro, an unidentified listener, or the older tests/sprint-01/install-core.test.sh helper.
- Expo Go proves the stated end state. A dev-client build or Expo Web screenshot cannot substitute for it.
- If an additional native build is needed for diagnosis, keep DerivedData, SwiftPM, Gradle, and build outputs inside the assigned worktree or consumer scratch root. Source the repository worktree wrapper when one exists; do not fall back to shared caches.
- CI owns runner provisioning and command wiring. This task supplies the executable proof and its failure contract.

Human test hook: The learner executes the documented source on iOS, Android, and Web and observes working input and scrolling.

### ACCEPTANCE CRITERIA

These are task-owned E2E requirements for the locked TEST task. Each uses primary:false and flow_ref:null. The exact task command invokes the exported runQuickstartProof entrypoint and exercises the corresponding assertions. No AC claims PRIMARY ownership of the supporting browser flow.

#### AC-1

GIVEN fresh nativewind and uniwind consumers WHEN the proof compiles and runs their exact supplied source THEN all six platform legs pass using real Expo Go or served Web.

PRIMARY: false · FLOW_REF: null · TEST_TIER: e2e · TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/support/quickstart-proof.test.ts
TEST_FUNCTION: runQuickstartProof
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`
VERIFICATION_SERVICE: Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium
SURFACE_POLICY: .spec/e2e-policy/surface.json
MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-RN-003-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["Metro execution is omitted or replaced by a static receipt.","A missing native target is skipped and the matrix still reports success."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Run the exact task command: install through ORI-RN-001, compile ORI-RN-002's exact source and run Expo doctor.","Open each owned Metro URL in reserved iOS/Android Expo Go; export/serve each consumer and drive Chromium."]},"end_state":{"must_observe":["Exactly 6 completed legs: nativewind/ios, nativewind/android, nativewind/web, uniwind/ios, uniwind/android, uniwind/web.","Native Expo Go identity/version and Metro bundle logs bind the installed consumer graph; compiler/doctor exit 0.","Each Web export displays the exact captured `olderSeed`."],"must_not_observe":["0 executed legs, empty transcript, missing target or a dev-client/browser substitute for Expo Go.","Monorepo source links, ambient Metro or another run's receipt."]}},{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Repeat with a missing reservation value, then an actually busy reserved target or port; identify its owner before launch."]},"end_state":{"must_observe":["Each invalid reservation exits != 0 and names the missing value or actual ownership conflict.","Unrelated listeners/applications remain unchanged; 0 commands select the first booted simulator."],"must_not_observe":["Default target selection, 0 exit status, skipped leg or termination of an unowned process."]}}]}
```

#### AC-2

GIVEN a scrolling seed transcript and empty composer WHEN the learner scrolls to olderSeed and sends a fresh marker THEN each leg shows one new user message and clears the input.

PRIMARY: false · FLOW_REF: null · TEST_TIER: e2e · TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/support/quickstart-proof.test.ts
TEST_FUNCTION: runQuickstartProof
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`
VERIFICATION_SERVICE: Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium
SURFACE_POLICY: .spec/e2e-policy/surface.json
MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-RN-003-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["The submission callback is disconnected or a no-op.","The list is an empty/static shell or Send message only clears the input."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"seeded_quickstart","action":{"actor":"user","steps":["On every leg, use Maestro gestures or Playwright to scroll to the exact olderSeed.","Type the fresh marker into the real composer, activate Send message and inspect the new user turn and input."]},"end_state":{"must_observe":["The exact `olderSeed` is reachable by scrolling on all 6 legs.","First submission adds exactly 1 user marker and advances seedCount to seedCount + 1.","Composer value becomes \"\"; olderSeed stays reachable; synthesized assistant turns added = 0."],"must_not_observe":["0 new user turns, retained input marker, duplicate turns or a static non-scrolling transcript."]}}]}
```

#### AC-3

GIVEN the exact consumer running on each reserved native target WHEN the learner opens the keyboard and switches light/dark appearance THEN the list, composer, safe areas and native chrome remain usable.

PRIMARY: false · FLOW_REF: null · TEST_TIER: e2e · TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/support/quickstart-proof.test.ts
TEST_FUNCTION: runQuickstartProof
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`
VERIFICATION_SERVICE: Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium
SURFACE_POLICY: .spec/e2e-policy/surface.json
MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-RN-003-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["Safe-area or keyboard handling is removed.","The appearance path is disconnected and native chrome stays static."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"seeded_quickstart","action":{"actor":"user","steps":["On both engines and native platforms, focus the composer and keep the keyboard open while switching light/dark device appearance.","Capture accessibility bounds, inspect iOS screenshots, record Android interaction and repeat scrolling/fresh-marker submission in each appearance."]},"end_state":{"must_observe":["All 8 engine/native-platform/appearance cases have inspected captures and successful marker submission.","List height > 0; composer bounds stay above the keyboard and outside the system gesture region.","Content/navigation/status-bar appearance matches `light` or `dark` with readable text."],"must_not_observe":["Blank or 0-height list, keyboard-covered composer, clipped gesture region or unchanged default chrome."]}}]}
```

#### AC-4

GIVEN an isolated disposable consumer WHEN only its submission callback is disconnected and then restored THEN the new-message assertion fails before the exact restored source passes.

PRIMARY: false · FLOW_REF: null · TEST_TIER: e2e · TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/support/quickstart-proof.test.ts
TEST_FUNCTION: runQuickstartProof
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`
VERIFICATION_SERVICE: Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium
SURFACE_POLICY: .spec/e2e-policy/surface.json
MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-RN-003-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["The assertion is a no-op or reads static receipts instead of the real message list.","The callback remains disconnected after restoration."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"seeded_quickstart","action":{"actor":"cli_user","steps":["Install a separate disposable consumer; retain exact source bytes/hash and prove a normal submission.","Disconnect only its submission callback, relaunch and run the same real new-message assertion with a fresh marker.","Capture the failure, restore exact bytes/hash, relaunch and repeat with another fresh marker."]},"end_state":{"must_observe":["Disconnected run fails with marker count 0 versus expected 1.","Restored run shows exactly 1 new user marker and composer value \"\"; source hash equals the original.","Mutation diff changes only the disposable callback connection; shared checkout modifications = 0."],"must_not_observe":["Mutation accepted as green, absent failure log, empty screenshot or incomplete source restoration."]}}]}
```

#### AC-5

GIVEN commands and source read from the built Quickstart WHEN its browser flow awaits runQuickstartProof THEN only fresh execution of all six matching legs can satisfy the helper.

PRIMARY: false · FLOW_REF: null · TEST_TIER: e2e · TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/support/quickstart-proof.test.ts
TEST_FUNCTION: runQuickstartProof
VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`
VERIFICATION_SERVICE: Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium
SURFACE_POLICY: .spec/e2e-policy/surface.json
MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-RN-003-5","use_case_ref":"UC-DOCS-02","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["The helper is a static receipt reader or omits awaiting a child execution.","Source verification is a no-op and accepts unchanged evidence from another run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Read both panels through Chromium at http://localhost:4321/docs/quickstart; pass exact displayed commands/source to runQuickstartProof.","Await actual installs, compilation, native/Web interactions and capture in this invocation; compare source/registry hashes."]},"end_state":{"must_observe":["The helper validates displayed `nativewind`/`uniwind` inputs and resolves after 6 matching current-run legs.","The `run-manifest.json` binds runId, candidate/source/registry hashes, target identities, child PIDs and observed submissions.","At 5 completed legs the helper promise remains pending; it resolves only after leg 6."],"must_not_observe":["0 executed legs behind a receipt, empty source, mismatched hashes or unawaited work reported as success."]}},{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Supply a prior run's real receipt with another runId; repeat with a missing leg or source hash mismatch."]},"end_state":{"must_observe":["A prior `runId`, missing matrix member or source mismatch fails with a concrete diagnostic.","Failure capture names the offending `runId`, leg or hash; teardown leaves 0 owned listeners and restores prior appearance."],"must_not_observe":["0 exit status or completed status supported by stale, empty or incomplete receipts."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: All six engine/platform legs execute the exact source successfully; missing or busy reservations fail without using or stopping unrelated resources.
- TC-2 → AC-2: Every leg reveals olderSeed, appends exactly one submitted user marker, clears the composer and adds no synthesized assistant turn.
- TC-3 → AC-3: All eight native appearance combinations show measured keyboard/safe-area clearance and inspected matching content/native chrome.
- TC-4 → AC-4: Disconnecting the scratch callback fails the real new-message assertion; restoring byte-identical source passes it.
- TC-5 → AC-5: The helper awaits fresh execution, binds commands/source and current-run hashes, and rejects stale, missing or mismatched receipts.

VERIFY for each TC: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web`. TCs inherit their mapped AC's scenario and have no independent scenario.

### FIXTURES

```json
{"clean_consumers":{"description":"Fresh run; two independent Expo 57 consumers created through ORI-RN-001's real CLI entrypoint.","seed_method":"cli","records":["Separate nativewind/uniwind roots, dependencies, Metro caches, Expo state and owned ports; 0 monorepo source links.","Exact commands/source come from built /docs/quickstart; public URLs are https://rnraielements.com/r/nativewind/conversation.json and https://rnraielements.com/r/uniwind/conversation.json.","RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL reserve compatible Expo Go targets exclusively; Chromium is available.","Fresh runId binds candidate/source/lockfile/registry hashes; 0 completed current-run legs."]},"seeded_quickstart":{"description":"Exact displayed source compiled and launched through Expo Go or its served Web export; documented seed messages initialize normally.","seed_method":"ui_flow","records":["Record seedCount and olderSeed, the older named message's literal text, from supplied source; confirm olderSeed in the running UI.","Transcript exceeds the viewport; composer value is \"\"; next marker occurs 0 times.","Fresh marker format: ORI-RN-003:<runId>:<engine>:<platform>:<appearance>:<sequence>.","Run nativewind/uniwind separately on ios/android/web; record native appearance before changing it."]}}
```

Seed through actual CLI installation and ordinary application launch/UI entrypoints. Do not inject view state, mock HTTP/filesystems/providers, substitute canned answers, or add test-only product seams.

### SCOPE

writeAllowed, exactly:

- `tests/sprint-05-orient-search/support/quickstart-proof.test.ts`
- `tests/sprint-05-orient-search/support/native-session.ts`
- `tests/sprint-05-orient-search/support/quickstart-web.ts`
- `tests/sprint-05-orient-search/quickstart-expo-go.maestro.yaml`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/nativewind/ios/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/nativewind/android/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/nativewind/web/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/uniwind/ios/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/uniwind/android/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/uniwind/web/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/submission-negative-control/`

writeProhibited, exactly:

- `tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts`
- `tests/sprint-01/**`
- `apps/**`
- `packages/**`
- `public/r/**`
- `playwright.config.ts`
- `.github/**`
- `.spec/**`

Any repository file not explicitly allowed is prohibited. The required callback mutation occurs only in a disposable consumer outside the shared source checkout.

### BOUNDARIES — ALWAYS / ASK FIRST

Always:

- Bind source, registry bytes and captures to a fresh run ID and candidate SHA.
- Drive native accessibility controls and Playwright against actual consumer applications.
- Keep engine consumers, dependency trees, caches, Expo state and ports independent; use OS-derived scratch roots.
- On every exit, stop only recorded children, remove owned Android mappings, restore appearance, close contexts and release reservations.
- Preserve prior evidence identity and keep provider credentials out of consumer processes and captured artifacts.

Ask first / stop for an owning decision:

- Changes to locked scope, dependencies, package/version choices or resource ownership require the owning orchestrator's decision.
- Missing source, public HTTPS, compatible Expo Go or native automation blocks execution; report the concrete prerequisite without substituting another surface.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### DELIVERABLE

- `tests/sprint-05-orient-search/support/quickstart-proof.test.ts` (NEW): exported runQuickstartProof and CLI entrypoint; validate displayed inputs, await execution and aggregate current-run evidence.
- `tests/sprint-05-orient-search/support/native-session.ts` (NEW): device reservations, Expo Go/Metro lifecycle, native automation and owned cleanup.
- `tests/sprint-05-orient-search/support/quickstart-web.ts` (NEW): export/serve each installed consumer and drive Chromium.
- `tests/sprint-05-orient-search/quickstart-expo-go.maestro.yaml` (NEW): real accessibility scrolling, text entry and submission observations.
- Exact task evidence allowlist (NEW planned outputs): manifest, six platform records, native appearance captures and callback mutation/restoration proof.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: For each AC, write the real assertion and run its scenario against the recorded preimplementation candidate before implementing that proof path. Preserve actual behavioral failure output under task evidence. Missing files, unavailable targets and setup/compiler errors are blockers, not functional RED.
2. Coordinate with ORI-CONT-004 for the unchanged locked browser command and canonical `proof.red`. Do not edit its spec or claim its primary ownership.
3. GREEN: Implement only the owned proof path. Run the exact task command and retain actual results from all six legs. The callback-disconnection drill must fail the new-message assertion, then pass after exact source restoration.
4. REFACTOR: Improve owned helper structure only if needed, without adding behavior; rerun affected real scenarios. Keep TDD_STATE none until actual evidence supports a transition.
5. After all ACs, obtain independent review of the exact candidate, scope and evidence. This rendering does not authorize implementation, external publication or sprint closure.

### READING LIST

1. `tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts` [PRIMARY PATTERN], lines 139-170: real browser and served-registry byte observations; adapt the observation pattern without importing the old lane or retry policy.
2. `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-RN-003.json`, full file: immutable scope, prerequisites and supporting flow.
3. `.spec/prds/docs-site/04-uc-docs.md`, lines 34-42: UC-DOCS-02 end state and separate worked-example boundary.
4. `/Users/justinrich/Projects/brain/.rosetta/docs/react-native-reusables/MIGRATION.md`: engine-specific styling rules; project Expo 57 pins override historical KB versions.
5. `/Users/justinrich/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md`: OS-derived roots, owned teardown and external reaper contract.

### DESIGN / REFERENCE GUIDANCE AND CODING STANDARDS

Preserve ORI-RN-002's exact sample. Observe its existing RNR Text, portal-host, inset and theme composition on native. Report source defects to that owner. Do not redesign tokens, add overlays or port web AI Elements. Inspect iOS screenshots and record Android interaction; Web alone cannot prove native appearance.

Use TypeScript and existing pnpm/Biome conventions. Keep reservation checks, process lifecycle, evidence validation and cleanup deterministic. Run subprocesses with argument arrays, bounded deadlines and checked exit status. Use Expo tooling for prerequisite-owned package resolution; do not change pins or mix Nativewind/Tailwind v3 with Uniwind/Tailwind v4. Consumed RN strings remain under Text; sample fixes belong to the sample owner.

Agent rationale: The project-local react-native-reusables implementer and reviewer cover universal RNR/Expo execution across both engines. CI provisioning, Astro flow ownership and AI transport remain with their assigned experts.

### EVIDENCE GATES

1. Authoring: pipe normalized `{fixtures, requirements}` to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py`, without a positional argument; require exit 0 and zero findings.
2. Preconditions: verify candidate identity, prerequisite consumers/source, ordinary public DNS/trusted HTTPS, compatible Expo Go, exact reservations and owned ports. Any missing prerequisite blocks runtime acceptance.
3. RED/discrimination: retain observed behavioral RED per AC; prove callback-disconnect failure and exact-restoration success. ORI-CONT-004 owns canonical browser `proof.red`.
4. Runtime: `pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web` exits 0 only after six real legs, eight native appearance cases and owned cleanup.
5. Static gates: `pnpm typecheck` and `pnpm lint` both exit 0 on the implementation candidate. Root typecheck cannot replace compilation and Expo doctor in each fresh consumer.
6. Integrated flow: the primary owner runs `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`. Its complete invocation must await fresh seed and live matrices. Standalone helper success is not full-flow acceptance.
7. Scope/review: only allowed paths change; every AC has seeded evidence; no stub, skipped target, placeholder success or deferred core behavior remains. The assigned reviewer verifies the exact candidate.

### EVIDENCE CONTRACT

All paths below are future outputs. Preserve per-run identity within bounded evidence directories. Record candidate/source/lockfile/policy/driver hashes, public response hashes, CLI and resolved versions, exact commands, compiler/doctor output, consumer roots and process identities.

Each platform leg captures target/browser identity, Metro/export logs, source hash, olderSeed literal, submitted marker, before/after UI and cleared-input observation. Each native appearance case includes accessibility bounds, keyboard/safe-area clearance, inspected iOS screenshots and Android recordings. The mutation directory retains its diff, original/mutated/restored hashes, failing assertion and restored pass. Missing or stale records fail; an authored success flag is insufficient.

Exact planned evidence paths:

- `tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/nativewind/ios/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/nativewind/android/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/nativewind/web/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/uniwind/ios/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/uniwind/android/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/uniwind/web/`
- `tests/sprint-05-orient-search/evidence/ORI-RN-003/submission-negative-control/`

### SUPPORTING FLOW AND SPRINT CONTRACT

Supported task flow: FLOW-DOCS-02-quickstart-chat-screen, primary:false, primary_owner: ORI-CONT-004. ORI-GATE-03 exercises this task; its contribution is flow steps 2-7. Locked test: `tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts`. Exact test function/grep token: `FLOW-DOCS-02-quickstart-chat-screen`. Locked run command: `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts --grep FLOW-DOCS-02-quickstart-chat-screen --project=chromium-desktop`.

Canonical flow artifact: `tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/run.json`. Canonical RED proof: `tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-quickstart-chat-screen/proof.red`. Surface policy: `.spec/e2e-policy/surface.json`. Coldboot policy: `.spec/e2e-policy/coldboot.json`. These remain primary-owner outputs and read-only inputs to this task. The same real-browser flow must record an observed preimplementation failure before its completed-candidate pass; source absence and authored success flags are insufficient.

Flow co-authors remain astro-planner, techwriting-planner, frontend-designer, react-native-reusables-planner, aisdk-planner, cloudflare-workers-planner and ghactions-planner. Task co_authored_by remains [].

Fixed gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Fixed entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). The sprint retains 13 flows: 9 task flows and 4 journeys, 36 tasks and 131 points. Journey proofs belong to ORI-AST-010; this task returns none.

### OUT OF SCOPE

- Editing the Quickstart browser spec or taking PRIMARY ownership from ORI-CONT-004.
- Repairing registry/component/application source or authoring tutorial content; report those defects to their owners.
- Implementing live useChat/provider proof, assistant synthesis, transport, abort/retry or additional live screens.
- CI runner provisioning, workflow/config changes, deployment/domain setup, policy edits or journey proofs.

### CONTEXT AND REFERENCES

Current gap: executable six-target proof is required and remains unobserved. Success state: runQuickstartProof validates supplied commands/source, awaits all six legs, captures native appearance/keyboard results, rejects stale receipts and proves its submission assertion by mutation.

Capability: CAP-DOCS-01. PRD: `.spec/prds/docs-site/04-uc-docs.md#uc-docs-02-build-a-chat-screen-with-the-single-quickstart-tutorial`; `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`.

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/react-native-reusables-planner-absorb-prerequisites.json`. Source task IDs: ORI-RN-003. Supersedes: []. Dark justification: null. Artifact status: planned_output_not_observed.

Read the exact compact context's verification preconditions before execution. Source identity, public DNS/HTTPS, reservations, native setup and cleanup require fresh checks. Full browser acceptance additionally depends on the separately owned live-provider matrix. This charter does not claim those prerequisites have been satisfied.

### REVIEW

Must pass:

- All five task-local E2E scenarios and mapped TCs have real RED/GREEN evidence; no primary flow ownership is claimed.
- Six platform legs and eight native appearance cases prove scrolling, unique submission, clearing and measured layout.
- Scratch callback disconnection fails the same new-message assertion; exact restoration passes.
- Inputs, hashes and awaited child work bind proof to the current invocation; stale/missing receipts fail.
- Scope, reservations, credential hygiene, teardown and typecheck/lint gates hold.

Should verify:

- Native text and navigation/status-bar appearance are readable in inspected captures.
- Engine caches and dependency graphs cannot contaminate one another.
- Failures identify exact prerequisites and preserve unrelated WIP/processes.

Verdict: APPROVED or NEEDS_FIXES. Feedback must name the failed AC, observed value and file/line or evidence artifact.

### DEPENDENCIES

Depends on: ORI-RN-001 and ORI-RN-002.
Blocks: ORI-CONT-004.
Parallel: do not assume resources can be shared; require independent consumers and exclusive reservations.

Provides:

- runQuickstartProof
- Proof half of SEAM-RN-VERIFIED-QUICKSTART-SAMPLE

Consumes:

- ORI-RN-001's fresh public-registry installations and consumer provenance.
- ORI-RN-002's exact runnable source and seed transcript for each engine.
- ORI-CONT-004's displayed commands/source and awaited browser caller.
- Corrected public registry publication through ORI-DEP-001's prerequisite chain; CI-owned runner/resource reservations.

### AUTHORING VALIDATION

The read-only scenario validator received the exact normalized fixtures and requirements through stdin and returned exit 0, scenario_count 5 and zero findings. Product verification: not_run. Deliverables and evidence remain planned.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-RN-003","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"clean_consumers":{"description":"Fresh run; two independent Expo 57 consumers created through ORI-RN-001's real CLI entrypoint.","seed_method":"cli","records":["Separate nativewind/uniwind roots, dependencies, Metro caches, Expo state and owned ports; 0 monorepo source links.","Exact commands/source come from built /docs/quickstart; public URLs are https://rnraielements.com/r/nativewind/conversation.json and https://rnraielements.com/r/uniwind/conversation.json.","RNR_S05_IOS_UDID and RNR_S05_ANDROID_SERIAL reserve compatible Expo Go targets exclusively; Chromium is available.","Fresh runId binds candidate/source/lockfile/registry hashes; 0 completed current-run legs."]},"seeded_quickstart":{"description":"Exact displayed source compiled and launched through Expo Go or its served Web export; documented seed messages initialize normally.","seed_method":"ui_flow","records":["Record seedCount and olderSeed, the older named message's literal text, from supplied source; confirm olderSeed in the running UI.","Transcript exceeds the viewport; composer value is \"\"; next marker occurs 0 times.","Fresh marker format: ORI-RN-003:<runId>:<engine>:<platform>:<appearance>:<sequence>.","Run nativewind/uniwind separately on ios/android/web; record native appearance before changing it."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN fresh nativewind and uniwind consumers WHEN the proof compiles and runs their exact supplied source THEN all six platform legs pass using real Expo Go or served Web.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/quickstart-proof.test.ts","test_function":"runQuickstartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-RN-003-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["Metro execution is omitted or replaced by a static receipt.","A missing native target is skipped and the matrix still reports success."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Run the exact task command: install through ORI-RN-001, compile ORI-RN-002's exact source and run Expo doctor.","Open each owned Metro URL in reserved iOS/Android Expo Go; export/serve each consumer and drive Chromium."]},"end_state":{"must_observe":["Exactly 6 completed legs: nativewind/ios, nativewind/android, nativewind/web, uniwind/ios, uniwind/android, uniwind/web.","Native Expo Go identity/version and Metro bundle logs bind the installed consumer graph; compiler/doctor exit 0.","Each Web export displays the exact captured `olderSeed`."],"must_not_observe":["0 executed legs, empty transcript, missing target or a dev-client/browser substitute for Expo Go.","Monorepo source links, ambient Metro or another run's receipt."]}},{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Repeat with a missing reservation value, then an actually busy reserved target or port; identify its owner before launch."]},"end_state":{"must_observe":["Each invalid reservation exits != 0 and names the missing value or actual ownership conflict.","Unrelated listeners/applications remain unchanged; 0 commands select the first booted simulator."],"must_not_observe":["Default target selection, 0 exit status, skipped leg or termination of an unowned process."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN a scrolling seed transcript and empty composer WHEN the learner scrolls to olderSeed and sends a fresh marker THEN each leg shows one new user message and clears the input.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/quickstart-proof.test.ts","test_function":"runQuickstartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-RN-003-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["The submission callback is disconnected or a no-op.","The list is an empty/static shell or Send message only clears the input."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"seeded_quickstart","action":{"actor":"user","steps":["On every leg, use Maestro gestures or Playwright to scroll to the exact olderSeed.","Type the fresh marker into the real composer, activate Send message and inspect the new user turn and input."]},"end_state":{"must_observe":["The exact `olderSeed` is reachable by scrolling on all 6 legs.","First submission adds exactly 1 user marker and advances seedCount to seedCount + 1.","Composer value becomes \"\"; olderSeed stays reachable; synthesized assistant turns added = 0."],"must_not_observe":["0 new user turns, retained input marker, duplicate turns or a static non-scrolling transcript."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the exact consumer running on each reserved native target WHEN the learner opens the keyboard and switches light/dark appearance THEN the list, composer, safe areas and native chrome remain usable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/quickstart-proof.test.ts","test_function":"runQuickstartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-RN-003-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["Safe-area or keyboard handling is removed.","The appearance path is disconnected and native chrome stays static."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"seeded_quickstart","action":{"actor":"user","steps":["On both engines and native platforms, focus the composer and keep the keyboard open while switching light/dark device appearance.","Capture accessibility bounds, inspect iOS screenshots, record Android interaction and repeat scrolling/fresh-marker submission in each appearance."]},"end_state":{"must_observe":["All 8 engine/native-platform/appearance cases have inspected captures and successful marker submission.","List height > 0; composer bounds stay above the keyboard and outside the system gesture region.","Content/navigation/status-bar appearance matches `light` or `dark` with readable text."],"must_not_observe":["Blank or 0-height list, keyboard-covered composer, clipped gesture region or unchanged default chrome."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN an isolated disposable consumer WHEN only its submission callback is disconnected and then restored THEN the new-message assertion fails before the exact restored source passes.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/quickstart-proof.test.ts","test_function":"runQuickstartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-RN-003-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["The assertion is a no-op or reads static receipts instead of the real message list.","The callback remains disconnected after restoration."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"seeded_quickstart","action":{"actor":"cli_user","steps":["Install a separate disposable consumer; retain exact source bytes/hash and prove a normal submission.","Disconnect only its submission callback, relaunch and run the same real new-message assertion with a fresh marker.","Capture the failure, restore exact bytes/hash, relaunch and repeat with another fresh marker."]},"end_state":{"must_observe":["Disconnected run fails with marker count 0 versus expected 1.","Restored run shows exactly 1 new user marker and composer value \"\"; source hash equals the original.","Mutation diff changes only the disposable callback connection; shared checkout modifications = 0."],"must_not_observe":["Mutation accepted as green, absent failure log, empty screenshot or incomplete source restoration."]}}]}},{"id":"AC-5","type":"acceptance_criterion","primary":false,"description":"GIVEN commands and source read from the built Quickstart WHEN its browser flow awaits runQuickstartProof THEN only fresh execution of all six matching legs can satisfy the helper.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/support/quickstart-proof.test.ts","test_function":"runQuickstartProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-RN-003-5","use_case_ref":"UC-DOCS-02","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Public RNR HTTPS registry/CLI; Expo 57 compiler/Metro; iOS/Android Expo Go/Maestro; Expo Web/Chromium","negative_control":{"would_fail_if":["The helper is a static receipt reader or omits awaiting a child execution.","Source verification is a no-op and accepts unchanged evidence from another run."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Read both panels through Chromium at http://localhost:4321/docs/quickstart; pass exact displayed commands/source to runQuickstartProof.","Await actual installs, compilation, native/Web interactions and capture in this invocation; compare source/registry hashes."]},"end_state":{"must_observe":["The helper validates displayed `nativewind`/`uniwind` inputs and resolves after 6 matching current-run legs.","The `run-manifest.json` binds runId, candidate/source/registry hashes, target identities, child PIDs and observed submissions.","At 5 completed legs the helper promise remains pending; it resolves only after leg 6."],"must_not_observe":["0 executed legs behind a receipt, empty source, mismatched hashes or unawaited work reported as success."]}},{"start_ref":"clean_consumers","action":{"actor":"cli_user","steps":["Supply a prior run's real receipt with another runId; repeat with a missing leg or source hash mismatch."]},"end_state":{"must_observe":["A prior `runId`, missing matrix member or source mismatch fails with a concrete diagnostic.","Failure capture names the offending `runId`, leg or hash; teardown leaves 0 owned listeners and restores prior appearance."],"must_not_observe":["0 exit status or completed status supported by stale, empty or incomplete receipts."]}}]}},{"id":"TC-1","type":"test_criterion","description":"All six engine/platform legs execute the exact source successfully; missing or busy reservations fail without using or stopping unrelated resources.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Every leg reveals olderSeed, appends exactly one submitted user marker, clears the composer and adds no synthesized assistant turn.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"All eight native appearance combinations show measured keyboard/safe-area clearance and inspected matching content/native chrome.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Disconnecting the scratch callback fails the real new-message assertion; restoring byte-identical source passes it.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","maps_to_ac":"AC-4"},{"id":"TC-5","type":"test_criterion","description":"The helper awaits fresh execution, binds commands/source and current-run hashes, and rejects stale, missing or mismatched receipts.","verify":"pnpm exec tsx tests/sprint-05-orient-search/support/quickstart-proof.test.ts --engines nativewind,uniwind --platforms ios,android,web","maps_to_ac":"AC-5"}]}
-->
</details>
