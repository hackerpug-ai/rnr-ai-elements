# ORI-VIS-001: Complete the shared reading layout for orientation and boundary pages

## What this does

Readers can scan orientation, tutorial and boundary content through one token-based, responsive reading layout with complete engine fallbacks.

## Why

The current shared shell has no finished reading presentation; existing Theming styling is route-specific and font tokens lack local assets.

## How to verify

Build the real candidate with `pnpm --filter @rnr-ai-elements/docs build`. Run `pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs` and inspect the recorded product content, geometry, font responses and screenshots.

## Scope

Shared reading presentation, typography and composition in the exact allowlist below. Routing, authored prose, engine state and search behavior remain with their predecessor owners.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata
> Status: ✅ Completed

Commit: 315c4330f69810e05af1a36aa0b95761cadc58b4
Assignee: frontend-designer
Priority: P1
Points: 5
Type: DESIGN
Dependency phase: After ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-004, ORI-AST-007, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005
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

Readers can scan orientation, tutorial and boundary content through one token-based, responsive reading layout with complete engine fallbacks.

## Critical constraints

- Never change model state, routing, search, indexing, engine persistence, token sampling or HTTP behavior; consume the named owners' working contracts.
- Never replace real content or behavior with a mock, injected view, canned result, placeholder, skipped target or test-only success seam.
- Never add inline colors, duplicate shared components, introduce another island or hide complete source; use existing project tokens.
- Never write outside the allowlist or alter shared WIP; use the assigned isolated candidate and owned preview.

## Done when

- [ ] AC-1: Introduction and the substantive boundary explanation are readable in the shared shell.
- [ ] AC-2: Section links and target headings remain readable below the sticky header at desktop and mobile widths.
- [ ] AC-3: Engine panels, tutorial expected results and the worked-example link remain readable, including the real no-JavaScript fallback.
- [ ] AC-4: Local Spline assets load and long content stays inside its own containers in both themes.
- [ ] Required gates pass and the real evidence is inspected.
- [ ] Changes remain within the exact write allowlist.

## Specification

Implement TR-07's shared markdown reading presentation using DocsLayout, Header, Callout, TabGroup and CodeBlock. Add PageHeader and Prose once, then use them for the getting-started set, Quickstart and the absorbed canonical boundary page. Preserve the 70ch measure, 3.5rem header clearance, 16.5rem desktop navigation and 14rem wide-screen table of contents. Use the Astro-owned details controls for narrower navigation and section links. Keep Introduction's three identity statements together in normal visible text. Associate each Quickstart expected result with its step. Render the genuine boundary content through the shared DataTable presentation, with readable ownership labels, extension-seam information and the real example link. Preserve both explicitly labeled engine panels in the no-JavaScript view. Load the specified Spline families locally with font-display swap and their license.

The fused boundary decision is authoritative: consume substantive explanatory content from ORI-CONT-005. This task does not expand that prerequisite into the later complete boundary-table and gap-audit use case. Reuse existing table presentation wherever the supplied content calls for it.

Current gap: The current shared shell has no finished reading presentation; existing Theming styling is route-specific and font tokens lack local assets.

Success state: Readers can scan orientation, tutorial and boundary content through one token-based, responsive reading layout with complete engine fallbacks.

Classification: Presentation-only composition and CSS over functional contracts owned by predecessor tasks; real browser acceptance remains mandatory and no locked functional flow is claimed.

## Acceptance criteria and proof

All four records below are the complete human-readable acceptance criteria, proof bindings and scenarios. They match the machine contract exactly. PRIMARY is false because the locked flows remain owned by ORI-CONT-004 and ORI-AST-010.

### AC-1

```json
{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN built orientation content WHEN Introduction and its boundary link are opened THEN the identity statements and substantive boundary explanation are readable in the shared shell.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["The prose slot is empty or disconnected from authored content"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open /docs/introduction; follow its canonical boundary link."]},"end_state":{"must_observe":["Introduction shows `React Native`, `copy-paste registry` and `not an npm package` together.","Boundary page shows substantive `renderMarkdown` and `dev client` explanation."],"must_not_observe":["An empty PageHeader-only shell","`Coming soon` boundary content"]}}]}}
```

### AC-2

```json
{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN built getting-started pages WHEN section navigation and Toc links are used at desktop and mobile widths THEN the named destinations and headings remain readable below the 3.5rem sticky header.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["Section navigation is disconnected from real destination anchors, leaves an empty link region, or loses sticky-header clearance."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Follow Installation, CLI, Theming and Dark mode; use Theming #textclasscontext at desktop and mobile widths."]},"end_state":{"must_observe":["Section navigation reaches `/docs/installation`, `/docs/cli`, `/docs/theming` and `/docs/dark-mode`.","The `TextClassContext` heading remains below the header; prose measure is bounded by `70ch`."],"must_not_observe":["An empty navigation region","A target heading concealed beneath the header"]}}]}}
```

### AC-3

```json
{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN completed tutorial and engine markup WHEN both engines are read with and without JavaScript THEN complete labeled commands and step-associated expected results remain readable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["A static first-engine-only view hides the second panel or expected results"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Read Quickstart with nativewind then uniwind; load Installation and /components/message in a fresh JavaScript-disabled context."]},"end_state":{"must_observe":["Both `nativewind` and `uniwind` labels accompany complete `conversation.json` commands.","Before step `1`, Quickstart names a scrolling seed-data message list with working prompt input in `Expo Go`; each numbered step has its own visible expected result before the real `useChat` example link."],"must_not_observe":["An empty second engine panel","Unlabeled stacked commands"]}}]}}
```

### AC-4

```json
{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the built reading shell WHEN light/dark desktop and mobile views load THEN typography uses local Spline assets and long content stays inside its own scroll containers.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["Styles are absent or disconnected from shared tokens"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Load orientation in both themes and viewport projects; inspect actual font requests and rendered command/container geometry."]},"end_state":{"must_observe":["Both Spline families return `200` from the same origin.","Introduction and selected commands remain readable; font families use `--font-sans` and `--font-mono`; long commands scroll in their own container."],"must_not_observe":["Missing font responses","An empty stylesheet response","Page-wide overflow caused by a command"]}}]}}
```

## Test criteria

- TC-1 → AC-1: The AC-1 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-1`
- TC-2 → AC-2: The AC-2 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-2`
- TC-3 → AC-3: The AC-3 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-3`
- TC-4 → AC-4: The AC-4 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-4`

## Fixtures

```json
{"built_docs":{"description":"Actual dependency-complete candidate built through the production docs command and served by this run's owned localhost:4321 preview.","seed_method":"cli","records":["Real authored orientation, Theming, Quickstart and boundary content","Generated registry with 56 rows across 39/11/6 categories","Production CSS, engine controls, theme control and Pagefind index"]},"fresh_browser":{"description":"Fresh real Playwright context navigates to that built site; storage is initially empty and no application DOM is injected.","seed_method":"ui_flow","records":["Desktop Chrome or configured Pixel 5 viewport","Real navigation and keyboard input","No-JavaScript cases use a context disabled before navigation"]}}
```

Build through the actual production command before creating the fresh browser fixture. Do not inject product DOM or replacement index responses. Reserve the preview, preserve unrelated listeners and record run identity.

## Scope permissions

### write_allowed

- apps/docs/src/components/PageHeader.astro
- apps/docs/src/components/Prose.astro
- apps/docs/src/layouts/DocsLayout.astro
- apps/docs/src/components/Toc.astro
- apps/docs/src/components/Header.astro
- apps/docs/src/components/Callout.astro
- apps/docs/src/components/islands/TabGroup.astro
- apps/docs/src/styles/global.css
- apps/docs/public/fonts/
- tests/sprint-05-orient-search/reading-presentation.spec.ts
- tests/sprint-05-orient-search/evidence/reading/
- tests/sprint-05-orient-search/evidence/reading/introduction-desktop-light.png
- tests/sprint-05-orient-search/evidence/reading/introduction-mobile-dark.png
- tests/sprint-05-orient-search/evidence/reading/boundary-table.png
- tests/sprint-05-orient-search/evidence/reading/installation-nojs.png
- tests/sprint-05-orient-search/evidence/reading/assertions.json

### write_prohibited

- packages/registry/**
- apps/example/**
- apps/docs/src/scripts/**
- Authored documentation content
- Routing, heading extraction, theme resolution and engine persistence
- Any file not explicitly allowed.

## Boundaries and guardrails

Always:

- Scan shared components before implementing and use the frontend-design skill for visual implementation.
- Rebuild actual candidate output before browser proof; bind run, source, lockfile, dist and policy identities.
- Use observable product content and geometry rather than a generic body/root success oracle.

Ask first:

- Changing a predecessor's API or runtime behavior.
- New dependency or expanded write scope.
- A new external deployment or public operation.

Boundary contracts:

- Introduction visibly presents universal React Native AI chat and agent UI, copy-paste registry distribution and not-an-npm-package together without requiring interaction.
- Getting-started routes share one section navigation and reading layout; headings reached through the table of contents remain below the sticky header.
- Installation presents the engine decision once and uses the existing TabGroup for differing commands.
- The absorbed boundary route uses real ownership explanation supplied by techwriting, not teaser text or a coming-soon page.
- With JavaScript disabled, nativewind and uniwind panel contents remain readable and individually labeled.
- At desktop and the configured mobile viewport, text and controls remain within the viewport; wide code or tables scroll inside their own containers.
- All new colors resolve through existing tokens, and both Spline font requests resolve from the site's own origin.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

## Deliverables and capability contracts

Provides:

- Shared PageHeader/Prose presentation.
- Responsive navigation and Toc presentation.
- Local Spline typography.
- Readable engine fallbacks.

Consumes:

- ORI-AST-001 content shell.
- ORI-AST-002 tab semantics.
- ORI-AST-003 token markup.
- ORI-AST-004 search markup.
- ORI-AST-007 shared tables.
- ORI-AST-009 recovery shell.
- ORI-CONT-001/002/003/005 real content.

Capability: CAP-DOCS-01
PRD references: UC-DOCS-01, UC-DOCS-02, UC-SHELL-03, TR-07, TR-12
Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/frontend-designer-absorb-prerequisites.json
Source task IDs: ORI-VIS-001
Supersedes: []

## Agent instructions

1. Read predecessor contracts and perform a fresh modular component/token scan.
2. Use the frontend-design skill for visual implementation. Reuse existing primitives; flag unrelated duplication without expanding scope.
3. Implement only presentation and composition in the allowlist. TDD is skipped for this design task; behavioral evidence remains mandatory.
4. Build the real candidate and execute every applicable AC through the actual browser. Enabled contexts exercise both deliberate engine choices; no-JavaScript contexts read both actual stacked panels. Never skip a target or accept a static success record.
5. Capture and inspect concrete values and screenshots, run the required gates, then report candidate identity, changed paths, evidence and unresolved failures to the orchestrator.

## Reading list

1. `apps/docs/src/layouts/DocsLayout.astro` — lines all; PRIMARY PATTERN: reuse the existing token-governed composition.
2. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md` — lines all; locked typography, tokens, layout and page wireframes.
3. `tests/harness/docs-preview.ts` — lines all; owned real built-preview origin and browser setup.
4. `AGENTS.md` — lines all; project ownership, real verification and shared-worktree rules.
5. `/Users/justinrich/.codex/skills/frontend-design/SKILL.md` — lines all; use after modular scan for visual implementation.

## Design guidance and coding standards

- Reuse DocsLayout, Header, DataTable, Callout, Button, CodeBlock and TabGroup as applicable; no duplicate route-specific primitives.
- Follow existing neutral tokens and Spline typography; no rebrand or unrelated style cleanup.
- The fused boundary prerequisite is substantive explanatory content; full boundary tables/gap audit remain later scope.
- Use scoped Astro CSS and valid semantic markup.
- Use existing var(--*) tokens, a 2px focus ring and 2px offset.
- Add no island or product-state logic; preserve no-JavaScript HTML.
- Preserve full content and reduced-motion behavior.

## Verification gates

- `pnpm --filter @rnr-ai-elements/docs build`
- `pnpm typecheck`
- `pnpm exec biome ci apps/docs/src tests/sprint-05-orient-search`
- `pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs`
- `pnpm exec biome ci apps/docs/src tests/sprint-05-orient-search/reading-presentation.spec.ts`

Require actual successful execution. Check `git diff --name-only` against the allowlist. Revalidate the Requirement Contract and every scenario. The original aggregate commands remain required; per-AC commands select the concrete test token. Screenshots alone do not replace the assertions or downstream integrated flow proof.

## Evidence gates

Capture actual product screenshots and asserted values under the task evidence directory. Bind captures to fresh run/source/lockfile/dist/test/policy identities and reject missing or earlier proof. All paths below are planned outputs, not existing proof:

- tests/sprint-05-orient-search/evidence/reading/introduction-desktop-light.png
- tests/sprint-05-orient-search/evidence/reading/introduction-mobile-dark.png
- tests/sprint-05-orient-search/evidence/reading/boundary-table.png
- tests/sprint-05-orient-search/evidence/reading/installation-nojs.png
- tests/sprint-05-orient-search/evidence/reading/assertions.json

The retained boundary-table.png filename is an evidence path, not authorization to expand the boundary explanation into the later complete table use case.

Evidence must show the actual identity statements, section navigation, correct labeled engine panels, substantive boundary explanation, confined content geometry and successful same-origin Spline responses. No passing execution is claimed by this charter.

## Review

frontend-designer owns layout, style, composition and tokens. An independent frontend-designer instance reviews the actual rendered presentation; Astro retains runtime logic.

- Inspect the actual desktop/mobile/no-JavaScript screenshots and concrete assertions for every applicable AC.
- Verify true content, real browser actions, token-driven changes and negative controls; reject static or mocked success.
- Check scope and predecessor contracts; reject unsolicited behavior changes.
- Confirm applicable gates pass and evidence belongs to this candidate.

Verdict: APPROVED only after real scoped proof; otherwise NEEDS_FIXES with concrete file/AC evidence.

## Dependencies

Depends on: ORI-AST-001, ORI-AST-002, ORI-AST-003, ORI-AST-004, ORI-AST-007, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005
Blocks: ORI-VIS-002, ORI-VIS-003, ORI-VIS-004, ORI-VIS-005, ORI-CONT-004, ORI-AST-010, ORI-CI-004

Supporting flows only:

- FLOW-DOCS-01-getting-started-engine-decision — primary:false; primary owner ORI-CONT-004.
- FLOW-SHELL-13-engine-tab-persists-across-pages — primary:false; primary owner ORI-AST-010.
- FLOW-SHELL-14-tab-panels-in-initial-html — primary:false; primary owner ORI-AST-010.

## Out of scope

Runtime routing, heading extraction, theme resolution, engine persistence, search logic, authored prose, registry components, example-app behavior, additional UCs, changes to the locked flow set, full Sprint 06 boundary tables/gap cross-checks, Sprint 11 print/resilience and deployment hardening.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-VIS-001","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"built_docs":{"description":"Actual dependency-complete candidate built through the production docs command and served by this run's owned localhost:4321 preview.","seed_method":"cli","records":["Real authored orientation, Theming, Quickstart and boundary content","Generated registry with 56 rows across 39/11/6 categories","Production CSS, engine controls, theme control and Pagefind index"]},"fresh_browser":{"description":"Fresh real Playwright context navigates to that built site; storage is initially empty and no application DOM is injected.","seed_method":"ui_flow","records":["Desktop Chrome or configured Pixel 5 viewport","Real navigation and keyboard input","No-JavaScript cases use a context disabled before navigation"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN built orientation content WHEN Introduction and its boundary link are opened THEN the identity statements and substantive boundary explanation are readable in the shared shell.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["The prose slot is empty or disconnected from authored content"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open /docs/introduction; follow its canonical boundary link."]},"end_state":{"must_observe":["Introduction shows `React Native`, `copy-paste registry` and `not an npm package` together.","Boundary page shows substantive `renderMarkdown` and `dev client` explanation."],"must_not_observe":["An empty PageHeader-only shell","`Coming soon` boundary content"]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN built getting-started pages WHEN section navigation and Toc links are used at desktop and mobile widths THEN the named destinations and headings remain readable below the 3.5rem sticky header.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["Section navigation is disconnected from real destination anchors, leaves an empty link region, or loses sticky-header clearance."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Follow Installation, CLI, Theming and Dark mode; use Theming #textclasscontext at desktop and mobile widths."]},"end_state":{"must_observe":["Section navigation reaches `/docs/installation`, `/docs/cli`, `/docs/theming` and `/docs/dark-mode`.","The `TextClassContext` heading remains below the header; prose measure is bounded by `70ch`."],"must_not_observe":["An empty navigation region","A target heading concealed beneath the header"]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN completed tutorial and engine markup WHEN both engines are read with and without JavaScript THEN complete labeled commands and step-associated expected results remain readable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["A static first-engine-only view hides the second panel or expected results"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Read Quickstart with nativewind then uniwind; load Installation and /components/message in a fresh JavaScript-disabled context."]},"end_state":{"must_observe":["Both `nativewind` and `uniwind` labels accompany complete `conversation.json` commands.","Before step `1`, Quickstart names a scrolling seed-data message list with working prompt input in `Expo Go`; each numbered step has its own visible expected result before the real `useChat` example link."],"must_not_observe":["An empty second engine panel","Unlabeled stacked commands"]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the built reading shell WHEN light/dark desktop and mobile views load THEN typography uses local Spline assets and long content stays inside its own scroll containers.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/reading-presentation.spec.ts","test_function":"ORI-VIS-001-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production CSS","negative_control":{"would_fail_if":["Styles are absent or disconnected from shared tokens"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Load orientation in both themes and viewport projects; inspect actual font requests and rendered command/container geometry."]},"end_state":{"must_observe":["Both Spline families return `200` from the same origin.","Introduction and selected commands remain readable; font families use `--font-sans` and `--font-mono`; long commands scroll in their own container."],"must_not_observe":["Missing font responses","An empty stylesheet response","Page-wide overflow caused by a command"]}}]}},{"id":"TC-1","type":"test_criterion","description":"The AC-1 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The AC-2 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The AC-3 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The AC-4 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/reading-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-001-AC-4","maps_to_ac":"AC-4"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-VIS-001",
  "commit_sha": "315c4330f69810e05af1a36aa0b95761cadc58b4",
  "done": "The shared reading presentation landed at 315c4330 (merged to main as c28e40c2): PageHeader is the editorial masthead (balanced title, muted one-liner, token hairline), Prose carries the full reading rhythm with the 70ch measure, token-driven links and single-line command surfaces that scroll in their own containers in --font-mono, Toc is the Astro-owned <details> control (bordered block below xl, sticky 14rem rail with its own vertical scroller at >=xl), DocsLayout preloads the latin Spline subsets, global.css gains the four self-hosted @font-face rules plus the OFL-licensed woff2 files under apps/docs/public/fonts/ (force-added past the public/ ignore), a token treatment for the CopyButton trigger so no UA system button face renders in install strips, and the mobile grid containment guard; tests/sprint-05-orient-search/reading-presentation.spec.ts proves all four ACs 12/12 across chromium-desktop/mobile/nojs with evidence PNGs, assertions.json and run-identity.json under tests/sprint-05-orient-search/evidence/reading/ and cycle records under .tmp/ORI-VIS-001/cycle-{1,2}/.",
  "deviations": [
    "Toc ships as <details open> (Toc.astro:29) — open by default at every width rather than a collapsed-by-default mobile toggle, because static HTML cannot vary the open attribute per viewport without JS; it stays user-togglable everywhere and restyles as the rail at >=xl.",
    "The spec sentence 'Render the genuine boundary content through the shared DataTable presentation' was not literally implementable: the authored ORI-CONT-005 manuscript contains no table, so no table was fabricated and boundary-table.png shows the page exactly as authored (the task's own note marks the filename as evidence path, not scope).",
    "AC-4's 'long commands scroll in their own container' is implemented prose-scoped (Prose.astro:126, white-space:pre + overflow-x:auto on .prose .copy-button__command) so the registry ledger and home strips keep their established wrapping treatment.",
    "Only the two latin font subsets are preloaded (DocsLayout.astro head); latin-ext rides on demand through unicode-range, which the TR-07 'preloaded' wording did not distinguish.",
    "The CopyButton trigger token treatment lives in global.css (global.css:229) rather than the island source, because sprint-04's contract test pins CopyButton.astro and CodeBlock.astro byte-identical to their landed state.",
    "The header assertion bounds the sticky bar at 56px box plus at most its 1px divider (57px outer) since the site ships no border-box reset, and the 70ch measure is proven against a live-measured 70ch probe because Chrome resolves ch to used px."
  ],
  "concerns": [
    "The mobile containment guard (min-width:0 on the markdown-doc grid areas, global.css:255) belongs in MarkdownLayout.astro's stacked template next to its >=lg minmax(0,1fr), but that file was outside this task's allowlist — it should be adopted/moved the next time MarkdownLayout is opened under a proper scope.",
    "apps/docs/.gitignore ignores all of public/ for the generated r/ tree, so every future asset under public/ (fonts included) needs git add -f or an ignore refinement, and a fresh clone only regenerates public/r — the fonts are tracked, but reviewers should know the directory is half-ignored by design.",
    "Spec authors must write page.evaluate callbacks as string expressions with result casts (or globalThis-typed DOM shims) because the workspace tsconfig has no DOM lib — arrow-function callbacks referencing document/window fail pnpm typecheck.",
    "The pre-commit righthook runs biome over every staged file including .tmp scratch, so long single lines in diagnostic scripts fail commits; keep scratch scripts formatter-clean or expect an amend cycle.",
    "Leaked astro preview servers from ad-hoc probes squat port 4321 and break the next playwright webServer start under CI=true — always kill by port after standalone probes."
  ],
  "findings": [
    "RESERVED_DOC_SLUGS (apps/docs/src/lib/docs-navigation.ts:48) was consumed by both route generation and section navigation, so a reserved slug silently vanished from every page's nav — fixed for theming by FIX-ORI-VIS-001-1, but any future reserved slug needs the same generation-vs-nav split decided explicitly.",
    "The site has no global border-box reset, so a height token plus a border measures one pixel larger than the token — do not assert token px equals rendered box px on bordered bars.",
    "The CopyButton island's trigger is bare markup frozen byte-identical by the sprint-04 contract; before global.css:229 it rendered as a UA-default system button (gray, outset border) inside every install strip on every surface, including the ledger and item pages.",
    "Under Pixel 5 emulation window.innerWidth reported 731 while documentElement.clientWidth and visualViewport stayed 393 — use scrollWidth vs clientWidth, not innerWidth, as the no-overflow oracle.",
    "Any wide non-shrinkable content (code fences, tables) inside the docs grid's stacked 1fr track blows the page ~2x past a phone viewport unless the grid items keep min-width:0 — the >=lg template always had the minmax(0,1fr) guard but the stacked template did not, and any new layout shell needs the same guard.",
    "getComputedStyle resolves ch units to used pixels, so the 70ch measure must be verified against a probe element measured in the same font context, not against the computed string.",
    "No-JS contexts render the dark column by construction because the pre-paint theme flip is an is:inline script — all no-JS screenshots and panel proofs are dark-theme observations."
  ],
  "scope_impact": [
    {
      "target": "ORI-VIS-002",
      "found": "The VIS successors build directly on this reading shell and its geometry oracles.",
      "change": "Verify mobile containment with documentElement.scrollWidth vs clientWidth (not window.innerWidth) and reuse the details-open Toc and prose-scoped command-scroll contracts rather than restyling them."
    },
    {
      "target": "ROADMAP",
      "found": "The mobile min-width:0 containment guard lives in global.css only because MarkdownLayout.astro was outside this task's allowlist.",
      "change": "Next time MarkdownLayout.astro is in scope, move the guard into its stacked-template media query beside the existing >=lg minmax(0,1fr) and delete the global rule."
    },
    {
      "target": "ORI-AST-010",
      "found": "Its no-JS stacked-panel and engine-persistence proofs walk the same TabGroup surfaces this task verified.",
      "change": "Reuse the per-group panel-iteration pattern from reading-presentation.spec.ts AC-3 (loop rnr-tab-group instances instead of unscoped panel locators, which strict mode rejects on multi-group pages)."
    }
  ],
  "feedback": [
    "The blocked-report -> one-line FIX -> cycle-2 loop worked exactly as designed: the AC mismatch was reported with the precise one-line predecessor change, the fix landed clean, and only the intended member flipped.",
    "Cross-checking each AC's must_observe against the owning module's actual derivation before dispatch would have caught the theming-nav impossibility at plan time instead of mid-implementation.",
    "The recurring environment quirks (broken pnpm lint, rtk swallowing playwright output until rtk proxy, no-DOM-lib tsconfig, leaked preview servers on 4321) each cost a debug cycle — they belong in a standing environment note attached to sprint dispatches."
  ]
}
```
