# TASK-P4: Web leg: static `expo export -p web`, react-native-web parity for the full set, hover twins with active twins, first web dark flip


> Task ID: TASK-P4  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 5  
> Type: INFRA  
> Wave: E  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-P2  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

The full shipped set renders and flips dark in a desktop browser from a static export, with every parity defect fixed at universal source and the goldens to prove it.

## Critical Constraints

- MUST: Set expo.web.output to static so `npx expo export -p web` emits a servable tree whose /gallery route returns 200 from `npx serve dist`
- MUST: Fix web parity at universal source and rebuild the registry; the phone-width column keeps the desktop browser honest about the mobile-first layout
- MUST: Verify the flip in Chrome by emulating prefers-color-scheme dark — every gallery surface flips in the same frame, identically to the emulator flip; a surface that only re-themes after navigation is a FAIL
- NEVER gate a control on hover — portals and popovers open on click (and keyboard Tab+Enter), or they are broken for touch
- NEVER ship a blank rectangle where react-native-webview has no web implementation — web-preview shows the `Needs a device build` fallback
- NEVER fork files per platform for the gallery; Platform.select values only
- STRICTLY capture the light/dark pair under design/goldens/web-desktop/sprint-02/ — the first web pixels this repo commits

## Specification

**Objective:** Stand up the web leg as a first-class target: a static export that deep-links /gallery, react-native-web parity for all 56 items fixed where the defects live, and the first browser dark flip — so 'RNR is universal' is evidenced rather than asserted.

**Success state:** `npx expo export -p web` exits 0 with no `Export encountered an error`; `npx serve dist` + `curl http://localhost:3000/gallery` returns 200; the tool item shows the same four labeled state sections through react-native-web; the context popover opens on click and on Tab+Enter; rows tint on hover AND on click-and-hold; Chrome's prefers-color-scheme dark flips every surface in the same frame; web-preview shows `Needs a device build`; and the web-desktop/sprint-02 light/dark pair exists.

## Verification Checklist

| Command | Expect |
|---|---|
| `node -p "require('./apps/example/app.json').expo.web.output"` | prints static |
| `cd apps/example && npx expo export -p web` | exit 0, dist/ emitted, and no `Export encountered an error` line |
| `cd apps/example && npx serve dist & sleep 3; curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/gallery` | prints 200 — a 404 or 500 means the static export does not carry the /gallery route |
| `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/gallery/tool` | prints 200 — the item detail deep-links too |
| `grep -rn "hover:" apps/example/app apps/example/components/gallery | grep -v "active:" | wc -l` | prints 0 — every hover class carries an active twin |
| `grep -rn "Needs a device build" apps/example | head -n 1` | at least one match — the web-preview fallback is authored, not a blank view |
| `ls design/goldens/web-desktop/sprint-02/` | a light/dark capture pair (at least 2 files) — the first web goldens in the repo |
| `pnpm registry:build && pnpm exec vitest run tests/build-registry.test.ts` | exit 0 — web parity fixes landed at universal source and public/r is fresh |
| `pnpm typecheck && pnpm lint` | both exit 0 |

## Reading List

- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (77-81) — gate steps 15-19: export/serve, the /gallery 200 deep-link, the `Needs a device build` fallback, the prefers-color-scheme same-frame flip, and click-not-hover controls
- `AGENTS.md` (46-63) — the web-only construct ban list (DOM elements, className cascade, CSS hover/focus-visible, onClick) and 'Web | Required — a component that only works on native is not done'
- `design/manifest.json` (full) — the web-desktop/web-mobile gate keys that are boilerplate 'pending' today — this task fills them
- `apps/harness/src/stories/WebPreview.stories.tsx` (90-112) — web-preview's authored failure/empty compositions — the precedent for an explicit fallback instead of a blank view
- `AGENTS.md` (181-192) — verification tiers — Storybook-on-web is never sufficient alone; the export/serve gate is what makes the web leg real

## Guardrails

**WRITE-ALLOWED**
- `apps/example/app.json (MODIFY)`
- `apps/example/metro.config.js (MODIFY)`
- `apps/example/app/** (MODIFY)`
- `packages/registry/src/components/** (MODIFY)`
- `public/r/** (MODIFY)`
- `design/goldens/web-desktop/sprint-02/** (NEW)`

**WRITE-PROHIBITED**
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `apps/example/components/ai/**`
- `apps/example/components/ui/**`
- `apps/example/package.json`
- `tests/**`
- `.maestro/**`
- `design/goldens/mobile-android/**`
- `design/goldens/mobile-ios/**`

## Design

**References:** gate step 17 (prefers-color-scheme emulation flip, same frame as the emulator flip in step 8); gate step 18 (click-not-hover + keyboard-reachable controls; hover tint with a distinct active tint); TASK-P2's design contract: phone-width column on web; hover only in Platform.select({web}) with an active twin
**Design-lens references:** SPRINT.md gate steps 15-19 (export deep link, web fallback, DevTools flip, click+keyboard controls, web-only smoke); apps/harness/src/stories/Atoms.stories.tsx (EmptyState — the composition the web-preview fallback reuses); apps/example/fixtures/gallery-states.ts (TASK-P7's unavailable-on-target literal: `Needs a device build` + iOS/Android description); apps/harness/src/global.css (the light/dark role pairs prefers-color-scheme must drive)
**Pattern:** universal-source parity: one component, Platform.select({ web }) for the hover affordance with its active twin — the same rule the styling contract enforces on the registry
**Pattern source:** `AGENTS.md web-only construct ban + apps/harness web stories (WebPreview.stories.tsx authored fallbacks)`
**Anti-pattern:** *.web.tsx forks for the gallery — platform files instead of platform values, which drift immediately and hide the parity defect from the registry
- The web gallery is the same phone-width column the native legs show — the desktop browser sees the mobile-first layout, widened only enough to read
- Mouse-only affordances get touch twins: anything clickable by pointer must be tappable, and anything hover-tinted must also active-tint
- web-preview's populated state on web IS the fallback — it is a designed empty-state composition, the honest rendering of 'this capability needs a device build'
- Static export must deep-link http://localhost:3000/gallery directly — the route renders on first paint at that URL, no in-app redirect hop
- Row/press tinting: hover tint via Platform.select({web: 'hover:bg-accent'}) with a DISTINCT darker click-and-hold active tint (active:bg-accent/80-style role usage consistent with the styling contract) — hover and active must be visually distinguishable so gate step 18 can tell them apart
- web-preview's Populated panel on the web leg renders the committed unavailable-on-target composition — title `Needs a device build`, description naming iOS and Android — as an empty-state layout (icon + title + description), never a blank rectangle
- prefers-color-scheme flip via Chrome DevTools rendering emulation must re-theme every gallery surface INCLUDING the scheme strip in the same frame, with no navigation and no reload — surfaces that re-theme only after a route change are the documented failure
- Density: compact sm: spacing on web so the phone-width column doesn't balloon — mobile base classes remain the source of truth, web only tightens gaps
- **Design-lens anti-pattern:** A blank View or a web-only error boundary standing in for the fallback panel — the fallback must name the reason (native webview) and the targets (iOS, Android); silence reads as a bug

## Boundary Contracts

- parity defects are fixed in packages/registry/src/components/** (rebuilt via pnpm registry:build), never behind .web.tsx forks
- hover styling exists only inside Platform.select({ web }) and always with an active: twin — a hover-only control on a universal surface is a web-only construct leak
- web-preview's web rendering is the designed empty-state fallback naming iOS and Android as the device-build targets — never a blank rectangle

## Dependencies

- **Depends on:** TASK-P2
- **Blocks:** TASK-P13
- **Human test hook:** Gate steps 15-18: `cd apps/example && npx expo export -p web && npx serve dist`, open http://localhost:3000/gallery in Chrome — grouped index and `56 / 56`; on `web-preview` with Populated active — the `Needs a device build` fallback naming iOS and Android; DevTools → Rendering → Emulate prefers-color-scheme `dark` — same-frame flip, back on `no-preference`; on `context`, click the citation trigger (and repeat with Tab + Enter) — the popover opens with no hover required; hover a row — tint; click-and-hold — a distinct darker active tint.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P4",
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
