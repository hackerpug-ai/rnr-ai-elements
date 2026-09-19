---
sequence: 6
timeline: Phase 2
status: planned
sprint_id: sprint-06-guides-boundary-changelog
planned_from_roadmap_sha: e1238927667b1418fa2b3d1d00dcd4f5bb7a0c5e629671eb804a91c1201847cc
planned_from_source_sha: f2db0796e21c9cf00cfa7461919c6fb4cb94edf3
planned_at: 2026-09-15
---

# Sprint 06: guides-boundary-changelog

**Status:** planned
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

1. Run `pnpm registry:build && pnpm --filter @rnr-ai-elements/docs build` — exits 0 naming nothing; stdout carries `[docs-data] changelog: 3 tags, 3 entries — one-to-one, reverse-chronological` and `[docs-data] guides: 5 guides — cap satisfied`; then `pnpm --filter @rnr-ai-elements/docs preview --port 4321` serves http://localhost:4321.   `exercises: GBC-005, GBC-007, GBC-011, GBC-012`
2. Open http://localhost:4321/docs/owns-vs-does-not-own, http://localhost:4321/porting, and http://localhost:4321/registry. On the boundary page read the ships/does-not-ship table (`transport`, `streaming client`, `tool executor` in does-not-ship cells; `useChat` in the consumer-wires cell) and the ownership-split + gaps table. On /porting read the mapping table (a deviations column, ≥5 rows) and the not-ported list. On /registry confirm exactly 56 rows split 39/11/6. Cross-check: every boundary gap is a consumer-owned responsibility or a named not-ported upstream element — zero contradictions, zero known omissions.   `exercises: GBC-003, GBC-004, GBC-006, GBC-017`
3. Open http://localhost:4321/guides — the index lists exactly 5 guides; open each (re-theme, update-installed-items, preview-on-device, customize-rendering, troubleshooting) — each 200 with a complete how-to; /guides/troubleshooting carries 4 symptom→cause→fix entries; customize-rendering documents renderMarkdown and TextClassContext and component-page seam Callouts link it.   `exercises: GBC-001, GBC-002, GBC-009, GBC-010, GBC-015, GBC-016`
4. Open http://localhost:4321/changelog — entries reverse-chronological (0.2.1 → 0.2.0 → 0.1.0); open http://localhost:4321/changelog/0.2.1 — literal date 2026-09-08 + Added/Changed/Fixed headings + a touched-component link resolving 200.   `exercises: GBC-005, GBC-007, GBC-008, GBC-015, GBC-016`
5. On any page the header shows Components, Registry, Guides, Porting, Changelog (each resolving 200). Run `pnpm e2e:docs` — exits 0 with retries: 0, all lanes green including the sprint-06 lane (FLOW-DOCS-03/04/05/06) and the docs-integrator-arc + docs-themer-arc journey specs writing evidence.   `exercises: GBC-013, GBC-014`

**Dark tasks:** None — every task is exercised by at least one gate step.

## Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| GBC-001 | Author the four job how-to guides + seam-map repoint | techwriting-implementer | 5 | A | ⬜ Pending |
| GBC-002 | Author the troubleshooting guide + wire its links | techwriting-implementer | 5 | B | ⬜ Pending |
| GBC-003 | Rewrite owns-vs-does-not-own as scannable tables | techwriting-implementer | 5 | A | ⬜ Pending |
| GBC-004 | Author /porting mapping + not-ported list | techwriting-implementer | 5 | A | ⬜ Pending |
| GBC-005 | Author changelog release entries (v0.1.0–v0.2.1) | techwriting-implementer | 3 | A | ⬜ Pending |
| GBC-006 | Content review + cross-check gate | techwriting-implementer | 3 | C | ⬜ Pending |
| GBC-007 | Changelog collection schema + build gates | astro-implementer | 5 | B | ⬜ Pending |
| GBC-008 | /changelog index + [version] pages | astro-implementer | 3 | D | ⬜ Pending |
| GBC-009 | Section-aware routing (/guides/[slug] + /porting) | astro-implementer | 5 | B | ⬜ Pending |
| GBC-010 | /guides section-index page | astro-implementer | 3 | C | ⬜ Pending |
| GBC-011 | Five-guides cap gate | astro-implementer | 3 | C | ⬜ Pending |
| GBC-012 | Porting consistency gates | astro-implementer | 3 | C | ⬜ Pending |
| GBC-013 | Header/footer nav wiring (R1) | astro-implementer | 2 | E | ⬜ Pending |
| GBC-014 | Sprint-06 e2e lane + journeys | astro-implementer | 5 | F | ⬜ Pending |
| GBC-015 | IndexList component (NEW) | frontend-designer | 3 | A | ⬜ Pending |
| GBC-016 | Section-index page layout | frontend-designer | 2 | B | ⬜ Pending |
| GBC-017 | Boundary + porting table presentation | frontend-designer | 3 | A | ⬜ Pending |

**Waves:** A(6) → B(4) → C(4) → D(1) → E(1) → F(1) — 6 waves over 17 tasks (no two tasks in a wave share a write_allowed path).

## Source Coverage

- 04-uc-docs.md UC-DOCS-03 (all six ACs), UC-DOCS-04 (all five), UC-DOCS-05 (all three), UC-DOCS-06 (all three)
- TR-03 (changelog_entry, one-to-one with git tags), TR-12 (guide/troubleshooting/changelog templates), TR-07 (section-index wireframe, SectionHeader + IndexList NEW)
- 11-e2e-testing-criteria.md T-DOCS-011..028, T-DOCS-032 (human-gate T-DOCS-018)

## Capability Coverage

- CAP-LLMS-01: provides the changelog collection input that llms.txt and GitHub release-notes generation consume (Sprint 10)

## Blocks

- Sprint 10, Sprint 11, Sprint 12
