---
roadmap: 1
project: Docs Site (Astro on Cloudflare)
generated: 2026-09-09T16:30:00-06:00
prd: .spec/prds/docs-site/README.md
sprint_count: 13
commit_horizon: 1
pr_sequencing: false
---

# Sprint Roadmap: Docs Site (Astro on Cloudflare)

## Overview

**Sprints:** 13  (5 committed · 8 provisional)
**Total Tasks:** 59  (committed sprints only; provisional sprints carry a size band)
**Current Sprint:** Sprint 01 (all 12 FUSE tasks landed) — Sprint 02 completed; Sprint 03 promoted + expanded to task files by `/kb-sprint-tasks-plan` on 2026-09-12 — Sprint 04 promoted the same day — Sprint 05 promoted 2026-09-14 (36 tasks; in flight) — Sprint 06 promoted 2026-09-15 (17 tasks / 63 pts)

All 28 in-scope use cases are demonstrated by exactly the gate of the sprint that ships them. Sprints 01–11 were authored by the dispatched specialist set (astro-planner, cloudflare-workers-planner, techwriting-planner, react-native-reusables-planner, frontend-designer) through fusion and convergence rounds staged verbatim at `.tmp/kb-sprint-plan/docs-site/`; sprints 12–13 were added by the v2.0.0 delta replan (flue-planner + ghactions-planner + techwriting-planner, staged at `.tmp/kb-sprint-plan/docs-site-delta/`).

## Sprint Sequence

| # | Milestone | Sprint | Gate | Tasks | Dependencies | Status |
|---|-----------|--------|------|-------|--------------|--------|
| 1 | — | [Sprint 01: docs-spike-skeleton](#sprint-01-docs-spike-skeleton) | Walk find-and-install on the built site (ledger → component page → copy command → same-origin JSON), proven by `pnpm e2e:docs` green, retries: 0 | 12 | — | In Progress |
| 2 | — | [Sprint 02: shell-hero](#sprint-02-shell-hero) | Hero fits one 1440×900 screen: statement, counters, copyable engine-tabbed command, both CTAs (T-GEND-002) | 13 | Sprint 01 | In Progress |
| 3 | — | [Sprint 03: family-browse](#sprint-03-family-browse) | /components counts 7 anchored families, 39 cards, verdict badges | 6 | Sprint 01 | In Progress |
| 4 | — | [Sprint 04: generated-reference](#sprint-04-generated-reference) | Mutate any enriched field → build fails naming the item; props/deps/source byte-match the served JSON | 11 | Sprint 01, Sprint 03 | In Progress |
| 5 | — | [Sprint 05: orient-search](#sprint-05-orient-search) | Stranger reads /docs/introduction in one pass (T-DOCS-002) | — | Sprint 01, Sprint 02 | Planned |
| 6 | — | [Sprint 06: guides-boundary-changelog](#sprint-06-guides-boundary-changelog) | Boundary gaps cross-check vs ledger + porting not-ported: zero contradictions (T-DOCS-018) | 17 | Sprint 05 | In Progress |
| 7 | — | [Sprint 07: deploy-live-at-apex](#sprint-07-deploy-live-at-apex) | Real CLI add from the live domain into a scratch Expo app exits 0, both engines, tsc clean (T-DELIV-013) | — | Sprint 01 | Planned |
| 8 | — | [Sprint 08: preview-rollback-drill](#sprint-08-preview-rollback-drill) | One-command rollback returns prior content within 60s (T-DELIV-010) | — | Sprint 07 | Planned |
| 9 | — | [Sprint 09: live-gallery-qr-phone](#sprint-09-live-gallery-qr-phone) | Phone with Expo Go scans a live QR → gallery opens in 30s (T-GEND-018) | — | Sprint 07, Sprint 04 | Planned |
| 10 | — | [Sprint 10: agent-trust](#sprint-10-agent-trust) | curl llms-full.txt: not-npm + ≥112 absolute-URL commands, zero short-name forms (T-EXT-001/002) | — | Sprint 07, Sprint 06 | Planned |
| 11 | — | [Sprint 11: universal-access-recovery](#sprint-11-universal-access-recovery) | Print /components/message to PDF: code + props table legible, chrome hidden (T-SHELL-017) | — | Sprint 04, Sprint 05, Sprint 06 | Planned |
| 12 | — | [Sprint 12: docs-sync-drift-detection](#sprint-12-docs-sync-drift-detection) | Merge a fixture change → read the page-by-page impact plan in the run summary, no raw logs (T-AUTO-014) | — | Sprint 05, Sprint 06 | Planned |
| 13 | — | [Sprint 13: docs-sync-agent-pr](#sprint-13-docs-sync-agent-pr) | Agent's docs-only draft PR with marker bump merges via standard review; marker advances to analyzed HEAD | — | Sprint 12, Sprint 10 | Planned |

---

## Per-Sprint Details

### Sprint 01: docs-spike-skeleton

**Sequence:** 1
**Timeline:** Phase 1
**Status:** In Progress
**Fidelity:** committed
**Proposed by:** astro-planner + react-native-reusables-planner (fused; convergence rulings staged at `.tmp/kb-sprint-plan/docs-site/fusion/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a visitor can walk the whole find-and-install path on the locally built site — open the ledger of exactly 56 items, open a component page, copy its install command with one click, and fetch that command's URL as JSON from the same served origin — proven by serving the real build's dist/ with astro preview and performing the walk in a browser at http://localhost:4321.
**Entrypoint:** Clean checkout → `pnpm install && pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` → `pnpm --filter @rnr-ai-elements/docs preview` → browser at http://localhost:4321 (product surface: built dist over astro preview / pnpm e2e:docs; never astro dev). TR-11 §5 spike mandate rides on this sprint.
**Before:** apps/docs does not exist — `pnpm --filter @rnr-ai-elements/docs build` fails with no-matching-package; nothing serves a 56-item ledger or a component page; there is no `pnpm e2e:docs`; the fail-closed enrichment exists only as PRD prose.
**Demonstrates:** UC-GEND-07 (subset AC-1/3/4/5 — AC-2 filter/toggle clauses complete at Sprint 05), UC-DELIV-01 (subset AC-1..4 — AC-5 link-check/snippet gates complete at Sprint 05). UC-GEND-03 first-cut pages and UC-DELIV-03 local same-origin serving recorded in PRD Coverage as evidence; their full demonstration lands at Sprints 04 and 07.

**Test Steps:** *(as many as coverage requires — each stranger-runnable verbatim)*
1. Run `git clone https://github.com/hackerpug-ai/rnr-ai-elements.git /tmp/rnr-spike && cd /tmp/rnr-spike && pnpm install --frozen-lockfile` — exits 0 and lists the `@rnr-ai-elements/docs` workspace package.   `exercises: FUSE-01`
2. In /tmp/rnr-spike run `pnpm e2e:docs` — exits 0 in one run with `retries: 0`; the log shows the ordered chain (`registry:build`, `gallery:manifest`, the docs prebuild reporting 56 items and props resolved for 39/39 component items, astro build) and the spike flow (open site → ledger → component page → copy command via its button → fetch URL as JSON) passing.   `exercises: FUSE-02, FUSE-03, FUSE-05, FUSE-10, FUSE-11`
3. Run `ls /tmp/rnr-spike/apps/docs/public/r/nativewind | wc -l` — prints 57 (56 item JSONs plus the per-engine registry.json index).   `exercises: FUSE-05`
4. Run `git -C /tmp/rnr-spike check-ignore apps/docs/public/r/nativewind/conversation.json && echo IGNORED` — prints IGNORED: the served registry copy is gitignored, generated-only.   `exercises: FUSE-05`
5. Run `pnpm --filter @rnr-ai-elements/docs build && pnpm --filter @rnr-ai-elements/docs preview`, open http://localhost:4321/registry — the table renders exactly 56 rows split 39/11/6, a note matching 'generated at build' mentioning public/r, both engine base URLs, and a copy button on every row's install command.   `exercises: FUSE-06, FUSE-09`
6. Open http://localhost:4321/components/conversation — h1 'Conversation', one-line description, chips for version/category/engines/Expo Go verdict, the install block FIRST containing `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus the labeled uniwind variant with a copy button, and full untruncated source in a Code view with no height limit.   `exercises: FUSE-07, FUSE-09`
7. Click the copy button on the conversation install block — the button shows a visible success state and pasting anywhere yields the exact displayed command.   `exercises: FUSE-09`
8. Open http://localhost:4321/ — the home block shows 'NOT an npm package', counters 0.2.1 and 56 items split 39/11/6, one install command as selectable text, links to /registry and /components.   `exercises: FUSE-08`
9. Copy the JSON URL out of the conversation install block and run `curl -s http://localhost:4321/r/nativewind/conversation.json` — JSON whose `name` is `conversation`, `files` non-empty, `registryDependencies` present, served from the same origin as the docs.   `exercises: FUSE-05, FUSE-07`
10. In /tmp/rnr-spike run `jq 'del(.items[] | select(.name == "shimmer"))' packages/registry/registry.json > /tmp/reg.json && mv /tmp/reg.json packages/registry/registry.json && pnpm registry:build && pnpm --filter @rnr-ai-elements/docs build` — exits non-zero naming `shimmer` and observed 55 versus 56; then `git -C /tmp/rnr-spike checkout -- . && pnpm --filter @rnr-ai-elements/docs build` exits 0.   `exercises: FUSE-04, FUSE-05`

**Dark tasks:** FUSE-12 (2 pts) — CI dashboards/logs are banned as gate observables; the user-observable proof is gate step 2, which runs the identical `pnpm e2e:docs` command the lane invokes verbatim. The lane itself is merge-blocking infrastructure with no separate on-product surface.

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| FUSE-01 | Scaffold apps/docs static Astro 7 package with the build chain pre-wired | astro-implementer | 3 | A | ⬜ Pending |
| FUSE-02 | Dual-emit the docs verdict dataset from build-gallery-manifest.ts | react-native-reusables-implementer | 2 | A | ⬜ Pending |
| FUSE-03 | Enrichment modules: ts-morph props, usage snippet, theming note (data only, no UI) | react-native-reusables-implementer | 5 | A | ⬜ Pending |
| FUSE-04 | Fail-closed gate module (incl. props-resolved) + fixture-drill script | react-native-reusables-implementer | 3 | B | ⬜ Pending |
| FUSE-05 | DocsDataPrebuild: full enrichment into registry-items.json + families map + public/r copy | react-native-reusables-implementer | 5 | C | ⬜ Pending |
| FUSE-06 | Generated /registry ledger page with per-row copy | astro-implementer | 3 | D | ⬜ Pending |
| FUSE-07 | Lean /components index + minimal /components/[item] x39 with install block first | astro-implementer | 5 | D | ⬜ Pending |
| FUSE-08 | Structural home block (explicitly NOT the designed hero) | astro-implementer | 2 | D | ⬜ Pending |
| FUSE-09 | CopyButton island (1/5) with zero-JS selectable-text fallback | astro-implementer | 2 | B | ⬜ Pending |
| FUSE-10 | pnpm e2e:docs turnkey runner over astro preview | astro-implementer | 5 | B | ⬜ Pending |
| FUSE-11 | Spike flow spec: ledger → component page → command → fetched JSON | astro-implementer | 3 | E | ⬜ Pending |
| FUSE-12 | CI docs-e2e lane in ci.yml | astro-implementer | 2 | C | ⬜ Pending |

**Waves:** A(3) → B(3) → C(2) → D(3) → E(1) — 5 waves over 12 tasks (no two tasks in a wave share a write_allowed path; full task briefs, write boundaries, and boundary contracts are staged at `.tmp/kb-sprint-plan/docs-site/fusion/A-convergence-astro.json` and land in the per-task files at expansion)

**Next Sprint Tasks:** *(generated by /kb-sprint-tasks-plan on 2026-09-10)*
- FUSE-01-scaffold-apps-docs.md
- FUSE-02-dual-emit-verdict-dataset.md
- FUSE-03-enrichment-modules.md
- FUSE-04-fail-closed-gate-module.md
- FUSE-05-docs-data-prebuild.md
- FUSE-06-registry-ledger-page.md
- FUSE-07-components-index-and-item-pages.md
- FUSE-08-structural-home-block.md
- FUSE-09-copy-button-island.md
- FUSE-10-e2e-docs-runner.md
- FUSE-11-spike-flow-spec.md
- FUSE-12-ci-docs-e2e-lane.md

#### Dependencies

- Blocks: Sprint 02, Sprint 03, Sprint 04, Sprint 05, Sprint 07
- Dependent on: None

#### PRD Coverage

- 00-overview.md, 01-scope.md (incl. v1.2.0 derivation rules), 03-functional-groups.md
- 05-uc-gend.md UC-GEND-07 (+ first-cut UC-GEND-03 pages: title/description/chips/install/source)
- 07-uc-deliv.md UC-DELIV-01 AC-1..4 (AC-5 completes at Sprint 05); UC-DELIV-03 local same-origin serving as spike-fixture evidence (live-domain ACs demonstrated at Sprint 07)
- 11-technical-requirements/01, 02, 03, 04, 06, 07 (island 1/5, ledger/component-detail wireframes, null-imagery), 08 (R7), 09, 10, 11 (§1–§7)
- 11-e2e-testing-criteria.md T-DELIV-001..004, T-GEND-009/010/013/016/021/024/027..031

#### Capability Coverage

- CAP-DOCS-01: owns the full enrichment chain this sprint — every TR-02 gate (56 exact, files non-empty, props resolved, family exact, verdict present) inside the prebuild the spike proves
- CAP-REG-01: manifest dual-emit (the single verdict computation, consumed verbatim)
- CAP-INST-01: absolute-URL install-command surface (ledger rows + item pages); live-domain proof at Sprint 07

---

### Sprint 02: shell-hero

**Sequence:** 2
**Timeline:** Phase 1
**Status:** In Progress
**Fidelity:** committed
**Proposed by:** frontend-designer (lead) + react-native-reusables-planner + astro-planner + techwriting-planner (promotion dispatch 2026-09-10; proposals + convergence rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-02-shell-hero/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** A visitor opening `/` at 1440x900 over `astro preview` sees the hero's not-an-npm-package statement, the version counter (0.2.1), the item counters (56 / 39 / 11 / 6), the copyable engine-tabbed install command, plus both Get started / Browse components CTAs — all without scrolling.
**Entrypoint:** Built dist/ served by `astro preview` at http://localhost:4321 (`pnpm --filter @rnr-ai-elements/docs build` then `preview`)
**Before:** AS OBSERVED 2026-09-10 (sprint-01 fully landed; four specialist reads agree): apps/docs serves sprint-01's skeleton through layouts/spike.astro — a bare HTML shell with NO token stylesheet, NO header/footer, NO theme toggle, NO pre-paint theme script (neither 'rnr-theme' nor 'rnr-engine' exists anywhere). Exactly one island of five (rnr-copy-button). The home page is FUSE-08's structural block — counters and CTAs exist, but the install strip is a single un-tabbed nativewind CopyButton and nothing asserts one-screen fit. /components/[item] stacks two labeled command rows — no engine tabs, no dependency panels anywhere (the enriched dependencies[]/registryDependencies[] render nowhere). /docs/* routes 404. playwright.config.ts testDir is pinned to the sprint-01 lane. The gate fails on every designed-shell clause.
**Demonstrates:** UC-GEND-01, UC-GEND-04, UC-SHELL-01

**Test Steps:** *(each stranger-runnable verbatim)*
1. In the repo root run `pnpm e2e:docs` — it exits 0 with `retries: 0`, and the summary lists passing specs from BOTH `tests/sprint-01-docs-spike-skeleton` and the new `tests/sprint-02-shell-hero` lane, including all six sprint-02 FLOW ids.   `exercises: SHELL-011, SHELL-012, SHELL-013`
2. Run `pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/ in a browser window sized exactly 1440x900 — the page renders inside a themed shell: a header carrying the RNR wordmark, section links, and a theme toggle, above a hero block.   `exercises: SHELL-001, SHELL-002`
3. On / at 1440x900, read the hero statement top to bottom without scrolling — it says in one pass that this is universal AI chat and agent UI components for React Native, distributed as a copy-paste registry, and that it is NOT an npm package.   `exercises: SHELL-007, SHELL-010`
4. Look at the hero counters row on the same screen — it shows version 0.2.1 and the item counters 56, 39, 11, 6, each with a readable label.   `exercises: SHELL-007, SHELL-010`
5. On / at 1440x900, compare the bottom edge of the window with the Get started and Browse components buttons — both buttons, the statement, the counters, and the install command are all fully visible without scrolling.   `exercises: SHELL-005, SHELL-007`
6. Click the uniwind tab on the hero install block — the displayed command's engine segment changes to `https://rnraielements.com/r/uniwind/conversation.json` while keeping the `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/...` form.   `exercises: SHELL-004, SHELL-007`
7. Click the copy button in the hero install block — the button shows a visible success state and pasting anywhere yields exactly the displayed command.   `exercises: SHELL-004, SHELL-007`
8. Reload http://localhost:4321/ after selecting uniwind — the hero install block still shows the uniwind tab active with its command (the engine choice persisted).   `exercises: SHELL-004`
9. Click the theme toggle in the header twice (dark to light and back) — the whole page flips both ways, and after a reload the last-chosen theme persists with no flash of the wrong theme.   `exercises: SHELL-003`
10. Set the OS/browser appearance to dark, open a fresh private window, and load http://localhost:4321/docs/theming, then http://localhost:4321/, then http://localhost:4321/components/message — every page renders dark from the very first frame with no light flash.   `exercises: SHELL-001, SHELL-003, SHELL-009`
11. Open http://localhost:4321/components/shimmer — the install block leads the page with engine tabs; click copy on the nativewind tab (button shows success, paste yields the exact nativewind command), then switch to the uniwind tab and copy again (paste yields the exact uniwind command).   `exercises: SHELL-008`
12. Read the Dependencies section on http://localhost:4321/components/shimmer and http://localhost:4321/components/conversation — each lists that item's required packages (e.g. react-native-reanimated, react-native-safe-area-context) and its registry dependency URLs with the engine segment resolved to real rnraielements.com URLs.   `exercises: SHELL-006, SHELL-008`
13. On / click Get started — the registry ledger at /registry opens; go back, click Browse components — /components opens showing the family sections.   `exercises: SHELL-005, SHELL-007`

**Dark tasks:** None — every task is exercised by at least one gate step.

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| SHELL-001 | Author the 18-token oklch stylesheet (global.css), dark-first | frontend-designer | 3 | A | ⬜ Pending |
| SHELL-002 | DocsLayout + sticky Header + Footer + zero-JS drawer; adopt on existing pages | frontend-designer | 5 | B | ⬜ Pending |
| SHELL-003 | ThemeToggle island + pre-paint flash-free theme script | astro-implementer | 3 | C | ⬜ Pending |
| SHELL-004 | TabGroup island (persisted rnr-engine) + InstallCommand composite | astro-implementer | 5 | D | ⬜ Pending |
| SHELL-005 | Button / Chip / Badge primitives (token-governed) | frontend-designer | 2 | B | ⬜ Pending |
| SHELL-006 | Prebuild: {engine}/{version} URL resolver + derived AI SDK peers (site-facts.json) | react-native-reusables-implementer | 3 | A | ⬜ Pending |
| SHELL-007 | Designed one-screen hero (R5-R8); supersedes FUSE-08 + home.spec.ts | frontend-designer | 5 | E | ⬜ Pending |
| SHELL-008 | Item pages: engine-tabbed install + dependency panel; retire spike.astro | astro-implementer | 5 | E | ⬜ Pending |
| SHELL-009 | /docs/theming minimal real route (FLOW-SHELL-02 surface) | techwriting-implementer | 2 | C | ⬜ Pending |
| SHELL-010 | THE COPY PASS: hero statement, microcopy, terminology lock | techwriting-implementer | 3 | F | ⬜ Pending |
| SHELL-011 | Playwright lane widened to tests/ + hero flow specs | astro-implementer | 3 | F | ⬜ Pending |
| SHELL-012 | Item install + dependency-panel flow specs (data-equality oracle) | react-native-reusables-implementer | 3 | G | ⬜ Pending |
| SHELL-013 | Theme flow specs: persisted toggle + first-visit dark | astro-implementer | 3 | G | ⬜ Pending |

**Waves:** A(2) → B(2) → C(2) → D(1) → E(2) → F(2) → G(2) — 7 waves over 13 tasks (no two tasks in a wave share a write_allowed path; promotion merged from four specialist proposals with rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-02-shell-hero/convergence-rulings.md`)

**Next Sprint Tasks:** *(generated by /kb-sprint-tasks-plan on 2026-09-11)*
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

#### Dependencies

- Blocks: Sprint 03, Sprint 04, Sprint 05
- Dependent on: Sprint 01

#### PRD Coverage

- 05-uc-gend.md UC-GEND-01/UC-GEND-04; 06-uc-shell.md UC-SHELL-01
- TR-07 (18-token table, island budget, home wireframe R1–R12, hard UI constraints); TR-01 posture 4/5
- 11-e2e-testing-criteria.md T-GEND-001..005, T-SHELL-001/002 (human-gate T-GEND-002)

#### Capability Coverage

- CAP-DOCS-01: consumes registry-items.json (counters computed at build, never hand-typed) — proves the artifact's derivation contract on a real screen

---

### Sprint 03: family-browse

**Sequence:** 3
**Timeline:** Phase 1
**Status:** In Progress
**Fidelity:** committed
**Proposed by:** react-native-reusables-planner (lead) + astro-planner + frontend-designer (promotion dispatch 2026-09-12; proposals + convergence rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-03-family-browse/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a visitor opening /components over `astro preview` counts seven anchored family sections holding exactly 39 cards, each card showing its component name plus an Expo Go verdict badge, proven by opening http://localhost:4321/components and tallying the sections, cards, and badges in the browser.
**Entrypoint:** Built dist over `astro preview` at http://localhost:4321/components.
**Before:** AS OBSERVED 2026-09-12 at HEAD 2107567 (sprint-02 completed; three specialist reads agree): /components (src/pages/components/index.astro) is the sprint-01 FUSE-07 lean list — nine anchored `<section>`s render from families.json in family order (the seven component families plus ui and lib) as two-column `<ul>` lists holding all 56 names: 39 plain `<a>` links (the registry:component name set, verified identical to the 7 component families' itemNames) and 17 text `<span>`s. No cards, no descriptions, no category chips, no Expo Go verdict badges, no filter. Badge.astro exists unwired (zero imports site-wide); the component detail page renders the verdict as a plain chip (li[data-chip="expo"], text 'Expo Go'/'Dev client') and the /registry ledger as plain .ledger-verdict text. Exactly three custom elements exist (rnr-copy-button, rnr-tab-group, rnr-theme-toggle), pinned by tests/sprint-01-docs-spike-skeleton/island-budget.test.ts. Home carries no R9 teaser (src/pages/index.astro's own comment defers R9-R12 to Sprint 03+). Data facts that shape the sprint: every registry:component description exceeds 120 chars (longest 1840) and zero items carry expoGo:false today. The gate is RED: sections are nine not seven, cards are zero, badges are zero.
**Demonstrates:** UC-GEND-02 (UC-GEND-05's badge wiring ships here as supporting task work — card badges stay gate-proven via the card-anatomy flow; UC-GEND-05 demonstrates at Sprint 09 where its QR/gallery flow completes)

**Test Steps:** *(each stranger-runnable verbatim; steps bind only to the two locked flows — the filter-island, home-teaser, and theme-flip human checks ride inside step 1 via their lane specs and the task ACs)*
1. At the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0: the ordered chain (registry:build → gallery:manifest → docs build → playwright install → playwright test) completes with every lane green, including the superseded sprint-01 lanes (component-page, ledger, island-budget), all sprint-02 lanes, and the new tests/sprint-03-family-browse lane — both FLOW ids plus the verdict-badge-wiring, ledger-filter-island, and home-family-teaser specs.   `exercises: FAM-001, FAM-002, FAM-003, FAM-004, FAM-005, FAM-006`
2. Run `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families` — 3 passed (chromium-desktop, chromium-mobile, chromium-nojs); evidence JSON written to .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-07-components-page-39-in-7-families.json.   `exercises: FAM-001, FAM-003`
3. Run `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy` — 3 passed across all three projects; cards_with_all_fields == 39 in the evidence JSON at .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy.json.   `exercises: FAM-001, FAM-002, FAM-003`
4. Run `pnpm --filter @rnr-ai-elements/docs build && pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/components in a browser and tally: exactly seven anchored family sections in the order conversation, message, prompt-input, reasoning, sources, suggestion, tool; each section heading carries a count chip reading 3, 7, 6, 7, 4, 1, 11 respectively (sum 39); 39 cards total; spot-check that conversation, shimmer, persona, and sources each appear on exactly one card; click any card — it opens that item's real /components/{item} page, and no card links anywhere else.   `exercises: FAM-002, FAM-003`
5. On the same page read cards top to bottom across all seven sections: every card shows (1) the component's display name, (2) a non-empty one-line description in muted text, (3) a category chip, and (4) an Expo Go verdict badge reading exactly 'runs in Expo Go' or 'requires a dev client' — no card missing any of the four; also open http://localhost:4321/registry and confirm every one of the 56 rows' Expo Go column shows the same badge.   `exercises: FAM-002, FAM-005`

**Dark tasks:** None — every task is exercised by at least one gate step.

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| FAM-001 | RED-first locked-flow lane specs (FLOW-GEND-07 + FLOW-GEND-08) with evidence plumbing | astro-implementer | 3 | A | ⬜ Pending |
| FAM-002 | SectionHeader + ComponentCard + one-line description clamp + Chip counter-optional | frontend-designer | 5 | A | ⬜ Pending |
| FAM-003 | /components seven-family card grid; supersede the FUSE-07 lean-list spec block | astro-implementer | 5 | B | ⬜ Pending |
| FAM-004 | rnr-ledger-filter island (4 of 5) + island-budget 3→4 + own lane spec | astro-implementer | 5 | C | ⬜ Pending |
| FAM-005 | Verdict badges from the single manifest onto item pages + 56 ledger rows; Badge strings scenario-exact | react-native-reusables-implementer | 3 | C | ⬜ Pending |
| FAM-006 | Home R9 family teaser grid + own lane spec | frontend-designer | 3 | D | ⬜ Pending |

**Waves:** A(2) → B(1) → C(2) → D(1) — 4 waves over 6 tasks (no two tasks in a wave share a write_allowed path; FAM-003 wave B and FAM-005 wave C both touch tests/sprint-01-docs-spike-skeleton/component-page.spec.ts — sequential waves, per the lead's sequencing; promotion merged from three specialist proposals with rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-03-family-browse/convergence-rulings.md`)

**Next Sprint Tasks:** *(generated by /kb-sprint-tasks-plan on 2026-09-12)*
- FAM-001-red-first-locked-flow-lane-specs.md
- FAM-002-sectionheader-componentcard-clamp.md
- FAM-003-components-seven-family-card-grid.md
- FAM-004-ledger-filter-island.md
- FAM-005-verdict-badges-single-manifest.md
- FAM-006-home-r9-family-teaser.md

#### Dependencies

- Blocks: Sprint 04
- Dependent on: Sprint 01

#### PRD Coverage

- 05-uc-gend.md UC-GEND-02/UC-GEND-05; TR-07 (components-index wireframe, SectionHeader/ComponentCard NEW)
- 11-e2e-testing-criteria.md T-GEND-006/007, T-GEND-019 (badge subset)

#### Capability Coverage

- CAP-DOCS-01: renders the enriched artifact's family/verdict fields (completes UC-GEND-02's card contract)

---

### Sprint 04: generated-reference

**Sequence:** 4
**Timeline:** Phase 2
**Status:** In Progress
**Fidelity:** committed
**Proposed by:** react-native-reusables-planner (lead) + astro-planner + frontend-designer (promotion dispatch 2026-09-12; proposals, fusion positions, and rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-04-generated-reference/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a visitor can open any of the 39 generated reference pages over `astro preview` and read its auto-generated props table (Name/Type/Default/Description with at least one row), its dependency panel listing registryDependencies and AI SDK v7 peers, and its full untruncated source that byte-matches the served /r/*.json content, proven by opening http://localhost:4321/components/conversation in a browser and diffing its Code view against `curl http://localhost:4321/r/nativewind/conversation.json` (T-GEND-023/024/015 shape).
**Entrypoint:** Built dist over `astro preview` at http://localhost:4321/components/[item], plus curl of the same origin's /r/*.json.
**Before:** At HEAD 31bca18, /components/conversation over `astro preview` renders breadcrumb, h1, one-line description, chip row (v0.2.1/category/engines/Expo Go), the engine-tabbed InstallCommand as first section, the DependencyPanel (registryDependencies + dependencies + the AI SDK peer `ai ^7.0.89`), full untruncated nativewind-substituted source as a bare <section data-section="source">, and the within-family pager — the roadmap's 'no dependency panels, no family pager' clauses are stale (both shipped sprint-02). Still absent, all RED against the gate: no props table, no theming-note or usage-snippet rendering (39/39 components carry non-empty props[]/themingNote/usageSnippet in apps/docs/src/data/registry-items.json, verified present and unrendered), no tabbed or standalone Code view contract, no seam callouts (renderMarkdown users: message/reasoning/context; TextClassContext users: message/prompt-input/tool/plan/queue/commit/terminal/environment-variables), no QrPanel, no dev-client matrix (enriched-markdown/streamdown/speech-recognition/extended-audio appear nowhere; zero items have expoGo:false), and no family install commands on /components (the FAM-003 seven-family card grid). The FUSE-04 gates module has five gates (count/files/props/family/verdict) plus drill-item-count.ts — no matrix-shape gate, no imagery flag, no qrDeepLink/metaDescription derivation. Opening the gate URL and diffing its Code view against curl of /r/nativewind/conversation.json cannot pass the props-table clause: no table renders.
**Demonstrates:** UC-GEND-03, UC-GEND-04, UC-GEND-06, UC-SHELL-03 (UC-GEND-05's matrix + QR-panel work ships here as supporting task work; UC-GEND-05 demonstrates at Sprint 09 where its QR/gallery flow completes)

**Test Steps:** *(each stranger-runnable verbatim; step 1's `pnpm e2e:docs` also carries the non-flow riding specs — qr-panel decode, dev-client matrix, site crawl, preview-omission no-JS, enrichment drill)*
1. At the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0: the ordered chain (registry:build → gallery:manifest → docs build → playwright install → playwright test) completes with every lane green, including the superseded sprint-01/02/03 lanes and the NEW tests/sprint-04-generated-reference lane — the eight FLOW specs plus the riding specs qr-panel.spec.ts (T-GEND-017), dev-client-matrix.spec.ts (T-GEND-020), site-crawl.spec.ts (T-GEND-016), preview-omission-nojs.spec.ts (T-GEND-021), and the enrichment-drill.test.ts vitest file (T-GEND-022/026).   `exercises: REF-001, REF-002, REF-003, REF-004, REF-005, REF-006, REF-007, REF-008, REF-009, REF-010, REF-011`
2. Run `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy` — 3 passed (chromium-desktop, chromium-mobile, chromium-nojs); evidence JSON written to .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.json, asserting across all 39 pages that top-level section DOM order is install before source/props/theming/usage and that 0 preview-panel elements exist.   `exercises: REF-001, REF-009`
3. Run `pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family` — 3 passed across all three projects; the evidence JSON at .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-15-family-pager-stays-in-family.json records set(pages_reachable_via_pager) == set(family_members) for each of the seven families and every pager href returning 200 in dist/.   `exercises: REF-001, REF-009`
4. Run `pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy` — 3 passed; every one of the 39 component pages yields, per engine tab, a one-click copy matching ^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$ with a visible success state; the 17 ui/lib items complete at Sprint 05 (no such pages yet).   `exercises: REF-001, REF-009`
5. Run `pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers` — 3 passed; panels on shimmer and conversation equal registry dependencies + engine-resolved registryDependencies + the AI SDK v7 peer, and >=5 sampled panels match the live-served /r/nativewind/*.json dependency fields with 0 invented or dropped entries.   `exercises: REF-001, REF-006, REF-009`
6. Run `pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated` — 3 passed; props_tables == 39 in the evidence JSON at .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-34-props-table-generated.json, every table carrying Name/Type/Default/Description headers and >=1 row (conversation: 5 rows), types as resolved text — never any/unknown placeholders.   `exercises: REF-001, REF-002, REF-009`
7. Run `pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source` — 3 passed; >=5 sampled multi-file items (e.g. audio-player, prompt-input, tool) byte-match the Code view text against files[].text fetched from http://localhost:4321/r/nativewind/{item}.json — zero normalization diffs, every file present, no height limit or clipping.   `exercises: REF-001, REF-003, REF-009`
8. Run `pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages` — 3 passed across all three projects (the chromium-nojs project asserts the stacked server-rendered fallback): clicking uniwind on /components/conversation sets localStorage 'rnr-engine'="uniwind", soft navigation and a hard load of /components/message keep aria-selected="true" on uniwind, switching back rewrites storage, and no engine state ever appears in any URL.   `exercises: REF-001, REF-009`
9. Run `pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html` — 3 passed; the raw pre-JS HTML of /components/conversation and /components/message contains BOTH literal strings https://rnraielements.com/r/nativewind/ and https://rnraielements.com/r/uniwind/ inside their server-rendered tab panels, and with JavaScript disabled both panels render stacked and readable.   `exercises: REF-001, REF-009`
10. Run `pnpm --filter @rnr-ai-elements/docs build && pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/components/conversation in a browser and read: (1) the props table with Name/Type/Default/Description columns and >=1 row; (2) the dependency panel listing registryDependencies button/icon/empty plus react-native-safe-area-context plus the AI SDK v7 peer; (3) the theming note with token chips and the usage snippet with an always-visible copy button; (4) the full untruncated source in the Code view with its QR aside. Then run `curl -s http://localhost:4321/r/nativewind/conversation.json` and diff the served files[].text against the Code view text — zero byte differences.   `exercises: REF-002, REF-003, REF-004, REF-005, REF-006, REF-009`
11. On the same preview, open http://localhost:4321/components/conversation at a 390px viewport (browser DevTools responsive mode) and check the FLOW-GEND-14 anatomy's mobile frame: the props table renders as stacked cards (one card per prop, label plus value), the dependency table scrolls horizontally with the first column sticky, theming/usage/source regions stay readable with zero clipped or overlapped text, and every copy button plus the QR aside remains operable with touch targets >=44px.   `exercises: REF-002, REF-003, REF-006, REF-009`

**Dark tasks:** None — every task is exercised by at least one gate step.

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| REF-001 | RED-first locked-flow lane specs (8 flows, flow-id-verbatim filenames) + riding specs with evidence plumbing | astro-implementer | 3 | A | ⬜ Pending |
| REF-002 | PropsTable.astro — zero-JS R8 table from prebuild props[] | frontend-designer | 2 | A | ⬜ Pending |
| REF-003 | CodeBlock + ThemingNote + UsageSnippet — R6c/R9/R10 visual primitives | frontend-designer | 3 | A | ⬜ Pending |
| REF-004 | Callout.astro + build-time seam map + real seam sections on /docs/theming | frontend-designer | 3 | A | ⬜ Pending |
| REF-005 | QrPanel.astro — build-time inline SVG deep-link QR | frontend-designer | 2 | A | ⬜ Pending |
| REF-006 | DataTable.astro + DependencyPanel re-skin (R7) | frontend-designer | 2 | A | ⬜ Pending |
| REF-007 | Authored dev-client matrix dataset — 4 opt-in entries with real peers + permissions | react-native-reusables-implementer | 3 | A | ⬜ Pending |
| REF-008 | Consolidated data pipeline — prebuild qrDeepLink/metaDescription + matrix gate wiring + imagery flag (single owner of prebuild.ts + gates.ts) | astro-implementer | 5 | B | ⬜ Pending |
| REF-009 | [item].astro assembly — R5–R12 region order, Code-alone source (no tab chrome), props/theming/usage/seams/QR/pager + region-contract re-pins | astro-implementer | 5 | C | ⬜ Pending |
| REF-010 | /components single owner — trailing no-id matrix section + family install commands (T-GEND-014) | astro-implementer | 3 | B | ⬜ Pending |
| REF-011 | Enrichment drill — unresolved props, matrix shape, imagery-flag pair, single-source derivation (T-GEND-026) | react-native-reusables-implementer | 5 | D | ⬜ Pending |

**Waves:** A(7) → B(2) → C(1) → D(1) — 4 waves over 11 tasks (no two tasks in a wave share a write_allowed path; promotion fused from three specialist proposals with positions + rulings staged at `.tmp/kb-sprint-tasks-plan/sprint-04-generated-reference/`)

#### Next Sprint Tasks

Generated by /kb-sprint-tasks-plan on 2026-09-12

- REF-001-red-first-locked-flow-lane-specs-8-flows-flow-id-verbatim-filenames-riding-specs.md
- REF-002-propstable-astro-zero-js-r8-table-from-prebuild-props.md
- REF-003-codeblock-themingnote-usagesnippet-r6c-r9-r10-visual-primitives.md
- REF-004-callout-astro-build-time-seam-map-real-seam-sections-on-docs-theming.md
- REF-005-qrpanel-astro-build-time-inline-svg-deep-link-qr.md
- REF-006-datatable-astro-dependencypanel-re-skin-r7.md
- REF-007-authored-dev-client-matrix-dataset-4-opt-in-entries-with-real-peers-permissions.md
- REF-008-consolidated-data-pipeline-prebuild-qrdeeplink-metadescription-matrix-gate-wirin.md
- REF-009-item-astro-assembly-r5-r12-region-order-code-alone-source-no-tab-chrome-props-th.md
- REF-010-components-single-owner-trailing-no-id-matrix-section-family-install-commands-t.md
- REF-011-enrichment-drill-unresolved-props-matrix-shape-imagery-flag-pair-single-source-d.md

#### Dependencies

- Blocks: Sprint 09, Sprint 11
- Dependent on: Sprint 01, Sprint 03

#### PRD Coverage

- 05-uc-gend.md UC-GEND-03..06; 06-uc-shell.md UC-SHELL-03
- TR-02, TR-03 (registry_page_model), TR-07 (component-detail wireframe, 14 regions + mobile frame), TR-08 R7/R8, TR-10
- 12-e2e-testing-criteria.md T-GEND-009..026

#### Capability Coverage

- CAP-DOCS-01: field-level enrichment gates drilled (empty files[].path, bogus family, missing verdict, unresolved props, matrix shape) — completes UC-DELIV-01 AC-2's clause set machine-asserted
- CAP-INST-01: dependency panel + absolute-URL command correctness per item

---

### Sprint 05: orient-search

**Sequence:** 5
**Timeline:** Phase 2
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** techwriting-planner (lead) + astro-planner + frontend-designer
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.
**Entrypoint:** docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction
**Before:** On the fused walking skeleton, /docs/* routes 404 — no Introduction, Installation, CLI, Theming, or Dark mode pages exist, no quickstart, no markdown page shell, and Cmd+K does nothing anywhere on the site.
**Demonstrates:** UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)

**Sizing (provisional):** ~12 items · ~34–55 pts — docs content collection + markdown layouts, PageHeader/Toc/Prose/DataTable + Callout NEW, the getting-started set + single quickstart to TR-12, TokenTable live demo, engine TabGroup in mdx prose, Pagefind + SearchDialog island (4/5), snippet gate + dist/ link check (completing UC-DELIV-01 AC-5), LedgerFilter island + LedgerTable polish per frontend's delivered contribution (completing UC-GEND-07 AC-2), content review

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

**In-flight task addition** *(planner ask after promotion; the promoted 36-task table lives in the sprint's SPRINT.md)*

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| FIX-ORI-AI-001-1 | Keep the worked example hook's regenerate payload itemIds unique | aisdk-implementer | 2 | 5 | ⬜ Pending |
| FIX-ORI-RN-005-1 | Make the canonical live-chat sources compile in the independent NativeWind consumer | react-native-reusables-implementer | 2 | 7 | ⬜ Pending |
| FIX-ORI-RN-004-2 | Make the Uniwind live-proof driver's web leg complete under orchestration | react-native-reusables-implementer | 3 | 8 | ⬜ Pending |
| FIX-ORI-RN-004-3 | Un-stick the driver's caller-backend restart after the endpoint-loss stop | react-native-reusables-implementer | 3 | 8 | ⬜ Pending |
| FIX-ORI-AI-002-1 | Take the NativeWind driver's turn records baselines before each send flow | react-native-reusables-implementer | 2 | 12 | ⬜ Pending |
| FIX-ORI-CI-001-1 | Author the Quickstart tutorial designation and land its schema field | astro-implementer | 1 | 16 | ⬜ Pending |
| FIX-ORI-AST-004-1 | Publish the docs-owned streamdown dependency-explainer destination | astro-implementer | 2 | 17 | ⬜ Pending |
| FIX-ORI-VIS-001-1 | Include the reserved theming entry in section navigation | astro-implementer | 1 | 18 | ⬜ Pending |
| FIX-ORI-SUITE-1 | Repair the seven pre-existing suite breaks on trunk | ghactions-implementer | 3 | 19 | ⬜ Pending |
| FIX-ORI-CONT-004-1 | Pin react-native-web 0.21.2 in both consumer templates | react-native-reusables-implementer | 2 | 20 | ⬜ Pending |
| FIX-ORI-SUITE-2 | Repair the foreign suite drifts behind the aggregate's residual failures | ghactions-implementer | 3 | 21 | ⬜ Pending |
| FIX-ORI-RN-003-3 | Make driveWeb return from the seed web legs and the negative-control serve | react-native-reusables-implementer | 3 | 24 | ⬜ Pending |

Added 2026-09-18 via ask `ask-wave8-add-payload-retry-fix`: after owned-endpoint loss the worked example hook's clearError-then-regenerate retry assembled a payload with duplicated assistant entries carrying repeated OpenAI itemIds, which the real OpenAI Responses endpoint rejects (ORI-RN-004 cycle-1 blocked report). Depends on ORI-AI-001; unblocks ORI-RN-004's retry-completion oracle.

Added 2026-09-18 via ask `ask-wave9-add-nativewind-compile-fix`: the real recipe plus the clean consumer's tsc rejected the five canonical app sources with exactly two errors, both in landed files outside ORI-RN-005's write scope — the canonical screen's `useUniwind` import (TS2307 in a consumer that never adds uniwind) and the nativewind template `lib/theme.ts` not exporting `THEME` (TS2459) (ORI-RN-005 cycle-1 blocked report, checkpoint 20f4b6a6). Depends on ORI-RN-001, ORI-RN-004, ORI-AI-001; unblocks ORI-RN-005's blocked compile and platform legs.

Added 2026-09-20 via ask `ask-wave10-add-uniwind-webleg-stall-fix`: the ORI-RN-004-owned Uniwind driver (tests/sprint-05-orient-search/support/live-example-proof.test.ts) stalls indefinitely in its live-phase web leg under ORI-AI-002's orchestration — after the ios and android legs pass, the driver never starts web-leg browser/export work, never writes its live run-manifest, and the caller idles 45+ minutes (run ORI-AI-002-1789929365070; ORI-AI-002 cycle-2 blocked report). Depends on ORI-RN-004 and ORI-AI-001; unblocks ORI-AI-002's six-target matrix and vitest GREEN.

Added 2026-09-21 via ask `ask-wave11-add-caller-backend-restart-fix`: with the FIX-ORI-RN-004-2 bounded driver adopted, the matrix advanced past every native leg into the live web leg and stalled one layer deeper — the endpoint-loss backend stop completes through the caller-provided options.backend handle, but the driver never issues the following restart (no restart command in the owner adapter's command file, no heartbeats for 30+ minutes; run ORI-AI-002-1789975643876; ORI-AI-002 cycle-3 blocked report). Depends on ORI-RN-004 and FIX-ORI-RN-004-2; unblocks ORI-AI-002's six-target matrix and vitest GREEN.

Added 2026-09-23 via ask `ask-wave12-add-nativewind-baseline-ordering-fix`: the ORI-RN-005-owned NativeWind driver (tests/sprint-05-orient-search/support/nativewind-live-example.ts) captures its records baseline inside awaitTurn — after the synchronous maestro send flow returns — so on the iOS marker turn the marker's completed provider record (~1.7 s) lands before the baseline is taken and the length>baseline terminal predicate never fires: the leg fails as 'no terminal record' with the record present, reproduced 3/3 on freshly rebooted devices (ORI-AI-002 cycle-4 blocked report). Depends on ORI-RN-005, FIX-ORI-RN-004-2 and FIX-ORI-RN-004-3; unblocks ORI-AI-002's six-target matrix and vitest GREEN.

Added 2026-09-24 via ask `ask-wave16-add-quickstart-tutorial-designation`: ORI-CI-001's boundary contract 5 assumed ORI-CONT-003 authors `tutorial: true` against the declared schema, but no task in the prerequisite chain ever owned the designation — trunk's quickstart.mdx frontmatter carries only title/description/section/order(2.5) and the docs schema declares no tutorial field, so the in-flight fail-closed gate observes 0 published tutorials versus the required 1 and can never be wired without breaking every docs build (ORI-CI-001 cycle-1 blocked report, checkpoint 41a49601). Depends on ORI-CONT-003; unblocks ORI-CI-001's cycle-2 gate wiring, the subprocess drill, and the six evidence files.

Added 2026-09-25 via ask `ask-wave17-add-streamdown-dependency-destination`: ORI-AST-004's search-dialog contract pins /components/streamdown as one of its five item destinations and the locked gate flows (human-flows.json:730,742) tour it, but the registry's 56 items never included streamdown — it is the third-party markdown-rendering dependency the conversation family consumes through the renderMarkdown seam, not a shippable registry item — so the route 404s and the dialog's eight streamdown legs cannot pass (ORI-AST-004 cycle-1 blocked report, checkpoint b2560ce3). Human decision recorded in-session 2026-09-25: create the docs-owned dependency-explainer page at that route rather than amend the locked contracts. Depends on ORI-AST-008; unblocks ORI-AST-004's remaining streamdown legs and every task chained behind it.

Added 2026-09-25 via ask `ask-wave18-add-theming-nav-inclusion`: apps/docs/src/lib/docs-navigation.ts RESERVED_DOC_SLUGS=['theming'] feeds both publishedDocs (catch-all route generation, where the exclusion is correct — the static /docs/theming route owns the destination) and sectionNavigation (the nav derivation every rendered page consumes), so /docs/theming is silently absent from every page's section nav and the Guides group never renders; ORI-AST-003 landed the static route but never adapted the nav its own module comment anticipated ("until ORI-AST-003 adapts it") (ORI-VIS-001 cycle-1 blocked report, checkpoint 1c732dc1). Depends on ORI-AST-003; unblocks ORI-VIS-001's AC-2 theming leg and every task chained behind it.

Added 2026-09-25 via ask `ask-wave19-add-preexisting-suite-repair`: seven pre-existing suite breaks on trunk — each planner-verified failing on trunk ca759bd7 independent of the reporting tasks — block ORI-CI-003/ORI-CI-004's aggregate `pnpm test` acceptance: single-tutorial-gate.test.ts's duplicate/noncanonical drills stop at check:snippets 'no committed binding' before Astro's tutorial gate (the drills predate ORI-CI-002's ordered chain), scaffold.build.test.ts pins the retired three-segment build script and the pre-ORI-AST-001/ORI-DEP-001 TR-06 dependency set, data-table-contract.test.ts wants the pre-AST-007 non-optional rows prop, ledger.spec.ts and verdict-badge-wiring.spec.ts select the pre-AST-007 ledger markup, and not-found-search-recovery.spec.ts's header-search selector strict-violates since VIS-003's close button landed inside the slot (ORI-VIS-004 handoff scope_impact, wave-19 decision). Test-file repairs only — zero product-source changes; depends on ORI-CI-002 (completed); unblocks ORI-CI-003 and ORI-CI-004's aggregate acceptance.

Added 2026-09-25 via ask `ask-wave20-add-rnw-pin`: react-native-web@0.21.3 (published 2026-09-25T15:00Z, after ORI-RN-003's committed green) resolves from the consumer templates' `~0.21.0` range, and its new InputAccessoryView export dies inside uniwind 1.11.0's incomplete package.json exports map (the `./components/*` wildcard points at dist/module/components/web/InputAccessoryView.js, which the uniwind tarball does not ship), so every fresh uniwind consumer's `expo export --platform web` fails 'Unable to resolve module ./exports/InputAccessoryView' — reproduced standalone twice, with 0.21.2 exporting cleanly both times (ORI-CONT-004 cycle-1 blocked report, checkpoint 78f88b07). The one-line exact pin lands in packages/docs-snippets/{nativewind,uniwind}/package.json, outside the pnpm wo

Added 2026-09-26 via ask `ask-wave21-add-foreign-suite-repair`: the in-flight seven-suite repair landed all seven chartered repairs and blocked on its aggregate clause — six foreign suites fail on the candidate through no fault of those repairs (cycle-1 blocked report, wave-21 decision). Planner-verified standalone on the recorded candidate: four are test-side drift or runtime-class damage now chartered — docs-collection.test.ts's scratch fixture predates the app's repo-root references (TokenTable.astro's scripts/docs-data/token-map import and the quickstart page's packages/docs-snippets render-time read, so every scratch build dies UNRESOLVED_IMPORT then ENOENT; mirroring the two trees makes the identical build exit 0), docs-data-prebuild.test.ts's tracked-files assertion meets the five authored font files ORI-VIS-001 landed under apps/docs/public/fonts/, live-example-api.test.ts's AC-4 hook literal predates FIX-ORI-AI-001-1's lazy expo/fetch import, and the two 75-minute NativeWind marathon tokens recorded concluded-but-failed legs (no assertion drift; the 5-entry source manifest is hash-current). Two of the six are NOT drift and are routed, not masked: ci-chain-order's only failing token embeds the full Playwright lane through recovery-presentation.spec.ts's ac-5 public-origin prerequisite (the apex answers HTTP 404 with an empty body — ORI-DEP-002/003 own it; the suite's other two tokens verified green standalone), and contributing-content.test.ts verified 4/4 green standalone (its aggregate failure was the end-of-run tmpdir-reaper cascade — run hygiene for the one rerun). Test-files-only; zero product-source changes; depends on ORI-CI-002 (completed); collapses the aggregate's residual failure set to exactly the deployment-gated closure and unblocks the aggregate acceptance behind ORI-DEP-002/003.rkspace. Depends on ORI-RN-001 and ORI-RN-003; unblocks ORI-CONT-004's sixth Quickstart seed leg and the per-engine live matrices behind it.

Added 2026-09-28 via ask `ask-wave24-add-driveweb-return`: FIX-ORI-RN-003-3 makes `driveWeb` return. ORI-CONT-004 cycle 3 is blocked because that call does not return. Commit `6e98cf4ad9e00160cee84716cf2efedb1aa75ecc` is on branch `kb-run-sprint/sprint-05-orient-search/ORI-CONT-004` and is not on main. FLOW-DOCS-01 and the theming `run_flow` receipts exited 0. The canonical FLOW-DOCS-02 receipt is still the 2026-09-26 file: exit_code 124, artifact_fresh false, head `a68c9a0eb19a94865ebe4b43bf739832bff8820e`. Attempt 1 wrote native seed screenshots and a uniwind web export, then hung inside `driveWeb` on the negative-control serve at 127.0.0.1:8610 while a second browser could show both seed turns. Attempt 2 stalled at web_listen for 482s. `scrollIntoViewIfNeeded`, `click`, and `fill` pass no action timeout, and Playwright 1.63 defaults that timeout to 0. The file is owned by completed ORI-RN-003 and is outside ORI-CONT-004 writeAllowed. Depends only on ORI-RN-003. Does not revise ORI-CONT-004, the locked flow commands, or human-flows.json.

#### Dependencies

- Blocks: Sprint 06, Sprint 11, Sprint 12
- Dependent on: Sprint 01, Sprint 02

#### PRD Coverage

- 04-uc-docs.md UC-DOCS-01 (all six ACs), UC-DOCS-02 (all six ACs)
- 06-uc-shell.md UC-SHELL-02 (+ halves of UC-SHELL-01/03); 05-uc-gend.md UC-GEND-07 AC-2
- TR-07 (markdown-doc/mdx wireframes, section-index), TR-12 (full), TR-10
- 11-e2e-testing-criteria.md T-DOCS-001..010, T-DOCS-029..031 (human-gate T-DOCS-002), T-SHELL-003, T-SHELL-005..012, T-DELIV-017/018

#### Capability Coverage

- CAP-DOCS-01: snippet gate + link check wired as build steps — completes UC-DELIV-01's full demonstration (AC-5)

---

### Sprint 06: guides-boundary-changelog

**Sequence:** 6
**Timeline:** Phase 2
**Status:** In Progress
**Fidelity:** committed
**Proposed by:** techwriting-planner (lead) + astro-planner + frontend-designer (promotion dispatch 2026-09-15; proposals staged at `.tmp/kb-sprint-tasks-plan/sprint-06-guides-boundary-changelog/proposals/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger opening /docs/owns-vs-does-not-own, /porting, and /registry over the built site's local preview can cross-check the boundary page's gaps list against the ledger's 56 items and the porting not-ported list and find zero contradictions and zero known omissions.
**Entrypoint:** docs site local preview — built dist over astro preview / pnpm e2e:docs; routes /docs/owns-vs-does-not-own, /porting, /registry
**Before:** AS OBSERVED 2026-09-15 at HEAD b7f5b75: /guides, /porting, /changelog, and /changelog/[version] all 404 — no route/page/content collection exists for any of them; /docs/owns-vs-does-not-own RENDERS (Sprint 05 prose) but as paragraphs with ZERO tables and no gaps section, so the cross-check is impossible; there is no changelog collection, no section-aware routing (a guides/porting entry today would publish at /docs/{slug} via the [...id].astro catch-all), and no five-guide-cap, changelog-tag-sync, or porting-consistency build gates. Git tags present: v0.1.0, v0.2.0, v0.2.1.
**Demonstrates:** UC-DOCS-03, UC-DOCS-04, UC-DOCS-05, UC-DOCS-06

**Test Steps:** *(each stranger-runnable verbatim)*
1. Check the port is free first (`lsof -nP -iTCP:4321 -sTCP:LISTEN` must be empty — Astro silently hops ports when squatted, and you would be judging the wrong site); then run `pnpm registry:build && pnpm --filter @rnr-ai-elements/docs build` — exits 0 naming no violation offenders; stdout carries `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` and `[docs-data] guides: 5 guides — cap satisfied`; then `pnpm --filter @rnr-ai-elements/docs preview --port 4321` serves http://localhost:4321.   `exercises: GBC-005, GBC-007, GBC-011, GBC-012`
2. Open http://localhost:4321/docs/owns-vs-does-not-own, http://localhost:4321/porting, and http://localhost:4321/registry. On the boundary page read the ships/does-not-ship table (`transport`, `streaming client`, `tool executor` in does-not-ship cells; `useChat` in the consumer-wires cell) and the ownership-split + gaps table. On /porting read the mapping table (a deviations column, ≥5 rows) and the not-ported list. On /registry confirm exactly 56 rows split 39/11/6. Cross-check: every boundary gap is a consumer-owned responsibility or a named not-ported upstream element — zero contradictions, zero known omissions.   `exercises: GBC-003, GBC-004, GBC-006, GBC-017`
3. Open http://localhost:4321/guides — the index lists exactly 5 guides; open each (re-theme, update-installed-items, preview-on-device, customize-rendering, troubleshooting) — each 200 with a complete how-to (every guide opens with a sentence matching /This guide shows you how to/ and numbered steps); /guides/troubleshooting carries 4 symptom→cause→fix entries; customize-rendering documents renderMarkdown and TextClassContext and component-page seam Callouts link it.   `exercises: GBC-001, GBC-002, GBC-009, GBC-010, GBC-015, GBC-016`
4. Open http://localhost:4321/changelog — entries reverse-chronological (0.2.1 → 0.2.0 → 0.1.0); open http://localhost:4321/changelog/0.2.1 — literal date 2026-09-08 + Added/Changed/Fixed headings + a touched-component link resolving 200.   `exercises: GBC-005, GBC-007, GBC-008, GBC-015, GBC-016`
5. On any page the header shows Components, Registry, Guides, Porting, Changelog (each resolving 200). Run `pnpm e2e:docs` — exits 0 with retries: 0, all lanes green including the sprint-06 lane (FLOW-DOCS-03/04/05/06) and the docs-integrator-arc + docs-themer-arc journey specs writing evidence.   `exercises: GBC-013, GBC-014`
6. First contact — on your own machine, in your own clone as it is (no fixture, no seeded data, no HOME override, no locked flow), start the docs site the way CONTRIBUTING.md documents: from the repository root run `pnpm --filter @rnr-ai-elements/docs build`, then `pnpm --filter @rnr-ai-elements/docs preview`, and open the URL that preview prints (Astro's default is http://localhost:4321; use whatever port it reports). The build's own output under apps/docs/dist/ is the only thing written; stop before any other write (no install, no publish, no edits to files). Promise (UC-DOCS-03): "A Guides section capped at five launch pages serves the re-theme, update, preview, engine-choice, and port-next jobs without becoming a curriculum." Promise (UC-DOCS-04): "The boundary page states as scannable tables that the library ships no transport, no streaming client, and no tool executor, and points to the example app as the worked reference." Promise (UC-DOCS-05): "Porting notes explain intentional divergences from Vercel AI Elements and earlier RN ports before an extender backports anything." Promise (UC-DOCS-06): "One entry per release in reverse chronological order makes maintenance health visible on the site." Then see, on THIS machine: the build exits 0, the preview serves the printed URL, and the header links Guides, Porting, and Changelog each open a real page (not a 404) that matches its promise above; if the printed port differs from 4321, judge the site at that port.   `exercises: GBC-013, GBC-009, GBC-010, GBC-004, GBC-008`

**Dark tasks:** None — every task is exercised by at least one gate step.

#### Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| GBC-001 | Author the four job how-to guides + seam-map repoint | techwriting-implementer | 5 | C | ⬜ Pending |
| GBC-002 | Author the troubleshooting guide + wire its links | techwriting-implementer | 5 | D | ⬜ Pending |
| GBC-003 | Rewrite owns-vs-does-not-own as scannable tables | techwriting-implementer | 5 | A | ⬜ Pending |
| GBC-004 | Author /porting mapping + not-ported list | techwriting-implementer | 5 | A | ⬜ Pending |
| GBC-005 | Author changelog release entries (v0.1.0–v0.2.1) | techwriting-implementer | 3 | A | ⬜ Pending |
| GBC-006 | Content review + cross-check gate | techwriting-implementer | 3 | E | ⬜ Pending |
| GBC-007 | Changelog collection schema + build gates | astro-implementer | 5 | B | ⬜ Pending |
| GBC-008 | /changelog index + [version] pages | astro-implementer | 3 | D | ⬜ Pending |
| GBC-009 | Section-aware routing (/guides/[slug] + /porting) | astro-implementer | 5 | B | ⬜ Pending |
| GBC-010 | /guides section-index page | astro-implementer | 3 | E | ⬜ Pending |
| GBC-011 | Five-guides cap gate | astro-implementer | 3 | E | ⬜ Pending |
| GBC-012 | Porting consistency gates | astro-implementer | 3 | C | ⬜ Pending |
| GBC-013 | Header/footer nav wiring (R1) | astro-implementer | 2 | F | ⬜ Pending |
| GBC-014 | Sprint-06 e2e lane + journeys | astro-implementer | 5 | G | ⬜ Pending |
| GBC-015 | IndexList component (NEW) | frontend-designer | 3 | A | ⬜ Pending |
| GBC-016 | Section-index page layout | frontend-designer | 2 | B | ⬜ Pending |
| GBC-017 | Boundary + porting table presentation | frontend-designer | 3 | C | ⬜ Pending |

**Waves:** A(4) → B(3) → C(3) → D(2) → E(3) → F(1) → G(1) — 7 waves over 17 tasks, derived from each task's declared dependencies (a task runs one wave after its latest dependency). Tasks in one wave share no NEW/MODIFY write path; shared entries are bare never-edit references to a spec another task writes.

**Next Sprint Tasks:** *(generated by /kb-sprint-tasks-plan on 2026-09-15)*
- GBC-001-author-the-four-job-how-to-guides-re-theme-update-preview-customize-re.md
- GBC-002-author-the-troubleshooting-guide-and-wire-its-links.md
- GBC-003-rewrite-the-owns-vs-does-not-own-boundary-as-scannable-tables.md
- GBC-004-author-the-porting-mapping-deviations-and-not-ported-list.md
- GBC-005-author-the-changelog-release-entries-v0-1-0-v0-2-1.md
- GBC-006-content-review-tr-12-conformance-and-boundary-porting-ledger-cross-che.md
- GBC-007-changelog-content-collection-schema-build-gates-tag-one-to-one-reverse.md
- GBC-008-changelog-section-index-and-changelog-version-release-pages.md
- GBC-009-section-aware-routing-guides-slug-porting-exclude-from-docs-catch-all.md
- GBC-010-guides-section-index-page-capped-at-five.md
- GBC-011-five-guides-cap-gate-t-docs-014-mirror.md
- GBC-012-porting-consistency-gates-mapping-slugs-resolve-not-ported-exact-compl.md
- GBC-013-header-footer-nav-wiring-r1-registry-guides-porting-changelog.md
- GBC-014-post-integration-journey-proofs-docs-integrator-arc-docs-themer-arc.md
- GBC-015-indexlist-component-new-the-section-index-linked-entry-row-primitive.md
- GBC-016-section-index-page-layout-the-shared-guides-changelog-visual-shell.md
- GBC-017-boundary-porting-scannable-table-and-callout-presentation.md

#### Dependencies

- Blocks: Sprint 10, Sprint 11, Sprint 12
- Dependent on: Sprint 05

#### PRD Coverage

- 04-uc-docs.md UC-DOCS-03 (all six ACs), UC-DOCS-04 (all five), UC-DOCS-05 (all three), UC-DOCS-06 (all three)
- TR-03 (changelog_entry, one-to-one with git tags), TR-12 (guide/troubleshooting/changelog templates), TR-07 (section-index wireframe)
- 11-e2e-testing-criteria.md T-DOCS-011..028, T-DOCS-032 (human-gate T-DOCS-018)

#### Capability Coverage

- CAP-LLMS-01: provides the changelog collection input that llms.txt and GitHub release-notes generation consume (Sprint 10)

---

### Sprint 07: deploy-live-at-apex

**Sequence:** 7
**Timeline:** Phase 3
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** cloudflare-workers-planner (lead) + astro-planner + react-native-reusables-planner
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means an integrator can run the exact command the site shows — npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json — inside a fresh scratch Expo SDK 57 app, proven by running that command with the real CLI and real network (no mocks) and watching it exit 0 with components/ai/conversation.tsx written byte-equal to the served JSON and tsc --noEmit clean (T-DELIV-013).
**Entrypoint:** Production https://rnraielements.com (apex + /r/{engine}/{item}.json same-origin) and the real consumer CLI round-trip into a scratch Expo SDK 57 app
**Before:** Today curl -sI https://rnraielements.com/ cannot connect — no Worker, no wrangler config, no deploy job in the repo; the CLI install mechanism is proven only against a git tag (PR #28), never against the live domain.
**Demonstrates:** UC-DELIV-02 (core AC-1/2 — AC-3 header tiers machine-asserted by the preview-curl lane, AC-4 gate-proven at Sprint 08), UC-DELIV-03 (all three ACs)

**Sizing (provisional):** ~9 items · ~21–34 pts — the ONLY slice carrying wrangler config: assets-only Worker (zero bindings), _headers three cache tiers + security baseline, _redirects vanity 301s, zone wiring (Custom Domain + www→apex; runbook; fails loudly on the unverified domain spelling), gated deploy job (needs incl. docs-e2e), 112-JSON deploy preflight, styled 404 + not_found_handling, real-CLI round-trip lane (both engines), serving-contract review. The committed DEP-001..006 definitions (14 pts, disjoint write paths) resurface verbatim at JIT expansion.

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: Sprint 08, Sprint 09, Sprint 10
- Dependent on: Sprint 01

#### PRD Coverage

- 07-uc-deliv.md UC-DELIV-02 AC-1..3, UC-DELIV-03 AC-1..3
- TR-01 posture 3/6/7; TR-04 (all URL contracts); TR-06 (Delivery); TR-09 (CAP-DEP-01 + CAP-INST-01); TR-11 §1/§4/§7
- 11-e2e-testing-criteria.md T-DELIV-005..008, T-DELIV-011..013, T-DELIV-015, T-DELIV-016

#### Capability Coverage

- CAP-DEP-01: owns the deploy hop (gated, assets-only, scoped token) — first live proof
- CAP-INST-01: the real-CLI round-trip against the live domain, both engines

---

### Sprint 08: preview-rollback-drill

**Sequence:** 8
**Timeline:** Phase 3
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** cloudflare-workers-planner (lead) + astro-planner + react-native-reusables-planner
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a maintainer can revert the live site to its previous deploy with one command, proven by deploying a visible content change to https://rnraielements.com, running the single documented rollback command exactly once, and watching the prior content return on the live apex within 60 seconds (T-DELIV-010).
**Entrypoint:** Production https://rnraielements.com via curl and wrangler preview version URLs on an open PR (headers/redirects/JSON exist only around the Worker)
**Before:** At sprint start the site is live but no PR has ever produced a wrangler preview version URL, the docs-preview-curl and docs-production-verify lanes are absent from CI, and the rollback command has never been executed against production.
**Demonstrates:** UC-DELIV-04

**Sizing (provisional):** ~5 items · ~8–13 pts — docs-preview-curl PR lane (non-promoting upload + curl assertions incl. digest match), docs-production-verify lane (cache-busted digests, header re-checks, agent-endpoint presence that ACTIVATES when Sprint 10's generators land), rollback runbook + live drill, needs-list completion, ops review. No wrangler config — CI lanes, a runbook, and one supervised drill over Sprint 07's surface.

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: —
- Dependent on: Sprint 07

#### PRD Coverage

- 07-uc-deliv.md UC-DELIV-02 AC-4, UC-DELIV-04 AC-1..3
- TR-09 CAP-DEP-01 failure modes; TR-11 §2 (L9), §6 (flake policy), §7 (preview + production-verify lanes)
- 11-e2e-testing-criteria.md T-DELIV-009, T-DELIV-010, T-DELIV-016, T-EXT-001 presence half

#### Capability Coverage

- CAP-DEP-01: owns the recovery half — non-promoting previews, rollback, and the full gating chain

---

### Sprint 09: live-gallery-qr-phone

**Sequence:** 9
**Timeline:** Phase 3
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** cloudflare-workers-planner (lead) + astro-planner + react-native-reusables-planner
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a visitor can scan the QR code on a live component page at https://rnraielements.com with a phone running Expo Go and the live gallery screen opens within 30 seconds with no clone, install, or dev client required (T-GEND-018).
**Entrypoint:** A live component page at https://rnraielements.com/components/[item] scanned by a physical phone with Expo Go (iOS or Android — multi-platform repo)
**Before:** At sprint start the deployed component pages carry build-time QR codes that dead-end — the gallery they deep-link to is not published, so scanning opens nothing in Expo Go.
**Demonstrates:** UC-GEND-05 (complete demonstration: badges landed Sprint 03, matrix + QR panel landed Sprint 04, live gallery + phone proof land here)

**Sizing (provisional):** ~3 items · ~3–8 pts — publish the live Expo Go gallery (app config, channel, deep-link scheme: the one real unknown), QR decode verification (T-GEND-017 on the harness), human QR-check packaging. No deploy content; QR panels come from Sprint 04, live pages from Sprint 07.

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: —
- Dependent on: Sprint 07, Sprint 04

#### PRD Coverage

- 05-uc-gend.md UC-GEND-05 AC-1; TR-02 (QRCode build-time row)
- 11-e2e-testing-criteria.md T-GEND-017, T-GEND-018 (human-gate; restamped here because it needs the deployed page)

#### Capability Coverage

- CAP-INST-01: consumes the live served pages; the QR deep link completes the Evaluator's on-phone consumer path

---

### Sprint 10: agent-trust

**Sequence:** 10
**Timeline:** Phase 3
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** react-native-reusables-planner (lead) + techwriting-planner + astro-planner
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means an agent can fetch https://rnraielements.com/llms-full.txt and read the not-npm statement plus literal absolute-URL install commands covering all 56 items with zero short-name forms, proven by `curl -s https://rnraielements.com/llms-full.txt` returning 200 text/plain where `grep -c 'rnraielements.com/r/'` prints >= 112 and no short-name shadcn-add form appears (T-EXT-001/T-EXT-002).
**Entrypoint:** Production https://rnraielements.com/llms.txt, /llms-full.txt, /robots.txt via curl (agent-endpoint surface), plus the GitHub-facing surface at github.com/hackerpug-ai/rnr-ai-elements
**Before:** No llms.txt, llms-full.txt, or robots.txt exists; the repo ships no README, no LICENSE, no CONTRIBUTING (TR-08 R13 — registry.json advertises a GitHub URL that is a dead end); release notes exist nowhere and no changelog collection feeds them.
**Demonstrates:** UC-EXT-01, UC-EXT-02, UC-EXT-03

**Sizing (provisional):** ~7 items · ~15–26 pts — llms.txt/llms-full.txt/robots.txt generators (byte-consistent with ledger copy commands; per-item peers/permissions + verdict flags + engine heuristics), README + LICENSE (**license type confirmed with the maintainer before drafting**), CONTRIBUTING (source-of-truth rule, 8-gate CI list, fan-out, release-notes process, docs-PR criteria, registry-description currency), release-notes generation from the Sprint 06 changelog collection (T-EXT-014), T-EXT-005 build-gate, trust-surface review

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: Sprint 13
- Dependent on: Sprint 07, Sprint 06

#### PRD Coverage

- 08-uc-ext.md (all 14 ACs across UC-EXT-01..03)
- TR-02 (llms.txt endpoints), TR-09 (CAP-LLMS-01), TR-12
- 11-e2e-testing-criteria.md T-EXT-001..015

#### Capability Coverage

- CAP-LLMS-01: owns the whole chain — collections + registry data → generated endpoints, byte-consistent with the UI's copy commands

---

### Sprint 11: universal-access-recovery

**Sequence:** 11
**Timeline:** Phase 3
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** techwriting-planner (lead) + astro-planner + frontend-designer
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger printing /components/message to PDF from a browser over the built site's local preview can read the install code blocks and the props table fully and legibly in the saved PDF, with navigation chrome hidden.
**Entrypoint:** docs site local preview — built dist over astro preview / pnpm e2e:docs; browser print-to-PDF of /components/message
**Before:** No print stylesheet exists; the ledger and tabbed panels are unreadable with JavaScript disabled; there is no styled 404 — dead URLs render a blank browser error.
**Demonstrates:** UC-SHELL-04

**Sizing (provisional):** ~5 items · ~16–24 pts — print stylesheet (nav hidden, engine panels expanded + labeled, forced light), mobile sweep (drawer/ToC, touch targets, sticky-first-column scroll), focus-visible + reduced-motion, no-JS sweep across all five islands, styled 404 with search recovery

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: —
- Dependent on: Sprint 04, Sprint 05, Sprint 06

#### PRD Coverage

- 06-uc-shell.md UC-SHELL-04 (all four ACs)
- TR-07 (hard UI constraints, component-detail PRINT notes); TR-11 L6/L7
- 11-e2e-testing-criteria.md T-SHELL-013..017 (human-gate T-SHELL-017), T-DELIV-014 (404 half only — vanity 301s and rollback are Worker-only, demonstrated at Sprint 08)

#### Capability Coverage

- CAP-DOCS-01: consumes the artifact-driven surfaces (ledger, reference pages) for the no-JS/print hardening sweep

---

### Sprint 12: docs-sync-drift-detection

**Sequence:** 12
**Timeline:** Phase 4
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** ghactions-planner + flue-planner + techwriting-planner (v2.0.0 delta replan; convergence rulings staged at `.tmp/kb-sprint-plan/docs-site-delta/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** A maintainer merges a fixture behavior change to main and reads, in the docs-sync run's summary page in the GitHub Actions UI, every impacted documentation page named with a one-line reason — no raw logs opened.
**Entrypoint:** The docs-sync workflow run in the GitHub Actions UI on github.com/hackerpug-ai/rnr-ai-elements, seeded by merging a fixture behavior change to main through a normal PR (with the sync marker file read via git to verify the analyzed range).
**Before:** Merging anything to main today triggers no docs-sync — .github/workflows/docs-sync.yml does not exist, no such run appears in the Actions tab, no sync marker file exists in the repo, and no surface anywhere names which documentation pages a change impacts.
**Demonstrates:** UC-AUTO-01 (subset AC-1/2/3/5 — AC-4/AC-6 complete at Sprint 13), UC-AUTO-02 (subset AC-1/AC-3 — AC-2 completes at Sprint 13), UC-AUTO-03 (all four ACs)

**Sizing (provisional):** ~8 items · ~18–30 pts — docs-sync.yml workflow (push-to-main-only trigger, fixed non-cancelling concurrency group, job-scoped write permissions via the ephemeral GITHUB_TOKEN only); SyncMarker read/validate with baseline fallback and loud unreachable-SHA failure naming the re-baseline command; range (marker..HEAD] computed at run start; payload caps (file-count + diff truncation, workflow-input configurable for the over-cap drill); OpenRouterClient pinned to deepseek/deepseek-v4-flash (timeout, single retry, visible auth/rate-limit failure); untrusted JSON impact-plan parse; $GITHUB_STEP_SUMMARY renderer with per-page reasons; no-impact close-out as run summary + step annotation (GitHub has no run-comment API). Owners: ghactions-implementer (workflow, concurrency, permissions, marker mechanics, summary surfaces) + flue-implementer (client, caps, parsing). Purely additive to CI — no needs edges to or from the guarded jobs or the deploy chain (a provider outage stalls docs sync, never deploys).

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: Sprint 13
- Dependent on: Sprint 05, Sprint 06

#### PRD Coverage

- 09-uc-auto.md UC-AUTO-01/02/03
- 01-scope.md v2.0.0 bullets (workflow, sync marker, OpenRouter analysis); 02-roles.md Docs Sync Agent analyst half
- TR-01 posture 8; TR-02 DocsSyncWorkflow + SyncMarker + OpenRouterClient; TR-06 docs-automation dependencies; TR-08 R16/R17; TR-09 CAP-AUTO-01 hops 1–3
- 12-e2e-testing-criteria.md T-AUTO-001/002/003/006/008/010/011/012/013/014 (human-gate T-AUTO-014 is this sprint's gate)

#### Capability Coverage

- CAP-AUTO-01: owns hops 1–3 (marker range → capped payload → pinned-model impact plan rendered on the run surface)

---

### Sprint 13: docs-sync-agent-pr

**Sequence:** 13
**Timeline:** Phase 4
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** ghactions-planner + flue-planner + techwriting-planner (v2.0.0 delta replan; convergence rulings staged at `.tmp/kb-sprint-plan/docs-site-delta/`)
**Milestone:** —

#### Human Testing Gate

**Gate:** A maintainer merges an impactful fixture change to main, then finds the agent's draft PR open in the GitHub UI — documentation files only, the marker bump alongside the edits, per-page impact reasons in the PR body — and after merging it through the normal review flow reads the marker on main (via git) advanced to the analyzed HEAD.
**Entrypoint:** The agent-opened draft PR in github.com/hackerpug-ai/rnr-ai-elements (GitHub UI, gh CLI acceptable for reading) and the maintainer's review/merge action on it, with the sync marker read via git after the merge.
**Before:** The docs-sync run names impacted pages in its summary but opens no PR — no agent-authored PR exists in the repo, generated prose lands nowhere, the marker never advances past its baseline, and no drift check guards the borrowed persona against its source.
**Demonstrates:** UC-AUTO-04 (all five ACs), UC-AUTO-01 (completing AC-3's PR-body half, AC-4, AC-6), UC-AUTO-02 (completing AC-2: marker co-committed with the docs it describes)

**Sizing (provisional):** ~8 items · ~14–32 pts — vendored techwriting persona (core system prompt + graph block, pinned to source sha 3327c171 / kb_version 1.0.0) with the T-AUTO-015 drift check as a CI-checkable hash-pin gate (repo-internal consistency; live-source freshness is a documented re-vendor procedure, honestly not CI-checkable); writer persona applying 12-content-standards.md over the impact plan; docs-only PR path allowlist enforced structurally (prose paths + registry.json description-field-only — parsed JSON delta confined to description keys, else T-AUTO-017 fails; changelog/release-notes/generated pages excluded; marker/workflow/source paths never model-written); draft-PR mechanics (docs/sync-* branch, gh pr create --draft, per-page rationale in the PR body); deterministic marker bump appended to the same PR by workflow code (co-committed, fast-forward-only); unchanged-pages-out discipline; techwriting-reviewer standing conformance review (T-AUTO-016); CONTRIBUTING appendix (agent-PR review flow, marker semantics, re-baseline command). Owners: flue-implementer (personas, vendoring, generation) + ghactions-implementer (PR mechanics, allowlist enforcement, marker bump, drift-check wiring) + techwriting-reviewer (review lane). Agent PRs inherit the docs-PR gates (build, snippet gate, link check, content standards) for free via pull_request-triggered required checks — R14 satisfied by construction.

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: —
- Dependent on: Sprint 12, Sprint 10

#### PRD Coverage

- 09-uc-auto.md UC-AUTO-04 + UC-AUTO-01 AC-3/4/6 + UC-AUTO-02 AC-2
- 01-scope.md v2.0.0 generation bullet; 02-roles.md writer half + Maintainer review clause
- TR-01 posture 8; TR-02 Flue docs-sync agent; TR-06 Flue verified sources; TR-08 R14/R15/R17; TR-09 CAP-AUTO-01 hops 4–5; TR-12 content standards (registry-description currency rule)
- 12-e2e-testing-criteria.md T-AUTO-004/005/007/009/015/016/017/018/019 (human-gate T-AUTO-016 is this sprint's gate)

#### Capability Coverage

- CAP-AUTO-01: owns hops 4–5 (techwriting-persona writer → docs-only draft PR with the co-committed marker advance) — the chain's real-service proof lands here
