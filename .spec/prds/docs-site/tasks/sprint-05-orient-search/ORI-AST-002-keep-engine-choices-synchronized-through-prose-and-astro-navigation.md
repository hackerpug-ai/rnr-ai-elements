## What this does

An integrator chooses an engine once; real tabs stay synchronized across pages, preserve readable static panels, and keep shell controls working.

## Why

TabGroup.astro repeats engine-only tab/panel IDs. tab-group.ts changes only its own group and never updates root data-engine. DocsLayout.astro lacks ClientRouter and only projects html.light.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts` against the candidate's real built preview. Capture functional RED before GREEN, concrete browser and HTTP observations, and explicit no-JavaScript fallback evidence. ORI-AST-010 owns the later Installation/Quickstart journeys. All product evidence remains planned.

## Scope

Exactly three implementation files, one focused browser spec, and one evidence manifest. Depends on ORI-AST-001; does not wait for its content consumers.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

# ORI-AST-002: Keep engine choices synchronized through prose and Astro navigation

> Status: ✅ Completed

Commit: 5548a4b56d15c0c0ed99f0263bbcbd342f5352b5
> Assignee: astro-implementer · Reviewer: astro-reviewer
> Priority: P1 · Points: 5 · Type: FIX
> Dependency phase: After ORI-AST-001; before ORI-AST-010 integrated journey acceptance
> Proposed By: astro-planner · Co-authored By: []
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

### OUTCOME

An integrator chooses an engine once; real tabs stay synchronized across pages, preserve readable static panels, and keep shell controls working.

### 🚫 CRITICAL CONSTRAINTS

- Preserve the exact five-file write allowlist and assigned isolated candidate; never stash, reset, clean, broadly stage, or perform trunk lifecycle operations.
- Never substitute injected views, mocked HTTP/storage, canned output, skipped browser targets, or source scans for real behavioral RED/GREEN evidence.
- Keep both engine panels in build output and readable without JavaScript; never fetch panel content or encode engine state in a page URL.
- Use one validated engine transition; generic labels never enter rnr-engine, and unavailable storage never leaves every panel hidden.
- Derive html.dark and html.light from the same theme decision; preserve CopyButton, ThemeToggle, and LedgerFilter through real ClientRouter swaps.

### DONE WHEN

- [ ] AC-1 through AC-5 and mapped TC-1 through TC-5 are proven against real runtime inputs.
- [ ] Functional RED precedes GREEN and the manifest contains observed values and source-bound output.
- [ ] Typecheck, lint, actual docs build, and the exact focused Playwright command pass; independent review confirms the same candidate.
- [ ] Only the five allowed repository files changed; locked journey ownership is unchanged.

### RUNTIME COMMANDS

- test: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts`
- typecheck: `pnpm typecheck`
- lint: `pnpm lint`
- build: `pnpm --filter @rnr-ai-elements/docs build`

PROGRESS: 0/5 ACs; all TDD_STATE values are none.

### ACCEPTANCE CRITERIA

This immutable FIX uses task-owned e2e proofs with flow_ref:null. ORI-GATE-08 and ORI-GATE-09 exercise this task as support. ORI-AST-010 owns the locked journeys after Installation/Quickstart content exists; this fix does not depend on its consumers. No AC claims PRIMARY ownership.

**AC-1: Synchronize engine groups and keyboard relationships**

GIVEN the existing message page with two engine groups WHEN an integrator selects either engine from either group by click or keyboard THEN both groups, storage, and root engine agree, with unique local ARIA relationships.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/engine-state-contract.spec.ts
- TEST_FUNCTION: ORI-AST-002-AC-1
- VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-1
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-002-1","use_case_ref":"UC-SHELL-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["State publication is disconnected and only the clicked group changes.","Keyboard activation is a no-op or IDs remain static across instances."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"existing_docs","action":{"actor":"user","steps":["Open /components/message; record the fresh nativewind selection, all tab/panel IDs, and each owning group.","Click uniwind in Dependencies; inspect Install and Dependencies, storage, root data-engine, and the unchanged URL.","Focus the later group's selected tab and press ArrowRight to wrap to nativewind; press ArrowLeft to return to uniwind."]},"end_state":{"must_observe":["Both groups select `uniwind`; rnr-engine and root data-engine equal `uniwind`.","Install shows `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/message.json`; dependency URLs match the uniwind tree.","Each of 2 groups has exactly 1 selected tab and 1 tab with tabindex=0; 8 tab/panel IDs are unique and each aria-controls/aria-labelledby link stays in its owning group.","ArrowRight selects `nativewind` in both groups; ArrowLeft restores `uniwind` and keyboard focus follows the selected tab; URL stays `/components/message`."],"must_not_observe":["The untouched group remains on default `nativewind` after uniwind selection.","0 selected panels, duplicate IDs, or a tab controlling the other group's panel.","Engine state in the route, query, or fragment."]}}]}
```

**AC-2: Resolve storage inputs before paint and recover from denial**

GIVEN absent, valid, malformed, or inaccessible engine storage WHEN a page loads and the visitor selects an engine THEN an available panel stays readable and root engine resolves before paint without throwing.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/engine-state-contract.spec.ts
- TEST_FUNCTION: ORI-AST-002-AC-2
- VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-2
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-002-2","use_case_ref":"UC-SHELL-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["An invalid stored constant is trusted or the storage error path is absent.","Pre-paint resolution is omitted or activation is disconnected when storage writes fail."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"persisted_inputs","action":{"actor":"user","steps":["Select uniwind through the real home tab and hard-load /components/message; capture the first-paint timeline and settled panels.","Repeat for nativewind; then repeat fresh loads with bogus-engine, the empty string, and absent storage."]},"end_state":{"must_observe":["Persisted `uniwind` resolves root data-engine to `uniwind` before first paint and selects the uniwind message command.","Persisted `nativewind` resolves to `nativewind`; bogus-engine, empty string, and absent input resolve to documented default `nativewind`.","Each real engine group has exactly 1 selected available panel after initialization; selecting `uniwind` replaces malformed storage with `uniwind`."],"must_not_observe":["Root engine is blank or default `nativewind` at first paint when valid uniwind storage exists.","0 visible panels, selected `bogus-engine`, or an uncaught storage error."]}},{"start_ref":"storage_denied","action":{"actor":"user","steps":["Hard-load /components/message under the verified native storage-denial policy.","Select uniwind in Dependencies and inspect both groups and root data-engine."]},"end_state":{"must_observe":["Initial engine is `nativewind` with 1 readable selected panel per group.","Selecting `uniwind` shows the uniwind message command in Install and uniwind dependencies; root data-engine equals `uniwind` despite actual storage denial."],"must_not_observe":["A no-op selection, 0 readable panels, or an uncaught storage exception."]}}]}
```

**AC-3: Preserve engine, theme, and controls across real navigation**

GIVEN UI-selected uniwind and light theme on the built home page WHEN the visitor follows actual links, reloads, and repeats navigation THEN engine and complementary theme markers persist and existing controls still act once.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/engine-state-contract.spec.ts
- TEST_FUNCTION: ORI-AST-002-AC-3
- VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-3
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-002-3","use_case_ref":"UC-SHELL-03","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["ClientRouter is absent and the test mistakes full loads for soft navigation.","Restoration is a no-op, stale elements retain handlers, or repeated setup duplicates listeners.","The dark marker uses an independent store disconnected from the resolved light boolean."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"existing_docs","action":{"actor":"user","steps":["On / select uniwind and use ThemeToggle to choose light; follow Browse components, then the actual message link through ClientRouter.","Observe a real Astro swap and the first subsequent painted frame; copy the message command with the real clipboard.","Follow the Components breadcrumb, filter for message, clear the filter, and repeat the message/back cycle 3 times.","Toggle dark, hard-load /components/message, and inspect root markers and selected panels; verify an ordinary fresh-tab link load also resolves."]},"end_state":{"must_observe":["After soft navigation and reload, root data-engine and rnr-engine equal `uniwind`; Install contains `https://rnraielements.com/r/uniwind/message.json`.","For light, html.light=`true` and html.dark=`false`; for dark, html.light=`false` and html.dark=`true`, including the first frame after swaps.","Clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/message.json`.","Filtering `message` retains the real `/components/message` card; clearing restores the captured original card count.","After 3 cycles, each click produces 1 engine activation or 1 theme flip; swapped elements work and URLs contain no engine state."],"must_not_observe":["The default nativewind command returns after a swap or reload.","No working copy/filter control on the incoming page, duplicate activation, or simultaneous light and dark markers."]}}]}
```

**AC-4: Keep both panels in original HTML and without JavaScript**

GIVEN the real built home and message routes WHEN an HTTP client fetches them and a JavaScript-disabled browser follows their links THEN both labeled engine panels remain readable with complete original commands.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/engine-state-contract.spec.ts
- TEST_FUNCTION: ORI-AST-002-AC-4
- VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-4
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-002-4","use_case_ref":"UC-SHELL-03","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["Panels are empty static shells filled by client fetch.","Hidden-panel fallback or readable engine labels are omitted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"existing_docs","action":{"actor":"user","steps":["Fetch / and /components/message through real HTTP and preserve status plus raw response bytes.","Parse tab/panel ownership and command associations from the responses before client execution.","Open both routes with JavaScript disabled, inspect screenshots, and follow actual Components and message links."]},"end_state":{"must_observe":["Both responses return HTTP `200` and contain nativewind and uniwind panels with the complete install command for `conversation` on / and `message` on /components/message.","Without JavaScript, both labeled panels are stacked and readable, including `https://rnraielements.com/r/nativewind/message.json` and `https://rnraielements.com/r/uniwind/message.json`.","The message response has 8 unique tab/panel IDs for 2 groups; labels and ownership resolve locally.","Ordinary links reach `/components` and `/components/message` with HTTP `200`; no registry request constructs panel content."],"must_not_observe":["An empty panel or placeholder command that requires client execution.","Only the default nativewind command is readable without JavaScript, or labels reference another group."]}}]}
```

**AC-5: Keep generic tabs independent of engine persistence**

GIVEN a real Astro consumer with engine groups and a generic nonpersistent npm/pnpm group WHEN the visitor selects pnpm and later changes engine THEN generic selection stays local and engine storage contains only an engine.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/engine-state-contract.spec.ts
- TEST_FUNCTION: ORI-AST-002-AC-5
- VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-5
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-AST-002-5","use_case_ref":"UC-SHELL-03","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["Generic tabs still write their labels to rnr-engine.","A global unscoped query mutates unrelated panels or generic activation is a no-op."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"generic_consumer","action":{"actor":"user","steps":["Build and serve the real consumer; select uniwind through its actual engine control.","Click pnpm in the generic group and inspect its panel, rnr-engine, root data-engine, and both engine groups.","Select nativewind in the later engine group; inspect generic selection and every ARIA ownership link; reload."]},"end_state":{"must_observe":["Generic selection displays `pnpm add example`; rnr-engine and root data-engine remain `uniwind`, and both engine groups remain on `uniwind`.","Selecting `nativewind` synchronizes both engine groups while the generic group still displays `pnpm add example`.","After reload the nonpersistent group returns to `npm install example`; the engine groups restore `nativewind`.","All 12 tab/panel IDs across 3 groups are unique and each control resolves within its own group."],"must_not_observe":["Default `npm install example` remains selected immediately after the pnpm click.","Storage contains `npm` or `pnpm`, engine changes hide every generic panel, or a cross-group control is used."]}}]}
```

### TEST CRITERIA

- **TC-1 → AC-1**: All engine groups, storage, root state, local ARIA references, and keyboard selection satisfy AC-1. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-1`
- **TC-2 → AC-2**: Every valid, malformed, absent, and genuinely denied storage case satisfies AC-2, including pre-paint state and readable panels. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-2`
- **TC-3 → AC-3**: Real soft navigation, reload, complementary theme markers, clipboard bytes, filter results, and repeated control activation satisfy AC-3. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-3`
- **TC-4 → AC-4**: Raw HTTP bodies and JavaScript-disabled pages satisfy AC-4 with both full labeled commands and working links. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-4`
- **TC-5 → AC-5**: Real Astro consumer interactions satisfy AC-5 without persisting generic labels or changing unrelated groups. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-5`

### FIXTURES

```json
{"existing_docs":{"description":"Build the assigned candidate through the real docs build, serve it at owned http://localhost:4321, and open a fresh browser context through HTTP.","seed_method":"cli","records":["Routes /, /components, and /components/message contain real generated install content.","The message page contains 2 engine groups: Install and Dependencies; each has nativewind and uniwind panels.","Fresh context starts with no rnr-engine or rnr-theme entry; no DOM or product-state injection."]},"persisted_inputs":{"description":"Use the same real preview. Seed valid preferences by clicking real engine tabs; for corruption cases, set only the public rnr-engine storage input through the browser's actual localStorage API, then hard-load the page.","seed_method":"public_api","records":["Valid values: nativewind and uniwind, earned by UI selection.","Malformed input values: bogus-engine and the empty string; absent input uses a fresh context.","No Storage method replacement, HTTP interception, or internal state injection."]},"storage_denied":{"description":"Open the real preview in an isolated browser profile whose native site policy denies persistent storage. Verify actual getItem/setItem denial before the case; fail setup if the browser cannot enforce it.","seed_method":"ui_flow","records":["Browser denies localStorage for http://localhost:4321 through its actual site setting.","Real engine buttons and server-rendered panels remain available.","No monkey-patched Storage prototype or synthetic exception."]},"generic_consumer":{"description":"The owned test creates an OS-derived scratch Astro consumer using the candidate's actual TabGroup.astro and bundled tab-group.ts through the public build entrypoint, then serves its real HTML over HTTP. All fixture construction stays in the allowed spec and owned scratch.","seed_method":"cli","records":["Consumer composes 2 real engine groups and 1 nonpersistent generic group with panels npm and pnpm, labels npm and pnpm, and slot text npm install example and pnpm add example.","Engine slots carry the real nativewind/uniwind message install commands from the existing component; no handwritten replacement TabGroup markup.","Generic tabs use the production nonpersistent prop/attribute contract; no product-only test route or injected view."]}}
```

### SCOPE

writeAllowed:

- apps/docs/src/components/islands/TabGroup.astro
- apps/docs/src/scripts/tab-group.ts
- apps/docs/src/layouts/DocsLayout.astro
- tests/sprint-05-orient-search/engine-state-contract.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-002/manifest.json

writeProhibited:

- .spec/**
- apps/docs/src/pages/**
- apps/docs/src/content/**
- apps/docs/src/styles/**
- apps/docs/src/scripts/theme-toggle.ts
- apps/docs/src/scripts/copy-button.ts
- apps/docs/src/scripts/ledger-filter.ts
- packages/registry/**
- apps/example/**
- package.json
- pnpm-lock.yaml
- playwright.config.ts
- tests/harness/**
- Any repository file not explicitly listed in write_allowed.

### BOUNDARIES

✅ Always:

- Use existing server-rendered groups as the primary runtime fixture and product-specific observed commands as success targets.
- Validate public storage inputs, scope each group's queries by ownership, and preserve actual link behavior.
- Bind evidence to fresh run, source, lockfile, built-dist, test, command, surface-policy, and coldboot-policy hashes.
- Identify the owner of localhost:4321; refuse an unowned listener and clean up only owned processes and scratch.
- Run each AC through functional RED, minimal GREEN, and behavior-preserving refactor.

⚠️ Ask First:

- Any dependency/version change or repository write outside the allowlist.
- Any change to locked journey ownership, gate content, verification commands, or surface/coldboot policy.

### DELIVERABLE

- apps/docs/src/components/islands/TabGroup.astro (MODIFY): unique group identity, persistent/nonpersistent operation, literal labeled panels, and fallback visibility.
- apps/docs/src/scripts/tab-group.ts (MODIFY): validated shared engine activation, scoped selection, keyboard handling, and safe reconnection.
- apps/docs/src/layouts/DocsLayout.astro (MODIFY): ClientRouter, pre-paint engine/theme resolution, complementary theme projection, and swap restoration.
- tests/sprint-05-orient-search/engine-state-contract.spec.ts (NEW): five selected real-browser AC tests, real Astro consumer setup, and evidence capture.
- tests/sprint-05-orient-search/evidence/ORI-AST-002/manifest.json (NEW): source-bound observed RED/GREEN and seeded runtime evidence.

### SPECIFICATION

Give each TabGroup instance unique ARIA IDs and limit queries to that instance. Synchronize all engine blocks after deliberate selection through one engine-state contract, validating stored values and keeping the fresh-context nativewind default. Set document.documentElement.dataset.engine before paint and after navigation. Preserve support for generic nonpersistent tabs without writing their labels to rnr-engine. Add ClientRouter to the shared layout and restore root theme and engine state across swaps without duplicate listeners. Both engine panels remain literal build output and readable with JavaScript disabled. Derive an html.dark compatibility marker from the same resolved boolean that controls html.light, so the literal locked scenarios work while the existing dark-default/light-override CSS remains authoritative.

### BOUNDARY CONTRACTS

- Tab activation updates rnr-engine, root data-engine, and every engine block through one state transition.
- Invalid or inaccessible storage falls back to an available documented panel; it never leaves every panel hidden.
- Engine selection never enters route paths, query parameters, or state fragments.
- Soft navigation reconnects real elements and preserves ordinary full-page link behavior.
- The dark marker and light override are complementary outputs of the same theme decision, never independent theme stores.
- ClientRouter restoration preserves CopyButton, ThemeToggle, and LedgerFilter behavior.
- The focused real-browser task test exercises existing home/component install blocks, multiple actual groups, raw response HTML, keyboard selection, invalid storage, and ClientRouter changes. ORI-AST-010 owns the unchanged four-page Installation/Quickstart full-flow acceptance after content exists; this implementation task does not wait on its consumers.

Verification contract: Drive real tabs on already existing home and generated component pages. Prove same-page synchronization, soft navigation, hard reload, keyboard activation, valid/invalid storage and unique label/control relationships, using real HTTP response bodies and JavaScript-disabled contexts. ORI-AST-010 later runs the full locked Installation/Quickstart journey; it is not a prerequisite for this implementation task.

Human test hook: retain-engine-choice-between-pages.

### AGENT INSTRUCTIONS — RED → GREEN → REFACTOR

1. For each AC, read its scenario and public entrypoints. Write its selected test in the allowed spec and run its VERIFY command against the real preimplementation built candidate. Capture an actual behavioral assertion failure; missing tests, setup errors, or authored flags do not count.
2. After RED is verified, implement the minimum allowed-file change. Rebuild the candidate and run the same test. Capture observed values and command output.
3. Refactor only within scope, then rerun the same proof. Do not add behavior or replace runtime proof with source scans.
4. After all ACs, run the task command and required gates. Scan touched production code and tests for stubs, skips, TODO deferrals, and fake success; remaining required behavior is a blocker.
5. Submit the candidate and evidence to astro-reviewer. Workers report their branch commit; the orchestrator owns integration and journey acceptance.

### READING LIST

1. apps/docs/src/scripts/tab-group.ts, lines 1–99 [PRIMARY PATTERN]: actual custom-element lifecycle, instance queries, storage boundary, keyboard activation, and registration guards.
2. apps/docs/src/components/islands/TabGroup.astro, lines 1–104: public panels/slots contract, unique ARIA IDs, server-rendered labels, and no-JavaScript visibility.
3. apps/docs/src/layouts/DocsLayout.astro, lines 1–70: inline pre-paint resolution, shared layout composition, ClientRouter insertion, and root restoration.
4. tests/harness/docs-preview.ts, lines 1–101: owned built-preview origin, HTTP navigation, clipboard permissions, and lifecycle observation; do not modify the harness.
5. .spec/prds/docs-site/06-uc-shell.md, lines 20–59: UC-SHELL-03 and only the adjacent theme/no-JavaScript behavior required by this fix.

### DESIGN AND REFERENCE GUIDANCE

- Retain existing token-governed presentation; change state, identity, and lifecycle behavior without visual redesign.
- Give each rendered group a unique build-output prefix. Resolve tab/panel relationships inside the owning group, including adjacent or nested consumers.
- Preserve current engine callers. Offer explicit nonpersistent operation for generic panels; engine persistence accepts only nativewind or uniwind.
- Keep bootstrap resolution and activation on one shared engine contract within the allowed layout/script. Resolve root data-engine before paint; reconnect incoming real groups without duplicate subscriptions.
- Project html.dark from the same resolved light boolean, including existing ThemeToggle changes. Keep html.light authoritative for CSS; introduce no second theme store and do not edit the protected theme-toggle script.
- Restore root state during the documented swap lifecycle before paint. Bundled modules execute once, so handle incoming elements through their lifecycle. [Astro view transitions](https://docs.astro.build/en/guides/view-transitions/#lifecycle-events).

### CODING STANDARDS

- Use typed Astro props, valid HTML, ordinary DOM listeners, and guarded custom-element registration.
- Keep one engine transition; validate inputs before changing visibility and catch actual storage failures.
- Bind and release listeners by element lifetime; guard window-level listeners/observers against repeated initialization.
- Keep styles scoped and token-based; preserve keyboard focus and fallback content.
- No stubs, skips, test-only production seams, fake renderer, dependency changes, or unrelated refactors.

### AGENT RATIONALE

astro-planner owns this Astro state/lifecycle charter. astro-implementer changes the allowed layout and custom element. astro-reviewer independently verifies Astro correctness and actual browser evidence.

### EVIDENCE GATES

1. Scope and identity: verify the dispatch SHA, approved prerequisite, owned preview, and changed-file allowlist.
2. Functional RED: preserve each AC's exact selected command and actual preimplementation assertion failure; setup errors and source absence are not proof.
3. Typecheck: `pnpm typecheck` must exit 0. Record that root typecheck excludes apps and cannot alone prove Astro behavior.
4. Lint: `pnpm lint` must exit 0. Do not inherit the example charter's historical unverified lint workaround.
5. Built candidate: `pnpm --filter @rnr-ai-elements/docs build` must exit 0. Use the existing ordered generated-data/registry/gallery inputs and serve freshly built dist.
6. Task proof: `pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts` must exit 0 with all five ACs proven. Retain desktop, mobile, and no-JavaScript projects. Assert applicable fallback behavior explicitly, attribute interaction only to JavaScript-enabled contexts, and never count a skipped target as passing.
7. Seeded evidence: capture actual per-case values, raw HTTP bodies, screenshots, clipboard contents, storage-denial setup proof, and RED/GREEN output. Root attributes alone cannot satisfy a UI oracle.
8. Scenario contract: pipe exact normalized `{fixtures, requirements}` to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` with no positional argument; require exit 0 and zero findings.
9. Independent review: astro-reviewer checks the candidate, applicable earlier lanes, stub/skip absence, and scope. Parent validates full-sprint flow coverage; ORI-AST-010 retains both unchanged journeys.

The manifest at tests/sprint-05-orient-search/evidence/ORI-AST-002/manifest.json is a future output. Capture fresh run identity; source, lockfile, built-dist, test/driver/policy hashes; exact commands and exit codes; actual RED/GREEN output; per-step URLs, selected tabs, complete commands, storage/root values, theme booleans and first-paint/swap observations; raw HTTP status/bodies, ARIA ownership, screenshots, clipboard bytes, filter counts, and native storage-denial evidence. Only manifest.json is a repository evidence write. Runtime attachments use owned OS-derived scratch; embed captured bytes or immutable parent-owned artifact receipts with hashes in the manifest. Preserve prior run identities. Close contexts and HTTP clients, stop only recorded test children, remove only owned scratch, and release the owned preview reservation on every exit.

### REVIEW

Must pass:

- Every AC and mapped TC has real functional RED/GREEN evidence with concrete seeded values.
- Synchronization, malformed/denied storage, keyboard ownership, and generic behavior match the contract.
- Actual swaps, reload, complementary theme markers, clipboard bytes, and filtering work without duplicate listeners.
- Original HTTP and no-JavaScript observations prove both complete labeled panels; success never relies only on a generic root.
- Exact scope, commands, provenance, and non-primary journey support remain intact.

Should verify:

- Fallback chooses an available documented panel and never stores generic labels as engines.
- Pre-paint captures distinguish hard loads from actual Astro swaps.
- Evidence names browser project and JavaScript mode and contains no synthetic success.

Verdict: APPROVED or NEEDS_FIXES. For NEEDS_FIXES, cite the failed AC, observed values, and actionable file/line evidence.

### DEPENDENCIES AND CAPABILITIES

- Depends on: ORI-AST-001.
- Blocks: ORI-AST-010 integrated acceptance; never depends on that consumer.
- Touches: CAP-INST-01.
- Provenance: proposed_by=astro-planner; co_authored_by=[]; source_task_ids=[ORI-AST-002].
- Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json.

Provides: validated shared nativewind/uniwind activation; unique instance-local ARIA relationships; nonpersistent generic tabs; ClientRouter engine/theme restoration; task-local runtime evidence.

Consumes: ORI-AST-001; existing InstallCommand and DependencyPanel callers and generated data; literal engine panels; authoritative dark-default/light-override CSS; existing ThemeToggle, CopyButton, and LedgerFilter; built-preview harness at localhost:4321; unchanged surface and coldboot policies.

PRD references:

- .spec/prds/docs-site/06-uc-shell.md#uc-shell-03-persist-the-engine-choice-across-pages
- .spec/prds/docs-site/06-uc-shell.md#uc-shell-01-experience-the-dark-first-themed-shell
- .spec/prds/docs-site/06-uc-shell.md#uc-shell-04-use-the-site-without-javascript-on-mobile-and-in-print
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md — CAP-INST-01

Supported journeys remain immutable and non-primary for this task:

- FLOW-SHELL-13-engine-tab-persists-across-pages: scope=journey, primary=false, primary_owner=ORI-AST-010, gate_steps=[8]. Test: tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts. Run: `pnpm exec playwright test tests/sprint-05-orient-search/engine-tab-persists-across-pages.spec.ts --grep FLOW-SHELL-13-engine-tab-persists-across-pages`. Artifact: tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/run.json. RED: tests/sprint-05-orient-search/evidence/FLOW-SHELL-13-engine-tab-persists-across-pages/proof.red.
- FLOW-SHELL-14-tab-panels-in-initial-html: scope=journey, primary=false, primary_owner=ORI-AST-010, gate_steps=[9]. Test: tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts. Run: `pnpm exec playwright test tests/sprint-05-orient-search/tab-panels-in-initial-html.spec.ts --grep FLOW-SHELL-14-tab-panels-in-initial-html`. Artifact: tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/run.json. RED: tests/sprint-05-orient-search/evidence/FLOW-SHELL-14-tab-panels-in-initial-html/proof.red.

Both use .spec/e2e-policy/surface.json and .spec/e2e-policy/coldboot.json; all artifacts are planned_output_not_observed. This task returns no journey_proofs.

### SPRINT CONTEXT

Gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). Sprint totals remain 13 flows: 9 task flows and 4 journey flows; 36 tasks and 131 points.

### OUT OF SCOPE

- Authoring Installation or Quickstart content, changing full journeys, or taking primary ownership from ORI-AST-010.
- Search, prose, visual redesign, print, drawer, registry/provider/native features, deployment, and package changes.
- Protected sibling controls, harnesses, policies, and repository paths outside the exact allowlist.
- Implementation, product verification, or external actions during this planning-only rendering.

### CONTEXT AND EXECUTION

Current gap: repeated engine-only ARIA IDs, per-group-only activation, missing root engine state, and no shared-layout ClientRouter.

Success state: existing home/component pages prove synchronized engine selection, safe storage handling, keyboard ownership, root restoration, literal no-JavaScript panels, and independent generic tabs.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

Authoring validation passed: exit 0, five scenarios, zero findings. Optional telemetry was disabled to keep validation read-only. No implementation or product verification ran. Evidence paths remain future outputs.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-002","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"existing_docs":{"description":"Build the assigned candidate through the real docs build, serve it at owned http://localhost:4321, and open a fresh browser context through HTTP.","seed_method":"cli","records":["Routes /, /components, and /components/message contain real generated install content.","The message page contains 2 engine groups: Install and Dependencies; each has nativewind and uniwind panels.","Fresh context starts with no rnr-engine or rnr-theme entry; no DOM or product-state injection."]},"persisted_inputs":{"description":"Use the same real preview. Seed valid preferences by clicking real engine tabs; for corruption cases, set only the public rnr-engine storage input through the browser's actual localStorage API, then hard-load the page.","seed_method":"public_api","records":["Valid values: nativewind and uniwind, earned by UI selection.","Malformed input values: bogus-engine and the empty string; absent input uses a fresh context.","No Storage method replacement, HTTP interception, or internal state injection."]},"storage_denied":{"description":"Open the real preview in an isolated browser profile whose native site policy denies persistent storage. Verify actual getItem/setItem denial before the case; fail setup if the browser cannot enforce it.","seed_method":"ui_flow","records":["Browser denies localStorage for http://localhost:4321 through its actual site setting.","Real engine buttons and server-rendered panels remain available.","No monkey-patched Storage prototype or synthetic exception."]},"generic_consumer":{"description":"The owned test creates an OS-derived scratch Astro consumer using the candidate's actual TabGroup.astro and bundled tab-group.ts through the public build entrypoint, then serves its real HTML over HTTP. All fixture construction stays in the allowed spec and owned scratch.","seed_method":"cli","records":["Consumer composes 2 real engine groups and 1 nonpersistent generic group with panels npm and pnpm, labels npm and pnpm, and slot text npm install example and pnpm add example.","Engine slots carry the real nativewind/uniwind message install commands from the existing component; no handwritten replacement TabGroup markup.","Generic tabs use the production nonpersistent prop/attribute contract; no product-only test route or injected view."]}},"requirements":[{"type":"acceptance_criterion","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-state-contract.spec.ts","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","id":"AC-1","name":"Synchronize engine groups and keyboard relationships","description":"GIVEN the existing message page with two engine groups WHEN an integrator selects either engine from either group by click or keyboard THEN both groups, storage, and root engine agree, with unique local ARIA relationships.","test_function":"ORI-AST-002-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-1","scenario":{"id":"SC-ORI-AST-002-1","use_case_ref":"UC-SHELL-03","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["State publication is disconnected and only the clicked group changes.","Keyboard activation is a no-op or IDs remain static across instances."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"existing_docs","action":{"actor":"user","steps":["Open /components/message; record the fresh nativewind selection, all tab/panel IDs, and each owning group.","Click uniwind in Dependencies; inspect Install and Dependencies, storage, root data-engine, and the unchanged URL.","Focus the later group's selected tab and press ArrowRight to wrap to nativewind; press ArrowLeft to return to uniwind."]},"end_state":{"must_observe":["Both groups select `uniwind`; rnr-engine and root data-engine equal `uniwind`.","Install shows `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/message.json`; dependency URLs match the uniwind tree.","Each of 2 groups has exactly 1 selected tab and 1 tab with tabindex=0; 8 tab/panel IDs are unique and each aria-controls/aria-labelledby link stays in its owning group.","ArrowRight selects `nativewind` in both groups; ArrowLeft restores `uniwind` and keyboard focus follows the selected tab; URL stays `/components/message`."],"must_not_observe":["The untouched group remains on default `nativewind` after uniwind selection.","0 selected panels, duplicate IDs, or a tab controlling the other group's panel.","Engine state in the route, query, or fragment."]}}]}},{"type":"acceptance_criterion","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-state-contract.spec.ts","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","id":"AC-2","name":"Resolve storage inputs before paint and recover from denial","description":"GIVEN absent, valid, malformed, or inaccessible engine storage WHEN a page loads and the visitor selects an engine THEN an available panel stays readable and root engine resolves before paint without throwing.","test_function":"ORI-AST-002-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-2","scenario":{"id":"SC-ORI-AST-002-2","use_case_ref":"UC-SHELL-03","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["An invalid stored constant is trusted or the storage error path is absent.","Pre-paint resolution is omitted or activation is disconnected when storage writes fail."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"persisted_inputs","action":{"actor":"user","steps":["Select uniwind through the real home tab and hard-load /components/message; capture the first-paint timeline and settled panels.","Repeat for nativewind; then repeat fresh loads with bogus-engine, the empty string, and absent storage."]},"end_state":{"must_observe":["Persisted `uniwind` resolves root data-engine to `uniwind` before first paint and selects the uniwind message command.","Persisted `nativewind` resolves to `nativewind`; bogus-engine, empty string, and absent input resolve to documented default `nativewind`.","Each real engine group has exactly 1 selected available panel after initialization; selecting `uniwind` replaces malformed storage with `uniwind`."],"must_not_observe":["Root engine is blank or default `nativewind` at first paint when valid uniwind storage exists.","0 visible panels, selected `bogus-engine`, or an uncaught storage error."]}},{"start_ref":"storage_denied","action":{"actor":"user","steps":["Hard-load /components/message under the verified native storage-denial policy.","Select uniwind in Dependencies and inspect both groups and root data-engine."]},"end_state":{"must_observe":["Initial engine is `nativewind` with 1 readable selected panel per group.","Selecting `uniwind` shows the uniwind message command in Install and uniwind dependencies; root data-engine equals `uniwind` despite actual storage denial."],"must_not_observe":["A no-op selection, 0 readable panels, or an uncaught storage exception."]}}]}},{"type":"acceptance_criterion","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-state-contract.spec.ts","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","id":"AC-3","name":"Preserve engine, theme, and controls across real navigation","description":"GIVEN UI-selected uniwind and light theme on the built home page WHEN the visitor follows actual links, reloads, and repeats navigation THEN engine and complementary theme markers persist and existing controls still act once.","test_function":"ORI-AST-002-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-3","scenario":{"id":"SC-ORI-AST-002-3","use_case_ref":"UC-SHELL-03","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["ClientRouter is absent and the test mistakes full loads for soft navigation.","Restoration is a no-op, stale elements retain handlers, or repeated setup duplicates listeners.","The dark marker uses an independent store disconnected from the resolved light boolean."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"existing_docs","action":{"actor":"user","steps":["On / select uniwind and use ThemeToggle to choose light; follow Browse components, then the actual message link through ClientRouter.","Observe a real Astro swap and the first subsequent painted frame; copy the message command with the real clipboard.","Follow the Components breadcrumb, filter for message, clear the filter, and repeat the message/back cycle 3 times.","Toggle dark, hard-load /components/message, and inspect root markers and selected panels; verify an ordinary fresh-tab link load also resolves."]},"end_state":{"must_observe":["After soft navigation and reload, root data-engine and rnr-engine equal `uniwind`; Install contains `https://rnraielements.com/r/uniwind/message.json`.","For light, html.light=`true` and html.dark=`false`; for dark, html.light=`false` and html.dark=`true`, including the first frame after swaps.","Clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/message.json`.","Filtering `message` retains the real `/components/message` card; clearing restores the captured original card count.","After 3 cycles, each click produces 1 engine activation or 1 theme flip; swapped elements work and URLs contain no engine state."],"must_not_observe":["The default nativewind command returns after a swap or reload.","No working copy/filter control on the incoming page, duplicate activation, or simultaneous light and dark markers."]}}]}},{"type":"acceptance_criterion","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-state-contract.spec.ts","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","id":"AC-4","name":"Keep both panels in original HTML and without JavaScript","description":"GIVEN the real built home and message routes WHEN an HTTP client fetches them and a JavaScript-disabled browser follows their links THEN both labeled engine panels remain readable with complete original commands.","test_function":"ORI-AST-002-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-4","scenario":{"id":"SC-ORI-AST-002-4","use_case_ref":"UC-SHELL-03","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["Panels are empty static shells filled by client fetch.","Hidden-panel fallback or readable engine labels are omitted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"existing_docs","action":{"actor":"user","steps":["Fetch / and /components/message through real HTTP and preserve status plus raw response bytes.","Parse tab/panel ownership and command associations from the responses before client execution.","Open both routes with JavaScript disabled, inspect screenshots, and follow actual Components and message links."]},"end_state":{"must_observe":["Both responses return HTTP `200` and contain nativewind and uniwind panels with the complete install command for `conversation` on / and `message` on /components/message.","Without JavaScript, both labeled panels are stacked and readable, including `https://rnraielements.com/r/nativewind/message.json` and `https://rnraielements.com/r/uniwind/message.json`.","The message response has 8 unique tab/panel IDs for 2 groups; labels and ownership resolve locally.","Ordinary links reach `/components` and `/components/message` with HTTP `200`; no registry request constructs panel content."],"must_not_observe":["An empty panel or placeholder command that requires client execution.","Only the default nativewind command is readable without JavaScript, or labels reference another group."]}}]}},{"type":"acceptance_criterion","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/engine-state-contract.spec.ts","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","id":"AC-5","name":"Keep generic tabs independent of engine persistence","description":"GIVEN a real Astro consumer with engine groups and a generic nonpersistent npm/pnpm group WHEN the visitor selects pnpm and later changes engine THEN generic selection stays local and engine storage contains only an engine.","test_function":"ORI-AST-002-AC-5","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-5","scenario":{"id":"SC-ORI-AST-002-5","use_case_ref":"UC-SHELL-03","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview, Chromium, native browser storage, clipboard, and HTTP responses","negative_control":{"would_fail_if":["Generic tabs still write their labels to rnr-engine.","A global unscoped query mutates unrelated panels or generic activation is a no-op."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"generic_consumer","action":{"actor":"user","steps":["Build and serve the real consumer; select uniwind through its actual engine control.","Click pnpm in the generic group and inspect its panel, rnr-engine, root data-engine, and both engine groups.","Select nativewind in the later engine group; inspect generic selection and every ARIA ownership link; reload."]},"end_state":{"must_observe":["Generic selection displays `pnpm add example`; rnr-engine and root data-engine remain `uniwind`, and both engine groups remain on `uniwind`.","Selecting `nativewind` synchronizes both engine groups while the generic group still displays `pnpm add example`.","After reload the nonpersistent group returns to `npm install example`; the engine groups restore `nativewind`.","All 12 tab/panel IDs across 3 groups are unique and each control resolves within its own group."],"must_not_observe":["Default `npm install example` remains selected immediately after the pnpm click.","Storage contains `npm` or `pnpm`, engine changes hide every generic panel, or a cross-group control is used."]}}]}},{"id":"TC-1","type":"test_criterion","description":"All engine groups, storage, root state, local ARIA references, and keyboard selection satisfy AC-1.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Every valid, malformed, absent, and genuinely denied storage case satisfies AC-2, including pre-paint state and readable panels.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Real soft navigation, reload, complementary theme markers, clipboard bytes, filter results, and repeated control activation satisfy AC-3.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Raw HTTP bodies and JavaScript-disabled pages satisfy AC-4 with both full labeled commands and working links.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-4","maps_to_ac":"AC-4"},{"id":"TC-5","type":"test_criterion","description":"Real Astro consumer interactions satisfy AC-5 without persisting generic labels or changing unrelated groups.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/engine-state-contract.spec.ts --grep ORI-AST-002-AC-5","maps_to_ac":"AC-5"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-AST-002",
  "commit_sha": "5548a4b56d15c0c0ed99f0263bbcbd342f5352b5",
  "done": "Shipped the one shared engine contract (validated nativewind/uniwind, nativewind default) across every engine group, rnr-engine storage, and root data-engine, plus ClientRouter in the shared layout and a complementary html.dark marker, proven by five real-browser AC tests (15/15 green across desktop/mobile/no-JS) and clean typecheck/lint/build/scenario-validation gates.",
  "deviations": [
    "The plan's reading list assumed the panels stayed under a plain <slot> render, but hashing slot content via Astro.slots.render in frontmatter consumed child-component script hoisting (copy-button.ts vanished from the bundle), so TabGroup.astro renders each panel once and re-injects via set:html (apps/docs/src/components/islands/TabGroup.astro).",
    "The spec said only 'derive html.dark from the same resolved boolean', but ThemeToggle clicks flip only html.light (theme-toggle.ts is writeProhibited), so DocsLayout.astro adds a window-guarded MutationObserver to keep html.dark complementary (apps/docs/src/layouts/DocsLayout.astro).",
    "Storage denial is enforced with Chromium's real --disable-local-storage switch (window.localStorage becomes null/throws) rather than any Storage prototype patch, per the fixture's no-monkey-patch rule (tests/sprint-05-orient-search/engine-state-contract.spec.ts)."
  ],
  "concerns": [
    "The deterministic content-digest group prefix would collide if two groups ever render byte-identical slot content on one page, so any new co-located TabGroup with identical panels must pass an explicit `group` prop (apps/docs/src/components/islands/TabGroup.astro).",
    "The AC-5 scratch consumer symlinks node_modules and relies on TabGroup.astro's relative <script src=\"../../scripts/tab-group.ts\"> path, so relocating tab-group.ts silently breaks that fixture.",
    "The html.dark MutationObserver observes documentElement class changes and is a tiny runtime cost on every theme toggle, but it is the only non-invasive way to mirror ThemeToggle's light-class flip."
  ],
  "findings": [
    "Astro's Astro.slots.render() hoists child-component scripts into a discarded render, so any frontmatter slot-render that is not re-emitted via set:html drops those islands from the bundle (apps/docs/src/components/islands/TabGroup.astro).",
    "Chromium --disable-local-storage makes window.localStorage null and throws on property access, which is a genuinely real (non-patched) storage-denial fixture for island recovery tests.",
    "The repo's root tsconfig carries no DOM lib, so every Playwright page.evaluate DOM/localStorage read must use the globalThis-as-unknown facade typing already used in tests/harness/docs-preview.ts."
  ],
  "scope_impact": [
    {
      "target": "ORI-AST-007",
      "found": "The registry ledger's own engine tabs and copy commands must join the same root data-engine + rnr-engine + data-persistent contract this task landed, or the ledger will drift from the component pages.",
      "change": "Wire the ledger engine selection through document.documentElement.dataset.engine and rnr-engine (the tab-group island's engineGroups() sync) and give the ledger's TabGroup an explicit `group` prop to avoid the digest path."
    },
    {
      "target": "ORI-AST-003",
      "found": "A complementary html.dark class now exists alongside html.light, and ClientRouter is active, so the live TokenTable theme flip must read/reflect both markers rather than assuming only html.light exists.",
      "change": "Bind the TokenTable swatch flip to the same resolved light boolean (html.light authoritative, html.dark complementary) so it stays correct after soft navigation."
    },
    {
      "target": "ORI-AST-010",
      "found": "Engine synchronization, unique IDs, root data-engine, and no-JS stacked panels are now the real message-page behavior, but the locked FLOW-SHELL-13/14 steps still target /docs/installation content that ORI-CONT has not landed.",
      "change": "Re-run the journey proofs against /components/message now (support behavior is in place), and defer the /docs/installation legs until ORI-CONT-001/003 manuscripts exist."
    },
    {
      "target": "GATE:FLOW-SHELL-13",
      "found": "Engine-tab persistence across pages is support-ready (cross-group sync + rnr-engine + pre-paint data-engine), but the gate step opens /docs/installation which does not yet exist.",
      "change": "Hold the journey gate on ORI-CONT content; the underlying engine-persistence mechanism is already proven by ORI-AST-002's AC-1/AC-2/AC-3."
    },
    {
      "target": "GATE:FLOW-SHELL-14",
      "found": "Both engine panels in initial HTML with unique tab/panel IDs is now true on the real component pages (8 unique IDs, no-JS stacked/readable), but the gate fetches /docs/installation's raw body.",
      "change": "Point the no-JS/raw-HTTP assertion at a real component page until the installation manuscript lands, or keep the gate RED pending ORI-CONT."
    },
    {
      "target": "ROADMAP",
      "found": "The sprint-04 lane test engine-tab-persists-across-pages.spec.ts asserts aria-selected persistence but predates the unique group-ID scheme and root data-engine; it may need its selectors updated to the new prefixed IDs.",
      "change": "Verify the sprint-04 engine-tab spec still passes against the prefixed tab/panel IDs and the synchronized engineGroups() behavior before it runs again."
    }
  ],
  "feedback": [
    "The spec's 'derive html.dark from the same resolved boolean' under-specified the ThemeToggle interaction (theme-toggle.ts only flips html.light); future theme work should state the observer/lifecycle contract explicitly.",
    "The engine-state contract (data-engine root, rnr-engine storage, data-persistent attribute) is now load-bearing for three dependent tasks; consider documenting it in 11-technical-requirements so ORI-AST-003/007/010 consume it without re-deriving it."
  ]
}
```
