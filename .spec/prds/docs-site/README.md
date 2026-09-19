---
title: Docs Site (Astro on Cloudflare)
version: 2.0.0
scope_posture: full
pr_sequencing: false
base_branches: []
---

# Docs Site (Astro on Cloudflare) - PRD

An Astro 7 documentation site for rnr-ai-elements where all content lives as markdown in this repo, published via content collections, deployed as Cloudflare Workers static assets at rnraielements.com — with the registry JSON served from the same deploy, GitHub-facing docs restored, and (v2.0.0) a Flue docs-sync agent in GitHub Actions that keeps the documentation current on every merge to main.

> ⚠️ **FEATURE_SPEC changed in v2.0.0** (new AUTO functional group). Re-run `/kb-sprint-plan .spec/prds/docs-site/README.md --delta-replan` before executing further sprints. Note: ROADMAP.md section `source_coverage` strings still reference the pre-renumber `10-technical-requirements/` paths — the delta-replan regenerates affected sections against the new `11-technical-requirements/` paths.

## PRD Metadata

| Field | Value |
|-------|-------|
| Version | 2.0.0 |
| Scope Posture | Full feature (default) |
| PR Sequencing | Disabled |
| Base Branches | None (lands on trunk) |
| Created | 2026-09-08 |
| Last Updated | 2026-09-09 |

## Document Index

| File | Section | Stability |
|------|---------|-----------|
| [00-overview.md](./00-overview.md) | Product description, problem statement, solution | PRODUCT_CONTEXT |
| [01-scope.md](./01-scope.md) | In scope / out of scope | FEATURE_SPEC |
| [02-roles.md](./02-roles.md) | User roles | PRODUCT_CONTEXT |
| [03-functional-groups.md](./03-functional-groups.md) | Functional group overview and use case summary | FEATURE_SPEC |
| [04-uc-docs.md](./04-uc-docs.md) | UC-DOCS-01 through UC-DOCS-06 | FEATURE_SPEC |
| [05-uc-gend.md](./05-uc-gend.md) | UC-GEND-01 through UC-GEND-07 | FEATURE_SPEC |
| [06-uc-shell.md](./06-uc-shell.md) | UC-SHELL-01 through UC-SHELL-04 | FEATURE_SPEC |
| [07-uc-deliv.md](./07-uc-deliv.md) | UC-DELIV-01 through UC-DELIV-04 | FEATURE_SPEC |
| [08-uc-ext.md](./08-uc-ext.md) | UC-EXT-01 through UC-EXT-03 | FEATURE_SPEC |
| [09-uc-auto.md](./09-uc-auto.md) | UC-AUTO-01 through UC-AUTO-04 (docs-sync agent, v2.0.0) | FEATURE_SPEC |
| [10-team-contributions.md](./10-team-contributions.md) | Phase contributions | - |
| [11-technical-requirements/](./11-technical-requirements/README.md) | Technical specifications — folder; see its README Section Index (incl. 10-routing.md: route map + Route Delta, 12-content-standards.md: authored-prose standards, 09-capability-chains.md: CAP-AUTO-01) | CONSTITUTION |
| [12-e2e-testing-criteria.md](./12-e2e-testing-criteria.md) | Per-UC test criteria with type tags, AC refs, setup, pass/fail — sprint gates draw [human-gate] criteria from here | TEST_SPEC |

## Quick Stats

| Metric | Value |
|--------|-------|
| Functional Groups | 6 |
| Use Cases | 28 |
| System Components | 17 |
| Data Entities | 7 |
| Routes (site) | 22 (+ 112 static registry assets) |
| External Dependencies | 18 |
| Scenarios | 141 (43 visible / 98 holdout) + 9 journeys — **AUTO UC scenarios not yet generated** |
| Test Criteria | 128 (see 12-e2e-testing-criteria.md) |

## Version History

| Version | Date | Changes | Trigger |
|---------|------|---------|---------|
| 1.0.0 | 2026-09-08 | Initial PRD | New initiative |
| 1.1.0 | 2026-09-08 | techwriting-planner review folded in (13 findings): seam-docs + troubleshooting guides replace duplicative guide slots; canonical boundary page; content standards + snippet/link gates; release notes generated from changelog; /guides index + 2 vanity redirects; quickstart expected-result ACs; alt-text contract; CLI page scoping | Specialist review (human-requested lens) |
| 1.2.0 | 2026-09-08 | Fidelity pass: usage snippets derive from the item's gallery cell (never hand-written per page), theming notes derive from source; registry-description-currency rule (review-enforced) added to UC-EXT-03 + content standards | Human planning question (documentation fidelity) |
| 1.2.1 | 2026-09-08 | Component/UI plan in 07-ui-infrastructure.md: 15 userflows (all 24 UCs covered), 11 page types, 8 wireframes with explicit region→component bindings to the internal docs component set, 4 NEW components (Button, SectionHeader, IndexList, Callout — Rule-of-2 justified), five-island budget restated | frontend-designer ui-wireframes phase (human-requested lens) |
| 2.0.0 | 2026-09-09 | **Docs automation added (MAJOR — scope)**: new AUTO functional group (UC-AUTO-01..04) — Flue docs-sync agent in GitHub Actions analyzing changes since the last-documented SHA on every merge to main; last-documented-SHA sync marker; impact analysis via deepseek-v4-flash on OpenRouter; generation by an agent borrowing the techwriting-implementer core system prompt incl. its knowledge graph. TR: posture #8 (agent proposes, humans dispose), 4 components, OpenRouter/Flue/Actions deps, risks R14–R17, CAP-AUTO-01. 19 new test criteria (T-AUTO-001..019). Files renumbered (team→10, TR→11, criteria→12) | `/kb-prd-plan --update` (human instruction) |

## Next Steps

- `/kb-sprint-plan .spec/prds/docs-site/README.md --delta-replan` — **required**: fold the AUTO group into ROADMAP.md (regenerates affected sections against the renumbered paths).
- Generate AUTO scenarios (visible + holdout tiers) for `.spec/scenarios/UC-AUTO-*/` and extend the coverage matrix before the automation sprint is planned — the current 141-scenario set predates the AUTO group.
- `/review-red-hat` — adversarial review of this PRD (run out-of-band, then fold in via `--update`/`--feedback`).

## Notes

- The `EXT` group prefix replaces the synthesis draft's `AGENT` prefix: `.spec/scenarios/UC-AGENT-0*` is taken by the MVP PRD.
- User-confirmed decisions (2026-09-08): scope/UCs approved as presented; registry JSON served from the same deploy at `https://rnraielements.com/r/{engine}/{item}.json` (GitHub remains the source repo).
- Domain recorded as `rnraielements.com` (as typed by the user — spelling unverified against the Cloudflare zone).
- v2.0.0 automation notes: the exact OpenRouter model slug for deepseek-v4-flash is verified at implementation against the live model list; the repo's PR-gated main means the agent lands output exclusively through draft PRs (a repo fact recorded as posture #8 and AC-4 of UC-AUTO-01).
