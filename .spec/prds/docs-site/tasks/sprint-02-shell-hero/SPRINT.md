---
sequence: 2
timeline: Phase 1
status: planned
sprint_id: sprint-02-shell-hero
planned_from_roadmap_sha: f257062df7b0c3eb5250b73dbced88ecac7950a8fe5aacca89d03172f0b66832
planned_from_source_sha: 41f519dea484c32e37ed5d61f5d04ed4b842791d
planned_at: 2026-09-10
---

# Sprint 02: shell-hero

**Status:** Planned
**Sequence:** 2
**Timeline:** Phase 1

## Overview

The designed shell and hero: the site gets its 18-token oklch vocabulary, DocsLayout with sticky header and flash-free persisted theme toggle, the engine-tabbed install command (TabGroup island), Button/Chip/Badge primitives, the one-screen hero at 1440x900, dependency panels on all 39 component pages, and the /docs/theming cold-boot surface. Proposed by frontend-designer (lead) + react-native-reusables-planner + astro-planner + techwriting-planner; promotion merged with rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-02-shell-hero/`.

## Human Testing Gate

**Gate:** A visitor opening `/` at 1440x900 over `astro preview` sees the hero's not-an-npm-package statement, the version counter (0.2.1), the item counters (56 / 39 / 11 / 6), the copyable engine-tabbed install command, plus both Get started / Browse components CTAs — all without scrolling.

**Entrypoint:** Built dist/ served by `astro preview` at http://localhost:4321 (`pnpm --filter @rnr-ai-elements/docs build` then `preview`)

**Before:** AS OBSERVED 2026-09-10 (sprint-01 fully landed): apps/docs serves sprint-01's skeleton through layouts/spike.astro — a bare HTML shell with NO token stylesheet, NO header/footer, NO theme toggle, NO pre-paint theme script. Exactly one island of five (rnr-copy-button). The home page is FUSE-08's structural block — single un-tabbed nativewind command, no one-screen contract. /components/[item] stacks two labeled command rows — no engine tabs, no dependency panels. /docs/* routes 404. playwright.config.ts testDir is pinned to the sprint-01 lane. The gate fails on every designed-shell clause.

**Demonstrates:** UC-GEND-01, UC-GEND-04, UC-SHELL-01

## Test Deliverable

<!-- TESTING-GATE-START -->

- [ ] 1. In the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0, and the summary lists passing specs from BOTH tests/sprint-01-docs-spike-skeleton and the new tests/sprint-02-shell-hero lane, including all six sprint-02 FLOW ids.   `exercises: SHELL-011, SHELL-012, SHELL-013`
- [ ] 2. Run `pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/ in a browser window sized exactly 1440x900 — the page renders inside a themed shell: a header carrying the RNR wordmark, section links, and a theme toggle, above a hero block.   `exercises: SHELL-001, SHELL-002`
- [ ] 3. On / at 1440x900, read the hero statement top to bottom without scrolling — it says in one pass that this is universal AI chat and agent UI components for React Native, distributed as a copy-paste registry, and that it is NOT an npm package.   `exercises: SHELL-007, SHELL-010`
- [ ] 4. Look at the hero counters row on the same screen — it shows version 0.2.1 and the item counters 56, 39, 11, 6, each with a readable label.   `exercises: SHELL-007, SHELL-010`
- [ ] 5. On / at 1440x900, compare the bottom edge of the window with the Get started and Browse components buttons — both buttons, the statement, the counters, and the install command are all fully visible without scrolling.   `exercises: SHELL-005, SHELL-007`
- [ ] 6. Click the uniwind tab on the hero install block — the displayed command's engine segment changes to https://rnraielements.com/r/uniwind/conversation.json while keeping the `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/...` form.   `exercises: SHELL-004, SHELL-007`
- [ ] 7. Click the copy button in the hero install block — the button shows a visible success state and pasting anywhere yields exactly the displayed command.   `exercises: SHELL-004, SHELL-007`
- [ ] 8. Reload http://localhost:4321/ after selecting uniwind — the hero install block still shows the uniwind tab active with its command (the engine choice persisted).   `exercises: SHELL-004`
- [ ] 9. Click the theme toggle in the header twice (dark to light and back) — the whole page flips both ways, and after a reload the last-chosen theme persists with no flash of the wrong theme.   `exercises: SHELL-003`
- [ ] 10. Set the OS/browser appearance to dark, open a fresh private window, and load http://localhost:4321/docs/theming, then http://localhost:4321/, then http://localhost:4321/components/message — every page renders dark from the very first frame with no light flash.   `exercises: SHELL-001, SHELL-003, SHELL-009`
- [ ] 11. Open http://localhost:4321/components/shimmer — the install block leads the page with engine tabs; click copy on the nativewind tab (button shows success, paste yields the exact nativewind command), then switch to the uniwind tab and copy again (paste yields the exact uniwind command).   `exercises: SHELL-008`
- [ ] 12. Read the Dependencies section on http://localhost:4321/components/shimmer and http://localhost:4321/components/conversation — each lists that item's required packages (e.g. react-native-reanimated, react-native-safe-area-context) and its registry dependency URLs with the engine segment resolved to real rnraielements.com URLs.   `exercises: SHELL-006, SHELL-008`
- [ ] 13. On / click Get started — the registry ledger at /registry opens; go back, click Browse components — /components opens showing the family sections.   `exercises: SHELL-005, SHELL-007`

<!-- TESTING-GATE-END -->

**Dark tasks:** None — every task is exercised by at least one gate step.

## Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| SHELL-001 | Author the 18-token oklch stylesheet (global.css): light+dark, radius/layout vars, focus ring, dark-first | frontend-designer | 3 | A | ⬜ Pending |
| SHELL-002 | DocsLayout base + sticky Header (nav, theme slot) + Footer + zero-JS mobile drawer; adopt on ledger, components index, and island-demo pages | frontend-designer | 5 | B | ⬜ Pending |
| SHELL-003 | ThemeToggle island + pre-paint flash-free theme script (rnr-theme, dark default, scheme-respecting) | astro-implementer | 3 | C | ⬜ Pending |
| SHELL-004 | TabGroup island (WAI-ARIA engine tabs, persisted rnr-engine, server-rendered panels) + InstallCommand composite | astro-implementer | 5 | D | ⬜ Pending |
| SHELL-005 | Create Button (NEW 1/4), Chip/ChipRow, and Expo Go verdict Badge — token-governed primitives | frontend-designer | 2 | B | ⬜ Pending |
| SHELL-006 | Prebuild data: engine/version URL resolver + derived AI SDK v7 peers (site-facts.json) | react-native-reusables-implementer | 3 | A | ⬜ Pending |
| SHELL-007 | Compose the designed home hero per wireframe R5-R8 — one screen at 1440x900, computed counters, engine-tabbed InstallCommand, Button CTAs | frontend-designer | 5 | E | ⬜ Pending |
| SHELL-008 | Item pages: engine-tabbed InstallCommand (install stays first) + data-driven dependency panel; retire spike.astro | astro-implementer | 5 | E | ⬜ Pending |
| SHELL-009 | /docs/theming: minimal real route (first-frame-dark surface for FLOW-SHELL-02) | techwriting-implementer | 2 | C | ⬜ Pending |
| SHELL-010 | THE COPY PASS: hero statement, not-an-npm phrasing, counter/CTA/tab/toggle microcopy | techwriting-implementer | 3 | F | ⬜ Pending |
| SHELL-011 | Widen the Playwright lane to tests/ + hero flow specs (FLOW-GEND-01 one-screen, FLOW-GEND-02 engine-following copy) | astro-implementer | 3 | F | ⬜ Pending |
| SHELL-012 | Item install + dependency-panel flow specs (data-equality against the enriched dataset) | react-native-reusables-implementer | 3 | G | ⬜ Pending |
| SHELL-013 | Theme flow specs: FLOW-SHELL-01 persisted flash-free toggle + FLOW-SHELL-02 first-visit dark, no flash | astro-implementer | 3 | G | ⬜ Pending |

**Waves:** A(2) → B(2) → C(2) → D(1) → E(2) → F(2) → G(2) — 7 waves over 13 tasks

## Source Coverage

- 05-uc-gend.md UC-GEND-01/UC-GEND-04; 06-uc-shell.md UC-SHELL-01
- TR-07 (18-token table, island budget, home wireframe R1-R12, hard UI constraints); TR-01 posture 4/5
- 12-e2e-testing-criteria.md T-GEND-001..005, T-SHELL-001/002 (human-gate T-GEND-002)

## Capability Coverage

- CAP-DOCS-01: consumes registry-items.json (counters computed at build, never hand-typed) — proves the artifact's derivation contract on a real designed screen

## Blocks

- Blocks: Sprint 03, Sprint 04, Sprint 05
- Dependent on: Sprint 01

## Task Detail Files

Generated by /kb-sprint-tasks-plan on 2026-09-11 (specialists: frontend-designer, astro-planner, react-native-reusables-planner, techwriting-planner; promotion merged with rulings + one fakeability remediation round; flow-closure 0 findings, validate_scenario 0 CRITICAL)

- SHELL-001-tokens-stylesheet.md
- SHELL-002-docslayout-shell-adoption.md
- SHELL-003-themetoggle-island.md
- SHELL-004-tabgroup-installcommand.md
- SHELL-005-button-chip-badge-primitives.md
- SHELL-006-prebuild-resolver-peers.md
- SHELL-007-designed-hero.md
- SHELL-008-item-pages-panel.md
- SHELL-009-theming-route.md
- SHELL-010-copy-pass.md
- SHELL-011-lane-hero-specs.md
- SHELL-012-item-panel-specs.md
- SHELL-013-theme-specs.md

## Automated Functional Coverage

Projection only — `human-flows.json` + the task REQUIREMENT-CONTRACT blocks are authoritative (validated by flow_coverage_check.py --task-plan: 0 findings).

| Flow ID | Kind | Gate step(s) | Owner task/AC | Test file/function | Replay |
|---|---|---|---|---|---|
| FLOW-GEND-01-home-hero-evaluation-contract | core | 1,2,3,4,5,13 | SHELL-011/AC-1 | `tests/sprint-02-shell-hero/home-hero.spec.ts :: FLOW-GEND-01-home-hero-evaluation-contract` | task |
| FLOW-GEND-02-hero-install-command-copy | core | 1,6,7,8 | SHELL-011/AC-2 | `tests/sprint-02-shell-hero/home-hero.spec.ts :: FLOW-GEND-02-hero-install-command-copy` | task |
| FLOW-GEND-20-exact-absolute-url-command-copy | core | 1,11 | SHELL-012/AC-1 | `tests/sprint-02-shell-hero/item-install-copy.spec.ts :: FLOW-GEND-20-exact-absolute-url-command-copy` | task |
| FLOW-GEND-21-dependency-panel-peers | core | 1,12 | SHELL-012/AC-2 | `tests/sprint-02-shell-hero/dependency-panels.spec.ts :: FLOW-GEND-21-dependency-panel-peers` | task |
| FLOW-SHELL-01-theme-toggle-persisted-flash-free | core | 1,9 | SHELL-013/AC-1 | `tests/sprint-02-shell-hero/theme-toggle.spec.ts :: FLOW-SHELL-01-theme-toggle-persisted-flash-free` | task |
| FLOW-SHELL-02-first-visit-prefers-dark-no-flash | core | 1,10 | SHELL-013/AC-2 | `tests/sprint-02-shell-hero/theme-first-paint.spec.ts :: FLOW-SHELL-02-first-visit-prefers-dark-no-flash` | task |

## Deferred Journeys (declared hand-offs)

- journeys/docs-agent-arc--edge-robots-blocks-registry-json → completes at a later sprint (UC-EXT-01)
- journeys/docs-agent-arc → completes at a later sprint (UC-EXT-01)
- journeys/docs-evaluator-arc → completes at a later sprint (UC-DOCS-06, UC-GEND-02, UC-GEND-05, UC-GEND-06)
- journeys/docs-integrator-arc → completes at a later sprint (UC-DOCS-01, UC-DOCS-02, UC-DOCS-04, UC-SHELL-03)
- journeys/docs-themer-arc → completes at a later sprint (UC-DOCS-01, UC-DOCS-03)
