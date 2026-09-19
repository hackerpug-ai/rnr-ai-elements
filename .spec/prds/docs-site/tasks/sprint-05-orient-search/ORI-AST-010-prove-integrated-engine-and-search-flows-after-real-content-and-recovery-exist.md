## What this does

Four unchanged engine and search journeys pass against the integrated built docs, with source-bound RED and fresh candidate-bound observations that detect broken real behavior.

## Why

Earlier engine tests exist, but they do not establish these complete post-content journeys on the final candidate. Final acceptance needs real content, indexing and recovery integrated before browser proof.

## How to verify

After the ordered dependency build, run all four commands and inspect canonical RED, raw browser/HTTP evidence, failing real-copy negative controls and passing restored-candidate runs:

- `pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`
- `pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html`
- `pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate`
- `pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open`

## Scope

Only the four named Sprint 05 specs and their exact task/flow evidence paths. Product repairs return to their original owners.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-AST-010: Prove integrated engine and search flows after real content and recovery exist

> Status: Backlog
> Assignee: astro-implementer · Reviewer: astro-reviewer · Additional reviewer: test-quality-reviewer
> Priority: P1 · Points: 3 · Type: TEST
> Dependency phase: Post-integration, after all eight declared dependencies
> Proposed By: astro-planner
> Co-authored By: techwriting-planner, frontend-designer, ghactions-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [sprint-05-orient-search](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer
> PROGRESS: 0/4 ACs; all TDD_STATE values are none.

### OUTCOME

Four unchanged engine and search journeys pass against the integrated built docs, with source-bound RED and fresh candidate-bound observations that detect broken real behavior.

Success state: All four exact commands pass on the integrated candidate, each negative control fails for its targeted behavior, restoration passes, and the manifest links fresh raw evidence and canonical proof.red files.

### 🚫 CRITICAL CONSTRAINTS

- Never modify product source or files outside write_allowed. Return source failures to their original owner; preserve shared WIP and use only the assigned isolated candidate and owned scratch.
- Never replace real preview, Pagefind, HTTP or browser behavior with mocks, view injection, canned results, skipped targets, enabled-JavaScript substitutes for no-JavaScript cases, or static success.
- Keep all four original scenarios, test paths, grep tokens and commands unchanged. This TEST task uses primary:false and flow_ref:null; journey ownership exists only in the four top-level journey_proofs.
- Use only the candidate's owned http://localhost:4321 built preview. Record source, lockfile, dist, command, test, driver and policy hashes; refuse unknown listeners and stale evidence.
- Capture actual preimplementation assertion failures at each canonical proof.red. red.txt is supplemental only. Require failing real-copy negative controls and passing restored-candidate observations.

### DONE WHEN

- [ ] AC-1 proves shared engine state across all five surfaces.
- [ ] AC-2 proves both panels in initial HTML and real no-JavaScript rendering.
- [ ] AC-3 proves complete search navigation, indexing, focus and 404 recovery.
- [ ] AC-4 proves first-open-only loading and zero no-JavaScript Pagefind requests.
- [ ] All evidence and quality gates pass; only allowed paths change; astro-reviewer and test-quality-reviewer approve.

### RUNTIME_COMMANDS

Test commands are the four exact commands in How to verify. Run `pnpm typecheck`, `pnpm lint` and `pnpm test` as quality gates. Do not append project exclusions, retries or replacement grep tokens to the locked commands.

### ACCEPTANCE CRITERIA

All four are task-local end-to-end criteria: primary=false and flow_ref=null. The four journey records carry post-integration ownership. Each complete proof row below is identical to the normalized requirement and embedded contract.

#### AC-1

```json
{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the integrated docs and a fresh browser WHEN an integrator selects uniwind, navigates five page surfaces and switches a later Quickstart block to nativewind THEN panels, storage and root dataset agree across navigation without URL engine state.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts","test_function":"FLOW-SHELL-13-engine-tab-persists-across-pages","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, actual Installation and Quickstart content, generated Message, home, Components, ClientRouter, and browser storage","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/proof.red","scenario":{"id":"SC-ORI-AST-010-1","use_case_ref":"UC-SHELL-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, actual Installation and Quickstart content, generated Message, home, Components, ClientRouter, and browser storage","negative_control":{"would_fail_if":["Shared synchronization is disconnected in an isolated actual source/build copy; the same locked test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs","action":{"actor":"user","steps":["Open /docs/installation and verify the documented fresh-context default.","Click the uniwind tab and inspect its complete command.","Read rnr-engine and root data-engine.","Follow the actual Quickstart link through ClientRouter.","Hard-load /components/message.","Return to Quickstart and select nativewind from a later tabbed block.","Inspect all engine groups, then visit home and Components.","Operate tabs with the real keyboard and observe each group's own labels and panel relationships."]},"end_state":{"must_observe":["Selecting 'uniwind' makes the complete matching command visible, localStorage 'rnr-engine' equal 'uniwind', and root 'data-engine' equal 'uniwind'.","Selection persists through real Quickstart ClientRouter navigation and hard-load '/components/message'; Installation, Quickstart, Message, home and Components provide 5 consistent page surfaces.","Selecting 'nativewind' in a later Quickstart block updates every engine group, 'rnr-engine' and root 'data-engine' to 'nativewind'.","Every tab/panel has 1 unique ID and a relationship owned by its own group; real keyboard operation selects the matching panel.","All visited URLs contain 0 engine-state query or fragment encodings; the fresh-context default matches the documented engine."],"must_not_observe":["Empty command panels or unchanged default selection after choosing 'uniwind'.","Stale 'rnr-engine' or 'data-engine', duplicate IDs, cross-group references, or engine state in any visited URL."]}}]}}
```

#### AC-2

```json
{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the integrated docs and a real HTTP client with JavaScript-disabled rendering WHEN Installation, Message and Quickstart are inspected THEN both complete labeled engine panels exist in initial HTML with unique tab relationships and readable fallback.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts","test_function":"FLOW-SHELL-14-tab-panels-in-initial-html","verify":"pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, original HTTP response bodies, and actual JavaScript-disabled Playwright rendering","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/proof.red","scenario":{"id":"SC-ORI-AST-010-2","use_case_ref":"UC-SHELL-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, original HTTP response bodies, and actual JavaScript-disabled Playwright rendering","negative_control":{"would_fail_if":["A complete engine panel is removed from an isolated actual source/build copy; the same initial-HTML/no-JavaScript test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs_nojs","action":{"actor":"api_client","steps":["Fetch the raw response body for /docs/installation.","Fetch the raw response body for /components/message.","Inspect each response's labeled nativewind and uniwind panels.","Load each route in the JavaScript-disabled browser and read both panels.","Inspect the multiple Quickstart groups for unique ARIA IDs and readable engine labels."]},"end_state":{"must_observe":["Original 200 HTTP responses for '/docs/installation' and '/components/message' include both complete 'nativewind' and 'uniwind' commands inside their correctly labeled panels.","The JavaScript-disabled browser displays 2 stacked readable engine panels per group with 'nativewind' and 'uniwind' labels.","Quickstart groups have 0 duplicate IDs or cross-group ARIA references and retain readable engine labels.","Network observation records 0 after-load registry requests constructing panel commands."],"must_not_observe":["0 engine panels, empty commands, blank fallback or one engine missing from the original response.","Client-created command content or labels and ARIA relationships owned by another group."]}}]}}
```

#### AC-3

```json
{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the complete built docs, production index and custom 404 WHEN a visitor opens keyboard search and uses streamdown, renderMarkdown and dev client THEN timely accessible search reaches real grouped results, boundary and item destinations, and recovery links.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts","test_function":"FLOW-SHELL-07-cmdk-open-search-navigate","verify":"pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, custom 404, and actual Playwright keyboard, focus, network, and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/proof.red","scenario":{"id":"SC-ORI-AST-010-3","use_case_ref":"UC-SHELL-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, custom 404, and actual Playwright keyboard, focus, network, and navigation","negative_control":{"would_fail_if":["Boundary indexing is removed from an isolated actual source/build copy, or search is a static disconnected result list; the same locked search test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs","action":{"actor":"user","steps":["Open /docs/introduction and press Meta+K on macOS or Control+K elsewhere.","Observe the dialog opening, focused input, and actual loading transition.","Type streamdown, inspect grouped results and the announced count, then use Enter on the highlighted result.","Reopen search and query renderMarkdown; find both the boundary result and an applicable item result and navigate to each.","Repeat with dev client and verify boundary and item destinations contain the relevant text.","Confirm five item and three documentation destinations are represented by actual index results.","Navigate to a fresh unknown path, open search from the real custom 404, and recover to Message.","Reopen and dismiss with Escape, confirming focus returns to the invoking control."]},"end_state":{"must_observe":["The native dialog has 'aria-modal=true', opens within 300ms of Meta+K on macOS or Control+K elsewhere, and focuses its input independently of Pagefind initialization.","Search for 'streamdown' returns actual grouped results with 'components/ui/lib/pages' group identity and an 'aria-live' count equal to the rendered result count; Enter navigates the highlighted result and closes the dialog.","Both 'renderMarkdown' and 'dev client' return '/docs/owns-vs-does-not-own' and applicable item results; navigating each returns 200 and the relevant destination text.","Real indexed results represent at least 5 item and 3 documentation destinations; 'renderMarkdown' props and actual verdict literals are searchable and recorded.","A fresh unknown path returns the real custom 404; its shared search recovers to '/components/message' with status 200.","Escape dismisses the reopened dialog and returns focus to 1 invoking control; record loading transitions, counts, URLs and destination screenshots."],"must_not_observe":["0 results for the required queries, empty props/verdict indexing, or absent boundary destinations.","Static canned results, non-200 result destinations, a blank 404 recovery surface or lost invoking-control focus."]}},{"start_ref":"integrated_docs_nojs","action":{"actor":"user","steps":["Open /docs/introduction with JavaScript disabled, follow actual documentation links, visit a fresh unknown path, and recover through the real custom 404 navigation links to Message."]},"end_state":{"must_observe":["Real no-JavaScript documentation and recovery links reach '/components/message' with status 200 and readable Message content after the unknown route returns 404."],"must_not_observe":["Blank recovery surface, 0 usable recovery links, or a JavaScript requirement for navigation."]}}]}}
```

#### AC-4

```json
{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN a fresh browser and the built Pagefind output WHEN a visitor waits, hovers, soft-navigates, opens search and reopens the unchanged query THEN Pagefind loads only on first open and no-JavaScript navigation makes no Pagefind requests.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts","test_function":"FLOW-SHELL-08-pagefind-lazy-load-on-first-open","verify":"pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, ClientRouter, production Pagefind resources, and actual Playwright network observation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/proof.red","scenario":{"id":"SC-ORI-AST-010-4","use_case_ref":"UC-SHELL-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, ClientRouter, production Pagefind resources, and actual Playwright network observation","negative_control":{"would_fail_if":["The real Pagefind index is withheld from an isolated actual source/build copy, or loading is an empty no-op; the same locked lazy-load test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs","action":{"actor":"user","steps":["Open /docs/introduction and wait five seconds without opening search.","Hover header navigation links.","Follow real links through /docs/installation and /registry using soft navigation.","Assert no Pagefind request has occurred.","Open search for the first time and await its real initialization.","Close the dialog and reopen it on the same page without changing the query."]},"end_state":{"must_observe":["Before opening search, the complete request log has 0 '/pagefind/' requests after a 5-second wait, navigation-link hover and real soft navigation through '/docs/installation' and '/registry'.","First open requests same-origin '/pagefind/pagefind.js' and at least 1 real index resource, with separate module and index-resource counts.","Closing and reopening on the same page with an unchanged query adds 0 Pagefind requests; timestamps identify first-open and reopen phases."],"must_not_observe":["No module or index request after first open, empty index resources, or requests that precede first open.","Additional Pagefind requests on unchanged-query reopen or cross-origin Pagefind resources."]}},{"start_ref":"integrated_docs_nojs","action":{"actor":"user","steps":["Attach request observation before navigation in the JavaScript-disabled context; open /docs/introduction and follow actual links to /docs/installation and /registry."]},"end_state":{"must_observe":["The JavaScript-disabled browser reaches '/docs/installation' and '/registry' with status 200 and readable destination content.","The complete no-JavaScript request log records 0 '/pagefind/' requests."],"must_not_observe":["Blank destination content, 0 working navigation links, or any Pagefind request."]}}]}}
```

### TEST CRITERIA

- **TC-1** → AC-1: Engine selection, complete commands, storage, root dataset, unique keyboard-operable groups and URLs satisfy AC-1 on all five page surfaces; the synchronization negative control fails and the restored candidate passes.
  Verify: `pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`
- **TC-2** → AC-2: Both complete labeled engine panels are present in original HTTP bodies and readable without JavaScript; panel removal fails AC-2 and the restored candidate passes.
  Verify: `pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html`
- **TC-3** → AC-3: All required query, grouping, indexed-content, timing, focus, navigation and real 404 assertions satisfy AC-3; removing boundary indexing fails and the restored candidate passes.
  Verify: `pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate`
- **TC-4** → AC-4: Pre-open and unchanged-query-reopen Pagefind counts are zero, first-open real module/index counts are nonzero, and no-JavaScript navigation works without Pagefind; withholding the index fails AC-4 and the restored candidate passes.
  Verify: `pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open`

### FIXTURES

Seed through the real ordered build and browser entrypoints only. These are planned inputs, not fabricated observations.

```json
{"integrated_docs":{"description":"Reviewed dependency candidate built through the real ordered registry, gallery, docs-data, source-backed snippet, Astro, Pagefind and link-check entrypoints; served at http://localhost:4321 by the owned Playwright preview.","seed_method":"cli","records":["Actual Installation and Quickstart content, generated Message, home and Components contain complete nativewind and uniwind commands.","All 56 item destinations, authored getting-started entries, /docs/owns-vs-does-not-own, production Pagefind resources and the real custom 404 come from the candidate build.","Queries streamdown, renderMarkdown and dev client exercise real indexed props, verdicts and boundary content.","Each run records fresh run ID, source and lockfile hashes, built-dist hash, command/test/driver hashes and .spec/e2e-policy/surface.json plus .spec/e2e-policy/coldboot.json hashes.","Start each interactive case in a new real browser context with empty localStorage and no loaded Pagefind resources; attach observation before navigation and change engine only through tabs."]},"integrated_docs_nojs":{"description":"The same real built candidate and owned localhost:4321 preview, accessed by an actual HTTP client and a fresh Playwright context with JavaScript disabled.","seed_method":"ui_flow","records":["Navigate to actual /docs/installation, /components/message and Quickstart through real HTTP and links; no rendered HTML or storage is injected.","The production build includes both nativewind and uniwind panel contents and labeled navigation/recovery links before client execution.","Attach the real request log before first navigation; use a fresh unknown path to reach the server's custom 404."]}}
```

### SCOPE

writeAllowed:

- `tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts`
- `tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts`
- `tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts`
- `tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts`
- `tests/sprint-05-orient-search/evidence/ORI-AST-010/`
- `tests/sprint-05-orient-search/evidence/ORI-AST-010/manifest.json`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/run.json`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/red.txt`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/run.json`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/red.txt`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/run.json`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/red.txt`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/run.json`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/red.txt`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/proof.red`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/proof.red`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/proof.red`
- `tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/proof.red`

writeProhibited:

- `apps/**`
- `packages/**`
- `scripts/**`
- `.spec/**`
- `.github/**`
- `tests/harness/**`
- `playwright.config.ts`
- `package.json`
- `pnpm-lock.yaml`
- Any path outside write_allowed

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:

- Follow the locked surface and coldboot policies; use real product-owned observed targets and the existing preview harness.
- Run the dependency-provided ordered build before proof, verify listener ownership, and serialize the four exact commands against the same candidate.
- Keep per-run raw captures, statuses, hashes, seeded values and cleanup identity; preserve prior run evidence.
- Report source failures to ORI-AST-002, ORI-AST-004, ORI-AST-009 or the responsible content/build/visual dependency; repeat exact proof after its reviewed repair.

Ask first:

- Any expansion of product scope, write permissions, dependencies, locked scenarios or verification commands.
- Any change to governed surface/coldboot policy or the locked preview origin.
- Any proposed substitution for unavailable real dependencies or missing functional RED; keep acceptance blocked without valid proof.

Boundary contracts:

- FLOW-SHELL-13 proves shared selection, storage and root dataset across Installation, Quickstart, generated Message, home and Components; no URL-based engine state. Verify multiple groups and unique ARIA relationships.
- FLOW-SHELL-14 inspects actual initial HTTP response bodies and real JavaScript-disabled rendering for both complete engine panels, labeled fallback and unique groups. No after-load registry request constructs the commands.
- FLOW-SHELL-07 retains streamdown, renderMarkdown and dev client queries, grouped results, actual boundary/item destinations, indexed props/verdicts, keyboard/focus restoration, dialog open within 300ms and recovery from the real 404.
- FLOW-SHELL-08 observes zero Pagefind requests before first open, including five-second wait, hover and soft navigation; first open loads same-origin module/index, unchanged-query reopen adds no requests. JavaScript-disabled navigation makes no Pagefind requests.
- Use only the built candidate at the locked localhost:4321 surface. Full flow tests have one primary owner here; early-task focused tests are supporting proof, not replacements.
- Run actual preimplementation browser failures for the original records and retain source-bound RED output. Final integration requires current candidate-bound raw HTML, traces, request logs and screenshots.
- Do not edit product source in this task. Route a failing source contract back to its named implementation owner, integrate the repair, rebuild and repeat these exact tests.

The ownership statement above concerns the complete journeys. It does not assign PRIMARY task-flow acceptance criteria.

### DELIVERABLE

Move only the four original integrated engine/search flow tests from ORI-AST-002/004 into a post-content proof task. Execute their complete unchanged scenarios over the real built docs, real Pagefind index and real custom 404. Core implementation stays in its original tasks; a discovered source failure returns to that owner for repair and fresh proof.

The first four writeAllowed paths contain the complete tests. The task manifest and per-flow run.json files link immutable per-run raw observations, exact commands, candidate identity, RED, negative-control failures and restored passes. Each proof.red is canonical; retained red.txt paths are supplemental. All evidence paths remain future outputs.

### AGENT INSTRUCTIONS

RED: author each complete locked test before accepting implementation; execute against recorded preimplementation source and return actual assertion output, exact command, source identity and canonical proof.red. Missing dependencies or runner errors block proof.

GREEN: after reviewed dependency integration and the ordered build, execute the same command and observe every scenario. Return product failures to their named owners; this task edits no candidate product source. Repeat after reviewed repair and rebuild.

REFACTOR: improve only the four owned tests if needed, preserve every locked scenario and command, and rerun affected proof. Execute the required real-copy negative controls, restore exact candidate bytes and obtain fresh passing evidence.

Close contexts, detach observers and stop only recorded owned children on every exit. Preserve prior evidence and shared WIP. Independent astro-reviewer and test-quality-reviewer review precedes acceptance.

Agent rationale: astro-planner owns built HTML, ClientRouter and Pagefind proof design; astro-implementer authors the four tests; astro-reviewer validates Astro/browser integration, with test-quality-reviewer checking that the real negative controls fail. Co-author provenance remains techwriting-planner, frontend-designer and ghactions-planner.

### READING LIST

1. `tests/sprint-04-generated-reference/engine-tab-persists-across-pages.spec.ts`, lines 1-100 [PRIMARY PATTERN] — real built-preview navigation and dataset-derived observations; do not copy the old anatomy preamble or override no-JavaScript execution.
2. `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/render-contexts/ORI-AST-010.json` — complete immutable task, four original journeys, exact commands, evidence contracts and fixed sprint contract.
3. `.spec/prds/docs-site/06-uc-shell.md` — UC-SHELL-02 and UC-SHELL-03; no-JavaScript behavior required by the locked journeys.
4. `.spec/e2e-policy/surface.json` — real driver and product-owned observed-target requirements.
5. `.spec/e2e-policy/coldboot.json` — real entrypoint seeding restrictions.

### DESIGN AND CODING STANDARDS

- Verify the actual integrated tab labels, unique ARIA ownership, search groups, loading state and focus restoration supplied by the visual owners.
- Inspect desktop, mobile-browser and JavaScript-disabled observations using their actual capabilities. Do not turn a no-JavaScript project into a JavaScript-enabled context.
- Read initial response bytes independently of hydrated DOM; compare complete commands and indexed destination content with real candidate data.
- Use TypeScript and existing Playwright/preview conventions; deterministic assertions and evidence capture own pass/fail.
- Use real keyboard, links, tabs, HTTP and network observation. Storage and root dataset reads corroborate UI behavior; never seed them directly.
- Keep retries at zero, preserve the configured targets, close owned contexts/listeners on all paths, and reject empty loops or catch-and-pass logic.
- Keep negative-control changes inside isolated actual source/build copies under owned scratch; never alter candidate product source or broaden tracked write permissions.

### EVIDENCE GATES

1. Preflight: all declared dependencies are integrated; verify source against 38034e972490945b684f5bd5a706bca0479dc659 and reviewed commits, owned localhost:4321 listener, ordered build, and fresh command/test/driver/policy/dist hashes.
2. RED: run the same four real-browser flows against recorded preimplementation source and capture actual behavioral assertion failures at canonical proof.red. Build/import/setup errors and source absence do not count.
3. GREEN: run each exact verify_commands entry on the completed candidate. Observe every locked step and expectation across actual desktop, mobile-browser and no-JavaScript cases; require current raw values rather than exit status alone.
4. Negative controls: in isolated actual source/build copies remove a panel, break shared synchronization, withhold the real index, and remove boundary indexing. Run the corresponding unchanged command; each must fail for its targeted assertion. Restore exact bytes, rebuild as required and rerun to pass.
5. Quality: pnpm typecheck, pnpm lint and pnpm test must pass; broader integrated acceptance belongs to ORI-CI-004. A failure blocks acceptance or returns to its named owner, without bypass or unsupported pre-existing claims.
6. Evidence: manifest.json links each exact command and run ID to source/lockfile/dist/test/driver/policy hashes, raw response bodies/statuses, traces, timestamped request counts, selected-engine/storage/dataset observations, result text/URLs, screenshots, RED, negative-control and restored-pass output. All paths are planned outputs until captured.
7. Contract and scope: scenario validator reports zero findings; parent validates the full sprint flow map with the four exact post-integration journey proofs. Review confirms only write_allowed paths changed, no stubs/skips/placeholders remain, and only owned resources were cleaned up.

Verification contract: The complete four locked flows must pass against the candidate's real browser/server/index. Negative controls in isolated actual source/build copies remove a panel, break shared synchronization, withhold the real index, or remove boundary indexing; each corresponding test must fail and the restored candidate must pass. Record actual observations, not source-only checks.

Human test hook: Choose an engine once and navigate through real docs; then use keyboard search and 404 recovery while observing complete labels, real results and first-open loading.

Authoring validation: `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` consumed the normalized `{fixtures, requirements}` through stdin and returned exit 0, four scenarios and zero findings. `SURFACE_BIN=/dev/null` disabled optional telemetry; no attempt ledger was enabled. No product verification ran.

### OUT OF SCOPE

- Product-source fixes, content authoring, styling changes, new components, packages, dependencies or build/config changes.
- Changing or replacing the four locked journeys, assigning task-flow PRIMARY ownership, or editing earlier test lanes.
- Native app/provider/public-registry installation matrices, hosted workflow implementation and publication; these remain with their named sprint owners.
- Repository writes, implementation, product verification, git lifecycle operations or deployment during this rendering response.

### CONTEXT

Current gap: The compact context carries planned proof only. Earlier engine tests exist, but they do not establish these complete post-content journeys on the final candidate.

Capability: CAP-DOCS-01.

PRD references:

- `.spec/prds/docs-site/06-uc-shell.md#uc-shell-02-navigate-by-cmdk-search`
- `.spec/prds/docs-site/06-uc-shell.md#uc-shell-03-persist-the-engine-choice-across-pages`
- `.spec/prds/docs-site/04-uc-docs.md`
- `.spec/prds/docs-site/ROADMAP.md`

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json`. Source task IDs: ORI-AST-002, ORI-AST-004. Artifact status: planned_output_not_observed.

Fixed sprint contract:

```json
{"gate":"A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.","entrypoint":"docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction","demonstrates":"UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)","flow_count":13,"task_flow_count":9,"journey_flow_count":4,"task_count":36,"point_total":131}
```

Supported gate steps: ORI-GATE-06 (6), ORI-GATE-07 (7), ORI-GATE-08 (8), ORI-GATE-09 (9). The locked 13-flow split remains nine task flows and four journeys.

Execution preconditions: use a reviewed isolated candidate; recheck source identity against the dispatch SHA and reviewed commits; build actual registry/gallery/docs-data, source-backed snippets, Astro HTML, Pagefind and checked links in order. Complete current-candidate suites require their fully provisioned acceptance context. This task consumes Quickstart's owned proof and does not replace its clean public installations or six-target matrices with old receipts. Missing preconditions block acceptance.

### REVIEW

Must pass:

- All four complete locked journeys run on the exact candidate with unchanged files/tokens/commands and real services.
- Canonical source-bound RED, targeted negative-control failures and restored-candidate passes are captured with raw seeded values.
- Initial response HTML and actual no-JavaScript fallback are proved independently of client rendering; desktop/mobile targets retain required behavior.
- Task requirements remain non-primary with null flow_ref; the four exact journey_proofs retain sole post-integration ownership.
- Scope, quality commands, fresh evidence identity and cleanup pass; no test or production stub, skip, fake-success path or deferred core behavior remains.

Should verify:

- Oracles identify actual panels, result groups, destination content and request phases instead of generic root visibility.
- Synchronization checks distinguish stale storage, stale root attributes and unsynchronized later groups.
- Search probes distinguish real boundary indexing and props/verdict search from canned results; first-open timing is independent of index initialization.

Verdict: Pending independent astro-reviewer and test-quality-reviewer review. Return APPROVED or NEEDS_FIXES with specific failing assertions, paths and evidence.

### DEPENDENCIES

Depends on: ORI-CONT-004, ORI-AST-002, ORI-AST-004, ORI-AST-009, ORI-CI-002, ORI-VIS-001, ORI-VIS-003, ORI-VIS-005.

Consumes:

- ORI-CONT-004: Reviewed real Quickstart content and its prerequisite proof, present before integrated journeys.
- ORI-AST-002: Engine-tab implementation, shared selection and initial-HTML panels; focused early tests remain supporting proof.
- ORI-AST-004: Real search dialog and Pagefind loading implementation; focused early tests remain supporting proof.
- ORI-AST-009: Real custom 404 and recovery surface.
- ORI-CI-002: Ordered real build through registry/gallery/docs-data, source-backed snippets, Astro, Pagefind and checked links.
- ORI-VIS-001: Reviewed engine-tab presentation consumed by the locked engine journeys.
- ORI-VIS-003: Reviewed search presentation consumed by the locked search journeys.
- ORI-VIS-005: Reviewed recovery presentation consumed by the locked search/404 journey.

Blocks: ORI-CI-004.

Provides:

- Four complete post-integration journey proofs for FLOW-SHELL-07, FLOW-SHELL-08, FLOW-SHELL-13 and FLOW-SHELL-14, with exact bindings retained in task_plan.journey_proofs.
- Candidate-bound task manifest and raw per-flow evidence, including canonical source-bound proof.red, negative-control failures and restored-candidate passes.

Parallel: final browser proof is serialized on the locked preview; no concurrent source/build mutation.

Journey ownership: task_plan.journey_proofs contains the four unchanged post-integration records, bound to this task's exact test paths, grep tokens, commands, services and surface policy.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-010","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"integrated_docs":{"description":"Reviewed dependency candidate built through the real ordered registry, gallery, docs-data, source-backed snippet, Astro, Pagefind and link-check entrypoints; served at http://localhost:4321 by the owned Playwright preview.","seed_method":"cli","records":["Actual Installation and Quickstart content, generated Message, home and Components contain complete nativewind and uniwind commands.","All 56 item destinations, authored getting-started entries, /docs/owns-vs-does-not-own, production Pagefind resources and the real custom 404 come from the candidate build.","Queries streamdown, renderMarkdown and dev client exercise real indexed props, verdicts and boundary content.","Each run records fresh run ID, source and lockfile hashes, built-dist hash, command/test/driver hashes and .spec/e2e-policy/surface.json plus .spec/e2e-policy/coldboot.json hashes.","Start each interactive case in a new real browser context with empty localStorage and no loaded Pagefind resources; attach observation before navigation and change engine only through tabs."]},"integrated_docs_nojs":{"description":"The same real built candidate and owned localhost:4321 preview, accessed by an actual HTTP client and a fresh Playwright context with JavaScript disabled.","seed_method":"ui_flow","records":["Navigate to actual /docs/installation, /components/message and Quickstart through real HTTP and links; no rendered HTML or storage is injected.","The production build includes both nativewind and uniwind panel contents and labeled navigation/recovery links before client execution.","Attach the real request log before first navigation; use a fresh unknown path to reach the server's custom 404."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the integrated docs and a fresh browser WHEN an integrator selects uniwind, navigates five page surfaces and switches a later Quickstart block to nativewind THEN panels, storage and root dataset agree across navigation without URL engine state.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts","test_function":"FLOW-SHELL-13-engine-tab-persists-across-pages","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, actual Installation and Quickstart content, generated Message, home, Components, ClientRouter, and browser storage","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/proof.red","scenario":{"id":"SC-ORI-AST-010-1","use_case_ref":"UC-SHELL-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, actual Installation and Quickstart content, generated Message, home, Components, ClientRouter, and browser storage","negative_control":{"would_fail_if":["Shared synchronization is disconnected in an isolated actual source/build copy; the same locked test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs","action":{"actor":"user","steps":["Open /docs/installation and verify the documented fresh-context default.","Click the uniwind tab and inspect its complete command.","Read rnr-engine and root data-engine.","Follow the actual Quickstart link through ClientRouter.","Hard-load /components/message.","Return to Quickstart and select nativewind from a later tabbed block.","Inspect all engine groups, then visit home and Components.","Operate tabs with the real keyboard and observe each group's own labels and panel relationships."]},"end_state":{"must_observe":["Selecting 'uniwind' makes the complete matching command visible, localStorage 'rnr-engine' equal 'uniwind', and root 'data-engine' equal 'uniwind'.","Selection persists through real Quickstart ClientRouter navigation and hard-load '/components/message'; Installation, Quickstart, Message, home and Components provide 5 consistent page surfaces.","Selecting 'nativewind' in a later Quickstart block updates every engine group, 'rnr-engine' and root 'data-engine' to 'nativewind'.","Every tab/panel has 1 unique ID and a relationship owned by its own group; real keyboard operation selects the matching panel.","All visited URLs contain 0 engine-state query or fragment encodings; the fresh-context default matches the documented engine."],"must_not_observe":["Empty command panels or unchanged default selection after choosing 'uniwind'.","Stale 'rnr-engine' or 'data-engine', duplicate IDs, cross-group references, or engine state in any visited URL."]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the integrated docs and a real HTTP client with JavaScript-disabled rendering WHEN Installation, Message and Quickstart are inspected THEN both complete labeled engine panels exist in initial HTML with unique tab relationships and readable fallback.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts","test_function":"FLOW-SHELL-14-tab-panels-in-initial-html","verify":"pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, original HTTP response bodies, and actual JavaScript-disabled Playwright rendering","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/proof.red","scenario":{"id":"SC-ORI-AST-010-2","use_case_ref":"UC-SHELL-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, original HTTP response bodies, and actual JavaScript-disabled Playwright rendering","negative_control":{"would_fail_if":["A complete engine panel is removed from an isolated actual source/build copy; the same initial-HTML/no-JavaScript test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs_nojs","action":{"actor":"api_client","steps":["Fetch the raw response body for /docs/installation.","Fetch the raw response body for /components/message.","Inspect each response's labeled nativewind and uniwind panels.","Load each route in the JavaScript-disabled browser and read both panels.","Inspect the multiple Quickstart groups for unique ARIA IDs and readable engine labels."]},"end_state":{"must_observe":["Original 200 HTTP responses for '/docs/installation' and '/components/message' include both complete 'nativewind' and 'uniwind' commands inside their correctly labeled panels.","The JavaScript-disabled browser displays 2 stacked readable engine panels per group with 'nativewind' and 'uniwind' labels.","Quickstart groups have 0 duplicate IDs or cross-group ARIA references and retain readable engine labels.","Network observation records 0 after-load registry requests constructing panel commands."],"must_not_observe":["0 engine panels, empty commands, blank fallback or one engine missing from the original response.","Client-created command content or labels and ARIA relationships owned by another group."]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the complete built docs, production index and custom 404 WHEN a visitor opens keyboard search and uses streamdown, renderMarkdown and dev client THEN timely accessible search reaches real grouped results, boundary and item destinations, and recovery links.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts","test_function":"FLOW-SHELL-07-cmdk-open-search-navigate","verify":"pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, custom 404, and actual Playwright keyboard, focus, network, and navigation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/proof.red","scenario":{"id":"SC-ORI-AST-010-3","use_case_ref":"UC-SHELL-02","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, production Pagefind index, custom 404, and actual Playwright keyboard, focus, network, and navigation","negative_control":{"would_fail_if":["Boundary indexing is removed from an isolated actual source/build copy, or search is a static disconnected result list; the same locked search test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs","action":{"actor":"user","steps":["Open /docs/introduction and press Meta+K on macOS or Control+K elsewhere.","Observe the dialog opening, focused input, and actual loading transition.","Type streamdown, inspect grouped results and the announced count, then use Enter on the highlighted result.","Reopen search and query renderMarkdown; find both the boundary result and an applicable item result and navigate to each.","Repeat with dev client and verify boundary and item destinations contain the relevant text.","Confirm five item and three documentation destinations are represented by actual index results.","Navigate to a fresh unknown path, open search from the real custom 404, and recover to Message.","Reopen and dismiss with Escape, confirming focus returns to the invoking control."]},"end_state":{"must_observe":["The native dialog has 'aria-modal=true', opens within 300ms of Meta+K on macOS or Control+K elsewhere, and focuses its input independently of Pagefind initialization.","Search for 'streamdown' returns actual grouped results with 'components/ui/lib/pages' group identity and an 'aria-live' count equal to the rendered result count; Enter navigates the highlighted result and closes the dialog.","Both 'renderMarkdown' and 'dev client' return '/docs/owns-vs-does-not-own' and applicable item results; navigating each returns 200 and the relevant destination text.","Real indexed results represent at least 5 item and 3 documentation destinations; 'renderMarkdown' props and actual verdict literals are searchable and recorded.","A fresh unknown path returns the real custom 404; its shared search recovers to '/components/message' with status 200.","Escape dismisses the reopened dialog and returns focus to 1 invoking control; record loading transitions, counts, URLs and destination screenshots."],"must_not_observe":["0 results for the required queries, empty props/verdict indexing, or absent boundary destinations.","Static canned results, non-200 result destinations, a blank 404 recovery surface or lost invoking-control focus."]}},{"start_ref":"integrated_docs_nojs","action":{"actor":"user","steps":["Open /docs/introduction with JavaScript disabled, follow actual documentation links, visit a fresh unknown path, and recover through the real custom 404 navigation links to Message."]},"end_state":{"must_observe":["Real no-JavaScript documentation and recovery links reach '/components/message' with status 200 and readable Message content after the unknown route returns 404."],"must_not_observe":["Blank recovery surface, 0 usable recovery links, or a JavaScript requirement for navigation."]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN a fresh browser and the built Pagefind output WHEN a visitor waits, hovers, soft-navigates, opens search and reopens the unchanged query THEN Pagefind loads only on first open and no-JavaScript navigation makes no Pagefind requests.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts","test_function":"FLOW-SHELL-08-pagefind-lazy-load-on-first-open","verify":"pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, ClientRouter, production Pagefind resources, and actual Playwright network observation","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","maps_to_ac":null,"tdd_state":"none","artifact":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/run.json","red_proof":"tests/sprint-05-orient-search/evidence/FLOW-SHELL-08-pagefind-lazy-load-on-first-open/proof.red","scenario":{"id":"SC-ORI-AST-010-4","use_case_ref":"UC-SHELL-02","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, ClientRouter, production Pagefind resources, and actual Playwright network observation","negative_control":{"would_fail_if":["The real Pagefind index is withheld from an isolated actual source/build copy, or loading is an empty no-op; the same locked lazy-load test must fail, and the restored candidate must pass."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"integrated_docs","action":{"actor":"user","steps":["Open /docs/introduction and wait five seconds without opening search.","Hover header navigation links.","Follow real links through /docs/installation and /registry using soft navigation.","Assert no Pagefind request has occurred.","Open search for the first time and await its real initialization.","Close the dialog and reopen it on the same page without changing the query."]},"end_state":{"must_observe":["Before opening search, the complete request log has 0 '/pagefind/' requests after a 5-second wait, navigation-link hover and real soft navigation through '/docs/installation' and '/registry'.","First open requests same-origin '/pagefind/pagefind.js' and at least 1 real index resource, with separate module and index-resource counts.","Closing and reopening on the same page with an unchanged query adds 0 Pagefind requests; timestamps identify first-open and reopen phases."],"must_not_observe":["No module or index request after first open, empty index resources, or requests that precede first open.","Additional Pagefind requests on unchanged-query reopen or cross-origin Pagefind resources."]}},{"start_ref":"integrated_docs_nojs","action":{"actor":"user","steps":["Attach request observation before navigation in the JavaScript-disabled context; open /docs/introduction and follow actual links to /docs/installation and /registry."]},"end_state":{"must_observe":["The JavaScript-disabled browser reaches '/docs/installation' and '/registry' with status 200 and readable destination content.","The complete no-JavaScript request log records 0 '/pagefind/' requests."],"must_not_observe":["Blank destination content, 0 working navigation links, or any Pagefind request."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Engine selection, complete commands, storage, root dataset, unique keyboard-operable groups and URLs satisfy AC-1 on all five page surfaces; the synchronization negative control fails and the restored candidate passes.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Both complete labeled engine panels are present in original HTTP bodies and readable without JavaScript; panel removal fails AC-2 and the restored candidate passes.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"All required query, grouping, indexed-content, timing, focus, navigation and real 404 assertions satisfy AC-3; removing boundary indexing fails and the restored candidate passes.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Pre-open and unchanged-query-reopen Pagefind counts are zero, first-open real module/index counts are nonzero, and no-JavaScript navigation works without Pagefind; withholding the index fails AC-4 and the restored candidate passes.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/pagefind-lazy-load-on-first-open.spec.ts --grep FLOW-SHELL-08-pagefind-lazy-load-on-first-open","maps_to_ac":"AC-4"}]}
-->
</details>
