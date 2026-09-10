================================================================================
TASK: FUSE-03 - Enrichment modules: ts-morph props, usage snippet, theming note (data only, no UI)
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed (landed)
COMMIT:     318195773617f8f81c22c27c343f4cb6e1369215
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

Running the three modules over all 56 real items yields: props arrays for 39/39 components (no throw), null for the 17 ui/lib items; a non-empty verbatim usageSnippet for all 56 (each a byte-substring of its batch file); a non-empty deterministic themingNote for all 56; a broken-type fixture throws naming the item and prop.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------

- MUST: Add ts-morph as a ROOT devDependency (pnpm add -D -w ts-morph) — build-time only, never shipped to any app (TR-06)
- MUST: Prop type text is FULL — no truncation, no ellipsis, however long (TR-08 R7); rendering concerns belong to the pages
- MUST: usageSnippet is extracted byte-verbatim via ts-morph AST node full-text ranges from cells/{batch}.tsx — the populated cell's arrow-function source exactly as committed
- MUST: Distinguish empty-resolved (component takes no props -> []) from unresolved (checker error type) — only the latter throws
- MUST: Errors use the shared shape [docs-data] props: item "<name>" prop "<prop>" has unresolved type (the FUSE-04 gate re-raises these)
- NEVER: Never write into apps/example/gallery/** — the cells and manifest are read-only sources
- NEVER: Never regex-parse the cells for function-body bounds where AST ranges are needed (the existing tests/gallery-cells.test.ts regex tripwire stays the coverage check, not the extractor)
- NEVER: Never reformat, biome-fix, or normalize extracted snippet text
- NEVER: Never resolve props for ui/lib items — they get null by contract
- STRICTLY: One module per concern (props.ts, usage-snippet.ts, theming-note.ts) under scripts/docs-data/ — no monolithic enrich.ts; FUSE-05 composes
- STRICTLY: Extraction runs against the real workspace tsconfig context so @/ aliases in registry sources resolve or fail loudly

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: ts-morph props resolve for all 39 components, full type text, null for ui/lib
- [ ] AC-2: Usage snippet extracted byte-verbatim from the real gallery cells
- [ ] AC-3: Theming note derived from real source token classes, deterministic
- [ ] every AC verify command passes (see ACCEPTANCE CRITERIA)
- [ ] pnpm typecheck clean; ./node_modules/.bin/biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD Beads — ordered happy-path first)
--------------------------------------------------------------------------------

Each AC is a RED → GREEN → REFACTOR micro-cycle. TDD_STATE starts `none`.

AC-1: ts-morph props resolve for all 39 components, full type text, null for ui/lib
  GIVEN: the real repo with ts-morph installed and the real registry.json
  WHEN:  the lane test imports scripts/docs-data/props.ts and runs extraction over every real registry item
  THEN:  all 39 registry:component items return arrays without throwing (empty arrays allowed); conversation's props include name "data"; prompt-input's props include name "onSubmit"; every type string is the complete untruncated checker text; all 11 ui and 6 lib items return null

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real ts-morph TypeChecker parse of the real packages/registry/src files
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real ts-morph over real registry sources
    NEGATIVE_CONTROL (would fail if):
      - extraction silently maps unresolved types to any/'any' instead of throwing (broken_props_fixture case catches it)
      - type text is truncated at N chars (test asserts the extracted string equals the checker's full text for the longest observed prop type)
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - import props.ts and run it over all 56 real registry items
        - assert per-name results
      MUST_OBSERVE: 0 throws across 39 component items
      MUST_OBSERVE: props for "conversation" include name "data"
      MUST_OBSERVE: props for "prompt-input" include name "onSubmit"
      MUST_OBSERVE: 17 non-component items (11 ui, 6 lib) yield null
      MUST_OBSERVE: each extracted `type` string === `Type.getText(sourceFile)` (0 truncations, no '…' ellipsis in any of the 39 components' type strings)
      MUST_NOT_OBSERVE: a truncated type (no '…'/ellipsis in any type string)
      MUST_NOT_OBSERVE: props non-null for any ui or lib item
      MUST_NOT_OBSERVE: a silent 'any' substitution
    CASE 2:
      START_REF: broken_props_fixture
      ACTOR: build_chain
        - write the broken-type component fixture to a real temp dir
        - run the real extractor against the fixture path as a one-item dataset
      MUST_OBSERVE: extraction throws and the module exits with code 1 (non-zero)
      MUST_OBSERVE: error message starts with the literal `[docs-data] props:`
      MUST_OBSERVE: error matches `[docs-data] props: item "<name>" prop "<prop>" has unresolved type` — contains the fixture item name and the broken prop name in double quotes
      MUST_NOT_OBSERVE: exit 0 / a returned array over the broken fixture

AC-2: Usage snippet extracted byte-verbatim from the real gallery cells
  GIVEN: the real five batch files under apps/example/gallery/cells/
  WHEN:  the lane test runs scripts/docs-data/usage-snippet.ts over all 56 items and reads the batch sources
  THEN:  every item yields a non-empty usageSnippet; the snippet for conversation contains "Conversation" and is a byte-substring of cells/ai-chat.tsx; each of the 56 snippets is a byte-substring of the batch file that declares its populated cell; no snippet exists that is not found in any batch file

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real ts-morph AST ranges over the real cells batch files + real byte-substring comparison
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real ts-morph + real file bytes
    NEGATIVE_CONTROL (would fail if):
      - the snippet is hand-authored or reformatted (byte-substring check against the committed batch file fails)
      - extraction takes the empty/loading/error cell instead of populated (conversation snippet would not contain the populated cell's identifiers)
    EVIDENCE: file_artifact (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - run usage-snippet.ts over the real batch files
        - for each of the 56 names assert snippet non-empty and batchSource.includes(snippet)
      MUST_OBSERVE: 56 of 56 non-empty snippets
      MUST_OBSERVE: snippet for "conversation" contains "Conversation" and is a byte-substring of apps/example/gallery/cells/ai-chat.tsx
      MUST_OBSERVE: `batchSource.includes(snippet) === true` for 56 of 56 items (0 snippets absent from their declaring batch file)
      MUST_NOT_OBSERVE: a snippet not found verbatim in any batch file
      MUST_NOT_OBSERVE: an empty snippet for any item

AC-3: Theming note derived from real source token classes, deterministic
  GIVEN: the real item sources under packages/registry/src/
  WHEN:  the lane test runs scripts/docs-data/theming-note.ts twice over all 56 items and independently reads the shimmer source
  THEN:  all 56 themingNote values are non-empty strings; the two runs produce identical values per item; every theme-token class named in shimmer's note appears verbatim in packages/registry/src/components/ai/shimmer.tsx; an item consuming no token classes gets the defined default note (not an empty string)

  FLOW_REF:             FLOW-DELIV-01-fail-closed-item-count
  TEST_TIER:            integration
  VERIFICATION_SERVICE: real source file reads + real extraction runs
  SURFACE_POLICY:       .spec/e2e-policy/surface.json
  TDD_STATE:            none
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
  TEST_FUNCTION:        FLOW-DELIV-01-fail-closed-item-count
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts -t FLOW-DELIV-01-fail-closed-item-count

  SCENARIO (the proof, not the claim):
    TIER: visible | TEST_TIER: integration | TOPOLOGY: single-node | SERVICE: real filesystem + real extraction
    NEGATIVE_CONTROL (would fail if):
      - the note names a class absent from the item's source (invented decoration) or varies between runs (nondeterministic ordering)
    EVIDENCE: stdout (required_capture=true)
    CASE 1:
      START_REF: registry_full
      ACTOR: build_chain
        - run theming-note.ts twice over all 56 items
        - read packages/registry/src/components/ai/shimmer.tsx bytes
      MUST_OBSERVE: 56 of 56 non-empty notes
      MUST_OBSERVE: run 1 deep-equals run 2 per item
      MUST_OBSERVE: every class named in shimmer's note satisfies `shimmerSource.includes(className) === true` (0 invented class names)
      MUST_NOT_OBSERVE: an empty note
      MUST_NOT_OBSERVE: a named class absent from the source
      MUST_NOT_OBSERVE: differing notes between runs

--------------------------------------------------------------------------------
TEST CRITERIA (booleans — no should/could/would)
--------------------------------------------------------------------------------

- TC-1: Props extraction over the 39 real component items returns arrays without throwing, with full untruncated type text, and returns null for the 17 ui/lib items.
  maps_to_ac: AC-1 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t "extracts props for 39 components"
- TC-2: A real fixture component with an unimported type in its props interface makes extraction throw an error naming the item and the prop.
  maps_to_ac: AC-1 | type: error_path | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t "extracts props for 39 components"
- TC-3: All 56 usageSnippet values are non-empty byte-substrings of their declaring cells batch file, populated cell only.
  maps_to_ac: AC-2 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t "extracts verbatim usage snippets"
- TC-4: All 56 themingNote values are non-empty, identical across two runs, and every named class appears verbatim in the item source.
  maps_to_ac: AC-3 | type: behavior | VERIFY: pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t "derives deterministic theming notes"

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------

writeAllowed:
- scripts/docs-data/props.ts (NEW)
- scripts/docs-data/usage-snippet.ts (NEW)
- scripts/docs-data/theming-note.ts (NEW)
- package.json (ts-morph root devDependency only) (NEW)
- pnpm-lock.yaml (NEW)
- tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts (NEW)
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts (NEW)

writeProhibited:
- scripts/build-gallery-manifest.ts (FUSE-02, same wave)
- packages/registry/**
- apps/example/**
- tests/sprint-01/**
- apps/docs/** (except nothing — this task writes no apps/docs files)

--------------------------------------------------------------------------------
BOUNDARY CONTRACTS / CAPABILITY CHAIN
--------------------------------------------------------------------------------

touches_capabilities: CAP-DOCS-01
provides:
- scripts/docs-data/props.ts — ts-morph extraction of [{name,type,default,description}] per registry:component item (null for ui/lib); throws naming item+prop on an unresolved type
- scripts/docs-data/usage-snippet.ts — verbatim populated-cell source per item from the five cells batch files
- scripts/docs-data/theming-note.ts — deterministic theming note derived from theme-token utility classes in the item's real source
consumes:
- packages/registry/registry.json (files[].path per item)
- apps/example/gallery/cells/{ai-chat,ai-agent,ai-code,ui,lib}.tsx (read-only)
boundary_contracts:
- registry-items-v1 field semantics: props [{name,type,default,description}]|null — non-null only for the 39 registry:component items; usageSnippet string — byte-substring of a real cells batch file; themingNote string — non-empty, deterministic, derived from source

--------------------------------------------------------------------------------
READING LIST
--------------------------------------------------------------------------------

1. packages/registry/registry.json [items[]]
   Focus: files[].path per item — the extraction targets; 39 components live under packages/registry/src/components/ai/
2. apps/example/gallery/cells.ts [1-32]
   Focus: Merge point: CELLS: Record<string, ItemCells> over 5 batch files; CellState includes 'populated'
3. apps/example/gallery/cells/ai-chat.tsx [41-80]
   Focus: Batch-file shape: top-level `name: { populated: () => <Jsx/>, ... }` entries — the AST pattern to extract
4. packages/registry/src/components/ai/conversation.tsx [whole file]
   Focus: A real component source: Props interface shape, cn() token classes — what props.ts and theming-note.ts actually parse
5. tests/gallery-cells.test.ts [26-44]
   Focus: The existing regex tripwire — coverage oracle your extractor must not contradict
6. .spec/prds/docs-site/11-technical-requirements/06-external-dependencies.md [16]
   Focus: ts-morph constraint: build-time only, never shipped

--------------------------------------------------------------------------------
EVIDENCE GATES (fail fast)
--------------------------------------------------------------------------------

Gate 1: FUSE-03 enrichment modules
  Command:  pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts
  Expected: exit 0 — props 39/39 + fixture throw, 56 verbatim snippets, 56 deterministic notes

Gate: RED-first evidence — each behavioral AC test watched FAIL against the sprint-start state (apps/docs absent / unbuilt) before GREEN.

--------------------------------------------------------------------------------
CONTEXT (read if unclear)
--------------------------------------------------------------------------------

Objective: Three pure-ish enrichment modules under scripts/docs-data/ that turn each registry item into its props table, its verbatim usage snippet, and its theming note — real ts-morph parses over the real repo files, each returning data or throwing an error that names the item.

Design notes:
- FUSE-04's props gate consumes props.ts directly — its throw IS the gate signal; do not catch-and-default
- FUSE-05 composes all three modules; keep each module importable and side-effect-free until invoked
- Cells organize by surface (ai-chat/ai-agent/ai-code/ui/lib), NOT by the 7 families — family mapping is FUSE-05's, never infer it here

--------------------------------------------------------------------------------
DEPENDENCIES
--------------------------------------------------------------------------------

Depends on: none
Blocks:     FUSE-04 (props-resolved gate runs the real extractor), FUSE-05 (prebuild composes all three modules)

REVIEW (domain reviewer) — verdict APPROVED requires every AC/TC satisfied with evidence; zero stub findings; SCOPE respected.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FUSE-03",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "registry_full": {
   "description": "the real 56-item registry at v0.2.1; 39 component items whose files[].path live under packages/registry/src/",
   "seed_method": "cli",
   "records": [
    "pnpm registry:build exits 0 \u2014 every files[].path provably readable",
    "all 50 non-lib items have a populated cell; the 6 lib items have demo entries (tests/gallery-cells.test.ts green)"
   ]
  },
  "broken_props_fixture": {
   "description": "a real temp directory holding a copied component source whose props interface references an unimported/nonexistent type \u2014 the checker-error drill for unresolved props",
   "seed_method": "migration_fixture",
   "records": [
    "fixture file written to a real temp dir by the test",
    "extraction over it throws [docs-data] props: item ... naming the broken prop"
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
   "verification_service": "real ts-morph TypeChecker parse of the real packages/registry/src files",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real ts-morph over real registry sources",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "extraction silently maps unresolved types to any/'any' instead of throwing (broken_props_fixture case catches it)",
      "type text is truncated at N chars (test asserts the extracted string equals the checker's full text for the longest observed prop type)"
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
        "import props.ts and run it over all 56 real registry items",
        "assert per-name results"
       ]
      },
      "end_state": {
       "must_observe": [
        "0 throws across 39 component items",
        "props for \"conversation\" include name \"data\"",
        "props for \"prompt-input\" include name \"onSubmit\"",
        "17 non-component items (11 ui, 6 lib) yield null",
        "each extracted `type` string === `Type.getText(sourceFile)` (0 truncations, no '\u2026' ellipsis in any of the 39 components' type strings)"
       ],
       "must_not_observe": [
        "a truncated type (no '\u2026'/ellipsis in any type string)",
        "props non-null for any ui or lib item",
        "a silent 'any' substitution"
       ]
      }
     },
     {
      "start_ref": "broken_props_fixture",
      "action": {
       "actor": "build_chain",
       "steps": [
        "write the broken-type component fixture to a real temp dir",
        "run the real extractor against the fixture path as a one-item dataset"
       ]
      },
      "end_state": {
       "must_observe": [
        "extraction throws and the module exits with code 1 (non-zero)",
        "error message starts with the literal `[docs-data] props:`",
        "error matches `[docs-data] props: item \"<name>\" prop \"<prop>\" has unresolved type` \u2014 contains the fixture item name and the broken prop name in double quotes"
       ],
       "must_not_observe": [
        "exit 0 / a returned array over the broken fixture"
       ]
      }
     }
    ]
   },
   "given": "the real repo with ts-morph installed and the real registry.json",
   "when": "the lane test imports scripts/docs-data/props.ts and runs extraction over every real registry item",
   "then": "all 39 registry:component items return arrays without throwing (empty arrays allowed); conversation's props include name \"data\"; prompt-input's props include name \"onSubmit\"; every type string is the complete untruncated checker text; all 11 ui and 6 lib items return null",
   "num": 1,
   "name": "ts-morph props resolve for all 39 components, full type text, null for ui/lib",
   "type": "acceptance_criterion",
   "description": "GIVEN the real repo with ts-morph installed and the real registry.json WHEN the lane test imports scripts/docs-data/props.ts and runs extraction over every real registry item THEN all 39 registry:component items return arrays without throwing (empty arrays allowed); conversation's props include name \"data\"; prompt-input's props include name \"onSubmit\"; every type string is the complete untruncated checker text; all 11 ui and 6 lib items return null",
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
   "verification_service": "real ts-morph AST ranges over the real cells batch files + real byte-substring comparison",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real ts-morph + real file bytes",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the snippet is hand-authored or reformatted (byte-substring check against the committed batch file fails)",
      "extraction takes the empty/loading/error cell instead of populated (conversation snippet would not contain the populated cell's identifiers)"
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
        "run usage-snippet.ts over the real batch files",
        "for each of the 56 names assert snippet non-empty and batchSource.includes(snippet)"
       ]
      },
      "end_state": {
       "must_observe": [
        "56 of 56 non-empty snippets",
        "snippet for \"conversation\" contains \"Conversation\" and is a byte-substring of apps/example/gallery/cells/ai-chat.tsx",
        "`batchSource.includes(snippet) === true` for 56 of 56 items (0 snippets absent from their declaring batch file)"
       ],
       "must_not_observe": [
        "a snippet not found verbatim in any batch file",
        "an empty snippet for any item"
       ]
      }
     }
    ]
   },
   "given": "the real five batch files under apps/example/gallery/cells/",
   "when": "the lane test runs scripts/docs-data/usage-snippet.ts over all 56 items and reads the batch sources",
   "then": "every item yields a non-empty usageSnippet; the snippet for conversation contains \"Conversation\" and is a byte-substring of cells/ai-chat.tsx; each of the 56 snippets is a byte-substring of the batch file that declares its populated cell; no snippet exists that is not found in any batch file",
   "num": 2,
   "name": "Usage snippet extracted byte-verbatim from the real gallery cells",
   "type": "acceptance_criterion",
   "description": "GIVEN the real five batch files under apps/example/gallery/cells/ WHEN the lane test runs scripts/docs-data/usage-snippet.ts over all 56 items and reads the batch sources THEN every item yields a non-empty usageSnippet; the snippet for conversation contains \"Conversation\" and is a byte-substring of cells/ai-chat.tsx; each of the 56 snippets is a byte-substring of the batch file that declares its populated cell; no snippet exists that is not found in any batch file",
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
   "verification_service": "real source file reads + real extraction runs",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "real filesystem + real extraction",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the note names a class absent from the item's source (invented decoration) or varies between runs (nondeterministic ordering)"
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
        "run theming-note.ts twice over all 56 items",
        "read packages/registry/src/components/ai/shimmer.tsx bytes"
       ]
      },
      "end_state": {
       "must_observe": [
        "56 of 56 non-empty notes",
        "run 1 deep-equals run 2 per item",
        "every class named in shimmer's note satisfies `shimmerSource.includes(className) === true` (0 invented class names)"
       ],
       "must_not_observe": [
        "an empty note",
        "a named class absent from the source",
        "differing notes between runs"
       ]
      }
     }
    ]
   },
   "given": "the real item sources under packages/registry/src/",
   "when": "the lane test runs scripts/docs-data/theming-note.ts twice over all 56 items and independently reads the shimmer source",
   "then": "all 56 themingNote values are non-empty strings; the two runs produce identical values per item; every theme-token class named in shimmer's note appears verbatim in packages/registry/src/components/ai/shimmer.tsx; an item consuming no token classes gets the defined default note (not an empty string)",
   "num": 3,
   "name": "Theming note derived from real source token classes, deterministic",
   "type": "acceptance_criterion",
   "description": "GIVEN the real item sources under packages/registry/src/ WHEN the lane test runs scripts/docs-data/theming-note.ts twice over all 56 items and independently reads the shimmer source THEN all 56 themingNote values are non-empty strings; the two runs produce identical values per item; every theme-token class named in shimmer's note appears verbatim in packages/registry/src/components/ai/shimmer.tsx; an item consuming no token classes gets the defined default note (not an empty string)",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "Props extraction over the 39 real component items returns arrays without throwing, with full untruncated type text, and returns null for the 17 ui/lib items.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t \"extracts props for 39 components\""
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "A real fixture component with an unimported type in its props interface makes extraction throw an error naming the item and the prop.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t \"extracts props for 39 components\""
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "All 56 usageSnippet values are non-empty byte-substrings of their declaring cells batch file, populated cell only.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t \"extracts verbatim usage snippets\""
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "All 56 themingNote values are non-empty, identical across two runs, and every named class appears verbatim in the item source.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm vitest run tests/sprint-01-docs-spike-skeleton/enrichment-modules.test.ts -t \"derives deterministic theming notes\""
  }
 ]
}
-->
