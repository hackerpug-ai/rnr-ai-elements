<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-002: PropsTable.astro — zero-JS R8 table from prebuild props[]

> Status: ⬜ Pending
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 2 · Type: FEATURE · Wave: A
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author PropsTable.astro — the zero-JS R8 props-region primitive rendering the sprint-01 prebuild props[] dataset as a 4-column Name/Type/Default/Description table with full-fidelity CSS-wrapped types, explicit em-dash null cells, and a CSS-only stacked-card mobile mode.

## Why
PropsTable.astro exists in apps/docs/src/components/, token-governed and script-free; tests/sprint-04-generated-reference/props-table-contract.test.ts passes green (RED first: component absent); FLOW-GEND-34's rendered 39/39 proof and the 390px stacked-card gate ride REF-009's assembly of this component unchanged.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy

## Scope
apps/docs/src/components/PropsTable.astro (NEW); tests/sprint-04-generated-reference/props-table-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-002 — required reading for implementer + reviewer)</summary>

TASK: REF-002 — PropsTable.astro — zero-JS R8 table from prebuild props[]
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 2
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: Rows derive ONLY from the generated dataset passed via the rows prop — 0 hardcoded prop rows
- MUST: Long/mega types and descriptions render IN FULL via CSS wrap — the 83-char longest type and the 2 newline-carrying rows stay intact in the markup
- MUST: null default and null description render an explicit em-dash (—) cell — all 4 columns present on every row
- MUST: Mobile stacked cards via CSS only: exactly 1 max-width media query over td data-label attributes
- NEVER: Never truncate, ellipsize, line-clamp, or max-height any cell — 0 max-height, 0 -webkit-line-clamp, 0 text-overflow: ellipsis declarations
- NEVER: Never add JavaScript — 0 <script>, 0 customElements.define, 0 new islands (five-island budget unchanged)
- NEVER: Never emit raw color literals — var(--*) tokens only; check-tokens passes over the new component
- NEVER: Never add print styles — 0 @media print rules (sprint-11 scope)
- STRICTLY: Strictly SCOPE write_allowed paths — apps/docs/src/pages/ (REF-009 assembly), scripts/docs-data/ (REF-008 pipeline), apps/docs/src/components/islands/, and tests/sprint-01-docs-spike-skeleton/island-budget.test.ts are write-prohibited

### DONE WHEN

- [ ] AC 1: PropsTable source contract — 4-column table driven by the generated props[] dataset
- [ ] AC 2: Full-fidelity cells — mega types wrap in place, never truncated
- [ ] AC 3: CSS-only mobile card mode keyed on data-label attributes
- [ ] AC 4: Null default/description render explicit em-dash cells — columns never dropped
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: PropsTable source contract — 4-column table driven by the generated props[] dataset**

  GIVEN/WHEN/THEN: GIVEN the repo with the sprint-01 prebuild dataset at apps/docs/src/data/registry-items.json (39/39 registry:component items carry non-empty props[], 180 rows) and (RED at start) no PropsTable.astro WHEN the test reads apps/docs/src/components/PropsTable.astro from the real working tree and scans its structure THEN it renders exactly 1 <table> whose thead carries exactly 4 <th> in order Name, Type, Default, Description, exactly 1 rows-driven loop emitting 1 <tr> per prop entry, prop-name cells in var(--font-mono), type cells on var(--muted-foreground), exactly 1 zebra rule on var(--muted), and 0 <script> tags

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/props-table-contract.test.ts · TEST_FUNCTION: REF-002-props-table-anatomy
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy`
  VERIFICATION_SERVICE: real filesystem read of the authored PropsTable.astro source + real registry-items.json import under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file plus a real registry JSON import — real file reads only, no rendering, no network, no DB (the landed primitives.test.ts pattern); rendered table behavior is REF-009's FLOW-GEND-34 lane, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_props_table → MUST_OBSERVE [1 <table> with a thead of exactly 4 <th> in order Name, Type, Default, Description; exactly 1 rows-driven loop ({#each rows} or rows.map) emitting 1 <tr> per prop — row count derives from the rows prop; prop-name cells declare font-family: var(--font-mono); type cells declare color: var(--muted-foreground); exactly 1 zebra rule (tbody tr:nth-child(even) or equivalent) on background var(--muted); dataset grounding holds: 39/39 items non-empty props[] (180 rows), conversation 5 rows with nearBottomThreshold default '50'] / MUST_NOT_OBSERVE [0 <script> tags and 0 customElements.define calls; 0 hardcoded prop rows (no literal 'nearBottomThreshold' markup — the dataset drives rows); 0 hex color literals matching #[0-9a-fA-F]{3,8}]
    - NEGATIVE_CONTROL: would fail if ['the component is a static stub shell with canned rows — the rows-driven loop and 0-hardcoded-row asserts fail', "rows come from a hand-curated second source instead of the generated dataset — the conversation 5-row / nearBottomThreshold '50' grounding diverges", 'styles are hand-picked hex literals instead of var(--*) references — the 0-hex assert fails']

**AC-2: Full-fidelity cells — mega types wrap in place, never truncated**

  GIVEN/WHEN/THEN: GIVEN the real dataset whose longest prop type is 83 chars and whose type/description fields embed newlines in 2 rows, and (RED at start) no PropsTable.astro WHEN the test reads PropsTable.astro and scans its scoped style block THEN the type and description cell rules declare overflow-wrap: anywhere so long content wraps in place, and the style block carries 0 max-height declarations, 0 -webkit-line-clamp declarations, 0 text-overflow: ellipsis declarations, and 0 white-space: nowrap on data cells

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/props-table-contract.test.ts · TEST_FUNCTION: REF-002-props-table-full-fidelity-types
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types`
  VERIFICATION_SERVICE: real filesystem read of the authored PropsTable.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro style block — real file read only; the rendered no-clip proof is REF-009's FLOW-GEND-34/gate-11 lane, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_props_table → MUST_OBSERVE [the type and description cell selectors declare overflow-wrap: anywhere; 0 max-height declarations anywhere in the style block; 0 -webkit-line-clamp declarations and 0 text-overflow: ellipsis declarations] / MUST_NOT_OBSERVE [0 white-space: nowrap declarations on data cells; 0 overflow: hidden declarations on cells]
    - NEGATIVE_CONTROL: would fail if ['cells clamp with line-clamp or max-height — the 0-declaration asserts fail', 'long types are pre-truncated in the markup at render time — the overflow-wrap anchor is absent', 'white-space: nowrap pushes content into a clipped overflow — the nowrap assert fails']

**AC-3: CSS-only mobile card mode keyed on data-label attributes**

  GIVEN/WHEN/THEN: GIVEN (RED at start) no PropsTable.astro WHEN the test reads PropsTable.astro and scans its template and scoped styles THEN exactly 1 max-width media query re-flows the table to stacked cards — the thead hidden inside the query, every <td> binding data-label to its column name (4 distinct values Name/Type/Default/Description), and exactly 1 td::before rule carrying content: attr(data-label) restoring the column label per cell — with 0 <script> tags and 0 @media print rules

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/props-table-contract.test.ts · TEST_FUNCTION: REF-002-props-table-mobile-card-mode
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode`
  VERIFICATION_SERVICE: real filesystem read of the authored PropsTable.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only; the rendered 390px stacked-card proof is gate step 11 over REF-009's assembly, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_props_table → MUST_OBSERVE [exactly 1 max-width @media query gating the card mode; every td binds data-label naming its column — 4 distinct values: Name, Type, Default, Description; exactly 1 td::before rule inside the query with content: attr(data-label); exactly 1 thead rule inside the query hiding the header row] / MUST_NOT_OBSERVE [0 <script> tags and 0 customElements.define calls (card mode is CSS-only); 0 @media print rules (print styles are sprint-11 scope)]
    - NEGATIVE_CONTROL: would fail if ['the card mode is JS-driven or a second mobile markup tree — the 0-script assert or single-markup structure fails', 'cells omit data-label — the attr() label-restore rule has no source and the 4-distinct-label assert fails', 'print styles leak in early — the 0 @media print assert fails (sprint-11 scope)']

**AC-4: Null default/description render explicit em-dash cells — columns never dropped**

  GIVEN/WHEN/THEN: GIVEN the real dataset where 133/180 defaults and 107/180 descriptions are null, and (RED at start) no PropsTable.astro WHEN the test reads PropsTable.astro and scans its cell render paths THEN null default and null description each render an explicit em-dash (—) through a null-coalescing expression on the cell content, every row loop body emits all 4 <td> unconditionally, and the component declares 0 conditional cell omission and 0 empty-string cells for null values

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/props-table-contract.test.ts · TEST_FUNCTION: REF-002-props-table-null-em-dash-cells
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells`
  VERIFICATION_SERVICE: real filesystem read of the authored PropsTable.astro source + real registry-items.json import under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan plus real dataset import for the null counts — real file reads only, no rendering, no network, no DB.
  SCENARIO:
    - START_REF authored_props_table → MUST_OBSERVE [1 null-coalescing render path (?? '—' or ternary with '—') covering the default cell and the description cell; the row loop body emits 4 <td> bindings unconditionally; dataset grounding holds: 133/180 defaults null and 107/180 descriptions null — the em-dash path runs on real data] / MUST_NOT_OBSERVE [0 conditional guards that skip a cell when its value is null; 0 empty-string cells rendered for null values (the em-dash is unconditional); 0 rows with null fields (a degenerate dataset where the em-dash path never runs)]
    - NEGATIVE_CONTROL: would fail if ['null values drop the cell or the column — the 4-unconditional-td assert fails', 'null renders an empty string instead of the explicit em-dash marker — the null-coalescing assert fails', 'a guard like {value && <td>} skips falsy cells — the conditional-omission assert fails']

### TEST CRITERIA

- **TC-1** (→AC-1): PropsTable.astro renders exactly 1 <table> with a thead of exactly 4 <th> in order Name/Type/Default/Description and exactly 1 rows-driven loop emitting 1 <tr> per prop, with var(--font-mono) names, var(--muted-foreground) types, and exactly 1 var(--muted) zebra rule. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy`
- **TC-2** (→AC-1): PropsTable.astro contains 0 <script> tags, 0 customElements.define calls, 0 hex literals, and 0 hardcoded prop rows; the dataset grounding confirms 39/39 non-empty props[] with conversation at 5 rows and nearBottomThreshold default '50'. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy`
- **TC-3** (→AC-2): The type and description cell rules declare overflow-wrap: anywhere and the scoped style block carries 0 max-height, 0 -webkit-line-clamp, and 0 text-overflow: ellipsis declarations. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types`
- **TC-4** (→AC-2): The style block carries 0 white-space: nowrap and 0 overflow: hidden declarations on data cells — the 83-char longest type renders in full. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types`
- **TC-5** (→AC-3): Exactly 1 max-width media query hides the thead, re-flows rows to stacked cards, and restores labels through exactly 1 td::before content: attr(data-label) rule over 4 distinct data-label values. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode`
- **TC-6** (→AC-3): The component carries 0 <script> tags, adds 0 new islands, and declares 0 @media print rules — the card mode is CSS-only and print styling is sprint-11 scope. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode`
- **TC-7** (→AC-4): Null default and null description render an explicit em-dash (—) via a null-coalescing path, and the row loop body emits all 4 <td> unconditionally. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells`
- **TC-8** (→AC-4): The component declares 0 conditional guards dropping a cell on null and 0 empty-string cells; the real dataset carries 133 null defaults and 107 null descriptions across 180 rows, so the em-dash path runs on real data. — `pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells`

### READING LIST (max 5)

- apps/docs/src/components/Chip.astro + apps/docs/src/components/Badge.astro [PRIMARY PATTERN] lines all — The prop-driven zero-JS primitive shape this task imitates: interface Props, class:list composition, scoped var(--*)-only styles, zero script.
- tests/sprint-02-shell-hero/primitives.test.ts [PRIMARY PATTERN] lines all — The landed vitest source-scan pattern (real file reads, forbidden-string assertions, style-block extraction) props-table-contract.test.ts imitates.
- apps/docs/src/components/DependencyPanel.astro lines all — The landed dependency table on [item] pages: the closest table analogue (zebra, borders, mono treatment) PropsTable visually aligns with.
- apps/docs/src/data/registry-items.json lines all — The REAL props[] dataset (39/39 non-empty, 180 rows, 133 null defaults, 107 null descriptions, 83-char longest type) — never a fixture copy.
- apps/docs/src/components/Button.astro lines all — The :focus-visible ring + token hover idiom reference for the interactive affordances PropsTable deliberately omits.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/PropsTable.astro (NEW)
- tests/sprint-04-generated-reference/props-table-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/pages/
- scripts/docs-data/
- apps/docs/src/components/islands/
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Prop-driven zero-JS Astro table primitive with scoped var(--*)-only styles; responsive re-flow via data-label + attr() content instead of a second mobile markup tree
- pattern_source: apps/docs/src/components/DependencyPanel.astro (landed table anatomy) + apps/docs/src/components/Chip.astro (prop-driven zero-JS primitive discipline)
- anti-pattern: a second mobile card markup tree or a JS re-render; per-column truncation (line-clamp/max-height) to keep rows short; a hand-curated props copy beside the generated dataset
- references: ["TR-07 component-detail R8 — 'PropsTable (docs): From prebuild ts-morph data; CSS-only mobile card mode'", "TR-07 component-detail mobile frame M5 — 'props as stacked cards … Card-ify via CSS only — no new island'", 'TR-07 hard UI constraints — token-governed styling (no hex literals); accessible table semantics']
- notes: ['Mobile card mode: exactly one max-width media query flips each tr to a block card, hides the thead, and restores the Name/Type/Default/Description labels via td::before content: attr(data-label) — the DOM is identical at every width so chromium-nojs and the crawler see one table', 'Focus-visible: the table exposes 0 focusable elements (zero-JS data display); the global 2px var(--ring) :focus-visible contract is neither invoked nor suppressed', 'Reduced-motion: 0 animated properties declared (instant zebra/hover color swaps only) so 0 prefers-reduced-motion guards are required; any future transition must sit inside @media (prefers-reduced-motion: no-preference)']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ['PropsTable.astro — props {rows: Array<{name: string; type: string; default: string | null; description: string | null}>}: zero-JS 4-column table (thead Name/Type/Default/Description, zebra var(--muted), var(--font-mono) names, var(--muted-foreground) types), null cells as explicit em-dash, CSS-only mobile stacked-card mode via td data-label + attr() content']
- consumes: ["Sprint-01 prebuild props dataset — apps/docs/src/data/registry-items.json props[] (39/39 non-empty, 180 rows, conversation 5 rows, nearBottomThreshold default '50')", 'SHELL-001 tokens: --muted, --muted-foreground, --font-mono, --border, --radius-*']
- boundary_contracts: ["rows derive ONLY from the generated dataset (apps/docs/src/data/registry-items.json props[] — 39/39 non-empty, conversation has 5 rows, nearBottomThreshold default '50')", 'long/mega types render IN FULL with CSS wrap — never truncated, ellipsized, or max-height', 'mobile = stacked cards via CSS only (media-query on data-label attributes)', 'zero JS', 'token-governed styling (var(--*) only, no hex literals; check-tokens passes)', 'null default/description render an explicit em-dash cell, never a dropped column', 'no new islands', 'NO print styles (sprint-11 scope)']

### VERIFICATION GATES

- AC-1: pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy — exit 0
- AC-2: pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types — exit 0
- AC-3: pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode — exit 0
- AC-4: pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells — exit 0
- RED-first: the four -t runs FAIL before authoring (PropsTable.astro absent) — record the RED outputs
- Seeded evidence: captured stdout shows the 4-th/4-td/0-script counts and the dataset grounding (39/39 non-empty props, conversation 5 rows, nearBottomThreshold default '50', 133/107 nulls), not merely exit 0
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/components/PropsTable.astro tests/sprint-04-generated-reference/props-table-contract.test.ts — exit 0 (never pnpm lint; local crash)
- tokens: the AC scans assert 0 raw color literals in PropsTable.astro (the scripts/check-tokens vocabulary) — check-tokens passes over the new component
- Browser ride-along (gated on REF-009 assembly, NOT this task's write surface): FLOW-GEND-34 playwright lane (gate step 6 — props_tables == 39, Name/Type/Default/Description headers, >=1 row, conversation 5 rows) and the 390px stacked-card mobile frame (gate step 11)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: [] · Blocks: ['REF-009']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped component styles consuming var(--*) tokens only — 0 hex, 0 raw color literals
- Zero <script>, zero customElements.define — a zero-JS primitive; the five-island budget is untouched
- Biome-clean via ./node_modules/.bin/biome ci <paths> — never pnpm lint (local crash)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-002",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_props_dataset": {
   "description": "The real registry dataset imported from the working tree at run time: apps/docs/src/data/registry-items.json filtered to type 'registry:component'. Exists at task start (sprint-01 output); RED failure comes from PropsTable.astro being absent.",
   "seed_method": "public_api",
   "records": [
    "39/39 registry:component items carry non-empty props[] — 180 rows total",
    "conversation carries exactly 5 rows; nearBottomThreshold default '50'",
    "133/180 defaults null and 107/180 descriptions null",
    "longest type 83 chars ('((segment: TranscriptionSegmentData, index: number) => React.ReactNode) | undefined'); 2 rows embed newlines"
   ]
  },
  "authored_props_table": {
   "description": "The authored PropsTable.astro read from the real working tree at run time. RED at task start: file absent so every read-based assert fails.",
   "seed_method": "ui_flow",
   "records": [
    "apps/docs/src/components/PropsTable.astro exists with a rows: Array<{name; type; default: string | null; description: string | null}> prop",
    "table anatomy: 1 <table>, thead 4 <th> Name/Type/Default/Description, rows-driven <tr> loop",
    "scoped var(--*)-only styles with 1 max-width media query card mode"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "PropsTable source contract — 4-column table driven by the generated props[] dataset",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file plus a real registry JSON import — real file reads only, no rendering, no network, no DB (the landed primitives.test.ts pattern); rendered table behavior is REF-009's FLOW-GEND-34 lane, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored PropsTable.astro source + real registry-items.json import under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/props-table-contract.test.ts",
   "test_function": "REF-002-props-table-anatomy",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus real dataset import — real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored PropsTable.astro source + real registry-items.json import under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the component is a static stub shell with canned rows — the rows-driven loop and 0-hardcoded-row asserts fail",
      "rows come from a hand-curated second source instead of the generated dataset — the conversation 5-row / nearBottomThreshold '50' grounding diverges",
      "styles are hand-picked hex literals instead of var(--*) references — the 0-hex assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_props_table",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/PropsTable.astro from the real working tree and import the real registry dataset for grounding",
        "assert the table anatomy, rows-driven loop, token typography, zebra rule, zero-JS, and dataset counts"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 <table> with a thead of exactly 4 <th> in order Name, Type, Default, Description",
        "exactly 1 rows-driven loop ({#each rows} or rows.map) emitting 1 <tr> per prop — row count derives from the rows prop",
        "prop-name cells declare font-family: var(--font-mono); type cells declare color: var(--muted-foreground)",
        "exactly 1 zebra rule (tbody tr:nth-child(even) or equivalent) on background var(--muted)",
        "dataset grounding holds: 39/39 items non-empty props[] (180 rows), conversation 5 rows with nearBottomThreshold default '50'"
       ],
       "must_not_observe": [
        "0 <script> tags and 0 customElements.define calls",
        "0 hardcoded prop rows (no literal 'nearBottomThreshold' markup — the dataset drives rows)",
        "0 hex color literals matching #[0-9a-fA-F]{3,8}"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the repo with the sprint-01 prebuild dataset at apps/docs/src/data/registry-items.json (39/39 registry:component items carry non-empty props[], 180 rows) and (RED at start) no PropsTable.astro WHEN the test reads apps/docs/src/components/PropsTable.astro from the real working tree and scans its structure THEN it renders exactly 1 <table> whose thead carries exactly 4 <th> in order Name, Type, Default, Description, exactly 1 rows-driven loop emitting 1 <tr> per prop entry, prop-name cells in var(--font-mono), type cells on var(--muted-foreground), exactly 1 zebra rule on var(--muted), and 0 <script> tags",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Full-fidelity cells — mega types wrap in place, never truncated",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro style block — real file read only; the rendered no-clip proof is REF-009's FLOW-GEND-34/gate-11 lane, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored PropsTable.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/props-table-contract.test.ts",
   "test_function": "REF-002-props-table-full-fidelity-types",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored PropsTable.astro source",
    "negative_control": {
     "would_fail_if": [
      "cells clamp with line-clamp or max-height — the 0-declaration asserts fail",
      "long types are pre-truncated in the markup at render time — the overflow-wrap anchor is absent",
      "white-space: nowrap pushes content into a clipped overflow — the nowrap assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_props_table",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/PropsTable.astro from the real working tree",
        "extract the scoped style block and scan the type/description cell rules"
       ]
      },
      "end_state": {
       "must_observe": [
        "the type and description cell selectors declare overflow-wrap: anywhere",
        "0 max-height declarations anywhere in the style block",
        "0 -webkit-line-clamp declarations and 0 text-overflow: ellipsis declarations"
       ],
       "must_not_observe": [
        "0 white-space: nowrap declarations on data cells",
        "0 overflow: hidden declarations on cells"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real dataset whose longest prop type is 83 chars and whose type/description fields embed newlines in 2 rows, and (RED at start) no PropsTable.astro WHEN the test reads PropsTable.astro and scans its scoped style block THEN the type and description cell rules declare overflow-wrap: anywhere so long content wraps in place, and the style block carries 0 max-height declarations, 0 -webkit-line-clamp declarations, 0 text-overflow: ellipsis declarations, and 0 white-space: nowrap on data cells",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "CSS-only mobile card mode keyed on data-label attributes",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only; the rendered 390px stacked-card proof is gate step 11 over REF-009's assembly, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored PropsTable.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/props-table-contract.test.ts",
   "test_function": "REF-002-props-table-mobile-card-mode",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored PropsTable.astro source",
    "negative_control": {
     "would_fail_if": [
      "the card mode is JS-driven or a second mobile markup tree — the 0-script assert or single-markup structure fails",
      "cells omit data-label — the attr() label-restore rule has no source and the 4-distinct-label assert fails",
      "print styles leak in early — the 0 @media print assert fails (sprint-11 scope)"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_props_table",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/PropsTable.astro from the real working tree",
        "assert the media-query card mode, data-label bindings, and absence of script/print rules"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 max-width @media query gating the card mode",
        "every td binds data-label naming its column — 4 distinct values: Name, Type, Default, Description",
        "exactly 1 td::before rule inside the query with content: attr(data-label)",
        "exactly 1 thead rule inside the query hiding the header row"
       ],
       "must_not_observe": [
        "0 <script> tags and 0 customElements.define calls (card mode is CSS-only)",
        "0 @media print rules (print styles are sprint-11 scope)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN (RED at start) no PropsTable.astro WHEN the test reads PropsTable.astro and scans its template and scoped styles THEN exactly 1 max-width media query re-flows the table to stacked cards — the thead hidden inside the query, every <td> binding data-label to its column name (4 distinct values Name/Type/Default/Description), and exactly 1 td::before rule carrying content: attr(data-label) restoring the column label per cell — with 0 <script> tags and 0 @media print rules",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Null default/description render explicit em-dash cells — columns never dropped",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan plus real dataset import for the null counts — real file reads only, no rendering, no network, no DB.",
   "verification_service": "real filesystem read of the authored PropsTable.astro source + real registry-items.json import under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/props-table-contract.test.ts",
   "test_function": "REF-002-props-table-null-em-dash-cells",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus real dataset import — real file reads only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored PropsTable.astro source + real registry-items.json import under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "null values drop the cell or the column — the 4-unconditional-td assert fails",
      "null renders an empty string instead of the explicit em-dash marker — the null-coalescing assert fails",
      "a guard like {value && <td>} skips falsy cells — the conditional-omission assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_props_table",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/PropsTable.astro and import the real registry dataset",
        "assert the null-coalescing em-dash paths, the unconditional 4-cell row body, and the real null counts"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 null-coalescing render path (?? '—' or ternary with '—') covering the default cell and the description cell",
        "the row loop body emits 4 <td> bindings unconditionally",
        "dataset grounding holds: 133/180 defaults null and 107/180 descriptions null — the em-dash path runs on real data"
       ],
       "must_not_observe": [
        "0 conditional guards that skip a cell when its value is null",
        "0 empty-string cells rendered for null values (the em-dash is unconditional)",
        "0 rows with null fields (a degenerate dataset where the em-dash path never runs)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real dataset where 133/180 defaults and 107/180 descriptions are null, and (RED at start) no PropsTable.astro WHEN the test reads PropsTable.astro and scans its cell render paths THEN null default and null description each render an explicit em-dash (—) through a null-coalescing expression on the cell content, every row loop body emits all 4 <td> unconditionally, and the component declares 0 conditional cell omission and 0 empty-string cells for null values",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "PropsTable.astro renders exactly 1 <table> with a thead of exactly 4 <th> in order Name/Type/Default/Description and exactly 1 rows-driven loop emitting 1 <tr> per prop, with var(--font-mono) names, var(--muted-foreground) types, and exactly 1 var(--muted) zebra rule.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "PropsTable.astro contains 0 <script> tags, 0 customElements.define calls, 0 hex literals, and 0 hardcoded prop rows; the dataset grounding confirms 39/39 non-empty props[] with conversation at 5 rows and nearBottomThreshold default '50'.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-anatomy"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The type and description cell rules declare overflow-wrap: anywhere and the scoped style block carries 0 max-height, 0 -webkit-line-clamp, and 0 text-overflow: ellipsis declarations.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The style block carries 0 white-space: nowrap and 0 overflow: hidden declarations on data cells — the 83-char longest type renders in full.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-full-fidelity-types"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "Exactly 1 max-width media query hides the thead, re-flows rows to stacked cards, and restores labels through exactly 1 td::before content: attr(data-label) rule over 4 distinct data-label values.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "The component carries 0 <script> tags, adds 0 new islands, and declares 0 @media print rules — the card mode is CSS-only and print styling is sprint-11 scope.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-mobile-card-mode"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "Null default and null description render an explicit em-dash (—) via a null-coalescing path, and the row loop body emits all 4 <td> unconditionally.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "The component declares 0 conditional guards dropping a cell on null and 0 empty-string cells; the real dataset carries 133 null defaults and 107 null descriptions across 180 rows, so the em-dash path runs on real data.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/props-table-contract.test.ts -t REF-002-props-table-null-em-dash-cells"
  }
 ]
}
-->

</details>
