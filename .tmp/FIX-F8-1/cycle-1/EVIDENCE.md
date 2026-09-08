# FIX-F8-1 evidence — cycle 1: the context chip's popover renders on-device

Defect: `Render Error: Context components must be used within Context` when the
context trigger is tapped. Root cause confirmed in code before coding: the
`@rn-primitives/portal` transport stores portalled ELEMENTS in a zustand store and
`PortalHost` (root `_layout.tsx`, an ancestor of the screen) renders them, so
`ContextContext.Provider` inside `<Context>` never reached the portalled
`ContextContentHeader/Body/Footer` (`useContextValue()` throws at context.tsx:80).
Fix (commit 6dfa096): `ContextContent` reads the value at composition time and
re-provides it around the portalled children — the `@rn-primitives/popover`
`Portal` RootContext precedent (popover.js:148).

## Devices

- iOS: iPhone 17 Pro simulator, UDID `9677B8E8-CD67-4561-89DF-17BFD99309CC`, iOS 26.3.
  App binary from `npx expo run:ios` in THIS worktree (`ios-build.log` at cycle root,
  build + `iOS Bundled` serving this worktree's source).
- Android: emulator-5556 (Pixel, API 34), already attached from the TASK-F8 lane; its
  dev client pointed at the same localhost:8081 Metro (this worktree's).

## Harness fidelity

- The locked flow is the UNEDITED TASK-F8 copy: `cold-boot.yaml` (verified identical to
  `TASK-F8/.maestro/cold-boot.yaml`). Never mutated.
- Maestro 2.5.1 (pinned). Runs pin the device (`--device`/`--udid 9677B8E8-...`).
- CAUTION recorded for reviewers: three early runs (01–03 red, 02/04 green-era) were
  launched WITHOUT a device flag; maestro auto-attached emulator-5556, so their
  platform is ANDROID (each run's maestro debug dir records
  `MAESTRO_DEVICE_UDID=emulator-5556`). The later runs pin the iOS simulator by UDID.
- `SCREENSHOT_PATH` for the locked flow's golden step must be passed via `-e`
  (maestro flow env), not a shell env var — the first passing Android locked run wrote
  its golden capture to `undefined.png` in the worktree root (recovered and renamed to
  `green/06-green-android-popover-open-first-capture.png`); the capture-aid runs pass
  it correctly via `-e`.

## Known iOS blocker (pre-existing, FIX-F5-1 cycle-2 B2 — not touched here)

Bare-text `assertVisible: "Completed"` deterministically fails on iOS: the tool
badge's `accessibilityLabel` container absorbs the text node, so no standalone
"Completed" element exists for Maestro. This stops the LOCKED flow on iOS BEFORE the
context pair (verified twice here: `red/06`, `red/08`; documented in FIX-F5-1's
IOS-EVIDENCE.md). The locked flow stays unweakened. To exercise the context ids on
iOS we run `context-portal-ios-probe.yaml` (this dir) — the locked flow's boot
semantics (clearState launch, openLink, springboard tap, canary-first) and id-based
asserts, dropping ONLY bare-text steps. This mirrors FIX-F5-1's probe-flow precedent.

## RED (pre-fix installed copy — the original v0.1.0 item)

- `red/01-red-flow.log` — locked cold-boot flow, ANDROID (auto-attached): every
  pre-context step COMPLETED, `Tap on id: context-trigger... COMPLETED`,
  `Assert that id: context-popover-content is visible... FAILED` (exit 1).
- `red/02-red-on-screen-state.png` — iOS simulator state during the red window (idle;
  iOS was not yet being driven by maestro at this point).
- `red/03-red-maestro-failure-artifact.png` + `04-red-maestro-runner.log` — maestro
  artifacts of the Android red run.
- `red/05-red-cli-reinstall-OLD-from-real-github-tag.log` — the REAL pinned-URL add
  (`https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/...`) —
  exit 0; installed copy verified to NOT contain the re-provide (RED state is the
  genuine original-tag content, fetched over the real network).
- `red/06-red-ios-flow.log` + `07-red-ios-on-screen-state.png` — locked flow on iOS
  (UDID-pinned): stops at the B2 "Completed" step (documented above), not at context.
- `red/08-red-ios-flow-retry.log` + `09-red-ios-crash-state.png` — same B2 stop,
  reproduced (deterministic, not a flake).
- `red/10-red-ios-probe.log` — **iOS context probe (UDID-pinned), pre-fix copy**:
  canary and all id asserts COMPLETED, `Tap on id: context-trigger... COMPLETED`,
  `context-popover-content... FAILED`; Metro device log recorded
  `ERROR [Error: Context components must be used within Context]` at tap time.
- `red/11-red-ios-maestro-failure-artifact.png` — **the crash on screen, iOS**:
  LogBox "Render Error: Context components must be used within Context",
  `context.tsx (80:28)` throw site, component stack `<ContextContentHeader />`
  (context.tsx:148) — the exact diagnosed mechanism, captured on the simulator.
- `red/12-red-ios-maestro-runner.log` — maestro runner log for the iOS red probe.

## GREEN (fixed item installed through the real CLI)

- `green/01-cli-readd-install.log` — first re-add of the FIXED item (loopback-served
  pinned-path URL, see provenance note): exit 0, `Created 2 files`
  (components/ai/context.tsx + context.logic.ts), 7 peers skipped untouched.
- `green/02-green-flow.log` + `03-green-failed-state.png` — HONEST intermediate
  failure: first green attempt after the reinstall still failed — Metro served the
  stale cached bundle (its log showed a 1-module invalidation that the dev client
  never picked up). Resolved by restarting Metro with `--clear`; recorded because the
  sprint flake policy forbids retrying into green without understanding.
- `green/04-green-flow-retry.log` — **locked cold-boot flow, ANDROID (auto-attached),
  full PASS (exit 0)** including `Tap on id: context-trigger... COMPLETED` and
  `Assert that id: context-popover-content is visible... COMPLETED`. 0 errors in the
  Metro log for the whole run.
- `green/05-green-on-screen-state.png` — iOS simulator after that passing Android run.
- `green/06-green-android-capture.log` + `06-green-android-popover-open-first-capture.png`
  and `07-green-android-capture.log` + `07-green-android-popover-open.png` — capture-aid
  (`capture-popover.yaml` in this dir; NOT the locked flow) on the Android emulator:
  popover visually open — header "0%", mono "0 / 0", progress bar, footer
  "Total cost —" anchored above the context chip.
- `green/08-green-cli-reinstall-FIXED-via-loopback.log` — the re-add used for the
  final iOS green state (same loopback pinned-path URL, exit 0, 2 created / 7 skipped).
- `green/09-green-ios-probe.log` + `09-green-ios-context-probe.png` — **iOS context
  probe (UDID-pinned), fixed copy: FULL PASS (exit 0)** — `Tap on id: context-trigger...
  COMPLETED`, `Assert that id: context-popover-content is visible... COMPLETED`, and
  the screenshot shows the popover PAINTED through the root PortalHost on the iPhone
  17 Pro (header percent + mono ratio + progress bar, footer "Total cost —"), 0 errors
  in Metro.

## Install provenance (the CLI+URL requirement)

The task's literal mechanism — re-add via the pinned URL and have it fetch the
re-cut tag's item — cannot resolve over the real network until the orchestrator
force-pushes the moved tag (verified: `git ls-remote origin refs/tags/v0.1.0` still
returns the original tag object c635b07, and curl of the real URL returns content
without the fix). Pushing is forbidden to this task. The reinstall therefore fetched
the SAME pinned path from a loopback server that serves THIS worktree — byte-identical
to what `raw.githubusercontent.com/.../v0.1.0/...` will serve once the tag is pushed
(worktree `public/r` is clean at the tag's commit; emitter idempotence verified by
hash). The fetch was a genuine network fetch through the real
`npx @react-native-reusables/cli@latest add <url>` (which shells to
`pnpm dlx shadcn add <url>`), with the OLD-item control installed first from the REAL
github URL (red/05) proving the CLI/network path discriminates: pre-fix bytes when
fetched from GitHub's original tag, fixed bytes when fetched from the local tag tree.

Verification of installed bytes: `apps/example/components/ai/context.tsx` is
byte-identical to `public/r/uniwind/context.json`'s emitted content (after the
registry→consumer alias mapping) and contains the re-provide. Peers untouched
(git status shows only context.tsx modified; context.logic.ts byte-equal to HEAD).
Note: the CLI's write step strips the leading doc-comment block of context.logic.ts —
pre-existing behavior, identical in TASK-F3's original install (the file is
byte-identical to the pre-existing installed copy), cosmetic, not in scope.
