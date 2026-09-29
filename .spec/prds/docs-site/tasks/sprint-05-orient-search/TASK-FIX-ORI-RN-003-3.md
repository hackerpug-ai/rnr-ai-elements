# FIX-ORI-RN-003-3: Verify driveWeb returns and record the unreproduced hang

## What this does

Verifies the unchanged `driveWeb` against both real seed web exports and the real disconnected-callback control. Records an evidence-backed `not_reproduced_no_driver_change` disposition. The task does not claim a timeout defect was fixed.

## Why

The original charter required a call to remain pending for 180000 ms, but also required the implementer to stop if every baseline call settled. Two actual standalone cycles settled. Cycle 1 recorded baseline 1007 ms and disconnected 30838 ms. Cycle 2 recorded baseline 1005 ms and disconnected 30745 ms. Baselines had all five booleans true; disconnected calls had seedVisible, olderSeedReached, and inputCleared true, with markerVisible and markerSubmitted false. Both used unchanged driver SHA-256 `69e45cda55480d06b390637b48bd46fd97bad0ebee0af588c8175455439a3e33`.

The caller's ORI-RN-003 manifest records `completed: true`, `passed_legs: 6`, both web engines with all five booleans true, and the callback negative control passing at candidate `21b2bf92673fa465aba3ba3dbc0ccd622ea24417`. This contradicts the mandatory seed-path hang premise. It does not prove the whole locked flow passed.

The later ORI-AI-002 Uniwind manifest has `exit_code: 1`, and the iOS result fails the `Stop generating` assertion. The precise cause remains unproven. That live/native failure and fresh locked-flow verification remain with ORI-CONT-004 and its separately scoped dependencies; they are not repaired or waived here.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof
pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/quickstart-web.ts tests/sprint-05-orient-search/drive-web-return-proof.test.ts
```

Every command is preserved and must execute. The historical spelling `--mode red` now means a real diagnostic baseline/disconnected run: it records whether a hang reproduces, without requiring or fabricating one. The default command verifies both engines and baseline/disconnected/restored behavior. The legacy `driveWebActionTimeoutStaysFinite` selector checks the diagnostic harness bound, unchanged driver, and retained observations; it does not require an unsupported driver timeout edit. These changes are explicit in the authorized amendment below.

## Scope

Use the existing task-owned proof harness and evidence paths. Preserve the current writeAllowed list. For this diagnostic disposition, `quickstart-web.ts` remains byte-for-byte unchanged. A newly reproduced defect is a blocker requiring a separate decision before any driver change. No product files, locked-flow files, or other task charters are owned here.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending
> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 3 · Type: FIX
> Dependency phase: after ORI-RN-003
> Proposed By: react-native-reusables-planner
> TDD_MODE: verification_only · RED_GREEN_REQUIRED: no — governed diagnostic revision; real runtime and negative-control verification remain mandatory
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-28 · Revised date: 2026-09-29
> Source SHA: 53034655a3062e9fa0e9f942e271d12418fb7a62

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/3 revised ACs. Every TDD_STATE is none. Historical receipts support the diagnosis only; fresh verification and independent review are still required.

### OUTCOME

Both seed web legs and the real uniwind baseline/disconnected/restored calls fulfill under a bounded harness with the original observation contract. The task closes as a verified diagnostic with no driver change, not as a timeout repair or locked-flow completion.

### CRITICAL CONSTRAINTS — Never

- Never edit product source under `apps/`, `packages/`, or `scripts/`; install/export failures are blockers.
- Never edit ORI-CONT-004, `human-flows.json`, `gate-plan.json`, `quickstart-chat-screen.spec.ts`, or the locked command. Do not run the locked flow as this task's gate.
- Never manufacture RED, prolong a successful call to 180000 ms, close the browser to induce a result, invent booleans, or call the absence of a timeout edit a failure.
- Never weaken the five observed results: exact newest seed visibility, exact older seed visibility, textarea value `=== ''`, exact marker visibility, and `markerSubmitted = markerVisible`.
- Never use a stub Playwright page, `page.setContent`, mocked Browser, authored WebLegResult, runtime-gated skip, or static historical receipt instead of the real current calls.
- Never change `quickstart-web.ts` for this disposition. A newly reproduced pending call or wrong boolean is new evidence to report, not authority to patch the driver.
- Never bypass hooks, rewrite historical evidence, or add `fallow-ignore`. Keep new/edited functions at cyclomatic complexity 4 or below.

### DONE WHEN

- [ ] AC-1: both current seed web engines return all five real booleans true in under 180000 ms.
- [ ] AC-2: current baseline/disconnected/restored control passes, including exact source restoration.
- [ ] AC-3: preserved commands run, driver hash and historical evidence remain unchanged, scope audit passes, and the diagnostic is truthful.
- [ ] Independent react-native-reusables-reviewer approves the exact candidate and evidence; no claims of a timeout repair or complete FLOW-DOCS-02.

### SPECIFICATION

Reuse the task-owned harness present in commit `ae894cf28b51fab518f6165ad3e37e113c527794`: `git ls-tree` resolves `tests/sprint-05-orient-search/drive-web-return-proof.test.ts` to blob `79cc76167b1d5cae83abee2e3d6d209f60384f36`. It was committed in ancestor `59f5e8bd5ac6ea8bf7106b99d7a1822c63f68c19`; cycle-2 commit ae894cf only adds receipt/install-log changes and inherits that harness. Do not discard its prior blocked cycles. Adapt its diagnostic and static checks within this task's existing scope. No production-driver change is expected or authorized by this revision.

The harness calls real `prepareConsumer`, `exportWeb`, `serveExport`, `launchChromium`, and `driveWeb`. Two installs and four exports form the default matrix: nativewind seed; uniwind baseline, disconnected, restored. The uniwind baseline is also the uniwind seed leg, so four real calls satisfy the two seed-leg and three-control-role assertions. Require exportExit 0 and nonempty distinct markers. Source-presence inspection does not replace UI observations.

Every call must fulfill with a real WebLegResult within 180000 ms before harness browser/server cleanup. Record rejection distinctly from fulfillment; do not let a rejection handler mark a result as passed. The harness watchdog bounds waiting and fails closed, but does not change Playwright's driver defaults. Record started/settled/cleanup timestamps, promise outcome, elapsed_ms, browser_connected_at_observe, and harness_closed_browser_before_settle. A pending call fails verification even if cleanup later causes it to settle.

`driveWeb` closes its own context in `finally` before it returns. Therefore `page_open_at_observe: false` after fulfillment is expected and is not a hang. The required ordering is fulfillment before external harness/browser cleanup; do not remove context cleanup or demand an open page after the function has returned. Preserve a legacy settled_before_close field only with this documented meaning; add settled_before_harness_cleanup for clarity.

Baseline and restored calls require all five booleans true. The disconnected callback requires seedVisible and olderSeedReached true, markerVisible and markerSubmitted false. `inputCleared` is recorded as observed; PromptInput may clear after a resolved no-op callback, so false is not required. Only the disposable screen's single `onSubmit={handleSubmit}` is replaced with `onSubmit={() => {}}`. Restore in `finally` even if export/drive fails; compare exact original/mutated/restored SHA-256 values.

The preserved `--mode red` command executes the real uniwind baseline and disconnected diagnosis. If both fulfill with the required observations, it exits 0 as diagnostic verification, records `hang_reproduced: false`, `red_evidence_claimed: false`, and `driver_changed: false` in `run.json`, and proceeds to the mandatory default matrix. A newly pending, rejected, or incorrect call records its actual failure and exits nonzero; no no-change completion is allowed. Do not overwrite the existing `.tmp/FIX-ORI-RN-003-3/red.json` or `cycle-2/red.json`; preserve their hashes and read them as historical input. The old filename `red.json` is not proof of a reproduced bug.

The Vitest selector is retained for compatibility. Replace the obsolete requirement for one setDefaultTimeout call with direct checks of the real unchanged driver SHA-256, its actual result assignments, and the finite 180000 ms harness watchdog. Vitest must run at least one guard test and must not launch a browser/export. Current runtime proof is authoritative for behavior; the source guard alone is insufficient.

Use an OS-derived short scratch directory outside the repo and confirm it will survive the run; do not hardcode `/tmp`. Delete NODE_ENV before pnpm/npx/expo children. Keep the full default matrix under the original 150-minute budget. Stop only the browser/server/processes this invocation owns and delete only its disposable consumers. Release resources in `finally` after failure as well as success.

### BOUNDARY CONTRACTS

1. `quickstart-web.ts`: existing allowlist entry remains, but this disposition requires its exact bytes unchanged. No arbitrary finite-timeout edit or new scroll helper.
2. `drive-web-return-proof.test.ts`: retain CLI entry `runDriveWebReturnProof`, default full verification, `--mode red` real diagnosis, and Vitest selector `driveWebActionTimeoutStaysFinite` with the explicit revised assertions above.
3. `.tmp/FIX-ORI-RN-003-3/red.json`: preserve historical committed receipt byte-for-byte; reference its hash in run.json. Read the cycle-2 receipt without modifying it.
4. `.tmp/FIX-ORI-RN-003-3/green.json`: fresh full matrix, current source hashes and run ID, four unique current calls and their five result booleans. Its legacy name means verification passed, not a bug fix.
5. `.tmp/FIX-ORI-RN-003-3/run.json`: real command argv/exits, run IDs, source hashes, budgets, historical receipt hashes, diagnosis results, no-change disposition, static gate results, and scoped diff audit. Keep red_evidence_claimed false and downstream_live_gate_status open.
6. ORI-RN-001 install logs may refresh only through prepareConsumer, as already allowed. Do not hand-edit them.

### ACCEPTANCE CRITERIA — DIAGNOSE → VERIFY → INDEPENDENT REVIEW

Only AC-1 is PRIMARY. This authorized diagnostic task has no required implementation RED because no defect or driver change has been established. It retains a real causal negative control and every runtime verification command.

#### AC-1: Verify unchanged driveWeb returns with both seed engines [PRIMARY]

GIVEN real nativewind and uniwind quickstart exports WHEN unchanged driveWeb runs in real Chromium THEN both seed calls fulfill before harness teardown, in under 180000 ms, with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted true; the diagnostic receipt says hang_reproduced false and driver_changed false.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Expo exports, localhost serveExport HTTP servers, and Chromium launched by launchChromium
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/drive-web-return-proof.test.ts
- TEST_FUNCTION: runDriveWebReturnProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-003-3-1",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-1",
  "primary": true,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "Real Expo exports, localhost serveExport HTTP servers, and Chromium launched by launchChromium",
  "negative_control": {
    "would_fail_if": [
      "A stubbed Playwright page, mocked Browser, page.setContent, or authored WebLegResult replaces a live export.",
      "Any of the five booleans is hardcoded true, omitted, or derived from source text rather than the returned result.",
      "A pending or rejected call is recorded as a fulfilled result, or forced browser closure produces a false settlement."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "served_quickstart_export",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Run pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof.",
          "Prepare nativewind and uniwind consumers, export each, serve each over HTTP, and await the real driveWeb call with distinct nonempty markers.",
          "Record the result and settlement time before the harness closes its browser or server."
        ]
      },
      "end_state": {
        "must_observe": [
          "green.json records 2 seed legs, nativewind and uniwind, each fulfilled with elapsed_ms < 180000, settled_before_harness_cleanup true, and harness_closed_browser_before_settle false.",
          "Each seed leg has all 5 booleans true, including seedVisible for \"Seed turn 24: Ready for your message.\" and olderSeedReached for \"Seed turn 01: Plan a weekend walk.\"",
          "The 2 markers are distinct and nonempty; browser_connected_at_observe is true; driver_changed is false and hang_reproduced is false."
        ],
        "must_not_observe": [
          "0 seed legs, an empty WebLegResult, a reused historical manifest, or a rejected promise counted as fulfillment.",
          "A claim that a timeout bug was fixed or that FLOW-DOCS-02 passed."
        ]
      }
    }
  ]
}
```

#### AC-2: Verify the disconnected callback falsifies submission and restored bytes pass

GIVEN one real uniwind disposable consumer WHEN baseline, disconnected callback, and restored exports are driven THEN all 3 calls fulfill before harness teardown in under 180000 ms; baseline/restored have all 5 booleans true; disconnected has seedVisible and olderSeedReached true with markerVisible and markerSubmitted false; the restored hash equals the original.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: The same real uniwind consumer exported and served 3 times through real Chromium
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/drive-web-return-proof.test.ts
- TEST_FUNCTION: runDriveWebReturnProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-003-3-2",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-2",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "The same real uniwind consumer exported and served 3 times through real Chromium",
  "negative_control": {
    "would_fail_if": [
      "The disconnected callback is skipped or a hardcoded markerVisible true makes the no-op callback pass.",
      "The mutation changes the shared checkout, changes more than 1 callback, or restores different bytes.",
      "A static saved receipt replaces any of the 3 current served calls."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "served_quickstart_export",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Drive the uniwind baseline, replace exactly one onSubmit={handleSubmit} with onSubmit={() => {}}, export again, and drive a new marker.",
          "Restore the exact original bytes in a finally block, record original/mutated/restored hashes, export the restored screen, and drive a third marker."
        ]
      },
      "end_state": {
        "must_observe": [
          "green.json records 3 current uniwind calls with elapsed_ms < 180000 and settled_before_harness_cleanup true.",
          "Baseline and restored have all 5 booleans true; disconnected has seedVisible true and olderSeedReached true while markerVisible and markerSubmitted are false.",
          "Exactly 1 callback changed, mutated_sha256 differs from original_sha256, and restored_sha256 equals original_sha256."
        ],
        "must_not_observe": [
          "0 returned calls, empty markers, a disconnected callback accepted as successful submission, or a missing restoration.",
          "An assertion that disconnected inputCleared must be false; PromptInput may clear after a resolved callback."
        ]
      }
    }
  ]
}
```

#### AC-3: Record a truthful diagnostic disposition with unchanged driver and bounded proof

GIVEN the current real proof and prior blocked reports WHEN the preserved diagnostic CLI, source guard, typecheck, scoped Biome, and diff audit run THEN the driver hash is unchanged, the harness watchdog is 180000 ms, the commands execute without skips, and run.json states not_reproduced_no_driver_change with no timeout-fix claim and the downstream live failure still open.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: Real Vitest, TypeScript, Biome, Git, and filesystem evidence bound to actual served Chromium runs
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/drive-web-return-proof.test.ts
- TEST_FUNCTION: driveWebActionTimeoutStaysFinite
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite`
- MAPS_TO_AC: null

SCENARIO:

```json
{
  "id": "SC-FIX-ORI-RN-003-3-3",
  "use_case_ref": "UC-DOCS-02",
  "ac_ref": "AC-3",
  "primary": false,
  "tier": "visible",
  "test_tier": "integration",
  "verification_service": "Real Vitest, TypeScript, Biome, Git, and filesystem evidence bound to actual served Chromium runs",
  "negative_control": {
    "would_fail_if": [
      "The guard is skipped, reads no real driver source, or no guard tests run.",
      "Driver bytes are changed without a reproduced defect, the harness uses timeout 0, or a historical receipt is relabeled as current GREEN.",
      "A fabricated RED, no-op runtime path, erased blocked cycle, or static success flag replaces the actual observations."
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "served_quickstart_export",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Run pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red to diagnose the unchanged uniwind baseline and disconnected callback.",
          "Run pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite, pnpm typecheck, and scoped Biome.",
          "Compare the driver hash and task candidate diff to the recorded base; record exact commands, exits, source hashes, evidence paths, and the downstream live failure."
        ]
      },
      "end_state": {
        "must_observe": [
          "The diagnostic mode executes 2 real calls and records hang_reproduced false when both fulfill within 180000 ms; red_evidence_claimed is false.",
          "The guard executes at least 1 test and verifies the real driver sha256 \"69e45cda55480d06b390637b48bd46fd97bad0ebee0af588c8175455439a3e33\", retained 5 result assignments, finite 180000 ms harness bound, and no browser launch under Vitest.",
          "run.json records disposition \"not_reproduced_no_driver_change\", driver_changed false, scope_paths_outside_allowlist 0, and downstream_live_gate_status \"open\".",
          "Vitest, typecheck, and scoped Biome exit 0; historical red.json and cycle-2/red.json hashes remain unchanged."
        ],
        "must_not_observe": [
          "0 executed guard tests, a missing diff baseline, a timeout-fixed claim, skipped runtime verification, or FLOW-DOCS-02 completion from this task.",
          "A finite watchdog converted into forced-close success or a newly reproduced hang accepted as a no-change pass."
        ]
      }
    }
  ]
}
```

### TEST CRITERIA

- TC-1 → AC-1: GIVEN real nativewind and uniwind quickstart exports WHEN unchanged driveWeb runs in real Chromium THEN both seed calls fulfill before harness teardown, in under 180000 ms, with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted true; the diagnostic receipt says hang_reproduced false and driver_changed false. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof`
- TC-2 → AC-2: GIVEN one real uniwind disposable consumer WHEN baseline, disconnected callback, and restored exports are driven THEN all 3 calls fulfill before harness teardown in under 180000 ms; baseline/restored have all 5 booleans true; disconnected has seedVisible and olderSeedReached true with markerVisible and markerSubmitted false; the restored hash equals the original. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof`
- TC-3 → AC-3: GIVEN the current real proof and prior blocked reports WHEN the preserved diagnostic CLI, source guard, typecheck, scoped Biome, and diff audit run THEN the driver hash is unchanged, the harness watchdog is 180000 ms, the commands execute without skips, and run.json states not_reproduced_no_driver_change with no timeout-fix claim and the downstream live failure still open. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite`

### SHARED FIXTURES

```json
{
  "served_quickstart_export": {
    "description": "A real Expo 57 consumer prepared by prepareConsumer from the committed template and public recipe, exported with exportWeb, and served by serveExport on 127.0.0.1. Chromium comes from launchChromium; driveWeb is unchanged.",
    "seed_method": "cli",
    "records": [
      "Two engines: nativewind and uniwind; each disposable consumer is outside the monorepo under an OS-derived scratch root.",
      "The served screen contains 24 seed turns, including exact text \"Seed turn 24: Ready for your message.\" and \"Seed turn 01: Plan a weekend walk.\"",
      "The shared driver sha256 is 69e45cda55480d06b390637b48bd46fd97bad0ebee0af588c8175455439a3e33. A changed hash requires a new diagnosis, not an automatic approval.",
      "The negative control replaces exactly one onSubmit={handleSubmit} callback with onSubmit={() => {}} in the disposable uniwind screen, then restores the original bytes.",
      "Both consumer templates retain react-native-web 0.21.2. Install/export errors are failures, never returned driveWeb evidence."
    ]
  }
}
```

### SCOPE — file-level write permissions

writeAllowed:

- tests/sprint-05-orient-search/support/quickstart-web.ts (MODIFY)
- tests/sprint-05-orient-search/drive-web-return-proof.test.ts (NEW)
- tests/sprint-05-orient-search/evidence/ORI-RN-001/nativewind-install.txt (side effect of prepareConsumer)
- tests/sprint-05-orient-search/evidence/ORI-RN-001/uniwind-install.txt (side effect of prepareConsumer)
- .tmp/FIX-ORI-RN-003-3/red.json (NEW)
- .tmp/FIX-ORI-RN-003-3/green.json (NEW)
- .tmp/FIX-ORI-RN-003-3/run.json (NEW)

writeProhibited:

- apps/**
- packages/**
- scripts/**
- .spec/**
- .github/**
- human-flows.json
- gate-plan.json
- tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts
- tests/sprint-05-orient-search/support/quickstart-proof.test.ts
- tests/sprint-05-orient-search/support/quickstart-consumer.ts
- tests/sprint-05-orient-search/quickstart-content.spec.ts
- playwright.config.ts
- Any file not listed in writeAllowed.

### BOUNDARIES — Stop and report

- A call pending at 180000 ms, a rejection, a wrong seed/result boolean, or failure of restoration blocks this diagnostic disposition. Preserve phase, timestamps, booleans/error, and hashes; seek a new scoped decision before changing the driver.
- A successful pre-change run is valid diagnostic evidence, not a requirement to invent RED. It still does not replace the default matrix or independent review.
- An install/export error or unreachable public registry/npm blocks verification; do not substitute a local registry or monorepo dependency.
- If typecheck fails because gitignored docs manifests are absent, the existing permission remains: run `pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs prebuild` in the assigned worktree and do not commit generated files outside writeAllowed. Other failing gates block completion; preserve unrelated WIP rather than stashing it.
- Do not raise the 180000 ms call bound or the 150-minute full-matrix budget to conceal a hang.
- Do not edit/run another owner's native/live suite. Send evidence of the downstream failure through the normal handoff; this task has no authority to close it.

### DELIVERABLE

- The reviewed task-owned proof harness with real diagnostic and full-matrix verification.
- Historical `red.json` preserved, fresh `green.json`, and `run.json` recording `disposition: not_reproduced_no_driver_change`, `driver_changed: false`, and `red_evidence_claimed: false`.
- Exact driver SHA-256 unchanged; no timeout repair claim. The blocked cycles remain part of provenance.

### AGENT INSTRUCTIONS — DIAGNOSTIC FLOW

1. Inspect the reused task worktree and prior commits. Preserve unrelated WIP, blocked receipts, and the driver bytes. Record the base SHA and historical hashes before changing only the owned harness.
2. Adapt the diagnostic command and legacy static selector as explicitly specified. Run the diagnostic CLI with real exports/Chromium. Do not author result flags independently of observations.
3. Run the default full matrix. Both seed engines, disconnected callback, and restoration are required. A new failure blocks the no-change disposition.
4. Run the preserved Vitest selector, typecheck, and scoped Biome. Record command exit codes, changed paths against the explicit task base, and untracked paths. Exclude no unexpected changes silently; preserve them and report ownership.
5. Commit only the permitted harness/evidence changes with normal hooks. The evidence must identify the exact executed source bytes and execution HEAD; do not rewrite a receipt to pretend a later evidence-only commit was the executed HEAD. Bind it to the final candidate by source hashes and review, rerunning when executable source changes.
6. Hand the exact candidate SHA and receipts to react-native-reusables-reviewer. Only the orchestrator may merge. The reviewer independently verifies real calls on the exact candidate and records its own evidence; it does not approve from the source guard alone.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/support/quickstart-web.ts` — actual five-result contract and context cleanup in finally; unchanged SHA-256 above.
2. The task worktree's `tests/sprint-05-orient-search/drive-web-return-proof.test.ts`, `.tmp/FIX-ORI-RN-003-3/red.json`, and `.tmp/FIX-ORI-RN-003-3/cycle-2/red.json` — harness and two actual returned cycles.
3. `.kb-run-sprint/sprint-05-orient-search/FIX-ORI-RN-003-3/cycle-2.blocked.json` — source report, SHA-256 `24bfa6cb46246c6d53deb320cb5b927c99a0d73cb0eb52fa2c6baf79951ae427`, commit `ae894cf28b51fab518f6165ad3e37e113c527794`.
4. ORI-CONT-004 worktree `tests/sprint-05-orient-search/evidence/ORI-RN-003/run-manifest.json` — six seed legs and negative control; SHA-256 `eed15223b27a7d4e0f01eb54ab39d477fa11177d7fa7165c2be4c16f2c9ee22b`.
5. ORI-CONT-004 worktree `tests/sprint-05-orient-search/evidence/ORI-AI-002/uniwind/manifest.json` and `uniwind-ios/result.json` — later failed live matrix; hashes `5a362b6aebab236293e9b891a8de54e440c7b91be8c27dfbc2f471acab06f8f5` and `6507206df8924bd98d662f25e0bc8e589209852342f66213f87f85d9153ccaa0`.

These retained external-worktree receipts describe the run at candidate 21b2bf9, not current-candidate acceptance. Verify hashes before drawing historical conclusions and never overwrite another owner's files.

### RUNTIME COMMANDS AND VERIFICATION GATES

```sh
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof
pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/quickstart-web.ts tests/sprint-05-orient-search/drive-web-return-proof.test.ts
```

All five commands are mandatory; no skip flag or environment waiver. The first command is the real diagnosis, the second current full web verification, and the third a source guard. The fourth/fifth remain static gates. Independent review also runs the required earlier sprint lanes under the sprint's normal gate policy.

Do not run `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts` from this task. FLOW-DOCS-02 remains with ORI-CONT-004.

### EVIDENCE GATES

1. Historical blocked evidence is preserved and labeled historical; no invented timeout RED.
2. Current diagnostic baseline/disconnected calls execute and report actual outcomes, with no external browser closure before settlement.
3. Current full proof contains both seed engines and all three negative-control roles, all result observations and exact restoration.
4. The real source guard, typecheck, scoped Biome, source-hash binding, and task diff audit pass; static success alone does not pass runtime ACs.
5. Independent review approves the exact candidate and scopes its claim to this diagnostic; the native/live and locked-flow obligations remain open.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

This task owns no locked flow and adds no journey proof. `FLOW-DOCS-02-quickstart-chat-screen` stays owned by ORI-CONT-004. Its required fresh six seed and six live engine/platform proofs, exact candidate/source binding, and locked command are unchanged. Successful seed proof cannot substitute for the later failing Uniwind live result or for the complete locked flow.

### DEPENDENCIES

Depends on: ORI-RN-003

Do not add ORI-CONT-004 as a dependency or revise its in-flight charter.

Provides: an independently reviewed diagnosis and unchanged-driver web verification, allowing orchestration to stop pursuing an unsupported timeout repair.

Consumes: ORI-RN-003 export/serve/browser/drive helpers and ORI-RN-001 prepareConsumer, without changing those dependencies.

References: CAP-DOCS-01; UC-DOCS-02. Original add ask: ask-wave24-add-driveweb-return. Authorized revision: ask-wave26-revise-driveweb-disposition.

### OUT OF SCOPE

ORI-CONT-004 and its task/evidence ownership; native Maestro legs; provider/live failures; product components; the locked 13 flows; journey proofs; CI/deployment; task/state mutation; trunk/worktree lifecycle. No additional owned path is introduced.

### AGENT RATIONALE AND REVIEW

The requirement for a specific bug RED was contradicted by actual observations and revised through the governed pending-task path. That does not authorize removing real service verification. APPROVED requires current observed results, causal disconnected-callback failure, source restoration, unchanged driver, truthful diagnosis, exact-source evidence, passing gates, and an in-scope diff. NEEDS_FIXES names the failed AC and evidence. A newly reproduced defect is reported for a new decision rather than silently folded into this no-change task.

## Amendments

- 2026-09-29 — `ask-wave26-revise-driveweb-disposition`, authorized by `.kb-run-sprint/sprint-05-orient-search/closure-20260929/driveweb-cycle2-revise-decision.json` and the exact cycle-2 blocked report identified above. The original task hash is `8de84652244a80987f4e5df586523fb876fb37e45ce8dc7f8b68a6815c6dc29f`. Two returned baseline/disconnected cycles plus the caller's six-leg seed proof refute the required 180-second pending-call premise. Replace mandatory invented RED/timeout edit with real diagnostic verification and a no-driver-change disposition. Preserve every command, functional oracle, callback negative control, task ID, allowlist, role assignment, and locked-flow owner. The legacy diagnostic/static selector semantics change explicitly as specified; they cannot be used to claim a fixed timeout. Correct settlement semantics for driveWeb's own context cleanup. The downstream `Stop generating` failure stays open and outside this scope.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "FIX-ORI-RN-003-3",
  "tdd_mode": "verification_only",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": false,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "served_quickstart_export": {
      "description": "A real Expo 57 consumer prepared by prepareConsumer from the committed template and public recipe, exported with exportWeb, and served by serveExport on 127.0.0.1. Chromium comes from launchChromium; driveWeb is unchanged.",
      "seed_method": "cli",
      "records": [
        "Two engines: nativewind and uniwind; each disposable consumer is outside the monorepo under an OS-derived scratch root.",
        "The served screen contains 24 seed turns, including exact text \"Seed turn 24: Ready for your message.\" and \"Seed turn 01: Plan a weekend walk.\"",
        "The shared driver sha256 is 69e45cda55480d06b390637b48bd46fd97bad0ebee0af588c8175455439a3e33. A changed hash requires a new diagnosis, not an automatic approval.",
        "The negative control replaces exactly one onSubmit={handleSubmit} callback with onSubmit={() => {}} in the disposable uniwind screen, then restores the original bytes.",
        "Both consumer templates retain react-native-web 0.21.2. Install/export errors are failures, never returned driveWeb evidence."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "name": "Verify unchanged driveWeb returns with both seed engines",
      "primary": true,
      "description": "GIVEN real nativewind and uniwind quickstart exports WHEN unchanged driveWeb runs in real Chromium THEN both seed calls fulfill before harness teardown, in under 180000 ms, with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted true; the diagnostic receipt says hang_reproduced false and driver_changed false.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/drive-web-return-proof.test.ts",
      "test_function": "runDriveWebReturnProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "test_tier": "e2e",
      "verification_service": "Real Expo exports, localhost serveExport HTTP servers, and Chromium launched by launchChromium",
      "surface_policy": null,
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-003-3-1",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-1",
        "primary": true,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "Real Expo exports, localhost serveExport HTTP servers, and Chromium launched by launchChromium",
        "negative_control": {
          "would_fail_if": [
            "A stubbed Playwright page, mocked Browser, page.setContent, or authored WebLegResult replaces a live export.",
            "Any of the five booleans is hardcoded true, omitted, or derived from source text rather than the returned result.",
            "A pending or rejected call is recorded as a fulfilled result, or forced browser closure produces a false settlement."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "served_quickstart_export",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Run pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof.",
                "Prepare nativewind and uniwind consumers, export each, serve each over HTTP, and await the real driveWeb call with distinct nonempty markers.",
                "Record the result and settlement time before the harness closes its browser or server."
              ]
            },
            "end_state": {
              "must_observe": [
                "green.json records 2 seed legs, nativewind and uniwind, each fulfilled with elapsed_ms < 180000, settled_before_harness_cleanup true, and harness_closed_browser_before_settle false.",
                "Each seed leg has all 5 booleans true, including seedVisible for \"Seed turn 24: Ready for your message.\" and olderSeedReached for \"Seed turn 01: Plan a weekend walk.\"",
                "The 2 markers are distinct and nonempty; browser_connected_at_observe is true; driver_changed is false and hang_reproduced is false."
              ],
              "must_not_observe": [
                "0 seed legs, an empty WebLegResult, a reused historical manifest, or a rejected promise counted as fulfillment.",
                "A claim that a timeout bug was fixed or that FLOW-DOCS-02 passed."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "name": "Verify the disconnected callback falsifies submission and restored bytes pass",
      "primary": false,
      "description": "GIVEN one real uniwind disposable consumer WHEN baseline, disconnected callback, and restored exports are driven THEN all 3 calls fulfill before harness teardown in under 180000 ms; baseline/restored have all 5 booleans true; disconnected has seedVisible and olderSeedReached true with markerVisible and markerSubmitted false; the restored hash equals the original.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/drive-web-return-proof.test.ts",
      "test_function": "runDriveWebReturnProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "test_tier": "e2e",
      "verification_service": "The same real uniwind consumer exported and served 3 times through real Chromium",
      "surface_policy": null,
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-003-3-2",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-2",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "The same real uniwind consumer exported and served 3 times through real Chromium",
        "negative_control": {
          "would_fail_if": [
            "The disconnected callback is skipped or a hardcoded markerVisible true makes the no-op callback pass.",
            "The mutation changes the shared checkout, changes more than 1 callback, or restores different bytes.",
            "A static saved receipt replaces any of the 3 current served calls."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "served_quickstart_export",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Drive the uniwind baseline, replace exactly one onSubmit={handleSubmit} with onSubmit={() => {}}, export again, and drive a new marker.",
                "Restore the exact original bytes in a finally block, record original/mutated/restored hashes, export the restored screen, and drive a third marker."
              ]
            },
            "end_state": {
              "must_observe": [
                "green.json records 3 current uniwind calls with elapsed_ms < 180000 and settled_before_harness_cleanup true.",
                "Baseline and restored have all 5 booleans true; disconnected has seedVisible true and olderSeedReached true while markerVisible and markerSubmitted are false.",
                "Exactly 1 callback changed, mutated_sha256 differs from original_sha256, and restored_sha256 equals original_sha256."
              ],
              "must_not_observe": [
                "0 returned calls, empty markers, a disconnected callback accepted as successful submission, or a missing restoration.",
                "An assertion that disconnected inputCleared must be false; PromptInput may clear after a resolved callback."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "name": "Record a truthful diagnostic disposition with unchanged driver and bounded proof",
      "primary": false,
      "description": "GIVEN the current real proof and prior blocked reports WHEN the preserved diagnostic CLI, source guard, typecheck, scoped Biome, and diff audit run THEN the driver hash is unchanged, the harness watchdog is 180000 ms, the commands execute without skips, and run.json states not_reproduced_no_driver_change with no timeout-fix claim and the downstream live failure still open.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/drive-web-return-proof.test.ts",
      "test_function": "driveWebActionTimeoutStaysFinite",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite",
      "test_tier": "integration",
      "verification_service": "Real Vitest, TypeScript, Biome, Git, and filesystem evidence bound to actual served Chromium runs",
      "surface_policy": null,
      "tdd_state": "none",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-RN-003-3-3",
        "use_case_ref": "UC-DOCS-02",
        "ac_ref": "AC-3",
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "Real Vitest, TypeScript, Biome, Git, and filesystem evidence bound to actual served Chromium runs",
        "negative_control": {
          "would_fail_if": [
            "The guard is skipped, reads no real driver source, or no guard tests run.",
            "Driver bytes are changed without a reproduced defect, the harness uses timeout 0, or a historical receipt is relabeled as current GREEN.",
            "A fabricated RED, no-op runtime path, erased blocked cycle, or static success flag replaces the actual observations."
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "served_quickstart_export",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Run pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red to diagnose the unchanged uniwind baseline and disconnected callback.",
                "Run pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite, pnpm typecheck, and scoped Biome.",
                "Compare the driver hash and task candidate diff to the recorded base; record exact commands, exits, source hashes, evidence paths, and the downstream live failure."
              ]
            },
            "end_state": {
              "must_observe": [
                "The diagnostic mode executes 2 real calls and records hang_reproduced false when both fulfill within 180000 ms; red_evidence_claimed is false.",
                "The guard executes at least 1 test and verifies the real driver sha256 \"69e45cda55480d06b390637b48bd46fd97bad0ebee0af588c8175455439a3e33\", retained 5 result assignments, finite 180000 ms harness bound, and no browser launch under Vitest.",
                "run.json records disposition \"not_reproduced_no_driver_change\", driver_changed false, scope_paths_outside_allowlist 0, and downstream_live_gate_status \"open\".",
                "Vitest, typecheck, and scoped Biome exit 0; historical red.json and cycle-2/red.json hashes remain unchanged."
              ],
              "must_not_observe": [
                "0 executed guard tests, a missing diff baseline, a timeout-fixed claim, skipped runtime verification, or FLOW-DOCS-02 completion from this task.",
                "A finite watchdog converted into forced-close success or a newly reproduced hang accepted as a no-change pass."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "GIVEN real nativewind and uniwind quickstart exports WHEN unchanged driveWeb runs in real Chromium THEN both seed calls fulfill before harness teardown, in under 180000 ms, with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted true; the diagnostic receipt says hang_reproduced false and driver_changed false.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "GIVEN one real uniwind disposable consumer WHEN baseline, disconnected callback, and restored exports are driven THEN all 3 calls fulfill before harness teardown in under 180000 ms; baseline/restored have all 5 booleans true; disconnected has seedVisible and olderSeedReached true with markerVisible and markerSubmitted false; the restored hash equals the original.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "GIVEN the current real proof and prior blocked reports WHEN the preserved diagnostic CLI, source guard, typecheck, scoped Biome, and diff audit run THEN the driver hash is unchanged, the harness watchdog is 180000 ms, the commands execute without skips, and run.json states not_reproduced_no_driver_change with no timeout-fix claim and the downstream live failure still open.",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite",
      "maps_to_ac": "AC-3"
    }
  ]
}
-->
</details>
