# FIX-F5-1 GREEN evidence (post-fix, cycle 1)

## Fix applied (apps/example/app/index.tsx — the task's single WRITE-ALLOWED file)

`<SafeAreaView className="flex-1 bg-background" edges={['top']}>` →
`<SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: THEME[theme ?? 'light'].background }}>`
with `THEME` from `@/lib/theme` (the JS twin of global.css's `--color-background`; same RNR token
source) and `useUniwind()` — the same theme-hook pattern `app/_layout.tsx` already uses. Real `style`
reaches the native view, so uniwind's dropped className no longer matters: flex:1 restores the flex
column and the themed background covers the whole screen including the top safe-area strip (an inner
wrapper View would have left that strip window-colored in dark mode). `edges={['top']}`, all testIDs,
the fixture import, the context chip and every rendered content are untouched.

## Locked flow `.maestro/cold-boot.yaml` (copy in ../) against the fixed source

`core-green.log` (maestro exit 1 — but 10 of 11 steps COMPLETED, reproducible twice):

```
Assert that id: transcript-message-0 is visible... COMPLETED   ← the RED canary, now green
Assert that "AI Elements Example" is visible... COMPLETED
Assert that "Registry item installed." is visible... COMPLETED
Assert that id: app-header is visible... COMPLETED
Assert that id: tool-badge-completed is visible... COMPLETED   ← green badge on device
Assert that "Completed" is visible... COMPLETED
Take screenshot ... COMPLETED                                   → final-run.png
Tap on id: context-trigger... COMPLETED
Assert that id: context-popover-content is visible... FAILED    ← PRE-EXISTING defect, see below
```

`final-run.png` (captured by the flow's own takeScreenshot step): header pinned top, full transcript
(user bubble, searchRegistry tool card with GREEN Completed badge, assistant "Registry item
installed."), composer pinned bottom, theme background filling the screen.

## PRE-EXISTING blocker found (outside this task's write scope): context popover crashes

The flow's last assertion (`context-popover-content`) fails with a LogBox Render Error:
`Context components must be used within Context` (see green-fail-popover.png). Root cause:
`@rn-primitives/portal` transports `children` through a zustand store and renders them at the root
`PortalHost` (in `_layout.tsx`) — a separate React subtree, so `ContextContext` provided by
`<Context>` never reaches the portalled `ContextContentHeader`, whose `useContextValue()` throws
(`components/ai/context.tsx:80`).

Proven PRE-EXISTING: with the FIX STASHED (unfixed source served by Metro), probe-popover.yaml
reproduced the IDENTICAL crash (`red/probe-popover-prefix.log`,
`red/probe-popover-prefix-failscreen.png`); with the fix applied it fails identically. It was never
reachable before this fix because every prior run died at the transcript canary; F1/F5 evidence is
static-only — this assertion has never been green on-device in this sprint.

Fixing it requires editing `apps/example/components/ai/context.tsx` (re-provide the context inside
the portal) or `app/_layout.tsx` / the chip usage in `index.tsx` — ALL WRITE-PROHIBITED for
FIX-F5-1 ("Do not change ... the context chip"; "Do NOT edit anything under
apps/example/components/ai/** or _layout.tsx"). Reported to the orchestrator as a follow-up defect;
this task's named deliverables (transcript-message-0 + tool-badge-completed resolving on-device)
are proven.
