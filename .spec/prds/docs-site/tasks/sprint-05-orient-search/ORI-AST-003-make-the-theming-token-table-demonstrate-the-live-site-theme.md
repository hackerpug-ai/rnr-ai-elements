<!-- Template Version: 5.2.0 -->
# ORI-AST-003: Make the Theming token table demonstrate the live site theme

## What this does

Visitors read CSS-derived token pairs and watch current values, swatches and code colors follow persistent, flash-free theme changes on the real Theming page.

## Why

Current theme-toggle.ts updates html.light and storage but not the complementary html.dark marker or live token values. The existing theming.astro has prose and seam anchors but no TokenTable. Runtime baseline behavior remains unobserved.

## How to verify

Run the three exact task commands below against the real built preview. Inspect no-JavaScript token pairs, live toggles, reconnects, code colors and navigation frames. Product verification remains future work.

## Scope

The token extractor, usage metadata, TokenTable, existing ThemeToggle, single Theming route adapter, three owned test files and enumerated evidence paths.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: ✅ Completed

Commit: 32cf1a85c528617239031dc9880dc5398d5d984c
> Assignee: astro-implementer
> Priority: P1 · Points: 3 · Type: FEATURE
> Dependency phase: After ORI-AST-001, ORI-AST-002 and ORI-CONT-002
> Proposed By: astro-planner · Co-authored By: techwriting-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer
> PROGRESS: 0/4 ACs observed; all TDD_STATE values are none.

### OUTCOME

Visitors read CSS-derived token pairs and watch current values, swatches and code colors follow persistent, flash-free theme changes on the real Theming page.

### CRITICAL CONSTRAINTS — Never

- Never fabricate product state or proof: no mocked HTTP, fake filesystem, view injection, stub provider, canned output, skipped target or test-only product seam.
- Preserve shared WIP and exact write permissions; use only the assigned isolated candidate and owned OS-derived scratch roots.
- Read palette values from actual CSS declarations and current values from computed CSS; token-usage.json stores only usage labels and docs-only classification.
- Extend the existing ThemeToggle only; add no sixth custom element or second theme mechanism. Update html.light and html.dark in the same click transition.
- Consume the reviewed manuscript without rewriting it or adding a second /docs/theming route; retain textclasscontext and rendermarkdown while accepting corrected prop claims.

### DONE WHEN

- [ ] Both primary locked flows have actual RED and current-candidate seeded browser evidence.
- [ ] Static rows, manuscript binding, reconnect refresh and code themes satisfy AC-1 through AC-4 and TC-1 through TC-5.
- [ ] Required checks and independent review pass; only write_allowed paths change.
- [ ] Captured evidence shows actual values and frames; no required behavior is stubbed or deferred.

### SPECIFICATION

Extract light and dark values from the actual docs CSS custom-property declarations and render at least ten semantic token rows with usage, paired values, and live swatches. Store usage labels and docs-only classification separately from values; never duplicate a palette. Label code-background and code-foreground DOCS-ONLY. Extend the existing ThemeToggle to refresh current values from computed CSS after connection and each toggle, including ClientRouter reconnect. Update the complementary html.dark marker in the same click transition that updates html.light. Adapt the existing theming route to render ORI-CONT-002's real collection entry with a TokenTable component binding. Preserve textclasscontext and rendermarkdown anchors while accepting the content specialist's correction of inaccurate component-prop claims.

### ACCEPTANCE CRITERIA

Use sequential RED → GREEN → REFACTOR beads. AC-1 owns FLOW-SHELL-01 and AC-2 owns FLOW-SHELL-02; AC-3 and AC-4 support FLOW-SHELL-01. Keep all cases inside their exact locked grep selection.

#### AC-1: Persisted theme and live values [PRIMARY]

GIVEN a fresh light visit WHEN the visitor toggles dark, hard-reloads and returns to light THEN storage, complementary classes, background, current values and swatches follow each selection without a reload flash.

PRIMARY: true
FLOW_REF: FLOW-SHELL-01-theme-toggle-persisted-flash-free
TEST_FILE: tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts
TEST_FUNCTION: FLOW-SHELL-01-theme-toggle-persisted-flash-free
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
TEST_TIER: e2e
VERIFICATION_SERVICE: Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
TDD_STATE: none
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-003-AC-1","use_case_ref":"UC-SHELL-01","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["The click handler is a no-op, storage is not persisted, or current values are disconnected from computed CSS."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_light","action":{"actor":"user","steps":["Open /docs/theming; record the light table and computed styles.","Click the actual rnr-theme-toggle button; observe classes, color-scheme, storage and the background token row.","Hard-reload while recording all navigation frames; then click the same control back to light."]},"end_state":{"must_observe":["Dark selection: rnr-theme=dark, html.dark=true, html.light=false, color-scheme=dark; page and background swatch resolve to oklch(0.145 0 0).","The first nonblank reload frame is dark with background oklch(0.145 0 0); the background current-value cell equals computed --background.","Light selection: rnr-theme=light, html.light=true, html.dark=false, color-scheme=light; page, swatch and current value resolve to oklch(1 0 0)."],"must_not_observe":["A blank or static current-value cell after either toggle.","Both root theme classes present, absent selected class, or a light first nonblank frame after the dark reload."]}}]}
```

#### AC-2: First dark visit before paint [PRIMARY]

GIVEN fresh dark-preference contexts with empty storage WHEN each locked route cold-loads THEN dark classes and color-scheme precede body paint, all first frames are dark, and dark code tokens resolve.

PRIMARY: true
FLOW_REF: FLOW-SHELL-02-first-visit-prefers-dark-no-flash
TEST_FILE: tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts
TEST_FUNCTION: FLOW-SHELL-02-first-visit-prefers-dark-no-flash
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
TEST_TIER: e2e
VERIFICATION_SERVICE: Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
TDD_STATE: none
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-003-AC-2","use_case_ref":"UC-SHELL-01","ac_ref":"AC-2","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["The pre-paint path is omitted, delayed until DOMContentLoaded, or disconnected from system preference; a static table reports light values."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_dark","action":{"actor":"user","steps":["Cold-navigate to /docs/theming with parser and frame observation already active.","Observe root state when body becomes parseable; inspect every frame through load and the dark code-background row.","Repeat in independent cold contexts on / and /components/message; inspect the actual component page code frame."]},"end_state":{"must_observe":["On all 3 routes, html.dark=true, html.light=false and color-scheme=dark when body first becomes parseable.","Every route's first nonblank frame has background oklch(0.145 0 0); no later light frame occurs during load.","The /docs/theming code-background row reads oklch(0.235 0 0); the /components/message code frame uses the dark code theme."],"must_not_observe":["A blank token value, default light frame, or missing pre-navigation recording.","A missing html.dark marker at body parse time."]}}]}
```

#### AC-3: CSS-derived static table and manuscript binding

GIVEN the real CSS sheet and reviewed theming manuscript WHEN /docs/theming loads without JavaScript THEN at least ten semantic rows retain usage, both values, DOCS-ONLY code labels, and both seam anchors.

PRIMARY: false
FLOW_REF: FLOW-SHELL-01-theme-toggle-persisted-flash-free
TEST_FILE: tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts
TEST_FUNCTION: FLOW-SHELL-01-theme-toggle-persisted-flash-free
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
TEST_TIER: e2e
VERIFICATION_SERVICE: Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
TDD_STATE: none
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-003-AC-3","use_case_ref":"UC-SHELL-01","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["The extractor is disconnected from global.css, returns an empty/static palette, or the real MDX component binding is omitted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"no_javascript","action":{"actor":"user","steps":["Open the built /docs/theming route with JavaScript disabled.","Compare table pairs to actual :root dark and html.light declarations, including background, foreground, card, border, muted, primary, secondary, ring and both code tokens.","Read the rendered manuscript and follow its textclasscontext and rendermarkdown anchors."]},"end_state":{"must_observe":["At least 10 semantic rows have nonempty usage and readable light/dark columns derived from the actual CSS sheet.","The background row contains light oklch(1 0 0) and dark oklch(0.145 0 0).","Both code-background and code-foreground rows carry DOCS-ONLY; #textclasscontext and #rendermarkdown each occur exactly 1 time.","The reviewed manuscript distinguishes consumer Tailwind v4 @theme from the site's plain CSS; one /docs/theming route binds the actual TokenTable."],"must_not_observe":["An empty table, placeholder component, blank usage, or missing light/dark column.","A second palette stored in token-usage.json or a second /docs/theming route."]}}]}
```

#### AC-4: Refresh after ClientRouter reconnect and match code themes

GIVEN the real themed page WHEN the visitor navigates away and back through ClientRouter and toggles again THEN reconnected current values, swatches and code colors match computed CSS without duplicate toggle effects.

PRIMARY: false
FLOW_REF: FLOW-SHELL-01-theme-toggle-persisted-flash-free
TEST_FILE: tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts
TEST_FUNCTION: FLOW-SHELL-01-theme-toggle-persisted-flash-free
VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
TEST_TIER: e2e
VERIFICATION_SERVICE: Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage
SURFACE_POLICY: .spec/e2e-policy/surface.json
COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
TDD_STATE: none
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-AST-003-AC-4","use_case_ref":"UC-SHELL-01","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["Reconnect refresh is omitted, listeners accumulate, or the table/code theme is disconnected from the existing ThemeToggle."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_light","action":{"actor":"user","steps":["Open /docs/theming and toggle dark using rnr-theme-toggle.","Use real site links to /components/message and back to /docs/theming; observe the reconnected token table and actual code colors.","Toggle once to light, then once to dark; compare current values and swatches after each action."]},"end_state":{"must_observe":["After ClientRouter return, the background row reads oklch(0.145 0 0) and the code-background row reads oklch(0.235 0 0) before another click.","Light code-background/code-foreground resolve to oklch(0.97 0 0) / oklch(0.205 0 0); dark resolves to oklch(0.235 0 0) / oklch(0.922 0 0).","Each single click causes 1 theme transition; current values match computed CSS and actual code frames follow the active theme."],"must_not_observe":["Blank or stale current-value cells after reconnect, unchanged code colors, or duplicate click transitions.","A sixth custom element used to refresh the table."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: Dark selection, persisted reload and return to light satisfy every AC-1 storage, class, frame, background and live-value assertion. VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
- TC-2 → AC-2: All three independent cold routes satisfy every AC-2 parser-state, frame and dark-code assertion. VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash
- TC-3 → AC-3: The no-JavaScript response satisfies every AC-3 token-pair, usage, classification, anchor and manuscript-binding assertion. VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
- TC-4 → AC-4: ClientRouter return and both toggles satisfy every AC-4 refresh, single-transition and code-theme assertion. VERIFY: pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
- TC-5 → AC-3: The real token-map tests derive light/dark pairs from global.css, keep usage/classification separate from values, and reject empty or missing token pairs. VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/token-map.test.ts

### SHARED FIXTURES

Browser preferences and JavaScript availability configure the environment; product state must come through the real route and toggle.

```json
{"fresh_light":{"description":"Built candidate at http://localhost:4321; fresh real browser context using light colorScheme and empty storage.","seed_method":"ui_flow","records":["Navigate through the served /docs/theming route; do not inject markup, styles, classes or localStorage.","Start navigation-frame recording before page.goto; record candidate ownership, source/lockfile/dist/driver/policy hashes and fresh run ID."]},"fresh_dark":{"description":"Built candidate at http://localhost:4321; independent cold real browser contexts using dark colorScheme, empty storage and no back-forward cache restoration.","seed_method":"ui_flow","records":["Cold-open /docs/theming, / and /components/message through real navigation.","Attach observation-only parser-state and frame recording before navigation; record candidate ownership, source/lockfile/dist/driver/policy hashes and fresh run ID."]},"no_javascript":{"description":"The real built /docs/theming route opened in an isolated browser context with JavaScript disabled.","seed_method":"ui_flow","records":["Use real HTTP navigation with javaScriptEnabled=false; render the reviewed ORI-CONT-002 collection entry and actual TokenTable.","Read apps/docs/src/styles/global.css from the real filesystem as the expected source of token pairs; never supply fixture HTML or palette values."]}}
```

### SCOPE

writeAllowed:
- scripts/docs-data/token-map.ts
- apps/docs/src/data/token-usage.json
- apps/docs/src/components/TokenTable.astro
- apps/docs/src/scripts/theme-toggle.ts
- apps/docs/src/pages/docs/theming.astro
- tests/sprint-05-orient-search/token-map.test.ts
- tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts
- tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-003/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free/
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-02-first-visit-prefers-dark-no-flash/
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free/proof.red
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-02-first-visit-prefers-dark-no-flash/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-02-first-visit-prefers-dark-no-flash/proof.red

writeProhibited:
- .spec/**
- apps/docs/src/content/**
- apps/docs/src/styles/**
- apps/docs/src/layouts/**
- packages/registry/**
- apps/example/**
- package.json
- pnpm-lock.yaml
- apps/docs/package.json
- Any file outside write_allowed

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:
- Derive static pairs at build time; retain both columns without JavaScript.
- Refresh computed current values on connection, each toggle and ClientRouter reconnect without duplicate listeners.
- Keep code-background and code-foreground labelled DOCS-ONLY; retain accessible token-governed table styling.
- Record observed baseline failures and inherited green behavior separately; preserve source-bound evidence.
- Identify the localhost:4321 listener before observing it; use the owned candidate and close owned contexts/recordings.

Ask first:
- Changes to dependencies, CSS palette, shared layout, policies or any write path outside this charter.
- Missing predecessor contracts, conflicting route ownership or unavailable actual pre-paint behavior requiring another owner's files.

### DELIVERABLE

- token-map.ts derives paired rows at build time; token-usage.json contains only usage/classification.
- TokenTable.astro renders static paired columns, swatches and computed-current-value targets.
- theme-toggle.ts refreshes those targets and updates both complementary classes.
- theming.astro binds the reviewed collection entry to the actual TokenTable on the existing route.
- The three enumerated tests and evidence paths prove actual extraction and browser behavior.

### BOUNDARY CONTRACTS

- Actual CSS declarations produce the static table; computed CSS produces the current-value display.
- Both light and dark columns remain readable without JavaScript.
- The existing ThemeToggle owns refresh behavior; no sixth custom element is added.
- The guide distinguishes the consumer's Tailwind v4 theme from this site's plain CSS token sheet.
- Theming manuscript authoring precedes its route adapter; it does not depend on a fabricated TokenTable.
- Consume ORI-CONT-002's manuscript, bind the actual TokenTable to the authored MDX, and adapt the existing theming.astro route. Do not rewrite the manuscript or publish a second /docs/theming route. Complete the real token and theme evidence here; manuscript authoring does not depend on this task.

### AGENT INSTRUCTIONS — TDD

- RED: author actual assertions inside the exact owned flow selections and real token-map lane; run on recorded preimplementation source before product edits and capture observed failures. Report already-green assertions honestly.
- GREEN: after accepted RED evidence, implement the smallest change inside write_allowed and run the same exact selections.
- REFACTOR: retain behavior and rerun affected checks; no scope expansion. Independent review follows all ACs.

Never write implementation during RED. Import errors or absent source are not functional RED. Record inherited already-green assertions honestly.

### READING LIST

1. apps/docs/src/scripts/theme-toggle.ts:1-70 [PRIMARY PATTERN] — Existing custom-element registration, mounting, click and persistence ownership.
2. apps/docs/src/styles/global.css:1-177 — Read-only actual :root dark and html.light values, DOCS-ONLY code tokens and base styles.
3. apps/docs/src/pages/docs/theming.astro:1-93 — Single existing route and seam anchors; replace prose ownership with the reviewed collection entry.
4. apps/docs/src/components/CodeBlock.astro:1-46 — Existing code-token surface; consume predecessor code-theme work rather than change this file.
5. tests/sprint-02-shell-hero/theme-first-paint.spec.ts:1-231 — Read inherited browser setup; new evidence must begin before navigation and cover all locked observations.

### DESIGN / REFERENCES / CODING STANDARDS

Use the TR-07 markdown-mdx-doc R6c TokenTable composition and existing docs table/code styling. Semantic column headers and readable value text accompany swatches. Retain both paired columns without JavaScript; introduce no visual redesign or client framework.

- .spec/prds/docs-site/06-uc-shell.md#uc-shell-01-experience-the-dark-first-themed-shell
- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md
- .spec/prds/docs-site/11-technical-requirements/03-data-schema.md
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md

- Typed TypeScript and valid Astro markup; build-time extraction remains separate from browser computed-style reads.
- Use existing plain CSS custom properties and scoped styles; do not add Tailwind to the docs site or duplicate palette literals in product data.
- Use the real Astro collection render/component-binding interface delivered by prerequisites; fail closed on missing content or unresolved token pairs.
- Keep registration idempotent and reconnect refresh independent of already-bound click guards; preserve storage-unavailable behavior.

astro-planner owns build-time token derivation and Astro route/component contracts; astro-implementer implements them; astro-reviewer verifies runtime and source boundaries. techwriting-planner co-authors manuscript ownership and factual-content boundaries.

### RUNTIME COMMANDS / VERIFICATION GATES

- pnpm exec vitest run tests/sprint-05-orient-search/token-map.test.ts
- pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free
- pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash

Typecheck: pnpm typecheck
Lint: pnpm exec biome ci scripts/docs-data/token-map.ts apps/docs/src/data/token-usage.json apps/docs/src/scripts/theme-toggle.ts tests/sprint-05-orient-search/token-map.test.ts tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts
Build: pnpm --filter @rnr-ai-elements/docs build

Require real assertion RED before implementation, exact task-command GREEN after implementation, compiler/lint/build success, earlier applicable docs-lane regression proof at independent review and write-scope inspection. Complete current-sprint suites run after integration.

Use actual CSS extraction and browser computed styles. Record navigation frames from before loading to prove first paint; DOMContentLoaded alone is insufficient. Assert background, color-scheme, storage, both complementary root classes, live swatch changes, and code-theme changes. Report inherited behavior that is already green honestly.

### EVIDENCE GATES

- All evidence paths are planned future outputs. Bind manifest and each run.json to actual source/lockfile/dist/test-driver/policy hashes, exact command, fresh run ID and owned preview process.
- Capture navigation frames from before loading, parser timestamps, first-nonblank images, computed background/color-scheme, storage, both classes, table screenshots and actual code colors. DOMContentLoaded alone cannot prove first paint.
- Keep canonical RED at proof.red for each locked flow; retained red.txt paths are supplemental transcripts only and never replace proof.red.
- Record per-AC assertions inside the exact locked grep selections, including no-JavaScript and reconnect cases; real token-map results support AC-3 and never replace browser proof.
- Revalidate scenarios and human/machine parity; the orchestrator validates complete-sprint flow ownership and journey coverage. This task emits no journey_proofs.

Planned outputs:
- tests/sprint-05-orient-search/evidence/ORI-AST-003/manifest.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free/red.txt
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-02-first-visit-prefers-dark-no-flash/run.json
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-02-first-visit-prefers-dark-no-flash/red.txt
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-01-theme-toggle-persisted-flash-free/proof.red
- tests/sprint-05-orient-search/evidence/FLOW-SHELL-02-first-visit-prefers-dark-no-flash/proof.red

For each locked flow, its run.json and proof.red reside in evidence/<exact-flow-id>/. The surface policy is .spec/e2e-policy/surface.json; coldboot policy is .spec/e2e-policy/coldboot.json. All paths are planned_output_not_observed. red.txt remains supplemental and cannot replace proof.red.

Authoring-only scenario validation: stdin {fixtures, requirements}; python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py with no positional argument; exit 0, scenario_count=4, violations=[]. SURFACE_BIN=/dev/null and PYTHONDONTWRITEBYTECODE=1 prevent telemetry/bytecode writes. No product verification ran.

### OUT OF SCOPE

- Authoring or correcting the ORI-CONT-002 manuscript.
- Changing palette values, shared layout/pre-paint ownership, policies, dependencies or code-theme infrastructure outside the allowlist.
- New registry components, React Native/example-app changes, search, deployment, or other sprint tasks.
- Claiming sprint completion, integrated journey proof or observed runtime success from this planning render.

### CONTEXT / DEPENDENCIES / CAPABILITIES

Depends on: ORI-AST-001, ORI-AST-002, ORI-CONT-002. Blocks: no additional direct edges declared. Touches: CAP-DOCS-01.
Provides:
- Build-time paired token rows from the actual CSS sheet, joined with separate usage/classification metadata.
- Static TokenTable markup and current-value observation targets bound to the real theming MDX entry.
- ThemeToggle refresh across connection, click and ClientRouter reconnect; complementary root-class updates.
- Primary proof for FLOW-SHELL-01-theme-toggle-persisted-flash-free and FLOW-SHELL-02-first-visit-prefers-dark-no-flash.

Consumes:
- Reviewed ORI-AST-001 and ORI-AST-002 shared docs/content/code-theme prerequisites; confirm their delivered interfaces before adaptation.
- ORI-CONT-002's real collection manuscript and corrected seam claims; its authorship precedes this route adapter.
- apps/docs/src/styles/global.css declarations, the existing ThemeToggle and the governed built-preview browser surface.

- Use the assigned isolated candidate; record source identity against 38034e972490945b684f5bd5a706bca0479dc659 and selected reviewed predecessor commits.
- Confirm localhost:4321 is owned by this candidate; refuse an unowned listener. Use built dist, real browser and hash-bound policies.
- The reviewed collection manuscript and shared prerequisite interfaces must exist at implementation time; do not fabricate them or expand write permissions.
- Run observers without altering page state; seed storage selections through the actual toggle only. Close every owned browser context and recording session.

Provenance: source_proposal=.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json; source_task_ids=[ORI-AST-003]; proposed_by=astro-planner; co_authored_by=[techwriting-planner]; supersedes=[].
Human test hook: watch-token-values-change-live. Dark justification: null.

Fixed sprint gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.
Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction
Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)
Retain 13 flows (9 task, 4 journey), 36 tasks and 131 points. This task supports gate steps 4 and 5. ORI-AST-010 owns the four integrated journey proofs; this task returns journey_proofs=[].

### REVIEW — astro-reviewer

Must pass:
- Each AC and mapped TC has actual seeded evidence; both canonical locked browser flows retain exactly one primary AC here.
- Static values trace to real CSS and both columns survive without JavaScript; current values trace to computed CSS.
- All three cold routes and persisted reload have pre-navigation frame proof; both complementary classes and code themes agree.
- Manuscript ownership, seam anchors, single route and five-island boundary are preserved.
- Required gates, scope inspection and anti-stub scan pass against the reviewed candidate.

Should verify:
- A reconnect cannot bypass refresh because the button was already bound.
- Repeated clicks and navigation do not accumulate handlers.
- Background and code token labels/values remain readable in both themes.
- Inherited already-green behavior is described honestly; no claim implies product verification occurred during planning.

Verdict: pending independent review. Return APPROVED or NEEDS_FIXES with evidence and actionable file:line feedback.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-003","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"fresh_light":{"description":"Built candidate at http://localhost:4321; fresh real browser context using light colorScheme and empty storage.","seed_method":"ui_flow","records":["Navigate through the served /docs/theming route; do not inject markup, styles, classes or localStorage.","Start navigation-frame recording before page.goto; record candidate ownership, source/lockfile/dist/driver/policy hashes and fresh run ID."]},"fresh_dark":{"description":"Built candidate at http://localhost:4321; independent cold real browser contexts using dark colorScheme, empty storage and no back-forward cache restoration.","seed_method":"ui_flow","records":["Cold-open /docs/theming, / and /components/message through real navigation.","Attach observation-only parser-state and frame recording before navigation; record candidate ownership, source/lockfile/dist/driver/policy hashes and fresh run ID."]},"no_javascript":{"description":"The real built /docs/theming route opened in an isolated browser context with JavaScript disabled.","seed_method":"ui_flow","records":["Use real HTTP navigation with javaScriptEnabled=false; render the reviewed ORI-CONT-002 collection entry and actual TokenTable.","Read apps/docs/src/styles/global.css from the real filesystem as the expected source of token pairs; never supply fixture HTML or palette values."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Persisted theme and live values","description":"GIVEN a fresh light visit WHEN the visitor toggles dark, hard-reloads and returns to light THEN storage, complementary classes, background, current values and swatches follow each selection without a reload flash.","primary":true,"flow_ref":"FLOW-SHELL-01-theme-toggle-persisted-flash-free","test_file":"tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts","test_function":"FLOW-SHELL-01-theme-toggle-persisted-flash-free","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-003-AC-1","use_case_ref":"UC-SHELL-01","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["The click handler is a no-op, storage is not persisted, or current values are disconnected from computed CSS."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_light","action":{"actor":"user","steps":["Open /docs/theming; record the light table and computed styles.","Click the actual rnr-theme-toggle button; observe classes, color-scheme, storage and the background token row.","Hard-reload while recording all navigation frames; then click the same control back to light."]},"end_state":{"must_observe":["Dark selection: rnr-theme=dark, html.dark=true, html.light=false, color-scheme=dark; page and background swatch resolve to oklch(0.145 0 0).","The first nonblank reload frame is dark with background oklch(0.145 0 0); the background current-value cell equals computed --background.","Light selection: rnr-theme=light, html.light=true, html.dark=false, color-scheme=light; page, swatch and current value resolve to oklch(1 0 0)."],"must_not_observe":["A blank or static current-value cell after either toggle.","Both root theme classes present, absent selected class, or a light first nonblank frame after the dark reload."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"First dark visit before paint","description":"GIVEN fresh dark-preference contexts with empty storage WHEN each locked route cold-loads THEN dark classes and color-scheme precede body paint, all first frames are dark, and dark code tokens resolve.","primary":true,"flow_ref":"FLOW-SHELL-02-first-visit-prefers-dark-no-flash","test_file":"tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts","test_function":"FLOW-SHELL-02-first-visit-prefers-dark-no-flash","verify":"pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-003-AC-2","use_case_ref":"UC-SHELL-01","ac_ref":"AC-2","primary":true,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["The pre-paint path is omitted, delayed until DOMContentLoaded, or disconnected from system preference; a static table reports light values."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_dark","action":{"actor":"user","steps":["Cold-navigate to /docs/theming with parser and frame observation already active.","Observe root state when body becomes parseable; inspect every frame through load and the dark code-background row.","Repeat in independent cold contexts on / and /components/message; inspect the actual component page code frame."]},"end_state":{"must_observe":["On all 3 routes, html.dark=true, html.light=false and color-scheme=dark when body first becomes parseable.","Every route's first nonblank frame has background oklch(0.145 0 0); no later light frame occurs during load.","The /docs/theming code-background row reads oklch(0.235 0 0); the /components/message code frame uses the dark code theme."],"must_not_observe":["A blank token value, default light frame, or missing pre-navigation recording.","A missing html.dark marker at body parse time."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"CSS-derived static table and manuscript binding","description":"GIVEN the real CSS sheet and reviewed theming manuscript WHEN /docs/theming loads without JavaScript THEN at least ten semantic rows retain usage, both values, DOCS-ONLY code labels, and both seam anchors.","primary":false,"flow_ref":"FLOW-SHELL-01-theme-toggle-persisted-flash-free","test_file":"tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts","test_function":"FLOW-SHELL-01-theme-toggle-persisted-flash-free","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-003-AC-3","use_case_ref":"UC-SHELL-01","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["The extractor is disconnected from global.css, returns an empty/static palette, or the real MDX component binding is omitted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"no_javascript","action":{"actor":"user","steps":["Open the built /docs/theming route with JavaScript disabled.","Compare table pairs to actual :root dark and html.light declarations, including background, foreground, card, border, muted, primary, secondary, ring and both code tokens.","Read the rendered manuscript and follow its textclasscontext and rendermarkdown anchors."]},"end_state":{"must_observe":["At least 10 semantic rows have nonempty usage and readable light/dark columns derived from the actual CSS sheet.","The background row contains light oklch(1 0 0) and dark oklch(0.145 0 0).","Both code-background and code-foreground rows carry DOCS-ONLY; #textclasscontext and #rendermarkdown each occur exactly 1 time.","The reviewed manuscript distinguishes consumer Tailwind v4 @theme from the site's plain CSS; one /docs/theming route binds the actual TokenTable."],"must_not_observe":["An empty table, placeholder component, blank usage, or missing light/dark column.","A second palette stored in token-usage.json or a second /docs/theming route."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Refresh after ClientRouter reconnect and match code themes","description":"GIVEN the real themed page WHEN the visitor navigates away and back through ClientRouter and toggles again THEN reconnected current values, swatches and code colors match computed CSS without duplicate toggle effects.","primary":false,"flow_ref":"FLOW-SHELL-01-theme-toggle-persisted-flash-free","test_file":"tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts","test_function":"FLOW-SHELL-01-theme-toggle-persisted-flash-free","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-003-AC-4","use_case_ref":"UC-SHELL-01","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro built preview at http://localhost:4321, browser CSS engine and origin localStorage","negative_control":{"would_fail_if":["Reconnect refresh is omitted, listeners accumulate, or the table/code theme is disconnected from the existing ThemeToggle."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"fresh_light","action":{"actor":"user","steps":["Open /docs/theming and toggle dark using rnr-theme-toggle.","Use real site links to /components/message and back to /docs/theming; observe the reconnected token table and actual code colors.","Toggle once to light, then once to dark; compare current values and swatches after each action."]},"end_state":{"must_observe":["After ClientRouter return, the background row reads oklch(0.145 0 0) and the code-background row reads oklch(0.235 0 0) before another click.","Light code-background/code-foreground resolve to oklch(0.97 0 0) / oklch(0.205 0 0); dark resolves to oklch(0.235 0 0) / oklch(0.922 0 0).","Each single click causes 1 theme transition; current values match computed CSS and actual code frames follow the active theme."],"must_not_observe":["Blank or stale current-value cells after reconnect, unchanged code colors, or duplicate click transitions.","A sixth custom element used to refresh the table."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Dark selection, persisted reload and return to light satisfy every AC-1 storage, class, frame, background and live-value assertion.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"All three independent cold routes satisfy every AC-2 parser-state, frame and dark-code assertion.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/first-visit-prefers-dark-no-flash.spec.ts --grep FLOW-SHELL-02-first-visit-prefers-dark-no-flash","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The no-JavaScript response satisfies every AC-3 token-pair, usage, classification, anchor and manuscript-binding assertion.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"ClientRouter return and both toggles satisfy every AC-4 refresh, single-transition and code-theme assertion.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts --grep FLOW-SHELL-01-theme-toggle-persisted-flash-free","maps_to_ac":"AC-4"},{"id":"TC-5","type":"test_criterion","description":"The real token-map tests derive light/dark pairs from global.css, keep usage/classification separate from values, and reject empty or missing token pairs.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/token-map.test.ts","maps_to_ac":"AC-3"}]}
-->
</details>

## Handoff

```json
{"task": "ORI-AST-003", "commit_sha": "32cf1a85c528617239031dc9880dc5398d5d984c", "done": "Theming TokenTable binds ORI-CONT-002's theming.mdx via render(entry)+<Content components={{TokenTable}}/> (apps/docs/src/pages/docs/theming.astro:60), 20 paired rows derived at build time from global.css with static light/dark columns and live swatches, theme-toggle.ts flips both html.light and html.dark and refreshes current-value cells on connect/click/reconnect; token-map vitest + both FLOW-SHELL e2e flows are green (3 projects each) and evidence is re-bound to the tip, approved at 32cf1a8 and merged to main as 446c98b.", "deviations": ["FLOW-SHELL-01 AC-4 round trip uses the docs sidebar/body links (Theming→Dark mode→Theming) plus a separate full-load navigateLocalhost to /components/message for the code-frame check, rather than literally clicking header Components→message card→history-back, because the below-fold message card is not clickable on the mobile viewport (tests/sprint-05-orient-search/theme-toggle-persisted-flash-free.spec.ts:271)."], "concerns": ["playwright.config.ts:38 sets reuseExistingServer: !process.env.CI, so any local run silently reuses whatever already answers on :4321 and skips the harness port guard — the reviewer reproduced FLOW-02 failing 3/3 against an orphaned ORI-AST-007 preview, and concurrent sprint tasks share that port.", "ORI-AST-007's run_flow step runs pkill -f astro, which can kill a peer task's owned preview mid-run; there is no per-task ownership protocol guarding the shared port."], "findings": ["Astro MDX does support render-time component binding via <Content components={{Name}}/> — the Sätteri compile destructures props.components and throws _missingMdxReference when absent, so the ORI-CONT-002 handoff note claiming 'no render-time component-mapping parameter' was imprecise (apps/docs/src/pages/docs/theming.astro:60).", "getComputedStyle(documentElement).getPropertyValue('--code-background') returns oklch(23.5% 0 0) — Chromium re-serializes the lightness as a percentage — so live values must read the sibling swatch's resolved backgroundColor (number form) instead (apps/docs/src/scripts/theme-toggle.ts:48-53).", "In .astro frontmatter, import.meta.url resolves to the compiled dist chunk during prerender (ENOENT on source paths), so build-time file reads must use process.cwd() (the docs app root) as the catch-all does, not import.meta.url (apps/docs/src/components/TokenTable.astro:28)."], "scope_impact": [{"target": "ORI-VIS-002", "found": "Live token values read via getComputedStyle().getPropertyValue() are re-serialized to percentages (oklch(23.5% 0 0)), diverging from the sheet's number form that the static columns print.", "change": "Read live values from the swatch's resolved backgroundColor (number form) or assert equivalence, and read source/token files via process.cwd() rather than import.meta.url."}, {"target": "ORI-CONT-004", "found": "The manuscript's bare <TokenTable /> is bound at render time through <Content components={{TokenTable}}/>, so the authored MDX needs no import and the binding is Astro-native.", "change": "Verify the binding through the static /docs/theming route's rendered tr[data-token] rows and DOCS-ONLY labels rather than looking for an import in the manuscript."}, {"target": "GATE:FLOW-SHELL-01", "found": "The playwright webServer reuse (reuseExistingServer: !process.env.CI) can silently run the flow against a foreign task's preview, bypassing the port guard and invalidating the observed frames.", "change": "Record and verify the owned preview listener (PID/cwd/dist hash) before observation and refuse a listener not owned by the candidate."}, {"target": "GATE:FLOW-SHELL-02", "found": "The same shared-port reuse hazard as FLOW-SHELL-01 was reproduced: the cold-boot flow failed 3/3 against an orphaned ORI-AST-007 preview serving a table-less dist.", "change": "Record and verify the owned preview listener before observing the cold-boot frames and re-run with a genuinely owned preview."}, {"target": "ROADMAP", "found": "Sprint tasks run concurrently and share localhost:4321, and one sibling's run_flow step issues pkill -f astro that can kill a peer's preview mid-run.", "change": "Give each task an owned preview PID/cwd record and either serialize the port or scope the kill to the owning worktree."}], "feedback": []}
```
