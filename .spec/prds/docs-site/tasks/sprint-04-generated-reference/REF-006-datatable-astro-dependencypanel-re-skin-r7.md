<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-006: DataTable.astro + DependencyPanel re-skin (R7)

> Status: ✅ Completed
> Commit: 074ea9e6c00ebd5c55ad616554d0161b615a0e10 (approved cycle 1)
> Assignee: frontend-designer (implementer) · astro-reviewer (reviewer)
> Priority: P1 · Points: 2 · Type: FEATURE · Wave: A
> Proposed By: frontend-designer · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author the generic zero-JS DataTable primitive (zebra, sticky header, mobile horizontal scroll with sticky first column) and re-skin DependencyPanel onto it without moving any sprint-02 spec selector, mounting REF-004's Callout as the panel-footer troubleshooting link.

## Why
DataTable.astro exists and DependencyPanel.astro renders through it with an unchanged props contract, a byte-preserved data-testid surface, and 0 dropped or invented entries; data-table-contract.test.ts passes green (RED first: DataTable absent); tests/sprint-02-shell-hero/dependency-panels.spec.ts passes byte-unchanged with git diff showing 0 modifications to it, lib/resolve-deps.ts, or islands/**.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract

## Scope
apps/docs/src/components/DataTable.astro (NEW); apps/docs/src/components/DependencyPanel.astro (MODIFY); tests/sprint-04-generated-reference/data-table-contract.test.ts (NEW)

<details>
<summary>▸ Full agent specification (REF-006 — required reading for implementer + reviewer)</summary>

TASK: REF-006 — DataTable.astro + DependencyPanel re-skin (R7)
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 2
AGENT: implementer=frontend-designer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: DataTable stays generic — columns/rows/bodyAttrs arrive as props and drive all markup; the panel owns every domain string
- MUST: All four data-testid families survive the re-skin: data-deps-empty, data-deps-packages, data-engine-urls (nativewind + uniwind), data-deps-peers — the sprint-02 spec passes byte-unchanged
- MUST: The panel's Props interface stays exactly {dependencies: readonly string[]; registryUrls: {nativewind: readonly string[]; uniwind: readonly string[]}; peers: readonly AiSdkPeer[]}
- MUST: The empty-deps branch renders the explicit data-deps-empty message — the section never silently drops
- MUST: The panel footer composes exactly 1 Callout (variant 'info') with the troubleshooting link in its link slot
- NEVER: Never invent or drop panel entries — every rendered package, URL, and peer maps from the props
- NEVER: Never touch lib/resolve-deps.ts, islands/**, or tests/sprint-02-shell-hero/dependency-panels.spec.ts — all three are write-prohibited this task
- NEVER: Never add a max-height, line-clamp, or overflow: hidden on any table surface
- NEVER: Never add print styles or a new island — 0 @media print rules, 0 <script>, 0 customElements.define in either component
- STRICTLY: Strictly SCOPE write_allowed paths — if a future design genuinely must move a sprint-02 selector, that task owns both the spec MODIFY and the supersedes declaration; this task's design makes that path unreachable

### DONE WHEN

- [x] AC 1: DataTable generic source contract — prop-driven table, zebra, sticky header, mobile scroll
- [x] AC 2: Panel mount stability — props contract unchanged, resolver untouched
- [x] AC 3: Testid continuity + contents equality + Callout footer
- [x] AC 4: Empty-deps explicit state and the no-max-height/no-print/no-new-island guards
- [x] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [x] Only SCOPE.writeAllowed files modified (git diff --name-only) — product/test files are exactly the 3 write_allowed paths; .tmp/REF-006/cycle-1 RED+GREEN evidence committed per sprint convention (REF-005 precedent)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: DataTable generic source contract — prop-driven table, zebra, sticky header, mobile scroll**

  GIVEN/WHEN/THEN: GIVEN the repo with the landed DependencyPanel's ad-hoc .deps-urls tables as the re-skin target and (RED at start) no DataTable.astro WHEN the test reads apps/docs/src/components/DataTable.astro from the real working tree and scans its structure and scoped styles THEN it declares 1 prop surface {columns?, rows, bodyAttrs?, caption?} with exactly 1 rows-driven loop emitting 1 <tr> per row and 0 hardcoded rows, an optional thead that renders only when columns arrive (0 columns = the bare-tbody engine-URL form), exactly 1 zebra rule on background var(--muted), 1 position: sticky top rule on thead cells, 1 overflow-x: auto scroll wrapper, and exactly 1 max-width media query carrying the first-column sticky rules (th:first-child/td:first-child position: sticky; left: 0)

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/data-table-contract.test.ts · TEST_FUNCTION: REF-006-data-table-generic-contract
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract`
  VERIFICATION_SERVICE: real filesystem read of the authored DataTable.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over an authored .astro file — real file read only (the landed primitives.test.ts pattern); the rendered panel equality is REF-009's FLOW-GEND-21 primary, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_data_table_artifacts → MUST_OBSERVE [1 prop surface {columns?, rows, bodyAttrs?, caption?} — columns optional so the bare-tbody engine-URL form renders 0 thead; exactly 1 rows-driven loop emitting 1 <tr> per row — 0 hardcoded rows; exactly 1 zebra rule (tbody tr:nth-child(even) or equivalent) on background var(--muted); 1 position: sticky top rule on thead cells; 1 overflow-x: auto wrapper; exactly 1 max-width media query carrying th:first-child/td:first-child position: sticky; left: 0] / MUST_NOT_OBSERVE [0 <script> tags and 0 customElements.define calls; 0 hex color literals matching #[0-9a-fA-F]{3,8}; 0 max-height declarations and 0 @media print rules]
    - NEGATIVE_CONTROL: would fail if ['the table bakes in dependency-panel strings — the 0-hardcoded-rows assert fails and the primitive is not generic', 'the mobile treatment card-ifies or clips instead of scrolling — the overflow-x wrapper and sticky-first-column asserts fail', 'zebra or surfaces use raw color values — the 0-hex assert fails']

**AC-2: Panel mount stability — props contract unchanged, resolver untouched**

  GIVEN/WHEN/THEN: GIVEN the landed sprint-02 panel whose Props interface is {dependencies: readonly string[]; registryUrls: {nativewind: readonly string[]; uniwind: readonly string[]}; peers: readonly AiSdkPeer[]} and (RED at start) no DataTable composition WHEN the test reads the re-skinned apps/docs/src/components/DependencyPanel.astro and lib/resolve-deps.ts from the real working tree THEN the panel's Props interface names exactly 3 keys (dependencies, registryUrls, peers) with the same readonly types, exactly 1 import of AiSdkPeer from '../lib/resolve-deps' and it is type-only, exactly 2 slot panels (slot='nativewind' and slot='uniwind') composed inside 1 TabGroup, and lib/resolve-deps.ts is byte-identical to task start

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/data-table-contract.test.ts · TEST_FUNCTION: REF-006-panel-props-mount-stability
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-props-mount-stability`
  VERIFICATION_SERVICE: real filesystem read of the re-skinned DependencyPanel.astro and lib/resolve-deps.ts sources · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored panel plus a byte-compare of the write-prohibited resolver — real file reads only; [item].astro mount behavior is REF-009's assembly, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_data_table_artifacts → MUST_OBSERVE [1 Props interface naming exactly 3 keys — dependencies, registryUrls, peers — with the sprint-02 readonly types; exactly 1 import of AiSdkPeer from '../lib/resolve-deps' and it is type-only; exactly 2 slot panels (slot='nativewind' and slot='uniwind') composed inside 1 TabGroup] / MUST_NOT_OBSERVE [0 URL construction inside the panel — every URL arrives via registryUrls; 0 peers-derivation logic inside the panel — the peers prop renders verbatim; 0 changes to lib/resolve-deps.ts (byte-identical to task start)]
    - NEGATIVE_CONTROL: would fail if ['the props interface widens or renames — the exactly-3-key readonly-type assert fails and [item].astro mounts break', 'resolution logic migrates into the panel — the type-only-import assert fails and the frontmatter/server-rendered contract splits', 'lib/resolve-deps.ts changes — the byte-compare against task start fails the write-prohibited scope']

**AC-3: Testid continuity + contents equality + Callout footer**

  GIVEN/WHEN/THEN: GIVEN the landed sprint-02 spec selecting data-deps-empty, data-deps-packages, data-engine-urls, and data-deps-peers over server-rendered DOM, REF-004's Callout landed, and (RED at start) no DataTable composition in the panel WHEN the test reads the re-skinned DependencyPanel.astro and scans its render paths and footer THEN all 4 data-testid families survive (1 data-deps-empty path, 1 data-deps-packages list, 2 data-engine-urls tbodys, 1 data-deps-peers element), the panel carries exactly 3 .map render paths (dependencies.map, registryUrls per engine, peers.map) and 0 literal package/URL strings outside the props interface, engine URL cells render as <code> (1 <code> per URL cell), and exactly 1 <footer> region composes 1 Callout with variant 'info' carrying the troubleshooting link through its link slot

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/data-table-contract.test.ts · TEST_FUNCTION: REF-006-panel-testid-continuity-equality
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-testid-continuity-equality`
  VERIFICATION_SERVICE: real filesystem read of the re-skinned DependencyPanel.astro source · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan over the authored panel — real file read only; the rendered dataset equality is REF-009's FLOW-GEND-21 primary over the real preview, outside this task's write_allowed.
  SCENARIO:
    - START_REF authored_data_table_artifacts → MUST_OBSERVE [4/4 data-testid families present: 1 data-deps-empty path, 1 data-deps-packages list, 2 data-engine-urls tbodys (nativewind + uniwind), 1 data-deps-peers element; exactly 3 .map render paths (dependencies.map, registryUrls per engine, peers.map) and 0 literal package/URL strings outside the props interface; engine URL cells render as <code> (mono cells: 1 <code> per URL cell); exactly 1 <footer> region composing exactly 1 Callout with variant 'info' and the troubleshooting link in its link slot] / MUST_NOT_OBSERVE [0 invented entries — no URL, package, or peers-entry literal absent from the props; 0 dropped sections — the peers line still renders when the peers array is non-empty]
    - NEGATIVE_CONTROL: would fail if ['a data-testid moves or is renamed — the 4-family count assert fails and the sprint-02 spec would break unmodified', 'a URL or package string is typed by hand — the 3-map-paths + 0-literal-strings assert fails and the dataset-diff oracle downstream would catch drift', 'the troubleshooting link bypasses Callout — the 1-Callout-footer assert fails and a second aside pattern appears']

**AC-4: Empty-deps explicit state and the no-max-height/no-print/no-new-island guards**

  GIVEN/WHEN/THEN: GIVEN the real dataset where message carries dependencies === [] while its registryDependencies still resolve per engine, and (RED at start) no re-skinned panel WHEN the test reads the re-skinned DependencyPanel.astro and the real registry dataset THEN exactly 1 dependencies.length === 0 branch renders the explicit data-deps-empty message, the panel's scoped styles carry 0 max-height and 0 @media print rules, and the panel adds 0 new islands beyond the retained TabGroup

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/data-table-contract.test.ts · TEST_FUNCTION: REF-006-panel-empty-state-guards
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-empty-state-guards`
  VERIFICATION_SERVICE: real filesystem read of the re-skinned DependencyPanel.astro source + real registry-items.json import under vitest/node · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Static source-contract scan plus a real dataset import for the empty-deps trigger — real file reads only, no rendering, no network, no DB.
  SCENARIO:
    - START_REF authored_data_table_artifacts → MUST_OBSERVE [exactly 1 dependencies.length === 0 branch rendering the explicit data-deps-empty message; 0 max-height declarations and 0 @media print rules in the panel's scoped styles; message dependencies === [] in the real dataset — the empty branch's trigger while its registryDependencies still resolve] / MUST_NOT_OBSERVE [0 silently dropped dependency sections (the empty state renders, never omits); 0 new <script> tags, 0 customElements.define, 0 island imports beyond the retained TabGroup]
    - NEGATIVE_CONTROL: would fail if ['the empty branch is dropped in the re-skin — the 1-branch assert fails and the message-item page silently loses its dependency section', 'a max-height sneaks onto the URL table — the 0-max-height assert fails the boundary contract', 'a second island or script appears for table behavior — the zero-new-island assert fails the five-island budget']

### TEST CRITERIA

- **TC-1** (→AC-1): DataTable.astro declares 1 {columns?, rows, bodyAttrs?, caption?} prop surface with exactly 1 rows-driven loop, an optional thead rendering only when columns arrive (0 columns = bare tbody), and mono cells rendered as <code>. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract`
- **TC-2** (→AC-1): DataTable.astro carries exactly 1 zebra rule on var(--muted), 1 sticky-thead rule, 1 overflow-x: auto wrapper, and exactly 1 max-width media query with first-column position: sticky; left: 0 — with 0 <script>, 0 hex literals, 0 max-height, and 0 @media print. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract`
- **TC-3** (→AC-2): The re-skinned panel's Props interface names exactly 3 keys (dependencies, registryUrls, peers) with sprint-02 readonly types, and exactly 1 type-only AiSdkPeer import from '../lib/resolve-deps'. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-props-mount-stability`
- **TC-4** (→AC-2): Exactly 2 slot panels (slot='nativewind' and slot='uniwind') compose inside 1 TabGroup, lib/resolve-deps.ts is byte-identical to task start, and the panel constructs 0 URLs and derives 0 peers itself. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-props-mount-stability`
- **TC-5** (→AC-3): All 4 data-testid families survive the re-skin (1 data-deps-empty path, 1 data-deps-packages list, 2 data-engine-urls tbodys, 1 data-deps-peers element) with engine URL cells rendering 1 <code> per URL cell. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-testid-continuity-equality`
- **TC-6** (→AC-3): The panel carries exactly 3 .map render paths and 0 literal package/URL strings outside the props interface, and exactly 1 <footer> region composes 1 Callout with variant 'info' carrying the troubleshooting link through its link slot. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-testid-continuity-equality`
- **TC-7** (→AC-4): Exactly 1 dependencies.length === 0 branch renders the explicit data-deps-empty message — grounded on the real dataset where message carries dependencies === []. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-empty-state-guards`
- **TC-8** (→AC-4): The panel's scoped styles carry 0 max-height and 0 @media print rules, and the panel adds 0 new islands or scripts beyond the retained TabGroup. — `pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-empty-state-guards`

### READING LIST (max 5)

- apps/docs/src/components/DependencyPanel.astro [PRIMARY PATTERN] lines all — The file being re-skinned: the current {dependencies, registryUrls, peers} contract, the four data-testid hooks, the TabGroup slot composition, and the 'DataTable polish stays sprint-04's' note this task fulfills.
- tests/sprint-02-shell-hero/dependency-panels.spec.ts lines all — The byte-unchanged continuity oracle: its selectors and probe items (shimmer/conversation/message) define what the re-skin must not move (write-prohibited, read-only).
- tests/sprint-02-shell-hero/primitives.test.ts [PRIMARY PATTERN] lines all — The landed vitest source-scan pattern data-table-contract.test.ts imitates.
- apps/docs/src/components/islands/TabGroup.astro lines all — The engine-panel slot contract the re-skin retains unmodified (write-prohibited, consumed).
- apps/docs/src/lib/resolve-deps.ts lines all — The consumed resolver: the AiSdkPeer type and per-engine URL resolution that arrive as props (write-prohibited, byte-compared).

### SCOPE (file-level write permissions)

writeAllowed:
- apps/docs/src/components/DataTable.astro (NEW)
- apps/docs/src/components/DependencyPanel.astro (MODIFY)
- tests/sprint-04-generated-reference/data-table-contract.test.ts (NEW)
writeProhibited:
- apps/docs/src/lib/resolve-deps.ts
- apps/docs/src/components/islands/
- tests/sprint-02-shell-hero/dependency-panels.spec.ts
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Generic prop-driven table primitive with the domain panel composing it — DataTable owns table mechanics (zebra, sticky, scroll), DependencyPanel owns domain strings and the data-testid surface; testid continuity chosen over markup purity so the sprint-02 oracle stays byte-unchanged
- pattern_source: apps/docs/src/components/DependencyPanel.astro (the panel being re-skinned onto its own primitive) + apps/docs/src/components/Chip.astro (prop-driven zero-JS composition discipline)
- anti-pattern: duplicating a second per-panel table implementation; moving spec selectors for cosmetic markup; baking dependency-panel strings into the generic table
- references: ["TR-07 component-detail R7 — 'Dependency panel: DataTable (docs) — registryDeps + deps incl. AI SDK v7 peers; troubleshooting Callout'", "TR-07 markdown-doc R5 — 'DataTable (docs): Tables, never prose paragraphs; sticky header, zebra via --muted'", "TR-07 registry-ledger mobile note — 'horizontal scroll w/ sticky first column' (the DataTable mobile treatment)"]
- notes: ['Mobile: the dependency table scrolls horizontally inside its overflow-x wrapper with the first column pinned (position: sticky; left: 0 on a token background) — no card-ification, no clipping; retained TabGroup tabs keep >=44px touch targets', 'Focus-visible: the panel exposes 0 new focusable elements (tables are static data; tabs belong to the retained TabGroup island) — the global 2px var(--ring) contract is neither invoked nor suppressed', 'Reduced-motion: 0 animated properties declared (instant zebra/hover color swaps only) so 0 prefers-reduced-motion guards are required']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01', 'CAP-INST-01']
- provides: ['DataTable.astro — generic zero-JS table: props {columns?: readonly string[]; rows: readonly {text: string; mono?: boolean}[][]; bodyAttrs?: Record<string, string>; caption?}; zebra var(--muted), sticky thead, horizontal scroll with sticky first column inside 1 max-width media query; 0 columns renders the bare-tbody form', "DependencyPanel.astro (MODIFIED) — re-skinned onto DataTable with the sprint-02 data-testid surface preserved byte-for-byte (data-deps-empty, data-deps-packages, data-engine-urls x2, data-deps-peers), the unchanged {dependencies, registryUrls, peers} mount contract, and REF-004's Callout in a panel footer for the troubleshooting link"]
- consumes: ["REF-004's Callout.astro (variant 'info', link slot) for the panel-footer troubleshooting link — depends_on REF-004", 'apps/docs/src/lib/resolve-deps.ts UNMODIFIED — the AiSdkPeer type and per-engine resolution arriving as props', "islands/TabGroup.astro UNMODIFIED — the engine panels stay the island's zero-JS-fallback slots", 'SHELL-001 tokens: --muted, --border, --card, --muted-foreground, --font-mono, --radius-*']
- boundary_contracts: ["PREFER keeping the panel's existing data-testids so tests/sprint-02-shell-hero/dependency-panels.spec.ts passes unmodified — this design DOES keep them, so the spec file stays outside write_allowed entirely and supersedes stays []", 'panel props contract unchanged (dependencies/registryUrls/peers) so [item].astro mounts stay stable', 'panel contents stay == registry dependencies + registryDependencies + peers — nothing dropped or invented', 'DataTable = generic zero-JS table (zebra var(--muted), horizontal scroll with sticky first column on mobile)', "consumes REF-004's Callout for the troubleshooting link in the panel footer (depends_on REF-004)", 'zero new islands', 'no print styles', 'no max-height anywhere']

### VERIFICATION GATES

- AC-1..AC-4: pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract / -t REF-006-panel-props-mount-stability / -t REF-006-panel-testid-continuity-equality / -t REF-006-panel-empty-state-guards — each exit 0
- RED-first: the four -t runs FAIL before authoring (DataTable.astro absent; panel still renders ad-hoc .deps-urls tables) — record the RED outputs
- Seeded evidence: captured stdout shows the counted anchors (4/4 testid families, 3 .map paths, 2 slot panels in 1 TabGroup, 1 empty branch, 0 max-height/0 print) and the dataset grounding (message dependencies === []) — not merely exit 0
- sprint-02 regression (the no-supersedes proof): pnpm playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts — green, and git diff shows the spec file byte-unchanged (0 modifications; it is write-prohibited this task)
- write-prohibited integrity: apps/docs/src/lib/resolve-deps.ts and apps/docs/src/components/islands/** show 0 changes in git diff
- typecheck: pnpm typecheck — exit 0
- lint: ./node_modules/.bin/biome ci apps/docs/src/components/DataTable.astro apps/docs/src/components/DependencyPanel.astro tests/sprint-04-generated-reference/data-table-contract.test.ts — exit 0 (never pnpm lint)
- tokens: the AC scans assert 0 raw color literals across both components (the scripts/check-tokens vocabulary) — check-tokens passes
- Browser ride-along (gated on REF-009 assembly, NOT this task's write surface): REF-001's dependency-panel-peers.spec.ts lane + gate step 5 (panels equal registry dependencies + engine-resolved registryDependencies + the AI SDK v7 peer, >=5 sampled panels matching the served /r/*.json) and gate step 10 (conversation panel readable on preview)
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: ['REF-004'] · Blocks: ['REF-009']

### CODING STANDARDS

- Astro 7 strict compiler: valid nesting, closed non-void tags
- Scoped styles consuming var(--*) tokens only — 0 hex, 0 raw color literals
- Zero <script>, zero customElements.define in the new/modified components — the TabGroup island remains the panel's only island
- Biome-clean via ./node_modules/.bin/biome ci <paths> — never pnpm lint (local crash)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-006",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "authored_data_table_artifacts": {
   "description": "The authored DataTable.astro and the re-skinned DependencyPanel.astro read from the real working tree at run time. RED at task start: DataTable.astro is absent and DependencyPanel still renders its ad-hoc .deps-urls tables.",
   "seed_method": "ui_flow",
   "records": [
    "apps/docs/src/components/DataTable.astro exists with {columns?, rows, bodyAttrs?, caption?} props",
    "apps/docs/src/components/DependencyPanel.astro composes DataTable and carries the Callout footer",
    "the four data-testid families and the {dependencies, registryUrls, peers} interface survive the re-skin"
   ]
  },
  "landed_dependency_spec": {
   "description": "The landed sprint-02 oracle read from the real working tree at run time: tests/sprint-02-shell-hero/dependency-panels.spec.ts, its selected data-testid vocabulary, and its three probe items. The byte-unchanged baseline this task must not move (write-prohibited, read as the continuity contract).",
   "seed_method": "ui_flow",
   "records": [
    "selectors: data-deps-empty, data-deps-packages, data-engine-urls (nativewind/uniwind), data-deps-peers — all read from server-rendered DOM, unguarded, chromium-nojs included",
    "probe items: shimmer (dependencies [react-native-reanimated] + engine-resolved URL twins), conversation (dependencies [react-native-safe-area-context] + registryDependencies button/icon/empty), message (dependencies empty — the explicit empty state with registryDependencies still resolving)"
   ]
  },
  "real_registry_dataset": {
   "description": "The real registry dataset imported from the working tree at run time: apps/docs/src/data/registry-items.json, grounding the contents-equality literals. Exists at task start.",
   "seed_method": "public_api",
   "records": [
    "conversation dependencies === ['react-native-safe-area-context'] and registryDependencies include button, icon, empty",
    "message dependencies === [] — the empty-deps branch's real trigger",
    "39 registry:component items mount the panel via [item].astro with the same props shape"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "DataTable generic source contract — prop-driven table, zebra, sticky header, mobile scroll",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over an authored .astro file — real file read only (the landed primitives.test.ts pattern); the rendered panel equality is REF-009's FLOW-GEND-21 primary, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the authored DataTable.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/data-table-contract.test.ts",
   "test_function": "REF-006-data-table-generic-contract",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only, no runtime or external service.",
    "verification_service": "real filesystem read of the authored DataTable.astro source",
    "negative_control": {
     "would_fail_if": [
      "the table bakes in dependency-panel strings — the 0-hardcoded-rows assert fails and the primitive is not generic",
      "the mobile treatment card-ifies or clips instead of scrolling — the overflow-x wrapper and sticky-first-column asserts fail",
      "zebra or surfaces use raw color values — the 0-hex assert fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_data_table_artifacts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read apps/docs/src/components/DataTable.astro from the real working tree",
        "assert the prop surface, the conditional thead, the counted zebra/sticky/scroll rules, and the zero-JS token contract"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 prop surface {columns?, rows, bodyAttrs?, caption?} — columns optional so the bare-tbody engine-URL form renders 0 thead",
        "exactly 1 rows-driven loop emitting 1 <tr> per row — 0 hardcoded rows",
        "exactly 1 zebra rule (tbody tr:nth-child(even) or equivalent) on background var(--muted); 1 position: sticky top rule on thead cells; 1 overflow-x: auto wrapper",
        "exactly 1 max-width media query carrying th:first-child/td:first-child position: sticky; left: 0"
       ],
       "must_not_observe": [
        "0 <script> tags and 0 customElements.define calls",
        "0 hex color literals matching #[0-9a-fA-F]{3,8}",
        "0 max-height declarations and 0 @media print rules"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the repo with the landed DependencyPanel's ad-hoc .deps-urls tables as the re-skin target and (RED at start) no DataTable.astro WHEN the test reads apps/docs/src/components/DataTable.astro from the real working tree and scans its structure and scoped styles THEN it declares 1 prop surface {columns?, rows, bodyAttrs?, caption?} with exactly 1 rows-driven loop emitting 1 <tr> per row and 0 hardcoded rows, an optional thead that renders only when columns arrive (0 columns = the bare-tbody engine-URL form), exactly 1 zebra rule on background var(--muted), 1 position: sticky top rule on thead cells, 1 overflow-x: auto scroll wrapper, and exactly 1 max-width media query carrying the first-column sticky rules (th:first-child/td:first-child position: sticky; left: 0)",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Panel mount stability — props contract unchanged, resolver untouched",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored panel plus a byte-compare of the write-prohibited resolver — real file reads only; [item].astro mount behavior is REF-009's assembly, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the re-skinned DependencyPanel.astro and lib/resolve-deps.ts sources",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/data-table-contract.test.ts",
   "test_function": "REF-006-panel-props-mount-stability",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-props-mount-stability",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "topology": "single-node",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus a write-prohibited byte-compare — real file reads only; the registryUrls/peers-array vocabulary is npm-package data, not device-topology state.",
    "verification_service": "real filesystem read of the re-skinned DependencyPanel.astro and lib/resolve-deps.ts sources",
    "negative_control": {
     "would_fail_if": [
      "the props interface widens or renames — the exactly-3-key readonly-type assert fails and [item].astro mounts break",
      "resolution logic migrates into the panel — the type-only-import assert fails and the frontmatter/server-rendered contract splits",
      "lib/resolve-deps.ts changes — the byte-compare against task start fails the write-prohibited scope"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_data_table_artifacts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the re-skinned DependencyPanel.astro and lib/resolve-deps.ts from the real working tree",
        "assert the 3-key interface, the type-only AiSdkPeer import, the 2-slot TabGroup composition, and the untouched resolver"
       ]
      },
      "end_state": {
       "must_observe": [
        "1 Props interface naming exactly 3 keys — dependencies, registryUrls, peers — with the sprint-02 readonly types",
        "exactly 1 import of AiSdkPeer from '../lib/resolve-deps' and it is type-only",
        "exactly 2 slot panels (slot='nativewind' and slot='uniwind') composed inside 1 TabGroup"
       ],
       "must_not_observe": [
        "0 URL construction inside the panel — every URL arrives via registryUrls",
        "0 peers-derivation logic inside the panel — the peers prop renders verbatim",
        "0 changes to lib/resolve-deps.ts (byte-identical to task start)"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the landed sprint-02 panel whose Props interface is {dependencies: readonly string[]; registryUrls: {nativewind: readonly string[]; uniwind: readonly string[]}; peers: readonly AiSdkPeer[]} and (RED at start) no DataTable composition WHEN the test reads the re-skinned apps/docs/src/components/DependencyPanel.astro and lib/resolve-deps.ts from the real working tree THEN the panel's Props interface names exactly 3 keys (dependencies, registryUrls, peers) with the same readonly types, exactly 1 import of AiSdkPeer from '../lib/resolve-deps' and it is type-only, exactly 2 slot panels (slot='nativewind' and slot='uniwind') composed inside 1 TabGroup, and lib/resolve-deps.ts is byte-identical to task start",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Testid continuity + contents equality + Callout footer",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan over the authored panel — real file read only; the rendered dataset equality is REF-009's FLOW-GEND-21 primary over the real preview, outside this task's write_allowed.",
   "verification_service": "real filesystem read of the re-skinned DependencyPanel.astro source",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/data-table-contract.test.ts",
   "test_function": "REF-006-panel-testid-continuity-equality",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-testid-continuity-equality",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "topology": "single-node",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan — real file read only; the registryUrls/peers-array vocabulary is npm-package data rendered from props, not device-topology state.",
    "verification_service": "real filesystem read of the re-skinned DependencyPanel.astro source",
    "negative_control": {
     "would_fail_if": [
      "a data-testid moves or is renamed — the 4-family count assert fails and the sprint-02 spec would break unmodified",
      "a URL or package string is typed by hand — the 3-map-paths + 0-literal-strings assert fails and the dataset-diff oracle downstream would catch drift",
      "the troubleshooting link bypasses Callout — the 1-Callout-footer assert fails and a second aside pattern appears"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_data_table_artifacts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the re-skinned DependencyPanel.astro from the real working tree",
        "assert the 4 data-testid families, the 3 .map render paths, the <code> cell form, and the Callout footer composition"
       ]
      },
      "end_state": {
       "must_observe": [
        "4/4 data-testid families present: 1 data-deps-empty path, 1 data-deps-packages list, 2 data-engine-urls tbodys (nativewind + uniwind), 1 data-deps-peers element",
        "exactly 3 .map render paths (dependencies.map, registryUrls per engine, peers.map) and 0 literal package/URL strings outside the props interface",
        "engine URL cells render as <code> (mono cells: 1 <code> per URL cell)",
        "exactly 1 <footer> region composing exactly 1 Callout with variant 'info' and the troubleshooting link in its link slot"
       ],
       "must_not_observe": [
        "0 invented entries — no URL, package, or peers-entry literal absent from the props",
        "0 dropped sections — the peers line still renders when the peers array is non-empty"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the landed sprint-02 spec selecting data-deps-empty, data-deps-packages, data-engine-urls, and data-deps-peers over server-rendered DOM, REF-004's Callout landed, and (RED at start) no DataTable composition in the panel WHEN the test reads the re-skinned DependencyPanel.astro and scans its render paths and footer THEN all 4 data-testid families survive (1 data-deps-empty path, 1 data-deps-packages list, 2 data-engine-urls tbodys, 1 data-deps-peers element), the panel carries exactly 3 .map render paths (dependencies.map, registryUrls per engine, peers.map) and 0 literal package/URL strings outside the props interface, engine URL cells render as <code> (1 <code> per URL cell), and exactly 1 <footer> region composes 1 Callout with variant 'info' carrying the troubleshooting link through its link slot",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Empty-deps explicit state and the no-max-height/no-print/no-new-island guards",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Static source-contract scan plus a real dataset import for the empty-deps trigger — real file reads only, no rendering, no network, no DB.",
   "verification_service": "real filesystem read of the re-skinned DependencyPanel.astro source + real registry-items.json import under vitest/node",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/data-table-contract.test.ts",
   "test_function": "REF-006-panel-empty-state-guards",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-empty-state-guards",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "topology": "single-node",
    "test_tier": "unit",
    "unit_test_justified": "Static source-contract scan plus real dataset import — real file reads only; the registryDependencies vocabulary is npm-package data, not device-topology state.",
    "verification_service": "real filesystem read of the re-skinned DependencyPanel.astro source + real registry-items.json import under vitest/node",
    "negative_control": {
     "would_fail_if": [
      "the empty branch is dropped in the re-skin — the 1-branch assert fails and the message-item page silently loses its dependency section",
      "a max-height sneaks onto the URL table — the 0-max-height assert fails the boundary contract",
      "a second island or script appears for table behavior — the zero-new-island assert fails the five-island budget"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_data_table_artifacts",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the re-skinned DependencyPanel.astro and import the real registry dataset",
        "assert the retained empty branch, the style guards, and the dataset grounding for the empty trigger"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 1 dependencies.length === 0 branch rendering the explicit data-deps-empty message",
        "0 max-height declarations and 0 @media print rules in the panel's scoped styles",
        "message dependencies === [] in the real dataset — the empty branch's trigger while its registryDependencies still resolve"
       ],
       "must_not_observe": [
        "0 silently dropped dependency sections (the empty state renders, never omits)",
        "0 new <script> tags, 0 customElements.define, 0 island imports beyond the retained TabGroup"
       ]
      }
     }
    ]
   },
   "description": "GIVEN the real dataset where message carries dependencies === [] while its registryDependencies still resolve per engine, and (RED at start) no re-skinned panel WHEN the test reads the re-skinned DependencyPanel.astro and the real registry dataset THEN exactly 1 dependencies.length === 0 branch renders the explicit data-deps-empty message, the panel's scoped styles carry 0 max-height and 0 @media print rules, and the panel adds 0 new islands beyond the retained TabGroup",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "DataTable.astro declares 1 {columns?, rows, bodyAttrs?, caption?} prop surface with exactly 1 rows-driven loop, an optional thead rendering only when columns arrive (0 columns = bare tbody), and mono cells rendered as <code>.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "DataTable.astro carries exactly 1 zebra rule on var(--muted), 1 sticky-thead rule, 1 overflow-x: auto wrapper, and exactly 1 max-width media query with first-column position: sticky; left: 0 — with 0 <script>, 0 hex literals, 0 max-height, and 0 @media print.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-data-table-generic-contract"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The re-skinned panel's Props interface names exactly 3 keys (dependencies, registryUrls, peers) with sprint-02 readonly types, and exactly 1 type-only AiSdkPeer import from '../lib/resolve-deps'.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-props-mount-stability"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Exactly 2 slot panels (slot='nativewind' and slot='uniwind') compose inside 1 TabGroup, lib/resolve-deps.ts is byte-identical to task start, and the panel constructs 0 URLs and derives 0 peers itself.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-props-mount-stability"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "All 4 data-testid families survive the re-skin (1 data-deps-empty path, 1 data-deps-packages list, 2 data-engine-urls tbodys, 1 data-deps-peers element) with engine URL cells rendering 1 <code> per URL cell.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-testid-continuity-equality"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "The panel carries exactly 3 .map render paths and 0 literal package/URL strings outside the props interface, and exactly 1 <footer> region composes 1 Callout with variant 'info' carrying the troubleshooting link through its link slot.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-testid-continuity-equality"
  },
  {
   "id": "TC-7",
   "type": "test_criterion",
   "description": "Exactly 1 dependencies.length === 0 branch renders the explicit data-deps-empty message — grounded on the real dataset where message carries dependencies === [].",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-empty-state-guards"
  },
  {
   "id": "TC-8",
   "type": "test_criterion",
   "description": "The panel's scoped styles carry 0 max-height and 0 @media print rules, and the panel adds 0 new islands or scripts beyond the retained TabGroup.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/data-table-contract.test.ts -t REF-006-panel-empty-state-guards"
  }
 ]
}
-->

</details>
