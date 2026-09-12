<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FAM-003: /components seven-family card grid; supersede the FUSE-07 lean-list spec block

> Status: ✅ Completed
> Commit: 83b7d69ad25bfc30a7f6d61185b455368cff4bd0
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P0 · Points: 5 · Type: FEATURE · Wave: ?
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 2107567

## What this does
Replace the lean /components index with the wireframe's seven-family card grid, turning both locked-flow specs green.

## Why
Both locked run_cmds exit 0 (retries 0): 7 ordered sections, counts 3/7/6/7/4/1/11 = 39, name + verdict badge per card; superseded FUSE-07 block and page-contract lane pass; pager/source-byte untouched.

## How to verify
pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families

## Scope
apps/docs/src/pages/components/index.astro (MODIFY); tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY); tests/sprint-03-family-browse/page-contract.test.ts (NEW); tests/sprint-03-family-browse/components-family-grid.spec.ts; tests/sprint-03-family-browse/card-anatomy.spec.ts

<details>
<summary>▸ Full agent specification (FAM-003 — required reading for implementer + reviewer)</summary>

TASK: FAM-003 — /components seven-family card grid; supersede the FUSE-07 lean-list spec block
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P0 · POINTS: 5
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: derive everything from families.json + registry-items.json at build — never a hand-written list
- MUST: grid CSS: grid, gap 1rem, repeat(auto-fill, minmax(17.5rem,1fr)) — single column on narrow viewports without a media query
- MUST: supersede the FUSE-07 block to assert the seven-section/39-card surface with 200 links; pager (GEND-15) and source-byte (GEND-14) assertions untouched
- MUST: one-liner is plain muted prose 'browse the 39 items by AI family' — PageHeader extraction deferred to Sprint 04
- NEVER: never edit FAM-001's specs (components-family-grid.spec.ts, card-anatomy.spec.ts) — write_allowed lists them for proof-reference ownership only; implementation greens them, never moves them
- NEVER: never render ui/lib families or their 17 names on /components
- NEVER: never put view state in the URL (TR-10); never add JS to this page — zero-JS static markup
- STRICTLY: delete the old 2-column ul styles and the inline monospace h2 override
- STRICTLY: lint via ./node_modules/.bin/biome ci <paths> — pnpm lint crashes locally

### DONE WHEN

- [ ] AC 1: GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN /compon
- [ ] AC 2: GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN all 39 
- [ ] AC 3: GIVEN the superseded component-page.spec.ts and the committed page source WHEN the source-
- [ ] AC 4: GIVEN the committed apps/docs/src/pages/components/index.astro source WHEN the source-cont
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: GIVEN the built preview and the real dataset WHEN the locked run_cmd e [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN /components renders exactly seven sections in committed order (conversation, message, prompt-input, reasoning, sources, suggestion, tool) with counts 3/7/6/7/4/1/11 summing to 39, the card-name multiset equal to the 39 registry:component names each exactly once, and every card href returning 200

  FLOW_REF: FLOW-GEND-07-components-page-39-in-7-families · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/components-family-grid.spec.ts · TEST_FUNCTION: FLOW-GEND-07-components-page-39-in-7-families
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium (3 projects) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_family_grid → MUST_OBSERVE ["7 sections in order conversation, message, prompt-input, reasoning, sources, suggestion, tool", "count chips 3/7/6/7/4/1/11 summing to 39", "39 names each appearing exactly 1 time", "all 39 hrefs return 200", "nojs recount also 7 sections and 39 cards"] / MUST_NOT_OBSERVE ["9 sections (ui/lib present \u2014 start state)", "56 anchor rows with 0 cards (lean-list start)", "any href returning 404"]
    - NEGATIVE_CONTROL: would fail if ['static shell — hand-written HTML not joined from the dataset', 'hand-written list — stale count survives a dataset change', 'empty dataset — 0 cards', 'mock — page renders a fixture copy']

**AC-2: GIVEN the built preview and the real dataset WHEN the locked run_cmd e [PRIMARY]**

  GIVEN/WHEN/THEN: GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN all 39 cards render title, non-empty description <=120 chars equal to the item's description or its word-boundary clamp with trailing ellipsis, category chip, and badge whose exact text is 'runs in Expo Go' or 'requires a dev client', with cards_with_all_fields === 39

  FLOW_REF: FLOW-GEND-08-family-card-anatomy · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/card-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-08-family-card-anatomy
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`
  VERIFICATION_SERVICE: real Astro build + astro preview + Chromium (3 projects) over the real dataset · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_family_grid → MUST_OBSERVE ["cards_with_all_fields == 39", "every description length 1..120, dataset-equal or clamped with '\u2026'", "exactly 1 chip per card", "badge text exactly 'runs in Expo Go' or 'requires a dev client' on all 39"] / MUST_NOT_OBSERVE ["a 0-char description", "a card with 0 chips", "a blank '' or placeholder badge"]
    - NEGATIVE_CONTROL: would fail if ['static shell — cards without chip/badge markup', 'hand-written list — descriptions typed into the page', 'empty dataset — count collapses to 0', 'mock — verdict vs anything but the two exact strings']

**AC-3: GIVEN the superseded component-page.spec.ts and the committed page sou**

  GIVEN/WHEN/THEN: GIVEN the superseded component-page.spec.ts and the committed page source WHEN the source-contract scan runs THEN the FUSE-07 block asserts 7 sections and 39 cards with 200-resolving links and 0 ui/lib names, no 'all 56 names' assertion remains, and the GEND-14/GEND-15 test bodies are byte-identical to pre-task

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/page-contract.test.ts · TEST_FUNCTION: FAM-003-supersede-contract
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-supersede-contract`
  VERIFICATION_SERVICE: vitest static source-contract scan over the committed spec + page source (no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; browser proof rides verification_gates (FUSE-07 grep) and the human gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["block asserts 7 sections and 39 cards derived from the dataset", "exactly 0 remaining 'all 56 names' assertion strings", "0 diffs to the GEND-14 and GEND-15 bodies"] / MUST_NOT_OBSERVE ["the '56 names exactly once' assertion still present (start signature)", "1 or more edited sibling bodies (start state: 0 diffs)"]
    - NEGATIVE_CONTROL: would fail if ['stale 56-name oracle kept green against the wrong page', 'sibling GEND-14/GEND-15 bodies edited to force green', 'page regressed to lean list — 0 cards in the join']

**AC-4: GIVEN the committed apps/docs/src/pages/components/index.astro source **

  GIVEN/WHEN/THEN: GIVEN the committed apps/docs/src/pages/components/index.astro source WHEN the source-contract scan runs THEN it shows 7 jump-nav anchors derived from families.json, exactly 1 plain wrapping div slot above the grid with 0 stub UI inside, data-filter-text emitted on cards as name + description + family, 0 ui/lib family ids in the section join, and 0 URL-param writes in the page

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/page-contract.test.ts · TEST_FUNCTION: FAM-003-page-contract-extras
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-page-contract-extras`
  VERIFICATION_SERVICE: vitest static source-contract scan over the committed page source + families.json (no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; rendered-DOM proof rides verification_gates (FAM-003-family-grid-extras grep) and the human gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["7 jump-nav anchors generated from families.json order", "exactly 1 plain wrapping div slot above the grid", "data-filter-text bound with name + description + family (covers 39 items)", "0 ui/lib family ids in the join", "0 query-param/hash writes"] / MUST_NOT_OBSERVE ["0 data-filter-text bindings (lean-list start)", "9 sections derived in source (start signature: ui/lib join)", "1 or more stub-UI children in the slot"]
    - NEGATIVE_CONTROL: would fail if ['slot renders stub UI instead of a plain div', 'data-filter-text missing so FAM-004 has nothing to consume', 'family ids hardcoded instead of derived from families.json']


### TEST CRITERIA

- **TC-1** (→AC-1, happy_path): FLOW-GEND-07 locked run_cmd exits 0 with 7 ordered sections, counts 3/7/6/7/4/1/11, exact multiset, 200 hrefs. — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
- **TC-2** (→AC-1, edge_case): chromium-nojs renders 7 sections and 39 cards fully server-rendered. — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
- **TC-3** (→AC-2, happy_path): FLOW-GEND-08 locked run_cmd exits 0 with cards_with_all_fields === 39. — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`
- **TC-4** (→AC-3, happy_path): Supersede contract: rewritten block with 0 stale 56-name assertions and 0 diffs to GEND-14/GEND-15. — `pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-supersede-contract`
- **TC-5** (→AC-4, edge_case): Extras contract: 7 anchors, 1 plain slot, data-filter-text on 39 cards, 0 ui/lib ids, 0 URL writes. — `pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-page-contract-extras`

### READING LIST (max 5)

- apps/docs/src/pages/registry.astro [PRIMARY PATTERN] lines all — build-time data-join of families + items with derived ordering
- apps/docs/src/pages/components/index.astro [surface replaced] lines 1-59 — lean list to replace; delete 2-col ul + monospace h2; lines 14-17 already hold family ordering + type filter
- apps/docs/src/components/SectionHeader.astro [FAM-002 contract] lines all — SectionHeader props per family section
- apps/docs/src/components/ComponentCard.astro [FAM-002 contract] lines all — ComponentCard props: title/clamp/chip/badge/href
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts [supersede target] lines 249-293 — lean-index block to rewrite; pager (201-247) + source-byte (93-199) survive untouched

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/pages/components/index.astro (MODIFY)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- tests/sprint-03-family-browse/page-contract.test.ts (NEW)
- tests/sprint-03-family-browse/components-family-grid.spec.ts
- tests/sprint-03-family-browse/card-anatomy.spec.ts
writeProhibited:
- src/data/** and packages/**
- playwright.config.ts
- apps/docs/src/components/SectionHeader.astro + ComponentCard.astro (consumed as-is)
- tests/sprint-02-shell-hero/**

### CODE PATTERN
- pattern: build-time data-join rendering server-side sections (source: apps/docs/src/pages/registry.astro + components/index.astro:14-17)
- anti-pattern: hand-written card markup, media-query column switching, stub UI in slot, editing FAM-001 specs, stale styles left behind
- references: ['TR-07 wireframe rows R1-R4', 'T-GEND-006/007/008', 'UC-GEND-02 AC-1..3']
- notes: ["h1 'Components' + muted one-liner 'browse the 39 items by AI family' (PageHeader deferred to Sprint 04). Jump nav: inline-flex wrap, 7 family anchors (doubles as mobile jump list). Slot: plain wrapping div above the grid. Sections: <section id aria-labelledby> = SectionHeader + <ul> grid (grid, gap 1rem, repeat(auto-fill, minmax(17.5rem,1fr)) — no media query). Cards filtered to type === 'registry:component', each exposing data-filter-text (name + description + family). ui/lib + 17 names leave for /registry (FAM-005 re-points ledger links)."]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01'] · provides: ['seven-family / 39-card surface (h1 + one-liner, jump nav, mount slot, SectionHeader + ComponentCard grid)', 'data-filter-text on every card for FAM-004', 'superseded FUSE-07 block + page-contract source lane'] · consumes: ['FAM-002 SectionHeader + ComponentCard contracts', "registry-items/families data contract (type === 'registry:component', family order)", 'FAM-001 specs as GREEN target (never edited)']

- seven sections derived at build from families whose itemNames are all registry:component (3/7/6/7/4/1/11); ui/lib families + 17 names leave the page
- every card exposes data-filter-text = name + description + family
- mount slot is a plain wrapping div — structural only, never dead stub UI

### VERIFICATION GATES

- **FLOW-GEND-07 green** — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families` → exit 0, retries 0, evidence at locked path
- **FLOW-GEND-08 green** — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy` → exit 0, retries 0, evidence at locked path
- **supersede contract (AC-3)** — `pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-supersede-contract` → exit 0
- **extras contract (AC-4)** — `pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-page-contract-extras` → exit 0
- **superseded block, rendered (browser proof)** — `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FUSE-07-components-index` → exit 0
- **extras, rendered (browser proof)** — `pnpm playwright test tests/sprint-01-docs-spike-skeleton/component-page.spec.ts --grep FAM-003-family-grid-extras` → exit 0
- **typecheck + lint** — `pnpm typecheck && ./node_modules/.bin/biome ci apps/docs/src/pages/components/index.astro tests/sprint-01-docs-spike-skeleton/component-page.spec.ts tests/sprint-03-family-browse/page-contract.test.ts` → exit 0

### DEPENDENCIES
- Depends on: ['FAM-001', 'FAM-002'] · Blocks: ['FAM-004', 'FAM-005', 'FAM-006'] · Parallel: none (wave B serialization point)

### CODING STANDARDS

- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FAM-003",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "Committed build inputs the page joins at build and the scans read.",
   "seed_method": "public_api",
   "records": [
    "39 registry:component items across 7 families, counts 3/7/6/7/4/1/11",
    "all 39 descriptions >120 chars, longest 1840",
    "zero items carry expoGo:false at HEAD"
   ]
  },
  "built_family_grid": {
   "description": "Docs build with FAM-003 page + FAM-002 components, served at http://localhost:4321 via Playwright webServer.",
   "seed_method": "ui_flow",
   "records": [
    "/components serves 200 with 7 sections and 39 cards",
    "each card href serves 200"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "description": "GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN /components renders exactly seven sections in committed order (conversation, message, prompt-input, reasoning, sources, suggestion, tool) with counts 3/7/6/7/4/1/11 summing to 39, the card-name multiset equal to the 39 registry:component names each exactly once, and every card href returning 200",
   "primary": true,
   "flow_ref": "FLOW-GEND-07-components-page-39-in-7-families",
   "test_file": "tests/sprint-03-family-browse/components-family-grid.spec.ts",
   "test_function": "FLOW-GEND-07-components-page-39-in-7-families",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium (3 projects)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": null,
   "scenario": {
    "primary": true,
    "test_tier": "e2e",
    "verification_service": "real preview + data-equality oracle vs the real dataset",
    "negative_control": {
     "would_fail_if": [
      "static shell \u2014 hand-written HTML not joined from the dataset",
      "hand-written list \u2014 stale count survives a dataset change",
      "empty dataset \u2014 0 cards",
      "mock \u2014 page renders a fixture copy"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_family_grid",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "goto /components",
        "read order, counts, multiset, hrefs",
        "request.get every distinct href",
        "recount under chromium-nojs"
       ]
      },
      "end_state": {
       "must_observe": [
        "7 sections in order conversation, message, prompt-input, reasoning, sources, suggestion, tool",
        "count chips 3/7/6/7/4/1/11 summing to 39",
        "39 names each appearing exactly 1 time",
        "all 39 hrefs return 200",
        "nojs recount also 7 sections and 39 cards"
       ],
       "must_not_observe": [
        "9 sections (ui/lib present \u2014 start state)",
        "56 anchor rows with 0 cards (lean-list start)",
        "any href returning 404"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "description": "GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN all 39 cards render title, non-empty description <=120 chars equal to the item's description or its word-boundary clamp with trailing ellipsis, category chip, and badge whose exact text is 'runs in Expo Go' or 'requires a dev client', with cards_with_all_fields === 39",
   "primary": true,
   "flow_ref": "FLOW-GEND-08-family-card-anatomy",
   "test_file": "tests/sprint-03-family-browse/card-anatomy.spec.ts",
   "test_function": "FLOW-GEND-08-family-card-anatomy",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview + Chromium (3 projects) over the real dataset",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": null,
   "scenario": {
    "primary": true,
    "test_tier": "e2e",
    "verification_service": "real preview + dataset-equality oracle over card fields",
    "negative_control": {
     "would_fail_if": [
      "static shell \u2014 cards without chip/badge markup",
      "hand-written list \u2014 descriptions typed into the page",
      "empty dataset \u2014 count collapses to 0",
      "mock \u2014 verdict vs anything but the two exact strings"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_family_grid",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "enumerate all 39 cards",
        "read title/description/chip/badge",
        "diff vs dataset or computed clamp",
        "assert cards_with_all_fields === 39"
       ]
      },
      "end_state": {
       "must_observe": [
        "cards_with_all_fields == 39",
        "every description length 1..120, dataset-equal or clamped with '\u2026'",
        "exactly 1 chip per card",
        "badge text exactly 'runs in Expo Go' or 'requires a dev client' on all 39"
       ],
       "must_not_observe": [
        "a 0-char description",
        "a card with 0 chips",
        "a blank '' or placeholder badge"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "description": "GIVEN the superseded component-page.spec.ts and the committed page source WHEN the source-contract scan runs THEN the FUSE-07 block asserts 7 sections and 39 cards with 200-resolving links and 0 ui/lib names, no 'all 56 names' assertion remains, and the GEND-14/GEND-15 test bodies are byte-identical to pre-task",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/page-contract.test.ts",
   "test_function": "FAM-003-supersede-contract",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-supersede-contract",
   "test_tier": "unit",
   "verification_service": "vitest static source-contract scan over the committed spec + page source (no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; browser proof rides verification_gates (FUSE-07 grep) and the human gate.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest source-contract scan over real committed files",
    "negative_control": {
     "would_fail_if": [
      "stale 56-name oracle kept green against the wrong page",
      "sibling GEND-14/GEND-15 bodies edited to force green",
      "page regressed to lean list \u2014 0 cards in the join"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "test_runner",
       "steps": [
        "scan the rewritten FUSE-07 block",
        "count '56 names' remnants",
        "diff GEND-14/GEND-15 bodies vs pre-task"
       ]
      },
      "end_state": {
       "must_observe": [
        "block asserts 7 sections and 39 cards derived from the dataset",
        "exactly 0 remaining 'all 56 names' assertion strings",
        "0 diffs to the GEND-14 and GEND-15 bodies"
       ],
       "must_not_observe": [
        "the '56 names exactly once' assertion still present (start signature)",
        "1 or more edited sibling bodies (start state: 0 diffs)"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "description": "GIVEN the committed apps/docs/src/pages/components/index.astro source WHEN the source-contract scan runs THEN it shows 7 jump-nav anchors derived from families.json, exactly 1 plain wrapping div slot above the grid with 0 stub UI inside, data-filter-text emitted on cards as name + description + family, 0 ui/lib family ids in the section join, and 0 URL-param writes in the page",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/page-contract.test.ts",
   "test_function": "FAM-003-page-contract-extras",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-page-contract-extras",
   "test_tier": "unit",
   "verification_service": "vitest static source-contract scan over the committed page source + families.json (no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; rendered-DOM proof rides verification_gates (FAM-003-family-grid-extras grep) and the human gate.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest source-contract scan over real committed source",
    "negative_control": {
     "would_fail_if": [
      "slot renders stub UI instead of a plain div",
      "data-filter-text missing so FAM-004 has nothing to consume",
      "family ids hardcoded instead of derived from families.json"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "test_runner",
       "steps": [
        "scan index.astro for jump nav, slot div, data-filter-text binding",
        "join families.json and count sections vs ui/lib references",
        "scan for query-param writes"
       ]
      },
      "end_state": {
       "must_observe": [
        "7 jump-nav anchors generated from families.json order",
        "exactly 1 plain wrapping div slot above the grid",
        "data-filter-text bound with name + description + family (covers 39 items)",
        "0 ui/lib family ids in the join",
        "0 query-param/hash writes"
       ],
       "must_not_observe": [
        "0 data-filter-text bindings (lean-list start)",
        "9 sections derived in source (start signature: ui/lib join)",
        "1 or more stub-UI children in the slot"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "description": "FLOW-GEND-07 locked run_cmd exits 0 with 7 ordered sections, counts 3/7/6/7/4/1/11, exact multiset, 200 hrefs.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "type": "happy_path"
  },
  {
   "id": "TC-2",
   "description": "chromium-nojs renders 7 sections and 39 cards fully server-rendered.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "type": "edge_case"
  },
  {
   "id": "TC-3",
   "description": "FLOW-GEND-08 locked run_cmd exits 0 with cards_with_all_fields === 39.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "type": "happy_path"
  },
  {
   "id": "TC-4",
   "description": "Supersede contract: rewritten block with 0 stale 56-name assertions and 0 diffs to GEND-14/GEND-15.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-supersede-contract",
   "type": "happy_path"
  },
  {
   "id": "TC-5",
   "description": "Extras contract: 7 anchors, 1 plain slot, data-filter-text on 39 cards, 0 ui/lib ids, 0 URL writes.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/page-contract.test.ts -t FAM-003-page-contract-extras",
   "type": "edge_case"
  }
 ]
}
-->

</details>

## Amendments

### AMEND-1 (AC-4, reviewer-proposed cycle 1, 2026-09-12)

- **Original criterion:** AC-4 required `data-filter-text` as name + description + family.
- **Replacement real criterion:** `data-filter-text` on every card as name + one-line description +
  category (the locked FAM-002 ComponentCard join), with the family dimension carried by the
  card's section ancestor (`section id={family.id}`), asserted per card in the rendered extras proof.
- **Because (probe evidence):** ComponentCard.astro is writeProhibited with
  `filterText=[title, oneLiner, category]` (ComponentCard.astro:27) and FAM-001's locked chip
  oracle pins the category slot to the registry type (`card-anatomy.spec.ts:127,132,141`), while
  FAM-004 (the sole consumer) matches free text over `[data-filter-text]` and has no family-facet
  requirement. Reviewer verified the implemented resolution serves the consumer: extras vitest 2/2
  and rendered extras proof 3/3 (per-card ancestry assertion).
