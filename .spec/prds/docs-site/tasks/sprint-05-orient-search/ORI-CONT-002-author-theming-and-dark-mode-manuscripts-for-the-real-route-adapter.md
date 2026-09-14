<!-- Template Version: 5.2.0 -->
# ORI-CONT-002: Author Theming and Dark mode manuscripts for the real route adapter

## What this does

Theming and Dark mode manuscripts accurately describe current sources, preserve seam links, and provide one real TokenTable binding for the route adapter.

## Why

The existing route overgeneralizes Uniwind configuration, describes the consumer palette inaccurately and attributes renderMarkdown to Context; it lacks the final authored reference/explanation manuscripts.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts` against actual files. Review source provenance and mutation failures in the owned evidence report. Browser reading and rendered theme proof remain with their named downstream owners.

## Scope

Author only the Theming reference, Dark mode explanation, their task-owned contract test and content-review evidence. Do not change the live route or product behavior.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: techwriting-implementer
> Priority: P1 · Points: 3 · Type: DOCS · Dependency phase: After ORI-AST-001; before ORI-AST-003
> Proposed By: techwriting-planner · Co-authored By: astro-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · Planned: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer
> PROGRESS: No AC started; derived from all TDD_STATE values being none.

### OUTCOME

Theming and Dark mode manuscripts accurately describe current sources, preserve seam links, and provide one real TokenTable binding for the route adapter.

### 🚫 CRITICAL CONSTRAINTS

- Never change product, theme behavior, token source, route adapter or files outside the exact allowlist.
- Never fabricate source claims, palettes, snippets or successful proof; mutations use isolated copies of actual files.
- Never remove the established seam anchors or document renderMarkdown on Context.
- Never conflate Uniwind/Tailwind v4 with NativeWind 4/Tailwind v3 or mislabel the consumer HSL palette.
- Never turn Dark mode into another tutorial or claim manuscript checks prove rendered theme behavior.

### DONE WHEN

- [ ] AC-1: Preserved anchors and accurate rendering interfaces.
- [ ] AC-2: Single token binding and honest palette boundary.
- [ ] AC-3: Engine-scoped facts and source-backed examples.
- [ ] AC-4: Dark mode explanation and bounded handoff.
- [ ] All declared gates pass with actual source-bound evidence and only allowed files changed.

### SPECIFICATION

Correct and author the reference/explanation manuscripts from existing theme and component source. Preserve the current live Theming route while the authored manuscript names its TokenTable render binding. ORI-AST-003 consumes this manuscript, binds the real token table, and publishes the adapted route; final reading and theme proof then runs on that route.

- `apps/docs/src/content/docs/theming.mdx` — reference. Audience: Integrators familiar with CSS custom properties who need the token map and supported rendering interfaces. Reader job: Look up paired token values, engine-specific configuration facts, and the text or markdown extension points. Success: The reader finds light and dark values for the listed tokens and understands which statements apply to Uniwind. Shape: Scope paragraph, source-backed mapping example, complete generated token table, brief interface descriptions with stable anchors.
- `apps/docs/src/content/docs/dark-mode.md` — explanation. Audience: React Native integrators who know light and dark palettes but need to understand ownership and scheme selection. Reader job: Understand the relationship between application theme state, consumer token values, and the docs demonstration. Success: The reader distinguishes consumer theme configuration from the docs site's stored theme choice. Shape: Short explanation, precise engine distinctions, links to Installation, Theming, and verified engine setup references.

Parse the actual authored manuscript and current theme/component sources through the real filesystem. Verify preserved anchors, correct MessageResponse/ReasoningContent renderMarkdown claims, NativeWind/Tailwind distinctions, linked source provenance, and exactly one TokenTable binding. A mutation of a real interface name or anchor must fail. This task proves manuscript/source accuracy, not rendered token values; ORI-AST-003 and ORI-CONT-004 own the later actual rendering and reading proof.

### ACCEPTANCE CRITERIA

This DOCS task owns task-local integration proof, not a locked task flow. Every AC is non-primary. Deliver AC-1 first; do not infer PRIMARY ownership from its position.

#### AC-1: Preserved anchors and accurate rendering interfaces

GIVEN the actual component sources and manuscripts WHEN the contract checks seam descriptions and isolated mutations THEN stable anchors resolve to accurate interfaces and incorrect copies fail.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/theming-manuscript.test.ts
TEST_FUNCTION: ORI-CONT-002-seam-anchors
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-seam-anchors`

SCENARIO:

```json
{"id":"SC-ORI-CONT-002-1","use_case_ref":"UC-DOCS-01","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["The test uses canned interface lists or static success instead of comparing the real manuscript with real source."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Read the real manuscripts, seam-map and component interfaces; compare linked anchor targets and public prop owners.","Copy the actual manuscript into an owned temporary directory and separately remove an anchor and rename a documented interface; run the same contract and require each mismatch to fail."]},"end_state":{"must_observe":["The manuscript declares #textclasscontext and #rendermarkdown and retains `ship no tokens`, `oklch`, `prefers-color-scheme` and `toggle`.","Source-backed prose attributes `renderMarkdown` to `MessageResponse` and `ReasoningContent`, not `Context`, and describes `TextClassContext` without style cascade.","Removing `#rendermarkdown` or renaming `MessageResponse` in isolated copies triggers a failing assertion naming the mismatch."],"must_not_observe":["Empty manuscript or static success report","Context falsely documented as exposing renderMarkdown"]}}]}
```

#### AC-2: Single token binding and honest palette boundary

GIVEN the actual docs and consumer palettes WHEN the contract parses the Theming manuscript THEN one TokenTable binding supplies the palette reference without duplicating numeric values or mislabeling consumer HSL.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/theming-manuscript.test.ts
TEST_FUNCTION: ORI-CONT-002-token-boundary
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-token-boundary`

SCENARIO:

```json
{"id":"SC-ORI-CONT-002-2","use_case_ref":"UC-DOCS-01","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["The parser is disconnected from the manuscript or accepts a placeholder table and duplicated static palette."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Parse actual theming.mdx through the authored MDX contract; compare palette statements with actual docs CSS and consumer CSS/theme files.","Check the render-time binding contract without rendering or substituting TokenTable; test duplicate-binding and copied-palette mutations in isolated real-file copies."]},"end_state":{"must_observe":["The MDX tree contains exactly 1 `TokenTable` render binding and no import of an absent component.","The reference distinguishes docs `oklch` values from existing consumer `HSL` values and marks `code-background` and `code-foreground` as docs-specific.","Adding a second `TokenTable` binding or copying numeric `--primary` palette values triggers a failing assertion."],"must_not_observe":["Empty reference or placeholder token table","A second literal numeric palette or a claim that the consumer already uses oklch"]}}]}
```

#### AC-3: Engine-scoped facts and source-backed examples

GIVEN actual engine configuration files WHEN the contract checks the reference and source mapping example THEN Uniwind and NativeWind facts remain distinct and every example has real source provenance.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/theming-manuscript.test.ts
TEST_FUNCTION: ORI-CONT-002-engine-provenance
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-engine-provenance`

SCENARIO:

```json
{"id":"SC-ORI-CONT-002-3","use_case_ref":"UC-DOCS-01","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["The test accepts a static source label or copied example without resolving the current source file."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Read actual example/global.css, example/lib/theme.ts and harness-nativewind/tailwind.config.js and compare the manuscript's engine-scoped statements.","Resolve each example's file/range provenance against actual bytes; alter the source reference in an isolated manuscript copy and require rejection."]},"end_state":{"must_observe":["The no-`tailwind.config.js` statement applies to `Uniwind` with `Tailwind v4` and `@theme`.","The reference identifies `NativeWind 4` with `Tailwind v3` and its actual configuration path.","The mapping example matches the identified current `@theme` source bytes; altered or missing provenance triggers a failing assertion."],"must_not_observe":["Empty provenance or hand-typed unverified code","A global no-tailwind.config.js claim or NativeWind incorrectly called version 3"]}}]}
```

#### AC-4: Dark mode explanation and bounded handoff

GIVEN the real theme-resolution sources WHEN the contract and reviewer read Dark mode THEN the page explains consumer ownership separately from docs preference and links onward without becoming another tutorial.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/theming-manuscript.test.ts
TEST_FUNCTION: ORI-CONT-002-dark-mode-explanation
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-dark-mode-explanation`

SCENARIO:

```json
{"id":"SC-ORI-CONT-002-4","use_case_ref":"UC-DOCS-01","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["An empty or static generic dark-mode page passes without explaining actual ownership or a disconnected source description is accepted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Read dark-mode.md and the actual DocsLayout/theme-toggle and consumer theme sources; check ownership, resolution statements and onward link targets.","Review quadrant, audience and glossary conformance; record source references and the AST-003/CONT-004 rendering handoff without claiming those later proofs ran."]},"end_state":{"must_observe":["`Dark mode` explains application-owned theme state and consumer tokens separately from the docs site's stored choice.","The docs description follows stored choice, `prefers-color-scheme`, then dark fallback without claiming unverified class behavior.","The manuscript links to `/docs/installation`, `/docs/theming` and source-verified engine setup references; it contains no numbered setup lesson."],"must_not_observe":["Empty explanation, future-tense content shell or duplicated Quickstart tutorial","Manuscript-only evidence presented as rendered toggle or first-paint proof"]}}]}
```

### TEST CRITERIA

- **TC-1** → AC-1: Both seam anchors and correct public prop owners are present, and isolated anchor/interface mutations fail. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-seam-anchors`
- **TC-2** → AC-2: Exactly one TokenTable binding exists, palette ownership is accurate, and duplicate or copied-palette mutations fail. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-token-boundary`
- **TC-3** → AC-3: Engine-specific statements match real configurations, and every mapping example resolves to current source bytes. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-engine-provenance`
- **TC-4** → AC-4: Dark mode explains distinct theme ownership with onward links and no numbered setup lesson or rendered-proof claim. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-dark-mode-explanation`

### FIXTURES

Seed only through the real CLI and filesystem. Temporary mutation copies must derive from actual candidate files, never synthetic stand-ins.

```json
{"candidate_sources":{"description":"Use the assigned candidate after ORI-AST-001. The owned test reads the actual manuscripts and source files through normal filesystem APIs; isolated mutation copies come from those actual files.","seed_method":"cli","records":["Existing /docs/theming source and seam-map targets textclasscontext and rendermarkdown","Actual MessageResponse, ReasoningContent and Context interfaces","Actual docs CSS, consumer HSL palette, Uniwind @theme source and NativeWind Tailwind configuration","Authored theming.mdx and dark-mode.md; missing or empty manuscripts fail"]}}
```

### SCOPE

writeAllowed:

- apps/docs/src/content/docs/theming.mdx
- apps/docs/src/content/docs/dark-mode.md
- tests/sprint-05-orient-search/theming-manuscript.test.ts
- tests/sprint-05-orient-search/evidence/ORI-CONT-002-content-review.md

writeProhibited:

- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/layouts/**
- apps/docs/src/scripts/**
- apps/docs/src/styles/**
- packages/registry/**
- apps/example/**
- apps/harness-nativewind/**
- .spec/**
- .kb-run-sprint/**
- Any path not explicitly listed in write_allowed

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

Always:

- Read current source before making each technical claim; conform both manuscripts to AST-001's validated title, description, section and order frontmatter.
- Keep Theming reference-only and Dark mode explanation-only, each with its declared audience.
- Preserve live route ownership and use the AST-001 render-time component contract.
- Capture actual source hashes, assertions, mutation failures and editorial findings in the owned evidence report.
- Use isolated scratch copies; preserve shared WIP and clean up only owned temporary data.

Ask first:

- Changes to routes, components, dependencies, token sources or engine behavior.
- New prose pages, tutorials, policy files or verification scope beyond this task.

### BOUNDARY CONTRACTS / CAPABILITIES

- Preserve /docs/theming#textclasscontext and /docs/theming#rendermarkdown because generated item pages already link there.
- Preserve the established terms ship no tokens, oklch, prefers-color-scheme, and toggle while correcting inaccurate surrounding claims.
- The numeric token palette has one source. The manuscript names the TokenTable render binding; ORI-AST-003 supplies the real table before rendering. Do not maintain another literal palette.
- Label code-background and code-foreground as docs-specific tokens where appropriate.
- Document renderMarkdown on the actual MessageResponse and ReasoningContent interfaces. Do not repeat the existing incorrect claim that Context exposes that prop.
- Do not describe the existing consumer HSL palette as an already implemented oklch palette.
- Dark mode contains no second tutorial or numbered setup lesson.
- The final docs toggle description must match the implementation that passes the locked theme flows. Current source toggles .light, while the scenarios demand .dark and color-scheme; the Astro workstream owns that behavior correction.

Touches: CAP-DOCS-01.

Provides:

- theming.mdx reference with stable seam anchors, source-backed mapping example and one TokenTable binding
- dark-mode.md explanation of theme ownership and scheme selection
- Task-local real-file contract and source-bound editorial evidence

Consumes:

- ORI-AST-001 authored collection/frontmatter and MDX render-time binding contract
- apps/docs/src/pages/docs/theming.astro
- apps/docs/src/styles/global.css
- apps/docs/src/lib/seam-map.ts
- apps/docs/src/layouts/DocsLayout.astro
- apps/docs/src/scripts/theme-toggle.ts
- apps/example/global.css
- apps/example/lib/theme.ts
- apps/harness-nativewind/tailwind.config.js
- packages/registry/src/components/ai/message.tsx
- packages/registry/src/components/ai/reasoning.tsx
- packages/registry/src/components/ai/context.tsx

PRD references:

- .spec/prds/docs-site/04-uc-docs.md#uc-docs-01-read-the-getting-started-documentation-set
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md

### DELIVERABLE

- apps/docs/src/content/docs/theming.mdx
- apps/docs/src/content/docs/dark-mode.md
- tests/sprint-05-orient-search/theming-manuscript.test.ts
- tests/sprint-05-orient-search/evidence/ORI-CONT-002-content-review.md

All deliverables and evidence are planned outputs, not observed artifacts.

### AGENT INSTRUCTIONS

1. Read the current AC and actual source. Write its real-file test before authoring the manuscript correction. Run its exact selector and capture a functional assertion failure, not an import/setup error.
2. Author the smallest accurate prose change. Run the same selector against actual files and record the observed source-backed values.
3. Refine prose within its quadrant. Rerun the exact selector, the task suite and declared gates. Run isolated mutation controls without touching shared source.
4. After all ACs pass, submit source-bound evidence to techwriting-reviewer. Do not change status, perform trunk lifecycle operations or claim downstream rendering passed.

### READING LIST

1. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md` — lines 1-38 [PRIMARY PATTERN]. Voice, canonical terminology, page boundaries and source-backed examples.
2. `apps/docs/src/pages/docs/theming.astro` — lines 1-93. Existing reader-facing content, stable anchors and inaccurate claims to correct without changing this route.
3. `apps/docs/src/lib/seam-map.ts` — lines 1-54. Existing canonical seam destinations; marker matches do not establish public prop ownership.
4. `packages/registry/src/components/ai/message.tsx` — lines 98-144. MessageResponse prop and plain-text fallback; also inspect reasoning.tsx and context.tsx from source_material.
5. `tests/sprint-04-generated-reference/seam-contract.test.ts` — lines 1-247. Real filesystem assertions; do not copy outdated interface claims or infer runtime coverage.

### DESIGN / REFERENCE GUIDANCE

Use the approved prose shell and render-time component binding. No visual redesign. Preserve heading-derived navigation and stable seam anchors. Cite source examples rather than maintaining another palette.

### CODING STANDARDS

- Google developer style: active voice, short sentences, second person, present tense and one canonical term per concept.
- Use engine, engine tree, registry item, peers and dev client consistently.
- Keep the mapping example extracted from or checked against actual source; no invented install commands or unverified code.
- Use real filesystem and installed parsers under Vitest; no mocked modules, filesystem, HTTP, renderers or skipped assertions.

### VERIFICATION GATES

- AC-1 (integration): `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-seam-anchors` — Exit 0 with observed source-backed values; each mutation control must demonstrate the expected rejection.
- AC-2 (integration): `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-token-boundary` — Exit 0 with observed source-backed values; each mutation control must demonstrate the expected rejection.
- AC-3 (integration): `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-engine-provenance` — Exit 0 with observed source-backed values; each mutation control must demonstrate the expected rejection.
- AC-4 (integration): `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-dark-mode-explanation` — Exit 0 with observed source-backed values; each mutation control must demonstrate the expected rejection.
- task-suite (tests): `pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts` — Exit 0; all task-owned tests execute.
- typecheck (typecheck): `pnpm typecheck` — Exit 0; does not claim apps/example or rendered-docs coverage.
- lint (lint): `pnpm exec biome ci tests/sprint-05-orient-search/theming-manuscript.test.ts` — Exit 0 for the owned TypeScript test.
- scope (scope): `git diff --name-only` — Only explicitly allowed task files change.

No command has run as product verification during planning. The root typecheck does not cover apps; this task's gate proves manuscript/source contracts, not actual rendered token values.

### EVIDENCE GATES

- Record actual failing assertions before authored fixes, not missing-import or dependency errors.
- Capture paths, source hashes, exact commands, exits, observed anchors/interfaces and mutation failures in tests/sprint-05-orient-search/evidence/ORI-CONT-002-content-review.md.
- Keep all evidence marked planned until execution; no flow artifact or canonical RED path ownership transfers to this task.
- After AST-003 publishes the real adapter, CONT-004 performs the locked browser-reading proof; AST-003 owns theme/first-paint proof.

### OUT OF SCOPE

- Rendering TokenTable values, publishing the route adapter or correcting toggle behavior: ORI-AST-003.
- Final browser reading/navigation proof: ORI-CONT-004; visual styling: ORI-VIS tasks.
- Changing consumer palettes, registry components, native applications, transport or provider wiring.
- Another tutorial, deep re-theming guide, full boundary table or new flow.

### CONTEXT

Current gap: The existing route overgeneralizes Uniwind configuration, describes the consumer palette inaccurately and attributes renderMarkdown to Context; it lacks the final authored reference/explanation manuscripts.

Success state: The real-file manuscript contracts and editorial review pass with source-bound evidence; the unchanged route and later rendering owners retain their responsibilities.

### REVIEW

Rationale: techwriting-implementer owns authored reference/explanation and source verification; techwriting-reviewer validates accuracy, quadrant purity and evidence. Astro co-authored the render-time binding and owns its later implementation.

Must pass:

- All acceptance criteria have real-file proof and discriminating mutation evidence.
- Human criteria, flattened requirements and embedded contract match exactly.
- Every claim and example has current-source provenance; Context is not assigned renderMarkdown.
- Boundary and write allowlists remain intact; no route, token or product changes.
- The source-bound report records actual outcomes and clearly separates later rendered proof.

Should verify:

- Theming supports lookup without tutorial detours.
- Dark mode explains ownership in useful prose with precise engine terminology.
- No filler, ambiguous ownership, placeholder content or unsupported technical claim remains.

Reviewer records APPROVED or NEEDS_FIXES with concrete evidence; no verdict is preassigned.

### DEPENDENCIES

Depends on: ORI-AST-001.

Blocks: ORI-AST-003, ORI-CONT-001, ORI-CI-002, ORI-VIS-001, ORI-CONT-004.

Supports FLOW-DOCS-01-theming-and-section-nav at ORI-GATE-02, primary=false; ORI-CONT-004 remains PRIMARY. The existing theme flows remain owned by ORI-AST-003. This task owns no journey_proofs and must not add a dependency on its downstream consumers.

### PROVENANCE

Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/techwriting-planner-absorb-prerequisites.json

Source task: ORI-CONT-002. Co-author: astro-planner. Supersedes: none.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CONT-002","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"candidate_sources":{"description":"Use the assigned candidate after ORI-AST-001. The owned test reads the actual manuscripts and source files through normal filesystem APIs; isolated mutation copies come from those actual files.","seed_method":"cli","records":["Existing /docs/theming source and seam-map targets textclasscontext and rendermarkdown","Actual MessageResponse, ReasoningContent and Context interfaces","Actual docs CSS, consumer HSL palette, Uniwind @theme source and NativeWind Tailwind configuration","Authored theming.mdx and dark-mode.md; missing or empty manuscripts fail"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","title":"Preserved anchors and accurate rendering interfaces","description":"GIVEN the actual component sources and manuscripts WHEN the contract checks seam descriptions and isolated mutations THEN stable anchors resolve to accurate interfaces and incorrect copies fail.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/theming-manuscript.test.ts","test_function":"ORI-CONT-002-seam-anchors","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-seam-anchors","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-002-1","use_case_ref":"UC-DOCS-01","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["The test uses canned interface lists or static success instead of comparing the real manuscript with real source."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Read the real manuscripts, seam-map and component interfaces; compare linked anchor targets and public prop owners.","Copy the actual manuscript into an owned temporary directory and separately remove an anchor and rename a documented interface; run the same contract and require each mismatch to fail."]},"end_state":{"must_observe":["The manuscript declares #textclasscontext and #rendermarkdown and retains `ship no tokens`, `oklch`, `prefers-color-scheme` and `toggle`.","Source-backed prose attributes `renderMarkdown` to `MessageResponse` and `ReasoningContent`, not `Context`, and describes `TextClassContext` without style cascade.","Removing `#rendermarkdown` or renaming `MessageResponse` in isolated copies triggers a failing assertion naming the mismatch."],"must_not_observe":["Empty manuscript or static success report","Context falsely documented as exposing renderMarkdown"]}}]}},{"id":"AC-2","type":"acceptance_criterion","title":"Single token binding and honest palette boundary","description":"GIVEN the actual docs and consumer palettes WHEN the contract parses the Theming manuscript THEN one TokenTable binding supplies the palette reference without duplicating numeric values or mislabeling consumer HSL.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/theming-manuscript.test.ts","test_function":"ORI-CONT-002-token-boundary","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-token-boundary","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-002-2","use_case_ref":"UC-DOCS-01","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["The parser is disconnected from the manuscript or accepts a placeholder table and duplicated static palette."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Parse actual theming.mdx through the authored MDX contract; compare palette statements with actual docs CSS and consumer CSS/theme files.","Check the render-time binding contract without rendering or substituting TokenTable; test duplicate-binding and copied-palette mutations in isolated real-file copies."]},"end_state":{"must_observe":["The MDX tree contains exactly 1 `TokenTable` render binding and no import of an absent component.","The reference distinguishes docs `oklch` values from existing consumer `HSL` values and marks `code-background` and `code-foreground` as docs-specific.","Adding a second `TokenTable` binding or copying numeric `--primary` palette values triggers a failing assertion."],"must_not_observe":["Empty reference or placeholder token table","A second literal numeric palette or a claim that the consumer already uses oklch"]}}]}},{"id":"AC-3","type":"acceptance_criterion","title":"Engine-scoped facts and source-backed examples","description":"GIVEN actual engine configuration files WHEN the contract checks the reference and source mapping example THEN Uniwind and NativeWind facts remain distinct and every example has real source provenance.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/theming-manuscript.test.ts","test_function":"ORI-CONT-002-engine-provenance","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-engine-provenance","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-002-3","use_case_ref":"UC-DOCS-01","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["The test accepts a static source label or copied example without resolving the current source file."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Read actual example/global.css, example/lib/theme.ts and harness-nativewind/tailwind.config.js and compare the manuscript's engine-scoped statements.","Resolve each example's file/range provenance against actual bytes; alter the source reference in an isolated manuscript copy and require rejection."]},"end_state":{"must_observe":["The no-`tailwind.config.js` statement applies to `Uniwind` with `Tailwind v4` and `@theme`.","The reference identifies `NativeWind 4` with `Tailwind v3` and its actual configuration path.","The mapping example matches the identified current `@theme` source bytes; altered or missing provenance triggers a failing assertion."],"must_not_observe":["Empty provenance or hand-typed unverified code","A global no-tailwind.config.js claim or NativeWind incorrectly called version 3"]}}]}},{"id":"AC-4","type":"acceptance_criterion","title":"Dark mode explanation and bounded handoff","description":"GIVEN the real theme-resolution sources WHEN the contract and reviewer read Dark mode THEN the page explains consumer ownership separately from docs preference and links onward without becoming another tutorial.","primary":false,"flow_ref":null,"test_file":"tests/sprint-05-orient-search/theming-manuscript.test.ts","test_function":"ORI-CONT-002-dark-mode-explanation","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-dark-mode-explanation","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CONT-002-4","use_case_ref":"UC-DOCS-01","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, authored Markdown/MDX parser, and current theme and React Native component sources","negative_control":{"would_fail_if":["An empty or static generic dark-mode page passes without explaining actual ownership or a disconnected source description is accepted."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"candidate_sources","action":{"actor":"cli_user","steps":["Read dark-mode.md and the actual DocsLayout/theme-toggle and consumer theme sources; check ownership, resolution statements and onward link targets.","Review quadrant, audience and glossary conformance; record source references and the AST-003/CONT-004 rendering handoff without claiming those later proofs ran."]},"end_state":{"must_observe":["`Dark mode` explains application-owned theme state and consumer tokens separately from the docs site's stored choice.","The docs description follows stored choice, `prefers-color-scheme`, then dark fallback without claiming unverified class behavior.","The manuscript links to `/docs/installation`, `/docs/theming` and source-verified engine setup references; it contains no numbered setup lesson."],"must_not_observe":["Empty explanation, future-tense content shell or duplicated Quickstart tutorial","Manuscript-only evidence presented as rendered toggle or first-paint proof"]}}]}},{"id":"TC-1","type":"test_criterion","description":"Both seam anchors and correct public prop owners are present, and isolated anchor/interface mutations fail.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-seam-anchors","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Exactly one TokenTable binding exists, palette ownership is accurate, and duplicate or copied-palette mutations fail.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-token-boundary","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Engine-specific statements match real configurations, and every mapping example resolves to current source bytes.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-engine-provenance","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Dark mode explains distinct theme ownership with onward links and no numbered setup lesson or rendered-proof claim.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/theming-manuscript.test.ts -t ORI-CONT-002-dark-mode-explanation","maps_to_ac":"AC-4"}]}
-->
</details>
