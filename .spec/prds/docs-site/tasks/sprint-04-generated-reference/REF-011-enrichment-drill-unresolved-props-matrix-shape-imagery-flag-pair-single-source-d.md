<!-- Version: TASK-TEMPLATE v5.2 · sprint-04-generated-reference -->

# REF-011: Enrichment drill — unresolved props, matrix shape, imagery-flag pair, single-source derivation (T-GEND-026)

> Status: ⬜ Pending
> Assignee: react-native-reusables-implementer (implementer) · react-native-reusables-reviewer (reviewer)
> Priority: P1 · Points: 5 · Type: FEATURE · Wave: D
> Proposed By: react-native-reusables-planner · TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md) · proposed 2026-09-12 · HEAD 6a4d16d

## What this does
Author scripts/docs-data/drill-enrichment.ts — the four-arm enrichment drill that mutates REAL fixtures (an unresolved props type in shimmer's source, the streamdown dev-client-matrix entry, an imagery-bearing fixture, one conversation source edit), proves each fail-closed gate fires naming the item and that the props table and Code view derive from the single source, then byte-exact-restores everything in finally — plus the vitest lane test that spawns the drill and asserts its JSON report.

## Why
The drill subprocess exits 0 over the real tree with expectationsHeld true; its JSON report's arms[] array carries 4 spawn records with anchored exit codes (arm (a) mutated 1 / restored 0; imagery ON !== 0 / default 0), sha256 before==after for every mutated path, and the derivation arm's dist carrying the props-table row and Code-view text together only in the mutated build; the tree is byte-identical and git-clean over the mutated paths afterward.

## How to verify
pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report

## Scope
scripts/docs-data/drill-enrichment.ts (NEW); tests/sprint-04-generated-reference/enrichment-drill.test.ts (NEW); vitest.config.ts (MODIFY)

<details>
<summary>▸ Full agent specification (REF-011 — required reading for implementer + reviewer)</summary>

TASK: REF-011 — Enrichment drill — unresolved props, matrix shape, imagery-flag pair, single-source derivation (T-GEND-026)
TASK_TYPE: FEATURE · STATUS: Backlog · PRIORITY: P1 · POINTS: 5
AGENT: implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer

RUNTIME_COMMANDS:
  test:      pnpm playwright test <file> --grep <TOKEN> | pnpm exec vitest run <file> -t <TOKEN>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

PROGRESS: 0/5 ACs


### 🚫 CRITICAL CONSTRAINTS (Never tier — read before acting)

- MUST: Capture every mutated path pre-mutation (bytes + sha256) and byte-exact-restore it inside a finally block, re-running the real build so dist matches the restored tree — the restore runs even when expectations fail
- MUST: The JSON report exposes an arms[] array of 4 spawn records, each with an integer exitCode field for its mutated and restored runs, plus before/after sha256 for every mutated path and an expectationsHeld aggregate; the drill exits 0 only when every arm held
- MUST: Capture gate expectations from the CLEAN pre-mutation tree (the drill-item-count.ts law) — never from the mutated source
- MUST: Pin the drill items: arm (a) mutates packages/registry/src/components/ai/shimmer.tsx (FUSE-04 drill precedent); arm (b) corrupts the streamdown matrix entry; arm (d) edits the conversation source (a registry:component with a non-empty props table — the human gate's named page)
- NEVER: Never weaken, skip, or branch around gate logic — gates.ts and prebuild.ts are REF-008's; this task writes only the drill, its lane test, and the vitest.config.ts comment
- NEVER: Never leave the tree mutated — the finally restore runs on every path including expectation failure
- NEVER: Never assert on a synthetic copy of the tree — mutations land on the real files the gates and builds actually read
- STRICTLY: Strictly SCOPE write_allowed: drill-enrichment.ts (NEW), enrichment-drill.test.ts (NEW), vitest.config.ts (MODIFY — serialization-note extension only, no behavioral config change)
- STRICTLY: Serialized execution rides the existing fileParallelism:false; extend its comment to name drill-enrichment.ts so the mutation windows stay invisible to other lane files
- STRICTLY: The lane test sets per-test timeouts >= 600_000ms on drill-spawning tests (two real docs builds; the count-drill precedent budgets 300_000 for one registry build + gates)

### DONE WHEN

- [ ] AC 1: Drill runs as a real subprocess and reports honestly
- [ ] AC 2: Unresolved props type fails the props gate naming shimmer, then restores
- [ ] AC 3: Corrupted matrix entry fails the matrix gate naming streamdown
- [ ] AC 4: Imagery-flag pair — ON fails naming the item, default passes
- [ ] AC 5: Single-source derivation — one source edit moves props table and Code view together (T-GEND-026)
- [ ] `pnpm typecheck` clean + `./node_modules/.bin/biome ci <paths>` clean
- [ ] Only SCOPE.writeAllowed files modified (git diff --name-only)

### ACCEPTANCE CRITERIA (TDD beads — happy-path first)

**AC-1: Drill runs as a real subprocess and reports honestly**

  GIVEN/WHEN/THEN: the repo with REF-008's gates, REF-009's template, and REF-007's matrix landed and (RED at start) no drill-enrichment.ts the lane test spawns the drill via node_modules/.bin/tsx over the real tree the drill exits 0 and prints a parseable JSON report whose expectationsHeld is true, whose arms[] array carries 4 spawn records each with an integer exitCode field for mutated and restored runs (arm (a) mutated === 1 and restored === 0; imagery ON !== 0 while default === 0), and before/after sha256 pairs for every mutated path

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/enrichment-drill.test.ts · TEST_FUNCTION: REF-011-drill-report
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report`
  VERIFICATION_SERVICE: real tsx subprocess of drill-enrichment.ts over the real working tree; JSON report parsed under vitest · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: The drill IS the real-service verification — real tsx subprocesses spawning the real gate CLI and real pnpm builds over the real tree with byte-exact restores; 'unit' names only the vitest runner, per the landed enrichment-gates.test.ts drill precedent.
  SCENARIO:
    - START_REF real_registry_tree → MUST_OBSERVE [drill subprocess exit code 0; report.expectationsHeld === true; the report's arms[] array carries 4 spawn records each with an integer exitCode field; arm (a) mutated exitCode === 1 and restored exitCode === 0; imagery arm ON !== 0 while default === 0 (anchored integer comparisons, 4 arms); the report names >=4 mutated paths, each carrying a before/after sha256 pair with before === after] / MUST_NOT_OBSERVE [0 mocked or synthetic fixture paths — every mutated path is a real repo file; 0 arms skipped or conditionally disabled (arms.length === 4); 0 report fields asserting success without a captured real run output]
    - NEGATIVE_CONTROL: would fail if ['an arm is stubbed to report success without running the real gate — the arms[] anchored exit-code comparisons diverge from real gate behavior', 'the restore is dropped on failure — the sha256 before/after pairs diverge and expectationsHeld is false', 'the drill fabricates the report instead of spawning real processes — the arms[] exit codes and captured outputs cannot reproduce']

**AC-2: Unresolved props type fails the props gate naming shimmer, then restores**

  GIVEN/WHEN/THEN: a clean-tree expectation captured pre-mutation and the real shimmer source the drill injects a prop typed with an unresolved type into packages/registry/src/components/ai/shimmer.tsx and runs the real gates CLI the mutated run exits 1 with the pinned '[docs-data] props: item "shimmer"' unresolved-type shape naming shimmer, and the finally block byte-exact-restores the source after which the restored run exits 0

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/enrichment-drill.test.ts · TEST_FUNCTION: REF-011-unresolved-props-drill
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-unresolved-props-drill`
  VERIFICATION_SERVICE: real gates CLI subprocess over the mutated-then-restored real tree · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Real mutation of the real source file plus a real gates-CLI subprocess — the vitest runner only parses the report; same drill precedent as the landed count drill.
  SCENARIO:
    - START_REF real_registry_tree → MUST_OBSERVE [mutated gates run exit code 1; output matches /\[docs-data\] props: item "shimmer".*unresolved type/; shimmer.tsx sha256 before === after restore; restored gates run exit code 0 with the 56-of-56 names-match line] / MUST_NOT_OBSERVE [0 leftover mutation in packages/registry (git status --porcelain over the path is empty after the run); 0 changes to scripts/docs-data/gates.ts or prebuild.ts (drills prove gates, never weaken them); 0 synthetic copies of shimmer.tsx mutated in place of the real file]
    - NEGATIVE_CONTROL: would fail if ['the injected type resolves — the gate exits 0 and the exit-1 expectation fails', 'the restore misses trailing bytes — the shimmer.tsx sha256 pair diverges', "the drill edits a synthetic copy — the real file's git status stays clean and the assertion on the real path fails"]

**AC-3: Corrupted matrix entry fails the matrix gate naming streamdown**

  GIVEN/WHEN/THEN: REF-007's real dev-client-matrix.json and REF-008's matrix gate the drill corrupts the streamdown entry (blanking its peers[]) and runs the gates CLI, then restores the mutated run exits 1 naming streamdown in the violation line, dev-client-matrix.json is byte-identical after the finally restore, and the restored run exits 0

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/enrichment-drill.test.ts · TEST_FUNCTION: REF-011-matrix-drill
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-matrix-drill`
  VERIFICATION_SERVICE: real gates CLI subprocess over the mutated-then-restored real matrix file · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Real mutation of REF-007's authored data file plus a real gates-CLI subprocess; vitest parses the report only. The 'peers' being blanked are npm package fields in an authored JSON file — single-node data, no device topology.
  SCENARIO:
    - START_REF authored_matrix_dataset → MUST_OBSERVE [mutated run exit code 1 naming 'streamdown'; dev-client-matrix.json sha256 before === after restore; restored run exit code 0] / MUST_NOT_OBSERVE [0 leftover mutation in apps/docs/src/data after the run; 0 corruption applied to any entry other than streamdown (1 entry mutated); 0 gate-logic edits accommodating the corruption]
    - NEGATIVE_CONTROL: would fail if ['the matrix gate accepts an empty peers[] — the mutated run exits 0 and the exit-1 expectation fails', 'the violation omits the entry id — the naming assertion fails', 'the restore re-serializes instead of writing back the captured bytes — the sha256 pair diverges']

**AC-4: Imagery-flag pair — ON fails naming the item, default passes**

  GIVEN/WHEN/THEN: REF-008's imagery flag wired into the pipeline and a real fixture carrying injected imagery the drill runs the pipeline with the flag ON and again with the default (flag off) over the same mutated tree, then restores the flag-ON run exits non-zero with output naming the mutated item, the default run exits 0, and the fixture is byte-exact-restored

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/enrichment-drill.test.ts · TEST_FUNCTION: REF-011-imagery-flag-pair
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-imagery-flag-pair`
  VERIFICATION_SERVICE: real pipeline/gate subprocesses in both imagery-flag configurations over the real tree · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Real pipeline runs in both flag configurations over the real mutated tree; vitest parses the report only.
  SCENARIO:
    - START_REF real_registry_tree → MUST_OBSERVE [flag-ON run exit code !== 0 with the mutated item named in the output; default (flag-off) run exit code === 0; fixture sha256 before === after restore] / MUST_NOT_OBSERVE [0 runs where the ON and default exit codes are equal (the pair must differentiate); 0 leftover imagery in the tree after the run; 0 gate-logic edits accommodating the imagery]
    - NEGATIVE_CONTROL: would fail if ['the flag-ON run tolerates imagery — it exits 0 and the non-zero expectation fails', 'the flag changes default behavior — the default run exits non-zero and the pair assertion fails', 'the injected imagery carries no item attribution — the naming assertion fails']

**AC-5: Single-source derivation — one source edit moves props table and Code view together (T-GEND-026)**

  GIVEN/WHEN/THEN: the real conversation source and the docs build pipeline the drill adds one new optional prop to the conversation source, rebuilds dist, then restores and rebuilds the mutated dist HTML for /components/conversation contains BOTH the new prop name inside the props-table region AND the edited source text inside the Code-view region, the restored dist contains neither, and the source file's sha256 pairs match

  FLOW_REF: None · TEST_TIER: unit · TDD_STATE: none
  TEST_FILE: tests/sprint-04-generated-reference/enrichment-drill.test.ts · TEST_FUNCTION: REF-011-single-source-derivation
  VERIFY: `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-single-source-derivation`
  VERIFICATION_SERVICE: real pnpm docs builds over the mutated-then-restored conversation source; dist HTML read from disk · SURFACE_POLICY: None
  UNIT_TEST_JUSTIFIED: Two real docs builds over the real mutated-then-restored source; vitest parses the report and dist reads only.
  SCENARIO:
    - START_REF docs_dist_output → MUST_OBSERVE [mutated dist HTML contains the new prop name in the props-table region AND the edited source text in the Code-view region (2 regions moved together); restored dist contains the new prop name 0 times and the edited source text 0 times; conversation source sha256 before === after; both docs builds exit 0] / MUST_NOT_OBSERVE [0 divergence between the two views (a props-table-only or Code-view-only move fails); 0 leftover dist artifacts from the mutated build after restore + rebuild; 0 parallel test files overlapping the mutation window (vitest.config.ts serialization holds)]
    - NEGATIVE_CONTROL: would fail if ['the props table or the Code view derives from a second source — only one region moves and the together-assertion fails', 'the restored build keeps mutated artifacts — the restored-dist zero-occurrence assertion fails', 'the edit lands in a non-rendered file — neither region moves and both assertions fail']

### TEST CRITERIA

- **TC-1** (→AC-1): The drill subprocess exits 0 with expectationsHeld true; the report's arms[] array carries 4 spawn records each with an integer exitCode field (arm (a) mutated === 1 / restored === 0; imagery ON !== 0 / default === 0) and before/after sha256 pairs (before === after) for >=4 mutated real paths. — `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report`
- **TC-2** (→AC-2): The props arm's mutated gates run exits 1 matching /\[docs-data\] props: item "shimmer".*unresolved type/, shimmer.tsx restores byte-exact, and the restored run exits 0 with the 56-of-56 line. — `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-unresolved-props-drill`
- **TC-3** (→AC-3): The matrix arm's mutated run exits 1 naming 'streamdown', dev-client-matrix.json restores byte-exact, and the restored run exits 0. — `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-matrix-drill`
- **TC-4** (→AC-4): The imagery pair differentiates: flag-ON exits non-zero naming the mutated item; default exits 0; the fixture restores byte-exact. — `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-imagery-flag-pair`
- **TC-5** (→AC-5): The derivation arm shows the new prop name in the props-table region AND the edited source text in the Code-view region of the mutated dist, 0 occurrences of either in the restored dist, and equal sha256 pairs for the source. — `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-single-source-derivation`
- **TC-6** (→AC-1): git status --porcelain over every mutated path (packages/registry, apps/docs/src/data, dist output) is empty after the lane run. — `pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report`

### READING LIST (max 5)

- scripts/docs-data/drill-item-count.ts [PRIMARY PATTERN] — the drill being extended: pre-bytes capture, clean-tree expectation, mutate -> real build -> gate run, finally byte-exact restore + rebuild, JSON report with sha256 pairs and expectationsHeld.
- tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts [PRIMARY PATTERN] — the lane test being imitated: spawnSync of the drill, JSON.parse of stdout, per-arm assertions, pre/post byte compare from the test side, git-cleanliness check.
- scripts/docs-data/gates.ts — the gate surface the drill proves: formatViolation's pinned '[docs-data] <gate>: item "<name>"' shape, GateError aggregation, props-gate extractor-throw semantics (consumed, never modified).
- vitest.config.ts — the serialization contract (fileParallelism: false + the count-drill comment) this task's MODIFY extends to name drill-enrichment.ts.
- apps/docs/src/pages/components/[item].astro — REF-009's assembled page: the props-table and source/Code-view regions arm (d) asserts move together in dist.

### SCOPE (file-level write permissions)

writeAllowed:
- scripts/docs-data/drill-enrichment.ts (NEW)
- tests/sprint-04-generated-reference/enrichment-drill.test.ts (NEW)
- vitest.config.ts (MODIFY)
writeProhibited:
- tests/sprint-01-docs-spike-skeleton/
- apps/docs/src/pages/
- packages/registry/scripts/
- scripts/docs-data/gates.ts and scripts/docs-data/prebuild.ts — REF-008's; drills prove gates, never weaken them
- any file not listed in write_allowed

### CODE PATTERN
- pattern: Mutate-real-fixture drill: pre-captured bytes, clean-tree expectation, real gate/build runs, finally byte-exact restore, JSON report with an arms[] array of 4 spawn records — drill-item-count.ts extended from one arm to four.
- pattern_source: scripts/docs-data/drill-item-count.ts + its lane consumer in tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts
- anti-pattern: synthetic fixture trees, mocked gate responses, weakened gate logic to make a drill pass, or restores outside finally.
- references: ['TR-08 R7/R8 field-level enrichment gates', 'UC-DELIV-01 AC-2 clause set machine-asserted', 'T-GEND-022/026 drill and single-source-derivation criteria']
- notes: ["Consumes REF-008's matrix + imagery gates and REF-009's rendered template — drill arms assert THEIR contracts; if a gate's violation shape changes, the drill's regexes follow (this task never edits gates.ts).", 'vitest.config.ts MODIFY is the serialization-note extension only — config, not a test file; declared with no supersedes and shared with no other sprint-04 task.', 'Arm (d) needs two full docs builds; budget >= 600_000ms per drill-spawning test (count-drill precedent: 300_000).', "The drill refuses to run over a dirty tree for its mutated paths — same refusal law as drill-item-count.ts's 56-item precheck."]

### BOUNDARY CONTRACTS / CAPABILITIES
- touches: ['CAP-DOCS-01']
- provides: ["scripts/docs-data/drill-enrichment.ts mutating real fixtures then byte-exact-restoring in a finally block: (a) an unresolved props type fails the props gate naming the item, (b) a corrupted matrix entry fails the matrix gate naming the entry, (c) the imagery-flag pair (flag ON exits non-zero naming the item; default exits 0), (d) one fixture edit to an item's source moves the props table AND Code view together in dist (T-GEND-026)", 'tests/sprint-04-generated-reference/enrichment-drill.test.ts — the vitest lane test spawning the drill, same pattern as enrichment-gates.test.ts', 'vitest.config.ts comment extension naming drill-enrichment.ts under the existing fileParallelism:false serialization treatment']
- consumes: ['gates.ts matrix + imagery gates (REF-008) — asserted, never modified', 'the rendered template (REF-009) for the T-GEND-026 dist assertions', "apps/docs/src/data/dev-client-matrix.json (REF-007) — arm (b)'s real mutation target"]
- boundary_contracts: ['Drills mutate the REAL tree and byte-exact-restore — no synthetic fixtures, no mocks; JSON report with real exit codes and sha256 pairs', "Serialized execution consistent with vitest.config.ts's existing count-drill treatment", 'No gate-logic changes — drills prove the gates, never weaken them']

### VERIFICATION GATES

- AC-1..AC-5: pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-<token> — exit 0 for each of the five tokens
- RED-first: all five -t runs FAIL before drill-enrichment.ts exists (spawn of an absent file errors) — record the RED outputs
- Seeded evidence: captured stdout shows the arms[] exit-code anchors and sha256 pairs, not merely exit 0
- typecheck: pnpm typecheck — exit 0 (the drill is TS in the repo graph)
- lint: ./node_modules/.bin/biome ci scripts/docs-data/drill-enrichment.ts tests/sprint-04-generated-reference/enrichment-drill.test.ts — exit 0 (never pnpm lint)
- Regression: pnpm exec vitest run tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts green unchanged (count drill unaffected; serialization note extended only)
- Tree cleanliness: git status --porcelain over packages/registry, apps/docs/src/data, and the dist output paths is empty after the lane run
- scope: git diff --name-only ⊆ write_allowed

### DEPENDENCIES

- Depends on: ['REF-008', 'REF-009'] · Blocks: []

### CODING STANDARDS

- node:child_process spawnSync + node:crypto createHash sha256 — same idioms as drill-item-count.ts
- finally-block restore discipline: restore runs on every path, including expectation failure
- Biome-clean; never emit `pnpm lint` (local crash — use ./node_modules/.bin/biome ci <paths>)

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
 "version": "1",
 "task_id": "REF-011",
 "tdd_mode": "red_first",
 "verification_policy": {
  "requires_tests": true,
  "requires_red_evidence": true,
  "requires_seeded_evidence": true
 },
 "fixtures": {
  "real_registry_tree": {
   "description": "The real packages/registry sources and registry.json the drill mutates and restores: arm (a) injects an unresolved type into packages/registry/src/components/ai/shimmer.tsx; arm (d) edits the conversation source. RED at task start: drill-enrichment.ts is absent so the lane test's spawn fails.",
   "seed_method": "cli",
   "records": [
    "shimmer is the pinned arm-(a) item (FUSE-04 drill precedent)",
    "conversation is the pinned arm-(d) item — the human gate's named page with a non-empty props table",
    "56 registry items / 39 registry:component items"
   ]
  },
  "authored_matrix_dataset": {
   "description": "REF-007's real apps/docs/src/data/dev-client-matrix.json — arm (b)'s mutation target (the streamdown entry), byte-restored in finally.",
   "seed_method": "ui_flow",
   "records": [
    "exactly 4 entries; streamdown is the pinned arm-(b) entry"
   ]
  },
  "docs_dist_output": {
   "description": "The built docs dist (pnpm --filter @rnr-ai-elements/docs build output) arm (d) compares: the mutated build carries the props-table row and Code-view text together; the restored build matches the pre state.",
   "seed_method": "ui_flow",
   "records": [
    "dist HTML for /components/conversation carries the props-table and source/Code-view regions from REF-009's assembly"
   ]
  }
 },
 "requirements": [
  {
   "id": "AC-1",
   "name": "Drill runs as a real subprocess and reports honestly",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "The drill IS the real-service verification — real tsx subprocesses spawning the real gate CLI and real pnpm builds over the real tree with byte-exact restores; 'unit' names only the vitest runner, per the landed enrichment-gates.test.ts drill precedent.",
   "verification_service": "real tsx subprocess of drill-enrichment.ts over the real working tree; JSON report parsed under vitest",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/enrichment-drill.test.ts",
   "test_function": "REF-011-drill-report",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Real subprocess spawns over the real tree — the vitest runner only parses the report.",
    "verification_service": "real tsx subprocess of the drill; JSON report parsed under vitest",
    "negative_control": {
     "would_fail_if": [
      "an arm is stubbed to report success without running the real gate — the arms[] anchored exit-code comparisons diverge from real gate behavior",
      "the restore is dropped on failure — the sha256 before/after pairs diverge and expectationsHeld is false",
      "the drill fabricates the report instead of spawning real processes — the arms[] exit codes and captured outputs cannot reproduce"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_tree",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "spawn node_modules/.bin/tsx scripts/docs-data/drill-enrichment.ts with cwd at the repo root",
        "JSON.parse the drill's stdout report and inspect arms[]"
       ]
      },
      "end_state": {
       "must_observe": [
        "drill subprocess exit code 0",
        "report.expectationsHeld === true",
        "the report's arms[] array carries 4 spawn records each with an integer exitCode field; arm (a) mutated exitCode === 1 and restored exitCode === 0; imagery arm ON !== 0 while default === 0 (anchored integer comparisons, 4 arms)",
        "the report names >=4 mutated paths, each carrying a before/after sha256 pair with before === after"
       ],
       "must_not_observe": [
        "0 mocked or synthetic fixture paths — every mutated path is a real repo file",
        "0 arms skipped or conditionally disabled (arms.length === 4)",
        "0 report fields asserting success without a captured real run output"
       ]
      }
     }
    ]
   },
   "description": "the repo with REF-008's gates, REF-009's template, and REF-007's matrix landed and (RED at start) no drill-enrichment.ts the lane test spawns the drill via node_modules/.bin/tsx over the real tree the drill exits 0 and prints a parseable JSON report whose expectationsHeld is true, whose arms[] array carries 4 spawn records each with an integer exitCode field for mutated and restored runs (arm (a) mutated === 1 and restored === 0; imagery ON !== 0 while default === 0), and before/after sha256 pairs for every mutated path",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-2",
   "name": "Unresolved props type fails the props gate naming shimmer, then restores",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Real mutation of the real source file plus a real gates-CLI subprocess — the vitest runner only parses the report; same drill precedent as the landed count drill.",
   "verification_service": "real gates CLI subprocess over the mutated-then-restored real tree",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/enrichment-drill.test.ts",
   "test_function": "REF-011-unresolved-props-drill",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-unresolved-props-drill",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Real file mutation + real gate subprocess; vitest parses the report only.",
    "verification_service": "real gates CLI subprocess over the mutated-then-restored real tree",
    "negative_control": {
     "would_fail_if": [
      "the injected type resolves — the gate exits 0 and the exit-1 expectation fails",
      "the restore misses trailing bytes — the shimmer.tsx sha256 pair diverges",
      "the drill edits a synthetic copy — the real file's git status stays clean and the assertion on the real path fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_tree",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the drill report's props arm from arms[0]",
        "assert the mutated/restored exit codes, the violation shape, and the sha256 pair"
       ]
      },
      "end_state": {
       "must_observe": [
        "mutated gates run exit code 1",
        "output matches /\\[docs-data\\] props: item \"shimmer\".*unresolved type/",
        "shimmer.tsx sha256 before === after restore",
        "restored gates run exit code 0 with the 56-of-56 names-match line"
       ],
       "must_not_observe": [
        "0 leftover mutation in packages/registry (git status --porcelain over the path is empty after the run)",
        "0 changes to scripts/docs-data/gates.ts or prebuild.ts (drills prove gates, never weaken them)",
        "0 synthetic copies of shimmer.tsx mutated in place of the real file"
       ]
      }
     }
    ]
   },
   "description": "a clean-tree expectation captured pre-mutation and the real shimmer source the drill injects a prop typed with an unresolved type into packages/registry/src/components/ai/shimmer.tsx and runs the real gates CLI the mutated run exits 1 with the pinned '[docs-data] props: item \"shimmer\"' unresolved-type shape naming shimmer, and the finally block byte-exact-restores the source after which the restored run exits 0",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-3",
   "name": "Corrupted matrix entry fails the matrix gate naming streamdown",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Real mutation of REF-007's authored data file plus a real gates-CLI subprocess; vitest parses the report only. The 'peers' being blanked are npm package fields in an authored JSON file — single-node data, no device topology.",
   "verification_service": "real gates CLI subprocess over the mutated-then-restored real matrix file",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/enrichment-drill.test.ts",
   "test_function": "REF-011-matrix-drill",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-matrix-drill",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Real matrix-file mutation + real gate subprocess; vitest parses the report only.",
    "verification_service": "real gates CLI subprocess over the mutated-then-restored matrix file",
    "negative_control": {
     "would_fail_if": [
      "the matrix gate accepts an empty peers[] — the mutated run exits 0 and the exit-1 expectation fails",
      "the violation omits the entry id — the naming assertion fails",
      "the restore re-serializes instead of writing back the captured bytes — the sha256 pair diverges"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "authored_matrix_dataset",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the drill report's matrix arm from arms[1]",
        "assert the exit codes, the streamdown naming, and the sha256 pair"
       ]
      },
      "end_state": {
       "must_observe": [
        "mutated run exit code 1 naming 'streamdown'",
        "dev-client-matrix.json sha256 before === after restore",
        "restored run exit code 0"
       ],
       "must_not_observe": [
        "0 leftover mutation in apps/docs/src/data after the run",
        "0 corruption applied to any entry other than streamdown (1 entry mutated)",
        "0 gate-logic edits accommodating the corruption"
       ]
      }
     }
    ]
   },
   "description": "REF-007's real dev-client-matrix.json and REF-008's matrix gate the drill corrupts the streamdown entry (blanking its peers[]) and runs the gates CLI, then restores the mutated run exits 1 naming streamdown in the violation line, dev-client-matrix.json is byte-identical after the finally restore, and the restored run exits 0",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-4",
   "name": "Imagery-flag pair — ON fails naming the item, default passes",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Real pipeline runs in both flag configurations over the real mutated tree; vitest parses the report only.",
   "verification_service": "real pipeline/gate subprocesses in both imagery-flag configurations over the real tree",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/enrichment-drill.test.ts",
   "test_function": "REF-011-imagery-flag-pair",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-imagery-flag-pair",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Real pipeline subprocesses in two configurations; vitest parses the report only.",
    "verification_service": "real pipeline/gate subprocesses in both imagery-flag configurations",
    "negative_control": {
     "would_fail_if": [
      "the flag-ON run tolerates imagery — it exits 0 and the non-zero expectation fails",
      "the flag changes default behavior — the default run exits non-zero and the pair assertion fails",
      "the injected imagery carries no item attribution — the naming assertion fails"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "real_registry_tree",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the drill report's imagery arm (both runs) from arms[2]",
        "assert the ON/default exit-code pair, the item naming, and the sha256 pair"
       ]
      },
      "end_state": {
       "must_observe": [
        "flag-ON run exit code !== 0 with the mutated item named in the output",
        "default (flag-off) run exit code === 0",
        "fixture sha256 before === after restore"
       ],
       "must_not_observe": [
        "0 runs where the ON and default exit codes are equal (the pair must differentiate)",
        "0 leftover imagery in the tree after the run",
        "0 gate-logic edits accommodating the imagery"
       ]
      }
     }
    ]
   },
   "description": "REF-008's imagery flag wired into the pipeline and a real fixture carrying injected imagery the drill runs the pipeline with the flag ON and again with the default (flag off) over the same mutated tree, then restores the flag-ON run exits non-zero with output naming the mutated item, the default run exits 0, and the fixture is byte-exact-restored",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "AC-5",
   "name": "Single-source derivation — one source edit moves props table and Code view together (T-GEND-026)",
   "primary": false,
   "flow_ref": null,
   "test_tier": "unit",
   "unit_test_justified": "Two real docs builds over the real mutated-then-restored source; vitest parses the report and dist reads only.",
   "verification_service": "real pnpm docs builds over the mutated-then-restored conversation source; dist HTML read from disk",
   "surface_policy": null,
   "test_file": "tests/sprint-04-generated-reference/enrichment-drill.test.ts",
   "test_function": "REF-011-single-source-derivation",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-single-source-derivation",
   "scenario": {
    "primary": false,
    "tier": "visible",
    "test_tier": "unit",
    "topology": "single-node",
    "unit_test_justified": "Real builds over the real source; vitest parses the report and dist reads only.",
    "verification_service": "real docs builds; dist HTML read from disk",
    "negative_control": {
     "would_fail_if": [
      "the props table or the Code view derives from a second source — only one region moves and the together-assertion fails",
      "the restored build keeps mutated artifacts — the restored-dist zero-occurrence assertion fails",
      "the edit lands in a non-rendered file — neither region moves and both assertions fail"
     ]
    },
    "evidence": {
     "artifact_type": "stdout",
     "required_capture": true
    },
    "cases": [
     {
      "start_ref": "docs_dist_output",
      "action": {
       "actor": "vitest_runner",
       "steps": [
        "read the drill report's derivation arm from arms[3]",
        "assert both regions moved together in the mutated dist and neither in the restored dist"
       ]
      },
      "end_state": {
       "must_observe": [
        "mutated dist HTML contains the new prop name in the props-table region AND the edited source text in the Code-view region (2 regions moved together)",
        "restored dist contains the new prop name 0 times and the edited source text 0 times",
        "conversation source sha256 before === after; both docs builds exit 0"
       ],
       "must_not_observe": [
        "0 divergence between the two views (a props-table-only or Code-view-only move fails)",
        "0 leftover dist artifacts from the mutated build after restore + rebuild",
        "0 parallel test files overlapping the mutation window (vitest.config.ts serialization holds)"
       ]
      }
     }
    ]
   },
   "description": "the real conversation source and the docs build pipeline the drill adds one new optional prop to the conversation source, rebuilds dist, then restores and rebuilds the mutated dist HTML for /components/conversation contains BOTH the new prop name inside the props-table region AND the edited source text inside the Code-view region, the restored dist contains neither, and the source file's sha256 pairs match",
   "type": "acceptance_criterion",
   "maps_to_ac": null
  },
  {
   "id": "TC-1",
   "type": "test_criterion",
   "description": "The drill subprocess exits 0 with expectationsHeld true; the report's arms[] array carries 4 spawn records each with an integer exitCode field (arm (a) mutated === 1 / restored === 0; imagery ON !== 0 / default === 0) and before/after sha256 pairs (before === after) for >=4 mutated real paths.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report"
  },
  {
   "id": "TC-2",
   "type": "test_criterion",
   "description": "The props arm's mutated gates run exits 1 matching /\\[docs-data\\] props: item \"shimmer\".*unresolved type/, shimmer.tsx restores byte-exact, and the restored run exits 0 with the 56-of-56 line.",
   "maps_to_ac": "AC-2",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-unresolved-props-drill"
  },
  {
   "id": "TC-3",
   "type": "test_criterion",
   "description": "The matrix arm's mutated run exits 1 naming 'streamdown', dev-client-matrix.json restores byte-exact, and the restored run exits 0.",
   "maps_to_ac": "AC-3",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-matrix-drill"
  },
  {
   "id": "TC-4",
   "type": "test_criterion",
   "description": "The imagery pair differentiates: flag-ON exits non-zero naming the mutated item; default exits 0; the fixture restores byte-exact.",
   "maps_to_ac": "AC-4",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-imagery-flag-pair"
  },
  {
   "id": "TC-5",
   "type": "test_criterion",
   "description": "The derivation arm shows the new prop name in the props-table region AND the edited source text in the Code-view region of the mutated dist, 0 occurrences of either in the restored dist, and equal sha256 pairs for the source.",
   "maps_to_ac": "AC-5",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-single-source-derivation"
  },
  {
   "id": "TC-6",
   "type": "test_criterion",
   "description": "git status --porcelain over every mutated path (packages/registry, apps/docs/src/data, dist output) is empty after the lane run.",
   "maps_to_ac": "AC-1",
   "verify": "pnpm exec vitest run tests/sprint-04-generated-reference/enrichment-drill.test.ts -t REF-011-drill-report"
  }
 ]
}
-->

</details>
