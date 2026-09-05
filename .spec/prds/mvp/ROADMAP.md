---
roadmap: 1
project: rnr-ai-elements MVP
generated: 2026-09-04
prd: .spec/prds/mvp/README.md (v2.0.0)
sprint_count: 14
commit_horizon: 1
pr_sequencing: false
status: PARTIAL — sprint 01 committed and complete; provisional layer incomplete (see Open Gaps)
---

# Sprint Roadmap: rnr-ai-elements MVP

## Overview

**Sprints:** 14 (1 committed · 13 provisional)  
**Committed tasks:** 8 · 38 pts  
**Current sprint:** 01 — not started

> **This roadmap is PARTIAL and says so on purpose.** Sprint 01 is fully specified, coverage-checked, and ready for `/kb-sprint-tasks-plan`. The provisional layer carries each specialist's own gate, entrypoint, `before` and size band, but it has **not** been through a reconciliation round: one UC is orphaned and several are claimed twice. See **Open Gaps**. Under commit horizon 1 that does not block sprint 01, and every provisional sprint is re-planned against the codebase as it then is.

**Planning provenance.** Four specialists resolved from `AGENTS.md` § Local Domain Experts were dispatched in parallel, each returned a full proposal, and all four went through one fusion round. Proposals and fusion responses are staged verbatim at `.tmp/kb-sprint-plan/mvp/`. The orchestrator merged, sequenced and rendered; it authored no gate, step or task.

## Sprint Sequence

| # | Sprint | Fidelity | Gate | Tasks | Demonstrates | Deps |
|---|--------|----------|------|-------|--------------|------|
| 01 | [installed-app-cold-boots-on-both-platforms](#sprint-01-installed-app-cold-boots-on-both-platforms) | committed | A stranger runs one RNR CLI command against a tag-pinned URL, cold-boots the example app… | 8 | `UC-REG-01` | — |
| 02 | [sprint-05-published-ledger-and-install-page](#sprint-02-sprint-05-published-ledger-and-install-page) | provisional | A web developer with a shipping AI Elements app opens the published install page, looks … | ~5 | `UC-REG-03`, `UC-REG-06` | 01 |
| 03 | [sprint-01-theme-flip-six-pairs](#sprint-03-sprint-01-theme-flip-six-pairs) | provisional | A reviewer edits exactly one file — `apps/example/global.css` — to a loud alternate pale… | ~7 | `UC-FOUND-01`, `UC-FOUND-02` | 01 |
| 04 | [sprint-02-streaming-transcript-on-real-tokens](#sprint-04-sprint-02-streaming-transcript-on-real-tokens) | provisional | On a mid-range Android with a 500-message transcript loaded and the keyboard open, a rea… | ~7 | `UC-CHAT-01`, `UC-CHAT-02`, `UC-CHAT-03` | 01 |
| 05 | [sprint-03-tool-lifecycle-and-real-gated-approval](#sprint-05-sprint-03-tool-lifecycle-and-real-gated-approval) | provisional | On `/agent`, a real provider tool call renders every one of the seven AI SDK tool-part s… | ~7 | `UC-AGENT-01`, `UC-AGENT-04` | 01 |
| 06 | [sprint-04-agent-surface-completion](#sprint-06-sprint-04-agent-surface-completion) | provisional | On `/agent`, a real reasoning-capable model streams its reasoning into an auto-opened di… | ~6 | `UC-AGENT-02`, `UC-AGENT-03`, `UC-AGENT-05` | 01 |
| 07 | [sprint-06-chat-navigation-and-link-safety](#sprint-07-sprint-06-chat-navigation-and-link-safety) | provisional | A real model answer carrying sources and inline citations lets the user expand the sourc… | ~6 | `UC-CHAT-04`, `UC-CHAT-05` | 01 |
| 08 | [sprint-02-every-state-on-a-real-surface](#sprint-08-sprint-02-every-state-on-a-real-surface) | provisional | A design-system owner opens the example app's `/gallery` route on a phone, steps through… | ~9 | `UC-REG-04` | 01 |
| 09 | [sprint-02-android-web-and-expo-go-parity-for-the-shipped-set](#sprint-09-sprint-02-android-web-and-expo-go-parity-for-the-shipped-set) | provisional | A stranger can walk all 56 shipped registry items through their loading, empty, error an… | ~9 | `UC-REG-02`, `UC-REG-04`, `UC-FOUND-02` | 01 |
| 10 | [sprint-05-voice-on-a-dev-client](#sprint-10-sprint-05-voice-on-a-dev-client) | provisional | A stranger can install a dev-client build of apps/example on a physical iPhone and an An… | ~8 | `UC-VOICE-01`, `UC-VOICE-02` | 01 |
| 11 | [sprint-04-live-web-preview-through-a-native-webview](#sprint-11-sprint-04-live-web-preview-through-a-native-webview) | provisional | A stranger can open apps/example's /preview route on an iOS simulator and an Android emu… | ~6 | `UC-CODE-03` | 01 |
| 12 | [sprint-08-code-and-run-output-surfaces](#sprint-12-sprint-08-code-and-run-output-surfaces) | provisional | A real coding-agent tool call on `/agent` returns a file tree, terminal output with ANSI… | ~6 | `UC-CODE-01`, `UC-CODE-02`, `UC-CODE-03` | 01 |
| 13 | [sprint-03-one-design-system-side-by-side](#sprint-13-sprint-03-one-design-system-side-by-side) | provisional | A design-system owner holds one phone showing an RNR reference screen and the AI Element… | ~7 | `UC-FOUND-04` | 01 |
| 14 | [sprint-06-upstream-rnr-drift-guard](#sprint-14-sprint-06-upstream-rnr-drift-guard) | provisional | A maintainer installs the full registry into a clean app against RNR's LIVE published re… | ~4 | `UC-REG-05` | 01 |

---

## Open Gaps

- **`UC-FOUND-03` is demonstrated by no sprint.** Its owning sprint (`react-native-reusables-planner`'s `sprint-01-pinned-install-into-a-clean-app`) was withdrawn during fusion, and the replacement named in that lens's post-fusion sequence (`full-registry-install-and-versioned-distribution`) exists only as a slug and a rationale — no gate, no `before`, no size band. It needs one authoring round before the provisional layer is complete.
- **UCs claimed by more than one sprint** (dedupe at task-plan time): `UC-FOUND-02` → sprints 03, 09; `UC-CODE-03` → sprints 11, 12; `UC-REG-04` → sprints 08, 09.
- **`UC-REG-05` in sprint 01.** `aisdk-planner` and `react-native-reusables-planner` both proposed two cheap steps that would let sprint 01 prove it (run the same install in an app that never had `rnr init`; expect a loud failure and zero files written). The base author left it to the distribution sprint. Adding those two steps is a scope decision that is still open.
- **`UC-REG-04` (AC-1, AC-2, AC-5).** All four lenses re-derived this UC onto a real product surface. Two independently found that AC-1, AC-2 and AC-5 name Storybook as their *subject*, not their venue, so they cannot move without changing the claim. **These three ACs need explicit deferral or a PRD reword.**
- **Two AI-SDK findings are specialist-verified but unconfirmed by the orchestrator** (no npm fetch available): `toUIMessageStreamResponse()` deprecated in `ai@7.0.93` (named in three CONSTITUTION files), and the approval id living at `part.approval.id` rather than `part.toolCallId`. Both become self-checking once `ai@^7.0.89` enters the workspace. Confirm before acting.

---

## Per-Sprint Details

### Sprint 01: A CLI-installed AI Elements transcript cold-boots and renders on iOS and Android, and the same flow fails when the seed is removed

**Sequence:** 1  
**Status:** Planned  
**Fidelity:** committed  
**Proposed by:** frontend-designer (fused with react-native-ui-planner, aisdk-planner, react-native-reusables-planner)  
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger runs one RNR CLI command against a tag-pinned URL, cold-boots the example app on an iOS simulator and an Android emulator, and watches Maestro assert a seeded transcript and a themed tool badge on both — then watches the identical flow FAIL when the seed is removed.  
**Entrypoint:** The RNR CLI install command `npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/<item>.json` run inside `apps/example`, then `apps/example` launched with `npx expo run:ios` / `npx expo run:android` and driven by `maestro test .maestro/cold-boot.yaml`.  
**Before:** `ls apps/` returns exactly `harness/` and `harness-nativewind/`; `apps/example` does not exist, so the first command of this gate has no directory to run in. There is no `.maestro/` directory and `detect_e2e_framework.py --repo .` returns `mobile / expo-rn / status: MISSING` — the Maestro binary happens to be on the developer's machine and the repo gives it nothing to run, which is precisely the finding. No release tag exists: all 56 items in `packages/registry/registry.json` embed a mutable `/main/` segment, so the URL in this gate cannot be typed today. 50 of those 56 emitted items ship 254 `@/registry/{engine}/…` imports that no CLI has ever rewritten, so whether an installed app boots at all is an open question nobody in this repo has asked. Every capture in `design/manifest.json` and `design/goldens/` is an iOS simulator shot; `design/goldens/mobile-android/` does not exist and no Android pixel has ever been produced by this project. And the theming promise ships a documented hole: 26 `--color-*` palette-slice entries live only in `apps/harness/src/global.css`, the registry declares none, the CLI does not merge theme blocks, and `public/r/uniwind/file-tree.json` and `transcription.json` both ship a source comment telling the consumer their classes are 'safelisted consumer-side (class-safelist.tsx)' — a path that will not exist in their tree. A `tool` success badge installs colorless, with no error.  
**Demonstrates:** `UC-REG-01`

> **Entry condition:** Working tree clean at dispatch. The 34 in-flight wave-B style-remediation files (design/style-parity-remediation.md rows 5-8) are landed or parked under refs/wip first — a repo-hygiene precondition, deliberately NOT a task in this sprint.

**Test Steps:** *(as many as coverage requires; each runnable by a stranger verbatim)*

1. Run `pnpm install` from the repository root — expect exits printing `Done in` and a duration, and the resolution includes a workspace package named `example`.   `exercises: TASK-F1`
2. Run `cd apps/example && npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/message.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/prompt-input.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/tool.json` — expect the CLI prints a `Created` line for each of the four items AND for RNR's own `text`, `avatar`, `button` and `icon` pulled from reactnativereusables.com in the same command. Any `404` or `Cannot find module` is a FAIL — it means the v0.1.0 tag or a transitive registryDependency does not resolve.   `exercises: TASK-F2, TASK-F3`
3. Look at the final line the CLI printed — expect the final line names `components/ai/tool.tsx`, proving the file was WRITTEN into the consumer tree rather than imported from `packages/registry`.   `exercises: TASK-F3`
4. Run `npx expo run:ios` from `apps/example` — expect the app builds and launches with no red error screen. Specifically: NO `Unable to resolve module '@/registry/uniwind/components/ui/text'` or any sibling of it. This is the alias assertion — 254 such imports have never survived an install, and this step is the first time anyone finds out.   `exercises: TASK-F4`
5. Look at the text in the app header on the screen that opens — expect the header reads `AI Elements Example`.   `exercises: TASK-F1, TASK-F5`
6. Look at the second bubble in the transcript — expect the bubble reads `Registry item installed.`   `exercises: TASK-F5`
7. Look at the tool card below that bubble and read its badge — expect the badge is a rounded pill reading `Completed` with a GREEN check glyph. A grey, black or colorless check is a FAIL: the consumer's `@theme` never carried `--color-green-600` and the class compiled to nothing, silently.   `exercises: TASK-F7`
8. With the simulator still running, run `pnpm e2e:smoke:ios` from the repository root — expect maestro prints `Flow Passed` and `design/goldens/mobile-ios/sprint-01/cold-boot.png` exists.   `exercises: TASK-F6, TASK-F8`
9. Run `mv apps/example/fixtures/transcript.json apps/example/fixtures/transcript.json.bak`, then run `pnpm e2e:smoke:ios` again — expect nEGATIVE CONTROL. Maestro must FAIL, printing `Assertion is false: id: transcript-message-0 is visible`. A pass here means the flow asserts nothing and the whole gate is theatre — this is the step that answers 'would this pass with a disconnected backend?' with a demonstrated no.   `exercises: TASK-F6, TASK-F8`
10. Run `mv apps/example/fixtures/transcript.json.bak apps/example/fixtures/transcript.json` to restore the seed, then boot the Pixel_7_API_34 emulator and run `npx expo run:android` from `apps/example` — expect the Android emulator launches the same app, the header again reads `AI Elements Example`, and the badge is again GREEN.   `exercises: TASK-F1, TASK-F4, TASK-F7`
11. With the emulator still running, run `pnpm e2e:smoke:android` from the repository root — expect maestro prints `Flow Passed` and writes `design/goldens/mobile-android/sprint-01/cold-boot.png`. This file is the first Android capture ever produced by this repository.   `exercises: TASK-F8`
12. Force-quit the app from the Android launcher, leave Metro running, and run `pnpm e2e:smoke:android` a second time — expect `Flow Passed` again, proving the assertion runs against a cold app launch rather than a warm reload.   `exercises: TASK-F8`

**Dark tasks:** none

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| TASK-F1 | Scaffold apps/example as a genuine consumer app (Expo SDK 57, expo-router, uniwind + Tailwind v4, rnr init) | `react-native-ui-implementer` | 8 | A | ⬜ Pending |
| TASK-F2 | Add the {version} token to the registry build and cut the v0.1.0 tag | `react-native-reusables-implementer` | 3 | B | ⬜ Pending |
| TASK-F3 | Install the walking-skeleton item set into apps/example through the real RNR CLI from the pinned URL | `react-native-reusables-implementer` | 3 | C | ⬜ Pending |
| TASK-F4 | Make every emitted import resolve inside a consumer tree | `react-native-reusables-implementer` | 8 | D | ⬜ Pending |
| TASK-F5 | Commit the UIMessageStream fixture with honest provenance and render / from it with zero network calls | `react-native-ui-implementer` | 3 | E | ⬜ Pending |
| TASK-F6 | Define and apply the testID contract the e2e flows select on | `react-native-ui-implementer` | 2 | F | ⬜ Pending |
| TASK-F7 | Declare and record the consumer @theme obligation the installed items silently require | `frontend-designer` | 3 | D | ⬜ Pending |
| TASK-F8 | Stand up Maestro with a cold-boot flow on both platforms and a negative control watched failing | `react-native-ui-implementer` | 8 | G | ⬜ Pending |

**Waves:** A(1) → B(1) → C(1) → D(2) → E(1) → F(1) → G(1) — 7 waves over 8 tasks

> Orchestrator notes (mechanical, no content change): three steps had their leading verb changed from `Read` to `Look at` — the base author's own verb in step 7 — because `Read` is a banned first word in the test-step field guide; each step's action and expected value are unchanged. Each step's expected value was joined inline from the author's parallel `test_step_expected_values` array. And `TASK-F2` was given `depends_on: [TASK-F1]` to serialize a wave-A write collision on `package.json`. Sequencing only — no scope change.

#### Dependencies

- Blocks: sprint-02-clean-app-install-all-56-both-engines, sprint-03-theme-flip-six-pairs, sprint-04-real-streaming-on-a-real-route, sprint-05-tool-lifecycle-and-gated-approval, sprint-06-every-state-on-a-real-surface, sprint-07-one-design-system-side-by-side
- Dependent on: None

#### PRD Coverage

- .spec/prds/mvp/08-uc-reg.md UC-REG-01 AC-1, AC-2
- .spec/prds/mvp/12-e2e-testing-criteria.md T-REG-001, T-REG-002, T-REG-018
- .spec/prds/mvp/11-technical-requirements/09-capability-chains.md CAP-DIST-01 (partial — 4 items, one engine; the 56-item both-engine proof is the distribution sprint's)
- .spec/prds/mvp/11-technical-requirements/12-e2e-testing.md (framework provisioning, determinism seam, flake policy)
- .spec/prds/mvp/11-technical-requirements/11-routing.md (apps/example, route `/`)
- AGENTS.md Platforms table (Android Required)

#### Capability Coverage

- `CAP-DIST-01`
- `CAP-THEME-01`

---

### Sprint 02: One published page answers what ships, what does not, and what it needs

**Sequence:** 2  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** react-native-reusables-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A web developer with a shipping AI Elements app opens the published install page, looks up message, web-preview and canvas, and gets for each one its required RNR items, its native peer dependencies, and its porting verdict — with canvas naming its mobile alternative — then installs from the copy-paste command on that page and it works.  
**Entrypoint:** The published registry and its install page in a desktop browser, plus the RNR CLI command copied from it  
**Before:** The 49-row porting verdict ledger exists only inside .spec/prds/mvp/11-technical-requirements/10-component-inventory.md — a planning document no consumer will ever read. There is no install page, no docs site, and no published index beyond public/r/{engine}/registry.json, which carries only name, type and title. Zero of the 56 items carry a docs or meta field, so no verdict, no native peer dependency, and no alternative is reachable from the shipped artifact at all. A developer arriving from the web has nowhere to look.  
**Demonstrates:** `UC-REG-03`, `UC-REG-06`

**Sizing (provisional):** ~5 items · ~13-21 pts — Move the 49-row verdict ledger out of the PRD into machine-readable per-item metadata; generate the install page from registry.json so the page and the registry can never disagree; publish it (the routing spec's expo export -p web of apps/example, or a static page if that proves heavier than it is worth — take the lighter rung); a staleness gate that diffs the verdict table against the live vercel/ai-elements file list and fails on any upstream component with no row, per the port-lookup edge scenario; the engine-parity check asserting both trees hold the same 56 names with only the engine and host segments differing.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- T-REG-009
- T-REG-010
- T-REG-011
- T-REG-012
- T-REG-024
- T-REG-027
- .spec/scenarios/journeys/port-lookup.scenario.md
- .spec/scenarios/journeys/port-lookup--edge-a-component-with-no-verdict.scenario.md

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 03: CAP-THEME-01 proven: one consumer file edit recolors every AI Elements surface on both platforms in both schemes

**Sequence:** 3  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** frontend-designer  
**Milestone:** —

#### Human Testing Gate

**Gate:** A reviewer edits exactly one file — `apps/example/global.css` — to a loud alternate palette, clears the Metro cache, rebuilds, and every AI Elements surface on `/` and `/agent` recolors on iOS and Android in both light and dark: six before/after screenshot pairs in which no pair is identical and no element retains a default-theme color.  
**Entrypoint:** apps/example on an iOS simulator and an Android emulator, routes `/` and `/agent`, driven by `pnpm e2e:flip` (Maestro captures the six pairs).  
**Before:** No alternate palette exists anywhere in the repository; `apps/harness/src/global.css` is RNR's own transcribed theme and is the only theme in the tree. The flip named in `09-capability-chains.md` and in the PRD's own list of the five criteria that decide the project has never been run — not once, on either platform, in either scheme. `pnpm check:tokens` exits non-zero with `Cannot find module '.../scripts/check-tokens.ts'`: the script that T-FOUND-003 and T-FOUND-004 name as their build gate does not exist, and CI's four jobs (typecheck, lint, test, registry) contain no tokens lane and no contract lane, so `scripts/check-contract.ts` — which does implement the hardcoded-color-literal rule — never runs on a PR. And the defect the flip must expose is already written down in the harness's own comments: 14 palette-slice `--color-*` entries plus `--font-sans: 'Spline Sans'` are consumer obligations the registry neither declares, documents, nor installs, and an omitted one renders unstyled with no error.  
**Demonstrates:** `UC-FOUND-01`, `UC-FOUND-02`

**Sizing (provisional):** ~7 items · ~21-34 pts — A loud alternate palette (magenta primary, non-default radius) plus a runtime switch affordance in the example app; the distribution decision for the required palette slice (registry `cssVars` vs documented install prerequisite vs converting the escape colors back to RNR roles) with its implementation across the affected items; writing `scripts/check-tokens.ts` from scratch and wiring both it and the existing `check-contract.ts` into CI as a tokens lane; a theme-derived `renderMarkdown` injection in the example app so the markdown interior is inside the flip rather than outside it; a `/agent` route composed from fixtures; and the six-pair capture on two platforms x two schemes with a diff assertion per pair. The palette and the capture are cheap; the distribution decision and the markdown bridge are where the points are, and one of them may reopen a shipped component.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: sprint-02-every-state-on-a-real-surface, sprint-03-one-design-system-side-by-side
- Dependent on: Sprint 01

#### PRD Coverage

- .spec/prds/mvp/11-technical-requirements/09-capability-chains.md CAP-THEME-01
- .spec/prds/mvp/07-uc-found.md UC-FOUND-01 (AC-1..AC-4), UC-FOUND-02 (AC-1..AC-3)
- .spec/prds/mvp/12-e2e-testing-criteria.md T-FOUND-001..007
- .spec/scenarios/UC-FOUND-01/* (all four: core, hex-literal edge, invented-token holdout, rebrand holdout, markdown-interior holdout)
- .spec/scenarios/UC-FOUND-02/* (core, mid-stream appearance change, cold-start-in-dark holdout, half-done-theme holdout, library-local-scheme holdout)
- .spec/prds/mvp/11-technical-requirements/07-ui-infrastructure.md (token strategy; the foreign-surface bridge rule)

#### Capability Coverage

- `CAP-THEME-01`

---

### Sprint 04: CAP-STREAM-01: the registry transcript pins, yields, and holds frame rate under a real stream

**Sequence:** 4  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** aisdk-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** On a mid-range Android with a 500-message transcript loaded and the keyboard open, a real streamed answer stays pinned within 2px of the bottom, releases the pin the instant the user scrolls up, and returns on the scroll-to-bottom control — with markdown, fenced code, and a shimmer placeholder rendered as native views.  
**Entrypoint:** `apps/example` `/` route on a mid-range Android device or emulator (Pixel 6a class) and on a notched iPhone, driven by `maestro test maestro/flows/streaming-transcript.yaml`.  
**Before:** After sprint 01 the `/` screen renders raw `<Text>` from `message.parts` in a plain list: there is no `Conversation`, no `Message`, no pin-to-bottom, no scroll-to-bottom control, no throttle, no markdown rendering, and no way to seed a long transcript, so a reviewer scrolling up mid-stream is yanked back on every chunk and 500 messages cannot be loaded at all. The registry components that do all of this exist only as source under `packages/registry` and have never been mounted against a real token stream.  
**Demonstrates:** `UC-CHAT-01`, `UC-CHAT-02`, `UC-CHAT-03`

**Sizing (provisional):** ~7 items · ~21-34 pts — Swap the skeleton screen for `conversation` + `message` + `markdown` + `prompt-input` + `shimmer` (1 task each is wrong — it is one composition task plus one markdown-part-serializer wiring task); a throttle scheduler with a Vitest-testable pure core plus its wiring; a 500-message seeding path through the real entrypoint (the holdout scenario names it explicitly); keyboard + safe-area behavior on a notched iPhone and a gesture-nav Android; a Maestro flow that scrolls mid-stream and asserts the pin releases; and two-platform capture. The 500-message seed is the sleeper — it must arrive through the real transport, not a hardcoded array, or the gate passes with a disconnected backend.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: sprint-03-tool-lifecycle-and-real-gated-approval, sprint-05-clean-app-install-streams-for-real, sprint-06-chat-navigation-and-link-safety, sprint-07-theming-flip-on-real-product-surfaces
- Dependent on: Sprint 01

#### PRD Coverage

- T-CHAT-001..T-CHAT-005 (UC-CHAT-01), T-CHAT-006..T-CHAT-010 (UC-CHAT-02) — re-derived from on-device Storybook onto `apps/example`, since Storybook is a banned gate entrypoint.
- .spec/scenarios/UC-CHAT-01/holdout-the-500-message-transcript.scenario.md, holdout-near-bottom-courtesy.scenario.md, holdout-the-notch-and-the-gesture-bar.scenario.md
- CAP-STREAM-01 hops 3-5 (useChat → parts → Conversation → FlatList).

#### Capability Coverage

- `CAP-STREAM-01`

---

### Sprint 05: CAP-TOOL-01: a real gated tool call is approved on device and the agent actually continues

**Sequence:** 5  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** aisdk-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** On `/agent`, a real provider tool call renders every one of the seven AI SDK tool-part states in place without the transcript reflowing, and a real gated tool emits `approval-requested` whose full arguments are legible before the approve control is reachable — tapping Approve resolves the card in place and the agent run completes instead of stalling forever.  
**Entrypoint:** `apps/example` `/agent` route on an iOS simulator and an Android emulator, driven by `maestro test maestro/flows/gated-tool-approval.yaml` against the real `/api/chat` route.  
**Before:** `/agent` does not exist — `11-routing.md` specifies it and nothing implements it. The `/api/chat` route from sprint 01 defines no tools at all, so no tool part has ever been emitted, `needsApproval` has never been set, and `addToolApprovalResponse` has never been called anywhere in the repo. `packages/registry/src/components/ai/tool.logic.ts` declares the seven-state `ToolStatus` union locally and by design (03-data-schema.md), but `grep -rn '@ai-sdk' --include=package.json .` returns zero matches outside `apps/example`, so no test compiles that union against the SDK's own union — a drift on the next upgrade would be invisible. A reviewer today has no screen to open and no tool to approve.  
**Demonstrates:** `UC-AGENT-01`, `UC-AGENT-04`

**Sizing (provisional):** ~7 items · ~21-34 pts — The `/agent` route and screen; two real Zod-`inputSchema` tools on the server route (one ungated for the lifecycle, one `needsApproval: true` for the gate); the client approval wiring; the Vitest type-conformance test compiling our local `ToolStatus` against ai@7's `UIToolInvocation` state union (T-AGENT-004, the PRD's only `[api-contract]` row); an `input-streaming` partial-JSON fixture recorded with sprint 01's recorder; a no-reflow assertion; and a two-platform Maestro flow. The load-bearing detail is small and easy to get wrong: in ai@7.0.93 the approval id lives at `part.approval.id`, NOT `part.toolCallId`, and `addToolApprovalResponse({ id, approved })` must be called with the former. Passing `toolCallId` type-checks, resolves nothing, and reproduces the exact stall this UC exists to prevent.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: sprint-04-agent-surface-completion, sprint-05-clean-app-install-streams-for-real, sprint-07-theming-flip-on-real-product-surfaces, sprint-08-code-and-run-output-surfaces
- Dependent on: Sprint 01

#### PRD Coverage

- T-AGENT-001..T-AGENT-004 (UC-AGENT-01) and T-AGENT-013..T-AGENT-016 (UC-AGENT-04), re-derived onto `apps/example` from their Storybook setups.
- T-AGENT-015 is a `[human-gate]` row — a human on a physical device in light and dark.
- .spec/scenarios/UC-AGENT-04/holdout-the-stalled-agent.scenario.md and UC-AGENT-01/edge-partial-json-while-arguments-stream.scenario.md
- CAP-TOOL-01 full chain: SDK parts → ToolStatus union → badge + disclosure → addToolApprovalResponse.
- VERIFIED against ai@7.0.93: `needsApproval` (tool-level) and `toolApproval` (call-level) both exist; `addToolApprovalResponse({ id, approved, reason? })` is on the useChat/Chat helper surface.

#### Capability Coverage

- `CAP-TOOL-01`

---

### Sprint 06: Reasoning, plan, task, identity, context, artifacts, and run controls against the real agent stream

**Sequence:** 6  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** aisdk-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** On `/agent`, a real reasoning-capable model streams its reasoning into an auto-opened disclosure that collapses when the answer begins and reopens with the full text and a duration, its plan and tasks update status in place without reordering, and a stop control aborts the run mid-stream leaving the partial answer in the transcript.  
**Entrypoint:** `apps/example` `/agent` route on an iOS simulator and an Android emulator, driven by `maestro test maestro/flows/agent-trace.yaml`.  
**Before:** After sprint 03 `/agent` renders tool cards and approvals only. The route requests no reasoning, so no `reasoning` part has ever reached the client; there is no plan/task rendering, no agent identity header, no context-budget indicator, no artifact sheet, and no run controls. Pressing anything mid-stream today does nothing because no `AbortSignal` is wired.  
**Demonstrates:** `UC-AGENT-02`, `UC-AGENT-03`, `UC-AGENT-05`

**Sizing (provisional):** ~6 items · ~13-21 pts — Enable reasoning on the route and confirm reasoning parts actually reach the client (provider- and model-dependent — this is the one item that can force a model swap); reasoning + chain-of-thought lifecycle wiring against the existing pure `reasoning-lifecycle` logic; plan/task status-in-place; agent identity + context-budget popover fed by real `usage` from the stream; artifact sheet with scroll restoration; run controls on a real `AbortSignal`. The abort path is the trap: `onEnd` does NOT fire on abort in v7 — cleanup belongs in `onAbort`, and a stop button wired to `onEnd` leaves the UI stuck in a streaming state with no error.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: sprint-08-code-and-run-output-surfaces
- Dependent on: Sprint 01

#### PRD Coverage

- T-AGENT-005..T-AGENT-012 and T-AGENT-017..T-AGENT-021, re-derived onto `apps/example`.
- .spec/scenarios/journeys/agent-surface.scenario.md — the full agent trace arc.
- Existing pure logic already merged: `packages/registry/src/components/ai/reasoning-lifecycle` + `tests/reasoning-lifecycle.test.ts`.

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 07: CAP-SEC-01: model-authored links and citations open by touch — and a hostile scheme does not open at all

**Sequence:** 7  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** aisdk-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A real model answer carrying sources and inline citations lets the user expand the source list, press a citation to open its popover, and press a source to hand off to the device browser — while a tool that returns a `javascript:` URL and a pathological markdown payload produce a visible blocked state and no navigation at all.  
**Entrypoint:** `apps/example` `/` route on an iOS simulator and an Android emulator, driven by `maestro test maestro/flows/citations-and-link-safety.yaml`.  
**Before:** The `/` screen after sprint 02 renders text, markdown, and code but no suggestion pills, no clarifying questions, no message queue, no checkpoint markers, no source list, and no inline citations. Nothing in `apps/example` has ever called `Linking.openURL`, so the scheme allowlist in the registry's `url` lib has never been exercised against a link a model actually produced — only against strings a test author chose.  
**Demonstrates:** `UC-CHAT-04`, `UC-CHAT-05`

**Sizing (provisional):** ~6 items · ~13-21 pts — Suggestions / questions / queue / checkpoint on the real screen (queue is the interesting one — it must hold a message while a real stream is in flight and send on completion, which touches the `useChat` status machine); sources + inline citation with press-not-hover popovers; open-in-chat handoff; and the CAP-SEC-01 negative leg, which needs a purpose-built hostile tool on the real route so the payload genuinely arrives through the model stream rather than being injected in a test. Existing pure logic (`tests/url.test.ts`, `sources.test.ts`, `inline-citation.test.ts`, `queue.test.ts`) already covers the parsers; this sprint is the device leg.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- T-CHAT-011..T-CHAT-018 (UC-CHAT-04, UC-CHAT-05).
- .spec/scenarios/journeys/chat-navigation.scenario.md and chat-navigation--edge-unreachable-affordances.scenario.md
- CAP-SEC-01: scheme allowlist (https/http/mailto) + length guard, exercised by a negative test.
- Lead reviewer: security-reviewer, per the CAP-SEC-01 owner column.

#### Capability Coverage

- `CAP-SEC-01`

---

### Sprint 08: Every shipped component in loading, empty, error and populated states — on a route, not in a dev tool

**Sequence:** 8  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** frontend-designer  
**Milestone:** —

#### Human Testing Gate

**Gate:** A design-system owner opens the example app's `/gallery` route on a phone, steps through all 40 shipped components in their loading, empty, error and populated states, then switches the app to the alternate token set and confirms every one of them tracks it in both light and dark.  
**Entrypoint:** apps/example route `/gallery` on an iOS simulator and an Android emulator (proposed Route Delta — see the note below).  
**Before:** No route anywhere lists the shipped components. The only place a state matrix exists is 14 developer story files (~180KB) inside a Storybook harness, which is a banned gate entrypoint. `packages/registry/src/examples/` does not exist, so the `registry:example` items the PRD's own repo layout calls for have never been emitted — `public/r/{nativewind,uniwind}/` carry 56 items and not one of them is an example. A design-system owner asked today to review every component in loading / empty / error / populated has no product surface to open, and a consumer who installs an item gets no runnable demonstration of it.  
**Demonstrates:** `UC-REG-04`

**Sizing (provisional):** ~9 items · ~21-34 pts — 40 components x 4 states, but the fixtures already exist inside the 14 harness story files, so the bulk is relocation into `packages/registry/src/examples/*` as `registry:example` items plus a build-registry change to emit them for both engines. The genuinely new work is the states the stories skip — most families have populated and some have error, few have deliberate loading and empty — plus a phone-legible index and navigation for 40 entries, plus the two-platform two-scheme capture. Sized as a large relocation with a real authorship tail, not as 160 new fixtures.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: sprint-03-one-design-system-side-by-side
- Dependent on: Sprint 01

#### PRD Coverage

- .spec/prds/mvp/08-uc-reg.md UC-REG-04 AC-3, AC-4
- .spec/prds/mvp/12-e2e-testing-criteria.md T-REG-015, T-REG-016
- .spec/scenarios/UC-REG-04/holdout-every-state-not-just-populated.scenario.md
- .spec/scenarios/UC-REG-04/holdout-theming-inside-storybook.scenario.md (re-derived onto `/gallery`)
- .spec/prds/mvp/01-scope.md (example app covering all four states — in scope)
- .spec/prds/mvp/11-technical-requirements/11-routing.md (repo layout: packages/registry/src/examples/*.tsx published as registry:example)

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 09: Every shipped item, in every state, on Android and web and inside Expo Go

**Sequence:** 9  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** react-native-ui-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger can walk all 56 shipped registry items through their loading, empty, error and populated states from apps/example's /gallery route on an Android emulator, in a desktop browser served from `expo export -p web`, and inside an Expo Go session — flipping the device to dark mode at any point and seeing every surface follow in the same frame.  
**Entrypoint:** apps/example route /gallery, reached three ways: `npx expo run:android` on Pixel_7_API_34; `npx expo export -p web && npx serve dist` opened at http://localhost:3000/gallery in Chrome; and `npx expo start --go` scanned into Expo Go on a physical iPhone.  
**Before:** design/manifest.json's platforms key contains `mobile-ios` and nothing else — every device capture in this repo is an iOS simulator, so Android and web are asserted by the PRD and evidenced nowhere. There is no /gallery route because sprint 01 builds only /. No shipped item has ever been loaded in Expo Go, so the Expo Go / dev-client split in 06-external-dependencies.md is an untested architectural claim. And registry.json carries `meta: null` and `docs: null` on all 56 items, and `speech-input`, `audio-player` and `transcription` declare `dependencies: null` — so UC-REG-02 AC-2 ('see its peer dependency and required permissions declared in its registry entry') currently has literally no data behind it for the entire VOICE group. Only web-preview declares a native peer.  
**Demonstrates:** `UC-REG-02`, `UC-REG-04`, `UC-FOUND-02`

**Sizing (provisional):** ~9 items · ~21-34 pts — One /gallery route driving 56 items x 4 states (large but mechanical); the Android leg (insets, back gesture, keyboard, ripple) and the web leg (expo export -p web, react-native-web fallbacks, no-hover-only) are each a real second pass; a genuine Expo Go run that proves the core set loads with no dev client; adding meta.nativePeerDependencies and meta.permissions to the registry entries that need them plus a CI check that the declaration matches the source's actual imports; and the dark-mode flip re-verified on Android and web where it has never been observed. Sized from the 14 merged component waves: a full-set sweep has consistently cost more than a single-component pass.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: sprint-03-the-keyboard-and-the-500-message-android-transcript, sprint-04-live-web-preview-through-a-native-webview, sprint-05-voice-on-a-dev-client
- Dependent on: Sprint 01

#### PRD Coverage

- .spec/prds/mvp/08-uc-reg.md — UC-REG-02 AC-1..AC-4
- .spec/prds/mvp/12-e2e-testing-criteria.md — T-REG-005, T-REG-006, T-REG-007, T-REG-008, T-REG-015, T-FOUND-005, T-FOUND-006
- .spec/scenarios/UC-REG-02/holdout-expo-go-for-the-core.scenario.md
- .spec/scenarios/UC-REG-02/holdout-web-parity-for-gestures.scenario.md
- AGENTS.md — 'Web | Required | RNR is universal; a component that only works on native is not done'
- UC-REG-04 DECISION — move (a) from the brief: its demonstrable value is re-derived onto apps/example. The loading/empty/error/populated matrix (AC-3), the interactive prop surface (AC-1's substance), the browser rendering (AC-2's substance) and the token/dark flip (AC-4) all become the /gallery route on a real product surface. AC-5 ('every completion cites an on-device story') is re-read as 'every completion cites Maestro evidence from sprint 01's flows on a real device'. The two ACs that name the developer tool literally are returned in ucs_not_demonstrated for explicit user deferral rather than silently satisfied by a banned entrypoint.

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 10: Real microphone, real permission prompt, real playback — the dev-client half of the library

**Sequence:** 10  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** react-native-ui-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger can install a dev-client build of apps/example on a physical iPhone and an Android device, hold the mic control and speak, watch their own words appear as a live transcript they can edit before sending, then play the generated reply through a scrubbable bar that keeps playing while they scroll the transcript — and can deny the microphone permission and get an explicit denied state instead of a dead button.  
**Entrypoint:** apps/example built as a dev client (`npx expo prebuild && npx expo run:ios --device` / `run:android --device`) on physical hardware, routes / and /voice.  
**Before:** The three voice components are prop-driven seams with no native module of their own — speech-input takes an injected SpeechRecorder, audio-player takes injected transport callbacks, transcription is display-only. That is the right architecture and it means NOTHING has ever driven them with a real microphone or a real audio file: registry.json shows dependencies: null on all three. No dev client has ever been built in this repo; the Expo Go / dev-client split in 06-external-dependencies.md is a design decision that has not been executed once. expo-speech-recognition and expo-audio are not installed anywhere. A reviewer today can hold the mic control in the developer harness and observe an animation, which proves the pulse rings and nothing about speech.  
**Demonstrates:** `UC-VOICE-01`, `UC-VOICE-02`

**Sizing (provisional):** ~8 items · ~21-34 pts — First dev client in the repo — prebuild, config plugins, signing, and two physical devices, none of which exists yet and all of which cost real time the first time. A real SpeechRecorder adapter over expo-speech-recognition (a community package with a config plugin, not first-party Expo) plus a real player over expo-audio. The permission-denied path on both platforms, including Android's permanently-denied case which iOS has no analogue for. The native input-route picker for AC-3, which is genuinely different on iOS and Android. Registry meta declaring the audio modules and the NSMicrophoneUsageDescription / RECORD_AUDIO permissions that UC-VOICE-01 AC-4 requires and that no entry declares today. Physical hardware is unavoidable: a simulator microphone is not evidence.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- .spec/prds/mvp/09-uc-voice.md — UC-VOICE-01 AC-1..AC-4, UC-VOICE-02 AC-1..AC-4
- .spec/prds/mvp/12-e2e-testing-criteria.md — T-VOICE-001..T-VOICE-008
- .spec/scenarios/UC-VOICE-01/edge-microphone-permission-denied.scenario.md
- .spec/scenarios/UC-VOICE-01/holdout-no-enumerable-devices.scenario.md
- .spec/scenarios/UC-VOICE-01/holdout-only-final-transcripts.scenario.md
- .spec/prds/mvp/11-technical-requirements/06-external-dependencies.md — 'expo-speech-recognition | DEV CLIENT REQUIRED'; audio-player/transcription/voice-selector need expo-audio
- packages/registry/registry.json — speech-input, audio-player, transcription all carry dependencies: null and meta: null (verified 2026-09-04)

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 11: A real native webview with a real error state, and model content that cannot open a hostile URL

**Sequence:** 11  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** react-native-ui-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger can open apps/example's /preview route on an iOS simulator and an Android emulator, watch a real https page load inside react-native-webview with a working URL bar and reload control, type a hostname that does not resolve and see an explicit error card instead of a white view, and paste a javascript: URL from a model message and watch it be refused rather than executed.  
**Entrypoint:** apps/example route /preview on both `npx expo run:ios` and `npx expo run:android`, plus the RNR CLI install command run against web-preview.json in a scratch Expo app that has never installed react-native-webview.  
**Before:** apps/example has no /preview route. web-preview has only ever rendered inside apps/harness, whose metro.config.js contains a hand-written special case redirecting react-native-webview resolution into the harness's own node_modules — that shim is the harness pretending to be a consumer, and it has never been tested against a real consumer's resolution. No scheme allowlist exists anywhere in the repo, so CAP-SEC-01's negative test does not run and a javascript: URL arriving in a model message has nothing standing in its way. The AC-4 claim that the rest of the library builds without the webview dependency has never been executed in an app that genuinely lacks it.  
**Demonstrates:** `UC-CODE-03`

**Sizing (provisional):** ~6 items · ~13-21 pts — The /preview route and its real navigation state; a genuine failure path on both platforms (iOS and Android surface webview load errors through different callbacks, so the error card needs two verifications, not one); the scheme allowlist plus a length guard in the shared link-handling path with a negative test that proves refusal; a scratch-app install proving AC-2 declares the peer at install time and AC-4 builds without it; and web-preview's own web-platform story, since react-native-webview on react-native-web degrades to an iframe and that behavior must be stated rather than discovered. react-native-webview is pinned at 13.16.1 — npm latest 14.0.1 is a MAJOR and must not be taken.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- .spec/prds/mvp/06-uc-code.md — UC-CODE-03 AC-1..AC-4
- .spec/prds/mvp/12-e2e-testing-criteria.md — T-CODE-009..T-CODE-012
- .spec/prds/mvp/11-technical-requirements/09-capability-chains.md — CAP-SEC-01: 'Scheme allowlist (https/http/mailto) + a length guard, exercised by a negative test'
- .spec/scenarios/UC-CODE-03/edge-webview-is-not-a-sandboxed-iframe.scenario.md
- .spec/scenarios/UC-CODE-03/holdout-build-without-the-dependency.scenario.md
- apps/harness/metro.config.js — the react-native-webview peer-resolution special case that only exists because the harness is not a real consumer

#### Capability Coverage

- `CAP-SEC-01`

---

### Sprint 12: Coding-agent output rendered from real tool results at phone width

**Sequence:** 12  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** aisdk-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A real coding-agent tool call on `/agent` returns a file tree, terminal output with ANSI colour, a test summary, and a stack trace, and each renders legibly at phone width with one-tap copy — and a live web preview loads a URL in a native webview and shows an explicit error state when the URL fails.  
**Entrypoint:** `apps/example` `/agent` route on an iOS simulator and an Android emulator, driven by `maestro test maestro/flows/coding-agent.yaml`.  
**Before:** The terminal, file-tree, test-results, stack-trace, environment-variables, package-info, and web-preview components have never received a payload from a real tool result — their only exercise is Vitest over hand-written strings in `tests/` and stories in the harness. `/agent`'s route defines no tools that return this shape of output.  
**Demonstrates:** `UC-CODE-01`, `UC-CODE-02`, `UC-CODE-03`

**Sizing (provisional):** ~6 items · ~13-21 pts — Real tools on the route that return each output shape with a Zod `inputSchema` and a typed result (this is the AI-seam part — the components must consume `part.output`, not a prop the screen invented); the seven component wirings; webview peer-dependency handling including the build-without-it case; and a phone-width legibility pass. The pure parsers (`stack-trace`, `terminal` ANSI tokenizer, `test-results`) already carry real Vitest coverage, so this sprint is wiring and device evidence rather than logic.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- T-CODE-001..T-CODE-012.
- .spec/scenarios/journeys/coding-agent.scenario.md and coding-agent--edge-dense-output-at-phone-width.scenario.md

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 13: The stranger test: a reviewer cannot say which library drew which surface, and every difference they name is on the record

**Sequence:** 13  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** frontend-designer  
**Milestone:** —

#### Human Testing Gate

**Gate:** A design-system owner holds one phone showing an RNR reference screen and the AI Elements chat screen and cannot say which library drew which — and every difference they do point at resolves to a row in the published deviation ledger rather than to an accident.  
**Entrypoint:** apps/example on a physical phone (and the iOS simulator / Android emulator for the captures), routes `/` and `/rnr-reference`, in both light and dark.  
**Before:** `design/style-parity-report.md` scores 40 of 40 components as deviating from the pinned web reference — 28 MAJOR, 12 MINOR, roughly 330 line-anchored findings, zero components at byte parity. `design/style-parity-remediation.md` shows wave A complete; wave B is closed by sprint-00; wave C (rows 9-14: commit and artifact container tokens, the reasoning label badge, voice-selector preview controls, the environment-variables header rows, the attachments inset, the selector substrate padding and chevron and check placement) is untouched. Report §4 lists four record-vs-ship mismatches where the PRD's published verdict contradicts what actually ships — `agent` and `question` are recorded as at-parity but are re-designed, `confirmation` re-homed from Alert to Card unrecorded, and `checkpoint`'s own header comment misdescribes the web source. There is no RNR reference screen anywhere in this repository, so the side-by-side that UC-FOUND-04 AC-1 is written around has never been physically possible, and no reviewer has ever been asked the question.  
**Demonstrates:** `UC-FOUND-04`

**Sizing (provisional):** ~7 items · ~13-21 pts — Wave C is six rows of small value drift across nine components — cheap individually, but each needs its device capture. The four §4 ledger repairs are documentation edits to the PRD verdict table, not code. The real cost sits in three places: an RNR reference screen built from RNR's own primitives so the side-by-side has a legitimate other half; the measurement pass the holdouts demand (every control's height against the h-11 trap, disclosure tempo against an RNR accordion on the same screen, nested gutters where a tool card sits inside an artifact card); and the accessibility device pass — reduced motion on every looping animation, and the streaming screen-reader contract, which the PRD flags as unprovable from source review and which no capture will ever surface.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- .spec/prds/mvp/07-uc-found.md UC-FOUND-04 AC-1..AC-4
- .spec/prds/mvp/12-e2e-testing-criteria.md T-FOUND-012, T-FOUND-013, T-FOUND-014 (three of the nine human-gate rows), T-FOUND-015
- .spec/scenarios/UC-FOUND-04/* (core side-by-side, nested-gutters edge, motion-tempo holdout, 44pt-trap holdout, stranger-test holdout)
- design/style-parity-remediation.md rows 9-14 (wave C) and the ledger-repair step of its sequencing section
- design/style-parity-report.md §4 (record-vs-ship mismatches) and §5 recommendations 3 and 4
- .spec/prds/mvp/11-technical-requirements/07-ui-infrastructure.md (visual parity contract table; density reconciliation; accessibility)

#### Capability Coverage

- (none declared by this sprint)

---

### Sprint 14: An upstream RNR change cannot silently break a consumer's install

**Sequence:** 14  
**Status:** Planned  
**Fidelity:** provisional  
**Proposed by:** react-native-reusables-planner  
**Milestone:** —

#### Human Testing Gate

**Gate:** A maintainer installs the full registry into a clean app against RNR's LIVE published registry rather than a pinned snapshot, boots it on a device and sees it render — and when an RNR item's shape is deliberately changed under it, the same install goes red with a named error instead of shipping a broken component to consumers.  
**Entrypoint:** A consumer Expo SDK 57 app whose RNR primitives are resolved from the live reactnativereusables.com registry, booted on an iOS simulator  
**Before:** We depend on 14 RNR items by live URL (avatar, badge, button, card, collapsible, dropdown-menu, icon, input, native-only-animated-view, popover, progress, separator, switch, text) with no version floor declared anywhere and nothing watching them. RNR can change any of those tomorrow and the first person to find out is a consumer whose add pulls a component that no longer composes. There is no scheduled workflow of any kind — .github/workflows/ holds exactly one file, ci.yml.  
**Demonstrates:** `UC-REG-05`

**Sizing (provisional):** ~4 items · ~8-13 pts — A scheduled workflow that scaffolds the clean app from the LIVE RNR registry (reusing sprint-01's install script rather than forking it) and typechecks; a device boot of that live-resolved app so a runtime-only break is caught too; the deliberate-break RED proof; a failure path that opens an issue naming the drifted item rather than emailing a red X nobody reads. Small because sprint-01 already built the install script this reuses — if it grows past 13, the reuse was not real and that is the finding.

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`), against the codebase as it is then.

#### Dependencies

- Blocks: —
- Dependent on: Sprint 01

#### PRD Coverage

- T-REG-021
- T-REG-022
- .spec/prds/mvp/11-technical-requirements/09-capability-chains.md (CAP-UPSTREAM-01)

#### Capability Coverage

- `CAP-UPSTREAM-01`

---

## Next Steps

1. Resolve the **Open Gaps** above — one authoring round covers `UC-FOUND-03` and the duplicate claims.
2. `/kb-sprint-tasks-plan .spec/prds/mvp/ROADMAP.md` — expand sprint 01. It is complete and needs nothing from the gaps.
3. `/kb-run-sprint sprint-01-installed-app-cold-boots-on-both-platforms`
4. Sprint 01's entry condition: land or park the in-flight wave-B remediation (67 changed paths in the working tree) before dispatch.
