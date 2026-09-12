<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-010: /components single owner — trailing no-id matrix section + family install commands (T-GEND-014)

> Status: ⬜ Pending
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 3 · Type: FEATURE · Wave: B
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Give /components its two sprint-04 additions under one owner: the engine-tabbed copyable family add command inside each anchored family section, and the trailing no-id DevClientMatrix section — without disturbing the pinned seven-family grid contracts.

## Why
Seven family sections each carry their engine-tabbed family command; the matrix renders as the trailing no-id section listing the four opt-in items with peers and permissions; components-family-grid.spec.ts stays green untouched; REF-001's dev-client-matrix and site-crawl lanes turn green.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract

## Scope
apps/docs/src/pages/components/index.astro (MODIFY); apps/docs/src/components/InstallCommand.astro (MODIFY); apps/docs/src/components/DevClientMatrix.astro (NEW); tests/sprint-04-generated-reference/components-page-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-010 — required reading for implementer + reviewer)</summary>

TASK: REF-010 — /components single owner — trailing no-id matrix section + family install commands (T-GEND-014)
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 3
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: the matrix section renders after the last family section with no id attribute and no a[data-card] descendants
- MUST: each family command lists its family's itemNames in families.json order as /r/{engine}/{name}.json URLs in ONE add invocation per engine panel
- MUST: the family variant reuses TabGroup + CopyButton with storage-key rnr-engine — the copied text IS the displayed text
- MUST: DevClientMatrix derives every row from dev-client-matrix.json at build (4 rows: enriched-markdown, streamdown, speech-recognition, extended-audio) with peers and ios/android permissions
- MUST: the single-item InstallCommand form used by [item].astro stays byte-compatible in output (sprint-02 lanes depend on it)
- NEVER: never add an eighth anchored section[id], a family-jump nav entry, or any a[data-card] to the matrix section
- NEVER: never emit a short-name, relative, or un-tabbed duplicated engine form anywhere on /components
- NEVER: never add an island, client: directive beyond the reused tab-group/copy-button pair, or a <script> in the two components
- NEVER: never modify tests/sprint-03-family-browse/components-family-grid.spec.ts or any other existing test — declare under supersedes instead
- STRICTLY: strictly scope writes to the four write_allowed paths
- STRICTLY: strictly verify unit ACs with pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t <TOKEN>; the riding browser proofs gate via REF-001's two spec greps
- STRICTLY: strictly lint via ./node_modules/.bin/biome ci <paths> — pnpm lint crashes locally

### DONE WHEN

- [ ] AC 1: Trailing no-id DevClientMatrix mount on /components
- [ ] AC 2: InstallCommand family variant — one multi-URL add invocation per engine panel
- [ ] AC 3: index.astro source contract — family command per anchored section, join untouched
- [ ] AC 4: Sprint-03 grid lane stays green untouched — the stop-and-declare boundary
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: Trailing no-id DevClientMatrix mount on /components**

  GIVEN/WHEN/THEN: GIVEN the working tree with REF-006's DataTable and REF-007's dev-client-matrix.json landed WHEN the unit source-contract test reads index.astro and DevClientMatrix.astro (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract) THEN index.astro composes DevClientMatrix after the family map inside a section carrying no id attribute with no a[data-card] in the component

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/components-page-contract.test.ts · TEST_FUNCTION: REF-010-matrix-section-contract
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract`
  VERIFICATION_SERVICE: real filesystem read of index.astro, DevClientMatrix.astro, and dev-client-matrix.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored page and component sources plus committed data reads — real file reads only, no rendering, no network, no DB (FAM-002 precedent); rendered proof rides REF-001's dev-client-matrix lane.
  SCENARIO:
    - START_REF authored_components_page → MUST_OBSERVE [the DevClientMatrix composition appears after componentFamilies.map in source order (1 mount); its wrapping section carries 0 id attributes and the component emits 0 a[data-card] elements; DevClientMatrix imports DataTable and reads dev-client-matrix.json (2 consumption anchors); row data derives from the 4-entry dataset (names, peers, permissions joined from the JSON)] / MUST_NOT_OBSERVE [0 id-less requirement violated — any id on the matrix section fails; a hand-rolled <table> bypassing DataTable in DevClientMatrix]
    - NEGATIVE_CONTROL: would fail if ['the matrix section carries an id — the no-id assert fails (an eighth anchored section would trip the sprint-03 count contracts)', 'DevClientMatrix hand-rolls a table instead of consuming DataTable — the import assert fails', 'the component renders cards instead of rows — an a[data-card] appears']

**AC-2: InstallCommand family variant — one multi-URL add invocation per engine panel**

  GIVEN/WHEN/THEN: GIVEN the existing single-item InstallCommand whose copied text equals its displayed text WHEN the unit source-contract test reads InstallCommand.astro (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant) THEN the component accepts a family items list and renders one add invocation per engine panel listing every item's /r/{engine}/{item}.json in families.json order through the reused TabGroup + CopyButton

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/components-page-contract.test.ts · TEST_FUNCTION: REF-010-family-command-variant
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant`
  VERIFICATION_SERVICE: real filesystem read of InstallCommand.astro + pure command derivation over families.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan plus a pure command-string build over the real families.json — real file reads and pure function execution, no rendering, no network, no DB; rendered copy proof rides the browser lanes.
  SCENARIO:
    - START_REF real_components_inputs → MUST_OBSERVE [each engine panel's command is 1 'npx @react-native-reusables/cli@latest add' invocation naming every family item URL; the conversation family command lists 3 URLs matching https://rnraielements.com/r/{engine}/{name}.json in families.json order; the tool family command lists 11 URLs; 0 short-name forms and 0 un-tabbed duplicate forms in the component source] / MUST_NOT_OBSERVE [0 absolute URLs (a short or relative form sneaking in); a per-item add invocation (11 invocations instead of 1 for tool)]
    - NEGATIVE_CONTROL: would fail if ['the family form emits short-name or relative URLs — the absolute-URL assert fails', 'each item becomes its own add invocation — the one-invocation-per-engine assert fails', 'an un-tabbed duplicate engine form appears — the single-form-per-engine assert fails']

**AC-3: index.astro source contract — family command per anchored section, join untouched**

  GIVEN/WHEN/THEN: GIVEN the landed FAM-003 grid with its componentFamilies join, jump nav, and mount slot WHEN the unit source-contract test reads index.astro (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract) THEN each of the seven anchored family sections composes the InstallCommand family variant while the section count stays derived from componentFamilies alone

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/components-page-contract.test.ts · TEST_FUNCTION: REF-010-components-page-contract
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract`
  VERIFICATION_SERVICE: real filesystem read of index.astro + the families.json join under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored page plus the real families.json join — real file reads only, no rendering, no network, no DB; rendered proof rides the browser lanes.
  SCENARIO:
    - START_REF authored_components_page → MUST_OBSERVE [section id bindings derive solely from componentFamilies.map (1 binding site, 7 rendered sections); the InstallCommand family variant composes inside the family map (1 composition site per rendered section); the family-jump nav, family-grid-slot div, and LedgerFilter mount are retained (3 structural anchors); 0 hardcoded family id literals in the page source] / MUST_NOT_OBSERVE [0 new anchored sections beyond the derived seven; 0 modifications to the jump nav anchor binding]
    - NEGATIVE_CONTROL: would fail if ['an eighth anchored section[id] appears — the section-count assert fails against the derived seven', 'the family command lands outside the family map — the in-section composition assert fails', 'the componentFamilies join is edited or a family id is hardcoded — the derivation asserts fail']

**AC-4: Sprint-03 grid lane stays green untouched — the stop-and-declare boundary**

  GIVEN/WHEN/THEN: GIVEN the task declared supersedes: [] and tests/sprint-03-family-browse/components-family-grid.spec.ts pins the seven-family grid at its sprint-03 merge commit WHEN the unit boundary test checks the working tree (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched) THEN the sprint-03 grid spec is byte-unchanged against its merge-commit blob and still passes its locked grep

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/components-page-contract.test.ts · TEST_FUNCTION: REF-010-grid-lane-untouched
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched`
  VERIFICATION_SERVICE: real git status/diff subprocesses over the sprint-03 lane + filesystem read under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Real git byte-comparisons (status, diff against the merge-commit blob) plus a source-scan of the untouched lane — real subprocess and file reads only, no rendering, no network; the full browser re-run rides the verification gates.
  SCENARIO:
    - START_REF authored_components_page → MUST_OBSERVE [git status --porcelain over tests/sprint-03-family-browse/ prints 0 lines; git diff <merge>..HEAD -- the grid spec is empty (byte-matches its sprint-03 merge-commit blob); the grid spec still asserts componentFamilies.length sections and components.length cards (2 derived counts)] / MUST_NOT_OBSERVE [0 tolerance edits to the grid spec (any non-empty diff fails); a deleted or relaxed assertion in the sprint-03 lane]
    - NEGATIVE_CONTROL: would fail if ['the grid spec is edited to tolerate the matrix section — the merge-commit blob diff is non-empty', 'an a[data-card] or section[id] leaks into the matrix mount — the grid lane itself would fail its seven-section/39-card counts', 'the task silently widens scope instead of stopping and declaring supersedes — a dirty git status line appears under the lane']

### TEST CRITERIA

- **TC-1** (→AC-1): index.astro composes DevClientMatrix after the family map in a section carrying 0 id attributes with 0 a[data-card] elements. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract`
- **TC-2** (→AC-1): DevClientMatrix imports DataTable and derives its 4 rows (names, peers, ios/android permissions) from dev-client-matrix.json. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract`
- **TC-3** (→AC-2): Each engine panel's family command is 1 add invocation listing every family item's /r/{engine}/{item}.json URL (conversation 3, tool 11) in families.json order. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant`
- **TC-4** (→AC-2): InstallCommand's family variant reuses TabGroup + CopyButton with 0 short-name and 0 un-tabbed duplicate forms. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant`
- **TC-5** (→AC-3): section id bindings derive solely from componentFamilies.map (7 rendered sections) with the jump nav, mount slot, and LedgerFilter retained. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract`
- **TC-6** (→AC-4): git status --porcelain over tests/sprint-03-family-browse/ prints 0 lines and git diff <merge>..HEAD -- the grid spec is empty. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched`
- **TC-7** (→AC-2): The single-item InstallCommand form used by [item].astro produces byte-identical output to its pre-task form. — `pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant`

### READING LIST (max 5)

- apps/docs/src/pages/components/index.astro [PRIMARY PATTERN] lines all — the componentFamilies join, anchored sections, jump nav, and mount slot the trailing section and family commands must not disturb.
- apps/docs/src/components/InstallCommand.astro [extension point] lines all — the single-item engine-tabbed form the family variant extends beside; PANELS/installCommand shape to mirror.
- tests/sprint-03-family-browse/components-family-grid.spec.ts [must-stay-green] lines all — the lane whose seven-section/39-card selectors any id'd eighth section would trip; its merge-commit blob is the byte baseline.
- tests/sprint-03-family-browse/page-contract.test.ts [count contracts] lines 132-215 — the source-contract asserting the derived sections and structural anchors REF-010 must keep satisfied.
- apps/docs/src/data/dev-client-matrix.json [data] lines all — REF-007's four-entry dataset (names, peers, permissions) DevClientMatrix renders.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/pages/components/index.astro (MODIFY)
- apps/docs/src/components/InstallCommand.astro (MODIFY)
- apps/docs/src/components/DevClientMatrix.astro (NEW)
- tests/sprint-04-generated-reference/components-page-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/components/islands/
- packages/registry/
- apps/docs/src/data/families.json

### CODE PATTERN
- pattern: extend the single /components owner in place: compose provided components, derive from committed data, reuse the existing tab/copy island pair, add zero anchors
- pattern_source: apps/docs/src/pages/components/index.astro (FAM-003) + apps/docs/src/components/InstallCommand.astro (SHELL-004)
- anti-pattern: an eighth anchored section, a hand-rolled matrix table, a forked tab/copy island, short-name or un-tabbed duplicated engine forms, silent edits to existing lanes
- references: ['T-GEND-014 — family install copy: 7 family pages expose a copyable command containing https://rnraielements.com/r/', 'T-GEND-016/020 — crawl purity and the four-entry matrix the riding lanes assert', "FAM-003's seven-family grid — the pinned structure the no-id trailing section exists to protect"]
- notes: ["Runs wave B after REF-006 (DataTable) and REF-007 (dataset); greens REF-001's dev-client-matrix.spec.ts and the T-GEND-014 clauses of site-crawl.spec.ts.", "The no-id rule is load-bearing: an eighth anchored section would trip sprint-01/03 pinned count contracts; the anchor arrives with sprint-05's /docs/installation relocation.", 'If any existing test would need touching, STOP and declare it under supersedes — never edit silently.']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-INST-01']
- provides: ['DevClientMatrix.astro (NEW) consuming DataTable (REF-006) + dev-client-matrix.json (REF-007) + Badge, mounted as a TRAILING section with NO id attribute on /components', "InstallCommand's family variant: one engine-tabbed add invocation listing every family item's /r/{engine}/{item}.json, mounted inside each of the seven anchored family sections adding no new anchors", "tests/sprint-04-generated-reference/components-page-contract.test.ts — the task's own unit source-contract file", "GREEN proofs for REF-001's dev-client-matrix.spec.ts and the T-GEND-014 clauses of site-crawl.spec.ts"]
- consumes: ['dev-client-matrix.json (REF-007)', 'DataTable.astro (REF-006)', 'families.json itemNames + the componentFamilies join on index.astro', 'rnr-tab-group + rnr-copy-button islands (reused, not forked)']
- boundary_contracts: ['NO new section[id] on /components (C1 — the seven anchored family sections and their pinned count contracts stay untouched; matrix section carries NO id and NO a[data-card])', "engine-tabbed multi-URL family add command (one add invocation listing every family item's /r/{engine}/{item}.json) inside each anchored family section, adding no new anchors", 'no short-name or un-tabbed duplicated engine forms (T-GEND-016)', 'zero new islands (reuse rnr-tab-group + rnr-copy-button)', 'DevClientMatrix.astro consumes DataTable (REF-006) + dev-client-matrix.json (REF-007) + Badge', "T-GEND-014/020 assertions ride REF-001's dev-client-matrix.spec.ts + site-crawl.spec.ts lanes and gate step 1", 'components-family-grid.spec.ts must stay GREEN UNTOUCHED — the no-id trailing section exists precisely to avoid touching it; touching any existing test means STOP and declare it under supersedes']

### VERIFICATION GATES

- AC-1/TC-1..2: pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract — exit 0
- AC-2/TC-3..4/TC-7: pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant — exit 0
- AC-3/TC-5: pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract — exit 0
- AC-4/TC-6: pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched — exit 0
- riding browser proof (matrix): pnpm playwright test tests/sprint-04-generated-reference/dev-client-matrix.spec.ts --grep T-GEND-020-dev-client-matrix — exit 0, 4 items with non-empty peers and permissions
- riding browser proof (crawl): pnpm playwright test tests/sprint-04-generated-reference/site-crawl.spec.ts --grep T-GEND-016-site-crawl — exit 0, 0 short-name forms
- grid regression: pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families — exit 0 unchanged
- RED-first: the four unit tokens fail before authoring (DevClientMatrix absent, family variant absent) — record the RED outputs
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/pages/components apps/docs/src/components/DevClientMatrix.astro apps/docs/src/components/InstallCommand.astro tests/sprint-04-generated-reference/components-page-contract.test.ts — exit 0 (never pnpm lint)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: ['REF-006', 'REF-007'] · Blocks: ['REF-011', 'sprint-09']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Zero new islands; reuse rnr-tab-group + rnr-copy-button — copied text IS displayed text
- Scoped var(--*)-token styles only; data-derived markup, never hardcoded family or matrix literals
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-010",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_components_inputs": {
   "description": "The real committed inputs read at module scope.",
   "seed_method": "public_api",
   "records": [
    "apps/docs/src/data/families.json: 7 component families (conversation 3, message 7, prompt-input 6, reasoning 7, sources 4, suggestion 1, tool 11)",
    "apps/docs/src/data/dev-client-matrix.json (REF-007): exactly 4 entries — enriched-markdown, streamdown, speech-recognition, extended-audio — non-empty peers[] + permissions{ios[],android[]}",
    "registry-items.json: 39 registry:component names the family URLs enumerate"
   ]
  },
  "authored_components_page": {
   "description": "The working-tree index.astro, InstallCommand.astro, and DevClientMatrix.astro read by the unit source-contract file, plus the sprint-03 grid spec's committed blob as the byte baseline. RED at task start: DevClientMatrix.astro is absent and the family command variant does not exist.",
   "seed_method": "ui_flow",
   "records": [
    "index.astro composes DevClientMatrix after the family map with a section carrying no id",
    "InstallCommand.astro declares the family/items variant beside the untouched single-item form",
    "tests/sprint-03-family-browse/components-family-grid.spec.ts byte-matches its sprint-03 merge-commit blob"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "Trailing no-id DevClientMatrix mount on /components",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored page and component sources plus committed data reads — real file reads only, no rendering, no network, no DB (FAM-002 precedent); rendered proof rides REF-001's dev-client-matrix lane.",
   "verification_service": "real filesystem read of index.astro, DevClientMatrix.astro, and dev-client-matrix.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/components-page-contract.test.ts",
   "test_function": "REF-010-matrix-section-contract",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over authored sources — real file reads only; rendered proof rides REF-001's dev-client-matrix lane.",
    "verification_service": "real filesystem read of index.astro, DevClientMatrix.astro, and dev-client-matrix.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the matrix section carries an id — the no-id assert fails (an eighth anchored section would trip the sprint-03 count contracts)",
      "DevClientMatrix hand-rolls a table instead of consuming DataTable — the import assert fails",
      "the component renders cards instead of rows — an a[data-card] appears"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_components_page",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read index.astro and DevClientMatrix.astro from the working tree",
        "assert the trailing position, the no-id section wrapper, the DataTable import, and the dataset-derived rows"
       ]
      },
      "end_state": {
       "must_observe": [
        "the DevClientMatrix composition appears after componentFamilies.map in source order (1 mount)",
        "its wrapping section carries 0 id attributes and the component emits 0 a[data-card] elements",
        "DevClientMatrix imports DataTable and reads dev-client-matrix.json (2 consumption anchors)",
        "row data derives from the 4-entry dataset (names, peers, permissions joined from the JSON)"
       ],
       "must_not_observe": [
        "0 id-less requirement violated — any id on the matrix section fails",
        "a hand-rolled <table> bypassing DataTable in DevClientMatrix"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the working tree with REF-006's DataTable and REF-007's dev-client-matrix.json landed WHEN the unit source-contract test reads index.astro and DevClientMatrix.astro (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract) THEN index.astro composes DevClientMatrix after the family map inside a section carrying no id attribute with no a[data-card] in the component",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "InstallCommand family variant — one multi-URL add invocation per engine panel",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan plus a pure command-string build over the real families.json — real file reads and pure function execution, no rendering, no network, no DB; rendered copy proof rides the browser lanes.",
   "verification_service": "real filesystem read of InstallCommand.astro + pure command derivation over families.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/components-page-contract.test.ts",
   "test_function": "REF-010-family-command-variant",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus pure command-string derivation over real data — no rendering, no network, no DB.",
    "verification_service": "real filesystem read of InstallCommand.astro + pure command derivation over families.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the family form emits short-name or relative URLs — the absolute-URL assert fails",
      "each item becomes its own add invocation — the one-invocation-per-engine assert fails",
      "an un-tabbed duplicate engine form appears — the single-form-per-engine assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_components_inputs",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read InstallCommand.astro and assert the family variant composes the reused TabGroup + CopyButton pair",
        "derive the conversation family's command (3 items: context, conversation, thread) and the tool family's (11 items) through the variant's builder"
       ]
      },
      "end_state": {
       "must_observe": [
        "each engine panel's command is 1 'npx @react-native-reusables/cli@latest add' invocation naming every family item URL",
        "the conversation family command lists 3 URLs matching https://rnraielements.com/r/{engine}/{name}.json in families.json order",
        "the tool family command lists 11 URLs",
        "0 short-name forms and 0 un-tabbed duplicate forms in the component source"
       ],
       "must_not_observe": [
        "0 absolute URLs (a short or relative form sneaking in)",
        "a per-item add invocation (11 invocations instead of 1 for tool)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the existing single-item InstallCommand whose copied text equals its displayed text WHEN the unit source-contract test reads InstallCommand.astro (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant) THEN the component accepts a family items list and renders one add invocation per engine panel listing every item's /r/{engine}/{item}.json in families.json order through the reused TabGroup + CopyButton",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "index.astro source contract — family command per anchored section, join untouched",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored page plus the real families.json join — real file reads only, no rendering, no network, no DB; rendered proof rides the browser lanes.",
   "verification_service": "real filesystem read of index.astro + the families.json join under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/components-page-contract.test.ts",
   "test_function": "REF-010-components-page-contract",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the authored page plus the real families.json join — real file reads only.",
    "verification_service": "real filesystem read of index.astro + the families.json join under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "an eighth anchored section[id] appears — the section-count assert fails against the derived seven",
      "the family command lands outside the family map — the in-section composition assert fails",
      "the componentFamilies join is edited or a family id is hardcoded — the derivation asserts fail"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_components_page",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read index.astro from the working tree",
        "count section id bindings and locate the InstallCommand composition inside the family map",
        "assert the componentFamilies join, jump nav, and mount slot survive structurally"
       ]
      },
      "end_state": {
       "must_observe": [
        "section id bindings derive solely from componentFamilies.map (1 binding site, 7 rendered sections)",
        "the InstallCommand family variant composes inside the family map (1 composition site per rendered section)",
        "the family-jump nav, family-grid-slot div, and LedgerFilter mount are retained (3 structural anchors)",
        "0 hardcoded family id literals in the page source"
       ],
       "must_not_observe": [
        "0 new anchored sections beyond the derived seven",
        "0 modifications to the jump nav anchor binding"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the landed FAM-003 grid with its componentFamilies join, jump nav, and mount slot WHEN the unit source-contract test reads index.astro (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract) THEN each of the seven anchored family sections composes the InstallCommand family variant while the section count stays derived from componentFamilies alone",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Sprint-03 grid lane stays green untouched — the stop-and-declare boundary",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Real git byte-comparisons (status, diff against the merge-commit blob) plus a source-scan of the untouched lane — real subprocess and file reads only, no rendering, no network; the full browser re-run rides the verification gates.",
   "verification_service": "real git status/diff subprocesses over the sprint-03 lane + filesystem read under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/components-page-contract.test.ts",
   "test_function": "REF-010-grid-lane-untouched",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Real git byte-comparisons plus a source-scan of the untouched lane — real subprocess and file reads only.",
    "verification_service": "real git status/diff subprocesses over the sprint-03 lane + filesystem read under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the grid spec is edited to tolerate the matrix section — the merge-commit blob diff is non-empty",
      "an a[data-card] or section[id] leaks into the matrix mount — the grid lane itself would fail its seven-section/39-card counts",
      "the task silently widens scope instead of stopping and declaring supersedes — a dirty git status line appears under the lane"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_components_page",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "run git status --porcelain over tests/sprint-03-family-browse/",
        "run git diff <sprint-03 merge commit>..HEAD -- tests/sprint-03-family-browse/components-family-grid.spec.ts and read the diff body",
        "read the grid spec and confirm its pinned selectors and dataset-derived counts are intact"
       ]
      },
      "end_state": {
       "must_observe": [
        "git status --porcelain over tests/sprint-03-family-browse/ prints 0 lines",
        "git diff <merge>..HEAD -- the grid spec is empty (byte-matches its sprint-03 merge-commit blob)",
        "the grid spec still asserts componentFamilies.length sections and components.length cards (2 derived counts)"
       ],
       "must_not_observe": [
        "0 tolerance edits to the grid spec (any non-empty diff fails)",
        "a deleted or relaxed assertion in the sprint-03 lane"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the task declared supersedes: [] and tests/sprint-03-family-browse/components-family-grid.spec.ts pins the seven-family grid at its sprint-03 merge commit WHEN the unit boundary test checks the working tree (pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched) THEN the sprint-03 grid spec is byte-unchanged against its merge-commit blob and still passes its locked grep",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "index.astro composes DevClientMatrix after the family map in a section carrying 0 id attributes with 0 a[data-card] elements.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "DevClientMatrix imports DataTable and derives its 4 rows (names, peers, ios/android permissions) from dev-client-matrix.json.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-matrix-section-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Each engine panel's family command is 1 add invocation listing every family item's /r/{engine}/{item}.json URL (conversation 3, tool 11) in families.json order.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "InstallCommand's family variant reuses TabGroup + CopyButton with 0 short-name and 0 un-tabbed duplicate forms.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "section id bindings derive solely from componentFamilies.map (7 rendered sections) with the jump nav, mount slot, and LedgerFilter retained.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-components-page-contract"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "git status --porcelain over tests/sprint-03-family-browse/ prints 0 lines and git diff <merge>..HEAD -- the grid spec is empty.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-grid-lane-untouched"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "The single-item InstallCommand form used by [item].astro produces byte-identical output to its pre-task form.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/components-page-contract.test.ts -t REF-010-family-command-variant"
  }
 ]
}
-->

</details>
