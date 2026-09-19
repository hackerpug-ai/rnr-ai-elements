================================================================================
TASK: FUSE-11 - Spike flow spec: ledger → component page → command → fetched JSON
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     69ffc05d374345527207121e4f711cc838977eb4
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: astro-planner
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> | pnpm playwright test <file> --grep <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

`pnpm e2e:docs --grep` over each of the three specs exits 0 with retries 0: 112/112 fetches return 200 application/json with zero 404/text/html; served conversation.json has .name=conversation, .type=registry:component and sha256 equal to the generated file; the walk's clipboard command matches the absolute-URL regex and its same-origin fetch returns real registry JSON.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: navigate only via http://localhost:4321 (secure context); clipboard via grantPermissions(['clipboard-read','clipboard-write']) helpers from tests/harness/docs-preview.ts
- MUST: spec files use the .spec.ts extension (vitest owns *.test.ts in the same directory)
- MUST: enumerate the 112 URLs from the canonical registry source
- MUST: the round-trip proof hashes real bytes (sha256 of response body vs sha256 of apps/docs/public/r/nativewind/conversation.json)
- NEVER: never run against astro dev — only the built dist over astro preview
- NEVER: never assert cache-control max-age=300 or a real CLI add into a scratch app (Sprint 07 supersedes)
- NEVER: never stub responses via page.route()/request interception or canned fixture JSON
- NEVER: never claim flow IDs owned by FUSE-04/06/07/08
- STRICTLY: verify only via `pnpm e2e:docs --grep <FLOW-ID|spike-walk>`
- STRICTLY: retries stay 0 — no retry-masking of flake

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1 [PRIMARY]: Same-origin sweep: all 112 registry JSONs return 200 application/json
- [ ] AC-2 [PRIMARY]: Round-trip: served conversation.json is real registry JSON byte-identical to the generated file
- [ ] AC-3: Spike walk: home → /registry (56 rows) → /components/conversation → copy command → fetched JSON same-origin
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Same-origin sweep: all 112 registry JSONs return 200 application/json [PRIMARY]
  GIVEN: the docs-preview fixture serving the built dist at http://localhost:4321, and the registry-source fixture enumerating the 56 canonical item names
  WHEN:  the spec GETs http://localhost:4321/r/{nativewind|uniwind}/{item}.json for all 56 items x 2 engines via the Playwright request context
  THEN:  exactly 112 requests are issued; every response returns status 200 with content-type application/json

  FLOW_REF:             FLOW-DELIV-03-112-file-completeness
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real built docs dist over `astro preview` at http://localhost:4321 fetched via Playwright's request context
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
  TEST_FUNCTION:        FLOW-DELIV-03-112-file-completeness
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness

  SCENARIO (the proof, not the claim):
    TIER: core | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real astro preview HTTP responses over the built dist (Playwright request context)
    NEGATIVE_CONTROL (would fail if):
      - t
      - h
      - e
      -  
      - s
      - p
      - e
      - c
      -  
      - f
      - e
      - t
      - c
      - h
      - e
      - d
      -  
      - a
      -  
      - h
      - a
      - r
      - d
      - c
      - o
      - d
      - e
      - d
      -  
      - h
      - a
      - n
      - d
      - f
      - u
      - l
      -  
      - o
      - f
      -  
      - U
      - R
      - L
      - s
      -  
      - (
      - o
      - r
      -  
      - a
      - s
      - s
      - e
      - r
      - t
      - e
      - d
      -  
      - t
      - h
      - e
      -  
      - c
      - o
      - u
      - n
      - t
      -  
      - w
      - i
      - t
      - h
      - o
      - u
      - t
      -  
      - i
      - s
      - s
      - u
      - i
      - n
      - g
      -  
      - t
      - h
      - e
      -  
      - r
      - e
      - q
      - u
      - e
      - s
      - t
      - s
      - )
      -  
      - —
      -  
      - a
      -  
      - p
      - r
      - e
      - v
      - i
      - e
      - w
      -  
      - m
      - i
      - s
      - s
      - i
      - n
      - g
      -  
      - h
      - a
      - l
      - f
      -  
      - t
      - h
      - e
      -  
      - p
      - u
      - b
      - l
      - i
      - c
      - /
      - r
      -  
      - f
      - a
      - n
      - -
      - o
      - u
      - t
      -  
      - w
      - o
      - u
      - l
      - d
      -  
      - s
      - t
      - i
      - l
      - l
      -  
      - p
      - a
      - s
      - s
    EVIDENCE: playwright_junit_and_html_report (required_capture=true)
    CASE 1:
      START_REF: docs-preview
      ACTOR: playwright-request
        - read the 56 item names from the canonical registry source (root public/r/nativewind regenerated by registry:build)
        - for each engine in [nativewind, uniwind] and each item name, GET http://localhost:4321/r/{engine}/{item}.json
        - collect status and content-type for all 112 responses
      MUST_OBSERVE: exactly 112 requests issued
      MUST_OBSERVE: every response status 200
      MUST_OBSERVE: 112 of 112 responses return `content-type: application/json`
      MUST_NOT_OBSERVE: any 404
      MUST_NOT_OBSERVE: any text/html response
      MUST_NOT_OBSERVE: 55 or fewer JSONs fetched

AC-2: Round-trip: served conversation.json is real registry JSON byte-identical to the generated file [PRIMARY]
  GIVEN: the docs-preview fixture and the registry-source fixture (apps/docs/public/r/nativewind/conversation.json freshly generated by the chain)
  WHEN:  the spec GETs http://localhost:4321/r/nativewind/conversation.json via the Playwright request context and reads the generated file's bytes from disk
  THEN:  the response is 200 with content-type application/json; parsed body has .name == "conversation", .type == "registry:component", a non-empty files array, and registryDependencies present; sha256 of the response body equals sha256 of the file bytes (same-deploy proof: docs and registry JSON served from the same origin)

  FLOW_REF:             FLOW-DELIV-03-live-registry-round-trip
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real astro preview HTTP response plus real file bytes hashed with sha256 (same-origin local deploy proof)
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts
  TEST_FUNCTION:        FLOW-DELIV-03-live-registry-round-trip
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip

  SCENARIO (the proof, not the claim):
    TIER: core | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real preview response bytes sha256-compared against the freshly generated registry file
    NEGATIVE_CONTROL (would fail if):
      - t
      - h
      - e
      -  
      - s
      - p
      - e
      - c
      -  
      - c
      - o
      - m
      - p
      - a
      - r
      - e
      - d
      -  
      - a
      - g
      - a
      - i
      - n
      - s
      - t
      -  
      - a
      -  
      - c
      - a
      - n
      - n
      - e
      - d
      -  
      - f
      - i
      - x
      - t
      - u
      - r
      - e
      -  
      - b
      - o
      - d
      - y
      -  
      - (
      - o
      - r
      -  
      - o
      - n
      - l
      - y
      -  
      - a
      - s
      - s
      - e
      - r
      - t
      - e
      - d
      -  
      - J
      - S
      - O
      - N
      - .
      - p
      - a
      - r
      - s
      - e
      -  
      - s
      - u
      - c
      - c
      - e
      - e
      - d
      - s
      - )
      -  
      - —
      -  
      - a
      -  
      - p
      - r
      - e
      - v
      - i
      - e
      - w
      -  
      - s
      - e
      - r
      - v
      - i
      - n
      - g
      -  
      - a
      -  
      - s
      - t
      - a
      - l
      - e
      -  
      - c
      - o
      - n
      - v
      - e
      - r
      - s
      - a
      - t
      - i
      - o
      - n
      - .
      - j
      - s
      - o
      - n
      -  
      - w
      - o
      - u
      - l
      - d
      -  
      - s
      - t
      - i
      - l
      - l
      -  
      - p
      - a
      - s
      - s
      - ;
      -  
      - t
      - h
      - e
      -  
      - s
      - h
      - a
      - 2
      - 5
      - 6
      -  
      - b
      - y
      - t
      - e
      - -
      - c
      - o
      - m
      - p
      - a
      - r
      - i
      - s
      - o
      - n
      -  
      - a
      - g
      - a
      - i
      - n
      - s
      - t
      -  
      - t
      - h
      - e
      -  
      - f
      - r
      - e
      - s
      - h
      - l
      - y
      -  
      - g
      - e
      - n
      - e
      - r
      - a
      - t
      - e
      - d
      -  
      - f
      - i
      - l
      - e
      -  
      - i
      - s
      -  
      - w
      - h
      - a
      - t
      -  
      - f
      - a
      - i
      - l
      - s
      -  
      - i
      - t
    EVIDENCE: playwright_junit_and_html_report (required_capture=true)
    CASE 1:
      START_REF: registry-source
      ACTOR: playwright-request
        - GET http://localhost:4321/r/nativewind/conversation.json
        - assert status 200 and content-type application/json
        - parse JSON: assert .name == "conversation", .type == "registry:component", files non-empty, registryDependencies present
        - read apps/docs/public/r/nativewind/conversation.json bytes; assert sha256(response body) === sha256(file bytes)
      MUST_OBSERVE: status 200 with content-type application/json
      MUST_OBSERVE: `.name` equals `conversation`
      MUST_OBSERVE: `.type` equals `registry:component`
      MUST_OBSERVE: sha256 equal
      MUST_NOT_OBSERVE: 404 or any text/html response
      MUST_NOT_OBSERVE: sha256 mismatch between served bytes and the generated file
      MUST_NOT_OBSERVE: missing or empty files/registryDependencies

AC-3: Spike walk: home → /registry (56 rows) → /components/conversation → copy command → fetched JSON same-origin
  GIVEN: the docs-preview fixture with FUSE-06's /registry page and FUSE-07's /components/conversation page + copy button landed
  WHEN:  a chromium-desktop test walks / → /registry → /components/conversation, clicks the install-command copy button (permissions granted via tests/harness/docs-preview.ts), reads the clipboard, rewrites the command's rnraielements.com origin to http://localhost:4321, and fetches the URL via the request context
  THEN:  the clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$`; the same-origin fetch returns 200 application/json with .name == "conversation"

  FLOW_REF:             FLOW-DELIV-03-live-registry-round-trip
  TEST_TIER:            e2e
  VERIFICATION_SERVICE: real built docs dist over astro preview driven by Playwright chromium with real clipboard permissions (secure context http://localhost:4321)
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts
  TEST_FUNCTION:        FLOW-DELIV-03-live-registry-round-trip
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip

  SCENARIO (the proof, not the claim):
    TIER: extension | TEST_TIER: e2e | TOPOLOGY: single-node | SERVICE: real preview UI driven by Playwright with a real secure-context clipboard read
    NEGATIVE_CONTROL (would fail if):
      - t
      - h
      - e
      -  
      - w
      - a
      - l
      - k
      -  
      - r
      - e
      - a
      - d
      -  
      - t
      - h
      - e
      -  
      - i
      - n
      - s
      - t
      - a
      - l
      - l
      -  
      - c
      - o
      - m
      - m
      - a
      - n
      - d
      -  
      - f
      - r
      - o
      - m
      -  
      - p
      - a
      - g
      - e
      -  
      - t
      - e
      - x
      - t
      -  
      - i
      - n
      - s
      - t
      - e
      - a
      - d
      -  
      - o
      - f
      -  
      - t
      - h
      - e
      -  
      - a
      - c
      - t
      - u
      - a
      - l
      -  
      - c
      - l
      - i
      - p
      - b
      - o
      - a
      - r
      - d
      -  
      - (
      - b
      - y
      - p
      - a
      - s
      - s
      - i
      - n
      - g
      -  
      - t
      - h
      - e
      -  
      - p
      - e
      - r
      - m
      - i
      - s
      - s
      - i
      - o
      - n
      -  
      - g
      - r
      - a
      - n
      - t
      - )
      - ,
      -  
      - h
      - i
      - d
      - i
      - n
      - g
      -  
      - a
      -  
      - b
      - r
      - o
      - k
      - e
      - n
      -  
      - c
      - o
      - p
      - y
      -  
      - b
      - u
      - t
      - t
      - o
      - n
      -  
      - b
      - e
      - h
      - i
      - n
      - d
      -  
      - a
      -  
      - p
      - a
      - s
      - s
      - i
      - n
      - g
      -  
      - a
      - s
      - s
      - e
      - r
      - t
      - i
      - o
      - n
    EVIDENCE: playwright_junit_and_html_report (required_capture=true)
    CASE 1:
      START_REF: docs-preview
      ACTOR: playwright-chromium-desktop
        - open http://localhost:4321/ and follow the link to /registry; assert 56 rows render
        - navigate to /components/conversation; assert the h1 and install block render
        - click the install-command copy button; read the clipboard via the granted permissions from tests/harness/docs-preview.ts helpers
        - assert clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$`
        - rewrite the command's https://rnraielements.com origin to http://localhost:4321; GET that path via the request context
      MUST_OBSERVE: clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\.com/r/(nativewind|uniwind)/[a-z0-9-]+\.json$`
      MUST_OBSERVE: copy button's `data-state` attribute equals `copied` and its visible label reads `Copied`
      MUST_OBSERVE: fetched URL returns status 200 with content-type application/json
      MUST_OBSERVE: fetched JSON `.name` equals `conversation`
      MUST_NOT_OBSERVE: empty clipboard or clipboard mismatch
      MUST_NOT_OBSERVE: any 404
      MUST_NOT_OBSERVE: any text/html response for the fetched JSON

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: Sweep spec issues all 112 same-origin GETs (56 items x 2 engines enumerated from the canonical registry source) and asserts every response 200 application/json, zero 404, zero text/html
  maps_to_ac: AC-FUSE-11-1 | type: e2e | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-1
- TC-2: Round-trip spec asserts GET http://localhost:4321/r/nativewind/conversation.json returns 200 application/json with .name == conversation, .type == registry:component, non-empty files, registryDependencies present
  maps_to_ac: AC-FUSE-11-2 | type: e2e | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-2
- TC-3: Round-trip spec asserts sha256(response body bytes) equals sha256(apps/docs/public/r/nativewind/conversation.json bytes)
  maps_to_ac: AC-FUSE-11-2 | type: e2e | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-3
- TC-4: Walk spec drives / → /registry (56 rows) → /components/conversation, clicks copy, reads the real clipboard (secure context), matches the absolute-URL regex, and fetches the origin-rewritten URL as JSON same-origin
  maps_to_ac: AC-FUSE-11-3 | type: e2e | VERIFY: pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-4

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/spike-flow.spec.ts (NEW)

writeProhibited:
- .github/workflows/ci.yml
- playwright.config.ts
- tests/harness/**
- apps/docs/**
- packages/registry/**
- tests/sprint-01/**
- package.json
- tests/sprint-01-docs-spike-skeleton/*.test.ts

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-INST-01, CAP-DOCS-01
provides:
- FLOW-DELIV-03-112-file-completeness same-origin sweep proof (tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts)
- FLOW-DELIV-03-live-registry-round-trip same-origin byte-match proof (tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts)
- spike walk spec reproducing the human walk (tests/sprint-01-docs-spike-skeleton/spike-flow.spec.ts)
consumes:
- FUSE-10 playwright.config.ts (webServer over built dist, strict port 4321, projects, retries 0) and clipboard helpers in tests/harness/docs-preview.ts
- FUSE-06 /registry page (56 rows) and FUSE-07 /components/conversation page + copy button
- FUSE-02..05 generated artifacts: apps/docs/public/r/{nativewind,uniwind}/ and registry-items.json
- root `pnpm e2e:docs` chain that builds dist before playwright boots
boundary_contracts:
- playwright.config.ts, webServer, projects, report paths owned by FUSE-10 — specs only consume, never modify
- /registry and /components/conversation selectors and copy button owned by FUSE-06/07 — the walk consumes them read-only
- item enumeration comes from the canonical registry source (public/r regenerated by registry:build), never a hardcoded list in the spec
- live-domain sweep, cache-control max-age=300, and real CLI add into a scratch app are deploy-level (Sprint 07) — never asserted here

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. tests/harness/docs-preview.ts (FUSE-10 clipboard/navigation helpers)
2. FUSE-06 /registry page contract (56 rows)
3. FUSE-07 /components/conversation contract (anatomy + copy button + success state)
4. FUSE-10 playwright.config.ts (webServer over built dist, strict port 4321, chromium projects)

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: sweep-green
  Command:  pnpm playwright test  --grep 
  Expected: exit 0; 112/112 responses 200 application/json; zero 404; zero text/html
Gate 2: round-trip-green
  Command:  pnpm playwright test  --grep 
  Expected: exit 0; name=conversation, type=registry:component, sha256 equal
Gate 3: walk-green
  Command:  pnpm playwright test  --grep 
  Expected: exit 0; clipboard matches absolute-URL regex; copy success state; same-origin fetch 200 application/json
Gate 4: biome
  Command:  ./node_modules/.bin/biome ci tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts tests/sprint-01-docs-spike-skeleton/spike-flow.spec.ts
  Expected: exit 0 (call the biome binary directly; local `pnpm lint` crashes)

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Author the sprint-01 Playwright specs over the built-dist preview: the 112-file same-origin sweep (FLOW-DELIV-03-112-file-completeness), the conversation.json round-trip byte-match (FLOW-DELIV-03-live-registry-round-trip), and the human spike walk / → /registry (56 rows) → /components/conversation → copy command → same-origin JSON fetch.

Design notes:
- w
- a
- l
- k
-  
- u
- s
- e
- s
-  
- t
- h
- e
-  
- s
- e
- c
- u
- r
- e
- -
- c
- o
- n
- t
- e
- x
- t
-  
- c
- l
- i
- p
- b
- o
- a
- r
- d
-  
- v
- i
- a
-  
- g
- r
- a
- n
- t
- e
- d
-  
- p
- e
- r
- m
- i
- s
- s
- i
- o
- n
- s
- ;
-  
- t
- h
- e
-  
- c
- o
- p
- i
- e
- d
-  
- c
- o
- m
- m
- a
- n
- d
- '
- s
-  
- r
- n
- r
- a
- i
- e
- l
- e
- m
- e
- n
- t
- s
- .
- c
- o
- m
-  
- o
- r
- i
- g
- i
- n
-  
- i
- s
-  
- r
- e
- w
- r
- i
- t
- t
- e
- n
-  
- t
- o
-  
- h
- t
- t
- p
- :
- /
- /
- l
- o
- c
- a
- l
- h
- o
- s
- t
- :
- 4
- 3
- 2
- 1
-  
- f
- o
- r
-  
- t
- h
- e
-  
- s
- a
- m
- e
- -
- o
- r
- i
- g
- i
- n
-  
- l
- o
- c
- a
- l
- -
- d
- e
- p
- l
- o
- y
-  
- p
- r
- o
- o
- f
- ;
-  
- e
- n
- u
- m
- e
- r
- a
- t
- i
- o
- n
-  
- i
- s
-  
- a
- l
- w
- a
- y
- s
-  
- d
- e
- r
- i
- v
- e
- d
-  
- f
- r
- o
- m
-  
- t
- h
- e
-  
- c
- a
- n
- o
- n
- i
- c
- a
- l
-  
- r
- e
- g
- i
- s
- t
- r
- y
-  
- s
- o
- u
- r
- c
- e

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-06, FUSE-07, FUSE-10
Blocks:     none

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-11",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "docs-preview": {
   "description": "Built docs dist served by `pnpm --filter @rnr-ai-elements/docs preview` on strict port 4321 via the FUSE-10 playwright webServer; dist produced by the real e2e:docs chain before playwright boots.",
   "seed_method": "cli",
   "setup": [
    "pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build (performed by `pnpm e2e:docs` before the webServer starts)"
   ]
  },
  "registry-source": {
   "description": "Canonical item list: 56 item names read from root public/r/{nativewind,uniwind}/ regenerated by registry:build; apps/docs/public/r/nativewind/conversation.json is the sha256 byte-comparison target.",
   "seed_method": "cli",
   "setup": [
    "pnpm registry:build"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "FLOW-DELIV-03-112-file-completeness",
   "test_file": "tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts",
   "test_function": "FLOW-DELIV-03-112-file-completeness",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness",
   "test_tier": "e2e",
   "verification_service": "real built docs dist over `astro preview` at http://localhost:4321 fetched via Playwright's request context",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "core",
    "test_tier": "e2e",
    "verification_service": "real astro preview HTTP responses over the built dist (Playwright request context)",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": "the spec fetched a hardcoded handful of URLs (or asserted the count without issuing the requests) \u2014 a preview missing half the public/r fan-out would still pass"
    },
    "evidence": {
     "artifact_type": "playwright_junit_and_html_report",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "docs-preview",
      "action": {
       "actor": "playwright-request",
       "steps": [
        "read the 56 item names from the canonical registry source (root public/r/nativewind regenerated by registry:build)",
        "for each engine in [nativewind, uniwind] and each item name, GET http://localhost:4321/r/{engine}/{item}.json",
        "collect status and content-type for all 112 responses"
       ]
      },
      "end_state": {
       "must_observe": [
        "exactly 112 requests issued",
        "every response status 200",
        "112 of 112 responses return `content-type: application/json`"
       ],
       "must_not_observe": [
        "any 404",
        "any text/html response",
        "55 or fewer JSONs fetched"
       ]
      }
     }
    ]
   },
   "given": "the docs-preview fixture serving the built dist at http://localhost:4321, and the registry-source fixture enumerating the 56 canonical item names",
   "when": "the spec GETs http://localhost:4321/r/{nativewind|uniwind}/{item}.json for all 56 items x 2 engines via the Playwright request context",
   "then": "exactly 112 requests are issued; every response returns status 200 with content-type application/json",
   "num": 1,
   "name": "Same-origin sweep: all 112 registry JSONs return 200 application/json",
   "type": "acceptance_criterion",
   "description": "GIVEN the docs-preview fixture serving the built dist at http://localhost:4321, and the registry-source fixture enumerating the 56 canonical item names WHEN the spec GETs http://localhost:4321/r/{nativewind|uniwind}/{item}.json for all 56 items x 2 engines via the Playwright request context THEN exactly 112 requests are issued; every response returns status 200 with content-type application/json",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": true,
   "flow_ref": "FLOW-DELIV-03-live-registry-round-trip",
   "test_file": "tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts",
   "test_function": "FLOW-DELIV-03-live-registry-round-trip",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip",
   "test_tier": "e2e",
   "verification_service": "real astro preview HTTP response plus real file bytes hashed with sha256 (same-origin local deploy proof)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "core",
    "test_tier": "e2e",
    "verification_service": "real preview response bytes sha256-compared against the freshly generated registry file",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": "the spec compared against a canned fixture body (or only asserted JSON.parse succeeds) \u2014 a preview serving a stale conversation.json would still pass; the sha256 byte-comparison against the freshly generated file is what fails it"
    },
    "evidence": {
     "artifact_type": "playwright_junit_and_html_report",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "registry-source",
      "action": {
       "actor": "playwright-request",
       "steps": [
        "GET http://localhost:4321/r/nativewind/conversation.json",
        "assert status 200 and content-type application/json",
        "parse JSON: assert .name == \"conversation\", .type == \"registry:component\", files non-empty, registryDependencies present",
        "read apps/docs/public/r/nativewind/conversation.json bytes; assert sha256(response body) === sha256(file bytes)"
       ]
      },
      "end_state": {
       "must_observe": [
        "status 200 with content-type application/json",
        "`.name` equals `conversation`",
        "`.type` equals `registry:component`",
        "sha256 equal"
       ],
       "must_not_observe": [
        "404 or any text/html response",
        "sha256 mismatch between served bytes and the generated file",
        "missing or empty files/registryDependencies"
       ]
      }
     }
    ]
   },
   "given": "the docs-preview fixture and the registry-source fixture (apps/docs/public/r/nativewind/conversation.json freshly generated by the chain)",
   "when": "the spec GETs http://localhost:4321/r/nativewind/conversation.json via the Playwright request context and reads the generated file's bytes from disk",
   "then": "the response is 200 with content-type application/json; parsed body has .name == \"conversation\", .type == \"registry:component\", a non-empty files array, and registryDependencies present; sha256 of the response body equals sha256 of the file bytes (same-deploy proof: docs and registry JSON served from the same origin)",
   "num": 2,
   "name": "Round-trip: served conversation.json is real registry JSON byte-identical to the generated file",
   "type": "acceptance_criterion",
   "description": "GIVEN the docs-preview fixture and the registry-source fixture (apps/docs/public/r/nativewind/conversation.json freshly generated by the chain) WHEN the spec GETs http://localhost:4321/r/nativewind/conversation.json via the Playwright request context and reads the generated file's bytes from disk THEN the response is 200 with content-type application/json; parsed body has .name == \"conversation\", .type == \"registry:component\", a non-empty files array, and registryDependencies present; sha256 of the response body equals sha256 of the file bytes (same-deploy proof: docs and registry JSON served from the same origin)",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "primary": false,
   "flow_ref": "FLOW-DELIV-03-live-registry-round-trip",
   "test_file": "tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts",
   "test_function": "FLOW-DELIV-03-live-registry-round-trip",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-live-registry-round-trip.spec.ts --grep FLOW-DELIV-03-live-registry-round-trip",
   "test_tier": "e2e",
   "verification_service": "real built docs dist over astro preview driven by Playwright chromium with real clipboard permissions (secure context http://localhost:4321)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "extension",
    "test_tier": "e2e",
    "verification_service": "real preview UI driven by Playwright with a real secure-context clipboard read",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": "the walk read the install command from page text instead of the actual clipboard (bypassing the permission grant), hiding a broken copy button behind a passing assertion"
    },
    "evidence": {
     "artifact_type": "playwright_junit_and_html_report",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "docs-preview",
      "action": {
       "actor": "playwright-chromium-desktop",
       "steps": [
        "open http://localhost:4321/ and follow the link to /registry; assert 56 rows render",
        "navigate to /components/conversation; assert the h1 and install block render",
        "click the install-command copy button; read the clipboard via the granted permissions from tests/harness/docs-preview.ts helpers",
        "assert clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$`",
        "rewrite the command's https://rnraielements.com origin to http://localhost:4321; GET that path via the request context"
       ]
      },
      "end_state": {
       "must_observe": [
        "clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$`",
        "copy button's `data-state` attribute equals `copied` and its visible label reads `Copied`",
        "fetched URL returns status 200 with content-type application/json",
        "fetched JSON `.name` equals `conversation`"
       ],
       "must_not_observe": [
        "empty clipboard or clipboard mismatch",
        "any 404",
        "any text/html response for the fetched JSON"
       ]
      }
     }
    ]
   },
   "given": "the docs-preview fixture with FUSE-06's /registry page and FUSE-07's /components/conversation page + copy button landed",
   "when": "a chromium-desktop test walks / \u2192 /registry \u2192 /components/conversation, clicks the install-command copy button (permissions granted via tests/harness/docs-preview.ts), reads the clipboard, rewrites the command's rnraielements.com origin to http://localhost:4321, and fetches the URL via the request context",
   "then": "the clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$`; the same-origin fetch returns 200 application/json with .name == \"conversation\"",
   "num": 3,
   "name": "Spike walk: home \u2192 /registry (56 rows) \u2192 /components/conversation \u2192 copy command \u2192 fetched JSON same-origin",
   "type": "acceptance_criterion",
   "description": "GIVEN the docs-preview fixture with FUSE-06's /registry page and FUSE-07's /components/conversation page + copy button landed WHEN a chromium-desktop test walks / \u2192 /registry \u2192 /components/conversation, clicks the install-command copy button (permissions granted via tests/harness/docs-preview.ts), reads the clipboard, rewrites the command's rnraielements.com origin to http://localhost:4321, and fetches the URL via the request context THEN the clipboard text matches `^npx @react-native-reusables/cli@latest add https://rnraielements\\.com/r/(nativewind|uniwind)/[a-z0-9-]+\\.json$`; the same-origin fetch returns 200 application/json with .name == \"conversation\"",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Sweep spec issues all 112 same-origin GETs (56 items x 2 engines enumerated from the canonical registry source) and asserts every response 200 application/json, zero 404, zero text/html",
   "maps_to_ac": "AC-FUSE-11-1",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-1"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Round-trip spec asserts GET http://localhost:4321/r/nativewind/conversation.json returns 200 application/json with .name == conversation, .type == registry:component, non-empty files, registryDependencies present",
   "maps_to_ac": "AC-FUSE-11-2",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-2"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Round-trip spec asserts sha256(response body bytes) equals sha256(apps/docs/public/r/nativewind/conversation.json bytes)",
   "maps_to_ac": "AC-FUSE-11-2",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-3"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Walk spec drives / \u2192 /registry (56 rows) \u2192 /components/conversation, clicks copy, reads the real clipboard (secure context), matches the absolute-URL regex, and fetches the origin-rewritten URL as JSON same-origin",
   "maps_to_ac": "AC-FUSE-11-3",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep TC-4"
  }
 ]
}
-->
