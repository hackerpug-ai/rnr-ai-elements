================================================================================
TASK: FUSE-04 - Fail-closed gate module (incl. props-resolved) + fixture-drill script
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     d69cbf0a54563e7f3527f1fc59df7025fb003678
PRIORITY:   P0
POINTS:     3   # Fibonacci story points — relative size, never time
AGENT:      implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
PROPOSED-BY: react-native-reusables-planner
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

The lane test named FLOW-DELIV-01-fail-closed-item-count passes: mutated run (55 items) exits non-zero naming shimmer and observed 55 versus 56; restored run exits 0; packages/registry/registry.json is byte-identical after the drill; each field gate throws naming the item on real temp fixtures.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: Five gates, each throwing (and the CLI exiting non-zero) with the shared shape: [docs-data] <gate>: item "<name>" ... — count: names the missing item AND 'observed <n> versus 56'; files: like [docs-data] files: item "X" references missing/empty file <path>; props: names item and prop; family: names the uncovered or duplicated item; verdict: names the item missing expoGo
- MUST: Expected count 56 is a pinned constant plus an expected-names list passed in — NEVER derived from the observed dataset (a self-derived expectation would make a 55-item registry pass)
- MUST: The drill uses real restore-after semantics: save real registry.json bytes, mutate (remove shimmer), spawnSync real `pnpm registry:build`, run the gate over the mutated tree, then in a finally block byte-exact restore the JSON and re-run `pnpm registry:build` — the tree is left clean even when assertions fail
- MUST: The drill reports structured stdout (JSON) with both runs' real exit codes and captured stderr so the vitest oracle reads real process evidence
- NEVER: Never write into packages/registry/** outside the drill's try/finally restore-after mutation
- NEVER: Never mock fs, spawn, or the registry — the flow proof runs real processes against the real tree
- NEVER: Never let an empty-resolved props array ([]) fail the gate — empty is legal; only an unresolved type (extractor throw) fails
- NEVER: Never compare observed count against a value computed from the same mutated source
- STRICTLY: Gates are pure functions over (dataset, expectation) plus the real extractor call — no gate writes output files; FUSE-05 owns writing
- STRICTLY: runAllGates collects ALL violations (not first-throw) into one aggregate error listing every offending item, then exits non-zero once

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1 [PRIMARY]: FLOW-DELIV-01-fail-closed-item-count: 55-vs-56 drill fails naming shimmer, restore exits 0
- [ ] AC-2: Field-level fail-closed gates each name the item (T-DELIV-002)
- [ ] AC-3: Gate error formatter pinned (message shape)
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: FLOW-DELIV-01-fail-closed-item-count: 55-vs-56 drill fails naming shimmer, restore exits 0 [PRIMARY]
  GIVEN: the real repo on a clean tree at registry v0.2.1 (56 items) with gates.ts and drill-item-count.ts implemented
  WHEN:  the lane test spawns `tsx scripts/docs-data/drill-item-count.ts` (real child process) — the drill removes shimmer from the real packages/registry/registry.json, runs real `pnpm registry:build`, runs the count gate, then restores via byte-exact write-back + real `pnpm registry:build`, and prints a JSON report
  THEN:  the mutated run exits non-zero with output containing "shimmer" and both "55" and "56" (observed 55 versus 56); the restored run exits 0; after the drill, registry.json is byte-identical to its pre-drill bytes; the drill itself exits 0 (its expectations held)

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real tsx/pnpm child processes + real filesystem mutation with byte-exact restore + real process exit codes
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real pnpm process, real filesystem, real registry fixture
    NEGATIVE_CONTROL (would fail if):
      - the gate counts entries but derives the expected count from the same mutated registry source, so a hand-shortened dataset passes
      - the gate reports a count mismatch without naming which item is missing (a diff-less count check)
      - the drill leaves registry.json mutated on failure (no try/finally restore) — post-drill byte comparison catches it
      - the gate passes a 55-item dataset because files/props checks short-circuit before the count gate (aggregate error must include the count violation)
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: registry_short_one
      ACTOR: build_chain
        - run tsx scripts/docs-data/drill-item-count.ts in the real repo (the drill deletes item shimmer from packages/registry/registry.json, runs pnpm registry:build, runs the count gate, then restores byte-exact and re-runs pnpm registry:build)
      MUST_OBSERVE: mutated gate run exits with code 1 (non-zero)
      MUST_OBSERVE: gate stderr/stdout contains the string "shimmer"
      MUST_OBSERVE: gate output contains "55" and "56" as the observed-versus-expected pair
      MUST_OBSERVE: restored gate run exits 0
      MUST_OBSERVE: post-drill `packages/registry/registry.json` bytes === pre-drill bytes (diff bytes == 0)
      MUST_OBSERVE: drill process exits 0
      MUST_NOT_OBSERVE: exit code 0 on the mutated run
      MUST_NOT_OBSERVE: a 55-item dataset accepted and published
      MUST_NOT_OBSERVE: leftover mutation in packages/registry/registry.json or public/r after the drill
    CASE 2:
      START_REF: registry_full
      ACTOR: build_chain
        - run the gate CLI directly over the clean real tree (56 items, expectation captured from the clean registry)
      MUST_OBSERVE: exit code 0
      MUST_OBSERVE: 56 of 56 names match the expectation
      MUST_NOT_OBSERVE: a false positive on the clean tree

AC-2: Field-level fail-closed gates each name the item (T-DELIV-002)
  GIVEN: real temp fixture datasets under a real temp dir: an empty/missing files[].path, an unresolved props type via the real FUSE-03 extractor, a family map that double-assigns or omits an item, and an entry missing expoGo
  WHEN:  the lane test runs runAllGates over each fixture dataset (real module import, real temp files)
  THEN:  each gate throws/exits non-zero with an error naming the fixture item (files error shaped '[docs-data] files: item "X" references missing/empty file <path>'; props names item and prop; family names the item; verdict names the item); the aggregate error lists every violation present; the clean 56-item real dataset passes all field gates with exit 0

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real temp filesystem fixtures + real FUSE-03 extractor invocation
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real temp files + real extractor + real module
    NEGATIVE_CONTROL (would fail if):
      - any field gate returns a boolean instead of throwing, so violations vanish silently
      - an error message omits the item name (message-only diffs) — every assertion requires the quoted item name in the message
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: field_fixture_dir
      ACTOR: build_chain
        - run runAllGates over each real temp fixture dataset
        - capture thrown messages and exit codes
      MUST_OBSERVE: files fixture: non-zero exit with '[docs-data] files: item' naming the fixture item and the offending path
      MUST_OBSERVE: props fixture: non-zero exit naming the fixture item and prop via the real extractor
      MUST_OBSERVE: family fixture: non-zero exit naming the double-assigned or omitted item
      MUST_OBSERVE: verdict fixture: non-zero exit naming the item missing expoGo
      MUST_NOT_OBSERVE: exit 0 on any field fixture
      MUST_NOT_OBSERVE: an error that omits the quoted item name
    CASE 2:
      START_REF: registry_full
      ACTOR: build_chain
        - run runAllGates over the clean real 56-item dataset
      MUST_OBSERVE: exit 0
      MUST_OBSERVE: all five gates pass for 56 items with props resolved via the real extractor for the 39 components
      MUST_NOT_OBSERVE: a false positive on the clean tree

AC-3: Gate error formatter pinned (message shape)
  GIVEN: the exported pure formatter with a violation record (gate, item, detail)
  WHEN:  the lane test formats representative violations
  THEN:  output is exactly '[docs-data] count: item "shimmer" missing; observed 55 versus 56' style — stable, prefixed, item-quoted — for count/files/props/family/verdict

  TEST_TIER: unit (UNIT_TEST_JUSTIFIED: pure logic, zero I/O — string formatting of already-validated violation records; the real emission path is covered by the integration drill in AC-1/AC-2)
  TEST_FILE: tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION: formats gate errors
  VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t "formats gate errors"

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: The drill on the real tree with shimmer removed produces a non-zero gate exit naming shimmer and observed 55 versus 56.
  maps_to_ac: AC-1 | type: error_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count
- TC-2: After the drill's finally-restore, the clean-tree gate run exits 0 and registry.json bytes are unchanged from pre-drill.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count
- TC-3: Each field gate (files empty, props unresolved, family bogus, verdict missing) fails naming the fixture item, and the clean real dataset passes all five.
  maps_to_ac: AC-2 | type: error_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t "field gates fail closed naming the item"
- TC-4: The formatter emits the pinned '[docs-data] <gate>: item "<name>" ...' shape for all five gates.
  maps_to_ac: AC-3 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t "formats gate errors"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- scripts/docs-data/gates.ts (NEW)
- scripts/docs-data/drill-item-count.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts (NEW)

writeProhibited:
- packages/registry/** except the drill's try/finally restore-after mutation of registry.json
- scripts/docs-data/props.ts|usage-snippet.ts|theming-note.ts (FUSE-03 owns)
- scripts/build-gallery-manifest.ts
- tests/sprint-01/**
- apps/**

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01
provides:
- scripts/docs-data/gates.ts — five fail-closed gates + runAllGates, CLI-runnable, every error prefixed '[docs-data] <gate>:' and naming the item
- scripts/docs-data/drill-item-count.ts — the real restore-after fixture drill (gate step 10 semantics) that the flow proof executes
- FLOW-DELIV-01-fail-closed-item-count — this task's locked flow proof (the only one this batch owns)
consumes:
- scripts/docs-data/props.ts (FUSE-03 — the props-resolved gate runs the real extractor)
- packages/registry/registry.json (observed items)
- a committed expectation source for the 56 expected names (pre-FUSE-05: captured from the clean tree by the drill; post-FUSE-05: families.json)
boundary_contracts:
- registry-items-v1 gate semantics: gates operate on the enriched-entry shape and on (itemNames-per-family) coverage; expected count pinned at 56 — never derived from observed

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .spec/prds/docs-site/07-uc-deliv.md [19-27]
   Focus: UC-DELIV-01 AC-1/2 — the exact fail conditions the gates encode
2. .spec/prds/docs-site/12-e2e-testing-criteria.md [190-193]
   Focus: T-DELIV-001/002 rows verbatim — the pass/fail contract this flow implements
3. .spec/prds/docs-site/ROADMAP.md [69-69]
   Focus: Gate step 10 verbatim: jq del shimmer, registry:build, docs build non-zero naming shimmer + 55 vs 56, git checkout restore exits 0
4. scripts/build-gallery-manifest.ts [37-52]
   Focus: The verdict shape the verdict-present gate asserts (boolean expoGo per name)
5. scripts/docs-data/props.ts [whole file (FUSE-03 output)]
   Focus: The extractor the props gate invokes; its throw signature is the gate signal

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FLOW-DELIV-01-fail-closed-item-count
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count
  Expected: exit 0 with both the failure drill (non-zero gate exit naming shimmer, 55 versus 56) and the restore drill (exit 0, byte-clean tree) green

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: A gate module that makes any silently-degraded docs dataset impossible: exact-56 count naming the mismatching item, non-empty files, props resolved via the real extractor, exact family coverage, verdict present — plus the standalone drill script that proves it against the real repo with a real shimmer deletion and byte-exact restore.

Design notes:
- FUSE-05 wires runAllGates into the prebuild with committed families.json as the expectation source; until then the drill captures the expectation from the clean real tree (real capture, not a canned list)
- The drill is the automation of human gate step 10 — when FUSE-05 lands, the human step runs the same mutation through `pnpm --filter @rnr-ai-elements/docs build`; the drill stays as the lane-proof entry
- Aggregate-all violations: one build failure listing every bad item beats five CI runs to find five items

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-03 (props-resolved gate invokes the real extractor)
Blocks:     FUSE-05 (prebuild runs runAllGates before writing outputs)

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-04",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "registry_full": {
   "description": "the real 56-item registry at v0.2.1 on a clean tree",
   "seed_method": "cli",
   "records": [
    "pnpm registry:build exits 0 (114 files under public/r)",
    "clean-tree gate run over the real 56 names exits 0"
   ]
  },
  "registry_short_one": {
   "description": "the real tree with item 'shimmer' removed from packages/registry/registry.json by the drill (restore-after)",
   "seed_method": "migration_fixture",
   "records": [
    "55 items; pnpm registry:build re-fans public/r to 110 item JSONs + 2 indexes",
    "docs count gate sees observed 55 versus 56 and names 'shimmer'",
    "finally: registry.json byte-restored, registry:build re-run, gate exits 0"
   ]
  },
  "field_fixture_dir": {
   "description": "a real temp directory with fixture datasets for the four field gates: an item whose files[].path points at a missing/empty real file; an item whose props throw unresolved via the real extractor; a family map double-assigning or omitting an item; a dataset entry missing expoGo",
   "seed_method": "migration_fixture",
   "records": [
    "fixtures written to real temp paths by the test",
    "each field gate throws naming the fixture item; aggregate error lists all violations"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "FLOW-DELIV-01-fail-closed-item-count",
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "FLOW-DELIV-01-fail-closed-item-count",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count",
   "test_tier": "integration",
   "verification_service": "real tsx/pnpm child processes + real filesystem mutation with byte-exact restore + real process exit codes",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real pnpm process, real filesystem, real registry fixture",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the gate counts entries but derives the expected count from the same mutated registry source, so a hand-shortened dataset passes",
      "the gate reports a count mismatch without naming which item is missing (a diff-less count check)",
      "the drill leaves registry.json mutated on failure (no try/finally restore) \u2014 post-drill byte comparison catches it",
      "the gate passes a 55-item dataset because files/props checks short-circuit before the count gate (aggregate error must include the count violation)"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "registry_short_one",
      "action": {
       "actor": "build_chain",
       "steps": [
        "run tsx scripts/docs-data/drill-item-count.ts in the real repo (the drill deletes item shimmer from packages/registry/registry.json, runs pnpm registry:build, runs the count gate, then restores byte-exact and re-runs pnpm registry:build)"
       ]
      },
      "end_state": {
       "must_observe": [
        "mutated gate run exits with code 1 (non-zero)",
        "gate stderr/stdout contains the string \"shimmer\"",
        "gate output contains \"55\" and \"56\" as the observed-versus-expected pair",
        "restored gate run exits 0",
        "post-drill `packages/registry/registry.json` bytes === pre-drill bytes (diff bytes == 0)",
        "drill process exits 0"
       ],
       "must_not_observe": [
        "exit code 0 on the mutated run",
        "a 55-item dataset accepted and published",
        "leftover mutation in packages/registry/registry.json or public/r after the drill"
       ]
      }
     },
     {
      "start_ref": "registry_full",
      "action": {
       "actor": "build_chain",
       "steps": [
        "run the gate CLI directly over the clean real tree (56 items, expectation captured from the clean registry)"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 0",
        "56 of 56 names match the expectation"
       ],
       "must_not_observe": [
        "a false positive on the clean tree"
       ]
      }
     }
    ]
   },
   "given": "the real repo on a clean tree at registry v0.2.1 (56 items) with gates.ts and drill-item-count.ts implemented",
   "when": "the lane test spawns `tsx scripts/docs-data/drill-item-count.ts` (real child process) \u2014 the drill removes shimmer from the real packages/registry/registry.json, runs real `pnpm registry:build`, runs the count gate, then restores via byte-exact write-back + real `pnpm registry:build`, and prints a JSON report",
   "then": "the mutated run exits non-zero with output containing \"shimmer\" and both \"55\" and \"56\" (observed 55 versus 56); the restored run exits 0; after the drill, registry.json is byte-identical to its pre-drill bytes; the drill itself exits 0 (its expectations held)",
   "num": 1,
   "name": "FLOW-DELIV-01-fail-closed-item-count: 55-vs-56 drill fails naming shimmer, restore exits 0",
   "type": "acceptance_criterion",
   "description": "GIVEN the real repo on a clean tree at registry v0.2.1 (56 items) with gates.ts and drill-item-count.ts implemented WHEN the lane test spawns `tsx scripts/docs-data/drill-item-count.ts` (real child process) \u2014 the drill removes shimmer from the real packages/registry/registry.json, runs real `pnpm registry:build`, runs the count gate, then restores via byte-exact write-back + real `pnpm registry:build`, and prints a JSON report THEN the mutated run exits non-zero with output containing \"shimmer\" and both \"55\" and \"56\" (observed 55 versus 56); the restored run exits 0; after the drill, registry.json is byte-identical to its pre-drill bytes; the drill itself exits 0 (its expectations held)",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": "FLOW-DELIV-01-fail-closed-item-count",
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "FLOW-DELIV-01-fail-closed-item-count",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count",
   "test_tier": "integration",
   "verification_service": "real temp filesystem fixtures + real FUSE-03 extractor invocation",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real temp files + real extractor + real module",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "any field gate returns a boolean instead of throwing, so violations vanish silently",
      "an error message omits the item name (message-only diffs) \u2014 every assertion requires the quoted item name in the message"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "field_fixture_dir",
      "action": {
       "actor": "build_chain",
       "steps": [
        "run runAllGates over each real temp fixture dataset",
        "capture thrown messages and exit codes"
       ]
      },
      "end_state": {
       "must_observe": [
        "files fixture: non-zero exit with '[docs-data] files: item' naming the fixture item and the offending path",
        "props fixture: non-zero exit naming the fixture item and prop via the real extractor",
        "family fixture: non-zero exit naming the double-assigned or omitted item",
        "verdict fixture: non-zero exit naming the item missing expoGo"
       ],
       "must_not_observe": [
        "exit 0 on any field fixture",
        "an error that omits the quoted item name"
       ]
      }
     },
     {
      "start_ref": "registry_full",
      "action": {
       "actor": "build_chain",
       "steps": [
        "run runAllGates over the clean real 56-item dataset"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit 0",
        "all five gates pass for 56 items with props resolved via the real extractor for the 39 components"
       ],
       "must_not_observe": [
        "a false positive on the clean tree"
       ]
      }
     }
    ]
   },
   "given": "real temp fixture datasets under a real temp dir: an empty/missing files[].path, an unresolved props type via the real FUSE-03 extractor, a family map that double-assigns or omits an item, and an entry missing expoGo",
   "when": "the lane test runs runAllGates over each fixture dataset (real module import, real temp files)",
   "then": "each gate throws/exits non-zero with an error naming the fixture item (files error shaped '[docs-data] files: item \"X\" references missing/empty file <path>'; props names item and prop; family names the item; verdict names the item); the aggregate error lists every violation present; the clean 56-item real dataset passes all field gates with exit 0",
   "num": 2,
   "name": "Field-level fail-closed gates each name the item (T-DELIV-002)",
   "type": "acceptance_criterion",
   "description": "GIVEN real temp fixture datasets under a real temp dir: an empty/missing files[].path, an unresolved props type via the real FUSE-03 extractor, a family map that double-assigns or omits an item, and an entry missing expoGo WHEN the lane test runs runAllGates over each fixture dataset (real module import, real temp files) THEN each gate throws/exits non-zero with an error naming the fixture item (files error shaped '[docs-data] files: item \"X\" references missing/empty file <path>'; props names item and prop; family names the item; verdict names the item); the aggregate error lists every violation present; the clean 56-item real dataset passes all field gates with exit 0",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "primary": false,
   "flow_ref": null,
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "formats gate errors",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t \"formats gate errors\"",
   "test_tier": "unit",
   "verification_service": "pure function, zero I/O",
   "surface_policy": null,
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "verification_service": "pure function evaluation",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the formatter interpolates items unquoted or drops the gate prefix, breaking the exact-match assertions the drill greps for"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "registry_full",
      "action": {
       "actor": "test_runner",
       "steps": [
        "call the formatter with a count violation {gate:'count', item:'shimmer', observed:55, expected:56}"
       ]
      },
      "end_state": {
       "must_observe": [
        "output string starts with '[docs-data] count:'",
        "output contains '\"shimmer\"' quoted",
        "output contains 'observed 55 versus 56'"
       ],
       "must_not_observe": [
        "an unquoted item name",
        "a missing '[docs-data]' prefix"
       ]
      }
     }
    ]
   },
   "given": "the exported pure formatter with a violation record (gate, item, detail)",
   "when": "the lane test formats representative violations",
   "then": "output is exactly '[docs-data] count: item \"shimmer\" missing; observed 55 versus 56' style \u2014 stable, prefixed, item-quoted \u2014 for count/files/props/family/verdict",
   "num": 3,
   "name": "Gate error formatter pinned (message shape)",
   "type": "acceptance_criterion",
   "description": "GIVEN the exported pure formatter with a violation record (gate, item, detail) WHEN the lane test formats representative violations THEN output is exactly '[docs-data] count: item \"shimmer\" missing; observed 55 versus 56' style \u2014 stable, prefixed, item-quoted \u2014 for count/files/props/family/verdict",
   "maps_to_ac": null,
   "unit_test_justified": "pure logic, zero I/O \u2014 string formatting of already-validated violation records; the real emission path is covered by the integration drill in AC-1/AC-2"
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The drill on the real tree with shimmer removed produces a non-zero gate exit naming shimmer and observed 55 versus 56.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "After the drill's finally-restore, the clean-tree gate run exits 0 and registry.json bytes are unchanged from pre-drill.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Each field gate (files empty, props unresolved, family bogus, verdict missing) fails naming the fixture item, and the clean real dataset passes all five.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t \"field gates fail closed naming the item\""
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The formatter emits the pinned '[docs-data] <gate>: item \"<name>\" ...' shape for all five gates.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t \"formats gate errors\""
  }
 ]
}
-->
