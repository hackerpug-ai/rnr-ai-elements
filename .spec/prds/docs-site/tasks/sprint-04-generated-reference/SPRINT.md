---
sequence: 4
timeline: Phase 2
status: planned
sprint_id: sprint-04-generated-reference
planned_from_roadmap_sha: 9678dd1e8d096e480f8d3548e725b4a05fd75a192d70b5ac06dcfa0cb1438359
planned_from_source_sha: 83090e57f97a67ca6899f28d6d428588632aaab4
planned_at: 2026-09-12
---

# Sprint 04: generated-reference

**Status:** Planned
**Sequence:** 4
**Timeline:** Phase 2

## Overview

The generated reference layer: all 39 component pages gain the TR-07 anatomy — the PropsTable over the sprint-01 ts-morph data, theming note and usage snippet rendered from fields that sit unrendered today, the Code view standing alone under the null-imagery discipline (byte-matched to the served /r/*.json), seam callouts on /docs/theming sections, per-item build-time QR panels, the authored four-entry dev-client matrix (shape-gated fail-closed) mounted as a no-id trailing section on /components alongside the engine-tabbed family install commands, and the enrichment drill extending the fail-closed gates (unresolved props, matrix shape, imagery flag, single-source derivation).

## Human Testing Gate

**Gate:** Done means a visitor can open any of the 39 generated reference pages over `astro preview` and read its auto-generated props table (Name/Type/Default/Description with at least one row), its dependency panel listing registryDependencies and AI SDK v7 peers, and its full untruncated source that byte-matches the served /r/*.json content, proven by opening http://localhost:4321/components/conversation in a browser and diffing its Code view against `curl http://localhost:4321/r/nativewind/conversation.json` (T-GEND-023/024/015 shape).

**Entrypoint:** Built dist over `astro preview` at http://localhost:4321/components/[item], plus curl of the same origin's /r/*.json.

**Before:** At HEAD 31bca18, /components/conversation over `astro preview` renders breadcrumb, h1, one-line description, chip row (v0.2.1/category/engines/Expo Go), the engine-tabbed InstallCommand as first section, the DependencyPanel (registryDependencies + dependencies + the AI SDK peer `ai ^7.0.89`), full untruncated nativewind-substituted source as a bare <section data-section="source">, and the within-family pager — the roadmap's 'no dependency panels, no family pager' clauses are stale (both shipped sprint-02). Still absent, all RED against the gate: no props table, no theming-note or usage-snippet rendering (39/39 components carry non-empty props[]/themingNote/usageSnippet in apps/docs/src/data/registry-items.json, verified present and unrendered), no tabbed or standalone Code view contract, no seam callouts (renderMarkdown users: message/reasoning/context; TextClassContext users: message/prompt-input/tool/plan/queue/commit/terminal/environment-variables), no QrPanel, no dev-client matrix (enriched-markdown/streamdown/speech-recognition/extended-audio appear nowhere; zero items have expoGo:false), and no family install commands on /components (the FAM-003 seven-family card grid). The FUSE-04 gates module has five gates (count/files/props/family/verdict) plus drill-item-count.ts — no matrix-shape gate, no imagery flag, no qrDeepLink/metaDescription derivation. Opening the gate URL and diffing its Code view against curl of /r/nativewind/conversation.json cannot pass the props-table clause: no table renders.

**Demonstrates:** UC-GEND-03, UC-GEND-04, UC-GEND-06, UC-SHELL-03 (UC-GEND-05's matrix + QR-panel work ships here as supporting task work; UC-GEND-05 demonstrates at Sprint 09 where its QR/gallery flow completes)

**Deferred journeys:** journeys/docs-agent-arc (outstanding: UC-DELIV-03, UC-EXT-01), journeys/docs-evaluator-arc (outstanding: UC-DOCS-06, UC-GEND-05), journeys/docs-integrator-arc (outstanding: UC-DOCS-01, UC-DOCS-02, UC-DOCS-04), journeys/docs-themer-arc (outstanding: UC-DOCS-01, UC-DOCS-03)

## Test Deliverable

<!-- TESTING-GATE-START -->

- [ ] 1. At the repo root run `pnpm e2e:docs` — it exits 0 with retries: 0: the ordered chain (registry:build → gallery:manifest → docs build → playwright install → playwright test) completes with every lane green, including the superseded sprint-01/02/03 lanes and the NEW tests/sprint-04-generated-reference lane — the eight FLOW specs plus the riding specs qr-panel.spec.ts (T-GEND-017), dev-client-matrix.spec.ts (T-GEND-020), site-crawl.spec.ts (T-GEND-016), preview-omission-nojs.spec.ts (T-GEND-021), and the enrichment-drill.test.ts vitest file (T-GEND-022/026).   `exercises: REF-001, REF-002, REF-003, REF-004, REF-005, REF-006, REF-007, REF-008, REF-009, REF-010, REF-011`
- [ ] 2. Run `pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy` — 3 passed (chromium-desktop, chromium-mobile, chromium-nojs); evidence JSON written to .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-14-reference-page-anatomy.json, asserting across all 39 pages that top-level section DOM order is install before source/props/theming/usage and that 0 preview-panel elements exist.   `exercises: REF-001, REF-009`
- [ ] 3. Run `pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family` — 3 passed across all three projects; the evidence JSON at .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-15-family-pager-stays-in-family.json records set(pages_reachable_via_pager) == set(family_members) for each of the seven families and every pager href returning 200 in dist/.   `exercises: REF-001, REF-009`
- [ ] 4. Run `pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy` — 3 passed; every one of the 39 component pages yields, per engine tab, a one-click copy matching ^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$ with a visible success state; the 17 ui/lib items complete at Sprint 05 (no such pages yet).   `exercises: REF-001, REF-009`
- [ ] 5. Run `pnpm playwright test tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts --grep FLOW-GEND-21-dependency-panel-peers` — 3 passed; panels on shimmer and conversation equal registry dependencies + engine-resolved registryDependencies + the AI SDK v7 peer, and >=5 sampled panels match the live-served /r/nativewind/*.json dependency fields with 0 invented or dropped entries.   `exercises: REF-001, REF-006, REF-009`
- [ ] 6. Run `pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated` — 3 passed; props_tables == 39 in the evidence JSON at .tmp/sprint-04-generated-reference/e2e-evidence/FLOW-GEND-34-props-table-generated.json, every table carrying Name/Type/Default/Description headers and >=1 row (conversation: 5 rows), types as resolved text — never any/unknown placeholders.   `exercises: REF-001, REF-002, REF-009`
- [ ] 7. Run `pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source` — 3 passed; >=5 sampled multi-file items (e.g. audio-player, prompt-input, tool) byte-match the Code view text against files[].text fetched from http://localhost:4321/r/nativewind/{item}.json — zero normalization diffs, every file present, no height limit or clipping.   `exercises: REF-001, REF-003, REF-009`
- [ ] 8. Run `pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages` — 3 passed across all three projects (the chromium-nojs project asserts the stacked server-rendered fallback): clicking uniwind on /components/conversation sets localStorage 'rnr-engine'="uniwind", soft navigation and a hard load of /components/message keep aria-selected="true" on uniwind, switching back rewrites storage, and no engine state ever appears in any URL.   `exercises: REF-001, REF-009`
- [ ] 9. Run `pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html` — 3 passed; the raw pre-JS HTML of /components/conversation and /components/message contains BOTH literal strings https://rnraielements.com/r/nativewind/ and https://rnraielements.com/r/uniwind/ inside their server-rendered tab panels, and with JavaScript disabled both panels render stacked and readable.   `exercises: REF-001, REF-009`
- [ ] 10. Run `pnpm --filter @rnr-ai-elements/docs build && pnpm --filter @rnr-ai-elements/docs preview`, then open http://localhost:4321/components/conversation in a browser and read: (1) the props table with Name/Type/Default/Description columns and >=1 row; (2) the dependency panel listing registryDependencies button/icon/empty plus react-native-safe-area-context plus the AI SDK v7 peer; (3) the theming note with token chips and the usage snippet with an always-visible copy button; (4) the full untruncated source in the Code view with its QR aside. Then run `curl -s http://localhost:4321/r/nativewind/conversation.json` and diff the served files[].text against the Code view text — zero byte differences.   `exercises: REF-002, REF-003, REF-004, REF-005, REF-006, REF-009`
- [ ] 11. On the same preview, open http://localhost:4321/components/conversation at a 390px viewport (browser DevTools responsive mode) and check the FLOW-GEND-14 anatomy's mobile frame: the props table renders as stacked cards (one card per prop, label plus value), the dependency table scrolls horizontally with the first column sticky, theming/usage/source regions stay readable with zero clipped or overlapped text, and every copy button plus the QR aside remains operable with touch targets >=44px.   `exercises: REF-002, REF-003, REF-006, REF-009`

<!-- TESTING-GATE-END -->

**Dark tasks:** None — every task is exercised by at least one gate step.

## Tasks

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

## Dependencies

- Blocks: Sprint 09, Sprint 11
- Dependent on: Sprint 01, Sprint 03

## PRD Coverage

- 05-uc-gend.md UC-GEND-03..06; 06-uc-shell.md UC-SHELL-03
- TR-02, TR-03 (registry_page_model), TR-07 (component-detail wireframe, 14 regions + mobile frame), TR-08 R7/R8, TR-10
- 12-e2e-testing-criteria.md T-GEND-009..026

## Capability Coverage

- CAP-DOCS-01: field-level enrichment gates drilled (empty files[].path, bogus family, missing verdict, unresolved props, matrix shape) — completes UC-DELIV-01 AC-2's clause set machine-asserted
- CAP-INST-01: dependency panel + absolute-URL command correctness per item
## Task Detail Files

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

## Automated Functional Coverage

| Flow ID | Kind | Gate step(s) | Owner task/AC | Test file/function | Replay |
|---|---|---|---|---|---|
| FLOW-GEND-14-reference-page-anatomy | core | 1,2,10,11 | REF-001/AC-1 | tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts :: FLOW-GEND-14-reference-page-anatomy | task |
| FLOW-GEND-15-family-pager-stays-in-family | core | 1,3 | REF-001/AC-2 | tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts :: FLOW-GEND-15-family-pager-stays-in-family | task |
| FLOW-GEND-20-exact-absolute-url-command-copy | core | 1,4 | REF-001/AC-3 | tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts :: FLOW-GEND-20-exact-absolute-url-command-copy | task |
| FLOW-GEND-21-dependency-panel-peers | core | 1,5,10 | REF-001/AC-4 | tests/sprint-04-generated-reference/dependency-panel-peers.spec.ts :: FLOW-GEND-21-dependency-panel-peers | task |
| FLOW-GEND-34-props-table-generated | core | 1,6,10 | REF-001/AC-5 | tests/sprint-04-generated-reference/props-table-generated.spec.ts :: FLOW-GEND-34-props-table-generated | task |
| FLOW-GEND-35-code-view-byte-identical-to-shipped-source | core | 1,7,10 | REF-001/AC-6 | tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts :: FLOW-GEND-35-code-view-byte-identical-to-shipped-source | task |
| FLOW-SHELL-13-engine-tab-persists-across-pages | core | 1,8 | REF-001/AC-7 | tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts :: FLOW-SHELL-13-engine-tab-persists-across-pages | task |
| FLOW-SHELL-14-tab-panels-in-initial-html | core | 1,9 | REF-001/AC-8 | tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts :: FLOW-SHELL-14-tab-panels-in-initial-html | task |

The table is a projection only. `human-flows.json` plus the Requirement Contracts remain authoritative; the [5.7] checker proves they match before each write.
