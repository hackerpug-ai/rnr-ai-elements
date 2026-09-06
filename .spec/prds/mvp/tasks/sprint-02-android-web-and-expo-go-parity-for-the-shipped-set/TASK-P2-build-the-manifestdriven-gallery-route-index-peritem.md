# TASK-P2: Build the manifest-driven /gallery route: index + per-item four-state matrix screens with interactive prop controls, one codebase for iOS, Android and web


> Task ID: TASK-P2  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-ui-implementer`  
> Points: 8  
> Type: INFRA  
> Wave: C  
> Status: ⬜ Pending  
> Proposed By: `react-native-ui-planner`  
> Depends On: TASK-P1, TASK-P7, TASK-P8, TASK-P12  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

A stranger can open /gallery on any leg and walk every one of the 56 items through all four states with the counter, coverage dots and stream replay all live.

## Critical Constraints

- MUST: The segmented control reads Loading | Empty | Error | Populated with the active segment bg-primary/text-primary-foreground, and panels swap IN PLACE with no screen transition
- MUST: The `Walk all states` ghost button auto-advances the four segments in order, dwelling ~2 seconds each, and each gallery row carries four coverage dots that fill as its states are viewed
- MUST: The conversation item mounts a `replay stream` control with id `gallery-stream-replay` that drives the committed UIMessageStream fixture (apps/example/fixtures/transcript.json)
- NEVER create sibling routes per state (app/gallery/[item]/loading.tsx and friends) — the matrix is state, not navigation
- NEVER hand-edit apps/example/gallery/manifest.json; it is generated, and the generate step fails on drift between the manifest, the installed tree and packages/registry/registry.json
- NEVER emit a bare string, an assumed cascade, or a hover class outside Platform.select({ web }) without its active: twin
- STRICTLY one codebase for iOS, Android and web — no .web.tsx or .android.tsx forks for the gallery; platform divergence goes through Platform.select values, not files
- STRICTLY mount the scheme strip (TASK-P8) in the gallery header area and keep the phone-width column on web

## Specification

**Objective:** Give a stranger a product surface that walks all 56 shipped items through loading, empty, error and populated states with live prop controls — one universal route pair, driven by a generated manifest so the gallery can never silently drift from the shipped registry.

**Success state:** From the app header's `Gallery` control, the index lists five groups with counts and `gallery-counter` reads exactly `56 / 56`; every item detail shows the four labeled state sections behind the segmented control with the TASK-P7 literals verbatim; `Walk all states` advances ~2s per segment; the conversation item replays the committed stream from `gallery-stream-replay`; and the manifest↔tree↔registry check passes at 56.

## Verification Checklist

| Command | Expect |
|---|---|
| `node -p "require('./apps/example/gallery/manifest.json').items.length"` | prints 56 |
| `node -e "const m=require('./apps/example/gallery/manifest.json').items.map(i=>i.name).sort();const r=require('./packages/registry/registry.json').items.map(i=>i.name).sort();console.log(m.length===r.length&&m.every((n,i)=>n===r[i])?'manifest in sync: '+m.length+'/56':'DRIFT')"` | prints `manifest in sync: 56/56` — any other output is drift and a FAIL |
| `node -e "const m=require('./apps/example/gallery/manifest.json');const fs=require('fs');const miss=m.items.filter(i=>!fs.existsSync('apps/example/'+i.target));console.log(miss.length===0?'installed tree matches manifest: '+m.items.length+'/56':'missing: '+miss.map(i=>i.name).join(','))"` | prints `installed tree matches manifest: 56/56` |
| `ls apps/example/app/gallery` | exactly `index.tsx` and `[item].tsx` — no sibling state routes |
| `grep -c "gallery-counter" apps/example/app/gallery/index.tsx` | at least 1 — the footer counter carries the id Maestro selects |
| `grep -rc "gallery-stream-replay" apps/example/app/gallery/ | grep -v ':0'` | one matching file (the [item].tsx screen) with count at least 1 |
| `grep -o "Chat\|Agent Surface\|Specialist\|Base Primitives\|Logic" apps/example/app/gallery/index.tsx | sort -u | wc -l` | prints 5 — all five group headers present |
| `grep -rn "hover:" apps/example/app/gallery apps/example/components/gallery | grep -v "active:" | wc -l` | prints 0 — every hover class has its active twin |
| `pnpm typecheck && pnpm lint` | both exit 0 |

## Reading List

- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (65-71) — gate steps 3-5: the group headers, `56 / 56` counter, the four-segment literals on `tool`, Walk-all-states timing, coverage dots, and the model-selector sheet
- `apps/harness/src/stories/Atoms.stories.tsx` (35-80) — the state-board pattern: one screen, one <Label> per state, composed from the shipped atoms (Empty/Item/Sheet) — the shape the detail panels follow
- `apps/harness/src/stories/ChatSurfaces.stories.tsx` (119-190) — composer-strip and attachment state boards — loading/empty/populated compositions tuned to a real surface, plus the Disabled-never-pretends law
- `packages/registry/registry.json` (full) — the item names and titles the manifest generator maps onto the five groups
- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F6-define-and-apply-the-testid-contract-the-e2e-flows-select-on.md` (full) — the testid contract precedent — ids live in one module, flows select id-only, and surface.json hardcodes them

## Guardrails

**WRITE-ALLOWED**
- `apps/example/app/gallery/** (NEW)`
- `apps/example/app/index.tsx (MODIFY)`
- `apps/example/app/_layout.tsx (MODIFY)`
- `apps/example/gallery/manifest.json (NEW)`
- `apps/example/e2e-ids.ts (MODIFY)`
- `apps/example/components/gallery/** (NEW)`
- `apps/example/gallery/generate-manifest.ts (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `apps/harness-nativewind/**`
- `apps/example/components/ai/**`
- `apps/example/components/ui/**`
- `apps/example/package.json`
- `tests/**`
- `.maestro/**`

## Design

**References:** `design lens contract (folded per SPRINT.md fusion note): segmented control Loading|Empty|Error|Populated, active bg-primary/text-primary-foreground; panels swap in place, no transition; `Walk all states` ghost button, ~2s per segment; per-row four coverage dots; scheme strip in the header area; phone-width column on web; hover only in Platform.select({web}) with an active: twin`; `TASK-P7's seeded four-state literals (e.g. tool: `No tool calls yet` / `Ask something that uses a tool to see it here.` / `Error` in destructive / `The tool call failed to complete.`)`; `TASK-P8's scheme strip; TASK-P12's Expo Go / dev-client status rows (web-preview: `react-native-webview`, permissions `none`; speech-input: `microphone`, `dev client — expo-speech-recognition`; message: `dev client — react-native-enriched-markdown / react-native-streamdown`)`
**Design-lens references:** SPRINT.md gate steps 3-5, 9, 18, 23 (index anatomy, segmented control behavior, Walk-all, replay id, hover twins, negative controls); apps/harness/src/stories/Agent.stories.tsx (labeled per-state boards, Label rows); apps/harness/src/stories/Atoms.stories.tsx (Empty composition, pressable row with active twin); apps/example/fixtures/gallery-states.ts (TASK-P7 — every cell's strings come from here, never inline)
**Pattern:** labeled state boards — one surface, one <Label>-style caption per state, each board composed from the shipped atoms, exactly as the harness stories demo every state of a component
**Pattern source:** `apps/harness/src/stories/*.stories.tsx (Atoms.stories.tsx, ChatSurfaces.stories.tsx — the state-board compositions)`
**Anti-pattern:** sibling routes per state (app/gallery/[item]/loading.tsx …) — navigation pretending to be state, which would break the in-place swap, the back gesture, and the id scheme in one move
- The segmented control is the state machine: one screen, four panels, ids `gallery-item-<name>-{loading,empty,error,populated}` so the generated Maestro walk can assert each section without text selectors
- Coverage dots are per-row gallery-index state that fills as states are viewed — the human's progress mirror of the 224-assertion walk
- `Walk all states` is a ghost button (secondary/outline treatment) — it must not read as a primary action on every card
- The scheme strip sits in the gallery header area so the dark-flip driver can sample theme tokens from one labeled place on every screen
- Segmented control anatomy: one compact pill row of four segments reading `Loading`, `Empty`, `Error`, `Populated`, `Populated` active when a detail screen opens; selecting a segment swaps the PANEL in place — no route push, no screen transition — so the dark-flip target stays one screen and the OS back gesture still returns to the index in one press
- `Walk all states` is a ghost-variant button on the conversation detail: the segments advance by themselves in order Loading → Empty → Error → Populated, dwelling ~2 seconds per state (long enough for the Loading pulse to be seen mid-pulse and for P13's samplers); on completion the row's four coverage dots on the index fill
- Index: five group headers `Chat`, `Agent Surface`, `Specialist`, `Base Primitives`, `Logic`, each followed by its item count; footer counter id `gallery-counter` rendering `56 / 56`, derived from the manifest at runtime — a hand-typed number is the drift the gate exists to catch
- Web: constrain the gallery to a phone-width centered column so mobile density holds on desktop; hover tint exists only in Platform.select({web: 'hover:bg-accent'}) and every hover class ships with an always-on active: twin — a control that responds only to hover is the banned web-only construct of gate step 18
- testIDs: gallery-item-<name>-<state> per panel, gallery-counter on the footer, gallery-stream-replay on the conversation replay control (the mid-stream flip surface per TASK-P8's spec) — id-only selectors are what P13's Maestro flows address
- **Design-lens anti-pattern:** A DOM tab strip with className-cascade hover styling: hover-without-active is a banned web-only construct, and panels that push a route per state would break both the in-place swap and the one-press back gesture

## Boundary Contracts

- the four states are STATES of one screen behind a four-segment control — never sibling routes; app/gallery/ contains exactly index.tsx and [item].tsx
- manifest.json is generated from packages/registry/registry.json by gallery/generate-manifest.ts and never hand-edited; the counter reads `56 / 56` or the drift check fails
- every e2e-selectable element carries an id from apps/example/e2e-ids.ts; flows select id-only
- hover classes appear ONLY inside Platform.select({ web }) and always with an active: twin

## Dependencies

- **Depends on:** TASK-P1, TASK-P7, TASK-P8, TASK-P12
- **Blocks:** TASK-P3, TASK-P4, TASK-P5, TASK-P13
- **Human test hook:** Gate steps 3-5: open `Gallery` from the header — five group headers with counts and `gallery-counter` reading `56 / 56`; tap `tool` — `Populated` shows the green-check `Completed` pill, `Loading`/`Empty`/`Error` swap in place with the seeded literals; Android back returns to the index in ONE press with scroll preserved; on `conversation`, `Walk all states` auto-advances and fills the row's four coverage dots; on `model-selector`, the model chip raises a bottom sheet OVER the chrome listing `Claude Opus 4`, `GPT-4o`, `Gemini 2.5 Pro`.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P2",
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
