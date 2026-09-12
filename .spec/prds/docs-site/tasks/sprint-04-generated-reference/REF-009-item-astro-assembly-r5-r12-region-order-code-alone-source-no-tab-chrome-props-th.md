<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-009: [item].astro assembly — R5–R12 region order, Code-alone source (no tab chrome), props/theming/usage/seams/QR/pager + region-contract re-pins

> Status: ⬜ Pending
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 5 · Type: FEATURE · Wave: C
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Assemble the sprint-04 TR-07 anatomy on [item].astro — R5–R12 region order with the Code view standing alone (no tab chrome), byte-matched to the served registry JSON — consuming the wave-A primitives and REF-008's derived fields, and re-pin the two existing region-contract tests in-commit.

## Why
All 39 generated pages render install→source→props→props-adjacent theming/usage with the full anatomy; REF-001's seven owned flow specs turn green under all three projects (gates below); the Code view byte-matches curl of /r/nativewind/{item}.json; the four unit tokens and both re-pinned contracts pass.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract

## Scope
apps/docs/src/pages/components/[item].astro (MODIFY); tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY); tests/sprint-03-family-browse/page-contract.test.ts (MODIFY); tests/sprint-04-generated-reference/item-page-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-009 — required reading for implementer + reviewer)</summary>

TASK: REF-009 — [item].astro assembly — R5–R12 region order, Code-alone source (no tab chrome), props/theming/usage/seams/QR/pager + region-contract re-pins
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 5
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: top-level section[data-section] order across all 39 pages: install, source, props, theming, usage (dependencies renders between install and source as the data-verbatim panel it is today)
- MUST: the source region keeps the existing sourceFiles mapping with the one-line {engine}→nativewind substitution byte-identical — the spec's compare against served /r/nativewind/{item}.json is the oracle
- MUST: the QrPanel aside consumes item.qrDeepLink from the 16-key dataset; the Layout call gains a description binding carrying item.metaDescription
- MUST: the seam callouts render from REF-004's build-time seam map for exactly the ten seam-user items (renderMarkdown: message, reasoning, context; TextClassContext: message, prompt-input, tool, plan, queue, commit, terminal, environment-variables)
- MUST: the re-pins of component-page.spec.ts (GEND-14/15 bodies extended to the new regions) and page-contract.test.ts (sha256 hashes over the extended bodies) land in the same commit as the page change
- NEVER: never add a Preview|Code TabGroup, a preview-panel element, or placeholder/coming-soon text in the source region
- NEVER: never add an island, client: directive, or <script> to [item].astro
- NEVER: never restyle or fork PropsTable/CodeBlock/ThemingNote/UsageSnippet/Callout/QrPanel — consume them as provided
- NEVER: never touch apps/docs/src/data/, packages/registry/, scripts/docs-data/, or island-budget.test.ts
- STRICTLY: strictly scope writes to the four write_allowed paths; the primitives belong to REF-002..005 and the specs to REF-001
- STRICTLY: strictly verify every AC/TC with pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t <TOKEN>; the locked playwright run_cmds appear only in verification_gates
- STRICTLY: strictly lint via ./node_modules/.bin/biome ci <paths> — pnpm lint crashes locally

### DONE WHEN

- [ ] AC 1: [item].astro source contract — R5–R12 region assembly, metaDescription binding, zero new islands
- [ ] AC 2: Code-alone source region — byte-discipline mapping preserved, no clipping
- [ ] AC 3: Seams, QR, and pager composition — seam-map consumption with in-family navigation retained
- [ ] AC 4: Region-contract re-pins land in-commit — extend never delete
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: [item].astro source contract — R5–R12 region assembly, metaDescription binding, zero new islands**

  GIVEN/WHEN/THEN: GIVEN the working tree with REF-002..005 primitives and REF-008's 16-key dataset landed WHEN the unit source-contract test reads apps/docs/src/pages/components/[item].astro (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract) THEN the template composes the chip row, install as first content section, DependencyPanel, the Code-alone source region, PropsTable, ThemingNote, UsageSnippet, the QrPanel aside, and the family pager in source order with 0 tab-chrome elements and 0 island directives in the file

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/item-page-contract.test.ts · TEST_FUNCTION: REF-009-item-page-region-contract
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract`
  VERIFICATION_SERVICE: real filesystem read of the authored [item].astro and registry-items.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored .astro file plus committed data reads — real file reads only, no runtime or external service (FAM-002 precedent); rendered proof rides REF-001's flow specs in verification_gates.
  SCENARIO:
    - START_REF authored_item_page → MUST_OBSERVE [imports naming PropsTable, CodeBlock, ThemingNote, UsageSnippet, Callout, QrPanel (6 primitive imports); section[data-section] bindings for install, source, props, theming, usage appear in that source order (5 region markers); 1 Layout description binding carrying item.metaDescription (conversation's value starts with the literal 'Conversation — '); 0 occurrences of 'client:', '<script', 'data-preview-panel', and 'coming soon|placeholder' strings] / MUST_NOT_OBSERVE [0 Preview|Code tab chrome elements in the source region; 0 hand-derived qrDeepLink or metaDescription strings in the template]
    - NEGATIVE_CONTROL: would fail if ['the page is a static stub — the 6 primitive imports and region bindings are absent', 'a Preview|Code TabGroup or placeholder text is added in the source region (C4 violation)', 'qrDeepLink/metaDescription are hardcoded in the template instead of consumed from the dataset']

**AC-2: Code-alone source region — byte-discipline mapping preserved, no clipping**

  GIVEN/WHEN/THEN: GIVEN the current [item].astro sourceFiles mapping whose {engine}→nativewind substitution keeps the Code view byte-identical to served /r/nativewind/{item}.json WHEN the unit source-contract test scans the redesigned source region (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region) THEN the region maps item.sourceFiles verbatim through the unchanged substitution with one figure per file and 0 clipping declarations in its styles

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/item-page-contract.test.ts · TEST_FUNCTION: REF-009-code-alone-region
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region`
  VERIFICATION_SERVICE: real filesystem read of [item].astro + registry-items.json sourceFiles under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan plus dataset count derivation — real file reads only, no rendering, no network; the rendered byte-match proof is REF-001's FLOW-GEND-35 spec in verification_gates.
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE [exactly 1 occurrence of the substitution expression file.text.split('{engine}').join(DEFAULT_ENGINE) with DEFAULT_ENGINE == 'nativewind'; 1 .map over item.sourceFiles emitting exactly 1 <figure> per file, so figures == sourceFiles.length holds for 39/39 items at test time; 0 max-height declarations and 0 overflow:hidden rules in the source-region styles] / MUST_NOT_OBSERVE [0 substitution expressions (the byte oracle is broken); a filter or slice applied to sourceFiles (per-file drops)]
    - NEGATIVE_CONTROL: would fail if ['the mapping filters, renumbers, or drops files — the one-figure-per-file count assert fails', 'the substitution line is edited or deleted — the split/join occurrence count leaves 1', 'a max-height or overflow-clipping rule is added — the 0-clipping assert fails']

**AC-3: Seams, QR, and pager composition — seam-map consumption with in-family navigation retained**

  GIVEN/WHEN/THEN: GIVEN REF-004's committed seam map naming ten seam-user items and the current within-family pager math WHEN the unit source-contract test scans the composition (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager) THEN the template renders Callout from the seam map for seam-user items, binds the QrPanel aside to item.qrDeepLink, and retains the prev/next family pager unchanged

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/item-page-contract.test.ts · TEST_FUNCTION: REF-009-seams-qr-pager
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager`
  VERIFICATION_SERVICE: real filesystem read of [item].astro + the seam map + families.json under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored template and the committed seam map — real file reads only, no runtime or external service; rendered proof rides REF-001's flow specs.
  SCENARIO:
    - START_REF authored_item_page → MUST_OBSERVE [the seam map covers 10 item names across 2 seam kinds (renderMarkdown: message, reasoning, context; TextClassContext: message, prompt-input, tool, plan, queue, commit, terminal, environment-variables); 1 QrPanel composition binding item.qrDeepLink; the pager retains its family-index modulo expressions (1 prev + 1 next) over family.itemNames] / MUST_NOT_OBSERVE [0 seam callout compositions (map unconsumed); 0 pager hrefs derived outside the family member list]
    - NEGATIVE_CONTROL: would fail if ['the callouts are a hardcoded per-page list instead of derived from the seam map — the map join is absent', 'the QrPanel binding omits item.qrDeepLink — the binding count is 0', 'the pager math is edited to walk the global item list — the family-index modulo expressions are deleted']

**AC-4: Region-contract re-pins land in-commit — extend never delete**

  GIVEN/WHEN/THEN: GIVEN the extended [item].astro and the two existing region-contract tests holding sprint-03-era assertions and sha256 pins WHEN the unit re-pin test executes (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins) THEN component-page.spec.ts's GEND-14/15 bodies assert the five-region anatomy and page-contract.test.ts's sha256 pins match the extended bodies with all pre-existing chip/install/source/pager assertions retained

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/item-page-contract.test.ts · TEST_FUNCTION: REF-009-spec-repins
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins`
  VERIFICATION_SERVICE: real filesystem read + sha256 over the re-pinned spec sources under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the re-pinned test files — real file reads and hash comparisons only, no runtime or external service (the FIX-FAM-005-1 mirror).
  SCENARIO:
    - START_REF authored_item_page → MUST_OBSERVE [the GEND-14 body asserts 5 region markers (install, source, props, theming, usage); retained selectors: data-chip, section[data-section="install"], source pre code, pager nav (4 legacy anchors); page-contract.test.ts's 2 sha256 pins equal hashes computed over the extended bodies at commit time] / MUST_NOT_OBSERVE [0 deleted legacy assertions in the diff (extend never delete); a stale hash pin mismatching the extended body]
    - NEGATIVE_CONTROL: would fail if ['the re-pin deletes a sprint-02/03 assertion (chip/install/source/pager) — the retained-assertion scan fails', 'page-contract.test.ts still hashes the unchanged sprint-03 bodies — the sha256 comparison fails (stale pin)', 'the page change and the re-pin land in separate commits — the same-commit check fails']

### TEST CRITERIA

- **TC-1** (→AC-1): [item].astro composes the 6 primitive imports with 5 region markers in order and 0 tab-chrome/island/placeholder occurrences. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract`
- **TC-2** (→AC-1): Exactly 1 Layout description binding carries item.metaDescription (conversation's value starts with the literal 'Conversation — '). — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract`
- **TC-3** (→AC-2): The source region retains exactly 1 substitution expression (split('{engine}').join('nativewind')) with figures == sourceFiles.length for 39/39 items. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region`
- **TC-4** (→AC-2): The source-region styles declare 0 max-height and 0 overflow:hidden rules. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region`
- **TC-5** (→AC-3): The seam map's 10 item names across 2 seam kinds gate 1 Callout composition site in the template. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager`
- **TC-6** (→AC-3): Exactly 1 QrPanel composition binds item.qrDeepLink beside the Code view. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager`
- **TC-7** (→AC-3): The pager retains its 2 family-index modulo expressions (1 prev + 1 next) over family.itemNames. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager`
- **TC-8** (→AC-4): The re-pinned specs assert the 5-region anatomy, retain the 4 legacy selector anchors, and carry 2 matching sha256 pins in the page change's commit. — `pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins`

### READING LIST (max 5)

- apps/docs/src/pages/components/[item].astro [PRIMARY PATTERN] lines all — the page being redesigned: current region map, the one-line {engine}→nativewind byte-substitution to preserve, the family pager math, the Layout call the metaDescription binding joins.
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts [lock] lines 96-250 — the FLOW-GEND-14/15 bodies and FUSE-07 block this task re-pins to the five-region anatomy.
- tests/sprint-03-family-browse/page-contract.test.ts [re-pin pattern] lines 82-130 — the sha256-pin mechanism (region() + hash equality) REF-009 mirrors per FIX-FAM-005-1.
- tests/sprint-03-family-browse/FAM-002-sectionheader-componentcard-clamp.md [house example] — the unit source-contract file precedent item-page-contract.test.ts imitates.
- .spec/prds/docs-site/tasks/sprint-04-generated-reference/human-flows.json [lock] lines all — the seven byte-frozen run_cmds carried in verification_gates as this task's green proofs.

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/pages/components/[item].astro (MODIFY)
- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts (MODIFY)
- tests/sprint-03-family-browse/page-contract.test.ts (MODIFY)
- tests/sprint-04-generated-reference/item-page-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/components/islands/
- apps/docs/src/data/
- packages/registry/
- scripts/docs-data/
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts

### CODE PATTERN
- pattern: one getStaticPaths page composing provided primitives in TR-07 region order; dataset-derived frontmatter; byte-preserving source mapping; zero-JS template — with flow proofs referenced only as verification gates
- pattern_source: apps/docs/src/pages/components/[item].astro (SHELL-008) extended the way FAM-003 extended the FUSE-07 page
- anti-pattern: hand-written per-page markup, a preview/tab stub, prettified source text, a forked primitive, AC verify commands pointing at specs this task does not own
- references: ['TR-07 component-detail wireframe R5–R12 — the region order this assembly implements', "T-GEND-009/010/011/021/023/024/025 — the criteria REF-001's flow specs encode and this task greens", 'FIX-FAM-005-1 — the same-commit re-pin precedent']
- notes: ["Runs wave C: REF-002..005 primitives and REF-008's derived fields exist; REF-001's specs are the standing RED this task greens (flow-primary ACs live there, per the FAM-001/FAM-003 ownership split).", 'R6 is a swappable region shape, not a TabGroup — the capture sprint adds Preview|Code tabs as its own RED against this structure.', 'The pager, chips, install-first, and source byte-substitution carry over unchanged; the re-pins extend assertions around them.']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01', 'CAP-INST-01']
- provides: ['the redesigned [item].astro: install stays FIRST content section; R6 shaped as a swappable region rendering Code ALONE under section[data-section="source"] while imagery is null (C4 — zero tab chrome, zero preview-panel elements, zero placeholder text); R7 DependencyPanel retained; R8 PropsTable; R9/R10 ThemingNote + UsageSnippet; R11 seam Callouts via the seam map; QrPanel aside consuming qrDeepLink; R12 within-family pager retained; metaDescription passed into Layout', "the two MODIFY'd region-contract tests re-pinned to the extended anatomy in the same commit (extend never delete; sha256 re-pin mirrors FIX-FAM-005-1)", "tests/sprint-04-generated-reference/item-page-contract.test.ts — the task's own unit source-contract file (FAM-002/FAM-003 precedent)", "the GREEN proofs for REF-001's seven owned flow specs (FLOW-GEND-14/15/20/34/35, FLOW-SHELL-13/14) — asserted in verification_gates, never as AC verify commands"]
- consumes: ['PropsTable (REF-002)', 'CodeBlock/ThemingNote/UsageSnippet (REF-003)', 'Callout + seam map (REF-004)', 'QrPanel + qrDeepLink (REF-005/008)', 'metaDescription from the 16-key dataset (REF-008)', "REF-001's flow specs as the standing RED baseline this task turns green"]
- boundary_contracts: ['Code view text stays byte-identical to served /r/nativewind/{item}.json files[].text (existing {engine} substitution preserved; no prettify/renumbering/per-file drops — keep the current sourceFiles mapping)', 'NO Preview|Code TabGroup this sprint (C4: zero tab chrome, zero preview-panel elements, zero placeholder text; R6 = swappable region shape, capture sprint adds the tab group as its own RED)', 'R13 ToC rail and print styles deferred (sprint-11); zero new islands', 'metaDescription into Layout; install stays FIRST content section; pager retained', "the two MODIFY'd existing tests re-pin to the new region contract — extend never delete (FAM-003's supersede of the FUSE-07 lean-list block is the precedent; keep chip/install/source/pager selectors stable where anatomy hasn't moved)"]
- supersedes: ['tests/sprint-01-docs-spike-skeleton/component-page.spec.ts', 'tests/sprint-03-family-browse/page-contract.test.ts']

### VERIFICATION GATES

- AC-1/TC-1..2: pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract — exit 0
- AC-2/TC-3..4: pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region — exit 0
- AC-3/TC-5..7: pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager — exit 0
- AC-4/TC-8: pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins — exit 0
- flow green (owned by REF-001, greened here): pnpm playwright test tests/sprint-04-generated-reference/reference-page-anatomy.spec.ts --grep FLOW-GEND-14-reference-page-anatomy — exit 0, 3/3 projects
- flow green: pnpm playwright test tests/sprint-04-generated-reference/family-pager-stays-in-family.spec.ts --grep FLOW-GEND-15-family-pager-stays-in-family — exit 0
- flow green: pnpm playwright test tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts --grep FLOW-GEND-20-exact-absolute-url-command-copy — exit 0
- flow green: pnpm playwright test tests/sprint-04-generated-reference/props-table-generated.spec.ts --grep FLOW-GEND-34-props-table-generated — exit 0 with props_tables == 39 in evidence
- flow green: pnpm playwright test tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts --grep FLOW-GEND-35-code-view-byte-identical-to-shipped-source — exit 0 with sampled_byte_matches >= 5
- flow green: pnpm playwright test tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages — exit 0
- flow green: pnpm playwright test tests/sprint-04-generated-reference/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html — exit 0
- RED-first: the four unit tokens fail before authoring (regions/imports absent, stale sha256 pins) — record the RED outputs
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/pages/components tests/sprint-04-generated-reference/item-page-contract.test.ts — exit 0 (never pnpm lint)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: ['REF-002', 'REF-003', 'REF-004', 'REF-005', 'REF-008'] · Blocks: ['REF-011', 'sprint-09', 'sprint-11']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Zero new islands, zero <script> — the page is a static template over build-time data
- Scoped var(--*)-token styles only; consume provided primitives unmodified
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-009",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "The real committed dataset read at test time by the unit source-contract file.",
   "seed_method": "public_api",
   "records": [
    "apps/docs/src/data/registry-items.json: 39 registry:component entries, 16 contract keys incl. qrDeepLink + metaDescription (REF-008)",
    "conversation carries props[] with 5 rows incl. one named 'data'; all 39 carry non-empty themingNote + usageSnippet",
    "apps/docs/src/data/families.json: 7 component families, counts 3/7/6/7/4/1/11",
    "conversation's metaDescription starts with 'Conversation — ' and ends with ' for React Native, installable via the nativewind/uniwind registry tree'"
   ]
  },
  "authored_item_page": {
   "description": "The working-tree [item].astro plus the re-pinned component-page.spec.ts and page-contract.test.ts read by the unit source-contract file. RED at task start: the regions/imports are absent and the sha256 pins still hash the sprint-03 bodies.",
   "seed_method": "ui_flow",
   "records": [
    "[item].astro imports PropsTable, CodeBlock, ThemingNote, UsageSnippet, Callout, QrPanel",
    "component-page.spec.ts GEND-14/15 bodies assert props/theming/usage + Code-alone regions",
    "page-contract.test.ts sha256 values re-pinned to the extended bodies"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "[item].astro source contract — R5–R12 region assembly, metaDescription binding, zero new islands",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored .astro file plus committed data reads — real file reads only, no runtime or external service (FAM-002 precedent); rendered proof rides REF-001's flow specs in verification_gates.",
   "verification_service": "real filesystem read of the authored [item].astro and registry-items.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/item-page-contract.test.ts",
   "test_function": "REF-009-item-page-region-contract",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over authored files — real file reads only, no runtime or external service; rendered proof rides REF-001's flow specs.",
    "verification_service": "real filesystem read of the authored [item].astro and registry-items.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the page is a static stub — the 6 primitive imports and region bindings are absent",
      "a Preview|Code TabGroup or placeholder text is added in the source region (C4 violation)",
      "qrDeepLink/metaDescription are hardcoded in the template instead of consumed from the dataset"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_item_page",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/pages/components/[item].astro from the working tree",
        "assert the region composition, primitive imports, and zero-JS discipline",
        "assert the metaDescription binding against the dataset literal"
       ]
      },
      "end_state": {
       "must_observe": [
        "imports naming PropsTable, CodeBlock, ThemingNote, UsageSnippet, Callout, QrPanel (6 primitive imports)",
        "section[data-section] bindings for install, source, props, theming, usage appear in that source order (5 region markers)",
        "1 Layout description binding carrying item.metaDescription (conversation's value starts with the literal 'Conversation — ')",
        "0 occurrences of 'client:', '<script', 'data-preview-panel', and 'coming soon|placeholder' strings"
       ],
       "must_not_observe": [
        "0 Preview|Code tab chrome elements in the source region",
        "0 hand-derived qrDeepLink or metaDescription strings in the template"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the working tree with REF-002..005 primitives and REF-008's 16-key dataset landed WHEN the unit source-contract test reads apps/docs/src/pages/components/[item].astro (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract) THEN the template composes the chip row, install as first content section, DependencyPanel, the Code-alone source region, PropsTable, ThemingNote, UsageSnippet, the QrPanel aside, and the family pager in source order with 0 tab-chrome elements and 0 island directives in the file",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Code-alone source region — byte-discipline mapping preserved, no clipping",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan plus dataset count derivation — real file reads only, no rendering, no network; the rendered byte-match proof is REF-001's FLOW-GEND-35 spec in verification_gates.",
   "verification_service": "real filesystem read of [item].astro + registry-items.json sourceFiles under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/item-page-contract.test.ts",
   "test_function": "REF-009-code-alone-region",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus dataset count derivation — real file reads only; rendered byte-match proof rides REF-001's FLOW-GEND-35 spec.",
    "verification_service": "real filesystem read of [item].astro + registry-items.json sourceFiles under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the mapping filters, renumbers, or drops files — the one-figure-per-file count assert fails",
      "the substitution line is edited or deleted — the split/join occurrence count leaves 1",
      "a max-height or overflow-clipping rule is added — the 0-clipping assert fails"
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
       "actor": "vitest_runner",
       "steps": [
        "read the source region of [item].astro",
        "count the substitution expression, the figure mapping, and the clipping declarations",
        "derive per-item expected figure counts from registry-items.json sourceFiles"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 occurrence of the substitution expression file.text.split('{engine}').join(DEFAULT_ENGINE) with DEFAULT_ENGINE == 'nativewind'",
        "1 .map over item.sourceFiles emitting exactly 1 <figure> per file, so figures == sourceFiles.length holds for 39/39 items at test time",
        "0 max-height declarations and 0 overflow:hidden rules in the source-region styles"
       ],
       "must_not_observe": [
        "0 substitution expressions (the byte oracle is broken)",
        "a filter or slice applied to sourceFiles (per-file drops)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the current [item].astro sourceFiles mapping whose {engine}→nativewind substitution keeps the Code view byte-identical to served /r/nativewind/{item}.json WHEN the unit source-contract test scans the redesigned source region (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region) THEN the region maps item.sourceFiles verbatim through the unchanged substitution with one figure per file and 0 clipping declarations in its styles",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Seams, QR, and pager composition — seam-map consumption with in-family navigation retained",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored template and the committed seam map — real file reads only, no runtime or external service; rendered proof rides REF-001's flow specs.",
   "verification_service": "real filesystem read of [item].astro + the seam map + families.json under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/item-page-contract.test.ts",
   "test_function": "REF-009-seams-qr-pager",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the authored template and the committed seam map — real file reads only.",
    "verification_service": "real filesystem read of [item].astro + the seam map + families.json under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the callouts are a hardcoded per-page list instead of derived from the seam map — the map join is absent",
      "the QrPanel binding omits item.qrDeepLink — the binding count is 0",
      "the pager math is edited to walk the global item list — the family-index modulo expressions are deleted"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_item_page",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read [item].astro and the seam map",
        "assert the Callout composition gate, the QrPanel binding, and the pager expressions",
        "derive the seam-user coverage from the map (renderMarkdown 3, TextClassContext 8)"
       ]
      },
      "end_state": {
       "must_observe": [
        "the seam map covers 10 item names across 2 seam kinds (renderMarkdown: message, reasoning, context; TextClassContext: message, prompt-input, tool, plan, queue, commit, terminal, environment-variables)",
        "1 QrPanel composition binding item.qrDeepLink",
        "the pager retains its family-index modulo expressions (1 prev + 1 next) over family.itemNames"
       ],
       "must_not_observe": [
        "0 seam callout compositions (map unconsumed)",
        "0 pager hrefs derived outside the family member list"
       ]
      }
     }
    ]
   },
   "description": "GIVEN REF-004's committed seam map naming ten seam-user items and the current within-family pager math WHEN the unit source-contract test scans the composition (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager) THEN the template renders Callout from the seam map for seam-user items, binds the QrPanel aside to item.qrDeepLink, and retains the prev/next family pager unchanged",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Region-contract re-pins land in-commit — extend never delete",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the re-pinned test files — real file reads and hash comparisons only, no runtime or external service (the FIX-FAM-005-1 mirror).",
   "verification_service": "real filesystem read + sha256 over the re-pinned spec sources under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/item-page-contract.test.ts",
   "test_function": "REF-009-spec-repins",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan over the re-pinned test files — real file reads and hash comparisons only.",
    "verification_service": "real filesystem read + sha256 over the re-pinned spec sources under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the re-pin deletes a sprint-02/03 assertion (chip/install/source/pager) — the retained-assertion scan fails",
      "page-contract.test.ts still hashes the unchanged sprint-03 bodies — the sha256 comparison fails (stale pin)",
      "the page change and the re-pin land in separate commits — the same-commit check fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_item_page",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the re-pinned component-page.spec.ts and page-contract.test.ts",
        "assert the extended anatomy clauses, the retained legacy clauses, and the matching sha256 pins",
        "assert both re-pins share the page change's commit"
       ]
      },
      "end_state": {
       "must_observe": [
        "the GEND-14 body asserts 5 region markers (install, source, props, theming, usage)",
        "retained selectors: data-chip, section[data-section=\"install\"], source pre code, pager nav (4 legacy anchors)",
        "page-contract.test.ts's 2 sha256 pins equal hashes computed over the extended bodies at commit time"
       ],
       "must_not_observe": [
        "0 deleted legacy assertions in the diff (extend never delete)",
        "a stale hash pin mismatching the extended body"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the extended [item].astro and the two existing region-contract tests holding sprint-03-era assertions and sha256 pins WHEN the unit re-pin test executes (pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins) THEN component-page.spec.ts's GEND-14/15 bodies assert the five-region anatomy and page-contract.test.ts's sha256 pins match the extended bodies with all pre-existing chip/install/source/pager assertions retained",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "[item].astro composes the 6 primitive imports with 5 region markers in order and 0 tab-chrome/island/placeholder occurrences.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Exactly 1 Layout description binding carries item.metaDescription (conversation's value starts with the literal 'Conversation — ').",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-item-page-region-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The source region retains exactly 1 substitution expression (split('{engine}').join('nativewind')) with figures == sourceFiles.length for 39/39 items.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The source-region styles declare 0 max-height and 0 overflow:hidden rules.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-code-alone-region"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "The seam map's 10 item names across 2 seam kinds gate 1 Callout composition site in the template.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "Exactly 1 QrPanel composition binds item.qrDeepLink beside the Code view.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "The pager retains its 2 family-index modulo expressions (1 prev + 1 next) over family.itemNames.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-seams-qr-pager"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "The re-pinned specs assert the 5-region anatomy, retain the 4 legacy selector anchors, and carry 2 matching sha256 pins in the page change's commit.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/item-page-contract.test.ts -t REF-009-spec-repins"
  }
 ]
}
-->

</details>
