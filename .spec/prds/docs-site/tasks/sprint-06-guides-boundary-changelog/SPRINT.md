---
sequence: 6
timeline: Phase 2
status: planned
sprint_id: sprint-06-guides-boundary-changelog
prd: ../..
planned_from_roadmap_sha: c8f15a4732af8b6de4db4f44ac599303c597ba00d21e63d699d9d08bdaac06da
planned_from_source_sha: 92e8e6d407f4749274ed09b25a1e82d5b480fb2d
planned_at: 2026-09-29
---

# Sprint 06: guides-boundary-changelog

**Status:** in_progress
**Sequence:** 6
**Timeline:** Phase 2

## Overview

Complete the documentation set's orientation and maintenance surfaces: five capped how-to guides (re-theme, update, preview, customize-rendering, troubleshooting), the owns-vs-does-not-own boundary rewritten as scannable tables with an honest gaps list, the upstream-to-port mapping + not-ported list + prior-art context on /porting, and a changelog collection (one file per tagged release through v0.2.1) with a reverse-chronological /changelog index and per-release pages. The boundary page's gaps list, the 56-item ledger, and the porting not-ported list must reconcile with zero contradictions and zero known omissions — the human gate's cross-check invariant.

This sprint depends on Sprint 05's content shell (content collections, MarkdownLayout, Prose/Toc/PageHeader, SectionHeader, Callout, /docs/[...id].astro). It provides the CAP-LLMS-01 changelog collection input that llms.txt and GitHub release-notes generation consume at Sprint 10.

The plan contains **17 tasks / 63 points**, compared with the roadmap sketch of ~8 items / 26–42 points: **21 points above its upper bound**. The band under-counted three engineering realities: a changelog system is a collection + schema + three distinct fail-closed gates + two generated routes (not one item); section-aware routing (/guides/[slug] + /porting) required a publication-contract refactor the sketch never sized; and three separate build gates (changelog tag-sync/ordering/section-presence, five-guides cap, porting consistency) are each independent fail-closed checks. The sketch also listed "engine-choice/port-next" as guides, but UC-DOCS-03 AC-6 and the section-index wireframe are authoritative: the five guides are re-theme, update, preview, customize-rendering, troubleshooting — engine choice stays on Installation, port-next stays on /porting.

All implementation, functional RED, and product verification are future work. This document records a plan, not a passing gate.

## Human Testing Gate

**Gate:** A stranger opening /docs/owns-vs-does-not-own, /porting, and /registry over the built site's local preview can cross-check the boundary page's gaps list against the ledger's 56 items and the porting not-ported list and find zero contradictions and zero known omissions.

**Entrypoint:** docs site local preview — built dist over astro preview / pnpm e2e:docs; routes /docs/owns-vs-does-not-own, /porting, /registry

**Before:** AS OBSERVED 2026-09-15 at HEAD b7f5b75: /guides, /porting, /changelog, and /changelog/[version] all 404; /docs/owns-vs-does-not-own RENDERS (Sprint 05 prose) but as paragraphs with ZERO tables and no gaps section; no changelog collection, no section-aware routing, no five-guide-cap / changelog-tag-sync / porting-consistency build gates. Git tags present: v0.1.0, v0.2.0, v0.2.1.

**Success state:** A visitor reads the five capped how-to guides and the troubleshooting guide (symptom→cause→fix), cross-checks the boundary tables against the 56-item ledger and the porting not-ported list with zero contradictions/omissions, and browses the changelog reverse-chronologically with per-release pages linking touched component pages — all over the built site, with the header exposing Guides/Porting/Changelog.

**Demonstrates:** UC-DOCS-03, UC-DOCS-04, UC-DOCS-05, UC-DOCS-06

**Fixed carryover:** CAP-LLMS-01 (changelog collection input consumed by llms.txt + GitHub release-notes generation at Sprint 10). The Pager (R7, guides prev/next) is wireframe-only and has no AC/T-DOCS criterion — out of scope here.

## Test Deliverable

*(each stranger-runnable verbatim)*

<!-- TESTING-GATE-START -->

- [ ] 1. Check the port is free first (`lsof -nP -iTCP:4321 -sTCP:LISTEN` must be empty — Astro silently hops ports when squatted, and you would be judging the wrong site); then run `pnpm registry:build && pnpm --filter @rnr-ai-elements/docs build` — exits 0 naming no violation offenders; stdout carries `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` and `[docs-data] guides: 5 guides — cap satisfied`; then `pnpm --filter @rnr-ai-elements/docs preview --port 4321` serves http://localhost:4321.   `exercises: GBC-005, GBC-007, GBC-011, GBC-012`

- [ ] 2. Open http://localhost:4321/docs/owns-vs-does-not-own, http://localhost:4321/porting, and http://localhost:4321/registry. On the boundary page read the ships/does-not-ship table (`transport`, `streaming client`, `tool executor` in does-not-ship cells; `useChat` in the consumer-wires cell) and the ownership-split + gaps table. On /porting read the mapping table (a deviations column, ≥5 rows) and the not-ported list. On /registry confirm exactly 56 rows split 39/11/6. Cross-check: every boundary gap is a consumer-owned responsibility or a named not-ported upstream element — zero contradictions, zero known omissions.   `exercises: GBC-003, GBC-004, GBC-006, GBC-017`

- [ ] 3. Open http://localhost:4321/guides — the index lists exactly 5 guides; open each (re-theme, update-installed-items, preview-on-device, customize-rendering, troubleshooting) — each 200 with a complete how-to (every guide opens with a sentence matching /This guide shows you how to/ and numbered steps); /guides/troubleshooting carries 4 symptom→cause→fix entries; customize-rendering documents renderMarkdown and TextClassContext and component-page seam Callouts link it.   `exercises: GBC-001, GBC-002, GBC-009, GBC-010, GBC-015, GBC-016`

- [ ] 4. Open http://localhost:4321/changelog — entries reverse-chronological (0.2.1 → 0.2.0 → 0.1.0); open http://localhost:4321/changelog/0.2.1 — literal date 2026-09-08 + Added/Changed/Fixed headings + a touched-component link resolving 200.   `exercises: GBC-005, GBC-007, GBC-008, GBC-015, GBC-016`

- [ ] 5. On any page the header shows Components, Registry, Guides, Porting, Changelog (each resolving 200). Run `pnpm e2e:docs` — exits 0 with retries: 0, all lanes green including the sprint-06 lane (FLOW-DOCS-03/04/05/06) and the docs-integrator-arc + docs-themer-arc journey specs writing evidence.   `exercises: GBC-013, GBC-014`

- [ ] 6. First contact — on your own machine, in your own clone as it is (no fixture, no seeded data, no HOME override, no locked flow), start the docs site the way CONTRIBUTING.md documents: from the repository root run `pnpm --filter @rnr-ai-elements/docs build`, then `pnpm --filter @rnr-ai-elements/docs preview`, and open the URL that preview prints (Astro's default is http://localhost:4321; use whatever port it reports). The build's own output under apps/docs/dist/ is the only thing written; stop before any other write (no install, no publish, no edits to files). Promise (UC-DOCS-03): "A Guides section capped at five launch pages serves the re-theme, update, preview, engine-choice, and port-next jobs without becoming a curriculum." Promise (UC-DOCS-04): "The boundary page states as scannable tables that the library ships no transport, no streaming client, and no tool executor, and points to the example app as the worked reference." Promise (UC-DOCS-05): "Porting notes explain intentional divergences from Vercel AI Elements and earlier RN ports before an extender backports anything." Promise (UC-DOCS-06): "One entry per release in reverse chronological order makes maintenance health visible on the site." Then see, on THIS machine: the build exits 0, the preview serves the printed URL, and the header links Guides, Porting, and Changelog each open a real page (not a 404) that matches its promise above; if the printed port differs from 4321, judge the site at that port.   `exercises: GBC-013, GBC-009, GBC-010, GBC-004, GBC-008`

<!-- TESTING-GATE-END -->

**Dark tasks:** None — every task is exercised by at least one gate step.

## Tasks

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

**Gate timing:** content tasks GBC-001..006 complete on build-green + prose review at their own wave; playwright VERIFY executes at the task owning the locked spec (boundary-tables → GBC-003, porting-map → GBC-009, guides-index → GBC-010, changelog-release-pages → GBC-008, journeys → GBC-014) or at the human gate — never 'verified later' at a content task's close.

## Automated Functional Coverage

This table projects the 6 locked flows. `human-flows.json` and each task's Requirement Contract stay authoritative; the exact runnable command for each flow is its `run_cmd` there. Gate step 6 (first contact) is deliberately bound to no flow.

| Flow ID | Scope | Gate | Primary owner | Test file / function | Replay phase |
|---|---|---:|---|---|---|
| FLOW-DOCS-03-five-guides-index | task | 1, 3 | GBC-010/AC-1 | tests/sprint-06-guides-boundary-changelog/guides-index.spec.ts :: FLOW-DOCS-03-five-guides-index | task |
| FLOW-DOCS-04-boundary-ownership-tables | task | 2 | GBC-003/AC-1 | tests/sprint-06-guides-boundary-changelog/boundary-tables.spec.ts :: FLOW-DOCS-04-boundary-ownership-tables | task |
| FLOW-DOCS-05-porting-map-and-prior-art | task | 1, 2 | GBC-009/AC-2 | tests/sprint-06-guides-boundary-changelog/porting-map.spec.ts :: FLOW-DOCS-05-porting-map-and-prior-art | task |
| FLOW-DOCS-06-changelog-release-pages | task | 1, 4 | GBC-008/AC-1 | tests/sprint-06-guides-boundary-changelog/changelog-release-pages.spec.ts :: FLOW-DOCS-06-changelog-release-pages | task |
| journeys/docs-integrator-arc | journey | 2, 5 | GBC-014 | tests/sprint-06-guides-boundary-changelog/docs-integrator-arc.spec.ts :: journeys/docs-integrator-arc | post-integration |
| journeys/docs-themer-arc | journey | 3 | GBC-014 | tests/sprint-06-guides-boundary-changelog/docs-themer-arc.spec.ts :: journeys/docs-themer-arc | post-integration |

## Source Coverage

- 04-uc-docs.md UC-DOCS-03 (all six ACs), UC-DOCS-04 (all five), UC-DOCS-05 (all three), UC-DOCS-06 (all three)
- TR-03 (changelog_entry, one-to-one with git tags), TR-12 (guide/troubleshooting/changelog templates), TR-07 (section-index wireframe, SectionHeader + IndexList NEW)
- 12-e2e-testing-criteria.md T-DOCS-011..028, T-DOCS-032 (human-gate T-DOCS-018)

## Capability Coverage

- CAP-LLMS-01: provides the changelog collection input that llms.txt and GitHub release-notes generation consume (Sprint 10)

## Blocks

- Sprint 10, Sprint 11, Sprint 12

## Task Detail Files

Repaired by /kb-sprint-tasks-plan on 2026-09-29 (proof bindings re-authored by techwriting-planner, astro-planner and frontend-designer).

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
- TASK-GBC-012-porting-consistency-gates-mapping-slugs-resolve-not-ported-exact-compl.md
- GBC-013-header-footer-nav-wiring-r1-registry-guides-porting-changelog.md
- GBC-014-post-integration-journey-proofs-docs-integrator-arc-docs-themer-arc.md
- GBC-015-indexlist-component-new-the-section-index-linked-entry-row-primitive.md
- GBC-016-section-index-page-layout-the-shared-guides-changelog-visual-shell.md
- GBC-017-boundary-porting-scannable-table-and-callout-presentation.md
