<!-- Version: TASK-TEMPLATE v5.2 · sprint-03-family-browse -->

# FAM-001: RED-first locked-flow lane specs: /components 39-in-7-families grid + card anatomy

> Status: ✅ Completed
> Commit: fdbc02a5aa7fcb2dde8e2ed573d63d375ad3f69f
> Assignee: astro-implementer (implementer) · astro-reviewer (reviewer)
> Priority: P0 · Points: 3 · Type: FEATURE · Wave: ?
> Proposed By: astro-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 2107567

## What this does
Author both locked-flow specs before implementation, proving by RED capture that today's lean list fails them.

## Why
Both locked run_cmds select one authored spec each, exit non-zero against the sprint-start lean list under all three projects with verbatim RED proofs, and go green when FAM-003 lands.

## How to verify
pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families

## Scope
tests/sprint-03-family-browse/components-family-grid.spec.ts (NEW); tests/sprint-03-family-browse/card-anatomy.spec.ts (NEW); .tmp/sprint-03-family-browse/e2e-evidence/* (NEW)

<details>
<summary>▸ Full agent specification (FAM-001 — required reading for implementer + reviewer)</summary>

TASK: FAM-001 — RED-first locked-flow lane specs: /components 39-in-7-families grid + card anatomy
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P0 · POINTS: 3
AGENT: implementer=astro-implementer | reviewer=astro-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/4 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: run_cmd selects exactly one spec file + one flow id — byte-for-byte the locked human-flows.json command
- MUST: derive every expectation at module scope from real src/data (ENOENT-bridged readJson): family order, counts 3/7/6/7/4/1/11, 39-name multiset, descriptions, verdicts
- MUST: run unguarded in chromium-desktop, chromium-mobile, chromium-nojs
- MUST: capture today's failing run verbatim into the locked -red.txt paths — exit non-zero at RED is expected evidence
- NEVER: never hard-code the 39 names, counts, or description literals — dataset changes must move the spec
- NEVER: never use fixtures/mocks/page echoes as oracle; never assert class instead of content
- NEVER: never touch implementation, playwright.config.ts, or any existing lane
- STRICTLY: navigate only via http://localhost:4321; retries 0; Playwright webServer owns serving — never background astro preview
- STRICTLY: lint via ./node_modules/.bin/biome ci <paths> — pnpm lint crashes locally

### DONE WHEN

- [ ] AC 1: GIVEN the sprint-start preview and the real dataset read at module scope WHEN the locked r
- [ ] AC 2: GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN card-an
- [ ] AC 3: GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-07 locked run_cmd executes THE
- [ ] AC 4: GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-08 locked run_cmd executes THE
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: GIVEN the sprint-start preview and the real dataset read at module sco**

  GIVEN/WHEN/THEN: GIVEN the sprint-start preview and the real dataset read at module scope WHEN the locked run_cmd executes THEN components-family-grid.spec.ts asserts exactly seven sections in committed order (conversation, message, prompt-input, reasoning, sources, suggestion, tool), per-family counts 3/7/6/7/4/1/11 summing to 39, the card-name multiset equal to the 39 registry:component names each exactly once, and every card href /components/{item} returning 200 via request.get

  FLOW_REF: FLOW-GEND-07-components-page-39-in-7-families · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/components-family-grid.spec.ts · TEST_FUNCTION: FLOW-GEND-07-components-page-39-in-7-families
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
  VERIFICATION_SERVICE: real Astro build + astro preview server + Chromium (3 projects) · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["7 sections in order conversation, message, prompt-input, reasoning, sources, suggestion, tool", "count chips 3/7/6/7/4/1/11 summing to 39", "39 names each appearing exactly 1 time", "all 39 hrefs return 200"] / MUST_NOT_OBSERVE ["9 sections (ui/lib present \u2014 start state)", "56 anchor rows with 0 cards (lean-list start)", "a dataset name appearing 0 or 2 times"]
    - NEGATIVE_CONTROL: would fail if ['static shell — hand-written HTML detached from the dataset', 'hand-written list — counts/names typed as literals', 'empty dataset — 0 cards', 'mock — fixture JSON instead of src/data']

**AC-2: GIVEN the built preview and the real dataset WHEN the locked run_cmd e**

  GIVEN/WHEN/THEN: GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN card-anatomy.spec.ts iterates all 39 cards asserting (1) title, (2) non-empty description <=120 chars equal to the item's description or its word-boundary clamp with trailing ellipsis, (3) category chip, (4) badge whose exact text is 'runs in Expo Go' or 'requires a dev client', with cards_with_all_fields === 39

  FLOW_REF: FLOW-GEND-08-family-card-anatomy · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/card-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-08-family-card-anatomy
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`
  VERIFICATION_SERVICE: real Astro build + astro preview + Chromium (3 projects) over the real dataset · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF real_registry_dataset → MUST_OBSERVE ["cards_with_all_fields == 39", "every description length 1..120, dataset-equal or clamped with '\u2026'", "exactly 1 chip per card", "badge text exactly 'runs in Expo Go' or 'requires a dev client' on all 39"] / MUST_NOT_OBSERVE ["a 0-char description", "a card with 0 chips", "a blank '' or placeholder badge"]
    - NEGATIVE_CONTROL: would fail if ['static shell — title-only markup, 0 chips/badges', 'hand-written list — description oracles copied as strings', 'empty dataset — count collapses to 0', 'mock — verdict vs fixture enum, not the two exact strings']

**AC-3: GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-07 locked **

  GIVEN/WHEN/THEN: GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-07 locked run_cmd executes THEN it exits non-zero under all three projects (attempt lines for chromium-desktop, chromium-mobile, chromium-nojs) and verbatim output lands at .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-07-components-page-39-in-7-families-red.txt

  FLOW_REF: FLOW-GEND-07-components-page-39-in-7-families · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/components-family-grid.spec.ts · TEST_FUNCTION: FLOW-GEND-07-components-page-39-in-7-families
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
  VERIFICATION_SERVICE: real Astro build + astro preview at sprint-start state + Chromium · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_preview_lean_start → MUST_OBSERVE ["exit code 1", "failure diff names expected 7 sections / received 9; expected 39 cards / received 0", "red.txt exists with >0 bytes at the locked path", "attempt lines for all 3 projects: chromium-desktop, chromium-mobile, chromium-nojs (3 of 3)"] / MUST_NOT_OBSERVE ["exit 0 at RED", "a 0-byte or absent -red.txt", "0 attempt lines for chromium-nojs (skip signature)"]
    - NEGATIVE_CONTROL: would fail if ['oracle passes against the lean list (9 sections/0 cards satisfy it)', 'red proof paraphrased, not captured output', 'run_cmd broadened to skip the failing test']

**AC-4: GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-08 locked **

  GIVEN/WHEN/THEN: GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-08 locked run_cmd executes THEN it exits non-zero with verbatim output at .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy-red.txt and the spec's evidence writer targets the locked artifact FLOW-GEND-08-family-card-anatomy.json

  FLOW_REF: FLOW-GEND-08-family-card-anatomy · TEST_TIER: e2e · TDD_STATE: none
  TEST_FILE: tests/sprint-03-family-browse/card-anatomy.spec.ts · TEST_FUNCTION: FLOW-GEND-08-family-card-anatomy
  VERIFY: `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`
  VERIFICATION_SERVICE: real Astro build + astro preview at sprint-start state + Chromium · SURFACE_POLICY: .spec/e2e-policy/surface.json
  SCENARIO:
    - START_REF built_preview_lean_start → MUST_OBSERVE ["exit code 1", "failure diff names cards_with_all_fields expected 39 / received 0", "red.txt exists with >0 bytes at the locked path", "writer references the exact locked path .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy.json (1 reference)"] / MUST_NOT_OBSERVE ["exit 0 at RED", "a 0-byte or absent -red.txt", "evidence written to 0 of the 2 locked artifact paths"]
    - NEGATIVE_CONTROL: would fail if ['anatomy spec passes against 0 cards (vacuous loop)', 'red proof summarized, not verbatim', 'writer targets a path other than the locked artifact']


### TEST CRITERIA

- **TC-1** (→AC-1, happy_path): The FLOW-GEND-07 run_cmd selects exactly the authored spec + grep token, byte-for-byte the locked command. — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
- **TC-2** (→AC-1, edge_case): Every expectation derives at module scope from src/data via the ENOENT-bridged readJson pattern. — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
- **TC-3** (→AC-2, edge_case): Description assertions accept exactly the dataset field or its clamp + ellipsis; badge assertions accept exactly the two verdict strings. — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`
- **TC-4** (→AC-3, error_handling): FLOW-GEND-07 run_cmd exits non-zero under all three projects with verbatim proof at the locked path. — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families`
- **TC-5** (→AC-4, error_handling): FLOW-GEND-08 run_cmd exits non-zero with verbatim proof + writer targeting its locked artifact JSON. — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy`

### READING LIST (max 5)

- tests/sprint-01-docs-spike-skeleton/component-page.spec.ts [PRIMARY PATTERN] lines 12-95 — readJson ENOENT-bridge + dataset-derived expectations + unguarded asserts
- tests/sprint-02-shell-hero/dependency-panels.spec.ts [closest analogue] lines all — locked-flow lane shape: flow-id title, evidence + RED at locked .tmp paths
- tests/harness/docs-preview.ts [harness] lines 39-101 — PREVIEW_URL / waitForAstroPageLoad
- .spec/prds/docs-site/tasks/sprint-03-family-browse/human-flows.json [lock] lines both entries — byte-for-byte run_cmd/test/artifact/red_proof
- apps/docs/src/data/families.json [data] lines all — family ids/order/itemNames oracle

### SCOPE (file-level write permissions)

writeAllowed:
- tests/sprint-03-family-browse/components-family-grid.spec.ts (NEW)
- tests/sprint-03-family-browse/card-anatomy.spec.ts (NEW)
- .tmp/sprint-03-family-browse/e2e-evidence/* (NEW)
writeProhibited:
- apps/docs/src/**
- playwright.config.ts
- tests/sprint-01-docs-spike-skeleton/**
- tests/sprint-02-shell-hero/**
- src/data/** and packages/**

### CODE PATTERN
- pattern: dataset-derived expectations + ENOENT-bridged reads + unguarded server-rendered asserts (source: tests/sprint-01-docs-spike-skeleton/component-page.spec.ts:12-95)
- anti-pattern: hand-typed counts/names, fixture oracles, page echoes, single-project guards, broad verifies
- references: ['TR-07 wireframe rows', 'T-GEND-007/008', 'UC-GEND-02 AC-1..3']
- notes: ['Specs land before implementation (RED-first): wave A authored, fail verbatim under 3 projects, green when FAM-003 lands. Writers fire on green; RED proofs capture sprint-start failures.']

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: [] · provides: ['authored FLOW-GEND-07 lane spec', 'authored FLOW-GEND-08 lane spec', 'verbatim RED proofs at both locked -red.txt paths', 'evidence writers to both locked artifact JSONs'] · consumes: ['FAM-002 component-card DOM contract', 'src/data/families.json + registry-items.json as module-scope oracle']

- Specs assert agreed selectors so FAM-003 greens them without edits (RED-to-GREEN)
- All expectations derive from real data artifacts at module scope — never fixtures

### VERIFICATION GATES

- **FLOW-GEND-07 authored + RED** — `pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families` → exit 1 at sprint start, 3 project attempt lines, verbatim -red.txt; exit 0 after FAM-003
- **FLOW-GEND-08 authored + RED** — `pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy` → exit 1 at sprint start, verbatim -red.txt; exit 0 after FAM-003
- **typecheck + lint** — `pnpm typecheck && ./node_modules/.bin/biome ci tests/sprint-03-family-browse/components-family-grid.spec.ts tests/sprint-03-family-browse/card-anatomy.spec.ts` → exit 0
- **scope** — `git diff --name-only` → only write_allowed paths

### DEPENDENCIES
- Depends on: [] · Blocks: ['FAM-003'] · Parallel: FAM-002 (disjoint paths)

### CODING STANDARDS

- .spec/prds/docs-site/11-technical-requirements/07-ui-infrastructure.md

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "FAM-001",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_dataset": {
   "description": "Committed build inputs read at module scope via ENOENT-bridged readJson.",
   "seed_method": "public_api",
   "records": [
    "39 registry:component items across 7 families, counts 3/7/6/7/4/1/11",
    "all 39 descriptions >120 chars, longest 1840",
    "zero items carry expoGo:false at HEAD"
   ]
  },
  "built_preview_lean_start": {
   "description": "Sprint-start build via Playwright webServer: /components is the lean list (9 sections, 56 anchor rows, 0 cards).",
   "seed_method": "ui_flow",
   "records": [
    "/components serves 200 with the lean list at sprint-start HEAD",
    "both run_cmds exit non-zero against it by design"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "description": "GIVEN the sprint-start preview and the real dataset read at module scope WHEN the locked run_cmd executes THEN components-family-grid.spec.ts asserts exactly seven sections in committed order (conversation, message, prompt-input, reasoning, sources, suggestion, tool), per-family counts 3/7/6/7/4/1/11 summing to 39, the card-name multiset equal to the 39 registry:component names each exactly once, and every card href /components/{item} returning 200 via request.get",
   "primary": false,
   "flow_ref": "FLOW-GEND-07-components-page-39-in-7-families",
   "test_file": "tests/sprint-03-family-browse/components-family-grid.spec.ts",
   "test_function": "FLOW-GEND-07-components-page-39-in-7-families",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview server + Chromium (3 projects)",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": null,
   "scenario": {
    "primary": false,
    "test_tier": "e2e",
    "verification_service": "real preview + data-equality oracle vs the real dataset",
    "negative_control": {
     "would_fail_if": [
      "static shell \u2014 hand-written HTML detached from the dataset",
      "hand-written list \u2014 counts/names typed as literals",
      "empty dataset \u2014 0 cards",
      "mock \u2014 fixture JSON instead of src/data"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "goto /components",
        "read section order, counts, name multiset, hrefs",
        "compare vs module-scope dataset",
        "request.get every href"
       ]
      },
      "end_state": {
       "must_observe": [
        "7 sections in order conversation, message, prompt-input, reasoning, sources, suggestion, tool",
        "count chips 3/7/6/7/4/1/11 summing to 39",
        "39 names each appearing exactly 1 time",
        "all 39 hrefs return 200"
       ],
       "must_not_observe": [
        "9 sections (ui/lib present \u2014 start state)",
        "56 anchor rows with 0 cards (lean-list start)",
        "a dataset name appearing 0 or 2 times"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "description": "GIVEN the built preview and the real dataset WHEN the locked run_cmd executes THEN card-anatomy.spec.ts iterates all 39 cards asserting (1) title, (2) non-empty description <=120 chars equal to the item's description or its word-boundary clamp with trailing ellipsis, (3) category chip, (4) badge whose exact text is 'runs in Expo Go' or 'requires a dev client', with cards_with_all_fields === 39",
   "primary": false,
   "flow_ref": "FLOW-GEND-08-family-card-anatomy",
   "test_file": "tests/sprint-03-family-browse/card-anatomy.spec.ts",
   "test_function": "FLOW-GEND-08-family-card-anatomy",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview + Chromium (3 projects) over the real dataset",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": null,
   "scenario": {
    "primary": false,
    "test_tier": "e2e",
    "verification_service": "real preview + dataset-equality oracle over card fields",
    "negative_control": {
     "would_fail_if": [
      "static shell \u2014 title-only markup, 0 chips/badges",
      "hand-written list \u2014 description oracles copied as strings",
      "empty dataset \u2014 count collapses to 0",
      "mock \u2014 verdict vs fixture enum, not the two exact strings"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_dataset",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "enumerate all cards",
        "read title/description/chip/badge",
        "diff vs dataset field or computed clamp",
        "assert cards_with_all_fields === 39"
       ]
      },
      "end_state": {
       "must_observe": [
        "cards_with_all_fields == 39",
        "every description length 1..120, dataset-equal or clamped with '\u2026'",
        "exactly 1 chip per card",
        "badge text exactly 'runs in Expo Go' or 'requires a dev client' on all 39"
       ],
       "must_not_observe": [
        "a 0-char description",
        "a card with 0 chips",
        "a blank '' or placeholder badge"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "description": "GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-07 locked run_cmd executes THEN it exits non-zero under all three projects (attempt lines for chromium-desktop, chromium-mobile, chromium-nojs) and verbatim output lands at .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-07-components-page-39-in-7-families-red.txt",
   "primary": false,
   "flow_ref": "FLOW-GEND-07-components-page-39-in-7-families",
   "test_file": "tests/sprint-03-family-browse/components-family-grid.spec.ts",
   "test_function": "FLOW-GEND-07-components-page-39-in-7-families",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview at sprint-start state + Chromium",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": null,
   "scenario": {
    "primary": false,
    "test_tier": "e2e",
    "verification_service": "real preview at sprint-start HEAD",
    "negative_control": {
     "would_fail_if": [
      "oracle passes against the lean list (9 sections/0 cards satisfy it)",
      "red proof paraphrased, not captured output",
      "run_cmd broadened to skip the failing test"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_lean_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd at sprint start",
        "capture verbatim output to the locked -red.txt",
        "read per-project attempt lines"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 1",
        "failure diff names expected 7 sections / received 9; expected 39 cards / received 0",
        "red.txt exists with >0 bytes at the locked path",
        "attempt lines for all 3 projects: chromium-desktop, chromium-mobile, chromium-nojs (3 of 3)"
       ],
       "must_not_observe": [
        "exit 0 at RED",
        "a 0-byte or absent -red.txt",
        "0 attempt lines for chromium-nojs (skip signature)"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "description": "GIVEN the sprint-start lean-list surface WHEN the FLOW-GEND-08 locked run_cmd executes THEN it exits non-zero with verbatim output at .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy-red.txt and the spec's evidence writer targets the locked artifact FLOW-GEND-08-family-card-anatomy.json",
   "primary": false,
   "flow_ref": "FLOW-GEND-08-family-card-anatomy",
   "test_file": "tests/sprint-03-family-browse/card-anatomy.spec.ts",
   "test_function": "FLOW-GEND-08-family-card-anatomy",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "test_tier": "e2e",
   "verification_service": "real Astro build + astro preview at sprint-start state + Chromium",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "unit_test_justified": null,
   "scenario": {
    "primary": false,
    "test_tier": "e2e",
    "verification_service": "real preview at sprint-start HEAD",
    "negative_control": {
     "would_fail_if": [
      "anatomy spec passes against 0 cards (vacuous loop)",
      "red proof summarized, not verbatim",
      "writer targets a path other than the locked artifact"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "built_preview_lean_start",
      "action": {
       "actor": "e2e_runner",
       "steps": [
        "run the locked run_cmd at sprint start",
        "capture verbatim output to the locked -red.txt",
        "inspect the writer's artifact path"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 1",
        "failure diff names cards_with_all_fields expected 39 / received 0",
        "red.txt exists with >0 bytes at the locked path",
        "writer references the exact locked path .tmp/sprint-03-family-browse/e2e-evidence/FLOW-GEND-08-family-card-anatomy.json (1 reference)"
       ],
       "must_not_observe": [
        "exit 0 at RED",
        "a 0-byte or absent -red.txt",
        "evidence written to 0 of the 2 locked artifact paths"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "description": "The FLOW-GEND-07 run_cmd selects exactly the authored spec + grep token, byte-for-byte the locked command.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "type": "happy_path"
  },
  {
   "id": "TC-2",
   "description": "Every expectation derives at module scope from src/data via the ENOENT-bridged readJson pattern.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "type": "edge_case"
  },
  {
   "id": "TC-3",
   "description": "Description assertions accept exactly the dataset field or its clamp + ellipsis; badge assertions accept exactly the two verdict strings.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "type": "edge_case"
  },
  {
   "id": "TC-4",
   "description": "FLOW-GEND-07 run_cmd exits non-zero under all three projects with verbatim proof at the locked path.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/components-family-grid.spec.ts --grep FLOW-GEND-07-components-page-39-in-7-families",
   "type": "error_handling"
  },
  {
   "id": "TC-5",
   "description": "FLOW-GEND-08 run_cmd exits non-zero with verbatim proof + writer targeting its locked artifact JSON.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm playwright test tests/sprint-03-family-browse/card-anatomy.spec.ts --grep FLOW-GEND-08-family-card-anatomy",
   "type": "error_handling"
  }
 ]
}
-->

</details>
