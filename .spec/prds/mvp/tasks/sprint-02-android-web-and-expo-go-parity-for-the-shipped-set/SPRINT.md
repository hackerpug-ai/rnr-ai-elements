---
sprint: 02
title: Android, web and Expo Go parity for the shipped set
sequence: 2
timeline: Phase 1
status: Planned
planned_from_roadmap_sha: 7e61580fc8f60777d40d4c3dc3aa6530931f5a80ba9ec36706ae56e9b206f06c
planned_from_source_sha: 83feaa766b18815eb7dea5e6f644b56e64926d4e
source_kind: git-head
planned_at: 2026-09-06
---

# Sprint 2: Android, web and Expo Go parity for the shipped set

**Sequence:** 2
**Timeline:** Phase 1
**Status:** Planned

---

## Overview

Every shipped item, in every state, on Android and web and inside Expo Go

Sprint-01 proved five items install and cold-boot on two simulators. This sprint takes the
whole shipped set the rest of the way: all 56 items installed into apps/example through the
real CLI, a `/gallery` route that walks every item through loading, empty, error and
populated states on a product surface, and the three legs the PRD demands and the repo has
never once produced evidence for — an Android emulator, a static `expo export -p web` build
in Chrome, and an Expo Go session on a physical iPhone — with the dark-mode flip observed
on all three for the first time. It also makes UC-REG-02 AC-2 real: registry entries gain
`meta.nativePeerDependencies` and `meta.permissions` mined from their source's actual
imports (two of which are already out of sync today), emitted into both engine trees and
onto the gallery cards.

---

## Human Testing Gate

**Gate:** A stranger can walk all 56 shipped registry items through their loading, empty, error and populated states from apps/example's /gallery route on an Android emulator, in a desktop browser served from `expo export -p web`, and inside an Expo Go session — flipping the device to dark mode at any point and seeing every surface follow in the same frame.
**Entrypoint:** apps/example route /gallery, reached three ways: `npx expo run:android` on Pixel_7_API_34; `npx expo export -p web && npx serve dist` opened at http://localhost:3000/gallery in Chrome; and `npx expo start --go` scanned into Expo Go on a physical iPhone.
**Before:** `ls apps/` returns exactly `harness/` and `harness-nativewind/` — no apps/example until sprint-01 lands, no `/gallery` route anywhere in the repo, no `.maestro/`, no `tests/sprint-01/` or `tests/sprint-02/` lane. packages/registry/registry.json holds 56 items and not one carries a `meta` or `docs` key — the RegistryItem type has no meta field, so neither do the 112 emitted public/r files, and the per-engine index strips each item to name/type/title: UC-REG-02 AC-2 has literally no data behind it, and the declarations that do exist are already out of sync with the source's actual imports (speech-input imports react-native-reanimated while declaring no dependencies; prompt-input imports expo-document-picker and expo-image-picker while declaring only react-native-safe-area-context) with nothing checking either direction. design/manifest.json has real gates and device evidence under mobile-ios only; the mobile-android / web-mobile / web-desktop keys are boilerplate with every gate 'pending' and their goldens directories (design/goldens/mobile-android/, design/goldens/web-desktop/) do not exist — no Android or web pixel has ever been produced by this repo, the dark-mode flip has only ever been observed as iOS simulator pairs (never on Android, never in a browser, never mid-stream), and the documented web theme defect means no themed AI surface has ever rendered on web at all. The loading/empty/error/populated vocabulary lives only as labeled boards inside the developer-only Storybook harness — no product surface demonstrates any state of any item, so a stranger today has nothing to open. 51 of the 56 items have never been installed into any consumer tree, no shipped item has ever been loaded in Expo Go, and nothing validates registry metadata against source imports or scans shipped source for web-only constructs end to end.
**Demonstrates:** UC-REG-02, UC-REG-04, UC-FOUND-02

### Entry conditions

- Sprint-01 landed: apps/example exists (Expo 57, expo-router, uniwind + Tailwind v4, genuine `rnr init`, PortalHost at root, route `/` rendering the seeded transcript), the v0.1.0 tag exists with {version}-templated URLs, the 5-item CLI install is proven, `.maestro/` + `pnpm e2e:smoke:ios`/`e2e:smoke:android` exist, and `design/goldens/mobile-{ios,android}/sprint-01/cold-boot.png` exist.
- Working tree clean at dispatch.
- A physical iPhone reachable for the Expo Go leg (steps 20-21) with Expo Go installed.

---

## Human Test Deliverable

A stranger with this file open, a checkout, an Android emulator, Chrome, and a physical
iPhone can run every step below verbatim and reach a yes/no answer without opening a code
editor.

**Test Steps:**

<!-- TESTING-GATE-START -->

- [ ] 1. Run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --install-only` — expect the script installs the 51 items sprint-01 did not (printing one `Created components/ai/<name>.tsx` line per newly added item from the v0.1.0 tag URLs) plus `npx expo install` of the peer set, and finishes with the line `56/56 gallery items present` and exit 0. Expect the resolved `react-native-webview` version printed as `13.16.1` — `14.0.1` (npm latest) is a FAIL. Expect the script's graph check to print `dev-client modules in graph: none` — any mention of `react-native-enriched-markdown`, `react-native-streamdown` or `expo-speech-recognition` in apps/example's dependency graph is a FAIL, because it would make the Expo Go leg impossible. Any `404` means a tag URL is broken.   `exercises: TASK-P1`
- [ ] 2. Boot the Pixel_7_API_34 emulator and leave it running, then run `cd apps/example && npx expo run:android` — expect the app builds and launches with no red error screen, specifically NO `Unable to resolve module '@/registry/uniwind/components/ui/text'` or any sibling of it (sprint-01 proved 5 items; this is the first time the other 51 resolve inside a consumer tree).   `exercises: TASK-P1, TASK-P2`
- [ ] 3. Look at the app header on the screen that opens — expect the header still reads `AI Elements Example` and shows a `Gallery` control beside it; tap `Gallery` — expect the /gallery index opens listing item rows under five section headers reading `Chat`, `Agent Surface`, `Specialist`, `Base Primitives` and `Logic`, each header followed by its item count, and the footer counter (selected by id `gallery-counter`) reads exactly `56 / 56`. A counter reading any other number means the gallery manifest and the shipped registry have drifted — that is a FAIL.   `exercises: TASK-P2, TASK-P7`
- [ ] 4. Tap the `tool` card — expect a detail screen titled `tool` opens with a four-segment control at the top reading `Loading`, `Empty`, `Error`, `Populated`, `Populated` active, showing the rounded pill reading `Completed` with a GREEN check glyph (grey or colorless is a FAIL — sprint-01's theme obligation now applies to all 56). Tap `Loading` — expect the panel swaps in place with no screen transition, the pulse animating. Tap `Empty` — expect the literal title `No tool calls yet` and description `Ask something that uses a tool to see it here.`. Tap `Error` — expect the heading `Error` in destructive color and the body `The tool call failed to complete.`. Then perform the Android back gesture from the left screen edge — expect it returns to the gallery index in ONE press with the scroll position preserved.   `exercises: TASK-P2, TASK-P3, TASK-P7`
- [ ] 5. On the `conversation` detail screen, tap the control reading `Walk all states` — expect the four segments advance by themselves in the order Loading, Empty, Error, Populated, dwelling about two seconds each, and after returning to the index the `conversation` row's four coverage dots are all filled. Then open the `model-selector` item with `Populated` active and tap the model chip — expect a bottom sheet rises OVER the gallery chrome with the area behind it dimmed, listing `Claude Opus 4`, `GPT-4o` and `Gemini 2.5 Pro`.   `exercises: TASK-P2`
- [ ] 6. Run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/core-happy-path` from the repository root — expect Maestro prints `Flow Passed` and the script's final line reads `56 items x 4 states asserted (android)`, and `design/goldens/mobile-android/sprint-02/gallery-matrix.png` exists — the first full-set Android matrix capture this repo has ever produced.   `exercises: TASK-P2, TASK-P13`
- [ ] 7. Force-quit the app from the Android launcher, leave Metro running, and run the step 6 command a second time — expect `Flow Passed` again, proving the 224-assertion walk runs against a cold app launch rather than a warm reload.   `exercises: TASK-P13`
- [ ] 8. With the `conversation` detail screen open on the emulator, run `adb shell "cmd uimode night yes"` — expect EVERY visible surface (header, card chrome, badges, empty atom, code block, and the labeled scheme strip at the gallery header) flips to dark in the same frame with nothing retaining a light background or border; then run `adb shell "cmd uimode night no"` — expect the same surfaces flip back together. A surface that stays light for even a visible beat, or stays light permanently, is a FAIL — dark mode has never before been observed on Android in this repo.   `exercises: TASK-P2, TASK-P3, TASK-P8`
- [ ] 9. On the `conversation` detail screen, tap its `replay stream` control (id `gallery-stream-replay`) and, while text is still visibly appending, run `adb shell "cmd uimode night yes"` — expect the bubbles and surrounding chrome flip dark in the same frame AND the stream keeps appending tokens without interruption, restart or a dropped frame of the scroll pin; run `adb shell "cmd uimode night no"` and expect the stream still continues.   `exercises: TASK-P2, TASK-P8, TASK-P13`
- [ ] 10. On the `/gallery` index (any leg), look at the requirement rows on the cards — expect the `web-preview` card shows a native-peer row reading `react-native-webview`, a permissions row reading `none`, and an Expo Go badge; the `speech-input` card shows a permissions row reading `microphone` and a dev-client note row reading `dev client — expo-speech-recognition`; the `message` card shows a dev-client note row reading `dev client — react-native-enriched-markdown / react-native-streamdown` — the four opt-in capabilities visibly named in the walk rather than silently absent.   `exercises: TASK-P6, TASK-P12`
- [ ] 11. Run `pnpm exec vitest run tests/sprint-02/registry-meta.test.ts` from the repository root — expect exit 0 with every test `passed` and a summary line reading `56 items x 2 engines — 0 used-but-undeclared, 0 declared-but-unused, 0 invalid permissions`, and expect the committed RED log `design/goldens/sprint-02/registry/meta-declarations.json.RED.log` names `speech-input` + `react-native-reanimated` and `prompt-input` + `expo-document-picker` — those undeclared imports are live today and this is the step that proves they were fixed, not hidden.   `exercises: TASK-P6, TASK-P9`
- [ ] 12. Run `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"` — expect exit 0 with a summary line reading `0 hits — DOM elements: 0, iframes: 0, hover-without-active: 0, raw lucide JSX: 0` across the 56 sources and both emitted trees, INCLUDING the self-proof case named `implanted <div> is caught` in the output, which plants a DOM element, an iframe, a hover-only class and a raw lucide JSX tag in in-memory samples and asserts the checker flags each. A suite without that case passing is a scan that has never been seen to fail.   `exercises: TASK-P11`
- [ ] 13. Run `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts -t "UC-REG-04/core-happy-path"` — expect exit 0 with a summary line reading `parity — 56 items x 2 engines — 56 name matches, 0 divergent beyond the engine token, meta identical on all 56`.   `exercises: TASK-P10`
- [ ] 14. Run `pnpm exec vitest run tests/sprint-02/engine-parity.test.ts -t "UC-REG-04/edge-web-story-passes-device-story-fails"` — expect exit 0 and a line reading `negative control: seeded device-only divergence caught — comparator reported divergent: 1`. A suite that passes without reporting the seeded divergence is a FAIL: the comparator asserts nothing and the parity gate is theatre.   `exercises: TASK-P10`
- [ ] 15. Run `cd apps/example && npx expo export -p web && npx serve dist` — expect the export exits 0 with no `Export encountered an error` line, then with `serve` running open `http://localhost:3000/gallery` in Chrome — expect the same grouped index as the emulator, the footer counter reads `56 / 56`, and tapping the `tool` card shows the same four labeled state sections rendering through react-native-web.   `exercises: TASK-P4`
- [ ] 16. In Chrome on the `web-preview` item screen with `Populated` active — expect the panel shows the designed fallback: an empty-state composition titled `Needs a device build` with a description naming iOS and Android as the targets where it renders — never a blank rectangle.   `exercises: TASK-P4, TASK-P7`
- [ ] 17. In Chrome on http://localhost:3000/gallery, open Developer Tools, open the Command Menu, choose `Show Rendering`, and set `Emulate CSS media feature prefers-color-scheme` to `dark` — expect every gallery surface flips dark in the same frame, identically to the emulator flip in step 8; set it back to `no-preference` — expect every surface flips back. A surface that only re-themes after navigation is a FAIL.   `exercises: TASK-P4`
- [ ] 18. In Chrome on the `context` item screen, click the citation trigger — expect the popover opens on CLICK alone with no hover required; repeat the same control with the keyboard (Tab + Enter) — expect it opens too. Rest the mouse pointer on any gallery row — expect the row tints on hover, and click-and-hold — expect a distinct darker active tint. Any control on the web gallery that responds only to hover is a FAIL: it is a web-only construct leaking into a universal surface.   `exercises: TASK-P2, TASK-P4`
- [ ] 19. Run `bash tests/sprint-02/gallery-install.test.sh UC-REG-02/core-happy-path --web-only` — expect the script exports apps/example for web into a temp directory, serves it, requests `/gallery`, and finishes with the line `web export serves /gallery: 200` and exit 0. A 404 or 500 on the deep-linked route is a FAIL — it means the static export does not carry the /gallery route.   `exercises: TASK-P4, TASK-P13`
- [ ] 20. Run `cd apps/example && npx expo start --go` — expect Metro starts and prints a QR code; scan it with a physical iPhone's camera and open it in Expo Go — expect the app loads inside Expo Go with NO dev-client prompt, the header reads `AI Elements Example`, tapping `Gallery` shows the counter `56 / 56`, and walking several item screens (including `web-preview`, whose populated section renders the webview, and `speech-input`, whose controls render in their documented disabled state) shows all four states. Expect NO screen anywhere in the gallery showing a native-module error naming `react-native-enriched-markdown`, `react-native-streamdown` or `expo-speech-recognition` — the whole shipped set must load with no dev client.   `exercises: TASK-P1, TASK-P2, TASK-P5`
- [ ] 21. On the physical iPhone from step 20, with any gallery item screen open, open Settings → Display & Brightness and tap `Dark` — expect every AI Elements surface on screen flips dark in the same frame as the surrounding app chrome; tap `Light` — expect it flips back.   `exercises: TASK-P2, TASK-P5`
- [ ] 22. Run `bash tests/sprint-02/gallery-walk.test.sh UC-REG-04/edge-web-story-passes-device-story-fails` — expect the DEVICE leg FAILS printing `Assertion is false: id: context-popover-content is visible` while the WEB leg of the same run stays green (the export still builds and serves /gallery 200), and the script then prints `device-only failure demonstrated` and restores the layout under its exit trap. After it finishes, re-run the step 6 command — expect `Flow Passed`, proving the mutation was fully reverted. If BOTH legs pass during the trap stage, the gate is not real — that is a FAIL.   `exercises: TASK-P2, TASK-P13`
- [ ] 23. Run `mv apps/example/gallery/manifest.json apps/example/gallery/manifest.json.bak`, then re-run the step 6 command — expect NEGATIVE CONTROL: the walk must FAIL on the gallery counter (Maestro printing `Assertion is false: id: gallery-counter is visible` or the route erroring before any assertion). Then run `mv apps/example/gallery/manifest.json.bak apps/example/gallery/manifest.json` and re-run the step 6 command — expect `Flow Passed` restored. A pass with the manifest removed means the 224-assertion walk asserts nothing.   `exercises: TASK-P2, TASK-P13`

<!-- TESTING-GATE-END -->

**Dark tasks:** none

---

## Tasks

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

> Fusion provenance: proposed by react-native-ui-planner (canonical steps, platform tasks P1-P5, P13), react-native-reusables-planner (registry tasks P6, P9-P12), frontend-designer (P7, P8; index/state-matrix/segmented-control/walk-all/scheme-strip/coverage-dots design contracts and literals folded into P2/P3/P4 as design references; design enrichments attached). Dedupe: ui-planner's TASK-P6/P7 meta+CI pair superseded by the registry lens's deeper P6/P9/P11 (which found the live undeclared imports and the contract-execution model); designer's index/matrix/web-presentation tasks merged into P2/P4 as the design half of the same deliverables. Orchestrator edits, mechanical and disclosed: gallery group names unified on the inventory-derived five groups two of three lenses proposed; TASK-P1's write_allowed narrowed to `apps/example/components/{ai,ui}/**` (the CLI's actual install targets, per its own brief) so it cannot collide with TASK-P8's `components/gallery/`; TASK-P2/P13 carry the 8-point split-check rationale (P13's verbatim from the proposer; P2's from the design lens's sizing_rationale for the same deliverable).

---

## Source Coverage

- .spec/prds/mvp/08-uc-reg.md — UC-REG-02 AC-1..AC-4
- .spec/prds/mvp/12-e2e-testing-criteria.md — T-REG-005, T-REG-006, T-REG-007, T-REG-008, T-REG-015, T-FOUND-005, T-FOUND-006
- .spec/scenarios/UC-REG-02/holdout-expo-go-for-the-core.scenario.md
- .spec/scenarios/UC-REG-02/holdout-web-parity-for-gestures.scenario.md
- AGENTS.md — 'Web | Required | RNR is universal; a component that only works on native is not done'
- UC-REG-04 DECISION — move (a) from the brief: its demonstrable value is re-derived onto apps/example. The loading/empty/error/populated matrix (AC-3), the interactive prop surface (AC-1's substance), the browser rendering (AC-2's substance) and the token/dark flip (AC-4) all become the /gallery route on a real product surface. AC-5 ('every completion cites an on-device story') is re-read as 'every completion cites Maestro evidence from sprint 01's flows on a real device'. The two ACs that name the developer tool literally are returned in ucs_not_demonstrated for explicit user deferral rather than silently satisfied by a banned entrypoint.

## Capability Coverage

- (none declared)

---

## Blocks

- Blocks: sprint-03-the-keyboard-and-the-500-message-android-transcript, sprint-04-live-web-preview-through-a-native-webview, sprint-05-voice-on-a-dev-client
- Dependent on: Sprint 01

## Task Detail Files

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
