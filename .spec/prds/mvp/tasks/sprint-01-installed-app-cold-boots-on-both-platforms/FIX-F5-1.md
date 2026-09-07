# FIX-F5-1: Give the / route's SafeAreaView a real style so the Conversation renders on-device
> Task ID: FIX-F5-1
> Sprint: [sprint-01](./SPRINT.md)
> Agent: `react-native-ui-implementer`
> Points: 1
> Type: FIX
> Wave: G-fix (follow-up to TASK-F8, cycle 1)
> Status: ✅ Completed
> Proposed By: kb-run-sprint driver (judgment table row: fix belongs to an earlier task's code)
> Depends On: none
> Commit: e013330376ed8d5acd7a5c2a45f9d8f6fde9997d
## Outcome
The / route in apps/example renders its transcript on a real device. Discovered by TASK-F8 (cycle 1): `apps/example/app/index.tsx` wraps the screen in
`<SafeAreaView className="flex-1 bg-background" edges={['top']}>` (react-native-safe-area-context). Uniwind does NOT interop that component, so the
`className` (including `flex-1`) is silently dropped at runtime; the screen's flex column auto-sizes and the Conversation (inverted FlatList) collapses to
zero height. Measured via Maestro hierarchy on iPhone 17 Pro and the Pixel_7_API_34 emulator: `app-header` and `composer-send` crowd the top ~230px,
`transcript-message-0` / `tool-badge-completed` never appear. The F8 implementer verified the fix `style={{ flex: 1 }}` (applied temporarily, then reverted)
makes the transcript and the green tool badge render on-device.
## Critical Constraints
- This file is the TASK-F5 route, WRITE-PROHIBITED for TASK-F8. You own exactly one file: `apps/example/app/index.tsx`.
- The fix must keep the safe-area behavior (`edges={['top']}`) and the background fill. If `className` on this SafeAreaView is not interop'd by uniwind, the
  background color is also dropped — the fix must supply BOTH layout and background through mechanisms that actually reach the native view (a real `style`
  prop, and/or moving the themed background to an interop'd wrapper View under the SafeAreaView). Verify on-device: header reads `AI Elements Example`,
  background is the theme's background color, transcript rows and the tool badge are visible.
- Do NOT edit anything under `apps/example/components/ai/**`, `apps/example/app/_layout.tsx`, or any other file. One file, one commit.
## Verification Checklist
| Command | Expect |
|---|---|
| `grep -n "style={{ flex: 1 }}" apps/example/app/index.tsx` | at least 1 — the SafeAreaView (or an equivalent layout-carrying element) receives a real style, not only className |
| `cd apps/example && npx expo run:ios` then `~/.maestro/bin/maestro test .maestro/cold-boot.yaml` against the booted app | `Flow Passed` — transcript-message-0 and tool-badge-completed resolve on a real iOS simulator (this is TASK-F8's locked flow; run it from the repo root's tests/sprint-01 harness if the flow is invoked that way — at minimum prove the ids resolve on-device via `maestro hierarchy` or the cold-boot flow) |
| `pnpm typecheck && pnpm lint` | both exit 0 |
## Behavior Proven By
TASK-F8 AC-1 (core-happy-path on iOS + Android), AC-3 (cold launch), AC-6 (badge glyph chroma) — the goldens and badge measurement TASK-F8 could not produce.
## Guardrails
**WRITE-ALLOWED**
- `apps/example/app/index.tsx`
**WRITE-PROHIBITED**
- everything else (especially `apps/example/components/**`, `apps/example/app/_layout.tsx`, `.maestro/**`, `tests/sprint-01/**`, `design/goldens/**`)
