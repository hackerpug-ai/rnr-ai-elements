---
sequence: 1
timeline: Phase 1
status: planned
sprint_id: sprint-01-docs-spike-skeleton
planned_from_roadmap_sha: a1bb92338982e59f6c7923151710f1f8aa60ed3e7a0320dd2ac10b89ca5b2ae9
planned_from_source_sha: ac5363358c122eb9b5e17cfe4065c94c1945448a
planned_at: 2026-09-09
---

# Sprint 01: docs-spike-skeleton

**Status:** completed
**Sequence:** 1
**Timeline:** Phase 1

## Overview

Walking skeleton for the docs site: a visitor can walk the whole find-and-install path on the locally built site — open the ledger of exactly 56 items, open a component page, copy its install command with one click, and fetch that command's URL as JSON from the same served origin. Proposed by astro-planner + react-native-reusables-planner (fused; convergence rulings staged at `.tmp/kb-sprint-plan/docs-site/fusion/`).

## Human Testing Gate

**Gate:** Done means a visitor can walk the whole find-and-install path on the locally built site — open the ledger of exactly 56 items, open a component page, copy its install command with one click, and fetch that command's URL as JSON from the same served origin — proven by serving the real build's dist/ with astro preview and performing the walk in a browser at http://localhost:4321.

**Entrypoint:** Clean checkout → `pnpm install && pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` → `pnpm --filter @rnr-ai-elements/docs preview` → browser at http://localhost:4321 (product surface: built dist over astro preview / pnpm e2e:docs; never astro dev). TR-11 §5 spike mandate rides on this sprint.

**Before:** apps/docs does not exist — `pnpm --filter @rnr-ai-elements/docs build` fails with no-matching-package; nothing serves a 56-item ledger or a component page; there is no `pnpm e2e:docs`; the fail-closed enrichment exists only as PRD prose.

**Demonstrates:** UC-GEND-07 (subset AC-1/3/4/5 — AC-2 filter/toggle clauses complete at Sprint 05), UC-DELIV-01 (subset AC-1..4 — AC-5 link-check/snippet gates complete at Sprint 05). UC-GEND-03 first-cut pages and UC-DELIV-03 local same-origin serving recorded in PRD Coverage as evidence; their full demonstration lands at Sprints 04 and 07. First-cut proofs of UC-GEND-01 (structural home block, pre-designed-hero) are carried here as gate step 8 observes them.

## Test Deliverable

<!-- TESTING-GATE-START -->

- [x] 1. Run `git clone https://github.com/hackerpug-ai/rnr-ai-elements.git /tmp/rnr-spike && cd /tmp/rnr-spike && pnpm install --frozen-lockfile` — exits 0 and lists the `@rnr-ai-elements/docs` workspace package.   `exercises: FUSE-01`
- [x] 2. In /tmp/rnr-spike run `pnpm e2e:docs` — exits 0 in one run with `retries: 0`; the log shows the ordered chain (`registry:build`, `gallery:manifest`, the docs prebuild reporting 56 items and props resolved for 39/39 component items, astro build) and the spike flow (open site → ledger → component page → copy command via its button → fetch URL as JSON) passing.   `exercises: FUSE-02, FUSE-03, FUSE-05, FUSE-10, FUSE-11`
- [x] 3. Run `ls /tmp/rnr-spike/apps/docs/public/r/nativewind | wc -l` — prints 57 (56 item JSONs plus the per-engine registry.json index).   `exercises: FUSE-05`
- [x] 4. Run `git -C /tmp/rnr-spike check-ignore apps/docs/public/r/nativewind/conversation.json && echo IGNORED` — prints IGNORED: the served registry copy is gitignored, generated-only.   `exercises: FUSE-05`
- [x] 5. Run `pnpm --filter @rnr-ai-elements/docs build && pnpm --filter @rnr-ai-elements/docs preview`, open http://localhost:4321/registry — the table renders exactly 56 rows split 39/11/6, a note matching 'generated at build' mentioning public/r, both engine base URLs, and a copy button on every row's install command.   `exercises: FUSE-06, FUSE-09`
- [x] 6. Open http://localhost:4321/components/conversation — h1 'Conversation', one-line description, chips for version/category/engines/Expo Go verdict, the install block FIRST containing `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` plus the labeled uniwind variant with a copy button, and full untruncated source in a Code view with no height limit.   `exercises: FUSE-07, FUSE-09`
- [x] 7. Click the copy button on the conversation install block — the button shows a visible success state and pasting anywhere yields the exact displayed command.   `exercises: FUSE-09`
- [x] 8. Open http://localhost:4321/ — the home block shows 'NOT an npm package', counters 0.2.1 and 56 items split 39/11/6, one install command as selectable text, links to /registry and /components.   `exercises: FUSE-08`
- [x] 9. Copy the JSON URL out of the conversation install block and run `curl -s http://localhost:4321/r/nativewind/conversation.json` — JSON whose `name` is `conversation`, `files` non-empty, `registryDependencies` present, served from the same origin as the docs.   `exercises: FUSE-05, FUSE-07`
- [x] 10. In /tmp/rnr-spike run `jq 'del(.items[] | select(.name == "shimmer"))' packages/registry/registry.json > /tmp/reg.json && mv /tmp/reg.json packages/registry/registry.json && pnpm registry:build && pnpm --filter @rnr-ai-elements/docs build` — exits non-zero naming `shimmer` and observed 55 versus 56; then `git -C /tmp/rnr-spike checkout -- . && pnpm --filter @rnr-ai-elements/docs build` exits 0.   `exercises: FUSE-04, FUSE-05`

<!-- TESTING-GATE-END -->

**Dark tasks:** FUSE-12 (2 pts) — CI dashboards/logs are banned as gate observables; the user-observable proof is gate step 2, which runs the identical `pnpm e2e:docs` command the lane invokes verbatim. The lane itself is merge-blocking infrastructure with no separate on-product surface.

## Tasks

| ID | Title | Agent | Points | Wave | Status |
|----|-------|-------|--------|------|--------|
| FUSE-01 | Scaffold apps/docs static Astro 7 package with the build chain pre-wired | astro-implementer | 3 | A | ✅ Completed |
| FUSE-02 | Dual-emit the docs verdict dataset from build-gallery-manifest.ts | react-native-reusables-implementer | 2 | A | ✅ Completed |
| FUSE-03 | Enrichment modules: ts-morph props, usage snippet, theming note (data only, no UI) | react-native-reusables-implementer | 5 | A | ✅ Completed |
| FUSE-04 | Fail-closed gate module (incl. props-resolved) + fixture-drill script | react-native-reusables-implementer | 3 | B | ✅ Completed |
| FUSE-05 | DocsDataPrebuild: full enrichment into registry-items.json + families map + public/r copy | react-native-reusables-implementer | 5 | C | ✅ Completed |
| FUSE-06 | Generated /registry ledger page with per-row copy | astro-implementer | 3 | D | ✅ Completed |
| FUSE-07 | Lean /components index + minimal /components/[item] x39 with install block first | astro-implementer | 5 | D | ✅ Completed |
| FUSE-08 | Structural home block (explicitly NOT the designed hero) | astro-implementer | 2 | D | ✅ Completed |
| FUSE-09 | CopyButton island (1/5) with zero-JS selectable-text fallback | astro-implementer | 2 | B | ✅ Completed |
| FUSE-10 | pnpm e2e:docs turnkey runner over astro preview | astro-implementer | 5 | B | ✅ Completed |
| FUSE-11 | Spike flow spec: ledger → component page → command → fetched JSON | astro-implementer | 3 | E | ✅ Completed |
| FUSE-12 | CI docs-e2e lane in ci.yml | astro-implementer | 2 | C | ✅ Completed |

**Waves:** A(3) → B(3) → C(2) → D(3) → E(1) — 5 waves over 12 tasks

## Source Coverage

- 00-overview.md, 01-scope.md (incl. v1.2.0 derivation rules), 03-functional-groups.md
- 05-uc-gend.md UC-GEND-07 (+ first-cut UC-GEND-03 pages: title/description/chips/install/source)
- 07-uc-deliv.md UC-DELIV-01 AC-1..4 (AC-5 completes at Sprint 05); UC-DELIV-03 local same-origin serving as spike-fixture evidence (live-domain ACs demonstrated at Sprint 07)
- 11-technical-requirements/01, 02, 03, 04, 06, 07 (island 1/5, ledger/component-detail wireframes, null-imagery), 08 (R7), 09, 10, 11 (§1–§7)
- 12-e2e-testing-criteria.md T-DELIV-001..004, T-GEND-009/010/013/016/021/024/027..031

## Capability Coverage

- CAP-DOCS-01: owns the full enrichment chain this sprint — every TR-02 gate (56 exact, files non-empty, props resolved, family exact, verdict present) inside the prebuild the spike proves
- CAP-REG-01: manifest dual-emit (the single verdict computation, consumed verbatim)
- CAP-INST-01: absolute-URL install-command surface (ledger rows + item pages); live-domain proof at Sprint 07

## Blocks

- Blocks: Sprint 02, Sprint 03, Sprint 04, Sprint 05, Sprint 07
- Dependent on: None

## Task Detail Files

Generated by /kb-sprint-tasks-plan on 2026-09-10 (specialists: astro-planner, react-native-reusables-planner; wave 2 + remediation rounds folded)

- - FUSE-01-scaffold-apps-docs.md
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

## Automated Functional Coverage

Projection only — `human-flows.json` + the task REQUIREMENT-CONTRACT blocks are authoritative (validated by flow_coverage_check.py --task-plan: 0 findings).

| Flow ID | Kind | Gate step(s) | Owner task/AC | Test file/function | Replay |
|---|---|---|---|---|---|
| FLOW-DELIV-01-ci-chain-order | core | 1,2,3,4 | FUSE-12/AC-1 | `tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts` :: `FLOW-DELIV-01-ci-chain-order` | task |
| FLOW-DELIV-01-fail-closed-item-count | edge | 10 | FUSE-04/AC-1 | `tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts` :: `FLOW-DELIV-01-fail-closed-item-count` | task |
| FLOW-DELIV-03-112-file-completeness | core | 3 | FUSE-11/AC-1 | `tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts` :: `FLOW-DELIV-03-112-file-completeness` | task |
| FLOW-DELIV-03-live-registry-round-trip | core | 9 | FUSE-11/AC-2 | `tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts` :: `FLOW-DELIV-03-live-registry-round-trip` | task |
| FLOW-GEND-01-home-hero-evaluation-contract | core | 8 | FUSE-08/AC-1 | `tests/sprint-01-docs-spike-skeleton/home.spec.ts` :: `FLOW-GEND-01-home-hero-evaluation-contract` | task |
| FLOW-GEND-02-hero-install-command-copy | core | 8 | FUSE-08/AC-2 | `tests/sprint-01-docs-spike-skeleton/home.spec.ts` :: `FLOW-GEND-02-hero-install-command-copy` | task |
| FLOW-GEND-14-reference-page-anatomy | core | 6 | FUSE-07/AC-1 | `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` :: `FLOW-GEND-14-reference-page-anatomy` | task |
| FLOW-GEND-15-family-pager-stays-in-family | core | 6 | FUSE-07/AC-2 | `tests/sprint-01-docs-spike-skeleton/component-page.spec.ts` :: `FLOW-GEND-15-family-pager-stays-in-family` | task |
| FLOW-GEND-40-ledger-56-rows-and-base-urls | core | 5 | FUSE-06/AC-1 | `tests/sprint-01-docs-spike-skeleton/ledger.spec.ts` :: `FLOW-GEND-40-ledger-56-rows-and-base-urls` | task |
| FLOW-GEND-41-ledger-filter-and-row-copy | core | 5,7 | FUSE-06/AC-2 | `tests/sprint-01-docs-spike-skeleton/ledger.spec.ts` :: `FLOW-GEND-41-ledger-filter-and-row-copy` | task |

## Deferred Journeys (declared hand-offs)

- journeys/docs-agent-arc--edge-robots-blocks-registry-json → completes at a later sprint (UC-EXT-01)
- journeys/docs-agent-arc → completes at a later sprint (UC-EXT-01, UC-GEND-04)
- journeys/docs-contributor-arc → completes at a later sprint (UC-DOCS-05, UC-EXT-02, UC-EXT-03)
- journeys/docs-delivery-arc--edge-rollback-leaves-stale-registry → completes at a later sprint (UC-DELIV-04)
- journeys/docs-delivery-arc → completes at a later sprint (UC-DELIV-02)
- journeys/docs-evaluator-arc → completes at a later sprint (UC-DOCS-06, UC-GEND-02, UC-GEND-05, UC-GEND-06)
- journeys/docs-integrator-arc → completes at a later sprint (UC-DOCS-01, UC-DOCS-02, UC-DOCS-04, UC-GEND-04, UC-SHELL-03)
- journeys/docs-themer-arc → completes at a later sprint (UC-DOCS-01, UC-DOCS-03, UC-SHELL-01)
