---
roadmap: 1
project: rnr-ai-elements MVP — distribution
generated: 2026-09-04
prd: .spec/prds/mvp/README.md (v2.0.0)
sprint_count: 4
commit_horizon: 1
pr_sequencing: false
scope: distribution only — see Scope
---

# Sprint Roadmap: rnr-ai-elements — distribution

## Scope

**This roadmap covers packaging and distribution only.** The component work is done: 56 registry items, both engines, merged across 14 build waves and verified on an iOS simulator.

What stands between that and a consumer actually installing it is four sprints, and three verified defects are most of the reason any of them exist:

| Defect | Evidence | Lands in |
|---|---|---|
| The alias rewrite has never run | 254 `@/registry/{engine}/…` imports across 50 of 56 emitted items. Resolves in `apps/harness` only because the harness has that tsconfig path; a consumer does not. If the CLI does not rewrite it, every install lands dangling imports and the app dies at boot. | Sprint 01, `TASK-F4` |
| The consumer theme obligation is undeclared | 26 `--color-*` entries live only in `apps/harness/src/global.css`. The registry declares none; the RNR CLI does not merge theme blocks. `file-tree.json` and `transcription.json` ship a comment telling consumers their classes are "safelisted consumer-side" — pointing at a harness file they will not have. A `tool` success badge installs colorless, with no error. | Sprint 01, `TASK-F7` |
| Two CI gates do not run | `package.json` declares `check:tokens` → `scripts/check-tokens.ts`, which does not exist. CI invokes neither it nor `check:registry`. | Sprint 03 |

**Deliberately not scheduled:** ten sprints re-verifying components that already work — streaming, agent surface, voice, code output, theming, the side-by-side. Those exist as authored specialist proposals in **Not scheduled** below and in `.tmp/kb-sprint-plan/mvp/proposals/`. They were generated because the planning skill's coverage gate demands every PRD use case be demonstrated by a sprint gate, and this PRD is not greenfield — its components were verified on device across 14 waves, just not by a *sprint* gate. Re-proving them at a new altitude is real work, but it is not distribution and it is not what this roadmap is for.

**Planning provenance.** Four specialists resolved from `AGENTS.md` were dispatched in parallel, all four delivered, and all four went through one fusion round; proposals and fusion responses are staged verbatim under `.tmp/kb-sprint-plan/mvp/`. The orchestrator merged, sequenced and rendered — it authored no gate, step or task.

## Sprint Sequence

| # | Sprint | Fidelity | Gate | Tasks | Demonstrates | Dependencies | Status |
|---|--------|----------|------|-------|--------------|--------------|--------|
| 01 | [Sprint 01: Installed app cold-boots on both platforms](#sprint-01) | committed | A stranger runs one RNR CLI command against a tag-pinned URL, cold-boots the example a… | 8 | `UC-REG-01` | — | Planned |
| 02 | [Sprint 02: Android, web and Expo Go parity for the shipped set](#sprint-02) | provisional | A stranger can walk all 56 shipped registry items through their loading, empty, error … | ~9 | `UC-REG-02`, `UC-REG-04`, `UC-FOUND-02` | 01 | Planned |
| 03 | [Sprint 03: Published ledger and install page](#sprint-03) | provisional | A web developer with a shipping AI Elements app opens the published install page, look… | ~5 | `UC-REG-03`, `UC-REG-06` | 01 | Planned |
| 04 | [Sprint 04: Upstream RNR drift guard](#sprint-04) | provisional | A maintainer installs the full registry into a clean app against RNR's LIVE published … | ~4 | `UC-REG-05` | 01 | Planned |

**REG-group coverage:** `UC-REG-01` → 01 · `UC-REG-02` → 02 · `UC-REG-03`, `UC-REG-06` → 03 · `UC-REG-05` → 04 · `UC-REG-04` → parked (see Open decisions).

> Sprint 01 installs four items, not 56. `aisdk-planner` proposed the full-56 both-engine install into a throwaway `$TMPDIR` app as `TASK-F4`'s definition of done — outside the stranger-runnable steps, ~2 points — which converts "we think the rewrite works" into "we ran it on all 254 imports". Recommended; it is a task acceptance line, not another sprint.

---

## Per-Sprint Details

<a id="sprint-01"></a>

### Sprint 01: Installed app cold-boots on both platforms

*A CLI-installed AI Elements transcript cold-boots and renders on iOS and Android, and the same flow fails when the seed is removed*


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

**Test Steps:** *(each runnable by a stranger verbatim)*

1. Run `pnpm install` from the repository root — expect exits printing `Done in` and a duration, and the resolution includes a workspace package named `example`.   `exercises: TASK-F1`
2. Run `cd apps/example && npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/message.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/prompt-input.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/tool.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/context.json` — expect the CLI prints a `Created` line for each of the four items AND for RNR's own `text`, `avatar`, `button` and `icon` pulled from reactnativereusables.com in the same command. Any `404` or `Cannot find module` is a FAIL — it means the v0.1.0 tag or a transitive registryDependency does not resolve Also expect a `Created` line for `components/ui/popover.tsx`.   `exercises: TASK-F2, TASK-F3`
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
13. Run `bash tests/sprint-01/install-dirty-app.test.sh --prepare` to create a hostile Expo app in `$TMPDIR` carrying its own `components/ui/button.tsx`, npm-latest `react-native-gesture-handler`, and no PortalHost — then re-run the step 2 add command in that app WITHOUT `--yes` — expect the CLI to pause on a prompt naming `components/ui/button.tsx` as a file it would overwrite, before any file is written.   `exercises: TASK-F3`
14. Answer that prompt with `n`, then run `npx expo-doctor` in the hostile app — expect a non-zero exit and output naming `react-native-gesture-handler` and the Expo SDK 57 expected version `~2.32.0`.   `exercises: TASK-F3`
15. Answer the add prompt with `y` on a re-run, launch the hostile app, and open the context surface — expect either a rendered popover OR an install-time message naming `PortalHost` as a prerequisite. A surface that renders NOTHING with no error is a FAIL: that is the landmine ledger's worst silent failure and the reason this step exists.   `exercises: TASK-F3`

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
| TASK-F8 | Stand up Maestro with a cold-boot flow on both platforms and a negative control watched failing | `react-native-ui-implementer` | 13 | G | ⬜ Pending |

**Waves:** A(1) → B(1) → C(1) → D(2) → E(1) → F(1) → G(1) — 7 waves over 8 tasks · 43 pts

> Orchestrator edits, mechanical and disclosed: `TASK-F2` given `depends_on: [TASK-F1]` to serialize a wave-A write collision on `package.json`; each step's expected value joined inline from the author's parallel array; three steps' leading verb `Read` → `Look at` (banned first word). No action or expected value changed.

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

<a id="sprint-02"></a>

### Sprint 02: Android, web and Expo Go parity for the shipped set

*Every shipped item, in every state, on Android and web and inside Expo Go*


**Sequence:** 2  
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

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`).

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

- (none declared)

---

<a id="sprint-03"></a>

### Sprint 03: Published ledger and install page

*One published page answers what ships, what does not, and what it needs*


**Sequence:** 3  
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

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`).

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

#### Capability Coverage

- (none declared)

---

<a id="sprint-04"></a>

### Sprint 04: Upstream RNR drift guard

*An upstream RNR change cannot silently break a consumer's install*


**Sequence:** 4  
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

> Test steps and the task table are authored when this sprint becomes next (`/kb-sprint-tasks-plan`).

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

## Open decisions

- **`UC-REG-04` (Storybook demonstrates every component and every state).** All four lenses re-derived it onto a real surface; two independently found AC-1, AC-2 and AC-5 name Storybook as their *subject*, not their venue, so they cannot move without changing the claim. Needs explicit deferral or a PRD reword. The re-derived half (`AC-3`, `AC-4`) lives in the parked `every-state-on-a-real-surface` sprint.
- **`UC-REG-05` in sprint 01.** `aisdk-planner` and `react-native-reusables-planner` both proposed two cheap steps that would let sprint 01 prove it — run the same install in an app that never had `rnr init`; expect a loud failure and zero files written. The base author left it to sprint 04. Two steps, and it closes the UC three sprints earlier.
- **Two AI-SDK findings are specialist-verified but unconfirmed** (no npm fetch here): `toUIMessageStreamResponse()` deprecated in `ai@7.0.93`, named in three CONSTITUTION files; and the approval id at `part.approval.id` rather than `part.toolCallId`. Neither affects this roadmap — both land in parked streaming/agent work.

---

## Not scheduled

Authored specialist proposals for the component-verification work, kept so nothing is lost. Each carries its own gate, entrypoint, `before` and size band; full text is in `.tmp/kb-sprint-plan/mvp/proposals/`. Schedule any of these by moving it into the sequence above.

| Proposal | Lens | Demonstrates | ~pts |
|---|---|---|---|
| sprint-01-theme-flip-six-pairs | `frontend-designer` | `UC-FOUND-01`, `UC-FOUND-02` | 21-34 |
| sprint-02-streaming-transcript-on-real-tokens | `aisdk-planner` | `UC-CHAT-01`, `UC-CHAT-02`, `UC-CHAT-03` | 21-34 |
| sprint-03-tool-lifecycle-and-real-gated-approval | `aisdk-planner` | `UC-AGENT-01`, `UC-AGENT-04` | 21-34 |
| sprint-04-agent-surface-completion | `aisdk-planner` | `UC-AGENT-02`, `UC-AGENT-03`, `UC-AGENT-05` | 13-21 |
| sprint-06-chat-navigation-and-link-safety | `aisdk-planner` | `UC-CHAT-04`, `UC-CHAT-05` | 13-21 |
| sprint-02-every-state-on-a-real-surface | `frontend-designer` | `UC-REG-04` | 21-34 |
| sprint-05-voice-on-a-dev-client | `react-native-ui-planner` | `UC-VOICE-01`, `UC-VOICE-02` | 21-34 |
| sprint-04-live-web-preview-through-a-native-webview | `react-native-ui-planner` | `UC-CODE-03` | 13-21 |
| sprint-08-code-and-run-output-surfaces | `aisdk-planner` | `UC-CODE-01`, `UC-CODE-02`, `UC-CODE-03` | 13-21 |
| sprint-03-one-design-system-side-by-side | `frontend-designer` | `UC-FOUND-04` | 13-21 |

`UC-FOUND-03` (reuse RNR first, create a primitive only on demand) is demonstrated by no proposal here — its owning sprint was withdrawn during fusion. It needs an authoring round if you ever schedule the verification track.

## Next Steps

1. `/kb-sprint-tasks-plan .spec/prds/mvp/ROADMAP.md` — expand sprint 01.
2. `/kb-run-sprint sprint-01-installed-app-cold-boots-on-both-platforms`
3. Entry condition first: land or park the in-flight wave-B remediation (67 changed paths).
