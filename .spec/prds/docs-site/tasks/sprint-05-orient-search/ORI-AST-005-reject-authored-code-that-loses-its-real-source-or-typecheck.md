## What this does

Authored snippets retain real source provenance and exact display/copy bytes, and the gate rejects broken bindings or real compiler failures before documentation is accepted.

## Why

The inspected tree extracts generated gallery usage snippets and renders CodeBlock/UsageSnippet, but has no authored md/mdx inventory command or SourceSnippet component. The existing copy handler trims text. Prerequisite authored content and source-owner packages remain required inputs. This safeguard supports runnable quickstarts and CAP-DOCS-01.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts` and `pnpm exec tsx scripts/docs-data/authored-snippets.ts` on the implementation candidate. Use real copied inputs, real owner compilers and real browser clipboard observations. Product verification and evidence capture remain future work.

## Scope

- scripts/docs-data/authored-snippets.ts
- apps/docs/src/components/SourceSnippet.astro
- tests/sprint-05-orient-search/authored-snippet-gate.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-005/manifest.json

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

# ORI-AST-005: Reject authored code that loses its real source or typecheck

> Status: Backlog
> Assignee: astro-implementer · Reviewer: astro-reviewer
> Priority: P1 · Points: 5 · Type: BUILD · Dependency phase: After ORI-AST-001
> Proposed By: astro-planner · Co-authored By: none
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

### OUTCOME

Authored snippets retain real source provenance and exact display/copy bytes, and the gate rejects broken bindings or real compiler failures before documentation is accepted.

### CRITICAL CONSTRAINTS — Never

- Never fabricate declarations, imports, components, compiler responses or runnable source packages; absent compiler contexts or dependencies fail closed.
- Preserve the four-path write allowlist and shared WIP; mutate only owned isolated copies for proof, never the shared source tree.
- Never exempt shell, CSS or configuration examples from committed provenance, omit an authored code block, or accept an empty discovery as proof of the real corpus.
- Never trim, normalize, reformat or substitute selected snippet bytes in rendering, emission checks or copying.
- Never replace real filesystem, compiler, Astro or browser/clipboard behavior with mocks, view injection, canned success, skips or test-only product seams.

### DONE WHEN

- [ ] AC-1/TC-1: the complete unchanged real corpus passes provenance inventory and owner compilers.
- [ ] AC-2/TC-2: missing/ambiguous/unbound inputs and empty discovery fail with attributable diagnostics.
- [ ] AC-3/TC-3: real rendering/copying preserves source bytes and one-byte emission drift fails.
- [ ] AC-4/TC-4: real compiler mutations fail for both engines; missing prerequisites cannot pass.
- [ ] All planned verification/evidence gates pass and only write_allowed paths change.

### RUNTIME_COMMANDS AND PROGRESS

```text
test: pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts
typecheck: pnpm typecheck
lint: pnpm exec biome ci scripts/docs-data/authored-snippets.ts tests/sprint-05-orient-search/authored-snippet-gate.test.ts tests/sprint-05-orient-search/evidence/ORI-AST-005/manifest.json
```

PROGRESS: 0/4 acceptance criteria verified; TDD_STATE is none for every AC.

Verification policy: `{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true}`.

### ACCEPTANCE CRITERIA

#### AC-1: Inventory and validate real source-backed code

GIVEN the real authored corpus and source-owner packages WHEN the snippet command runs THEN every code-bearing block has resolved provenance and unchanged sources pass.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real authored-snippets CLI, filesystem and source-owner TypeScript processes
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/authored-snippet-gate.test.ts
TEST_FUNCTION: ORI-AST-005-inventory
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-inventory`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-005-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real authored-snippets CLI, filesystem and source-owner TypeScript processes","negative_control":{"would_fail_if":["A static success command or disconnected inventory omits real files or compiler work.","Shell, CSS or configuration blocks are silently exempted from provenance."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Run pnpm exec tsx scripts/docs-data/authored-snippets.ts in the isolated real corpus; compare its inventory against the independently recorded authored blocks and sources."]},"end_state":{"must_observe":["Inventory count equals the independent nonempty block count; coverage includes 5 code kinds: TS, TSX, shell, CSS and configuration.","Every recorded document/snippet resolves to exactly 1 committed source file or region; nativewind and uniwind contexts both run, and the unchanged command exits 0."],"must_not_observe":["0 inventoried blocks, omitted authored code, empty provenance or success without compiler processes."]}}]}
```

#### AC-2: Reject missing, ambiguous and unbound sources

GIVEN fresh copies of the real corpus WHEN bindings are missing, ambiguous, unbound or undiscoverable THEN the command fails with document/snippet/source diagnostics.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real authored-snippets CLI and filesystem copies
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/authored-snippet-gate.test.ts
TEST_FUNCTION: ORI-AST-005-binding-rejections
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-binding-rejections`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-005-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real authored-snippets CLI and filesystem copies","negative_control":{"would_fail_if":["A no-op resolver accepts every binding or quietly omits invalid blocks.","A hardcoded first-match rule accepts duplicate regions or substitutes default sources."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["In separate real copies, remove a referenced file, remove its selected region, and duplicate the selected region marker; invoke the real snippet command after each mutation."]},"end_state":{"must_observe":["All 3 mutations exit nonzero and identify the actual document, snippet and source path plus the missing or ambiguous selection."],"must_not_observe":["Exit 0, blank diagnostic identities, a default source or selection of the first duplicate region."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Remove source bindings from copied TS/TSX, shell, CSS and configuration blocks while retaining their code; then run a separate case whose authored discovery root is missing or contains no documents."]},"end_state":{"must_observe":["All 4 unbound code groups fail with document/block identities; missing and empty corpus cases fail with an explicit discovery diagnostic.","Restoring the original bindings and corpus yields exit 0 with the original nonempty inventory."],"must_not_observe":["Exit 0 for unbound code, ignored fences, or an empty corpus accepted as complete."]}}]}
```

#### AC-3: Preserve emitted, displayed and copied bytes

GIVEN real whole-file and region selections WHEN SourceSnippet renders and copies them or emitted bytes drift THEN exact bytes survive and stale emission fails.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real Astro build, owned local HTTP server, Chromium and browser clipboard plus the real snippet command
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/authored-snippet-gate.test.ts
TEST_FUNCTION: ORI-AST-005-byte-fidelity
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-byte-fidelity`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-005-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro build, owned local HTTP server, Chromium and browser clipboard plus the real snippet command","negative_control":{"would_fail_if":["SourceSnippet uses the shared trim() handler or a static canned snippet instead of selected source.","The command's emitted-byte comparison is disconnected, omitted or compares output only with itself."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Build actual docs using SourceSnippet in the isolated corpus; serve the built output on an owned reserved local port and launch real Chromium from the task test.","For whole-file and named-region snippets, read the product code text, click that snippet's actual Copy control and read navigator.clipboard.readText(); compare all bytes to the independently selected source, including boundary whitespace."]},"end_state":{"must_observe":["For at least 2 selections, rendered code text and real clipboard text equal selected source byte-for-byte; lengths and SHA-256 hashes match.","The multiline selection retains its original leading whitespace and final newline: 0 bytes trimmed."],"must_not_observe":["Empty or placeholder code, blank clipboard, trimmed boundary bytes or a mocked clipboard response."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Change exactly one byte of a real emitted source-backed snippet in a fresh physical output copy; invoke the production snippet comparison through the real command with that output as its real artifact input, then repeat with the untouched output."]},"end_state":{"must_observe":["The 1-byte drift causes nonzero exit with document/snippet/source identity and a byte mismatch; untouched emission exits 0."],"must_not_observe":["Exit 0 for stale emission, an empty comparison set or re-emission that silently overwrites the corrupted artifact before checking it."]}}]}
```

#### AC-4: Enforce real compiler contexts for both engines

GIVEN real source-owner programs WHEN imports, component props or compiler prerequisites break THEN both engines fail closed through actual compiler processes.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real nativewind/uniwind source-owner TypeScript compilers and live-example import-graph compiler
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/authored-snippet-gate.test.ts
TEST_FUNCTION: ORI-AST-005-owner-compilers
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-owner-compilers`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-005-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real nativewind/uniwind source-owner TypeScript compilers and live-example import-graph compiler","negative_control":{"would_fail_if":["A mock compiler, static success receipt or omitted engine reports green without the actual source graph.","Ambient any declarations or disconnected imports hide the invalid component prop or missing dependency."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Run the command on unchanged source-owner inputs and capture executable, cwd, effective config, included source graph, dependency identity and exit status for every real compiler process."]},"end_state":{"must_observe":["Both engine identities, nativewind and uniwind, have real compiler receipts with exit 0; the live-example source uses its owning import-graph compiler."],"must_not_observe":["0 compiler receipts, an empty source graph or a root-only parser reported as source-owner compilation."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["In fresh copies for each engine, change one real import to __ori_ast_005_missing__ and, separately, add __ori_ast_005_invalid_prop__ to a real typed component use; run the command and then restore original bytes."]},"end_state":{"must_observe":["All 4 mutation runs exit nonzero; actual compiler diagnostics include __ori_ast_005_missing__ or __ori_ast_005_invalid_prop__ and the document/snippet/source identities.","Restored nativewind and uniwind sources pass again with exit 0."],"must_not_observe":["Exit 0 on corrupted sources, blank compiler diagnostics or replacement declarations that make the invalid symbols legal."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Separately remove the owning compiler context, source package or a required installed dependency from real copies; invoke the command for each case."]},"end_state":{"must_observe":["All 3 missing-prerequisite cases fail nonzero and name the unavailable context, package or dependency."],"must_not_observe":["Exit 0, no compiler invocation accepted as success, a skipped engine or fallback to a fabricated context."]}}]}
```

### TEST CRITERIA

- **TC-1 → AC-1:** The independent nonempty authored inventory matches the command, every block resolves once, and unchanged real source-owner programs pass. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-inventory`
- **TC-2 → AC-2:** Every missing, ambiguous, unbound and empty-discovery case fails with attributable diagnostics; restored real inputs pass. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-binding-rejections`
- **TC-3 → AC-3:** Actual rendered and clipboard bytes equal selected source, and a one-byte emitted drift fails the production comparison. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-byte-fidelity`
- **TC-4 → AC-4:** Both real engine compilers reject invalid imports and props; missing compiler inputs fail closed and restored programs pass. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-owner-compilers`

### FIXTURES

```json
{"real_authored_sources":{"description":"An owned filesystem copy of the actual authored md/mdx corpus and its committed source-owner packages after ORI-AST-001 and the source handoffs; no substituted examples.","seed_method":"cli","records":["Copy actual docs and source packages through filesystem CLI operations into an OS-derived owned scratch root; preserve relative paths, package manifests, tsconfig files and real dependency resolution.","Before invoking the gate, record the independent authored-file/block inventory, selected source bytes and SHA-256 hashes. Require nonempty TS, TSX, shell, CSS and configuration examples and both nativewind and uniwind source packages; missing inputs block setup.","Use the actual document/snippet/source/region identities from those inputs. Retain at least one whole-file binding, one named-region binding and one multiline selection with boundary whitespace.","Keep originals read-only. Each corruption case receives a fresh physical copy, and restored cases use the recorded original bytes. No virtual filesystem, injected view, compiler mock or replacement declaration surface."]}}
```

### SCOPE — file-level permissions

writeAllowed:

- scripts/docs-data/authored-snippets.ts
- apps/docs/src/components/SourceSnippet.astro
- tests/sprint-05-orient-search/authored-snippet-gate.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-005/manifest.json

writeProhibited:

- .spec/**
- packages/**
- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- apps/docs/src/content/**
- apps/docs/src/scripts/copy-button.ts
- apps/docs/src/components/CodeBlock.astro
- apps/docs/src/components/UsageSnippet.astro
- .github/**
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- scripts/docs-data/prebuild.ts
- scripts/docs-data/gates.ts
- Any repository path not in write_allowed.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:

- Read real authored inputs and source-owner manifests; enumerate every code-bearing block and retain document, snippet, source and compiler-context identity.
- Use actual source-owner TypeScript programs and installed dependencies for both engines; retain the live-example owner's approved import-graph boundary.
- Keep SourceSnippet source selection at build time and copy the displayed text without normalization; the shared trimming handler is a reference, not an exact-byte implementation.
- Capture RED before GREEN, source hashes, command/process results and seeded byte/compiler observations in the allowed manifest.
- Use OS-derived owned scratch roots, terminate only recorded children and remove only owned copies on every exit path.

Ask first:

- Any write outside the four allowed repository paths, dependency/version change or compiler-scope expansion.
- Changes to shared copy behavior, authored pages, native source packages, live-example logic or CI orchestration.
- A missing source-owner handoff that requires changing the locked task dependency graph or product scope.

Boundary contracts:

- Authored documentation selects real source; it does not redefine application logic.
- SourceSnippet preserves the displayed and copied bytes.
- A missing compiler context, source package, or dependency fails closed.
- The native specialist supplies runnable quickstart/setup sources; the AI SDK specialist supplies the live example sources.
- Compiler declarations, imports, or components are never fabricated to make snippets pass.

### DELIVERABLE

- `scripts/docs-data/authored-snippets.ts` (NEW): Inventory and resolve authored source bindings; compare emitted bytes; run real owner compilers with attributable failure diagnostics.
- `apps/docs/src/components/SourceSnippet.astro` (NEW): Render source selections and preserve exact displayed/copied bytes within this component.
- `tests/sprint-05-orient-search/authored-snippet-gate.test.ts` (NEW): Own the four named real filesystem/compiler/browser proof tests with isolated mutation cases.
- `tests/sprint-05-orient-search/evidence/ORI-AST-005/manifest.json` (NEW): Record future per-run source identities, RED/GREEN results and captured seeded observations.

### IMPLEMENTATION SPECIFICATION

Provide source-addressed snippet rendering and a command that inventories all code-bearing blocks in authored md/mdx. Require real file or named-region provenance, reject missing or ambiguous sources and handwritten unbound fences, and compare emitted snippets to their selected source. Run actual source-owner TypeScript compilers for TS/TSX in their real dependency contexts. Verify both engine variants against the native specialist's real source packages. Shell, CSS, and configuration examples require committed source provenance rather than a prose exemption. Diagnostics identify the document, snippet, source file, and compiler failure. CI wires this command into the ordered docs build.

Use the existing docs code-surface tokens and selectable static text. Source selection and filesystem access stay at build time. Implement any necessary exact-copy behavior inside SourceSnippet.astro; do not alter the shared trimming handler or add a design system.

The source gate must be deterministic. Inventory every code-bearing md/mdx block, resolve provenance, compare real emitted bytes, then run all required owner compilers. Do not execute shell examples to prove provenance. CI consumes the command and owns ordered-build wiring outside this task's permissions.

### AGENT INSTRUCTIONS — TDD

- **RED:** For each AC, write its named test first and observe a behavioral assertion failure against the real missing/disconnected capability. Record the exact command and failure under proof.red in the manifest; dependency setup errors are blockers, not functional RED.
- **GREEN:** After RED verification, implement the minimum behavior inside the two owned production files. Run that exact AC selector against the real copied inputs and dependencies, then record seeded observations and GREEN output.
- **REFACTOR:** Refactor only within the allowed paths without changing behavior. Rerun the affected proof, then the task's two locked commands and planned typecheck/lint gates.
- **HANDOFF:** Provide the candidate identity and manifest to astro-reviewer for independent checks; CI owns ordered-build wiring. All commands and evidence in this charter remain planned until actually observed.

### READING LIST

1. `scripts/docs-data/usage-snippet.ts` [PRIMARY PATTERN] · lines 1-75 — Read-only extraction with source identity and fail-closed diagnostics; its parser configuration is not a source-owner compiler.
2. `apps/docs/src/components/CodeBlock.astro` · lines 1-46 — Code surface and token conventions; keep this file unchanged.
3. `apps/docs/src/scripts/copy-button.ts` · lines 20-44 — Real clipboard behavior includes trim(); SourceSnippet must preserve exact bytes within its owned component.
4. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md` — Content gates and committed code provenance.
5. `/Users/justinrich/Projects/brain/docs/kanban/SCENARIO-CONTRACT-V1.md` — Real seeds, negative controls and captured observations for every behavioral AC.

### CODING STANDARDS

- Use typed TypeScript boundaries and node:fs/node:path for real files; parse actual md/mdx structure rather than trusting a list that can omit code.
- Resolve a file or one unambiguous named region; preserve its original bytes and report document/snippet/source coordinates on failure.
- Spawn real compiler executables with argument arrays in each owning package context; propagate nonzero exits and sanitized diagnostics.
- Keep nativewind and uniwind dependency contexts separate; never replace them with root-only parsing, ambient any declarations or synthetic tsconfig surfaces.
- Use pnpm and existing dependencies; source inputs remain read-only. No holdout inspection, test bypass or unrelated repair.

### EVIDENCE GATES

1. **RED evidence:** Observe each selected task test fail on the real missing or disconnected behavior before implementation; capture assertion output, not import/runner setup errors.
2. **Task suite:** `pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts` — Exit 0; all four named acceptance tests run with real dependencies and no skipped cases.
3. **Real corpus command:** `pnpm exec tsx scripts/docs-data/authored-snippets.ts` — Exit 0 for unchanged inputs; every discovered block has provenance and every required source-owner compiler runs.
4. **Typecheck:** `pnpm typecheck` — Exit 0; does not substitute for source-owner or Astro proof.
5. **Lint:** `pnpm exec biome ci scripts/docs-data/authored-snippets.ts tests/sprint-05-orient-search/authored-snippet-gate.test.ts tests/sprint-05-orient-search/evidence/ORI-AST-005/manifest.json` — Exit 0 on owned supported files; actual Astro build in AC-3 verifies SourceSnippet.astro.

- Every AC and TC has an exact test binding; the manifest records real seeded observations, compiler executable/cwd/config identities, exit codes and sanitized failure diagnostics.
- Every RED record precedes GREEN for the same test/command identity. Store proof.red and GREEN stdout as named records inside the allowlisted manifest; additional tracked evidence paths are not authorized.
- For byte proof, record the selected source bytes, rendered text and real clipboard text or their SHA-256 hashes plus lengths and mismatch positions; capture each engine's source/package identity.
- Bind evidence to candidate source, lockfile, source packages and test/command hashes; preserve prior run entries. All evidence paths are planned future outputs.
- Reviewer checks exact scope, absence of stubs/skips and per-AC Scenario Contract; parent validates full-sprint flow coverage. This BUILD task owns no task flow or journey.

Locked verification contract: Use isolated filesystem copies of actual docs and their real source packages. Prove that the real command rejects a missing region, source drift, an invalid import, and an invalid component prop through real compiler processes; prove the unchanged sources pass. No virtual filesystem, compiler mock, or replacement declaration surface.

Planned manifest: `tests/sprint-05-orient-search/evidence/ORI-AST-005/manifest.json`. Artifact status: `planned_output_not_observed`.

Proof ownership: All ACs use task-owned non-FEATURE integration/e2e proofs with flow_ref:null and surface_policy:null; the compact input supplies no locked flow or policy. The real CLI/compiler/browser surfaces and specific observed targets are fully specified in each scenario.

### OUT OF SCOPE

- CI workflow, package-script and ordered-build wiring edits; provide the command to their owner.
- Authoring or repairing quickstart/setup/live-example source packages and authored documentation.
- Changes to the shared CopyButton handler, CodeBlock, UsageSnippet, registry components or dependency pins.
- Native/device/provider acceptance, public installation, deployment, Pagefind/search, link checks or ownership of locked sprint journeys.
- Broad gallery or whole-example repairs; a failure in a required source graph blocks acceptance and is not waived.

### CONTEXT AND REFERENCES

Current gap: The inspected tree extracts generated gallery usage snippets and renders CodeBlock/UsageSnippet, but has no authored md/mdx inventory command or SourceSnippet component. The existing copy handler trims text. Prerequisite authored content and source-owner packages remain required inputs.

Success state: The unchanged real authored corpus passes a complete inventory and its source-owner compilers. Isolated missing-source, ambiguous-region, unbound-code, drift, invalid-import and invalid-prop cases fail with attributable diagnostics; real rendered and clipboard bytes match selected source.

Agent rationale: astro-planner defines the authored-content/build boundary; astro-implementer owns the source gate and Astro wrapper; astro-reviewer independently checks real compiler rejection and byte fidelity. Native and AI SDK specialists own runnable source logic.

Capability: CAP-DOCS-01.

PRD references:

- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md#content-gates-ci
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json` · Source task IDs: ORI-AST-005 · Co-author provenance: none · Supersedes: none.

Dark justification: This build safeguard has no separate site control. Its discriminating proof is the real snippet command rejecting corrupted source bindings or compiler inputs. The supported user outcome is the runnable quickstart.

Supported discriminating step: `ORI-DARK-ORI-AST-005`. Human test hook: null. No task-flow or journey ownership.

Fixed sprint gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)

The locked sprint retains 13 flows (9 task, 4 journey), 36 tasks and 131 points. This charter changes none of them.

### REVIEW — astro-reviewer

Must pass:

- All four ACs have observed RED then GREEN with required real seeded evidence.
- Inventory includes all authored code and fails on missing/ambiguous provenance or stale emission.
- Actual owner compilers reject invalid imports and props, and missing contexts/dependencies fail closed for both engines.
- Real Astro output and browser clipboard preserve source bytes, including boundary whitespace; no shared copy-handler edit.
- Only the four allowed paths changed; no mocks, fake declarations, skips or deferred required behavior remain.

Should verify:

- Diagnostics identify document, snippet, source path and compiler failure without leaking credentials.
- The gate shares production extraction/comparison logic with SourceSnippet without constructing a second source of truth.
- CI receives the exact command and integration readiness; no claim that wiring or hosted acceptance ran in this task.
- Cleanup affects only owned scratch files, servers and browsers.

Verdict: Pending independent review. Return APPROVED or NEEDS_FIXES only after independent execution; include actionable evidence for any failure.

### DEPENDENCIES

Depends on: ORI-AST-001, ORI-CONT-001, ORI-CONT-003.

Blocks: no downstream IDs supplied. Declared dependencies are ORI-AST-001, ORI-CONT-001 and ORI-CONT-003; the gate runs after the authored corpus exists. No downstream task IDs are declared in the compact input; CI owns wiring outside this allowlist.

Provides:

- scripts/docs-data/authored-snippets.ts: production source inventory, binding validation, byte comparison and source-owner compiler command.
- apps/docs/src/components/SourceSnippet.astro: source-addressed rendering with byte-preserving copy behavior.
- Task-owned real filesystem/compiler/browser integration proof and manifest for CAP-DOCS-01.
- The exact snippet command for the CI owner's ordered docs-build integration.

Consumes:

- ORI-AST-001's authored md/mdx substrate and discovery convention.
- Native specialist's committed runnable quickstart/setup sources and real compiler contexts for nativewind and uniwind.
- AI SDK specialist's committed live-example sources and real import-graph compiler context.
- Existing CodeBlock/UsageSnippet display conventions and production copy behavior as read-only references.

Execution preconditions:

- **VP-EXECUTION-SCOPE** (not_executed): Planning only; all product commands, compiler runs, browser proof and evidence capture are future execution.
- **VP-ORI-AST-005-INPUTS** (requires_source_owner_handoff): ORI-AST-001 and source owners must supply actual authored docs, both native engine packages and the live-example compiler context. Missing inputs block acceptance; never fabricate substitutes.
- **VP-ORI-AST-005-ISOLATION** (requires_setup): Use an assigned isolated candidate and owned OS-derived scratch copies with real installed dependencies. Reserve an owned local browser-proof server, record its port/PID and refuse unowned listeners.
- **VP-EXAMPLE-DIAGNOSTICS** (required_boundary): Root typecheck excludes apps. Use the source owner's real live-chat import graph; do not claim whole-example green or repair the broader gallery.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-005","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"real_authored_sources":{"description":"An owned filesystem copy of the actual authored md/mdx corpus and its committed source-owner packages after ORI-AST-001 and the source handoffs; no substituted examples.","seed_method":"cli","records":["Copy actual docs and source packages through filesystem CLI operations into an OS-derived owned scratch root; preserve relative paths, package manifests, tsconfig files and real dependency resolution.","Before invoking the gate, record the independent authored-file/block inventory, selected source bytes and SHA-256 hashes. Require nonempty TS, TSX, shell, CSS and configuration examples and both nativewind and uniwind source packages; missing inputs block setup.","Use the actual document/snippet/source/region identities from those inputs. Retain at least one whole-file binding, one named-region binding and one multiline selection with boundary whitespace.","Keep originals read-only. Each corruption case receives a fresh physical copy, and restored cases use the recorded original bytes. No virtual filesystem, injected view, compiler mock or replacement declaration surface."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Inventory and validate real source-backed code","description":"GIVEN the real authored corpus and source-owner packages WHEN the snippet command runs THEN every code-bearing block has resolved provenance and unchanged sources pass.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/authored-snippet-gate.test.ts","test_function":"ORI-AST-005-inventory","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-inventory","test_tier":"integration","verification_service":"Real authored-snippets CLI, filesystem and source-owner TypeScript processes","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-AST-005-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real authored-snippets CLI, filesystem and source-owner TypeScript processes","negative_control":{"would_fail_if":["A static success command or disconnected inventory omits real files or compiler work.","Shell, CSS or configuration blocks are silently exempted from provenance."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Run pnpm exec tsx scripts/docs-data/authored-snippets.ts in the isolated real corpus; compare its inventory against the independently recorded authored blocks and sources."]},"end_state":{"must_observe":["Inventory count equals the independent nonempty block count; coverage includes 5 code kinds: TS, TSX, shell, CSS and configuration.","Every recorded document/snippet resolves to exactly 1 committed source file or region; nativewind and uniwind contexts both run, and the unchanged command exits 0."],"must_not_observe":["0 inventoried blocks, omitted authored code, empty provenance or success without compiler processes."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Reject missing, ambiguous and unbound sources","description":"GIVEN fresh copies of the real corpus WHEN bindings are missing, ambiguous, unbound or undiscoverable THEN the command fails with document/snippet/source diagnostics.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/authored-snippet-gate.test.ts","test_function":"ORI-AST-005-binding-rejections","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-binding-rejections","test_tier":"integration","verification_service":"Real authored-snippets CLI and filesystem copies","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-AST-005-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real authored-snippets CLI and filesystem copies","negative_control":{"would_fail_if":["A no-op resolver accepts every binding or quietly omits invalid blocks.","A hardcoded first-match rule accepts duplicate regions or substitutes default sources."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["In separate real copies, remove a referenced file, remove its selected region, and duplicate the selected region marker; invoke the real snippet command after each mutation."]},"end_state":{"must_observe":["All 3 mutations exit nonzero and identify the actual document, snippet and source path plus the missing or ambiguous selection."],"must_not_observe":["Exit 0, blank diagnostic identities, a default source or selection of the first duplicate region."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Remove source bindings from copied TS/TSX, shell, CSS and configuration blocks while retaining their code; then run a separate case whose authored discovery root is missing or contains no documents."]},"end_state":{"must_observe":["All 4 unbound code groups fail with document/block identities; missing and empty corpus cases fail with an explicit discovery diagnostic.","Restoring the original bindings and corpus yields exit 0 with the original nonempty inventory."],"must_not_observe":["Exit 0 for unbound code, ignored fences, or an empty corpus accepted as complete."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Preserve emitted, displayed and copied bytes","description":"GIVEN real whole-file and region selections WHEN SourceSnippet renders and copies them or emitted bytes drift THEN exact bytes survive and stale emission fails.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/authored-snippet-gate.test.ts","test_function":"ORI-AST-005-byte-fidelity","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-byte-fidelity","test_tier":"e2e","verification_service":"Real Astro build, owned local HTTP server, Chromium and browser clipboard plus the real snippet command","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-AST-005-3","use_case_ref":"UC-DOCS-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro build, owned local HTTP server, Chromium and browser clipboard plus the real snippet command","negative_control":{"would_fail_if":["SourceSnippet uses the shared trim() handler or a static canned snippet instead of selected source.","The command's emitted-byte comparison is disconnected, omitted or compares output only with itself."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Build actual docs using SourceSnippet in the isolated corpus; serve the built output on an owned reserved local port and launch real Chromium from the task test.","For whole-file and named-region snippets, read the product code text, click that snippet's actual Copy control and read navigator.clipboard.readText(); compare all bytes to the independently selected source, including boundary whitespace."]},"end_state":{"must_observe":["For at least 2 selections, rendered code text and real clipboard text equal selected source byte-for-byte; lengths and SHA-256 hashes match.","The multiline selection retains its original leading whitespace and final newline: 0 bytes trimmed."],"must_not_observe":["Empty or placeholder code, blank clipboard, trimmed boundary bytes or a mocked clipboard response."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Change exactly one byte of a real emitted source-backed snippet in a fresh physical output copy; invoke the production snippet comparison through the real command with that output as its real artifact input, then repeat with the untouched output."]},"end_state":{"must_observe":["The 1-byte drift causes nonzero exit with document/snippet/source identity and a byte mismatch; untouched emission exits 0."],"must_not_observe":["Exit 0 for stale emission, an empty comparison set or re-emission that silently overwrites the corrupted artifact before checking it."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Enforce real compiler contexts for both engines","description":"GIVEN real source-owner programs WHEN imports, component props or compiler prerequisites break THEN both engines fail closed through actual compiler processes.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/authored-snippet-gate.test.ts","test_function":"ORI-AST-005-owner-compilers","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-owner-compilers","test_tier":"integration","verification_service":"Real nativewind/uniwind source-owner TypeScript compilers and live-example import-graph compiler","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-AST-005-4","use_case_ref":"UC-DOCS-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real nativewind/uniwind source-owner TypeScript compilers and live-example import-graph compiler","negative_control":{"would_fail_if":["A mock compiler, static success receipt or omitted engine reports green without the actual source graph.","Ambient any declarations or disconnected imports hide the invalid component prop or missing dependency."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Run the command on unchanged source-owner inputs and capture executable, cwd, effective config, included source graph, dependency identity and exit status for every real compiler process."]},"end_state":{"must_observe":["Both engine identities, nativewind and uniwind, have real compiler receipts with exit 0; the live-example source uses its owning import-graph compiler."],"must_not_observe":["0 compiler receipts, an empty source graph or a root-only parser reported as source-owner compilation."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["In fresh copies for each engine, change one real import to __ori_ast_005_missing__ and, separately, add __ori_ast_005_invalid_prop__ to a real typed component use; run the command and then restore original bytes."]},"end_state":{"must_observe":["All 4 mutation runs exit nonzero; actual compiler diagnostics include __ori_ast_005_missing__ or __ori_ast_005_invalid_prop__ and the document/snippet/source identities.","Restored nativewind and uniwind sources pass again with exit 0."],"must_not_observe":["Exit 0 on corrupted sources, blank compiler diagnostics or replacement declarations that make the invalid symbols legal."]}},{"start_ref":"real_authored_sources","action":{"actor":"cli_user","steps":["Separately remove the owning compiler context, source package or a required installed dependency from real copies; invoke the command for each case."]},"end_state":{"must_observe":["All 3 missing-prerequisite cases fail nonzero and name the unavailable context, package or dependency."],"must_not_observe":["Exit 0, no compiler invocation accepted as success, a skipped engine or fallback to a fabricated context."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The independent nonempty authored inventory matches the command, every block resolves once, and unchanged real source-owner programs pass.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-inventory","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Every missing, ambiguous, unbound and empty-discovery case fails with attributable diagnostics; restored real inputs pass.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-binding-rejections","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Actual rendered and clipboard bytes equal selected source, and a one-byte emitted drift fails the production comparison.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-byte-fidelity","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Both real engine compilers reject invalid imports and props; missing compiler inputs fail closed and restored programs pass.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/authored-snippet-gate.test.ts -t ORI-AST-005-owner-compilers","maps_to_ac":"AC-4"}]}
-->
</details>
