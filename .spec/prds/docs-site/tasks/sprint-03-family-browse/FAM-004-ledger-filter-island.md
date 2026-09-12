<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FAM-004: rnr-ledger-filter island (4 of 5) + island-budget 3→4 + own lane spec

> Status: Backlog
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 5 · Type: FEATURE · Wave: ?
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 2107567

## What this does
Ship the fourth constitutional island: a generalized client-side filter over the seven-family grid, graceful without JS, URL-stable throughout.

## Why
The contract lane proves wiring (define, astro:page-load init, target attribute, data-filter-text consumption, 0 URL writes, ARIA + focus-visible), the island-budget lane proves exactly four defines, and the browser gate proves narrowing, 39-restore, no-results row, URL stability, nojs full grid.

## How to verify
pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-filter-wiring

## Scope
apps/docs/src/components/islands/LedgerFilter.astro (NEW); apps/docs/src/scripts/ledger-filter.ts (NEW); apps/docs/src/pages/components/index.astro (MODIFY); tests/sprint-01-docs-spike-skeleton/island-budget.test.ts (MODIFY); tests/sprint-03-family-browse/ledger-filter-contract.test.ts (NEW); tests/sprint-03-family-browse/ledger-filter-island.spec.ts (NEW)

<details>
<summary>▸ Full agent specification (FAM-004 — required reading for implementer + reviewer)</summary>

TASK: FAM-004 — rnr-ledger-filter island (4 of 5) + island-budget 3→4 + own lane spec
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 5
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/5 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: WAI-ARIA search-box pattern: accessible labeled input; :focus-visible ring via global contract; init on astro:page-load like siblings
- MUST: typing filters [data-filter-text] cards across all seven sections; fully-emptied sections hide with headers; zero matches renders one muted no-results row; clearing restores all 39
- MUST: update island-budget.test.ts exactly-three → exactly-four defines, SHELL-003/004 blocks untouched, vitest lane green
- MUST: accept inputs via attributes (target container selector) — generalization only, build NO tab machinery
- NEVER: never put filter state in the URL — no query params, hashes, or history writes (TR-10)
- NEVER: never exceed the five-island budget — the count moves 3→4
- NEVER: never break the zero-JS fallback — with JS disabled the full grid renders and the input is absent or inert
- NEVER: never edit FAM-001's locked-flow specs or FAM-003's authored lanes
- STRICTLY: mount into FAM-003's existing slot div — no page restructuring around the island
- STRICTLY: lint via ./node_modules/.bin/biome ci <paths>; pnpm e2e:docs appears only in the human gate, never as a task verify

### DONE WHEN

- [x] AC 1: GIVEN the committed ledger-filter.ts + LedgerFilter.astro source WHEN the source-contract 
- [x] AC 2: GIVEN the committed island source WHEN the source-contract scan runs THEN ledger-filter.ts
- [x] AC 3: GIVEN the committed page + component source WHEN the source-contract scan runs THEN all 39
- [x] AC 4: GIVEN the island-budget vitest lane WHEN it scans the committed source THEN it asserts exa
- [x] AC 5: GIVEN the committed island source WHEN the source-contract scan runs THEN the input elemen
- [x] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [x] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: GIVEN the committed ledger-filter.ts + LedgerFilter.astro source WHEN **

  GIVEN/WHEN/THEN: GIVEN the committed ledger-filter.ts + LedgerFilter.astro source WHEN the source-contract scan runs THEN the script contains exactly 1 customElements.define('rnr-ledger-filter', …), initializes via document.addEventListener('astro:page-load', …), reads a target attribute and queries [data-filter-text] within that container, and the Astro component mounts in FAM-003's slot

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/ledger-filter-contract.test.ts · TEST_FUNCTION: FAM-004-contract-filter-wiring
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-filter-wiring`
  VERIFICATION_SERVICE: vitest static source-contract scan over the committed island source (no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; browser proof rides verification_gates and the human gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["exactly 1 customElements.define('rnr-ledger-filter', \u2026)", "1 astro:page-load init listener", "getAttribute('target') feeding a querySelectorAll('[data-filter-text]', container) call", "LedgerFilter mounted inside FAM-003's slot div in index.astro"] / MUST_NOT_OBSERVE ["0 defines for rnr-ledger-filter (start state: island absent)", "a DOMContentLoaded-only init (start signature: dead after transitions)", "0 references to data-filter-text"]
    - NEGATIVE_CONTROL: would fail if ['static shell — island markup with no define (stub island)', 'hardcoded card names instead of [data-filter-text] reads', 'empty dataset — 0 cards to select', 'mock — scan runs against a fixture copy of the source']

**AC-2: GIVEN the committed island source WHEN the source-contract scan runs T**

  GIVEN/WHEN/THEN: GIVEN the committed island source WHEN the source-contract scan runs THEN ledger-filter.ts contains 0 occurrences of history.pushState/replaceState, location.search reads, or location.hash writes, and LedgerFilter.astro carries exactly 1 muted no-results row element for the zero-match state

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/ledger-filter-contract.test.ts · TEST_FUNCTION: FAM-004-contract-no-url-writes
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-no-url-writes`
  VERIFICATION_SERVICE: vitest static source-contract scan over the committed island source (no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; browser proof rides verification_gates and the human gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["0 occurrences of pushState/replaceState/location.hash writes/location.search reads", "exactly 1 no-results row element in the component markup", "an input-clear branch that restores all 39 cards' visibility (39 visible after clear)"] / MUST_NOT_OBSERVE ["1 or more URL/history writes (start signature: URL-driven filter)", "0 no-results markup (start state)", "a clear path that leaves cards hidden"]
    - NEGATIVE_CONTROL: would fail if ['filter state leaks into the URL via a write the scan misses', 'no-results is an empty removal, not the 1 muted row', 'clearing path missing so state cannot reset']

**AC-3: GIVEN the committed page + component source WHEN the source-contract s**

  GIVEN/WHEN/THEN: GIVEN the committed page + component source WHEN the source-contract scan runs THEN all 39 cards plus section/grid markup are server-rendered in index.astro outside the island, and the filter input is emitted only inside the custom element's upgrade path or guarded inert in static markup, so JavaScript-disabled rendering leaves the full grid untouched

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/ledger-filter-contract.test.ts · TEST_FUNCTION: FAM-004-contract-nojs-fallback
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-nojs-fallback`
  VERIFICATION_SERVICE: vitest static source-contract scan over the committed page + component source (no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; the chromium-nojs browser proof rides verification_gates and the human gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["the card grid loop is static template markup in index.astro (covers 39 items)", "exactly 1 input, present only inside the custom element's upgrade path or hidden/disabled until upgrade (0 functional inputs in static markup)", "0 grid DOM construction inside ledger-filter.ts"] / MUST_NOT_OBSERVE ["0 cards in the static template (JS-dependent start state)", "an unguarded functional input in static markup", "innerHTML grid injection in the script"]
    - NEGATIVE_CONTROL: would fail if ["the grid depends on the island's JS to render (static shell page)", 'the input renders unguarded and functional in static markup (JS-required trap)', 'cards are injected client-side only']

**AC-4: GIVEN the island-budget vitest lane WHEN it scans the committed source**

  GIVEN/WHEN/THEN: GIVEN the island-budget vitest lane WHEN it scans the committed source THEN it asserts exactly 4 customElements.define calls (rnr-copy-button, rnr-tab-group, rnr-theme-toggle, rnr-ledger-filter) with the SHELL-003/004 contract blocks byte-identical to pre-task, and exits 0

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/island-budget.test.ts · TEST_FUNCTION: island-budget
  VERIFY: `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t island-budget`
  VERIFICATION_SERVICE: vitest over the real committed apps/docs source (static contract scan, no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; supersede of the exactly-three contract.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["vitest exits 0", "enumeration lists exactly 4 defines: rnr-copy-button, rnr-tab-group, rnr-theme-toggle, rnr-ledger-filter", "0 diffs to the SHELL-003/004 blocks"] / MUST_NOT_OBSERVE ["the exactly-3 assertion still present (start state)", "a 5th define counted or ignored", "deleted or weakened SHELL contract blocks"]
    - NEGATIVE_CONTROL: would fail if ['a fifth define ships (constitutional five breached)', 'rnr-ledger-filter defined outside the counted surface', 'SHELL-003/004 blocks edited to force green']

**AC-5: GIVEN the committed island source WHEN the source-contract scan runs T**

  GIVEN/WHEN/THEN: GIVEN the committed island source WHEN the source-contract scan runs THEN the input element carries an accessible name (label element or aria-label) in LedgerFilter.astro and a :focus-visible rule exists (scoped or global-contract reference), so keyboard focus shows the ring and the search box is announced

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/ledger-filter-contract.test.ts · TEST_FUNCTION: FAM-004-contract-a11y
  VERIFY: `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-a11y`
  VERIFICATION_SERVICE: vitest static source-contract scan over the committed component source (no mocks) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  UNIT_TEST_JUSTIFIED: Pure assertion logic over committed source text — no runtime I/O beyond committed-file reads; accessibility-tree proof rides verification_gates and the human gate.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["exactly 1 input with a resolvable accessible name (label for= or aria-label)", "at least 1 :focus-visible rule targeting the input (scoped or global contract class)", "exactly 1 role=\"search\" landmark (search box pattern) on the component"] / MUST_NOT_OBSERVE ["0 label/aria-label on the input (start signature)", "0 focus-visible rules (start state: ring missing)", "a placeholder used as the only name"]
    - NEGATIVE_CONTROL: would fail if ['the input ships with no accessible name', 'no focus-visible styling exists in island or global contract', 'role/label wiring is decorative only']


### TEST CRITERIA

- **TC-1** (→AC-1, happy_path): ledger-filter.ts contains exactly 1 define for rnr-ledger-filter, 1 astro:page-load init, target-attribute-driven [data-filter-text] selection, and mounts in FAM-003's slot. — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-filter-wiring`
- **TC-2** (→AC-2, edge_case): ledger-filter.ts contains 0 URL/history writes and LedgerFilter.astro carries exactly 1 muted no-results row plus a clear-restores-all branch. — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-no-url-writes`
- **TC-3** (→AC-3, edge_case): The 39-card grid is static template markup with 0 client-side grid construction; the input is upgrade-created or inert-guarded. — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-nojs-fallback`
- **TC-4** (→AC-4, happy_path): The island-budget lane enumerates exactly 4 defines with 0 diffs to the SHELL-003/004 blocks and exits 0. — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t island-budget`
- **TC-5** (→AC-5, edge_case): The input exposes a resolvable accessible name and at least 1 :focus-visible rule applies to it. — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-a11y`

### READING LIST (max 5)

- apps/docs/src/components/islands/TabGroup.astro [PRIMARY PATTERN] lines all — island shape: wrapper element, attribute-driven inputs, script import wiring, no-JS fallback markup
- apps/docs/src/scripts/tab-group.ts [script pattern] lines all — customElements.define + astro:page-load init lifecycle that ledger-filter.ts imitates
- apps/docs/src/components/islands/ThemeToggle.astro [sibling contract] lines all — labeled control, :focus-visible via global contract, astro:page-load init
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts [supersede target] lines all — exactly-3 assertion to move to exactly-4; SHELL-003/004 blocks that stay byte-identical
- apps/docs/src/pages/components/index.astro [mount surface] lines all — FAM-003's slot div and the data-filter-text card grid the island targets

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/islands/LedgerFilter.astro (NEW)
- apps/docs/src/scripts/ledger-filter.ts (NEW)
- apps/docs/src/pages/components/index.astro (MODIFY)
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts (MODIFY)
- tests/sprint-03-family-browse/ledger-filter-contract.test.ts (NEW)
- tests/sprint-03-family-browse/ledger-filter-island.spec.ts (NEW)
writeProhibited:
- tests/sprint-03-family-browse/components-family-grid.spec.ts + card-anatomy.spec.ts (FAM-001 locked-flow specs)
- tests/sprint-03-family-browse/page-contract.test.ts (FAM-003's lane)
- apps/docs/src/components/islands/TabGroup.astro + ThemeToggle.astro and their scripts (siblings consumed as-is)
- src/data/** and packages/**
- playwright.config.ts
- tests/sprint-02-shell-hero/**

### CODE PATTERN
- pattern: attribute-driven vanilla custom element + astro:page-load module script (source: apps/docs/src/components/islands/TabGroup.astro + apps/docs/src/scripts/tab-group.ts)
- anti-pattern: URL filter state, a fifth island, hardcoded card lists in the island, early tab machinery, breaking the nojs grid, editing SHELL budget blocks
- references: ['TR-07 wireframe row R3', 'TR-10', 'T-GEND-006/008', 'UC-GEND-02 AC-1..3']
- notes: ["Vanilla custom element rnr-ledger-filter (WAI-ARIA search-box) mounted in FAM-003's slot above the grid. Typing filters [data-filter-text] cards (name + description + family) across all seven sections; emptied sections hide with headers; zero matches shows 1 muted no-results row; clearing restores all 39. State lives in client DOM only — URL never changes. Inputs via attributes (target selector) so Sprint 05 remounts the SAME element on /registry — no tab machinery now. Init on astro:page-load like siblings; :focus-visible via global contract. Zero-JS: full grid renders, input absent or inert."]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: [] · provides: ['generalized rnr-ledger-filter element + ledger-filter.ts', 'island-budget contract at exactly-four defines', 'ledger-filter-contract.test.ts source lane + ledger-filter-island.spec.ts browser lane (gate-step-5 proof)'] · consumes: ["FAM-003's mount slot + data-filter-text on all 39 cards", 'TabGroup/ThemeToggle astro:page-load init + :focus-visible contract']

- inputs via attributes (target container selector) so Sprint 05 remounts the SAME element on /registry — no tab machinery now
- ALL filter state in client DOM — the canonical URL never changes (TR-10)
- island count within the constitutional five: rnr-copy-button, rnr-tab-group, rnr-theme-toggle, rnr-ledger-filter

### VERIFICATION GATES

- **contract: wiring (AC-1)** — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-filter-wiring` → exit 0
- **contract: URL stability (AC-2)** — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-no-url-writes` → exit 0
- **contract: nojs fallback (AC-3)** — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-nojs-fallback` → exit 0
- **island budget 3→4 (AC-4)** — `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t island-budget` → exit 0, exactly 4 defines enumerated
- **contract: a11y (AC-5)** — `pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-a11y` → exit 0
- **browser proof: narrows + clears 39 (gate-step-5 lane)** — `pnpm playwright test tests/sprint-03-family-browse/ledger-filter-island.spec.ts --grep FAM-004-filter-narrows-and-clears` → exit 0, retries 0
- **browser proof: no-results + URL stability** — `pnpm playwright test tests/sprint-03-family-browse/ledger-filter-island.spec.ts --grep FAM-004-no-results-url-stability` → exit 0, page.url() unchanged
- **browser proof: nojs full grid** — `pnpm playwright test tests/sprint-03-family-browse/ledger-filter-island.spec.ts --grep FAM-004-nojs-full-grid` → exit 0 under chromium-nojs, 7 sections / 39 cards
- **browser proof: a11y + init** — `pnpm playwright test tests/sprint-03-family-browse/ledger-filter-island.spec.ts --grep FAM-004-a11y-and-init` → exit 0
- **typecheck + lint** — `pnpm typecheck && ./node_modules/.bin/biome ci apps/docs/src/components/islands/LedgerFilter.astro apps/docs/src/scripts/ledger-filter.ts apps/docs/src/pages/components/index.astro tests/sprint-03-family-browse/ledger-filter-contract.test.ts tests/sprint-03-family-browse/ledger-filter-island.spec.ts tests/sprint-01-docs-spike-skeleton/island-budget.test.ts` → exit 0
- **scope compliance** — `git diff --name-only` → only write_allowed paths

### DEPENDENCIES
- Depends on: ['FAM-003'] · Blocks: [] · Parallel: FAM-005 (wave C sibling — /registry re-pointing, disjoint paths)

### CODING STANDARDS

- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FAM-004",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "Committed build inputs feeding the grid the island filters and the scans read.",
   "seed_method": "public_api",
   "records": [
    "39 registry:component items across 7 families, counts 3/7/6/7/4/1/11",
    "all 39 descriptions >120 chars, longest 1840",
    "zero items carry expoGo:false at HEAD"
   ]
  },
  "built_family_grid_with_island": {
   "description": "FAM-003's built page with LedgerFilter mounted, served at http://localhost:4321 via Playwright webServer (verification_gates surface).",
   "seed_method": "ui_flow",
   "records": [
    "/components serves 39 cards each carrying data-filter-text",
    "rnr-ledger-filter present with its target attribute"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "description": "GIVEN the committed ledger-filter.ts + LedgerFilter.astro source WHEN the source-contract scan runs THEN the script contains exactly 1 customElements.define('rnr-ledger-filter', \u2026), initializes via document.addEventListener('astro:page-load', \u2026), reads a target attribute and queries [data-filter-text] within that container, and the Astro component mounts in FAM-003's slot",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/ledger-filter-contract.test.ts",
   "test_function": "FAM-004-contract-filter-wiring",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-filter-wiring",
   "test_tier": "unit",
   "verification_service": "vitest static source-contract scan over the committed island source (no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; browser proof rides verification_gates and the human gate.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest source-contract scan over real committed source",
    "negative_control": {
     "would_fail_if": [
      "static shell \u2014 island markup with no define (stub island)",
      "hardcoded card names instead of [data-filter-text] reads",
      "empty dataset \u2014 0 cards to select",
      "mock \u2014 scan runs against a fixture copy of the source"
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
        "scan ledger-filter.ts for the define, init hook, and target/data-filter-text reads",
        "scan LedgerFilter.astro + index.astro for the slot mount"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 customElements.define('rnr-ledger-filter', \u2026)",
        "1 astro:page-load init listener",
        "getAttribute('target') feeding a querySelectorAll('[data-filter-text]', container) call",
        "LedgerFilter mounted inside FAM-003's slot div in index.astro"
       ],
       "must_not_observe": [
        "0 defines for rnr-ledger-filter (start state: island absent)",
        "a DOMContentLoaded-only init (start signature: dead after transitions)",
        "0 references to data-filter-text"
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
   "description": "GIVEN the committed island source WHEN the source-contract scan runs THEN ledger-filter.ts contains 0 occurrences of history.pushState/replaceState, location.search reads, or location.hash writes, and LedgerFilter.astro carries exactly 1 muted no-results row element for the zero-match state",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/ledger-filter-contract.test.ts",
   "test_function": "FAM-004-contract-no-url-writes",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-no-url-writes",
   "test_tier": "unit",
   "verification_service": "vitest static source-contract scan over the committed island source (no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; browser proof rides verification_gates and the human gate.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest source-contract scan over real committed source",
    "negative_control": {
     "would_fail_if": [
      "filter state leaks into the URL via a write the scan misses",
      "no-results is an empty removal, not the 1 muted row",
      "clearing path missing so state cannot reset"
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
        "count URL/history API references in ledger-filter.ts",
        "scan LedgerFilter.astro for the no-results row markup and the clear/reset path"
       ]
      },
      "end_state": {
       "must_observe": [
        "0 occurrences of pushState/replaceState/location.hash writes/location.search reads",
        "exactly 1 no-results row element in the component markup",
        "an input-clear branch that restores all 39 cards' visibility (39 visible after clear)"
       ],
       "must_not_observe": [
        "1 or more URL/history writes (start signature: URL-driven filter)",
        "0 no-results markup (start state)",
        "a clear path that leaves cards hidden"
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
   "description": "GIVEN the committed page + component source WHEN the source-contract scan runs THEN all 39 cards plus section/grid markup are server-rendered in index.astro outside the island, and the filter input is emitted only inside the custom element's upgrade path or guarded inert in static markup, so JavaScript-disabled rendering leaves the full grid untouched",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/ledger-filter-contract.test.ts",
   "test_function": "FAM-004-contract-nojs-fallback",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-nojs-fallback",
   "test_tier": "unit",
   "verification_service": "vitest static source-contract scan over the committed page + component source (no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; the chromium-nojs browser proof rides verification_gates and the human gate.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest source-contract scan over real committed source",
    "negative_control": {
     "would_fail_if": [
      "the grid depends on the island's JS to render (static shell page)",
      "the input renders unguarded and functional in static markup (JS-required trap)",
      "cards are injected client-side only"
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
        "verify the 39-card grid join sits in index.astro's static template",
        "verify the input is upgrade-created or hidden/disabled before define()"
       ]
      },
      "end_state": {
       "must_observe": [
        "the card grid loop is static template markup in index.astro (covers 39 items)",
        "exactly 1 input, present only inside the custom element's upgrade path or hidden/disabled until upgrade (0 functional inputs in static markup)",
        "0 grid DOM construction inside ledger-filter.ts"
       ],
       "must_not_observe": [
        "0 cards in the static template (JS-dependent start state)",
        "an unguarded functional input in static markup",
        "innerHTML grid injection in the script"
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
   "description": "GIVEN the island-budget vitest lane WHEN it scans the committed source THEN it asserts exactly 4 customElements.define calls (rnr-copy-button, rnr-tab-group, rnr-theme-toggle, rnr-ledger-filter) with the SHELL-003/004 contract blocks byte-identical to pre-task, and exits 0",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/island-budget.test.ts",
   "test_function": "island-budget",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t island-budget",
   "test_tier": "unit",
   "verification_service": "vitest over the real committed apps/docs source (static contract scan, no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; supersede of the exactly-three contract.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest contract test against the real source tree",
    "negative_control": {
     "would_fail_if": [
      "a fifth define ships (constitutional five breached)",
      "rnr-ledger-filter defined outside the counted surface",
      "SHELL-003/004 blocks edited to force green"
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
        "run the island-budget vitest lane",
        "diff SHELL-003/004 contract blocks vs pre-task content"
       ]
      },
      "end_state": {
       "must_observe": [
        "vitest exits 0",
        "enumeration lists exactly 4 defines: rnr-copy-button, rnr-tab-group, rnr-theme-toggle, rnr-ledger-filter",
        "0 diffs to the SHELL-003/004 blocks"
       ],
       "must_not_observe": [
        "the exactly-3 assertion still present (start state)",
        "a 5th define counted or ignored",
        "deleted or weakened SHELL contract blocks"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "description": "GIVEN the committed island source WHEN the source-contract scan runs THEN the input element carries an accessible name (label element or aria-label) in LedgerFilter.astro and a :focus-visible rule exists (scoped or global-contract reference), so keyboard focus shows the ring and the search box is announced",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-03-family-browse/ledger-filter-contract.test.ts",
   "test_function": "FAM-004-contract-a11y",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-a11y",
   "test_tier": "unit",
   "verification_service": "vitest static source-contract scan over the committed component source (no mocks)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": "Pure assertion logic over committed source text \u2014 no runtime I/O beyond committed-file reads; accessibility-tree proof rides verification_gates and the human gate.",
   "scenario": {
    "primary": false,
    "test_tier": "unit",
    "verification_service": "vitest source-contract scan over real committed source",
    "negative_control": {
     "would_fail_if": [
      "the input ships with no accessible name",
      "no focus-visible styling exists in island or global contract",
      "role/label wiring is decorative only"
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
        "scan LedgerFilter.astro for label/aria-label on the input",
        "scan styles for a :focus-visible rule applying to the input"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 input with a resolvable accessible name (label for= or aria-label)",
        "at least 1 :focus-visible rule targeting the input (scoped or global contract class)",
        "exactly 1 role=\"search\" landmark (search box pattern) on the component"
       ],
       "must_not_observe": [
        "0 label/aria-label on the input (start signature)",
        "0 focus-visible rules (start state: ring missing)",
        "a placeholder used as the only name"
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
   "description": "ledger-filter.ts contains exactly 1 define for rnr-ledger-filter, 1 astro:page-load init, target-attribute-driven [data-filter-text] selection, and mounts in FAM-003's slot.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-filter-wiring",
   "type": "happy_path"
  },
  {
   "id": "TC-2",
   "description": "ledger-filter.ts contains 0 URL/history writes and LedgerFilter.astro carries exactly 1 muted no-results row plus a clear-restores-all branch.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-no-url-writes",
   "type": "edge_case"
  },
  {
   "id": "TC-3",
   "description": "The 39-card grid is static template markup with 0 client-side grid construction; the input is upgrade-created or inert-guarded.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-nojs-fallback",
   "type": "edge_case"
  },
  {
   "id": "TC-4",
   "description": "The island-budget lane enumerates exactly 4 defines with 0 diffs to the SHELL-003/004 blocks and exits 0.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts -t island-budget",
   "type": "happy_path"
  },
  {
   "id": "TC-5",
   "description": "The input exposes a resolvable accessible name and at least 1 :focus-visible rule applies to it.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm exec vitest run tests/sprint-03-family-browse/ledger-filter-contract.test.ts -t FAM-004-contract-a11y",
   "type": "edge_case"
  }
 ]
}
-->

</details>

## Amendments

### AMEND-1 (AC-1 mount position — reviewer ruling cycle 1, no change of criterion text required)

Ruling: the island mounts at the slot position — immediately after FAM-003's pinned empty
`<div class="family-grid-slot"></div>`, before the first section (slot < island < first section,
contract-locked by ledger-filter-contract.test.ts). Literal containment inside the slot div is
unsatisfiable alongside the same file's writeProhibited pin on the literal empty slot, and the
PRD (07-ui-infrastructure.md) governs position as the full-width filter row above the grid — it
never mandates containment. Reviewer: satisfied-in-intent, zero restructuring.
