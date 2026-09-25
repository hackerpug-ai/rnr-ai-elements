# ORI-VIS-002: Present paired token values and the live theme demonstration

## What this does

Theming shows paired reference values, live swatches and explicit docs-only code tokens through the real theme control.

## Why

The token data and live sampling need table, swatch and code-frame presentation that remains readable in both themes.

## How to verify

Build the candidate with `pnpm --filter @rnr-ai-elements/docs build`. Run `pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs`. Inspect the actual table, computed token values, code surfaces and screenshots.

## Scope

Presentation in TokenTable, shared DataTable and CodeBlock, with real browser proof. ORI-AST-003 owns token sourcing, live sampling, theme behavior and the actual code-highlighting integration.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata
> Status: Backlog
Assignee: frontend-designer
Priority: P1
Points: 2
Type: DESIGN
Dependency phase: After ORI-VIS-001, ORI-AST-003, ORI-AST-007
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

Theming shows paired reference values, live swatches and explicit docs-only code tokens through the real theme control.

## Critical constraints

- Never change token sourcing, resampling, theme persistence or code-highlighting logic; consume ORI-AST-003's actual contract.
- Never maintain a second numeric palette or hardcode inline swatch colors; use the site's existing CSS variables and generated reference values.
- Never use a mock renderer, injected table, canned theme response, static success receipt or skipped browser target as proof.
- Never add another island, duplicate table mechanics or truncate reference content.
- Never write outside the allowlist or alter shared WIP; use the assigned isolated candidate and owned preview.

## Done when

- [ ] AC-1: Token names and paired Light/Dark reference values remain separately readable.
- [ ] AC-2: The live background sample visibly follows real theme changes in both directions.
- [ ] AC-3: Real code surfaces match the active theme and both code tokens retain DOCS-ONLY labels.
- [ ] AC-4: Static reference values remain readable without JavaScript and wide tables scroll within their containers.
- [ ] Required gates pass and current-candidate evidence is inspected.
- [ ] Changes remain within the exact write allowlist.

## Specification

Use shared table mechanics for the Astro-owned token table. Keep token name, light reference value, dark reference value and live swatch distinguishable without color alone. Show DOCS-ONLY beside both code tokens. Changing the real theme must update the live sample while leaving both reference columns readable. Align the actual Expressive Code output with the documented code tokens. Constrain horizontal scrolling to the table or code container.

Current gap: The token data and live sampling need table, swatch and code-frame presentation that remains readable in both themes.

Success state: Theming shows paired reference values, live swatches and explicit docs-only code tokens through the real theme control.

Classification: Presentation-only CSS and composition over the real token and theme implementation supplied by predecessors. Real browser evidence remains mandatory. This task does not change the locked flow set or claim primary ownership of a locked flow.

## Acceptance criteria and proof

Each JSON record is the complete human-readable acceptance criterion, proof binding and Scenario Contract. Its fields match the machine contract below. These task-owned presentation checks have primary:false and flow_ref:null. ORI-CONT-004 and ORI-AST-003 retain their locked-flow ownership.

### AC-1

```json
{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the real token table WHEN Theming is read THEN token names, Light and Dark values remain separately identifiable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The table is a static empty shell or drops a reference column"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open /docs/theming and inspect real token rows, including --primary."]},"end_state":{"must_observe":["At least `10` token rows show Light and Dark oklch values.","The `--primary` row has distinct paired values and a readable name."],"must_not_observe":["An empty token table","A single unlabeled reference value"]}}]}}
```

### AC-2

```json
{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN Theming in light appearance WHEN the real header theme is toggled to dark and back THEN the live background sample follows the actual site variables.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The swatch is disconnected from the actual theme or is a hardcoded color"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open Theming in the fresh light-preference context, toggle the header control to dark, observe the live --background swatch, then toggle back to light."]},"end_state":{"must_observe":["Dark `--background` is `oklch(0.145 0 0)` and light is `oklch(1 0 0)`.","The `--background` swatch makes 2 observed color transitions, light to dark to light, while both `Light` and `Dark` reference columns remain readable after each toggle."],"must_not_observe":["A static light swatch after dark selection","An empty live-value cell"]}}]}}
```

### AC-3

```json
{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the real code surfaces WHEN the theme changes THEN code values match the theme and both code tokens retain DOCS-ONLY labels.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The code frame is disconnected from theme tokens"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open Theming; observe the real CodeBlock and --code-background/--code-foreground rows in light, then use the header toggle and repeat in dark."]},"end_state":{"must_observe":["`--code-background` changes between `oklch(0.97 0 0)` and `oklch(0.235 0 0)`.","`--code-background` and `--code-foreground` each retain `DOCS-ONLY`."],"must_not_observe":["Fewer than 2 `DOCS-ONLY` labels, including 0 labels or an empty code-token label cell","Static light code surface after dark selection"]}}]}}
```

### AC-4

```json
{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN a fresh no-JavaScript or mobile browser WHEN Theming is read THEN static paired values remain visible and any wide table scrolls inside its container.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The no-JavaScript table is an empty shell disconnected from generated reference values, or its container clips those values."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Load Theming with JavaScript disabled; repeat in the mobile viewport and horizontally scroll the table if needed."]},"end_state":{"must_observe":["The `--primary` Light and Dark values and both `DOCS-ONLY` labels remain readable.","The `--primary` identifying cell remains within the visible table-container bounds after horizontal scrolling; page-wide horizontal overflow is `0` pixels."],"must_not_observe":["An empty no-JavaScript table","Page-wide overflow or clipped token values"]}}]}}
```

## Test criteria

- TC-1 → AC-1: The AC-1 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-1`
- TC-2 → AC-2: The AC-2 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-2`
- TC-3 → AC-3: The AC-3 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-3`
- TC-4 → AC-4: The AC-4 observations hold and its excluded empty or disconnected state is absent. Verify: `pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-4`

## Fixtures

```json
{"built_docs":{"description":"Actual dependency-complete candidate built through the production docs command and served by this run's owned localhost:4321 preview.","seed_method":"cli","records":["Actual Theming content and ORI-AST-003 TokenTable","Generated Light/Dark reference values and actual site CSS variables","Working production header theme control and real code-highlighting output"]},"fresh_browser":{"description":"Fresh real Playwright context navigates to that built site with empty storage and light color-scheme preference; no application DOM or theme state is injected.","seed_method":"ui_flow","records":["Desktop Chrome or configured Pixel 5 viewport","Theme changes occur through the real header control","No-JavaScript cases disable JavaScript before navigation and read the actual static reference"]}}
```

The production build is the seed entrypoint for content and data. Browser contexts then use the real HTTP response and controls. Token literals in assertions are expected values from the fixed contract, not a second product palette. Do not fabricate token rows or replace the sampling path.

## Scope permissions

### write_allowed

- apps/docs/src/components/TokenTable.astro
- apps/docs/src/components/DataTable.astro
- apps/docs/src/components/CodeBlock.astro
- tests/sprint-05-orient-search/token-presentation.spec.ts
- tests/sprint-05-orient-search/evidence/tokens/
- tests/sprint-05-orient-search/evidence/tokens/theming-light.png
- tests/sprint-05-orient-search/evidence/tokens/theming-dark.png
- tests/sprint-05-orient-search/evidence/tokens/computed-values.json

### write_prohibited

- Token sampling or theme persistence logic
- apps/docs/src/scripts/**
- Authored theming content
- packages/registry/**
- Any file not explicitly allowed.

## Boundaries and guardrails

Always:

- Scan and reuse the existing DataTable and CodeBlock presentation before implementing.
- Consume the actual token values, live sampling and code markup from ORI-AST-003.
- Capture computed values and inspect real screenshots from the candidate served by the owned preview.

Ask first:

- Changes to the token data or runtime sampling contract.
- New dependencies, new islands or expanded write paths.
- Changes to the documented palette or authored content.

Boundary contracts:

- Theming retains a readable light and dark oklch value for each documented token.
- The --background live swatch changes between the documented light and dark values when the real header toggle changes the theme.
- The --code-background current value changes between oklch(0.97 0 0) and oklch(0.235 0 0).
- --code-background and --code-foreground remain explicitly labeled DOCS-ONLY in both themes.
- Swatches use the live site's CSS variables; no inline hardcoded swatch colors or extra island are introduced.
- No-JavaScript output includes the static reference values.

Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

## Deliverables and capability contracts

Provides:

- TokenTable presentation.
- Theme-matched code surfaces.

Consumes:

- ORI-AST-003 live token contract.
- ORI-AST-007 shared table contract.
- ORI-VIS-001 reading presentation.

Capability: CAP-DOCS-01
PRD references: UC-DOCS-01, UC-SHELL-01, TR-07
Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/frontend-designer-absorb-prerequisites.json
Source task IDs: ORI-VIS-002
Supersedes: []

## Agent instructions

1. Read the predecessor token/table contracts and scan existing reusable presentation.
2. Use the frontend-design skill after the scan. Apply only scoped presentation and composition changes.
3. Keep both reference columns visible while the real live sample changes. Preserve static values without JavaScript.
4. Build the actual candidate. Register enabled interaction cases only in enabled projects and register actual fallback assertions in the no-JavaScript project. AC-2 and AC-3 directly select the enabled projects; AC-1 and AC-4 exercise the full applicable matrix. Do not use runtime skip calls or passing omissions.
5. Run the full aggregate command, inspect screenshot and computed-value evidence, run remaining gates and report the exact candidate and unresolved failures.

TDD is skipped for this pure presentation task. Behavioral browser proof and seeded evidence remain required. Settled screenshots do not establish flash-free startup; ORI-AST-003 owns the separate frame-level proof.

## Reading list

1. `apps/docs/src/components/DataTable.astro` — lines all; PRIMARY PATTERN: shared scrolling, zebra bands, sticky identifying column and token-governed cells.
2. `apps/docs/src/components/CodeBlock.astro` — lines all; consume the existing full-content code surface.
3. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md` — lines all; fixed token values, typography, token-table wireframe and DOCS-ONLY distinction.
4. `tests/harness/docs-preview.ts` — lines all; real owned preview and browser conventions.
5. `/Users/justinrich/.codex/skills/frontend-design/SKILL.md` — lines all; visual implementation after modular scan.

Also obey the repository AGENTS.md already supplied to the execution session.

## Design guidance and coding standards

- Reuse DataTable mechanics rather than duplicating table CSS or markup for Theming.
- Distinguish name, Light, Dark and live sample without relying on color alone.
- Keep both reference values readable while the real sample changes.
- Use existing var(--*) tokens and valid scoped Astro CSS; no inline numeric swatch palette.
- Preserve complete values, labels and code content; no clipping or truncation.
- Add no island, runtime state logic or authored palette copy.

## Verification gates

- `pnpm --filter @rnr-ai-elements/docs build`
- `pnpm typecheck`
- `pnpm exec biome ci apps/docs/src tests/sprint-05-orient-search`
- `pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs`

Require actual successful execution. Check `git diff --name-only` against the allowlist. Revalidate every scenario and the Requirement Contract. Observe the token rows and real code frames as success targets; generic root selectors cannot serve as the oracle.

## Evidence gates

Planned outputs:

- tests/sprint-05-orient-search/evidence/tokens/theming-light.png
- tests/sprint-05-orient-search/evidence/tokens/theming-dark.png
- tests/sprint-05-orient-search/evidence/tokens/computed-values.json

Capture the actual paired reference values, live swatch changes, both DOCS-ONLY labels and real code-surface values. Include mobile and no-JavaScript observations in computed-values.json and attach corresponding captures within the allowed evidence directory. Bind evidence to fresh run/source/lockfile/dist/test/policy identities. No artifact or successful command is claimed to exist by this charter.

## Review

An independent frontend-designer reviews the actual token table and code surfaces. ORI-AST-003 remains responsible for the data and runtime behavior.

- Inspect real light/dark and fallback evidence, not only source assertions.
- Verify both reference columns and labels persist when the actual sample changes.
- Reject hardcoded swatches, additional islands, fake token data and style tests under a mock renderer.
- Check exact scope, predecessor boundaries and current-candidate gate results.

Verdict: APPROVED only after real scoped evidence; otherwise NEEDS_FIXES with concrete file/AC findings.

## Dependencies

Depends on: ORI-VIS-001, ORI-AST-003, ORI-AST-007
Blocks: ORI-VIS-004, ORI-CONT-004, ORI-CI-004

Supporting flows only:

- FLOW-DOCS-01-theming-and-section-nav — primary:false; primary owner ORI-CONT-004.
- FLOW-SHELL-01-theme-toggle-persisted-flash-free — primary:false; primary owner ORI-AST-003.

## Out of scope

Token sourcing and sampling, theme persistence, first-painted-frame proof, authored theming prose, registry components, new islands, palette changes, unrelated style refactoring, and changes to the locked flow set.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-VIS-002","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"built_docs":{"description":"Actual dependency-complete candidate built through the production docs command and served by this run's owned localhost:4321 preview.","seed_method":"cli","records":["Actual Theming content and ORI-AST-003 TokenTable","Generated Light/Dark reference values and actual site CSS variables","Working production header theme control and real code-highlighting output"]},"fresh_browser":{"description":"Fresh real Playwright context navigates to that built site with empty storage and light color-scheme preference; no application DOM or theme state is injected.","seed_method":"ui_flow","records":["Desktop Chrome or configured Pixel 5 viewport","Theme changes occur through the real header control","No-JavaScript cases disable JavaScript before navigation and read the actual static reference"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the real token table WHEN Theming is read THEN token names, Light and Dark values remain separately identifiable.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-1","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The table is a static empty shell or drops a reference column"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open /docs/theming and inspect real token rows, including --primary."]},"end_state":{"must_observe":["At least `10` token rows show Light and Dark oklch values.","The `--primary` row has distinct paired values and a readable name."],"must_not_observe":["An empty token table","A single unlabeled reference value"]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN Theming in light appearance WHEN the real header theme is toggled to dark and back THEN the live background sample follows the actual site variables.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-2","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The swatch is disconnected from the actual theme or is a hardcoded color"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open Theming in the fresh light-preference context, toggle the header control to dark, observe the live --background swatch, then toggle back to light."]},"end_state":{"must_observe":["Dark `--background` is `oklch(0.145 0 0)` and light is `oklch(1 0 0)`.","The `--background` swatch makes 2 observed color transitions, light to dark to light, while both `Light` and `Dark` reference columns remain readable after each toggle."],"must_not_observe":["A static light swatch after dark selection","An empty live-value cell"]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the real code surfaces WHEN the theme changes THEN code values match the theme and both code tokens retain DOCS-ONLY labels.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-3","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The code frame is disconnected from theme tokens"]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Open Theming; observe the real CodeBlock and --code-background/--code-foreground rows in light, then use the header toggle and repeat in dark."]},"end_state":{"must_observe":["`--code-background` changes between `oklch(0.97 0 0)` and `oklch(0.235 0 0)`.","`--code-background` and `--code-foreground` each retain `DOCS-ONLY`."],"must_not_observe":["Fewer than 2 `DOCS-ONLY` labels, including 0 labels or an empty code-token label cell","Static light code surface after dark selection"]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN a fresh no-JavaScript or mobile browser WHEN Theming is read THEN static paired values remain visible and any wide table scrolls inside its container.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/token-presentation.spec.ts","test_function":"ORI-VIS-002-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-4","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","surface_policy":".spec/e2e-policy/surface.json","maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro preview, real Chromium browser and production token CSS","negative_control":{"would_fail_if":["The no-JavaScript table is an empty shell disconnected from generated reference values, or its container clips those values."]},"evidence":{"artifact_type":"screenshot","required_capture":true},"cases":[{"start_ref":"fresh_browser","action":{"actor":"user","steps":["Load Theming with JavaScript disabled; repeat in the mobile viewport and horizontally scroll the table if needed."]},"end_state":{"must_observe":["The `--primary` Light and Dark values and both `DOCS-ONLY` labels remain readable.","The `--primary` identifying cell remains within the visible table-container bounds after horizontal scrolling; page-wide horizontal overflow is `0` pixels."],"must_not_observe":["An empty no-JavaScript table","Page-wide overflow or clipped token values"]}}]}},{"id":"TC-1","type":"test_criterion","description":"The AC-1 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The AC-2 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The AC-3 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --grep ORI-VIS-002-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"The AC-4 observations hold and its excluded empty or disconnected state is absent.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/token-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-002-AC-4","maps_to_ac":"AC-4"}]}
-->
</details>
