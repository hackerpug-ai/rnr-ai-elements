# FIX-ORI-CI-001-1: Author the Quickstart tutorial designation and land its schema field

## What this does

Lands the one-line tutorial designation that no task in the prerequisite chain ever owned: `tutorial: true` in the `apps/docs/src/content/docs/quickstart.mdx` frontmatter, plus the schema field that carries it — `tutorial: z.boolean().optional()` in the `apps/docs/src/content.config.ts` docs collection schema. Two product lines total, verified through a minimal task-owned proof harness (`tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`) that drives the real docs build.

ORI-CI-001's cycle-1 blocked report (commit `41a496019097428987e628863763716776026179`, item `ORI-CI-001:blocked:1:scope_impact:0`) records the gap: boundary contract 5 of ORI-CI-001's charter states "ORI-CONT-003 authors tutorial: true against the declared schema contract", but ORI-CONT-003's own task file contains no such requirement (its deviations record only `order: 2.5`) and ORI-AST-001 explicitly scoped tutorial cardinality enforcement out — the prerequisite chain has a hole, and authored content is write-prohibited to the in-flight ORI-CI-001. Orchestrator-verified trunk facts: the quickstart.mdx frontmatter carries only title/description/section/order(2.5), and the schema declares title/description/section/order/draft with no tutorial field, so ORI-CI-001's landed fail-closed gate would count 0 published tutorials against the required 1 and could never be wired without breaking every docs build.

The schema line is not new code: ORI-CI-001's cycle-1 checkpoint (41a49601) already proved `tutorial: z.boolean().optional()` behavior-neutral on the real build (`pnpm --filter @rnr-ai-elements/docs build` exit 0 at 67 pages). This task lands that exact line on trunk; when ORI-CI-001's branch later merges trunk, the identical line reconciles cleanly.

## Why

ORI-CONT-003 (completed — approved 22780223, merged 3635ba62) landed the Quickstart manuscript but was never contractually tasked with the designation; ORI-AST-001 scoped cardinality enforcement out; ORI-CI-001 owns the enforcement machinery but is content-write-prohibited. Every path to wiring the single-tutorial gate runs through this missing line, and the sprint's dark proof row ORI-CI-001 ("the actual build rejects duplicate, missing, and noncanonical published tutorials, then accepts the restored single tutorial") is unreachable while the count observes 0. No pending task owns either file for this purpose. This is the smallest content-authorized change that closes the gap: two lines, no gate wiring, no behavior change to any consumer that does not yet read the field.

## How to verify

```sh
pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts
pnpm typecheck
pnpm exec biome ci apps/docs/src/content.config.ts
```

The first command is the exact selector: a minimal task-owned proof harness that orchestrates the real commands and captures the evidence — (a) it runs the real `pnpm --filter @rnr-ai-elements/docs build` (registry + gallery + astro build) as a child and asserts exit 0 at the observed page-count literal (67 at planning time), (b) it counts `tutorial: true` occurrences in the source frontmatter — exactly 1 post-change, 0 pre-change as the RED, (c) it asserts `tutorial` occurs >= 1 time in the build-regenerated `apps/docs/.astro/content.d.ts` (0 pre-change), and (d) it executes the scratch-copy negative pair under an owned `os.tmpdir()` root: removing only the frontmatter line leaves the build green with 0 carriers (the line is the sole carrier, and the build alone does not enforce the designation — ORI-CI-001's gate owns that), while changing the value to the non-boolean `tutorial: 'yes'` fails the real build with a collection-validation diagnostic naming the docs collection, the quickstart source, and the `tutorial` field path. The harness stays small — it orchestrates the real commands and does not become a second gate. `pnpm typecheck` and the scoped Biome command are preserved static gates.

## Scope

Own exactly two repository lines, the task-owned proof harness, plus bounded evidence. The single-tutorial gate stays unwired: no `[...id].astro` import, no `scripts/docs-data/single-tutorial.ts` on trunk, no subprocess drill, no evidence files under `tests/sprint-05-orient-search/evidence/ORI-CI-001/` — all of that remains ORI-CI-001's cycle-2 work, which this task unblocks.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

<!-- Template Version: 5.2.0 -->

> Status: ✅ Completed

Commit: ccf9d95909b0cd2827aa01ca072c8f654529f8ce

> Assignee: astro-implementer
> Priority: P1 · Points: 1 · Type: FIX
> Dependency phase: after ORI-CONT-003
> Proposed By: astro-planner
> TDD_MODE: red_first · RED_GREEN_REQUIRED: yes
> Sprint: [SPRINT.md](./SPRINT.md)
> Planned date: 2026-09-24
> Source SHA: 405523ac0716ed818020e8ff9e5aec389af7ed46

AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROGRESS: 0/2 ACs; every TDD_STATE is none. All evidence paths are future outputs.

### OUTCOME

The trunk tree declares its single tutorial as authored frontmatter metadata: exactly one published entry carries `tutorial: true` (the Quickstart at `/docs/quickstart`), the docs collection schema declares `tutorial: z.boolean().optional()`, the real public build stays green at the same page count, and ORI-CI-001's cycle 2 can wire its landed fail-closed gate against a count of 1 instead of 0 — with no product consumer of the field added or changed by this task; the task-owned proof harness orchestrates the real commands and captures the evidence without becoming a second gate.

### CRITICAL CONSTRAINTS — Never

- Never wire the single-tutorial gate into routing or the build pipeline: no change to `apps/docs/src/pages/docs/[...id].astro`, never create `scripts/docs-data/single-tutorial.ts`, never replicate the six-decision cardinality/canonicality gate in the harness, and never write evidence under `tests/sprint-05-orient-search/evidence/` — the only test-lane file this task owns is the proof harness, and ORI-CI-001 cycle 2 owns the wiring, the subprocess drill, and the six evidence files.
- Never change any existing file beyond the two lines: no other frontmatter field, no prose byte, no schema field beyond the one boolean, no route, navigation, or consumer change. The only new files are the proof harness and the `.tmp/FIX-ORI-CI-001-1/` evidence; the change to existing files is exactly `tutorial: true` in the frontmatter and `tutorial: z.boolean().optional()` in the schema.
- Never substitute a mocked collection, cached build receipt, dev-server render, or source-grep-only claim for the real `pnpm --filter @rnr-ai-elements/docs build` run; the scratch negatives must run the identical command in owned filesystem copies.
- Never mutate the candidate's authored content from a scratch copy: candidate bytes change only by the two allowed lines; scratch mutations live and die under the owned `os.tmpdir()` root.
- Never commit the gitignored generated `apps/docs/src/data/registry-items.json` (required for `pnpm typecheck` in a fresh worktree — copy or regenerate, never commit), scratch copies, or build outputs.
- Never touch in-flight surfaces (ORI-AST-004/ORI-AST-005/ORI-CI-001 branch files), planning artifacts, `human-flows.json`, or perform trunk/worktree lifecycle operations.

### DONE WHEN

- [ ] AC-1 proves the designation and schema line land with the real build green at the unchanged page count, RED captured pre-change.
- [ ] AC-2 proves the scratch-copy negative pair (removal → 0 carriers with the build still green; non-boolean value → real build failure naming source and field), the static gates, and the two-line diff boundary.
- [ ] The exact selector and preserved commands pass; independent review confirms real RED/GREEN, the scratch-pair observations, and exact scope compliance.

### SPECIFICATION

Two authored lines, a minimal task-owned proof harness, plus evidence. The harness (`tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`, exporting `runTutorialDesignationProof`) orchestrates the real commands: the real public build with exit/page-count/occurrence assertions, the regenerated-types check, and the scratch-copy negative pair. RED is the recorded pre-change trunk observation (the unowned gap made mechanical: the real build green, 0 designation occurrences in both files). GREEN is the identical selector after the two lines. This task deliberately does not duplicate ORI-CI-001's six-decision cardinality/canonicality gate.

### BOUNDARY CONTRACTS

1. `apps/docs/src/content/docs/quickstart.mdx`: add exactly one frontmatter line — `tutorial: true`. ORI-CONT-003's landed manuscript bytes are otherwise preserved exactly; no prose, import, or metadata change.
2. `apps/docs/src/content.config.ts`: add exactly one schema field to the docs collection — `tutorial: z.boolean().optional()` (the line ORI-CI-001's checkpoint 41a49601 proved behavior-neutral; landing it on trunk lets the later branch merge reconcile the identical line). No other schema change.
3. No gate wiring: `[...id].astro` untouched, `scripts/docs-data/single-tutorial.ts` absent from trunk, and no replication of the six-decision cardinality/canonicality gate anywhere. ORI-CI-001 cycle 2 owns wiring the import (removing the fallow directive on its branch), the subprocess drill, and the six evidence files.
4. Harness `tests/sprint-05-orient-search/tutorial-designation-proof.test.ts` (NEW, in the sprint lane) exports `runTutorialDesignationProof`: run the real `pnpm --filter @rnr-ai-elements/docs build` as a child and assert exit 0 at the observed page-count literal; count `tutorial: true` occurrences in the source frontmatter (exactly 1 post-change; the RED run records 0 pre-change); assert `tutorial` occurs >= 1 time in the build-regenerated `apps/docs/.astro/content.d.ts` (0 pre-change); execute the scratch-copy negative pair (frontmatter line removed → exit 0 with 0 carriers; `tutorial: 'yes'` → nonzero exit with the zod diagnostic naming the docs collection, the quickstart source, and the tutorial field path, captured verbatim from the real build output); emit the `.tmp/FIX-ORI-CI-001-1/` evidence and stop only owned children on every exit path. The harness orchestrates real commands — it never mocks the build and never becomes a second gate.
5. Scratch negatives run only in owned `os.tmpdir()` copies of the candidate; the candidate checkout is restored byte-exact (beyond the two allowed lines) and every scratch root is cleaned on success and failure.
6. Evidence is exactly `.tmp/FIX-ORI-CI-001-1/red.json`, `green.json`, `run.json`, binding candidate and harness hashes, exact commands, exit codes, the observed page count, occurrence counts, and the captured invalid-value diagnostic.

### ACCEPTANCE CRITERIA — RED → GREEN → REFACTOR

Only AC-1 is PRIMARY. All criteria run the real public docs build.

#### AC-1: The designation and schema field land with the real build green [PRIMARY]

GIVEN trunk where the Quickstart frontmatter carries only title/description/section/order(2.5) and the docs schema declares no tutorial field WHEN `tutorial: true` is added to the quickstart.mdx frontmatter and `tutorial: z.boolean().optional()` is added to the docs collection schema THEN the real public build exits 0 at the same literal page count as the recorded pre-change run (67 at planning time — the metadata line adds no pages) and emits fresh Quickstart HTML.

- PRIMARY: true
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: real Astro build and filesystem content collection
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/tutorial-designation-proof.test.ts
- TEST_FUNCTION: runTutorialDesignationProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-CI-001-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["GREEN is claimed from a cached build receipt, a dev-server render, or a static source grep over a non-built tree instead of the real public build.","The designation is carried by a hand-edited apps/docs/.astro/content.d.ts instead of the real astro-sync regeneration inside the build — a static shell standing in for the real loader output — or a mocked collection or authored success flag replaces the observed build run.","The designation or schema literal count is not exactly 1, the page count changes between RED and GREEN, or the build fails on the landed two-line tree."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_quickstart_no_designation","action":{"actor":"cli_user","steps":["Pre-change RED: on the isolated candidate, run pnpm --filter @rnr-ai-elements/docs build and capture the exit code, the literal page count, and the absence anchors — 0 occurrences of 'tutorial: true' in apps/docs/src/content/docs/quickstart.mdx and 0 occurrences of 'tutorial:' in apps/docs/src/content.config.ts; bind the candidate SHA in red.json.","Land exactly two lines: tutorial: true in the quickstart.mdx frontmatter and tutorial: z.boolean().optional() in the docs schema.","Rerun the identical build command; confirm exit 0, the same literal page count as the RED run, and fresh apps/docs/dist/docs/quickstart/index.html carrying the real Quickstart title."]},"end_state":{"must_observe":["red.json records the pre-change run: exit 0, the observed page count (67 at planning time), 0 designation occurrences in both files, and the candidate SHA.","green.json records the post-change run: exit 0, the same literal page count as RED, fresh Quickstart HTML, exactly 1 occurrence of 'tutorial: true' in the quickstart frontmatter, and exactly 1 occurrence of 'tutorial: z.boolean().optional()' in the docs schema.","The build-regenerated apps/docs/.astro/content.d.ts contains the substring 'tutorial' >= 1 time, versus 0 occurrences in the pre-change RED capture — regenerated by the build's own astro sync and bound to the build run, never hand-edited or pre-authored."],"must_not_observe":["A build failure on the landed tree, a page-count change between RED and GREEN, or a designation or schema literal count other than exactly 1.","green.json reporting an empty evidence record or a 'tutorial: true' occurrence count of (0) for the landed frontmatter — the empty signature of a static shell.","A hand-edited or cached apps/docs/.astro/content.d.ts standing in for the real regeneration, or GREEN claimed without the real build run."]}}]}
```

#### AC-2: Scratch-copy negatives prove the carrier; static gates; two-line diff

GIVEN the landed candidate WHEN two owned scratch copies rerun the identical build command — one with only the `tutorial: true` frontmatter line removed, one with the value changed to the non-boolean `tutorial: 'yes'` — THEN the removal copy still exits 0 at the same page count with 0 designation occurrences (the frontmatter line is the sole carrier, and the build alone does not enforce the designation) while the invalid-value copy exits nonzero with a collection-validation diagnostic naming the docs collection, the quickstart source, and the tutorial field path; `pnpm typecheck` and the scoped Biome command exit 0; and the repository diff is exactly the two allowlisted files.

- PRIMARY: false
- FLOW_REF: null
- TEST_TIER: integration
- VERIFICATION_SERVICE: real Astro build and filesystem content collection in owned scratch copies, the real TypeScript compiler, and the real Biome linter
- SURFACE_POLICY: null
- TDD_STATE: none
- TEST_FILE: tests/sprint-05-orient-search/tutorial-designation-proof.test.ts
- TEST_FUNCTION: runTutorialDesignationProof
- VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`
- MAPS_TO_AC: null

SCENARIO:

```json
{"id":"SC-FIX-ORI-CI-001-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection in owned scratch copies, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["The removal copy is skipped or asserted from source instead of a real build; the invalid-value copy still exits 0 (the schema field is not coupled); the static gates fail without the stash-proven pre-existing record; or any path outside the two-file allowlist changes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_quickstart_no_designation","action":{"actor":"cli_user","steps":["Scratch copy A (owned os.tmpdir() root): remove only the 'tutorial: true' frontmatter line; rerun the identical build command; record the exit code, page count, and 0 designation occurrences.","Scratch copy B: change the frontmatter value to the non-boolean tutorial: 'yes'; rerun the identical build command; capture the nonzero exit and the full validation diagnostic.","Run pnpm typecheck and pnpm exec biome ci apps/docs/src/content.config.ts on the candidate; prove any failure pre-existing with git stash && rerun before recording it. Confirm git diff --name-only reports exactly the two allowlisted files."]},"end_state":{"must_observe":["Copy A: build exit 0 at the same page count with 0 'tutorial: true' occurrences — the frontmatter line is the sole carrier and the build alone does not enforce the designation (ORI-CI-001's gate owns that enforcement).","Copy B: build exit nonzero with a collection-validation diagnostic naming the docs collection, the quickstart source, and the tutorial field path — the schema field is live and coupled to this frontmatter key through the real loader.","pnpm typecheck and the scoped Biome command exit 0 (or carry the stash-proven pre-existing record); apps/docs/src/pages/docs/[...id].astro is byte-unchanged; scripts/docs-data/single-tutorial.ts does not exist on trunk; git diff --name-only reports exactly apps/docs/src/content/docs/quickstart.mdx and apps/docs/src/content.config.ts."],"must_not_observe":["A scratch mutation leaking into the candidate checkout, an exit-0 invalid-value build, an authored or hand-copied diagnostic standing in for the real build output, or any third changed path."]}}]}
```

### TEST CRITERIA

- TC-1 → AC-1: The harness's real build is green pre-change (RED: 0 designation occurrences, page count recorded) and post-change (GREEN: exactly 1 frontmatter designation and 1 schema field, same page count, fresh Quickstart HTML). VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`
- TC-2 → AC-2: The harness's scratch-copy pair shows the removal copy green with 0 carriers and the invalid-value copy failing with the source-and-field diagnostic; static gates pass; the tracked-file diff is exactly the two modified files (the harness is the only new test-lane path). VERIFY: `pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`

### SHARED FIXTURES

```json
{"trunk_quickstart_no_designation":{"description":"An isolated candidate worktree of trunk with ORI-CONT-003's landed seed-data Quickstart (frontmatter title/description/section/order 2.5, no tutorial field) and the docs schema as landed by ORI-AST-001 (title/description/section/order/draft), plus owned scratch-copy roots under os.tmpdir() for the negative pair.","seed_method":"cli","records":["The gitignored generated apps/docs/src/data/registry-items.json is absent in a fresh worktree and gates pnpm typecheck — copy or regenerate it via pnpm registry:build inside the worktree; never commit it (stash-proven pre-existing behavior recorded in FIX-ORI-AI-002-1's handoff).","Scratch copies are full owned filesystem copies created and cleaned up by the task's commands; candidate authored-content bytes are never mutated in place; cleanup runs on success and failure within the owned scratch root only.","The expected public-build page count is the literal observed at the RED run — 67 at planning time; the invariant is RED/GREEN equality, since the metadata line adds no pages."]}}
```

### SCOPE — file-level write permissions

writeAllowed:

- apps/docs/src/content/docs/quickstart.mdx (MODIFY)
- apps/docs/src/content.config.ts (MODIFY)
- tests/sprint-05-orient-search/tutorial-designation-proof.test.ts (NEW)
- .tmp/FIX-ORI-CI-001-1/red.json (NEW)
- .tmp/FIX-ORI-CI-001-1/green.json (NEW)
- .tmp/FIX-ORI-CI-001-1/run.json (NEW)

Build outputs (apps/docs/dist/**, apps/docs/.astro/**, apps/docs/node_modules/.vite/**) and the worktree-local regenerated registry-items.json are side effects of the allowed commands in the isolated candidate — gitignored, never committed, never hand-edited. Scratch copies live and die under the owned os.tmpdir() root. No other path may change.

writeProhibited:

- apps/docs/src/pages/docs/[...id].astro
- scripts/docs-data/**
- tests/sprint-05-orient-search/** (every path except the writeAllowed harness)
- apps/docs/src/content/docs/** (every file except quickstart.mdx)
- apps/docs/src/components/**
- apps/example/**
- packages/**
- pnpm-lock.yaml
- .github/**
- .spec/**
- .kb-run-sprint/**
- human-flows.json · gate-plan.json
- Any file not explicitly listed in writeAllowed.

### BOUNDARIES — Ask First

- If the real build's page count at RED differs from 67 because trunk legitimately moved (other merged tasks added or removed pages), record the observed count and proceed — the invariant is RED/GREEN equality, not the literal 67. If the designation or schema line causes any build failure, stop and report rather than widening the change.
- If any consumer of the tutorial field appears on trunk before this task lands (making the removal-copy negative behaviorally different), report for a scope check instead of adjusting the oracle.
- If pnpm typecheck fails in the fresh worktree on the missing generated registry-items.json, copy or regenerate it (never commit); if it still fails, stash-prove pre-existing before recording.

### DELIVERABLE

- `apps/docs/src/content/docs/quickstart.mdx`: exactly one new frontmatter line, `tutorial: true`.
- `apps/docs/src/content.config.ts`: exactly one new schema field, `tutorial: z.boolean().optional()`.
- `tests/sprint-05-orient-search/tutorial-designation-proof.test.ts`: the minimal proof harness (`runTutorialDesignationProof`) — real-build exit/page-count assertions, frontmatter occurrence counts, the regenerated-types check, and the scratch-copy negative pair.
- `.tmp/FIX-ORI-CI-001-1/red.json`, `green.json`, `run.json`: the bound RED/GREEN observations and the scratch-pair negative evidence.

### AGENT INSTRUCTIONS — TDD FLOW

1. RED: author the harness; on the isolated candidate, run the exact selector pre-change — the harness captures the real build's exit 0, the literal page count, and the 0-occurrence anchors in red.json with the candidate SHA bound. Wait for orchestrator verification of RED.
2. GREEN: land the two lines; rerun the identical selector (the harness drives the real build, the occurrence and regenerated-types assertions, and the scratch-copy negative pair); then run the preserved static gates. No REFACTOR is expected — the product change is two lines.
3. Hand the candidate and evidence to astro-reviewer. Workers must not merge or perform trunk/worktree lifecycle operations.

### READING LIST — maximum five

1. `apps/docs/src/content/docs/quickstart.mdx` [PRIMARY TARGET] — the frontmatter to extend; ORI-CONT-003's landed manuscript.
2. `apps/docs/src/content.config.ts` [PRIMARY TARGET] — the docs collection schema; its own doc comment records that a schema violation fails the build with collection, source ID, and field path.
3. `.kb-run-sprint/sprint-05-orient-search/ORI-CI-001/cycle-1.blocked.json` — the gap record this task closes.
4. `ORI-CI-001-reject-missing-duplicate-or-noncanonical-published-tutorials.md` — boundary contract 5 and the cycle-2 ownership this task must not preempt.
5. `.spec/prds/docs-site/04-uc-docs.md`, UC-DOCS-02 — exactly one tutorial at `/docs/quickstart`.

### RUNTIME COMMANDS AND VERIFICATION GATES

Exact selector:

```sh
pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts
```

Preserved verification commands:

```sh
pnpm typecheck
pnpm exec biome ci apps/docs/src/content.config.ts
```

Command contract: the harness runs the real `pnpm --filter @rnr-ai-elements/docs build` as a child from the repository root — that command chains registry:build + gallery:manifest + astro build, and a fresh worktree needs the gitignored generated apps/docs/src/data/registry-items.json present for pnpm typecheck (copy or regenerate, never commit). Direct pnpm-wrapped biome invocations can die with exit 254 in shimmed agent shells (`Linter process terminated abnormally`); the working shapes are the righthook pre-commit and a clean-env invocation (env -i with explicit pnpm/node PATH) — prove a biome failure environmental before treating it as a gate failure.

### EVIDENCE GATES

1. Prerequisites: the isolated candidate established at the recorded SHA; ORI-CONT-003's Quickstart present with frontmatter title/description/section/order(2.5); registry-items.json present or regenerated.
2. Functional RED: the exact selector against the pre-change candidate, captured in red.json (exit 0, page count, 0-occurrence anchors). Wait for orchestrator verification.
3. GREEN: the identical selector post-change (same page count, fresh Quickstart HTML, exactly 1 occurrence per file), the scratch-copy negative pair, and the static gates.
4. Evidence: run.json binds candidate source and harness hashes, exact commands, exit codes, page counts, occurrence counts, and the captured invalid-value diagnostic; scratch roots cleaned. Independent review: Scenario/Requirement Contract parity, real RED/GREEN, honest scratch-pair observations, exact two-line-plus-harness scope compliance.

Planned evidence paths: .tmp/FIX-ORI-CI-001-1/red.json, .tmp/FIX-ORI-CI-001-1/green.json, .tmp/FIX-ORI-CI-001-1/run.json. Teardown: remove only the owned scratch roots; leave the candidate with exactly the two landed lines.

### FLOW OWNERSHIP AND SPRINT BOUNDARY

No locked flow belongs to this task. FLOW-DOCS-02-quickstart-chat-screen remains owned by ORI-CONT-004; the locked gate steps, human-flows.json, and gate-plan.json are unchanged; no flow evidence writes, no journey proofs. The sprint's dark proof row ORI-CI-001 stays with ORI-CI-001; this task only unblocks it.

### DEPENDENCIES AND HANDOFF

Depends on: ORI-CONT-003 (completed — approved 22780223, merged 3635ba62).

Blocks: ORI-CI-001's cycle-2 GREEN — its re-dispatch wires the landed gate into `[...id].astro` against a count of 1, authors the subprocess drill, and captures the six evidence files; indirectly ORI-CI-002, ORI-CONT-004, and the sprint's ORI-DARK-ORI-CI-001 proof.

Provides: the authored `tutorial: true` designation on trunk's single Quickstart and the trunk-side schema field; captured RED/GREEN evidence under `.tmp/FIX-ORI-CI-001-1/`.

Consumes: ORI-CONT-003's landed Quickstart manuscript; ORI-AST-001's collection schema and validation-failure contract; ORI-CI-001's checkpoint 41a49601 proof that the schema line is behavior-neutral at 67 pages.

References: CAP-DOCS-01; UC-DOCS-02; `.spec/prds/docs-site/README.md`.

Provenance: planner ask `ask-wave16-add-quickstart-tutorial-designation` (wave-16, sequence next); source task ORI-CI-001 (blocked cycle 1, commit 41a496019097428987e628863763716776026179; report saved at `.kb-run-sprint/sprint-05-orient-search/ORI-CI-001/cycle-1.blocked.json`, sha256 c5805b892ff2b27c31ed4d00a844a66e2fafed3f4fe26547459ee4677c3ccacd, item ORI-CI-001:blocked:1:scope_impact:0); proposed by astro-planner.

### OUT OF SCOPE

Wiring the single-tutorial gate into `[...id].astro` or any build pipeline; creating `scripts/docs-data/single-tutorial.ts`, the vitest drill, or the six ORI-CI-001 evidence files; any other authored-content change; navigation, route, component, or consumer changes; ORI-CI-001's in-flight branch; dependency or lockfile changes; journey proofs; planning-artifact edits; tracker mutation; trunk/worktree lifecycle operations.

### AGENT RATIONALE AND REVIEW

Must pass: functional RED and GREEN bound to the real public build with page-count equality; exactly 1 `tutorial: true` frontmatter occurrence and exactly 1 `tutorial: z.boolean().optional()` schema occurrence; the scratch-copy pair observed on real builds (removal green with 0 carriers; non-boolean value failing with the source-and-field diagnostic); static gates green or stash-proven pre-existing; `[...id].astro` untouched and no gate file on trunk; only the two allowlisted files changed; no stub, fake success, or authored diagnostic. Should verify: the invalid-value diagnostic is captured verbatim from the real build output, not paraphrased; the RED observation is presented as the recorded pre-change gap (an absence), never dressed up as a failing build; designation completion is not presented as ORI-CI-001 acceptance. Verdict: APPROVED or NEEDS_FIXES with failed ACs, concrete files/lines and missing evidence.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"FIX-ORI-CI-001-1","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"trunk_quickstart_no_designation":{"description":"An isolated candidate worktree of trunk with ORI-CONT-003's landed seed-data Quickstart (frontmatter title/description/section/order 2.5, no tutorial field) and the docs schema as landed by ORI-AST-001 (title/description/section/order/draft), plus owned scratch-copy roots under os.tmpdir() for the negative pair.","seed_method":"cli","records":["The gitignored generated apps/docs/src/data/registry-items.json is absent in a fresh worktree and gates pnpm typecheck — copy or regenerate it via pnpm registry:build inside the worktree; never commit it (stash-proven pre-existing behavior recorded in FIX-ORI-AI-002-1's handoff).","Scratch copies are full owned filesystem copies created and cleaned up by the task's commands; candidate authored-content bytes are never mutated in place; cleanup runs on success and failure within the owned scratch root only.","The expected public-build page count is the literal observed at the RED run — 67 at planning time; the invariant is RED/GREEN equality, since the metadata line adds no pages."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","name":"The designation and schema field land with the real build green","primary":true,"description":"GIVEN trunk where the Quickstart frontmatter carries only title/description/section/order(2.5) and the docs schema declares no tutorial field WHEN tutorial: true is added to the quickstart.mdx frontmatter and tutorial: z.boolean().optional() is added to the docs collection schema THEN the real public build exits 0 at the same literal page count as the recorded pre-change run (67 at planning time — the metadata line adds no pages) and emits fresh Quickstart HTML.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/tutorial-designation-proof.test.ts","test_function":"runTutorialDesignationProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-CI-001-1-1","use_case_ref":"UC-DOCS-02","ac_ref":"AC-1","primary":true,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["GREEN is claimed from a cached build receipt, a dev-server render, or a static source grep over a non-built tree instead of the real public build.","The designation is carried by a hand-edited apps/docs/.astro/content.d.ts instead of the real astro-sync regeneration inside the build — a static shell standing in for the real loader output — or a mocked collection or authored success flag replaces the observed build run.","The designation or schema literal count is not exactly 1, the page count changes between RED and GREEN, or the build fails on the landed two-line tree."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_quickstart_no_designation","action":{"actor":"cli_user","steps":["Pre-change RED: on the isolated candidate, run pnpm --filter @rnr-ai-elements/docs build and capture the exit code, the literal page count, and the absence anchors — 0 occurrences of 'tutorial: true' in apps/docs/src/content/docs/quickstart.mdx and 0 occurrences of 'tutorial:' in apps/docs/src/content.config.ts; bind the candidate SHA in red.json.","Land exactly two lines: tutorial: true in the quickstart.mdx frontmatter and tutorial: z.boolean().optional() in the docs schema.","Rerun the identical build command; confirm exit 0, the same literal page count as the RED run, and fresh apps/docs/dist/docs/quickstart/index.html carrying the real Quickstart title."]},"end_state":{"must_observe":["red.json records the pre-change run: exit 0, the observed page count (67 at planning time), 0 designation occurrences in both files, and the candidate SHA.","green.json records the post-change run: exit 0, the same literal page count as RED, fresh Quickstart HTML, exactly 1 occurrence of 'tutorial: true' in the quickstart frontmatter, and exactly 1 occurrence of 'tutorial: z.boolean().optional()' in the docs schema.","The build-regenerated apps/docs/.astro/content.d.ts contains the substring 'tutorial' >= 1 time, versus 0 occurrences in the pre-change RED capture — regenerated by the build's own astro sync and bound to the build run, never hand-edited or pre-authored."],"must_not_observe":["A build failure on the landed tree, a page-count change between RED and GREEN, or a designation or schema literal count other than exactly 1.","green.json reporting an empty evidence record or a 'tutorial: true' occurrence count of (0) for the landed frontmatter — the empty signature of a static shell.","A hand-edited or cached apps/docs/.astro/content.d.ts standing in for the real regeneration, or GREEN claimed without the real build run."]}}]}},{"id":"AC-2","type":"acceptance_criterion","name":"Scratch-copy negatives prove the carrier; static gates; two-line diff","primary":false,"description":"GIVEN the landed candidate WHEN two owned scratch copies rerun the identical build command — one with only the tutorial: true frontmatter line removed, one with the value changed to the non-boolean tutorial: 'yes' — THEN the removal copy still exits 0 at the same page count with 0 designation occurrences (the frontmatter line is the sole carrier, and the build alone does not enforce the designation) while the invalid-value copy exits nonzero with a collection-validation diagnostic naming the docs collection, the quickstart source, and the tutorial field path; pnpm typecheck and the scoped Biome command exit 0; and the repository's tracked-file diff is exactly the two modified files, with the harness as the only new test-lane path.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/tutorial-designation-proof.test.ts","test_function":"runTutorialDesignationProof","verify":"pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts","test_tier":"integration","verification_service":"real Astro build and filesystem content collection in owned scratch copies, the real TypeScript compiler, and the real Biome linter","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-FIX-ORI-CI-001-1-2","use_case_ref":"UC-DOCS-02","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection in owned scratch copies, the real TypeScript compiler, and the real Biome linter","negative_control":{"would_fail_if":["The removal copy is skipped or asserted from source instead of a real build; the invalid-value copy still exits 0 (the schema field is not coupled); the static gates fail without the stash-proven pre-existing record; or any path outside the two-file allowlist changes."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"trunk_quickstart_no_designation","action":{"actor":"cli_user","steps":["Scratch copy A (owned os.tmpdir() root): remove only the 'tutorial: true' frontmatter line; rerun the identical build command; record the exit code, page count, and 0 designation occurrences.","Scratch copy B: change the frontmatter value to the non-boolean tutorial: 'yes'; rerun the identical build command; capture the nonzero exit and the full validation diagnostic.","Run pnpm typecheck and pnpm exec biome ci apps/docs/src/content.config.ts on the candidate; prove any failure pre-existing with git stash && rerun before recording it. Confirm git diff --name-only reports exactly the two allowlisted files."]},"end_state":{"must_observe":["Copy A: build exit 0 at the same page count with 0 'tutorial: true' occurrences — the frontmatter line is the sole carrier and the build alone does not enforce the designation (ORI-CI-001's gate owns that enforcement).","Copy B: build exit nonzero with a collection-validation diagnostic naming the docs collection, the quickstart source, and the tutorial field path — the schema field is live and coupled to this frontmatter key through the real loader.","pnpm typecheck and the scoped Biome command exit 0 (or carry the stash-proven pre-existing record); apps/docs/src/pages/docs/[...id].astro is byte-unchanged; scripts/docs-data/single-tutorial.ts does not exist on trunk; git diff --name-only reports exactly apps/docs/src/content/docs/quickstart.mdx and apps/docs/src/content.config.ts."],"must_not_observe":["A scratch mutation leaking into the candidate checkout, an exit-0 invalid-value build, an authored or hand-copied diagnostic standing in for the real build output, or any third changed path."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The harness's real build is green pre-change (RED: 0 designation occurrences, page count recorded) and post-change (GREEN: exactly 1 frontmatter designation and 1 schema field, same page count, fresh Quickstart HTML).","verify":"pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"The harness's scratch-copy pair shows the removal copy green with 0 carriers and the invalid-value copy failing with the source-and-field diagnostic; static gates pass; the tracked-file diff is exactly the two modified files (the harness is the only new test-lane path).","verify":"pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts","maps_to_ac":"AC-2"}]}
-->
</details>

## Handoff

```json
{
  "task": "FIX-ORI-CI-001-1",
  "commit_sha": "ccf9d95909b0cd2827aa01ca072c8f654529f8ce",
  "done": "Landed on the task branch at ccf9d959 and merged to main as cf5f3c1b: exactly two product lines — tutorial: true added to apps/docs/src/content/docs/quickstart.mdx frontmatter and tutorial: z.boolean().optional() added to the apps/docs/src/content.config.ts docs schema — plus the task-owned proof harness tests/sprint-05-orient-search/tutorial-designation-proof.test.ts (runTutorialDesignationProof) and the three evidence files .tmp/FIX-ORI-CI-001-1/{red,green,run}.json, all bound to candidate 8ece2a6c and final harness sha256 6e7d68cc08626b72. RED ran on the byte-identical pre-change tree (the two lines stash-stashed): the real pnpm --filter @rnr-ai-elements/docs build exits 0 at the literal '67 page(s) built' with 0 designation occurrences in the frontmatter, schema, .astro/content.d.ts, and .astro/collections/docs.schema.json, and the selector exits 1 on the exactly-1 assertion. GREEN: build exit 0 at the same 67 pages, exactly 1 designation and 1 schema field, fresh Quickstart HTML, the sync-regenerated collection schema carrying the field, removal scratch copy exit 0 at 67 pages with 0 frontmatter carriers, and invalid-value scratch copy (tutorial: 'yes') exit 1 with the verbatim [InvalidContentEntryDataError] docs → quickstart tutorial diagnostic; scratch roots cleaned on success and failure; typecheck, scoped biome, and fallow all exit 0. The single-tutorial gate stays unwired — [...id].astro byte-unchanged and scripts/docs-data/single-tutorial.ts absent — so ORI-CI-001 cycle 2 is unblocked against a count of 1.",
  "deviations": [
    "The charter's regenerated-types anchor (content.d.ts contains 'tutorial' >= 1) is unsatisfiable under Astro 7 — content.d.ts only emits InferEntrySchema<\"docs\"> references (0 occurrences post-change) — so the harness records both content.d.ts per the charter and the literal-carrying build-regenerated apps/docs/.astro/collections/docs.schema.json (0 in RED → 1 in GREEN), anchored at tests/sprint-05-orient-search/tutorial-designation-proof.test.ts:63.",
    "The scope check diffs against HEAD minus the task-owned new files (the harness and .tmp/FIX-ORI-CI-001-1/) rather than the charter's literal 'git diff --name-only reports exactly the two files', because the literal form is staging-state dependent once the harness and evidence are staged; see tests/sprint-05-orient-search/tutorial-designation-proof.test.ts:255.",
    "The harness's RED exit code is 1 (its exactly-1 designation assertion fails on the gap) while red.json records the build itself as green at 67 pages — consistent with the charter's 'gap recorded as an absence', stated here so a reviewer does not mistake the nonzero selector exit for a failed build."
  ],
  "concerns": [
    "In the removal scratch copy the regenerated docs.schema.json still carries 'tutorial' (the schema declaration persists there), so the removal-copy oracle is the frontmatter carrier count, not the schema-json count — the harness comments this at the runRemovalCopy oracle and records both numbers in green.json.",
    "The invalid-value diagnostic in green.json/run.json embeds ANSI escape sequences because it is captured verbatim from real build output; strip escapes before substring-matching it in downstream tooling.",
    "Scratch copies symlink node_modules back to the candidate worktree, so a scratch build shares the real node_modules/.astro cache path; the harness clears it before every scratch build, but a future harness running scratch builds concurrently with a build in the same worktree could thrash that cache.",
    "Scratch copies exclude tests/sprint-05-orient-search/evidence; if a future docs build or prebuild ever reads that directory, the scratch shape diverges from the candidate and the harness filter at tests/sprint-05-orient-search/tutorial-designation-proof.test.ts:76 must be revisited."
  ],
  "findings": [
    "Under Astro 7 the build-regenerated literal-carrying artifact for collection schema fields is .astro/collections/docs.schema.json, not .astro/content.d.ts — any future task asserting generated-types content should key on the schema.json.",
    "The real build's page-count literal is printed as '67 page(s) built' and the harness parses it with /(\\d+) page\\(s\\) built/; the AC invariant is RED/GREEN equality, so trunk legitimately adding or removing docs pages later does not break the harness.",
    "The invalid-value build failure surfaces as [InvalidContentEntryDataError] naming the docs collection, the quickstart source, and the tutorial field path — ORI-CI-001's gate work can reuse this exact diagnostic shape.",
    "Full-repo biome via pnpm-wrapped invocation dies environmentally in shimmed agent shells (exit 254, 'Linter process terminated abnormally'); the working shapes are the righthook pre-commit and env -i clean-env invocations, and clean-env 'biome ci .' exits 0 with only the biome.json 'recommended' deprecation info (non-fatal).",
    "The fallow pre-commit gate excludes inherited findings (74 inherited dead-code issues were excluded) but fails on any NEW finding, including one function exceeding its size/complexity thresholds — the harness had to be decomposed (runScratchNegativePair at tests/sprint-05-orient-search/tutorial-designation-proof.test.ts:433, phaseSummary at tests/sprint-05-orient-search/tutorial-designation-proof.test.ts:474) before the gate went green.",
    "Fresh-worktree setup order that made every gate judgeable: pnpm install, pnpm registry:build, pnpm gallery:manifest, pnpm --filter @rnr-ai-elements/docs prebuild — the gitignored apps/docs/src/data/registry-items.json is absent otherwise and pnpm typecheck fails on it."
  ],
  "scope_impact": [
    {
      "target": "FIX-ORI-CI-001-1",
      "found": "Boundary contract 4 and the reviewer verification key pin the regenerated-types assertion to apps/docs/.astro/content.d.ts, which Astro 7 never fills with field-name literals.",
      "change": "Treat .astro/collections/docs.schema.json occurrence counts (recorded in red.json/green.json/run.json alongside the content.d.ts counts) as the verification key for the regenerated-types assertion in review and any future re-runs of the selector."
    },
    {
      "target": "ORI-CI-001",
      "found": "Cycle 2's prerequisite now holds on main (count observes 1; the schema field is live and coupled to the frontmatter key through the real loader, with the failure diagnostic shape proven), but the plan's merge note predates the verified diagnostic.",
      "change": "Cycle 2 can wire assertSinglePublishedTutorial into [...id].astro against a count of 1 and reuse the captured [InvalidContentEntryDataError] docs → quickstart tutorial diagnostic for its six evidence files; when its branch merges main, the identical schema line reconciles with no conflict."
    }
  ],
  "feedback": [
    "Author the harness lint- and fallow-clean BEFORE the first RED capture: this cycle's RED/GREEN evidence had to be regenerated several times because biome's useTemplate fixes and a fallow complexity finding forced harness edits after evidence capture, and the three evidence files must all bind the same harness sha256 to be mechanically verifiable.",
    "The full-repo-shaped scratch copy with symlinked node_modules plus a cache clear is a cheap, faithful way to run the identical composite build command over mutated content — worth promoting to the sprint's shared test conventions alongside the existing docs-collection.test.ts precedent.",
    "Charter evidence anchors that depend on generated-file contents should be validated against the toolchain version at planning time (one grep of the regenerated file would have caught the content.d.ts mismatch) — it cost several multi-minute build cycles here."
  ]
}
```
