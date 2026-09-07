# TASK-F8 cycle-1 — BLOCKER: TASK-F5's route renders a COLLAPSED transcript on device

## Status

Every F8 deliverable exists and the parts that can run without a green core arc ran
GREEN (dirty-app journey end-to-end, mutate-theme variant, RED captures, negctl
validation, OKLCH pipeline). The core positive arc — `install-core.test.sh
UC-REG-01/core-happy-path` exiting 0 — is **blocked by a defect in
`apps/example/app/index.tsx` (TASK-F5's file, WRITE-PROHIBITED for TASK-F8)**.

## The defect

`apps/example/app/index.tsx:29` (F5's screen):

```tsx
<SafeAreaView className="flex-1 bg-background" edges={['top']}>
```

`SafeAreaView` is imported from **react-native-safe-area-context** — a third-party
component that **uniwind does not interop**. Uniwind wraps RN *core* components only
(verified: `uniwind/dist/module/components/native/SafeAreaView.js` wraps
`react-native`'s own SafeAreaView). The `className` prop is silently dropped, so
`flex: 1` never applies. The flex column auto-sizes → the Conversation (an inverted
FlatList whose own `flex-1` has no height to fill) collapses to **zero height** →
the seeded transcript, the tool card and the badge never mount.

**Measured** (`hierarchy-ios.json`, maestro hierarchy, iPhone 17 Pro 402×874 pt):

- `app-header` bounds [0,62][402,111]
- `composer-send` bounds [0,111][402,232] — the composer sits directly under the
  header; the FlatList between them has **zero height**
- `transcript-message-0` / `tool-badge-completed`: **absent from the hierarchy**
  (virtualized away)

Same collapse on Android (`probe-android-state.png`). Header text DOES render, so
Maestro's first assert fails with exactly the negative-control literal — which is
why the negctl validation below still passes while the positive arc cannot.

## Verified fix (applied temporarily, reverted, NEVER committed)

`style={{ flex: 1 }}` on the SafeAreaView (plus flex on the header View) → reload →
`diag-fixed-ios.png` shows the full transcript: both bubbles, the tool card with the
GREEN `Completed` badge, composer pinned to the bottom. `git status apps/example/`
is clean — the mutation is reverted.

Suggested fix for TASK-F5's owner (token-correct form at their discretion):
`<SafeAreaView edges={['top']} style={{ flex: 1 }}>` + carry `bg-background` on an
inner interop'd View (or inline style).

## What runs GREEN in this cycle despite the blocker

- `bash tests/sprint-01/install-dirty-app.test.sh journeys/mvp-full-arc--edge-install-into-a-dirty-app`
  → exit 0, `dirty-app.json` written, all three gate-step assertions green
  (`green-dirty/`).
- `install-core.test.sh … --mutate-theme green-600` → exit 1 with the required
  failure line naming the measured chroma and `--color-green-600`; global.css
  restored by the EXIT trap (`mutate-theme-run1.log`).
- Negative control validated end-to-end by hand (`negctl-ios-validation.log`):
  seed moved → identical flow → maestro exit 1 with the exact literal
  `Assertion is false: id: transcript-message-0 is visible` → seed restored.
- AC-6 OKLCH pipeline proven on the diagnostic capture (which HAS the green glyph):
  `oklch-badge.mjs diag-fixed-ios.png` → chroma 0.1647, hue 149.56 (green-600's hue
  is 149.2), 2278 px sampled, sample rect recorded.
- RED captures from real failing runs of the locked commands with a deliberately
  mutated canary id, reverted after capture: `core-happy-path.RED.log`,
  `mvp-install-arc.RED.log`; dirty-app RED via mutated prompt assertion:
  `dirty-app.RED.log`.

## Maestro 2.5.1 version facts (pinned in .maestro/config.yaml)

- Failing assertions print `Assertion is false: <selector> is visible`; Maestro
  2.5.1 never prints the literal `Element not found` line the AC-5 scenario
  expected — the RED logs carry the real failure output instead.
- Maestro cannot see iOS springboard alerts ("Open in …?"), so the flow dismisses
  one defensively by coordinate tap and the script warms the bundle through
  `simctl launch <udid> <bundle> <url>` (launch argument → LaunchServices, no
  dialog).
- `Launch app "ai.hackerpug.rnrexample" with clear state... COMPLETED` is the
  launchApp line reporting clearState (AC-3 evidence, in every flow log).

## Evidence index (this directory)

- `core-run4.log`, `blocker-flow-ios-light.log` — the locked command failing at the
  collapsed-transcript assert with everything else green
- `diag-fixed-ios.png` — the verified one-line fix rendering correctly
- `probe-android-state.png` — the same collapse on the emulator
- `negctl-ios-validation.log` — the inverted negative control behaving as required
- `mutate-theme-run1.log` — AC-6 case 2 variant
- `green-dirty/` — raw logs of the passing dirty-app journey
- `core-happy-path.RED.log` / `mvp-install-arc.RED.log` / `dirty-app.RED.log` are
  committed under `design/goldens/sprint-01/install/`
- `hierarchy-ios.json` — the measured zero-height geometry
