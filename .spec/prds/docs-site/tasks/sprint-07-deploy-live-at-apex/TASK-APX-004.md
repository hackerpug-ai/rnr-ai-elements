================================================================================
TASK: APX-004 - Edge-config preflight: assets-only zero-bindings wrangler.jsonc, 404.html present, optional www-redirect gate
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog
PRIORITY:   P0
POINTS:     2
AGENT:      planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer

PROPOSED BY: cloudflare-workers-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: nothing stops a deploy when the Worker config gains a binding or an entry point, when the 404 page is missing from dist, or when www does not yet redirect.
Why it matters: Sprint 08's one-command rollback depends on an assets-only Worker with zero bindings, and HSTS with `includeSubDomains` (APX-001) must not ship before www redirects.
Current: APX-031's `preflight-dist.ts` checks dist contents, but no check covers the Worker config, the 404 page or the www redirect.
Desired: one small fail-closed script the deploy job runs next to `preflight-dist.ts`.

## Critical Constraints
MUST:
- MUST implement `scripts/docs-deploy/preflight-edge.ts` as a SEPARATE script from APX-031's `preflight-dist.ts`, run as `pnpm exec tsx scripts/docs-deploy/preflight-edge.ts --dist apps/docs/dist [--config apps/docs/wrangler.jsonc] [--require-www-redirect] [--www-host <host>] [--apex-host <host>]`; it exits 0 only when every check passes and 1 on any failure, naming each failed item
- MUST parse `wrangler.jsonc` as JSON with comments and fail unless it has an `assets` block, no `main` key, and none of the binding keys `kv_namespaces`, `d1_databases`, `r2_buckets`, `durable_objects`, `services`, `queues`, `ai`, `vars`, `browser`, `vectorize`, `hyperdrive`
- MUST fail unless `<dist>/404.html` exists and is non-empty
- MUST, with `--require-www-redirect`, make one real request to `https://<www-host>/` with redirects off (defaults `www.rnraielements.com` and apex `rnraielements.com`) and pass only on exactly one 301 whose `location` host is the apex; classify the outcome as `redirect-ok`, `served-directly`, `wrong-target` or `unresolved`, and print it
- MUST print exactly `[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present` on success, plus `; www redirect-ok` when the flag is used
NEVER:
- NEVER re-check `dist/r` contents, `_headers` byte-equality or tracked status: APX-031's `preflight-dist.ts` owns those, and this task must not edit that file
- NEVER edit `apps/docs/wrangler.jsonc` or `scripts/docs-deploy/prepare.ts`: the config is only read, and tests mutate owned temp copies
- NEVER follow redirects in the www probe, and never treat an unresolved host or a 200 at www as a pass
- NEVER use a mock, a canned response or a local fixture server for the www probe: it reads real network responses
STRICTLY:
- STRICTLY use only node built-ins (`node:fs`, `node:os`, `node:path`, global `fetch`) and no new dependency; a small JSONC comment stripper is enough
- STRICTLY the spec is a root-collected `.spec.ts` that runs after a docs build (`pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep <id>`) and drives the real script against OS-temp copies via `os.tmpdir()`, never a `/tmp` literal
- UNIT_TEST_JUSTIFIED: none needed, every AC drives the real script against real files or the real network.
- REVIEWER CHECKS (folded from dropped APX-005): (1) the zero-binding invariant matches Sprint 08's rollback precondition; (2) the www gate fails on an unresolved host, so HSTS `includeSubDomains` cannot ship before www redirects; (3) `preflight-dist.ts` and `preflight-edge.ts` do not duplicate a check; (4) the deploy job runs both, with `preflight-edge.ts` passing `--require-www-redirect` only after APX-002's operator apply (human-owned precondition)

## Specification
Objective: Give the deploy job one fail-closed command that refuses an upload when the Worker config is no longer assets-only with zero bindings, when the 404 page is missing, or (optionally) when www does not yet 301 to the apex.
Success state: On the real config and a real built dist the script exits 0 with the exact ok line; each mutated temp copy (a binding added, `main` added, `404.html` removed) exits 1 naming the offender; and the www gate exits 1 for a host that serves directly or does not resolve and 0 for a host that returns one 301 to the apex.

## Acceptance Criteria
### AC-1: The real config and built dist pass with the exact ok line
  GIVEN: the committed wrangler.jsonc and a freshly built dist
  WHEN:  the spec runs `preflight-edge.ts --dist <dist> --config <config>` on the real files
  THEN:  the script exits 0 and prints exactly `[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present`
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real script, real apps/docs/wrangler.jsonc and real built dist
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts
  TEST_FUNCTION: APX-004-real-config-passes
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-real-config-passes
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script, real apps/docs/wrangler.jsonc and real built dist","topology":"single-node","negative_control":{"would_fail_if":["the script exits 0 without reading the config","the JSONC comments in the real config make the parser throw","the ok line is printed when 404.html is missing","the script hardcodes the ok line and never reads the config or the dist directory"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_config_and_dist","action":{"actor":"cli_user","steps":["run `pnpm exec tsx scripts/docs-deploy/preflight-edge.ts --dist apps/docs/dist --config apps/docs/wrangler.jsonc` and capture exit code and stdout"]},"end_state":{"must_observe":["exit code 0","stdout line `[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present`"],"must_not_observe":["a nonzero exit","a JSON parse error caused by the config's comments","an empty stdout with no ok line"]}}]}
```

### AC-2: A binding or a main entry in the config is refused and named
  GIVEN: OS-temp copies of the real config, one with `kv_namespaces` added and one with `main` added
  WHEN:  the script runs against each copy
  THEN:  each run exits 1 and its output names the offending key (`kv_namespaces`, `main`)
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real script over owned temp copies of the real config
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts
  TEST_FUNCTION: APX-004-refuses-bindings
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script over owned temp copies of the real config","topology":"single-node","negative_control":{"would_fail_if":["the script checks only a subset of binding keys","the script ignores `main`","the failure message does not name the key","the binding check is removed for one key, so a config carrying that key still passes"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_config_and_dist","action":{"actor":"cli_user","steps":["copy wrangler.jsonc to a temp dir and add `\"kv_namespaces\": [{\"binding\":\"K\",\"id\":\"x\"}]`, run the script with `--config` pointing at the copy","copy again and add `\"main\": \"src/worker.ts\"`, run the script"]},"end_state":{"must_observe":["both runs exit 1","the first output contains `kv_namespaces`","the second output contains `main`"],"must_not_observe":["exit code 0 for either copy","an output that names neither key"]}}]}
```

### AC-3: A missing 404 page is refused and named
  GIVEN: an OS-temp copy of the real dist with `404.html` removed
  WHEN:  the script runs with `--dist` pointing at the copy
  THEN:  it exits 1 and its output names `404.html`
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real script over an owned temp copy of the real dist
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts
  TEST_FUNCTION: APX-004-refuses-missing-404
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-missing-404
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script over an owned temp copy of the real dist","topology":"single-node","negative_control":{"would_fail_if":["the script never looks at the dist directory","the script accepts an empty 404.html"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_config_and_dist","action":{"actor":"cli_user","steps":["copy apps/docs/dist to a temp dir, delete 404.html, run the script with `--dist` at the copy","truncate 404.html to zero bytes in a second copy and run again"]},"end_state":{"must_observe":["both runs exit 1","both outputs contain `404.html`"],"must_not_observe":["exit code 0","an output that does not name the file"]}}]}
```

### AC-4: The www gate passes only on exactly one 301 to the apex
  GIVEN: `--require-www-redirect` with real hosts of known behavior
  WHEN:  the script probes a host that serves directly, a host that does not resolve, and a host that answers one 301 to its apex
  THEN:  the first exits 1 printing `served-directly`, the second exits 1 printing `unresolved`, and the third exits 0 printing `redirect-ok`
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real HTTPS and DNS to rnraielements.com, no-such-host-apx004.rnraielements.com and www.github.com
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts
  TEST_FUNCTION: APX-004-www-gate
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com, no-such-host-apx004.rnraielements.com and www.github.com","topology":"single-node","negative_control":{"would_fail_if":["the probe follows redirects and reports the final 200 as ok","the probe treats a DNS failure as ok","the probe accepts a 301 to the wrong host","the probe is a stub that hardcodes `redirect-ok` regardless of the host's real response"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"known_www_hosts","action":{"actor":"cli_user","steps":["run the script with `--require-www-redirect --www-host rnraielements.com --apex-host rnraielements.com`","run it with `--www-host no-such-host-apx004.rnraielements.com --apex-host rnraielements.com`","run it with `--www-host www.github.com --apex-host github.com`","run it with `--www-host www.github.com --apex-host rnraielements.com`"]},"end_state":{"must_observe":["run 1 exits 1 printing `served-directly`","run 2 exits 1 printing `unresolved`","run 3 exits 0 printing `redirect-ok`","run 4 exits 1 printing `wrong-target`"],"must_not_observe":["exit 0 for runs 1, 2 or 4","`redirect-ok` for runs 1, 2 or 4"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|---|---|---|---|
| TC-1 | The script exits 0 when it runs on the committed config and a freshly built dist | AC-1 | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-real-config-passes` |
| TC-2 | The script's output names `kv_namespaces` when the config copy carries that key | AC-2 | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings` |
| TC-3 | The script exits 1 when the config copy carries a `main` key | AC-2 | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings` |
| TC-4 | The script exits 1 naming `404.html` when the dist copy lacks that file | AC-3 | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-missing-404` |
| TC-5 | The www gate prints `unresolved` and exits 1 when the host has no DNS record | AC-4 | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate` |
| TC-6 | The www gate prints `redirect-ok` and exits 0 when the host answers one 301 to the named apex | AC-4 | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate` |

## Reading List
- apps/docs/wrangler.jsonc (all): the assets-only config with comments the parser must tolerate
- scripts/docs-deploy/prepare.ts (1-80): host-side script conventions: fail closed, `--dist` override, node-only imports
- scripts/docs-deploy/zone-wiring.ts (all): APX-002's www probe classification names to keep consistent (`redirect-ok`, `served-directly`, `unresolved`)
- playwright.config.ts (1-30): the root lane that collects this .spec.ts and its chromium-desktop project
- .spec/e2e-policy/surface.json (all): policy patterns

## Guardrails
WRITE-ALLOWED:
- scripts/docs-deploy/preflight-edge.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts (NEW)
WRITE-PROHIBITED:
- scripts/docs-deploy/preflight-dist.ts - APX-031 owns it
- scripts/docs-deploy/prepare.ts - Sprint 05's script
- apps/docs/wrangler.jsonc - read only
- .github/** - the ghactions lane owns workflows
- packages/registry/**
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns it

## Design
References: SPRINT.md, 07-uc-deliv#UC-DELIV-02, 11-technical-requirements/01-posture
Pattern: const res = await fetch(`https://${wwwHost}/`, { redirect: 'manual' }); classify: res.status === 301 && new URL(res.headers.get('location')!).host === apexHost ? 'redirect-ok' : res.status === 200 ? 'served-directly' : 'wrong-target'; a thrown network error maps to 'unresolved'
Pattern source: scripts/docs-deploy/prepare.ts fail() helper and node global fetch
Anti-pattern: Using `redirect: 'follow'` and checking the final status: a 200 at the end of a chain would pass while www never redirected.

## Verification Gates
- typecheck: `pnpm typecheck` -> Exit 0 with preflight-edge.ts type-checking
- lint: `./node_modules/.bin/biome ci scripts/docs-deploy/preflight-edge.ts tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts` -> Exit 0, no diagnostics
- complexity: `pnpm check:fallow` -> Exit 0, no new findings in the new files
- AC-1 real config passes: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-real-config-passes` -> Exit 0 with the exact ok line
- AC-2 refuses bindings: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings` -> Exit 0: both mutated configs exit 1 naming the key
- AC-3 refuses missing 404: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-missing-404` -> Exit 0: missing and empty 404.html both exit 1 naming the file
- AC-4 www gate: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate` -> Exit 0: served-directly, unresolved and wrong-target exit 1; redirect-ok exits 0

## Agent Instructions
Work per AC in order: (1) write or confirm the failing check (RED) and record it, (2) make the minimal change that turns it green (GREEN), (3) refactor with the check green. Use real services only; never mock. Commit on your task branch; never merge.

## Orchestrator Verification Protocol
Re-run every VERIFY in the Verification Gates yourself, read the evidence files named below, and confirm `git diff` touches only WRITE-ALLOWED paths. Do not accept an implementer's claim without the command output. A 'pre-existing failure' claim needs `git stash` proof.

## Evidence Gates
Each behavioral AC needs captured real-service output (stdout or api_response) matching its scenario's must_observe and excluding must_not_observe, plus proof.red or a recorded RED run where tdd_mode is red_first.

## Review Criteria
- REVIEWER CHECKS (folded from dropped APX-005): (1) the zero-binding invariant matches Sprint 08's rollback precondition; (2) the www gate fails on an unresolved host, so HSTS `includeSubDomains` cannot ship before www redirects; (3) `preflight-dist.ts` and `preflight-edge.ts` do not duplicate a check; (4) the deploy job runs both, with `preflight-edge.ts` passing `--require-www-redirect` only after APX-002's operator apply (human-owned precondition)
- Confirm no stub, skip, canned response or synthetic success; failures fail closed.

## Dependencies
Depends on: []
Blocks:     ["APX-023"]

## Notes
- Kept as a separate script from APX-031's `preflight-dist.ts` (owned by the Astro lane, offline, vitest-tested); this one reads the Worker config and can make one public network request, so the two failure reports stay separate. The deploy job runs both.
- Human-owned preconditions (not dependencies): the deploy job passes `--require-www-redirect` only after an operator has applied APX-002's wiring; until then the deploy fails loudly, which is the intended ordering guard.
- The spec runs under the root docs-e2e lane and needs a built dist; its verify commands build the docs first.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails":{"write_allowed":["scripts/docs-deploy/preflight-edge.ts (NEW)","tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts (NEW)",".tmp/APX-004/** (NEW - cycle evidence required by the sprint runner)"],"write_prohibited":["scripts/docs-deploy/preflight-dist.ts - APX-031 owns it","scripts/docs-deploy/prepare.ts - Sprint 05's script","apps/docs/wrangler.jsonc - read only",".github/** - the ghactions lane owns workflows","packages/registry/**","tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns it"]},"version":"1","task_id":"APX-004","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"real_config_and_dist":{"description":"The committed apps/docs/wrangler.jsonc and a freshly built apps/docs/dist, copied to OS-temp directories for mutation.","seed_method":"cli","records":["apps/docs/wrangler.jsonc has assets and no main or binding","apps/docs/dist/404.html exists"]},"known_www_hosts":{"description":"Real hosts with known behavior for the www probe: rnraielements.com serves 200 directly, a nonexistent subdomain does not resolve, and www.github.com answers one 301 to github.com.","seed_method":"public_api","records":["https://rnraielements.com/ returns 200","no-such-host-apx004.rnraielements.com does not resolve","https://www.github.com/ returns 301 location https://github.com/"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the committed wrangler.jsonc and a freshly built dist WHEN the spec runs `preflight-edge.ts --dist <dist> --config <config>` on the real files THEN the script exits 0 and prints exactly `[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-real-config-passes","verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-real-config-passes","test_tier":"integration","verification_service":"real script, real apps/docs/wrangler.jsonc and real built dist","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script, real apps/docs/wrangler.jsonc and real built dist","topology":"single-node","negative_control":{"would_fail_if":["the script exits 0 without reading the config","the JSONC comments in the real config make the parser throw","the ok line is printed when 404.html is missing","the script hardcodes the ok line and never reads the config or the dist directory"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_config_and_dist","action":{"actor":"cli_user","steps":["run `pnpm exec tsx scripts/docs-deploy/preflight-edge.ts --dist apps/docs/dist --config apps/docs/wrangler.jsonc` and capture exit code and stdout"]},"end_state":{"must_observe":["exit code 0","stdout line `[docs-deploy] preflight-edge ok: assets-only (no main, no bindings); 404.html present`"],"must_not_observe":["a nonzero exit","a JSON parse error caused by the config's comments","an empty stdout with no ok line"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN OS-temp copies of the real config, one with `kv_namespaces` added and one with `main` added WHEN the script runs against each copy THEN each run exits 1 and its output names the offending key (`kv_namespaces`, `main`)","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-refuses-bindings","verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings","test_tier":"integration","verification_service":"real script over owned temp copies of the real config","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script over owned temp copies of the real config","topology":"single-node","negative_control":{"would_fail_if":["the script checks only a subset of binding keys","the script ignores `main`","the failure message does not name the key","the binding check is removed for one key, so a config carrying that key still passes"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_config_and_dist","action":{"actor":"cli_user","steps":["copy wrangler.jsonc to a temp dir and add `\"kv_namespaces\": [{\"binding\":\"K\",\"id\":\"x\"}]`, run the script with `--config` pointing at the copy","copy again and add `\"main\": \"src/worker.ts\"`, run the script"]},"end_state":{"must_observe":["both runs exit 1","the first output contains `kv_namespaces`","the second output contains `main`"],"must_not_observe":["exit code 0 for either copy","an output that names neither key"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN an OS-temp copy of the real dist with `404.html` removed WHEN the script runs with `--dist` pointing at the copy THEN it exits 1 and its output names `404.html`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-refuses-missing-404","verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-missing-404","test_tier":"integration","verification_service":"real script over an owned temp copy of the real dist","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real script over an owned temp copy of the real dist","topology":"single-node","negative_control":{"would_fail_if":["the script never looks at the dist directory","the script accepts an empty 404.html"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_config_and_dist","action":{"actor":"cli_user","steps":["copy apps/docs/dist to a temp dir, delete 404.html, run the script with `--dist` at the copy","truncate 404.html to zero bytes in a second copy and run again"]},"end_state":{"must_observe":["both runs exit 1","both outputs contain `404.html`"],"must_not_observe":["exit code 0","an output that does not name the file"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN `--require-www-redirect` with real hosts of known behavior WHEN the script probes a host that serves directly, a host that does not resolve, and a host that answers one 301 to its apex THEN the first exits 1 printing `served-directly`, the second exits 1 printing `unresolved`, and the third exits 0 printing `redirect-ok`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-www-gate","verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com, no-such-host-apx004.rnraielements.com and www.github.com","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com, no-such-host-apx004.rnraielements.com and www.github.com","topology":"single-node","negative_control":{"would_fail_if":["the probe follows redirects and reports the final 200 as ok","the probe treats a DNS failure as ok","the probe accepts a 301 to the wrong host","the probe is a stub that hardcodes `redirect-ok` regardless of the host's real response"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"known_www_hosts","action":{"actor":"cli_user","steps":["run the script with `--require-www-redirect --www-host rnraielements.com --apex-host rnraielements.com`","run it with `--www-host no-such-host-apx004.rnraielements.com --apex-host rnraielements.com`","run it with `--www-host www.github.com --apex-host github.com`","run it with `--www-host www.github.com --apex-host rnraielements.com`"]},"end_state":{"must_observe":["run 1 exits 1 printing `served-directly`","run 2 exits 1 printing `unresolved`","run 3 exits 0 printing `redirect-ok`","run 4 exits 1 printing `wrong-target`"],"must_not_observe":["exit 0 for runs 1, 2 or 4","`redirect-ok` for runs 1, 2 or 4"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"The script exits 0 when it runs on the committed config and a freshly built dist","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-real-config-passes","test_tier":"integration","verification_service":"real script, real apps/docs/wrangler.jsonc and real built dist","unit_test_justified":null,"verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-real-config-passes","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The script's output names `kv_namespaces` when the config copy carries that key","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-refuses-bindings","test_tier":"integration","verification_service":"real script over owned temp copies of the real config","unit_test_justified":null,"verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The script exits 1 when the config copy carries a `main` key","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-refuses-bindings","test_tier":"integration","verification_service":"real script over owned temp copies of the real config","unit_test_justified":null,"verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-bindings","maps_to_ac":"AC-2"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"The script exits 1 naming `404.html` when the dist copy lacks that file","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-refuses-missing-404","test_tier":"integration","verification_service":"real script over an owned temp copy of the real dist","unit_test_justified":null,"verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-refuses-missing-404","maps_to_ac":"AC-3"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"The www gate prints `unresolved` and exits 1 when the host has no DNS record","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-www-gate","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com, no-such-host-apx004.rnraielements.com and www.github.com","unit_test_justified":null,"verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate","maps_to_ac":"AC-4"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"The www gate prints `redirect-ok` and exits 0 when the host answers one 301 to the named apex","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts","test_function":"APX-004-www-gate","test_tier":"integration","verification_service":"real HTTPS and DNS to rnraielements.com, no-such-host-apx004.rnraielements.com and www.github.com","unit_test_justified":null,"verify":"pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/preflight-edge.spec.ts --project chromium-desktop --grep APX-004-www-gate","maps_to_ac":"AC-4"}]}
-->
