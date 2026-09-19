## What this does

Visitors search current published docs and registry references through an immediate keyboard-accessible dialog whose Pagefind resources load only after activation.

## Why

The inspected Header has a hidden data-search-slot; DocsLayout mounts ThemeToggle but no SearchDialog. The island-budget test currently enumerates four custom elements. Search implementation and functional RED remain unobserved.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery` against the owned current built preview. Inspect actual index results, destinations, timing, requests and focus. Run the index, island, typecheck and lint gates below. Product verification remains future work.

## Scope

The fifth search island, real post-build Pagefind index, owned tests and evidence. ORI-AST-009 composes the 404 later; ORI-AST-010 owns the later journeys.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-AST-004: Navigate the built docs through a lazily loaded Pagefind dialog

> Status: Backlog
> Assignee: astro-implementer · Priority: P1 · Points: 5 · Type: FEATURE
> Dependency phase: After all seven declared dependencies; before ORI-AST-009 recovery composition and ORI-AST-010 journey acceptance
> Proposed By: astro-planner · Co-authored By: []
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [sprint-05-orient-search](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer
> PROGRESS: 0/4 ACs; all TDD_STATE values are none.

### OUTCOME

Visitors search current published docs and registry references through an immediate keyboard-accessible dialog whose Pagefind resources load only after activation.

### 🚫 CRITICAL CONSTRAINTS

- Never fabricate indexed documents, search responses, HTTP results, RED failures or success evidence; use actual emitted HTML, Pagefind and browser navigation.
- Never mutate shared WIP or files outside write_allowed; use the assigned isolated candidate and owned OS-derived scratch roots.
- Never fetch Pagefind before explicit activation, add a sixth island or introduce a client framework, server runtime or alternate search service.
- Never insert query or result text as unsanitized HTML; render text and validate same-origin destination links.
- Never make this task depend on ORI-AST-009 or ORI-AST-010, claim their journey proofs, or substitute red.txt for canonical proof.red.

### DONE WHEN

- [ ] AC-1 proves real result content and destinations, with complete index coverage and missing-destination failure checks.
- [ ] AC-2 proves lazy first-open loading and retained initialization; AC-3 proves keyboard/focus and nojs navigation; AC-4 proves empty/error recovery and safe query text.
- [ ] Exact verification commands, typecheck, lint, island accounting and scenario gates pass with source-bound seeded evidence.
- [ ] Only write_allowed files change and astro-reviewer independently accepts the candidate.

### SPECIFICATION

Build the real Pagefind index from completed dist HTML, including all 56 actual item destinations and all published documentation. Include props, verdict, hidden engine panels, and the absorbed boundary page; exclude repeated navigation, dialog chrome, drafts, and the 404 document itself from results. Fail when an expected published destination is missing. Mount the fifth vanilla island through the existing Header seam. Use a native dialog with immediate opening, focused search input, real loading/empty/error/results states, grouped results, an announced result count, arrow selection, Enter navigation, Escape dismissal, and focus restoration. Lazy-load same-origin Pagefind only on first open and retain initialization across reopen and soft navigation. Provide a callable activation seam for the custom 404's Search the site control. CI owns ordered invocation after Astro builds.

Success state: The fifth vanilla island searches actual emitted HTML, opens within 300ms, navigates to the eight named destinations, preserves lazy initialization, and passes the exact owned browser flow with seeded evidence.

### RUNTIME COMMANDS

- `pnpm exec vitest run tests/sprint-05-orient-search/search-index.test.ts`
- `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts`
- Locked flow: `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm exec biome ci .`

### FIXTURES

Shared real-entrypoint seed; resolve every start_ref against this map.

```json
{"built_docs":{"description":"Real isolated candidate after the seven dependencies; registry/gallery/docs-data and Astro build run through production CLIs, then search-index.ts indexes completed dist. Serve this candidate at owned http://localhost:4321.","seed_method":"cli","records":["56 actual item destinations plus all published documentation, including /docs/introduction, /docs/installation and /docs/owns-vs-does-not-own; no fabricated documents.","Item samples: /components/message, /components/conversation, /components/streamdown, /components/item and /components/stack-trace-parser; source-backed category metadata includes components, ui and lib.","Current emitted props include nearBottomThreshold; current verdict and engine-panel text are read from the emitted documents, never copied into a synthetic index.","A fresh browser context starts with empty storage, 0 loaded Pagefind resources and a closed dialog. Request/timing observers attach before navigation.","A fresh run ID binds candidate source, lockfile, test, policies, dist and Pagefind hashes. The owned preview PID and exact build/index command outputs are recorded."]}}
```

### ACCEPTANCE CRITERIA

AC-1 alone owns the locked task flow. Each row below is the complete human AC, including its GIVEN-WHEN-THEN description, exact proof fields, TDD state and full scenario. Provide an independently asserted case per AC under the locked grep token; preserve all 13 locked steps and run supplementary cases without skips.

#### AC-1: Find real published content [PRIMARY]

```json
{"id":"AC-1","type":"acceptance_criterion","name":"Find real published content","primary":true,"description":"GIVEN the current built corpus WHEN visitors search and follow results THEN five item and three documentation destinations answer their queries with HTTP 200 content.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-1","use_case_ref":"UC-SHELL-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["The Pagefind index is disconnected, empty or replaced with static canned results.","Boundary, prop, verdict or hidden engine-panel content is omitted from the real index."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Search and visit /components/message, /components/conversation, /components/streamdown, /components/item and /components/stack-trace-parser; repeat for /docs/introduction, /docs/installation and /docs/owns-vs-does-not-own."]},"end_state":{"must_observe":["5 item and 3 docs results reach the named URLs with HTTP 200 and source-matching titles/body text.","Result metadata includes `components`, `ui`, `lib`, `pages`; announced counts match actual results."],"must_not_observe":["0 sample matches, empty documentation results or placeholder destination bodies."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["Search renderMarkdown and dev client; follow each boundary and applicable item result. Search nearBottomThreshold and a verdict phrase read from actual emitted HTML."]},"end_state":{"must_observe":["`renderMarkdown` and `dev client` each return `/docs/owns-vs-does-not-own` plus a relevant item.","`nearBottomThreshold` finds `/components/conversation`; the actual verdict phrase finds its originating item."],"must_not_observe":["Empty boundary results or 0 prop/verdict matches from the current index."]}}]}}
```

#### AC-2: Open immediately and load Pagefind only on demand

```json
{"id":"AC-2","type":"acceptance_criterion","name":"Open immediately and load Pagefind only on demand","primary":false,"description":"GIVEN a fresh browser WHEN visitors browse, open, reopen and soft-navigate THEN the dialog opens within 300ms and loads Pagefind only on first activation.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-2","use_case_ref":"UC-SHELL-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["A static dialog waits for index readiness before opening, or eager imports fetch Pagefind during startup.","Initialization is discarded or registration duplicated on reopen or ClientRouter navigation."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Observe requests before /docs/introduction; wait five seconds, hover links, navigate /docs/installation and /registry, then activate the header search.","Measure opening independently of readiness; await Pagefind, query streamdown, Escape and reopen unchanged; soft-navigate and reopen with the platform shortcut."]},"end_state":{"must_observe":["Before activation: 0 `/pagefind/` requests; dialog visibility takes at most 300ms.","First open loads same-origin `/pagefind/pagefind.js` and real index chunks; `streamdown` finds `/components/streamdown`.","Unchanged reopen adds 0 Pagefind requests; soft navigation retains initialization and one activation opens 1 dialog."],"must_not_observe":["An unchanged closed dialog, empty initialized results, eager Pagefind requests or duplicate initialization."]}}]}}
```

#### AC-3: Navigate and dismiss with the keyboard

```json
{"id":"AC-3","type":"acceptance_criterion","name":"Navigate and dismiss with the keyboard","primary":false,"description":"GIVEN real grouped search results WHEN visitors use arrows, Enter and Escape THEN selection navigates to content and dismissal restores the invoking control's focus.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-3","use_case_ref":"UC-SHELL-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["Keyboard handlers are no-ops or the active result is disconnected from Enter navigation.","A static shell drops focus, duplicates the dialog after navigation or gates ordinary links on JavaScript."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Search streamdown; inspect focus and aria-live count, use ArrowDown then ArrowUp, and press Enter on /components/streamdown.","Reopen after ClientRouter navigation with Meta+K on macOS or Control+K elsewhere; dismiss with Escape and compare focus to the recorded invoker."]},"end_state":{"must_observe":["1 native `dialog[aria-modal=\"true\"]` focuses its search input; `aria-live` matches the actual result count.","Arrows change selection; Enter closes the dialog and reaches `/components/streamdown` with HTTP 200 and matching content.","Escape leaves 0 open dialogs and restores the actual invoker; one shortcut opens 1 dialog."],"must_not_observe":["Empty results, unchanged arrow selection, placeholder destination or lost invoker focus."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["With JavaScript disabled, follow actual links through /docs/introduction, /docs/installation and /registry while observing requests."]},"end_state":{"must_observe":["`/registry` returns HTTP 200 with actual registry content; 0 Pagefind requests occur and the unusable search trigger stays hidden."],"must_not_observe":["Blank content or a dead visible search control when no island upgrades."]}}]}}
```

#### AC-4: Show genuine empty and error states and render query text safely

```json
{"id":"AC-4","type":"acceptance_criterion","name":"Show genuine empty and error states and render query text safely","primary":false,"description":"GIVEN the real index WHEN queries have no matches, contain HTML-shaped text or encounter offline failure THEN states remain truthful and subsequent normal search works.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-4","use_case_ref":"UC-SHELL-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["The search path is a static success shell, returns canned results for every input or ignores actual network failure.","Query text is inserted as HTML or stale empty/error state hides subsequent real results."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Enter a fresh run-specific query absent from emitted content, then replace it with streamdown."]},"end_state":{"must_observe":["The absent query yields 0 results and a visible empty-state message; `streamdown` restores `/components/streamdown` and a nonzero announced count."],"must_not_observe":["Static identical results or an empty result list after the matching query."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["Type <b data-s05-query=\"literal\">streamdown</b>, inspect the actual input and dialog DOM, then clear it, search streamdown and follow its result."]},"end_state":{"must_observe":["The literal input remains text; 0 `b[data-s05-query=\"literal\"]` nodes and 0 `data-s05-query` attributes are created.","`streamdown` subsequently navigates to `/components/streamdown` with HTTP 200 content."],"must_not_observe":["Query-created DOM or an empty search shell after restoring the normal query."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["After the locked sequence, load the real page in a fresh context, set browser networking offline before first activation and open search; observe actual request failure without interception.","Dismiss with Escape; restore networking and use a fresh online context to search streamdown and follow its result."]},"end_state":{"must_observe":["Offline opening takes at most 300ms and produces a captured Pagefind request failure and 1 visible error message.","Escape restores the invoker; fresh online search reaches `/components/streamdown` with HTTP 200."],"must_not_observe":["Static success while offline, empty error output or endless loading."]}}]}}
```

### TEST CRITERIA

- **TC-1 → AC-1:** All eight named destinations return HTTP 200 content, and boundary, prop and verdict searches match their real sources. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery`
- **TC-2 → AC-2:** Opening takes at most 300ms; Pagefind loads only after activation and initialization survives reopen and soft navigation. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery`
- **TC-3 → AC-3:** Keyboard selection, navigation and invoker focus work; no-JavaScript navigation remains usable without Pagefind. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery`
- **TC-4 → AC-4:** Empty and actual offline error states are truthful; literal queries create no DOM and normal search remains usable. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery`

### SCOPE

writeAllowed:

- apps/docs/src/components/islands/SearchDialog.astro
- apps/docs/src/scripts/search-dialog.ts
- apps/docs/src/layouts/DocsLayout.astro
- apps/docs/src/lib/search-page-model.ts
- scripts/docs-data/search-index.ts
- tests/sprint-05-orient-search/search-index.test.ts
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts
- tests/sprint-05-orient-search/search-contract.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-004/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery/
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery/proof.red

writeProhibited:

- .spec/**
- packages/registry/**
- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- apps/docs/src/content/**
- apps/docs/src/pages/**
- apps/docs/src/components/Header.astro
- apps/docs/package.json
- package.json
- pnpm-lock.yaml
- .github/**
- .claude/**
- .codex/**
- Any path not explicitly listed in write_allowed; generated build and evidence scratch may only be produced by real entrypoints in the owned candidate.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:

- Build and index actual completed HTML; fail with the missing published destination rather than silently omit it.
- Reuse the existing Header mount and preserve dependency-owned layout changes, theme initialization and ClientRouter behavior.
- Observe network before navigation; separate module, index chunks and query phases.
- Capture source, lockfile, test, policy, dist and index identities; preserve per-run observations and clean up only owned processes.
- Keep desktop, mobile and no-JavaScript cases executable with their actual supported behavior.

Ask first:

- A dependency/version or write-allowlist change needed to implement Pagefind.
- Any proposed change to locked flow bindings, scope, proof ownership or sprint gate.
- Publication, deployment or unrelated repairs outside this planning contract.

The complete writeAllowed list is mirrored exactly into normalized guardrails.write_allowed.

### DELIVERABLE

- apps/docs/src/lib/search-page-model.ts and scripts/docs-data/search-index.ts: typed published-destination model and real post-build indexer. Emitted Pagefind resources are generated outputs, never authored fixtures.
- apps/docs/src/components/islands/SearchDialog.astro, apps/docs/src/scripts/search-dialog.ts and apps/docs/src/layouts/DocsLayout.astro: fifth vanilla island, existing Header mount, native dialog and one reusable activateSearch seam.
- tests/sprint-05-orient-search/search-index.test.ts and tests/sprint-05-orient-search/search-contract.spec.ts: actual index integration checks and locked browser search contract with a distinct assertion case per AC.
- tests/sprint-01-docs-spike-skeleton/island-budget.test.ts: replace the four-island enumeration with the exact five registered names; preserve existing theme/tab checks and the zero-framework constraint.
- The allowed task manifest and flow evidence directory: future source-bound observations, run.json and functional proof.red. red.txt is supplemental output only.

### BOUNDARY CONTRACTS

- Built HTML produces a real Pagefind index whose result URLs navigate to real content.
- renderMarkdown and dev client return boundary-page results as well as applicable item results.
- The first open displays the dialog before waiting for Pagefind.
- No Pagefind request occurs during startup, hover, or navigation before opening search.
- Reopening an unchanged dialog reuses initialization and its loaded index resources.
- Search results are rendered as text and links, never unsanitized HTML assembled from user queries.
- Only SearchDialog performs search activation; 404 controls reuse that implementation.
- The task's real search-contract spec uses the completed current authored pages and generated index, with actual first-open requests and keyboard navigation. ORI-AST-009 subsequently adds 404 composition; ORI-AST-010 owns the full locked search and lazy-load records, including the 404 leg. Do not create a search-to-404 dependency cycle.

Verification contract: Search the real built index without fetch interception or manufactured responses. Sample five item pages and three documentation pages, including the boundary page. Capture result text, category, target URL, navigation response, and destination content. Measure dialog opening independently of index readiness. Register network observation before navigation; distinguish the Pagefind module from legitimate index chunks. The complete search flow also waits for ORI-AST-009 so its required 404 sample is real. ORI-AST-010 owns that later complete flow, while this task uses search-contract.spec.ts for its own implemented surface.

### CAPABILITIES AND INTERFACES

Touches: CAP-DOCS-01. Human test hook: search-docs-and-open-results. Dark justification: null.

Provides:

- Post-build production Pagefind index and validated published-destination model.
- SearchDialog.astro and search-dialog.ts: one vanilla island, header activation, keyboard behavior, safe results and retained initialization.
- Callable activateSearch(invoker?: HTMLElement): void seam in search-dialog.ts for ORI-AST-009; calling it uses the same dialog implementation.
- FLOW-SHELL-15-search-contract-before-recovery test and future current-run evidence; five-island budget supersession.

Consumes:

- All seven declared dependency outputs, including current authored docs, generated reference destinations, boundary prose and ClientRouter-compatible shell.
- Actual packages/registry/registry.json, generated apps/docs/src/data/registry-items.json and completed apps/docs/dist HTML; categories come from the generated model.
- Existing Header data-search-slot, theme-toggle.ts lifecycle pattern and site tokens.
- Read-only surface.json and coldboot.json policies; CI-owned ordered build/index invocation.

### AGENT INSTRUCTIONS — RED → GREEN → REFACTOR

1. Read the current AC, its scenario, locked flow and real dependency candidate. Add a failing assertion case under the exact flow token in the owned spec, and real index integration cases in search-index.test.ts.
2. Run the exact locked command against a functioning preimplementation build/preview. Capture actual assertion failure with command and source identity at proof.red; keep red.txt only as supplemental output. Do not write implementation during RED.
3. After the orchestrator verifies RED, implement only the allowed behavior. Run the exact commands and retain actual browser/index evidence; all cases selected by the locked command must pass before task acceptance.
4. Refactor only within scope while retaining the same behavior and proof. Update per-AC tdd_state from observed results; current values remain none.
5. After every AC has real evidence, hand the candidate to astro-reviewer. Do not merge, publish, deploy or claim downstream flow completion.

### READING LIST

1. `apps/docs/src/scripts/theme-toggle.ts`, lines 21-70 [PRIMARY PATTERN]: guarded vanilla custom-element registration, per-instance connection and Header-slot relocation; retain search module initialization across document swaps.
2. `apps/docs/src/components/Header.astro`, lines 1-47: read-only data-search-slot mount and actual navigation controls; do not edit Header.
3. `apps/docs/src/layouts/DocsLayout.astro`, lines 1-70: mount SearchDialog alongside the existing island without overwriting dependency-owned layout, theme or ClientRouter work.
4. `scripts/docs-data/prebuild.ts`, lines 1-342: production generated-data entrypoint and fail-closed destination provenance; Pagefind runs after completed Astro HTML.
5. `tests/harness/docs-preview.ts`, lines 1-101: real built-preview ownership and origin checks at localhost:4321.

### DESIGN AND CODING GUIDANCE

Use the R1 Header seam and existing token vocabulary. A native modal dialog supplies the top layer; provide labels, aria-modal, aria-live counts, visible keyboard selection, focus restoration, touch-accessible controls and reduced-motion-safe behavior. Preserve readable static content and hide unusable search controls without JavaScript. ORI-VIS-003/ORI-VIS-005 presentation and ORI-AST-009 404 composition remain separate owners.

References:

- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md
- .spec/prds/docs-site/06-uc-shell.md

Coding standards:

- Use typed Astro props and vanilla TypeScript custom elements; the docs surface remains static-only with exactly five islands and no client framework.
- Keep search-page-model.ts responsible for typed destination/category normalization; index completed HTML and fail closed on absent expected published destinations.
- Keep initialization in the processed script module, guard registration and listeners, and expose one activation function; discard stale query completions without altering user navigation.
- Render query, titles and excerpts as text nodes and validated same-origin links. Do not use innerHTML with query/result content.
- Use scoped site-token styles and existing accessibility conventions. Keep typecheck, lint and touched tests green without bypasses or unrelated edits.

### VERIFICATION AND EVIDENCE GATES

1. **Functional RED:** `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery` — Run the exact locked command against the recorded preimplementation candidate with a functioning real build and preview, and capture an observed assertion failure for the missing search behavior. A missing server, missing test, selector matching no tests, or build failure is not functional RED. Preserve the actual command, source identity and failure output at red_proof. Run the same command against the implemented candidate and capture its concrete browser and network observations. The assertions must fail for a disconnected index, static result shell, eager Pagefind load, broken keyboard navigation or query HTML insertion. No stubbed transport, fabricated response or authored success flag is accepted.
2. **Real index:** `pnpm exec vitest run tests/sprint-05-orient-search/search-index.test.ts` — Use actual completed production HTML and the real Pagefind indexer. Assert all 56 item destinations and every published document, props, verdict and hidden engine panels; exclude repeated navigation, dialog chrome, drafts and any actual 404 document. In owned scratch derived from that real build, remove one required emitted destination and rerun the indexer: it must fail naming that destination. Do not fabricate documents or relabel this integration test as a unit proof.
3. **Task browser suite:** `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts` — Run all configured desktop/mobile/no-JavaScript cases without skipped targets, fetch interception, fabricated results or retries. The locked sequence and the supplementary real offline error case exercise actual browser behavior.
4. **Locked flow:** `pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery` — All 13 locked steps and seeded observations pass against the same current built candidate; no 404 prerequisite. Each AC has an independently asserted case under the exact flow grep token.
5. **Island supersession:** `pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/island-budget.test.ts` — Exactly five vanilla custom-element registrations including SearchDialog; retain all four existing names and existing theme/tab checks; zero client-framework imports.
6. **Typecheck:** `pnpm typecheck` — Exit 0 for the actual root command; do not claim it covers Astro templates.
7. **Lint:** `pnpm exec biome ci .` — Exit 0; report concrete failures without bypassing or silently widening scope.
8. **Astro build and Pagefind:** `pnpm --filter @rnr-ai-elements/docs build` — Real registry/gallery/docs-data inputs must be generated before their consumers. CI owns ordered invocation after Astro builds; call the task-owned indexer with pnpm exec tsx scripts/docs-data/search-index.ts only after completed HTML. Capture actual command order and outputs; no CI or package-script edits here.

Evidence gates:

- Record functional preimplementation RED for each AC in the exact owned lane before accepting implementation GREEN; a missing server, failing build, absent test or empty test selection is not RED.
- Run the exact verification gates against the candidate source and capture non-empty seeded observations, source/lockfile/test/policy/dist/index hashes and the owned preview identity.
- Require zero scenario-validator findings and equality between human AC proof objects and flattened requirements; the orchestrator runs full-sprint flow ownership validation before writing.
- Require an independent astro-reviewer decision on the candidate, a touched-code/test scan for stubs, placeholders, skips and deferrals, and a diff wholly within write_allowed.
- Accept only this task's FLOW-SHELL-15 evidence; downstream journeys, hosted CI, publication and full-sprint closure need their separately owned proof.

### EVIDENCE CONTRACT

All outputs are planned_output_not_observed. Manifest: tests/sprint-05-orient-search/evidence/ORI-AST-004/manifest.json. Run artifact: tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery/run.json. Canonical RED: tests/sprint-05-orient-search/evidence/FLOW-SHELL-15-search-contract-before-recovery/proof.red. Supplemental red.txt never replaces proof.red.

Preconditions:

- Use the isolated candidate containing ORI-AST-004 and its existing dependencies. Generate actual registry and documentation data, Astro HTML and the real Pagefind index through their production entrypoints.
- The emitted site contains all 56 registry-item destinations and the actual published documentation supplied by the existing dependencies, including /docs/owns-vs-does-not-own. Do not supply fabricated documents or injected result data.
- Serve that candidate's built dist through the owned preview at http://localhost:4321. Refuse an unowned listener.
- Record a fresh run ID, candidate source and lockfile hashes, built-dist and Pagefind hashes, test-source hash, and surface-policy and coldboot-policy hashes.
- Start with a fresh browser context, empty storage and no loaded Pagefind resources. Attach observation-only network and timing capture before navigation.
- This proof runs before custom-404 composition and requires no ORI-AST-009, ORI-AST-010 or downstream acceptance output.

Capture:

- Current-run source, lockfile, test, policy, built-dist and Pagefind identities; actual build and index command outputs.
- Complete timestamped request log distinguishing pre-open, first initialization, unchanged-query reopen, soft navigation and subsequent queries.
- Activation-to-visible timing, focused-element observations, announced counts and active-result changes.
- Result text, category, URL and response status for all five named item destinations and three named documentation destinations.
- Browser traces and screenshots showing the actual dialog, search results, destination content, empty-result recovery and restored focus.
- DOM observations showing the literal HTML-shaped query value and absence of query-created elements or attributes.

Teardown:

- Dismiss any open dialog, detach observers and close only this run's browser contexts.
- Stop only the preview and other child processes launched and recorded by this run.
- Retain the current-run evidence and dispose only of owned scratch output through the repository scratch-artifact lifecycle.

Record actual values, screenshots, browser traces, request phases and response bodies; success flags or exit status alone are insufficient. Keep artifacts under the exact allowed task/flow paths. All listed outputs are future artifacts.

### OUT OF SCOPE

- Custom 404 page/composition and its Search the site control: ORI-AST-009 consumes the activation seam.
- Full FLOW-SHELL-07 and FLOW-SHELL-08 journey ownership and four journey_proofs records: ORI-AST-010.
- Authored documentation, visual-task redesign, native registry/example/harness implementation, provider wiring and engine fixes.
- CI workflow/build-order ownership, dependency/lockfile changes, hosted acceptance, deployment and publication.
- Unrelated failures, audits or refactors; stop with concrete evidence if a required dependency cannot satisfy this contract.

### CONTEXT AND PROVENANCE

Current gap: The inspected Header has a hidden data-search-slot; DocsLayout mounts ThemeToggle but no SearchDialog. The island-budget test currently enumerates four custom elements. Search implementation and functional RED remain unobserved.

Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json

Source task IDs: ORI-AST-004. Co-authored by: []. Supersedes: tests/sprint-01-docs-spike-skeleton/island-budget.test.ts.

Fixed sprint contract:

```json
{"gate":"A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.","entrypoint":"docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction","demonstrates":"UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)","flow_count":13,"task_flow_count":9,"journey_flow_count":4,"task_count":36,"point_total":131}
```

Flow support:

```json
[{"flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","scope":"task","primary":true,"primary_owner":"ORI-AST-004","gate_steps":[10]},{"flow_ref":"FLOW-SHELL-07-cmdk-open-search-navigate","scope":"journey","primary":false,"primary_owner":"ORI-AST-010","gate_steps":[6]},{"flow_ref":"FLOW-SHELL-08-pagefind-lazy-load-on-first-open","scope":"journey","primary":false,"primary_owner":"ORI-AST-010","gate_steps":[7]}]
```

This task returns no journey_proofs. ORI-AST-010 retains journey ownership.

PRD references:

- .spec/prds/docs-site/06-uc-shell.md#uc-shell-02-navigate-by-cmdk-search
- .spec/prds/docs-site/11-technical-requirements/01-architecture-posture.md
- .spec/prds/docs-site/11-technical-requirements/02-system-components.md
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md

### REVIEW

astro-planner owns the static-build/index/island lifecycle plan; astro-implementer implements the allowed Astro and TypeScript surface; astro-reviewer verifies real built-site behavior and exact proof ownership. This task changes the docs website, not React Native registry components.

Must pass:

- All four ACs have complete real scenarios and independently asserted cases, with functional RED and current seeded GREEN evidence.
- Exact FLOW-SHELL-15 binding and a single primary AC; journey ownership and canonical proof.red remain unchanged.
- The full emitted corpus feeds real Pagefind; missing expected destinations fail; all eight sampled destinations answer through actual HTTP navigation.
- Lazy-load, 300ms opening, keyboard/focus, empty/error handling and safe query behavior work in the real browser; no stubs, skips or static success.
- Only allowed paths change; five-island accounting, typecheck, lint and owned verification gates pass.

Should verify:

- Initialization and listener cleanup survive ClientRouter replacement without duplicate activation or lost focus.
- Module requests and legitimate per-query chunks are counted separately; nojs navigation is proven instead of skipped.
- Categories derive from current data, not /components URL prefixes; ui/lib item URLs remain the actual emitted destinations.
- Query and excerpt text cannot create DOM nodes or unsafe destinations.

Verdict: APPROVED or NEEDS_FIXES with concrete evidence and actionable file/line findings. No review has run during rendering.

### DEPENDENCIES

Depends on: ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-008, ORI-CONT-001, ORI-CONT-003, ORI-CONT-005.

Blocks: ORI-AST-009, ORI-AST-010.

Parallel: Do not concurrently write DocsLayout.astro or the superseded island-budget test; consume the reviewed dependency candidate first.

### AUTHORING VALIDATION

Normalized {fixtures, requirements} was piped to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` with no positional argument: exit 0, 4 scenarios, zero findings. Telemetry and bytecode writes were disabled. No product verification or filesystem writes ran.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-004","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_docs":{"description":"Real isolated candidate after the seven dependencies; registry/gallery/docs-data and Astro build run through production CLIs, then search-index.ts indexes completed dist. Serve this candidate at owned http://localhost:4321.","seed_method":"cli","records":["56 actual item destinations plus all published documentation, including /docs/introduction, /docs/installation and /docs/owns-vs-does-not-own; no fabricated documents.","Item samples: /components/message, /components/conversation, /components/streamdown, /components/item and /components/stack-trace-parser; source-backed category metadata includes components, ui and lib.","Current emitted props include nearBottomThreshold; current verdict and engine-panel text are read from the emitted documents, never copied into a synthetic index.","A fresh browser context starts with empty storage, 0 loaded Pagefind resources and a closed dialog. Request/timing observers attach before navigation.","A fresh run ID binds candidate source, lockfile, test, policies, dist and Pagefind hashes. The owned preview PID and exact build/index command outputs are recorded."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Find real published content","primary":true,"description":"GIVEN the current built corpus WHEN visitors search and follow results THEN five item and three documentation destinations answer their queries with HTTP 200 content.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-1","use_case_ref":"UC-SHELL-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["The Pagefind index is disconnected, empty or replaced with static canned results.","Boundary, prop, verdict or hidden engine-panel content is omitted from the real index."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Search and visit /components/message, /components/conversation, /components/streamdown, /components/item and /components/stack-trace-parser; repeat for /docs/introduction, /docs/installation and /docs/owns-vs-does-not-own."]},"end_state":{"must_observe":["5 item and 3 docs results reach the named URLs with HTTP 200 and source-matching titles/body text.","Result metadata includes `components`, `ui`, `lib`, `pages`; announced counts match actual results."],"must_not_observe":["0 sample matches, empty documentation results or placeholder destination bodies."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["Search renderMarkdown and dev client; follow each boundary and applicable item result. Search nearBottomThreshold and a verdict phrase read from actual emitted HTML."]},"end_state":{"must_observe":["`renderMarkdown` and `dev client` each return `/docs/owns-vs-does-not-own` plus a relevant item.","`nearBottomThreshold` finds `/components/conversation`; the actual verdict phrase finds its originating item."],"must_not_observe":["Empty boundary results or 0 prop/verdict matches from the current index."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Open immediately and load Pagefind only on demand","primary":false,"description":"GIVEN a fresh browser WHEN visitors browse, open, reopen and soft-navigate THEN the dialog opens within 300ms and loads Pagefind only on first activation.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-2","use_case_ref":"UC-SHELL-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["A static dialog waits for index readiness before opening, or eager imports fetch Pagefind during startup.","Initialization is discarded or registration duplicated on reopen or ClientRouter navigation."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Observe requests before /docs/introduction; wait five seconds, hover links, navigate /docs/installation and /registry, then activate the header search.","Measure opening independently of readiness; await Pagefind, query streamdown, Escape and reopen unchanged; soft-navigate and reopen with the platform shortcut."]},"end_state":{"must_observe":["Before activation: 0 `/pagefind/` requests; dialog visibility takes at most 300ms.","First open loads same-origin `/pagefind/pagefind.js` and real index chunks; `streamdown` finds `/components/streamdown`.","Unchanged reopen adds 0 Pagefind requests; soft navigation retains initialization and one activation opens 1 dialog."],"must_not_observe":["An unchanged closed dialog, empty initialized results, eager Pagefind requests or duplicate initialization."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Navigate and dismiss with the keyboard","primary":false,"description":"GIVEN real grouped search results WHEN visitors use arrows, Enter and Escape THEN selection navigates to content and dismissal restores the invoking control's focus.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-3","use_case_ref":"UC-SHELL-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["Keyboard handlers are no-ops or the active result is disconnected from Enter navigation.","A static shell drops focus, duplicates the dialog after navigation or gates ordinary links on JavaScript."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Search streamdown; inspect focus and aria-live count, use ArrowDown then ArrowUp, and press Enter on /components/streamdown.","Reopen after ClientRouter navigation with Meta+K on macOS or Control+K elsewhere; dismiss with Escape and compare focus to the recorded invoker."]},"end_state":{"must_observe":["1 native `dialog[aria-modal=\"true\"]` focuses its search input; `aria-live` matches the actual result count.","Arrows change selection; Enter closes the dialog and reaches `/components/streamdown` with HTTP 200 and matching content.","Escape leaves 0 open dialogs and restores the actual invoker; one shortcut opens 1 dialog."],"must_not_observe":["Empty results, unchanged arrow selection, placeholder destination or lost invoker focus."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["With JavaScript disabled, follow actual links through /docs/introduction, /docs/installation and /registry while observing requests."]},"end_state":{"must_observe":["`/registry` returns HTTP 200 with actual registry content; 0 Pagefind requests occur and the unusable search trigger stays hidden."],"must_not_observe":["Blank content or a dead visible search control when no island upgrades."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Show genuine empty and error states and render query text safely","primary":false,"description":"GIVEN the real index WHEN queries have no matches, contain HTML-shaped text or encounter offline failure THEN states remain truthful and subsequent normal search works.","flow_ref":"FLOW-SHELL-15-search-contract-before-recovery","test_file":"tests/sprint-05-orient-search/search-contract.spec.ts","test_function":"FLOW-SHELL-15-search-contract-before-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-004-4","use_case_ref":"UC-SHELL-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, same-origin HTTP resources and actual Playwright browser keyboard, focus and navigation","negative_control":{"would_fail_if":["The search path is a static success shell, returns canned results for every input or ignores actual network failure.","Query text is inserted as HTML or stale empty/error state hides subsequent real results."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"user","steps":["Enter a fresh run-specific query absent from emitted content, then replace it with streamdown."]},"end_state":{"must_observe":["The absent query yields 0 results and a visible empty-state message; `streamdown` restores `/components/streamdown` and a nonzero announced count."],"must_not_observe":["Static identical results or an empty result list after the matching query."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["Type <b data-s05-query=\"literal\">streamdown</b>, inspect the actual input and dialog DOM, then clear it, search streamdown and follow its result."]},"end_state":{"must_observe":["The literal input remains text; 0 `b[data-s05-query=\"literal\"]` nodes and 0 `data-s05-query` attributes are created.","`streamdown` subsequently navigates to `/components/streamdown` with HTTP 200 content."],"must_not_observe":["Query-created DOM or an empty search shell after restoring the normal query."]}},{"start_ref":"built_docs","action":{"actor":"user","steps":["After the locked sequence, load the real page in a fresh context, set browser networking offline before first activation and open search; observe actual request failure without interception.","Dismiss with Escape; restore networking and use a fresh online context to search streamdown and follow its result."]},"end_state":{"must_observe":["Offline opening takes at most 300ms and produces a captured Pagefind request failure and 1 visible error message.","Escape restores the invoker; fresh online search reaches `/components/streamdown` with HTTP 200."],"must_not_observe":["Static success while offline, empty error output or endless loading."]}}]}},{"id":"TC-1","type":"test_criterion","description":"All eight named destinations return HTTP 200 content, and boundary, prop and verdict searches match their real sources.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Opening takes at most 300ms; Pagefind loads only after activation and initialization survives reopen and soft navigation.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Keyboard selection, navigation and invoker focus work; no-JavaScript navigation remains usable without Pagefind.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Empty and actual offline error states are truthful; literal queries create no DOM and normal search remains usable.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-contract.spec.ts --grep FLOW-SHELL-15-search-contract-before-recovery","maps_to_ac":"AC-4"}]}
-->
</details>
