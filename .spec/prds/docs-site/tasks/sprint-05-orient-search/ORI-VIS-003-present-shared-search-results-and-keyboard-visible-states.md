# ORI-VIS-003: Present shared search results and keyboard-visible states

## What this does

Visitors can see search focus, grouped results and active selection in a dialog whose controls remain reachable on mobile.

## Why

The real search contract needs token-based dialog, result, focus and status presentation.

## How to verify

Build the actual candidate with `pnpm --filter @rnr-ai-elements/docs build`. Run `pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile`. Inspect real search results, focused controls, selected-result changes, mobile geometry and screenshots.

## Scope

Presentation in SearchDialog and the Header search trigger, plus task-owned real browser evidence. ORI-AST-004 owns indexing, loading, keyboard handling, focus management and navigation.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

Status: Backlog
Assignee: frontend-designer
Priority: P1
Points: 2
Type: DESIGN
Dependency phase: After ORI-VIS-001 and ORI-AST-004
Proposed By: frontend-designer
Co-authored By: []
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)
Planned date: 2026-09-14
Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
AGENT: planner=frontend-designer | implementer=frontend-designer | reviewer=frontend-designer
PROGRESS: 0/4 ACs verified

## Outcome

Visitors can see search focus, grouped results and active selection in a dialog whose controls remain reachable on mobile.

## Critical constraints

- Never change Pagefind indexing, loading, focus management, keyboard handling or navigation; consume ORI-AST-004's working contract.
- Never fabricate result data, intercept HTTP with canned responses, inject dialog markup or add a test-only status seam.
- Never impose a delay to create a loading screenshot; observe the genuine first initialization.
- Never add another dialog/island, duplicate Header controls or use inline colors instead of existing tokens.
- Never write outside the allowlist or alter shared WIP; use the assigned isolated candidate and owned preview.

## Done when

- [ ] AC-1: Search input focus and genuine loading presentation leave the input and close action reachable.
- [ ] AC-2: Real query results have readable groups, titles, snippets and announced count.
- [ ] AC-3: Keyboard selection and restored focus are visibly distinct in both themes.
- [ ] AC-4: Mobile scrolling preserves reachable controls and reduced-motion presentation.
- [ ] The required gates pass and current-candidate screenshots and observations are inspected.
- [ ] Changes remain within the exact allowlist.

## Specification

Style the single native search dialog with existing popover, foreground, border and ring tokens. Distinguish input, grouped result titles, snippets, announced count and the selected keyboard result. Keep input and close action reachable while results scroll at mobile widths. Present the genuine first-open loading state without imposing an artificial delay. Style genuine empty and failed-load messages if the Astro search contract exposes those states; do not invent separate flows or require fake responses for screenshots. Preserve reduced-motion behavior.

Current gap: The real search contract needs token-based dialog, result, focus and status presentation.

Success state: Visitors can see search focus, grouped results and active selection in a dialog whose controls remain reachable on mobile.

Classification: Presentation-only CSS and composition over the real search implementation supplied by ORI-AST-004. Real browser proof remains mandatory. This task does not change the locked flow set or claim primary ownership of a locked flow.

## Acceptance criteria and proof

The complete human-readable proof records below match the machine contract exactly. Each task-owned presentation check has primary:false and flow_ref:null. The integrated search flow remains owned by ORI-AST-010; ORI-AST-004 retains its early search-contract proof.

### AC-1

```json
{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN a fresh built-site browser WHEN search is opened THEN the real input has visible focus and genuine loading does not hide the input or close action.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["The dialog style is disconnected, focus is invisible or a static loading overlay covers its controls"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open /docs/introduction, activate the actual header search with Meta+K or Control+K and observe the real first initialization without delaying or replacing requests."]},"end_state":{"must_observe":["The native dialog exposes `aria-modal=true` and its actual search input is focused.","The focused input has a `2px` ring with `2px` offset; genuine loading leaves the input and close action reachable."],"must_not_observe":["An empty invisible dialog","A focused input without visible focus","A loading overlay concealing the close action"]}}]}}
```

### AC-2

```json
{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the actual Pagefind index WHEN streamdown, renderMarkdown and dev client are searched THEN real result groups, titles, snippets and count are readable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["The result presentation is empty or disconnected from the real index"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open search, type streamdown and inspect real group labels, result titles, snippets and announced count."]},"end_state":{"must_observe":["The query `streamdown` produces readable real result content including the `/components/streamdown` destination.","Actual group labels, titles, snippets and an `aria-live` result count are distinguishable."],"must_not_observe":["An empty result shell for matching content","Canned unrelated results"]}},{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Search renderMarkdown and dev client separately; inspect each actual result set and follow the canonical boundary result."]},"end_state":{"must_observe":["Both `renderMarkdown` and `dev client` produce a readable `/docs/owns-vs-does-not-own` result and applicable item results.","The opened `/docs/owns-vs-does-not-own` page explains the `renderMarkdown` extension seam and `dev client` requirements that answer the respective queries."],"must_not_observe":["An empty matching result set","An empty boundary page"]}}]}}
```

### AC-3

```json
{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN real results in light and dark themes WHEN keyboard selection changes and Escape closes the dialog THEN active results and restored focus remain visibly distinct.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["Selection styling is static or disconnected from the real active state, or restored focus is obscured"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Search streamdown in light appearance; move selection with ArrowDown and ArrowUp, record the active result and press Escape.","Change to dark through the real header theme control and repeat the search, selection and Escape sequence."]},"end_state":{"must_observe":["The active result changes with `ArrowDown` and `ArrowUp` and has a visible indicator beyond text color in both themes.","`Escape` returns focus to the invoking header control with a `2px` ring."],"must_not_observe":["A static selection highlight","An invisible restored focus indicator with 0 visible rings on the invoking control"]}}]}}
```

### AC-4

```json
{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the mobile viewport WHEN the real result list is scrolled THEN input and close controls remain reachable and the dialog respects reduced motion.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-003-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["The dialog uses a static oversized layout or ignores reduced-motion presentation"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open search at the configured mobile viewport, search streamdown and scroll the real results region.","Repeat opening and scrolling in a fresh browser context with reduced-motion preference."]},"end_state":{"must_observe":["The `streamdown` result remains readable inside the scrolling results region.","The search input and close action each have 100% of their bounds inside the viewport after scrolling; under `prefers-reduced-motion: reduce`, the dialog runs 0 entrance animations."],"must_not_observe":["An empty results viewport","Controls scrolled outside the viewport"]}}]}}
```

## Test criteria

- TC-1 → AC-1: The AC-1 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-1`
- TC-2 → AC-2: The AC-2 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-2`
- TC-3 → AC-3: The AC-3 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-3`
- TC-4 → AC-4: The AC-4 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-003-AC-4`

## Fixtures

```json
{"built_search":{"description":"Actual dependency-complete candidate built through the production docs and indexing entrypoints and served by this run's owned localhost:4321 preview.","seed_method":"cli","records":["Real Introduction and canonical boundary content","Actual generated item destinations including /components/streamdown","Production Pagefind index built from those documents and the real shared SearchDialog"]},"fresh_browser":{"description":"Fresh real Playwright context navigates to the built candidate with empty storage, light color-scheme preference and no previously loaded Pagefind resources; no DOM or result data is injected.","seed_method":"ui_flow","records":["Desktop Chrome or configured Pixel 5 viewport","Actual header search and theme controls","Real query input, keyboard selection, navigation and focus restoration"]}}
```

Build the actual content and index before creating browser contexts. Query data enters through the real input. Observe requests without replacing them. Reduced-motion preference belongs to a real browser context; it does not substitute for product behavior.

## Scope permissions

### write_allowed

- apps/docs/src/components/islands/SearchDialog.astro
- apps/docs/src/components/Header.astro
- tests/sprint-05-orient-search/search-presentation.spec.ts
- tests/sprint-05-orient-search/evidence/search/
- tests/sprint-05-orient-search/evidence/search/results-light.png
- tests/sprint-05-orient-search/evidence/search/results-dark.png
- tests/sprint-05-orient-search/evidence/search/results-mobile.png
- tests/sprint-05-orient-search/evidence/search/focus-and-status.json

### write_prohibited

- Pagefind indexing and bundle-loading logic
- Focus management and keyboard-event logic
- Search result generation and navigation
- apps/docs/src/scripts/**
- Any file not explicitly allowed.

## Boundaries and guardrails

Always:

- Scan the existing Header and SearchDialog markup before styling; retain their shared integration points.
- Style the actual states and selected result supplied by ORI-AST-004.
- Use existing popover, foreground, border and ring tokens and inspect actual browser evidence.

Ask first:

- Changes to search markup semantics or runtime state contracts.
- New dependencies, another island or an expanded write surface.
- New query, recovery or error behavior beyond the existing contract.

Boundary contracts:

- Opening search places a visible focus ring on the actual focused input.
- Real streamdown, renderMarkdown and dev client results have readable group labels, titles and snippets.
- Keyboard selection is visibly distinguishable from unselected results in light and dark themes.
- The first-open loading status does not hide the input or close action.
- At the configured mobile viewport, the dialog stays within the viewport and results scroll without displacing its controls.
- Escape restores visible focus to the real originating control through Astro's focus-management implementation.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

## Deliverables and capability contracts

Provides:

- Shared SearchDialog presentation.
- Visible focus and result states.

Consumes:

- ORI-AST-004 real Pagefind dialog and state.
- ORI-VIS-001 shared header presentation.

Capability: CAP-DOCS-01
PRD references: UC-SHELL-02, TR-07, TR-10
Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/frontend-designer-absorb-prerequisites.json
Source task IDs: ORI-VIS-003
Supersedes: []

## Agent instructions

1. Read the predecessor's real semantic/state contract and perform a fresh component/token reuse scan.
2. Use the frontend-design skill for visual implementation after that scan. Keep all behavior with the existing owner.
3. Implement scoped presentation for loading, real results, active selection and focus. Style genuine empty/failed-load messages if supplied; do not create a fake status fixture or additional flow.
4. Build the actual site and index. Run enabled desktop/mobile interaction tests. Register the mobile-specific AC for its applicable project without runtime skip calls or passing omissions.
5. Inspect current-run screenshots and concrete focus/result/geometry observations, run required gates and report the exact candidate and unresolved failures.

TDD is skipped for this pure presentation task. Real seeded browser evidence remains required. Loading may be brief: capture the actual state transition through observation, never a forced delay. Lazy-load timing and index caching remain ORI-AST-004/ORI-AST-010 proof responsibilities.

## Reading list

1. `apps/docs/src/components/Header.astro` — lines all; PRIMARY PATTERN: shared search mount, token styling and responsive Header.
2. `apps/docs/src/components/islands/SearchDialog.astro` — lines all after ORI-AST-004; actual semantic markup, status regions and active-result contract.
3. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md` — lines all; search, focus, token, responsive and reduced-motion requirements.
4. `tests/harness/docs-preview.ts` — lines all; real owned preview and browser conventions.
5. `/Users/justinrich/.codex/skills/frontend-design/SKILL.md` — lines all; visual implementation after modular scan.

Also obey the repository AGENTS.md already supplied to the execution session.

## Design guidance and coding standards

- Reuse the single Header trigger and native SearchDialog; do not create a second mobile search component.
- Give the real input clear priority and distinguish result titles, snippets, groups and selected state.
- Preserve visible focus with the existing 2px ring and 2px offset.
- Constrain scrolling to results while keeping input and close action reachable.
- Use valid scoped Astro CSS and existing var(--*) tokens; no inline color literals.
- Respect reduced motion and preserve underlying semantic attributes.

## Verification gates

- `pnpm --filter @rnr-ai-elements/docs build`
- `pnpm typecheck`
- `pnpm exec biome ci apps/docs/src tests/sprint-05-orient-search`
- `pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile`

Require actual successful execution. Check `git diff --name-only` against the exact allowlist. Revalidate every scenario and the Requirement Contract. Product success targets are the actual dialog input, results, selected item and invoking control; a generic document root is not a success oracle.

## Evidence gates

Planned outputs:

- tests/sprint-05-orient-search/evidence/search/results-light.png
- tests/sprint-05-orient-search/evidence/search/results-dark.png
- tests/sprint-05-orient-search/evidence/search/results-mobile.png
- tests/sprint-05-orient-search/evidence/search/focus-and-status.json

Capture actual result text and destinations, selected-result changes, input/restored focus, genuine loading observations and mobile control geometry. Bind artifacts to fresh run/source/lockfile/dist/index/test/policy identities. Observe actual requests; never substitute response data. No listed artifact or successful command is claimed to exist by this charter.

## Review

An independent frontend-designer reviews actual search presentation. ORI-AST-004 retains behavior and index ownership.

- Inspect real light/dark/mobile captures and concrete focus/result observations.
- Verify selected styling follows actual keyboard selection and focus remains visible after Escape.
- Reject fabricated loading, canned search results, generic-root assertions and invisible mobile controls.
- Check exact scope, predecessor boundaries and current-candidate gate results.

Verdict: APPROVED only after real scoped proof; otherwise NEEDS_FIXES with concrete file/AC findings.

## Dependencies

Depends on: ORI-VIS-001, ORI-AST-004
Blocks: ORI-VIS-005, ORI-CONT-004, ORI-AST-010, ORI-CI-004

Supporting flow: FLOW-SHELL-07-cmdk-open-search-navigate — primary:false; primary owner ORI-AST-010.

## Out of scope

Indexing and bundle-loading logic, focus management, keyboard handlers, result generation, navigation, additional islands, custom-404 behavior, unrelated Header changes and changes to the locked flow set.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-VIS-003","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"built_search":{"description":"Actual dependency-complete candidate built through the production docs and indexing entrypoints and served by this run's owned localhost:4321 preview.","seed_method":"cli","records":["Real Introduction and canonical boundary content","Actual generated item destinations including /components/streamdown","Production Pagefind index built from those documents and the real shared SearchDialog"]},"fresh_browser":{"description":"Fresh real Playwright context navigates to the built candidate with empty storage, light color-scheme preference and no previously loaded Pagefind resources; no DOM or result data is injected.","seed_method":"ui_flow","records":["Desktop Chrome or configured Pixel 5 viewport","Actual header search and theme controls","Real query input, keyboard selection, navigation and focus restoration"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN a fresh built-site browser WHEN search is opened THEN the real input has visible focus and genuine loading does not hide the input or close action.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["The dialog style is disconnected, focus is invisible or a static loading overlay covers its controls"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open /docs/introduction, activate the actual header search with Meta+K or Control+K and observe the real first initialization without delaying or replacing requests."]},"end_state":{"must_observe":["The native dialog exposes `aria-modal=true` and its actual search input is focused.","The focused input has a `2px` ring with `2px` offset; genuine loading leaves the input and close action reachable."],"must_not_observe":["An empty invisible dialog","A focused input without visible focus","A loading overlay concealing the close action"]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the actual Pagefind index WHEN streamdown, renderMarkdown and dev client are searched THEN real result groups, titles, snippets and count are readable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["The result presentation is empty or disconnected from the real index"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open search, type streamdown and inspect real group labels, result titles, snippets and announced count."]},"end_state":{"must_observe":["The query `streamdown` produces readable real result content including the `/components/streamdown` destination.","Actual group labels, titles, snippets and an `aria-live` result count are distinguishable."],"must_not_observe":["An empty result shell for matching content","Canned unrelated results"]}},{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Search renderMarkdown and dev client separately; inspect each actual result set and follow the canonical boundary result."]},"end_state":{"must_observe":["Both `renderMarkdown` and `dev client` produce a readable `/docs/owns-vs-does-not-own` result and applicable item results.","The opened `/docs/owns-vs-does-not-own` page explains the `renderMarkdown` extension seam and `dev client` requirements that answer the respective queries."],"must_not_observe":["An empty matching result set","An empty boundary page"]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN real results in light and dark themes WHEN keyboard selection changes and Escape closes the dialog THEN active results and restored focus remain visibly distinct.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["Selection styling is static or disconnected from the real active state, or restored focus is obscured"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Search streamdown in light appearance; move selection with ArrowDown and ArrowUp, record the active result and press Escape.","Change to dark through the real header theme control and repeat the search, selection and Escape sequence."]},"end_state":{"must_observe":["The active result changes with `ArrowDown` and `ArrowUp` and has a visible indicator beyond text color in both themes.","`Escape` returns focus to the invoking header control with a `2px` ring."],"must_not_observe":["A static selection highlight","An invisible restored focus indicator with 0 visible rings on the invoking control"]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the mobile viewport WHEN the real result list is scrolled THEN input and close controls remain reachable and the dialog respects reduced motion.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/search-presentation.spec.ts","test_function":"ORI-VIS-003-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-003-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, production Pagefind index and real Chromium keyboard/focus interaction","negative_control":{"would_fail_if":["The dialog uses a static oversized layout or ignores reduced-motion presentation"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open search at the configured mobile viewport, search streamdown and scroll the real results region.","Repeat opening and scrolling in a fresh browser context with reduced-motion preference."]},"end_state":{"must_observe":["The `streamdown` result remains readable inside the scrolling results region.","The search input and close action each have 100% of their bounds inside the viewport after scrolling; under `prefers-reduced-motion: reduce`, the dialog runs 0 entrance animations."],"must_not_observe":["An empty results viewport","Controls scrolled outside the viewport"]}}]}},{"id":"TC-1","type":"test_criterion","description":"The AC-1 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The AC-2 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The AC-3 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-003-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The AC-4 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/search-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-003-AC-4","maps_to_ac":"AC-4"}]}
-->
</details>
