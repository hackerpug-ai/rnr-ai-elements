<!-- Template Version: 5.2.0 -->
# ORI-CONT-001: Author Introduction, Installation, and registry-specific CLI content

## What this does
Readers understand the library, choose the engine from project facts, and find verified installation commands and consumer-file ownership across three complete orientation pages.

## Why
The three allowed authored page files are absent from the inspected source inventory; collection, panel and snippet prerequisites must land before their integration. No product RED was observed during planning.

## How to verify
Run `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts` against the owned built preview. Read Introduction, follow its ownership link, select each Installation engine, and inspect CLI. Require captured content values and the shared flow's later acceptance evidence.

## Scope
Author Introduction, Installation and CLI, plus the task-owned content spec and review record. The five exact allowed paths appear below.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: techwriting-implementer
> Priority: P1 · Points: 5 · Type: DOCS
> Dependency phase: After all seven depends_on contracts are delivered.
> Proposed By: techwriting-planner · Co-authored By: none
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

### OUTCOME
Readers understand the library, choose the engine from project facts, and find verified installation commands and consumer-file ownership across three complete orientation pages.

### CRITICAL CONSTRAINTS
- Never accept mocked HTTP, view injection, a fake filesystem, canned output, skipped browser targets or a static shared shell as content proof.
- Never change files outside the five allowed paths or alter shared flow ownership; preserve unrelated WIP in the assigned isolated candidate.
- Never maintain executable command copies in Markdown; consume verified source/snippet interfaces and keep each complete engine command inside its matching panel.
- Never teach NativeWind's package version as v3: NativeWind 4.2.6 uses Tailwind v3; the engine value remains nativewind.
- Never duplicate the upstream CLI catalog, promise library-owned transport or tool execution, or link to the unimplemented Sprint 06 troubleshooting guide.

### DONE WHEN
- [ ] AC-1: Opening identity and ownership destination.
- [ ] AC-2: One engine decision with complete commands.
- [ ] AC-3: Registry-specific CLI reference.
- [ ] AC-4: Collection metadata, generated matrix and editorial contract.
- [ ] Verification and evidence gates pass, independent review approves, and only allowed files change.

### RUNTIME COMMANDS
- Test: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts`
- Build: `pnpm --filter @rnr-ai-elements/docs build`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`

PROGRESS: 0/4 ACs complete; all TDD_STATE values are none.

### ACCEPTANCE CRITERIA
This DOCS task owns task-local real-browser content proofs. AC-1 most directly delivers the outcome; no AC claims PRIMARY flow ownership. Each scenario below is reproduced exactly in the Requirement Contract.

#### AC-1: Opening identity and ownership destination
GIVEN the built candidate and a fresh browser context WHEN the reader opens Introduction and follows its ownership link THEN the opening identifies universal React Native AI UI, registry delivery, and package absence; the boundary page explains ownership.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/orientation-content.spec.ts
- TEST_FUNCTION: ORI-CONT-001-identity
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-identity`
- MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-001-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["The route serves an empty shared shell or the ownership link points to missing content."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Navigate to http://localhost:4321/docs/introduction and inspect its opening paragraph.","Follow the ownership teaser link to /docs/owns-vs-does-not-own and read its authored body."]},"end_state":{"must_observe":["HTTP 200 and heading 'Introduction'; the opening names 'React Native', 'AI chat', 'agent UI', 'copy-paste registry' and 'not an npm package'.","HTTP 200 at '/docs/owns-vs-does-not-own'; the body assigns transcript state, transport and tool execution to the consumer."],"must_not_observe":["An empty authored body beneath the shared shell.","A 404 boundary destination or an npm runtime installation claim."]}}]}
```

#### AC-2: One engine decision with complete commands
GIVEN the built Installation page and the real project configuration inputs WHEN desktop and mobile readers choose each engine and a JavaScript-disabled reader reads the same page THEN one decision guide maps project facts to two labeled panels containing complete engine-specific commands.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/orientation-content.spec.ts
- TEST_FUNCTION: ORI-CONT-001-engine-decision
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-engine-decision`
- MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-001-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["Engine panels are static duplicates, commands are omitted, or a second nested TabGroup splits the instructions."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Open /docs/installation in fresh desktop and mobile contexts; read the project-fact decision table.","Select nativewind through the actual tab control and inspect its instruction panel."]},"end_state":{"must_observe":["Exactly 1 engine TabGroup and 1 engine question; 'NativeWind 4.2.6' with 'Tailwind v3' maps to 'nativewind'.","The nativewind panel contains 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json' in full."],"must_not_observe":["An empty nativewind instruction panel.","The nativewind command outside its corresponding panel or 'nativewind v3' presented as the installed package version."]}},{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Select uniwind through the actual tab control and inspect its instruction panel."]},"end_state":{"must_observe":["'Tailwind v4' with '@theme' maps to 'uniwind'.","The uniwind panel contains 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json' in full."],"must_not_observe":["An empty uniwind instruction panel.","A nativewind URL displayed as the uniwind install command."]}},{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Open /docs/installation in a fresh browser context with JavaScript disabled; read both ordinary panel bodies without attempting enhancement-only controls."]},"end_state":{"must_observe":["Both 'nativewind' and 'uniwind' labels and their complete '/r/nativewind/conversation.json' and '/r/uniwind/conversation.json' commands are readable in the initial HTML."],"must_not_observe":["An empty fallback or a missing command body when JavaScript is disabled."]}}]}
```

#### AC-3: Registry-specific CLI reference
GIVEN the built CLI page and verified registry installation evidence from its prerequisites WHEN the reader looks up engine URLs, destination files and the upstream reference THEN CLI explains absolute-URL add, both engine trees and consumer-owned destinations, and links to the authoritative CLI reference.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/orientation-content.spec.ts
- TEST_FUNCTION: ORI-CONT-001-cli-reference
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-cli-reference`
- MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-001-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["The CLI route is an empty shell or its example is disconnected from the verified source command."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Follow the CLI link to /docs/cli.","Read the registry URL and destination contract and inspect the source-backed command example and upstream reference link.","Compare the named destination contract with the real registry targets, components.json aliases and prerequisite clean-install evidence."]},"end_state":{"must_observe":["HTTP 200 and heading 'CLI'; the reference identifies '/r/nativewind/' and '/r/uniwind/' engine trees and absolute HTTPS registry-item URLs.","The destination explanation says installed files belong to the consumer and resolve through 'components.json' aliases.","The authoritative reference link targets 'https://reactnativereusables.com/docs/cli'; the displayed example matches 1 verified source command."],"must_not_observe":["An empty CLI body.","A short-name web-registry installation presented as this registry's command, or a copied upstream command catalog."]}}]}
```

#### AC-4: Collection metadata, generated matrix and editorial contract
GIVEN the three authored pages compiled through the prerequisite schema and snippet interfaces WHEN the reader navigates their scope statements, generated content and onward links THEN all pages expose correct metadata and scoped prose; Installation renders the existing matrix and source-backed examples.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/orientation-content.spec.ts
- TEST_FUNCTION: ORI-CONT-001-content-contract
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-content-contract`
- MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-001-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["Content is replaced by a static empty shell, the matrix is omitted, or examples are disconnected from the real snippet inputs."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Visit Introduction, Installation and CLI through the built site; compare their headings, descriptions and navigation order with the real collection entries.","Inspect Installation's Dev client requirements table and compare its cells with the existing dataset.","Follow links to the installation matrix, real item pages, boundary explanation, Theming and Dark mode; review each page against its assigned quadrant and content standard.","Trace every executable example to real source or the compiled snippet package and inspect the authored files for separately maintained executable copies."]},"end_state":{"must_observe":["3/3 pages have non-empty 'title' and 'description', section 'getting-started' and schema-valid 'order' metadata reflected in the built page/navigation.","Installation's 'Dev client requirements' table contains 4 dataset-derived opt-in entries with the recorded packages and platform permissions.","Onward links resolve to substantive HTTP 200 destinations including '/components/conversation' and '/docs/owns-vs-does-not-own'.","3/3 pages state scope and non-scope, use active voice and precise terminology, and retain their 'explanation', 'how-to' and 'reference' jobs respectively; executable examples match their source bytes."],"must_not_observe":["An empty authored body, empty matrix or placeholder onward link.","A link to the unimplemented Sprint 06 troubleshooting guide or an independently maintained executable Markdown example."]}}]}
```

### TEST CRITERIA
- **TC-1** → AC-1: The Introduction identity assertions and real boundary navigation pass with captured opening text and response statuses. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-identity`
- **TC-2** → AC-2: The single engine decision, both complete commands, desktop/mobile selection and JavaScript-disabled panel assertions all pass. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-engine-decision`
- **TC-3** → AC-3: The CLI absolute URLs, consumer destination explanation, verified example and authoritative reference assertions all pass. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-cli-reference`
- **TC-4** → AC-4: The metadata, four-entry matrix, real onward links, source provenance and page-by-page editorial review all satisfy AC-4. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-content-contract`

### FIXTURES
```json
{"orientation_preview":{"description":"Build the candidate's real authored content, registry/gallery/docs-data and compiled snippets through the ordered production build; serve its dist on the owned localhost:4321 preview. Open fresh desktop, mobile and JavaScript-disabled browser contexts with empty localStorage.","seed_method":"cli","records":["Source SHA, lockfile, dist, test/driver, surface-policy and coldboot-policy hashes plus a fresh run ID and owned preview PID.","Real source inputs: packages/registry/registry.json, apps/example/components.json, apps/harness-nativewind/package.json and apps/harness-nativewind/tailwind.config.js.","Prerequisites supply the content schema, single engine TabGroup composition, verified command snippets, boundary page, Theming and Dark mode pages, and existing DevClientMatrix data."]}}
```

### SCOPE
writeAllowed:
- apps/docs/src/content/docs/introduction.md
- apps/docs/src/content/docs/installation.mdx
- apps/docs/src/content/docs/cli.md
- tests/sprint-05-orient-search/orientation-content.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-CONT-001-content-review.md

writeProhibited:
- apps/docs/src/components/**
- apps/docs/src/pages/**
- apps/docs/src/content.config.*
- apps/docs/src/data/**
- apps/docs/src/scripts/**
- packages/**
- scripts/**
- .spec/**
- .github/**
- package.json
- pnpm-lock.yaml
- tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts
- tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/**
- Any path not explicitly listed in write_allowed.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES
Always:
- Use the prerequisite collection, engine-panel and snippet interfaces; stop with the exact missing interface if they cannot express the content contract.
- Keep one quadrant and one named audience per page; follow the content standard and locked glossary.
- Build and observe real content through the governed preview, record source-bound evidence, and close only owned contexts/processes.
- Keep task-local proofs separate from the shared lane owned by ORI-CONT-004; all acceptance rows remain non-primary.

Ask first:
- Changes to write permissions, dependency interfaces, engine values or literal commands.
- Any new package, route, component, deployment or additional product behavior.

### DELIVERABLE AND PAGE PLAN
- **apps/docs/src/content/docs/introduction.md** — explanation. Audience: React Native developers who understand components but have not used this registry. Reader job: Understand what the library supplies and how an application receives it. Success: After one reading, the reader identifies the universal React Native AI UI scope, copy-paste delivery, and absence of an npm runtime package. Shape: Opening identity paragraph, short scope and non-scope statements, one-line ownership teaser, descriptive onward links.
- **apps/docs/src/content/docs/installation.mdx** — how-to. Audience: Integrators with an existing Expo project who can inspect its installed packages and configuration. Reader job: Select the matching engine tree and install a registry item into that project. Success: The reader selects the engine from project facts and runs the complete corresponding install command. Shape: Prerequisites, project-fact decision table, one engine TabGroup, generated dev-client matrix, onward links.
- **apps/docs/src/content/docs/cli.md** — reference. Audience: Integrators who need this registry's URL and destination contract while working in a terminal. Reader job: Look up which absolute URL to add and which consumer files the operation writes. Success: The reader identifies the correct engine URL and destination without confusing this registry with a short-name web-registry install. Shape: Compact URL and file-destination reference, source-backed command example, authoritative upstream reference link.
- **tests/sprint-05-orient-search/orientation-content.spec.ts** — four task-local named browser checks over actual built pages.
- **tests/sprint-05-orient-search/evidence/ORI-CONT-001-content-review.md** — planned source-bound RED/GREEN, screenshot, DOM, command-provenance and editorial record.

### IMPLEMENTATION SURFACE
Author the three orientation pages using the implemented collection and snippet interfaces. Introduction opens with the complete product identity: universal AI chat and agent UI components for React Native, distributed as a copy-paste registry, and not an npm package. Its one-line ownership teaser links to the real boundary page supplied by ORI-CONT-005. Installation asks the engine question once, maps observable project configuration to the correct engine tree, and places every engine-specific instruction inside one engine TabGroup. Import the verified commands and consume the existing DevClientMatrix. CLI describes this registry's absolute-URL add contract, engine trees, and consumer-owned destination files; it links to the authoritative RNR CLI reference without copying the command catalog.

### BOUNDARY CONTRACTS
- Apply title, description, getting-started section, and order metadata through the schema delivered by ORI-AST-001.
- Use the locked terms engine, engine tree, registry item, family, verdict, peers, and dev client.
- Every page states its scope, names an appropriate non-scope, and links to a real next destination.
- Installation contains exactly one engine tab group. Its nativewind panel contains the literal command npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json. Its uniwind panel contains the corresponding /r/uniwind/conversation.json command.
- Distinguish the NativeWind package version from the Tailwind major. Current project evidence shows NativeWind 4.2.6 with Tailwind v3; do not teach the stale PRD phrase nativewind v3 as the installed package version.
- Code blocks come from real source or the compiled snippet package. Markdown does not carry a separately maintained executable copy.
- Do not insert links to the unimplemented Sprint 06 troubleshooting guide. Link to the real installation matrix, item pages, and boundary explanation available in this sprint.

### AGENT INSTRUCTIONS
1. Read the core references and source material. Confirm the seven dependency contracts and exact command-install evidence. Use the delivered interfaces; report missing capabilities without widening this task.
2. RED: add one named AC test to the allowed spec. Build the real pre-change candidate, run its exact VERIFY and capture an observed content assertion failure. Missing test registration, build errors and authored success flags do not prove RED.
3. GREEN: author only the corresponding content, rebuild through the production gates and rerun the same test. Capture the asserted values through the real browser, including each required target.
4. REFACTOR: edit only for the assigned page job and clarity; keep the same tests green. Run the full task command, typecheck and lint after the four ACs.
5. Hand the evidence to techwriting-reviewer. ORI-CONT-004 owns the separate shared flow; this task neither edits its test nor writes its evidence. No implementation or product verification occurs during this rendering response.

### READING LIST
1. .spec/prds/docs-site/11-technical-requirements/12-content-standards.md [PRIMARY PATTERN] — lines 7-38. Voice, glossary, authored-page templates, source-backed snippets and real links.
2. AGENTS.md — Distribution and ownership sections. Product identity and consumer ownership.
3. apps/docs/src/components/InstallCommand.astro — lines 1-62. Literal absolute commands and existing TabGroup ownership; consume the prerequisite composition without nesting a second group.
4. apps/docs/src/components/DevClientMatrix.astro — lines 1-52. Consume the existing dataset-backed matrix without duplicating its data.
5. tests/sprint-04-generated-reference/exact-absolute-url-command-copy.spec.ts — lines 1-262. Repository real-browser command and initial-HTML proof conventions; retain this task's own test path.

Additional source material, read-only:
- packages/registry/registry.json
- apps/example/components.json
- apps/harness-nativewind/package.json
- apps/harness-nativewind/tailwind.config.js
- [RNR CLI reference](https://reactnativereusables.com/docs/cli)

PRD/capability references:
- .spec/prds/docs-site/04-uc-docs.md#uc-docs-01
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md
- UC-DOCS-01
- CAP-DOCS-01

### DESIGN AND CODING GUIDANCE
Use existing docs typography and components. Introduction stays explanation, Installation stays how-to, CLI stays reference. Installation has one engine TabGroup containing all engine-specific instructions; do not nest InstallCommand's existing group inside another. Consume the prerequisite composition interface or report the exact blocker.

- Active voice, short sentences, second person and present tense; define acronyms on first use and put the key point first.
- Use engine, engine tree, registry item, family, verdict, peers and dev client consistently; distinguish NativeWind 4.2.6 from Tailwind v3.
- Use schema-delivered title, description, getting-started section and order metadata; do not invent schema fields.
- Executable examples come from real source or the compiled snippet package; Playwright observes real built pages and specific product targets, never generic roots as success oracles.

Agent rationale: techwriting-planner defines each page's quadrant, audience and scope; techwriting-implementer authors verified prose; techwriting-reviewer checks source accuracy, editorial quality and real browser evidence.

### VERIFICATION GATES
1. **Dependency and identity readiness.** All seven prerequisite contracts and real command-install evidence are available; record candidate identity and verify ownership of localhost:4321.
2. **Ordered production build** — `pnpm --filter @rnr-ai-elements/docs build`. Require exit 0 through the delivered registry/gallery/docs-data, snippet, Astro, Pagefind and link gates; serve that exact dist.
3. **RED-first per acceptance criterion.** Run each AC's exact VERIFY before its prose change and capture an actual content assertion failure; rebuild and rerun after each change.
4. **Task content proof** — `pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts`. Require exit 0 with all four named tests and desktop, mobile and JavaScript-disabled behavior exercised; capture values and images.
5. **Typecheck** — `pnpm typecheck`. Require exit 0; this root gate does not by itself prove authored docs or native behavior.
6. **Lint** — `pnpm lint`. Require exit 0; do not bypass a failing gate.
7. **Shared getting-started flow** — `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`. ORI-CONT-004 executes its locked lane after integration; its exact run.json and proof.red remain future outputs.
8. **Scope and independent editorial review** — `git diff --name-only`. Changed tracked files must be a subset of write_allowed. techwriting-reviewer checks source-backed claims, page quadrants, glossary, links and captured values.
9. **Scenario/flow contracts** — pipe normalized `{fixtures, requirements}` to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` with no positional argument and require zero findings. The orchestrator separately validates full-sprint flow ownership.

### EVIDENCE GATES
- All paths are planned outputs. Record task-local observed RED failures and subsequent GREEN results per AC in tests/sprint-05-orient-search/evidence/ORI-CONT-001-content-review.md; do not replace functional failures with missing-test or compiler errors.
- The content review records run ID, candidate/lockfile/dist/test/driver/policy hashes, exact commands, owned preview PID, response statuses, final URLs, assertion values, snippet/install provenance and the reviewer's page-by-page editorial findings.
- Capture and inspect Introduction and both Installation panels in desktop/mobile browsers, plus readable no-JavaScript bodies. Embed captured images and relevant DOM/stdout excerpts in the allowed Markdown evidence file; temporary captures use only owned OS-derived scratch.
- ORI-CONT-004 retains the shared flow's exact run.json and proof.red paths. Consume its source-bound observed RED/GREEN evidence; never write those paths from this task or substitute red.txt/run.red.
- Unavailable dependencies, source command evidence, substantive destinations or required browser projects block acceptance. A passing source inspection or validator does not establish product behavior.

### OUT OF SCOPE
- Implementing collection routing, TabGroup behavior, snippet compilation, matrix data or shared components.
- Authoring Theming, Dark mode, ownership explanations, Quickstart or the Sprint 06 troubleshooting guide.
- Changing registry artifacts, dependencies, provider/model logic, native components or deployment configuration.
- Owning shared RED files, claiming PRIMARY flow ownership or authoring post-integration journey proofs.

### CONTEXT
Current gap: The three allowed authored page files are absent from the inspected source inventory; collection, panel and snippet prerequisites must land before their integration. No product RED was observed during planning.

Success state: Introduction, Installation and CLI have substantive built bodies, source-backed examples, correct metadata and real onward links; task-local browser evidence and the shared getting-started proof satisfy their contracts.

Task classification: Authored documentation over existing collection and UI interfaces, with real end-to-end content tests. Task-owned non-FEATURE proofs use flow_ref:null; shared flow ownership stays with ORI-CONT-004.

Fixed sprint gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). The locked sprint retains 13 flows: 9 task flows and 4 journeys. This task supplies no journey proof.

### REVIEW
Must pass:
- All four AC/TC pairs have captured real-browser values and observed RED-before-GREEN evidence.
- Every executable example traces to real verified source and command-install evidence.
- Page quadrants, glossary, metadata, real links and the four-entry matrix meet the content contract.
- The five-path write scope and ORI-CONT-004's shared proof ownership remain unchanged.
- No stub, fake success, runtime skip or TODO-style deferral substitutes for required behavior.

Should verify:
- The opening identity is clear after one reading.
- Steps use imperative verbs and expected results; CLI remains compact reference.
- Desktop/mobile and JavaScript-disabled readers can read the matching complete commands.

Verdict: APPROVED or NEEDS_FIXES after independent execution; not yet reviewed. NEEDS_FIXES feedback identifies the failed AC, actual observed value and corrective file/line.

### DEPENDENCIES
Depends on: ORI-AST-001, ORI-AST-002, ORI-RN-001, ORI-CONT-005, ORI-CONT-002, ORI-AST-003.

Blocks: no additional dependency edges declared by this rendering.

Provides:
- Three orientation pages with their preserved page_plan and content contracts.
- Task-owned real-browser content checks and a source-bound editorial evidence record.
- Authored content consumed by ORI-CONT-004's getting-started acceptance lane.

Consumes:
- The implemented collection/schema, engine-panel and snippet interfaces from the listed Astro prerequisites.
- ORI-RN-001's actual canonical CLI installation evidence.
- ORI-CONT-005's substantive ownership page and ORI-CONT-002's related getting-started content.
- Existing InstallCommand, DevClientMatrix, registry metadata and consumer configuration; read-only inputs.

### SHARED FLOW SUPPORT AND PROVENANCE
Only ORI-GATE-01 lists this task in exercises. Preserve the source task's three flow_refs as references; do not invent bindings or PRIMARY claims for the two references absent from relevant_human_flows.

- FLOW_REF: FLOW-DOCS-01-getting-started-engine-decision
- PRIMARY: false; PRIMARY_OWNER: ORI-CONT-004
- TEST_FILE: tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts
- TEST_FUNCTION: FLOW-DOCS-01-getting-started-engine-decision
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
- ARTIFACT: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json
- RED_PROOF: tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red
- GATE_STEPS: [1]
- Flow co-authored_by: [astro-planner, techwriting-planner, frontend-designer]
- RED proof contract: Run this same real-browser flow against the recorded preimplementation source, preserve the actual observed failure and exact command output at red_proof, then run the completed candidate. Source absence or an authored success flag is not RED/GREEN evidence.

Source task IDs: ORI-CONT-001. Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/techwriting-planner-absorb-prerequisites.json. Task co_authored_by: [].

### PLANNING VALIDATION
The normalized fixtures/requirements passed the read-only scenario validator on stdin: exit 0, 4 scenarios, zero findings. Product commands and all evidence paths remain future execution outputs.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CONT-001","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"orientation_preview":{"description":"Build the candidate's real authored content, registry/gallery/docs-data and compiled snippets through the ordered production build; serve its dist on the owned localhost:4321 preview. Open fresh desktop, mobile and JavaScript-disabled browser contexts with empty localStorage.","seed_method":"cli","records":["Source SHA, lockfile, dist, test/driver, surface-policy and coldboot-policy hashes plus a fresh run ID and owned preview PID.","Real source inputs: packages/registry/registry.json, apps/example/components.json, apps/harness-nativewind/package.json and apps/harness-nativewind/tailwind.config.js.","Prerequisites supply the content schema, single engine TabGroup composition, verified command snippets, boundary page, Theming and Dark mode pages, and existing DevClientMatrix data."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Opening identity and ownership destination","primary":false,"description":"GIVEN the built candidate and a fresh browser context WHEN the reader opens Introduction and follows its ownership link THEN the opening identifies universal React Native AI UI, registry delivery, and package absence; the boundary page explains ownership.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/orientation-content.spec.ts","test_function":"ORI-CONT-001-identity","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-identity","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-001-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["The route serves an empty shared shell or the ownership link points to missing content."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Navigate to http://localhost:4321/docs/introduction and inspect its opening paragraph.","Follow the ownership teaser link to /docs/owns-vs-does-not-own and read its authored body."]},"end_state":{"must_observe":["HTTP 200 and heading 'Introduction'; the opening names 'React Native', 'AI chat', 'agent UI', 'copy-paste registry' and 'not an npm package'.","HTTP 200 at '/docs/owns-vs-does-not-own'; the body assigns transcript state, transport and tool execution to the consumer."],"must_not_observe":["An empty authored body beneath the shared shell.","A 404 boundary destination or an npm runtime installation claim."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"One engine decision with complete commands","primary":false,"description":"GIVEN the built Installation page and the real project configuration inputs WHEN desktop and mobile readers choose each engine and a JavaScript-disabled reader reads the same page THEN one decision guide maps project facts to two labeled panels containing complete engine-specific commands.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/orientation-content.spec.ts","test_function":"ORI-CONT-001-engine-decision","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-engine-decision","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-001-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["Engine panels are static duplicates, commands are omitted, or a second nested TabGroup splits the instructions."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Open /docs/installation in fresh desktop and mobile contexts; read the project-fact decision table.","Select nativewind through the actual tab control and inspect its instruction panel."]},"end_state":{"must_observe":["Exactly 1 engine TabGroup and 1 engine question; 'NativeWind 4.2.6' with 'Tailwind v3' maps to 'nativewind'.","The nativewind panel contains 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json' in full."],"must_not_observe":["An empty nativewind instruction panel.","The nativewind command outside its corresponding panel or 'nativewind v3' presented as the installed package version."]}},{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Select uniwind through the actual tab control and inspect its instruction panel."]},"end_state":{"must_observe":["'Tailwind v4' with '@theme' maps to 'uniwind'.","The uniwind panel contains 'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json' in full."],"must_not_observe":["An empty uniwind instruction panel.","A nativewind URL displayed as the uniwind install command."]}},{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Open /docs/installation in a fresh browser context with JavaScript disabled; read both ordinary panel bodies without attempting enhancement-only controls."]},"end_state":{"must_observe":["Both 'nativewind' and 'uniwind' labels and their complete '/r/nativewind/conversation.json' and '/r/uniwind/conversation.json' commands are readable in the initial HTML."],"must_not_observe":["An empty fallback or a missing command body when JavaScript is disabled."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Registry-specific CLI reference","primary":false,"description":"GIVEN the built CLI page and verified registry installation evidence from its prerequisites WHEN the reader looks up engine URLs, destination files and the upstream reference THEN CLI explains absolute-URL add, both engine trees and consumer-owned destinations, and links to the authoritative CLI reference.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/orientation-content.spec.ts","test_function":"ORI-CONT-001-cli-reference","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-cli-reference","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-001-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["The CLI route is an empty shell or its example is disconnected from the verified source command."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Follow the CLI link to /docs/cli.","Read the registry URL and destination contract and inspect the source-backed command example and upstream reference link.","Compare the named destination contract with the real registry targets, components.json aliases and prerequisite clean-install evidence."]},"end_state":{"must_observe":["HTTP 200 and heading 'CLI'; the reference identifies '/r/nativewind/' and '/r/uniwind/' engine trees and absolute HTTPS registry-item URLs.","The destination explanation says installed files belong to the consumer and resolve through 'components.json' aliases.","The authoritative reference link targets 'https://reactnativereusables.com/docs/cli'; the displayed example matches 1 verified source command."],"must_not_observe":["An empty CLI body.","A short-name web-registry installation presented as this registry's command, or a copied upstream command catalog."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Collection metadata, generated matrix and editorial contract","primary":false,"description":"GIVEN the three authored pages compiled through the prerequisite schema and snippet interfaces WHEN the reader navigates their scope statements, generated content and onward links THEN all pages expose correct metadata and scoped prose; Installation renders the existing matrix and source-backed examples.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/orientation-content.spec.ts","test_function":"ORI-CONT-001-content-contract","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-content-contract","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-001-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs at http://localhost:4321, real filesystem content and generated snippets, and Playwright browsers.","negative_control":{"would_fail_if":["Content is replaced by a static empty shell, the matrix is omitted, or examples are disconnected from the real snippet inputs."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"orientation_preview","action":{"actor":"user","steps":["Visit Introduction, Installation and CLI through the built site; compare their headings, descriptions and navigation order with the real collection entries.","Inspect Installation's Dev client requirements table and compare its cells with the existing dataset.","Follow links to the installation matrix, real item pages, boundary explanation, Theming and Dark mode; review each page against its assigned quadrant and content standard.","Trace every executable example to real source or the compiled snippet package and inspect the authored files for separately maintained executable copies."]},"end_state":{"must_observe":["3/3 pages have non-empty 'title' and 'description', section 'getting-started' and schema-valid 'order' metadata reflected in the built page/navigation.","Installation's 'Dev client requirements' table contains 4 dataset-derived opt-in entries with the recorded packages and platform permissions.","Onward links resolve to substantive HTTP 200 destinations including '/components/conversation' and '/docs/owns-vs-does-not-own'.","3/3 pages state scope and non-scope, use active voice and precise terminology, and retain their 'explanation', 'how-to' and 'reference' jobs respectively; executable examples match their source bytes."],"must_not_observe":["An empty authored body, empty matrix or placeholder onward link.","A link to the unimplemented Sprint 06 troubleshooting guide or an independently maintained executable Markdown example."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The Introduction identity assertions and real boundary navigation pass with captured opening text and response statuses.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-identity","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The single engine decision, both complete commands, desktop/mobile selection and JavaScript-disabled panel assertions all pass.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-engine-decision","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The CLI absolute URLs, consumer destination explanation, verified example and authoritative reference assertions all pass.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-cli-reference","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The metadata, four-entry matrix, real onward links, source provenance and page-by-page editorial review all satisfy AC-4.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/orientation-content.spec.ts --grep ORI-CONT-001-content-contract","maps_to_ac":"AC-4"}]}
-->
</details>
