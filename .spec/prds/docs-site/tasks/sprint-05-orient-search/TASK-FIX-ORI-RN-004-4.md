# FIX-ORI-RN-004-4: Repair the native live proof after isolated iOS diagnosis

## What this does

Diagnoses and repairs the native proof that blocks the live half of Quickstart. Run the real iOS light-to-dark slice before a broad matrix, preserve the observed RED, and change only the native proof that evidence demonstrates is wrong. Then verify the inherited marker, streaming, active Stop, endpoint-loss/Retry, and provider-correlation contract on the slice and full caller.

## Why

ORI-CONT-004 cycle 4 is blocked by a file outside its ownership: `tests/sprint-05-orient-search/live-example.maestro.yaml`. Its recorded candidate `21b2bf92673fa465aba3ba3dbc0ccd622ea24417` completed the seed prerequisite with six passing engine/platform combinations, but the separate Uniwind live driver recorded only two of three platforms passed. The iOS light appearance passed; dark failed to make the exact marker visible even though `hierarchy_has_marker` was true. Presence in an accessibility tree does not prove a visible marker.

The ORI-AI-002 wrapper also retained a `Stop generating` diagnostic from its intentional invalid-model rejection phase. The current caller records that child phase without requiring its completed flag to be true; a child diagnostic alone is not a second caller defect. Attribute it to phase/model and inspect the parent result and target validation before escalating. The confirmed failed live leg is the iOS dark marker check. Preserve the deliberate rejection phase and the valid-model active-Stop requirement; do not change either to evade a failure.

CONT's tip `e44dbabbaa28e31f70beeaaddd65aeb79ccb3962` contains an attempted YAML patch. It is unreviewed input, not approved code or passing proof. Leave that branch and its WIP intact. Start the repair from the orchestrator's assigned current trunk base, record differences from the failed candidate, and reproduce against that base before accepting a fix.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode red --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase full --mode green --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase audit --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts tests/sprint-05-orient-search/native-live-repair-proof_test.ts
```

The task-owned entry point is a new thin supervisor and evidence checker over the existing real commands, not a replacement driver. Its `_test.ts` suffix is recognized by the shared flow validator and is excluded by the verified Vitest include `tests/**/*.test.ts`; no Vitest configuration change or heavyweight auto-discovered test is permitted. `--mode red` preserves the actual nonzero native failure; it does not manufacture a bug or report runtime success. Each retry uses a new cycle directory. The full command is forbidden until the isolated slice has a documented diagnosis and passes after the scoped repair.

## Scope

Own the existing YAML, narrowly necessary iOS-native sections of `support/live-example-proof.test.ts`, the small task-owned supervisor, and bounded evidence. The app, AI hook/backend, NativeWind driver, shared device adapter, caller orchestrator, and locked-flow files remain outside the edit boundary. A product/caller defect is a concrete block for its owner.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending
> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 5 · Type: FIX
> Dependency phase: NEXT after completed ORI-RN-004
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-29
> Source SHA: 5a6aa62f0423ac1bec57c7fffad3727ca68124e5

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/4 ACs; every TDD_STATE is none. No RED/GREEN or completion is claimed by this plan.

### OUTCOME

An independently reviewed native proof repair supported by a reproducible current iOS failure, same-slice GREEN, and a fresh passing six-target live caller. ORI-CONT-004 then resumes its unchanged locked flow, producing its own current-invocation seed and live evidence.

### CRITICAL CONSTRAINTS — Never

- Never replace visible native observations with hierarchy substring presence, lower a threshold merely to pass, remove exact marker/Stop/Retry assertions, add test-only labels, or fabricate provider correlation.
- Never stub the app/provider/browser, synthesize success receipts, skip a required leg/phase, force stream latency, or change model/prompts/provider limits to keep Stop visible artificially.
- Never edit cross-owner product/caller/device code, locked-flow steps/commands, or CONT's task/worktree. A demonstrated outside-scope defect must be reported with evidence.
- Never claim the unreviewed branch patch, older seed success, or a partial iOS result proves the full live matrix. A slice retains inherited `completed: false`; all six live targets still must pass.
- Never run unbounded or blind aggregate retries, kill another owner's processes, use the first booted device, bypass hooks, or overwrite prior cycle evidence.

### DEFAULTS — Always

- Use the reserved iOS `81487B1E-A4D1-45AE-9BCE-D675802BACD1` and Android `emulator-5554`, after verifying identity and exclusive ownership.
- Prefer the smallest YAML repair grounded in the failed screenshot and real accessibility behavior. Edit native-driver support only when the same captured failure requires it.
- Keep the existing true light-to-dark order, keyboard behavior, request correlation, lifecycle bounds, and exported `runLiveExampleProof`/caller schema intact.
- Inspect native screenshots and recordings visually; retain the raw logs and backend records that support each verdict.
- Commit validated scoped work on the assigned branch; independent reviewer approves the exact candidate; only the orchestrator merges.

### DONE WHEN

- [ ] AC-1 has real current RED and same-slice light/dark GREEN with visible exact markers.
- [ ] AC-2 preserves active Stop, streamed output, context and retained-turn Retry with actual request correlation.
- [ ] AC-3 passes the existing full caller for all six live targets, without waiving its rejection phase or native appearances.
- [ ] AC-4 proves bounded execution, resource restoration, source-bound immutable evidence, static gates and scope.
- [ ] Independent native reviewer approves; completion handoff explicitly leaves FLOW-DOCS-02 to ORI-CONT-004.

### SPECIFICATION

#### First diagnose the actual iOS slice

Create `tests/sprint-05-orient-search/native-live-repair-proof_test.ts` as a small task-local CLI wrapper. It must invoke the existing exported `runLiveExampleProof` or its existing CLI in a separate child using `platforms: ['ios']`/`--platforms ios`. Do not create a parallel implementation, new product seam, or new appearance-selection API. The current driver deliberately executes light then dark and runs the real iOS YAML plus its native endpoint-loss/Retry phase. Keep that order to preserve the failure conditions.

The existing CLI exits 1 on an otherwise passing iOS-only run because `completed` literally means three platforms. The wrapper must record that raw exit and original manifest unchanged, verify the current run ID, require exactly the light and dark iOS outcomes, and derive slice success from both statuses and real observations. It must not mutate `completed` or accept a missing/failed leg. Direct export use is also allowed if the same manifest, execution and child isolation are preserved. Do not interpret exit 1 alone as RED; an actual failed native step is required.

Run the current assigned base before editing YAML/driver behavior. Capture appearance, exact step/selector, screenshot, keyboard geometry, accessibility hierarchy, actual submitted marker, provider phase/model, request IDs, and raw logs. Compare the current YAML hash with the recorded failed candidate and later attempted branch patch. Historical evidence is context only. If the base cannot reproduce after at most two bounded attempts with recorded conditions, stop and report `not reproduced`; do not reintroduce an old failure or force a timeout to obtain RED.

The repair may navigate the real transcript or dismiss a real keyboard obstruction only when evidence shows that is the cause. Keep a final exact visible-marker assertion and prove the accepted user turn, not just an assistant echo. A coordinate tap is permitted only if the current device screenshot proves its actual target and it preserves accessibility assertions; do not copy `50%, 30%` or `visibilityPercentage: 40` from the unreviewed patch on faith. Never decrease visibility requirements to hide an offscreen result. No source/UI mutation is permitted merely to make a test pass.

#### Keep active streaming and Retry causal

The native flow continues through the existing seed exchange, contextual follow-up, long response, active Stop, and endpoint-loss/Retry. Capture the request active at Stop and its incremental output before the tap. Its backend record must show abort before natural completion. A later completed record is not interchangeable with this request. Preserve the existing prompt/model/token configuration and prohibit injected delays or throttling changes.

For Retry, stop only the owned backend through its lifecycle handle, observe the real sanitized error and accessible control, restart that endpoint, and activate Retry on the retained turn. Require a new real request ID and exactly one retained user turn. Correlate records by run, request and appearance interval; do not reuse another leg's events. Inspect screenshots/recordings for visible text and reachable controls; hierarchy alone does not prove pixels.

The historical wrapper `Stop generating` diagnostic occurs in the intentional provider-reject phase. Current runEnginePhases records reject completed/status values and error records, then proceeds to the valid-model live phase; it does not treat the reject child's nonzero/partial outcome alone as caller failure. Inspect the parent manifest validation, concrete target rejection reasons, and live-leg status. An expected rejected-provider receipt is valid negative-control evidence, not automatically an AI-owner blocker. Only a demonstrated parent/caller contract failure outside native ownership is routed to the AI SDK owner, with exact phase/model/request evidence. Do not change the caller, skip rejection, restore the model early, or alter provider responses. Valid-model live phases must still prove active Stop.

#### Prove the existing full caller only after slice GREEN

The wrapper's full phase executes the unchanged command shape:

```sh
node tests/sprint-05-orient-search/run-live-example-proof.mjs --engines uniwind,nativewind --platforms ios,android,web --output tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-4/cycle-1/full-green/caller --run-id FIX-ORI-RN-004-4-cycle-1-full --ios-udid 81487B1E-A4D1-45AE-9BCE-D675802BACD1 --android-serial emulator-5554
node tests/sprint-05-orient-search/run-live-example-proof.mjs --validate tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-4/cycle-1/full-green/caller --expect-run-id FIX-ORI-RN-004-4-cycle-1-full
```

Substitute only the new cycle label for subsequent attempts; preserve the recorded exact argv. `runLiveExampleProof` currently writes driver screenshots/manifests to fixed ORI-RN-004 evidence paths despite its outputDir option. Permit those real generated side effects only in this task's assigned worktree, then snapshot and hash them immediately under the task-owned immutable cycle directory. Other generated ORI-RN-005/ORI-AI-002 paths have the same side-effect-only rule. Do not copy into or overwrite CONT's worktree.

Require caller exit 0 and validate-only exit 0, all six target names, validation.ok true, and current source/run identities. Preserve the rejection/live/web-self phases and the inherited per-target criteria. Do not add a new aggregate or rerun pnpm test to diagnose a single native selector. An unowned full-matrix failure is a blocker with precise evidence, not permission to broaden the repair.

#### Runtime ownership, bounds and evidence

Set `RNR_S05_IOS_UDID` and `RNR_S05_ANDROID_SERIAL` explicitly. Check the reserved device identities, Expo Go compatibility, real APK/cache path consumed by the existing driver, installed app, and active owners before launch. Do not uninstall or erase shared devices to fix setup. Missing APK, credentials, public install dependencies or a busy reserved port/device is a concrete prerequisite failure, not RED. Strip NODE_ENV from pnpm/npx/expo children and keep credentials out of logs, bundles and receipts. Use a short OS-derived scratch root outside the repo; no hardcoded `/tmp` and no global reaper change.

Check ports used by the selected path before launch: 4000, 8095 and 8406 for the Uniwind driver; inspect the unchanged matrix/NativeWind source for the full run's additional ports. Record foreign listeners and stop rather than killing them. The shared drivers may reserve both devices even for the iOS slice; the reservation is required although only iOS is exercised. Do not share either reserved target with another run.

The task-local supervisor must stay outside the driver's synchronous event loop. Record its child/process-group IDs, actual start time, phase transitions, last child output time and exit/signal. Emit a supervisor heartbeat at least every 30 seconds. Bound an isolated iOS invocation to 2700 seconds (existing native leg bound 2400 seconds plus setup/cleanup); bound the full caller to 14400 seconds, with per-phase limits: the existing NativeWind clean-consumer recipe/install/compiler/doctor preparation 3600 seconds (its recipe alone already permits 1800 seconds), device/Metro native-prep 300 seconds, each native leg 2400 seconds, web leg 900 seconds, backend operation 120 seconds, cleanup 180 seconds. Do not apply the device-prep limit to clean-consumer installation. Honor existing tighter bounds. Name the timed-out phase and last progress; a supervisor heartbeat by itself is not child progress. Use actual phase markers/owned child activity, not an arbitrary short output-silence timer during a valid native action.

On timeout/failure, preserve evidence before terminating only the recorded owned process group and children. Teardown must inspect actual listeners/descendants, restore recorded appearances, remove only this run's Android reverse mappings, close proof browsers and release reservations. No global pkill, port-only kill of an unknown PID, first-booted fallback, or silent timeout success. Retain the real failure cleanup result as well as success cleanup proof.

A cycle is a shared parent with create-once phase/mode children: `cycle-1/ios-red/`, `cycle-1/ios-green/`, and `cycle-1/full-green/`. Each execution atomically creates only its own child and refuses that child if it already exists; an existing parent from an earlier phase is required and is not an error. The full caller writes under `cycle-1/full-green/caller/`. Record an immutable cycle identity (task/base/parent linkage) on first creation; later phases must match that identity and reference the preceding evidence hashes. Repeating a failed execution uses a new cycle, never overwrites a child. `--phase audit --cycle cycle-1` is read-only and idempotent: it reads all completed phase children, prints its verdict, and creates or rewrites no evidence. `red.json`, `green.json`, `run.json`, logs, screenshots/recordings and source manifest live in their applicable phase/mode child. Preserve exact executed HEAD and hashes for YAML, driver, wrapper, app/hook/backend, lockfile and caller. An evidence-only commit may follow execution, but never rewrite the execution SHA; the reviewer binds unchanged executable hashes to the final candidate or reruns changed code. No historical cycle is overwritten or relabeled as fresh.

### BOUNDARY CONTRACTS

- `live-example.maestro.yaml`: real iOS interaction repair only; retain marker, seed/context, active Stop and exact accessibility assertions.
- `support/live-example-proof.test.ts`: narrowly necessary native iOS proof/diagnostic sections (`runLiveMaestro`, `runNativeAppearance`, native observation helpers) only when the actual RED requires them. Preserve public options, CLI flags, manifest/correlation schemas, Web/Android semantics, backend lifecycle/model/prompts and existing bounds. No general refactor.
- `tests/sprint-05-orient-search/native-live-repair-proof_test.ts`: thin task-local supervisor and evidence checker over existing entrypoints; no duplicated driver, new app seam, stub renderer, or generic process framework.
- Task evidence paths: immutable cycle data only. Existing ORI-RN-004/005 and ORI-AI-002 evidence directories are generated side effects in this worktree only, never hand-authored successes.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All functional checks use real services; the slice is a diagnostic prerequisite and does not replace the full matrix.

#### AC-1: Diagnose the current iOS failure before repairing its native proof [PRIMARY]

GIVEN the unmodified current native proof and a real iOS session WHEN the isolated light-then-dark slice runs before any fix THEN preserve a concrete failing observation and its source-bound RED; after a bounded native-owner repair, the identical slice must pass both appearances with the exact marker visibly rendered and the composer usable.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/native-live-repair-proof_test.ts
- TEST_FUNCTION: runIosRepairProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-004-4-1",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-1",
  "primary": true,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
  "negative_control": {
    "would_fail_if": [
      "The repair is accepted from hierarchy_has_marker alone while the marker is off screen, an assistant echo is substituted for the accepted user turn, or assertVisible is removed.",
      "A historical receipt or the unreviewed e44dbabb patch is called current RED/GREEN without executing the candidate.",
      "A stub app, scripted success receipt, disabled assertion, or added test-only label replaces the real native interaction."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "native_live_session",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Run pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode red --cycle cycle-1 against the assigned task base before changing the YAML or native driver behavior.",
          "Inspect the failing screenshot, accessibility hierarchy, keyboard state, Maestro step, provider phase/model, and source hashes; distinguish marker visibility from active Stop failure.",
          "Apply only the demonstrated native proof repair. Rerun the same iOS slice with mode green and the same device/phase order."
        ]
      },
      "end_state": {
        "must_observe": [
          "red.json records at least 1 actual native failure on the unmodified current task base, with exact command, candidate/source hashes, run ID, appearance, failing step, nonzero child exit, screenshot and raw log paths.",
          "green.json records 2 iOS appearance outcomes, light and dark, both passed; each has a visibly rendered fresh user marker, actual assertVisible success, and the composer above the keyboard.",
          "For the 1-platform slice the inherited completed flag remains false; acceptance requires exactly 2 passed iOS appearance legs and current source/run binding, not rewriting completed."
        ],
        "must_not_observe": [
          "0 captured runtime failures called RED, a manufactured failure by deleting a product behavior, a hierarchy-only visible-marker claim, or an unreviewed patch reported as fixed.",
          "A full two-engine matrix started before the slice diagnosis and green evidence."
        ]
      }
    }
  ]
}
```

#### AC-2: Preserve active Stop and retained-turn Retry on the real iOS slice

GIVEN both iOS appearances on the valid inherited model WHEN the actual composer sends a contextual exchange, an active long response is stopped, and the owned endpoint is lost then restored THEN each appearance has visible nonempty streamed output, a correlated abort before natural completion, and Retry completes a new request with exactly one retained failed user turn.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/native-live-repair-proof_test.ts
- TEST_FUNCTION: runIosRepairProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-004-4-2",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-2",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
  "negative_control": {
    "would_fail_if": [
      "Stop is tapped after natural completion, a finished response is labeled aborted, or response latency is artificially delayed.",
      "The Retry control is omitted, a stub response replaces the provider, or hierarchy text alone replaces visible streamed output.",
      "Records from a different run, platform, appearance, or request are used to satisfy abort/retry correlation."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "native_live_session",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Inspect the existing real iOS slice through marker, seed exchange, contextual follow-up, active Stop, and endpoint-loss/Retry; retain the existing commands and prompts.",
          "Correlate visible growth and active Stop to the same request and appearance time window using screenshots/recording and real backend records.",
          "Stop only the owned endpoint, send the retry probe, observe the sanitized error and accessible Retry, restart the owned endpoint, and activate Retry."
        ]
      },
      "end_state": {
        "must_observe": [
          "For both of the 2 iOS appearances, actual screenshots/recordings show nonempty incremental assistant output and the \"Stop generating\" control while a provider request is active.",
          "Each Stop has a same-run, same-request outcome \"aborted\" before natural completion; a later request has a distinct request ID and completed answer correlated to its server text hash.",
          "Both appearances show a sanitized endpoint-loss error and accessible \"Retry\"; retry yields a new completed provider request and exactly 1 retained user turn for the failed submission."
        ],
        "must_not_observe": [
          "0 correlated aborts, an empty response, a forced stream delay, an altered valid model, or a response already completed when Stop is activated.",
          "Missing Retry requests, duplicate retained user turns, leaked credentials, or a rejected-provider phase passed off as a valid active-stream check."
        ]
      }
    }
  ]
}
```

#### AC-3: Verify the unchanged caller with all six live engine/platform targets

GIVEN the independently inspected green iOS slice WHEN the unchanged ORI-AI-002 caller runs both engines across iOS, Android and Web under the outer supervisor THEN all 6 live targets pass its existing validation with fresh source/run binding, native light/dark proof, real provider rejection/recovery, active abort and Retry; the complete locked Quickstart flow remains for ORI-CONT-004.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/native-live-repair-proof_test.ts
- TEST_FUNCTION: runFullLiveProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase full --mode green --cycle cycle-1`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-004-4-3",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-3",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
  "negative_control": {
    "would_fail_if": [
      "A native target is omitted, an old receipt is copied as fresh, a caller phase is skipped, or a rejected provider is silently replaced by a canned response.",
      "The expected reject-phase \"Stop generating\" diagnostic is labeled a caller defect without inspecting its phase/model, parent validation, and live-leg outcome.",
      "A source mutation, another run ID, or mismatched device evidence is accepted as the exact candidate proof."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "native_live_session",
      "action": {
        "actor": "cli_user",
        "steps": [
          "After slice green, run the existing run-live-example-proof.mjs for uniwind,nativewind and ios,android,web with a fresh task-owned output directory and run ID.",
          "Inspect every reject/live/web-self phase and target result; require all existing caller validation and use its validate-only entry point for the same run ID.",
          "If a caller/provider-phase contract fails outside native ownership, stop and report exact phase/model/request evidence to its owner; do not patch it here."
        ]
      },
      "end_state": {
        "must_observe": [
          "The real full caller exits 0; its fresh manifest has exit_code 0 and validation.ok true with all 6 targets: uniwind-ios, uniwind-android, uniwind-web, nativewind-ios, nativewind-android, nativewind-web.",
          "All 6 targets have current request/response IDs, model, usage, visible text growth, active abort, rejection/recovery, Retry and cleanup evidence; all 8 native engine/platform/appearance combinations have current light/dark captures bound to this invocation and source hashes.",
          "The unchanged caller validate-only command exits 0 for the exact run ID; the handoff explicitly states FLOW-DOCS-02 remains unrun by this task."
        ],
        "must_not_observe": [
          "0 native legs, partial targets labeled complete, a newly failing caller phase hidden by a marker-only pass, or an altered locked flow.",
          "A historical six-seed-leg success substituted for any live target, or a multi-hour blind retry with the same unresolved failure."
        ]
      }
    }
  ]
}
```

#### AC-4: Bound the owned processes and preserve exact evidence and scope

GIVEN real isolated and full runs WHEN normal completion or failure triggers teardown and the static/source audit THEN owned resources are released, device appearance and reverse mappings are restored, immutable receipts retain exact source identities, and the committed task diff contains only implementationCommitAllowed paths and the allowed proof repair; generated runtime writes are separately recorded and excluded from that diff.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real Git, filesystem evidence, process/port inspection, TypeScript compiler, and Biome
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/native-live-repair-proof_test.ts
- TEST_FUNCTION: auditNativeRepairProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase audit --cycle cycle-1`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-004-4-4",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-4",
  "primary": false,
  "tier": "visible",
  "test_tier": "integration",
  "verification_service": "Real Git, filesystem evidence, process/port inspection, TypeScript compiler, and Biome",
  "negative_control": {
    "would_fail_if": [
      "A timeout becomes exit 0, a process remains listening after teardown, another owner is killed, or a fabricated cleanup flag replaces observed process checks.",
      "A stale manifest is accepted, historical evidence is overwritten, or a product/caller/locked-flow file changes outside the allowed paths.",
      "The compiler or source audit is skipped or replaced by a static success receipt."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "native_live_session",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Use an external supervisor process around the real proof child, record its owned process group and phase timestamps, and retain raw exits/signals before cleanup.",
          "On RED failure and GREEN completion, inspect actual listeners and owned descendants, restore recorded appearances and owned reverse mappings, and snapshot immutable cycle evidence.",
          "Run the inherited live-import-graph compiler, pnpm typecheck, scoped Biome, and explicit base-to-candidate diff audit; bind evidence source hashes to the exact reviewed candidate."
        ]
      },
      "end_state": {
        "must_observe": [
          "The outer supervisor emits a heartbeat at least every 30 seconds; an iOS child is bounded by 2700 seconds and a full caller by 14400 seconds with the declared phase deadlines.",
          "Both real failure and success receipts record child exit/signal and teardown observations: 0 surviving owned listeners/descendants, original device appearances restored, and no unrelated reverse mappings removed.",
          "The compiler, typecheck and scoped Biome exit 0; the committed diff audit records 0 paths outside implementationCommitAllowed, 0 generated owner-runtime artifacts, and unchanged caller, model/prompts, product sources and locked-flow hashes.",
          "Each cycle has 3 create-once phase/mode children with exact run IDs/source hashes; audit is read-only and 0 existing phase artifacts are overwritten."
        ],
        "must_not_observe": [
          "An empty ownership ledger, a global pkill, a changed provider/model/prompt to hide the failure, or a heartbeat stopped by the child synchronous event loop.",
          "An unbounded retry, a relabeled old receipt, skipped checks, or unexplained changed source bytes after verification."
        ]
      }
    }
  ]
}
```

### TEST CRITERIA

- TC-1 → AC-1: GIVEN the unmodified current native proof and a real iOS session WHEN the isolated light-then-dark slice runs before any fix THEN preserve a concrete failing observation and its source-bound RED; after a bounded native-owner repair, the identical slice must pass both appearances with the exact marker visibly rendered and the composer usable. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1`
- TC-2 → AC-2: GIVEN both iOS appearances on the valid inherited model WHEN the actual composer sends a contextual exchange, an active long response is stopped, and the owned endpoint is lost then restored THEN each appearance has visible nonempty streamed output, a correlated abort before natural completion, and Retry completes a new request with exactly one retained failed user turn. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1`
- TC-3 → AC-3: GIVEN the independently inspected green iOS slice WHEN the unchanged ORI-AI-002 caller runs both engines across iOS, Android and Web under the outer supervisor THEN all 6 live targets pass its existing validation with fresh source/run binding, native light/dark proof, real provider rejection/recovery, active abort and Retry; the complete locked Quickstart flow remains for ORI-CONT-004. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase full --mode green --cycle cycle-1`
- TC-4 → AC-4: GIVEN real isolated and full runs WHEN normal completion or failure triggers teardown and the static/source audit THEN owned resources are released, device appearance and reverse mappings are restored, immutable receipts retain exact source identities, and the committed task diff contains only implementationCommitAllowed paths and the allowed proof repair; generated runtime writes are separately recorded and excluded from that diff. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase audit --cycle cycle-1`

### SHARED FIXTURES

```json
{
  "native_live_session": {
    "description": "The real committed apps/example /live-chat screen in SDK-57-compatible Expo Go on reserved iOS 81487B1E-A4D1-45AE-9BCE-D675802BACD1 and Android emulator-5554, driven by the existing native proof against its owned backend and official OpenAI Responses endpoint. The iOS slice executes the unchanged light-then-dark ordering before any full matrix.",
    "seed_method": "ui_flow",
    "records": [
      "Initial transcript has 0 turns and accessible \"Start a conversation\", \"Message\", and \"Send message\" controls. Each run submits a fresh nonsecret marker through that composer.",
      "A real marker/seed exchange precedes the contextual follow-up, active Stop, owned endpoint loss, and Retry. Native proof uses light and dark appearances with the real keyboard.",
      "Inherited model gpt-4.1-mini-2025-04-14 and existing prompts remain unchanged; provider credentials stay server-side. Invalid-model rejection remains only in the existing caller rejection phase.",
      "For the full caller, both engines execute all 3 platforms; the task does not substitute web for native or alter the original locked flow."
    ]
  }
}
```

### SCOPE — file-level write permissions

writeAllowed / implementationCommitAllowed:

- tests/sprint-05-orient-search/live-example.maestro.yaml
- tests/sprint-05-orient-search/support/live-example-proof.test.ts
- tests/sprint-05-orient-search/native-live-repair-proof_test.ts
- tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-4/**
- .tmp/FIX-ORI-RN-004-4/**

runtimeArtifactAllowed (generated only; never implementation-commit paths):

- tests/sprint-05-orient-search/evidence/ORI-RN-004/**
- tests/sprint-05-orient-search/evidence/ORI-RN-005/**
- tests/sprint-05-orient-search/evidence/ORI-AI-002/**
- .tmp/ORI-RN-005/abort-error-retry/**
- .tmp/ORI-RN-005/mismatched-manifest.json
- .tmp/ORI-RN-005/fail-closed-hash-mismatch/**
- .tmp/ORI-RN-005/fail-closed-absent-target/**
- .tmp/ORI-RN-005/fail-closed-cleanup/**
- apps/example/.expo/**

The normal matrix calls `runNativewindLiveExampleProof` with an OS-scratch outputDir; it does not run `nativewind-live-example.test.ts`. The five explicit `.tmp/ORI-RN-005` entries above bound that existing suite's generated outputs only if an already-required native regression selector actually runs; this allowance does not require or authorize extra selector work. The direct Uniwind driver and compiler write the ORI-RN-004 evidence root; the full caller's explicit output lives in the task-owned full-green/caller child. Expo may write only generated `.expo` state under apps/example; its source remains prohibited.

Capture hashes and exact backups of existing tracked runtime artifacts before execution. Snapshot each fresh raw output immutably under the task phase directory before the next run can overwrite a canonical runtime path. Preserve all pre-existing tracked runtime artifact bytes in the implementation commit, restoring only bytes this run changed from its verified backup after snapshotting. Do not discard unrelated WIP or stage the generated owner paths. Stop if another process changes a path concurrently.

Outside-repository scratch is limited to the exact per-run paths the existing helpers create under the OS-derived root: `ori-ai-002-<runId>-<engine>/` (owner journal/commands, reject/live/web-self artifacts and preserved web dist), `ori-rn-005-nativewind-<generated>/` consumers, the exported web directories and transient Maestro/OCR files they own, and the `ori-ai-002-port-ownership.json` ledger entries for this run's verified ports. Record exact resolved paths/ownership; preserve foreign ledger entries. Existing Expo Go caches and installed device apps are runtime prerequisites managed through the unchanged adapters, not commit files. Do not claim filesystem-wide write permission from a scratch glob.

writeProhibited:

- apps/**
- packages/**
- scripts/**
- .spec/**
- .github/**
- pnpm-lock.yaml
- playwright.config.ts
- tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
- tests/sprint-05-orient-search/support/quickstart-proof.test.ts
- tests/sprint-05-orient-search/support/native-session.ts
- tests/sprint-05-orient-search/support/nativewind-live-example.ts
- tests/sprint-05-orient-search/support/live-backend.ts
- tests/sprint-05-orient-search/live-example-proof.ts
- tests/sprint-05-orient-search/run-live-example-proof.mjs
- tests/sprint-05-orient-search/nativewind-live-source-manifest.json
- Any implementation path not listed in implementationCommitAllowed; generated runtime allowances above do not authorize source edits.

### BOUNDARIES — Stop and report

- No current reproducible native failure after at most 2 bounded attempts: report actual observations; do not manufacture RED or land the old attempted patch speculatively.
- Product state, AI transport/backend, caller rejection contract, shared device adapter, or NativeWind driver requires change: report exact owner/path/request/phase evidence for a new scoped decision.
- Required resource/credential/APK missing or foreign process owns a needed resource: preserve the checkout and stop before running proof.
- A timeout or full-matrix failure repeats without a new supported hypothesis: stop the retry loop and retain evidence. Do not raise budgets or repeat the two-hour caller blindly.
- Static gate failure outside owned files: report and route with exact output; do not stash shared WIP, bypass hooks or claim it unrelated without proof.

### DELIVERABLE

The smallest reviewed native proof repair; the task-local supervisor; immutable current RED, iOS GREEN, full-caller GREEN, compiler/static and cleanup evidence; and an exact-SHA handoff naming any remaining owner blocker. A blocked caller or unverified native behavior is not completion.

### AGENT INSTRUCTIONS — EXECUTION ORDER

1. Inspect assigned worktree and capture base/hash/dirty ownership. Read the current native driver, historical failure and unreviewed patch without changing CONT. Reserve exact resources.
2. Build only the thin proof supervisor; prove the actual current iOS failure before the behavior edit. Ask the orchestrator to verify RED evidence through the existing sprint process.
3. Make the minimal native proof change justified by the diagnosis. Run the identical iOS slice; inspect both appearances, active Stop and Retry visually and against real records.
4. After slice GREEN, run one full caller attempt under the external supervisor. Any separate caller/provider defect stops completion and goes to its owner.
5. Run compiler, typecheck and scoped Biome; audit source binding, cleanup, stubs/skips and allowed paths. Normal commit hooks apply. Independent review also executes required earlier sprint lanes under existing sprint policy.
6. Commit scoped files on the task branch and report exact SHA. react-native-reusables-reviewer independently checks the candidate and real native/full-caller evidence, rerunning the relevant paths against that candidate. The orchestrator alone merges and resumes CONT.

### READING LIST — maximum five

1. `.kb-run-sprint/sprint-05-orient-search/ORI-CONT-004/cycle-4.blocked.json` and the authorized native-live-add decision; report SHA-256 `088f238f8a3d23aefe17960e8dfdec9813ba210b6a276d50f59ba32423e706ee`.
2. `tests/sprint-05-orient-search/live-example.maestro.yaml` — current main SHA-256 `276cdcf5743518d9c755e01c211819bf880bc4af454c2f5a18bfd9ef2181966b`; compare via git show to `21b2bf9` and unreviewed `e44dbabb` without applying either.
3. `tests/sprint-05-orient-search/support/live-example-proof.test.ts` — runLiveMaestro, runNativeLeg, runNativeAppearance, runIosEndpointLossRetry, countPlatformsPassed, CLI; read native-session/live-backend imports for existing resource contracts, do not edit them.
4. ORI-CONT-004 worktree `tests/sprint-05-orient-search/evidence/ORI-RN-004/run-manifest.json`, SHA-256 `bfab03d15b681f534ce53199ca6a3c56ff989791b822918b96ec61a400328a19`, and its iOS dark screenshots; ORI-AI-002/uniwind manifest/result for attribution of the intentional reject-phase Stop diagnostic against the actual parent/caller verdict.
5. `tests/sprint-05-orient-search/run-live-example-proof.mjs` and `live-example-proof.ts` — caller phase/model attribution, source/record validation and real teardown; read-only. Also read the inherited ORI-RN-004 charter's behavioral requirements.

### RUNTIME COMMANDS AND VERIFICATION GATES

```sh
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode red --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase full --mode green --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase audit --cycle cycle-1
pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --case ORI-RN-004-AC-5-live-import-graph-compiler
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/live-example-proof.test.ts tests/sprint-05-orient-search/native-live-repair-proof_test.ts
```

The wrapper records and executes the real inherited iOS child command `pnpm exec tsx tests/sprint-05-orient-search/support/live-example-proof.test.ts --platforms ios --run-id FIX-ORI-RN-004-4-cycle-1-ios-red` (green gets its distinct ID). The full child and validate-only commands are listed above. Cycle/phase/mode parsing must reject unknown values and an existing phase/mode child rather than silently run another mode. The prescribed RED → iOS GREEN → full GREEN → read-only audit sequence intentionally shares cycle-1 while creating distinct children.

The audit phase executes no model substitute. It validates recorded current evidence, source hashes and ownership against actual Git/process/filesystem observations. Passing an audit cannot replace either live phase.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

This task supplies a native dependency exercised by `FLOW-DOCS-02-quickstart-chat-screen`; it does not become the primary flow owner, claim FLOW_REF ownership or add a locked flow. ORI-CONT-004 remains the owner and must rerun its unchanged complete Quickstart command after this task lands. The plan adds only this task to the named flow's exercises membership, the sprint table and owning roadmap. No gate step, action, expected observation, command, or in-flight task charter changes.

### DEPENDENCIES

Depends on: ORI-RN-004

Sequence: NEXT, using only this completed dependency. No dependency on in-flight ORI-CONT-004. Existing real AI backend, NativeWind proof, and devices are execution preconditions, not authority to edit their owners.

Provides: reviewed native proof repair plus current slice and full-caller evidence for CONT to consume after landing. Blocks CONT's resumption operationally until this prerequisite is reviewed and landed; do not alter CONT's contract.

References: CAP-DOCS-01; UC-DOCS-02. Provenance: ask `ask-wave26-add-native-live-repair`, wave 26, source blocked report cycle 4.

### OUT OF SCOPE

Product UI/design changes, styling/theme migrations, provider/prompt changes, general process framework, AI caller semantics, new locked flows, docs changes, CI/deployment, or closure of Sprint 05. No design subtask is required by this proof repair; a product design defect goes back to its owner.

### REVIEW AND COMPLETION

APPROVED requires exact-SHA/source-bound current RED and GREEN, watched native marker/stream/keyboard behavior, real abort/Retry correlation, all six caller targets, actual teardown, static gates and scoped diff. NEEDS_FIXES names the AC and artifact. The reviewer must not approve a hierarchy-only marker, a patch presumed to fix both failures, a natural completion called abort, or a skipped rejection phase. Workers never merge or rewrite sprint status.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "FIX-ORI-RN-004-4",
  "task_type": "FIX",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "native_live_session": {
      "description": "The real committed apps/example /live-chat screen in SDK-57-compatible Expo Go on reserved iOS 81487B1E-A4D1-45AE-9BCE-D675802BACD1 and Android emulator-5554, driven by the existing native proof against its owned backend and official OpenAI Responses endpoint. The iOS slice executes the unchanged light-then-dark ordering before any full matrix.",
      "seed_method": "ui_flow",
      "records": [
        "Initial transcript has 0 turns and accessible \"Start a conversation\", \"Message\", and \"Send message\" controls. Each run submits a fresh nonsecret marker through that composer.",
        "A real marker/seed exchange precedes the contextual follow-up, active Stop, owned endpoint loss, and Retry. Native proof uses light and dark appearances with the real keyboard.",
        "Inherited model gpt-4.1-mini-2025-04-14 and existing prompts remain unchanged; provider credentials stay server-side. Invalid-model rejection remains only in the existing caller rejection phase.",
        "For the full caller, both engines execute all 3 platforms; the task does not substitute web for native or alter the original locked flow."
      ]
    }
  },
  "guardrails": {
    "write_allowed": [
      "tests/sprint-05-orient-search/live-example.maestro.yaml",
      "tests/sprint-05-orient-search/support/live-example-proof.test.ts",
      "tests/sprint-05-orient-search/native-live-repair-proof_test.ts",
      "tests/sprint-05-orient-search/evidence/FIX-ORI-RN-004-4/**",
      ".tmp/FIX-ORI-RN-004-4/**"
    ],
    "write_prohibited": [
      "apps/**",
      "packages/**",
      "scripts/**",
      ".spec/**",
      ".github/**",
      "pnpm-lock.yaml",
      "playwright.config.ts",
      "tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts",
      "tests/sprint-05-orient-search/support/quickstart-proof.test.ts",
      "tests/sprint-05-orient-search/support/native-session.ts",
      "tests/sprint-05-orient-search/support/nativewind-live-example.ts",
      "tests/sprint-05-orient-search/support/live-backend.ts",
      "tests/sprint-05-orient-search/live-example-proof.ts",
      "tests/sprint-05-orient-search/run-live-example-proof.mjs",
      "tests/sprint-05-orient-search/nativewind-live-source-manifest.json"
    ],
    "runtime_artifact_allowed_not_committed": [
      "tests/sprint-05-orient-search/evidence/ORI-RN-004/**",
      "tests/sprint-05-orient-search/evidence/ORI-RN-005/**",
      "tests/sprint-05-orient-search/evidence/ORI-AI-002/**",
      ".tmp/ORI-RN-005/abort-error-retry/**",
      ".tmp/ORI-RN-005/mismatched-manifest.json",
      ".tmp/ORI-RN-005/fail-closed-hash-mismatch/**",
      ".tmp/ORI-RN-005/fail-closed-absent-target/**",
      ".tmp/ORI-RN-005/fail-closed-cleanup/**",
      "apps/example/.expo/**"
    ]
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "name": "Diagnose the current iOS failure before repairing its native proof",
      "primary": true,
      "description": "GIVEN the unmodified current native proof and a real iOS session WHEN the isolated light-then-dark slice runs before any fix THEN preserve a concrete failing observation and its source-bound RED; after a bounded native-owner repair, the identical slice must pass both appearances with the exact marker visibly rendered and the composer usable.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/native-live-repair-proof_test.ts",
      "test_function": "runIosRepairProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1",
      "test_tier": "e2e",
      "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-004-4-1",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-1",
        "primary": true,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
        "negative_control": {
          "would_fail_if": [
            "The repair is accepted from hierarchy_has_marker alone while the marker is off screen, an assistant echo is substituted for the accepted user turn, or assertVisible is removed.",
            "A historical receipt or the unreviewed e44dbabb patch is called current RED/GREEN without executing the candidate.",
            "A stub app, scripted success receipt, disabled assertion, or added test-only label replaces the real native interaction."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "native_live_session",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Run pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode red --cycle cycle-1 against the assigned task base before changing the YAML or native driver behavior.",
                "Inspect the failing screenshot, accessibility hierarchy, keyboard state, Maestro step, provider phase/model, and source hashes; distinguish marker visibility from active Stop failure.",
                "Apply only the demonstrated native proof repair. Rerun the same iOS slice with mode green and the same device/phase order."
              ]
            },
            "end_state": {
              "must_observe": [
                "red.json records at least 1 actual native failure on the unmodified current task base, with exact command, candidate/source hashes, run ID, appearance, failing step, nonzero child exit, screenshot and raw log paths.",
                "green.json records 2 iOS appearance outcomes, light and dark, both passed; each has a visibly rendered fresh user marker, actual assertVisible success, and the composer above the keyboard.",
                "For the 1-platform slice the inherited completed flag remains false; acceptance requires exactly 2 passed iOS appearance legs and current source/run binding, not rewriting completed."
              ],
              "must_not_observe": [
                "0 captured runtime failures called RED, a manufactured failure by deleting a product behavior, a hierarchy-only visible-marker claim, or an unreviewed patch reported as fixed.",
                "A full two-engine matrix started before the slice diagnosis and green evidence."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "name": "Preserve active Stop and retained-turn Retry on the real iOS slice",
      "primary": false,
      "description": "GIVEN both iOS appearances on the valid inherited model WHEN the actual composer sends a contextual exchange, an active long response is stopped, and the owned endpoint is lost then restored THEN each appearance has visible nonempty streamed output, a correlated abort before natural completion, and Retry completes a new request with exactly one retained failed user turn.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/native-live-repair-proof_test.ts",
      "test_function": "runIosRepairProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1",
      "test_tier": "e2e",
      "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-004-4-2",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-2",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
        "negative_control": {
          "would_fail_if": [
            "Stop is tapped after natural completion, a finished response is labeled aborted, or response latency is artificially delayed.",
            "The Retry control is omitted, a stub response replaces the provider, or hierarchy text alone replaces visible streamed output.",
            "Records from a different run, platform, appearance, or request are used to satisfy abort/retry correlation."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "native_live_session",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Inspect the existing real iOS slice through marker, seed exchange, contextual follow-up, active Stop, and endpoint-loss/Retry; retain the existing commands and prompts.",
                "Correlate visible growth and active Stop to the same request and appearance time window using screenshots/recording and real backend records.",
                "Stop only the owned endpoint, send the retry probe, observe the sanitized error and accessible Retry, restart the owned endpoint, and activate Retry."
              ]
            },
            "end_state": {
              "must_observe": [
                "For both of the 2 iOS appearances, actual screenshots/recordings show nonempty incremental assistant output and the \"Stop generating\" control while a provider request is active.",
                "Each Stop has a same-run, same-request outcome \"aborted\" before natural completion; a later request has a distinct request ID and completed answer correlated to its server text hash.",
                "Both appearances show a sanitized endpoint-loss error and accessible \"Retry\"; retry yields a new completed provider request and exactly 1 retained user turn for the failed submission."
              ],
              "must_not_observe": [
                "0 correlated aborts, an empty response, a forced stream delay, an altered valid model, or a response already completed when Stop is activated.",
                "Missing Retry requests, duplicate retained user turns, leaked credentials, or a rejected-provider phase passed off as a valid active-stream check."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "name": "Verify the unchanged caller with all six live engine/platform targets",
      "primary": false,
      "description": "GIVEN the independently inspected green iOS slice WHEN the unchanged ORI-AI-002 caller runs both engines across iOS, Android and Web under the outer supervisor THEN all 6 live targets pass its existing validation with fresh source/run binding, native light/dark proof, real provider rejection/recovery, active abort and Retry; the complete locked Quickstart flow remains for ORI-CONT-004.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/native-live-repair-proof_test.ts",
      "test_function": "runFullLiveProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase full --mode green --cycle cycle-1",
      "test_tier": "e2e",
      "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-004-4-3",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-3",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real Expo Go, Maestro accessibility interaction, reserved iOS/Android devices, owned example backend, official OpenAI Responses, and real Chromium for the full matrix",
        "negative_control": {
          "would_fail_if": [
            "A native target is omitted, an old receipt is copied as fresh, a caller phase is skipped, or a rejected provider is silently replaced by a canned response.",
            "The expected reject-phase \"Stop generating\" diagnostic is labeled a caller defect without inspecting its phase/model, parent validation, and live-leg outcome.",
            "A source mutation, another run ID, or mismatched device evidence is accepted as the exact candidate proof."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "native_live_session",
            "action": {
              "actor": "cli_user",
              "steps": [
                "After slice green, run the existing run-live-example-proof.mjs for uniwind,nativewind and ios,android,web with a fresh task-owned output directory and run ID.",
                "Inspect every reject/live/web-self phase and target result; require all existing caller validation and use its validate-only entry point for the same run ID.",
                "If a caller/provider-phase contract fails outside native ownership, stop and report exact phase/model/request evidence to its owner; do not patch it here."
              ]
            },
            "end_state": {
              "must_observe": [
                "The real full caller exits 0; its fresh manifest has exit_code 0 and validation.ok true with all 6 targets: uniwind-ios, uniwind-android, uniwind-web, nativewind-ios, nativewind-android, nativewind-web.",
                "All 6 targets have current request/response IDs, model, usage, visible text growth, active abort, rejection/recovery, Retry and cleanup evidence; all 8 native engine/platform/appearance combinations have current light/dark captures bound to this invocation and source hashes.",
                "The unchanged caller validate-only command exits 0 for the exact run ID; the handoff explicitly states FLOW-DOCS-02 remains unrun by this task."
              ],
              "must_not_observe": [
                "0 native legs, partial targets labeled complete, a newly failing caller phase hidden by a marker-only pass, or an altered locked flow.",
                "A historical six-seed-leg success substituted for any live target, or a multi-hour blind retry with the same unresolved failure."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "name": "Bound the owned processes and preserve exact evidence and scope",
      "primary": false,
      "description": "GIVEN real isolated and full runs WHEN normal completion or failure triggers teardown and the static/source audit THEN owned resources are released, device appearance and reverse mappings are restored, immutable receipts retain exact source identities, and the committed task diff contains only implementationCommitAllowed paths and the allowed proof repair; generated runtime writes are separately recorded and excluded from that diff.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/native-live-repair-proof_test.ts",
      "test_function": "auditNativeRepairProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase audit --cycle cycle-1",
      "test_tier": "integration",
      "verification_service": "Real Git, filesystem evidence, process/port inspection, TypeScript compiler, and Biome",
      "surface_policy": null,
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-004-4-4",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-4",
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "Real Git, filesystem evidence, process/port inspection, TypeScript compiler, and Biome",
        "negative_control": {
          "would_fail_if": [
            "A timeout becomes exit 0, a process remains listening after teardown, another owner is killed, or a fabricated cleanup flag replaces observed process checks.",
            "A stale manifest is accepted, historical evidence is overwritten, or a product/caller/locked-flow file changes outside the allowed paths.",
            "The compiler or source audit is skipped or replaced by a static success receipt."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "native_live_session",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Use an external supervisor process around the real proof child, record its owned process group and phase timestamps, and retain raw exits/signals before cleanup.",
                "On RED failure and GREEN completion, inspect actual listeners and owned descendants, restore recorded appearances and owned reverse mappings, and snapshot immutable cycle evidence.",
                "Run the inherited live-import-graph compiler, pnpm typecheck, scoped Biome, and explicit base-to-candidate diff audit; bind evidence source hashes to the exact reviewed candidate."
              ]
            },
            "end_state": {
              "must_observe": [
                "The outer supervisor emits a heartbeat at least every 30 seconds; an iOS child is bounded by 2700 seconds and a full caller by 14400 seconds with the declared phase deadlines.",
                "Both real failure and success receipts record child exit/signal and teardown observations: 0 surviving owned listeners/descendants, original device appearances restored, and no unrelated reverse mappings removed.",
                "The compiler, typecheck and scoped Biome exit 0; the committed diff audit records 0 paths outside implementationCommitAllowed, 0 generated owner-runtime artifacts, and unchanged caller, model/prompts, product sources and locked-flow hashes.",
                "Each cycle has 3 create-once phase/mode children with exact run IDs/source hashes; audit is read-only and 0 existing phase artifacts are overwritten."
              ],
              "must_not_observe": [
                "An empty ownership ledger, a global pkill, a changed provider/model/prompt to hide the failure, or a heartbeat stopped by the child synchronous event loop.",
                "An unbounded retry, a relabeled old receipt, skipped checks, or unexplained changed source bytes after verification."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "GIVEN the unmodified current native proof and a real iOS session WHEN the isolated light-then-dark slice runs before any fix THEN preserve a concrete failing observation and its source-bound RED; after a bounded native-owner repair, the identical slice must pass both appearances with the exact marker visibly rendered and the composer usable.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "GIVEN both iOS appearances on the valid inherited model WHEN the actual composer sends a contextual exchange, an active long response is stopped, and the owned endpoint is lost then restored THEN each appearance has visible nonempty streamed output, a correlated abort before natural completion, and Retry completes a new request with exactly one retained failed user turn.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase ios --mode green --cycle cycle-1",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "GIVEN the independently inspected green iOS slice WHEN the unchanged ORI-AI-002 caller runs both engines across iOS, Android and Web under the outer supervisor THEN all 6 live targets pass its existing validation with fresh source/run binding, native light/dark proof, real provider rejection/recovery, active abort and Retry; the complete locked Quickstart flow remains for ORI-CONT-004.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase full --mode green --cycle cycle-1",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_criterion",
      "description": "GIVEN real isolated and full runs WHEN normal completion or failure triggers teardown and the static/source audit THEN owned resources are released, device appearance and reverse mappings are restored, immutable receipts retain exact source identities, and the committed task diff contains only implementationCommitAllowed paths and the allowed proof repair; generated runtime writes are separately recorded and excluded from that diff.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/native-live-repair-proof_test.ts --phase audit --cycle cycle-1",
      "maps_to_ac": "AC-4"
    }
  ]
}
-->
</details>
