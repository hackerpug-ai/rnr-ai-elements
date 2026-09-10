================================================================================
TASK: FUSE-02 - Dual-emit the docs verdict dataset from build-gallery-manifest.ts
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     d9af0f97a758d7e2cff5485e6a6a4c2eea724e15
PRIORITY:   P0
POINTS:     2   # Fibonacci story points — relative size, never time
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

pnpm gallery:manifest exits 0 writing both artifacts; the JSON carries exactly 56 entries (39/11/6) each with a boolean expoGo; delete+rerun regenerates identical bytes; the existing tests/gallery-cells.test.ts still passes.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: Verdict computed exactly once — the existing EXPO_GO_NATIVE/isJsOnly logic builds one in-memory items array serialized to BOTH targets
- MUST: mkdirSync(apps/docs/src/data, {recursive:true}) before the JSON write so the script works whether or not FUSE-01's scaffold landed (both wave A)
- MUST: Deterministic bytes: JSON.stringify(items, null, 2) + trailing newline, same kind/name sort the manifest.ts emit applies
- MUST: apps/example/gallery/manifest.ts output preserved byte-for-byte
- NEVER: Never duplicate or re-implement the expoGo verdict in a second module
- NEVER: Never hand-edit apps/docs/src/data/gallery-manifest.json
- NEVER: Never add a second script for the docs emit — one script, two writeFileSync calls
- STRICTLY: JSON entry shape mirrors GalleryItem exactly (name, kind, title, description, dependencies, permissions, expoGo) — no extra fields, no renames

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: Single computation, dual emit with the real 56-item verdict set
- [ ] AC-2: Deterministic regeneration on a real tree
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Single computation, dual emit with the real 56-item verdict set
  GIVEN: the real repo, clean 56-item registry at v0.2.1, apps/docs/src/data absent
  WHEN:  the lane test runs the real script via `pnpm gallery:manifest` (real pnpm child process) and reads both emitted files from the real filesystem
  THEN:  exit 0; gallery-manifest.json is a JSON array of exactly 56 entries; kind split 39/11/6; every expoGo is boolean and equals the verdict in the regenerated manifest.ts for the same name; only prompt-input carries non-empty permissions

  FLOW_REF:             FLOW-DELIV-03-112-file-completeness
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real pnpm process + real filesystem + real packages/registry/registry.json
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
  TEST_FUNCTION:        FLOW-DELIV-03-112-file-completeness
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real pnpm process + real filesystem + real registry
    NEGATIVE_CONTROL (would fail if):
      - the JSON emit re-implements the verdict in a second code path that drifts from manifest.ts (test cross-checks both files name-by-name)
      - the script skips the JSON write when apps/docs does not exist (no recursive mkdir)
      - a hand-shortened JSON passes (test asserts exactly 56)
    EVIDENCE: file_artifact (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - run pnpm gallery:manifest in the real repo
        - read apps/docs/src/data/gallery-manifest.json and apps/example/gallery/manifest.ts from the real filesystem
      MUST_OBSERVE: exit code 0
      MUST_OBSERVE: gallery-manifest.json is a JSON array of exactly 56 entries
      MUST_OBSERVE: kind counts 39 component, 11 ui, 6 lib
      MUST_OBSERVE: 56 of 56 entries carry `expoGo` with typeof === 'boolean'
      MUST_OBSERVE: expoGo equal for all 56 names between the .json and the .ts emit (0 mismatches)
      MUST_OBSERVE: exactly 1 entry (`prompt-input`) has non-empty permissions; the other 55 have `permissions == null`
      MUST_NOT_OBSERVE: a 55-entry or 57-entry JSON
      MUST_NOT_OBSERVE: an entry missing expoGo
      MUST_NOT_OBSERVE: manifest.ts bytes differing from its committed output

AC-2: Deterministic regeneration on a real tree
  GIVEN: gallery-manifest.json already emitted from the clean registry
  WHEN:  the lane test deletes the JSON (real unlink), re-runs `pnpm gallery:manifest`, byte-compares
  THEN:  regenerated file is byte-identical; the run also works from a state where apps/docs does not exist

  FLOW_REF:             FLOW-DELIV-03-112-file-completeness
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real filesystem delete + real pnpm process
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
  TEST_FUNCTION:        FLOW-DELIV-03-112-file-completeness
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real filesystem + real pnpm process
    NEGATIVE_CONTROL (would fail if):
      - the emit embeds a timestamp, cwd, or unstable key order (byte compare after delete+rerun catches it)
    EVIDENCE: file_artifact (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - delete apps/docs/src/data/gallery-manifest.json
        - run pnpm gallery:manifest again
        - compare regenerated bytes to the pre-delete capture
      MUST_OBSERVE: exit code 0
      MUST_OBSERVE: regenerated file byte-identical (0 diff bytes) to the first emit
      MUST_NOT_OBSERVE: a second differing emit
      MUST_NOT_OBSERVE: a missing-directory error when apps/docs/src/data is absent

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: pnpm gallery:manifest exits 0 and writes both apps/example/gallery/manifest.ts and apps/docs/src/data/gallery-manifest.json.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts -t "dual-emits the docs verdict dataset"
- TC-2: gallery-manifest.json contains exactly 56 entries split 39/11/6 with a boolean expoGo on every entry, matching manifest.ts verdicts name-by-name.
  maps_to_ac: AC-1 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts -t "dual-emits the docs verdict dataset"
- TC-3: Deleting gallery-manifest.json and re-running pnpm gallery:manifest regenerates byte-identical content.
  maps_to_ac: AC-2 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts -t "regenerates byte-identical json"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- scripts/build-gallery-manifest.ts (EDIT) (NEW)
- apps/docs/src/data/gallery-manifest.json (generated emit) (NEW)
- tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts (NEW)

writeProhibited:
- scripts/docs-data/** (FUSE-03/04/05 lanes)
- packages/registry/**
- apps/example/**
- tests/sprint-01/** (different PRD's lane)
- apps/docs/src/pages/** (astro batch)

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-REG-01
provides:
- apps/docs/src/data/gallery-manifest.json — the single verdict dataset (56 entries, expoGo boolean), consumed verbatim by the FUSE-05 prebuild and the ledger page
consumes:
- packages/registry/registry.json (read-only)
boundary_contracts:
- gallery-manifest-v1 (producer): JSON array of {name, kind:'component'|'ui'|'lib', title, description, dependencies:string[], permissions:{ios?:string[],android?:string[]}, expoGo:boolean} — field-for-field the same derived items the TypeScript emit serializes

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. scripts/build-gallery-manifest.ts [1-77]
   Focus: Whole script — verdict computation to preserve; the single writeFileSync to extend; console.log summary line to update
2. packages/registry/registry.json [items[] (sample all three types)]
   Focus: Item shape; only prompt-input carries meta.permissions
3. tests/gallery-cells.test.ts [46-77]
   Focus: Manifest consumer pattern your JSON must stay consistent with
4. packages/registry/scripts/build-registry.ts [150-165]
   Focus: Repo convention: deterministic emitted bytes (JSON.stringify + trailing newline)

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FUSE-02 dual-emit
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts
  Expected: exit 0 — both AC tests green over the real 56-item registry
Gate 2: existing suite unbroken
  Command:  pnpm vitest run tests/gallery-cells.test.ts
  Expected: exit 0 — manifest consumer still parses the unchanged .ts emit

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Extend scripts/build-gallery-manifest.ts so one pnpm gallery:manifest run emits both apps/example/gallery/manifest.ts (unchanged) and apps/docs/src/data/gallery-manifest.json, making the Expo Go verdict computable in exactly one place.

Design notes:
- Parallel with FUSE-01 (wave A): must not assume apps/docs exists; create src/data recursively
- FUSE-05's prebuild READS this JSON — it must never recompute expoGo

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: none
Blocks:     FUSE-05 (consumes gallery-manifest.json verbatim)

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-02",
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
    "pnpm registry:build exits 0 leaving 114 JSONs under public/r (112 item JSONs + 2 indexes)",
    "pnpm gallery:manifest exits 0 writing apps/example/gallery/manifest.ts"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": false,
   "flow_ref": "FLOW-DELIV-03-112-file-completeness",
   "test_file": "tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts",
   "test_function": "FLOW-DELIV-03-112-file-completeness",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness",
   "test_tier": "integration",
   "verification_service": "real pnpm process + real filesystem + real packages/registry/registry.json",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real pnpm process + real filesystem + real registry",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the JSON emit re-implements the verdict in a second code path that drifts from manifest.ts (test cross-checks both files name-by-name)",
      "the script skips the JSON write when apps/docs does not exist (no recursive mkdir)",
      "a hand-shortened JSON passes (test asserts exactly 56)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "registry_full",
      "action": {
       "actor": "build_chain",
       "steps": [
        "run pnpm gallery:manifest in the real repo",
        "read apps/docs/src/data/gallery-manifest.json and apps/example/gallery/manifest.ts from the real filesystem"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 0",
        "gallery-manifest.json is a JSON array of exactly 56 entries",
        "kind counts 39 component, 11 ui, 6 lib",
        "56 of 56 entries carry `expoGo` with typeof === 'boolean'",
        "expoGo equal for all 56 names between the .json and the .ts emit (0 mismatches)",
        "exactly 1 entry (`prompt-input`) has non-empty permissions; the other 55 have `permissions == null`"
       ],
       "must_not_observe": [
        "a 55-entry or 57-entry JSON",
        "an entry missing expoGo",
        "manifest.ts bytes differing from its committed output"
       ]
      }
     }
    ]
   },
   "given": "the real repo, clean 56-item registry at v0.2.1, apps/docs/src/data absent",
   "when": "the lane test runs the real script via `pnpm gallery:manifest` (real pnpm child process) and reads both emitted files from the real filesystem",
   "then": "exit 0; gallery-manifest.json is a JSON array of exactly 56 entries; kind split 39/11/6; every expoGo is boolean and equals the verdict in the regenerated manifest.ts for the same name; only prompt-input carries non-empty permissions",
   "num": 1,
   "name": "Single computation, dual emit with the real 56-item verdict set",
   "type": "acceptance_criterion",
   "description": "GIVEN the real repo, clean 56-item registry at v0.2.1, apps/docs/src/data absent WHEN the lane test runs the real script via `pnpm gallery:manifest` (real pnpm child process) and reads both emitted files from the real filesystem THEN exit 0; gallery-manifest.json is a JSON array of exactly 56 entries; kind split 39/11/6; every expoGo is boolean and equals the verdict in the regenerated manifest.ts for the same name; only prompt-input carries non-empty permissions",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": "FLOW-DELIV-03-112-file-completeness",
   "test_file": "tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts",
   "test_function": "FLOW-DELIV-03-112-file-completeness",
   "verify": "pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness",
   "test_tier": "integration",
   "verification_service": "real filesystem delete + real pnpm process",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real filesystem + real pnpm process",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the emit embeds a timestamp, cwd, or unstable key order (byte compare after delete+rerun catches it)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "registry_full",
      "action": {
       "actor": "build_chain",
       "steps": [
        "delete apps/docs/src/data/gallery-manifest.json",
        "run pnpm gallery:manifest again",
        "compare regenerated bytes to the pre-delete capture"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 0",
        "regenerated file byte-identical (0 diff bytes) to the first emit"
       ],
       "must_not_observe": [
        "a second differing emit",
        "a missing-directory error when apps/docs/src/data is absent"
       ]
      }
     }
    ]
   },
   "given": "gallery-manifest.json already emitted from the clean registry",
   "when": "the lane test deletes the JSON (real unlink), re-runs `pnpm gallery:manifest`, byte-compares",
   "then": "regenerated file is byte-identical; the run also works from a state where apps/docs does not exist",
   "num": 2,
   "name": "Deterministic regeneration on a real tree",
   "type": "acceptance_criterion",
   "description": "GIVEN gallery-manifest.json already emitted from the clean registry WHEN the lane test deletes the JSON (real unlink), re-runs `pnpm gallery:manifest`, byte-compares THEN regenerated file is byte-identical; the run also works from a state where apps/docs does not exist",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "pnpm gallery:manifest exits 0 and writes both apps/example/gallery/manifest.ts and apps/docs/src/data/gallery-manifest.json.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts -t \"dual-emits the docs verdict dataset\""
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "gallery-manifest.json contains exactly 56 entries split 39/11/6 with a boolean expoGo on every entry, matching manifest.ts verdicts name-by-name.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts -t \"dual-emits the docs verdict dataset\""
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Deleting gallery-manifest.json and re-running pnpm gallery:manifest regenerates byte-identical content.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts -t \"regenerates byte-identical json\""
  }
 ]
}
-->
