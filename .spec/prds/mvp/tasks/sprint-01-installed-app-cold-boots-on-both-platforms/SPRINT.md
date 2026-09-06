---
sprint: 01
title: Installed app cold-boots on both platforms
sequence: 1
timeline: Phase 1
status: Planned
planned_from_roadmap_sha: fa93d752e04d1603aa7376d72a3b7f9083a60239a866819533eb196d6be93996
planned_from_source_sha: 500727937570f4ed006939ffc571aa6629ad908b
source_kind: git-head
planned_at: 2026-09-05
---

# Sprint 1: Installed app cold-boots on both platforms

**Sequence:** 1
**Timeline:** Phase 1
**Status:** Planned

---

## Overview

A CLI-installed AI Elements transcript cold-boots and renders on iOS and Android, and the same flow fails when the seed is removed

This is the sprint that finds out whether the registry actually installs. 56 items ship in
`public/r/`, but no consumer has ever installed one: 254 `@/registry/{engine}/…` imports across
50 of those items have never been through a real CLI run, and they resolve today only because the
Storybook harness has a tsconfig path a consumer will not have. The sprint stands up the first real
consumer app, installs into it from a pinned URL, and boots it on iOS and Android under a playback
framework that does not exist yet.

---

## Human Testing Gate

**Gate:** A stranger runs one RNR CLI command against a tag-pinned URL, cold-boots the example app on an iOS simulator and an Android emulator, and watches Maestro assert a seeded transcript and a themed tool badge on both — then watches the identical flow FAIL when the seed is removed.
**Entrypoint:** The RNR CLI install command `npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/<item>.json` run inside `apps/example`, then `apps/example` launched with `npx expo run:ios` / `npx expo run:android` and driven by `maestro test .maestro/cold-boot.yaml`.
**Before:** `ls apps/` returns exactly `harness/` and `harness-nativewind/`; `apps/example` does not exist, so the first command of this gate has no directory to run in. There is no `.maestro/` directory and `detect_e2e_framework.py --repo .` returns `mobile / expo-rn / status: MISSING` — the Maestro binary happens to be on the developer's machine and the repo gives it nothing to run, which is precisely the finding. No release tag exists: all 56 items in `packages/registry/registry.json` embed a mutable `/main/` segment, so the URL in this gate cannot be typed today. 50 of those 56 emitted items ship 254 `@/registry/{engine}/…` imports that no CLI has ever rewritten, so whether an installed app boots at all is an open question nobody in this repo has asked. Every capture in `design/manifest.json` and `design/goldens/` is an iOS simulator shot; `design/goldens/mobile-android/` does not exist and no Android pixel has ever been produced by this project. And the theming promise ships a documented hole: 26 `--color-*` palette-slice entries live only in `apps/harness/src/global.css`, the registry declares none, the CLI does not merge theme blocks, and `public/r/uniwind/file-tree.json` and `transcription.json` both ship a source comment telling the consumer their classes are 'safelisted consumer-side (class-safelist.tsx)' — a path that will not exist in their tree. A `tool` success badge installs colorless, with no error.
**Demonstrates:** UC-REG-01 (AC-1, AC-2, AC-3; AC-4 is sprint 02's)

### Entry conditions

- Working tree clean at dispatch. The 34 in-flight wave-B style-remediation files (design/style-parity-remediation.md rows 5-8) are landed or parked under refs/wip first — a repo-hygiene precondition, deliberately NOT a task in this sprint.

---

## Human Test Deliverable

A stranger with this file open, a checkout, and two simulators can run every step below verbatim
and reach a yes/no answer without opening a code editor.

**Test Steps:**

<!-- TESTING-GATE-START -->

- [ ] 1. Run `pnpm install` from the repository root — expect exits printing `Done in` and a duration, and the resolution includes a workspace package named `example`.   `exercises: TASK-F1`
- [ ] 2. Run `cd apps/example && npx @react-native-reusables/cli@latest add https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/conversation.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/message.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/prompt-input.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/tool.json https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.1.0/public/r/uniwind/context.json` — expect the CLI prints a `Created` line for each of the four items AND for RNR's own `text`, `avatar`, `button` and `icon` pulled from reactnativereusables.com in the same command. Any `404` or `Cannot find module` is a FAIL — it means the v0.1.0 tag or a transitive registryDependency does not resolve Also expect a `Created` line for `components/ui/popover.tsx`.   `exercises: TASK-F2, TASK-F3`
- [ ] 3. Look at the final line the CLI printed — expect the final line names `components/ai/tool.tsx`, proving the file was WRITTEN into the consumer tree rather than imported from `packages/registry`.   `exercises: TASK-F3`
- [ ] 4. Run `npx expo run:ios` from `apps/example` — expect the app builds and launches with no red error screen. Specifically: NO `Unable to resolve module '@/registry/uniwind/components/ui/text'` or any sibling of it. This is the alias assertion — 254 such imports have never survived an install, and this step is the first time anyone finds out.   `exercises: TASK-F4`
- [ ] 5. Look at the text in the app header on the screen that opens — expect the header reads `AI Elements Example`.   `exercises: TASK-F1, TASK-F5`
- [ ] 6. Look at the second bubble in the transcript — expect the bubble reads `Registry item installed.`   `exercises: TASK-F5`
- [ ] 7. Look at the tool card below that bubble and read its badge — expect the badge is a rounded pill reading `Completed` with a GREEN check glyph. A grey, black or colorless check is a FAIL: the consumer's `@theme` never carried `--color-green-600` and the class compiled to nothing, silently.   `exercises: TASK-F7`
- [ ] 8. With the simulator still running, run `pnpm e2e:smoke:ios` from the repository root — expect maestro prints `Flow Passed` and `design/goldens/mobile-ios/sprint-01/cold-boot.png` exists.   `exercises: TASK-F6, TASK-F8`
- [ ] 9. Run `mv apps/example/fixtures/transcript.json apps/example/fixtures/transcript.json.bak`, then run `pnpm e2e:smoke:ios` again — expect NEGATIVE CONTROL. Maestro must FAIL, printing `Assertion is false: id: transcript-message-0 is visible`. A pass here means the flow asserts nothing and the whole gate is theatre — this is the step that answers 'would this pass with a disconnected backend?' with a demonstrated no.   `exercises: TASK-F6, TASK-F8`
- [ ] 10. Run `mv apps/example/fixtures/transcript.json.bak apps/example/fixtures/transcript.json` to restore the seed, then boot the Pixel_7_API_34 emulator and run `npx expo run:android` from `apps/example` — expect the Android emulator launches the same app, the header again reads `AI Elements Example`, and the badge is again GREEN.   `exercises: TASK-F1, TASK-F4, TASK-F7`
- [ ] 11. With the emulator still running, run `pnpm e2e:smoke:android` from the repository root — expect maestro prints `Flow Passed` and writes `design/goldens/mobile-android/sprint-01/cold-boot.png`. This file is the first Android capture ever produced by this repository.   `exercises: TASK-F8`
- [ ] 12. Force-quit the app from the Android launcher, leave Metro running, and run `pnpm e2e:smoke:android` a second time — expect `Flow Passed` again, proving the assertion runs against a cold app launch rather than a warm reload.   `exercises: TASK-F8`
- [ ] 13. Run `bash tests/sprint-01/install-dirty-app.test.sh --prepare` to create a hostile Expo app in `$TMPDIR` carrying its own `components/ui/button.tsx`, npm-latest `react-native-gesture-handler`, and no PortalHost — then re-run the step 2 add command in that app WITHOUT `--yes` — expect the CLI to pause on a prompt naming `components/ui/button.tsx` as a file it would overwrite, before any file is written.   `exercises: TASK-F3`
- [ ] 14. Answer that prompt with `n`, then run `npx expo-doctor` in the hostile app — expect a non-zero exit and output naming `react-native-gesture-handler` and the Expo SDK 57 expected version `~2.32.0`.   `exercises: TASK-F3`
- [ ] 15. Answer the add prompt with `y` on a re-run, launch the hostile app, and open the context surface — expect either a rendered popover OR an install-time message naming `PortalHost` as a prerequisite. A surface that renders NOTHING with no error is a FAIL: that is the landmine ledger's worst silent failure and the reason this step exists.   `exercises: TASK-F3`
<!-- TESTING-GATE-END -->

**Dark tasks:** none

---

## Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| TASK-F1 | Scaffold apps/example as a genuine consumer app (Expo SDK 57, expo-router, uniwind + Tailwind v4, rnr init) | react-native-ui-implementer | 8 | A | ⬜ Pending |
| TASK-F2 | Add the {version} token to the registry build and cut the v0.1.0 tag | react-native-reusables-implementer | 3 | B | ⬜ Pending |
| TASK-F3 | Install the walking-skeleton item set into apps/example through the real RNR CLI from the pinned URL | react-native-reusables-implementer | 3 | C | ⬜ Pending |
| TASK-F4 | Make every emitted import resolve inside a consumer tree | react-native-reusables-implementer | 8 | D | ⬜ Pending |
| TASK-F5 | Commit the UIMessageStream fixture with honest provenance and render / from it with zero network calls | react-native-ui-implementer | 3 | E | ⬜ Pending |
| TASK-F6 | Define and apply the testID contract the e2e flows select on | react-native-ui-implementer | 2 | F | ⬜ Pending |
| TASK-F7 | Declare and record the consumer @theme obligation the installed items silently require | frontend-designer | 3 | D | ⬜ Pending |
| TASK-F8 | Stand up Maestro with a cold-boot flow on both platforms and a negative control watched failing | react-native-ui-implementer | 13 | G | ⬜ Pending |

**Waves:** A(1) → B(1) → C(1) → D(2) → E(1) → F(1) → G(1) — 7 waves over 8 tasks · 43 pts

---

## Source Coverage

- UC-REG-01 (`.spec/prds/mvp/08-uc-reg.md`) — AC-1, AC-2, AC-3 proven here; AC-4 deferred to sprint 02
- `.spec/prds/mvp/11-technical-requirements/11-routing.md` — apps/example and its routes
- `.spec/prds/mvp/11-technical-requirements/12-e2e-testing.md` — framework provisioning, flake policy
- `.spec/scenarios/UC-REG-01/*` — the enumerated flows this gate locks
- AGENTS.md Platforms table — Android is Required

## Capability Coverage

- `CAP-DIST-01`: a registry item installs into a clean Expo app and renders (partial — 5 items, one engine; the 56-item both-engine proof is sprint 02's)
- `CAP-THEME-01`: the consumer @theme obligation is recorded here, not yet distributed (TASK-F7)

---

## Blocks

- sprint-02-clean-app-install-all-56-both-engines
- sprint-03-theme-flip-six-pairs
- sprint-04-real-streaming-on-a-real-route
- sprint-05-tool-lifecycle-and-gated-approval
- sprint-06-every-state-on-a-real-surface
- sprint-07-one-design-system-side-by-side

---


## Automated Functional Coverage

Projection only — `human-flows.json` and the per-task Requirement Contracts are authoritative. Regenerated by /kb-sprint-tasks-plan; do not hand-edit.

| Flow ID | Kind | Gate step(s) | Owner task/AC | Test file/function | Replay |
|---|---|---|---|---|---|
| `UC-REG-01/core-happy-path` | core | 1-12 | TASK-F8/AC-1 | `tests/sprint-01/install-core.test.sh` :: `UC-REG-01/core-happy-path` | task |
| `UC-REG-01/edge-a-short-name-registry-dependency` | edge | 2 | TASK-F2/AC-1 | `tests/build-registry.test.ts` :: `UC-REG-01/edge-a-short-name-registry-dependency` | task |
| `journeys/mvp-full-arc--edge-install-into-a-dirty-app` | journey (edge) | 13-15 | TASK-F8 | `tests/sprint-01/install-dirty-app.test.sh` :: `journeys/mvp-full-arc--edge-install-into-a-dirty-app` | post-integration |
| `journeys/mvp-install-arc` | journey (core) | 1-8, 10-12 | TASK-F8 | `tests/sprint-01/install-core.test.sh` :: `journeys/mvp-install-arc` | post-integration |

---

## Task Detail Files

Generated by /kb-sprint-tasks-plan on 2026-09-05

- TASK-F1-scaffold-apps-example-as-a-genuine-consumer-app-expo-sdk-57-.md
- TASK-F2-add-the-version-token-to-the-registry-build-and-cut-the-v0-1.md
- TASK-F3-install-the-walking-skeleton-item-set-into-apps-example-thro.md
- TASK-F4-make-every-emitted-import-resolve-inside-a-consumer-tree.md
- TASK-F5-commit-the-uimessagestream-fixture-with-honest-provenance-an.md
- TASK-F6-define-and-apply-the-testid-contract-the-e2e-flows-select-on.md
- TASK-F7-declare-and-record-the-consumer-theme-obligation-the-install.md
- TASK-F8-stand-up-maestro-with-a-cold-boot-flow-on-both-platforms-and.md
