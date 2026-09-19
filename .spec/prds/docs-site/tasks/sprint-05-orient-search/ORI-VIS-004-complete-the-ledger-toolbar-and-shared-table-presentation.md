# ORI-VIS-004: Complete the ledger toolbar and shared table presentation

## What this does

Makes the real Registry ledger readable through filtering, keyboard use, mobile scrolling and its no-JavaScript fallback.

## Why

The ledger duplicates table styling and a monospace stack already supplied by shared primitives. Its functional controls need a coherent presentation without changing generated data or state logic.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs` against the built site. Filter to the uniwind conversation row, copy its complete command, follow Docs, restore all rows, and inspect the mobile and no-JavaScript views.

## Scope

Presentation in LedgerTable, DataTable, LedgerFilter and Registry, plus the task-owned browser test and ledger evidence directory. This task does not change the locked flow set. ORI-AST-007 retains the ledger's functional-flow ownership.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

- Status: Backlog
- Assignee: frontend-designer
- Priority: P1
- Points: 3
- Type: DESIGN
- Dependency phase: after ORI-VIS-001, ORI-VIS-002 and ORI-AST-007
- Proposed By: frontend-designer
- Co-authored By: []
- TDD_MODE: skipped
- RED_GREEN_REQUIRED: no
- Sprint: [SPRINT.md](./SPRINT.md)
- Planned date: 2026-09-14
- Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
- AGENT: planner=frontend-designer | implementer=frontend-designer | reviewer=frontend-designer
- Progress: not started; all AC TDD_STATE values are none.

## Outcome

Registry rows, filters and engine commands remain readable through filtering, mobile scrolling and the no-JavaScript fallback.

## Critical constraints

- Never change registry generation, filter or engine state logic, or install-command construction; report failures to ORI-AST-007.
- Never replace real generated rows, browser interactions or clipboard behavior with mocks, injected views, canned success or runtime skips.
- Reuse DataTable, LedgerFilter, Badge and CopyButton; use project tokens instead of duplicate table patterns or literal palettes.
- Preserve complete server-rendered rows, both base URLs, the generated note, existing selectors and all consuming component contracts.
- Work only in the assigned isolated candidate and allowlisted surfaces. Preserve shared WIP; do not stash, reset, clean, broadly stage or perform trunk lifecycle operations.

## Done when

- AC-1 proves the real filtered row retains its verdict, complete uniwind command and Docs action.
- AC-2 proves restoration of the generated rows and the genuine no-results presentation.
- AC-3 proves mobile containment, sticky identification and shared table tokens.
- AC-4 proves the complete no-JavaScript view and visible keyboard focus and selected states.
- The focused browser suite, build, typecheck and scoped lint pass; inspected evidence is tied to the candidate and only permitted files change.

## Specification and context

Current gap: the Registry route duplicates table mechanics and its `.ledger-engine` rule declares a monospace stack instead of consuming `--font-mono`. ORI-AST-007 supplies the real ledger controls and engine behavior before this presentation task starts.

Implementation surface: Complete the roadmap's existing ledger carryover using DataTable, LedgerFilter, Badge and CopyButton. Present category, engine and text-filter controls as one toolbar. Preserve both selectable engine base URLs, the generated note and full server-rendered rows. Reuse muted zebra bands, sticky headers and a mobile sticky identifying column. Replace the ledger's duplicated monospace stack with --font-mono. Keep the genuine no-results message readable.

Success state: the real ledger remains readable and operable in the required browser contexts without a second data source, new state owner or replacement command builder.

Boundary contracts:

- Selecting component, uniwind and conversation leaves the conversation row readable with its verdict, correct engine command and documentation link.
- Clearing the filter and choosing All restores the real generated rows.
- The table scrolls within its container and preserves the identifying column on mobile.
- Without JavaScript, the complete ledger and both base URLs remain readable.
- Copy controls and active toolbar controls retain visible keyboard focus and selected states.

## Acceptance criteria and proof

This is presentation-only DESIGN work with task-owned end-to-end proof. Every AC is non-primary with `flow_ref:null`. ORI-AST-007 owns FLOW-GEND-07-registry-ledger-controls; these tests supplement that proof and do not replace or rename it. The following complete records are identical to the normalized requirements and machine contract.

### AC-1

```json
{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the real generated ledger WHEN component, uniwind and conversation are selected THEN the matching row retains its verdict, complete command and Docs link.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The styled toolbar is disconnected from real filter or engine state.","The command or Docs action is a static placeholder."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Open /registry; select component and uniwind; enter conversation in the text filter.","Inspect the row and capture filtered-uniwind.png; activate its copy control and then its Docs link."]},"end_state":{"must_observe":["Exactly 1 matching row named `conversation`, with its generated Expo Go verdict and selected `uniwind` state.","Clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`.","The Docs action reaches `/components/conversation` with its conversation heading."],"must_not_observe":["An empty matching table or the original 56 unfiltered rows.","A copied `/r/nativewind/conversation.json` command after selecting uniwind."]}}]}}
```

### AC-2

```json
{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the filtered ledger WHEN All is selected and the filter cleared THEN all generated rows return and an unmatched query shows the genuine no-results state.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The toolbar remains disconnected from generated rows.","The no-results presentation is permanently visible or absent."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Filter to component, uniwind and conversation; then choose All and clear the text filter."]},"end_state":{"must_observe":["All 56 generated rows return with category totals 39 components, 11 blocks and 6 examples.","The note contains `Generated at build from public/r/*.json`, and both `https://rnraielements.com/r/nativewind` and `https://rnraielements.com/r/uniwind` remain readable."],"must_not_observe":["Only the original filtered `conversation` row.","An empty table after clearing the filter."]}},{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Choose All and enter s05-no-ledger-match-zzzz through the real filter.","Capture the real no-results state; replace the query with conversation."]},"end_state":{"must_observe":["The unmatched query produces 0 matching rows and a visible nonempty no-results message before recovery.","Replacing the query with `conversation` restores its 1 matching row and removes the no-results presentation."],"must_not_observe":["A blank table without a no-results message for the unmatched query.","A static empty-state message remaining beside the restored `conversation` row."]}}]}}
```

### AC-3

```json
{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the mobile ledger WHEN its table is scrolled horizontally THEN the identifying column, complete row content and shared table presentation remain readable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-004-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The mobile table clips columns instead of scrolling.","The identifying column is not sticky or the shared token styling is disconnected."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Open /registry in chromium-mobile with All selected and no text query.","Scroll the real table horizontally to its install and Docs columns; inspect the sticky identifying column and capture mobile-scroll.png.","Inspect rendered header positioning, alternating row backgrounds and engine-label font against the inherited tokens."]},"end_state":{"must_observe":["The ledger wrapper's `scrollWidth - clientWidth` is greater than 0 pixels while page-wide horizontal overflow is 0 pixels.","The `conversation` identifying cell remains inside the wrapper's visible bounds after horizontal scrolling.","Complete install and `Docs` controls remain reachable; header cells use `sticky`, alternating row surfaces resolve from `--muted`, and engine labels resolve from `--font-mono`."],"must_not_observe":["An empty ledger or a hidden identifying column after scrolling.","A clipped command suffix or page-wide horizontal overflow."]}}]}}
```

### AC-4

```json
{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN no-JavaScript and keyboard browser contexts WHEN Registry is read and operated THEN full rows, both base URLs, visible focus and selected controls remain available in their applicable contexts.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-004-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The server-rendered ledger is an empty shell awaiting JavaScript.","Presentation suppresses keyboard focus or conceals selected controls."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_nojs","action":{"actor":"user","steps":["Navigate to /registry with JavaScript disabled before navigation.","Read the complete ledger, select each base URL's text, and capture nojs-full-table.png."]},"end_state":{"must_observe":["All 56 server-rendered rows and the generated-at-build note.","Selectable `https://rnraielements.com/r/nativewind` and `https://rnraielements.com/r/uniwind` base URLs."],"must_not_observe":["An empty table awaiting hydration.","Only one engine base URL or truncated selectable URL text."]}},{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Use Tab and Shift+Tab through category, engine, text filter and copy controls.","Select uniwind with the keyboard; inspect its selected appearance and capture focused controls in the ledger evidence directory."]},"end_state":{"must_observe":["Every reached toolbar and copy control has a visible focus indicator whose rendered width is greater than 0 pixels.","The selected `uniwind` control exposes its actual selected state and a visibly distinct token-backed selected treatment."],"must_not_observe":["A focused control with no visible focus indicator.","An unchanged unselected appearance for the selected `uniwind` control."]}}]}}
```

## Test criteria

```json
[{"id":"TC-1","type":"test_criterion","description":"The filtered conversation row, canonical uniwind clipboard command and Docs destination satisfy AC-1.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"All 56 rows return after clearing, and the real no-results state appears and recovers as specified in AC-2.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Mobile scrolling preserves row identification and complete content with the shared token presentation specified in AC-3.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-004-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The no-JavaScript ledger and enabled keyboard controls satisfy their respective AC-4 observations.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-004-AC-4","maps_to_ac":"AC-4"}]
```

## Fixtures

```json
{"ledger_browser":{"description":"Fresh JavaScript-enabled Chromium context reads the actual production-built Registry after prerequisite tasks land.","seed_method":"cli","records":["Run pnpm --filter @rnr-ai-elements/docs build through the real generated-data pipeline; serve the output through the owned Astro preview at http://localhost:4321.","The generated registry has 56 rows: 39 components, 11 blocks and 6 examples; conversation is a component with both engines.","Use fresh browser storage and actual category, engine, filter, copy and Docs controls; do not inject DOM, storage state or HTTP responses."]},"ledger_nojs":{"description":"Fresh Chromium context has JavaScript disabled before requesting the same actual built Registry.","seed_method":"cli","records":["Use the same real production build and owned preview as ledger_browser.","The HTTP response contains all 56 rows, both canonical engine base URLs and the generated-at-build note before any client execution."]}}
```

## Scope permissions

Write allowed:

- apps/docs/src/components/LedgerTable.astro
- apps/docs/src/components/DataTable.astro
- apps/docs/src/components/islands/LedgerFilter.astro
- apps/docs/src/pages/registry.astro
- tests/sprint-05-orient-search/ledger-presentation.spec.ts
- tests/sprint-05-orient-search/evidence/ledger/
- tests/sprint-05-orient-search/evidence/ledger/filtered-uniwind.png
- tests/sprint-05-orient-search/evidence/ledger/mobile-scroll.png
- tests/sprint-05-orient-search/evidence/ledger/nojs-full-table.png

Write prohibited:

- Registry row generation
- Filter or engine state logic
- Install-command construction
- apps/docs/src/data/**
- apps/docs/src/scripts/**
- packages/registry/**

The allowlist permits presentation edits only in mixed presentation/logic files. Any unlisted write requires a new scope decision.

## Boundaries and guardrails

Always:

- Read the integrated prerequisite implementations before editing shared files.
- Preserve existing props, selectors, data attributes, semantics and event hooks.
- Keep generic table mechanics in DataTable and domain content in LedgerTable or its caller.
- Use actual browser observations and inspect every claimed screenshot.

Ask first:

- A new dependency, component API change or write outside the allowlist.
- A behavior defect requiring filter, engine, command, data or clipboard implementation changes.
- A shared styling change that cannot preserve another DataTable consumer.

## Deliverables and capability contracts

- DataTable.astro: shared token-backed table mechanics preserved for all consumers.
- LedgerTable.astro, LedgerFilter.astro and registry.astro: composed toolbar and ledger presentation, retaining existing behavior and server-rendered data.
- ledger-presentation.spec.ts: real-browser checks named ORI-VIS-004-AC-1 through ORI-VIS-004-AC-4.
- Ledger evidence directory: the three named screenshots plus focused-control, restored-row and no-results captures needed to substantiate the ACs.

Touches CAP-DOCS-01 and existing UC-GEND-07 AC-2. Consumes ORI-VIS-001 reading tokens, ORI-VIS-002 shared table presentation and ORI-AST-007 ledger behavior. Provides the ledger presentation consumed by ORI-CONT-004 and ORI-CI-004. This remains 3 points; there is no task-local size drift.

## Agent instructions

1. Recheck the assigned source identity and prerequisite integration. Inspect LedgerTable, DataTable, LedgerFilter, Badge, CopyButton and their consumers. Record reuse choices before implementation.
2. Read the frontend-design skill after the modular scan. The scan already identifies duplicated Registry table mechanics and the `.ledger-engine` literal monospace stack; verify these against the integrated candidate. Reuse shared mechanics and `--font-mono` within this task's scope.
3. Implement only layout and styling. Preserve state owners and server-rendered row generation. Register enabled-browser cases and the explicit no-JavaScript fallback cases without runtime skips or early-return success.
4. Build the real site and execute each directly named browser case. Use real clipboard and navigation behavior; observation-only DOM measurements may assert geometry and computed styles but must not alter product state.
5. Inspect seeded screenshots, run the aggregate gates, and hand off evidence with source identity, command, project and outcome. DESIGN skips RED-first only; it does not skip runtime proof. Stop with a concrete blocker if a prerequisite fails.

## Reading list

1. `apps/docs/src/components/DataTable.astro` — all lines; PRIMARY PATTERN for generic props, zebra surfaces, sticky headers and mobile identification.
2. `apps/docs/src/pages/registry.astro` — all lines; generated rows, canonical URLs, Badge and CopyButton composition, selectors and the duplicated monospace stack.
3. `apps/docs/src/components/islands/LedgerFilter.astro` — all lines after ORI-AST-007; preserve the actual toolbar and state contract.
4. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md` — Registry ledger and shared table sections; presentation authority.
5. `/Users/justinrich/.agents/skills/frontend-design/SKILL.md` — all lines after the reuse scan; required implementation design workflow.

## Design and coding guidance

Use the established docs typography, spacing, focus and surface tokens. Keep category, engine and text controls visibly grouped, wrapping within the narrow viewport without changing their order. Preserve opaque sticky-column surfaces and token-backed zebra continuity. No card conversion, ellipsis, max-height clipping, new palette, duplicated copy widget or added client state. Shared tokens must retain light/dark compatibility; theme persistence and first-paint proof remain with their existing owners. Do not add loading or network-error UI to the synchronous ledger; prove its genuine no-results state. Follow repository Astro/TypeScript and Biome conventions. Do not make native-render claims from this browser-only docs task.

## Verification gates

Run from the repository root in the assigned execution candidate:

- `pnpm --filter @rnr-ai-elements/docs build`
- `pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs`
- `pnpm typecheck`
- `pnpm exec biome ci apps/docs/src tests/sprint-05-orient-search`
- `git diff --name-only`

Use an owned preview listener; do not kill or reuse an unidentified process. Root typecheck alone does not prove the docs build. Diagnose failed required checks without unauthorized repairs or unsupported pre-existing claims.

## Evidence gates

- Every AC has its named executable browser case and a real seeded observation; source scans or empty screenshots cannot replace rendered proof.
- Inspect filtered-uniwind.png, mobile-scroll.png and nojs-full-table.png. Record additional focused, restored and no-results states beneath the same allowed ledger directory.
- Bind captures and command output to the candidate source, browser project and observed result. All paths here are planned outputs, not evidence already obtained.
- Preserve locked-flow ownership and canonical proof paths; this DESIGN task owns no PRIMARY flow and does not manufacture RED evidence.
- Confirm changed files and changed responsibilities stay within the allowlist; inspect touched code and tests for mocks, placeholders, no-ops and skips before handoff.

## Review

Must pass:

- The four browser ACs prove their positive and excluded states on real generated data.
- Toolbar selection, clipboard contents and Docs navigation remain connected to ORI-AST-007 behavior.
- Mobile scroll, sticky identification, token surfaces and no-JavaScript completeness match inspected evidence.
- Shared component contracts and other DataTable consumers remain intact.
- Scope, source-bound evidence and no-stub requirements are satisfied.

Should verify: toolbar grouping follows reading order; focus remains visible at narrow widths; screenshots show seeded values rather than an empty shell. Verdict is APPROVED or NEEDS_FIXES with specific evidence-backed findings. Planned artifacts do not establish completion.

## Dependencies

Depends on ORI-VIS-001, ORI-VIS-002 and ORI-AST-007. Blocks ORI-CONT-004 and ORI-CI-004. Coordinate shared-file ownership before edits. ORI-AST-007 owns ledger filtering and its locked functional proof; ORI-AST-008 owns its separate navigation work. Do not move either responsibility into this charter.

## Out of scope

Registry generation, filter and engine state, command construction, clipboard logic, navigation logic, new flows or use cases, theme-persistence logic, loading/error feature work, native app changes, deployment and later-sprint expansion. This task does not change the locked flow set.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-VIS-004","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"ledger_browser":{"description":"Fresh JavaScript-enabled Chromium context reads the actual production-built Registry after prerequisite tasks land.","seed_method":"cli","records":["Run pnpm --filter @rnr-ai-elements/docs build through the real generated-data pipeline; serve the output through the owned Astro preview at http://localhost:4321.","The generated registry has 56 rows: 39 components, 11 blocks and 6 examples; conversation is a component with both engines.","Use fresh browser storage and actual category, engine, filter, copy and Docs controls; do not inject DOM, storage state or HTTP responses."]},"ledger_nojs":{"description":"Fresh Chromium context has JavaScript disabled before requesting the same actual built Registry.","seed_method":"cli","records":["Use the same real production build and owned preview as ledger_browser.","The HTTP response contains all 56 rows, both canonical engine base URLs and the generated-at-build note before any client execution."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the real generated ledger WHEN component, uniwind and conversation are selected THEN the matching row retains its verdict, complete command and Docs link.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The styled toolbar is disconnected from real filter or engine state.","The command or Docs action is a static placeholder."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Open /registry; select component and uniwind; enter conversation in the text filter.","Inspect the row and capture filtered-uniwind.png; activate its copy control and then its Docs link."]},"end_state":{"must_observe":["Exactly 1 matching row named `conversation`, with its generated Expo Go verdict and selected `uniwind` state.","Clipboard equals `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json`.","The Docs action reaches `/components/conversation` with its conversation heading."],"must_not_observe":["An empty matching table or the original 56 unfiltered rows.","A copied `/r/nativewind/conversation.json` command after selecting uniwind."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the filtered ledger WHEN All is selected and the filter cleared THEN all generated rows return and an unmatched query shows the genuine no-results state.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The toolbar remains disconnected from generated rows.","The no-results presentation is permanently visible or absent."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Filter to component, uniwind and conversation; then choose All and clear the text filter."]},"end_state":{"must_observe":["All 56 generated rows return with category totals 39 components, 11 blocks and 6 examples.","The note contains `Generated at build from public/r/*.json`, and both `https://rnraielements.com/r/nativewind` and `https://rnraielements.com/r/uniwind` remain readable."],"must_not_observe":["Only the original filtered `conversation` row.","An empty table after clearing the filter."]}},{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Choose All and enter s05-no-ledger-match-zzzz through the real filter.","Capture the real no-results state; replace the query with conversation."]},"end_state":{"must_observe":["The unmatched query produces 0 matching rows and a visible nonempty no-results message before recovery.","Replacing the query with `conversation` restores its 1 matching row and removes the no-results presentation."],"must_not_observe":["A blank table without a no-results message for the unmatched query.","A static empty-state message remaining beside the restored `conversation` row."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the mobile ledger WHEN its table is scrolled horizontally THEN the identifying column, complete row content and shared table presentation remain readable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-004-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The mobile table clips columns instead of scrolling.","The identifying column is not sticky or the shared token styling is disconnected."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Open /registry in chromium-mobile with All selected and no text query.","Scroll the real table horizontally to its install and Docs columns; inspect the sticky identifying column and capture mobile-scroll.png.","Inspect rendered header positioning, alternating row backgrounds and engine-label font against the inherited tokens."]},"end_state":{"must_observe":["The ledger wrapper's `scrollWidth - clientWidth` is greater than 0 pixels while page-wide horizontal overflow is 0 pixels.","The `conversation` identifying cell remains inside the wrapper's visible bounds after horizontal scrolling.","Complete install and `Docs` controls remain reachable; header cells use `sticky`, alternating row surfaces resolve from `--muted`, and engine labels resolve from `--font-mono`."],"must_not_observe":["An empty ledger or a hidden identifying column after scrolling.","A clipped command suffix or page-wide horizontal overflow."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN no-JavaScript and keyboard browser contexts WHEN Registry is read and operated THEN full rows, both base URLs, visible focus and selected controls remain available in their applicable contexts.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/ledger-presentation.spec.ts","test_function":"ORI-VIS-004-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-004-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, generated registry ledger and real Chromium browser","negative_control":{"would_fail_if":["The server-rendered ledger is an empty shell awaiting JavaScript.","Presentation suppresses keyboard focus or conceals selected controls."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"ledger_nojs","action":{"actor":"user","steps":["Navigate to /registry with JavaScript disabled before navigation.","Read the complete ledger, select each base URL's text, and capture nojs-full-table.png."]},"end_state":{"must_observe":["All 56 server-rendered rows and the generated-at-build note.","Selectable `https://rnraielements.com/r/nativewind` and `https://rnraielements.com/r/uniwind` base URLs."],"must_not_observe":["An empty table awaiting hydration.","Only one engine base URL or truncated selectable URL text."]}},{"start_ref":"ledger_browser","action":{"actor":"user","steps":["Use Tab and Shift+Tab through category, engine, text filter and copy controls.","Select uniwind with the keyboard; inspect its selected appearance and capture focused controls in the ledger evidence directory."]},"end_state":{"must_observe":["Every reached toolbar and copy control has a visible focus indicator whose rendered width is greater than 0 pixels.","The selected `uniwind` control exposes its actual selected state and a visibly distinct token-backed selected treatment."],"must_not_observe":["A focused control with no visible focus indicator.","An unchanged unselected appearance for the selected `uniwind` control."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The filtered conversation row, canonical uniwind clipboard command and Docs destination satisfy AC-1.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"All 56 rows return after clearing, and the real no-results state appears and recovers as specified in AC-2.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-004-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Mobile scrolling preserves row identification and complete content with the shared token presentation specified in AC-3.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-mobile --grep ORI-VIS-004-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The no-JavaScript ledger and enabled keyboard controls satisfy their respective AC-4 observations.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/ledger-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-004-AC-4","maps_to_ac":"AC-4"}]}
-->
</details>
