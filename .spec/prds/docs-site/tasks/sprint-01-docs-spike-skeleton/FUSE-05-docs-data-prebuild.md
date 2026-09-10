================================================================================
TASK: FUSE-05 - DocsDataPrebuild: full enrichment into registry-items.json + families map + public/r copy
================================================================================

TASK_TYPE:  FEATURE
STATUS:     in_progress
PRIORITY:   P0
POINTS:     5   # Fibonacci story points — relative size, never time
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

Ordered chain (registry:build, gallery:manifest, docs build) exits 0: registry-items.json with 56 fully-populated entries (39 props arrays, 17 null), families.json exact coverage, public/r 57 files per engine byte-identical to root, check-ignore green, delete+rebuild byte-identical; any degradation fails the build naming the item.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: Gate-then-write: run ALL FIVE gates (committed families.json as the count/family expectation) BEFORE any output write — build to temp, move on green; never publish ungated bytes
- MUST: expoGo from gallery-manifest.json consumed verbatim
- MUST: public/r copy source is the freshly built ROOT public/r — copy both engines wholesale (114 files: 112 item JSONs + 2 indexes, 57 per engine)
- MUST: Commit families.json; gitignore apps/docs/public/, apps/docs/src/data/registry-items.json, apps/docs/src/data/gallery-manifest.json (clean-checkout entrypoint regenerates via the chain)
- MUST: Log '56 items' and 'props resolved for 39/39 component items' (gate step 2 anchors)
- MUST: permissions {ios:[],android:[]} or null when absent (only prompt-input carries one)
- MUST: gitignore entry idempotent (append to FUSE-01's apps/docs/.gitignore if present, else create)
- NEVER: Never write registry-items.json when any gate fails — non-zero exit, no partial dataset
- NEVER: Never commit generated public/r or the generated src/data JSONs (T-DELIV-004: absent in fresh clone)
- NEVER: Never re-fan/re-templatize registry JSON — copy root public/r bytes; build-registry.ts owns fan-out
- NEVER: Never hand-edit registry-items.json or introduce runtime deps (node:fs/node:path only)
- STRICTLY: Idempotent + deterministic: delete outputs, re-run chain, byte-identical artifacts
- STRICTLY: Each of the 56 entries carries EXACTLY the 15 contract fields — astro pages compile against this shape

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: Ordered chain produces the full gated dataset
- [ ] AC-2: public/r copy: gitignored, generated-only, byte-identical, deterministic
- [ ] AC-3: Committed families map covers all 56 exactly once
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: Ordered chain produces the full gated dataset
  GIVEN: clean tree, FUSE-02/03/04 landed, docs package prebuild wired to tsx scripts/docs-data/prebuild.ts
  WHEN:  lane test runs the real ordered chain: `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` (real processes) and reads the artifacts
  THEN:  all exit 0; prebuild logs '56 items' and 'props resolved for 39/39 component items'; registry-items.json is an array of exactly 56 entries each with exactly the 15 contract fields; 39 entries type registry:component with props arrays, 17 with props null; every expoGo boolean present; sourceFiles text non-empty per files[].path

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real pnpm chain processes + real filesystem artifacts
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real pnpm processes + real filesystem
    NEGATIVE_CONTROL (would fail if):
      - the prebuild writes registry-items.json before gates pass (fixture-degraded dataset would land)
      - a 55-entry dataset is published (count asserted against 56)
      - expoGo recomputed instead of consumed from gallery-manifest.json (verdict parity check)
    EVIDENCE: file_artifact (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - run pnpm registry:build, pnpm gallery:manifest, pnpm --filter @rnr-ai-elements/docs build
        - read apps/docs/src/data/registry-items.json
      MUST_OBSERVE: all three steps exit 0
      MUST_OBSERVE: prebuild stdout contains '56 items' and '39/39'
      MUST_OBSERVE: registry-items.json array of exactly 56 entries
      MUST_OBSERVE: 39 entries type 'registry:component' with props arrays; 17 with props null
      MUST_OBSERVE: every entry has boolean expoGo and exactly the 15 contract fields
      MUST_NOT_OBSERVE: a partial/ungated dataset
      MUST_NOT_OBSERVE: a 55-entry dataset
      MUST_NOT_OBSERVE: an entry missing expoGo

AC-2: public/r copy: gitignored, generated-only, byte-identical, deterministic
  GIVEN: chain run from AC-1 has produced apps/docs/public/r
  WHEN:  lane test counts files per engine, byte-compares against root public/r, runs real `git check-ignore apps/docs/public/r/nativewind/conversation.json`, then deletes the copy and re-runs the prebuild
  THEN:  57 files per engine (56 item JSONs + registry.json index); every file byte-identical to its root public/r counterpart; check-ignore exits 0; rebuild reproduces byte-identical output; the directory is gitignored so a fresh clone lacks it

  FLOW_REF:             FLOW-DELIV-03-112-file-completeness
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real git check-ignore process + real byte comparison + real rebuild
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
  TEST_FUNCTION:        FLOW-DELIV-03-112-file-completeness
  VERIFY:               pnpm playwright test tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts --grep FLOW-DELIV-03-112-file-completeness

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real git + real filesystem bytes
    NEGATIVE_CONTROL (would fail if):
      - public/r is copied from a stale root build (byte compare against fresh registry:build output catches it)
      - the gitignore line is missing (check-ignore exits 1)
      - the copy rewrites JSON instead of copying bytes (divergence from root)
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - count apps/docs/public/r/{nativewind,uniwind} files
        - byte-compare against root public/r
        - run git check-ignore apps/docs/public/r/nativewind/conversation.json
        - delete the copy and re-run the prebuild, byte-compare again
      MUST_OBSERVE: 57 files in nativewind and 57 in uniwind
      MUST_OBSERVE: 0 of 114 files differ from their root `public/r` counterparts (byte compare: 114/114 identical)
      MUST_OBSERVE: git check-ignore exits 0 printing the path
      MUST_OBSERVE: rebuild output === first-build output (diff bytes == 0 across all 114 files)
      MUST_NOT_OBSERVE: a committed public/r in a fresh clone
      MUST_NOT_OBSERVE: divergent engine JSONs
      MUST_NOT_OBSERVE: a missing index registry.json per engine

AC-3: Committed families map covers all 56 exactly once
  GIVEN: the authored families.json committed (NOT gitignored) with 9 families per the fixed assignment
  WHEN:  lane test reads families.json and the registry, runs a real prebuild (gates consume the committed map)
  THEN:  9 families total (conversation, message, prompt-input, reasoning, sources, suggestion, tool, ui, lib); the 7 AI families contain exactly the 39 component names each exactly once (3+7+6+7+4+1+11); ui has the 11, lib the 6; the prebuild passes the family gate exit 0

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real committed families.json + real registry + real gate run
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real files + real gate module
    NEGATIVE_CONTROL (would fail if):
      - an item sits in two families or none (gate throws naming it)
      - families.json is generated and drifts from the registry (it is committed and gated)
    EVIDENCE: file_artifact (required_capture=true)
    CASE 1:
      START_REF: families_map_committed
      ACTOR: build_chain
        - read apps/docs/src/data/families.json and packages/registry/registry.json
        - run the prebuild so the family gate executes over the committed map
      MUST_OBSERVE: 9 families
      MUST_OBSERVE: 7 AI families contain exactly the 39 component names each exactly once
      MUST_OBSERVE: ui family has exactly 11, lib exactly 6
      MUST_OBSERVE: prebuild exits 0
      MUST_NOT_OBSERVE: a duplicated or missing item
      MUST_NOT_OBSERVE: an uncommitted (gitignored) families.json

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: The ordered chain exits 0 producing registry-items.json with exactly 56 fully-populated entries (39 props arrays, 17 null) and the anchored log line.
  maps_to_ac: AC-1 | type: happy_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t "prebuild produces the 56-item gated dataset"
- TC-2: apps/docs/public/r holds 57 files per engine byte-identical to root public/r, is gitignored (check-ignore exits 0), and rebuilds byte-identical.
  maps_to_ac: AC-2 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t "copies public r generated-only and byte-identical"
- TC-3: Committed families.json covers all 56 names exactly once (7 AI families over the 39 components, ui 11, lib 6) and the gated prebuild exits 0.
  maps_to_ac: AC-3 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t "families map covers 56 exactly once"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- scripts/docs-data/prebuild.ts (NEW)
- apps/docs/src/data/registry-items.json (generated) (NEW)
- apps/docs/src/data/families.json (authored, COMMITTED) (NEW)
- apps/docs/public/r/** (generated) (NEW)
- apps/docs/.gitignore or root .gitignore (ignore lines) (NEW)
- apps/docs/package.json (prebuild script line only: "prebuild": "tsx ../../scripts/docs-data/prebuild.ts" — add if FUSE-01 did not pre-wire it) (NEW)
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts (NEW)

writeProhibited:
- packages/registry/** (read-only source of the copy)
- scripts/docs-data/props.ts|usage-snippet.ts|theming-note.ts|gates.ts (FUSE-03/04 own)
- apps/docs/src/pages/** and every astro surface (FUSE-06/07/08 batch)
- apps/example/**
- tests/sprint-01/**

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01, CAP-INST-01
provides:
- scripts/docs-data/prebuild.ts — full enrichment -> gates -> registry-items.json + families.json + apps/docs/public/r copy, logging '56 items; props resolved for 39/39 component items'
- apps/docs/src/data/families.json — COMMITTED map (9 families, 56 names exactly once)
- registry-items-v1 dataset for FUSE-06/07/08 and the delivery proofs
- gitignore coverage for apps/docs/public/ and generated src/data files
consumes:
- scripts/docs-data/gates.ts (FUSE-04)
- scripts/docs-data/props.ts, usage-snippet.ts, theming-note.ts (FUSE-03)
- apps/docs/src/data/gallery-manifest.json (FUSE-02 — expoGo verbatim, never recomputed)
- packages/registry/registry.json + root public/r after pnpm registry:build
boundary_contracts:
- registry-items-v1 (producer — names FIXED by TR-03): apps/docs/src/data/registry-items.json — array of exactly 56 entries {name, title, description, type:'registry:component'|'registry:ui'|'registry:lib', engines:['nativewind','uniwind'], expoGo:boolean, permissions:{ios:[],android:[]}|null, family:string, registryDependencies:string[], dependencies:string[], sourceFiles:[{filename,text}], props:[{name,type,default,description}]|null, usageSnippet:string, themingNote:string}
- families-v1 (producer): apps/docs/src/data/families.json — array of {id,title,order,itemNames[]}, 9 families covering all 56 names exactly once

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. .spec/prds/docs-site/ROADMAP.md [52-70]
   Focus: Gate steps 2/3/4/10 — chain order, 57-file count, check-ignore, shimmer drill
2. packages/registry/scripts/build-registry.ts [140-172]
   Focus: How root public/r is produced (the copy source; 114 files)
3. .spec/prds/docs-site/11-technical-requirements/03-data-schema.md [13-14]
   Focus: registry_page_model fields + family_group ('hand-maintained... CI gate asserts exactly once')

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FUSE-05 prebuild chain
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts
  Expected: exit 0 — 56-entry gated dataset, 57+57 public/r files byte-identical and gitignored, families exact coverage

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: One prebuild composing the data path: registry + verdicts + ts-morph enrichment -> gates -> registry-items.json + committed families map + gitignored public/r copy, wired as the docs package's prebuild so `pnpm --filter @rnr-ai-elements/docs build` runs it automatically.

Design notes:
- BLOCKS FUSE-06/07/08: the astro pages read the registry-items-v1 dataset this prebuild emits — pages must fail to build (not render empty) until it exists
- The prebuild is wired as the docs package's prebuild so gate step 2's ordered chain and gate step 10's drill both hit the gates through `pnpm --filter @rnr-ai-elements/docs build`
- families.json is COMMITTED (hand-maintained per data-schema) while registry-items.json/gallery-manifest.json/public/r are generated and gitignored — three generated artifacts, one authored expectation

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: FUSE-02, FUSE-03, FUSE-04
Blocks:     FUSE-06, FUSE-07, FUSE-08

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-05",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "registry_full": {
   "description": "real 56-item registry v0.2.1, clean tree",
   "seed_method": "cli",
   "records": [
    "pnpm registry:build exits 0 (114 files under root public/r)",
    "pnpm gallery:manifest exits 0 (dual emit)",
    "prebuild exits 0: 56 items, props resolved for 39/39"
   ]
  },
  "families_map_committed": {
   "description": "the authored families.json committed at apps/docs/src/data/families.json \u2014 9 families; assignment fixed in cross_task_notes",
   "seed_method": "migration_fixture",
   "records": [
    "7 AI families cover the 39 components 3+7+6+7+4+1+11=39; ui covers 11; lib covers 6",
    "gate asserts every registry name appears exactly once"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": false,
   "flow_ref": "FLOW-DELIV-01-fail-closed-item-count",
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "FLOW-DELIV-01-fail-closed-item-count",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count",
   "test_tier": "integration",
   "verification_service": "real pnpm chain processes + real filesystem artifacts",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real pnpm processes + real filesystem",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the prebuild writes registry-items.json before gates pass (fixture-degraded dataset would land)",
      "a 55-entry dataset is published (count asserted against 56)",
      "expoGo recomputed instead of consumed from gallery-manifest.json (verdict parity check)"
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
        "run pnpm registry:build, pnpm gallery:manifest, pnpm --filter @rnr-ai-elements/docs build",
        "read apps/docs/src/data/registry-items.json"
       ]
      },
      "end_state": {
       "must_observe": [
        "all three steps exit 0",
        "prebuild stdout contains '56 items' and '39/39'",
        "registry-items.json array of exactly 56 entries",
        "39 entries type 'registry:component' with props arrays; 17 with props null",
        "every entry has boolean expoGo and exactly the 15 contract fields"
       ],
       "must_not_observe": [
        "a partial/ungated dataset",
        "a 55-entry dataset",
        "an entry missing expoGo"
       ]
      }
     }
    ]
   },
   "given": "clean tree, FUSE-02/03/04 landed, docs package prebuild wired to tsx scripts/docs-data/prebuild.ts",
   "when": "lane test runs the real ordered chain: `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` (real processes) and reads the artifacts",
   "then": "all exit 0; prebuild logs '56 items' and 'props resolved for 39/39 component items'; registry-items.json is an array of exactly 56 entries each with exactly the 15 contract fields; 39 entries type registry:component with props arrays, 17 with props null; every expoGo boolean present; sourceFiles text non-empty per files[].path",
   "num": 1,
   "name": "Ordered chain produces the full gated dataset",
   "type": "acceptance_criterion",
   "description": "GIVEN clean tree, FUSE-02/03/04 landed, docs package prebuild wired to tsx scripts/docs-data/prebuild.ts WHEN lane test runs the real ordered chain: `pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build` (real processes) and reads the artifacts THEN all exit 0; prebuild logs '56 items' and 'props resolved for 39/39 component items'; registry-items.json is an array of exactly 56 entries each with exactly the 15 contract fields; 39 entries type registry:component with props arrays, 17 with props null; every expoGo boolean present; sourceFiles text non-empty per files[].path",
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
   "verification_service": "real git check-ignore process + real byte comparison + real rebuild",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real git + real filesystem bytes",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "public/r is copied from a stale root build (byte compare against fresh registry:build output catches it)",
      "the gitignore line is missing (check-ignore exits 1)",
      "the copy rewrites JSON instead of copying bytes (divergence from root)"
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
       "actor": "build_chain",
       "steps": [
        "count apps/docs/public/r/{nativewind,uniwind} files",
        "byte-compare against root public/r",
        "run git check-ignore apps/docs/public/r/nativewind/conversation.json",
        "delete the copy and re-run the prebuild, byte-compare again"
       ]
      },
      "end_state": {
       "must_observe": [
        "57 files in nativewind and 57 in uniwind",
        "0 of 114 files differ from their root `public/r` counterparts (byte compare: 114/114 identical)",
        "git check-ignore exits 0 printing the path",
        "rebuild output === first-build output (diff bytes == 0 across all 114 files)"
       ],
       "must_not_observe": [
        "a committed public/r in a fresh clone",
        "divergent engine JSONs",
        "a missing index registry.json per engine"
       ]
      }
     }
    ]
   },
   "given": "chain run from AC-1 has produced apps/docs/public/r",
   "when": "lane test counts files per engine, byte-compares against root public/r, runs real `git check-ignore apps/docs/public/r/nativewind/conversation.json`, then deletes the copy and re-runs the prebuild",
   "then": "57 files per engine (56 item JSONs + registry.json index); every file byte-identical to its root public/r counterpart; check-ignore exits 0; rebuild reproduces byte-identical output; the directory is gitignored so a fresh clone lacks it",
   "num": 2,
   "name": "public/r copy: gitignored, generated-only, byte-identical, deterministic",
   "type": "acceptance_criterion",
   "description": "GIVEN chain run from AC-1 has produced apps/docs/public/r WHEN lane test counts files per engine, byte-compares against root public/r, runs real `git check-ignore apps/docs/public/r/nativewind/conversation.json`, then deletes the copy and re-runs the prebuild THEN 57 files per engine (56 item JSONs + registry.json index); every file byte-identical to its root public/r counterpart; check-ignore exits 0; rebuild reproduces byte-identical output; the directory is gitignored so a fresh clone lacks it",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "primary": false,
   "flow_ref": "FLOW-DELIV-01-fail-closed-item-count",
   "test_file": "tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts",
   "test_function": "FLOW-DELIV-01-fail-closed-item-count",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count",
   "test_tier": "integration",
   "verification_service": "real committed families.json + real registry + real gate run",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real files + real gate module",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "an item sits in two families or none (gate throws naming it)",
      "families.json is generated and drifts from the registry (it is committed and gated)"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "families_map_committed",
      "action": {
       "actor": "build_chain",
       "steps": [
        "read apps/docs/src/data/families.json and packages/registry/registry.json",
        "run the prebuild so the family gate executes over the committed map"
       ]
      },
      "end_state": {
       "must_observe": [
        "9 families",
        "7 AI families contain exactly the 39 component names each exactly once",
        "ui family has exactly 11, lib exactly 6",
        "prebuild exits 0"
       ],
       "must_not_observe": [
        "a duplicated or missing item",
        "an uncommitted (gitignored) families.json"
       ]
      }
     }
    ]
   },
   "given": "the authored families.json committed (NOT gitignored) with 9 families per the fixed assignment",
   "when": "lane test reads families.json and the registry, runs a real prebuild (gates consume the committed map)",
   "then": "9 families total (conversation, message, prompt-input, reasoning, sources, suggestion, tool, ui, lib); the 7 AI families contain exactly the 39 component names each exactly once (3+7+6+7+4+1+11); ui has the 11, lib the 6; the prebuild passes the family gate exit 0",
   "num": 3,
   "name": "Committed families map covers all 56 exactly once",
   "type": "acceptance_criterion",
   "description": "GIVEN the authored families.json committed (NOT gitignored) with 9 families per the fixed assignment WHEN lane test reads families.json and the registry, runs a real prebuild (gates consume the committed map) THEN 9 families total (conversation, message, prompt-input, reasoning, sources, suggestion, tool, ui, lib); the 7 AI families contain exactly the 39 component names each exactly once (3+7+6+7+4+1+11); ui has the 11, lib the 6; the prebuild passes the family gate exit 0",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The ordered chain exits 0 producing registry-items.json with exactly 56 fully-populated entries (39 props arrays, 17 null) and the anchored log line.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t \"prebuild produces the 56-item gated dataset\""
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "apps/docs/public/r holds 57 files per engine byte-identical to root public/r, is gitignored (check-ignore exits 0), and rebuilds byte-identical.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t \"copies public r generated-only and byte-identical\""
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "Committed families.json covers all 56 names exactly once (7 AI families over the 39 components, ui 11, lib 6) and the gated prebuild exits 0.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts -t \"families map covers 56 exactly once\""
  }
 ]
}
-->
