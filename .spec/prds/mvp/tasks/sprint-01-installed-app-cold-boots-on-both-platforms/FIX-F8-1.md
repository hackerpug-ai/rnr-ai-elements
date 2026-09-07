# FIX-F8-1: Re-provide ContextContext inside the popover portal so the context chip's content renders on-device
> Task ID: FIX-F8-1
> Sprint: [sprint-01](./SPRINT.md)
> Agent: `react-native-reusables-implementer`
> Points: 3
> Type: FIX
> Wave: G-fix (follow-up to TASK-F8 + FIX-F5-1)
> Status: ⬜ Pending
> Proposed By: kb-run-sprint driver (judgment table row: fix belongs in registry code, discovered by device proof)
> Depends On: FIX-F5-1
## Outcome
The installed `context` item's popover content actually renders when the trigger is tapped on a device. Discovered by FIX-F5-1 (cycle 1): with the transcript layout fixed, the cold-boot flow's final assertion (`tapOn context-trigger` then `assertVisible context-popover-content`) crashes on-device with LogBox
`Render Error: Context components must be used within Context`.

Root cause (verified against the installed `@rn-primitives/portal` dist): RNR's portal stores the portalled subtree's **elements** in a zustand store and `PortalHost` renders them where the host sits — in this app, the root `_layout.tsx`, which is an ANCESTOR of the screen that renders `<Context>`. React context resolves against the render fiber tree, so `ContextContext.Provider` (inside the screen, inside `Context`) never reaches the portalled `ContextContentHeader`/`ContextContentBody`/`ContextContentFooter`, whose `useContextValue()` throws at `components/ai/context.tsx:80`.

RNR's own primitives solve exactly this: `@rn-primitives/popover`'s `Portal` reads its root context OUTSIDE the portal and **re-provides it inside** (`<RootContext.Provider value={value}>{children}</RootContext.Provider>` inside the portal element, popover.js:148). Our `Context` item must do the same for `ContextContext` — the value is readable where `ContextContent` is composed (it renders under the `Context` root provider), so the fix is to wrap the `PopoverContent` children in a `ContextContext.Provider` that carries the value INTO the portalled tree.
## Critical Constraints
- The fix goes UPSTREAM in `packages/registry/src/components/ai/context.tsx`, then re-emits `public/r/**`, then the consumer's installed copy is refreshed ONLY by re-running the real RNR CLI against the pinned URL — never by hand-editing `apps/example/components/ai/context.tsx` (that would break TASK-F3's fakeability evidence). `apps/example/components/ai/**` is WRITE-PROHIBITED; the refresh happens through the CLI `add` over the existing file set (the CLI overwrite prompt is acceptable here — this is a deliberate reinstall of a CHANGED item, not a hand-placement).
- The `{version}` tag (v0.1.0) must be RE-CUT at the commit carrying the re-emitted `public/r` and force-pushed, because TASK-F3's gate and TASK-F8's install stage fetch from `raw.githubusercontent.com/.../v0.1.0/...`. v0.1.0 is annotated a PRE-RELEASE snapshot with no support promise — re-cutting it mid-sprint to carry a fix is exactly that annotation's purpose. Emitted URL strings keep naming `v0.1.0` (0 `/main/`); only what the tag resolves to moves. The orchestrator pushes the moved tag after approval — do NOT push yourself.
- Do not weaken or delete the `tapOn context-trigger` / `assertVisible context-popover-content` pair anywhere. The PortalHost behavioral proof must still run.
- Follow the RNR precedent: re-provide context inside the portal (a `ContextContext.Provider` wrapping the portalled children with the value captured at composition time). Do not restructure the item's public API, do not move the provider above `Context`, do not add a new dependency.
## Verification Checklist
| Command | Expect |
|---|---|
| `pnpm registry:build && git diff --exit-code -- public/r` | exit 0 — emitter-tree change and re-emitted `public/r/**` in one commit |
| `git diff packages/registry/src/components/ai/context.tsx` | the diff re-provides `ContextContext` inside the portal boundary (Provider wrapping the popover content children, value from the composition-site read), mirroring `@rn-primitives/popover`'s own `Portal` pattern; public API and usage shape unchanged |
| `node -e "const r=require('./packages/registry/registry.json');console.log(r.items.length)"` | `56` — no item added or removed; only `context`'s emitted files change |
| In the consumer (fresh `apps/example` reinstall via the pinned URLs, then `npx expo run:ios`): `~/.maestro/bin/maestro test <the locked cold-boot flow>` | the `tapOn context-trigger` step COMPLETES and `context-popover-content` becomes VISIBLE (the pair passes) on an iOS simulator; screenshot shows the popover painted through the root PortalHost |
| `pnpm typecheck && pnpm lint` | both exit 0 |
## Behavior Proven By
TASK-F8 AC-1 (core-happy-path on both platforms) — the context-popover pair is TASK-F1's delegated PortalHost proof and gate steps require the popover to actually render, never a silent nothing.
## Guardrails
**WRITE-ALLOWED**
- `packages/registry/src/components/ai/context.tsx`
- `packages/registry/registry.json` (only if the item's file list legitimately changes — it should not)
- `public/r/**`
- `packages/registry/scripts/build-registry.ts` (only if the re-provide needs an emitter change — it should not)
- `tests/sprint-01/context-portal.test.ts` (a unit/integration assertion if the item can be tested off-device; optional)
- `apps/example/**` (ONLY as the mechanical consequence of the CLI reinstall over existing files — no hand-written product file)
**WRITE-PROHIBITED**
- `apps/harness/**`, `.github/workflows/**`, `.maestro/**`, `apps/example/app/**`, `apps/example/components/ai/**` (hand-edits)
