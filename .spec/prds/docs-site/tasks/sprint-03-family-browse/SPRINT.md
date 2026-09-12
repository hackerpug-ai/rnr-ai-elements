---
sequence: 3
timeline: Phase 1
status: planned
sprint_id: sprint-03-family-browse
planned_from_roadmap_sha: 42f586c8010e1bda469da9d0a8baee50e2db64751324a2438df94771536b6eda
planned_from_source_sha: 101409df0a44272fe61e7764e499b980b39c7448
planned_at: 2026-09-12
---

# Sprint 03: family-browse

**Status:** Planned
**Sequence:** 3
**Timeline:** Phase 1

## Overview

The browse surface: /components becomes the seven-family card grid — SectionHeader and ComponentCard as new token-governed primitives, the rnr-ledger-filter island (4 of the constitutional 5), the home R9 family teaser, and the Expo Go verdict badge wired from the single manifest source onto cards, item pages, and all 56 ledger rows. UC-GEND-05's badge work ships here as supporting task work; the UC demonstrates at Sprint 09 where its QR/gallery flow completes (human-approved regrouping 2026-09-12).

## Human Testing Gate

**Gate:** Done means a visitor opening /components over `astro preview` counts seven anchored family sections holding exactly 39 cards, each card showing its component name plus an Expo Go verdict badge, proven by opening http://localhost:4321/components and tallying the sections, cards, and badges in the browser.

**Entrypoint:** Built dist over `astro preview` at http://localhost:4321/components.

**Before:** At HEAD 2107567, /components (src/pages/components/index.astro) is the sprint-01 FUSE-07 lean list: nine anchored <section>s render from families.json in family order — the seven component families plus ui and lib — as two-column <ul> lists holding all 56 names: 39 plain <a> links (the registry:component name set, verified identical to the 7 component families' itemNames) and 17 text <span>s. There are no cards, no descriptions, no category chips, no Expo Go verdict badges, and no filter. Badge.astro exists unwired (zero imports site-wide); the component detail page renders the verdict as a plain chip (li[data-chip="expo"], text 'Expo Go'/'Dev client') and the /registry ledger as plain .ledger-verdict text. Exactly three custom elements exist (rnr-copy-button, rnr-tab-group, rnr-theme-toggle), pinned by tests/sprint-01-docs-spike-skeleton/island-budget.test.ts. Home carries no R9 teaser (src/pages/index.astro's own comment defers R9-R12 to Sprint 03+). Data facts that shape the sprint: every registry:component description exceeds 120 chars (longest 1840) and zero items carry expoGo:false today. The gate is RED: sections are nine not seven, cards are zero, badges are zero.

**Demonstrates:** UC-GEND-02

**Deferred journeys:** journeys/docs-evaluator-arc (covers UC-DOCS-06 and UC-GEND-06 beyond this sprint's scope; completes later — declared, replayed by the completing sprint)

## Test Deliverable

<!-- TESTING-GATE-START -->

- [ ] 1. At the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0: the ordered chain (registry:build → gallery:manifest → docs build → playwright install → playwright test) completes with every lane green, including the superseded sprint-01 lanes (component-page, ledger, island-budget), all sprint-02 lanes, and the new tests/sprint-03-family-browse lane — both FLOW ids plus the verdict-badge-wiring, ledger-filter-island, and home-family-teaser specs.   `exercises: FAM-001, FAM-002, FAM-003, FAM-004, FAM-005, FAM-006`
- [ ] 2. Run `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families` — 3 passed (chromium-desktop, chromium-mobile, chromium-nojs); evidence JSON written to .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-07-components-page-39-in-7-families.json.   `exercises: FAM-001, FAM-003`
- [ ] 3. Run `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy` — 3 passed across all three projects; cards_with_all_fields == 39 in the evidence JSON at .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy.json.   `exercises: FAM-001, FAM-002, FAM-003`
- [ ] 4. Run `pnpm --filter @rnr-ai-elements/docs build && pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/components in a browser and tally: exactly seven anchored family sections in the order conversation, message, prompt-input, reasoning, sources, suggestion, tool; each section heading carries a count chip reading 3, 7, 6, 7, 4, 1, 11 respectively (sum 39); 39 cards total; spot-check that conversation, shimmer, persona, and sources each appear on exactly one card; click any card — it opens that item's real /components/{item} page, and no card links anywhere else.   `exercises: FAM-002, FAM-003`
- [ ] 5. On the same page read cards top to bottom across all seven sections: every card shows (1) the component's display name, (2) a non-empty one-line description in muted text, (3) a category chip, and (4) an Expo Go verdict badge reading exactly 'runs in Expo Go' or 'requires a dev client' — no card missing any of the four; also open http://localhost:4321/registry and confirm every one of the 56 rows' Expo Go column shows the same badge.   `exercises: FAM-002, FAM-005`

<!-- TESTING-GATE-END -->

## Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| FAM-001 | RED-first locked-flow lane specs (FLOW-GEND-07 + FLOW-GEND-08) with evidence plumbing | astro-implementer | 3 | A | ⬜ Pending |
| FAM-002 | SectionHeader + ComponentCard + one-line description clamp + Chip counter-optional | frontend-designer | 5 | A | ⬜ Pending |
| FAM-003 | /components seven-family card grid; supersede the FUSE-07 lean-list spec block | astro-implementer | 5 | B | ⬜ Pending |
| FAM-004 | rnr-ledger-filter island (4 of 5) + island-budget 3→4 + own lane spec | astro-implementer | 5 | C | ⬜ Pending |
| FAM-005 | Verdict badges from the single manifest onto item pages + 56 ledger rows; Badge strings scenario-exact | react-native-reusables-implementer | 3 | C | ⬜ Pending |
| FAM-006 | Home R9 family teaser grid + own lane spec | frontend-designer | 3 | D | ⬜ Pending |

**Waves:** A(2) → B(1) → C(2) → D(1)

**Dark tasks:** None — every task is exercised by at least one gate step.

## Source Coverage

- 05-uc-gend.md UC-GEND-02 (all three ACs); UC-GEND-05 AC-2 badge subset (supporting; UC demonstrates at Sprint 09)
- 11-technical-requirements/07-ui-infrastructure.md — components-index wireframe, home R9, SectionHeader/ComponentCard NEW rows, island budget, hard UI constraints
- 11-technical-requirements/10-routing.md — filter state is client-only, never URL
- 12-e2e-testing-criteria.md T-GEND-006/007, T-GEND-019 (badge subset)

## Capability Coverage

- CAP-DOCS-01: renders the enriched artifact's family/verdict fields — completes UC-GEND-02's card contract from src/data/registry-items.json, never a second data source

## Dependencies

- Blocks: Sprint 04
- Dependent on: Sprint 01

## Task Detail Files

Generated by /kb-sprint-tasks-plan on 2026-09-12

- FAM-001-red-first-locked-flow-lane-specs.md
- FAM-002-sectionheader-componentcard-clamp.md
- FAM-003-components-seven-family-card-grid.md
- FAM-004-ledger-filter-island.md
- FAM-005-verdict-badges-single-manifest.md
- FAM-006-home-r9-family-teaser.md
