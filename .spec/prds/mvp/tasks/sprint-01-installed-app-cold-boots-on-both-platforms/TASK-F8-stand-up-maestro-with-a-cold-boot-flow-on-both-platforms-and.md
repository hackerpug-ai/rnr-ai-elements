# TASK-F8: Stand up Maestro with a cold-boot flow on both platforms and a negative control watched failing

> Task ID: TASK-F8  
> Sprint: [sprint-01](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 13  
> Type: FEATURE  
> Wave: G  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-F6

**Sizing rationale.** The badge assertion is not a line in an existing script — it is pixel sampling from a capture, an sRGB→linear→LMS→OKLab→OKLCH conversion, a second invocation mode that mutates the consumer theme and reverts under a trap, and a schema addition to the artifact. That is 2-3 points on top of an 8 that was already the sprint's heaviest task and already owned three of four locked `test` paths plus both journey proofs. I am not absorbing it silently at 8. If 13 is unacceptable, the honest cut is the one I flagged last round: split the Android leg (steps 10-12, AC-4, `design/goldens/mobile-android/**`) into its own task depending on F8, leaving F8 at 8. I do not recommend splitting the badge work out — it reads a capture only AC-1 produces.

## Outcome

One composed script installs, boots and asserts on iOS and Android, exits non-zero when the seed is removed, and carries a RED log captured from a real failing run.

## Critical Constraints

- `set -euo pipefail` in every script under scripts/e2e/, and no `|| true` anywhere. A wrapper that always exits 0 turns the locked flow into exactly the theatre the negative control exists to forbid, and it would pass this gate while proving nothing.
- The negative-control stage is INVERTED: Maestro must FAIL there, and a Maestro PASS must make the script exit non-zero. Getting this backwards is the single highest-stakes error in the task because it produces a green gate over a dead assertion.
- `clearState: true` under launchApp, and ZERO retries. Per the flake policy a flaky flow is fixed or deleted within the sprint, never retried into green; retries mask precisely the timing bugs this product is made of.
- The RED log must be CAPTURED from a real failing run of the same locked command, via a deliberate mutation that is then reverted. A hand-written RED log is manufactured evidence and is the cardinal sin this field exists to prevent.
- Do NOT edit apps/example/app/** or apps/example/components/ai/** to make a flow pass. If a selector does not resolve, the id map (TASK-F6) or the screen is wrong and belongs to that task, not to a patch here.
- The `--mutate-theme` mode MUST restore apps/example/global.css in a `trap ... EXIT` that fires on success, failure and SIGINT. A mutation left behind poisons TASK-F7's only file and every subsequent run, and it would be discovered as a theming bug rather than as test debris.
- Sample the glyph, not the pill. `tool-badge-completed` is a rounded pill whose background is `bg-secondary`; averaging the whole element's bounds dilutes the check mark's chroma toward the surface and can pass a colorless glyph. Sample inside the glyph's own sub-bounds and record the sample rectangle in the artifact so the number is auditable.
- The cold-boot flow MUST include `tapOn: id: context-trigger` followed by `assertVisible: id: context-popover-content`. TASK-F1 is now INFRA and delegates its PortalHost behavioral proof here; if this pair is dropped, a missing PortalHost renders the overlay as nothing with no error and NOTHING in the sprint catches it.

## Acceptance Criteria

### AC-1 — PRIMARY: the composed script proves the whole arc on both platforms

**GIVEN** apps/example installed from the v0.1.0 tag and both a simulator and an emulator booted  
**WHEN** `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` runs at the repository root  
**THEN** it exits 0 having asserted the seeded transcript and the themed badge on iOS and Android

- FLOW_REF: `UC-REG-01/core-happy-path`
- TEST_TIER: `e2e`
- TEST_FILE: `scripts/e2e/install-core.sh`  ·  TEST_FUNCTION: `UC-REG-01/core-happy-path`
- VERIFY: `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path`
- VERIFICATION_SERVICE: apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F8-1</code></summary>

```json
{
  "id": "SC-F8-1",
  "primary": true,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "the script omits `set -euo pipefail` or appends `|| true`, in which case it exits 0 whatever Maestro reports and the locked flow becomes theatre",
      "the maestro invocation is removed and the script only performs the install, so nothing on a device is asserted",
      "the golden capture is skipped and the run is unfalsifiable after the fact"
    ]
  },
  "evidence": {
    "artifact_type": "screenshot",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "rendered_home_route",
      "action": {
        "actor": "developer",
        "steps": [
          "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` at the repository root",
          "read the final line and the exit code",
          "list design/goldens/mobile-ios/sprint-01/ and design/goldens/mobile-android/sprint-01/"
        ]
      },
      "end_state": {
        "must_observe": [
          "exit code 0",
          "2 `Flow Passed` lines, one per platform",
          "4 png files across the two golden directories, light and dark per platform"
        ],
        "must_not_observe": [
          "exit code 0 with 0 Flow Passed lines",
          "an empty goldens directory",
          "no android capture"
        ]
      }
    }
  ]
}
```
</details>

### AC-2: the negative control is watched failing, and a passing negative control fails the run

**GIVEN** the same booted app with the fixture moved aside  
**WHEN** the script's negative-control stage runs the identical Maestro flow  
**THEN** Maestro fails with the named assertion and the script treats a PASS there as its own failure

- FLOW_REF: `UC-REG-01/core-happy-path`
- TEST_TIER: `e2e`
- TEST_FILE: `scripts/e2e/install-core.sh`  ·  TEST_FUNCTION: `UC-REG-01/core-happy-path`
- VERIFY: `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path`
- VERIFICATION_SERVICE: apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F8-2</code></summary>

```json
{
  "id": "SC-F8-2",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "the negative-control stage is inverted wrongly so a Maestro PASS is accepted, which is exactly the disconnected-backend hole the stage exists to close",
      "the fixture is restored before the stage runs, so the app still has its seed and the flow passes for the wrong reason",
      "the stage is removed and a flow that asserts nothing still prints green"
    ]
  },
  "evidence": {
    "artifact_type": "screenshot",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "seed_removed",
      "action": {
        "actor": "developer",
        "steps": [
          "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` with the fixture already moved to transcript.json.bak",
          "read the negative-control stage output and the script's exit code"
        ]
      },
      "end_state": {
        "must_observe": [
          "the literal line `Assertion is false: id: transcript-message-0 is visible`",
          "an exit code of `1` from the maestro child process",
          "the script line `negative control behaved as required`"
        ],
        "must_not_observe": [
          "`Flow Passed` during the negative-control stage",
          "exit code 0 with the seed absent",
          "no assertion output at all"
        ]
      }
    }
  ]
}
```
</details>

### AC-3: the assertion runs against a cold launch, not a warm resume

**GIVEN** .maestro/cold-boot.yaml carrying `clearState: true` under launchApp  
**WHEN** the app is force-quit from the launcher and the flow is run a second time  
**THEN** the second run passes from a cleared install rather than a resumed process

- FLOW_REF: `UC-REG-01/core-happy-path`
- TEST_TIER: `e2e`
- TEST_FILE: `scripts/e2e/install-core.sh`  ·  TEST_FUNCTION: `UC-REG-01/core-happy-path`
- VERIFY: `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path`
- VERIFICATION_SERVICE: apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F8-3</code></summary>

```json
{
  "id": "SC-F8-3",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "clearState is set to false or omitted, in which case the flow passes on a resumed process and proves nothing about a cold boot",
      "a retry wrapper is added and a flaky timing bug is retried into green, which the flake policy forbids",
      "the force-quit step is skipped and the second run is a warm reload"
    ]
  },
  "evidence": {
    "artifact_type": "screenshot",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "android_emulator",
      "action": {
        "actor": "developer",
        "steps": [
          "force-quit apps/example from the Android launcher, leaving Metro running",
          "run `pnpm e2e:smoke:android` a second time",
          "read Maestro's launchApp command output"
        ]
      },
      "end_state": {
        "must_observe": [
          "`Flow Passed` on the second consecutive run",
          "the launchApp line reporting `clearState`",
          "2 passing runs with 0 retries configured"
        ],
        "must_not_observe": [
          "a pass explained by a warm resume",
          "`clearState: false` in the flow",
          "0 runs after the force-quit"
        ]
      }
    }
  ]
}
```
</details>

### AC-4: Android is verified as its own platform, not assumed from iOS

**GIVEN** the Pixel_7_API_34 emulator with edge-to-edge default Android 14+ insets  
**WHEN** the flow runs on Android and the composer is inspected  
**THEN** the send button clears the system navigation bar and an Android golden is written

- FLOW_REF: `UC-REG-01/core-happy-path`
- TEST_TIER: `e2e`
- TEST_FILE: `scripts/e2e/install-core.sh`  ·  TEST_FUNCTION: `UC-REG-01/core-happy-path`
- VERIFY: `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path`
- VERIFICATION_SERVICE: apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F8-4</code></summary>

```json
{
  "id": "SC-F8-4",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "the bottom inset is unhandled, in which case Android 14+ edge-to-edge silently places the send button under the navigation bar with no error of any kind",
      "the android leg is skipped and iOS evidence is reused, leaving Android unverified as it is today",
      "the inset is faked with a hardcoded bottom padding rather than read from the safe-area provider"
    ]
  },
  "evidence": {
    "artifact_type": "screenshot",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "android_emulator",
      "action": {
        "actor": "device_user",
        "steps": [
          "run `pnpm e2e:smoke:android` from the repository root",
          "capture design/goldens/mobile-android/sprint-01/cold-boot.png",
          "measure the gap between the send button's bottom edge and the top of the system navigation bar"
        ]
      },
      "end_state": {
        "must_observe": [
          "a gap of at least 1 dp between the send button and the navigation bar",
          "`2` png files under design/goldens/mobile-android/sprint-01/ (light and dark), where the directory previously held none",
          "`Flow Passed` from the android flow"
        ],
        "must_not_observe": [
          "a send button overlapped by the navigation bar",
          "an empty design/goldens/mobile-android directory",
          "0 android captures"
        ]
      }
    }
  ]
}
```
</details>

### AC-5: the RED proof is the locked test watched failing

**GIVEN** a deliberate mutation of the assertion the flow depends on  
**WHEN** the mutated flow is run and its output captured to the locked red_proof path  
**THEN** the log records a real failure of the same command the gate runs, then the mutation is reverted

- FLOW_REF: `UC-REG-01/core-happy-path`
- TEST_TIER: `e2e`
- TEST_FILE: `scripts/e2e/install-core.sh`  ·  TEST_FUNCTION: `UC-REG-01/core-happy-path`
- VERIFY: `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path`
- VERIFICATION_SERVICE: apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F8-5</code></summary>

```json
{
  "id": "SC-F8-5",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "the RED log is written by hand rather than captured from a real failing run, which is the manufactured-evidence case this field exists to prevent",
      "the mutation is never reverted, leaving the flow red and the committed evidence stale",
      "a different command is captured, so the log proves some command failed rather than that this locked test failed; a hand-written or empty log is the same defect"
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "rendered_home_route",
      "action": {
        "actor": "developer",
        "steps": [
          "change the `transcript-message-0` assertVisible in .maestro/cold-boot.yaml to an id that no element carries",
          "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` and redirect stdout and stderr to design/goldens/sprint-01/install/core-happy-path.RED.log",
          "revert the mutation and re-run the same command"
        ]
      },
      "end_state": {
        "must_observe": [
          "the RED log containing a non-zero exit and an `Element not found` line",
          "the identical command exiting 0 after the revert",
          "1 committed RED log naming the same script the gate runs"
        ],
        "must_not_observe": [
          "an empty RED log",
          "a RED log produced by a different command than the locked run_cmd",
          "no captured failure"
        ]
      }
    }
  ]
}
```
</details>

### AC-6: the tool badge glyph is green by measurement, not by human glance

**GIVEN** the iOS golden capture written by AC-1 and the `tool-badge-completed` element bounds Maestro reports  
**WHEN** install-core.sh samples the check glyph pixels and converts them to OKLCH  
**THEN** chroma exceeds 0.05 and hue falls in [120,180], and both numbers are written into the artifact

- FLOW_REF: `UC-REG-01/core-happy-path`
- TEST_TIER: `e2e`
- TEST_FILE: `scripts/e2e/install-core.sh`  ·  TEST_FUNCTION: `UC-REG-01/core-happy-path`
- VERIFY: `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path`
- VERIFICATION_SERVICE: apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag
- SURFACE_POLICY: `.spec/e2e-policy/surface.json`

<details><summary>Scenario <code>SC-F8-6</code></summary>

```json
{
  "id": "SC-F8-6",
  "primary": false,
  "tier": "visible",
  "test_tier": "e2e",
  "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
  "negative_control": {
    "would_fail_if": [
      "the assertion is downgraded to a human reading the screenshot, which passes on a colorless glyph and is the exact silent failure this sprint exists to expose",
      "the consumer @theme omits `--color-green-600`, the class compiles to nothing, and the glyph renders at chroma near 0 while the flow still prints Flow Passed",
      "the sampled numbers are hardcoded into the artifact rather than measured from the capture"
    ]
  },
  "evidence": {
    "artifact_type": "file_artifact",
    "required_capture": true
  },
  "cases": [
    {
      "start_ref": "rendered_home_route",
      "action": {
        "actor": "developer",
        "steps": [
          "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` at the repository root",
          "read badge_glyph_oklch in design/goldens/sprint-01/install/core-happy-path.json"
        ]
      },
      "end_state": {
        "must_observe": [
          "a `chroma` number greater than `0.05`, measured near `0.194`",
          "a `hue` number inside `[120,180]`, measured near `149.2`",
          "2 sampled numbers persisted in the artifact JSON alongside the sample coordinates"
        ],
        "must_not_observe": [
          "a chroma of 0",
          "an empty badge_glyph_oklch object",
          "0 sampled pixels"
        ]
      }
    },
    {
      "start_ref": "theme_slice_deleted",
      "action": {
        "actor": "developer",
        "steps": [
          "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path --mutate-theme green-600`",
          "read the failure line and the exit code"
        ]
      },
      "end_state": {
        "must_observe": [
          "an exit code of `1`",
          "a failure line naming the measured chroma below `0.05`",
          "the literal token `--color-green-600` in the failure message"
        ],
        "must_not_observe": [
          "`Flow Passed`",
          "exit code 0 with the palette slice deleted",
          "no chroma number in the output"
        ]
      }
    }
  ]
}
```
</details>


## Test Criteria

| ID | Maps to | Assertion |
|---|---|---|
| TC-1 | AC-1 | it exits 0 having asserted the seeded transcript and the themed badge on iOS and Android |
| TC-2 | AC-2 | Maestro fails with the named assertion and the script treats a PASS there as its own failure |
| TC-3 | AC-3 | the second run passes from a cleared install rather than a resumed process |
| TC-4 | AC-4 | the send button clears the system navigation bar and an Android golden is written |
| TC-5 | AC-5 | the log records a real failure of the same command the gate runs, then the mutation is reverted |
| TC-6 | AC-6 | chroma exceeds 0.05 and hue falls in [120,180], and both numbers are written into the artifact |

## Guardrails

**WRITE-ALLOWED**
- `.maestro/**`
- `apps/example/package.json`
- `package.json`
- `design/goldens/mobile-android/**`
- `design/goldens/mobile-ios/sprint-01/**`
- `AGENTS.md`
- `.spec/e2e-policy/**`
- `scripts/e2e/**`
- `design/goldens/sprint-01/install/**`
- `apps/example/global.css`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `.github/workflows/**`
- `apps/example/components/ai/**`
- `apps/example/app/**`

## Fixtures

- **`rendered_home_route`** (ui_flow) — apps/example / route mounted on a booted simulator from the committed fixture with no network call
- **`seed_removed`** (cli) — the same booted app after `mv apps/example/fixtures/transcript.json apps/example/fixtures/transcript.json.bak`
- **`android_emulator`** (cli) — Pixel_7_API_34 emulator booted with apps/example installed by `npx expo run:android`
- **`theme_slice_deleted`** (cli) — apps/example/global.css with the `--color-green-600` declaration removed and Metro cache cleared

## Notes

- Maestro 2.5.1 is already installed at ~/.maestro/bin/maestro and AVDs Pixel_7_API_34 / Pixel_8_API_34 exist, so the runner is not a cost here; only the flows, the policies and the script are.
- Pin the Maestro version in .maestro/config.yaml and in docs/e2e.md. An unpinned runner is a silent flake source.
- Capture light AND dark on every surface even though the gate only asserts light: it costs one Maestro line and gives sprint 03's flip a baseline it would otherwise have to manufacture.
- Android is new ground for this project. Budget for genuine platform divergence rather than treating an Android failure as a flow bug.
- If F8 ever needs relief, the honest cut is the Android leg (steps 10-12 plus design/goldens/mobile-android/**) as its own task depending on F8. The policy files, the flow emitting the ids and the script running it cannot be split: surface.json hardcodes TASK-F6's ids, so they must agree character-for-character.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "TASK-F8",
  "task_type": "FEATURE",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "rendered_home_route": {
      "description": "apps/example / route mounted on a booted simulator from the committed fixture with no network call",
      "seed_method": "ui_flow",
      "records": [
        "3 transcript rows mounted",
        "header text `AI Elements Example`"
      ]
    },
    "seed_removed": {
      "description": "the same booted app after `mv apps/example/fixtures/transcript.json apps/example/fixtures/transcript.json.bak`",
      "seed_method": "cli",
      "records": [
        "fixtures/transcript.json absent from disk",
        "fixtures/transcript.json.bak present"
      ]
    },
    "android_emulator": {
      "description": "Pixel_7_API_34 emulator booted with apps/example installed by `npx expo run:android`",
      "seed_method": "cli",
      "records": [
        "adb reports 1 attached emulator-5554",
        "app package ai.hackerpug.rnrexample installed"
      ]
    },
    "theme_slice_deleted": {
      "description": "apps/example/global.css with the `--color-green-600` declaration removed and Metro cache cleared",
      "seed_method": "cli",
      "records": [
        "global.css declares 10 --color-* palette entries instead of 11",
        "--color-green-600 absent"
      ]
    }
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "text": "it exits 0 having asserted the seeded transcript and the themed badge on iOS and Android",
      "flow_ref": "UC-REG-01/core-happy-path",
      "test_tier": "e2e",
      "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F8-1",
        "primary": true,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "the script omits `set -euo pipefail` or appends `|| true`, in which case it exits 0 whatever Maestro reports and the locked flow becomes theatre",
            "the maestro invocation is removed and the script only performs the install, so nothing on a device is asserted",
            "the golden capture is skipped and the run is unfalsifiable after the fact"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "rendered_home_route",
            "action": {
              "actor": "developer",
              "steps": [
                "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` at the repository root",
                "read the final line and the exit code",
                "list design/goldens/mobile-ios/sprint-01/ and design/goldens/mobile-android/sprint-01/"
              ]
            },
            "end_state": {
              "must_observe": [
                "exit code 0",
                "2 `Flow Passed` lines, one per platform",
                "4 png files across the two golden directories, light and dark per platform"
              ],
              "must_not_observe": [
                "exit code 0 with 0 Flow Passed lines",
                "an empty goldens directory",
                "no android capture"
              ]
            }
          }
        ]
      },
      "primary": true,
      "test_file": "scripts/e2e/install-core.sh",
      "test_function": "UC-REG-01/core-happy-path",
      "verify": "bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path"
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "text": "Maestro fails with the named assertion and the script treats a PASS there as its own failure",
      "flow_ref": "UC-REG-01/core-happy-path",
      "test_tier": "e2e",
      "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F8-2",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "the negative-control stage is inverted wrongly so a Maestro PASS is accepted, which is exactly the disconnected-backend hole the stage exists to close",
            "the fixture is restored before the stage runs, so the app still has its seed and the flow passes for the wrong reason",
            "the stage is removed and a flow that asserts nothing still prints green"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "seed_removed",
            "action": {
              "actor": "developer",
              "steps": [
                "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` with the fixture already moved to transcript.json.bak",
                "read the negative-control stage output and the script's exit code"
              ]
            },
            "end_state": {
              "must_observe": [
                "the literal line `Assertion is false: id: transcript-message-0 is visible`",
                "an exit code of `1` from the maestro child process",
                "the script line `negative control behaved as required`"
              ],
              "must_not_observe": [
                "`Flow Passed` during the negative-control stage",
                "exit code 0 with the seed absent",
                "no assertion output at all"
              ]
            }
          }
        ]
      },
      "primary": false,
      "test_file": "scripts/e2e/install-core.sh",
      "test_function": "UC-REG-01/core-happy-path",
      "verify": "bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path"
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "text": "the second run passes from a cleared install rather than a resumed process",
      "flow_ref": "UC-REG-01/core-happy-path",
      "test_tier": "e2e",
      "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F8-3",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "clearState is set to false or omitted, in which case the flow passes on a resumed process and proves nothing about a cold boot",
            "a retry wrapper is added and a flaky timing bug is retried into green, which the flake policy forbids",
            "the force-quit step is skipped and the second run is a warm reload"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "android_emulator",
            "action": {
              "actor": "developer",
              "steps": [
                "force-quit apps/example from the Android launcher, leaving Metro running",
                "run `pnpm e2e:smoke:android` a second time",
                "read Maestro's launchApp command output"
              ]
            },
            "end_state": {
              "must_observe": [
                "`Flow Passed` on the second consecutive run",
                "the launchApp line reporting `clearState`",
                "2 passing runs with 0 retries configured"
              ],
              "must_not_observe": [
                "a pass explained by a warm resume",
                "`clearState: false` in the flow",
                "0 runs after the force-quit"
              ]
            }
          }
        ]
      },
      "primary": false,
      "test_file": "scripts/e2e/install-core.sh",
      "test_function": "UC-REG-01/core-happy-path",
      "verify": "bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path"
    },
    {
      "id": "AC-4",
      "type": "acceptance_criterion",
      "text": "the send button clears the system navigation bar and an Android golden is written",
      "flow_ref": "UC-REG-01/core-happy-path",
      "test_tier": "e2e",
      "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F8-4",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "the bottom inset is unhandled, in which case Android 14+ edge-to-edge silently places the send button under the navigation bar with no error of any kind",
            "the android leg is skipped and iOS evidence is reused, leaving Android unverified as it is today",
            "the inset is faked with a hardcoded bottom padding rather than read from the safe-area provider"
          ]
        },
        "evidence": {
          "artifact_type": "screenshot",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "android_emulator",
            "action": {
              "actor": "device_user",
              "steps": [
                "run `pnpm e2e:smoke:android` from the repository root",
                "capture design/goldens/mobile-android/sprint-01/cold-boot.png",
                "measure the gap between the send button's bottom edge and the top of the system navigation bar"
              ]
            },
            "end_state": {
              "must_observe": [
                "a gap of at least 1 dp between the send button and the navigation bar",
                "`2` png files under design/goldens/mobile-android/sprint-01/ (light and dark), where the directory previously held none",
                "`Flow Passed` from the android flow"
              ],
              "must_not_observe": [
                "a send button overlapped by the navigation bar",
                "an empty design/goldens/mobile-android directory",
                "0 android captures"
              ]
            }
          }
        ]
      },
      "primary": false,
      "test_file": "scripts/e2e/install-core.sh",
      "test_function": "UC-REG-01/core-happy-path",
      "verify": "bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path"
    },
    {
      "id": "AC-5",
      "type": "acceptance_criterion",
      "text": "the log records a real failure of the same command the gate runs, then the mutation is reverted",
      "flow_ref": "UC-REG-01/core-happy-path",
      "test_tier": "e2e",
      "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F8-5",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "the RED log is written by hand rather than captured from a real failing run, which is the manufactured-evidence case this field exists to prevent",
            "the mutation is never reverted, leaving the flow red and the committed evidence stale",
            "a different command is captured, so the log proves some command failed rather than that this locked test failed; a hand-written or empty log is the same defect"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "rendered_home_route",
            "action": {
              "actor": "developer",
              "steps": [
                "change the `transcript-message-0` assertVisible in .maestro/cold-boot.yaml to an id that no element carries",
                "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` and redirect stdout and stderr to design/goldens/sprint-01/install/core-happy-path.RED.log",
                "revert the mutation and re-run the same command"
              ]
            },
            "end_state": {
              "must_observe": [
                "the RED log containing a non-zero exit and an `Element not found` line",
                "the identical command exiting 0 after the revert",
                "1 committed RED log naming the same script the gate runs"
              ],
              "must_not_observe": [
                "an empty RED log",
                "a RED log produced by a different command than the locked run_cmd",
                "no captured failure"
              ]
            }
          }
        ]
      },
      "primary": false,
      "test_file": "scripts/e2e/install-core.sh",
      "test_function": "UC-REG-01/core-happy-path",
      "verify": "bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path"
    },
    {
      "id": "TC-1",
      "type": "test_case",
      "text": "it exits 0 having asserted the seeded transcript and the themed badge on iOS and Android",
      "maps_to_ac": "AC-1"
    },
    {
      "id": "TC-2",
      "type": "test_case",
      "text": "Maestro fails with the named assertion and the script treats a PASS there as its own failure",
      "maps_to_ac": "AC-2"
    },
    {
      "id": "TC-3",
      "type": "test_case",
      "text": "the second run passes from a cleared install rather than a resumed process",
      "maps_to_ac": "AC-3"
    },
    {
      "id": "TC-4",
      "type": "test_case",
      "text": "the send button clears the system navigation bar and an Android golden is written",
      "maps_to_ac": "AC-4"
    },
    {
      "id": "TC-5",
      "type": "test_case",
      "text": "the log records a real failure of the same command the gate runs, then the mutation is reverted",
      "maps_to_ac": "AC-5"
    },
    {
      "id": "AC-6",
      "type": "acceptance_criterion",
      "text": "chroma exceeds 0.05 and hue falls in [120,180], and both numbers are written into the artifact",
      "flow_ref": "UC-REG-01/core-happy-path",
      "test_tier": "e2e",
      "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
      "surface_policy": ".spec/e2e-policy/surface.json",
      "scenario": {
        "id": "SC-F8-6",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "apps/example on iPhone 17 Pro simulator + Pixel_7_API_34 emulator, items installed by the real RNR CLI from the v0.1.0 tag",
        "negative_control": {
          "would_fail_if": [
            "the assertion is downgraded to a human reading the screenshot, which passes on a colorless glyph and is the exact silent failure this sprint exists to expose",
            "the consumer @theme omits `--color-green-600`, the class compiles to nothing, and the glyph renders at chroma near 0 while the flow still prints Flow Passed",
            "the sampled numbers are hardcoded into the artifact rather than measured from the capture"
          ]
        },
        "evidence": {
          "artifact_type": "file_artifact",
          "required_capture": true
        },
        "cases": [
          {
            "start_ref": "rendered_home_route",
            "action": {
              "actor": "developer",
              "steps": [
                "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path` at the repository root",
                "read badge_glyph_oklch in design/goldens/sprint-01/install/core-happy-path.json"
              ]
            },
            "end_state": {
              "must_observe": [
                "a `chroma` number greater than `0.05`, measured near `0.194`",
                "a `hue` number inside `[120,180]`, measured near `149.2`",
                "2 sampled numbers persisted in the artifact JSON alongside the sample coordinates"
              ],
              "must_not_observe": [
                "a chroma of 0",
                "an empty badge_glyph_oklch object",
                "0 sampled pixels"
              ]
            }
          },
          {
            "start_ref": "theme_slice_deleted",
            "action": {
              "actor": "developer",
              "steps": [
                "run `bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path --mutate-theme green-600`",
                "read the failure line and the exit code"
              ]
            },
            "end_state": {
              "must_observe": [
                "an exit code of `1`",
                "a failure line naming the measured chroma below `0.05`",
                "the literal token `--color-green-600` in the failure message"
              ],
              "must_not_observe": [
                "`Flow Passed`",
                "exit code 0 with the palette slice deleted",
                "no chroma number in the output"
              ]
            }
          }
        ]
      },
      "primary": false,
      "test_file": "scripts/e2e/install-core.sh",
      "test_function": "UC-REG-01/core-happy-path",
      "verify": "bash scripts/e2e/install-core.sh UC-REG-01/core-happy-path"
    },
    {
      "id": "TC-6",
      "type": "test_case",
      "text": "chroma exceeds 0.05 and hue falls in [120,180], and both numbers are written into the artifact",
      "maps_to_ac": "AC-6"
    }
  ]
}
-->
