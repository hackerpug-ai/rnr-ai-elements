================================================================================
TASK: FUSE-12 - CI docs-e2e lane in ci.yml
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Backlog (planning seed — owned by kb-run-sprint sync-status after first dispatch)
PRIORITY:   P0
POINTS:     2   # Fibonacci story points — relative size, never time
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

Lane test passes: each chained command exits 0, prebuild logs `56 items` and `props resolved for 39/39 component items`, astro build exits 0, `find apps/docs/dist/r -name '*.json' | wc -l` prints 112 (56 per engine), and ci.yml parse asserts the docs-e2e job wiring plus the &&-chain order inside the e2e:docs script. The human gate re-runs the identical command locally.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: docs-e2e job triggers on the same pull_request/push events as existing jobs and sets needs: [typecheck, lint, test, registry]
- MUST: the job's run step executes exactly `pnpm e2e:docs`
- MUST: upload the Playwright HTML+JUnit report artifact from apps/docs/playwright-report/ via actions/upload-artifact@v4
- MUST: the lane test spawns REAL pnpm child processes for the full ordered chain `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build`
- NEVER: never present CI dashboard runs/logs as gate observables — this is the declared DARK task; the human gate re-runs the identical `pnpm e2e:docs` locally (gate step 2)
- NEVER: never fake the chain with mocked spawns, dry-runs, or pre-copied build artifacts
- NEVER: never widen write scope beyond .github/workflows/ci.yml and the lane test file
- STRICTLY: verify must be exactly `pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order`
- STRICTLY: biome gates call `./node_modules/.bin/biome ci <paths>` directly (local `pnpm lint` crashes)

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1 [PRIMARY]: Ordered chain runs green on the real repo and ships exactly 112 dist JSONs
- [ ] AC-2: ci.yml docs-e2e job wiring and chain order are parse-provable
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Ordered chain runs green on the real repo and ships exactly 112 dist JSONs [PRIMARY]
  GIVEN: the real-chain fixture (repo installed, FUSE-02..05 prebuild and FUSE-10 root script landed)
  WHEN:  the lane test spawns the real ordered chain `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` as sequential child processes against the real repo
  THEN:  each command exits 0; public/r/{nativewind,uniwind}/ regenerated; gallery manifest emitted; docs prebuild logs `56 items` and `props resolved for 39/39 component items`; astro build exits 0; `find apps/docs/dist/r -name '*.json' | wc -l` prints exactly 112

  FLOW_REF:             FLOW-DELIV-01-ci-chain-order
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real pnpm build chain (registry:build, gallery:manifest, astro docs build) executed as real child processes against the real repo filesystem
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-ci-chain-order
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order

  SCENARIO (the proof, not the claim):
    TIER: core | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real pnpm build chain on the real repo (no mocks, no dry-runs)
    NEGATIVE_CONTROL (would fail if):
      - t
      - h
      - e
      -  
      - j
      - o
      - b
      -  
      - l
      - i
      - s
      - t
      - s
      -  
      - t
      - h
      - e
      -  
      - s
      - t
      - e
      - p
      - s
      -  
      - b
      - u
      - t
      -  
      - n
      - e
      - v
      - e
      - r
      -  
      - c
      - h
      - a
      - i
      - n
      - s
      -  
      - t
      - h
      - e
      - m
      -  
      - w
      - i
      - t
      - h
      -  
      - &
      - &
      - ,
      -  
      - s
      - o
      -  
      - a
      -  
      - f
      - a
      - i
      - l
      - e
      - d
      -  
      - r
      - e
      - g
      - i
      - s
      - t
      - r
      - y
      - :
      - b
      - u
      - i
      - l
      - d
      -  
      - s
      - t
      - i
      - l
      - l
      -  
      - b
      - u
      - i
      - l
      - d
      - s
      -  
      - d
      - o
      - c
      - s
      -  
      - o
      - v
      - e
      - r
      -  
      - s
      - t
      - a
      - l
      - e
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
      - J
      - S
      - O
      - N
      - ;
      -  
      - e
      - q
      - u
      - a
      - l
      - l
      - y
      - ,
      -  
      - a
      -  
      - l
      - a
      - n
      - e
      -  
      - t
      - e
      - s
      - t
      -  
      - t
      - h
      - a
      - t
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
      - e
      - x
      - i
      - t
      -  
      - c
      - o
      - d
      - e
      - s
      -  
      - v
      - i
      - a
      -  
      - m
      - o
      - c
      - k
      - e
      - d
      -  
      - c
      - h
      - i
      - l
      - d
      - -
      - p
      - r
      - o
      - c
      - e
      - s
      - s
      -  
      - s
      - p
      - a
      - w
      - n
      - s
      -  
      - w
      - o
      - u
      - l
      - d
      -  
      - f
      - a
      - k
      - e
      -  
      - t
      - h
      - e
      -  
      - p
      - r
      - o
      - o
      - f
    EVIDENCE: terminal_log_and_dist_file_listing (required_capture=true)
    CASE 1:
      START_REF: real-chain
      ACTOR: vitest-lane
        - spawn `pnpm registry:build`; assert exit code 0 and public/r/{nativewind,uniwind}/ JSON files regenerated
        - spawn `pnpm gallery:manifest`; assert exit code 0 and manifest artifact written
        - spawn `pnpm --filter @rnr-ai-elements/docs build`; assert exit code 0 and stdout contains `56 items` and `props resolved for 39/39 component items`
        - run `find apps/docs/dist/r -name '*.json' | wc -l`
        - count JSONs per engine under apps/docs/dist/r/nativewind and apps/docs/dist/r/uniwind
      MUST_OBSERVE: exit code 0 for all three chained commands
      MUST_OBSERVE: docs build log contains `56 items`
      MUST_OBSERVE: docs build log contains `props resolved for 39/39 component items`
      MUST_OBSERVE: `find apps/docs/dist/r -name '*.json' | wc -l` prints `112`
      MUST_OBSERVE: 56 JSONs under dist/r/nativewind and 56 under dist/r/uniwind
      MUST_NOT_OBSERVE: any nonzero exit code
      MUST_NOT_OBSERVE: 55 or fewer JSONs under apps/docs/dist/r
      MUST_NOT_OBSERVE: a missing apps/docs/dist/r directory

AC-2: ci.yml docs-e2e job wiring and chain order are parse-provable
  GIVEN: the ci-workflow fixture (.github/workflows/ci.yml with typecheck, lint, test, registry jobs; root package.json with the FUSE-10 e2e:docs script)
  WHEN:  the lane test parses .github/workflows/ci.yml with a YAML parser and reads root package.json scripts
  THEN:  a docs-e2e job exists on the same pull_request/push triggers; needs: covers typecheck, lint, test, registry; a run step executes exactly `pnpm e2e:docs`; an actions/upload-artifact@v4 step uploads apps/docs/playwright-report/; and the root e2e:docs script chains registry:build, gallery:manifest, and the docs build with `&&` in that exact order ahead of the playwright steps

  FLOW_REF:             FLOW-DELIV-01-ci-chain-order
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real .github/workflows/ci.yml and package.json parsed from disk by the lane vitest run
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-ci-chain-order
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order

  SCENARIO (the proof, not the claim):
    TIER: core | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real workflow file and package.json parsed from disk
    NEGATIVE_CONTROL (would fail if):
      - t
      - h
      - e
      -  
      - e
      - 2
      - e
      - :
      - d
      - o
      - c
      - s
      -  
      - s
      - c
      - r
      - i
      - p
      - t
      -  
      - c
      - h
      - a
      - i
      - n
      - e
      - d
      -  
      - s
      - t
      - e
      - p
      - s
      -  
      - w
      - i
      - t
      - h
      -  
      - `
      - ;
      - `
      -  
      - o
      - r
      -  
      - `
      - |
      - |
      - `
      -  
      - (
      - o
      - r
      -  
      - r
      - e
      - o
      - r
      - d
      - e
      - r
      - e
      - d
      -  
      - t
      - h
      - e
      - m
      - )
      - ,
      -  
      - l
      - e
      - t
      - t
      - i
      - n
      - g
      -  
      - a
      -  
      - f
      - a
      - i
      - l
      - e
      - d
      -  
      - r
      - e
      - g
      - i
      - s
      - t
      - r
      - y
      - :
      - b
      - u
      - i
      - l
      - d
      -  
      - s
      - t
      - i
      - l
      - l
      -  
      - b
      - u
      - i
      - l
      - d
      -  
      - d
      - o
      - c
      - s
      - ;
      -  
      - o
      - r
      -  
      - t
      - h
      - e
      -  
      - j
      - o
      - b
      -  
      - r
      - a
      - n
      -  
      - p
      - a
      - r
      - a
      - l
      - l
      - e
      - l
      -  
      - t
      - o
      -  
      - t
      - h
      - e
      -  
      - f
      - o
      - u
      - r
      -  
      - e
      - x
      - i
      - s
      - t
      - i
      - n
      - g
      -  
      - j
      - o
      - b
      - s
      -  
      - w
      - i
      - t
      - h
      -  
      - n
      - o
      -  
      - n
      - e
      - e
      - d
      - s
      - :
      -  
      - —
      -  
      - b
      - o
      - t
      - h
      -  
      - w
      - o
      - u
      - l
      - d
      -  
      - f
      - a
      - i
      - l
      -  
      - t
      - h
      - e
      -  
      - p
      - a
      - r
      - s
      - e
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
      - s
    EVIDENCE: terminal_log (required_capture=true)
    CASE 1:
      START_REF: ci-workflow
      ACTOR: vitest-lane
        - load .github/workflows/ci.yml from disk with a YAML parser
        - assert jobs.docs-e2e exists and declares needs covering typecheck, lint, test, registry
        - assert a run step whose command is exactly `pnpm e2e:docs`
        - assert an upload-artifact step with path apps/docs/playwright-report/
        - load package.json and assert scripts['e2e:docs'] orders `registry:build` && `gallery:manifest` && the docs build before the playwright steps
      MUST_OBSERVE: docs-e2e job present under the same pull_request/push triggers
      MUST_OBSERVE: needs: contains typecheck, lint, test, registry
      MUST_OBSERVE: run command equals `pnpm e2e:docs`
      MUST_OBSERVE: an `actions/upload-artifact@v4` step exists in the docs-e2e job whose `with.path` contains the literal `apps/docs/playwright-report/`
      MUST_OBSERVE: e2e:docs script orders registry:build before gallery:manifest before docs build via `&&`
      MUST_NOT_OBSERVE: docs-e2e running before or parallel to the four existing jobs (missing needs:)
      MUST_NOT_OBSERVE: e2e:docs script chaining steps with `;` or `||` instead of `&&`
      MUST_NOT_OBSERVE: a re-implementation of the chain inside ci.yml that diverges from the root script

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: Lane test spawns the real ordered chain (registry:build && gallery:manifest && docs build) as child processes and asserts exit 0 per stage with prebuild logs `56 items` / `props resolved for 39/39 component items`
  maps_to_ac: AC-FUSE-12-1 | type: integration | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order
- TC-2: Lane test asserts `find apps/docs/dist/r -name '*.json' | wc -l` prints 112, split 56 per engine
  maps_to_ac: AC-FUSE-12-1 | type: integration | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order
- TC-3: Lane test parses .github/workflows/ci.yml asserting docs-e2e job: pull_request/push triggers, needs [typecheck, lint, test, registry], run `pnpm e2e:docs`, upload-artifact of apps/docs/playwright-report/
  maps_to_ac: AC-FUSE-12-2 | type: integration | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order
- TC-4: Lane test parses root package.json asserting scripts['e2e:docs'] &&-chains registry:build → gallery:manifest → docs build ahead of the playwright steps
  maps_to_ac: AC-FUSE-12-2 | type: integration | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- .github/workflows/ci.yml (NEW)
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts (NEW)

writeProhibited:
- packages/registry/**
- apps/docs/**
- tests/sprint-01/**
- tests/harness/**
- playwright.config.ts
- package.json (root scripts owned by FUSE-10)
- tests/sprint-01-docs-spike-skeleton/*.spec.ts (owned by FUSE-11)

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01
provides:
- docs-e2e job in .github/workflows/ci.yml running exactly `pnpm e2e:docs` on pull_request/push, needs: [typecheck, lint, test, registry], uploading the Playwright report artifact
- FLOW-DELIV-01-ci-chain-order lane proof at tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts (real chain run + real ci.yml/package.json parse)
consumes:
- FUSE-10 root script `pnpm e2e:docs` + playwright.config.ts (report dir apps/docs/playwright-report/)
- FUSE-02..05 docs prebuild (logs `56 items`, `props resolved for 39/39 component items`) and public/r fan-out
- existing ci.yml jobs typecheck, lint, test, registry (verified present in the live workflow)
boundary_contracts:
- Root script `pnpm e2e:docs` is owned by FUSE-10 — the ci.yml job invokes it verbatim; never duplicate the chain as separate ci.yml steps
- Prebuild/data path owned by FUSE-02..05 — the lane test asserts their logs and artifacts, never reimplements enrichment
- Report directory apps/docs/playwright-report/ owned by FUSE-10 config — ci.yml only uploads it
- Lane test stops after astro build (before playwright), so it does not depend on FUSE-11 spec files

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .github/workflows/ci.yml (existing typecheck/lint/test/registry jobs and guard convention)
2. FUSE-10 runner contract (root `pnpm e2e:docs` script + playwright.config.ts report paths)
3. FUSE-02..05 data-path contract (prebuild logs, public/r fan-out, 112-file dist expectation)
4. .spec/prds/docs-site/ Sprint 01 gate step 2

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: lane-green
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order
  Expected: exit 0 — chain exits 0 per stage, prebuild logs `56 items` + `props resolved for 39/39 component items`, dist/r count 112, ci.yml wiring + &&-chain order assertions pass
Gate 2: biome
  Command:  ./node_modules/.bin/biome ci tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts
  Expected: exit 0 (call the biome binary directly; local `pnpm lint` crashes)
Gate 3: chain-identical
  Command:  grep -n "e2e:docs" package.json .github/workflows/ci.yml
  Expected: both hits present; ci.yml invokes the root script verbatim with no duplicated chain steps

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Add the docs-e2e job to .github/workflows/ci.yml running the exact root command `pnpm e2e:docs` ordered after the existing typecheck/lint/test/registry jobs via needs:, uploading the Playwright report artifact; prove the ordered chain green on the real repo and the workflow/script ordering parse-provable in a vitest lane test.

Design notes:
- d
- o
- c
- s
- -
- e
- 2
- e
-  
- r
- e
- u
- s
- e
- s
-  
- t
- h
- e
-  
- h
- u
- m
- a
- n
-  
- g
- a
- t
- e
- '
- s
-  
- e
- x
- a
- c
- t
-  
- r
- o
- o
- t
-  
- c
- o
- m
- m
- a
- n
- d
-  
- s
- o
-  
- C
- I
-  
- s
- t
- a
- y
- s
-  
- D
- A
- R
- K
-  
- y
- e
- t
-  
- i
- d
- e
- n
- t
- i
- c
- a
- l
-  
- t
- o
-  
- w
- h
- a
- t
-  
- t
- h
- e
-  
- h
- u
- m
- a
- n
-  
- r
- u
- n
- s
-  
- i
- n
-  
- g
- a
- t
- e
-  
- s
- t
- e
- p
-  
- 2
- ;
-  
- n
- e
- e
- d
- s
- :
-  
- c
- h
- a
- i
- n
- s
-  
- i
- t
-  
- a
- f
- t
- e
- r
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
-  
- d
- o
- c
- s
-  
- n
- e
- v
- e
- r
-  
- b
- u
- i
- l
- d
- s
-  
- o
- v
- e
- r
-  
- s
- t
- a
- l
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

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-02, FUSE-03, FUSE-04, FUSE-05, FUSE-10
Blocks:     none

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-12",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real-chain": {
   "description": "Repo at sprint-01 HEAD after `pnpm install --frozen-lockfile`, with FUSE-02..05 prebuild and FUSE-10 root script landed; the lane test then spawns the real pnpm chain.",
   "seed_method": "cli",
   "setup": [
    "pnpm install --frozen-lockfile"
   ]
  },
  "ci-workflow": {
   "description": ".github/workflows/ci.yml on disk containing jobs typecheck, lint, test, registry, plus the docs-e2e job added by this task; root package.json with the FUSE-10 e2e:docs script.",
   "seed_method": "cli",
   "setup": []
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "FLOW-DELIV-01-ci-chain-order",
   "test_file": "tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts",
   "test_function": "FLOW-DELIV-01-ci-chain-order",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order",
   "test_tier": "integration",
   "verification_service": "real pnpm build chain (registry:build, gallery:manifest, astro docs build) executed as real child processes against the real repo filesystem",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "core",
    "test_tier": "integration",
    "verification_service": "real pnpm build chain on the real repo (no mocks, no dry-runs)",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": "the job lists the steps but never chains them with &&, so a failed registry:build still builds docs over stale registry JSON; equally, a lane test that only asserted exit codes via mocked child-process spawns would fake the proof"
    },
    "evidence": {
     "artifact_type": "terminal_log_and_dist_file_listing",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real-chain",
      "action": {
       "actor": "vitest-lane",
       "steps": [
        "spawn `pnpm registry:build`; assert exit code 0 and public/r/{nativewind,uniwind}/ JSON files regenerated",
        "spawn `pnpm gallery:manifest`; assert exit code 0 and manifest artifact written",
        "spawn `pnpm --filter @rnr-ai-elements/docs build`; assert exit code 0 and stdout contains `56 items` and `props resolved for 39/39 component items`",
        "run `find apps/docs/dist/r -name '*.json' | wc -l`",
        "count JSONs per engine under apps/docs/dist/r/nativewind and apps/docs/dist/r/uniwind"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 0 for all three chained commands",
        "docs build log contains `56 items`",
        "docs build log contains `props resolved for 39/39 component items`",
        "`find apps/docs/dist/r -name '*.json' | wc -l` prints `112`",
        "56 JSONs under dist/r/nativewind and 56 under dist/r/uniwind"
       ],
       "must_not_observe": [
        "any nonzero exit code",
        "55 or fewer JSONs under apps/docs/dist/r",
        "a missing apps/docs/dist/r directory"
       ]
      }
     }
    ]
   },
   "given": "the real-chain fixture (repo installed, FUSE-02..05 prebuild and FUSE-10 root script landed)",
   "when": "the lane test spawns the real ordered chain `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` as sequential child processes against the real repo",
   "then": "each command exits 0; public/r/{nativewind,uniwind}/ regenerated; gallery manifest emitted; docs prebuild logs `56 items` and `props resolved for 39/39 component items`; astro build exits 0; `find apps/docs/dist/r -name '*.json' | wc -l` prints exactly 112",
   "num": 1,
   "name": "Ordered chain runs green on the real repo and ships exactly 112 dist JSONs",
   "type": "acceptance_criterion",
   "description": "GIVEN the real-chain fixture (repo installed, FUSE-02..05 prebuild and FUSE-10 root script landed) WHEN the lane test spawns the real ordered chain `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` as sequential child processes against the real repo THEN each command exits 0; public/r/{nativewind,uniwind}/ regenerated; gallery manifest emitted; docs prebuild logs `56 items` and `props resolved for 39/39 component items`; astro build exits 0; `find apps/docs/dist/r -name '*.json' | wc -l` prints exactly 112",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": "FLOW-DELIV-01-ci-chain-order",
   "test_file": "tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts",
   "test_function": "FLOW-DELIV-01-ci-chain-order",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order",
   "test_tier": "integration",
   "verification_service": "real .github/workflows/ci.yml and package.json parsed from disk by the lane vitest run",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "core",
    "test_tier": "integration",
    "verification_service": "real workflow file and package.json parsed from disk",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": "the e2e:docs script chained steps with `;` or `||` (or reordered them), letting a failed registry:build still build docs; or the job ran parallel to the four existing jobs with no needs: \u2014 both would fail the parse assertions"
    },
    "evidence": {
     "artifact_type": "terminal_log",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "ci-workflow",
      "action": {
       "actor": "vitest-lane",
       "steps": [
        "load .github/workflows/ci.yml from disk with a YAML parser",
        "assert jobs.docs-e2e exists and declares needs covering typecheck, lint, test, registry",
        "assert a run step whose command is exactly `pnpm e2e:docs`",
        "assert an upload-artifact step with path apps/docs/playwright-report/",
        "load package.json and assert scripts['e2e:docs'] orders `registry:build` && `gallery:manifest` && the docs build before the playwright steps"
       ]
      },
      "end_state": {
       "must_observe": [
        "docs-e2e job present under the same pull_request/push triggers",
        "needs: contains typecheck, lint, test, registry",
        "run command equals `pnpm e2e:docs`",
        "an `actions/upload-artifact@v4` step exists in the docs-e2e job whose `with.path` contains the literal `apps/docs/playwright-report/`",
        "e2e:docs script orders registry:build before gallery:manifest before docs build via `&&`"
       ],
       "must_not_observe": [
        "docs-e2e running before or parallel to the four existing jobs (missing needs:)",
        "e2e:docs script chaining steps with `;` or `||` instead of `&&`",
        "a re-implementation of the chain inside ci.yml that diverges from the root script"
       ]
      }
     }
    ]
   },
   "given": "the ci-workflow fixture (.github/workflows/ci.yml with typecheck, lint, test, registry jobs; root package.json with the FUSE-10 e2e:docs script)",
   "when": "the lane test parses .github/workflows/ci.yml with a YAML parser and reads root package.json scripts",
   "then": "a docs-e2e job exists on the same pull_request/push triggers; needs: covers typecheck, lint, test, registry; a run step executes exactly `pnpm e2e:docs`; an actions/upload-artifact@v4 step uploads apps/docs/playwright-report/; and the root e2e:docs script chains registry:build, gallery:manifest, and the docs build with `&&` in that exact order ahead of the playwright steps",
   "num": 2,
   "name": "ci.yml docs-e2e job wiring and chain order are parse-provable",
   "type": "acceptance_criterion",
   "description": "GIVEN the ci-workflow fixture (.github/workflows/ci.yml with typecheck, lint, test, registry jobs; root package.json with the FUSE-10 e2e:docs script) WHEN the lane test parses .github/workflows/ci.yml with a YAML parser and reads root package.json scripts THEN a docs-e2e job exists on the same pull_request/push triggers; needs: covers typecheck, lint, test, registry; a run step executes exactly `pnpm e2e:docs`; an actions/upload-artifact@v4 step uploads apps/docs/playwright-report/; and the root e2e:docs script chains registry:build, gallery:manifest, and the docs build with `&&` in that exact order ahead of the playwright steps",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Lane test spawns the real ordered chain (registry:build && gallery:manifest && docs build) as child processes and asserts exit 0 per stage with prebuild logs `56 items` / `props resolved for 39/39 component items`",
   "maps_to_ac": "AC-FUSE-12-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "Lane test asserts `find apps/docs/dist/r -name '*.json' | wc -l` prints 112, split 56 per engine",
   "maps_to_ac": "AC-FUSE-12-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Lane test parses .github/workflows/ci.yml asserting docs-e2e job: pull_request/push triggers, needs [typecheck, lint, test, registry], run `pnpm e2e:docs`, upload-artifact of apps/docs/playwright-report/",
   "maps_to_ac": "AC-FUSE-12-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "Lane test parses root package.json asserting scripts['e2e:docs'] &&-chains registry:build \u2192 gallery:manifest \u2192 docs build ahead of the playwright steps",
   "maps_to_ac": "AC-FUSE-12-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts -t FLOW-DELIV-01-ci-chain-order"
  }
 ]
}
-->
