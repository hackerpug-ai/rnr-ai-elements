# TASK-P3: Android second pass over the shipped set: gesture-bar insets, predictive back, keyboard avoidance, press/ripple states, first Android dark flip


> Task ID: TASK-P3  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 5  
> Type: INFRA  
> Wave: D  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-P2  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

The shipped set is correct and dark-capable on Android for the first time, with every defect fixed at universal source and the capture pairs to prove it.

## Critical Constraints

- MUST: Fix every Android defect at universal source (packages/registry/src/components/**), run `pnpm registry:build`, and re-install through the CLI so the consumer tree matches the emitted registry
- MUST: Capture light AND dark pairs for every surfaced screen under design/goldens/mobile-android/sprint-02/ — the first Android pixels this repo has ever committed
- MUST: Verify the flip with `adb shell "cmd uimode night yes"` and expect EVERY visible surface (header, card chrome, badges, empty atom, code block, scheme strip) to flip in the same frame
- NEVER hand-edit apps/example/components/ai/** or apps/example/components/ui/** — a hand-patched consumer file forks the tree from the registry and hides the defect from every other consumer
- NEVER fake an inset with a hardcoded dp value; read it from the safe-area provider
- NEVER accept an Android pass reasoned from iOS evidence — Android is verified as its own platform
- STRICTLY preserve the sprint-01 id contract: any new touchable gets press/active twins without changing existing e2e ids

## Specification

**Objective:** Make the full shipped set genuinely Android-native on Pixel_7_API_34: insets honored under edge-to-edge, back gesture correct, keyboard avoided, touch feedback real, and dark mode actually dark — with defects fixed where they live, in the universal registry source.

**Success state:** On the emulator: conversation, sheet and composer clear the gesture bar and status bar; back from any item returns to the index in one press with scroll preserved; the keyboard never covers the composer; every touchable shows press/ripple/active; `cmd uimode night yes` flips every surface in the same frame; and light/dark capture pairs exist under design/goldens/mobile-android/sprint-02/.

## Verification Checklist

| Command | Expect |
|---|---|
| `cd apps/example && npx expo run:android` | the app builds and launches on Pixel_7_API_34 with no red screen and no `Unable to resolve module` line |
| `adb shell "cmd uimode night yes"` | with the conversation screen open, EVERY visible surface flips dark in the same frame — nothing retains a light background, border or text |
| `adb shell "cmd uimode night no"` | the same surfaces flip back to light together in the same frame |
| `adb shell input keyevent 4` | with an item detail screen open, ONE back press returns to the gallery index with the previous scroll position preserved |
| `ls design/goldens/mobile-android/sprint-02/` | light/dark capture pairs (at least 2 png) — the directory was newly created by this task |
| `pnpm registry:build` | exit 0 — both engine trees rebuilt from the fixed universal source |
| `pnpm exec vitest run tests/build-registry.test.ts` | passes — public/r is fresh against packages/registry/src, no stale emission |
| `cd apps/example && npx expo-doctor` | exit 0 — the re-install introduced no pin drift |

## Reading List

- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (64-71) — gate steps 2, 4, 8, 9: the first full-set Android resolve, the one-press back with scroll preserved, and the two uimode flips including mid-stream
- `AGENTS.md` (60-63) — 'Android | Required | Must ship simultaneously; keyboard/inset behavior differs from iOS'
- `design/manifest.json` (full) — the mobile-android gate keys that are boilerplate 'pending' today — this task is what fills them
- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F8-stand-up-maestro-with-a-cold-boot-flow-on-both-platforms-and.md` (236-298) — the sprint-01 Android-leg discipline: Android is new ground, budget for genuine platform divergence, never treat an Android failure as a flow bug
- `scripts/check-registry-fresh.ts` (full) — the freshness check that keeps public/r and the universal source honest through the fix-rebuild-reinstall loop

## Guardrails

**WRITE-ALLOWED**
- `packages/registry/src/components/** (MODIFY)`
- `public/r/** (MODIFY)`
- `apps/example/components/ai/** (MODIFY)`
- `apps/example/components/ui/** (MODIFY)`
- `apps/example/app/** (MODIFY)`
- `design/goldens/mobile-android/sprint-02/** (NEW)`

**WRITE-PROHIBITED**
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `tests/**`
- `.maestro/**`
- `design/goldens/mobile-ios/**`
- `design/goldens/web-desktop/**`
- `packages/registry/registry.json`

## Design

**References:** gate step 4 (back gesture, one press, scroll preserved) and step 8 (the first Android dark flip, every surface, same frame); TASK-P8's scheme strip — the labeled sampling target the flip evidence reads from
**Design-lens references:** SPRINT.md gate steps 4, 8, 9 (back gesture, first Android flips, mid-stream); apps/harness/src/stories/Atoms.stories.tsx (ItemRows — active: state and 44pt hitSlop); apps/harness/src/stories/Atoms.stories.tsx (SheetBottom — bottom sheet composition the model-selector sheet follows); TASK-P8's capture-pair definition (same screen, same frame position, light+dark)
**Pattern:** the sprint-01 fix loop: find the defect on device, fix it in packages/registry/src, `pnpm registry:build`, re-install via the CLI, re-verify on device — the consumer tree always equals the emitted registry
**Pattern source:** `AGENTS.md 'registry:build (CI job: registry — fails if stale)' + scripts/check-registry-fresh.ts`
**Anti-pattern:** patching apps/example/components/ai/** by hand to make one screen pass — it forks the consumer from the registry and every other consumer inherits the bug
- Android 14+ edge-to-edge silently puts the composer under the gesture bar with no error — insets are read from the provider and applied per-surface (conversation, sheet, composer)
- Press states: every touchable gets the ripple/active twin; a control with no visible press on Android is a defect at universal source, not an app patch
- Capture light AND dark even where the gate only asserts one — sprint-03's keyboard work needs the baseline
- Insets: every gallery surface honors react-native-safe-area-context edges; the model-selector bottom sheet clears the gesture bar with inset-derived padding — never a hard-coded pixel margin that breaks on 3-button navigation
- Predictive back: the back gesture's peek must reveal the gallery index with scroll position preserved — one press returns, so detail screens must not stack intermediate routes; the in-place panel swap from TASK-P2's design contract is what makes this true
- Press states: rows and controls get an android_ripple (or useForeground) with an active: tint twin — touch-only users must see press feedback without any hover class; ripple color from a role (bg-accent family), never a raw hex
- First Android dark flip capture pairs: same screen, same frame position, strip in frame — light via `adb shell "cmd uimode night no"`, dark via `night yes`, committed under design/goldens/mobile-android/sprint-02/ (gallery-matrix.png per gate step 6) plus the design/goldens/sprint-02/ pair set per TASK-P8's definition
- **Design-lens anti-pattern:** Chasing the Android gesture bar with a bare bottom margin — inset-driven padding only; a bare value is wrong on one of gesture-nav vs 3-button nav and invisible until it strands a control under the bar

## Boundary Contracts

- defects are fixed in packages/registry/src/components/**, rebuilt with pnpm registry:build, and re-installed via the CLI — apps/example/components/{ai,ui}/** stays byte-identical to what the CLI emits
- insets come from the safe-area provider, never hardcoded bottom padding
- the dark flip is observed via `adb shell cmd uimode night yes/no` with no surface retaining a light background, border or text

## Dependencies

- **Depends on:** TASK-P2
- **Blocks:** TASK-P13
- **Human test hook:** Gate steps 4, 8, 9 (the human half): on the `tool` detail screen perform the back gesture — one press, scroll preserved; on `conversation`, run `adb shell "cmd uimode night yes"` — every surface flips dark in the same frame, `night no` flips back together; focus the composer and raise the keyboard — it never covers the input; press-and-hold any row — a distinct ripple/active tint.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P3",
 "task_type": "INFRA",
 "tdd_mode": "skipped",
 "verification_policy": {
  "requires_tests": false,
  "requires_red_evidence": false,
  "requires_seeded_evidence": false
 },
 "fixtures": {},
 "requirements": []
}
-->
