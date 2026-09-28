# FIX-ORI-RN-003-3: Make driveWeb return from the seed web legs and the negative-control serve

## What this does

Makes `driveWeb` in `tests/sprint-05-orient-search/support/quickstart-web.ts` fulfill on the two seed web legs and on the negative-control serve. The function today calls `scrollIntoViewIfNeeded`, `click`, and `fill` with no action timeout. Playwright 1.63 defaults that timeout to `0`, which means wait forever. A `.catch` never runs if the promise never rejects.

The seed-visible, older-seed, marker, and cleared-input checks stay real observations. `driveWeb` must still return `seedVisible`, `olderSeedReached`, `markerVisible`, `inputCleared`, and `markerSubmitted` from the live page. A finite timeout is the backstop that makes the call return. It is not a license to mark those booleans true.

## Why

ORI-CONT-004 cycle 3 is blocked. Commit `6e98cf4ad9e00160cee84716cf2efedb1aa75ecc` is on branch `kb-run-sprint/sprint-05-orient-search/ORI-CONT-004` and is not an ancestor of main `44aa249187fd11e9054210d27fed0f51367dc988`. The worktree and main have the same `quickstart-web.ts` blob (`3e2299b7774d26dafef813a888fbfcd6d25dcfad`).

FLOW-DOCS-01-getting-started-engine-decision and FLOW-DOCS-01-theming-and-section-nav `run_flow` receipts exited 0 on 2026-09-28 at head `6e98cf4ad9e0`. FLOW-DOCS-02-quickstart-chat-screen did not. Its canonical receipt, in that worktree at `.tmp/sprint-05-orient-search/e2e-evidence/FLOW-DOCS-02-quickstart-chat-screen.json`, is still the 2026-09-26 file: `exit_code` 124, `artifact_fresh` false, `head` `a68c9a0eb19a94865ebe4b43bf739832bff8820e`.

Attempt 1 wrote the native seed screenshots and a uniwind web export, then listened on `127.0.0.1:8610`. That port is in `webSubmit`'s range (`8500` plus a random value under `400`), so `runAllLegs` had already returned. A second browser loaded that same page: HTTP 200, `Seed turn 24` visible, scroll to `Seed turn 01` in 206 ms. The in-process `driveWeb` call did not return. The note is `.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-CONT-004/.tmp/ORI-CONT-004/cycle-3/red/flow3-attempt1-wedge.txt`. Attempt 2 stalled at `web_listen` for 482 seconds and was killed (`flow3-attempt2-heartbeat.txt`).

`quickstart-web.ts` is owned by completed ORI-RN-003. It is outside ORI-CONT-004 `writeAllowed`. This task depends only on ORI-RN-003. It does not revise ORI-CONT-004, the locked flow command, or `human-flows.json`.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof
pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/quickstart-web.ts tests/sprint-05-orient-search/drive-web-return-proof.test.ts
```

`--mode red` runs before the timeout edit. It must record one real `driveWeb` call that is still pending at 180000 ms. The default command is GREEN: both seed legs and the three negative-control serves fulfill before the page closes. The vitest command is the source guard only. It must not launch Chromium or export.

## Scope

Own `driveWeb`'s action timeout, a bounded scroll helper only if the timed-out scroll leaves the older seed off screen, and the task-owned proof harness. No product source. No locked flow files. No ORI-CONT-004 charter.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending
> Assignee: react-native-reusables-implementer
> Priority: P1 · Points: 3 · Type: FIX
> Dependency phase: after ORI-RN-003
> Proposed By: react-native-reusables-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-28
> Source SHA: 44aa249187fd11e9054210d27fed0f51367dc988

AGENT: planner=react-native-reusables-planner | implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

PROGRESS: 0/3 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

`driveWeb` fulfills on both seed web legs and on the baseline, disconnected, and restored negative-control serves. Each call records a real `WebLegResult` before the page closes. The seed legs show the newest seed, the older seed, one submitted marker, and a cleared composer. The disconnected callback still fails the marker check.

### CRITICAL CONSTRAINTS — Never

- Never change product source under `apps/`, `packages/`, or `scripts/`. An export failure is a blocker. Do not patch Uniwind, Metro, or `react-native-web` from this task.
- Never edit ORI-CONT-004's task file, `human-flows.json`, `gate-plan.json`, or `tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts`. Do not run that locked flow as this task's gate.
- Never weaken the checks. These assignments stay the real observations: `seedVisible` from exact `Seed turn 24: Ready for your message.`, `olderSeedReached` from exact `olderSeed` `isVisible()`, `inputCleared` from the textarea value `=== ''`, `markerVisible` from exact marker `isVisible()`, and `markerSubmitted = markerVisible`. The outer catch must not set any of them true.
- Never prove this with a stubbed Playwright page, `page.setContent`, a mocked `Browser`, or an authored `WebLegResult`. A second client that can scroll the page does not count as `driveWeb` returning.
- Never leave an action timeout of `0`. `page.setDefaultTimeout(0)` and `timeout: 0` on `scrollIntoViewIfNeeded`, `click`, or `fill` are the hang.
- Never add a `fallow-ignore` comment. With no coverage file, Fallow CRAP is cyclomatic complexity squared plus complexity, and the gate fails at 30. Keep every new or edited function at cyclomatic complexity 4 or below. Put a scroll loop in its own helper.

### DONE WHEN

- [ ] AC-1 proves both seed web legs fulfill before the page closes, in under 180000 ms, with all five booleans true.
- [ ] AC-2 proves the three negative-control serves fulfill, and the disconnected callback returns `markerVisible` false.
- [ ] AC-3 proves the finite timeout, the unchanged check assignments, the static gates, and the write boundary.
- [ ] RED is a real pre-fix `driveWeb` call that is still pending at 180000 ms. If every pre-fix call settles, stop and report the booleans. Do not invent a hang.

### SPECIFICATION

One finite action timeout inside `driveWeb`, plus a task-owned harness that calls the real `exportWeb`, `serveExport`, `launchChromium`, and `driveWeb`. Immediately after `newPage()`, call `page.setDefaultTimeout(n)` with an integer `n` from 10000 to 30000 inclusive. `page.goto` keeps `timeout: 60_000`. `waitForFunction` keeps `timeout: 15_000`. Do not pass `timeout: 0`.

`fill` has no local catch today. A timeout rejection must hit the existing outer `try` so `driveWeb` fulfills with a `WebLegResult` instead of rejecting or staying pending. Do not delete that `try`.

If the finite timeout makes `olderSeedReached` false while the served document contains `Seed turn 01: Plan a weekend walk.`, replace the list and older `scrollIntoViewIfNeeded` calls with a helper that scrolls the overflow div in at most 30 steps, then keep `older.isVisible()` as the boolean. Do not set that boolean from text presence alone. The same pattern already works in `crawlTurns` inside `tests/sprint-05-orient-search/quickstart-content.spec.ts` (read-only). Do not import that spec. Attempt 1 showed a second browser could reach `Seed turn 01` in 206 ms, so a returned result with `olderSeedReached` false is not GREEN.

`runWebLeg` and `webSubmit` in `quickstart-proof.test.ts` stay unchanged. They already require the real booleans. `PromptInput` clears the field after a resolved `onSubmit` even when the callback does not append a turn. Do not require `inputCleared` false on the disconnected serve. The marker check is what must fail there. Do not edit `prompt-input.tsx`.

### BOUNDARY CONTRACTS

1. `tests/sprint-05-orient-search/support/quickstart-web.ts` (MODIFY): add `page.setDefaultTimeout(n)` and, only if required by the older-seed check, one bounded scroll helper. No other behavior change.
2. `tests/sprint-05-orient-search/drive-web-return-proof.test.ts` (NEW): export `runDriveWebReturnProof`. CLI entry only when `process.argv[1]` is this file. `--mode red` and the default GREEN mode. Vitest exposes `driveWebActionTimeoutStaysFinite` and must not spawn a browser or `expo export`.
3. RED calls the real uniwind `prepareConsumer`, `exportWeb`, and `serveExport`, then `driveWeb`. If that baseline settles within 180000 ms, re-export the disconnected callback and call `driveWeb` again. Stop at the first call that is still pending at 180000 ms. Record `settled_before_close: false` and `elapsed_ms >= 180000` in `.tmp/FIX-ORI-RN-003-3/red.json`. Closing the browser after the watchdog fires is cleanup, not a voluntary return.
4. GREEN calls, in order: nativewind seed, uniwind baseline, uniwind disconnected, uniwind restored. Each must fulfill with `settled_before_close: true` and `elapsed_ms < 180000` while the page is still open. Seed legs and the baseline require all five booleans true. The disconnected call requires `markerVisible` false, `seedVisible` true, and `olderSeedReached` true. The restored call requires `markerVisible` true, `inputCleared` true, and the same sha256 as the original screen file. One changed callback only.
5. `prepareConsumer` rewrites `tests/sprint-05-orient-search/evidence/ORI-RN-001/{nativewind,uniwind}-install.txt`. Those refreshes are allowed side effects. Do not hand-edit them. Delete `NODE_ENV` before any pnpm, npx, or expo child, and use a short reaper-free `TMPDIR`.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY.

#### AC-1: driveWeb returns from both seed web legs with the four checks still true [PRIMARY]

GIVEN a real served export of the quickstart screen for nativewind and uniwind WHEN driveWeb runs in Chromium from launchChromium THEN each call fulfills before the page closes, in under 180000 ms, with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted all true.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: a real expo export of the committed quickstart consumer, serveExport on 127.0.0.1, and Chromium launched by launchChromium
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
  "verification_service": "a real expo export of the committed quickstart consumer, serveExport on 127.0.0.1, and Chromium launched by launchChromium",
  "negative_control": {
    "would_fail_if": [
      "driveWeb is raced against a stub Playwright page, page.setContent, or a mocked Browser instead of the served export.",
      "The four checks are hardcoded true, or seedVisible, olderSeedReached, markerVisible, or inputCleared is removed.",
      "The call is still pending at 180000 ms and the harness records that pending call as settled."
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
          "Run pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof for nativewind and uniwind.",
          "For each engine, exportWeb, serveExport, launchChromium, and await driveWeb with a fresh marker while the page is still open.",
          "Record settled_before_close, elapsed_ms, and the five WebLegResult booleans."
        ]
      },
      "end_state": {
        "must_observe": [
          "green.json records 2 seed legs, nativewind and uniwind, each with settled_before_close true and elapsed_ms < 180000.",
          "Each seed leg records seedVisible true for \"Seed turn 24: Ready for your message.\" and olderSeedReached true for \"Seed turn 01: Plan a weekend walk.\"",
          "Each of the 2 seed legs records markerVisible true, markerSubmitted true, and inputCleared true for 1 submitted marker."
        ],
        "must_not_observe": [
          "0 settled seed legs, or an empty WebLegResult standing in for a returned call.",
          "A stub page or timeout 0 left on scrollIntoViewIfNeeded, click, or fill."
        ]
      }
    }
  ]
}
```

#### AC-2: driveWeb returns from the negative-control serve and the marker check still bites

GIVEN one uniwind disposable consumer WHEN driveWeb runs on the baseline export, the disconnected onSubmit={() => {}} export, and the restored-bytes export THEN all three calls fulfill before the page closes in under 180000 ms, baseline and restored have markerVisible true and inputCleared true, the disconnected call has markerVisible false, and the restored hash equals the original.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: the same real export, serve, and Chromium path, three times, on one uniwind disposable consumer
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
  "verification_service": "the same real export, serve, and Chromium path, three times, on one uniwind disposable consumer",
  "negative_control": {
    "would_fail_if": [
      "The disconnected onSubmit={() => {}} case is skipped, or markerVisible is hardcoded true so the no-op callback still passes.",
      "The restored bytes are not the original file, or the mutation edits the shared checkout instead of the disposable consumer.",
      "A stubbed page or a static receipt replaces the three served driveWeb calls."
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
          "On the uniwind consumer, driveWeb the baseline export and the restored-bytes export."
        ]
      },
      "end_state": {
        "must_observe": [
          "Baseline and restored each settle with elapsed_ms < 180000, markerVisible true, and inputCleared true.",
          "The restored sha256 equals the original sha256, and the only changed source text is \"onSubmit={handleSubmit}\" versus \"onSubmit={() => {}}\" (1 callback)."
        ],
        "must_not_observe": [
          "0 returned baseline calls, or an empty marker string accepted as the submitted turn."
        ]
      }
    },
    {
      "start_ref": "served_quickstart_export",
      "action": {
        "actor": "cli_user",
        "steps": [
          "Replace only onSubmit={handleSubmit} with onSubmit={() => {}}, re-export, serve, and call driveWeb with a distinct marker."
        ]
      },
      "end_state": {
        "must_observe": [
          "The disconnected call settles with elapsed_ms < 180000, markerVisible false, and seedVisible true for \"Seed turn 24: Ready for your message.\"",
          "olderSeedReached stays true for \"Seed turn 01: Plan a weekend walk.\" on that same returned result."
        ],
        "must_not_observe": [
          "The disconnected callback still shows 1 marker turn, or an empty result is recorded as a pass."
        ]
      }
    }
  ]
}
```

#### AC-3: The action timeout is finite, the checks stay in source, and the diff stays in bounds

GIVEN the landed driveWeb edit WHEN the vitest guard, pnpm typecheck, and scoped Biome run THEN the guard sees one action timeout from 10000 to 30000 inclusive, the five result assignments remain, vitest launches no browser, and git diff --name-only shows 0 paths outside the allowlist.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: the real vitest runner, the real TypeScript compiler, and the real Biome linter reading the committed driver source
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
  "verification_service": "the real vitest runner, the real TypeScript compiler, and the real Biome linter reading the committed driver source",
  "negative_control": {
    "would_fail_if": [
      "The vitest file launches Chromium or runs expo export, or the guard is skipped so 0 tests run.",
      "setDefaultTimeout(0) or timeout: 0 remains on scrollIntoViewIfNeeded, click, or fill.",
      "The diff edits apps, packages, scripts, human-flows.json, or the ORI-CONT-004 task file.",
      "The guard is a stub that does not read quickstart-web.ts, or the suite is empty."
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
          "Run pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite.",
          "Run pnpm typecheck and pnpm exec biome ci on the two owned test paths.",
          "Read git diff --name-only against the allowlist."
        ]
      },
      "end_state": {
        "must_observe": [
          "The guard exits 0 and reports 1 finite action timeout in the range 10000..30000, not 0.",
          "The source still contains the 5 assignments seedVisible, olderSeedReached, inputCleared, markerVisible, and markerSubmitted, including the literal \"Seed turn 24: Ready for your message.\"",
          "git diff --name-only lists 0 paths outside the allowlist."
        ],
        "must_not_observe": [
          "0 guard tests, an empty diff check, or a browser launch under vitest."
        ]
      }
    }
  ]
}
```

### TEST CRITERIA

- TC-1 → AC-1: Both seed web legs fulfill before the page closes in under 180000 ms with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted true. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof`
- TC-2 → AC-2: The baseline, disconnected, and restored negative-control serves each fulfill before the page closes; the disconnected serve has markerVisible false; baseline and restored have markerVisible true and inputCleared true. VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof`
- TC-3 → AC-3: The vitest guard exits 0 with no browser launch, the action timeout is in 10000..30000, and the diff stays inside the allowlist. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite`

### SHARED FIXTURES

```json
{
  "served_quickstart_export": {
    "description": "A real Expo 57 consumer prepared by prepareConsumer from the committed template and public recipe, exported with exportWeb (npx expo export --platform web), and served by serveExport on 127.0.0.1. Chromium is launchChromium, not a stub page.",
    "seed_method": "cli",
    "records": [
      "Two engines: nativewind and uniwind. Each consumer root is an OS temp directory outside the monorepo.",
      "The served document contains the exact text 'Seed turn 24: Ready for your message.' and 'Seed turn 01: Plan a weekend walk.'",
      "react-native-web is pinned to 0.21.2 in both templates. An export exit other than 0 is a blocker, not a driveWeb result.",
      "Playwright 1.63 locator actions default to timeout 0 when chromium.launch is used outside a Playwright Test project.",
      "The negative-control mutation replaces only onSubmit={handleSubmit} with onSubmit={() => {}} in the disposable consumer, then restores the original bytes."
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

### BOUNDARIES — Ask First

- If every pre-fix `driveWeb` call settles within 180000 ms, stop. Report the phase, the elapsed time, and the booleans. Do not invent RED, and do not land a timeout that flips a true check to false.
- If `expo export` exits non-zero, stop. The `0.21.2` pin is already on main. Do not widen this task into another pin.
- If the public registry or npm is unreachable, stop. Do not substitute a local registry or a monorepo path.
- If `pnpm typecheck` fails only because gitignored `apps/docs/src/data/registry-items.json` is missing, regenerate it in the worktree with `pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs prebuild` and do not commit it. If typecheck fails in an owned file, fix that file.
- The whole GREEN run, two installs plus four exports, must finish within 150 minutes. Record the elapsed time in `run.json`. Do not raise that budget to hide a hang.

### DELIVERABLE

- `tests/sprint-05-orient-search/support/quickstart-web.ts`: `driveWeb` uses a finite action timeout and still returns the five real booleans.
- `tests/sprint-05-orient-search/drive-web-return-proof.test.ts`: `runDriveWebReturnProof` for the real web legs, and `driveWebActionTimeoutStaysFinite` for the source guard.
- `.tmp/FIX-ORI-RN-003-3/red.json`, `green.json`, and `run.json`.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: add the harness. On the unmodified `driveWeb`, run the red command. Capture the pending call in `red.json` with the candidate SHA, the serve URL, `exportExit` 0, and `settled_before_close` false. Wait for orchestrator verification. An export failure is a blocker, not RED.
2. GREEN: set the finite timeout. Add the bounded scroll helper only if the older-seed check is otherwise false. Rerun the default command. Then run the vitest guard, `pnpm typecheck`, and the scoped Biome command.
3. Hand the candidate and the three JSON files to react-native-reusables-reviewer. Do not merge, and do not edit ORI-CONT-004.

### READING LIST — maximum five

1. `tests/sprint-05-orient-search/support/quickstart-web.ts` — `driveWeb` lines 128-186. The six unbounded actions are at lines 154, 156, 162, 163, 165, and 177. `fill` at line 163 has no `.catch`.
2. `tests/sprint-05-orient-search/support/quickstart-proof.test.ts` — `runWebLeg` (about line 253) and `webSubmit` (about line 369). Read-only. Port `8401`/`8402` are the seed legs. `8500` to `8899` is the negative-control serve.
3. `tests/sprint-05-orient-search/quickstart-content.spec.ts` — `crawlTurns` (about line 482), the bounded scroll that reaches every seed turn. Read-only.
4. `.kb-run-sprint/worktrees/sprint-05-orient-search/ORI-CONT-004/.tmp/ORI-CONT-004/cycle-3/red/flow3-attempt1-wedge.txt` — the observed non-return after the page was already servable.
5. `node_modules/.pnpm/playwright-core@1.63.0/node_modules/playwright-core/types/types.d.ts` — `scrollIntoViewIfNeeded` documents `timeout` default `0` (no timeout).

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof
```

Preserved commands:

```sh
pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof --mode red
pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/support/quickstart-web.ts tests/sprint-05-orient-search/drive-web-return-proof.test.ts
```

Do not run `pnpm exec playwright test tests/sprint-05-orient-search/quickstart-chat-screen.spec.ts`. That locked command stays with ORI-CONT-004.

### EVIDENCE GATES

1. RED: one real pre-fix `driveWeb` call still pending at 180000 ms, with `exportExit` 0 and the serve URL recorded. A source reading is not RED.
2. GREEN: 2 seed legs and 3 negative-control serves, each `settled_before_close` true and `elapsed_ms` under 180000, with the boolean contract above.
3. Static: the vitest guard, `pnpm typecheck`, and scoped Biome exit 0, or a stash-proven pre-existing failure is recorded in `run.json`.
4. Scope: `git diff --name-only` shows 0 paths outside writeAllowed.

Planned evidence: `.tmp/FIX-ORI-RN-003-3/red.json`, `.tmp/FIX-ORI-RN-003-3/green.json`, `.tmp/FIX-ORI-RN-003-3/run.json`. Teardown stops only the browser and the serve this run opened, and deletes only the temp consumer roots this run created.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. `FLOW-DOCS-02-quickstart-chat-screen` stays owned by ORI-CONT-004. This task does not write `human-flows.json`, `gate-plan.json`, or journey proofs. It unblocks the web calls ORI-CONT-004 already makes. It does not execute that flow.

### DEPENDENCIES

Depends on: ORI-RN-003

Do not add ORI-CONT-004 as a dependency. ORI-CONT-004 is in flight and must not be revised.

Blocks: the return of ORI-CONT-004's seed web legs and negative-control serve. It does not block by editing that task.

Provides: a `driveWeb` that fulfills under a finite action timeout without weakening the four checks.

Consumes: ORI-RN-003's `exportWeb`, `serveExport`, `launchChromium`, and `driveWeb`, and ORI-RN-001's `prepareConsumer` (read-only).

References: CAP-DOCS-01; UC-DOCS-02.

Provenance: planner ask `ask-wave24-add-driveweb-return` (wave 24, sequence next). Source task ORI-RN-003, completed. Reporting task ORI-CONT-004 cycle 3, commit `6e98cf4ad9e00160cee84716cf2efedb1aa75ecc`, not on main.

### OUT OF SCOPE

ORI-CONT-004's spec, evidence, and task file. Native Maestro legs. Product components. The locked 13 flows. Journey proofs. Planning-policy edits other than the sprint list this ask updates. Trunk and worktree lifecycle.

### AGENT RATIONALE AND REVIEW

Must pass: a real pre-fix call that does not settle by 180000 ms; GREEN calls that settle before the page closes with the boolean contract; no stub page; no product diff; no edit to the locked flow or to ORI-CONT-004. Verdict: APPROVED or NEEDS_FIXES, naming the failed AC and the evidence file.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "FIX-ORI-RN-003-3",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "served_quickstart_export": {
      "description": "A real Expo 57 consumer prepared by prepareConsumer from the committed template and public recipe, exported with exportWeb (npx expo export --platform web), and served by serveExport on 127.0.0.1. Chromium is launchChromium, not a stub page.",
      "seed_method": "cli",
      "records": [
        "Two engines: nativewind and uniwind. Each consumer root is an OS temp directory outside the monorepo.",
        "The served document contains the exact text 'Seed turn 24: Ready for your message.' and 'Seed turn 01: Plan a weekend walk.'",
        "react-native-web is pinned to 0.21.2 in both templates. An export exit other than 0 is a blocker, not a driveWeb result.",
        "Playwright 1.63 locator actions default to timeout 0 when chromium.launch is used outside a Playwright Test project.",
        "The negative-control mutation replaces only onSubmit={handleSubmit} with onSubmit={() => {}} in the disposable consumer, then restores the original bytes."
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "name": "driveWeb returns from both seed web legs with the four checks still true",
      "primary": true,
      "description": "GIVEN a real served export of the quickstart screen for nativewind and uniwind WHEN driveWeb runs in Chromium from launchChromium THEN each call fulfills before the page closes, in under 180000 ms, with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted all true.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/drive-web-return-proof.test.ts",
      "test_function": "runDriveWebReturnProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "test_tier": "e2e",
      "verification_service": "a real expo export of the committed quickstart consumer, serveExport on 127.0.0.1, and Chromium launched by launchChromium",
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
        "verification_service": "a real expo export of the committed quickstart consumer, serveExport on 127.0.0.1, and Chromium launched by launchChromium",
        "negative_control": {
          "would_fail_if": [
            "driveWeb is raced against a stub Playwright page, page.setContent, or a mocked Browser instead of the served export.",
            "The four checks are hardcoded true, or seedVisible, olderSeedReached, markerVisible, or inputCleared is removed.",
            "The call is still pending at 180000 ms and the harness records that pending call as settled."
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
                "Run pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof for nativewind and uniwind.",
                "For each engine, exportWeb, serveExport, launchChromium, and await driveWeb with a fresh marker while the page is still open.",
                "Record settled_before_close, elapsed_ms, and the five WebLegResult booleans."
              ]
            },
            "end_state": {
              "must_observe": [
                "green.json records 2 seed legs, nativewind and uniwind, each with settled_before_close true and elapsed_ms < 180000.",
                "Each seed leg records seedVisible true for \"Seed turn 24: Ready for your message.\" and olderSeedReached true for \"Seed turn 01: Plan a weekend walk.\"",
                "Each of the 2 seed legs records markerVisible true, markerSubmitted true, and inputCleared true for 1 submitted marker."
              ],
              "must_not_observe": [
                "0 settled seed legs, or an empty WebLegResult standing in for a returned call.",
                "A stub page or timeout 0 left on scrollIntoViewIfNeeded, click, or fill."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "name": "driveWeb returns from the negative-control serve and the marker check still bites",
      "primary": false,
      "description": "GIVEN one uniwind disposable consumer WHEN driveWeb runs on the baseline export, the disconnected onSubmit={() => {}} export, and the restored-bytes export THEN all three calls fulfill before the page closes in under 180000 ms, baseline and restored have markerVisible true and inputCleared true, the disconnected call has markerVisible false, and the restored hash equals the original.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/drive-web-return-proof.test.ts",
      "test_function": "runDriveWebReturnProof",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "test_tier": "e2e",
      "verification_service": "the same real export, serve, and Chromium path, three times, on one uniwind disposable consumer",
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
        "verification_service": "the same real export, serve, and Chromium path, three times, on one uniwind disposable consumer",
        "negative_control": {
          "would_fail_if": [
            "The disconnected onSubmit={() => {}} case is skipped, or markerVisible is hardcoded true so the no-op callback still passes.",
            "The restored bytes are not the original file, or the mutation edits the shared checkout instead of the disposable consumer.",
            "A stubbed page or a static receipt replaces the three served driveWeb calls."
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
                "On the uniwind consumer, driveWeb the baseline export and the restored-bytes export."
              ]
            },
            "end_state": {
              "must_observe": [
                "Baseline and restored each settle with elapsed_ms < 180000, markerVisible true, and inputCleared true.",
                "The restored sha256 equals the original sha256, and the only changed source text is \"onSubmit={handleSubmit}\" versus \"onSubmit={() => {}}\" (1 callback)."
              ],
              "must_not_observe": [
                "0 returned baseline calls, or an empty marker string accepted as the submitted turn."
              ]
            }
          },
          {
            "start_ref": "served_quickstart_export",
            "action": {
              "actor": "cli_user",
              "steps": [
                "Replace only onSubmit={handleSubmit} with onSubmit={() => {}}, re-export, serve, and call driveWeb with a distinct marker."
              ]
            },
            "end_state": {
              "must_observe": [
                "The disconnected call settles with elapsed_ms < 180000, markerVisible false, and seedVisible true for \"Seed turn 24: Ready for your message.\"",
                "olderSeedReached stays true for \"Seed turn 01: Plan a weekend walk.\" on that same returned result."
              ],
              "must_not_observe": [
                "The disconnected callback still shows 1 marker turn, or an empty result is recorded as a pass."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "name": "The action timeout is finite, the checks stay in source, and the diff stays in bounds",
      "primary": false,
      "description": "GIVEN the landed driveWeb edit WHEN the vitest guard, pnpm typecheck, and scoped Biome run THEN the guard sees one action timeout from 10000 to 30000 inclusive, the five result assignments remain, vitest launches no browser, and git diff --name-only shows 0 paths outside the allowlist.",
      "flow_ref": null,
      "test_file": "tests/sprint-05-orient-search/drive-web-return-proof.test.ts",
      "test_function": "driveWebActionTimeoutStaysFinite",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite",
      "test_tier": "integration",
      "verification_service": "the real vitest runner, the real TypeScript compiler, and the real Biome linter reading the committed driver source",
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
        "verification_service": "the real vitest runner, the real TypeScript compiler, and the real Biome linter reading the committed driver source",
        "negative_control": {
          "would_fail_if": [
            "The vitest file launches Chromium or runs expo export, or the guard is skipped so 0 tests run.",
            "setDefaultTimeout(0) or timeout: 0 remains on scrollIntoViewIfNeeded, click, or fill.",
            "The diff edits apps, packages, scripts, human-flows.json, or the ORI-CONT-004 task file.",
            "The guard is a stub that does not read quickstart-web.ts, or the suite is empty."
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
                "Run pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite.",
                "Run pnpm typecheck and pnpm exec biome ci on the two owned test paths.",
                "Read git diff --name-only against the allowlist."
              ]
            },
            "end_state": {
              "must_observe": [
                "The guard exits 0 and reports 1 finite action timeout in the range 10000..30000, not 0.",
                "The source still contains the 5 assignments seedVisible, olderSeedReached, inputCleared, markerVisible, and markerSubmitted, including the literal \"Seed turn 24: Ready for your message.\"",
                "git diff --name-only lists 0 paths outside the allowlist."
              ],
              "must_not_observe": [
                "0 guard tests, an empty diff check, or a browser launch under vitest."
              ]
            }
          }
        ]
      }
    },
    {
      "id": "TC-1",
      "type": "test_criterion",
      "description": "Both seed web legs fulfill before the page closes in under 180000 ms with seedVisible, olderSeedReached, markerVisible, inputCleared, and markerSubmitted true.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_criterion",
      "description": "The baseline, disconnected, and restored negative-control serves each fulfill before the page closes; the disconnected serve has markerVisible false; baseline and restored have markerVisible true and inputCleared true.",
      "verify": "pnpm exec tsx tests/sprint-05-orient-search/drive-web-return-proof.test.ts --entry runDriveWebReturnProof",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_criterion",
      "description": "The vitest guard exits 0 with no browser launch, the action timeout is in 10000..30000, and the diff stays inside the allowlist.",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/drive-web-return-proof.test.ts -t driveWebActionTimeoutStaysFinite",
      "maps_to_ac": "AC-3"
    }
  ]
}
-->
</details>
