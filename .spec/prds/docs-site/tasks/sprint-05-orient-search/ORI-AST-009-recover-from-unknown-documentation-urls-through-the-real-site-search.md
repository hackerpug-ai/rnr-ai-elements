# ORI-AST-009: Recover from unknown documentation URLs through the real site search

## What this does

Visitors recover from unknown documentation URLs through real site search or ordinary links while retaining the shared site shell.

## Why

The custom recovery page and its browser proof are missing from the inspected tree. Dependency outputs remain prerequisites; runtime behavior is unverified.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery` against current built dist and Pagefind. Observe real recovery, focus, navigation, index exclusion and JavaScript-disabled links.

## Scope

The custom 404 composition, owned browser spec and listed evidence only.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: astro-implementer · Reviewer: astro-reviewer
> Priority: P2 · Points: 2 · Type: FEATURE
> Dependency phase: after ORI-AST-001, ORI-AST-004, ORI-CONT-005
> Proposed By: astro-planner
> Co-authored By: techwriting-planner, frontend-designer, cloudflare-workers-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer
> PROGRESS: 0/4 ACs; all TDD_STATE values are none.

### OUTCOME

Visitors recover from unknown documentation URLs through real site search or ordinary links while retaining the shared site shell.

### CRITICAL CONSTRAINTS — Never

- Never replace real browser, HTTP, Pagefind or manuscript behavior with mocks, injected markup, canned results, static success markers or skipped targets.
- Never implement a second search dialog/index or move system/not-found.md into the docs collection; consume the prerequisite contracts.
- Never expand the write allowlist, alter deployment settings or claim deployed HTTP 404 semantics from local preview evidence.
- Never replace the canonical proof.red with run.red; capture actual functional RED with working prerequisites and the exact locked command.
- Never disturb shared WIP or unowned processes; use the assigned isolated candidate and confirm localhost:4321 ownership.

### DONE WHEN

- [ ] AC-1 through AC-4 pass their real browser assertions.
- [ ] Functional RED precedes GREEN on recorded source states.
- [ ] Current evidence captures seeded values and all applicable targets.
- [ ] Build, typecheck, lint, scenario and scope gates pass.
- [ ] Independent astro-reviewer approves the candidate evidence.

### SPECIFICATION

Render a real custom 404 through DocsLayout using ORI-CONT-005's apps/docs/src/content/system/not-found.md copy. Keep system content outside the docs collection. Compose the working PageHeader, Prose, Callout, and Button contracts for the title, recovery explanation, search hint, Search the site action, and plain links to Components and Registry. Search activation reuses SearchDialog's existing implementation. Preserve the theme/header/footer and useful recovery links with JavaScript disabled. Emit 404.html for the static host; the Cloudflare specialist owns the host's not_found_handling setting and status-code proof.

### ACCEPTANCE CRITERIA

### AC-1 [PRIMARY]: Recover to Message through shared search

TDD_STATE: none. The following human AC specification contains the complete proof fields and scenario.

```json
{"id":"AC-1","name":"Recover to Message through shared search","type":"acceptance_criterion","primary":true,"description":"GIVEN the built candidate and a fresh unknown /docs/ URL WHEN the visitor activates Search the site and selects Message THEN the focused dialog opens within 300ms and reaches substantive Message content at /components/message with HTTP 200.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-1","use_case_ref":"UC-SHELL-04","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["The recovery page is an empty static shell, its search trigger is disconnected, or its Message navigation is a no-op."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["In the real desktop and mobile projects, navigate to a fresh run-specific unknown /docs/ URL and capture the actual response and manuscript content.","Activate Search the site; measure activation-to-dialog visibility independently of Pagefind readiness and inspect the actual focused input.","Await the real index, type message, highlight the actual Message result with keyboard input and press Enter."]},"end_state":{"must_observe":["Recovery title, explanation and search hint equal the actual `system/not-found.md` manuscript.","The native dialog has `aria-modal=true`, becomes visible within 300ms, and focuses its search input.","Selecting `Message` closes the dialog and navigates to `/components/message` with HTTP 200 and the rendered Message heading and substantive reference content."],"must_not_observe":["An empty recovery shell, a disconnected search trigger, or the unchanged unknown URL after selecting Message."]}}]}}
```

### AC-2: Emit the manuscript-backed recovery document and retain the shell

TDD_STATE: none. The following human AC specification contains the complete proof fields and scenario.

```json
{"id":"AC-2","name":"Emit the manuscript-backed recovery document and retain the shell","type":"acceptance_criterion","primary":false,"description":"GIVEN the real system manuscript and a theme selected through the site control WHEN the visitor opens a fresh unknown URL THEN the emitted 404.html supplies the manuscript, retained theme, header and footer without creating an ordinary docs entry.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-2","use_case_ref":"UC-SHELL-04","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["The custom 404 document is absent, a static generic shell replaces the manuscript, or the page omits DocsLayout."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["Read the emitted apps/docs/dist/404.html identity and the actual system manuscript; compare them with recovery content served at a fresh unknown URL.","Inspect the real docs collection configuration and ordinary docs navigation for an unintended not-found entry.","Select light and then dark through the existing theme control, revisiting a fresh unknown URL after each selection; observe the shared header and footer."]},"end_state":{"must_observe":["`apps/docs/dist/404.html` is emitted and its served title, explanation and hint match `apps/docs/src/content/system/not-found.md`.","`system/not-found.md` remains outside the docs collection and ordinary documentation navigation.","Both selected `light` and `dark` themes remain on the recovery page with the shared header, footer, `Components` link and `Registry` link."],"must_not_observe":["A blank/default missing-page document, an ordinary not-found docs entry, or a theme reset after navigation."]}}]}}
```

### AC-3: Restore focus and exclude recovery content from the shared index

TDD_STATE: none. The following human AC specification contains the complete proof fields and scenario.

```json
{"id":"AC-3","name":"Restore focus and exclude recovery content from the shared index","type":"acceptance_criterion","primary":false,"description":"GIVEN recovery and ordinary pages use the production index WHEN the visitor dismisses recovery search and compares actual searches THEN Escape restores trigger focus, Message resolves identically, and recovery URLs are excluded from results.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-3","use_case_ref":"UC-SHELL-04","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["Focus restoration is a no-op, search resources are disconnected from the production index, or a hardcoded result list conceals an indexed 404 document."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["Revisit a fresh unknown URL, open recovery search and press Escape; observe the focused element.","Open search on an ordinary page and on the recovery page, query message in each, and compare actual module/index request URLs and the Message result destination."]},"end_state":{"must_observe":["`Escape` closes the dialog and focus returns to the actual `Search the site` invoking control.","Both searches load the same production `Pagefind` resources and return `Message` at `/components/message`."],"must_not_observe":["No focused recovery trigger after dismissal, an empty Message result set, or a disconnected alternate index."]}},{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["On ordinary-page search, query the exact missing-page title and then a distinctive phrase read from the current system manuscript.","Wait for each real search to complete, record its count and returned URLs, and inspect every returned destination."]},"end_state":{"must_observe":["Completed searches for the two manuscript-derived queries exclude `/404`, `/404.html` and every current-run unknown `/docs/` URL.","Each query records its actual `Pagefind` result count and URL list; a zero-result response is permitted only after real index completion."],"must_not_observe":["A placeholder result list, an indexed 404 recovery URL, or a loading state counted as an empty search response."]}}]}}
```

### AC-4: Recover through ordinary links without JavaScript

TDD_STATE: none. The following human AC specification contains the complete proof fields and scenario.

```json
{"id":"AC-4","name":"Recover through ordinary links without JavaScript","type":"acceptance_criterion","primary":false,"description":"GIVEN JavaScript is disabled WHEN the visitor reads an unknown page and follows Components and Registry THEN the explanation remains readable and both links reach matching content with HTTP 200.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-4","use_case_ref":"UC-SHELL-04","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["The no-JavaScript document is empty, recovery links are script-only no-ops, or either destination is a static success placeholder."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["In a JavaScript-disabled context, navigate to a fresh unknown /docs/ URL, read the actual explanation and follow the plain Components link."]},"end_state":{"must_observe":["The manuscript explanation and shared header/footer remain readable with `javaScriptEnabled=false`.","The plain `Components` link reaches `/components` with HTTP 200 and rendered component-family content."],"must_not_observe":["An empty recovery page, a disabled/plain-link no-op, or the unchanged unknown URL."]}},{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["In the same JavaScript-disabled context, revisit a fresh unknown /docs/ URL and follow the plain Registry link."]},"end_state":{"must_observe":["The plain `Registry` link reaches `/registry` with HTTP 200 and rendered registry ledger content."],"must_not_observe":["An empty registry shell, a script-only link, or the unchanged unknown URL."]}}]}}
```

### TEST CRITERIA

- **TC-1** → AC-1: Search the site opens the focused aria-modal dialog within 300ms; selecting the real Message result closes it and reaches /components/message with HTTP 200 and substantive content. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery`
- **TC-2** → AC-2: The emitted 404.html matches the system manuscript, retains both selected themes and shared shell, and adds no ordinary docs collection or navigation entry. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery`
- **TC-3** → AC-3: Escape restores recovery-trigger focus; ordinary and recovery searches share real Pagefind resources and Message destination; completed manuscript queries exclude recovery URLs. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery`
- **TC-4** → AC-4: With JavaScript disabled, the recovery explanation and shell remain readable and Components and Registry links reach matching content with HTTP 200. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery`

### FIXTURES

Planned shared seed, created only through real entrypoints:

```json
{"built_recovery_candidate":{"description":"Planned fixture: an isolated candidate with ORI-AST-001, ORI-AST-004 and ORI-CONT-005, built through production entrypoints and served at http://localhost:4321.","seed_method":"cli","records":["Run pnpm --filter @rnr-ai-elements/docs build with the prerequisite's production Pagefind step; retain actual build output and the emitted asset hashes.","Use the actual apps/docs/src/content/system/not-found.md manuscript; record its title, explanation and distinctive search-hint phrase without inventing copy.","The real index contains Message at /components/message; /components and /registry provide substantive recovery destinations.","Record a fresh run ID, candidate source, lockfile, test-source, dist, Pagefind, surface-policy and coldboot-policy hashes, plus the owned preview PID; refuse an unowned listener.","Open fresh desktop/mobile browser contexts and a separate JavaScript-disabled context. Generate an unknown /docs/ path from the current run ID; create no route or page for it."]}}
```

### SCOPE

writeAllowed:
- apps/docs/src/pages/404.astro
- tests/sprint-05-orient-search/not-found-search-recovery.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-009/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/run.red
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/proof.red

writeProhibited:
- .spec/**
- apps/docs/src/content/**
- apps/docs/src/layouts/**
- apps/docs/src/components/**
- apps/docs/src/lib/**
- apps/docs/astro.config.*
- apps/docs/package.json
- package.json
- pnpm-lock.yaml
- scripts/**
- .github/**
- apps/docs/wrangler*
- packages/**
- apps/example/**
- tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts
- Any path not explicitly listed in write_allowed.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:
- Read landed dependency contracts and use the actual system manuscript.
- Build through production entrypoints; preserve exact flow bindings and capture real browser observations.
- Use product-owned success targets /components/message, /components and /registry with substantive rendered content.
- Retain owned evidence and perform bounded cleanup on every exit.

Ask First:
- Changing a dependency's contract or editing any additional authored path.
- Changing scope, proof bindings, dependencies, packages or deployment behavior.

### DELIVERABLE

The listed 404 route, owned recovery spec, manifest and flow artifacts. Production build commands generate ignored dist/index outputs; never hand-edit generated assets.

### AGENT INSTRUCTIONS — TDD

1. Consume the landed dependency contracts. Add AC-specific assertion groups under the exact locked flow token.
2. Run the locked command before recovery implementation with functioning prerequisites. Capture actual assertion RED through governing run_flow at proof.red.
3. After verified RED, compose the minimal recovery page, run the identical command for GREEN and refactor within scope.
4. Run all task gates and hand source-bound evidence to astro-reviewer.

Desktop/mobile exercise enhanced search, theme and focus. The no-JavaScript project and separate disabled context must execute readable-content and ordinary-link assertions; never skip a target or require disabled JavaScript to open search.

### READING LIST

1. `apps/docs/src/layouts/DocsLayout.astro`, lines 1-70 [PRIMARY PATTERN]: Reuse the shared shell, named head slot and theme behavior.
2. `apps/docs/src/components/Button.astro`, lines all: Reuse href-driven native anchors and the existing button activation attributes.
3. `apps/docs/src/components/Callout.astro`, lines all: Reuse the info tone and title/body/link-slot contract for the search hint.
4. `tests/harness/docs-preview.ts`, lines 1-50: Use real built preview navigation and strict localhost:4321 ownership.
5. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md`, lines 386-410: Apply the existing six-region not-found composition and single-column mobile layout.

Dependency inputs: actual system/not-found.md copy and landed PageHeader, Prose and SearchDialog APIs. Do not invent absent handoff contracts.

### DESIGN AND CODING STANDARDS

Compose R1 shared Header, R2 PageHeader, R3 Prose, R4 Callout, R5 Button recovery actions and R6 shared Footer through DocsLayout. Keep the existing single-column mobile structure, semantic links, theme tokens and visible focus. Consume the landed PageHeader/Prose/SearchDialog APIs; do not guess them or author replacement primitives.

- Use valid typed Astro composition and build-time manuscript consumption; emit static HTML.
- Reuse existing token-governed styles and semantic Button anchors; preserve keyboard access and no-JavaScript readability.
- Reuse SearchDialog's production activation and focus restoration; add no framework, island or package.
- Tests observe actual responses, focused controls, search resources and destination content. Generic roots, source-only scans and authored success flags are insufficient.

### BOUNDARY CONTRACTS

- A genuinely unknown URL displays the built custom 404 document.
- Search recovery uses the same index and dialog as ordinary pages.
- Plain recovery links work without JavaScript.
- 404.html is emitted but excluded from search results.
- This prerequisite does not claim completion of all UC-DELIV-04 or UC-SHELL-04 behavior.

Capability: CAP-DOCS-01. Provides custom recovery, FLOW-SHELL-16 proof and ORI-AST-010's recovery prerequisite. Consumes composition from ORI-AST-001, search/index from ORI-AST-004, manuscript from ORI-CONT-005 and existing shell/primitives.

PRD references:
- .spec/prds/docs-site/06-uc-shell.md#uc-shell-02-navigate-by-cmdk-search
- .spec/prds/docs-site/06-uc-shell.md#uc-shell-04-use-the-site-without-javascript-on-mobile-and-in-print
- .spec/prds/docs-site/07-uc-deliv.md
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md
- .spec/prds/docs-site/11-technical-requirements/10-routing.md
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md

### VERIFICATION AND EVIDENCE GATES

RUNTIME_COMMANDS:
```text
build: pnpm --filter @rnr-ai-elements/docs build
test: pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts
locked_flow: pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery
typecheck: pnpm typecheck
lint: pnpm lint
```

Build must emit current 404.html and real Pagefind through the prerequisite integration. Require exit 0 from the locked flow, complete owned spec, typecheck and lint. Root typecheck coverage is distinct from the Astro build.

Pipe exact fixtures/requirements to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py`; require exit 0 with zero findings. The orchestrator checks full-sprint flow ownership and authored write scope.

Verification policy: `{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true}`.

All product evidence is planned. Capture source/lockfile/test/dist/Pagefind/policy hashes, run ID, commands and owned PID; actual build output, unknown response, 404.html identity, manuscript, dialog timing/focus, resource/result URLs, destination statuses/content and inspected traces/screenshots.

Canonical RED: `tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/proof.red`. A functional assertion failure on the preimplementation candidate is required. Missing infrastructure, absent tests, source absence alone, stale receipts and authored success flags are blockers. run.red is supplemental. Local status observations do not prove deployed Worker semantics.

Planned evidence:
- tests/sprint-05-orient-search/evidence/ORI-AST-009/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/run.red
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-16-not-found-search-recovery/proof.red

Surface: `.spec/e2e-policy/surface.json`; coldboot: `.spec/e2e-policy/coldboot.json`.
Teardown dismisses dialogs, detaches observers, closes owned contexts, stops only the recorded preview and releases owned scratch while preserving evidence.

### OUT OF SCOPE

- Cloudflare not_found_handling, deployed HTTP 404 status-code proof, DNS, redirects and publication.
- ORI-AST-010's integrated FLOW-SHELL-07 search journey and its test/evidence ownership.
- Authoring the system manuscript or changing shared PageHeader, Prose, SearchDialog, DocsLayout, Button or Callout implementations.
- New search features, final visual redesign, registry/native/example changes, or completion of all UC-DELIV-04/UC-SHELL-04 behavior.

### CONTEXT

The inspected source tree has no custom 404 page or recovery spec. The manuscript and working PageHeader, Prose and SearchDialog contracts are prerequisite outputs; runtime recovery remains unverified.

AC-1 is the sole PRIMARY for FLOW-SHELL-16 at gate step 12; AC-2 through AC-4 support it. Gate step 6 uses this prerequisite in ORI-AST-010's FLOW-SHELL-07 journey. No journey proof is claimed here; the locked sprint gate, entrypoint and all 13 flows remain unchanged.

### REVIEW

Must pass:
- Exact AC proof/scenario equality, real functional RED/GREEN and current seeded evidence.
- Complete appropriate desktop/mobile/no-JavaScript behavior without skipped targets.
- Actual Message, Components and Registry destination content; completed-query index exclusion and trigger-focus restoration.
- Supplied manuscript/primitives composed within the allowlist.
- No deployed status or integrated journey completion claim.

Should verify: source/policy identity, independent index-readiness timing, retained shell/theme and owned-resource cleanup. Verdict: APPROVED or NEEDS_FIXES with failed AC and concrete evidence discrepancy.

Agent rationale: astro-planner defines the static page and content/search seams; astro-implementer composes the real Astro route; astro-reviewer verifies routing, composition and browser evidence. techwriting-planner, frontend-designer and cloudflare-workers-planner retain co-author provenance for manuscript, presentation and host boundaries.

### DEPENDENCIES

Depends on ORI-AST-001, ORI-AST-004, ORI-CONT-005; blocks ORI-AST-010 integrated search acceptance. Parallel work requires disjoint authored paths and owned runtime resources.

Provenance: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json`; source_task_ids: [ORI-AST-009]; supersedes: [].

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-009","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_recovery_candidate":{"description":"Planned fixture: an isolated candidate with ORI-AST-001, ORI-AST-004 and ORI-CONT-005, built through production entrypoints and served at http://localhost:4321.","seed_method":"cli","records":["Run pnpm --filter @rnr-ai-elements/docs build with the prerequisite's production Pagefind step; retain actual build output and the emitted asset hashes.","Use the actual apps/docs/src/content/system/not-found.md manuscript; record its title, explanation and distinctive search-hint phrase without inventing copy.","The real index contains Message at /components/message; /components and /registry provide substantive recovery destinations.","Record a fresh run ID, candidate source, lockfile, test-source, dist, Pagefind, surface-policy and coldboot-policy hashes, plus the owned preview PID; refuse an unowned listener.","Open fresh desktop/mobile browser contexts and a separate JavaScript-disabled context. Generate an unknown /docs/ path from the current run ID; create no route or page for it."]}},"requirements":[{"id":"AC-1","name":"Recover to Message through shared search","type":"acceptance_criterion","primary":true,"description":"GIVEN the built candidate and a fresh unknown /docs/ URL WHEN the visitor activates Search the site and selects Message THEN the focused dialog opens within 300ms and reaches substantive Message content at /components/message with HTTP 200.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-1","use_case_ref":"UC-SHELL-04","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["The recovery page is an empty static shell, its search trigger is disconnected, or its Message navigation is a no-op."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["In the real desktop and mobile projects, navigate to a fresh run-specific unknown /docs/ URL and capture the actual response and manuscript content.","Activate Search the site; measure activation-to-dialog visibility independently of Pagefind readiness and inspect the actual focused input.","Await the real index, type message, highlight the actual Message result with keyboard input and press Enter."]},"end_state":{"must_observe":["Recovery title, explanation and search hint equal the actual `system/not-found.md` manuscript.","The native dialog has `aria-modal=true`, becomes visible within 300ms, and focuses its search input.","Selecting `Message` closes the dialog and navigates to `/components/message` with HTTP 200 and the rendered Message heading and substantive reference content."],"must_not_observe":["An empty recovery shell, a disconnected search trigger, or the unchanged unknown URL after selecting Message."]}}]}},{"id":"AC-2","name":"Emit the manuscript-backed recovery document and retain the shell","type":"acceptance_criterion","primary":false,"description":"GIVEN the real system manuscript and a theme selected through the site control WHEN the visitor opens a fresh unknown URL THEN the emitted 404.html supplies the manuscript, retained theme, header and footer without creating an ordinary docs entry.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-2","use_case_ref":"UC-SHELL-04","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["The custom 404 document is absent, a static generic shell replaces the manuscript, or the page omits DocsLayout."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["Read the emitted apps/docs/dist/404.html identity and the actual system manuscript; compare them with recovery content served at a fresh unknown URL.","Inspect the real docs collection configuration and ordinary docs navigation for an unintended not-found entry.","Select light and then dark through the existing theme control, revisiting a fresh unknown URL after each selection; observe the shared header and footer."]},"end_state":{"must_observe":["`apps/docs/dist/404.html` is emitted and its served title, explanation and hint match `apps/docs/src/content/system/not-found.md`.","`system/not-found.md` remains outside the docs collection and ordinary documentation navigation.","Both selected `light` and `dark` themes remain on the recovery page with the shared header, footer, `Components` link and `Registry` link."],"must_not_observe":["A blank/default missing-page document, an ordinary not-found docs entry, or a theme reset after navigation."]}}]}},{"id":"AC-3","name":"Restore focus and exclude recovery content from the shared index","type":"acceptance_criterion","primary":false,"description":"GIVEN recovery and ordinary pages use the production index WHEN the visitor dismisses recovery search and compares actual searches THEN Escape restores trigger focus, Message resolves identically, and recovery URLs are excluded from results.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-3","use_case_ref":"UC-SHELL-04","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["Focus restoration is a no-op, search resources are disconnected from the production index, or a hardcoded result list conceals an indexed 404 document."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["Revisit a fresh unknown URL, open recovery search and press Escape; observe the focused element.","Open search on an ordinary page and on the recovery page, query message in each, and compare actual module/index request URLs and the Message result destination."]},"end_state":{"must_observe":["`Escape` closes the dialog and focus returns to the actual `Search the site` invoking control.","Both searches load the same production `Pagefind` resources and return `Message` at `/components/message`."],"must_not_observe":["No focused recovery trigger after dismissal, an empty Message result set, or a disconnected alternate index."]}},{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["On ordinary-page search, query the exact missing-page title and then a distinctive phrase read from the current system manuscript.","Wait for each real search to complete, record its count and returned URLs, and inspect every returned destination."]},"end_state":{"must_observe":["Completed searches for the two manuscript-derived queries exclude `/404`, `/404.html` and every current-run unknown `/docs/` URL.","Each query records its actual `Pagefind` result count and URL list; a zero-result response is permitted only after real index completion."],"must_not_observe":["A placeholder result list, an indexed 404 recovery URL, or a loading state counted as an empty search response."]}}]}},{"id":"AC-4","name":"Recover through ordinary links without JavaScript","type":"acceptance_criterion","primary":false,"description":"GIVEN JavaScript is disabled WHEN the visitor reads an unknown page and follows Components and Registry THEN the explanation remains readable and both links reach matching content with HTTP 200.","flow_ref":"FLOW-SHELL-16-not-found-search-recovery","test_file":"tests/sprint-05-orient-search/not-found-search-recovery.spec.ts","test_function":"FLOW-SHELL-16-not-found-search-recovery","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-009-4","use_case_ref":"UC-SHELL-04","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real built Astro preview at http://localhost:4321, emitted custom 404.html, production Pagefind index, real HTTP navigation, and actual Playwright browser keyboard and focus","negative_control":{"would_fail_if":["The no-JavaScript document is empty, recovery links are script-only no-ops, or either destination is a static success placeholder."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["In a JavaScript-disabled context, navigate to a fresh unknown /docs/ URL, read the actual explanation and follow the plain Components link."]},"end_state":{"must_observe":["The manuscript explanation and shared header/footer remain readable with `javaScriptEnabled=false`.","The plain `Components` link reaches `/components` with HTTP 200 and rendered component-family content."],"must_not_observe":["An empty recovery page, a disabled/plain-link no-op, or the unchanged unknown URL."]}},{"start_ref":"built_recovery_candidate","action":{"actor":"user","steps":["In the same JavaScript-disabled context, revisit a fresh unknown /docs/ URL and follow the plain Registry link."]},"end_state":{"must_observe":["The plain `Registry` link reaches `/registry` with HTTP 200 and rendered registry ledger content."],"must_not_observe":["An empty registry shell, a script-only link, or the unchanged unknown URL."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Search the site opens the focused aria-modal dialog within 300ms; selecting the real Message result closes it and reaches /components/message with HTTP 200 and substantive content.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The emitted 404.html matches the system manuscript, retains both selected themes and shared shell, and adds no ordinary docs collection or navigation entry.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Escape restores recovery-trigger focus; ordinary and recovery searches share real Pagefind resources and Message destination; completed manuscript queries exclude recovery URLs.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"With JavaScript disabled, the recovery explanation and shell remain readable and Components and Registry links reach matching content with HTTP 200.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/not-found-search-recovery.spec.ts --grep FLOW-SHELL-16-not-found-search-recovery","maps_to_ac":"AC-4"}]}
-->
</details>
