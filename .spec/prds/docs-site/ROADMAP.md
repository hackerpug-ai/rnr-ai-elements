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

**Sprints:** 13  (2 committed · 11 provisional)
**Total Tasks:** 25  (committed sprints only; provisional sprints carry a size band)
**Current Sprint:** Sprint 01 (in progress, all 12 FUSE tasks landed) — Sprint 02 promoted + expanded to task files by `/kb-sprint-tasks-plan` on 2026-09-10

All 28 in-scope use cases are demonstrated by exactly the gate of the sprint that ships them. Sprints 01–11 were authored by the dispatched specialist set (astro-planner, cloudflare-workers-planner, techwriting-planner, react-native-reusables-planner, frontend-designer) through fusion and convergence rounds staged verbatim at `.tmp/kb-sprint-plan/docs-site/`; sprints 12–13 were added by the v2.0.0 delta replan (flue-planner + ghactions-planner + techwriting-planner, staged at `.tmp/kb-sprint-plan/docs-site-delta/`).

## Sprint Sequence

| # | Milestone | Sprint | Gate | Tasks | Dependencies | Status |
|---|-----------|--------|------|-------|--------------|--------|
| 1 | — | [Sprint 01: docs-spike-skeleton](#sprint-01-docs-spike-skeleton) | Walk find-and-install on the built site (ledger → component page → copy command → same-origin JSON), proven by `pnpm e2e:docs` green, retries: 0 | 12 | — | In Progress |
| 2 | — | [Sprint 02: shell-hero](#sprint-02-shell-hero) | Hero fits one 1440×900 screen: statement, counters, copyable engine-tabbed command, both CTAs (T-GEND-002) | 13 | Sprint 01 | In Progress |
| 3 | — | [Sprint 03: family-browse](#sprint-03-family-browse) | /components counts 7 anchored families, 39 cards, verdict badges | — | Sprint 01 | Planned |
| 4 | — | [Sprint 04: generated-reference](#sprint-04-generated-reference) | Mutate any enriched field → build fails naming the item; props/deps/source byte-match the served JSON | — | Sprint 01, Sprint 03 | Planned |
| 5 | — | [Sprint 05: orient-search](#sprint-05-orient-search) | Stranger reads /docs/introduction in one pass (T-DOCS-002) | — | Sprint 01, Sprint 02 | Planned |
| 6 | — | [Sprint 06: guides-boundary-changelog](#sprint-06-guides-boundary-changelog) | Boundary gaps cross-check vs ledger + porting not-ported: zero contradictions (T-DOCS-018) | — | Sprint 05 | Planned |
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
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** react-native-reusables-planner (lead) + frontend-designer + astro-planner
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a visitor opening /components over `astro preview` counts seven anchored family sections holding exactly 39 cards, each card showing its component name plus an Expo Go verdict badge, proven by opening http://localhost:4321/components and tallying the sections, cards, and badges in the browser.
**Entrypoint:** Built dist over `astro preview` at http://localhost:4321/components.
**Before:** /components is a lean anchored list of 39 plain links with no cards, no verdict badges, no filter; the dev-client opt-in facts (the 4 integration-level items with peers and permissions) exist nowhere as data.
**Demonstrates:** UC-GEND-02, UC-GEND-05

**Sizing (provisional):** ~6 items · ~15–24 pts — SectionHeader/ComponentCard NEW components, LedgerFilter island generalization (island 3/5), card-grid upgrade, home R9 teaser upgrade, verdict-badge wiring from the single manifest source

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

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
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** react-native-reusables-planner (lead) + frontend-designer + astro-planner
**Milestone:** —

#### Human Testing Gate

**Gate:** Done means a visitor can open any of the 39 generated reference pages over `astro preview` and read its auto-generated props table (Name/Type/Default/Description with at least one row), its dependency panel listing registryDependencies and AI SDK v7 peers, and its full untruncated source that byte-matches the served /r/*.json content, proven by opening http://localhost:4321/components/conversation in a browser and diffing its Code view against `curl http://localhost:4321/r/nativewind/conversation.json` (T-GEND-023/024/015 shape).
**Entrypoint:** Built dist over `astro preview` at http://localhost:4321/components/[item], plus curl of the same origin's /r/*.json.
**Before:** Reference pages carry breadcrumb/chips/install/source only — no props tables, no dependency panels, no theming notes or usage snippets rendered, no family pager, no QR panels, no seam links; the enriched data fields shipped in sprint 01 are still unwritten on any page.
**Demonstrates:** UC-GEND-03, UC-GEND-04, UC-GEND-05, UC-GEND-06, UC-SHELL-03

**Sizing (provisional):** ~8 items · ~27–42 pts — component-detail template (dependency DataTable, family Pager, seam Callouts), Preview|Code TabGroup with null-imagery omission, PropsTable, theming/usage rendering from the sprint-01 fields, QrPanel, the authored dev-client matrix data (4 opt-in entries, shape-gated fail-closed), matrix rendering, GEND criteria binding + drill extension

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

#### Dependencies

- Blocks: Sprint 09, Sprint 11
- Dependent on: Sprint 01, Sprint 03

#### PRD Coverage

- 05-uc-gend.md UC-GEND-03..06; 06-uc-shell.md UC-SHELL-03
- TR-02, TR-03 (registry_page_model), TR-07 (component-detail wireframe, 14 regions + mobile frame), TR-08 R7/R8, TR-10
- 11-e2e-testing-criteria.md T-GEND-009..026

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
**Status:** Planned
**Fidelity:** provisional
**Proposed by:** techwriting-planner (lead) + astro-planner + frontend-designer
**Milestone:** —

#### Human Testing Gate

**Gate:** A stranger opening /docs/owns-vs-does-not-own, /porting, and /registry over the built site's local preview can cross-check the boundary page's gaps list against the ledger's 56 items and the porting not-ported list and find zero contradictions and zero known omissions.
**Entrypoint:** docs site local preview — built dist over astro preview / pnpm e2e:docs; routes /docs/owns-vs-does-not-own, /porting, /registry
**Before:** /guides, /docs/owns-vs-does-not-own, /porting, and /changelog all 404; the ownership split and the upstream-to-port mapping are documented nowhere.
**Demonstrates:** UC-DOCS-03, UC-DOCS-04, UC-DOCS-05, UC-DOCS-06

**Sizing (provisional):** ~8 items · ~26–42 pts — five capped guides (incl. troubleshooting symptom→cause→fix), boundary tables, the upstream porting audit + /porting, the changelog collection (sole owner; one file per tagged release through v0.2.1) + /changelog index and [version] pages, SectionHeader + IndexList NEW, troubleshooting-link wiring into Installation, content review

> Test steps and the task table are authored when this sprint becomes next
> (`/kb-sprint-tasks-plan`), against the codebase as it is then. See
> [`~/Projects/brain/docs/COMMIT-HORIZON.md`](~/Projects/brain/docs/COMMIT-HORIZON.md).

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
**Demonstrates:** UC-GEND-05

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
