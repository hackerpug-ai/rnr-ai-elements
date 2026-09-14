<!-- Template Version: 5.2.0 | Planned: 2026-09-14 -->

# ORI-AST-007: Filter the registry ledger and copy commands for the selected engine

## What this does

Visitors filter the generated registry, copy the selected engine's exact command, follow real references, and read every item and both commands without JavaScript.

## Why

The current registry page renders an unfiltered nativewind-only command table and ui/lib self-anchors. LedgerFilter serves the component grid and derives empty-state visibility from matching sections. DataTable currently accepts text/mono cells only. This completes the UC-GEND-07 filter/toggle carryover while preserving the existing grid.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls` against the real production build. Observe counts, clipboard values, shared engine state, real reference content, empty-result recovery and all 56 rows with both commands without JavaScript. All product evidence paths below are planned outputs.

## Scope

Extend Registry, LedgerFilter and shared DataTable; add LedgerTable and the task-owned browser proof within the exact allowlist. Consume ORI-AST-002 and ORI-AST-008. Later styling belongs to ORI-VIS-002 and ORI-VIS-004.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

TASK: ORI-AST-007 — Filter the registry ledger and copy commands for the selected engine

- Status: Backlog
- Assignee: astro-implementer
- Priority: P1 · Points: 3 · Type: FEATURE
- Dependency phase: After ORI-AST-002 and ORI-AST-008
- Proposed By: astro-planner · Co-authored By: frontend-designer
- AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer
- TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
- Verification policy: {"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true}
- Sprint: [SPRINT.md](./SPRINT.md) · sprint-05-orient-search
- Planned date: 2026-09-14
- Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
- PROGRESS: 0/4 ACs complete; all TDD_STATE values are none.

### OUTCOME

Visitors filter the generated registry, copy the selected engine's exact command, follow real references, and read every item and both commands without JavaScript.

### CRITICAL CONSTRAINTS — Never

- Never hand-author registry rows, counts or commands independently of the generated dataset; preserve all 56 items and both engine trees.
- Never replace real browser, clipboard or HTTP behavior with interception, view injection, mocked APIs, canned values, skipped targets or static success.
- Never fork ORI-AST-002 engine state or duplicate table/copy implementations; compose LedgerTable with shared DataTable and existing CopyButton.
- Never expose inert filter controls or gate rows, commands or Docs links on JavaScript.
- Never alter locked flow bindings, expand the allowlist or disturb shared WIP; use the assigned isolated candidate and only owned processes.

### DONE WHEN

- [ ] AC-1 [PRIMARY]: Filter categories and text; recover the table and existing grid.
- [ ] AC-2: Copy the displayed engine command and preserve shared selection.
- [ ] AC-3: Follow substantive component, ui and lib references.
- [ ] AC-4: Read the complete ledger and both commands without JavaScript.
- [ ] All runtime, evidence, compatibility and scope gates pass with current-candidate evidence.

### SPECIFICATION

Extend the existing LedgerFilter to the generated registry table with category, engine, and text controls. Preserve category totals 56/39/11/6 before text filtering. Engine selection updates displayed/copied commands without changing item counts because every item supports both trees. Reuse ORI-AST-002's engine state and the existing CopyButton. Emit both engine commands within each server-rendered row so the no-JavaScript view remains readable with exactly 56 item rows. Replace ui/lib self-anchors with ORI-AST-008's real reference destinations. Preserve component-grid filtering and fix table empty-state detection without relying on containing sections.

Success state: The real built preview proves totals 56/39/11/6, independent category/text filtering and engine selection, exact clipboard values, shared engine persistence, substantive reference destinations, recovery on both filtering surfaces, and a complete no-JavaScript table.

### RUNTIME_COMMANDS

- test: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts`
- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- build: `pnpm --filter @rnr-ai-elements/docs build`

### ACCEPTANCE CRITERIA

#### AC-1: Filter categories and text; recover the table and existing grid [PRIMARY]

GIVEN the production-generated 56-item ledger and existing component grid WHEN visitors filter categories and text, enter no matches, and clear THEN totals stay 56/39/11/6, matching content remains accurate, and both surfaces recover.

PRIMARY: true

FLOW_REF: FLOW-GEND-07-registry-ledger-controls

TEST_TIER: e2e

VERIFICATION_SERVICE: Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation

SURFACE_POLICY: .spec/e2e-policy/surface.json

COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json

TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/registry-ledger-controls.spec.ts

TEST_FUNCTION: FLOW-GEND-07-registry-ledger-controls

VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls

ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json

RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red

MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-007-1","use_case_ref":"UC-GEND-07","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["Filtering is disconnected or returns a static full table.","Empty-state detection uses containing sections instead of matching rows.","The shared filter omits grid restoration after clearing."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry","action":{"actor":"user","steps":["Open /registry; inspect All, component, ui and lib with a cleared text query.","Select component and enter conversation using the real input."]},"end_state":{"must_observe":["Category totals are All=56, component=39, ui=11 and lib=6 before text filtering.","The visible ledger names equal actual category/text matches; the filtered component set includes `conversation` and excludes at least 1 nonmatching item."],"must_not_observe":["0 matching rows for `conversation`, or the unchanged 56-row All table after selecting component.","An empty-result message while matching rows exist."]}},{"start_ref":"built_registry","action":{"actor":"user","steps":["Open /registry, select All, enter the run-specific no-match query, then clear the input."]},"end_state":{"must_observe":["The no-match state has 0 visible item rows and 1 visible empty-result message.","Clearing restores exactly 56 item rows and hides the empty-result message."],"must_not_observe":["The unchanged 56-row start state during the no-match query.","0 restored rows or a stale empty-result message after clearing."]}},{"start_ref":"built_registry","action":{"actor":"user","steps":["Navigate to /components; record its original card identities.","Filter by conversation, then the same no-match query, then clear."]},"end_state":{"must_observe":["The filtered grid includes the `conversation` card and exactly the matching names derived from real generated content.","No matches produces 0 cards and 1 visible empty-result message; clearing restores the original 39 cards and hides that message."],"must_not_observe":["An unchanged 39-card grid for the no-match query.","An empty grid or missing original cards after clearing."]}}]}
```

#### AC-2: Copy the displayed engine command and preserve shared selection

GIVEN a filtered conversation row and shared engine controls WHEN visitors select both engines, copy, and navigate through reference and authored panels THEN displayed commands equal real clipboard values, counts stay fixed, and all engine surfaces agree.

PRIMARY: false

FLOW_REF: FLOW-GEND-07-registry-ledger-controls

TEST_TIER: e2e

VERIFICATION_SERVICE: Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation

SURFACE_POLICY: .spec/e2e-policy/surface.json

COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json

TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/registry-ledger-controls.spec.ts

TEST_FUNCTION: FLOW-GEND-07-registry-ledger-controls

VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls

ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json

RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red

MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-007-2","use_case_ref":"UC-GEND-07","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["CopyButton is stubbed or copies the unchanged default nativewind command.","Registry selection is disconnected from ORI-AST-002 engine state.","Shared engine state is not persisted through real navigation."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry","action":{"actor":"user","steps":["Select component, then uniwind; verify 39 rows before entering conversation.","Read the conversation command, activate its CopyButton and read the real clipboard.","Switch to nativewind, compare filtered row counts, copy again and read the real clipboard."]},"end_state":{"must_observe":["Displayed command and clipboard both equal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json` after selecting uniwind.","Displayed command and clipboard both equal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` after selecting nativewind.","Switching engines preserves 39 component rows before text filtering and the same nonzero matching-row count afterward."],"must_not_observe":["An empty clipboard or unchanged nativewind command after selecting uniwind.","An unchanged uniwind command after selecting nativewind, or 0 matching rows after the switch."]}},{"start_ref":"built_registry","action":{"actor":"user","steps":["Select nativewind through Registry and follow the conversation Docs link.","Navigate to an available authored engine panel; select uniwind there, revisit conversation and return to Registry.","Read rnr-engine storage, root data-engine, selected controls and displayed commands without writing state from the test."]},"end_state":{"must_observe":["On first navigation, reference tabs and root `data-engine` agree with `rnr-engine=nativewind`.","After authored selection and return, authored panels, reference tabs, Registry controls, root `data-engine` and storage all agree on `uniwind`; conversation displays the complete uniwind command."],"must_not_observe":["Empty engine storage or the unchanged default nativewind selection after the user selects uniwind.","A registry command or reference tab disconnected from the persisted selection."]}}]}
```

#### AC-3: Follow substantive component, ui and lib references

GIVEN generated component, ui and lib rows and ORI-AST-008 reference destinations WHEN visitors follow each representative Docs link THEN all three destinations return HTTP 200 with matching substantive reference content.

PRIMARY: false

FLOW_REF: FLOW-GEND-07-registry-ledger-controls

TEST_TIER: e2e

VERIFICATION_SERVICE: Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation

SURFACE_POLICY: .spec/e2e-policy/surface.json

COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json

TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/registry-ledger-controls.spec.ts

TEST_FUNCTION: FLOW-GEND-07-registry-ledger-controls

VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls

ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json

RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red

MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-007-3","use_case_ref":"UC-GEND-07","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["Docs links remain static self-anchors instead of real destinations.","A destination is an empty shell or stub with only a generic document root."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry","action":{"actor":"user","steps":["Filter components by conversation and follow its Docs link.","Return, clear the query, select ui and follow item.","Return, select lib and follow stack-trace-parser; record each response, URL and rendered reference content."]},"end_state":{"must_observe":["`/components/conversation`, `/components/item` and `/components/stack-trace-parser` each return HTTP 200 at the matching final URL.","Each of the 3 destinations renders its exact generated title and description plus the complete absolute install command for `conversation`, `item` or `stack-trace-parser`, respectively."],"must_not_observe":["Empty reference content or placeholder-only pages.","The unchanged `/registry#row-item` or `/registry#row-stack-trace-parser` self-anchor destination."]}}]}
```

#### AC-4: Read the complete ledger and both commands without JavaScript

GIVEN the actual built site in a JavaScript-disabled browser WHEN visitors read Registry and follow representative Docs links THEN all 56 rows, both labeled engine commands, and working reference links remain available without inert filter controls.

PRIMARY: false

FLOW_REF: FLOW-GEND-07-registry-ledger-controls

TEST_TIER: e2e

VERIFICATION_SERVICE: Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation

SURFACE_POLICY: .spec/e2e-policy/surface.json

COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json

TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/registry-ledger-controls.spec.ts

TEST_FUNCTION: FLOW-GEND-07-registry-ledger-controls

VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls

ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json

RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red

MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-007-4","use_case_ref":"UC-GEND-07","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["Server rendering omits rows or either engine command.","The ledger is an empty static shell awaiting JavaScript.","Inert filter controls remain exposed or Docs links are disconnected."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry_nojs","action":{"actor":"user","steps":["Load /registry in chromium-nojs; inspect the initial document and visible table.","Count item rows, read both labeled commands in each row and inspect conversation explicitly.","Confirm category, engine and text filter controls are not exposed; follow the conversation, item and stack-trace-parser Docs links."]},"end_state":{"must_observe":["The initial and rendered table contain exactly 56 item rows with both `nativewind` and `uniwind` labeled commands per row.","Conversation exposes `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` and `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`.","All 3 representative Docs links reach HTTP 200 destinations with matching substantive content; 0 inert filter controls are exposed."],"must_not_observe":["An empty table, duplicated per-engine item rows, or missing uniwind commands.","Visible inert category, engine or text filter controls; empty reference pages or unchanged self-anchors."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The real browser observes totals 56/39/11/6, accurate category/text matches, zero-match feedback and complete restoration of the ledger and original component grid. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`
- TC-2 → AC-2: Both complete conversation commands equal the real clipboard after selection; row counts stay unchanged and shared engine state agrees through navigation. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`
- TC-3 → AC-3: Conversation, item and stack-trace-parser Docs links each return HTTP 200 at their real reference URL with matching substantive content. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`
- TC-4 → AC-4: The JavaScript-disabled document exposes all 56 rows and both labeled commands, resolves all representative Docs links and exposes no inert filter controls. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`

### FIXTURES

Seed through the declared real entrypoints only. The records below describe required future runtime state, not observed evidence.

```json
{"built_registry":{"description":"Use an isolated candidate containing ORI-AST-002 and ORI-AST-008. Run pnpm registry:build, pnpm gallery:manifest, and pnpm --filter @rnr-ai-elements/docs build through production entrypoints; serve its actual dist at http://localhost:4321 using the owned preview. Open fresh chromium-desktop and chromium-mobile contexts through ordinary navigation. Derive expected item identities from the generated registry data; record run, source, lockfile, test-source, dist and policy hashes.","seed_method":"cli","records":["56 generated items: 39 registry:component, 11 registry:ui, 6 registry:lib; all support nativewind and uniwind.","Representative real items: conversation, item, stack-trace-parser; /components has the original 39 component cards.","Generate a run-specific no-match query and confirm it matches no actual item. Select engines only through product controls; grant real clipboard permissions without replacing browser APIs."]},"built_registry_nojs":{"description":"Use the same production build and owned preview as built_registry. Load /registry through ordinary navigation in chromium-nojs with JavaScript disabled from context creation; do not remove scripts from or inject content into the document.","seed_method":"ui_flow","records":["The generated dataset has the same 56 items and category totals 39/11/6.","conversation supports both complete absolute engine commands; representative Docs destinations are /components/conversation, /components/item and /components/stack-trace-parser."]}}
```

### SCOPE

writeAllowed:

- apps/docs/src/pages/registry.astro
- apps/docs/src/components/islands/LedgerFilter.astro
- apps/docs/src/scripts/ledger-filter.ts
- tests/sprint-05-orient-search/registry-ledger-controls.spec.ts
- apps/docs/src/components/LedgerTable.astro
- apps/docs/src/components/DataTable.astro
- tests/sprint-05-orient-search/evidence/ORI-AST-007/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.red
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red

writeProhibited:

- .spec/**
- packages/**
- public/r/**
- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- apps/docs/src/data/**
- apps/docs/src/pages/components/**
- apps/docs/src/components/islands/CopyButton.astro
- apps/docs/src/scripts/copy-button.ts
- tests/sprint-01-docs-spike-skeleton/**
- tests/sprint-02-shell-hero/**
- tests/sprint-03-family-browse/**
- tests/sprint-04-generated-reference/**
- package.json
- pnpm-lock.yaml
- playwright.config.ts
- Any file not explicitly listed in write_allowed

### BOUNDARIES

Always:

- Use the assigned isolated candidate and owned OS-derived scratch roots; preserve shared WIP.
- Consume the generated dataset, shared engine-state seam and real reference routes.
- Keep current DataTable callers, component-grid filtering, base URLs and generated note working.
- Capture exact current-run observations and clean up only owned browser/preview resources.

Ask First:

- Any change to the exact allowlist, locked flow, policy, dependency or product scope requires the parent's scope decision.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARY CONTRACTS

- Registry data remains generated from the existing registry source.
- Category filtering and engine selection are distinct operations.
- Copied clipboard content equals the displayed engine's absolute command.
- Engine state stays synchronized with prose and reference tabs.
- The no-JavaScript view has all rows and both commands without exposed inert filter controls.
- Extract the existing registry table into LedgerTable using shared DataTable rich-cell semantics so real command-copy buttons and Docs links remain interactive. ORI-VIS-002 and ORI-VIS-004 style the resulting components later; no duplicated table implementation.

### DELIVERABLE

- apps/docs/src/components/DataTable.astro (MODIFY): additive rich-cell composition preserving existing text/mono callers and one shared table implementation.
- apps/docs/src/components/LedgerTable.astro (NEW): generated rows, both labeled commands, real CopyButtons and Docs links.
- apps/docs/src/pages/registry.astro (MODIFY): compose the generated ledger and controls while preserving base URLs and the generated note.
- apps/docs/src/components/islands/LedgerFilter.astro and apps/docs/src/scripts/ledger-filter.ts (MODIFY): category/text controls, shared engine selection, row-based empty detection and retained grid behavior.
- tests/sprint-05-orient-search/registry-ledger-controls.spec.ts (NEW), task manifest and allowed flow evidence paths: four AC-addressable tests under the exact flow grep token; genuine RED then seeded runtime proof. Evidence files remain planned outputs.

### AGENT INSTRUCTIONS — TDD

1. RED: after dependencies are available, author each AC's real browser assertions in the allowed test file under the exact flow token. Build and serve the preimplementation candidate. Run the locked command and capture actual assertion failure through the governing run_flow format at proof.red. Do not implement during RED. Missing tests, selector errors, failed builds, unavailable servers or renamed logs are not RED.
2. GREEN: after the orchestrator verifies RED, implement the smallest allowed change for the current AC. Run the identical locked command and capture actual product values. Proceed through AC-1 to AC-4; share production fixtures while keeping assertions attributable to each AC.
3. REFACTOR: improve only the changed implementation while keeping behavior and proof bindings stable; rerun affected checks. Add no product scope.
4. After all ACs, run the listed gates and report evidence to the independent astro-reviewer. Update per-AC TDD_STATE only from observed results; planning validation does not advance TDD_STATE.

### READING LIST

1. apps/docs/src/scripts/ledger-filter.ts [PRIMARY PATTERN], lines 1-99: Existing custom-element lifecycle, target-scoped filtering and section-based empty-state defect; retain grid behavior while counting row matches independently.
2. apps/docs/src/pages/registry.astro, lines 1-154: Generated ledger input, existing columns/base URLs, nativewind command and ui/lib anchor paths to replace.
3. apps/docs/src/components/DataTable.astro, lines 1-89: Preserve text/mono, columns, bodyAttrs and caption callers while adding Astro-authored rich-cell composition.
4. apps/docs/src/components/islands/LedgerFilter.astro, lines 1-66: Existing target prop, accessible input and disabled/hidden no-JavaScript fallback.
5. tests/sprint-03-family-browse/ledger-filter-island.spec.ts, lines 1-248: Read-only real generated-data/browser precedent; preserve its grid contract, but do not copy runtime skip patterns into the locked flow.

### DESIGN / REFERENCE GUIDANCE

- Follow the PRD registry-ledger R4/R5 composition. Keep DataTable generic and LedgerTable responsible for registry-domain cells, row identities, CopyButton and Docs links.
- Render both labeled engine commands within each server-rendered item row. Enhance visibility through shared engine state; do not duplicate rows per engine.
- Use existing scoped tokens, semantic controls, focus treatment and mobile table scrolling. Preserve base URLs, generated note and current table information.
- Keep text/category filtering ephemeral without URL writes; persisted engine preference belongs to ORI-AST-002. ORI-VIS-002 and ORI-VIS-004 own later visual styling.

### CODING STANDARDS

- Use typed Astro props and vanilla TypeScript in the existing island; add no framework, dependency or custom-element identity.
- Keep DataTable's current text/mono props compatible; compose real Astro markup for rich cells without stringifying components or injecting unchecked HTML.
- Keep registry generation authoritative, URL commands absolute and nativewind/uniwind symmetric.
- Make registration and event cleanup safe across navigation; calculate matching items independently from optional section grouping.
- Apply AGENTS.md, token conventions and Google developer-writing style; scan touched production code and tests for placeholders, no-ops, mocks, skips and TODO deferrals before acceptance.

### AGENT RATIONALE

astro-planner owns static Astro composition and browser enhancement planning; astro-implementer implements the existing Astro surfaces; astro-reviewer verifies the real built behavior independently. Preserve frontend-designer co-author provenance and its later styling boundary.

### VERIFICATION PRECONDITIONS

- Use the isolated candidate containing ORI-AST-007 and its existing dependencies ORI-AST-002 and ORI-AST-008.
- Generate registry data and build the real Astro site through production entrypoints. The generated dataset contains 56 items: 39 components, 11 ui items, and 6 lib items.
- Serve the candidate's actual dist at http://localhost:4321. Refuse an unowned listener.
- Record a fresh run ID and candidate source, lockfile, test-source, dist, surface-policy, and coldboot-policy hashes.
- Use actual Playwright desktop and mobile browser projects and a separate JavaScript-disabled context. Use the browser's real clipboard with required permissions; do not replace the clipboard API.
- Seed only through the production build and ordinary browser navigation. Do not inject rows, engine state, clipboard contents, or manufactured HTTP responses.

### VERIFICATION GATES

- Production seed/build: `pnpm registry:build`; `pnpm gallery:manifest`; `pnpm --filter @rnr-ai-elements/docs build`. Actual generated data and dist, totals 56/39/11/6; record build output and hashes. Refuse an unowned localhost:4321 listener.
- Functional RED before implementation: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`. Run the exact command against a recorded preimplementation candidate with a functioning real build and preview. Capture an actual assertion failure for missing ledger behavior through the governing run_flow RED capture format at proof.red. A missing test, unmatched selector, unavailable server, build error, authored success flag, or plain renamed log is not functional RED evidence. Run the same command against the implemented candidate and capture concrete browser and clipboard observations. The test must fail when filtering is disconnected, the copied engine is wrong, ui/lib links remain self-anchors, or the no-JavaScript table omits rows or commands. No API replacement, request interception, view injection, canned clipboard value, or skipped target is accepted.
- Task browser proof: `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts`; `pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls`. Exit 0 with all four ACs asserted under the exact flow token; real desktop/mobile interaction and chromium-nojs fallback have concrete evidence. No skipped required targets.
- Typecheck and lint: `pnpm typecheck`; `pnpm lint`. Exit 0. Root typecheck is scoped; the real Astro build and browser proof remain required.
- Existing consumers: `pnpm exec playwright test tests/sprint-02-shell-hero/dependency-panels.spec.ts tests/sprint-03-family-browse/ledger-filter-island.spec.ts`. Existing DataTable consumers and component-grid filtering retain their real browser behavior; earlier tests stay unchanged.
- Scenario and flow contract: `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py`. Pipe {fixtures, requirements} on stdin with no positional argument; exit 0 and zero findings. Parent verifies the complete sprint with flow_coverage_check.py --task-plan against locked human flows.

### EVIDENCE GATES

- Capture an actual preimplementation assertion failure with a working build/preview at the canonical proof.red, then run the identical locked command against the implemented candidate. run.red remains auxiliary and never replaces proof.red.
- Capture run/source/lockfile/test-source/dist/surface-policy/coldboot-policy identities and exact build/command output; bind the task manifest to this run's artifact bytes.
- Capture per-action category/engine/query/counts, displayed complete commands, actual clipboard values, storage/root state, HTTP status/final URLs and matching destination content.
- Capture browser traces and inspected screenshots for table filtering, recovery, preserved component grid and the JavaScript-disabled table. Require executable product-owned row/card/command/content assertions.
- Independent astro-reviewer verifies each AC and mapped TC, no stubs/skips, compatibility and allowlist compliance; source inspection and validator success alone do not prove product completion.

Planned artifact paths:

- tests/sprint-05-orient-search/evidence/ORI-AST-007/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.red
- tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red

Teardown:

- Close only this run's browser contexts and detach observation listeners.
- Stop only the preview process launched and recorded by this run.
- Preserve evidence and release only owned scratch resources.

### OUT OF SCOPE

- Reimplementing ORI-AST-002 engine persistence or ORI-AST-008 reference-page generation.
- ORI-VIS-002/ORI-VIS-004 visual redesign or site-wide token changes.
- Registry source changes, native/example-app work, live-provider flows, clean consumer installs or deployment.
- New filters, sorting, pagination, URL filter persistence, dependencies or islands.
- Owning any sprint journey or changing the fixed sprint gate, demonstrated use cases or 13-flow contract.

### CONTEXT

Current state/gap: The current registry page renders an unfiltered nativewind-only command table and ui/lib self-anchors. LedgerFilter serves the component grid and derives empty-state visibility from matching sections. DataTable currently accepts text/mono cells only.

Drive real category/text/engine controls, read the real clipboard, follow representative ui/lib links, and inspect the existing component grid afterward. Test no-match and clearing behavior. The no-JavaScript project reads the complete table.

Flow ownership: {"flow_ref":"FLOW-GEND-07-registry-ledger-controls","primary_owner":"ORI-AST-007","primary_ac":"AC-1","gate_steps":[11],"human_test_hook":"filter-items-copy-selected-engine","co_authored_by":["astro-planner","frontend-designer"]}

Fixed sprint contract, unchanged:

```json
{"gate":"A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.","entrypoint":"docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction","demonstrates":"UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)","flow_count":13,"task_flow_count":9,"journey_flow_count":4,"task_count":36,"point_total":131}
```

### REVIEW — astro-reviewer

Must pass:

- All AC/TC scenarios exercise the real built site with current seeded-value evidence.
- Functional RED and GREEN use the identical locked file, grep token and command; AC-1 alone is primary for this flow.
- Clipboard equals each complete displayed engine command; engine state agrees through actual navigation.
- Both references and no-JavaScript fallback meet the exact 56-row/two-command contract; grid and DataTable consumers retain behavior.
- Only allowed source/test/evidence paths change; no mocks, skipped required targets, duplicate table or copy/state implementation.

Should verify:

- Meaningful labels, keyboard focus and mobile reachability survive table composition.
- Rows remain generated and command data is not reconstructed by a second authority.
- Listeners and browser/preview resources are released only by their owner.

Verdict: APPROVED or NEEDS_FIXES. NEEDS_FIXES feedback identifies the failed AC, evidence and exact file location. No approval is claimed by this charter.

### DEPENDENCIES / CAPABILITIES

- Depends on ORI-AST-002: Shared engine state and its public selection/subscription behavior, rnr-engine persistence and root data-engine; reuse the delivered seam.
- Depends on ORI-AST-008: Real reference destinations for component, ui and lib items, including item and stack-trace-parser.
- Blocks: no additional formal dependency edges supplied in this compact task; later visual handoffs are described under Provides.
- Parallel: coordinate the shared DataTable surface; no concurrent-write permission is implied.
- Touches: CAP-DOCS-01, CAP-INST-01

Provides:

- LedgerTable built from generated registry data through shared DataTable rich-cell composition.
- Category/text filtering, selected-engine command copying and a full no-JavaScript table through the existing LedgerFilter and CopyButton.
- Task-owned functional RED and seeded browser/clipboard evidence for FLOW-GEND-07-registry-ledger-controls; component surfaces for later ORI-VIS-002 and ORI-VIS-004 styling.

Consumes:

- ORI-AST-002 shared engine state.
- ORI-AST-008 real reference routes.
- apps/docs/src/data/registry-items.json from the production build.
- Existing DataTable text/mono callers, CopyButton, LedgerFilter and the component grid.

PRD references:

- .spec/prds/docs-site/05-uc-gend.md#uc-gend-07-use-the-generated-registry-ledger
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md#registry-ledger--registry
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md
- .spec/prds/docs-site/11-technical-requirements/10-routing.md
- .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md

Provenance: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json; source_task_ids=["ORI-AST-007"]; supersedes=[]. All artifact paths have status planned_output_not_observed.

### PLANNING VALIDATION

Read-only scenario validation exited 0 with 4 scenarios and zero findings. It consumed the identical fixtures and requirements below through stdin, with SURFACE_BIN=/dev/null to disable telemetry. No product verification ran; implementation, independent review and runtime evidence remain outstanding.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-007","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_registry":{"description":"Use an isolated candidate containing ORI-AST-002 and ORI-AST-008. Run pnpm registry:build, pnpm gallery:manifest, and pnpm --filter @rnr-ai-elements/docs build through production entrypoints; serve its actual dist at http://localhost:4321 using the owned preview. Open fresh chromium-desktop and chromium-mobile contexts through ordinary navigation. Derive expected item identities from the generated registry data; record run, source, lockfile, test-source, dist and policy hashes.","seed_method":"cli","records":["56 generated items: 39 registry:component, 11 registry:ui, 6 registry:lib; all support nativewind and uniwind.","Representative real items: conversation, item, stack-trace-parser; /components has the original 39 component cards.","Generate a run-specific no-match query and confirm it matches no actual item. Select engines only through product controls; grant real clipboard permissions without replacing browser APIs."]},"built_registry_nojs":{"description":"Use the same production build and owned preview as built_registry. Load /registry through ordinary navigation in chromium-nojs with JavaScript disabled from context creation; do not remove scripts from or inject content into the document.","seed_method":"ui_flow","records":["The generated dataset has the same 56 items and category totals 39/11/6.","conversation supports both complete absolute engine commands; representative Docs destinations are /components/conversation, /components/item and /components/stack-trace-parser."]}},"requirements":[{"id":"AC-1","name":"Filter categories and text; recover the table and existing grid","type":"acceptance_criterion","primary":true,"description":"GIVEN the production-generated 56-item ledger and existing component grid WHEN visitors filter categories and text, enter no matches, and clear THEN totals stay 56/39/11/6, matching content remains accurate, and both surfaces recover.","flow_ref":"FLOW-GEND-07-registry-ledger-controls","test_file":"tests/sprint-05-orient-search/registry-ledger-controls.spec.ts","test_function":"FLOW-GEND-07-registry-ledger-controls","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-007-1","use_case_ref":"UC-GEND-07","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["Filtering is disconnected or returns a static full table.","Empty-state detection uses containing sections instead of matching rows.","The shared filter omits grid restoration after clearing."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry","action":{"actor":"user","steps":["Open /registry; inspect All, component, ui and lib with a cleared text query.","Select component and enter conversation using the real input."]},"end_state":{"must_observe":["Category totals are All=56, component=39, ui=11 and lib=6 before text filtering.","The visible ledger names equal actual category/text matches; the filtered component set includes `conversation` and excludes at least 1 nonmatching item."],"must_not_observe":["0 matching rows for `conversation`, or the unchanged 56-row All table after selecting component.","An empty-result message while matching rows exist."]}},{"start_ref":"built_registry","action":{"actor":"user","steps":["Open /registry, select All, enter the run-specific no-match query, then clear the input."]},"end_state":{"must_observe":["The no-match state has 0 visible item rows and 1 visible empty-result message.","Clearing restores exactly 56 item rows and hides the empty-result message."],"must_not_observe":["The unchanged 56-row start state during the no-match query.","0 restored rows or a stale empty-result message after clearing."]}},{"start_ref":"built_registry","action":{"actor":"user","steps":["Navigate to /components; record its original card identities.","Filter by conversation, then the same no-match query, then clear."]},"end_state":{"must_observe":["The filtered grid includes the `conversation` card and exactly the matching names derived from real generated content.","No matches produces 0 cards and 1 visible empty-result message; clearing restores the original 39 cards and hides that message."],"must_not_observe":["An unchanged 39-card grid for the no-match query.","An empty grid or missing original cards after clearing."]}}]}},{"id":"AC-2","name":"Copy the displayed engine command and preserve shared selection","type":"acceptance_criterion","primary":false,"description":"GIVEN a filtered conversation row and shared engine controls WHEN visitors select both engines, copy, and navigate through reference and authored panels THEN displayed commands equal real clipboard values, counts stay fixed, and all engine surfaces agree.","flow_ref":"FLOW-GEND-07-registry-ledger-controls","test_file":"tests/sprint-05-orient-search/registry-ledger-controls.spec.ts","test_function":"FLOW-GEND-07-registry-ledger-controls","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-007-2","use_case_ref":"UC-GEND-07","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["CopyButton is stubbed or copies the unchanged default nativewind command.","Registry selection is disconnected from ORI-AST-002 engine state.","Shared engine state is not persisted through real navigation."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry","action":{"actor":"user","steps":["Select component, then uniwind; verify 39 rows before entering conversation.","Read the conversation command, activate its CopyButton and read the real clipboard.","Switch to nativewind, compare filtered row counts, copy again and read the real clipboard."]},"end_state":{"must_observe":["Displayed command and clipboard both equal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json` after selecting uniwind.","Displayed command and clipboard both equal `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` after selecting nativewind.","Switching engines preserves 39 component rows before text filtering and the same nonzero matching-row count afterward."],"must_not_observe":["An empty clipboard or unchanged nativewind command after selecting uniwind.","An unchanged uniwind command after selecting nativewind, or 0 matching rows after the switch."]}},{"start_ref":"built_registry","action":{"actor":"user","steps":["Select nativewind through Registry and follow the conversation Docs link.","Navigate to an available authored engine panel; select uniwind there, revisit conversation and return to Registry.","Read rnr-engine storage, root data-engine, selected controls and displayed commands without writing state from the test."]},"end_state":{"must_observe":["On first navigation, reference tabs and root `data-engine` agree with `rnr-engine=nativewind`.","After authored selection and return, authored panels, reference tabs, Registry controls, root `data-engine` and storage all agree on `uniwind`; conversation displays the complete uniwind command."],"must_not_observe":["Empty engine storage or the unchanged default nativewind selection after the user selects uniwind.","A registry command or reference tab disconnected from the persisted selection."]}}]}},{"id":"AC-3","name":"Follow substantive component, ui and lib references","type":"acceptance_criterion","primary":false,"description":"GIVEN generated component, ui and lib rows and ORI-AST-008 reference destinations WHEN visitors follow each representative Docs link THEN all three destinations return HTTP 200 with matching substantive reference content.","flow_ref":"FLOW-GEND-07-registry-ledger-controls","test_file":"tests/sprint-05-orient-search/registry-ledger-controls.spec.ts","test_function":"FLOW-GEND-07-registry-ledger-controls","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-007-3","use_case_ref":"UC-GEND-07","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["Docs links remain static self-anchors instead of real destinations.","A destination is an empty shell or stub with only a generic document root."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry","action":{"actor":"user","steps":["Filter components by conversation and follow its Docs link.","Return, clear the query, select ui and follow item.","Return, select lib and follow stack-trace-parser; record each response, URL and rendered reference content."]},"end_state":{"must_observe":["`/components/conversation`, `/components/item` and `/components/stack-trace-parser` each return HTTP 200 at the matching final URL.","Each of the 3 destinations renders its exact generated title and description plus the complete absolute install command for `conversation`, `item` or `stack-trace-parser`, respectively."],"must_not_observe":["Empty reference content or placeholder-only pages.","The unchanged `/registry#row-item` or `/registry#row-stack-trace-parser` self-anchor destination."]}}]}},{"id":"AC-4","name":"Read the complete ledger and both commands without JavaScript","type":"acceptance_criterion","primary":false,"description":"GIVEN the actual built site in a JavaScript-disabled browser WHEN visitors read Registry and follow representative Docs links THEN all 56 rows, both labeled engine commands, and working reference links remain available without inert filter controls.","flow_ref":"FLOW-GEND-07-registry-ledger-controls","test_file":"tests/sprint-05-orient-search/registry-ledger-controls.spec.ts","test_function":"FLOW-GEND-07-registry-ledger-controls","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","artifact":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-GEND-07-registry-ledger-controls/proof.red","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-007-4","use_case_ref":"UC-GEND-07","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production-generated registry data, actual Playwright browsers, system clipboard, and real HTTP navigation","negative_control":{"would_fail_if":["Server rendering omits rows or either engine command.","The ledger is an empty static shell awaiting JavaScript.","Inert filter controls remain exposed or Docs links are disconnected."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_registry_nojs","action":{"actor":"user","steps":["Load /registry in chromium-nojs; inspect the initial document and visible table.","Count item rows, read both labeled commands in each row and inspect conversation explicitly.","Confirm category, engine and text filter controls are not exposed; follow the conversation, item and stack-trace-parser Docs links."]},"end_state":{"must_observe":["The initial and rendered table contain exactly 56 item rows with both `nativewind` and `uniwind` labeled commands per row.","Conversation exposes `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json` and `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`.","All 3 representative Docs links reach HTTP 200 destinations with matching substantive content; 0 inert filter controls are exposed."],"must_not_observe":["An empty table, duplicated per-engine item rows, or missing uniwind commands.","Visible inert category, engine or text filter controls; empty reference pages or unchanged self-anchors."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The real browser observes totals 56/39/11/6, accurate category/text matches, zero-match feedback and complete restoration of the ledger and original component grid.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Both complete conversation commands equal the real clipboard after selection; row counts stay unchanged and shared engine state agrees through navigation.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Conversation, item and stack-trace-parser Docs links each return HTTP 200 at their real reference URL with matching substantive content.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The JavaScript-disabled document exposes all 56 rows and both labeled commands, resolves all representative Docs links and exposes no inert filter controls.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/registry-ledger-controls.spec.ts --grep FLOW-GEND-07-registry-ledger-controls","maps_to_ac":"AC-4"}]}
-->
</details>
