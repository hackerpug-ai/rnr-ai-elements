# FIX-ORI-SUITE-2-2: Land and re-prove the foreign-suite repair after premature completion

## What this does

Lands the three missing suite repairs and proof harness, corrects the owner-routing test's moving-main comparison, and proves all three original FIX-ORI-SUITE-2 acceptance criteria together on one reviewed candidate.

## Why

FIX-ORI-SUITE-2 was recorded complete from charter-only commit `92d0f004aea8b2e311a58544cb6182fbf571b99a`. Its real repair commit `3dc22d71154d0bd43764cc33f4b8f78d2530aa75` received NEEDS_FIXES and never landed. The independent audit at `.kb-run-sprint/sprint-05-orient-search/closure-20260929/suite2-completion-audit.verdict.json` found AC-1 failed and AC-2/AC-3 only partial on main `53034655a3062e9fa0e9f942e271d12418fb7a62`.

## How to verify

```sh
pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts
pnpm exec vitest run tests/sprint-05-orient-search/aggregate-owner-routing.test.ts
pnpm typecheck
pnpm exec biome ci tests/sprint-05-orient-search/docs-collection.test.ts tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts tests/sprint-05-orient-search/live-example-api.test.ts tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts tests/sprint-05-orient-search/aggregate-owner-routing.test.ts
```

## Scope

Repair and proof files only. Product sources, the NativeWind suite, locked flows, prior task/review records, and sprint state remain read-only.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ⬜ Pending

> Assignee: ghactions-implementer
> Priority: P1 · Points: 3 · Type: FIX
> Dependency phase: after FIX-ORI-SUITE-2 and FIX-ORI-SUITE-2-1
> Proposed By: ghactions-implementer, from ghactions-reviewer failed-review findings
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-29
> Source SHA: 53034655a3062e9fa0e9f942e271d12418fb7a62

AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer

PROGRESS: 0/3 ACs; every TDD_STATE is none. Historical FIX-ORI-SUITE-2 evidence is input, not completion evidence for this task.

### OUTCOME

One reviewed commit contains the missing three suite repairs, the exact proof harness that freshly passes, and the immutable owner-map check, with all original AC-1/2/3 evidence valid together.

### CRITICAL CONSTRAINTS — Never

- Never rewrite the original FIX-ORI-SUITE-2 task, state entry, reviews, handoff, withdrawals, or receipts; this additional task records the correction.
- Never treat `3dc22d71154d0bd43764cc33f4b8f78d2530aa75` as approved or merge its dirty worktree; use its bounded diff and evidence only as reviewed input.
- Never relabel historical evidence as fresh. The exact final harness must run, record its own SHA-256, and disclose `retained-bound` versus `rerun` for native proof.
- Never weaken, skip, mock, or stub a selector, provider, device, build, tracked-file check, residual-token check, or diff boundary.
- Never edit product sources, `nativewind-live-example.test.ts`, locked flows, planning state, or perform trunk/worktree lifecycle operations.

### DONE WHEN

- [ ] AC-1 lands the three missing repairs and the exact final harness records all three real selectors exiting `0`.
- [ ] AC-2 locates and binds every original raw native receipt and execution input, or reruns both real native selectors when any original capture is absent or mismatched.
- [ ] AC-3 passes the owner-routing test against the immutable `f9d30b09^..f9d30b09` boundary and preserves the historical residual without assigning a fresh failure to a historical owner.
- [ ] The exact candidate passes typecheck and scoped Biome, and the reviewer explicitly enumerates AC-1, AC-2, and AC-3.

### ACCEPTANCE CRITERIA

#### AC-1 [PRIMARY]: The missing suite repairs and exact final harness pass together

GIVEN current main still has the three unrepaired suite files and no foreign-suite proof harness WHEN the implementer ports the bounded repair from `3dc22d71` into a clean task worktree and runs the exact final harness THEN docs-collection passes `4/4`, docs-data-prebuild passes `4/4`, live-example-api AC-4 passes, and the new evidence records the exact final harness hash and candidate SHA.

- TEST_TIER: integration
- TEST_FILE: `tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts`
- TEST_FUNCTION: `runForeignSuiteRepairProof`
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts`
- VERIFICATION_SERVICE: real Vitest children, real Astro scratch builds, real git tracked-file state, and real TypeScript compilers

The repairs remain the original three: `makeScratch()` mirrors `scripts/` and `packages/docs-snippets/`; the generated-only assertion scopes to `apps/docs/public/r` while authored fonts stay tracked; and the hook oracle asserts `await import('expo/fetch')` while preserving both compiles, pins, throttle, messages, and clearError-before-regenerate checks.

#### AC-2: Native proof is explicit, bound, and valid for the final candidate

GIVEN the historical native summary names standalone teardown times `2026-09-28T05:39:11.293Z` and `2026-09-28T06:27:44.105Z`, while the available raw manifests are either older (`2026-09-19`, including cleanup `completed=false`) or later aggregate outputs (`2026-09-28T08:35:30.725Z` and `2026-09-28T09:02:48.829Z`), and the capture names harness SHA `5d504cd0ec549f617e962cfbfd708dfc9f24bfe666df5a93e46019505a1dcf4e` while the unmerged committed harness hashes to `6e50108c4b65b61f67beec6a5dd3f3b6c1a18bd96614a8a5de45e0874399c45f` WHEN the exact final harness runs THEN it records one explicit native proof mode:

1. `retained-bound` only when the implementer locates every original standalone raw record as an immutable `commit:path` or content-addressed archive and records both the Git blob/object identifier and SHA-256 for each selector log, `manifest.json`, `teardown.json`, and `provider-correlation.json`. Their run IDs and timestamps must agree, every expected leg must be complete, cleanup must have `completed=true`, and the abort/retry correlation must contain at least three aborted and three completed provider records. `.tmp/FIX-ORI-SUITE-2/green.json` alone and the later same-path worktree outputs do not qualify.
2. The retained mode must also hash every execution input actually read by the run: `nativewind-live-example.test.ts`; `support/nativewind-live-example.ts`; `support/live-backend.ts`; `support/native-session.ts`; `support/quickstart-consumer.ts`; `nativewind-live-source-manifest.json`; all five files mapped by that manifest; every file copied from `packages/docs-snippets/nativewind/`; `packages/docs-snippets/commands/nativewind.sh`; the transitive `public/r/nativewind/*.json` registry dependency closure installed by that recipe; and the dependency/runtime versions resolved for the clean consumer. Each input must resolve to immutable bytes proven unchanged through the final candidate, including native suite SHA-256 `2e84e9489a528116e4f96bea53a43400d91fd76f4c0ee611ed3372979767a0ef`.
3. `rerun` is the expected path unless all of those original raw captures and input bindings can actually be located. On any absent, inconsistent, incomplete, or mismatched record, both exact NativeWind selectors must run against the real reserved iOS/Android/Web targets, the owned backend, and the official OpenAI Responses endpoint and exit `0` with fresh raw manifests, teardowns, correlations, and selector logs.

No mode may copy old timestamps into a new run, manufacture retrospective hashes or receipts, substitute a summary for missing raw evidence, or describe a binding check as a rerun.

- TEST_TIER: e2e
- TEST_FILE: `tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts`
- TEST_FUNCTION: `runForeignSuiteRepairProof`
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts`
- VERIFICATION_SERVICE: immutable git blobs plus original real native/provider receipts, or fresh real reserved-device/provider execution

#### AC-3: The owner-map closure passes without comparing the repair branch to moving main

GIVEN owner-map commit `f9d30b09eadf06350a691cc9bd39a667ee2a8e52` has immutable parent `8ee4282f24474eb8824e5a92685063f1070a12d6` WHEN the routing test checks the historical no-edit claim THEN it runs `git diff --exit-code 8ee4282f24474eb8824e5a92685063f1070a12d6 f9d30b09eadf06350a691cc9bd39a667ee2a8e52 -- <four suites> <original charter>`, passes on the repair branch, and proves the byte-preserved historical map records `residual_tokens` exactly `["FLOW-DELIV-01-ci-chain-order"]`, `residual_widened` false, and one historical owner for every failure recorded in that map.

Those token and owner assignments describe only the earlier `8ee4282f` aggregate. They do not prove the cause or owner of any current failure and do not assert a current ORI-DEP-002/ORI-DEP-003 publication dependency. The full aggregate and publication closure gates remain separate: any new failure must be diagnosed and routed from its own fresh evidence without modifying or reinterpreting the historical map.

- TEST_TIER: integration
- TEST_FILE: `tests/sprint-05-orient-search/aggregate-owner-routing.test.ts`
- TEST_FUNCTION: `FIX-ORI-SUITE-2-1-owner-routing`
- VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/aggregate-owner-routing.test.ts`
- VERIFICATION_SERVICE: real git history, committed aggregate inventory, and committed owner map

### SCOPE

implementationCommitAllowed:

- `tests/sprint-05-orient-search/docs-collection.test.ts`
- `tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts`
- `tests/sprint-05-orient-search/live-example-api.test.ts`
- `tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts` (new)
- `tests/sprint-05-orient-search/aggregate-owner-routing.test.ts`
- `tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json` (suite-emitted only)
- `tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json` (suite-emitted only)
- `.tmp/FIX-ORI-SUITE-2/{red,green,run}.json` (exact historical bytes imported from `3dc22d71`; never rewritten)
- `.tmp/FIX-ORI-SUITE-2-2/{red,green,run}.json` (fresh remediation evidence)

runtimeArtifactAllowed (real selectors may write these during verification; they are not implementation-commit paths):

- `.tmp/FIX-ORI-SUITE-2-2/red/{docs-collection,docs-data-prebuild,live-example-api-ac4}.log`
- `.tmp/FIX-ORI-SUITE-2-2/green/{docs-collection,docs-data-prebuild,live-example-api-ac4,nativewind-abort-error-retry,nativewind-fail-closed-cleanup,typecheck,biome}.log`
- `.tmp/ORI-RN-005/abort-error-retry/**`
- `.tmp/ORI-RN-005/mismatched-manifest.json`
- `.tmp/ORI-RN-005/fail-closed-hash-mismatch/**`
- `.tmp/ORI-RN-005/fail-closed-absent-target/**`
- `.tmp/ORI-RN-005/fail-closed-cleanup/**`

The final harness must hash and summarize the fresh raw receipts before cleanup. Preserve every pre-existing tracked native artifact byte-for-byte in the implementation commit; runtime writes to those tracked paths must not enter the candidate diff. Never hand-author a native receipt or selector log.

writeProhibited:

- `apps/**`, `packages/**`, `scripts/**`
- `tests/sprint-05-orient-search/nativewind-live-example.test.ts` and `tests/sprint-05-orient-search/support/nativewind-live-example.ts`
- `.spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md`
- `.kb-run-sprint/**`, `human-flows.json`, `gate-plan.json`, and every other task charter

### BOUNDARIES

✅ Always:

- Preserve historical evidence byte-for-byte and write fresh evidence under `FIX-ORI-SUITE-2-2`.
- Run the final harness after its last code change and bind its actual SHA-256.
- Record every native-proof source, execution input, raw receipt location, object identifier, hash, run ID, timestamp, provider count, and proof mode.

⚠️ Ask First:

- Report blocked if a native binding fails and real devices/provider cannot rerun.
- Report blocked if a required repair reaches product source or another task's file.

### DELIVERABLE

- Three repaired suite files and the new final proof harness.
- The corrected immutable-boundary owner-routing test.
- Exact historical receipts plus fresh `FIX-ORI-SUITE-2-2` RED/GREEN/run evidence.
- A reviewable commit whose diff contains no path outside implementationCommitAllowed; bounded runtimeArtifactAllowed outputs may exist only during execution and must not enter the implementation commit.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: introduce the final harness and immutable owner-routing expectation before the three repairs; run the focused commands on current main and capture the real failures under `.tmp/FIX-ORI-SUITE-2-2/red.json`.
2. GREEN: port only the bounded implementation from `3dc22d71`, preserve its historical receipts unchanged, rerun both native selectors unless every original raw receipt and execution input satisfies AC-2, run the exact final harness and routing test, then run typecheck and scoped Biome.
3. REFACTOR: if the harness changes, rerun it after the last byte change. Record the new harness hash and never reuse the pre-refactor pass.
4. HANDOFF: disclose native proof mode and every binding. Return the candidate SHA; do not merge.

### READING LIST

1. `.kb-run-sprint/sprint-05-orient-search/closure-20260929/suite2-completion-audit.verdict.json` [PRIMARY PATTERN]
2. `git show 3dc22d71154d0bd43764cc33f4b8f78d2530aa75` — implementation input with NEEDS_FIXES history
3. `TASK-FIX-ORI-SUITE-2.md` — original AC-1/2/3 contract and preserved selectors
4. `aggregate-owner-routing.test.ts` plus owner-map commit `f9d30b09` and parent `8ee4282f`
5. `.kb-run-sprint/sprint-05-orient-search/FIX-ORI-SUITE-2/cycle-{1,2,3}.verdict.json`

### EVIDENCE GATES

1. Real RED from the focused commands on the unrepaired base; no authored failure JSON.
2. Fresh final-harness run records its actual hash, candidate SHA, selector exits, proof mode, and complete raw-receipt/execution-input bindings; missing original raw evidence selects a real rerun.
3. Routing test exits `0` using only the immutable owner-map commit boundary; the historical owner map and inventory bytes remain unchanged, and current failures are routed only from fresh evidence.
4. `pnpm typecheck` and scoped Biome exit `0`; git diff names only implementationCommitAllowed paths and excludes runtimeArtifactAllowed outputs.
5. Independent ghactions-reviewer enumerates AC-1, AC-2, and AC-3 on the exact commit and returns APPROVED before landing.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this remediation. Do not change `human-flows.json`, gate steps, or flow ownership. The task restores test implementation and proof required before the existing hosted, publication, aggregate, and human gates can close Sprint 05.

### DEPENDENCIES AND HANDOFF

Depends on: FIX-ORI-SUITE-2 (historically completed at charter-only `92d0f004`); FIX-ORI-SUITE-2-1 (approved `f9d30b09`, merged `c1785cf8`).

Blocks: Sprint 05 closure and ORI-CI-003/ORI-CI-004 aggregate acceptance. Publication acceptance remains a separate gate and is not inferred as the cause of a fresh aggregate failure.

Provides: the missing real implementation, exact-final-harness proof, preserved native evidence with disclosed binding or real rerun, and immutable owner-map closure.

### OUT OF SCOPE

Rewriting historical task state; product changes; workflow authoring; public deployment; changing the residual owner; repairing unrelated aggregate failures; locked-flow changes; merging or publishing.

### REVIEW

Must pass: all three ACs on the same exact commit; final harness hash matches the executed file; native proof mode includes complete raw-receipt and execution-input bindings or a real rerun; owner-routing compares `8ee4282f..f9d30b09`, never moving main, and treats its assignments as historical only; old receipts remain byte-identical in the commit; bounded runtime outputs are absent from the candidate diff; no product/source/flow/state edit; no mock, stub, skip, fabricated receipt, or weakened oracle. Verdict: APPROVED or NEEDS_FIXES with failed ACs, exact paths, and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{
  "version": "1",
  "task_id": "FIX-ORI-SUITE-2-2",
  "tdd_mode": "red_first",
  "verification_policy": {
    "requires_tests": true,
    "requires_red_evidence": true,
    "requires_seeded_evidence": true
  },
  "fixtures": {
    "unrepaired_main_with_historical_proof": {
      "description": "Main 53034655 has 0 of the 3 suite repairs and no foreign-suite harness; a historical native summary exists, but its standalone raw receipts and complete execution-input identity are not yet located and therefore do not establish retained-bound mode.",
      "seed_method": "recorded_external",
      "records": [
        "3 missing suite repairs",
        "historical harness hash 5d504cd0ec549f617e962cfbfd708dfc9f24bfe666df5a93e46019505a1dcf4e",
        "committed input harness hash 6e50108c4b65b61f67beec6a5dd3f3b6c1a18bd96614a8a5de45e0874399c45f",
        "standalone raw native receipt inventory unresolved; rerun is expected unless immutable originals are located",
        "owner-map residual has 1 token: FLOW-DELIV-01-ci-chain-order"
      ]
    }
  },
  "guardrails": {
    "write_allowed": [
      "tests/sprint-05-orient-search/docs-collection.test.ts",
      "tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts",
      "tests/sprint-05-orient-search/live-example-api.test.ts",
      "tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts",
      "tests/sprint-05-orient-search/aggregate-owner-routing.test.ts",
      "tests/sprint-05-orient-search/evidence/FLOW-DOCS-02-live-example-api-stream-history-abort/run.json",
      "tests/sprint-05-orient-search/evidence/ORI-AI-001/teardown.json",
      ".tmp/FIX-ORI-SUITE-2/red.json",
      ".tmp/FIX-ORI-SUITE-2/green.json",
      ".tmp/FIX-ORI-SUITE-2/run.json",
      ".tmp/FIX-ORI-SUITE-2-2/red.json",
      ".tmp/FIX-ORI-SUITE-2-2/green.json",
      ".tmp/FIX-ORI-SUITE-2-2/run.json"
    ],
    "runtime_artifact_allowed_not_committed": [
      ".tmp/FIX-ORI-SUITE-2-2/red/docs-collection.log",
      ".tmp/FIX-ORI-SUITE-2-2/red/docs-data-prebuild.log",
      ".tmp/FIX-ORI-SUITE-2-2/red/live-example-api-ac4.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/docs-collection.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/docs-data-prebuild.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/live-example-api-ac4.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/nativewind-abort-error-retry.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/nativewind-fail-closed-cleanup.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/typecheck.log",
      ".tmp/FIX-ORI-SUITE-2-2/green/biome.log",
      ".tmp/ORI-RN-005/abort-error-retry/**",
      ".tmp/ORI-RN-005/mismatched-manifest.json",
      ".tmp/ORI-RN-005/fail-closed-hash-mismatch/**",
      ".tmp/ORI-RN-005/fail-closed-absent-target/**",
      ".tmp/ORI-RN-005/fail-closed-cleanup/**"
    ],
    "write_prohibited": [
      "apps/**",
      "packages/**",
      "scripts/**",
      "tests/sprint-05-orient-search/nativewind-live-example.test.ts",
      ".spec/prds/docs-site/tasks/sprint-05-orient-search/TASK-FIX-ORI-SUITE-2.md",
      ".kb-run-sprint/**",
      ".spec/prds/docs-site/tasks/sprint-05-orient-search/human-flows.json"
    ]
  },
  "requirements": [
    {
      "id": "AC-1",
      "type": "acceptance_criterion",
      "name": "The missing suite repairs and exact final harness pass together",
      "primary": true,
      "description": "GIVEN main has 0 of the 3 repairs WHEN the exact final harness runs after the repairs THEN docs-collection reports 4/4, docs-data-prebuild reports 4/4, live-example AC-4 reports 1/1, and the evidence names the exact harness hash.",
      "test_file": "tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts",
      "test_function": "runForeignSuiteRepairProof",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts",
      "test_tier": "integration",
      "verification_service": "real Vitest children, Astro builds, git state, and TypeScript compilers",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-SUITE-2-2-1",
        "primary": true,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "real Vitest children, Astro builds, git state, and TypeScript compilers",
        "negative_control": {"would_fail_if": ["the harness is stubbed to exit 0", "any of the 3 repairs is omitted", "the recorded harness hash differs from the executed bytes"]},
        "evidence": {"artifact_type": "file_artifact", "required_capture": true, "artifact_path": ".tmp/FIX-ORI-SUITE-2-2/green.json"},
        "cases": [{
          "start_ref": "unrepaired_main_with_historical_proof",
          "action": {"actor": "cli_user", "steps": ["Run the final harness after the 3 bounded repairs.", "Inspect its child exits and exact harness SHA-256."]},
          "end_state": {"must_observe": ["docs-collection 4/4", "docs-data-prebuild 4/4", "live-example AC-4 1/1", "final harness SHA-256 matches the executed file"], "must_not_observe": ["0 collected selectors", "a missing repair", "a stale harness hash"]}
        }]
      }
    },
    {
      "id": "AC-2",
      "type": "acceptance_criterion",
      "name": "Native proof is explicit and candidate-bound",
      "primary": false,
      "description": "GIVEN the historical summary does not identify authoritative standalone raw receipts WHEN the final harness locates and validates every immutable raw record and complete execution-input binding or performs the expected real rerun THEN it records retained-bound or rerun with 2 passing selectors and no undisclosed reuse or fabricated evidence.",
      "test_file": "tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts",
      "test_function": "runForeignSuiteRepairProof",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts",
      "test_tier": "e2e",
      "verification_service": "immutable git blobs plus original real native/provider receipts, or fresh real reserved-device/provider execution",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-SUITE-2-2-2",
        "primary": false,
        "tier": "visible",
        "test_tier": "e2e",
        "verification_service": "immutable git blobs plus original real native/provider receipts, or fresh real reserved-device/provider execution",
        "negative_control": {"would_fail_if": ["native proof is omitted", "green.json is accepted without raw selector logs, manifests, teardowns, and provider correlations", "a source, support module, template, recipe, registry dependency, or resolved dependency input is unbound", "old timestamps are relabeled as a new run", "retrospective hashes or receipts are fabricated", "provider transport is mocked"]},
        "evidence": {"artifact_type": "file_artifact", "required_capture": true, "artifact_path": ".tmp/FIX-ORI-SUITE-2-2/green.json"},
        "cases": [{
          "start_ref": "unrepaired_main_with_historical_proof",
          "action": {"actor": "cli_user", "steps": ["Run the final harness.", "Locate immutable original selector logs, manifests, teardowns, and provider correlations and validate their run identity plus every execution input; rerun both native selectors unless all bindings succeed."]},
          "end_state": {"must_observe": ["1 explicit native proof mode", "2 passing native selectors", "native suite hash 2e84e9489a528116e4f96bea53a43400d91fd76f4c0ee611ed3372979767a0ef", "immutable raw receipt object IDs and SHA-256 values when retained-bound", "consistent run IDs, timestamps, completed legs, and at least 3 aborted plus 3 completed provider records when retained-bound", "rerun mode records 2 fresh manifests, 2 fresh teardowns, 2 fresh provider-correlation files, and 2 selector logs"], "must_not_observe": ["0 native selectors", "green.json used as the only receipt", "an undisclosed retained receipt", "a fabricated retrospective binding", "a mocked provider", "a stale or incomplete execution-input binding", "a runtime artifact in the implementation commit"]}
        }]
      }
    },
    {
      "id": "AC-3",
      "type": "acceptance_criterion",
      "name": "The immutable owner-map boundary preserves the aggregate residual",
      "primary": false,
      "description": "GIVEN owner-map commit f9d30b09 has parent 8ee4282f WHEN the real routing test runs THEN the historical diff is clean, every failure recorded in that historical map has 1 owner, and its historical residual remains exactly FLOW-DELIV-01-ci-chain-order without assigning a present failure to that old owner.",
      "test_file": "tests/sprint-05-orient-search/aggregate-owner-routing.test.ts",
      "test_function": "FIX-ORI-SUITE-2-1-owner-routing",
      "verify": "pnpm exec vitest run tests/sprint-05-orient-search/aggregate-owner-routing.test.ts",
      "test_tier": "integration",
      "verification_service": "real git history, committed aggregate inventory, and committed owner map",
      "maps_to_ac": null,
      "scenario": {
        "id": "SC-FIX-ORI-SUITE-2-2-3",
        "primary": false,
        "tier": "visible",
        "test_tier": "integration",
        "verification_service": "real git history, committed aggregate inventory, and committed owner map",
        "negative_control": {"would_fail_if": ["the test compares against moving main", "the historical owner map is empty or modified", "the historical residual is widened", "a failure recorded in the historical map has no owner", "a current failure is assigned from the historical map without fresh diagnosis"]},
        "evidence": {"artifact_type": "stdout", "required_capture": true},
        "cases": [{
          "start_ref": "unrepaired_main_with_historical_proof",
          "action": {"actor": "cli_user", "steps": ["Run aggregate-owner-routing.test.ts on the repair branch.", "Inspect the immutable 8ee4282f..f9d30b09 diff and committed routing JSON."]},
          "end_state": {"must_observe": ["routing test exit 0", "historical map retains 1 residual token: FLOW-DELIV-01-ci-chain-order", "every failure recorded in the historical map has 1 owner", "0 current-failure owner assignments sourced only from the historical map"], "must_not_observe": ["moving-main comparison", "0 historically routed failures", "historical residual_widened true", "a claimed current publication cause inferred from the historical map"]}
        }]
      }
    },
    {"id": "TC-1", "type": "test_criterion", "description": "The exact final harness runs the 3 repaired selectors and binds its executed bytes.", "verify": "pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts", "maps_to_ac": "AC-1"},
    {"id": "TC-2", "type": "test_criterion", "description": "Native proof is disclosed and bound to immutable raw receipts plus every execution input, with a real rerun expected when any original record is absent, inconsistent, incomplete, or mismatched.", "verify": "pnpm exec vitest run tests/sprint-05-orient-search/foreign-suite-repair-proof.test.ts", "maps_to_ac": "AC-2"},
    {"id": "TC-3", "type": "test_criterion", "description": "The routing test uses the immutable owner-map boundary, preserves exactly 1 historical residual token, and does not infer the cause or owner of a current failure from that map.", "verify": "pnpm exec vitest run tests/sprint-05-orient-search/aggregate-owner-routing.test.ts", "maps_to_ac": "AC-3"}
  ]
}
-->

</details>
