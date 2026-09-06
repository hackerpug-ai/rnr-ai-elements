# TASK-P13: Automated sprint-02 lane: the Android gallery walk (56 x 4 states), dark-flip driver, web export smoke, and every negative control watched failing


> Task ID: TASK-P13  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 8  
> Type: FEATURE  
> Wave: F  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-P2, TASK-P3, TASK-P4, TASK-P8  
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes

## Outcome

One stranger-runnable tests/sprint-02 lane proves the sprint's five locked flows with inverted negative controls, real RED logs, and zero retries.

## Critical Constraints

- MUST: `set -euo pipefail` in every script under tests/sprint-02/, ZERO retries, and `clearState: true` under launchApp so the 224-assertion walk runs cold, not warm
- MUST: Every negative control is INVERTED: Maestro must FAIL there (the portal trap's device leg, the manifest removal), and a Maestro PASS where failure is required must make the script exit non-zero
- MUST: Each flow's RED log is CAPTURED from a real failing run of that same locked command (deliberate mutation, then revert) at the red_proof path in human-flows.json
- NEVER use `|| true` or any wrapper that exits 0 whatever the tools report — it turns the locked flow into theatre
- NEVER hand-write a RED log — manufactured evidence is the cardinal sin the red_proof field exists to prevent
- NEVER edit apps/example/app/**, apps/example/components/** or apps/example/gallery/** to make a flow pass — a selector that does not resolve means the id surface (TASK-P2) is wrong, not the flow
- STRICTLY restore every mutation (PortalHost strip, manifest move) in a trap ... EXIT that fires on success, failure and SIGINT, and prove restoration by re-passing the core walk afterwards
- STRICTLY wire the root script: `e2e:gallery:android` → `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path`

## Specification

**Objective:** Own the automated half of sprint-02's human gate: one lane directory whose three scripts and generated Maestro flow prove — on a real Pixel_7_API_34 emulator, a real Metro, and a real exported web build — that all 56 items installed, all 224 state sections assert cold, the dark flip lands on Android and web in the same frame (mid-stream included), and every negative control is watched failing.

**Success state:** All five locked run_cmds exit 0 with their gate literals (`56/56 gallery items present`, `web export serves /gallery: 200`, `56 items x 4 states asserted (android)`, `device-only failure demonstrated`, the flip pairs), the artifacts and non-empty RED logs sit at their locked paths, the trap mutations are proven restored by a re-pass, and a forced cold second run still passes.

## Acceptance Criteria

### AC-1: AC-1 [PRIMARY]

**GIVEN** apps/example carrying sprint-01's 5 items and the published v0.1.0 tag **WHEN** `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path` runs at the repository root **THEN** it installs the 51 remaining items through the real RNR CLI from the tag URLs, expo-installs the native-module dependency set, and exits 0 printing `56/56 gallery items present`, the resolved `react-native-webview 13.16.1`, and `dev-client modules in graph: none`

- **FLOW_REF:** `UC-REG-02/core-happy-path`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** the real RNR CLI against the v0.1.0 tag, the Pixel_7_API_34 emulator over the installed tree, and the exported web build served locally
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/gallery-install.test.sh`
- **TEST_FUNCTION:** `UC-REG-02/core-happy-path`
- **VERIFY:** `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path`

**SCENARIO:**
```json
{
 "primary": true,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "the real RNR CLI against the v0.1.0 tag, the Pixel_7_API_34 emulator over the installed tree, and the exported web build served locally",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the script installs from a workspace path or hand-copied stub files instead of the v0.1.0 tag URLs — a workspace stub would still print `56/56 gallery items present` while proving nothing about a stranger's install",
   "a peer lands from npm latest — `react-native-webview 14.0.1` prints instead of `13.16.1` and the native build breaks at runtime; a pin line echoed as a mocked constant instead of read from apps/example/package.json would hide it",
   "a dev-client module enters the graph and the Expo Go leg becomes impossible while the gate still prints green — the graph check must scan the real dependency graph, not a static allowlist that always prints `dev-client modules in graph: none`",
   "the script omits `set -euo pipefail` or appends `|| true`, exiting 0 whatever the CLI and doctor report — a mid-install network disconnect would still exit 0 green"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "sprint_01_installed_tree",
   "action": {
    "actor": "developer",
    "steps": [
     "run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path` at the repository root",
     "read the install stage, the webview pin line, the graph check line and the exit code",
     "re-run with `--install-only` and read the final line"
    ]
   },
   "end_state": {
    "must_observe": [
     "exit code 0",
     "`56/56 gallery items present` as the install stage's final line — the presence count over all 56 registry targets",
     "the resolved react-native-webview printed as `13.16.1` (never `14.0.1`)",
     "`dev-client modules in graph: none` — 0 dev-client modules named in apps/example's dependency graph",
     "one `Created components/ai/<name>.tsx` line per newly added item — 51 Created lines for the 51 items sprint-01 did not install"
    ],
    "must_not_observe": [
     "404 (a broken tag URL)",
     "14.0.1 as the resolved webview",
     "dev-client modules in graph: react-native-enriched-markdown (or react-native-streamdown, or expo-speech-recognition)",
     "Unable to resolve module",
     "0/56 gallery items present (the empty start signature — an install that copied nothing)"
    ]
   }
  }
 ]
}
```

### AC-2: AC-2 [PRIMARY]

**GIVEN** the 56-item tree, its generated manifest, and a booted Pixel_7_API_34 emulator **WHEN** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` generates .maestro/gallery-walk.yaml from the manifest and runs it cold with id-only selectors **THEN** Maestro prints `Flow Passed` and the script's final line reads `56 items x 4 states asserted (android)` with design/goldens/mobile-android/sprint-02/gallery-matrix.png written

- **FLOW_REF:** `UC-REG-04/core-happy-path`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** real Android emulator, Metro, Maestro, and the exported web build
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/gallery-walk.test.sh`
- **TEST_FUNCTION:** `UC-REG-04/core-happy-path`
- **VERIFY:** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path`

**SCENARIO:**
```json
{
 "primary": true,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the flow is hand-written against a fixed item list instead of GENERATED from the gallery manifest, so a registry change silently stops being walked — a hand-written stub of the first 5 items would print green while 51 items go unwalked",
   "a selector is text- or coordinate-based instead of id-only, so a copy change or layout shift breaks the 224 assertions for the wrong reason — text selectors would still pass against a static mock of the literals",
   "the maestro invocation is removed and the script only regenerates the yaml, asserting nothing on the Android emulator session — a yaml-only stub would exit 0 with 0 device assertions run",
   "the walk runs warm against a resumed process instead of cold under `clearState: true` — a warm-resumed app answering from cached state is a stale mock of the cold-boot surface"
  ]
 },
 "evidence": {
  "artifact_type": "screenshot",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "installed_56_tree",
   "action": {
    "actor": "developer",
    "steps": [
     "boot Pixel_7_API_34 and leave Metro running",
     "run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` from the repository root",
     "read Maestro's verdict line, the script's final line, and list design/goldens/mobile-android/sprint-02/"
    ]
   },
   "end_state": {
    "must_observe": [
     "`Flow Passed` — Maestro's verdict line with 224 state sections asserted: 56 items x 4 states",
     "`56 items x 4 states asserted (android)` as the script's final line",
     "design/goldens/mobile-android/sprint-02/gallery-matrix.png exists and is non-empty (size > 0 bytes)",
     "the generated .maestro/gallery-walk.yaml covering every item x every state — 56 x 4 = 224 sections — with id-only selectors"
    ],
    "must_not_observe": [
     "Assertion is false",
     "Element not found",
     "0 states asserted"
    ]
   }
  }
 ]
}
```

### AC-3: AC-3 [PRIMARY]

**GIVEN** the same emulator and the served web export **WHEN** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` dispatches the --break-portal trap that strips PortalHost from _layout under an EXIT trap **THEN** the DEVICE leg FAILS printing `Assertion is false: id: context-popover-content is visible` while the WEB leg stays green (the export still builds and serves /gallery 200), the script prints `device-only failure demonstrated`, restores the layout, and a re-run of the core walk passes

- **FLOW_REF:** `UC-REG-04/edge-web-story-passes-device-story-fails`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** real Android emulator, Metro, Maestro, and the exported web build
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/gallery-walk.test.sh`
- **TEST_FUNCTION:** `UC-REG-04/edge-web-story-passes-device-story-fails`
- **VERIFY:** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails`

**SCENARIO:**
```json
{
 "primary": true,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "both the Android emulator session and the served web export pass during the trap stage — the trap stripped nothing the emulator session's assertion on `context-popover-content` needs; the assertion would pass against a static shell",
   "the PortalHost strip survives the script (no EXIT trap on failure/SIGINT), poisoning TASK-P2's layout and every later run — every later green would be measured against a broken static layout",
   "the Android emulator session's leg is skipped and only the served web export runs, so the exact silent failure this trap exists to catch (renders in the browser export, renders nothing in the app under test) goes unobserved — the export alone is a half-mock of the shipped surface"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "portal_host_stripped",
   "action": {
    "actor": "developer",
    "steps": [
     "run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` from the repository root",
     "read the Android emulator session's failure line (the app under test), the served web export's result, and the `device-only failure demonstrated` line",
     "after the script exits, re-run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path`"
    ]
   },
   "end_state": {
    "must_observe": [
     "`Assertion is false: id: context-popover-content is visible` — the Android emulator session's 1 failing assertion during the trap stage",
     "`web export serves /gallery: 200` — the served web export leg of the same run stays green (HTTP 200, 0 failures)",
     "`device-only failure demonstrated` — printed only after the leg tally: Android emulator session 1 assertion failure named `context-popover-content`, served web export 0 failures, HTTP 200",
     "`Flow Passed` on the post-restore re-run of `UC-REG-04/core-happy-path`, re-asserting all 224 state sections"
    ],
    "must_not_observe": [
     "both legs passing during the trap stage — the Android emulator session AND the served web export both green with 0 failures",
     "a missing PortalHost in apps/example/app/_layout.tsx after the script exits (grep -c PortalHost prints 0 after exit)",
     "a hand-edited _layout.tsx left behind instead of the byte-for-byte original",
     "0 assertion failures on the Android emulator session during the trap stage — the inverted-control empty signature (the trap stripped nothing; a static shell would also print 0)"
    ]
   }
  }
 ]
}
```

### AC-4: AC-4 [PRIMARY]

**GIVEN** the gallery cold on Pixel_7_API_34 and the served web export in Chrome **WHEN** `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path` runs light, executes `adb shell cmd uimode night yes`, runs dark, and flips back **THEN** every surface sampled from the scheme strip flips dark in the same frame with nothing retaining a light background or border, and light/dark capture pairs are written under design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/

- **FLOW_REF:** `UC-FOUND-02/core-happy-path`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** the Pixel_7_API_34 emulator driven by adb uimode with Maestro captures, plus Chrome on the served web export under prefers-color-scheme emulation
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/dark-flip.test.sh`
- **TEST_FUNCTION:** `UC-FOUND-02/core-happy-path`
- **VERIFY:** `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path`

**SCENARIO:**
```json
{
 "primary": true,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "the Pixel_7_API_34 emulator driven by adb uimode with Maestro captures, plus Chrome on the served web export under prefers-color-scheme emulation",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the scheme is held in library-local state so `cmd uimode night yes` changes nothing the run can sample — the exact defect UC-FOUND-02 exists to forbid; the light/dark diff would come back empty with 0 of 8 roles changed",
   "the captures are taken but never compared, so a surface retaining a light background passes unnoticed — an uncompared pair is static evidence; the comparator must report 8 of 8 roles changed or fail",
   "the web leg reuses the emulator captures instead of flipping prefers-color-scheme in Chrome, leaving the browser flip unobserved — reused emulator PNGs are a mock of the web flip"
  ]
 },
 "evidence": {
  "artifact_type": "screenshot",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "installed_56_tree",
   "action": {
    "actor": "device_user",
    "steps": [
     "run `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path` from the repository root",
     "let it run the light pass, execute `adb shell cmd uimode night yes`, run the dark pass, then `cmd uimode night no` and re-run light",
     "list design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/"
    ]
   },
   "end_state": {
    "must_observe": [
     "8 of 8 sampled scheme-strip roles (`gallery-swatch-<role>` on TASK-P8's 8-role roster) changed value between the light and dark captures — chroma delta > 0.05 per role, same frame, no app restart",
     "`adb shell cmd uimode night no` flips the same 8 of 8 sampled roles back to their light values (chroma delta > 0.05 per role on the reverse comparison)",
     "a light/dark capture pair (2 PNGs, 8 roles sampled per capture) under design/goldens/mobile-android/sprint-02/",
     "a light/dark capture pair (2 PNGs, 8 roles sampled per capture) under design/goldens/web-desktop/sprint-02/"
    ],
    "must_not_observe": [
     "a surface retaining a light background or border",
     "a flip that lands only after navigation",
     "0 capture pairs"
    ]
   }
  }
 ]
}
```

### AC-5: AC-5 [PRIMARY]

**GIVEN** the conversation item's stream replay active on the emulator **WHEN** `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream` taps `gallery-stream-replay` and flips uimode to night mid-token **THEN** every surface flips dark in the same frame WHILE the stream keeps appending tokens with no interruption, restart or dropped scroll pin, and flipping back to light mid-stream holds the same

- **FLOW_REF:** `UC-FOUND-02/edge-runtime-appearance-change-mid-stream`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** the Pixel_7_API_34 emulator driven by adb uimode mid-token, with Metro streaming the committed UIMessageStream fixture and Maestro sampling the scheme strip and the streaming bubble
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/dark-flip.test.sh`
- **TEST_FUNCTION:** `UC-FOUND-02/edge-runtime-appearance-change-mid-stream`
- **VERIFY:** `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream`

**SCENARIO:**
```json
{
 "primary": true,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "the Pixel_7_API_34 emulator driven by adb uimode mid-token, with Metro streaming the committed UIMessageStream fixture and Maestro sampling the scheme strip and the streaming bubble",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the flip is performed after the stream ends rather than mid-token, so the mid-stream remount path is never exercised — the continuity assertion would pass against a static completed transcript",
   "the stream restarts on appearance change and the assertion samples a fresh bubble, passing for the wrong reason — a restarted stream is a mock of continuity; the token count would reset toward 0 instead of strictly increasing",
   "the driver never taps `gallery-stream-replay` and samples only static chrome — 0 tokens appending, proving nothing about streaming"
  ]
 },
 "evidence": {
  "artifact_type": "screenshot",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "streaming_replay_active",
   "action": {
    "actor": "device_user",
    "steps": [
     "run `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream` from the repository root",
     "let it tap `gallery-stream-replay`, wait for visibly appending text, then execute `adb shell cmd uimode night yes` mid-token",
     "read the stream-continuity assertion, then the `cmd uimode night no` mid-stream pass"
    ]
   },
   "end_state": {
    "must_observe": [
     "token count strictly increasing across 3 consecutive samples taken 500ms apart during the flip window, while the 8 of 8 sampled scheme-strip roles changed value (chroma delta > 0.05 per role)",
     "the scroll pin held — contentOffset delta < 1px across the flip window, per the committed capture-pair contract: both captures of the mid-stream pair frame the same screen position (strip + last bubble in frame)",
     "`cmd uimode night no` mid-stream: token count strictly increasing across 3 further consecutive samples 500ms apart and the same 8 of 8 sampled roles return to their light values (chroma delta > 0.05 per role)"
    ],
    "must_not_observe": [
     "a stream restart or interruption",
     "a dropped scroll pin",
     "a surface flipping only after the stream ended",
     "0 tokens appended across the 3-sample flip window (the empty start signature — a stalled or stubbed replay)"
    ]
   }
  }
 ]
}
```

### AC-6: AC-6

**GIVEN** the 56-item tree **WHEN** `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --web-only` runs **THEN** the script exports apps/example for web into a temp directory, serves it, requests /gallery, and finishes with the line `web export serves /gallery: 200` and exit 0

- **FLOW_REF:** `UC-REG-02/core-happy-path`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** the real Android emulator, Metro, Maestro, and the exported web build
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/gallery-install.test.sh`
- **TEST_FUNCTION:** `UC-REG-02/core-happy-path`
- **VERIFY:** `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "the real Android emulator, Metro, Maestro, and the exported web build",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the deep-link check requests / instead of /gallery, passing while the route 404s on a real deep link — a stub answer from a dev server rather than the served static export would also return 200 without proving the export",
   "the export error is swallowed (no `set -euo pipefail`) and a half-built dist is served green — an empty dist with 0 emitted routes would answer 200 on / while /gallery 404s",
   "the served status is asserted with a retry loop until it turns 200, masking a routing defect — a retry loop is a mock of readiness; the single curl must see `200` on the first request"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "installed_56_tree",
   "action": {
    "actor": "developer",
    "steps": [
     "run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --web-only` from the repository root",
     "read the final line and the exit code"
    ]
   },
   "end_state": {
    "must_observe": [
     "`web export serves /gallery: 200` — the script's final line, curl reporting HTTP status `200` from the served static export",
     "exit code 0"
    ],
    "must_not_observe": [
     "404",
     "500",
     "Export encountered an error",
     "an empty response body (0 bytes) at /gallery"
    ]
   }
  }
 ]
}
```

### AC-7: AC-7

**GIVEN** the lane's three scripts and the gallery manifest **WHEN** lane discipline is audited and the manifest-removal negative control runs (`mv apps/example/gallery/manifest.json apps/example/gallery/manifest.json.bak`, re-run the walk) **THEN** every script carries `set -euo pipefail` with zero `|| true` and zero retries, the walk FAILS on the counter (Maestro printing `Assertion is false: id: gallery-counter is visible` or the route erroring before any assertion), the script exits NON-ZERO if that negative control ever passes, and each flow's RED log at its locked red_proof path is non-empty and captured from a real failing run

- **FLOW_REF:** `UC-REG-04/core-happy-path`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** real Android emulator, Metro, Maestro, and the exported web build
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/gallery-walk.test.sh`
- **TEST_FUNCTION:** `UC-REG-04/core-happy-path`
- **VERIFY:** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the negative control is inverted wrongly — a Maestro PASS on the removed manifest is accepted, and a walk that asserts nothing prints green; an empty generated yaml (0 sections) would run 0 assertions and still print `Flow Passed`",
   "a RED log is hand-written rather than captured from a real failing run of the same locked command — manufactured evidence; a mocked or empty log must fail the `test -s` audit of the 5 locked paths",
   "a retry wrapper retries a flaky assertion (an emulator disconnect mid-run) into green, which the flake policy forbids — the lane must configure 0 retries"
  ]
 },
 "evidence": {
  "artifact_type": "file_artifact",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "manifest_removed",
   "action": {
    "actor": "developer",
    "steps": [
     "run `mv apps/example/gallery/manifest.json apps/example/gallery/manifest.json.bak`",
     "re-run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` and read the failure line and exit code",
     "run `mv apps/example/gallery/manifest.json.bak apps/example/gallery/manifest.json` and re-run the same command",
     "grep the three scripts for `set -euo pipefail`, `|| true`, and retry flags; test -s each locked RED.log"
    ]
   },
   "end_state": {
    "must_observe": [
     "`Assertion is false: id: gallery-counter is visible` with the manifest removed (or the route erroring before any assertion) and the script exiting non-zero — 1 or more Maestro failures where failure is required",
     "`Flow Passed` restored after `mv apps/example/gallery/manifest.json.bak apps/example/gallery/manifest.json`, final line `56 items x 4 states asserted (android)` again — all 224 sections re-asserted",
     "`set -euo pipefail` present in all 3 scripts (grep -c prints 1 per script), 0 occurrences of `|| true` (the grep exits 1), 0 retries configured",
     "non-empty (size > 0 bytes) RED logs at the 5 locked red_proof paths — design/goldens/sprint-02/install/core-happy-path.RED.log, design/goldens/sprint-02/gallery/walk-matrix.RED.log, design/goldens/sprint-02/gallery/portal-trap.RED.log, design/goldens/sprint-02/dark/flip-pairs.RED.log, design/goldens/sprint-02/dark/midstream-flip.RED.log — each ending in a non-zero exit from a real failing run"
    ],
    "must_not_observe": [
     "a Maestro pass accepted where failure is required",
     "an empty (0-byte) or hand-written RED log at any of the 5 locked paths",
     "retry wrappers around any maestro invocation"
    ]
   }
  }
 ]
}
```

### AC-8: AC-8

**GIVEN** a passing walk with Metro left running **WHEN** the app is force-quit from the Android launcher and the walk command is run a second time **THEN** it passes again from a cleared cold launch (clearState: true under launchApp, 0 retries), not a warm resume

- **FLOW_REF:** `UC-REG-04/core-happy-path`
- **TEST_TIER:** e2e
- **VERIFICATION_SERVICE:** real Android emulator, Metro, Maestro, and the exported web build
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/gallery-walk.test.sh`
- **TEST_FUNCTION:** `UC-REG-04/core-happy-path`
- **VERIFY:** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "e2e",
 "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "`clearState` is false or omitted, so the second run passes on a resumed process and proves nothing about a cold boot of the 224-assertion walk — a warm resume answering from run 1's state is a stale mock of cold state",
   "the force-quit step is skipped and the second run is a warm reload — resumed static state from run 1 would answer for run 2",
   "a retry wrapper absorbs a cold-launch timing failure or a Metro disconnect instead of exposing it — the lane must configure 0 retries"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "installed_56_tree",
   "action": {
    "actor": "developer",
    "steps": [
     "force-quit the app from the Android launcher, leaving Metro running",
     "run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` a second time",
     "read Maestro's launchApp output and the verdict"
    ]
   },
   "end_state": {
    "must_observe": [
     "`Flow Passed` on the second consecutive run, final line `56 items x 4 states asserted (android)` — all 224 state sections asserted cold again",
     "`clearState: true` inside the launchApp block of the generated .maestro/gallery-walk.yaml (grep -c 'clearState: true' prints >= 1)",
     "0 retries configured — no retry wrapper around the maestro invocation (grep for retry flags prints 0)"
    ],
    "must_not_observe": [
     "a pass explained by a warm resume",
     "clearState: false in the generated flow",
     "0 runs after the force-quit"
    ]
   }
  }
 ]
}
```


## Test Criteria

| ID | Criterion (boolean) | Maps to | Type |
|---|---|---|---|
| TC-1 | gallery-install.test.sh's default mode exits 0 printing `56/56 gallery items present`, the resolved react-native-webview `13.16.1`, and `dev-client modules in graph: none` | AC-1 | happy_path |
| TC-2 | gallery-walk.test.sh generates .maestro/gallery-walk.yaml from apps/example/gallery/manifest.json covering 56 items x 4 states with id-only selectors and finishes with `56 items x 4 states asserted (android)` plus the gallery-matrix.png capture | AC-2 | happy_path |
| TC-3 | the --break-portal trap makes the device leg fail on `context-popover-content` while the web leg stays green, prints `device-only failure demonstrated`, and the restored layout re-passes the core walk | AC-3 | edge_case |
| TC-4 | dark-flip.test.sh produces same-frame light/dark flips on Android (adb uimode) and web (prefers-color-scheme) with capture pairs under design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/ | AC-4 | happy_path |
| TC-5 | the mid-stream id taps gallery-stream-replay, flips uimode night yes/no mid-token, and asserts the stream continued while every surface flipped in the same frame | AC-5 | edge_case |
| TC-6 | --web-only mode exports, serves and requests /gallery finishing with `web export serves /gallery: 200` and exit 0 | AC-6 | happy_path |
| TC-7 | with the manifest moved aside the walk fails on `gallery-counter`, a pass there exits the script non-zero, and every RED log at its locked red_proof path is a captured real failure | AC-7 | error_handling |
| TC-8 | after a force-quit the walk passes a second consecutive cold run under clearState: true with 0 retries | AC-8 | happy_path |

## Verification Checklist

| Command | Expect |
|---|---|
| `ls tests/sprint-02 && grep -c "set -euo pipefail" tests/sprint-02/gallery-install.test.sh tests/sprint-02/gallery-walk.test.sh tests/sprint-02/dark-flip.test.sh` | the lane holds the three scripts; each reports 1 |
| `grep -rn -- '|| true' tests/sprint-02/` | no matches — the grep exits 1 |
| `node -p "require('./package.json').scripts['e2e:gallery:android']"` | prints `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` |
| `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` | exit 0, `Flow Passed`, final line `56 items x 4 states asserted (android)`, and design/goldens/mobile-android/sprint-02/gallery-matrix.png written |
| `test -s design/goldens/sprint-02/gallery/walk-matrix.RED.log && test -s design/goldens/sprint-02/gallery/portal-trap.RED.log && test -s design/goldens/sprint-02/dark/flip-pairs.RED.log && test -s design/goldens/sprint-02/dark/midstream-flip.RED.log && echo red-logs-present` | prints red-logs-present — each captured from a real failing run of its own locked command |
| `git diff --name-only` | every path inside guardrails.write_allowed; zero under apps/example/app/**, apps/example/components/**, apps/example/gallery/** or packages/registry/** |

## Verification Gates

| Gate | Command | Expected |
|---|---|---|
| UC-REG-02/core-happy-path | `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path` | 56/56 gallery items present |
| UC-REG-04/core-happy-path | `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` | 56 items x 4 states asserted (android) |
| UC-REG-04/edge-web-story-passes-device-story-fails | `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` | device-only failure demonstrated |
| UC-FOUND-02/core-happy-path | `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path` | every sampled surface flips dark in the same frame — light/dark capture pairs written under design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/ |
| UC-FOUND-02/edge-runtime-appearance-change-mid-stream | `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream` | the stream continued appending tokens with no interruption while every surface flipped mid-token in the same frame |

## Reading List

- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F8-stand-up-maestro-with-a-cold-boot-flow-on-both-platforms-and.md` (full) — PRIMARY PATTERN — the lane discipline: set -euo pipefail, inverted negative controls, clearState cold runs, EXIT-trap mutations, captured RED logs, and never editing app code to make a flow pass
- `.maestro/cold-boot.yaml` (full) — sprint-01's committed flow — the launchApp/clearState and id-only selector shape the generated gallery-walk.yaml follows
- `apps/example/app/gallery/[item].tsx` (full) — TASK-P2's detail screen — the four state ids and the gallery-stream-replay control the generated flow asserts on
- `apps/example/gallery/manifest.json` (full) — the generated manifest the walk yaml is generated FROM, and the file whose removal is the negative control
- `AGENTS.md` (181-192) — the verification tiers — what Maestro-on-device owns that Vitest and web stories cannot

## Guardrails

**WRITE-ALLOWED**
- `.maestro/** (MODIFY)`
- `package.json (MODIFY)`
- `design/goldens/sprint-02/** (NEW)`
- `design/goldens/mobile-android/sprint-02/** (NEW)`
- `design/goldens/web-desktop/sprint-02/** (NEW)`
- `tests/sprint-02/gallery-install.test.sh (NEW)`
- `tests/sprint-02/gallery-walk.test.sh (NEW)`
- `tests/sprint-02/dark-flip.test.sh (NEW)`

**WRITE-PROHIBITED**
- `apps/example/app/**`
- `apps/example/components/**`
- `apps/example/gallery/**`
- `apps/example/package.json`
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `tests/sprint-01/**`
- `design/goldens/mobile-ios/**`

## Fixtures

- **`sprint_01_installed_tree`** (cli) — apps/example exactly as sprint-01 left it: rnr-init components.json, PortalHost at the root layout, and only the 5 walking-skeleton items installed
- **`installed_56_tree`** (cli) — apps/example with all 56 registry item targets present from the v0.1.0 tag, peers at Expo 57 pins, no dev-client module in the graph
- **`seeded_gallery_manifest`** (public_api) — apps/example/gallery/manifest.json as generated by TASK-P2 from packages/registry/registry.json — 56 items, each with name, group, target and its four state ids
- **`streaming_replay_active`** (ui_flow) — the conversation item detail screen on Pixel_7_API_34 with `gallery-stream-replay` tapped, replaying the committed UIMessageStream fixture with tokens visibly appending and the scroll pinned
- **`portal_host_stripped`** (cli) — apps/example/app/_layout.tsx with the PortalHost import and element removed by the script's --break-portal trap, restoration armed under trap ... EXIT
- **`manifest_removed`** (cli) — apps/example/gallery/manifest.json moved to manifest.json.bak for the walk's negative-control stage, restored under the same exit discipline

## Design

**References:** `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/human-flows.json — the five locked run_cmds, artifacts and red_proof paths`; SPRINT.md gate steps 1, 6, 7, 9, 19, 22, 23 — the literals these scripts must print
**Design-lens references:** SPRINT.md gate steps 6-9, 17, 22-23 (walk, flips, mid-stream, negative controls); sprint-01 TASK-F7 (the chroma>0.05 / hue-window sub-bounds sampling precedent); apps/example/components/gallery/scheme-strip.tsx (TASK-P8 — the sampling target); apps/harness/src/global.css (light/dark role pairs — the expected deltas)
**Pattern:** TASK-F8's composed lane script: flow-id argv dispatch, set -euo pipefail, an EXIT-trap mutation stage, an inverted negative control, and a RED log captured from a real failing run of the same locked command
**Pattern source:** `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F8-stand-up-maestro-with-a-cold-boot-flow-on-both-platforms-and.md`
**Anti-pattern:** an `|| true` wrapper, a retry loop, or a hand-written RED log — any one of them manufactures green and voids the gate
- The walk yaml is GENERATED, never hand-maintained: the manifest is the single source, so a registry change either updates the walk or fails the drift check
- id-only selectors against e2e-ids.ts keep the 224 assertions immune to copy changes — the literals stay human-facing
- The mid-stream flip must read the walk's own stream-replay stage state; that coupling is why the dark-flip driver and the walk cannot be split
- Dark-flip flows pixel-sample gallery-swatch-<role> SUB-BOUNDS before and after the OS flip — same technique as sprint-01's badge chroma (chroma > 0.05, hue window) — and assert EVERY sampled role changed between the captures, not just background; a role that holds its light value is exactly the retained-light-surface FAIL of gate step 8
- Mid-stream: assert the shimmer is ACTIVELY pulsing when the flip lands — sample twice within the pulse window and require the sampled values to differ; give Loading ≥2s dwell so pulse assertions always sample mid-pulse, never a rest frame (a rest-frame capture proves nothing)
- Maestro selectors are id-only: gallery-swatch-*, gallery-counter, gallery-stream-replay, gallery-item-<name>-<state> — no text-anchored taps on strings TASK-P7 owns, so a copy edit cannot break a flow
- Both captures of a pair must be the same screen at the same frame position (scroll pinned, strip + last bubble in frame) per TASK-P8's capture-pair definition — otherwise the light/dark diff measures scroll, not scheme
- **Design-lens anti-pattern:** Whole-screenshot average sampling — background and foreground swap nearly cancel in a mean luminance, and a strip with broken roles can pass while looking obviously wrong to a human

## Boundary Contracts

- every non-unit AC binds one of the five locked flows and verifies with EXACTLY that flow's run_cmd from human-flows.json
- flows select id-only against apps/example/e2e-ids.ts — no text selectors, no coordinate taps
- the --break-portal mutation strips PortalHost from _layout under an EXIT trap that fires on success, failure and SIGINT, and restores it byte-for-byte

## Dependencies

- **Depends on:** TASK-P2, TASK-P3, TASK-P4, TASK-P8
- **Blocks:** none
- **Human test hook:** Gate steps 6, 7, 22, 23 verbatim: run the walk (expect `Flow Passed` and `56 items x 4 states asserted (android)` with gallery-matrix.png), force-quit and re-run (cold pass), run the portal-trap edge (device FAILS on `context-popover-content`, web stays green, `device-only failure demonstrated`, re-pass after restore), then move the manifest aside and re-run the walk (negative control: fails on `gallery-counter`; restore re-passes).

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P13",
 "task_type": "FEATURE",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "sprint_01_installed_tree": {
   "description": "apps/example exactly as sprint-01 left it: rnr-init components.json, PortalHost at the root layout, and only the 5 walking-skeleton items installed",
   "seed_method": "cli",
   "records": [
    "apps/example/components.json written by rnr init",
    "components/ai/conversation.tsx present among exactly 5 installed items"
   ]
  },
  "installed_56_tree": {
   "description": "apps/example with all 56 registry item targets present from the v0.1.0 tag, peers at Expo 57 pins, no dev-client module in the graph",
   "seed_method": "cli",
   "records": [
    "the registry-target presence count prints 56/56",
    "dev-client modules in graph: none"
   ]
  },
  "seeded_gallery_manifest": {
   "description": "apps/example/gallery/manifest.json as generated by TASK-P2 from packages/registry/registry.json — 56 items, each with name, group, target and its four state ids",
   "seed_method": "public_api",
   "records": [
    "items.length === 56",
    "every item carries the four `gallery-item-<name>-{loading,empty,error,populated}` ids"
   ]
  },
  "streaming_replay_active": {
   "description": "the conversation item detail screen on Pixel_7_API_34 with `gallery-stream-replay` tapped, replaying the committed UIMessageStream fixture with tokens visibly appending and the scroll pinned",
   "seed_method": "ui_flow",
   "records": [
    "tokens visibly appending from apps/example/fixtures/transcript.json",
    "scroll pinned to the streaming bubble, no restart"
   ]
  },
  "portal_host_stripped": {
   "description": "apps/example/app/_layout.tsx with the PortalHost import and element removed by the script's --break-portal trap, restoration armed under trap ... EXIT",
   "seed_method": "cli",
   "records": [
    "grep -c PortalHost apps/example/app/_layout.tsx prints 0 while the trap stage runs",
    "the count returns to its original value on EXIT, proven by a re-pass of the core walk"
   ]
  },
  "manifest_removed": {
   "description": "apps/example/gallery/manifest.json moved to manifest.json.bak for the walk's negative-control stage, restored under the same exit discipline",
   "seed_method": "cli",
   "records": [
    "manifest.json absent, manifest.json.bak present while the stage runs",
    "restored and the core walk re-passes afterwards"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "UC-REG-02/core-happy-path",
   "test_file": "tests/sprint-02/gallery-install.test.sh",
   "test_function": "UC-REG-02/core-happy-path",
   "verify": "bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path",
   "test_tier": "e2e",
   "verification_service": "the real RNR CLI against the v0.1.0 tag, the Pixel_7_API_34 emulator over the installed tree, and the exported web build served locally",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "the real RNR CLI against the v0.1.0 tag, the Pixel_7_API_34 emulator over the installed tree, and the exported web build served locally",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the script installs from a workspace path or hand-copied stub files instead of the v0.1.0 tag URLs — a workspace stub would still print `56/56 gallery items present` while proving nothing about a stranger's install",
      "a peer lands from npm latest — `react-native-webview 14.0.1` prints instead of `13.16.1` and the native build breaks at runtime; a pin line echoed as a mocked constant instead of read from apps/example/package.json would hide it",
      "a dev-client module enters the graph and the Expo Go leg becomes impossible while the gate still prints green — the graph check must scan the real dependency graph, not a static allowlist that always prints `dev-client modules in graph: none`",
      "the script omits `set -euo pipefail` or appends `|| true`, exiting 0 whatever the CLI and doctor report — a mid-install network disconnect would still exit 0 green"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "sprint_01_installed_tree",
      "action": {
       "actor": "developer",
       "steps": [
        "run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path` at the repository root",
        "read the install stage, the webview pin line, the graph check line and the exit code",
        "re-run with `--install-only` and read the final line"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 0",
        "`56/56 gallery items present` as the install stage's final line — the presence count over all 56 registry targets",
        "the resolved react-native-webview printed as `13.16.1` (never `14.0.1`)",
        "`dev-client modules in graph: none` — 0 dev-client modules named in apps/example's dependency graph",
        "one `Created components/ai/<name>.tsx` line per newly added item — 51 Created lines for the 51 items sprint-01 did not install"
       ],
       "must_not_observe": [
        "404 (a broken tag URL)",
        "14.0.1 as the resolved webview",
        "dev-client modules in graph: react-native-enriched-markdown (or react-native-streamdown, or expo-speech-recognition)",
        "Unable to resolve module",
        "0/56 gallery items present (the empty start signature — an install that copied nothing)"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** apps/example carrying sprint-01's 5 items and the published v0.1.0 tag **WHEN** `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path` runs at the repository root **THEN** it installs the 51 remaining items through the real RNR CLI from the tag URLs, expo-installs the native-module dependency set, and exits 0 printing `56/56 gallery items present`, the resolved `react-native-webview 13.16.1`, and `dev-client modules in graph: none`",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": true,
   "flow_ref": "UC-REG-04/core-happy-path",
   "test_file": "tests/sprint-02/gallery-walk.test.sh",
   "test_function": "UC-REG-04/core-happy-path",
   "verify": "bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path",
   "test_tier": "e2e",
   "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the flow is hand-written against a fixed item list instead of GENERATED from the gallery manifest, so a registry change silently stops being walked — a hand-written stub of the first 5 items would print green while 51 items go unwalked",
      "a selector is text- or coordinate-based instead of id-only, so a copy change or layout shift breaks the 224 assertions for the wrong reason — text selectors would still pass against a static mock of the literals",
      "the maestro invocation is removed and the script only regenerates the yaml, asserting nothing on the Android emulator session — a yaml-only stub would exit 0 with 0 device assertions run",
      "the walk runs warm against a resumed process instead of cold under `clearState: true` — a warm-resumed app answering from cached state is a stale mock of the cold-boot surface"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "installed_56_tree",
      "action": {
       "actor": "developer",
       "steps": [
        "boot Pixel_7_API_34 and leave Metro running",
        "run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` from the repository root",
        "read Maestro's verdict line, the script's final line, and list design/goldens/mobile-android/sprint-02/"
       ]
      },
      "end_state": {
       "must_observe": [
        "`Flow Passed` — Maestro's verdict line with 224 state sections asserted: 56 items x 4 states",
        "`56 items x 4 states asserted (android)` as the script's final line",
        "design/goldens/mobile-android/sprint-02/gallery-matrix.png exists and is non-empty (size > 0 bytes)",
        "the generated .maestro/gallery-walk.yaml covering every item x every state — 56 x 4 = 224 sections — with id-only selectors"
       ],
       "must_not_observe": [
        "Assertion is false",
        "Element not found",
        "0 states asserted"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** the 56-item tree, its generated manifest, and a booted Pixel_7_API_34 emulator **WHEN** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` generates .maestro/gallery-walk.yaml from the manifest and runs it cold with id-only selectors **THEN** Maestro prints `Flow Passed` and the script's final line reads `56 items x 4 states asserted (android)` with design/goldens/mobile-android/sprint-02/gallery-matrix.png written",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "primary": true,
   "flow_ref": "UC-REG-04/edge-web-story-passes-device-story-fails",
   "test_file": "tests/sprint-02/gallery-walk.test.sh",
   "test_function": "UC-REG-04/edge-web-story-passes-device-story-fails",
   "verify": "bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails",
   "test_tier": "e2e",
   "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "both the Android emulator session and the served web export pass during the trap stage — the trap stripped nothing the emulator session's assertion on `context-popover-content` needs; the assertion would pass against a static shell",
      "the PortalHost strip survives the script (no EXIT trap on failure/SIGINT), poisoning TASK-P2's layout and every later run — every later green would be measured against a broken static layout",
      "the Android emulator session's leg is skipped and only the served web export runs, so the exact silent failure this trap exists to catch (renders in the browser export, renders nothing in the app under test) goes unobserved — the export alone is a half-mock of the shipped surface"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "portal_host_stripped",
      "action": {
       "actor": "developer",
       "steps": [
        "run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` from the repository root",
        "read the Android emulator session's failure line (the app under test), the served web export's result, and the `device-only failure demonstrated` line",
        "after the script exits, re-run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path`"
       ]
      },
      "end_state": {
       "must_observe": [
        "`Assertion is false: id: context-popover-content is visible` — the Android emulator session's 1 failing assertion during the trap stage",
        "`web export serves /gallery: 200` — the served web export leg of the same run stays green (HTTP 200, 0 failures)",
        "`device-only failure demonstrated` — printed only after the leg tally: Android emulator session 1 assertion failure named `context-popover-content`, served web export 0 failures, HTTP 200",
        "`Flow Passed` on the post-restore re-run of `UC-REG-04/core-happy-path`, re-asserting all 224 state sections"
       ],
       "must_not_observe": [
        "both legs passing during the trap stage — the Android emulator session AND the served web export both green with 0 failures",
        "a missing PortalHost in apps/example/app/_layout.tsx after the script exits (grep -c PortalHost prints 0 after exit)",
        "a hand-edited _layout.tsx left behind instead of the byte-for-byte original",
        "0 assertion failures on the Android emulator session during the trap stage — the inverted-control empty signature (the trap stripped nothing; a static shell would also print 0)"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** the same emulator and the served web export **WHEN** `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` dispatches the --break-portal trap that strips PortalHost from _layout under an EXIT trap **THEN** the DEVICE leg FAILS printing `Assertion is false: id: context-popover-content is visible` while the WEB leg stays green (the export still builds and serves /gallery 200), the script prints `device-only failure demonstrated`, restores the layout, and a re-run of the core walk passes",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "primary": true,
   "flow_ref": "UC-FOUND-02/core-happy-path",
   "test_file": "tests/sprint-02/dark-flip.test.sh",
   "test_function": "UC-FOUND-02/core-happy-path",
   "verify": "bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path",
   "test_tier": "e2e",
   "verification_service": "the Pixel_7_API_34 emulator driven by adb uimode with Maestro captures, plus Chrome on the served web export under prefers-color-scheme emulation",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "the Pixel_7_API_34 emulator driven by adb uimode with Maestro captures, plus Chrome on the served web export under prefers-color-scheme emulation",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the scheme is held in library-local state so `cmd uimode night yes` changes nothing the run can sample — the exact defect UC-FOUND-02 exists to forbid; the light/dark diff would come back empty with 0 of 8 roles changed",
      "the captures are taken but never compared, so a surface retaining a light background passes unnoticed — an uncompared pair is static evidence; the comparator must report 8 of 8 roles changed or fail",
      "the web leg reuses the emulator captures instead of flipping prefers-color-scheme in Chrome, leaving the browser flip unobserved — reused emulator PNGs are a mock of the web flip"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "installed_56_tree",
      "action": {
       "actor": "device_user",
       "steps": [
        "run `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path` from the repository root",
        "let it run the light pass, execute `adb shell cmd uimode night yes`, run the dark pass, then `cmd uimode night no` and re-run light",
        "list design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/"
       ]
      },
      "end_state": {
       "must_observe": [
        "8 of 8 sampled scheme-strip roles (`gallery-swatch-<role>` on TASK-P8's 8-role roster) changed value between the light and dark captures — chroma delta > 0.05 per role, same frame, no app restart",
        "`adb shell cmd uimode night no` flips the same 8 of 8 sampled roles back to their light values (chroma delta > 0.05 per role on the reverse comparison)",
        "a light/dark capture pair (2 PNGs, 8 roles sampled per capture) under design/goldens/mobile-android/sprint-02/",
        "a light/dark capture pair (2 PNGs, 8 roles sampled per capture) under design/goldens/web-desktop/sprint-02/"
       ],
       "must_not_observe": [
        "a surface retaining a light background or border",
        "a flip that lands only after navigation",
        "0 capture pairs"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** the gallery cold on Pixel_7_API_34 and the served web export in Chrome **WHEN** `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/core-happy-path` runs light, executes `adb shell cmd uimode night yes`, runs dark, and flips back **THEN** every surface sampled from the scheme strip flips dark in the same frame with nothing retaining a light background or border, and light/dark capture pairs are written under design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "primary": true,
   "flow_ref": "UC-FOUND-02/edge-runtime-appearance-change-mid-stream",
   "test_file": "tests/sprint-02/dark-flip.test.sh",
   "test_function": "UC-FOUND-02/edge-runtime-appearance-change-mid-stream",
   "verify": "bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream",
   "test_tier": "e2e",
   "verification_service": "the Pixel_7_API_34 emulator driven by adb uimode mid-token, with Metro streaming the committed UIMessageStream fixture and Maestro sampling the scheme strip and the streaming bubble",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "the Pixel_7_API_34 emulator driven by adb uimode mid-token, with Metro streaming the committed UIMessageStream fixture and Maestro sampling the scheme strip and the streaming bubble",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the flip is performed after the stream ends rather than mid-token, so the mid-stream remount path is never exercised — the continuity assertion would pass against a static completed transcript",
      "the stream restarts on appearance change and the assertion samples a fresh bubble, passing for the wrong reason — a restarted stream is a mock of continuity; the token count would reset toward 0 instead of strictly increasing",
      "the driver never taps `gallery-stream-replay` and samples only static chrome — 0 tokens appending, proving nothing about streaming"
     ]
    },
    "evidence": {
     "artifact_type": "screenshot",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "streaming_replay_active",
      "action": {
       "actor": "device_user",
       "steps": [
        "run `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream` from the repository root",
        "let it tap `gallery-stream-replay`, wait for visibly appending text, then execute `adb shell cmd uimode night yes` mid-token",
        "read the stream-continuity assertion, then the `cmd uimode night no` mid-stream pass"
       ]
      },
      "end_state": {
       "must_observe": [
        "token count strictly increasing across 3 consecutive samples taken 500ms apart during the flip window, while the 8 of 8 sampled scheme-strip roles changed value (chroma delta > 0.05 per role)",
        "the scroll pin held — contentOffset delta < 1px across the flip window, per the committed capture-pair contract: both captures of the mid-stream pair frame the same screen position (strip + last bubble in frame)",
        "`cmd uimode night no` mid-stream: token count strictly increasing across 3 further consecutive samples 500ms apart and the same 8 of 8 sampled roles return to their light values (chroma delta > 0.05 per role)"
       ],
       "must_not_observe": [
        "a stream restart or interruption",
        "a dropped scroll pin",
        "a surface flipping only after the stream ended",
        "0 tokens appended across the 3-sample flip window (the empty start signature — a stalled or stubbed replay)"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** the conversation item's stream replay active on the emulator **WHEN** `bash tests/sprint-02/dark-flip.test.sh UC-FOUND-02/edge-runtime-appearance-change-mid-stream` taps `gallery-stream-replay` and flips uimode to night mid-token **THEN** every surface flips dark in the same frame WHILE the stream keeps appending tokens with no interruption, restart or dropped scroll pin, and flipping back to light mid-stream holds the same",
   "maps_to_ac": null
  },
  {
   "id": "AC-6",
   "primary": false,
   "flow_ref": "UC-REG-02/core-happy-path",
   "test_file": "tests/sprint-02/gallery-install.test.sh",
   "test_function": "UC-REG-02/core-happy-path",
   "verify": "bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path",
   "test_tier": "e2e",
   "verification_service": "the real Android emulator, Metro, Maestro, and the exported web build",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "the real Android emulator, Metro, Maestro, and the exported web build",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the deep-link check requests / instead of /gallery, passing while the route 404s on a real deep link — a stub answer from a dev server rather than the served static export would also return 200 without proving the export",
      "the export error is swallowed (no `set -euo pipefail`) and a half-built dist is served green — an empty dist with 0 emitted routes would answer 200 on / while /gallery 404s",
      "the served status is asserted with a retry loop until it turns 200, masking a routing defect — a retry loop is a mock of readiness; the single curl must see `200` on the first request"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "installed_56_tree",
      "action": {
       "actor": "developer",
       "steps": [
        "run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --web-only` from the repository root",
        "read the final line and the exit code"
       ]
      },
      "end_state": {
       "must_observe": [
        "`web export serves /gallery: 200` — the script's final line, curl reporting HTTP status `200` from the served static export",
        "exit code 0"
       ],
       "must_not_observe": [
        "404",
        "500",
        "Export encountered an error",
        "an empty response body (0 bytes) at /gallery"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** the 56-item tree **WHEN** `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --web-only` runs **THEN** the script exports apps/example for web into a temp directory, serves it, requests /gallery, and finishes with the line `web export serves /gallery: 200` and exit 0",
   "maps_to_ac": null
  },
  {
   "id": "AC-7",
   "primary": false,
   "flow_ref": "UC-REG-04/core-happy-path",
   "test_file": "tests/sprint-02/gallery-walk.test.sh",
   "test_function": "UC-REG-04/core-happy-path",
   "verify": "bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path",
   "test_tier": "e2e",
   "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the negative control is inverted wrongly — a Maestro PASS on the removed manifest is accepted, and a walk that asserts nothing prints green; an empty generated yaml (0 sections) would run 0 assertions and still print `Flow Passed`",
      "a RED log is hand-written rather than captured from a real failing run of the same locked command — manufactured evidence; a mocked or empty log must fail the `test -s` audit of the 5 locked paths",
      "a retry wrapper retries a flaky assertion (an emulator disconnect mid-run) into green, which the flake policy forbids — the lane must configure 0 retries"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "manifest_removed",
      "action": {
       "actor": "developer",
       "steps": [
        "run `mv apps/example/gallery/manifest.json apps/example/gallery/manifest.json.bak`",
        "re-run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` and read the failure line and exit code",
        "run `mv apps/example/gallery/manifest.json.bak apps/example/gallery/manifest.json` and re-run the same command",
        "grep the three scripts for `set -euo pipefail`, `|| true`, and retry flags; test -s each locked RED.log"
       ]
      },
      "end_state": {
       "must_observe": [
        "`Assertion is false: id: gallery-counter is visible` with the manifest removed (or the route erroring before any assertion) and the script exiting non-zero — 1 or more Maestro failures where failure is required",
        "`Flow Passed` restored after `mv apps/example/gallery/manifest.json.bak apps/example/gallery/manifest.json`, final line `56 items x 4 states asserted (android)` again — all 224 sections re-asserted",
        "`set -euo pipefail` present in all 3 scripts (grep -c prints 1 per script), 0 occurrences of `|| true` (the grep exits 1), 0 retries configured",
        "non-empty (size > 0 bytes) RED logs at the 5 locked red_proof paths — design/goldens/sprint-02/install/core-happy-path.RED.log, design/goldens/sprint-02/gallery/walk-matrix.RED.log, design/goldens/sprint-02/gallery/portal-trap.RED.log, design/goldens/sprint-02/dark/flip-pairs.RED.log, design/goldens/sprint-02/dark/midstream-flip.RED.log — each ending in a non-zero exit from a real failing run"
       ],
       "must_not_observe": [
        "a Maestro pass accepted where failure is required",
        "an empty (0-byte) or hand-written RED log at any of the 5 locked paths",
        "retry wrappers around any maestro invocation"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** the lane's three scripts and the gallery manifest **WHEN** lane discipline is audited and the manifest-removal negative control runs (`mv apps/example/gallery/manifest.json apps/example/gallery/manifest.json.bak`, re-run the walk) **THEN** every script carries `set -euo pipefail` with zero `|| true` and zero retries, the walk FAILS on the counter (Maestro printing `Assertion is false: id: gallery-counter is visible` or the route erroring before any assertion), the script exits NON-ZERO if that negative control ever passes, and each flow's RED log at its locked red_proof path is non-empty and captured from a real failing run",
   "maps_to_ac": null
  },
  {
   "id": "AC-8",
   "primary": false,
   "flow_ref": "UC-REG-04/core-happy-path",
   "test_file": "tests/sprint-02/gallery-walk.test.sh",
   "test_function": "UC-REG-04/core-happy-path",
   "verify": "bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path",
   "test_tier": "e2e",
   "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "e2e",
    "verification_service": "real Android emulator, Metro, Maestro, and the exported web build",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "`clearState` is false or omitted, so the second run passes on a resumed process and proves nothing about a cold boot of the 224-assertion walk — a warm resume answering from run 1's state is a stale mock of cold state",
      "the force-quit step is skipped and the second run is a warm reload — resumed static state from run 1 would answer for run 2",
      "a retry wrapper absorbs a cold-launch timing failure or a Metro disconnect instead of exposing it — the lane must configure 0 retries"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "installed_56_tree",
      "action": {
       "actor": "developer",
       "steps": [
        "force-quit the app from the Android launcher, leaving Metro running",
        "run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` a second time",
        "read Maestro's launchApp output and the verdict"
       ]
      },
      "end_state": {
       "must_observe": [
        "`Flow Passed` on the second consecutive run, final line `56 items x 4 states asserted (android)` — all 224 state sections asserted cold again",
        "`clearState: true` inside the launchApp block of the generated .maestro/gallery-walk.yaml (grep -c 'clearState: true' prints >= 1)",
        "0 retries configured — no retry wrapper around the maestro invocation (grep for retry flags prints 0)"
       ],
       "must_not_observe": [
        "a pass explained by a warm resume",
        "clearState: false in the generated flow",
        "0 runs after the force-quit"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "**GIVEN** a passing walk with Metro left running **WHEN** the app is force-quit from the Android launcher and the walk command is run a second time **THEN** it passes again from a cleared cold launch (clearState: true under launchApp, 0 retries), not a warm resume",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_case",
   "description": "gallery-install.test.sh's default mode exits 0 printing `56/56 gallery items present`, the resolved react-native-webview `13.16.1`, and `dev-client modules in graph: none`",
   "maps_to_ac": "AC-1",
   "verify": null
  },
  {
   "id": "TC-2",
   "type": "test_case",
   "description": "gallery-walk.test.sh generates .maestro/gallery-walk.yaml from apps/example/gallery/manifest.json covering 56 items x 4 states with id-only selectors and finishes with `56 items x 4 states asserted (android)` plus the gallery-matrix.png capture",
   "maps_to_ac": "AC-2",
   "verify": null
  },
  {
   "id": "TC-3",
   "type": "test_case",
   "description": "the --break-portal trap makes the device leg fail on `context-popover-content` while the web leg stays green, prints `device-only failure demonstrated`, and the restored layout re-passes the core walk",
   "maps_to_ac": "AC-3",
   "verify": null
  },
  {
   "id": "TC-4",
   "type": "test_case",
   "description": "dark-flip.test.sh produces same-frame light/dark flips on Android (adb uimode) and web (prefers-color-scheme) with capture pairs under design/goldens/mobile-android/sprint-02/ and design/goldens/web-desktop/sprint-02/",
   "maps_to_ac": "AC-4",
   "verify": null
  },
  {
   "id": "TC-5",
   "type": "test_case",
   "description": "the mid-stream id taps gallery-stream-replay, flips uimode night yes/no mid-token, and asserts the stream continued while every surface flipped in the same frame",
   "maps_to_ac": "AC-5",
   "verify": null
  },
  {
   "id": "TC-6",
   "type": "test_case",
   "description": "--web-only mode exports, serves and requests /gallery finishing with `web export serves /gallery: 200` and exit 0",
   "maps_to_ac": "AC-6",
   "verify": null
  },
  {
   "id": "TC-7",
   "type": "test_case",
   "description": "with the manifest moved aside the walk fails on `gallery-counter`, a pass there exits the script non-zero, and every RED log at its locked red_proof path is a captured real failure",
   "maps_to_ac": "AC-7",
   "verify": null
  },
  {
   "id": "TC-8",
   "type": "test_case",
   "description": "after a force-quit the walk passes a second consecutive cold run under clearState: true with 0 retries",
   "maps_to_ac": "AC-8",
   "verify": null
  }
 ]
}
-->
