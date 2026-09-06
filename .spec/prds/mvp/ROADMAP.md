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
| 02 | [Sprint 02: Android, web and Expo Go parity for the shipped set](#sprint-02) | committed | A stranger can walk all 56 shipped registry items through their loading, empty, error … | 13 | `UC-REG-02`, `UC-REG-04`, `UC-FOUND-02` | 01 | Planned |
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
**Fidelity:** committed  
**Proposed by:** react-native-ui-planner (fused with react-native-reusables-planner, frontend-designer)  
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger can walk all 56 shipped registry items through their loading, empty, error and populated states from apps/example's /gallery route on an Android emulator, in a desktop browser served from `expo export -p web`, and inside an Expo Go session — flipping the device to dark mode at any point and seeing every surface follow in the same frame.  
**Entrypoint:** apps/example route /gallery, reached three ways: `npx expo run:android` on Pixel_7_API_34; `npx expo export -p web && npx serve dist` opened at http://localhost:3000/gallery in Chrome; and `npx expo start --go` scanned into Expo Go on a physical iPhone.  
**Before:** `ls apps/` returns exactly `harness/` and `harness-nativewind/` — no apps/example until sprint-01 lands, no `/gallery` route anywhere in the repo, no `.maestro/`, no `tests/sprint-01/` or `tests/sprint-02/` lane. packages/registry/registry.json holds 56 items and not one carries a `meta` or `docs` key — the RegistryItem type has no meta field, so neither do the 112 emitted public/r files, and the per-engine index strips each item to name/type/title: UC-REG-02 AC-2 has literally no data behind it, and the declarations that do exist are already out of sync with the source's actual imports (speech-input imports react-native-reanimated while declaring no dependencies; prompt-input imports expo-document-picker and expo-image-picker while declaring only react-native-safe-area-context) with nothing checking either direction. design/manifest.json has real gates and device evidence under mobile-ios only; the mobile-android / web-mobile / web-desktop keys are boilerplate with every gate 'pending' and their goldens directories (design/goldens/mobile-android/, design/goldens/web-desktop/) do not exist — no Android or web pixel has ever been produced by this repo, the dark-mode flip has only ever been observed as iOS simulator pairs (never on Android, never in a browser, never mid-stream), and the documented web theme defect means no themed AI surface has ever rendered on web at all. The loading/empty/error/populated vocabulary lives only as labeled boards inside the developer-only Storybook harness — no product surface demonstrates any state of any item, so a stranger today has nothing to open. 51 of the 56 items have never been installed into any consumer tree, no shipped item has ever been loaded in Expo Go, and nothing validates registry metadata against source imports or scans shipped source for web-only constructs end to end.  
**Demonstrates:** `UC-REG-02`, `UC-REG-04`, `UC-FOUND-02`

> **Entry conditions:** Sprint-01 landed (apps/example, v0.1.0 tag, .maestro/ + e2e:smoke scripts, sprint-01 goldens); working tree clean at dispatch; a physical iPhone reachable for the Expo Go leg (steps 20-21).

**Test Steps:** *(each runnable by a stranger verbatim)*

1. Run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --install-only` — expect the script installs the 51 items sprint-01 did not (printing one `Created components/ai/<name>.tsx` line per newly added item from the v0.1.0 tag URLs) plus `npx expo install` of the peer set, and finishes with the line `56/56 gallery items present` and exit 0. Expect the resolved `react-native-webview` version printed as `13.16.1` — `14.0.1` (npm latest) is a FAIL. Expect the script's graph check to print `dev-client modules in graph: none` — any mention of `react-native-enriched-markdown`, `react-native-streamdown` or `expo-speech-recognition` in apps/example's dependency graph is a FAIL, because it would make the Expo Go leg impossible. Any `404` means a tag URL is broken.   `exercises: TASK-P1`
2. Boot the Pixel_7_API_34 emulator and leave it running, then run `cd apps/example && npx expo run:android` — expect the app builds and launches with no red error screen, specifically NO `Unable to resolve module '@/registry/uniwind/components/ui/text'` or any sibling of it (sprint-01 proved 5 items; this is the first time the other 51 resolve inside a consumer tree).   `exercises: TASK-P1, TASK-P2`
3. Look at the app header on the screen that opens — expect the header still reads `AI Elements Example` and shows a `Gallery` control beside it; tap `Gallery` — expect the /gallery index opens listing item rows under five section headers reading `Chat`, `Agent Surface`, `Specialist`, `Base Primitives` and `Logic`, each header followed by its item count, and the footer counter (selected by id `gallery-counter`) reads exactly `56 / 56`. A counter reading any other number means the gallery manifest and the shipped registry have drifted — that is a FAIL.   `exercises: TASK-P2, TASK-P7`
4. Tap the `tool` card — expect a detail screen titled `tool` opens with a four-segment control at the top reading `Loading`, `Empty`, `Error`, `Populated`, `Populated` active, showing the rounded pill reading `Completed` with a GREEN check glyph (grey or colorless is a FAIL — sprint-01's theme obligation now applies to all 56). Tap `Loading` — expect the panel swaps in place with no screen transition, the pulse animating. Tap `Empty` — expect the literal title `No tool calls yet` and description `Ask something that uses a tool to see it here.`. Tap `Error` — expect the heading `Error` in destructive color and the body `The tool call failed to complete.`. Then perform the Android back gesture from the left screen edge — expect it returns to the gallery index in ONE press with the scroll position preserved.   `exercises: TASK-P2, TASK-P3, TASK-P7`
5. On the `conversation` detail screen, tap the control reading `Walk all states` — expect the four segments advance by themselves in the order Loading, Empty, Error, Populated, dwelling about two seconds each, and after returning to the index the `conversation` row's four coverage dots are all filled. Then open the `model-selector` item with `Populated` active and tap the model chip — expect a bottom sheet rises OVER the gallery chrome with the area behind it dimmed, listing `Claude Opus 4`, `GPT-4o` and `Gemini 2.5 Pro`.   `exercises: TASK-P2`
6. Run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` from the repository root — expect Maestro prints `Flow Passed` and the script's final line reads `56 items x 4 states asserted (android)`, and `design/goldens/mobile-android/sprint-02/gallery-matrix.png` exists — the first full-set Android matrix capture this repo has ever produced.   `exercises: TASK-P2, TASK-P13`
7. Force-quit the app from the Android launcher, leave Metro running, and run the step 6 command a second time — expect `Flow Passed` again, proving the 224-assertion walk runs against a cold app launch rather than a warm reload.   `exercises: TASK-P13`
8. With the `conversation` detail screen open on the emulator, run `adb shell "cmd uimode night yes"` — expect EVERY visible surface (header, card chrome, badges, empty atom, code block, and the labeled scheme strip at the gallery header) flips to dark in the same frame with nothing retaining a light background or border; then run `adb shell "cmd uimode night no"` — expect the same surfaces flip back together. A surface that stays light for even a visible beat, or stays light permanently, is a FAIL — dark mode has never before been observed on Android in this repo.   `exercises: TASK-P2, TASK-P3, TASK-P8`
9. On the `conversation` detail screen, tap its `replay stream` control (id `gallery-stream-replay`) and, while text is still visibly appending, run `adb shell "cmd uimode night yes"` — expect the bubbles and surrounding chrome flip dark in the same frame AND the stream keeps appending tokens without interruption, restart or a dropped frame of the scroll pin; run `adb shell "cmd uimode night no"` and expect the stream still continues.   `exercises: TASK-P2, TASK-P8, TASK-P13`
10. On the `/gallery` index (any leg), look at the requirement rows on the cards — expect the `web-preview` card shows a native-peer row reading `react-native-webview`, a permissions row reading `none`, and an Expo Go badge; the `speech-input` card shows a permissions row reading `microphone` and a dev-client note row reading `dev client — expo-speech-recognition`; the `message` card shows a dev-client note row reading `dev client — react-native-enriched-markdown / react-native-streamdown` — the four opt-in capabilities visibly named in the walk rather than silently absent.   `exercises: TASK-P6, TASK-P12`
11. Run `pnpm exec vitest run tests/sprint-02/registry-meta.test.ts` from the repository root — expect exit 0 with every test `passed` and a summary line reading `56 items x 2 engines — 0 used-but-undeclared, 0 declared-but-unused, 0 invalid permissions`, and expect the committed RED log `design/goldens/sprint-02/registry/meta-declarations.json.RED.log` names `speech-input` + `react-native-reanimated` and `prompt-input` + `expo-document-picker` — those undeclared imports are live today and this is the step that proves they were fixed, not hidden.   `exercises: TASK-P6, TASK-P9`
12. Run `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"` — expect exit 0 with a summary line reading `0 hits — DOM elements: 0, iframes: 0, hover-without-active: 0, raw lucide JSX: 0` across the 56 sources and both emitted trees, INCLUDING the self-proof case named `implanted <div> is caught` in the output, which plants a DOM element, an iframe, a hover-only class and a raw lucide JSX tag in in-memory samples and asserts the checker flags each. A suite without that case passing is a scan that has never been seen to fail.   `exercises: TASK-P11`
13. Run `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts -t "UC-REG-04/core-happy-path"` — expect exit 0 with a summary line reading `parity — 56 items x 2 engines — 56 name matches, 0 divergent beyond the engine token, meta identical on all 56`.   `exercises: TASK-P10`
14. Run `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts -t "UC-REG-04/edge-web-story-passes-device-story-fails"` — expect exit 0 and a line reading `negative control: seeded device-only divergence caught — comparator reported divergent: 1`. A suite that passes without reporting the seeded divergence is a FAIL: the comparator asserts nothing and the parity gate is theatre.   `exercises: TASK-P10`
15. Run `cd apps/example && npx expo export -p web && npx serve dist` — expect the export exits 0 with no `Export encountered an error` line, then with `serve` running open `http://localhost:3000/gallery` in Chrome — expect the same grouped index as the emulator, the footer counter reads `56 / 56`, and tapping the `tool` card shows the same four labeled state sections rendering through react-native-web.   `exercises: TASK-P4`
16. In Chrome on the `web-preview` item screen with `Populated` active — expect the panel shows the designed fallback: an empty-state composition titled `Needs a device build` with a description naming iOS and Android as the targets where it renders — never a blank rectangle.   `exercises: TASK-P4, TASK-P7`
17. In Chrome on http://localhost:3000/gallery, open Developer Tools, open the Command Menu, choose `Show Rendering`, and set `Emulate CSS media feature prefers-color-scheme` to `dark` — expect every gallery surface flips dark in the same frame, identically to the emulator flip in step 8; set it back to `no-preference` — expect every surface flips back. A surface that only re-themes after navigation is a FAIL.   `exercises: TASK-P4`
18. In Chrome on the `context` item screen, click the citation trigger — expect the popover opens on CLICK alone with no hover required; repeat the same control with the keyboard (Tab + Enter) — expect it opens too. Rest the mouse pointer on any gallery row — expect the row tints on hover, and click-and-hold — expect a distinct darker active tint. Any control on the web gallery that responds only to hover is a FAIL: it is a web-only construct leaking into a universal surface.   `exercises: TASK-P2, TASK-P4`
19. Run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --web-only` — expect the script exports apps/example for web into a temp directory, serves it, requests `/gallery`, and finishes with the line `web export serves /gallery: 200` and exit 0. A 404 or 500 on the deep-linked route is a FAIL — it means the static export does not carry the /gallery route.   `exercises: TASK-P4, TASK-P13`
20. Run `cd apps/example && npx expo start --go` — expect Metro starts and prints a QR code; scan it with a physical iPhone's camera and open it in Expo Go — expect the app loads inside Expo Go with NO dev-client prompt, the header reads `AI Elements Example`, tapping `Gallery` shows the counter `56 / 56`, and walking several item screens (including `web-preview`, whose populated section renders the webview, and `speech-input`, whose controls render in their documented disabled state) shows all four states. Expect NO screen anywhere in the gallery showing a native-module error naming `react-native-enriched-markdown`, `react-native-streamdown` or `expo-speech-recognition` — the whole shipped set must load with no dev client.   `exercises: TASK-P1, TASK-P2, TASK-P5`
21. On the physical iPhone from step 20, with any gallery item screen open, open Settings → Display & Brightness and tap `Dark` — expect every AI Elements surface on screen flips dark in the same frame as the surrounding app chrome; tap `Light` — expect it flips back.   `exercises: TASK-P2, TASK-P5`
22. Run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` — expect the DEVICE leg FAILS printing `Assertion is false: id: context-popover-content is visible` while the WEB leg of the same run stays green (the export still builds and serves /gallery 200), and the script then prints `device-only failure demonstrated` and restores the layout under its exit trap. After it finishes, re-run the step 6 command — expect `Flow Passed`, proving the mutation was fully reverted. If BOTH legs pass during the trap stage, the gate is not real — that is a FAIL.   `exercises: TASK-P2, TASK-P13`
23. Run `mv apps/example/gallery/manifest.json apps/example/gallery/manifest.json.bak`, then re-run the step 6 command — expect NEGATIVE CONTROL: the walk must FAIL on the gallery counter (Maestro printing `Assertion is false: id: gallery-counter is visible` or the route erroring before any assertion). Then run `mv apps/example/gallery/manifest.json.bak apps/example/gallery/manifest.json` and re-run the step 6 command — expect `Flow Passed` restored. A pass with the manifest removed means the 224-assertion walk asserts nothing.   `exercises: TASK-P2, TASK-P13`

**Dark tasks:** none

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| TASK-P1 | Install all 56 shipped items into apps/example through the real RNR CLI from the v0.1.0 tag, peers at Expo 57's pin, Expo Go-clean graph | `react-native-reusables-implementer` | 3 | A | ⬜ Pending |
| TASK-P2 | Build the manifest-driven /gallery route: index + per-item four-state matrix screens with interactive prop controls, one codebase for iOS, Android and web | `react-native-ui-implementer` | 8 | C | ⬜ Pending |
| TASK-P3 | Android second pass over the shipped set: gesture-bar insets, predictive back, keyboard avoidance, press/ripple states, first Android dark flip | `react-native-ui-implementer` | 5 | D | ⬜ Pending |
| TASK-P4 | Web leg: static `expo export -p web`, react-native-web parity for the full set, hover twins with active twins, first web dark flip | `react-native-ui-implementer` | 5 | E | ⬜ Pending |
| TASK-P5 | Prove the full 56-item set loads inside Expo Go on a physical iPhone with no dev client, and capture the evidence | `react-native-ui-implementer` | 2 | D | ⬜ Pending |
| TASK-P6 | Declare meta.nativePeerDependencies and meta.permissions on every item that needs them, mined from actual imports, emitted through the build into public/r | `react-native-reusables-implementer` | 5 | A | ⬜ Pending |
| TASK-P7 | Author the seeded four-state literals — the strings a stranger literally reads in every cell of the matrix | `frontend-designer` | 2 | A | ⬜ Pending |
| TASK-P8 | Design and build the dark-flip observability layer: the scheme strip in the gallery chrome and the mid-stream flip surface | `frontend-designer` | 3 | A | ⬜ Pending |
| TASK-P9 | CI test: declared peers and permissions match the source's actual imports, both directions, both engines | `react-native-reusables-implementer` | 5 | B | ⬜ Pending |
| TASK-P10 | Engine parity proof: both trees serve the same 56 names, only the engine token differs, meta identical | `react-native-reusables-implementer` | 2 | B | ⬜ Pending |
| TASK-P11 | Stranger-runnable web-only-construct scan executing the styling contract, with the missing DOM/iframe/hover checks added to it | `react-native-reusables-implementer` | 3 | B | ⬜ Pending |
| TASK-P12 | Emit Expo Go / dev-client status from registry meta so the gallery walk shows it, never silently skips it | `react-native-reusables-implementer` | 3 | B | ⬜ Pending |
| TASK-P13 | Automated sprint-02 lane: the Android gallery walk (56 x 4 states), dark-flip driver, web export smoke, and every negative control watched failing | `react-native-ui-implementer` | 8 | F | ⬜ Pending |

**Waves:** A(5) → B(4) → C(1) → D(2) → E(1) → F(1) — 6 waves over 13 tasks · 54 pts

> Fusion provenance and orchestrator edits, mechanical and disclosed: gallery group names unified on the inventory-derived five groups two of three lenses proposed; TASK-P1's write_allowed narrowed to `apps/example/components/{{ai,ui}}/**` (the CLI's actual install targets, per its own brief) so it cannot collide with TASK-P8's `components/gallery/`; TASK-P2/P13 carry the 8-point split-check rationale. Dedupe: ui-planner's meta+CI pair superseded by the registry lens's deeper tasks (which found the live undeclared imports and the contract-execution model); designer's index/matrix/web-presentation tasks merged into P2/P4 as the design half of the same deliverables.
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

#### Next Sprint Tasks

Generated by /kb-sprint-tasks-plan on 2026-09-06

- TASK-P1-install-all-56-shipped-items-into-appsexample-through.md
- TASK-P10-engine-parity-proof-both-trees-serve-the-same-56-names.md
- TASK-P11-strangerrunnable-webonlyconstruct-scan-executing-the.md
- TASK-P12-emit-expo-go-devclient-status-from-registry-meta-so-the.md
- TASK-P13-automated-sprint02-lane-the-android-gallery-walk-56-x-4.md
- TASK-P2-build-the-manifestdriven-gallery-route-index-peritem.md
- TASK-P3-android-second-pass-over-the-shipped-set-gesturebar.md
- TASK-P4-web-leg-static-expo-export-p-web-reactnativeweb-parity.md
- TASK-P5-prove-the-full-56item-set-loads-inside-expo-go-on-a.md
- TASK-P6-declare-metanativepeerdependencies-and-metapermissions.md
- TASK-P7-author-the-seeded-fourstate-literals-the-strings-a.md
- TASK-P8-design-and-build-the-darkflip-observability-layer-the.md
- TASK-P9-ci-test-declared-peers-and-permissions-match-the.md

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
