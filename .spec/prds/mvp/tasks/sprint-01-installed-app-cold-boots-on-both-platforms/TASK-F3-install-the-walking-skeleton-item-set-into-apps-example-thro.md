# TASK-F3: Install the walking-skeleton item set into apps/example through the real RNR CLI from the pinned URL

> Task ID: TASK-F3  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 3  
> Type: FEATURE  
> Wave: C  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: TASK-F1, TASK-F2

## Outcome

Five items in one command, then boot. The whole value of this task is that the resolver path is REAL, so that when a later sprint finds a class compiling to nothing nobody can attribute it to a harness shortcut. The fakeability floor is specific and I checked it: `components/ui/popover.tsx` exists NOWHERE in this repository — our eleven registry:ui items are kbd, breadcrumb, button-group, slider, table, command, code-block, empty, item, input-group, sheet — so its presence in the consumer tree after the run is proof the RNR registry was actually reached. `cp` cannot produce it. That is why `context.json` is in the install list and not just the four chat items: it is the only cheap way to pull a portalling RNR primitive, and without it gate step 15's PortalHost assertion has nothing to observe. If anything fails to resolve, fix `registry.json`, rebuild, re-tag, re-run — never place a file by hand. A hand-placed file here is the exact lie this task exists to prevent.

## Critical Constraints

- DO NOT HAND-PLACE A FILE TO MAKE THE BOOT WORK. This is the one instruction that matters. A `cp` from `packages/registry/src` into `apps/example/components` produces a green boot and destroys the only evidence this sprint exists to produce — and it silently invalidates TASK-F4's finding as well, because F4 reads what F3's install actually landed.
- FOUR ITEMS PLUS CONTEXT, NOT 56. The full-matrix both-engine install is CAP-DIST-01's own sprint. Doubling it here buys nothing and costs a day.
- The `--yes` flag is FORBIDDEN on the gate-step-13 run. That run exists to demonstrate the overwrite prompt (UC-REG-01 AC-3), and `--yes` suppresses the only thing it is proving. The coldboot policy carries a `forbidden_seed_patterns` entry for exactly this.
- Use `$TMPDIR` for the hostile app in steps 13-15, never a hardcoded `/tmp`, per the repo's scratch-artifacts standard.

## Acceptance Criteria

### AC-1: One RNR CLI command against the pinned v0.1.0 URL lands five AI Elemen

One RNR CLI command against the pinned v0.1.0 URL lands five AI Elements items and the RNR primitives they declare into a pristine app, and the identical command with the registry hosts unreachable writes nothing.

- FLOW_REF: `—`
- TEST_TIER: `integration`
- TEST_FILE: `tests/install-evidence.test.ts`  ·  TEST_FUNCTION: `installs five items and their RNR primitives from the pinned URL`
- VERIFY: `pnpm exec vitest run tests/install-evidence.test.ts -t "installs five items and their RNR primitives from the pinned URL"`
- VERIFICATION_SERVICE: the real @react-native-reusables/cli resolving live against raw.githubusercontent.com v0.1.0 and reactnativereusables.com, into a pristine Expo app under $TMPDIR
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`
- RED_PROOF: `design/goldens/sprint-01/install/install-evidence.RED.log`
- RED provenance: NATURAL RED, no mutation needed. The test is written before TASK-F3's install work lands and fails on the missing scratch-app fixture and the absent `Created` lines. Capture that run. This is strictly better than the mutation RED it replaces — the failure is the real absence, not a manufactured one.

<details><summary>Scenario <code>SC-F3-1</code></summary>

```json
{
  "id": "SC-F3-1",
  "primary": false,
  "test_tier": "integration",
  "topology": "single-node",
  "start_ref": "pristine-scratch-app",
  "action": {
    "actor": "developer",
    "steps": [
      "confirm the scratch app holds 0 .tsx files under `components/ai` and `components/ui`, and capture that count",
      "shell out to the real `npx @react-native-reusables/cli@latest add` with all five pinned v0.1.0 URLs, capturing the process stdout and exit code",
      "NETWORK DISCRIMINATOR: into a second pristine scratch directory, run the identical command with `reactnativereusables.com` and `raw.githubusercontent.com` resolved to `127.0.0.1`, and record its exit code and file count"
    ]
  },
  "end_state": {
    "must_observe": [
      "the captured pre-state count is exactly `0` .tsx files under `components/ai` and `components/ui`",
      "the captured stdout contains a `Created` line for each of `components/ai/conversation.tsx`, `components/ai/message.tsx`, `components/ai/prompt-input.tsx`, `components/ai/tool.tsx`, `components/ai/context.tsx`",
      "the captured stdout contains a `Created` line for each of `components/ui/text.tsx`, `components/ui/avatar.tsx`, `components/ui/button.tsx`, `components/ui/icon.tsx`, `components/ui/popover.tsx`",
      "the captured stdout names the host `reactnativereusables.com` on the lines resolving the RNR items and `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0` on the lines resolving ours",
      "the CLI process exit code is `0`",
      "THE DISCRIMINATOR: with the registry hosts resolved to `127.0.0.1`, the identical command exits non-zero and leaves `0` .tsx files"
    ],
    "must_not_observe": [
      "any `404` from raw.githubusercontent.com, which is what an unresolvable tag or transitive dependency returns",
      "`Cannot find module` anywhere in the captured output",
      "a `Created` list that omits the RNR primitives entirely, or a run that writes `0` files and still exits `0`",
      "the host-blocked run succeeding \u2014 a success there means the files came from somewhere other than the network and nothing about this install was real"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "the component files are hand-placed by copying `apps/harness/src/components/ui/` or `packages/registry/src/` into the tree \u2014 the host-blocked run would then still produce files and exit `0`, which is the assertion that catches it",
      "the registry hosts are unreachable and the primary run is allowed to fall back to a local or cached copy instead of failing",
      "the captured stdout is replaced by a static hand-written string rather than the real process output",
      "the installed components are stubs that export empty views",
      "the pre-state count is skipped, letting a tree that was already populated report success unchanged"
    ]
  },
  "evidence": {
    "artifact_type": "stdout",
    "required_capture": true,
    "path": "design/goldens/sprint-01/install/core-happy-path.json"
  }
}
```
</details>

### AC-2: Re-running the install against an app that already holds a conflicting

Re-running the install against an app that already holds a conflicting `components/ui/button.tsx` shows what would be overwritten before writing anything, and a pin-drifted dependency fails `expo-doctor` rather than surfacing later as a native crash.

- FLOW_REF: `—`
- TEST_TIER: `integration`
- TEST_FILE: `tests/install-evidence.test.ts`  ·  TEST_FUNCTION: `shows the overwrite before writing and fails expo-doctor on a drifted pin`
- VERIFY: `pnpm exec vitest run tests/install-evidence.test.ts -t "shows the overwrite before writing and fails expo-doctor on a drifted pin"`
- VERIFICATION_SERVICE: a deliberately hostile Expo SDK 57 app under $TMPDIR with a conflicting button and npm-latest react-native-gesture-handler, driven through the real CLI and the real expo-doctor
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`
- RED_PROOF: `design/goldens/sprint-01/install/dirty-app-process.RED.log`
- RED provenance: NATURAL RED: written before the hostile-app fixture builder exists, the test fails on a missing `$TMPDIR` app. Capture that run.

<details><summary>Scenario <code>SC-F3-2</code></summary>

```json
{
  "id": "SC-F3-2",
  "primary": false,
  "test_tier": "integration",
  "topology": "single-node",
  "start_ref": "hostile-expo-app",
  "action": {
    "actor": "developer",
    "steps": [
      "run the gate step 2 add command inside the hostile app WITHOUT `--yes`, with stdin piped to answer `n`, capturing stdout",
      "record the mtime and byte size of `components/ui/button.tsx` before and after that run",
      "run `npx expo-doctor` in the hostile app and capture its exit code and output"
    ]
  },
  "end_state": {
    "must_observe": [
      "the captured stdout contains a prompt naming `components/ui/button.tsx` as a file it would overwrite",
      "`components/ui/button.tsx` is byte-for-byte unchanged after the declined run \u2014 same size, same mtime, `0` bytes differ",
      "`expo-doctor` exits non-zero with output naming `react-native-gesture-handler` and the expected version `~2.32.0`"
    ],
    "must_not_observe": [
      "the add reporting success having silently replaced `components/ui/button.tsx` with `0` warnings",
      "`expo-doctor` exiting `0` with the major-version drift unreported",
      "a prompt that appears only after the file has already been written"
    ]
  },
  "negative_control": {
    "would_fail_if": [
      "the overwrite prompt is suppressed by `--yes`, making the preview a no-op",
      "the expo-doctor assertion is omitted from the test",
      "the hostile app's conflicting button is deleted during setup so nothing can collide",
      "the gesture-handler pin is left at Expo's own version, so the drift is absent and the check passes vacuously"
    ]
  },
  "evidence": {
    "artifact_type": "stdout",
    "required_capture": true,
    "path": "design/goldens/sprint-01/install/dirty-app-process.json"
  }
}
```
</details>


## Test Criteria

| ID | Maps to | Assertion |
|---|---|---|
| TC-1 | AC-1 | The single add command prints a `Created` line for all five `components/ai/*.tsx` targets. |
| TC-2 | AC-1 | `components/ui/popover.tsx`, `text.tsx`, `avatar.tsx`, `button.tsx`, `icon.tsx` exist in the consumer tree after the run and are absent from `packages/registry/src/**` before it. |
| TC-3 | AC-1 | `npx expo run:ios` completes and the app opens with no `Cannot find module` in Metro output. |
| TC-4 | AC-2 | Add without `--yes` into the hostile app pauses naming `components/ui/button.tsx` before writing. |
| TC-5 | AC-2 | `npx expo-doctor` in the hostile app exits non-zero naming `react-native-gesture-handler` and `~2.32.0`. |
| TC-6 | AC-2 | The context surface either draws a popover panel or reports `PortalHost` as a prerequisite; a silent empty render fails. |

## Guardrails

**WRITE-ALLOWED**
- `apps/example/**`
- `packages/registry/registry.json`
- `public/r/**`
- `tests/install-evidence.test.ts`

**WRITE-PROHIBITED**
- `packages/registry/src/components/**`
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `design/**`
- `.github/workflows/**`

## Boundary Contracts

- Five items install in ONE command: `conversation`, `message`, `prompt-input`, `tool`, `context`. `context` is present specifically because it is one of only two registry items that pulls a portalling RNR primitive (`context` -> `popover.json`; `open-in-chat` -> `dropdown-menu.json`), and without it the PortalHost prerequisite in gate step 15 cannot be observed at all.
- Every RNR primitive arrives from `reactnativereusables.com`, never from us. The install is the observation point for UC-FOUND-03 AC-1: no forked copy of an RNR primitive is shipped.
- If a transitive `registryDependency` fails to resolve, the fix is in `registry.json` followed by rebuild and re-tag. It is NEVER a file placed by hand.

## Fixtures

- **`rnr-initialized-example-app`** (cli) — apps/example as TASK-F1 leaves it: Expo SDK 57 + expo-router, rnr init run for the uniwind engine, its own components.json and tsconfig alias pointing at its own tree, PortalHost mounted at the root, and zero files under components/ai.
- **`hostile-expo-app`** (cli) — A fresh Expo SDK 57 app under $TMPDIR deliberately dirtied: its own components/ui/button.tsx with different variants, react-native-gesture-handler at npm-latest 3.x (a major ahead of Expo 57's ~2.32.0), and no PortalHost in its root layout.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F3",
  "task_type": "FEATURE",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "rnr-initialized-example-app": {
      "description": "apps/example as TASK-F1 leaves it: Expo SDK 57 + expo-router, rnr init run for the uniwind engine, its own components.json and tsconfig alias pointing at its own tree, PortalHost mounted at the root, and zero files under components/ai.",
      "seed_method": "cli",
      "records": [
        "apps/example/components.json",
        "apps/example/app/_layout.tsx with PortalHost",
        "components/ai/ empty"
      ]
    },
    "hostile-expo-app": {
      "description": "A fresh Expo SDK 57 app under $TMPDIR deliberately dirtied: its own components/ui/button.tsx with different variants, react-native-gesture-handler at npm-latest 3.x (a major ahead of Expo 57's ~2.32.0), and no PortalHost in its root layout.",
      "seed_method": "cli",
      "records": [
        "$TMPDIR/rnr-dirty/consumer/components/ui/button.tsx",
        "package.json pinning gesture-handler 3.x",
        "app/_layout.tsx without PortalHost"
      ]
    }
  },
  "requirements": [
    {
      "type": "acceptance_criterion",
      "id": "AC-1",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/install-evidence.test.ts",
      "test_function": "installs five items and their RNR primitives from the pinned URL",
      "verify": "pnpm exec vitest run tests/install-evidence.test.ts -t \"installs five items and their RNR primitives from the pinned URL\"",
      "test_tier": "integration",
      "verification_service": "the real @react-native-reusables/cli resolving live against raw.githubusercontent.com v0.1.0 and reactnativereusables.com, into a pristine Expo app under $TMPDIR",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F3-1",
        "primary": false,
        "test_tier": "integration",
        "topology": "single-node",
        "start_ref": "pristine-scratch-app",
        "action": {
          "actor": "developer",
          "steps": [
            "confirm the scratch app holds 0 .tsx files under `components/ai` and `components/ui`, and capture that count",
            "shell out to the real `npx @react-native-reusables/cli@latest add` with all five pinned v0.1.0 URLs, capturing the process stdout and exit code",
            "NETWORK DISCRIMINATOR: into a second pristine scratch directory, run the identical command with `reactnativereusables.com` and `raw.githubusercontent.com` resolved to `127.0.0.1`, and record its exit code and file count"
          ]
        },
        "end_state": {
          "must_observe": [
            "the captured pre-state count is exactly `0` .tsx files under `components/ai` and `components/ui`",
            "the captured stdout contains a `Created` line for each of `components/ai/conversation.tsx`, `components/ai/message.tsx`, `components/ai/prompt-input.tsx`, `components/ai/tool.tsx`, `components/ai/context.tsx`",
            "the captured stdout contains a `Created` line for each of `components/ui/text.tsx`, `components/ui/avatar.tsx`, `components/ui/button.tsx`, `components/ui/icon.tsx`, `components/ui/popover.tsx`",
            "the captured stdout names the host `reactnativereusables.com` on the lines resolving the RNR items and `raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0` on the lines resolving ours",
            "the CLI process exit code is `0`",
            "THE DISCRIMINATOR: with the registry hosts resolved to `127.0.0.1`, the identical command exits non-zero and leaves `0` .tsx files"
          ],
          "must_not_observe": [
            "any `404` from raw.githubusercontent.com, which is what an unresolvable tag or transitive dependency returns",
            "`Cannot find module` anywhere in the captured output",
            "a `Created` list that omits the RNR primitives entirely, or a run that writes `0` files and still exits `0`",
            "the host-blocked run succeeding \u2014 a success there means the files came from somewhere other than the network and nothing about this install was real"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "the component files are hand-placed by copying `apps/harness/src/components/ui/` or `packages/registry/src/` into the tree \u2014 the host-blocked run would then still produce files and exit `0`, which is the assertion that catches it",
            "the registry hosts are unreachable and the primary run is allowed to fall back to a local or cached copy instead of failing",
            "the captured stdout is replaced by a static hand-written string rather than the real process output",
            "the installed components are stubs that export empty views",
            "the pre-state count is skipped, letting a tree that was already populated report success unchanged"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true,
          "path": "design/goldens/sprint-01/install/core-happy-path.json"
        }
      }
    },
    {
      "type": "acceptance_criterion",
      "id": "AC-2",
      "primary": false,
      "flow_ref": null,
      "test_file": "tests/install-evidence.test.ts",
      "test_function": "shows the overwrite before writing and fails expo-doctor on a drifted pin",
      "verify": "pnpm exec vitest run tests/install-evidence.test.ts -t \"shows the overwrite before writing and fails expo-doctor on a drifted pin\"",
      "test_tier": "integration",
      "verification_service": "a deliberately hostile Expo SDK 57 app under $TMPDIR with a conflicting button and npm-latest react-native-gesture-handler, driven through the real CLI and the real expo-doctor",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F3-2",
        "primary": false,
        "test_tier": "integration",
        "topology": "single-node",
        "start_ref": "hostile-expo-app",
        "action": {
          "actor": "developer",
          "steps": [
            "run the gate step 2 add command inside the hostile app WITHOUT `--yes`, with stdin piped to answer `n`, capturing stdout",
            "record the mtime and byte size of `components/ui/button.tsx` before and after that run",
            "run `npx expo-doctor` in the hostile app and capture its exit code and output"
          ]
        },
        "end_state": {
          "must_observe": [
            "the captured stdout contains a prompt naming `components/ui/button.tsx` as a file it would overwrite",
            "`components/ui/button.tsx` is byte-for-byte unchanged after the declined run \u2014 same size, same mtime, `0` bytes differ",
            "`expo-doctor` exits non-zero with output naming `react-native-gesture-handler` and the expected version `~2.32.0`"
          ],
          "must_not_observe": [
            "the add reporting success having silently replaced `components/ui/button.tsx` with `0` warnings",
            "`expo-doctor` exiting `0` with the major-version drift unreported",
            "a prompt that appears only after the file has already been written"
          ]
        },
        "negative_control": {
          "would_fail_if": [
            "the overwrite prompt is suppressed by `--yes`, making the preview a no-op",
            "the expo-doctor assertion is omitted from the test",
            "the hostile app's conflicting button is deleted during setup so nothing can collide",
            "the gesture-handler pin is left at Expo's own version, so the drift is absent and the check passes vacuously"
          ]
        },
        "evidence": {
          "artifact_type": "stdout",
          "required_capture": true,
          "path": "design/goldens/sprint-01/install/dirty-app-process.json"
        }
      }
    },
    {
      "type": "test_case",
      "id": "TC-1",
      "maps_to_ac": "AC-1"
    },
    {
      "type": "test_case",
      "id": "TC-2",
      "maps_to_ac": "AC-1"
    },
    {
      "type": "test_case",
      "id": "TC-3",
      "maps_to_ac": "AC-1"
    },
    {
      "type": "test_case",
      "id": "TC-4",
      "maps_to_ac": "AC-2"
    },
    {
      "type": "test_case",
      "id": "TC-5",
      "maps_to_ac": "AC-2"
    },
    {
      "type": "test_case",
      "id": "TC-6",
      "maps_to_ac": "AC-2"
    }
  ]
}
-->
