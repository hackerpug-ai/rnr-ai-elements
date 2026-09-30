================================================================================
TASK: APX-032 - Prove the shipped CSP keeps Pagefind search and the pre-paint theme script working on the built site
================================================================================

TASK_TYPE:  INFRA
STATUS:     Backlog
PRIORITY:   P0
POINTS:     3
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
- **Problem:** Measured 2026-09-29 under wrangler's local workerd, the original TR-04 CSP (no `'wasm-unsafe-eval'`) broke Pagefind search: Chromium and WebKit both showed 0 results and `Failed to load the Pagefind WASM`. The amended CSP (R2, approved 2026-09-29) fixes it, but nothing stops a later CSP edit from breaking search or the pre-paint theme script again.
- **Why it matters:** CSP exists only around the Worker (PRD L1/L4). The astro-preview lanes never see it, so a CSP regression would first appear in production.
- **Current:** No lane serves the built dist with `_headers` in a browser.
- **Desired:** A docs-e2e lane serves the real dist through workerd with the committed CSP. It proves search and the pre-paint theme work, and it goes red on copies whose CSP drops `'wasm-unsafe-eval'` or `'unsafe-inline'`.

## Critical Constraints
MUST:
- MUST run every theme assertion in a browser context with `colorScheme: 'dark'`. Playwright defaults to light, so `html.light` would be applied by the prefers-color-scheme branch and the proof would pass with the inline script blocked
NEVER:
- NEVER serve through astro preview or a hand-rolled static server: only the pinned wrangler's workerd parses `_headers` (PRD L1/L4)
- NEVER write into apps/docs (dist, public or .wrangler). Serve copies from os.tmpdir() with `--persist-to <tmp>/state`, spawn each wrangler with `detached: true`, and kill the process GROUP (`process.kill(-pid)`), because killing only the wrangler pid left workerd holding the port (measured 2026-09-29)
- NEVER rely on `securitypolicyviolation` events for the WebAssembly block (none fired, measured 2026-09-29); assert the search outcome and console text
STRICTLY:
- STRICTLY chromium-desktop only, via `test.skip(test.info().project.name !== 'chromium-desktop', ...)`; never edit playwright.config.ts or ci.yml

## Specification
Objective: Prove, before any upload, that the committed CSP served by the real Workers asset runtime keeps Pagefind search and the pre-paint theme script working on the real built docs site.

Success state: Under the committed CSP, Cmd+K `conversation` lists Conversation first, and a stored light theme is on `<html>` before `<body>` parses under a dark system scheme. The same lane goes red on copies whose CSP drops `'wasm-unsafe-eval'` or `'unsafe-inline'`.

PRD refs: 07-uc-deliv.md UC-DELIV-02 AC-3, 11-technical-requirements/04-api-design.md HTML routes row (amended CSP), 11-technical-requirements/08-technical-risks.md R1, R2 (amended), 11-technical-requirements/01-architecture-posture.md #7, 11-technical-requirements/11-e2e-testing.md L1, L4, 12-e2e-testing-criteria.md T-DELIV-008
Capabilities: CAP-DEP-01
Provides:
- a pre-deploy browser lane in docs-e2e that fails when the committed CSP breaks Pagefind search or the pre-paint theme script on the real built dist served by Cloudflare's own asset runtime (workerd via the pinned wrangler)
Consumes:
- apps/docs/dist from the docs-e2e build (the same bytes APX-022 uploads)
- apps/docs/public/_headers committed by APX-001 with `'wasm-unsafe-eval'` in script-src
- apps/docs/wrangler.jsonc assets block
Boundary contracts:
- CAP-DEP-01: headers exist only around the Worker (PRD L1/L4), so this lane serves the built dist through wrangler's local workerd with the committed _headers, never through astro preview
- UC-DELIV-02 AC-3: the security baseline may not remove a shipped feature; a CSP that breaks search or theme turns docs-e2e red, so deploy (needs docs-e2e) is skipped
- Build once: only OS-temp copies are served, so no wrangler state or config lands in apps/docs/dist before the docs-dist upload

### Fixtures
```json
{"workerd_served_dist": {"description": "an OS-temp dir holding a byte copy of the real built apps/docs/dist (with APX-001's committed _headers) beside a copy of apps/docs/wrangler.jsonc, served by `apps/docs/node_modules/.bin/wrangler dev --config <tmp>/wrangler.jsonc --ip 127.0.0.1 --port <free> --compatibility-date 2026-04-12 --persist-to <tmp>/state` (pinned 4.81.0; its workerd rejects the config's 2026-09-13; asset serving and _headers parsing do not depend on it)", "seed_method": "cli", "records": ["wrangler log line `Ready on http://127.0.0.1:<port>`", "GET /docs/introduction returns 200 with a `content-security-policy` whose script-src lists `'self' 'unsafe-inline' 'wasm-unsafe-eval'`", "/pagefind/pagefind.js and the Pagefind index are present (emitted by search:index)"]}, "wasm_token_removed": {"description": "a second temp copy identical to workerd_served_dist except that `'wasm-unsafe-eval'` is deleted from the _headers CSP, served by its own wrangler dev on another free port", "seed_method": "cli", "records": ["served script-src reads `'self' 'unsafe-inline'`"]}, "inline_blocked": {"description": "a third temp copy identical to workerd_served_dist except that `'unsafe-inline'` is deleted from the _headers script-src, served by its own wrangler dev on another free port", "seed_method": "cli", "records": ["served script-src reads `'self' 'wasm-unsafe-eval'`"]}}
```

## Acceptance Criteria
### AC-1: Pagefind search works under the committed CSP
  GIVEN: the real dist is served by workerd with the committed CSP
  WHEN:  Chromium loads /docs/introduction, presses ControlOrMeta+K and types `conversation`
  THEN:  at least 2 results list, with the first href `/components/conversation/`, and there is no CSP or Pagefind WASM console error
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts
  TEST_FUNCTION: APX-032-AC1
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "topology": "single-node", "negative_control": {"would_fail_if": ["the CSP lacks `'wasm-unsafe-eval'` (measured 2026-09-29: 0 results and `Failed to load the Pagefind WASM` in Chromium and WebKit; AC-4 case 1 re-runs it)", "the lane serves a static dist through astro preview, where no CSP applies"]}, "evidence": {"artifact_type": "screenshot", "required_capture": true}, "cases": [{"start_ref": "workerd_served_dist", "action": {"actor": "user", "steps": ["page.goto(`http://127.0.0.1:<port>/docs/introduction`)", "press `ControlOrMeta+k`", "fill the dialog's `input[type=\"search\"]` with `conversation`", "wait for `a[data-search-result]`"]}, "end_state": {"must_observe": ["the first `a[data-search-result]` href equals `/components/conversation/`", "`20` result anchors on the 2026-09-29 build (assert ≥ `2`)", "status text matching `<N> results — ↵ opens, ↑↓ select, esc closes`"], "must_not_observe": ["`Search is unavailable right now. Check your connection and try again.` visible", "`0` result anchors", "console text `Failed to load the Pagefind WASM`", "console text `Content Security Policy`"]}}]}
```

### AC-2: Stored light theme applies before first paint under the CSP
  GIVEN: workerd serves the committed CSP, and Chromium has a dark color scheme plus an init script recording the root class when `<body>` is inserted
  WHEN:  the header Theme button is clicked until `html.light`, and the page reloads
  THEN:  the class recorded at `<body>` insertion contains `light`, with no CSP console error
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts
  TEST_FUNCTION: APX-032-AC2
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC2
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "topology": "single-node", "negative_control": {"would_fail_if": ["the CSP blocks the is:inline pre-paint script (AC-4 case 2 re-runs it)", "the context keeps Playwright's default light scheme, so a static prefers-color-scheme match fakes the pass"]}, "evidence": {"artifact_type": "screenshot", "required_capture": true}, "cases": [{"start_ref": "workerd_served_dist", "action": {"actor": "user", "steps": ["open a context with `colorScheme: 'dark'` and an init script that sets `window.__rnrClassAtBody = document.documentElement.className` when a MutationObserver sees `<body>` inserted", "page.goto(`http://127.0.0.1:<port>/docs/introduction`)", "click the button named `Toggle dark and light theme` until `html` has class `light`", "page.reload()"]}, "end_state": {"must_observe": ["`window.__rnrClassAtBody` contains `light`", "localStorage `rnr-theme` equals `light`"], "must_not_observe": ["`window.__rnrClassAtBody` contains `dark`", "console text `Content Security Policy`", "the default dark-scheme root class without `light` at `<body>` insertion (the pre-paint script never ran)"]}}]}
```

### AC-3: The served CSP is the committed one
  GIVEN: workerd serves the real dist with the committed _headers
  WHEN:  the lane fetches /docs/introduction and /r/nativewind/conversation.json
  THEN:  each carries a `content-security-policy` byte-equal to the value on the committed `/*` rule, including `'wasm-unsafe-eval'`
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts
  TEST_FUNCTION: APX-032-AC3
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC3
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers", "topology": "single-node", "negative_control": {"would_fail_if": ["the site is served with no CSP (static server or astro preview), which would make AC-1 and AC-2 pass vacuously", "_headers never reached dist, so workerd applies only its defaults"]}, "evidence": {"artifact_type": "api_response", "required_capture": true}, "cases": [{"start_ref": "workerd_served_dist", "action": {"actor": "api_client", "steps": ["read the `Content-Security-Policy:` value under `/*` in apps/docs/public/_headers", "page.request.get(`http://127.0.0.1:<port>/docs/introduction`)"]}, "end_state": {"must_observe": ["status `200`", "`content-security-policy` header equal to the committed value", "the value contains `'wasm-unsafe-eval'`"], "must_not_observe": ["missing `content-security-policy` header", "empty header value"]}}, {"start_ref": "workerd_served_dist", "action": {"actor": "api_client", "steps": ["page.request.get(`http://127.0.0.1:<port>/r/nativewind/conversation.json`)"]}, "end_state": {"must_observe": ["status `200`", "`content-type` `application/json`", "`content-security-policy` header equal to the committed value"], "must_not_observe": ["missing `content-security-policy` header", "an empty `content-security-policy` value on the JSON response"]}}]}
```

### AC-4: The lane goes red on a CSP that breaks search or theme
  GIVEN: copies served with `'wasm-unsafe-eval'` removed, or with `'unsafe-inline'` removed from script-src
  WHEN:  the AC-1 search and a stored-light-theme load (dark scheme) run against those copies
  THEN:  search shows its error state with 0 results, and the recorded root class lacks `light`, with a console inline-script refusal
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts
  TEST_FUNCTION: APX-032-AC4
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC4
  TEST_TIER: e2e
  VERIFICATION_SERVICE: real built docs dist served by wrangler 4.81.0 local workerd with deliberately weakened _headers copies, driven in Chromium
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with deliberately weakened _headers copies, driven in Chromium", "topology": "single-node", "negative_control": {"would_fail_if": ["the lane stubs Pagefind or mocks the search response instead of letting the real WASM load", "the lane's oracle is static (for example, it asserts the dialog opens), so a broken CSP still passes"]}, "evidence": {"artifact_type": "screenshot", "required_capture": true}, "cases": [{"start_ref": "wasm_token_removed", "action": {"actor": "user", "steps": ["page.goto(`http://127.0.0.1:<port2>/docs/introduction`)", "press `ControlOrMeta+k`", "type `conversation`"]}, "end_state": {"must_observe": ["`Search is unavailable right now. Check your connection and try again.` visible", "console text containing `Failed to load the Pagefind WASM`"], "must_not_observe": ["an `a[data-search-result]` with href `/components/conversation/`", "no search error state (the result list renders under the weakened CSP)"]}}, {"start_ref": "inline_blocked", "action": {"actor": "user", "steps": ["open a context with `colorScheme: 'dark'`, an init script that sets localStorage `rnr-theme` to `light`, and the `<body>`-insertion class recorder", "page.goto(`http://127.0.0.1:<port3>/docs/introduction`)"]}, "end_state": {"must_observe": ["console text containing `Refused to execute inline script`", "localStorage `rnr-theme` equals `light` while `window.__rnrClassAtBody` has no `light`"], "must_not_observe": ["`window.__rnrClassAtBody` contains `light`", "nothing refused in the console (no inline-script CSP error under the weakened policy)"]}}]}
```

## Test Criteria
| TC | Statement | Maps to | Type | Verify |
|----|-----------|---------|------|--------|
| TC-1 | The first search result href is `/components/conversation/` when `conversation` is searched under the committed CSP | AC-1 | happy_path | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1` |
| TC-2 | The search lists at least 2 result anchors when `conversation` is searched under the committed CSP | AC-1 | happy_path | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1` |
| TC-3 | No console message contains `Failed to load the Pagefind WASM` during the committed-CSP search | AC-1 | happy_path | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1` |
| TC-4 | No wrangler or workerd listener remains on any spawned port after the spec finishes | AC-1 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1` |
| TC-5 | `window.__rnrClassAtBody` contains `light` after reload with a stored light theme under a dark color scheme | AC-2 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC2` |
| TC-6 | No console message contains `Content Security Policy` during the AC-2 reload | AC-2 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC2` |
| TC-7 | The served `content-security-policy` on /docs/introduction equals the committed `/*` value | AC-3 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC3` |
| TC-8 | The served `content-security-policy` on /r/nativewind/conversation.json equals the committed `/*` value | AC-3 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC3` |
| TC-9 | The search shows `Search is unavailable right now. Check your connection and try again.` when `'wasm-unsafe-eval'` is removed from the served CSP | AC-4 | error_handling | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC4` |
| TC-10 | `window.__rnrClassAtBody` lacks `light` when `'unsafe-inline'` is removed from the served script-src | AC-4 | error_handling | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC4` |

## Reading List
- `apps/docs/src/layouts/DocsLayout.astro` (lines 60-105) — the is:inline data-astro-rerun pre-paint script: stored `rnr-theme` > system scheme > dark
- `apps/docs/src/scripts/search-dialog.ts` (lines 60-80, 320-335, 420-430) — dynamic import of /pagefind/pagefind.js, status text format, the metaKey||ctrlKey + k shortcut
- `apps/docs/src/components/islands/SearchDialog.astro` (lines 27-75) — input[type=search], data-search-status, data-search-error copy, data-search-results
- `apps/docs/src/components/islands/ThemeToggle.astro` (lines 1-15) — Theme button, aria-label `Toggle dark and light theme`
- `apps/docs/wrangler.jsonc` (lines all) — assets block and compatibility_date 2026-09-13 (read only)
- `.spec/prds/docs-site/11-technical-requirements/04-api-design.md` (lines 18) — amended CSP string
- `.spec/prds/docs-site/11-technical-requirements/08-technical-risks.md` (lines 11-12) — R1 inline scripts, amended R2 Pagefind WebAssembly
- `.spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md` (lines 56-60) — L1/L4: headers exist only around the Worker
- `tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts` (lines 183-191) — chromium-desktop test.skip precedent

Coding standards:
- brain/docs/ASTRO-RULES.md
- brain/docs/TESTING-HIERARCHY.md
- brain/docs/ANTI-STUB-REVIEW.md
- brain/docs/SCRATCH-ARTIFACTS-STANDARD.md
- brain/docs/kanban/SCENARIO-CONTRACT-V1.md

## Guardrails
WRITE-ALLOWED:
- tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/public/_headers - authored by APX-001; weakened variants exist only in os.tmpdir() copies
- apps/docs/wrangler.jsonc - read only; copied into the temp dir
- apps/docs/src/** - no product change
- apps/docs/dist/** - uploaded by docs-e2e after the lane
- .spec/** - contract already amended by the orchestrator
- playwright.config.ts - root collection is already correct
- .github/workflows/ci.yml - docs-e2e already runs this lane
- Any file not explicitly listed in write_allowed
SUPERSEDES: none

## Design
References:
- SPRINT.md steps 9, 10 and 11 (live Chrome/Safari search and theme)
- .spec/scenarios/UC-DELIV-02/header-and-domain-contract.scenario.md line 21 (amended CSP)
- 11-technical-requirements/08-technical-risks.md R2
Interaction notes:
- Measured 2026-09-29 on a fresh HEAD build: under the unamended CSP, Chromium and WebKit showed 0 results and `Failed to load the Pagefind WASM`; with `'wasm-unsafe-eval'` added, 20 results with `/components/conversation/` first, theme applied in both.
- Readiness: wait for the log line `Ready on http://127.0.0.1:<port>` or poll GET / until 200 (timeout 60s). Pick free ports with net.createServer().listen(0).
- `1 result` has no key hints, so assert the regex `^\d+ results — ↵ opens, ↑↓ select, esc closes$` with N ≥ 2.
Pattern (source: measured probe 2026-09-29 (scratch wrangler dev over a copy of apps/docs/dist and apps/docs/wrangler.jsonc: `Parsed 1 valid header rule`, `Ready on http://127.0.0.1:8811`)):
```ts
const child = spawn(wranglerBin, ['dev', '--config', cfg, '--ip', '127.0.0.1', '--port', String(port), '--compatibility-date', '2026-04-12', '--persist-to', stateDir], { cwd: tmp, detached: true, env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' } }); /* afterAll: */ process.kill(-child.pid!, 'SIGTERM');
```
Anti-pattern: route.fulfill or page.setExtraHTTPHeaders to inject the CSP (a mock, not the edge); asserting only that the dialog opens; leaving the default light color scheme; serving from apps/docs so `.wrangler/` lands beside dist

## Verification Gates
- **tests**: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop` — expected: Exit 0; APX-032-AC1..AC4 pass on chromium-desktop
- **typecheck**: `pnpm typecheck` — expected: Exit 0
- **lint**: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts` — expected: Exit 0
- **complexity**: `pnpm check:fallow` — expected: Exit 0

## Agent Instructions
TDD_MODE is skipped (INFRA lane). AC-4's two weakened-CSP copies prove the lane can fail, and they run on every run.
1. Write the harness at the top of `tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts`. Pick a free port with `net.createServer().listen(0)`. Copy apps/docs/dist and apps/docs/wrangler.jsonc into `mkdtemp(join(tmpdir(), 'apx-032-'))`, and optionally rewrite that copy's `_headers`. Spawn `apps/docs/node_modules/.bin/wrangler dev --config <tmp>/wrangler.jsonc --ip 127.0.0.1 --port <p> --compatibility-date 2026-04-12 --persist-to <tmp>/state` with `cwd: tmp` and `detached: true`. Wait for `Ready on http://127.0.0.1:<p>` or for GET / to return 200 (60 s timeout). In afterAll, run `process.kill(-pid, 'SIGTERM')` and remove the temp dirs.
2. Add one test per AC, each title starting with its token (`APX-032-AC1` .. `APX-032-AC4`), each calling `test.skip(test.info().project.name !== 'chromium-desktop', ...)`. Collect console messages with `page.on('console')`.
3. For AC-2 and AC-4 case 2, create a context with `colorScheme: 'dark'`. Add an init script that records `document.documentElement.className` into `window.__rnrClassAtBody` when a MutationObserver sees `<body>` inserted.
4. Attach a screenshot and the console log to the report with `testInfo.attach` for AC-1, AC-2 and AC-4.
5. Run each AC's VERIFY, then the whole file. Then run typecheck, lint and fallow.

## Orchestrator Verification Protocol
1. Re-run `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop`: exit 0, with APX-032-AC1 .. AC4 passing.
2. After the run, `lsof -nP -iTCP -sTCP:LISTEN | grep -i workerd` prints nothing.
3. `git status --porcelain -- apps/docs` shows no new or changed file, and `find apps/docs/dist -newer <build-marker>` lists nothing written by the spec.
4. Open the Playwright HTML report: the AC-1 screenshot shows the results list with Conversation first, and the AC-4 screenshot shows `Search is unavailable right now. Check your connection and try again.`
5. `git diff --name-only <base>...<task-commit>` lists only the spec file. Typecheck, lint and fallow each exit 0.

## Evidence Gates
- Report attachments: the AC-1 results screenshot and console log, and the AC-2 console log with the recorded `__rnrClassAtBody` value.
- The AC-4 error-state screenshot, with the console lines `Failed to load the Pagefind WASM` and `Refused to execute inline script`.
- The served `content-security-policy` value captured in AC-3.

## Review Criteria
REVIEWER CHECKS:
- The CSP is served only by the pinned wrangler's workerd from temp copies. There is no `route.fulfill`, no `page.setExtraHTTPHeaders`, no astro preview and no hand-rolled static server.
- Theme contexts use `colorScheme: 'dark'`.
- The success oracle checks `/components/conversation/` in executable code, not only the dialog opening.
- The WebAssembly assertion uses the search outcome and console text, not `securitypolicyviolation` events.
- Each wrangler is spawned detached and killed by process group, and no file is written under apps/docs.
- playwright.config.ts and ci.yml are untouched.

## Dependencies
Depends on: ["APX-030", "APX-001"]
Blocks:     []

## Notes
- The `--compatibility-date 2026-04-12` override stays until wrangler is bumped. The pinned 4.81.0 local runtime rejects the committed 2026-09-13, while asset serving and `_headers` parsing do not depend on it.
- The root playwright.config.ts collects this spec, and docs-e2e runs it after the build. Deploy needs docs-e2e, so it runs before every deploy with no ci.yml change. workerd ships for linux-x64 through npm.
- Until this spec is green, docs-e2e is red and the gated deploy is Skipped by design.
- The human approved the `'wasm-unsafe-eval'` amendment on 2026-09-29. It is in 04-api-design.md, R2 of 08-technical-risks.md, and the header-and-domain-contract scenario.
- Preconditions, not dependencies: Sprint 05's ORI-CI-003 and ORI-DEP-003 land first.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version": "1", "task_id": "APX-032", "tdd_mode": "skipped", "verification_policy": {"requires_tests": true, "requires_red_evidence": false, "requires_seeded_evidence": true}, "fixtures": {"workerd_served_dist": {"description": "an OS-temp dir holding a byte copy of the real built apps/docs/dist (with APX-001's committed _headers) beside a copy of apps/docs/wrangler.jsonc, served by `apps/docs/node_modules/.bin/wrangler dev --config <tmp>/wrangler.jsonc --ip 127.0.0.1 --port <free> --compatibility-date 2026-04-12 --persist-to <tmp>/state` (pinned 4.81.0; its workerd rejects the config's 2026-09-13; asset serving and _headers parsing do not depend on it)", "seed_method": "cli", "records": ["wrangler log line `Ready on http://127.0.0.1:<port>`", "GET /docs/introduction returns 200 with a `content-security-policy` whose script-src lists `'self' 'unsafe-inline' 'wasm-unsafe-eval'`", "/pagefind/pagefind.js and the Pagefind index are present (emitted by search:index)"]}, "wasm_token_removed": {"description": "a second temp copy identical to workerd_served_dist except that `'wasm-unsafe-eval'` is deleted from the _headers CSP, served by its own wrangler dev on another free port", "seed_method": "cli", "records": ["served script-src reads `'self' 'unsafe-inline'`"]}, "inline_blocked": {"description": "a third temp copy identical to workerd_served_dist except that `'unsafe-inline'` is deleted from the _headers script-src, served by its own wrangler dev on another free port", "seed_method": "cli", "records": ["served script-src reads `'self' 'wasm-unsafe-eval'`"]}}, "requirements": [{"id": "AC-1", "type": "acceptance_criterion", "description": "GIVEN the real dist is served by workerd with the committed CSP WHEN Chromium loads /docs/introduction, presses ControlOrMeta+K and types `conversation` THEN at least 2 results list, with the first href `/components/conversation/`, and there is no CSP or Pagefind WASM console error", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC1", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "topology": "single-node", "negative_control": {"would_fail_if": ["the CSP lacks `'wasm-unsafe-eval'` (measured 2026-09-29: 0 results and `Failed to load the Pagefind WASM` in Chromium and WebKit; AC-4 case 1 re-runs it)", "the lane serves a static dist through astro preview, where no CSP applies"]}, "evidence": {"artifact_type": "screenshot", "required_capture": true}, "cases": [{"start_ref": "workerd_served_dist", "action": {"actor": "user", "steps": ["page.goto(`http://127.0.0.1:<port>/docs/introduction`)", "press `ControlOrMeta+k`", "fill the dialog's `input[type=\"search\"]` with `conversation`", "wait for `a[data-search-result]`"]}, "end_state": {"must_observe": ["the first `a[data-search-result]` href equals `/components/conversation/`", "`20` result anchors on the 2026-09-29 build (assert ≥ `2`)", "status text matching `<N> results — ↵ opens, ↑↓ select, esc closes`"], "must_not_observe": ["`Search is unavailable right now. Check your connection and try again.` visible", "`0` result anchors", "console text `Failed to load the Pagefind WASM`", "console text `Content Security Policy`"]}}]}}, {"id": "AC-2", "type": "acceptance_criterion", "description": "GIVEN workerd serves the committed CSP, and Chromium has a dark color scheme plus an init script recording the root class when `<body>` is inserted WHEN the header Theme button is clicked until `html.light`, and the page reloads THEN the class recorded at `<body>` insertion contains `light`, with no CSP console error", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC2", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC2", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "topology": "single-node", "negative_control": {"would_fail_if": ["the CSP blocks the is:inline pre-paint script (AC-4 case 2 re-runs it)", "the context keeps Playwright's default light scheme, so a static prefers-color-scheme match fakes the pass"]}, "evidence": {"artifact_type": "screenshot", "required_capture": true}, "cases": [{"start_ref": "workerd_served_dist", "action": {"actor": "user", "steps": ["open a context with `colorScheme: 'dark'` and an init script that sets `window.__rnrClassAtBody = document.documentElement.className` when a MutationObserver sees `<body>` inserted", "page.goto(`http://127.0.0.1:<port>/docs/introduction`)", "click the button named `Toggle dark and light theme` until `html` has class `light`", "page.reload()"]}, "end_state": {"must_observe": ["`window.__rnrClassAtBody` contains `light`", "localStorage `rnr-theme` equals `light`"], "must_not_observe": ["`window.__rnrClassAtBody` contains `dark`", "console text `Content Security Policy`", "the default dark-scheme root class without `light` at `<body>` insertion (the pre-paint script never ran)"]}}]}}, {"id": "AC-3", "type": "acceptance_criterion", "description": "GIVEN workerd serves the real dist with the committed _headers WHEN the lane fetches /docs/introduction and /r/nativewind/conversation.json THEN each carries a `content-security-policy` byte-equal to the value on the committed `/*` rule, including `'wasm-unsafe-eval'`", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC3", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC3", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers", "topology": "single-node", "negative_control": {"would_fail_if": ["the site is served with no CSP (static server or astro preview), which would make AC-1 and AC-2 pass vacuously", "_headers never reached dist, so workerd applies only its defaults"]}, "evidence": {"artifact_type": "api_response", "required_capture": true}, "cases": [{"start_ref": "workerd_served_dist", "action": {"actor": "api_client", "steps": ["read the `Content-Security-Policy:` value under `/*` in apps/docs/public/_headers", "page.request.get(`http://127.0.0.1:<port>/docs/introduction`)"]}, "end_state": {"must_observe": ["status `200`", "`content-security-policy` header equal to the committed value", "the value contains `'wasm-unsafe-eval'`"], "must_not_observe": ["missing `content-security-policy` header", "empty header value"]}}, {"start_ref": "workerd_served_dist", "action": {"actor": "api_client", "steps": ["page.request.get(`http://127.0.0.1:<port>/r/nativewind/conversation.json`)"]}, "end_state": {"must_observe": ["status `200`", "`content-type` `application/json`", "`content-security-policy` header equal to the committed value"], "must_not_observe": ["missing `content-security-policy` header", "an empty `content-security-policy` value on the JSON response"]}}]}}, {"id": "AC-4", "type": "acceptance_criterion", "description": "GIVEN copies served with `'wasm-unsafe-eval'` removed, or with `'unsafe-inline'` removed from script-src WHEN the AC-1 search and a stored-light-theme load (dark scheme) run against those copies THEN search shows its error state with 0 results, and the recorded root class lacks `light`, with a console inline-script refusal", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC4", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC4", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with deliberately weakened _headers copies, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with deliberately weakened _headers copies, driven in Chromium", "topology": "single-node", "negative_control": {"would_fail_if": ["the lane stubs Pagefind or mocks the search response instead of letting the real WASM load", "the lane's oracle is static (for example, it asserts the dialog opens), so a broken CSP still passes"]}, "evidence": {"artifact_type": "screenshot", "required_capture": true}, "cases": [{"start_ref": "wasm_token_removed", "action": {"actor": "user", "steps": ["page.goto(`http://127.0.0.1:<port2>/docs/introduction`)", "press `ControlOrMeta+k`", "type `conversation`"]}, "end_state": {"must_observe": ["`Search is unavailable right now. Check your connection and try again.` visible", "console text containing `Failed to load the Pagefind WASM`"], "must_not_observe": ["an `a[data-search-result]` with href `/components/conversation/`", "no search error state (the result list renders under the weakened CSP)"]}}, {"start_ref": "inline_blocked", "action": {"actor": "user", "steps": ["open a context with `colorScheme: 'dark'`, an init script that sets localStorage `rnr-theme` to `light`, and the `<body>`-insertion class recorder", "page.goto(`http://127.0.0.1:<port3>/docs/introduction`)"]}, "end_state": {"must_observe": ["console text containing `Refused to execute inline script`", "localStorage `rnr-theme` equals `light` while `window.__rnrClassAtBody` has no `light`"], "must_not_observe": ["`window.__rnrClassAtBody` contains `light`", "nothing refused in the console (no inline-script CSP error under the weakened policy)"]}}]}}, {"id": "TC-1", "type": "test_criterion", "primary": false, "description": "The first search result href is `/components/conversation/` when `conversation` is searched under the committed CSP", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC1", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-2", "type": "test_criterion", "primary": false, "description": "The search lists at least 2 result anchors when `conversation` is searched under the committed CSP", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC1", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-3", "type": "test_criterion", "primary": false, "description": "No console message contains `Failed to load the Pagefind WASM` during the committed-CSP search", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC1", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-4", "type": "test_criterion", "primary": false, "description": "No wrangler or workerd listener remains on any spawned port after the spec finishes", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC1", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-5", "type": "test_criterion", "primary": false, "description": "`window.__rnrClassAtBody` contains `light` after reload with a stored light theme under a dark color scheme", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC2", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC2", "maps_to_ac": "AC-2"}, {"id": "TC-6", "type": "test_criterion", "primary": false, "description": "No console message contains `Content Security Policy` during the AC-2 reload", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC2", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC2", "maps_to_ac": "AC-2"}, {"id": "TC-7", "type": "test_criterion", "primary": false, "description": "The served `content-security-policy` on /docs/introduction equals the committed `/*` value", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC3", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC3", "maps_to_ac": "AC-3"}, {"id": "TC-8", "type": "test_criterion", "primary": false, "description": "The served `content-security-policy` on /r/nativewind/conversation.json equals the committed `/*` value", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC3", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with the committed _headers", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC3", "maps_to_ac": "AC-3"}, {"id": "TC-9", "type": "test_criterion", "primary": false, "description": "The search shows `Search is unavailable right now. Check your connection and try again.` when `'wasm-unsafe-eval'` is removed from the served CSP", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC4", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with deliberately weakened _headers copies, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC4", "maps_to_ac": "AC-4"}, {"id": "TC-10", "type": "test_criterion", "primary": false, "description": "`window.__rnrClassAtBody` lacks `light` when `'unsafe-inline'` is removed from the served script-src", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts", "test_function": "APX-032-AC4", "test_tier": "e2e", "verification_service": "real built docs dist served by wrangler 4.81.0 local workerd with deliberately weakened _headers copies, driven in Chromium", "surface_policy": ".spec/e2e-policy/surface.json", "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/csp-compat.spec.ts --project chromium-desktop --grep APX-032-AC4", "maps_to_ac": "AC-4"}]}
-->
