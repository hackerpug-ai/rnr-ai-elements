<!-- Template Version: 5.2.0 -->
# ORI-VIS-005: Compose the branded missing-page search recovery surface

## What this does

Visitors reaching an unknown URL see branded recovery, can use available search or ordinary links, and retain readable recovery across themes, mobile widths and JavaScript availability.

## Why

An unknown URL needs a useful route back into the docs. This composition presents approved recovery content and the existing search and ordinary links within the shared visual system.

## How to verify

Run `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs` against the fresh built candidate. Open a genuinely missing URL, use search to recover to the canonical boundary page, and repeat with JavaScript disabled using Components. Inspect both theme captures and the deployment owner's actual public-origin capture.

## Scope

Compose `apps/docs/src/pages/404.astro`, author its owned browser probes, and capture recovery evidence within the exact allowlist. Search logic, authored recovery wording, HTTP status handling and deployment remain with their owners.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

### Metadata

- Status: Backlog
- Assignee: frontend-designer
- Priority: P2 · Points: 2 · Type: DOCS
- Dependency phase: After ORI-VIS-001, ORI-VIS-003 and ORI-AST-009
- Proposed By: frontend-designer · Co-authored By: []
- TDD_MODE: red_first · RED_GREEN_REQUIRED: true
- Sprint: [SPRINT.md](./SPRINT.md) · sprint-05-orient-search
- Planned date: 2026-09-14
- Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
- AGENT: planner=frontend-designer | implementer=frontend-designer | reviewer=frontend-designer
- PROGRESS: Derived from per-AC TDD_STATE: 0/5 started.

### Outcome

Visitors reaching an unknown URL see branded recovery, can use available search or ordinary links, and retain readable recovery across themes, mobile widths and JavaScript availability.

### Critical constraints

- Stay within the exact write allowlist. Preserve shared WIP in the assigned isolated candidate; do not change server status handling, deployment, redirects or rollback.
- Reuse the shared shell, PageHeader, Prose, Callout and Button. Consume approved recovery wording and the real shared search action; do not author copy, event handlers, dialog state or focus logic.
- Expose search only when ORI-AST-009's real interaction is available. Preserve ordinary /components and /registry links in server HTML with JavaScript disabled.
- Keep one content column at every width and use existing typography, color, spacing and focus tokens. Add no deployment badge, status dashboard or maintainer UI.
- Prove behavior through real built-site HTTP and browser interactions. Never inject views, mock HTTP/Pagefind, use canned results, skip a required target or substitute local evidence for public-origin proof.

### Done when

- [ ] AC-1 and AC-2 prove real missing-route recovery, ordinary destinations and the shared search interaction.
- [ ] AC-3 and AC-4 prove server-rendered no-JavaScript recovery and inspected theme/mobile presentation.
- [ ] AC-5 has the deployment owner's actual public-origin capture; local verification alone carries no public deployment claim.
- [ ] The exact presentation command, pnpm typecheck and pnpm lint pass on the reviewed candidate; seeded evidence includes observed values.
- [ ] Changed paths stay inside write_allowed; independent frontend-designer review accepts the evidence and boundary compliance.

### Acceptance criteria

Classification: Documentation presentation composition over already-owned shell/search capabilities. This task changes the 404 page's visual assembly, not search, routing or deployment logic; its task-owned proof remains real e2e with flow_ref:null. Every AC is non-primary. ORI-AST-010 retains the shared journey.

#### AC-1: Unknown-path composition and ordinary destinations

GIVEN a fresh built preview and two genuinely absent URLs WHEN a visitor opens each URL and follows its recovery links THEN branded recovery appears; Components and Registry open their real pages.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/recovery-presentation.spec.ts
- TEST_FUNCTION: ORI-VIS-005-ac-1
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-1`
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-VIS-005-1","use_case_ref":"UC-DELIV-04","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["The route returns an empty/default error page or the recovery links are disconnected placeholders."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Requested URLs and 404/200 statuses; Page not found, Components and Registry screenshots; actual destination URLs."]},"cases":[{"start_ref":"built_recovery","action":{"actor":"user","steps":["Navigate to each run-bound missing path through the real server; observe the HTTP response and rendered recovery content.","Follow the recovery link to /components; return to the missing URL and follow the recovery link to /registry."]},"end_state":{"must_observe":["Each unknown URL returns HTTP 404 with the heading `Page not found` inside the shared branded shell.","Recovery links have href `/components` and `/registry`; following each returns HTTP 200 and its matching page heading.","The approved explanation and hint accompany the title in 1 content column."],"must_not_observe":["A blank/default 404 body with no recovery content.","The original missing URL remains after following a placeholder recovery link."]}}]}
```

#### AC-2: Shared search recovers to canonical content

GIVEN the recovery page and the real shared search integration WHEN a visitor invokes the available search action and selects renderMarkdown's boundary result THEN SearchDialog focuses its input and opens the canonical boundary page.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/recovery-presentation.spec.ts
- TEST_FUNCTION: ORI-VIS-005-ac-2
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-2`
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-VIS-005-2","use_case_ref":"UC-SHELL-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["The recovery action is a no-op, a duplicate static dialog replaces SearchDialog, or Pagefind results are mocked."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Dialog/input focus, real Pagefind request and boundary result, final boundary URL/content; no-JavaScript fallback observation."]},"cases":[{"start_ref":"built_recovery","action":{"actor":"user","steps":["On the JavaScript-enabled desktop and mobile projects, open a run-bound missing URL and activate its real shared search action.","Observe the existing SearchDialog input focus; type renderMarkdown and select the boundary result using the real UI."]},"end_state":{"must_observe":["Exactly 1 shared SearchDialog opens with `aria-modal=true` and its search input focused.","The real result navigates to `/docs/owns-vs-does-not-own`, returns HTTP 200 and contains `renderMarkdown`."],"must_not_observe":["No open dialog after the recovery action.","An empty/canned result surface or the unchanged missing URL after selection."]}},{"start_ref":"nojs_recovery","action":{"actor":"user","steps":["On chromium-nojs, open the missing URL and inspect the unavailable search action; follow the ordinary Components recovery link."]},"end_state":{"must_observe":["The recovery link reaches `/components` with HTTP 200.","The count of exposed or focusable nonfunctional recovery search buttons is 0."],"must_not_observe":["A dead search button or a blank recovery page with no ordinary links."]}}]}
```

#### AC-3: No-JavaScript recovery remains useful

GIVEN a browser with JavaScript disabled before navigation WHEN a visitor opens an unknown URL and follows each ordinary recovery link THEN readable recovery remains and both destinations load without a dead search button.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/recovery-presentation.spec.ts
- TEST_FUNCTION: ORI-VIS-005-ac-3
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-3`
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-VIS-005-3","use_case_ref":"UC-DELIV-04","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["Recovery content is omitted from server HTML, links are click-handler no-ops, or an unavailable search control stays exposed."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["JavaScript-disabled context configuration, actual response HTML/status, both destination URLs, and nojs-links.png."]},"cases":[{"start_ref":"nojs_recovery","action":{"actor":"user","steps":["Navigate to the run-bound missing URL without enabling JavaScript; inspect the actual HTML response and visible title, explanation and hint.","Use ordinary Components and Registry links, returning to the missing URL between navigations; capture nojs-links.png."]},"end_state":{"must_observe":["HTTP 404 HTML includes `Page not found`, the approved recovery copy, and hrefs `/components` and `/registry`.","Both links navigate to HTTP 200 pages with their respective `Components` and `Registry` headings.","Visible or keyboard-focusable dead recovery search controls total 0."],"must_not_observe":["Blank initial HTML, empty recovery content or placeholder hrefs.","The missing-page start state persists after an ordinary link is followed."]}}]}
```

#### AC-4: Theme and mobile presentation

GIVEN the composed recovery page at configured desktop and mobile viewports WHEN visitors view both themes and the no-JavaScript fallback THEN header, title, hint and actions remain readable in one column.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/recovery-presentation.spec.ts
- TEST_FUNCTION: ORI-VIS-005-ac-4
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-4`
- TEST_TIER: e2e
- VERIFICATION_SERVICE: Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-VIS-005-4","use_case_ref":"UC-DELIV-04","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["The page uses hardcoded theme colors, duplicates the shell, or hides/clips recovery actions at mobile width."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Inspected light/dark screenshots, actual viewport sizes, action bounds and focus indicator; readable no-JavaScript fallback."]},"cases":[{"start_ref":"built_recovery","action":{"actor":"user","steps":["Use the actual theme control to view the same missing URL in light and dark on chromium-desktop and chromium-mobile.","Inspect header, title, explanation, hint and action bounds; capture unknown-path-light.png and unknown-path-dark.png with project/run metadata."]},"end_state":{"must_observe":["The `Page not found` heading, approved hint and `/components` and `/registry` actions are legible in both `light` and `dark` themes.","At each configured viewport, recovery content has 1 column and 0 clipped or horizontally overflowing recovery actions.","The focused recovery action has a 2px outline with 2px offset in the resolved `--ring` color."],"must_not_observe":["A blank or empty title/hint, invisible theme text or clipped recovery links.","A second recovery column or duplicate placeholder shell."]}},{"start_ref":"nojs_recovery","action":{"actor":"user","steps":["View the unknown page with JavaScript disabled at the configured viewport; inspect its server-rendered theme and ordinary action layout."]},"end_state":{"must_observe":["The no-JavaScript `Page not found` title and both recovery links remain readable in 1 column.","Clipped recovery actions total 0."],"must_not_observe":["A blank recovery region or no readable ordinary links."]}}]}
```

#### AC-5: Public-origin presentation handoff

GIVEN the deployment owner's reviewed candidate on the real public origin WHEN the owner runs the recovery presentation probe on a fresh unknown public URL THEN the same branded surface and working recovery links have public-origin evidence.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/recovery-presentation.spec.ts
- TEST_FUNCTION: ORI-VIS-005-ac-5
- VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-5`
- TEST_TIER: e2e
- VERIFICATION_SERVICE: https://rnraielements.com over real public DNS/TLS and Playwright Chromium
- SURFACE_POLICY: .spec/e2e-policy/surface.json
- COLDBOOT_POLICY: .spec/e2e-policy/coldboot.json
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-ORI-VIS-005-5","use_case_ref":"UC-DELIV-04","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"https://rnraielements.com over real public DNS/TLS and Playwright Chromium","negative_control":{"would_fail_if":["A stale/default public 404 is served, public links are disconnected, or a local screenshot is substituted for the live public response."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Actual public URL, DNS/TLS success, 404/200 responses, candidate identity, inspected public-unknown-path.png."]},"cases":[{"start_ref":"public_recovery","action":{"actor":"user","steps":["Using direct Playwright navigation to the literal public HTTPS origin, open the run-bound unknown path without modifying deployment configuration.","Record the real response status, origin and candidate identity; inspect the branded content and follow Components and Registry recovery links.","Capture public-unknown-path.png from this public browser session; exercise the available shared search on JavaScript-enabled projects and the ordinary fallback on chromium-nojs."]},"end_state":{"must_observe":["The requested `https://rnraielements.com/ori-vis-005-missing-<run-id>` returns HTTP 404 with `Page not found` and the same approved recovery content/composition.","Public `/components` and `/registry` links return HTTP 200; enabled search focuses the shared dialog input.","`public-unknown-path.png` is bound to the actual public URL, published candidate identity and fresh run ID."],"must_not_observe":["A blank/default public error body or empty recovery links.","A localhost/preview screenshot, stale candidate or no public response presented as deployment proof."]}}]}
```

### Test criteria

- **TC-1** (maps_to_ac: AC-1): Both absent paths return branded HTTP 404 recovery, and both ordinary links reach their named HTTP 200 destinations. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-1`
- **TC-2** (maps_to_ac: AC-2): Enabled search opens the shared focused dialog and navigates to the real renderMarkdown boundary result; the no-JavaScript project proves its ordinary fallback. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-2`
- **TC-3** (maps_to_ac: AC-3): JavaScript-disabled HTML and browser navigation preserve readable recovery and both ordinary links with zero dead search controls. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-3`
- **TC-4** (maps_to_ac: AC-4): Both themes and the configured mobile viewport preserve a readable single-column layout, unclipped actions and the shared focus indicator. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-4`
- **TC-5** (maps_to_ac: AC-5): The public screenshot and successful recovery observations come from the real HTTPS origin serving the same reviewed candidate. VERIFY: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-5`

### Shared fixtures

These fixtures are defined once here and repeated exactly in the Requirement Contract. Every scenario references them by start_ref.

```json
{"built_recovery":{"description":"Fresh candidate dist and Pagefind index served by the owned Astro preview on localhost:4321; a new browser starts at /docs/introduction.","seed_method":"cli","records":["Run pnpm --filter @rnr-ai-elements/docs build through the real prebuild chain before preview.","Record candidate/source, lockfile, dist, test and policy hashes with a fresh run ID; verify port ownership.","Real destinations /components, /registry, /components/message and /docs/owns-vs-does-not-own are built; the index contains renderMarkdown and Message.","Allocate two absent paths /ori-vis-005-missing-<run-id> and /docs/ori-vis-005-missing-<run-id>; create no routes or injected responses for them."]},"nojs_recovery":{"description":"The same freshly built preview is opened in a real browser context with JavaScript disabled before navigation.","seed_method":"ui_flow","records":["Use the configured chromium-nojs project or an explicitly JavaScript-disabled context at the current project's viewport.","Start at /docs/introduction with no recovery page loaded; retain real HTTP requests and ordinary navigation.","Use the same run-bound unknown paths and real /components and /registry destinations as built_recovery."]},"public_recovery":{"description":"The deployment owner has made the reviewed candidate available at https://rnraielements.com and supplied its source/dist identity for read-only browser observation.","seed_method":"recorded_external","records":["Require ordinary public DNS and trusted HTTPS for https://rnraielements.com; do not substitute a preview host or localhost.","Bind the owner-supplied published candidate identity to the locally reviewed 404 composition and record actual public response identity.","Start a fresh browser at https://rnraielements.com/docs/introduction and allocate an absent /ori-vis-005-missing-<run-id> path.","An unavailable origin, mismatched candidate or missing identity is a failed prerequisite; no captured local image or skipped test replaces public observation."]}}
```

### Scope: file-level write permissions

writeAllowed:

- apps/docs/src/pages/404.astro
- tests/sprint-05-orient-search/recovery-presentation.spec.ts
- tests/sprint-05-orient-search/evidence/recovery/
- tests/sprint-05-orient-search/evidence/recovery/unknown-path-light.png
- tests/sprint-05-orient-search/evidence/recovery/unknown-path-dark.png
- tests/sprint-05-orient-search/evidence/recovery/nojs-links.png
- tests/sprint-05-orient-search/evidence/recovery/public-unknown-path.png

writeProhibited:

- HTTP status handling
- Cloudflare deployment configuration
- Search event or focus-management logic
- Authored recovery wording
- Redirects and rollback workflows
- Every path outside writeAllowed.

### Boundaries

Always:

- Read the dependency handoffs and reuse existing prop/slot contracts before composing 404.astro.
- Preserve the approved title, explanation and hint; route any missing wording or search capability to its owner.
- Use owned preview/browser resources and append run-bound evidence under evidence/recovery/.
- Keep all acceptance criteria non-primary; ORI-AST-010 owns the shared journey.
- Run the exact presentation matrix and inspect its screenshots; preserve failures and missing prerequisites honestly.

Ask first:

- Changes outside the allowlist, including shared components, global styles, search behavior, routing or deployment.
- New dependencies, new recovery wording or a change to the locked boundary contract.

### Deliverable

- `apps/docs/src/pages/404.astro`: compose the existing shell, dependency-owned PageHeader and Prose, existing Callout and Button, approved copy and real shared search action.
- `tests/sprint-05-orient-search/recovery-presentation.spec.ts`: implement the five exact AC test tokens, real browser actions and meaningful JavaScript/no-JavaScript outcomes.
- `tests/sprint-05-orient-search/evidence/recovery/`: append run-bound RED/GREEN observations and manifests. Retain `unknown-path-light.png`, `unknown-path-dark.png`, `nojs-links.png` and `public-unknown-path.png` at the exact allowed paths, identifying each capture's source run.

### Agent instructions: RED → GREEN → REFACTOR

1. Read each AC and the dependency handoffs. Author its exact test token in the owned spec using the real shared fixtures.
2. Before page implementation, run the AC's exact VERIFY command and preserve its observed functional failure with source/run identity. Missing services, approved copy or dependency interfaces are blockers, not functional RED. All TDD_STATE values remain none in this plan.
3. After RED is verified, make the minimal presentation change in 404.astro. Consume the existing search/availability/focus contract; do not implement those behaviors. Run the same test and preserve GREEN observations.
4. Refactor only the allowed page/test when needed. Rerun affected cases, then the exact matrix, typecheck and lint. The public probe requires the deployment owner's matching published candidate; local success cannot satisfy it.
5. Submit the candidate and evidence for a separate frontend-designer review. The orchestrator retains integration, shared-journey verification and lifecycle ownership.

### Reading list

1. `apps/docs/src/layouts/DocsLayout.astro` [PRIMARY PATTERN], lines 1-65: shared Header/Footer, theme initialization and page slot.
2. `apps/docs/src/components/Button.astro`, all lines: href-driven anchors, attribute pass-through, variants and token focus ring.
3. `apps/docs/src/components/Callout.astro`, all lines: existing info hint, title/body and link slot.
4. `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md`, lines 386-410: six-region not-found composition and identical mobile column.
5. `tests/harness/docs-preview.ts`, all lines: built-dist preview ownership and real navigation. Its localhost-only helper cannot navigate to the public origin.

### Design and reference guidance

- Compose R1 Header, R2 PageHeader, R3 Prose, R4 Callout, R5 Button actions and R6 Footer in one content column at every width.
- Consume PageHeader and Prose from ORI-VIS-001 and the shared presentation handoff from ORI-VIS-003 after those dependencies land. These are dependency outputs, not observed completed work in this charter.
- Use Button's href mode for Components and Registry. Consume ORI-AST-009's real trigger and action-availability contract without adding event or focus logic.
- Use the existing typography, --foreground, --muted-foreground, --primary, --border, --measure and --ring tokens. Preserve the 2px focus outline and 2px offset.
- Keep this composition static apart from existing shared interactions. Add no new island, animation, visual primitive, deployment badge or maintainer UI.

### Coding standards

- Follow AGENTS.md and existing Astro composition; use valid accessible docs markup.
- Keep page styling local and token-governed. Shared components and global styles remain read-only.
- Use real Playwright navigation and observed product headings/destinations. Generic body/main presence cannot be the success oracle.
- Never use setContent, injected state, route.fulfill, mocked Pagefind, synthetic HTML, test-only product hooks, retries or skipped targets as proof.
- Run the configured gates during implementation. This rendering pass runs only read-only charter validation.

### Runtime commands

- Build: `pnpm --filter @rnr-ai-elements/docs build`
- Test: `pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`

### Evidence and verification gates

1. Authoring: pipe the exact `{fixtures, requirements}` object to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py` with no positional argument; require exit 0 and zero findings.
2. RED: capture actual preimplementation functional failures from the owned browser cases. Record command, test token, candidate identity and failure output under the owned recovery evidence directory. Setup failures do not count as RED.
3. Fresh candidate: run the real docs build/prebuild chain, including registry/gallery data, Astro output and Pagefind. Record source, lockfile and dist hashes; verify ownership of localhost:4321.
4. Browser proof: run the exact presentation matrix and each AC's direct grep binding. Every declared mode must exercise its real applicable behavior. No required case can pass by omission.
5. Static gates: `pnpm typecheck` and `pnpm lint` must exit 0. The current root typecheck covers root/registry; it does not establish whole-example type safety.
6. Seeded evidence: inspect all four required screenshots and capture actual URL/status, content, focus, navigation, project, viewport, theme, JavaScript mode and run/source identity. Public evidence must come from the actual public origin serving the matching candidate.
7. Independent review: a separate frontend-designer reviewer replays the relevant real probes, checks scope compliance and scans touched production/tests for stubs, placeholders, no-ops, skips and deferred core behavior.
8. Sprint integration: the orchestrator validates flow coverage; ORI-AST-010 runs the unchanged shared journey after integration and owns its canonical proof.red.

The final read-only scenario validation exited 0 with five scenarios and zero findings. Product verification, public observation and implementation have not run during rendering. All product evidence paths remain planned_output_not_observed.

### Boundary contracts and capabilities

- A genuinely unknown path displays the branded missing-page content through the real route and server behavior.
- The search action opens the existing SearchDialog and focuses its input.
- Components and Registry links navigate to real pages.
- The no-JavaScript response retains readable recovery content and working ordinary links, without a dead search button.
- Header, title, hint and actions remain readable in both themes and at the configured mobile viewport.
- The deployment owner can capture the same branded surface on the real public origin; a local screenshot alone does not establish deployment.

Touches: CAP-DOCS-01.

Provides: branded single-column 404 composition, task-owned real browser probes and four planned screenshot outputs.

Consumes: existing DocsLayout/Header/Footer/Callout/Button and tokens; dependency-owned PageHeader/Prose/search integration; approved recovery copy; actual /components and /registry pages; fresh dist/Pagefind; deployment-owner public candidate identity.

PRD references:

- `.spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md`, not-found /404, lines 386-410.
- `.spec/prds/docs-site/11-technical-requirements/10-routing.md`, /404 recovery and UC-SHELL-02, UC-SHELL-04, UC-DELIV-04.
- `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`, CAP-DOCS-01.

### Dependencies and flow support

- Depends on ORI-VIS-001: shared PageHeader and Prose presentation primitives.
- Depends on ORI-VIS-003: shared visual/search presentation contract.
- Depends on ORI-AST-009: real search recovery integration, input focus and action availability/no-JavaScript contract.
- Blocks: []. This rendering adds no dependency edges.
- Supports ORI-GATE-06 and FLOW-SHELL-07-cmdk-open-search-navigate with primary:false. ORI-AST-010 remains the journey's primary_owner.
- Shared test: `tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts`.
- Shared test token: `FLOW-SHELL-07-cmdk-open-search-navigate`.
- Shared run command: `pnpm exec playwright test tests/sprint-05-orient-search/cmdk-open-search-navigate.spec.ts --grep FLOW-SHELL-07-cmdk-open-search-navigate`.
- Shared planned artifact: `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/run.json`.
- Shared canonical RED: `tests/sprint-05-orient-search/evidence/FLOW-SHELL-07-cmdk-open-search-navigate/proof.red`. ORI-AST-010 owns it; never substitute red.txt or run.red.
- Shared policies: `.spec/e2e-policy/surface.json` and `.spec/e2e-policy/coldboot.json`.
- Shared-flow co-author provenance: astro-planner. This task's co_authored_by remains [].

### Context and specification

Current gap: The checked source supplies DocsLayout, Callout and Button. The locked candidate still requires the composed recovery surface and real runtime evidence; no product or public verification ran during charter rendering.

Implementation surface: Compose the absorbed custom 404 from the existing shell, shared PageHeader and Prose, existing Callout and Button. Show Page not found, a concise explanation, the real shared search action and ordinary Components and Registry links. Keep the layout single-column at all widths. The search action appears only when its real interaction is available; plain recovery links remain useful without JavaScript. Use this same surface when the deployment owner checks a real unknown public path. Do not add a deployment badge, status dashboard or other maintainer UI.

Agent rationale: frontend-designer owns visual composition. A separate frontend-designer reviewer checks reuse, presentation and real browser evidence. Search logic, copy and deployment remain with their owners.

Execution prerequisites:

- Authorize later implementation and external actions separately. Use the assigned isolated candidate and owned scratch roots; preserve shared WIP.
- Recheck candidate identity against source SHA 38034e972490945b684f5bd5a706bca0479dc659 and reviewed dependency commits. Record lockfile, dist, driver, test and policy hashes.
- Require approved copy and working dependency interfaces. Missing search/focus/availability behavior is an owner blocker, never permission to implement prohibited logic here.
- Require a fresh real dist/index and owned localhost:4321. Refuse unowned listeners.
- The public observation is a read-only deployment-owner handoff after the matching candidate is public. Do not deploy, change DNS/TLS, bypass certificates or substitute a preview origin.
- Close owned browser contexts, dismiss dialogs and stop only recorded owned children. Preserve prior run evidence and release only owned resources.

Immutable sprint gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The sprint retains 13 flows: 9 task flows and 4 journeys; 36 tasks and 131 points. This task returns no journey_proofs and adds no blocked_flows records.

### Review

Must pass:

- All five ACs have matching real scenarios, exact task tests and seeded observed evidence.
- Actual functional failures support RED; setup errors and authored flags do not.
- All four screenshot contracts are met, with actual public provenance for the public capture.
- Writes stay within the allowlist; search, status, copy and deployment ownership remain intact.
- The reviewed candidate passes the required matrix, typecheck and lint, and all completion claims match observed scope.

Should verify:

- The page follows the existing shell and prescribed six-region order.
- Title, hint and ordinary links remain readable across themes and mobile widths.
- Available search is recognizable and retains its visible focus ring.
- No-JavaScript recovery uses ordinary server-rendered HTML navigation.
- Captures show actual content and destination observations, not only test-runner success.

Verdict: APPROVED or NEEDS_FIXES. A NEEDS_FIXES report must name the failing AC, observed behavior and actionable file/line feedback. No review verdict is asserted in this backlog charter.

### Out of scope

- HTTP status handling, Cloudflare deployment configuration, redirects and rollback workflows.
- Search event, state, availability or focus-management implementation.
- Authored recovery wording, new shared primitives, dependencies or global theme changes.
- Registry/native/example implementation or unrelated repairs.
- Ownership or modification of ORI-AST-010's journey test, run.json or proof.red.
- Deployment badges, status dashboards, other maintainer UI or another layout column.

### Provenance

- Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/frontend-designer-absorb-prerequisites.json
- Source task IDs: [ORI-VIS-005]
- Supersedes: []
- Artifact status: planned_output_not_observed
- Execution isolation: Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-VIS-005","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_recovery":{"description":"Fresh candidate dist and Pagefind index served by the owned Astro preview on localhost:4321; a new browser starts at /docs/introduction.","seed_method":"cli","records":["Run pnpm --filter @rnr-ai-elements/docs build through the real prebuild chain before preview.","Record candidate/source, lockfile, dist, test and policy hashes with a fresh run ID; verify port ownership.","Real destinations /components, /registry, /components/message and /docs/owns-vs-does-not-own are built; the index contains renderMarkdown and Message.","Allocate two absent paths /ori-vis-005-missing-<run-id> and /docs/ori-vis-005-missing-<run-id>; create no routes or injected responses for them."]},"nojs_recovery":{"description":"The same freshly built preview is opened in a real browser context with JavaScript disabled before navigation.","seed_method":"ui_flow","records":["Use the configured chromium-nojs project or an explicitly JavaScript-disabled context at the current project's viewport.","Start at /docs/introduction with no recovery page loaded; retain real HTTP requests and ordinary navigation.","Use the same run-bound unknown paths and real /components and /registry destinations as built_recovery."]},"public_recovery":{"description":"The deployment owner has made the reviewed candidate available at https://rnraielements.com and supplied its source/dist identity for read-only browser observation.","seed_method":"recorded_external","records":["Require ordinary public DNS and trusted HTTPS for https://rnraielements.com; do not substitute a preview host or localhost.","Bind the owner-supplied published candidate identity to the locally reviewed 404 composition and record actual public response identity.","Start a fresh browser at https://rnraielements.com/docs/introduction and allocate an absent /ori-vis-005-missing-<run-id> path.","An unavailable origin, mismatched candidate or missing identity is a failed prerequisite; no captured local image or skipped test replaces public observation."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"Unknown-path composition and ordinary destinations","primary":false,"description":"GIVEN a fresh built preview and two genuinely absent URLs WHEN a visitor opens each URL and follows its recovery links THEN branded recovery appears; Components and Registry open their real pages.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/recovery-presentation.spec.ts","test_function":"ORI-VIS-005-ac-1","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-1","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-VIS-005-1","use_case_ref":"UC-DELIV-04","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["The route returns an empty/default error page or the recovery links are disconnected placeholders."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Requested URLs and 404/200 statuses; Page not found, Components and Registry screenshots; actual destination URLs."]},"cases":[{"start_ref":"built_recovery","action":{"actor":"user","steps":["Navigate to each run-bound missing path through the real server; observe the HTTP response and rendered recovery content.","Follow the recovery link to /components; return to the missing URL and follow the recovery link to /registry."]},"end_state":{"must_observe":["Each unknown URL returns HTTP 404 with the heading `Page not found` inside the shared branded shell.","Recovery links have href `/components` and `/registry`; following each returns HTTP 200 and its matching page heading.","The approved explanation and hint accompany the title in 1 content column."],"must_not_observe":["A blank/default 404 body with no recovery content.","The original missing URL remains after following a placeholder recovery link."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Shared search recovers to canonical content","primary":false,"description":"GIVEN the recovery page and the real shared search integration WHEN a visitor invokes the available search action and selects renderMarkdown's boundary result THEN SearchDialog focuses its input and opens the canonical boundary page.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/recovery-presentation.spec.ts","test_function":"ORI-VIS-005-ac-2","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-2","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-VIS-005-2","use_case_ref":"UC-SHELL-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["The recovery action is a no-op, a duplicate static dialog replaces SearchDialog, or Pagefind results are mocked."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Dialog/input focus, real Pagefind request and boundary result, final boundary URL/content; no-JavaScript fallback observation."]},"cases":[{"start_ref":"built_recovery","action":{"actor":"user","steps":["On the JavaScript-enabled desktop and mobile projects, open a run-bound missing URL and activate its real shared search action.","Observe the existing SearchDialog input focus; type renderMarkdown and select the boundary result using the real UI."]},"end_state":{"must_observe":["Exactly 1 shared SearchDialog opens with `aria-modal=true` and its search input focused.","The real result navigates to `/docs/owns-vs-does-not-own`, returns HTTP 200 and contains `renderMarkdown`."],"must_not_observe":["No open dialog after the recovery action.","An empty/canned result surface or the unchanged missing URL after selection."]}},{"start_ref":"nojs_recovery","action":{"actor":"user","steps":["On chromium-nojs, open the missing URL and inspect the unavailable search action; follow the ordinary Components recovery link."]},"end_state":{"must_observe":["The recovery link reaches `/components` with HTTP 200.","The count of exposed or focusable nonfunctional recovery search buttons is 0."],"must_not_observe":["A dead search button or a blank recovery page with no ordinary links."]}}]}},{"id":"AC-3","type":"acceptance_criterion","name":"No-JavaScript recovery remains useful","primary":false,"description":"GIVEN a browser with JavaScript disabled before navigation WHEN a visitor opens an unknown URL and follows each ordinary recovery link THEN readable recovery remains and both destinations load without a dead search button.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/recovery-presentation.spec.ts","test_function":"ORI-VIS-005-ac-3","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-3","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-VIS-005-3","use_case_ref":"UC-DELIV-04","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["Recovery content is omitted from server HTML, links are click-handler no-ops, or an unavailable search control stays exposed."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["JavaScript-disabled context configuration, actual response HTML/status, both destination URLs, and nojs-links.png."]},"cases":[{"start_ref":"nojs_recovery","action":{"actor":"user","steps":["Navigate to the run-bound missing URL without enabling JavaScript; inspect the actual HTML response and visible title, explanation and hint.","Use ordinary Components and Registry links, returning to the missing URL between navigations; capture nojs-links.png."]},"end_state":{"must_observe":["HTTP 404 HTML includes `Page not found`, the approved recovery copy, and hrefs `/components` and `/registry`.","Both links navigate to HTTP 200 pages with their respective `Components` and `Registry` headings.","Visible or keyboard-focusable dead recovery search controls total 0."],"must_not_observe":["Blank initial HTML, empty recovery content or placeholder hrefs.","The missing-page start state persists after an ordinary link is followed."]}}]}},{"id":"AC-4","type":"acceptance_criterion","name":"Theme and mobile presentation","primary":false,"description":"GIVEN the composed recovery page at configured desktop and mobile viewports WHEN visitors view both themes and the no-JavaScript fallback THEN header, title, hint and actions remain readable in one column.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/recovery-presentation.spec.ts","test_function":"ORI-VIS-005-ac-4","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-4","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-VIS-005-4","use_case_ref":"UC-DELIV-04","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"Built Astro docs on http://localhost:4321, real Pagefind index, and Playwright Chromium","negative_control":{"would_fail_if":["The page uses hardcoded theme colors, duplicates the shell, or hides/clips recovery actions at mobile width."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Inspected light/dark screenshots, actual viewport sizes, action bounds and focus indicator; readable no-JavaScript fallback."]},"cases":[{"start_ref":"built_recovery","action":{"actor":"user","steps":["Use the actual theme control to view the same missing URL in light and dark on chromium-desktop and chromium-mobile.","Inspect header, title, explanation, hint and action bounds; capture unknown-path-light.png and unknown-path-dark.png with project/run metadata."]},"end_state":{"must_observe":["The `Page not found` heading, approved hint and `/components` and `/registry` actions are legible in both `light` and `dark` themes.","At each configured viewport, recovery content has 1 column and 0 clipped or horizontally overflowing recovery actions.","The focused recovery action has a 2px outline with 2px offset in the resolved `--ring` color."],"must_not_observe":["A blank or empty title/hint, invisible theme text or clipped recovery links.","A second recovery column or duplicate placeholder shell."]}},{"start_ref":"nojs_recovery","action":{"actor":"user","steps":["View the unknown page with JavaScript disabled at the configured viewport; inspect its server-rendered theme and ordinary action layout."]},"end_state":{"must_observe":["The no-JavaScript `Page not found` title and both recovery links remain readable in 1 column.","Clipped recovery actions total 0."],"must_not_observe":["A blank recovery region or no readable ordinary links."]}}]}},{"id":"AC-5","type":"acceptance_criterion","name":"Public-origin presentation handoff","primary":false,"description":"GIVEN the deployment owner's reviewed candidate on the real public origin WHEN the owner runs the recovery presentation probe on a fresh unknown public URL THEN the same branded surface and working recovery links have public-origin evidence.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/recovery-presentation.spec.ts","test_function":"ORI-VIS-005-ac-5","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-5","test_tier":"e2e","verification_service":"https://rnraielements.com over real public DNS/TLS and Playwright Chromium","surface_policy":".spec/e2e-policy/surface.json","coldboot_policy":".spec/e2e-policy/coldboot.json","tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-VIS-005-5","use_case_ref":"UC-DELIV-04","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"e2e","verification_service":"https://rnraielements.com over real public DNS/TLS and Playwright Chromium","negative_control":{"would_fail_if":["A stale/default public 404 is served, public links are disconnected, or a local screenshot is substituted for the live public response."]},"evidence":{"artifact_type":"screenshot","required_capture":true,"required_observations":["Actual public URL, DNS/TLS success, 404/200 responses, candidate identity, inspected public-unknown-path.png."]},"cases":[{"start_ref":"public_recovery","action":{"actor":"user","steps":["Using direct Playwright navigation to the literal public HTTPS origin, open the run-bound unknown path without modifying deployment configuration.","Record the real response status, origin and candidate identity; inspect the branded content and follow Components and Registry recovery links.","Capture public-unknown-path.png from this public browser session; exercise the available shared search on JavaScript-enabled projects and the ordinary fallback on chromium-nojs."]},"end_state":{"must_observe":["The requested `https://rnraielements.com/ori-vis-005-missing-<run-id>` returns HTTP 404 with `Page not found` and the same approved recovery content/composition.","Public `/components` and `/registry` links return HTTP 200; enabled search focuses the shared dialog input.","`public-unknown-path.png` is bound to the actual public URL, published candidate identity and fresh run ID."],"must_not_observe":["A blank/default public error body or empty recovery links.","A localhost/preview screenshot, stale candidate or no public response presented as deployment proof."]}}]}},{"id":"TC-1","type":"test_criterion","description":"Both absent paths return branded HTTP 404 recovery, and both ordinary links reach their named HTTP 200 destinations.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-1","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Enabled search opens the shared focused dialog and navigates to the real renderMarkdown boundary result; the no-JavaScript project proves its ordinary fallback.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-2","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"JavaScript-disabled HTML and browser navigation preserve readable recovery and both ordinary links with zero dead search controls.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-3","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Both themes and the configured mobile viewport preserve a readable single-column layout, unclipped actions and the shared focus indicator.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-4","maps_to_ac":"AC-4"},{"id":"TC-5","type":"test_criterion","description":"The public screenshot and successful recovery observations come from the real HTTPS origin serving the same reviewed candidate.","verify":"pnpm exec playwright test tests/sprint-05-orient-search/recovery-presentation.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-nojs --grep ORI-VIS-005-ac-5","maps_to_ac":"AC-5"}]}
-->
</details>
