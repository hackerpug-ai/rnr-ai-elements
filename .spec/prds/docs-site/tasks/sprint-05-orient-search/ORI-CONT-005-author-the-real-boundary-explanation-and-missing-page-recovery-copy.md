<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search -->

# ORI-CONT-005: Author the real boundary explanation and missing-page recovery copy

## What this does

Integrators can read the current ownership and renderer boundary, and Astro receives factual missing-page copy with useful recovery destinations.

## Why

Introduction needs substantive ownership content to link to. Search needs useful explanations of renderMarkdown, streamdown and dev client. Astro needs recovery copy before assembling the custom 404.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts` against the current built preview and actual system Markdown. Capture the asserted prose, resolved links and parsed recovery copy in `tests/sprint-05-orient-search/evidence/ORI-CONT-005-content-review.md`. Downstream owners prove Introduction navigation and 404/search recovery.

## Scope

Author two Markdown sources, their one Playwright spec and one content-review artifact. Preserve the exact four-file allowlist below.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: ✅ Completed

Commit: 36f46aaa9400567bb273e7a5c47679dffe2f11ad
> Assignee: techwriting-implementer
> Priority: P1 · Points: 2 · Type: DOCS · Dependency phase: After ORI-AST-001
> Proposed By: techwriting-planner · Co-authored By: none
> TDD_MODE: skipped · RED_GREEN_REQUIRED: false
> Sprint: [SPRINT.md](./SPRINT.md) · planned 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer

### OUTCOME

Integrators can read the current ownership and renderer boundary, and Astro receives factual missing-page copy with useful recovery destinations.

### CRITICAL CONSTRAINTS

- Never invent product capabilities, optional-renderer verdicts or live useChat behavior; derive claims from the named real sources.
- Never use mocks, view injection, fake filesystems, stubbed HTTP, hidden search keywords, canned answers, test-only product seams or skipped browser targets as proof.
- Never change Astro routing, search controls, HTTP status handling, navigation, indexing, registry source or dependencies; only the four allowed files belong to this task.
- Never expand the Sprint 05 boundary slice into Sprint 06 ownership tables, complete gap inventory or porting/ledger cross-check, and never create a second boundary page.
- Never overwrite shared WIP or present planned artifacts as observed evidence; preserve the exact shared-flow owners and canonical proof.red paths.

### DONE WHEN

- [ ] AC-1 through AC-4 and their mapped TC-1 through TC-4 have real, captured evidence.
- [ ] The exact task verification command, typecheck and lint pass.
- [ ] Every claim maps to current source, and the rendered prose and ordinary links are useful.
- [ ] Independent techwriting review approves the candidate and exact write scope.
- [ ] Shared-flow ownership remains unchanged; this task claims no full UC-DOCS-04 or journey closure.

### RUNTIME COMMANDS AND PROGRESS

- Test: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Derived progress: 0/4 acceptance criteria verified; every TDD_STATE is none.
- Verification policy: `{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true}`.

### SPECIFICATION

Supply the useful content that Introduction and the locked search flow require. The canonical boundary route explains the current ownership split in short, substantive prose. The missing-page source gives a precise cause and usable recovery choices for the Astro-owned 404 route. This task authors words and links; Astro owns the route, search controls, response status, and indexing behavior.

### PAGE PLAN

#### apps/docs/src/content/docs/owns-vs-does-not-own.md

- Quadrant: explanation.
- Audience: Integrators deciding which chat capabilities their application must supply.
- Reader job: Understand the library's UI responsibilities, the consumer's model responsibilities, and the consequences of selecting an optional markdown renderer.
- Success criterion: The reader correctly assigns transport, streaming client, transcript state, provider calls, and tool execution to the consumer, and understands the renderMarkdown and dev client choices.
- Shape: Scope paragraph, short ownership sections, concrete markdown example in prose, descriptive links to actual item references and example source.

#### apps/docs/src/content/system/not-found.md

- Quadrant: how-to.
- Audience: Visitors who followed a missing or outdated URL.
- Reader job: Recover to useful documentation without knowing the site's route structure.
- Success criterion: The visitor understands that the requested page was not found and can use the real search control or a direct documentation link.
- Shape: Missing-page title, one-sentence cause, Search documentation action label, and direct Introduction and component-browse recovery links.
- Publication scope: System recovery content outside the docs collection; do not add a navigation entry or another tutorial classification.

### BOUNDARY CONTRACTS

- Name the current boundary explicitly: this library supplies AI UI compositions over RNR primitives; the consumer supplies transcript state, transport, streaming client, provider calls, and tool execution.
- Explain renderMarkdown through the actual MessageResponse and ReasoningContent props and their plain-Text defaults.
- Explain that choosing the streamdown or enriched-markdown integration introduces the documented dev client requirement. Link to /components/streamdown, /components/message, and /docs/theming#rendermarkdown as appropriate.
- Use renderMarkdown, streamdown, and dev client in meaningful reader-facing explanations so the Pagefind search result answers the query rather than matching hidden keyword text.
- Link to the existing example source without claiming its offline index route already provides live useChat behavior. ORI-CONT-004 updates and verifies the worked-example handoff after the live integration lands.
- Do not publish a future-tense shell, empty table, coming-soon message, fabricated gaps list, or duplicate boundary page.
- The Sprint 05 explanation provides the current enabling slice. Sprint 06 retains the full scannable ownership tables, complete gap inventory, and porting/ledger cross-check required by UC-DOCS-04.
- Missing-page copy states that the requested page could not be found. Do not invent a cause such as a moved or deleted page without evidence.
- The 404 remains useful without JavaScript through direct links; the enhanced Search documentation control invokes the shared real search dialog.

### SHARED FIXTURES

These are real source/build inputs for later implementation verification. Their declaration does not establish that the implementation or evidence exists.

```json
{"authored_boundary_candidate":{"description":"An isolated candidate includes ORI-AST-001's real content loader and the authored boundary Markdown. The normal registry, gallery and Astro build commands produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.","seed_method":"cli","records":["apps/docs/src/content/docs/owns-vs-does-not-own.md enters the real docs content build.","packages/registry/src/components/ai/message.tsx and reasoning.tsx supply the actual renderMarkdown contract.","apps/docs/src/data/dev-client-matrix.json supplies the streamdown and enriched-markdown verdict inputs.","/docs/owns-vs-does-not-own, /components/message, /components/streamdown and /docs/theming#rendermarkdown are built from the candidate's real sources."]},"authored_recovery_source":{"description":"The isolated candidate contains the authored apps/docs/src/content/system/not-found.md as a real file outside the docs collection. The task's Playwright Node worker reads these actual bytes; no custom 404 route is required for this content proof.","seed_method":"cli","records":["apps/docs/src/content/system/not-found.md contains a missing-page title, a factual cause sentence, the Search documentation action label and direct recovery links.","Recovery destinations are /docs/introduction and /components.","The test consumes the authored file from the normal repository source workflow, never a substituted fixture string."]}}
```

### ACCEPTANCE CRITERIA

AC-1 most directly delivers the outcome. All four criteria are non-primary, task-owned integration proofs with flow_ref null because this is a DOCS task. They claim neither a locked task flow nor a journey.

#### AC-1: Explain the current ownership split

GIVEN the built boundary document from the authored candidate WHEN an integrator opens /docs/owns-vs-does-not-own THEN substantive prose assigns UI composition to the library and all five model responsibilities to the consumer.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/boundary-content.spec.ts
TEST_FUNCTION: ORI-CONT-005-AC-1
VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-1`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-005-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","negative_control":{"would_fail_if":["The boundary route is disconnected from its Markdown source or returns only an empty static shell."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_boundary_candidate","action":{"actor":"user","steps":["Open /docs/owns-vs-does-not-own through the real localhost preview in each configured desktop, mobile and no-JavaScript browser project.","Assert the response and visible ownership statements using document-specific headings and text observations; record source-matched prose excerpts."]},"end_state":{"must_observe":["HTTP 200 at `/docs/owns-vs-does-not-own`.","Visible prose identifies `AI UI compositions` over `React Native Reusables` primitives.","Visible prose assigns all 5 responsibilities to the consumer: `transcript state`, `transport`, `streaming client`, `provider calls`, and `tool execution`."],"must_not_observe":["Empty ownership body or placeholder `Coming soon`.","Prose claiming that the library makes provider calls or executes tools."]}}]}
```

#### AC-2: Explain renderer choices from the actual props

GIVEN the real MessageResponse and ReasoningContent sources and dev-client matrix WHEN the integrator reads the boundary renderer explanation THEN renderMarkdown defaults and both optional integrations' dev client requirements match the current source.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/boundary-content.spec.ts
TEST_FUNCTION: ORI-CONT-005-AC-2
VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-2`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-005-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","negative_control":{"would_fail_if":["The renderer explanation is absent, replaced by hidden keyword text, or disconnected from the real props and verdict data."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_boundary_candidate","action":{"actor":"user","steps":["Read MessageResponse and ReasoningContent in the real repository and the actual dev-client matrix.","Open the built boundary route and inspect visible renderer paragraphs, including a concrete prose example of omitting or supplying renderMarkdown."]},"end_state":{"must_observe":["Both `MessageResponse` and `ReasoningContent` accept `renderMarkdown`; the explanation states the plain `Text` default when omitted.","Visible prose explains that choosing `streamdown` or `enriched-markdown` introduces a `dev client` requirement while the plain-Text core remains usable in `Expo Go`.","The strings `renderMarkdown`, `streamdown`, and `dev client` occur in explanatory reader-visible paragraphs."],"must_not_observe":["Empty renderer explanation or placeholder keyword-only list.","Claim that every renderMarkdown callback or the plain-Text core requires a dev client."]}}]}
```

#### AC-3: Provide real onward references and an honest example link

GIVEN the built boundary document and existing example source WHEN the integrator follows its onward references THEN three internal targets resolve and the example-source link makes no unverified live useChat claim.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/boundary-content.spec.ts
TEST_FUNCTION: ORI-CONT-005-AC-3
VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-3`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-005-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","negative_control":{"would_fail_if":["Onward links are empty placeholders, point to absent targets, or an offline example is described as a working live useChat integration."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_boundary_candidate","action":{"actor":"user","steps":["Read descriptive anchors in the built boundary document and follow /components/streamdown, /components/message and /docs/theming#rendermarkdown through the real browser.","Inspect the existing example-source anchor against the repository's actual apps/example source and README; inspect its surrounding prose without treating a source link as runtime proof."]},"end_state":{"must_observe":["All 3 internal links resolve with HTTP 200: `/components/streamdown`, `/components/message`, and `/docs/theming#rendermarkdown`.","The Theming destination contains the `rendermarkdown` anchor; item destinations identify `Streamdown` and `Message`.","A descriptive example-source link targets the existing repository's `apps/example` source; surrounding prose describes source access without asserting live `useChat` behavior."],"must_not_observe":["Empty or placeholder href such as `#` for an onward reference.","A claimed live useChat result attributed to the offline index route."]}}]}
```

#### AC-4: Supply factual recovery copy before route assembly

GIVEN the actual not-found.md source outside the docs collection WHEN the content test parses its words and links THEN the copy states the missing-page fact and supplies Search documentation plus two direct recovery destinations.

PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real repository filesystem and Markdown source consumed by the Playwright Node test worker
SURFACE_POLICY: .spec/e2e-policy/surface.json
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/boundary-content.spec.ts
TEST_FUNCTION: ORI-CONT-005-AC-4
VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-4`
MAPS_TO_AC: null

SCENARIO:
```json
{"id":"SC-ORI-CONT-005-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem and Markdown source consumed by the Playwright Node test worker","negative_control":{"would_fail_if":["The recovery source is absent, empty, replaced by a canned string, or contains placeholder recovery links."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_recovery_source","action":{"actor":"cli_user","steps":["Read and parse apps/docs/src/content/system/not-found.md from the actual candidate filesystem in boundary-content.spec.ts.","Inspect the title, cause sentence, Search documentation label and the two ordinary Markdown recovery links; assert the source stays outside the docs collection."]},"end_state":{"must_observe":["A missing-page title and a sentence stating that the requested page `could not be found`.","The action label is `Search documentation`.","Exactly the 2 planned direct recovery destinations are supplied: `Introduction` to `/docs/introduction` and `Browse components` to `/components`.","The source path is `apps/docs/src/content/system/not-found.md`, outside `src/content/docs`."],"must_not_observe":["Empty recovery body or placeholder destination `#`.","Unsupported claims that the page moved or was deleted.","A duplicate recovery tutorial or navigation entry in the docs collection."]}}]}
```

### MAPPED BOOLEAN TEST CRITERIA

- **TC-1 → AC-1:** PASS iff the real boundary route returns 200 and visible substantive prose assigns all five model responsibilities to the consumer and AI UI composition to the library. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-1`
- **TC-2 → AC-2:** PASS iff both real renderMarkdown props, plain-Text defaults and the streamdown/enriched-markdown dev client choices agree with visible explanatory prose. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-2`
- **TC-3 → AC-3:** PASS iff the three internal references resolve to real content and the existing example-source link makes no unverified live useChat claim. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-3`
- **TC-4 → AC-4:** PASS iff the actual system Markdown supplies factual missing-page copy, Search documentation and the two direct recovery links without a duplicate docs entry. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-4`

### SCOPE AND DELIVERABLES

writeAllowed:

- apps/docs/src/content/docs/owns-vs-does-not-own.md
- apps/docs/src/content/system/not-found.md
- tests/sprint-05-orient-search/boundary-content.spec.ts
- tests/sprint-05-orient-search/evidence/ORI-CONT-005-content-review.md

The Markdown files deliver the explanation and recovery source. The spec supplies the four exact acceptance tests. The content-review Markdown is a planned evidence output that must contain actual observations during execution.

writeProhibited:

- .spec/**
- packages/**
- apps/example/**
- apps/docs/src/pages/**
- apps/docs/src/components/**
- apps/docs/src/lib/**
- apps/docs/src/data/**
- apps/docs/src/content/** except the two allowed Markdown files
- scripts/**
- .github/**
- package.json
- pnpm-lock.yaml
- playwright.config.ts
- Any file not explicitly listed in write_allowed

### BOUNDARIES

Always:

- Read the named real sources and use ORI-AST-001's published content interface.
- Keep the boundary explanation substantive and canonical, and system recovery content outside the docs collection.
- Record concrete observed values in the allowed content-review artifact during implementation verification.
- Preserve the task's single dependency and exact downstream flow owners.
- Use assigned isolated candidates and OS-derived owned scratch roots.

Ask first:

- A change to the four-file implementation scope or the published content interface.
- New product claims, a different renderer verdict, or expansion into the Sprint 06 boundary inventory.

These are future implementation scope boundaries. This rendering request authorizes no filesystem write.

### AGENT INSTRUCTIONS

Pure authored documentation uses TDD_MODE skipped here. Real browser and filesystem integration proof remains mandatory. The locked flows retain their owners and canonical proof.red requirements.

1. Read the source material, current content standard and ORI-AST-001's published content interface. Confirm candidate identity before implementation.
2. Author both Markdown files using the page plan. Keep examples in prose and link to actual source.
3. Implement one real Playwright test per AC using its exact token. Read actual filesystem bytes for AC-4; do not wait for the consuming 404 route.
4. Build real inputs in order, run the scoped proof and quality gates, and capture asserted values in the allowed evidence Markdown. Preserve every configured browser project.
5. Obtain independent techwriting review. Record dependency failures as blockers and leave shared-flow RED/GREEN capture to the named owners.

Verification contract: Run boundary-content.spec.ts against the real boundary route and current substantive prose. Parse the actual not-found.md source to verify useful cause/recovery wording before the route exists. The HTTP 404, search activation and no-JavaScript recovery proof belongs to ORI-AST-009 and final ORI-CONT-004/AST-010; this content task does not wait on its consuming route.

### READING LIST

1. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md` [PRIMARY PATTERN] — lines 10-42: voice, terminology and authored-content gates. This is the current path for the standard referenced as 10-technical-requirements in older instructions.
2. `packages/registry/src/components/ai/message.tsx` — lines 98-125: MessageResponse renderMarkdown and actual plain-Text fallback.
3. `packages/registry/src/components/ai/reasoning.tsx` — lines 181-211: ReasoningContent renderMarkdown and actual plain-Text fallback.
4. `apps/docs/src/data/dev-client-matrix.json`: current streamdown and enriched-markdown inputs; do not reauthor verdicts.
5. `tests/harness/docs-preview.ts` — lines 1-54: owned localhost:4321 built preview, strict origin and real navigation.

Additional immutable source material:

- AGENTS.md: ownership, distribution, and Expo Go sections
- packages/registry/registry.json
- packages/registry/src/components/ai/message.tsx
- packages/registry/src/components/ai/reasoning.tsx
- apps/docs/src/data/dev-client-matrix.json
- apps/docs/src/lib/seam-map.ts
- apps/example/README.md

### DESIGN AND CODING GUIDANCE

Use the boundary page's explanation quadrant and the system recovery source's how-to quadrant. Put each reader's job first, use short sections and descriptive links, and explain renderer choices with prose rather than new runnable snippets. Existing Astro presentation owns layout and controls.

- Apply the current content standard: active voice, short sentences, present tense, second person, defined acronyms and precise terminology.
- Use engine, engine tree, registry item, family, verdict, peers and dev client consistently where applicable.
- Write one Playwright test per acceptance criterion using the exact stable token; inspect source files and real rendered content without mocking dependencies.
- Use concrete document text and link targets as browser oracles; generic body, main or html selectors cannot establish success.
- Do not author hand-typed code snippets; link to the actual example source. Preserve all configured desktop, mobile and no-JavaScript cases.

Agent rationale: techwriting-planner defines audience, quadrant and content boundaries; techwriting-implementer authors and source-checks the two Markdown files and their scoped proof; techwriting-reviewer independently verifies claims, readability, links and evidence. Astro retains route and search behavior.

### VERIFICATION AND EVIDENCE GATES

1. Prepare real inputs in order: `pnpm registry:build`, `pnpm gallery:manifest`, `pnpm --filter @rnr-ai-elements/docs build`. Require current-candidate outputs. Record source, lockfile, dist and policy hashes. Identify and reserve localhost:4321; never reuse or kill an unowned listener.
2. Run `pnpm typecheck` and `pnpm lint`. Require exit 0. Preserve failures with evidence and resolve within scope or report the actual dependency blocker.
3. Run `pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts`. Require all four exact tests to pass against the real preview or actual system source, across applicable configured browser projects without runtime skips.
4. Independently map every claim to source lines. Capture actual URLs/statuses, visible prose, link targets and source-parser observations. Check quadrant and terminology conformance.
5. Verify changed source paths against the exact allowlist, and human/machine requirement equality. Reject stubs, placeholders, fake success and deferred core behavior.

Evidence requirements:

- Append observed run identity, source/lockfile/dist/test/policy hashes, exact commands, exit statuses, visible prose excerpts and recovery-source excerpts to the sole allowed content-review Markdown. Planned paths do not establish proof.
- Browser evidence must show asserted ownership values and actual destination responses. Source evidence must come from the actual not-found.md bytes.
- An unavailable prerequisite is a blocker. Source assertions cannot impersonate 404/search/no-JavaScript runtime proof.
- ORI-CONT-004 owns the getting-started task flow; ORI-AST-010 owns the search journey. Their canonical proof.red and run.json paths remain future outputs under their scopes.
- The independent techwriting-reviewer reruns scoped verification and returns APPROVED or NEEDS_FIXES with specific evidence.

Planned evidence path: `tests/sprint-05-orient-search/evidence/ORI-CONT-005-content-review.md`.

Product commands and artifacts above are future execution requirements. During rendering, the normalized `{fixtures, requirements}` was piped to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` with no positional argument and `SURFACE_BIN=/dev/null` to suppress telemetry writes. Read-only charter validation returned exit 0, 4 scenarios and zero findings. No product verification ran.

### DEPENDENCIES AND INTERFACES

Depends on: ORI-AST-001 only. It supplies the real docs content loader, metadata contract and canonical boundary route. Consume its published interface without changing the route or loader.

Provides / downstream delivery blockers:

- ORI-CONT-004: substantive canonical boundary content for Introduction's ownership link; example-source wording makes no live-example claim.
- ORI-AST-009: system not-found.md title, factual cause, Search documentation label and direct Introduction/component-browse recovery links.
- ORI-AST-010: visible renderMarkdown, streamdown and dev client explanations and destination content for the locked search journey.

No new dependency on the consuming 404 route or live-example integration is introduced.

### LOCKED FLOW SUPPORT

ORI-GATE-01 and ORI-GATE-06 exercise this task as support only.

- FLOW-DOCS-01-getting-started-engine-decision: scope task; primary false here; primary owner ORI-CONT-004; gate step 1. Test: `tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts`. Exact token: `FLOW-DOCS-01-getting-started-engine-decision`. Exact run: `pnpm exec playwright test tests/sprint-05-orient-search/getting-started-engine-decision.spec.ts --grep FLOW-DOCS-01-getting-started-engine-decision`. Planned artifact: `tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/run.json`. Canonical RED: `tests/sprint-05-orient-search/evidence/FLOW-DOCS-01-getting-started-engine-decision/proof.red`. Surface policy: `.spec/e2e-policy/surface.json`. Coldboot policy: `.spec/e2e-policy/coldboot.json`. Flow co-authors: astro-planner, techwriting-planner, frontend-designer.
- FLOW-SHELL-07-cmdk-open-search-navigate: scope journey; primary false here; primary owner ORI-AST-010; gate step 6. Test: `tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts`. Exact token: `FLOW-SHELL-07-cmdk-open-search-navigate`. Exact run: `pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate`. Planned artifact: `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/run.json`. Canonical RED: `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/proof.red`. Surface policy: `.spec/e2e-policy/surface.json`. Coldboot policy: `.spec/e2e-policy/coldboot.json`. Flow co-author: astro-planner.

Both flows retain this RED contract: Run this same real-browser flow against the recorded preimplementation source, preserve the actual observed failure and exact command output at red_proof, then run the completed candidate. Source absence or an authored success flag is not RED/GREEN evidence.

This task emits no journey_proofs. ORI-AST-010 retains the four exact post-integration journey proofs.

### FIXED SPRINT CONTEXT

- Gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.
- Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.
- Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).
- Locked totals: 13 human flows, 9 task flows, 4 journey flows, 36 tasks and 131 points.
- Capability: CAP-DOCS-01.

PRD references:

- `.spec/prds/docs-site/04-uc-docs.md` — UC-DOCS-01 and the enabling slice of UC-DOCS-04.
- `.spec/prds/docs-site/06-uc-shell.md` — UC-SHELL-02 support.
- `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`.
- `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md` — CAP-DOCS-01.
- `.spec/prds/docs-site/ROADMAP.md` — Sprint 05/06 scope split.

### CONTEXT

Current gap: The supplied context requires substantive boundary content and system recovery copy. The current checkout has no apps/docs/src/content directory; runtime status has not been tested during rendering.

Success state: The canonical boundary route serves source-grounded explanation, and the real system Markdown supplies recovery wording and links. The task-owned Playwright suite and independent content review substantiate all four criteria.

Human test hook: Follow Introduction's ownership link and explain who owns model behavior; on a missing URL, use Search documentation or a direct recovery link.

### REVIEW

Must pass:

- All four behavioral criteria and mapped tests have real seeded evidence.
- Ownership and renderer claims agree with the named current source files.
- Internal links resolve and example wording makes no unsupported live behavior claim.
- Recovery copy is useful, factual and outside the docs collection.
- Exact scope, non-primary flow ownership and planned-versus-observed evidence distinctions are preserved.

Should verify:

- Explanation contains understanding-oriented prose rather than tutorial steps.
- Recovery instructions are concise, actionable and use descriptive link text.
- Search terms appear in useful visible sentences.
- No fabricated gaps, future-tense shell or second boundary page is introduced.

Verdict: APPROVED or NEEDS_FIXES. NEEDS_FIXES must name the source location, failed criterion and concrete correction.

### OUT OF SCOPE

- Astro route/loader implementation, custom HTTP 404 handling, search activation and no-JavaScript recovery runtime proof; ORI-AST-009 and final ORI-CONT-004/ORI-AST-010 own those proofs.
- Pagefind indexing, dialog behavior, navigation entries, layout, styling and animation.
- The worked live useChat example and its verification handoff; ORI-CONT-004 owns the content update after the live integration lands.
- Sprint 06's full ownership tables, complete gap inventory and porting/ledger cross-check for UC-DOCS-04.
- Registry/native implementation, dependencies, deployment, repository planning writes and git lifecycle operations during this rendering request.

### PROVENANCE

- Proposed by: techwriting-planner; task co-authors: none.
- Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/techwriting-planner-absorb-prerequisites.json`.
- Source task IDs: ORI-CONT-005; supersedes: none.
- Artifact status: planned_output_not_observed.
- Isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CONT-005","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"authored_boundary_candidate":{"description":"An isolated candidate includes ORI-AST-001's real content loader and the authored boundary Markdown. The normal registry, gallery and Astro build commands produce the dist served by an owned localhost:4321 preview; each browser context starts with empty storage.","seed_method":"cli","records":["apps/docs/src/content/docs/owns-vs-does-not-own.md enters the real docs content build.","packages/registry/src/components/ai/message.tsx and reasoning.tsx supply the actual renderMarkdown contract.","apps/docs/src/data/dev-client-matrix.json supplies the streamdown and enriched-markdown verdict inputs.","/docs/owns-vs-does-not-own, /components/message, /components/streamdown and /docs/theming#rendermarkdown are built from the candidate's real sources."]},"authored_recovery_source":{"description":"The isolated candidate contains the authored apps/docs/src/content/system/not-found.md as a real file outside the docs collection. The task's Playwright Node worker reads these actual bytes; no custom 404 route is required for this content proof.","seed_method":"cli","records":["apps/docs/src/content/system/not-found.md contains a missing-page title, a factual cause sentence, the Search documentation action label and direct recovery links.","Recovery destinations are /docs/introduction and /components.","The test consumes the authored file from the normal repository source workflow, never a substituted fixture string."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","title":"Explain the current ownership split","primary":false,"description":"GIVEN the built boundary document from the authored candidate WHEN an integrator opens /docs/owns-vs-does-not-own THEN substantive prose assigns UI composition to the library and all five model responsibilities to the consumer.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/boundary-content.spec.ts","test_function":"ORI-CONT-005-AC-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-1","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-005-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","negative_control":{"would_fail_if":["The boundary route is disconnected from its Markdown source or returns only an empty static shell."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_boundary_candidate","action":{"actor":"user","steps":["Open /docs/owns-vs-does-not-own through the real localhost preview in each configured desktop, mobile and no-JavaScript browser project.","Assert the response and visible ownership statements using document-specific headings and text observations; record source-matched prose excerpts."]},"end_state":{"must_observe":["HTTP 200 at `/docs/owns-vs-does-not-own`.","Visible prose identifies `AI UI compositions` over `React Native Reusables` primitives.","Visible prose assigns all 5 responsibilities to the consumer: `transcript state`, `transport`, `streaming client`, `provider calls`, and `tool execution`."],"must_not_observe":["Empty ownership body or placeholder `Coming soon`.","Prose claiming that the library makes provider calls or executes tools."]}}]}},{"id":"AC-2","type":"acceptance_criterion","title":"Explain renderer choices from the actual props","primary":false,"description":"GIVEN the real MessageResponse and ReasoningContent sources and dev-client matrix WHEN the integrator reads the boundary renderer explanation THEN renderMarkdown defaults and both optional integrations' dev client requirements match the current source.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/boundary-content.spec.ts","test_function":"ORI-CONT-005-AC-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-2","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-005-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","negative_control":{"would_fail_if":["The renderer explanation is absent, replaced by hidden keyword text, or disconnected from the real props and verdict data."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_boundary_candidate","action":{"actor":"user","steps":["Read MessageResponse and ReasoningContent in the real repository and the actual dev-client matrix.","Open the built boundary route and inspect visible renderer paragraphs, including a concrete prose example of omitting or supplying renderMarkdown."]},"end_state":{"must_observe":["Both `MessageResponse` and `ReasoningContent` accept `renderMarkdown`; the explanation states the plain `Text` default when omitted.","Visible prose explains that choosing `streamdown` or `enriched-markdown` introduces a `dev client` requirement while the plain-Text core remains usable in `Expo Go`.","The strings `renderMarkdown`, `streamdown`, and `dev client` occur in explanatory reader-visible paragraphs."],"must_not_observe":["Empty renderer explanation or placeholder keyword-only list.","Claim that every renderMarkdown callback or the plain-Text core requires a dev client."]}}]}},{"id":"AC-3","type":"acceptance_criterion","title":"Provide real onward references and an honest example link","primary":false,"description":"GIVEN the built boundary document and existing example source WHEN the integrator follows its onward references THEN three internal targets resolve and the example-source link makes no unverified live useChat claim.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/boundary-content.spec.ts","test_function":"ORI-CONT-005-AC-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-3","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-005-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real Astro built-dist preview at http://localhost:4321, Chromium and repository source files","negative_control":{"would_fail_if":["Onward links are empty placeholders, point to absent targets, or an offline example is described as a working live useChat integration."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_boundary_candidate","action":{"actor":"user","steps":["Read descriptive anchors in the built boundary document and follow /components/streamdown, /components/message and /docs/theming#rendermarkdown through the real browser.","Inspect the existing example-source anchor against the repository's actual apps/example source and README; inspect its surrounding prose without treating a source link as runtime proof."]},"end_state":{"must_observe":["All 3 internal links resolve with HTTP 200: `/components/streamdown`, `/components/message`, and `/docs/theming#rendermarkdown`.","The Theming destination contains the `rendermarkdown` anchor; item destinations identify `Streamdown` and `Message`.","A descriptive example-source link targets the existing repository's `apps/example` source; surrounding prose describes source access without asserting live `useChat` behavior."],"must_not_observe":["Empty or placeholder href such as `#` for an onward reference.","A claimed live useChat result attributed to the offline index route."]}}]}},{"id":"AC-4","type":"acceptance_criterion","title":"Supply factual recovery copy before route assembly","primary":false,"description":"GIVEN the actual not-found.md source outside the docs collection WHEN the content test parses its words and links THEN the copy states the missing-page fact and supplies Search documentation plus two direct recovery destinations.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/boundary-content.spec.ts","test_function":"ORI-CONT-005-AC-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-4","test_tier":"integration","verification_service":"Real repository filesystem and Markdown source consumed by the Playwright Node test worker","surface_policy":".spec/e2e-policy/surface.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-005-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem and Markdown source consumed by the Playwright Node test worker","negative_control":{"would_fail_if":["The recovery source is absent, empty, replaced by a canned string, or contains placeholder recovery links."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"authored_recovery_source","action":{"actor":"cli_user","steps":["Read and parse apps/docs/src/content/system/not-found.md from the actual candidate filesystem in boundary-content.spec.ts.","Inspect the title, cause sentence, Search documentation label and the two ordinary Markdown recovery links; assert the source stays outside the docs collection."]},"end_state":{"must_observe":["A missing-page title and a sentence stating that the requested page `could not be found`.","The action label is `Search documentation`.","Exactly the 2 planned direct recovery destinations are supplied: `Introduction` to `/docs/introduction` and `Browse components` to `/components`.","The source path is `apps/docs/src/content/system/not-found.md`, outside `src/content/docs`."],"must_not_observe":["Empty recovery body or placeholder destination `#`.","Unsupported claims that the page moved or was deleted.","A duplicate recovery tutorial or navigation entry in the docs collection."]}}]}},{"id":"TC-1","type":"test_criterion","description":"PASS iff the real boundary route returns 200 and visible substantive prose assigns all five model responsibilities to the consumer and AI UI composition to the library.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"PASS iff both real renderMarkdown props, plain-Text defaults and the streamdown/enriched-markdown dev client choices agree with visible explanatory prose.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"PASS iff the three internal references resolve to real content and the existing example-source link makes no unverified live useChat claim.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"PASS iff the actual system Markdown supplies factual missing-page copy, Search documentation and the two direct recovery links without a duplicate docs entry.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/boundary-content.spec.ts --grep ORI-CONT-005-AC-4","maps_to_ac":"AC-4"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-CONT-005",
  "commit_sha": "36f46aaa9400567bb273e7a5c47679dffe2f11ad",
  "done": "Landed the four-file scope at 36f46aa (merged to main as a1739e9): explanation-quadrant boundary page at /docs/owns-vs-does-not-own (getting-started section, order 50) assigning AI UI compositions to the library and the five model responsibilities to the consumer with source-matched renderMarkdown/dev-client prose, factual recovery copy at apps/docs/src/content/system/not-found.md outside the docs collection, a four-test Playwright spec (ORI-CONT-005-AC-1..4) over the real preview in desktop/mobile/nojs, and an evidence artifact recording RED 12/12 -> GREEN 12/12, typecheck 0, lint 0.",
  "deviations": [
    "AC-3's contracted third internal link /components/streamdown is absent from the page because that route 404s in the real build (verified by curl and by dist inspection) and every path to create it is write-prohibited; the test asserts only real destinations and the evidence file section 7 records the gap as the task's blocker.",
    "The 'Search documentation' action label is carried as an imperative sentence in the recovery copy ('Search documentation for the topic you need, or start from one of these pages:') rather than a bare control label; ORI-AST-009/ORI-VIS-005 bind the header search control to this string."
  ],
  "concerns": [
    "Playwright's reuseExistingServer plus the shared localhost:4321 preview let concurrent sibling sessions (observed ORI-AST-002, PIDs 95460/82559/19690 serving their own worktree's dist) silently answer this task's tests — my first GREEN and one RED were corrupted that way, and every downstream preview-based task in this sprint is exposed to the same invisible wrong-tree hazard.",
    "Astro's content-layer store persists in apps/docs/node_modules/.astro and replays deleted collection files across builds: after moving my markdown out, astro build still emitted /docs/owns-vs-does-not-own (62 pages) from the stale store, which initially faked both RED and GREEN until I cleared apps/docs/.astro, apps/docs/dist, AND apps/docs/node_modules/.astro before every build.",
    "The boundary page deliberately ships prose plus a bulleted five-responsibility list, not the 'ownership tables' that ORI-CONT-004's SC-ORI-CONT-004-4 wording says its verifier will read — tables are Sprint 06 scope per my task contract, so a strict literal reading of that scenario would false-fail the Sprint 05 slice."
  ],
  "findings": [
    "tests/harness/docs-preview.ts:67 waitForAstroPageLoad calls page.evaluate, which hangs until the 30s timeout in the chromium-nojs project (JavaScript disabled) — no-JS specs must skip it; my spec gates on testInfo.project.name === 'chromium-nojs', and a nojs-safe harness variant would prevent every future spec from rediscovering this.",
    "Playwright requires the first test-callback argument to be a destructuring pattern while Biome forbids the empty pattern — filesystem-only tests must use async () with no parameters, and testInfo-dependent captures then need a separate shared-capture helper (precedent: tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts:183).",
    "pnpm lint (biome ci .) enforces formatting, not just lint rules — npx biome check can pass while biome ci fails on 'File content differs from formatting output'; run biome format --write on new spec files before gating.",
    "Spec-file paths to repo sources must resolve via new URL('../../'+rel, import.meta.url) — import.meta.dir is Bun-only and a one-level '../' silently points inside tests/, producing ENOENT reds for the wrong reason.",
    "False source oracles are easy here: message.tsx:25 names react-native-enriched-markdown in a doc comment, so a string-includes absence check fails; assert the import graph (regex on from '...') when the claim is 'the core does not depend on the native module'."
  ],
  "scope_impact": [
    {
      "target": "ORI-AST-004",
      "found": "AC-1 requires visiting /components/streamdown as one of five item destinations that return HTTP 200.",
      "change": "Unsatisfiable until a streamdown destination exists (verified 404); either land the destination fix first or amend its AC to drop that URL."
    },
    {
      "target": "ORI-VIS-003",
      "found": "AC-2 requires the query 'streamdown' to produce a readable result naming the /components/streamdown destination.",
      "change": "Same destination dependency; note the boundary prose is already indexable for 'streamdown', 'renderMarkdown' and 'dev client' (all appear in explanatory paragraphs)."
    },
    {
      "target": "ORI-AST-010",
      "found": "Its AC-3 (FLOW-SHELL-07) requires Enter on a streamdown search result to reach /components/streamdown with 200 and matching content.",
      "change": "Blocked on the same missing destination; the prose side of its query needs (renderMarkdown/streamdown/dev client explanations) is delivered and indexed via data-pagefind-body on the boundary page."
    },
    {
      "target": "GATE:FLOW-SHELL-07-cmdk-open-search-navigate",
      "found": "Gate steps at human-flows.json:730 and human-flows.json:742 require visiting /components/streamdown as one of 'five existing item destinations'.",
      "change": "That gate step stays RED until the destination lands; recommend the orchestrator own the fix as an astro-side task (a docs-owned integration page under apps/docs/src/pages or an extension of the item fan-out in scripts/docs-data/prebuild.ts, accepting that gates.ts deliberately treats matrix names as non-items) with any registry-level streamdown item owned separately by a registry task — both were outside my write scope; one-line content edit on my page adds the link once it resolves."
    },
    {
      "target": "ORI-CONT-004",
      "found": "It consumes my boundary page for Introduction's ownership link and its scenario text expects 'ownership tables', and it will later point the example sentence at apps/example/docs/live-chat.md.",
      "change": "Expect prose plus the bulleted five-responsibility list (not tables) for Sprint 05, and after the live integration lands update the final section's example link/target sentence in owns-vs-does-not-own.md per its own contract."
    },
    {
      "target": "ORI-VIS-005",
      "found": "It composes the branded missing-page surface from my not-found.md, whose source carries exactly two markdown links (Introduction, Browse components) plus the Search documentation imperative sentence.",
      "change": "Bind the branded search control to the 'Search documentation' label and keep the two direct links intact so the no-JavaScript recovery floor and the AC-4 'exactly two links' source contract both hold."
    },
    {
      "target": "ORI-CONT-001",
      "found": "I took section 'getting-started', order 50 in the docs collection for owns-vs-does-not-own.",
      "change": "Pick order values that leave 50 free (or accept id-tiebreak ordering — sort is section, then order, then id; collisions are tolerated, not errors)."
    },
    {
      "target": "ROADMAP",
      "found": "Sprint 06 retains the full scannable ownership tables and complete gap inventory for UC-DOCS-04.",
      "change": "No second boundary page was created; Sprint 06 work should extend /docs/owns-vs-does-not-own (or replace its list with tables) rather than adding a parallel boundary route, per the no-duplicate-boundary constraint."
    }
  ],
  "feedback": [
    "Give each parallel task its own preview port (or add strict ownership verification before reuseExistingServer accepts a listener) — a foreign dist answering your tests is undetectable from test output alone and cost this task several invalid cycle captures.",
    "Extend the ordered docs build chain (pnpm e2e:docs or prebuild) to clear apps/docs/.astro, apps/docs/dist, and apps/docs/node_modules/.astro before astro build so content-collection RED/GREEN can never be satisfied by a replayed Astro content store.",
    "Add a nojs-safe page-load helper to tests/harness/docs-preview.ts so chromium-nojs specs stop timing out inside waitForAstroPageLoad's page.evaluate."
  ]
}
```
