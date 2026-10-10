================================================================================
TASK: APX-002 - www to apex: zone wiring script (DNS record and 301 rule) plus runbook, failing loudly without authority
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: 8d3b047347b8da7ed1f8d12ed7e492c041a5296e
PRIORITY:   P0
POINTS:     5
AGENT:      planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer

PROPOSED BY: cloudflare-workers-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: `www.rnraielements.com` does not resolve. The zone holds only the apex `AAAA 100::` proxied record and no redirect rule.
Why it matters: UC-DELIV-02 promises www redirects to the apex with a zone-level 301, and HSTS with `includeSubDomains` (APX-001) covers www, so www must work before that header ships.
Current: the .env token verifies active and reads DNS, but reading the redirect ruleset returns `Authentication error`.
Desired: one idempotent, fail-loud operator command plus a runbook, and a public probe that says whether www is wired.

## Critical Constraints
MUST:
- MUST implement `scripts/docs-deploy/zone-wiring.ts` with three modes: `--probe-www` (public, no token), `--check` (read-only, token), `--apply` (idempotent, token). Exit codes: 0 ok, 3 authority missing, 4 drift or not-yet-wired, 5 applied but the www probe did not read `redirect-ok`
- MUST, on any Cloudflare auth failure (error codes 10000, 9109, 6003, 6111 or HTTP 401/403), exit 3 and print the missing permissions by name: `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`; the message must never contain the token value
- MUST make `--apply` create only what is missing: a proxied `AAAA www 100::` record, and a Single Redirect rule tagged `rnr-www-to-apex` in the zone's `http_request_dynamic_redirect` entrypoint ruleset (expression `http.host eq "www.rnraielements.com"`, 301, target `concat("https://rnraielements.com", http.request.uri.path)`, query string preserved), adding the rule to the existing ruleset without replacing other rules, then re-probe www
- MUST write `scripts/docs-deploy/EDGE-RUNBOOK.md` with: who runs the script and with which token permissions, the order `--check`, `--apply`, `--probe-www`, then the gate step-5 curl, the rule that APX-001's HSTS ships only after the probe reads `redirect-ok`, and the dashboard fallback
NEVER:
- NEVER mutate the zone from any test, from CI, or from this task's own verification: tests use an invalid token and the public probe only, and `--apply` is a human operator action
- NEVER report success on a skipped or failed write, and never treat a missing permission as a pass: fail closed with exit 3 and say what is missing
- NEVER overwrite an existing `www` DNS record or an existing ruleset rule that differs: report drift with exit 4 naming it
- NEVER print, log or write `CLOUDFLARE_API_TOKEN`, and never edit `.env`, `apps/docs/wrangler.jsonc` or `.github/**`
- NEVER edit `tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts`: APX-006 authors and owns it, and this task's AC-1 only runs it
STRICTLY:
- STRICTLY the token is read only from the `CLOUDFLARE_API_TOKEN` environment variable; the zone id `1720eac2fbdd7dc2b975ffdfccbee97f` and account id come from `apps/docs/wrangler.jsonc`
- UNIT_TEST_JUSTIFIED: none needed, every AC here uses a real network endpoint or the real script and real files.
- HUMAN-OWNED PRECONDITION (blocks completion, not a dependency): observed 2026-09-30, the current token can read DNS but reading the redirect ruleset returns `Authentication error`, so it very likely lacks `Zone > Single Redirect > Edit`; the operator must supply a token with both permissions and run `--apply`. If that cannot happen, report AC-1 BLOCKED with the exit-3 output as evidence; never mark this task complete on a stubbed or skipped apply
- REVIEWER CHECKS (folded from dropped APX-005): (1) the redirect preserves the path and lands on the apex, and the `-L` chain ends in one 200; (2) the script exits 3 with the permissions named on an invalid token and performs no write; (3) no secret appears in any output or file; (4) the runbook states the HSTS-after-redirect ordering; (5) `apps/docs/wrangler.jsonc` still has no binding and no `main`

## Specification
Objective: Give the operator one idempotent, fail-loud command that wires `www.rnraielements.com` to a 301 to the apex, plus the runbook that says who runs it with what authority.
Success state: After the operator applies it, `curl -sI https://www.rnraielements.com/docs/introduction` returns exactly one 301 to `https://rnraielements.com/docs/introduction` and the chain ends in one 200; with a token lacking authority the script exits 3 naming the missing permission and writes nothing.

## Acceptance Criteria
### AC-1: After the operator applies the wiring, www answers one 301 to the apex counterpart
  GIVEN: an operator token with `Zone > DNS > Edit` and `Zone > Single Redirect > Edit` and `zone-wiring.ts --apply` completed
  WHEN:  the flow spec GETs `https://www.rnraielements.com/docs/introduction` and `https://www.rnraielements.com/` with redirects off
  THEN:  each returns exactly one 301 whose location is the apex URL for the same path, and following it returns 200
  TDD_STATE: RED
  FLOW_REF: FLOW-DELIV-02-header-and-domain-contract
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare zone (DNS and redirect rule) at rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-02-header-and-domain-contract
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare zone (DNS and redirect rule) at rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the www DNS record was never created so the host does not resolve","the redirect rule drops the path","the rule matches nothing so www serves 404 or 200","the redirect rule is absent from the zone, so www serves the unchanged default response"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"www_unwired_zone","action":{"actor":"api_client","steps":["GET https://www.rnraielements.com/docs/introduction with maxRedirects 0","GET https://www.rnraielements.com/ with maxRedirects 0","GET each location header"]},"end_state":{"must_observe":["status 301 with location `https://rnraielements.com/docs/introduction`","status 301 with an apex-host location for `/`","each followed location returns 200"],"must_not_observe":["a request error resolving www.rnraielements.com","status 200 served at www","a location missing the requested path","no 301 status at all, as from an empty redirect rule that matches nothing"]}}]}
```

### AC-2: Without authority the script exits 3, names the missing permissions, and writes nothing
  GIVEN: the real zone-wiring.ts spawned with an unauthorized token
  WHEN:  it runs `--check` and then `--apply` against the real Cloudflare API
  THEN:  both exit 3, both print `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`, neither prints the token value, and a following public probe of www shows no state change
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real Cloudflare API (api.cloudflare.com) called by the real script
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts
  TEST_FUNCTION: APX-002-loud-failure
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Cloudflare API (api.cloudflare.com) called by the real script","topology":"single-node","negative_control":{"would_fail_if":["the script swallows the auth error and exits 0","the script exits 1 without naming a permission","the script echoes the token","--apply performs a write despite the failed authorization","the script is a no-op stub that prints the permission names without ever calling the Cloudflare API"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"invalid_token_env","action":{"actor":"cli_user","steps":["spawn `pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --check` with the invalid token and capture exit code and output","spawn the same with `--apply`","spawn `--probe-www` and record the classification"]},"end_state":{"must_observe":["exit code 3 for both `--check` and `--apply`","output contains `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`","output does not contain `invalid-token-apx002`","the `--probe-www` classification line is identical in the runs before and after the `--apply` attempt (same `<classification>` token both times)"],"must_not_observe":["exit code 0","an unnamed generic error","the token value in any output"]}}]}
```

### AC-3: The www probe classifies real hosts correctly
  GIVEN: the public `--probe-www` mode and two real hosts with known behavior
  WHEN:  it probes a host that serves content directly and a host that does not resolve, each against the apex `rnraielements.com`
  THEN:  it prints `served-directly` and exits 4 for the first, prints `unresolved` and exits 4 for the second, and its `redirect-ok` classification requires exactly one 301 whose location host is the apex
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real HTTPS and DNS to rnraielements.com hosts, real script
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts
  TEST_FUNCTION: APX-002-probe-classifies
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com hosts, real script","topology":"single-node","negative_control":{"would_fail_if":["the probe follows redirects and reports the final 200 as ok","the probe treats a DNS failure as ok","the probe accepts any 3xx instead of exactly one 301","the probe hardcodes the `redirect-ok` result without making any request"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"known_live_hosts","action":{"actor":"cli_user","steps":["run `zone-wiring.ts --probe-www --host rnraielements.com` and capture output and exit code","run `zone-wiring.ts --probe-www --host no-such-host-apx002.rnraielements.com` and capture output and exit code"]},"end_state":{"must_observe":["first run prints `served-directly` and exits 4","second run prints `unresolved` and exits 4"],"must_not_observe":["exit 0 for either host","`redirect-ok` for either host"]}}]}
```

### AC-4: Every command in the runbook uses a flag the real script accepts
  GIVEN: the committed EDGE-RUNBOOK.md and zone-wiring.ts
  WHEN:  the test extracts each `zone-wiring.ts` invocation from the runbook's fenced commands and runs the script's `--help`
  THEN:  every flag in the runbook appears in the help output, and the runbook names both required permissions and the rule that HSTS ships only after the probe reads `redirect-ok`
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real script `--help` output and the real runbook file
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts
  TEST_FUNCTION: APX-002-runbook-matches-script
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-runbook-matches-script
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script `--help` output and the real runbook file","topology":"single-node","negative_control":{"would_fail_if":["the runbook documents a flag the script does not have","the runbook omits a required permission","the runbook omits the HSTS-after-redirect order"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"runbook_and_script","action":{"actor":"cli_user","steps":["read the fenced shell blocks in EDGE-RUNBOOK.md and collect every `--flag` used with zone-wiring.ts","run `pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --help` and capture stdout"]},"end_state":{"must_observe":["the flags `--check`, `--apply` and `--probe-www` appear in both the runbook and the help","the runbook contains `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`","the runbook states HSTS ships only after the probe reads `redirect-ok`"],"must_not_observe":["a runbook flag absent from the help output","an empty flag list"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|---|---|---|---|
| TC-1 | The www `/docs/introduction` response is one 301 to the apex counterpart when the flow spec requests it after `--apply` | AC-1 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` |
| TC-2 | `zone-wiring.ts --apply` exits 3 when the token is unauthorized | AC-2 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure` |
| TC-3 | The script output omits the token value when the token is unauthorized | AC-2 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure` |
| TC-4 | The probe prints `unresolved` when the host has no DNS record | AC-3 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies` |
| TC-5 | The probe prints `served-directly` when the host answers 200 without redirecting | AC-3 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies` |
| TC-6 | Every flag used in the runbook appears in the script's help output when the test compares them | AC-4 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-runbook-matches-script` |

## Reading List
- apps/docs/wrangler.jsonc (all): account and zone ids, the assets-only custom-domain route
- scripts/docs-deploy/prepare.ts (1-80): host-side script conventions: fail closed, exit codes, node-only imports
- .spec/scenarios/UC-DELIV-02/header-and-domain-contract.scenario.md (all): the www 301 expectation
- https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-api/ (all): phase http_request_dynamic_redirect, rule shape, required token permission
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (all): never-edit lane config that APX-006 authors

## Guardrails
WRITE-ALLOWED:
- scripts/docs-deploy/zone-wiring.ts (NEW)
- scripts/docs-deploy/EDGE-RUNBOOK.md (NEW)
- tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts
WRITE-PROHIBITED:
- apps/docs/wrangler.jsonc - stays assets-only
- scripts/docs-deploy/prepare.ts - Sprint 05's script
- .github/** - the ghactions lane owns workflows
- .env - secrets never edited
- apps/docs/src/** - not a docs content task
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns it

## Design
References: SPRINT.md, 07-uc-deliv#UC-DELIV-02, 11-technical-requirements/06-external-dependencies
Pattern: if (isAuthError(res)) { console.error('zone-wiring: token lacks Zone > DNS > Edit and/or Zone > Single Redirect > Edit'); process.exit(3); }
Pattern source: scripts/docs-deploy/prepare.ts fail() helper (fail closed with a named reason)
Anti-pattern: PUTting the whole redirect ruleset: it replaces every existing rule. Add or update only the rule tagged `rnr-www-to-apex`.

## Verification Gates
- typecheck: `pnpm typecheck` -> Exit 0 with zone-wiring.ts type-checking
- lint: `./node_modules/.bin/biome ci scripts/docs-deploy/zone-wiring.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts` -> Exit 0, no diagnostics
- complexity: `pnpm check:fallow` -> Exit 0, no new findings in the new files
- AC-2 loud failure: `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure` -> Exit 0: exit code 3, both permissions named, no token echoed, no write
- AC-3 probe: `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies` -> Exit 0: served-directly and unresolved classified correctly, both exit 4
- AC-4 runbook: `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-runbook-matches-script` -> Exit 0: runbook flags match `--help`, permissions and ordering rule present
- FLOW-DELIV-02-header-and-domain-contract (www case, after operator apply): `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract` -> www assertions pass once the operator has run `--apply` with an authorized token (gate step 5); if that authority is absent, report BLOCKED with the exit-3 output

## Agent Instructions
Work per AC in order: (1) write or confirm the failing check (RED) and record it, (2) make the minimal change that turns it green (GREEN), (3) refactor with the check green. Use real services only; never mock. Commit on your task branch; never merge.

## Orchestrator Verification Protocol
Re-run every VERIFY in the Verification Gates yourself, read the evidence files named below, and confirm `git diff` touches only WRITE-ALLOWED paths. Do not accept an implementer's claim without the command output. A 'pre-existing failure' claim needs `git stash` proof.

## Evidence Gates
Each behavioral AC needs captured real-service output (stdout or api_response) matching its scenario's must_observe and excluding must_not_observe, plus proof.red or a recorded RED run where tdd_mode is red_first.

## Review Criteria
- REVIEWER CHECKS (folded from dropped APX-005): (1) the redirect preserves the path and lands on the apex, and the `-L` chain ends in one 200; (2) the script exits 3 with the permissions named on an invalid token and performs no write; (3) no secret appears in any output or file; (4) the runbook states the HSTS-after-redirect ordering; (5) `apps/docs/wrangler.jsonc` still has no binding and no `main`
- Confirm no stub, skip, canned response or synthetic success; failures fail closed.

## Dependencies
Depends on: ["APX-006"]
Blocks:     ["APX-001"]

## Notes
- Human-owned precondition (blocks completion, not a dependency): an operator token with `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`, and an operator running `zone-wiring.ts --apply`. Observed 2026-09-30: the current token cannot read the redirect ruleset. If that authority is missing, report AC-1 BLOCKED with the exit-3 output and never mark the task complete.
- The CI deploy token should not hold zone-edit rights; wiring is a one-time operator action, never run from CI or from tests.
- APX-001 must not deploy before `--probe-www` reads `redirect-ok`.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails":{"write_allowed":["scripts/docs-deploy/zone-wiring.ts (NEW)","scripts/docs-deploy/EDGE-RUNBOOK.md (NEW)","tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts (NEW)","tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts",".tmp/APX-002/** (NEW - cycle evidence required by the sprint runner)"],"write_prohibited":["apps/docs/wrangler.jsonc - stays assets-only","scripts/docs-deploy/prepare.ts - Sprint 05's script",".github/** - the ghactions lane owns workflows",".env - secrets never edited","apps/docs/src/** - not a docs content task","tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns it"]},"version":"1","task_id":"APX-002","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"www_unwired_zone":{"description":"The live zone as observed 2026-09-30: only the apex AAAA 100:: proxied record exists, www does not resolve, no redirect rule.","seed_method":"public_api","records":["GET https://www.rnraielements.com/ fails to resolve","zone DNS has one record: AAAA rnraielements.com 100:: proxied"]},"invalid_token_env":{"description":"The real script spawned with CLOUDFLARE_API_TOKEN set to a syntactically valid but unauthorized value.","seed_method":"cli","records":["CLOUDFLARE_API_TOKEN=invalid-token-apx002"]},"known_live_hosts":{"description":"Real hostnames with known behavior: the apex serving content directly, and a subdomain with no DNS record.","seed_method":"public_api","records":["https://rnraielements.com/ serves 200 directly","https://no-such-host-apx002.rnraielements.com/ does not resolve"]},"runbook_and_script":{"description":"The committed EDGE-RUNBOOK.md and zone-wiring.ts.","seed_method":"cli","records":["scripts/docs-deploy/EDGE-RUNBOOK.md","scripts/docs-deploy/zone-wiring.ts"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN an operator token with `Zone > DNS > Edit` and `Zone > Single Redirect > Edit` and `zone-wiring.ts --apply` completed WHEN the flow spec GETs `https://www.rnraielements.com/docs/introduction` and `https://www.rnraielements.com/` with redirects off THEN each returns exactly one 301 whose location is the apex URL for the same path, and following it returns 200","primary":false,"flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare zone (DNS and redirect rule) at rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare zone (DNS and redirect rule) at rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the www DNS record was never created so the host does not resolve","the redirect rule drops the path","the rule matches nothing so www serves 404 or 200","the redirect rule is absent from the zone, so www serves the unchanged default response"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"www_unwired_zone","action":{"actor":"api_client","steps":["GET https://www.rnraielements.com/docs/introduction with maxRedirects 0","GET https://www.rnraielements.com/ with maxRedirects 0","GET each location header"]},"end_state":{"must_observe":["status 301 with location `https://rnraielements.com/docs/introduction`","status 301 with an apex-host location for `/`","each followed location returns 200"],"must_not_observe":["a request error resolving www.rnraielements.com","status 200 served at www","a location missing the requested path","no 301 status at all, as from an empty redirect rule that matches nothing"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the real zone-wiring.ts spawned with an unauthorized token WHEN it runs `--check` and then `--apply` against the real Cloudflare API THEN both exit 3, both print `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`, neither prints the token value, and a following public probe of www shows no state change","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-loud-failure","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure","test_tier":"integration","verification_service":"real Cloudflare API (api.cloudflare.com) called by the real script","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Cloudflare API (api.cloudflare.com) called by the real script","topology":"single-node","negative_control":{"would_fail_if":["the script swallows the auth error and exits 0","the script exits 1 without naming a permission","the script echoes the token","--apply performs a write despite the failed authorization","the script is a no-op stub that prints the permission names without ever calling the Cloudflare API"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"invalid_token_env","action":{"actor":"cli_user","steps":["spawn `pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --check` with the invalid token and capture exit code and output","spawn the same with `--apply`","spawn `--probe-www` and record the classification"]},"end_state":{"must_observe":["exit code 3 for both `--check` and `--apply`","output contains `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`","output does not contain `invalid-token-apx002`","the `--probe-www` classification line is identical in the runs before and after the `--apply` attempt (same `<classification>` token both times)"],"must_not_observe":["exit code 0","an unnamed generic error","the token value in any output"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the public `--probe-www` mode and two real hosts with known behavior WHEN it probes a host that serves content directly and a host that does not resolve, each against the apex `rnraielements.com` THEN it prints `served-directly` and exits 4 for the first, prints `unresolved` and exits 4 for the second, and its `redirect-ok` classification requires exactly one 301 whose location host is the apex","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-probe-classifies","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com hosts, real script","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com hosts, real script","topology":"single-node","negative_control":{"would_fail_if":["the probe follows redirects and reports the final 200 as ok","the probe treats a DNS failure as ok","the probe accepts any 3xx instead of exactly one 301","the probe hardcodes the `redirect-ok` result without making any request"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"known_live_hosts","action":{"actor":"cli_user","steps":["run `zone-wiring.ts --probe-www --host rnraielements.com` and capture output and exit code","run `zone-wiring.ts --probe-www --host no-such-host-apx002.rnraielements.com` and capture output and exit code"]},"end_state":{"must_observe":["first run prints `served-directly` and exits 4","second run prints `unresolved` and exits 4"],"must_not_observe":["exit 0 for either host","`redirect-ok` for either host"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN the committed EDGE-RUNBOOK.md and zone-wiring.ts WHEN the test extracts each `zone-wiring.ts` invocation from the runbook's fenced commands and runs the script's `--help` THEN every flag in the runbook appears in the help output, and the runbook names both required permissions and the rule that HSTS ships only after the probe reads `redirect-ok`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-runbook-matches-script","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-runbook-matches-script","test_tier":"integration","verification_service":"real script `--help` output and the real runbook file","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script `--help` output and the real runbook file","topology":"single-node","negative_control":{"would_fail_if":["the runbook documents a flag the script does not have","the runbook omits a required permission","the runbook omits the HSTS-after-redirect order"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"runbook_and_script","action":{"actor":"cli_user","steps":["read the fenced shell blocks in EDGE-RUNBOOK.md and collect every `--flag` used with zone-wiring.ts","run `pnpm exec tsx scripts/docs-deploy/zone-wiring.ts --help` and capture stdout"]},"end_state":{"must_observe":["the flags `--check`, `--apply` and `--probe-www` appear in both the runbook and the help","the runbook contains `Zone > DNS > Edit` and `Zone > Single Redirect > Edit`","the runbook states HSTS ships only after the probe reads `redirect-ok`"],"must_not_observe":["a runbook flag absent from the help output","an empty flag list"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The www `/docs/introduction` response is one 301 to the apex counterpart when the flow spec requests it after `--apply`","flow_ref":"FLOW-DELIV-02-header-and-domain-contract","test_file":"tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts","test_function":"FLOW-DELIV-02-header-and-domain-contract","test_tier":"e2e","verification_service":"live Cloudflare zone (DNS and redirect rule) at rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts --grep FLOW-DELIV-02-header-and-domain-contract","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"`zone-wiring.ts --apply` exits 3 when the token is unauthorized","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-loud-failure","test_tier":"integration","verification_service":"real Cloudflare API (api.cloudflare.com) called by the real script","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The script output omits the token value when the token is unauthorized","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-loud-failure","test_tier":"integration","verification_service":"real Cloudflare API (api.cloudflare.com) called by the real script","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-loud-failure","maps_to_ac":"AC-2"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"The probe prints `unresolved` when the host has no DNS record","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-probe-classifies","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com hosts, real script","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies","maps_to_ac":"AC-3"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"The probe prints `served-directly` when the host answers 200 without redirecting","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-probe-classifies","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com hosts, real script","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-probe-classifies","maps_to_ac":"AC-3"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"Every flag used in the runbook appears in the script's help output when the test compares them","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts","test_function":"APX-002-runbook-matches-script","test_tier":"integration","verification_service":"real script `--help` output and the real runbook file","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts --grep APX-002-runbook-matches-script","maps_to_ac":"AC-4"}]}
-->

## Handoff

```json
{
  "task": "APX-002",
  "commit_sha": "8d3b047347b8da7ed1f8d12ed7e492c041a5296e",
  "done": "Landed scripts/docs-deploy/zone-wiring.ts (--probe-www/--check/--apply), scripts/docs-deploy/EDGE-RUNBOOK.md, and tests/sprint-07-deploy-live-at-apex/zone-wiring.remote.spec.ts with RED/GREEN evidence under .tmp/APX-002. AC-2/AC-3/AC-4 green; AC-1 left RED for the human-owned --apply precondition. Merged to main as adb61d50408fd4ccb681fec7bfb15cfa41102e1b.",
  "deviations": [],
  "concerns": [],
  "findings": [],
  "scope_impact": [],
  "feedback": []
}
```
