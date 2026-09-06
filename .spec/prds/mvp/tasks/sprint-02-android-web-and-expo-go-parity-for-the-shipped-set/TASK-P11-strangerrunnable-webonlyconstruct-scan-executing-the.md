# TASK-P11: Stranger-runnable web-only-construct scan executing the styling contract, with the missing DOM/iframe/hover checks added to it


> Task ID: TASK-P11  
> Sprint: [sprint-02](./SPRINT.md)  
> Agent: `react-native-reusables-implementer`  
> Points: 3  
> Type: FEATURE  
> Wave: B  
> Status: ⬜ Pending  
> Proposed By: `react-native-reusables-planner`  
> Depends On: none  
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes

## Outcome

A stranger runs one vitest command and gets a per-category zero-hit proof over the real trees, executed from the styling contract itself, with the checker's ability to fail demonstrated in the same run.

## Critical Constraints



## Specification

**Objective:** Deliver tests/sprint-02/web-constructs.test.ts plus the widened contract. The suite hosts exactly one describe named `UC-REG-02/edge-no-web-only-construct-anywhere` containing: (1) the real scan — execute the contract's forbiddenPatterns (mode content) against packages/registry/src/**/*.{ts,tsx} and the file contents embedded in both public/r/{nativewind,uniwind} trees, aggregate per-category counts (DOM elements, iframes, hover-without-active, raw lucide JSX — the last already a contract pattern), assert 0 hits AND assert the scanned lists are non-empty; (2) the self-proof case `implanted <div> is caught` — in-memory samples each carrying one violation, each must be flagged; (3) golden emission to design/goldens/sprint-02/registry/web-constructs-scan.json. The contract edit adds three forbiddenPatterns entries with rationales in the file's established voice. RED evidence: delete one contract pattern, run the locked command, capture the failure to design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log, revert, re-run green. The human half of the flow (gate step 18: click-not-hover, keyboard-reachable controls in Chrome) belongs to TASK-P2/P4, not this suite.

**Success state:** 

## Acceptance Criteria

### AC-1: AC-1 [PRIMARY]

**GIVEN** the 56 committed registry sources under packages/registry/src and both emitted engine trees under public/r/{nativewind,uniwind}  
**WHEN:** pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere" runs at the repository root  
**THEN:** the scan over all three trees reports 0 hits in every category with per-category counts, asserted against a non-empty scanned-file list

- **FLOW_REF:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **TEST_TIER:** integration
- **VERIFICATION_SERVICE:** the real committed registry source and both emitted engine trees via Vitest
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/web-constructs.test.ts`
- **TEST_FUNCTION:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **VERIFY:** `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"`

**SCENARIO:**
```json
{
 "primary": true,
 "tier": "visible",
 "test_tier": "integration",
 "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the guard is removed and a DOM element, iframe, hover-only class or browser-global reference ships silently into a universal component",
   "the check is downgraded to a warning and a hit prints without failing the run",
   "static"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "shipped_source_tree",
   "action": {
    "actor": "developer",
    "steps": [
     "run the locked vitest command at the repository root",
     "read the per-category summary line",
     "read the scanned-file count the suite asserts"
    ]
   },
   "end_state": {
    "must_observe": [
     "exit code 0",
     "the literal line `0 hits — DOM elements: 0, iframes: 0, hover-without-active: 0, raw lucide JSX: 0`",
     "a scanned-file count covering the 56 sources plus both emitted public/r trees (112 per-item json files across public/r/{nativewind,uniwind}), asserted non-empty by the suite itself"
    ],
    "must_not_observe": [
     "a hit count above 0",
     "the empty/start signature — any tree reporting `0 scanned files`, or the run summary collapsing to `Tests 0` — standing in for a real scan",
     "a category with no reported count"
    ]
   }
  }
 ]
}
```

### AC-2: AC-2

**GIVEN** design/research/styling/rnr-dual-engine-registry.md as the single source of scan rules  
**WHEN:** the three missing patterns are added to the contract's checks block — DOM JSX elements (<div, <span, <iframe, <a), hover: utility without an active: twin on the same className, and document./window. browser globals — and the test loads them  
**THEN:** the test parses the fenced checks block out of the contract markdown with the same last-parseable-json-block logic as scripts/check-contract.ts and executes it — one source of rules, zero inline duplicates — and check-contract.ts stays green against the widened contract

- **FLOW_REF:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **TEST_TIER:** integration
- **VERIFICATION_SERVICE:** the real committed registry source and both emitted engine trees via Vitest
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/web-constructs.test.ts`
- **TEST_FUNCTION:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **VERIFY:** `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "integration",
 "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the test carries its own inline copy of the regexes, which is the second-copy drift the contract-execution model exists to kill",
   "a new pattern is added to the test instead of the contract, so scripts/check-contract.ts never enforces it",
   "static"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "contract_with_three_new_patterns",
   "action": {
    "actor": "developer",
    "steps": [
     "run the locked vitest command",
     "run `pnpm exec tsx scripts/check-contract.ts`",
     "count the forbiddenPatterns ids in the contract's checks block"
    ]
   },
   "end_state": {
    "must_observe": [
     "3 new forbiddenPatterns ids in design/research/styling/rnr-dual-engine-registry.md covering DOM JSX elements (including iframes), hover-without-active on the same className, and document./window. browser globals",
     "check-contract.ts printing `contract OK` against the same widened contract",
     "forbiddenPatterns count in the contract's checks block: 3 new ids on top of the 10 existing — 13 total — and the pattern count executed by the vitest suite matches the contract, with 0 web-construct regexes defined inside tests/sprint-02/web-constructs.test.ts"
    ],
    "must_not_observe": [
     "a duplicate pattern defined in both the contract and the test",
     "a contract edit that turns check-contract.ts red against the real trees",
     "a pattern scoped to one engine's tree only"
    ]
   }
  }
 ]
}
```

### AC-3: AC-3

**GIVEN** in-memory samples planted with one violation of each category — a DOM element, an iframe, a hover-only class, and a raw lucide JSX tag  
**WHEN:** the self-proof case `implanted <div> is caught` runs inside the same describe  
**THEN:** each implanted violation is flagged by the contract-executed checker — proving the scan has been seen to fail before its zero-hit result is believed

- **FLOW_REF:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **TEST_TIER:** integration
- **VERIFICATION_SERVICE:** the real committed registry source and both emitted engine trees via Vitest
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/web-constructs.test.ts`
- **TEST_FUNCTION:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **VERIFY:** `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "integration",
 "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the self-proof case is removed and a scan that has never been seen to fail reports 0 hits",
   "an implanted violation is not flagged, meaning the regex cannot catch the real thing",
   "static"
  ]
 },
 "evidence": {
  "artifact_type": "stdout",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "implanted_samples",
   "action": {
    "actor": "developer",
    "steps": [
     "run the locked vitest command",
     "read the self-proof result named `implanted <div> is caught`"
    ]
   },
   "end_state": {
    "must_observe": [
     "`implanted <div> is caught` passing in the output",
     "4 implanted samples flagged — 1 <div> JSX element, 1 <iframe>, 1 hover:-only className, 1 raw lucide JSX tag — each sample carrying exactly 1 violation",
     "the flags produced by the same contract-loaded patterns that scan the real trees — 0 web-construct regexes authored inside the test file"
    ],
    "must_not_observe": [
     "a suite with no self-proof case passing",
     "an implanted violation passing unflagged",
     "self-proof checks using a separate code path from the real scan"
    ]
   }
  }
 ]
}
```

### AC-4: AC-4

**GIVEN** a passing zero-hit run over the three real trees  
**WHEN:** the suite finishes  
**THEN:** the golden design/goldens/sprint-02/registry/web-constructs-scan.json is written and committed with per-category counts, the scanned-file totals per tree, and the contract's pattern-id list it executed

- **FLOW_REF:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **TEST_TIER:** integration
- **VERIFICATION_SERVICE:** the real committed registry source and both emitted engine trees via Vitest
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/web-constructs.test.ts`
- **TEST_FUNCTION:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **VERIFY:** `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "integration",
 "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the golden omits the scanned-file counts, letting a future empty walk look identical to a clean scan",
   "the golden is hand-edited rather than emitted by the run",
   "static"
  ]
 },
 "evidence": {
  "artifact_type": "file_artifact",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "shipped_source_tree",
   "action": {
    "actor": "developer",
    "steps": [
     "run the locked vitest command",
     "cat design/goldens/sprint-02/registry/web-constructs-scan.json"
    ]
   },
   "end_state": {
    "must_observe": [
     "per-category counts all 0: DOM elements, iframes, hover-without-active, raw lucide JSX",
     "scanned-file totals ≥ 1 per tree in design/goldens/sprint-02/registry/web-constructs-scan.json — the 56 registry sources plus 112 per-item json files across public/r/{nativewind,uniwind} (56 items x 2 engines)",
     "the executed pattern-id list in the golden matching the contract's checks block — 13 forbiddenPatterns ids, including the 3 new ones"
    ],
    "must_not_observe": [
     "a missing category count",
     "a scanned-file total of 0 for any tree",
     "pattern ids that do not exist in the contract"
    ]
   }
  }
 ]
}
```

### AC-5: AC-5

**GIVEN** a deliberate mutation that removes one web-construct pattern from the contract's checks block  
**WHEN:** the locked vitest command is run with the pattern removed and its output captured, then the mutation is reverted and the command re-run  
**THEN:** the suite goes RED under the mutation — proving the contract→test wiring is live — the RED log is committed at design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log, and the identical command exits 0 after the revert

- **FLOW_REF:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **TEST_TIER:** integration
- **VERIFICATION_SERVICE:** the real committed registry source and both emitted engine trees via Vitest
- **SURFACE_POLICY:** `.spec/e2e-policy/surface.json`
- **TDD_STATE:** none
- **TEST_FILE:** `tests/sprint-02/web-constructs.test.ts`
- **TEST_FUNCTION:** `UC-REG-02/edge-no-web-only-construct-anywhere`
- **VERIFY:** `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"`

**SCENARIO:**
```json
{
 "primary": false,
 "tier": "visible",
 "test_tier": "integration",
 "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
 "topology": "single-node",
 "negative_control": {
  "would_fail_if": [
   "the RED log is written by hand rather than captured from a real failing run of the locked command",
   "the mutation is never reverted, leaving the contract weakened and the evidence stale",
   "static"
  ]
 },
 "evidence": {
  "artifact_type": "file_artifact",
  "required_capture": true
 },
 "cases": [
  {
   "start_ref": "contract_pattern_removed",
   "action": {
    "actor": "developer",
    "steps": [
     "temporarily delete one web-construct pattern from the contract's checks block",
     "run the locked vitest command, redirecting output to design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log",
     "revert the contract and re-run the same command"
    ]
   },
   "end_state": {
    "must_observe": [
     "exit code 1 under the mutation with ≥ 1 failed test — the `implanted <div> is caught` case or the executed-pattern count (13) going red, proving the suite executes the contract live",
     "the committed RED log non-empty and produced by the locked command — at least 1 line (`wc -l design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log` ≥ 1)",
     "exit 0 from the identical command after the revert"
    ],
    "must_not_observe": [
     "an empty RED log",
     "a green run under the removed pattern",
     "a RED log captured from a different command than the locked run_cmd"
    ]
   }
  }
 ]
}
```


## Test Criteria

| ID | Criterion (boolean) | Maps to | Type |
|---|---|---|---|
| TC-1 | the locked vitest command exits 0 with the literal summary `0 hits — DOM elements: 0, iframes: 0, hover-without-active: 0, raw lucide JSX: 0`, asserted against a non-empty scanned-file list covering the 56 sources and both emitted trees | AC-1 |  |
| TC-2 | the test parses the contract's checks block with the same logic as scripts/check-contract.ts and executes it, with zero web-construct regexes inline, after the three patterns (DOM JSX incl. iframe, hover-without-active on the same className, document./window.) are added to the contract | AC-2 |  |
| TC-3 | the `implanted <div> is caught` self-proof plants a DOM element, an iframe, a hover-only class and a raw lucide JSX tag in in-memory samples and asserts each is flagged by the same contract-loaded patterns | AC-3 |  |
| TC-4 | design/goldens/sprint-02/registry/web-constructs-scan.json is emitted with per-category zero counts, non-zero per-tree scanned-file totals, and the executed pattern ids | AC-4 |  |
| TC-5 | removing one contract pattern makes the locked command fail, the captured RED log is committed at the locked red_proof path, and the revert restores green | AC-5 |  |

## Verification Gates

| Gate | Command | Expected |
|---|---|---|
| UC-REG-02/edge-no-web-only-construct-anywhere | `pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t "UC-REG-02/edge-no-web-only-construct-anywhere"` | 0 hits across all categories + implanted-violation self-proof passing |

## Reading List

- `scripts/check-contract.ts (PRIMARY PATTERN — the contract-execution model)` (full) — 
- `design/research/styling/rnr-dual-engine-registry.md` (full) — 
- `tests/build-registry.test.ts` (full) — 
- `.spec/prds/mvp/tasks/sprint-01-installed-app-cold-boots-on-both-platforms/TASK-F8-stand-up-maestro-with-a-cold-boot-flow-on-both-platforms-and.md` (full) — 
- `AGENTS.md` (full) — 

## Guardrails

**WRITE-ALLOWED**
- `tests/sprint-02/web-constructs.test.ts (NEW)`
- `design/research/styling/rnr-dual-engine-registry.md (MODIFY)`
- `design/goldens/sprint-02/registry/web-constructs-scan.json (NEW)`
- `design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log (NEW)`

**WRITE-PROHIBITED**
- `packages/registry/src/**`
- `packages/registry/registry.json`
- `public/r/**`
- `scripts/check-contract.ts`
- `apps/**`

## Fixtures

- **`shipped_source_tree`** (public_api) — the 56 committed sources under packages/registry/src plus both emitted engine trees under public/r/{nativewind,uniwind} at sprint-02 entry
- **`contract_with_three_new_patterns`** (cli) — design/research/styling/rnr-dual-engine-registry.md with the DOM-JSX, hover-without-active and document./window. checks added to its checks block
- **`implanted_samples`** (public_api) — programmatically constructed sample strings fed to the contract-executed checker through its public scan API — planting a <div> JSX element, an <iframe>, a hover:-only className, and a raw lucide JSX tag
- **`contract_pattern_removed`** (cli) — the contract with one web-construct pattern temporarily deleted for RED capture, reverted immediately after

## Design

**Pattern:** contract-as-data: parse the authoritative document's checks block and execute it — editing the contract changes the gate, and there is no second copy of the rules to drift
**Pattern source:** `scripts/check-contract.ts:23-40 (loadChecks) and :57-77 (forbiddenPatterns execution)`

## Dependencies

- **Depends on:** none
- **Blocks:** none
- **Human test hook:** SPRINT.md gate step 12 — a stranger runs the locked vitest command and reads the `0 hits — …` summary plus the `implanted <div> is caught` self-proof; step 18's click-not-hover/keyboard checks in Chrome are the human half, owned by TASK-P2/P4.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "TASK-P11",
 "task_type": "FEATURE",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "shipped_source_tree": {
   "description": "the 56 committed sources under packages/registry/src plus both emitted engine trees under public/r/{nativewind,uniwind} at sprint-02 entry",
   "seed_method": "public_api",
   "records": [
    "packages/registry/registry.json lists 56 items",
    "112 per-item json files across public/r/{nativewind,uniwind}"
   ]
  },
  "contract_with_three_new_patterns": {
   "description": "design/research/styling/rnr-dual-engine-registry.md with the DOM-JSX, hover-without-active and document./window. checks added to its checks block",
   "seed_method": "cli",
   "records": [
    "checks block still parses via the last-parseable-json-block rule",
    "forbiddenPatterns grew by exactly 3 ids (10 existing + 3 new = 13 total)",
    "pnpm exec tsx scripts/check-contract.ts still prints contract OK"
   ]
  },
  "implanted_samples": {
   "description": "programmatically constructed sample strings fed to the contract-executed checker through its public scan API — planting a <div> JSX element, an <iframe>, a hover:-only className, and a raw lucide JSX tag",
   "seed_method": "public_api",
   "records": [
    "4 samples, exactly one violation each",
    "each flagged by the contract-loaded patterns, not by test-local regexes"
   ]
  },
  "contract_pattern_removed": {
   "description": "the contract with one web-construct pattern temporarily deleted for RED capture, reverted immediately after",
   "seed_method": "cli",
   "records": [
    "the locked vitest command fails under the mutation",
    "the RED log captured from that failing run",
    "git status shows the contract restored after the revert"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "primary": true,
   "flow_ref": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "test_file": "tests/sprint-02/web-constructs.test.ts",
   "test_function": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "verify": "pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t \"UC-REG-02/edge-no-web-only-construct-anywhere\"",
   "test_tier": "integration",
   "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": true,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the guard is removed and a DOM element, iframe, hover-only class or browser-global reference ships silently into a universal component",
      "the check is downgraded to a warning and a hit prints without failing the run",
      "static"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "shipped_source_tree",
      "action": {
       "actor": "developer",
       "steps": [
        "run the locked vitest command at the repository root",
        "read the per-category summary line",
        "read the scanned-file count the suite asserts"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 0",
        "the literal line `0 hits — DOM elements: 0, iframes: 0, hover-without-active: 0, raw lucide JSX: 0`",
        "a scanned-file count covering the 56 sources plus both emitted public/r trees (112 per-item json files across public/r/{nativewind,uniwind}), asserted non-empty by the suite itself"
       ],
       "must_not_observe": [
        "a hit count above 0",
        "the empty/start signature — any tree reporting `0 scanned files`, or the run summary collapsing to `Tests 0` — standing in for a real scan",
        "a category with no reported count"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "GIVEN the 56 committed registry sources under packages/registry/src and both emitted engine trees under public/r/{nativewind,uniwind} WHEN pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t \"UC-REG-02/edge-no-web-only-construct-anywhere\" runs at the repository root THEN the scan over all three trees reports 0 hits in every category with per-category counts, asserted against a non-empty scanned-file list",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "primary": false,
   "flow_ref": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "test_file": "tests/sprint-02/web-constructs.test.ts",
   "test_function": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "verify": "pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t \"UC-REG-02/edge-no-web-only-construct-anywhere\"",
   "test_tier": "integration",
   "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the test carries its own inline copy of the regexes, which is the second-copy drift the contract-execution model exists to kill",
      "a new pattern is added to the test instead of the contract, so scripts/check-contract.ts never enforces it",
      "static"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "contract_with_three_new_patterns",
      "action": {
       "actor": "developer",
       "steps": [
        "run the locked vitest command",
        "run `pnpm exec tsx scripts/check-contract.ts`",
        "count the forbiddenPatterns ids in the contract's checks block"
       ]
      },
      "end_state": {
       "must_observe": [
        "3 new forbiddenPatterns ids in design/research/styling/rnr-dual-engine-registry.md covering DOM JSX elements (including iframes), hover-without-active on the same className, and document./window. browser globals",
        "check-contract.ts printing `contract OK` against the same widened contract",
        "forbiddenPatterns count in the contract's checks block: 3 new ids on top of the 10 existing — 13 total — and the pattern count executed by the vitest suite matches the contract, with 0 web-construct regexes defined inside tests/sprint-02/web-constructs.test.ts"
       ],
       "must_not_observe": [
        "a duplicate pattern defined in both the contract and the test",
        "a contract edit that turns check-contract.ts red against the real trees",
        "a pattern scoped to one engine's tree only"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "GIVEN design/research/styling/rnr-dual-engine-registry.md as the single source of scan rules WHEN the three missing patterns are added to the contract's checks block — DOM JSX elements (<div, <span, <iframe, <a), hover: utility without an active: twin on the same className, and document./window. browser globals — and the test loads them THEN the test parses the fenced checks block out of the contract markdown with the same last-parseable-json-block logic as scripts/check-contract.ts and executes it — one source of rules, zero inline duplicates — and check-contract.ts stays green against the widened contract",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "primary": false,
   "flow_ref": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "test_file": "tests/sprint-02/web-constructs.test.ts",
   "test_function": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "verify": "pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t \"UC-REG-02/edge-no-web-only-construct-anywhere\"",
   "test_tier": "integration",
   "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the self-proof case is removed and a scan that has never been seen to fail reports 0 hits",
      "an implanted violation is not flagged, meaning the regex cannot catch the real thing",
      "static"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "implanted_samples",
      "action": {
       "actor": "developer",
       "steps": [
        "run the locked vitest command",
        "read the self-proof result named `implanted <div> is caught`"
       ]
      },
      "end_state": {
       "must_observe": [
        "`implanted <div> is caught` passing in the output",
        "4 implanted samples flagged — 1 <div> JSX element, 1 <iframe>, 1 hover:-only className, 1 raw lucide JSX tag — each sample carrying exactly 1 violation",
        "the flags produced by the same contract-loaded patterns that scan the real trees — 0 web-construct regexes authored inside the test file"
       ],
       "must_not_observe": [
        "a suite with no self-proof case passing",
        "an implanted violation passing unflagged",
        "self-proof checks using a separate code path from the real scan"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "GIVEN in-memory samples planted with one violation of each category — a DOM element, an iframe, a hover-only class, and a raw lucide JSX tag WHEN the self-proof case `implanted <div> is caught` runs inside the same describe THEN each implanted violation is flagged by the contract-executed checker — proving the scan has been seen to fail before its zero-hit result is believed",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "primary": false,
   "flow_ref": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "test_file": "tests/sprint-02/web-constructs.test.ts",
   "test_function": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "verify": "pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t \"UC-REG-02/edge-no-web-only-construct-anywhere\"",
   "test_tier": "integration",
   "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the golden omits the scanned-file counts, letting a future empty walk look identical to a clean scan",
      "the golden is hand-edited rather than emitted by the run",
      "static"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "shipped_source_tree",
      "action": {
       "actor": "developer",
       "steps": [
        "run the locked vitest command",
        "cat design/goldens/sprint-02/registry/web-constructs-scan.json"
       ]
      },
      "end_state": {
       "must_observe": [
        "per-category counts all 0: DOM elements, iframes, hover-without-active, raw lucide JSX",
        "scanned-file totals ≥ 1 per tree in design/goldens/sprint-02/registry/web-constructs-scan.json — the 56 registry sources plus 112 per-item json files across public/r/{nativewind,uniwind} (56 items x 2 engines)",
        "the executed pattern-id list in the golden matching the contract's checks block — 13 forbiddenPatterns ids, including the 3 new ones"
       ],
       "must_not_observe": [
        "a missing category count",
        "a scanned-file total of 0 for any tree",
        "pattern ids that do not exist in the contract"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "GIVEN a passing zero-hit run over the three real trees WHEN the suite finishes THEN the golden design/goldens/sprint-02/registry/web-constructs-scan.json is written and committed with per-category counts, the scanned-file totals per tree, and the contract's pattern-id list it executed",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "primary": false,
   "flow_ref": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "test_file": "tests/sprint-02/web-constructs.test.ts",
   "test_function": "UC-REG-02/edge-no-web-only-construct-anywhere",
   "verify": "pnpm exec vitest run tests/sprint-02/web-constructs.test.ts -t \"UC-REG-02/edge-no-web-only-construct-anywhere\"",
   "test_tier": "integration",
   "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
   "surface_policy": ".spec/e2e-policy/surface.json",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "integration",
    "verification_service": "the real committed registry source and both emitted engine trees via Vitest",
    "topology": "single-node",
    "negative_control": {
     "would_fail_if": [
      "the RED log is written by hand rather than captured from a real failing run of the locked command",
      "the mutation is never reverted, leaving the contract weakened and the evidence stale",
      "static"
     ]
    },
    "evidence": {
     "artifact_type": "file_artifact",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "contract_pattern_removed",
      "action": {
       "actor": "developer",
       "steps": [
        "temporarily delete one web-construct pattern from the contract's checks block",
        "run the locked vitest command, redirecting output to design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log",
        "revert the contract and re-run the same command"
       ]
      },
      "end_state": {
       "must_observe": [
        "exit code 1 under the mutation with ≥ 1 failed test — the `implanted <div> is caught` case or the executed-pattern count (13) going red, proving the suite executes the contract live",
        "the committed RED log non-empty and produced by the locked command — at least 1 line (`wc -l design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log` ≥ 1)",
        "exit 0 from the identical command after the revert"
       ],
       "must_not_observe": [
        "an empty RED log",
        "a green run under the removed pattern",
        "a RED log captured from a different command than the locked run_cmd"
       ]
      }
     }
    ]
   },
   "type": "acceptance_criterion",
   "description": "GIVEN a deliberate mutation that removes one web-construct pattern from the contract's checks block WHEN the locked vitest command is run with the pattern removed and its output captured, then the mutation is reverted and the command re-run THEN the suite goes RED under the mutation — proving the contract→test wiring is live — the RED log is committed at design/goldens/sprint-02/registry/web-constructs-scan.json.RED.log, and the identical command exits 0 after the revert",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_case",
   "description": "the locked vitest command exits 0 with the literal summary `0 hits — DOM elements: 0, iframes: 0, hover-without-active: 0, raw lucide JSX: 0`, asserted against a non-empty scanned-file list covering the 56 sources and both emitted trees",
   "maps_to_ac": "AC-1",
   "verify": null
  },
  {
   "id": "TC-2",
   "type": "test_case",
   "description": "the test parses the contract's checks block with the same logic as scripts/check-contract.ts and executes it, with zero web-construct regexes inline, after the three patterns (DOM JSX incl. iframe, hover-without-active on the same className, document./window.) are added to the contract",
   "maps_to_ac": "AC-2",
   "verify": null
  },
  {
   "id": "TC-3",
   "type": "test_case",
   "description": "the `implanted <div> is caught` self-proof plants a DOM element, an iframe, a hover-only class and a raw lucide JSX tag in in-memory samples and asserts each is flagged by the same contract-loaded patterns",
   "maps_to_ac": "AC-3",
   "verify": null
  },
  {
   "id": "TC-4",
   "type": "test_case",
   "description": "design/goldens/sprint-02/registry/web-constructs-scan.json is emitted with per-category zero counts, non-zero per-tree scanned-file totals, and the executed pattern ids",
   "maps_to_ac": "AC-4",
   "verify": null
  },
  {
   "id": "TC-5",
   "type": "test_case",
   "description": "removing one contract pattern makes the locked command fail, the captured RED log is committed at the locked red_proof path, and the revert restores green",
   "maps_to_ac": "AC-5",
   "verify": null
  }
 ]
}
-->
