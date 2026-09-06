# TASK-P7: Author the seeded four-state literals — the strings a stranger literally reads in every cell of the matrix


> Task ID: TASK-P7  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `frontend-designer`  
> Points: 2  
> Type: DESIGN  
> Wave: A  
> Status: ⬜ Pending  
> Proposed By: `frontend-designer`  
> Depends On: none  
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no

## Outcome

A committed apps/example/fixtures/gallery-states.ts whose exported literal strings are the exact expected values gate steps 4 and 16 quote, with every gallery state family — loading, empty, error, populated, unavailable-on-target — carrying deliberate, human-readable copy.

## Critical Constraints

- MUST: Continue sprint-01's committed vocabulary verbatim: `Registry item installed.` (TASK-F5's transcript.json bubble), `Completed` (the green-check badge pill), `Thinking…` (the streaming reasoning header, ellipsis character included) — drift here breaks sprint-01's already-committed gate steps 6-7
- MUST: Every family's Empty state is a title+description pair; every family's Error state is heading+body — the atoms' shape is fixed so P2 renders one composition, not 56 bespoke layouts
- MUST: The unavailable-on-target literal names the reason (native webview, device build) and the targets (iOS, Android) where the item does render — used on the web leg for web-preview, never a blank rectangle
- MUST: Every string is a deliberate literal: sentence case, terminal periods on sentences, no trailing periods on titles
- Never lorem-ipsum, `TODO`, `test`, or placeholder filler — every literal is readable copy a stranger evaluates as real product text
- Never encode state logic in the module: no flags, no machines, no conditionals beyond the data shape — state wiring belongs to TASK-P2 (react-native-ui-implementer)
- Never introduce UI or React into the module — it is pure data, importable by tests and screens alike
- Never duplicate one of these strings inline anywhere else after commit — the module is the single source the gate quotes
- Strictly one export surface (the family×state map plus the shared unavailable literal) consumed by P2's gallery screens
- Strictly no string concatenation or interpolation inside the literals — each is a complete quoted literal so a gate step can quote it character-for-character

## Specification

**Objective:** Author the seeded four-state literals module as pure typed data: a map keyed by gallery state family (conversation/transcript, tool, reasoning, and the remaining families P2's manifest walks) × state (loading | empty | error | populated), plus one shared unavailable-on-target literal. Populated continues sprint-01's committed vocabulary verbatim — assistant bubble `Registry item installed.`, tool badge pill `Completed` with the green check, reasoning header `Thinking…`. Empty is a title+description pair per family — conversation: `No messages yet` / `Start the conversation, or pick one of the suggestions below.`; tool: `No tool calls yet` / `Ask something that uses a tool to see it here.`. Error is heading `Error` (rendered in text-destructive by the component, not the string) with body `The tool call failed to complete.`. Unavailable-on-target is title `Needs a device build` with description `This item renders a native webview. Run the iOS or Android app to see it.` — used on the web leg for web-preview.

**Success state:** TASK-P2 imports every literal from this one module and renders zero inline strings in the gallery screens; a stranger reading any cell of the matrix on any leg reads real words a copywriter chose, and the strings quoted in SPRINT.md gate steps 4 and 16 exist verbatim in this file and nowhere else.

## Verification Checklist

| Command | Expect |
|---|---|
| `grep -c 'No tool calls yet' apps/example/fixtures/gallery-states.ts` | 1 — the exact empty title gate step 4 quotes appears exactly once as a module literal, not retyped per screen |
| `grep -c 'The tool call failed to complete\.' apps/example/fixtures/gallery-states.ts` | 1 — the error body appears exactly once |
| `grep -c 'Needs a device build' apps/example/fixtures/gallery-states.ts` | 1 — the unavailable-on-target title appears exactly once |
| `grep -c 'Run the iOS or Android app to see it' apps/example/fixtures/gallery-states.ts` | 1 — the unavailable description literally names both target platforms, satisfying the boundary contract that unavailable panels name the reason AND where the item does render |
| `pnpm exec tsc --noEmit -p apps/example` | 0 errors — the module is typed data apps/example compiles against, not prose in a comment |

## Reading List

- `.spec/prds/mvp/tasks/sprint-02-android-web-and-expo-go-parity-for-the-shipped-set/SPRINT.md` (full) — Gate steps 3, 4 and 16 — the exact strings a stranger reads and the step that quotes them; step 4 fixes tool's empty pair and the error pair verbatim
- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F5-commit-the-uimessagestream-fixture-with-honest-provenance-an.md` (full) — The seeded-transcript vocabulary being continued: `Registry item installed.` and `Completed` — sprint-02's Populated literals extend sprint-01's, never replace them
- `apps/harness/src/stories/Agent.stories.tsx` (full) — The `Thinking…` streaming header literal (line 159) and the seeded-literal fixture pattern (REASONING_TEXT) — the state-board vocabulary this module canonizes
- `apps/harness/src/stories/Atoms.stories.tsx` (full) — The EmptyState composition (line 35-52): `No messages yet` + description + actions — the title+description pair shape every family's Empty state follows
- `.spec/prds/mvp/08-uc-reg.md` (full) — UC-REG-04 AC-3 — loading, empty, error and populated are the four demonstrated states every family must cover

## Guardrails

**WRITE-ALLOWED**
- `apps/example/fixtures/gallery-states.ts (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/**`
- `public/r/**`
- `apps/harness/**`
- `apps/example/components/**`
- `apps/example/app/**`
- `tests/sprint-02/**`
- `.maestro/**`

## Design

**References:** `apps/harness/src/stories/Agent.stories.tsx — REASONING_TEXT / ToolLifecycle: module-level literal fixtures, one board per state`; `apps/harness/src/stories/Atoms.stories.tsx — EmptyState: the `No messages yet` pair the conversation family continues verbatim`; sprint-01 TASK-F5 — transcript.json's literals, the vocabulary lineage
**Pattern:** Labeled state boards with seeded literal fixtures — every state a component can be in is a statically visible board whose strings are module-level literals (REASONING_TEXT, RUNNING_SUITE_SUMMARY), never inline JSX prose
**Pattern source:** `apps/harness/src/stories/Agent.stories.tsx (module-literal fixtures + per-state boards + Label rows)`
**Anti-pattern:** Inline JSX prose: a literal typed inside a gallery screen instead of exported from the fixtures module — the gate would quote a copy, 56 screens could drift apart, and a rename would pass every grep that matters
- Tone: short, product-voice imperatives — the empty descriptions tell the stranger what action produces content in that state (`Ask something that uses a tool to see it here.`), so every empty cell teaches the matrix's own mechanic
- The ellipsis in `Thinking…` is the single character U+2026, matching the harness story label exactly — a three-dot `...` variant would silently fail a verbatim quote
- Error copy is generic on purpose (`The tool call failed to complete.`) — it names the state family, not a specific item, so one literal serves all 56 cells and the gate quotes it once
- Loading families reuse the shimmer's companion text vocabulary (`Thinking through the approach…` lineage from Molecules.stories.tsx) so the pulsing cell also shows real words
- Unavailable-on-target reads as an empty-state composition, not an error: `Needs a device build` / `This item renders a native webview. Run the iOS or Android app to see it.`

## Boundary Contracts

- Once committed, these literals ARE the gate's expected values: gate steps 4 and 16 quote them verbatim, and TASK-P13's Maestro flows assert against text derived from them. Renaming a literal after P2 wires it breaks the committed gate — treat every string as frozen at commit
- CEDED to TASK-P2 (react-native-ui-implementer): rendering the literals, choosing which family each of the 56 items maps to, and all state wiring — this task ships data only
- CEDED to TASK-P4: mounting the `Needs a device build` composition as web-preview's web-leg Populated fallback panel
- CONSUMES from sprint-01 (TASK-F5): the transcript vocabulary this module continues; if sprint-01's fixture literals changed, this module follows them, not the reverse

## Dependencies

- **Depends on:** none
- **Blocks:** TASK-P2 (renders the literals in every gallery cell), TASK-P4 (mounts the Needs-a-device-build web fallback), TASK-P13 (flows assert against these committed strings)
- **Human test hook:** every state shows real words

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P7",
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
