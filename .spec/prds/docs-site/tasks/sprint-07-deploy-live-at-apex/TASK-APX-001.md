================================================================================
TASK: APX-001 - Author `apps/docs/public/_headers`: three cache tiers plus the security baseline
================================================================================

TASK_TYPE:  CONFIG
STATUS:     Backlog
PRIORITY:   P0
POINTS:     3
AGENT:      planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer

PROPOSED BY: cloudflare-workers-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: the apex serves every path at `public, max-age=0, must-revalidate` and sends no CSP, HSTS, nosniff, frame-deny or referrer-policy header.
Why it matters: UC-DELIV-02 promises tiered caching and a security baseline, and UC-DELIV-03 needs `/r/*.json` at `public, max-age=300` so installs never pin stale items.
Current: no `_headers` file exists, and `apps/docs/public/` was gitignored until APX-030 narrows the ignore to `public/r/`.
Desired: one tracked `apps/docs/public/_headers` that Astro copies into dist and Cloudflare applies, with one clean value per header.

## Critical Constraints
MUST:
- MUST create exactly one file, `apps/docs/public/_headers`, with three rule blocks: `/*` (five security headers plus an explicit `Cache-Control: public, max-age=0, must-revalidate`), `/_astro/*` and `/r/*`, each of the latter two starting with `! Cache-Control` and then setting `public, max-age=31536000, immutable` and `public, max-age=300` respectively
- MUST use the human-approved CSP verbatim: `default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'`
- MUST use HSTS `max-age=31536000; includeSubDomains`, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` and `Referrer-Policy: strict-origin-when-cross-origin`
- MUST keep the file within Cloudflare's limits (at most 100 rules, lines under 2,000 characters)
NEVER:
- NEVER omit the `! Cache-Control` detach line from the `/_astro/*` and `/r/*` blocks: Cloudflare merges every matching rule and joins duplicate header names with a comma, so the response would carry two cache tiers in one value
- NEVER add a `_redirects` file, a wrangler.jsonc change, or any binding: the Worker stays assets-only with zero bindings because Sprint 08's rollback depends on it
- NEVER edit `apps/docs/.gitignore` (APX-030 owns it) or any build script: the file relies on Astro copying `public/` into dist byte-for-byte
- NEVER set a `/r/*` TTL above 300 seconds
- NEVER edit `tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts`: APX-006 authors and owns it, and this task's ACs only run it
STRICTLY:
- STRICTLY this task depends on APX-002: HSTS with `includeSubDomains` covers www, so the www 301 must already work (`pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --probe-www` exits 0 with `redirect-ok`) before a deploy ships this file to the apex
- STRICTLY every AC binds to the APX-006 flow and its live verify goes green only after the gated CI deploy publishes this file. Before then, the reviewer uses the local measurement gate below (wrangler dev on the built dist)
- PRECONDITION (human-owned, not a dependency): GitHub Actions secret and the synced `main` (via PR) for the gated deploy; Sprint 05's ORI-DEP-003 for current docs at the apex
- REVIEWER CHECKS (folded from dropped APX-005): (1) re-run gate step 8's 112-URL curl sweep independently and confirm one line `112 200 application/json|public, max-age=300`; (2) confirm the 404 response carries the same security headers as the 200 responses; (3) confirm no response carries a comma-joined cache-control; (4) confirm in a real browser that Cmd+K search and the pre-paint theme script still work under the shipped CSP (steps 9-11 own the formal proof); (5) confirm `apps/docs/wrangler.jsonc` still holds no `main` and no binding key

## Specification
Objective: Author the tracked `_headers` file that gives the apex its three cache tiers and the five-header security baseline, with the detach pattern that keeps every header to a single value.
Success state: After the gated deploy, `/docs/introduction` and `/no-such-page` carry `public, max-age=0, must-revalidate`, a hashed `/_astro/*.css` carries `public, max-age=31536000, immutable`, each `/r/{engine}/{item}.json` carries `public, max-age=300`, and every response carries the CSP, HSTS, nosniff, DENY and referrer-policy headers exactly once.

## Acceptance Criteria
### AC-1: The three cache tiers each return one clean value
  GIVEN: the deployed dist carrying `_headers` and the live apex
  WHEN:  the flow spec GETs `/docs/introduction`, a hashed `/_astro/*.css` and `/r/nativewind/conversation.json`
  THEN:  the three responses carry cache-control exactly `public, max-age=0, must-revalidate`, `public, max-age=31536000, immutable` and `public, max-age=300`, each as a single header value
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-02-header-and-domain-contract
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-header-and-domain-contract
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["_headers is not copied into dist so tiers stay at max-age=0","the /_astro block lacks the detach line and the value is comma-joined","the /r block copies the immutable tier","the `_headers` file is absent from dist (removed or never copied), so every path keeps the static default cache tier"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/docs/introduction","GET the first /_astro/*.css referenced by https://rnraielements.com/","GET https://rnraielements.com/r/nativewind/conversation.json"]},"end_state":{"must_observe":["/docs/introduction cache-control `public, max-age=0, must-revalidate`","the css cache-control `public, max-age=31536000, immutable`","conversation.json cache-control `public, max-age=300`"],"must_not_observe":["cache-control `public, max-age=0, must-revalidate` on the css or the JSON","a cache-control value with two max-age tokens"]}}]}
```

### AC-2: Every 200 response carries the five security headers with the approved values
  GIVEN: the deployed `_headers` and the human-approved CSP amendment
  WHEN:  the flow spec reads `/docs/introduction`, the css and the JSON
  THEN:  each response carries the approved CSP with `'wasm-unsafe-eval'` in script-src, `strict-transport-security: max-age=31536000; includeSubDomains`, `x-content-type-options: nosniff`, `x-frame-options: DENY` and `referrer-policy: strict-origin-when-cross-origin`
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-02-header-and-domain-contract
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-header-and-domain-contract
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the `/*` block is missing so no security header is sent","the CSP omits `'wasm-unsafe-eval'`","HSTS is sent without includeSubDomains"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/docs/introduction and record all response headers"]},"end_state":{"must_observe":["content-security-policy contains `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`","strict-transport-security `max-age=31536000; includeSubDomains`","x-content-type-options `nosniff`","x-frame-options `DENY`","referrer-policy `strict-origin-when-cross-origin`"],"must_not_observe":["a response with no content-security-policy header","a duplicated security header line"]}}]}
```

### AC-3: The 404 response carries the same security headers and the HTML tier
  GIVEN: the deployed `_headers` and the 404-page not-found handling
  WHEN:  the flow spec GETs `/no-such-page`
  THEN:  the response is 404 with cache-control `public, max-age=0, must-revalidate` and the same five security headers as the 200 responses
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-02-header-and-domain-contract
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-header-and-domain-contract
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["headers apply only to matched files and not to the 404 asset","the 404 path is served by a Worker that bypasses _headers","the spec reads a stubbed, static 404 response instead of the live apex"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/no-such-page with maxRedirects 0"]},"end_state":{"must_observe":["status 404","cache-control `public, max-age=0, must-revalidate`","x-frame-options `DENY` and content-security-policy present"],"must_not_observe":["a 404 response with no security header","status 200 for the missing path"]}}]}
```

### AC-4: The registry JSON tier is never longer than 300 seconds and never comma-joined
  GIVEN: the deployed `/r/*` rule with its detach line
  WHEN:  the flow spec reads `/r/nativewind/conversation.json`
  THEN:  the response has exactly one cache-control header whose value is `public, max-age=300`, with no `immutable` token and no second max-age
  TDD_STATE: N/A
  FLOW_REF: FLOW-DELIV-02-header-and-domain-contract
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-header-and-domain-contract
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the /r block lacks `! Cache-Control` so the `/*` tier is joined in","the /r block is copy-pasted from the /_astro immutable tier","the `/r` rule is deleted from `_headers`, so the registry JSON keeps the unchanged default tier"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/r/nativewind/conversation.json and count cache-control lines"]},"end_state":{"must_observe":["one cache-control header with value `public, max-age=300`","content-type `application/json`"],"must_not_observe":["the token `immutable` on the JSON","a value containing `max-age=0` or two max-age tokens"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|---|---|---|---|
| TC-1 | The `/_astro/*.css` cache-control equals `public, max-age=31536000, immutable` when the flow spec reads it from the live apex | AC-1 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` |
| TC-2 | The CSP script-src contains `'wasm-unsafe-eval'` when the flow spec reads `/docs/introduction` | AC-2 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` |
| TC-3 | The `/no-such-page` response status is 404 with `x-frame-options: DENY` when the flow spec reads it | AC-3 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` |
| TC-4 | The registry JSON response has exactly one cache-control header when the flow spec counts header lines | AC-4 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` |

## Reading List
- .spec/scenarios/UC-DELIV-02/header-and-domain-contract.scenario.md (all): the visible scenario's exact expected header values
- .spec/prds/docs-site/11-technical-requirements/04-api-design.md (all): the approved CSP and header table including 'wasm-unsafe-eval'
- apps/docs/wrangler.jsonc (all): assets-only config that must stay unchanged
- ~/Projects/brain/.rosetta/docs/cloudflare-workers/anti-patterns.md (all): static-assets header traps
- https://developers.cloudflare.com/workers/static-assets/headers/ (all): rule merging, comma-joined duplicates, `! Header` detach, 100-rule limit

## Guardrails
WRITE-ALLOWED:
- apps/docs/public/_headers (NEW)
- tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
WRITE-PROHIBITED:
- apps/docs/.gitignore - APX-030 owns it
- apps/docs/wrangler.jsonc - stays assets-only
- apps/docs/astro.config.mjs
- apps/docs/package.json
- apps/docs/src/**
- apps/docs/public/r/** - generated only
- apps/docs/public/_redirects - Sprint 08

## Design
References: SPRINT.md, 07-uc-deliv#UC-DELIV-02, 11-technical-requirements/04-api-design
Pattern: /*
  Cache-Control: public, max-age=0, must-revalidate
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
/_astro/*
  ! Cache-Control
  Cache-Control: public, max-age=31536000, immutable
/r/*
  ! Cache-Control
  Cache-Control: public, max-age=300
Pattern source: measured 2026-09-30 with wrangler 4.81.0 (compat date 2026-04-12) on a probe dist: the detach pattern returned one clean cache-control value per tier, and headers applied to the 404-page response
Anti-pattern: Setting Cache-Control in `/*` and again in `/_astro/*` without `! Cache-Control`: Cloudflare joins the two values with a comma into one invalid header.

## Verification Gates
- local header measurement: `bash -c 'set -e; pnpm --filter @rnr-ai-elements/docs build; D=$(mktemp -d); printf "{\"name\":\"hdr-probe\",\"compatibility_date\":\"2026-04-12\",\"assets\":{\"directory\":\"%s/apps/docs/dist\",\"not_found_handling\":\"404-page\"}}" "$PWD" > "$D/wrangler.jsonc"; (cd apps/docs && pnpm exec wrangler dev -c "$D/wrangler.jsonc" --port 8799 --local >"$D/log" 2>&1 & echo $! > "$D/pid"); sleep 20; for p in / /r/nativewind/conversation.json /no-such-page; do curl -sI localhost:8799$p | grep -iE "^HTTP|cache-control|content-security|strict-transport|x-frame|nosniff|referrer"; done; kill $(cat "$D/pid")'` -> Output shows, per path, exactly one cache-control line with the tier value (`public, max-age=0, must-revalidate` for / and /no-such-page, `public, max-age=300` for the JSON), plus the CSP with 'wasm-unsafe-eval', HSTS with includeSubDomains, nosniff, DENY and the referrer policy. The compatibility date is lowered only in this throwaway probe config because wrangler 4.81.0's local runtime rejects 2026-09-13
- lint: `pnpm typecheck` -> Exit 0 (no TypeScript surface changed)
- FLOW-DELIV-02-header-and-domain-contract (live, after gated deploy): `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` -> Exit 0 once this file and APX-002's www wiring are live (gate steps 6 and 7)

## Agent Instructions
The RED is already recorded by APX-006 (proof.red), so this task skips the RED step. Author `apps/docs/public/_headers` exactly as the Design pattern shows, run the local header measurement gate and confirm one clean cache-control value per tier, then hand off. The live verify goes green only after the gated CI deploy. Use real services only; never mock. Commit on your task branch; never merge.

## Orchestrator Verification Protocol
Re-run every VERIFY in the Verification Gates yourself, read the evidence files named below, and confirm `git diff` touches only WRITE-ALLOWED paths. Do not accept an implementer's claim without the command output. A 'pre-existing failure' claim needs `git stash` proof.

## Evidence Gates
Each behavioral AC needs captured real-service output (stdout or api_response) matching its scenario's must_observe and excluding must_not_observe, plus proof.red or a recorded RED run where tdd_mode is red_first.

## Review Criteria
- REVIEWER CHECKS (folded from dropped APX-005): (1) re-run gate step 8's 112-URL curl sweep independently and confirm one line `112 200 application/json|public, max-age=300`; (2) confirm the 404 response carries the same security headers as the 200 responses; (3) confirm no response carries a comma-joined cache-control; (4) confirm in a real browser that Cmd+K search and the pre-paint theme script still work under the shipped CSP (steps 9-11 own the formal proof); (5) confirm `apps/docs/wrangler.jsonc` still holds no `main` and no binding key
- Confirm no stub, skip, canned response or synthetic success; failures fail closed.

## Dependencies
Depends on: ["APX-006", "APX-002", "APX-030"]
Blocks:     []

## Notes
- This task is CONFIG: the RED was already captured by APX-006 (proof.red), so TDD is skipped here. Every AC binds to the APX-006 flow and goes green only after the gated CI deploy publishes this file (gate steps 6, 7, 8). Before then, use the local header measurement gate.
- Human-owned preconditions (not dependencies): the GitHub `CLOUDFLARE_API_TOKEN` secret and a synced `main` for the gated deploy; Sprint 05's ORI-DEP-003 for current docs at the apex.
- Ordering: HSTS with `includeSubDomains` covers www, so do not deploy this file before `zone-wiring.ts --probe-www` reads `redirect-ok` (APX-002).
- `edge-contract.remote.spec.ts` belongs to APX-006 and is never edited here.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"APX-001","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"live_apex_stale_contract":{"description":"The live apex as observed 2026-09-30: every path returns `public, max-age=0, must-revalidate` and no security header.","seed_method":"public_api","records":["GET https://rnraielements.com/_astro css returns cache-control public, max-age=0, must-revalidate","GET https://rnraielements.com/r/nativewind/conversation.json returns cache-control public, max-age=0, must-revalidate","no content-security-policy on any path"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the deployed dist carrying `_headers` and the live apex WHEN the flow spec GETs `/docs/introduction`, a hashed `/_astro/*.css` and `/r/nativewind/conversation.json` THEN the three responses carry cache-control exactly `public, max-age=0, must-revalidate`, `public, max-age=31536000, immutable` and `public, max-age=300`, each as a single header value","primary":false,"flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["_headers is not copied into dist so tiers stay at max-age=0","the /_astro block lacks the detach line and the value is comma-joined","the /r block copies the immutable tier","the `_headers` file is absent from dist (removed or never copied), so every path keeps the static default cache tier"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/docs/introduction","GET the first /_astro/*.css referenced by https://rnraielements.com/","GET https://rnraielements.com/r/nativewind/conversation.json"]},"end_state":{"must_observe":["/docs/introduction cache-control `public, max-age=0, must-revalidate`","the css cache-control `public, max-age=31536000, immutable`","conversation.json cache-control `public, max-age=300`"],"must_not_observe":["cache-control `public, max-age=0, must-revalidate` on the css or the JSON","a cache-control value with two max-age tokens"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the deployed `_headers` and the human-approved CSP amendment WHEN the flow spec reads `/docs/introduction`, the css and the JSON THEN each response carries the approved CSP with `'wasm-unsafe-eval'` in script-src, `strict-transport-security: max-age=31536000; includeSubDomains`, `x-content-type-options: nosniff`, `x-frame-options: DENY` and `referrer-policy: strict-origin-when-cross-origin`","primary":false,"flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the `/*` block is missing so no security header is sent","the CSP omits `'wasm-unsafe-eval'`","HSTS is sent without includeSubDomains"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/docs/introduction and record all response headers"]},"end_state":{"must_observe":["content-security-policy contains `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'`","strict-transport-security `max-age=31536000; includeSubDomains`","x-content-type-options `nosniff`","x-frame-options `DENY`","referrer-policy `strict-origin-when-cross-origin`"],"must_not_observe":["a response with no content-security-policy header","a duplicated security header line"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the deployed `_headers` and the 404-page not-found handling WHEN the flow spec GETs `/no-such-page` THEN the response is 404 with cache-control `public, max-age=0, must-revalidate` and the same five security headers as the 200 responses","primary":false,"flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["headers apply only to matched files and not to the 404 asset","the 404 path is served by a Worker that bypasses _headers","the spec reads a stubbed, static 404 response instead of the live apex"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/no-such-page with maxRedirects 0"]},"end_state":{"must_observe":["status 404","cache-control `public, max-age=0, must-revalidate`","x-frame-options `DENY` and content-security-policy present"],"must_not_observe":["a 404 response with no security header","status 200 for the missing path"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the deployed `/r/*` rule with its detach line WHEN the flow spec reads `/r/nativewind/conversation.json` THEN the response has exactly one cache-control header whose value is `public, max-age=300`, with no `immutable` token and no second max-age","primary":false,"flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the /r block lacks `! Cache-Control` so the `/*` tier is joined in","the /r block is copy-pasted from the /_astro immutable tier","the `/r` rule is deleted from `_headers`, so the registry JSON keeps the unchanged default tier"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"live_apex_stale_contract","action":{"actor":"api_client","steps":["GET https://rnraielements.com/r/nativewind/conversation.json and count cache-control lines"]},"end_state":{"must_observe":["one cache-control header with value `public, max-age=300`","content-type `application/json`"],"must_not_observe":["the token `immutable` on the JSON","a value containing `max-age=0` or two max-age tokens"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The `/_astro/*.css` cache-control equals `public, max-age=31536000, immutable` when the flow spec reads it from the live apex","flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The CSP script-src contains `'wasm-unsafe-eval'` when the flow spec reads `/docs/introduction`","flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The `/no-such-page` response status is 404 with `x-frame-options: DENY` when the flow spec reads it","flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"The registry JSON response has exactly one cache-control header when the flow spec counts header lines","flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","maps_to_ac":"AC-4"}]}
-->
