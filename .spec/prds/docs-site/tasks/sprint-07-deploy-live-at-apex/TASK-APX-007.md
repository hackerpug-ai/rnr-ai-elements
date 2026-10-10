================================================================================
TASK: APX-007 - Live 112-file completeness sweep spec (per-engine tally, max-age=300)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: 6b8903a66372d67f3f3167e6da3d6378ceaac3ab
PRIORITY:   P0
POINTS:     2
AGENT:      planner=cloudflare-workers-planner | implementer=cloudflare-workers-implementer | reviewer=cloudflare-workers-reviewer

PROPOSED BY: cloudflare-workers-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
Problem: nothing checks that the live apex serves every registry item with the right type and cache tier. Today all 112 `/r/{engine}/{item}.json` URLs return `200 application/json` but with `public, max-age=0, must-revalidate`.
Why it matters: UC-DELIV-03 promises that install commands resolve same-origin from the same deploy, and CAP-INST-01 needs `public, max-age=300` so agents never pin stale items.
Current: no live sweep exists; status and type are already green, so the cache tier is what is red.
Desired: one live sweep spec over both engines and all 56 items that fails per engine when any item is missing or mistiered.

## Critical Constraints
MUST:
- MUST read the 56 item names from `packages/registry/registry.json` at run time (`items[].name`) and build the URL set as both engines (`nativewind`, `uniwind`) times those names, giving 112 URLs; a hard-coded list is forbidden
- MUST fetch each URL with `request.get(url, { maxRedirects: 0 })` from `https://rnraielements.com` and assert status 200, content-type `application/json`, and cache-control exactly `public, max-age=300` as one header value
- MUST record a per-engine present/expected count and fail unless every engine reaches its full expected count, iterating over both engines rather than stopping at the first
- MUST title the flow test with the exact id `FLOW-DELIV-03-112-file-completeness` and write run.json, with proof.red captured from the RED run at landing
NEVER:
- NEVER edit `tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts`: APX-006 owns it and it is a never-edit path here
- NEVER hard-code item names, the count 56, or a subset; derive them so a registry change moves the sweep
- NEVER follow redirects, stand up a fixture server, or read a canned body: the sweep hits the live domain
- NEVER accept a body that fails JSON parsing or whose `.name` differs from the requested item
STRICTLY:
- STRICTLY the RED proof today is `112 x public, max-age=0, must-revalidate`; status and content-type already pass, so the cache-tier assertion is what makes the flow honestly red
- STRICTLY the tally report format is `engine=<engine> present=<n> expected=<n>` per engine, recorded in run.json
- UNIT_TEST_JUSTIFIED: the tally reporter AC-4 is a pure function over a results list with zero I/O, so a unit test is right because it proves a short engine fails the tally without needing a broken live registry.
- PRECONDITION (human-owned, not a dependency): the max-age=300 tier goes green only after APX-001's `_headers` is deployed through the gated CI job

## Specification
Objective: Land a live sweep spec that proves both engine trees serve every registry item as `200 application/json` with `public, max-age=300`.
Success state: At landing the flow run exits nonzero because every one of the 112 URLs reports `public, max-age=0, must-revalidate`, recorded in proof.red. After APX-001 deploys, the same command exits 0 with `engine=nativewind present=56 expected=56` and `engine=uniwind present=56 expected=56` (gate step 8).

## Acceptance Criteria
### AC-1: All 112 registry URLs return 200 application/json with max-age=300 [PRIMARY]
  GIVEN: the 56 names from packages/registry/registry.json and the live apex
  WHEN:  the spec GETs `/r/{engine}/{item}.json` for both engines and all 56 names with redirects off
  THEN:  all 112 responses are 200 with content-type `application/json` and cache-control exactly `public, max-age=300`, and the recorded tallies are `engine=nativewind present=56 expected=56` and `engine=uniwind present=56 expected=56`
  TDD_STATE: RED
  FLOW_REF: FLOW-DELIV-03-112-file-completeness
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-03-112-file-completeness
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness
  SCENARIO:
```json
{"primary":true,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the /r rule is missing so cache-control stays `public, max-age=0, must-revalidate`","the /r rule copies the immutable tier","an item file is absent so the URL returns 404 or an HTML body","the sweep reads a hard-coded shorter list"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"registry_56_items","action":{"actor":"api_client","steps":["read items[].name from packages/registry/registry.json","for each engine and name GET https://rnraielements.com/r/{engine}/{name}.json with maxRedirects 0","record status, content-type, cache-control and per-engine present counts"]},"end_state":{"must_observe":["112 responses with status 200 and content-type application/json","112 responses with cache-control `public, max-age=300`","tally lines `engine=nativewind present=56 expected=56` and `engine=uniwind present=56 expected=56`"],"must_not_observe":["any cache-control `public, max-age=0, must-revalidate` on a registry JSON","any 404 or text/html response","a tally with present below expected"]}}]}
```

### AC-2: Each served body parses and names the requested item
  GIVEN: the live registry JSON for both engines
  WHEN:  the sweep parses each of the 112 bodies
  THEN:  every body is valid JSON whose `name` equals the requested item name
  TDD_STATE: RED
  FLOW_REF: FLOW-DELIV-03-112-file-completeness
  TEST_TIER: e2e
  VERIFICATION_SERVICE: live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)
  SURFACE_POLICY: .spec/e2e-policy/surface.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts
  TEST_FUNCTION: FLOW-DELIV-03-112-file-completeness
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["a URL serves an HTML 404 body with status 200","a body's name field belongs to a different item","the served file is empty"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"registry_56_items","action":{"actor":"api_client","steps":["GET /r/nativewind/conversation.json and /r/uniwind/conversation.json","JSON-parse each body and compare `.name` with the item","repeat for all 112 URLs"]},"end_state":{"must_observe":["`.name` equals `conversation` for both engines' conversation.json","112 of 112 bodies parse as JSON with `.name` equal to the requested item"],"must_not_observe":["a body starting with `<!doctype html>`","a JSON parse failure","a `.name` that differs from the requested item","an empty body (0 bytes) served with status 200"]}}]}
```

### AC-3: The URL set is derived from the registry at run time, both engines, 112 URLs
  GIVEN: the real packages/registry/registry.json on disk
  WHEN:  the spec builds its URL set
  THEN:  it holds 56 distinct names, both engines, and 112 URLs each shaped `https://rnraielements.com/r/{engine}/{name}.json`
  TDD_STATE: RED
  FLOW_REF: null
  TEST_TIER: integration
  VERIFICATION_SERVICE: real filesystem read of packages/registry/registry.json
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts
  TEST_FUNCTION: APX-007-url-set
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-url-set
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real filesystem read of packages/registry/registry.json","topology":"single-node","negative_control":{"would_fail_if":["the spec uses a hard-coded list of a different length","only one engine is enumerated","names are not de-duplicated","the URL list is hardcoded to a static subset, so a registry change does not move the sweep"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"registry_56_items","action":{"actor":"cli_user","steps":["call the spec's URL builder over the real registry.json","count names, engines and URLs"]},"end_state":{"must_observe":["56 distinct item names","2 engines: nativewind and uniwind","112 URLs, each matching `https://rnraielements.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json`"],"must_not_observe":["a URL count other than 112","a duplicate URL","0 URLs built, or an empty name list"]}}]}
```

### AC-4: The tally reporter fails a short engine and names it
  GIVEN: a literal results list where one engine has 50 of 56 passing
  WHEN:  the pure tally reporter evaluates it
  THEN:  it fails with `engine=<that engine> present=50 expected=56` and passes a list where both engines have 56 of 56
  TDD_STATE: RED
  TEST_TIER: unit
  UNIT_TEST_JUSTIFIED: Pure tally arithmetic over a literal list with zero I/O: a unit test is right because it proves a short engine cannot pass without needing to break the live registry.
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts
  TEST_FUNCTION: APX-007-tally-oracle
  VERIFY: CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-tally-oracle
  SCENARIO:
```json
{"primary":false,"tier":"visible","test_tier":"unit","unit_test_justified":"Pure tally arithmetic over a literal list with zero I/O: a unit test is right because it proves a short engine cannot pass without needing to break the live registry.","verification_service":"pure tally reporter, no I/O","topology":"single-node","negative_control":{"would_fail_if":["the reporter checks only the first engine","the reporter compares the total across engines instead of per engine","the reporter passes when present is below expected","the reporter is a no-op that always passes regardless of the results list"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"engine_results_short","action":{"actor":"api_client","steps":["evaluate the list with engine A 56 of 56 and engine B 50 of 56","evaluate a list with both engines 56 of 56"]},"end_state":{"must_observe":["failure text `engine=B present=50 expected=56`","the all-full list passes with both engines reported as present=56 expected=56"],"must_not_observe":["a pass on the short list","a failure message without the engine name","an empty results list treated as a pass"]}}]}
```

## Test Criteria
| ID | Statement | Maps to | Verify |
|---|---|---|---|
| TC-1 | All 112 registry URLs return cache-control exactly `public, max-age=300` when the sweep runs against the live apex | AC-1 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness` |
| TC-2 | The nativewind tally reads present=56 expected=56 when the sweep completes | AC-1 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness` |
| TC-3 | The uniwind tally reads present=56 expected=56 when the sweep completes | AC-1 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness` |
| TC-4 | Every body's `.name` equals the requested item name when the sweep parses the 112 bodies | AC-2 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness` |
| TC-5 | The URL builder yields 112 URLs when it reads the real registry.json | AC-3 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-url-set` |
| TC-6 | The tally reporter fails naming the engine when one engine has fewer present items than expected | AC-4 | `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-tally-oracle` |

## Reading List
- .spec/scenarios/UC-DELIV-03/112-file-completeness.scenario.md (all): the visible scenario's inputs and expected outputs
- packages/registry/registry.json (1-40): the `items[].name` shape the sweep derives from
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts (all): never-edit lane config that APX-006 authors
- tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts (all): APX-006's helper conventions to mirror, never edit
- .spec/e2e-policy/surface.json (all): patterns the spec must match

## Guardrails
WRITE-ALLOWED:
- tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-112-file-completeness/run.json (NEW)
- tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-112-file-completeness/proof.red (NEW)
WRITE-PROHIBITED:
- packages/registry/** - the registry is the source of names, never edited here
- apps/docs/** - build output is owned by the Astro tasks
- tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns it
- tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts - APX-006 owns it
- .github/** - the ghactions lane owns workflows

## Design
References: SPRINT.md, 07-uc-deliv#UC-DELIV-03, .spec/scenarios/UC-DELIV-03/112-file-completeness.scenario.md
Pattern: const names = JSON.parse(readFileSync('packages/registry/registry.json', 'utf8')).items.map((i) => i.name); for (const engine of ['nativewind', 'uniwind']) for (const name of names) { const r = await request.get(`https://rnraielements.com/r/${engine}/${name}.json`, { maxRedirects: 0 }); ... }
Pattern source: tests/sprint-05-orient-search/public-recovery.remote.spec.ts:1-40
Anti-pattern: Breaking out of the loop on the first failure or summing across engines: per-engine present/expected counts are what make a short tree visible.

## Verification Gates
- typecheck: `pnpm typecheck` -> Exit 0 with the new spec type-checking
- lint: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts` -> Exit 0, no diagnostics
- complexity: `pnpm check:fallow` -> Exit 0, no new findings in the new file
- AC-3 URL set: `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-url-set` -> Exit 0 with 56 names and 112 URLs
- AC-4 tally oracle: `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-tally-oracle` -> Exit 0: short engine rejected naming the engine, full list accepted
- FLOW-DELIV-03-112-file-completeness (RED at landing): `CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness` -> Exit nonzero at landing, recorded in proof.red: 112 URLs report `public, max-age=0, must-revalidate`. Exit 0 after APX-001 deploys (gate step 8)

## Agent Instructions
Work per AC in order: (1) write or confirm the failing check (RED) and record it, (2) make the minimal change that turns it green (GREEN), (3) refactor with the check green. Use real services only; never mock. Commit on your task branch; never merge.

## Orchestrator Verification Protocol
Re-run every VERIFY in the Verification Gates yourself, read the evidence files named below, and confirm `git diff` touches only WRITE-ALLOWED paths. Do not accept an implementer's claim without the command output. A 'pre-existing failure' claim needs `git stash` proof.

## Evidence Gates
Each behavioral AC needs captured real-service output (stdout or api_response) matching its scenario's must_observe and excluding must_not_observe, plus proof.red or a recorded RED run where tdd_mode is red_first.

## Review Criteria
- Confirm every MUST and NEVER above holds in the diff.
- Confirm no stub, skip, canned response or synthetic success; failures fail closed.

## Dependencies
Depends on: ["APX-006"]
Blocks:     []

## Notes
- This task lands RED by design: AC-1 and AC-2 verify (the locked flow run_cmd) exits nonzero at landing and goes green only after APX-001's `_headers` is deployed through the gated CI job (gate step 8). Capture the RED run to proof.red. AC-3 and AC-4 are green at landing.
- Human-owned precondition: the gated CI deploy needs the GitHub `CLOUDFLARE_API_TOKEN` secret and a synced `main`; this is a precondition, not a dependency.
- `live.playwright.config.ts` and `edge-contract.remote.spec.ts` belong to APX-006 and are never edited here.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails":{"write_allowed":["tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts (NEW)","tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-112-file-completeness/run.json (NEW)","tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-112-file-completeness/proof.red (NEW)",".tmp/APX-007/** (NEW - cycle evidence required by the sprint runner)"],"write_prohibited":["packages/registry/** - the registry is the source of names, never edited here","apps/docs/** - build output is owned by the Astro tasks","tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts - APX-006 owns it","tests/sprint-07-deploy-live-at-apex/edge-contract.remote.spec.ts - APX-006 owns it",".github/** - the ghactions lane owns workflows"]},"version":"1","task_id":"APX-007","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"registry_56_items":{"description":"The 56 item names in packages/registry/registry.json, fanned out to the nativewind and uniwind trees on the live apex.","seed_method":"public_api","records":["packages/registry/registry.json items length 56","112 URLs /r/{engine}/{item}.json","live cache-control today `public, max-age=0, must-revalidate`"]},"engine_results_short":{"description":"A literal results list in which one engine returns fewer passing items than expected, fed to the pure tally reporter.","seed_method":"public_api","records":["engine A: 56 of 56 passing","engine B: 50 of 56 passing"]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","description":"GIVEN the 56 names from packages/registry/registry.json and the live apex WHEN the spec GETs `/r/{engine}/{item}.json` for both engines and all 56 names with redirects off THEN all 112 responses are 200 with content-type `application/json` and cache-control exactly `public, max-age=300`, and the recorded tallies are `engine=nativewind present=56 expected=56` and `engine=uniwind present=56 expected=56`","primary":true,"flow_ref":"FLOW-DELIV-03-112-file-completeness","test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"FLOW-DELIV-03-112-file-completeness","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":true,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["the /r rule is missing so cache-control stays `public, max-age=0, must-revalidate`","the /r rule copies the immutable tier","an item file is absent so the URL returns 404 or an HTML body","the sweep reads a hard-coded shorter list"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"registry_56_items","action":{"actor":"api_client","steps":["read items[].name from packages/registry/registry.json","for each engine and name GET https://rnraielements.com/r/{engine}/{name}.json with maxRedirects 0","record status, content-type, cache-control and per-engine present counts"]},"end_state":{"must_observe":["112 responses with status 200 and content-type application/json","112 responses with cache-control `public, max-age=300`","tally lines `engine=nativewind present=56 expected=56` and `engine=uniwind present=56 expected=56`"],"must_not_observe":["any cache-control `public, max-age=0, must-revalidate` on a registry JSON","any 404 or text/html response","a tally with present below expected"]}}]}},{"id":"AC-2","type":"acceptance_criterion","description":"GIVEN the live registry JSON for both engines WHEN the sweep parses each of the 112 bodies THEN every body is valid JSON whose `name` equals the requested item name","primary":false,"flow_ref":"FLOW-DELIV-03-112-file-completeness","test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"FLOW-DELIV-03-112-file-completeness","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","topology":"single-node","negative_control":{"would_fail_if":["a URL serves an HTML 404 body with status 200","a body's name field belongs to a different item","the served file is empty"]},"evidence":{"artifact_type":"api_response","required_capture":true},"cases":[{"start_ref":"registry_56_items","action":{"actor":"api_client","steps":["GET /r/nativewind/conversation.json and /r/uniwind/conversation.json","JSON-parse each body and compare `.name` with the item","repeat for all 112 URLs"]},"end_state":{"must_observe":["`.name` equals `conversation` for both engines' conversation.json","112 of 112 bodies parse as JSON with `.name` equal to the requested item"],"must_not_observe":["a body starting with `<!doctype html>`","a JSON parse failure","a `.name` that differs from the requested item","an empty body (0 bytes) served with status 200"]}}]}},{"id":"AC-3","type":"acceptance_criterion","description":"GIVEN the real packages/registry/registry.json on disk WHEN the spec builds its URL set THEN it holds 56 distinct names, both engines, and 112 URLs each shaped `https://rnraielements.com/r/{engine}/{name}.json`","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"APX-007-url-set","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-url-set","test_tier":"integration","verification_service":"real filesystem read of packages/registry/registry.json","unit_test_justified":null,"maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real filesystem read of packages/registry/registry.json","topology":"single-node","negative_control":{"would_fail_if":["the spec uses a hard-coded list of a different length","only one engine is enumerated","names are not de-duplicated","the URL list is hardcoded to a static subset, so a registry change does not move the sweep"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"registry_56_items","action":{"actor":"cli_user","steps":["call the spec's URL builder over the real registry.json","count names, engines and URLs"]},"end_state":{"must_observe":["56 distinct item names","2 engines: nativewind and uniwind","112 URLs, each matching `https://rnraielements.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json`"],"must_not_observe":["a URL count other than 112","a duplicate URL","0 URLs built, or an empty name list"]}}]}},{"id":"AC-4","type":"acceptance_criterion","description":"GIVEN a literal results list where one engine has 50 of 56 passing WHEN the pure tally reporter evaluates it THEN it fails with `engine=<that engine> present=50 expected=56` and passes a list where both engines have 56 of 56","primary":false,"flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"APX-007-tally-oracle","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-tally-oracle","test_tier":"unit","verification_service":null,"unit_test_justified":"Pure tally arithmetic over a literal list with zero I/O: a unit test is right because it proves a short engine cannot pass without needing to break the live registry.","maps_to_ac":null,"scenario":{"primary":false,"tier":"visible","test_tier":"unit","unit_test_justified":"Pure tally arithmetic over a literal list with zero I/O: a unit test is right because it proves a short engine cannot pass without needing to break the live registry.","verification_service":"pure tally reporter, no I/O","topology":"single-node","negative_control":{"would_fail_if":["the reporter checks only the first engine","the reporter compares the total across engines instead of per engine","the reporter passes when present is below expected","the reporter is a no-op that always passes regardless of the results list"]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"engine_results_short","action":{"actor":"api_client","steps":["evaluate the list with engine A 56 of 56 and engine B 50 of 56","evaluate a list with both engines 56 of 56"]},"end_state":{"must_observe":["failure text `engine=B present=50 expected=56`","the all-full list passes with both engines reported as present=56 expected=56"],"must_not_observe":["a pass on the short list","a failure message without the engine name","an empty results list treated as a pass"]}}]}},{"id":"TC-1","type":"test_criterion","primary":false,"description":"All 112 registry URLs return cache-control exactly `public, max-age=300` when the sweep runs against the live apex","flow_ref":"FLOW-DELIV-03-112-file-completeness","test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"FLOW-DELIV-03-112-file-completeness","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","primary":false,"description":"The nativewind tally reads present=56 expected=56 when the sweep completes","flow_ref":"FLOW-DELIV-03-112-file-completeness","test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"FLOW-DELIV-03-112-file-completeness","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness","maps_to_ac":"AC-1"},{"id":"TC-3","type":"test_criterion","primary":false,"description":"The uniwind tally reads present=56 expected=56 when the sweep completes","flow_ref":"FLOW-DELIV-03-112-file-completeness","test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"FLOW-DELIV-03-112-file-completeness","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness","maps_to_ac":"AC-1"},{"id":"TC-4","type":"test_criterion","primary":false,"description":"Every body's `.name` equals the requested item name when the sweep parses the 112 bodies","flow_ref":"FLOW-DELIV-03-112-file-completeness","test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"FLOW-DELIV-03-112-file-completeness","test_tier":"e2e","verification_service":"live Cloudflare Workers static-assets deployment at https://rnraielements.com over real HTTPS (Playwright request API)","surface_policy":".spec/e2e-policy/surface.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep FLOW-DELIV-03-112-file-completeness","maps_to_ac":"AC-2"},{"id":"TC-5","type":"test_criterion","primary":false,"description":"The URL builder yields 112 URLs when it reads the real registry.json","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"APX-007-url-set","test_tier":"integration","verification_service":"real filesystem read of packages/registry/registry.json","unit_test_justified":null,"verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-url-set","maps_to_ac":"AC-3"},{"id":"TC-6","type":"test_criterion","primary":false,"description":"The tally reporter fails naming the engine when one engine has fewer present items than expected","flow_ref":null,"test_file":"tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts","test_function":"APX-007-tally-oracle","test_tier":"unit","verification_service":null,"unit_test_justified":"Pure tally arithmetic over a literal list with zero I/O: a unit test is right because it proves a short engine cannot pass without needing to break the live registry.","verify":"CI=1 pnpm exec playwright test -c tests/sprint-07-deploy-live-at-apex/live.playwright.config.ts tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts --grep APX-007-tally-oracle","maps_to_ac":"AC-4"}]}
-->

## Handoff

```json
{
  "task": "APX-007",
  "commit_sha": "6b8903a66372d67f3f3167e6da3d6378ceaac3ab",
  "done": "Landed the live 112-file completeness sweep at tests/sprint-07-deploy-live-at-apex/registry-completeness.remote.spec.ts with evidence under tests/sprint-07-deploy-live-at-apex/evidence/FLOW-DELIV-03-112-file-completeness/{run.json,proof.red}. Derives 112 apex URLs from packages/registry/registry.json, asserts 200/application/json/public max-age=300 plus matching body.name, and records per-engine tallies. FLOW-DELIV-03-112-file-completeness is RED at landing (112x max-age=0); APX-007-url-set and APX-007-tally-oracle are green. Merged to main as 8d416b45b5aa2d30a7557d07579d04d6943b41f1.",
  "deviations": [],
  "concerns": [],
  "findings": [],
  "scope_impact": [],
  "feedback": []
}
```
