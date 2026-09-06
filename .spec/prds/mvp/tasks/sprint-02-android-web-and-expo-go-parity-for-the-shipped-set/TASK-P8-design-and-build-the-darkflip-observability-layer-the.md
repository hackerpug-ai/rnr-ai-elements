# TASK-P8: Design and build the dark-flip observability layer: the scheme strip in the gallery chrome and the mid-stream flip surface


> Task ID: TASK-P8  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `frontend-designer`  
> Points: 3  
> Type: DESIGN  
> Wave: A  
> Status: ⬜ Pending  
> Proposed By: `frontend-designer`  
> Depends On: none  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

A committed apps/example/components/gallery/scheme-strip.tsx — a compact labeled swatch row displaying exactly the existing theme roles with testIDs gallery-swatch-<role> — plus the written spec for the mid-stream flip surface and the light/dark capture-pair definition under design/goldens/sprint-02/, giving sprint-02's three first-ever dark-flip observations something precise to look at.

## Critical Constraints

- MUST: Zero new tokens: every fill comes from an existing role class (bg-background, bg-card, bg-muted, bg-primary, bg-secondary, bg-destructive, border-border, bg-foreground) so the strip renders correctly in ANY consumer theme and flips with the scheme for free
- MUST: Every swatch is labeled with its role name in text-xs and carries testID gallery-swatch-<role> — the label makes the strip human-observable, the testID makes it machine-samplable (ceded to TASK-P13)
- MUST: The bg-foreground swatch labels itself in text-background (and the bg-background family in text-foreground) so both extremes stay legible in both schemes
- MUST: The mid-stream flip surface keeps the shimmer actively pulsing when the flip lands — a rest-frame capture proves nothing
- MUST: The capture-pair definition fixes same-screen/same-frame-position as the rule: light and dark captures must be diffable pixel-for-pixel
- Never add an in-app scheme toggle anywhere in the gallery — the flip is OS-level only on every leg (adb uimode, Chrome DevTools prefers-color-scheme emulation, iOS Settings); UC-FOUND-02 AC-3 bans library-local scheme state and a toggle would prove the flip THROUGH the scheme mechanism, not BY it
- Never sample or assert pixels from this task — pixel-sampling of the strip is ceded entirely to TASK-P13
- Never write engine-specific code — no uniwind/nativewind imports, no cssInterop; role classes only
- Never let the strip become navigation or a control — it is an instrument, not a widget
- Strictly rounded-md tiles with text-xs role labels — the strip reads as gallery chrome, not a component demo
- Strictly one file: the strip, its spec comments, and the capture-pair definition documented in this task's committed design notes — P2 owns mounting and replay state

## Specification

**Objective:** Three deliverables. (1) scheme-strip.tsx: a compact horizontal row of labeled swatches pinned in the gallery chrome (visible on the index and every item screen, all three legs), each swatch a rounded-md tile filled by one role class — bg-background, bg-foreground (label in text-background so it stays legible), bg-card, bg-muted, bg-primary, bg-secondary, bg-destructive, border-border (a bordered tile) — with the role name in text-xs, testID gallery-swatch-<role>. The strip declares ZERO new tokens: it displays roles the consumer theme already carries, so it tracks any consumer theme edit for free. (2) The mid-stream flip surface spec: the conversation item's Populated panel replays the committed TASK-P5 fixture with the last bubble appending token-by-token under the house shimmer pulse (Shimmer from the registry), driven by P2's replay control id gallery-stream-replay — the panel is the flip target because it holds every role at once while animating. (3) The capture-pair definition: for each flip observation, two captures of the SAME screen at the SAME frame position (same scroll offset, last bubble in frame, strip in frame) — light (uimode night no / prefers-color-scheme no-preference / iOS Light) and dark (night yes / dark / Dark) — committed under design/goldens/sprint-02/ with Android matrix pairs under design/goldens/mobile-android/sprint-02/. The flip is OS-level only on every leg: adb uimode on Android, Chrome DevTools rendering emulation on web, iOS Settings on device.

**Success state:** On any leg, a stranger (or TASK-P13's sampler) flips the OS scheme and every one of the eight labeled swatches changes fill in the same frame with no app restart and no in-app control touched; the committed capture-pair definition makes light/dark evidence comparable pixel-for-pixel because both frames are the same screen position.

## Verification Checklist

| Command | Expect |
|---|---|
| `node -e "const s=require('fs').readFileSync('apps/example/components/gallery/scheme-strip.tsx','utf8');const roles=['background','foreground','card','muted','primary','secondary','destructive','border'];const miss=roles.filter(r=>!s.includes(r));console.log(miss.length?'missing: '+miss.join(','):'8 roles present')"` | 8 roles present — the strip's roster is exactly background, foreground, card, muted, primary, secondary, destructive, border, no more, no fewer |
| `grep -c 'gallery-swatch-' apps/example/components/gallery/scheme-strip.tsx` | at least 1 — the testID prefix gallery-swatch-<role> P13's sampler addresses |
| `grep -c -- '--color-' apps/example/components/gallery/scheme-strip.tsx` | 0 — the strip declares zero new tokens; it displays existing roles by class only, so it tracks the consumer theme's 26 --color-* pairs without ever naming one |
| `grep -ciE 'useState|toggle|switch' apps/example/components/gallery/scheme-strip.tsx` | 0 — a purely presentational strip: no state, no toggle, no library-local scheme mechanism (UC-FOUND-02 AC-3) |
| `pnpm exec tsc --noEmit -p apps/example` | 0 errors |

## Reading List

- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (full) — Gate steps 8, 9 and 17 — the three first-ever flip observations (Android, mid-stream Android, web) the strip exists to make observable; note 'the labeled scheme strip at the gallery header' is already in step 8's expected surfaces
- `apps/harness/src/global.css` (full) — The 26 --color-* light/dark declaration pairs — the exact role set the strip displays and the proof that light/dark pairs differ enough to be pixel-distinguishable
- `apps/harness/src/stories/Molecules.stories.tsx` (full) — The house Shimmer pulse (`Thinking through the approach…`) — the animation the mid-stream surface replays under while the flip lands
- `.spec/prds/mvp/07-uc-found.md` (full) — UC-FOUND-02 AC-1..AC-3 — same-frame flip, no retained light surface, and the ban on library-local scheme state that forbids an in-app toggle
- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F7-declare-and-record-the-consumer-theme-obligation-the-install.md` (full) — Sprint-01's chroma>0.05/hue-window sub-bounds sampling technique — the precedent P13 reuses against the strip

## Guardrails

**WRITE-ALLOWED**
- `apps/example/components/gallery/scheme-strip.tsx (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `apps/example/components/ai/**`
- `apps/example/components/ui/**`
- `apps/example/global.css`
- `apps/example/app/**`
- `tests/sprint-02/**`
- `.maestro/**`
- `design/goldens/**`

## Design

**References:** `apps/harness/src/global.css — the role roster and its light/dark value pairs the swatches render`; `apps/harness/src/stories/Atoms.stories.tsx (EmptyState) — the rounded-md border-border framed composition: surfaces built from role classes with zero inline colors`; `apps/harness/src/stories/Molecules.stories.tsx — Shimmer: the pulse the mid-stream target animates under`
**Pattern:** Rounded token frame with class-literal composition — `<View className="h-80 rounded-md border border-border">` composes a surface from role classes only, no inline colors, no values
**Pattern source:** `apps/harness/src/stories/Atoms.stories.tsx (EmptyState composition)`
**Anti-pattern:** An in-app light/dark toggle button in the gallery chrome — it would smuggle library-local scheme state (UC-FOUND-02 AC-3 violation) and every flip it produced would prove the toggle, not the scheme mechanism the PRD demands
- Tile anatomy: rounded-md, equal flex tiles in one compact horizontal row, swatch fill = the role class, role name in text-xs text-muted-foreground beside/below it — the strip must fit phone width without scrolling (8 tiles, abbreviated role names as-is: background, foreground, card, muted, primary, secondary, destructive, border)
- bg-foreground is the trap swatch: its label must be text-background or it disappears in one scheme; same logic keeps bg-primary/bg-secondary/bg-destructive labels legible via their *-foreground partners
- border-border renders as a bg-background tile with a border-border border — the only way a border token's flip is pixel-visible
- Mid-stream surface: Populated conversation panel replaying the TASK-F5 fixture, last bubble appending under the shimmer; the shimmer must be mid-pulse at flip time, which is why P2's Loading dwell and P13's sampling cadence both anchor to ≥2s
- Capture-pair rule: same screen, same scroll position, strip + last bubble both in frame; one capture per scheme per leg; pairs land in design/goldens/sprint-02/ (and mobile-android/sprint-02/ for the Android matrix) so light/dark diffs are positionally comparable

## Boundary Contracts

- CEDED to TASK-P13: all pixel-sampling of gallery-swatch-<role> (before/after flip, per-role change assertions, mid-pulse shimmer sampling) — the same technique as sprint-01's badge chroma at sub-bounds
- CEDED to TASK-P2: mounting the strip in the gallery chrome on all screens/legs, and the replay state machine behind id gallery-stream-replay (state wiring is not this task's)
- CONSUMES from sprint-01 (TASK-F1/F7): apps/example/global.css's role pairs and palette slice — the strip displays them and must not modify them
- ACCEPTED boundary: design/goldens/sprint-02/ capture pairs are TAKEN by TASK-P3 (first Android pairs) and TASK-P13 (matrix/mid-stream pairs) per this task's definition; this task writes the definition, not the PNGs

## Dependencies

- **Depends on:** none
- **Blocks:** TASK-P2 (mounts the strip; builds the gallery-stream-replay surface to this spec), TASK-P3 (takes the first Android dark-flip capture pairs against this definition), TASK-P4 (web flip observation needs the strip in frame), TASK-P13 (samples gallery-swatch-<role> before/after every flip)
- **Human test hook:** swatch strip flips with scheme

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P8",
 "task_type": "DESIGN",
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
