## What this does

Render validated authored documentation through the static Astro collection, shared prose shell, generated navigation, and build-time code rendering. Preserve source bytes when readers copy code.

## Why

The existing site has a shared shell and a real Theming route, but lacks the authored collection and prose routing contract. CopyButton currently trims the rendered source before copying, which removes meaningful boundary whitespace.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts`. The suite must exercise the real collection loader, Astro build, served HTML, browser navigation, and system clipboard. Final rendered-page verification requires the actual content supplied by ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, and ORI-CONT-005.

## Scope

Keep the original task's collection, routing, semantic components, MDX, and Expressive Code scope. The sole authorized correction adds `apps/docs/src/scripts/copy-button.ts` and permits removing its copy-payload trim, with the corresponding comment correction. Keep the existing task ID, title, five points, dependency, roles, test file, controls, and other product behavior.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-AST-001: Render authored documentation through the Astro collection and prose shell

> Status: ✅ Completed

Commit: 1122612054035572750de08dc07785c6f179ed38
- Assignee: astro-implementer
- Priority: P1
- Points: 5
- Type: BUILD
- Dependency phase: after ORI-DEP-001; before collection consumers
- Proposed By: astro-planner
- Co-authored By: []
- AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer
- TDD_MODE: red_first
- RED_GREEN_REQUIRED: true
- Sprint: [SPRINT.md](./SPRINT.md)
- Planned date: 2026-09-14
- Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
- PROGRESS: Not started; AC-1 through AC-4 have TDD_STATE none.

## OUTCOME

Published authored docs render through one validated static collection with working navigation, heading destinations, metadata, themed code, and byte-exact copying.

## CRITICAL CONSTRAINTS

1. Preserve shared WIP and the exact write scope. The new CopyButton permission covers only removing copy-payload trimming and correcting its associated comment; it does not authorize a control rewrite.
2. Use real filesystem inputs, the actual Astro loader/build, real HTTP, a real browser, and its clipboard. No mock renderer, request interception, injected views, synthetic success, or runtime skips can satisfy acceptance.
3. Keep the existing static /docs/theming route and exclude its destination from catch-all generation. Do not import an absent TokenTable or render the authored Theming manuscript without its real adapter binding.
4. Keep static output, the existing theme mechanism, and the established island allocation. Do not add an adapter, framework island, second clipboard implementation, or manuscript/design work owned by another task.
5. Preserve displayed and copied source without trim, normalization, truncation, or sentinel characters. Preserve CopyButton labels, status transitions, error handling, reset timing, registration, and plain-text fallback.

## DONE WHEN

- [ ] AC-1: the real loader validates the declared frontmatter and rejects invalid source inputs with useful diagnostics.
- [ ] AC-2: published destinations are unique, drafts are excluded, and the static Theming route remains authoritative.
- [ ] AC-3: the actual authored pages render substantive bodies, metadata, source edit links, section navigation, and valid heading destinations.
- [ ] AC-4: real MDX/code rendering follows the site theme and the real clipboard equals unnormalized displayed source, including terminal newlines.
- [ ] All declared verification gates pass with current-source evidence, only allowed source files change, and final manuscript-dependent proof is complete.

## SPECIFICATION

Define the glob-loaded docs collection with title, description, section=getting-started|guides|porting, order, and optional draft. Render published getting-started entries through a static [...id].astro route and MarkdownLayout. This includes the real owns-vs-does-not-own entry supplied by ORI-CONT-005. Preserve the existing static theming route until ORI-AST-003 adapts it; exclude its slug from dynamic generation. Exclude drafts from routes, section navigation, and search input. Create functional PageHeader, Toc, and Prose markup contracts; frontend-designer owns their visual treatment afterward. Add generated section navigation, heading-derived fragment links, metadata, and source edit links. Use Astro-compatible MDX and build-time Expressive Code. Keep the site static, without an adapter or framework island. Map both code themes to the actual site theme mechanism, preserve byte-exact displayed/copied source, and reuse CopyButton rather than introducing an additional client control implementation.

Authorized correction: remove the `.trim()` applied to the copy payload in `apps/docs/src/scripts/copy-button.ts`, retaining `command.textContent ?? ''` as the clipboard value. Update the adjacent trimming comment. Do not change the separate button-label trim or any other control behavior. Prove this correction in the existing task-owned test file using actual rendered source with boundary whitespace and the real clipboard.

## BOUNDARY CONTRACTS

- Authored frontmatter becomes validated collection data before routing or indexing.
- Published content produces a real static route; a missing required manuscript is a gate failure.
- The boundary entry belongs to getting-started and has exactly one canonical route.
- PageHeader receives title and description; Toc receives depth, slug, and text; Prose wraps real rendered article content.
- Astro owns semantic components first; frontend styling depends on this task.
- The existing theming route continues serving real content until its explicit adapter migration.
- Provide the authored MDX rendering contract before manuscripts: stable heading extraction and component binding at render time. Keep the real existing /docs/theming static route and exclude its collection entry from the catch-all until ORI-AST-003 adapts that route; never emit duplicate destinations. Theming may name the real TokenTable component without importing an absent file; the route adapter must bind the real component before rendering that manuscript.
- The authorized CopyButton change removes copy-payload trimming only. Preserve all existing control behavior and verify raw clipboard equality in docs-collection.test.ts.

## FIXTURES

Fixtures are real source inputs consumed through the normal production loader/build. Scratch copies are created through the operating-system temporary-directory API and contain actual source documents; they never inject rendered markup or replace a required final manuscript.

```json
{"collection_source":{"description":"An owned scratch copy of the actual docs application and its dependencies. Copy the substantive body of apps/example/README.md into scratch-only collection-reference.md and collection-reference-mdx.mdx, with valid title, description, section=getting-started, and numeric order frontmatter. Preserve the source body and record its hash. These entries prove collection mechanics only; they are never published as Introduction or another required manuscript.","seed_method":"cli","records":["Actual README title: AI Elements Example; headings: Structure and Run.","Two real source-backed collection entries with distinct IDs, order 1 and 2, and omitted draft fields.","The actual static apps/docs/src/pages/docs/theming.astro remains in the copied application."]},"published_manuscripts":{"description":"The actual reviewed content supplied by ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, and ORI-CONT-005, read from the candidate and built through production entrypoints. Missing required source fails verification; scratch collection-reference entries cannot substitute.","seed_method":"cli","records":["Introduction, Installation, CLI, Dark mode, Quickstart, and owns-vs-does-not-own manuscripts under apps/docs/src/content/docs/.","Theming manuscript is supplied by ORI-CONT-002; its destination stays on the existing static route until ORI-AST-003 binds the real TokenTable.","Actual titles, descriptions, sections, order values, heading text, source paths, and body hashes are recorded before rendering."]},"built_code_sources":{"description":"Actual registry artifacts and authored code rendered by the candidate's real build. Fetch served registry JSON from the owned preview and retain original content strings as the byte oracle. No clipboard values or code nodes are injected.","seed_method":"cli","records":["The real conversation registry source includes a terminal newline U+000A.","The existing /components/conversation page renders source through CodeBlock and rnr-copy-button.","Real MDX uses the production component bindings and build-time code renderer; theme changes use the existing header control."]}}
```

## ACCEPTANCE CRITERIA

### AC-1: Validate collection frontmatter through the real loader

GIVEN actual source-backed Markdown and MDX entries WHEN the production collection loader builds valid and invalid copies THEN valid entries render and invalid frontmatter fails with the source ID and offending field.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real filesystem, installed Astro collection loader, and actual Astro build subprocesses
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/docs-collection.test.ts
TEST_FUNCTION: ORI-AST-001-collection-schema
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-collection-schema
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, installed Astro collection loader, and actual Astro build subprocesses","negative_control":{"would_fail_if":["The loader is disconnected from source files or schema validation is a no-op.","A static success receipt replaces the real build or invalid frontmatter is silently accepted."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["Run the actual Astro build over the two source-backed entries and inspect the emitted article content.","Repeat valid section values getting-started, guides, and porting through isolated source copies; accept omitted draft and boolean draft values without inventing additional routes."]},"end_state":{"must_observe":["The valid getting-started build emits 2 distinct collection-reference documents containing `AI Elements Example`, `Structure`, and `Run`.","All 3 declared section values pass the real collection schema."],"must_not_observe":["An empty article or shell-only response standing in for the copied source body."]}},{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["In separate owned copies, remove title, description, section, or order; then test an unknown section, nonnumeric order, and nonboolean draft.","Run the identical real build for every case, capture the targeted diagnostic, restore the valid source, and rebuild."]},"end_state":{"must_observe":["All 7 invalid-frontmatter builds exit with status != 0; each diagnostic names the mutated source ID and the offending field (`title`, `description`, `section`, `order`, or `draft`).","The restored valid build exits 0 and emits the `AI Elements Example` article."],"must_not_observe":["Exit 0 for invalid frontmatter, empty diagnostics, or an unrelated setup error counted as schema rejection."]}}]}
```

### AC-2: Publish unique routes and exclude drafts

GIVEN validated collection entries and the existing Theming route WHEN publication state or destination identity changes in real source copies THEN routes, navigation, and search input agree, duplicates fail, and Theming retains one canonical destination.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real Astro build, emitted static documents, and production documentation navigation and publication helpers
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/docs-collection.test.ts
TEST_FUNCTION: ORI-AST-001-publication-contract
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-publication-contract
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro build, emitted static documents, and production documentation navigation and publication helpers","negative_control":{"would_fail_if":["Draft filtering is disconnected between route generation, navigation, and search input.","Duplicate destinations overwrite each other silently or a static shell replaces the existing Theming content."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["Build both published entries, then set the second actual source copy to draft:true and rebuild from fresh output.","Inspect emitted routes, section navigation, and the production published-entry input intended for search; then restore draft:false and rebuild.","Add an isolated collection copy with the theming ID and verify that catch-all generation excludes that reserved destination."]},"end_state":{"must_observe":["Published collection-reference document counts change from 2 to 1 to 2 as the real draft flag changes.","With `draft:true`, the `collection-reference-mdx` ID has 0 emitted routes, 0 section-navigation entries, and 0 entries in the production search input.","Exactly 1 `/docs/theming` destination remains, with the existing `textclasscontext` and `rendermarkdown` anchors."],"must_not_observe":["A stale draft route or navigation entry, an empty Theming shell, or a second Theming destination."]}},{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["Create two real source copies whose production IDs resolve to the same published destination and run the actual build.","Capture the collision diagnostic, remove only the owned duplicate copy, and rebuild."]},"end_state":{"must_observe":["The colliding build exits with status != 0 and its diagnostic identifies the exact duplicate destination and both (2) source paths recorded for the collision input.","The restored build emits the 2 distinct collection-reference destinations."],"must_not_observe":["A last-writer winner, silent source omission, or an empty collision report."]}}]}
```

### AC-3: Render real prose, navigation, metadata, and heading destinations

GIVEN the actual required manuscripts WHEN a reader opens the built pages and follows section and heading links THEN source-derived content, metadata, edit links, and destinations remain correct with and without JavaScript.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real authored manuscripts, built Astro preview at http://localhost:4321, HTTP responses, and actual Playwright browsers
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/docs-collection.test.ts
TEST_FUNCTION: ORI-AST-001-prose-navigation
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-prose-navigation
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real authored manuscripts, built Astro preview at http://localhost:4321, HTTP responses, and actual Playwright browsers","negative_control":{"would_fail_if":["Prose is a static shell disconnected from the manuscript or navigation uses a fabricated destination list.","Heading links target absent IDs, metadata comes from another page, or a missing required manuscript is replaced with placeholder content."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"published_manuscripts","action":{"actor":"user","steps":["Build and serve the current candidate on the owned localhost:4321 preview; use actual desktop, mobile, and JavaScript-disabled browser contexts.","Open Introduction, Installation, CLI, Dark mode, Quickstart, and owns-vs-does-not-own; compare each rendered article, title, and description with its actual source.","Follow Getting started links and heading-derived fragment links; inspect the target heading text and ID, active page, ordering, and source edit destination.","Visit the existing Theming route and follow its two preserved seam anchors without creating a second route."]},"end_state":{"must_observe":["All 6 named authored destinations return HTTP 200 with matching substantive article content and exactly 1 page-title h1 each.","The Getting started navigation reaches `/docs/cli`, `/docs/dark-mode`, and exactly 1 canonical `/docs/owns-vs-does-not-own` destination.","Across all 6 authored pages, every Toc link resolves to exactly 1 heading with the source-derived ID and text, with 0 unresolved fragments; each page's metadata title and description equal its recorded frontmatter values, and its edit URL identifies that manuscript's recorded path under `apps/docs/src/content/docs/`.","With `javaScriptEnabled:false`, all 6 authored pages retain the same complete source-derived readable article bodies, and every ordinary section and heading link reaches its expected HTTP 200 page or exactly 1 matching fragment target."],"must_not_observe":["Empty Prose output, shell-only keyword matches, missing heading targets, draft links, or edit links to generated dist files."]}},{"start_ref":"published_manuscripts","action":{"actor":"cli_user","steps":["Remove one required manuscript in an isolated real source copy and run this rendered-page verification.","Separately break a real heading destination in an isolated copy and repeat verification; restore each source and rebuild before the positive rerun."]},"end_state":{"must_observe":["Both (2) negative verification runs exit with status != 0: the missing-manuscript diagnostic contains the exact removed required path under `apps/docs/src/content/docs/`, and the broken-heading diagnostic contains the exact mutated page URL and unresolved fragment recorded for that input.","After restoration, the same verification reaches the actual `/docs/cli` article and resolves its heading destinations."],"must_not_observe":["A passing skip, placeholder replacement, empty failure evidence, or a stale build accepted after source mutation."]}}]}
```

### AC-4: Render themed MDX and copy exact source bytes

GIVEN real authored code and served registry source WHEN the real build renders code and the reader changes theme and activates CopyButton THEN displayed and clipboard bytes match the original source without changing the existing control behavior.

PRIMARY: false
FLOW_REF: null
TEST_TIER: e2e
VERIFICATION_SERVICE: Real Astro MDX and Expressive Code build, localhost:4321 preview, actual Playwright browser, served registry JSON, and system clipboard
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/docs-collection.test.ts
TEST_FUNCTION: ORI-AST-001-mdx-code-copy
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-mdx-code-copy
MAPS_TO_AC: null

SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro MDX and Expressive Code build, localhost:4321 preview, actual Playwright browser, served registry JSON, and system clipboard","negative_control":{"would_fail_if":["CopyButton trims source, copies a canned value, or reads a different code block.","MDX component binding is disconnected, code is constructed only after load, or code themes ignore the actual root theme."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_code_sources","action":{"actor":"user","steps":["Fetch actual conversation registry JSON from the owned preview and navigate to `/components/conversation`.","Compare the rendered code text with the original served content string, activate its actual CopyButton, and read the real clipboard without normalization.","Repeat using a source-backed multiline code input containing boundary whitespace in an isolated collection copy built through the normal code-rendering path; do not inject DOM or clipboard state.","Copy an existing ordinary install command and observe its existing Copied status and idle reset."]},"end_state":{"must_observe":["Conversation source text and clipboard content equal the original served content exactly, including terminal newline U+000A.","The displayed and copied multiline values each equal the original source-backed input byte for byte, with 0 differing bytes and identical SHA-256 hashes; both preserve the recorded leading whitespace and terminal newline U+000A.","The ordinary install command remains byte-identical and the existing `Copied` status returns to the original idle label."],"must_not_observe":["Trimmed text, added sentinel characters, empty clipboard content, another block's source, or a second copy control implementation."]}},{"start_ref":"built_code_sources","action":{"actor":"user","steps":["Open the actual built MDX article and inspect its production component bindings and initial code HTML.","Use the existing header theme control to select both themes and inspect computed code colors against the actual site tokens.","Read the article in a JavaScript-disabled context and verify complete selectable code text.","In an isolated source copy restore only the old copy-payload trim, rebuild, and require the same terminal-newline clipboard assertion to fail; restore the corrected source and rerun."]},"end_state":{"must_observe":["The initial HTTP 200 document contains the complete source-derived MDX component content and build-time highlighted code, with 0 missing bound-component outputs and 0 framework hydration boundaries for that content.","In both (2) theme states selected through the existing header control, computed code colors equal the corresponding site-token values for the actual root theme, and the source text has 0 differing bytes and the same SHA-256 hash before and after each change.","With `javaScriptEnabled:false`, the complete selectable code equals the original source with 0 differing bytes; restoring the old payload trim makes the same clipboard assertion fail on the missing terminal U+000A with status != 0, and restoring the correction makes that assertion pass with status 0."],"must_not_observe":["An absent-component import concealed by a stub, client-only article content, an empty code surface, or a passing clipboard assertion with the old payload trim."]}}]}
```

## TEST CRITERIA

- TC-1: Valid source-backed entries render; each invalid frontmatter case fails with its source ID and field. MAPS_TO_AC: AC-1. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-collection-schema`.
- TC-2: Publication changes produce route counts 2, 1, and 2; drafts disappear from every publication consumer and duplicate destinations fail. MAPS_TO_AC: AC-2. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-publication-contract`.
- TC-3: All six required authored destinations contain their source-derived content and valid navigation, metadata, edit links, and heading targets; missing sources fail. MAPS_TO_AC: AC-3. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-prose-navigation`.
- TC-4: Actual clipboard content equals unnormalized displayed source, including boundary whitespace; MDX and both code themes render through the real build. MAPS_TO_AC: AC-4. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-mdx-code-copy`.

## SCOPE

Repository source write permissions are exact. Runtime build and mutation outputs belong in owned scratch copies; they do not authorize additional repository edits.

writeAllowed:

- apps/docs/package.json
- pnpm-lock.yaml
- apps/docs/astro.config.mjs
- apps/docs/src/content.config.ts
- apps/docs/src/lib/docs-navigation.ts
- apps/docs/src/layouts/MarkdownLayout.astro
- apps/docs/src/layouts/DocsLayout.astro
- apps/docs/src/pages/docs/[...id].astro
- apps/docs/src/components/Header.astro
- apps/docs/src/components/PageHeader.astro
- apps/docs/src/components/Toc.astro
- apps/docs/src/components/Prose.astro
- apps/docs/src/components/CodeBlock.astro
- tests/sprint-05-orient-search/docs-collection.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-001/manifest.json
- apps/docs/src/scripts/copy-button.ts

writeProhibited:

- packages/registry/**
- public/r/**
- apps/example/**
- apps/harness/**
- apps/harness-nativewind/**
- apps/docs/src/content/**
- apps/docs/src/pages/docs/theming.astro
- apps/docs/src/components/islands/**
- apps/docs/src/scripts/theme-toggle.ts
- apps/docs/src/scripts/tab-group.ts
- scripts/docs-data/**
- .github/**
- .spec/**
- Any repository file not explicitly listed in writeAllowed.

## BOUNDARIES

Always:

- Validate collection data before deriving published routes, navigation, or search input; retain deterministic ordering and collision diagnostics.
- Compose the existing DocsLayout, Header, CodeBlock, and CopyButton contracts; expose real PageHeader, Toc, and Prose semantics for later styling.
- Serialize package and lockfile writes after ORI-DEP-001 and before ORI-AI-001; preserve unrelated dependency changes.
- Record actual source identities, commands, diagnostics, browser observations, clipboard bytes, and owned-process teardown.
- Keep collection-shell handoff separate from final manuscript-dependent acceptance; absent required content remains an explicit verification blocker.

Ask first:

- Any source-path expansion beyond the authorized copy-button.ts addition.
- Any dependency beyond the scoped Astro-compatible MDX and Expressive Code requirements, or an unrelated version change.
- Any change to manuscript ownership, theme/engine state, flow ownership, or the existing Theming adapter boundary.

## DELIVERABLES

1. `apps/docs/package.json`, `pnpm-lock.yaml`, and `apps/docs/astro.config.mjs`: compatible build-time MDX/code integration with static output retained.
2. `apps/docs/src/content.config.ts` and `apps/docs/src/lib/docs-navigation.ts`: validated collection, publication filtering, unique destinations, and source-derived navigation.
3. `apps/docs/src/layouts/MarkdownLayout.astro`, `apps/docs/src/layouts/DocsLayout.astro`, `apps/docs/src/pages/docs/[...id].astro`, `Header.astro`, `PageHeader.astro`, `Toc.astro`, and `Prose.astro`: shared semantic authored-document rendering.
4. `apps/docs/src/components/CodeBlock.astro` and `apps/docs/src/scripts/copy-button.ts`: build-time code rendering and the narrowly corrected raw clipboard payload.
5. `tests/sprint-05-orient-search/docs-collection.test.ts` and its planned `evidence/ORI-AST-001/manifest.json`: real loader/build/browser/clipboard proof with source-bound observations.

## AGENT INSTRUCTIONS

For each acceptance criterion, author the named test in the existing task-owned test file, capture its actual behavioral RED, implement the minimum correction, and rerun the identical selector for GREEN. Refactor only within the permitted scope and rerun the affected selector plus the complete task command. Missing dependencies, an absent test, zero selected tests, or a missing preview do not count as behavioral RED.

Vitest may orchestrate actual Astro subprocesses and the installed Playwright browser API from this test file. It must not render Astro through a mock DOM. Start and stop the owned preview using the repository's strict localhost:4321 contract, grant real clipboard permissions, and close contexts and child processes in finally handling. Use separate real filesystem copies for mutations and preserve their input/output identities.

For AC-4, first prove the existing trim loses the terminal newline using the current actual source and clipboard. Remove only the payload trim and correct its comment. Keep the separate label trim, registration guards, event binding, status/error handling, reset timer, and readable no-JavaScript text unchanged. Use the real denied clipboard permission state if exercising its existing error path; do not replace clipboard APIs.

The collection contract can be handed to its content consumers after focused implementation proof. That handoff is not final rendered-page acceptance. AC-3 and the final authored MDX portion of AC-4 require the actual manuscripts; never skip them or publish scratch reference entries under required page IDs. The existing Theming route stays live until ORI-AST-003 performs its named adapter migration.

## READING LIST

1. `apps/docs/src/layouts/DocsLayout.astro`, lines 19–68 — PRIMARY PATTERN: props, shared shell, head slot, pre-paint theme mechanism, and anchored-heading clearance.
2. `apps/docs/src/scripts/copy-button.ts`, lines 20–45 — payload trimming and the adjacent behavior that must remain intact.
3. `.spec/prds/docs-site/11-technical-requirements/03-data-schema.md` — docs_page schema and collection ownership.
4. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md` — markdown page composition, zero-JavaScript floor, existing tokens, and island allocation.
5. `tests/sprint-04-generated-reference/code-view-byte-identical-to-shipped-source.spec.ts` — real served-source comparison; extend the principle to actual clipboard bytes without normalizing either side.

## DESIGN AND REFERENCE GUIDANCE

Astro owns semantic markup and component binding; frontend-designer owns subsequent visual treatment. Reuse the existing token vocabulary, heading clearance, and ordinary details/navigation controls. Keep the home layout variant intact. PageHeader accepts title and description; Toc receives real depth/slug/text records; Prose contains the rendered article. Do not add future Guides, Porting, changelog, or recovery-page scope merely because the collection schema admits their section values.

Resolve integration APIs against the installed Astro version and official documentation before implementation: [Astro content collections](https://docs.astro.build/en/guides/content-collections/) and [Expressive Code syntax highlighting](https://expressive-code.com/key-features/syntax-highlighting/). These references do not authorize dependency upgrades or client-side code rendering.

## CODING STANDARDS

- Use strict TypeScript and the installed Astro compiler; validate source metadata deterministically and report actionable source paths.
- Keep build-only dependencies outside the client graph. Do not install React Native registry components or web AI Elements packages into the docs application.
- Use valid semantic HTML, existing CSS tokens, accessible navigation names, real heading IDs, and readable no-JavaScript content.
- Compare unnormalized source strings and clipboard values. Do not trim either oracle to make a test pass.
- Keep scratch roots, processes, evidence, and mutation restoration explicitly owned; never stash, reset, clean, or broadly stage shared WIP.

## VERIFICATION GATES

All commands below are planned execution commands, not completed results.

- Task suite: `pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts`.
- Root typecheck: `pnpm typecheck`.
- Root lint: `pnpm lint`.
- Token and contract checks: `pnpm check:tokens` and `pnpm check:contract`.
- In the owned build candidate, explicitly execute `pnpm registry:build`, then `pnpm gallery:manifest`, then `pnpm --filter @rnr-ai-elements/docs run prebuild`, then `pnpm --filter @rnr-ai-elements/docs exec astro build`. Do not rely on implicit lifecycle invocation. ORI-CI-002 owns the later complete public build chain.
- Run the named AC selectors for source-bound RED/GREEN and the complete task suite after the required manuscripts are available. All required checks must exit 0 for acceptance; targeted negative cases must fail for their intended reason and pass after restoration.
- Preserve existing applicable docs lanes, especially served-source and install-copy behavior. Their existing proof files are read-only here; any required repair outside this task returns to its owner.
- `git diff --name-only` must contain only the allowed source paths. Generated build output and evidence outside the explicit repository evidence file stay in owned scratch storage.

## EVIDENCE GATES

1. Capture actual behavioral RED and GREEN for each named selector, including source, lockfile, test, policy, and command identities. Record inherited green clauses honestly.
2. Record schema diagnostics, route/publication counts, duplicate-source diagnostics, source/body hashes, metadata, and resolved heading destinations. Exit codes alone are insufficient.
3. Capture real browser observations and clipboard values, including escaped boundary whitespace and lengths; retain traces or screenshots in owned scratch storage and hash-reference them from the planned manifest.
4. Verify restored source/build identities after every mutation and record preview/browser teardown. Missing manuscripts, stale artifacts, missing targets, or skipped cases prevent acceptance.
5. The orchestrator validates Requirement Contract/Scenario Contract parity and the complete sprint flow map. ORI-AST-001 owns no PRIMARY locked flow and no journey. The sole supported locked task flow is FLOW-DOCS-01-getting-started-engine-decision at gate step 1, whose PRIMARY owner remains ORI-CONT-004.

Planned repository evidence: `tests/sprint-05-orient-search/evidence/ORI-AST-001/manifest.json`. Store the task's actual RED output and observations in that manifest or in hash-referenced owned scratch artifacts. Do not invent additional repository evidence paths. The supported flow's canonical RED remains `tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red`, owned by ORI-CONT-004.

## CONTEXT AND DEPENDENCIES

Current state: the real shared shell, CodeBlock, CopyButton, and static Theming route exist. The authored collection, catch-all route, and prose components are absent in the inspected source. CopyButton trims its payload. Planned manuscripts and evidence are not claimed to exist.

Depends on: ORI-DEP-001.

Blocks: ORI-AST-002, ORI-CONT-002, ORI-AST-003, ORI-AST-005, ORI-CONT-005, ORI-CONT-001, ORI-AI-001, ORI-CONT-003, ORI-AST-004, ORI-AST-006, ORI-AST-009, ORI-CI-001, ORI-CI-002, ORI-VIS-001.

Provides: validated authored collection and publication contract; static prose route/layout and semantic component interfaces; heading/navigation/metadata/edit-link derivation; real MDX binding and themed code rendering; byte-exact copying through the existing CopyButton.

Consumes: ORI-DEP-001's prerequisite candidate and serialized dependency boundary; the existing shell, tokens, CopyButton, registry data, and preview harness; actual manuscripts from ORI-CONT-001/002/003/005 for final page verification. ORI-AST-003 supplies the later real TokenTable route binding. These manuscript verification prerequisites do not add or reverse scheduling dependencies.

Capability: CAP-DOCS-01.

PRD references: `.spec/prds/docs-site/04-uc-docs.md` (UC-DOCS-01 and enabling UC-DOCS-02/current boundary slice); `.spec/prds/docs-site/11-technical-requirements/03-data-schema.md`; `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md`; `.spec/prds/docs-site/11-technical-requirements/10-routing.md`; `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md` (CAP-DOCS-01).

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json`, source task ORI-AST-001. Co-author provenance remains []. The copy correction is explicitly user-authorized on 2026-09-14.

## AGENT RATIONALE AND REVIEW

astro-planner defines the static content/routing contract. astro-implementer owns the collection, rendering integration, and narrow existing-script correction. astro-reviewer independently verifies real loader/build/browser behavior and scope. Visual treatment remains with frontend-designer's existing downstream tasks.

Must pass:

- Every AC has its exact named test, full scenario, source-bound evidence, and matching human/machine proof fields.
- Invalid frontmatter and duplicate destinations fail through actual execution; drafts and reserved Theming routing are consistent.
- Actual required manuscripts render with valid navigation, heading targets, metadata, and edit links; missing content never passes as a shell.
- Clipboard bytes equal original displayed source, including whitespace; only the payload trim and its comment change in copy-button.ts.
- Static output, existing control behavior, allowed paths, and flow ownership are preserved.

Should verify:

- Semantic markup is suitable for downstream visual treatment without imposing new state or islands.
- MDX component binding cannot hide absent components or create a second Theming route.
- Evidence distinguishes shell handoff, final manuscript verification, and complete sprint acceptance.

Review verdict: APPROVED or NEEDS_FIXES, with actionable file/line evidence for each failure. No review has run in this planning response.

## OUT OF SCOPE

- CopyButton redesign, new controls, changes to labels/status/reset/error behavior, or any clipboard transformation beyond removal of payload trimming.
- Authored manuscript writing, full ownership tables/gap inventory, visual styling, engine persistence, ClientRouter implementation, or TokenTable migration.
- Pagefind indexing/dialog behavior, custom 404, source-snippet enforcement, tutorial cardinality enforcement, and complete build/CI orchestration owned by other tasks.
- Native consumers, provider integration, registry changes, deployment, and any change to the locked gate, entrypoint, flows, or PRIMARY owners.

## FIXED SPRINT CONTRACT

Gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The sprint retains 13 flows: nine task flows and four journeys. This task returns no journey proofs. The supporting flow keeps its exact command: `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-001","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"collection_source":{"description":"An owned scratch copy of the actual docs application and its dependencies. Copy the substantive body of apps/example/README.md into scratch-only collection-reference.md and collection-reference-mdx.mdx, with valid title, description, section=getting-started, and numeric order frontmatter. Preserve the source body and record its hash. These entries prove collection mechanics only; they are never published as Introduction or another required manuscript.","seed_method":"cli","records":["Actual README title: AI Elements Example; headings: Structure and Run.","Two real source-backed collection entries with distinct IDs, order 1 and 2, and omitted draft fields.","The actual static apps/docs/src/pages/docs/theming.astro remains in the copied application."]},"published_manuscripts":{"description":"The actual reviewed content supplied by ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, and ORI-CONT-005, read from the candidate and built through production entrypoints. Missing required source fails verification; scratch collection-reference entries cannot substitute.","seed_method":"cli","records":["Introduction, Installation, CLI, Dark mode, Quickstart, and owns-vs-does-not-own manuscripts under apps/docs/src/content/docs/.","Theming manuscript is supplied by ORI-CONT-002; its destination stays on the existing static route until ORI-AST-003 binds the real TokenTable.","Actual titles, descriptions, sections, order values, heading text, source paths, and body hashes are recorded before rendering."]},"built_code_sources":{"description":"Actual registry artifacts and authored code rendered by the candidate's real build. Fetch served registry JSON from the owned preview and retain original content strings as the byte oracle. No clipboard values or code nodes are injected.","seed_method":"cli","records":["The real conversation registry source includes a terminal newline U+000A.","The existing /components/conversation page renders source through CodeBlock and rnr-copy-button.","Real MDX uses the production component bindings and build-time code renderer; theme changes use the existing header control."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Validate collection frontmatter through the real loader","description":"GIVEN actual source-backed Markdown and MDX entries WHEN the production collection loader builds valid and invalid copies THEN valid entries render and invalid frontmatter fails with the source ID and offending field.","primary":false,"flow_ref":null,"test_tier":"integration","verification_service":"Real filesystem, installed Astro collection loader, and actual Astro build subprocesses","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","test_file":"tests/sprint-05-orient-search/docs-collection.test.ts","test_function":"ORI-AST-001-collection-schema","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-collection-schema","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real filesystem, installed Astro collection loader, and actual Astro build subprocesses","negative_control":{"would_fail_if":["The loader is disconnected from source files or schema validation is a no-op.","A static success receipt replaces the real build or invalid frontmatter is silently accepted."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["Run the actual Astro build over the two source-backed entries and inspect the emitted article content.","Repeat valid section values getting-started, guides, and porting through isolated source copies; accept omitted draft and boolean draft values without inventing additional routes."]},"end_state":{"must_observe":["The valid getting-started build emits 2 distinct collection-reference documents containing `AI Elements Example`, `Structure`, and `Run`.","All 3 declared section values pass the real collection schema."],"must_not_observe":["An empty article or shell-only response standing in for the copied source body."]}},{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["In separate owned copies, remove title, description, section, or order; then test an unknown section, nonnumeric order, and nonboolean draft.","Run the identical real build for every case, capture the targeted diagnostic, restore the valid source, and rebuild."]},"end_state":{"must_observe":["All 7 invalid-frontmatter builds exit with status != 0; each diagnostic names the mutated source ID and the offending field (`title`, `description`, `section`, `order`, or `draft`).","The restored valid build exits 0 and emits the `AI Elements Example` article."],"must_not_observe":["Exit 0 for invalid frontmatter, empty diagnostics, or an unrelated setup error counted as schema rejection."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Publish unique routes and exclude drafts","description":"GIVEN validated collection entries and the existing Theming route WHEN publication state or destination identity changes in real source copies THEN routes, navigation, and search input agree, duplicates fail, and Theming retains one canonical destination.","primary":false,"flow_ref":null,"test_tier":"integration","verification_service":"Real Astro build, emitted static documents, and production documentation navigation and publication helpers","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","test_file":"tests/sprint-05-orient-search/docs-collection.test.ts","test_function":"ORI-AST-001-publication-contract","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-publication-contract","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro build, emitted static documents, and production documentation navigation and publication helpers","negative_control":{"would_fail_if":["Draft filtering is disconnected between route generation, navigation, and search input.","Duplicate destinations overwrite each other silently or a static shell replaces the existing Theming content."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["Build both published entries, then set the second actual source copy to draft:true and rebuild from fresh output.","Inspect emitted routes, section navigation, and the production published-entry input intended for search; then restore draft:false and rebuild.","Add an isolated collection copy with the theming ID and verify that catch-all generation excludes that reserved destination."]},"end_state":{"must_observe":["Published collection-reference document counts change from 2 to 1 to 2 as the real draft flag changes.","With `draft:true`, the `collection-reference-mdx` ID has 0 emitted routes, 0 section-navigation entries, and 0 entries in the production search input.","Exactly 1 `/docs/theming` destination remains, with the existing `textclasscontext` and `rendermarkdown` anchors."],"must_not_observe":["A stale draft route or navigation entry, an empty Theming shell, or a second Theming destination."]}},{"start_ref":"collection_source","action":{"actor":"cli_user","steps":["Create two real source copies whose production IDs resolve to the same published destination and run the actual build.","Capture the collision diagnostic, remove only the owned duplicate copy, and rebuild."]},"end_state":{"must_observe":["The colliding build exits with status != 0 and its diagnostic identifies the exact duplicate destination and both (2) source paths recorded for the collision input.","The restored build emits the 2 distinct collection-reference destinations."],"must_not_observe":["A last-writer winner, silent source omission, or an empty collision report."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"Render real prose, navigation, metadata, and heading destinations","description":"GIVEN the actual required manuscripts WHEN a reader opens the built pages and follows section and heading links THEN source-derived content, metadata, edit links, and destinations remain correct with and without JavaScript.","primary":false,"flow_ref":null,"test_tier":"e2e","verification_service":"Real authored manuscripts, built Astro preview at http://localhost:4321, HTTP responses, and actual Playwright browsers","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","test_file":"tests/sprint-05-orient-search/docs-collection.test.ts","test_function":"ORI-AST-001-prose-navigation","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-prose-navigation","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real authored manuscripts, built Astro preview at http://localhost:4321, HTTP responses, and actual Playwright browsers","negative_control":{"would_fail_if":["Prose is a static shell disconnected from the manuscript or navigation uses a fabricated destination list.","Heading links target absent IDs, metadata comes from another page, or a missing required manuscript is replaced with placeholder content."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"published_manuscripts","action":{"actor":"user","steps":["Build and serve the current candidate on the owned localhost:4321 preview; use actual desktop, mobile, and JavaScript-disabled browser contexts.","Open Introduction, Installation, CLI, Dark mode, Quickstart, and owns-vs-does-not-own; compare each rendered article, title, and description with its actual source.","Follow Getting started links and heading-derived fragment links; inspect the target heading text and ID, active page, ordering, and source edit destination.","Visit the existing Theming route and follow its two preserved seam anchors without creating a second route."]},"end_state":{"must_observe":["All 6 named authored destinations return HTTP 200 with matching substantive article content and exactly 1 page-title h1 each.","The Getting started navigation reaches `/docs/cli`, `/docs/dark-mode`, and exactly 1 canonical `/docs/owns-vs-does-not-own` destination.","Across all 6 authored pages, every Toc link resolves to exactly 1 heading with the source-derived ID and text, with 0 unresolved fragments; each page's metadata title and description equal its recorded frontmatter values, and its edit URL identifies that manuscript's recorded path under `apps/docs/src/content/docs/`.","With `javaScriptEnabled:false`, all 6 authored pages retain the same complete source-derived readable article bodies, and every ordinary section and heading link reaches its expected HTTP 200 page or exactly 1 matching fragment target."],"must_not_observe":["Empty Prose output, shell-only keyword matches, missing heading targets, draft links, or edit links to generated dist files."]}},{"start_ref":"published_manuscripts","action":{"actor":"cli_user","steps":["Remove one required manuscript in an isolated real source copy and run this rendered-page verification.","Separately break a real heading destination in an isolated copy and repeat verification; restore each source and rebuild before the positive rerun."]},"end_state":{"must_observe":["Both (2) negative verification runs exit with status != 0: the missing-manuscript diagnostic contains the exact removed required path under `apps/docs/src/content/docs/`, and the broken-heading diagnostic contains the exact mutated page URL and unresolved fragment recorded for that input.","After restoration, the same verification reaches the actual `/docs/cli` article and resolves its heading destinations."],"must_not_observe":["A passing skip, placeholder replacement, empty failure evidence, or a stale build accepted after source mutation."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Render themed MDX and copy exact source bytes","description":"GIVEN real authored code and served registry source WHEN the real build renders code and the reader changes theme and activates CopyButton THEN displayed and clipboard bytes match the original source without changing the existing control behavior.","primary":false,"flow_ref":null,"test_tier":"e2e","verification_service":"Real Astro MDX and Expressive Code build, localhost:4321 preview, actual Playwright browser, served registry JSON, and system clipboard","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","test_file":"tests/sprint-05-orient-search/docs-collection.test.ts","test_function":"ORI-AST-001-mdx-code-copy","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-mdx-code-copy","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Real Astro MDX and Expressive Code build, localhost:4321 preview, actual Playwright browser, served registry JSON, and system clipboard","negative_control":{"would_fail_if":["CopyButton trims source, copies a canned value, or reads a different code block.","MDX component binding is disconnected, code is constructed only after load, or code themes ignore the actual root theme."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_code_sources","action":{"actor":"user","steps":["Fetch actual conversation registry JSON from the owned preview and navigate to `/components/conversation`.","Compare the rendered code text with the original served content string, activate its actual CopyButton, and read the real clipboard without normalization.","Repeat using a source-backed multiline code input containing boundary whitespace in an isolated collection copy built through the normal code-rendering path; do not inject DOM or clipboard state.","Copy an existing ordinary install command and observe its existing Copied status and idle reset."]},"end_state":{"must_observe":["Conversation source text and clipboard content equal the original served content exactly, including terminal newline U+000A.","The displayed and copied multiline values each equal the original source-backed input byte for byte, with 0 differing bytes and identical SHA-256 hashes; both preserve the recorded leading whitespace and terminal newline U+000A.","The ordinary install command remains byte-identical and the existing `Copied` status returns to the original idle label."],"must_not_observe":["Trimmed text, added sentinel characters, empty clipboard content, another block's source, or a second copy control implementation."]}},{"start_ref":"built_code_sources","action":{"actor":"user","steps":["Open the actual built MDX article and inspect its production component bindings and initial code HTML.","Use the existing header theme control to select both themes and inspect computed code colors against the actual site tokens.","Read the article in a JavaScript-disabled context and verify complete selectable code text.","In an isolated source copy restore only the old copy-payload trim, rebuild, and require the same terminal-newline clipboard assertion to fail; restore the corrected source and rerun."]},"end_state":{"must_observe":["The initial HTTP 200 document contains the complete source-derived MDX component content and build-time highlighted code, with 0 missing bound-component outputs and 0 framework hydration boundaries for that content.","In both (2) theme states selected through the existing header control, computed code colors equal the corresponding site-token values for the actual root theme, and the source text has 0 differing bytes and the same SHA-256 hash before and after each change.","With `javaScriptEnabled:false`, the complete selectable code equals the original source with 0 differing bytes; restoring the old payload trim makes the same clipboard assertion fail on the missing terminal U+000A with status != 0, and restoring the correction makes that assertion pass with status 0."],"must_not_observe":["An absent-component import concealed by a stub, client-only article content, an empty code surface, or a passing clipboard assertion with the old payload trim."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Valid source-backed entries render; each invalid frontmatter case fails with its source ID and field.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-collection-schema","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Publication changes produce route counts 2, 1, and 2; drafts disappear from every publication consumer and duplicate destinations fail.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-publication-contract","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"All six required authored destinations contain their source-derived content and valid navigation, metadata, edit links, and heading targets; missing sources fail.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-prose-navigation","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Actual clipboard content equals unnormalized displayed source, including boundary whitespace; MDX and both code themes render through the real build.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-collection.test.ts -t ORI-AST-001-mdx-code-copy","maps_to_ac":"AC-4"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-AST-001",
  "commit_sha": "1122612054035572750de08dc07785c6f179ed38",
  "done": "Landed the authored-docs collection shell and prose routing contract: the `docs` glob collection with a zod schema (title/description/section/order/optional draft), the `/docs/[...id]` catch-all route rendering through `render(entry)` into MarkdownLayout, the PageHeader/Toc/Prose semantic components, the docs-navigation publication contract (draft filtering, reserved `theming` slug exclusion, deterministic sort, and a deterministic duplicate-destination gate over raw source files), `@astrojs/mdx` + `astro-expressive-code` with both code themes mapped to `html.light` (no media query), `prerenderConflictBehavior: 'error'`, and the copy-button payload-trim correction; AC-1/AC-2/AC-4(copy) are green with real loader/build/browser/clipboard evidence and AC-3 stays RED by design until the ORI-CONT manuscripts land.",
  "deviations": [
    "`apps/docs/src/lib/docs-navigation.ts` detects duplicate destinations by reading the raw source files and re-deriving ids with `github-slugger` (`assertUniqueDestinations`) instead of trusting `getCollection`, because the store is a Map keyed by id (dedupes same-slug sources) and the loader's own `DuplicateContentEntrySlugError` races under concurrent file processing.",
    "`apps/docs/astro.config.mjs:18` sets `prerenderConflictBehavior: 'error'`, a global Astro 6.0 config the task's deliverable list did not name, so both the loader-level duplicate-slug collision and any catch-all-vs-static route collision fail the build.",
    "`github-slugger` was promoted to a direct docs devDependency (the task's 'Ask first' listed only MDX/Expressive Code) because it was already a transitive dependency of Astro and is the exact id rule the deterministic collision gate must match.",
    "`MarkdownLayout.astro` takes `editUrl` rather than a `sourcePath` prop — the route computes the GitHub edit URL and the unused `sourcePath` prop was dropped to satisfy fallow's unused-component-prop gate.",
    "`DocsLayout.astro` and `Header.astro` were left unmodified (composed, not edited) even though writeAllowed lists them, matching the BOUNDARY 'compose the existing DocsLayout/Header' over the deliverable enumeration."
  ],
  "concerns": [
    "The scratch-copy test harness symlinks `node_modules` into the owned copy, which shares Astro's default `cacheDir` (`./node_modules/.astro`) with the real tree — the test clears it per build for isolation, but any future test that forgets this will see stale content sync or leak scratch entries into the real cache.",
    "`tests/sprint-05-orient-search/docs-collection.test.ts` AC-4 is ~210 lines and suppresses `fallow-ignore-next-line complexity`; its idle-reset poll (3s ceiling vs the 2s reset timer) and two sequential preview servers (4321 + 4322) are timing-brittle spots.",
    "The Expressive Code theme binding (`themeCssSelector` → `.light`, producing `:root.light .expressive-code`) silently breaks if the site's theme class mechanism ever moves off `html.light`.",
    "`assertUniqueDestinations` must stay byte-compatible with Astro's `getContentEntryIdAndSlug` github-slugger derivation; an Astro id-generation change would drift the collision gate from the real loader."
  ],
  "findings": [
    "Astro 7.3's glob loader processes files concurrently (`pLimit(10)`), so its own duplicate-slug warning races and can silently emit one route — the task's assumption that the real loader's collision diagnostic suffices is wrong.",
    "Astro's default build-mode `cacheDir` is `./node_modules/.astro`, not `.astro/`, which is what makes scratch copies share content state with the real tree.",
    "`render(entry)` returns `{ Content, headings, remarkPluginFrontmatter }` and `getCollection('docs')` entries expose a typed `filePath`, so edit-link source paths need no custom slug field.",
    "`astro check` cannot run without `@astrojs/check` (not installed); the docs app is actually typechecked via `tsc -p apps/docs/tsconfig.json` plus the Astro compiler during build.",
    "Astro's schema-failure diagnostic already satisfies AC-1's 'source ID and offending field' without any custom validation.",
    "`// fallow-ignore-next-line complexity` directives are load-bearing for the `fallow audit --base HEAD` gate even in files outside fallow's `entry` globs — the reviewer's 'inert' note was empirically disproven."
  ],
  "scope_impact": [
    {"target": "ORI-AST-003", "found": "the reserved `theming` slug is a module-private `RESERVED_DOC_SLUGS` in docs-navigation.ts, and `publishedDocs`/`sectionNavigation` already exclude it from the catch-all", "change": "when ORI-AST-003 binds the real TokenTable route adapter it must consume (or re-export) that reserved contract so the static `/docs/theming` route stays the single destination."},
    {"target": "ORI-CONT-001", "found": "the collection schema enforces exact frontmatter shape and the catch-all derives ids from filenames", "change": "the six manuscripts must live under `apps/docs/src/content/docs/` with title/description/section/order (and optional draft), and a manuscript slugged `theming` will get no catch-all route."},
    {"target": "ORI-AST-005", "found": "CopyButton now copies `command.textContent` untrimmed (apps/docs/src/scripts/copy-button.ts:36)", "change": "authored-code source byte-comparison must compare untrimmed bytes including the terminal newline, matching the served-source contract."},
    {"target": "ORI-AST-004", "found": "each authored docs page renders `<main data-pagefind-body data-pagefind-meta=\"section:<section>\">`", "change": "Pagefind indexing for docs consumes that body/meta region, so the search input must read those attributes rather than a separate index artifact."},
    {"target": "ROADMAP", "found": "root `pnpm typecheck` imports generated `apps/docs/src/data/registry-items.json`", "change": "fresh-worktree CI must hydrate (`pnpm install --frozen-lockfile` → `pnpm -w run gallery:manifest` → `pnpm --filter @rnr-ai-elements/docs prebuild`) before typecheck/gates."}
  ],
  "feedback": [
    "The 'Ask first: any dependency beyond MDX/Expressive Code' conflicted with AC-2's collision requirement — reliable duplicate-destination detection needed github-slugger (already transitive); the task should pre-authorize id-derivation tooling for the publication gate.",
    "The fixture's 'production published-entry input intended for search' was ambiguous — I read it as the `data-pagefind-body`/`data-pagefind-meta` region (matching the component pages), but a build-emitted JSON search index was a plausible alternate reading and does not exist yet.",
    "The `astro check` verification gate is unrunnable without `@astrojs/check`, which is not a declared dependency; the docs typecheck should be stated as `tsc -p apps/docs/tsconfig.json`."
  ]
}
```
