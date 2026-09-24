## What this does

Makes the public Astro build reject a published collection with no tutorial, multiple tutorials, or a sole tutorial outside `/docs/quickstart`.

## Why

UC-DOCS-02 requires one canonical tutorial. Checking only routes selected for rendering could hide an invalid published entry and let the build pass.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts`. The test must run the actual `pnpm --filter @rnr-ai-elements/docs build` command against real content in owned filesystem copies, observe each specified failure, restore the source bytes, and observe success again.

## Scope

Owns tutorial enforcement in the collection schema and route generator, one validation module, one integration test, and six evidence files. Authored content changes occur only as temporary mutations in owned scratch copies during verification. Workflow wiring belongs to ORI-CI-002 and ORI-CI-003.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

# ORI-CI-001: Reject missing, duplicate, or noncanonical published tutorials

> Status: ✅ Completed

Commit: 1d9d9e783e2316ed1c2c79cc80e788ca758e779d
> Assignee: astro-implementer
> Priority: P1 · Points: 3 · Type: INFRA
> Dependency phase: After ORI-AST-001 and ORI-CONT-003
> Proposed By: ghactions-planner · Co-authored By: none
> TDD_MODE: skipped · RED_GREEN_REQUIRED: false
> Sprint: [sprint-05-orient-search](./SPRINT.md)
> Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=ghactions-planner | implementer=astro-implementer | reviewer=astro-reviewer
> Progress: Not started; every AC has TDD_STATE none. Evidence paths are planned outputs.

## Outcome

The public docs build accepts exactly one published tutorial at `/docs/quickstart` and rejects missing, duplicate, or noncanonical designations with source-identifying diagnostics.

## Critical constraints

- Never edit authored content, registry/example implementation, workflow files, planning artifacts, or repository files outside the exact allowlist. Negative content mutations belong exclusively to owned scratch copies.
- Validate the complete published collection before route filtering, using the collection and route generator's actual publication rules.
- Require exactly one published tutorial and its canonical destination `/docs/quickstart`; never silently select a winner, suppress a violation, or downgrade failure to a warning.
- Exercise the real public Astro build. No mocked collection, fake filesystem, stubbed subprocess, cached success receipt, skipped case, or unrelated earlier build failure satisfies acceptance.
- Preserve shared WIP. Use the assigned isolated candidate and OS-derived scratch roots; never stash, reset, clean, broadly stage, or perform trunk lifecycle operations.

## Done when

- [ ] AC-1 proves the original one-tutorial tree builds and emits fresh Quickstart HTML.
- [ ] AC-2 through AC-4 prove duplicate, missing, and noncanonical failures, including publication-rule parity.
- [ ] AC-5 proves byte-exact restoration and a successful repeat of the identical build command.
- [ ] The locked test command, `pnpm typecheck`, and `pnpm lint` pass; the independent reviewer reproduces the task proof.
- [ ] Only allowed repository files change, and the six evidence files contain source-bound observations rather than planned or fabricated results.

## Acceptance criteria

All criteria are task-local integration proofs: PRIMARY is false, FLOW_REF and SURFACE_POLICY are null. No human flow or journey is assigned to this build-enforcement task. The rendering contract permits this non-FEATURE binding; it does not reduce the required runtime proof.

### AC-1: Valid canonical tutorial

GIVEN the real prerequisite content contains exactly one published tutorial at /docs/quickstart WHEN the public Astro build runs THEN it exits 0 and emits fresh Quickstart HTML.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none
VERIFICATION_SERVICE: real Astro build and filesystem content collection
SURFACE_POLICY: null
TEST_FILE: tests/sprint-05-orient-search/single-tutorial-gate.test.ts
TEST_FUNCTION: ORI-CI-001-positive
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-positive`

SCENARIO:
```json
{"id":"SC-ORI-CI-001-1","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["The build is a no-op or returns static success without loading the real collection and emitting Quickstart HTML."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["Create an owned filesystem copy of the prerequisite-complete candidate with fresh build outputs.","Run pnpm --filter @rnr-ai-elements/docs build in that copy."]},"end_state":{"must_observe":["Build exit code 0 with exactly 1 published tutorial at /docs/quickstart.","Fresh apps/docs/dist/docs/quickstart/index.html contains a decoded title whose text == the title read from the real Quickstart source."],"must_not_observe":["Missing or empty Quickstart HTML.","A tutorial-validation failure on the original one-tutorial tree."]}}]}
```

### AC-2: Duplicate and draft boundary

GIVEN the real Quickstart is copied to a second published slug WHEN the public Astro build runs THEN it rejects both tutorial source IDs; an unpublished copy does not count.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none
VERIFICATION_SERVICE: real Astro build and filesystem content collection
SURFACE_POLICY: null
TEST_FILE: tests/sprint-05-orient-search/single-tutorial-gate.test.ts
TEST_FUNCTION: ORI-CI-001-duplicate
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-duplicate`

SCENARIO:
```json
{"id":"SC-ORI-CI-001-2","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["Validation is disconnected from the build, filters to Quickstart before counting, or counts an unpublished copy as a published tutorial."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In the owned copy, duplicate the real Quickstart source at slug ori-ci-001-second-tutorial, preserving tutorial designation and published status.","Run pnpm --filter @rnr-ai-elements/docs build without adding the duplicate to navigation."]},"end_state":{"must_observe":["Nonzero build exit with a tutorial-cardinality diagnostic reporting 2 published tutorials and both actual source IDs."],"must_not_observe":["Exit code 0 for the duplicate tree.","An empty diagnostic or failure caused only by an earlier unrelated build stage."]}},{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In a fresh owned copy, duplicate Quickstart at slug ori-ci-001-second-tutorial and mark only the copy unpublished using the prerequisite schema's actual publication metadata.","Run pnpm --filter @rnr-ai-elements/docs build."]},"end_state":{"must_observe":["Build exit code 0 with 1 published tutorial at /docs/quickstart."],"must_not_observe":["A duplicate-tutorial failure caused by the unpublished copy, or missing or empty Quickstart HTML at /docs/quickstart.","Published HTML for /docs/ori-ci-001-second-tutorial."]}}]}
```

### AC-3: Missing designation

GIVEN the real Quickstart remains published but loses its tutorial designation WHEN the public Astro build runs THEN it fails with observed count 0 and expected canonical destination /docs/quickstart.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none
VERIFICATION_SERVICE: real Astro build and filesystem content collection
SURFACE_POLICY: null
TEST_FILE: tests/sprint-05-orient-search/single-tutorial-gate.test.ts
TEST_FUNCTION: ORI-CI-001-missing
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-missing`

SCENARIO:
```json
{"id":"SC-ORI-CI-001-3","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["The gate is disconnected or treats an empty tutorial set as successful."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In a fresh owned copy, remove the real Quickstart tutorial designation while preserving its content and published route.","Run pnpm --filter @rnr-ai-elements/docs build."]},"end_state":{"must_observe":["Nonzero build exit with a tutorial diagnostic stating observed 0, expected 1, and /docs/quickstart.","The diagnostic includes the exact source ID read from the published entry at `/docs/quickstart` whose tutorial designation was removed."],"must_not_observe":["Exit code 0 for the zero-tutorial tree.","An empty diagnostic or failure caused only by an earlier unrelated build stage."]}}]}
```

### AC-4: Noncanonical destination

GIVEN the sole designated tutorial moves to /docs/ori-ci-001-moved-tutorial WHEN the public Astro build runs THEN it fails naming the source, actual route, and required /docs/quickstart destination.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none
VERIFICATION_SERVICE: real Astro build and filesystem content collection
SURFACE_POLICY: null
TEST_FILE: tests/sprint-05-orient-search/single-tutorial-gate.test.ts
TEST_FUNCTION: ORI-CI-001-noncanonical
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-noncanonical`

SCENARIO:
```json
{"id":"SC-ORI-CI-001-4","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["Canonical-route validation is a no-op or accepts any sole tutorial destination."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In a fresh owned copy, move the real designated tutorial to slug ori-ci-001-moved-tutorial through the actual content route convention, retaining exactly one published designation.","Run pnpm --filter @rnr-ai-elements/docs build."]},"end_state":{"must_observe":["Nonzero build exit naming the actual source ID, /docs/ori-ci-001-moved-tutorial, and required /docs/quickstart."],"must_not_observe":["Exit code 0 for the noncanonical tree.","An empty diagnostic or failure caused only by an earlier unrelated build stage."]}}]}
```

### AC-5: Restoration and reproducibility

GIVEN the negative mutations have run in owned copies WHEN original content is restored and the identical build command reruns THEN source hashes match baseline and fresh Quickstart HTML builds successfully.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none
VERIFICATION_SERVICE: real Astro build and filesystem content collection
SURFACE_POLICY: null
TEST_FILE: tests/sprint-05-orient-search/single-tutorial-gate.test.ts
TEST_FUNCTION: ORI-CI-001-restored
VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-restored`

SCENARIO:
```json
{"id":"SC-ORI-CI-001-5","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["Restoration is a no-op, the build reuses a static success receipt, or content mutations escape into the candidate checkout."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["Execute the real positive, duplicate, missing, and noncanonical build cases; retain the captured baseline content bytes and hashes.","Restore original content and remove only owned duplicate or moved entries in the scratch copies.","With fresh build outputs, rerun pnpm --filter @rnr-ai-elements/docs build and compare source hashes and candidate content bytes with baseline."]},"end_state":{"must_observe":["Restored build exit code 0 and fresh apps/docs/dist/docs/quickstart/index.html containing the real Quickstart title.","For every restored source, SHA-256(restored bytes) == SHA-256(baseline bytes); changed candidate authored-content files == 0."],"must_not_observe":["Missing or empty restored Quickstart HTML.","Residual ori-ci-001-second-tutorial or ori-ci-001-moved-tutorial entries, changed candidate content, or a reused receipt."]}}]}
```

## Test criteria

- TC-1 → AC-1: The positive run exits 0 and its fresh Quickstart HTML contains the real title. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-positive`.
- TC-2 → AC-2: A published duplicate fails naming both sources, while an unpublished duplicate leaves one published tutorial and passes. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-duplicate`.
- TC-3 → AC-3: Removing the designation fails with observed 0, expected 1, the Quickstart source ID, and /docs/quickstart. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-missing`.
- TC-4 → AC-4: Moving the sole tutorial fails naming its actual source, /docs/ori-ci-001-moved-tutorial, and /docs/quickstart. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-noncanonical`.
- TC-5 → AC-5: Restored content hashes match baseline, candidate content is unchanged, and the identical build command emits fresh Quickstart HTML. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-restored`.

Test criteria inherit their mapped AC scenario and define no independent fixture or scenario.

## Shared fixtures

```json
{"real_quickstart_tree":{"description":"An owned filesystem copy of the actual candidate after ORI-AST-001 and ORI-CONT-003, loaded through the real Astro content and build entrypoints.","seed_method":"cli","records":["The actual Quickstart source declares tutorial: true and publishes at /docs/quickstart.","Exactly 1 entry in the complete published collection is designated a tutorial.","All other real content, source imports, publication metadata, and build prerequisites are preserved; baseline source bytes and hashes are captured before mutation."]}}
```

Create copies through the test CLI using the real filesystem and `os.tmpdir()`. Content files are the product's normal authoring input; never inject collection objects or rendered views. Use the prerequisite schema's real publication field and canonical route convention. Mutable content and build outputs must not be symlinked back into the candidate. Cleanup runs on success and failure, within the owned scratch root only.

## Scope: file-level write permissions

writeAllowed:
- apps/docs/src/content.config.ts
- apps/docs/src/pages/docs/[...id].astro
- scripts/docs-data/single-tutorial.ts
- tests/sprint-05-orient-search/single-tutorial-gate.test.ts
- tests/sprint-05-orient-search/evidence/ORI-CI-001/manifest.json
- tests/sprint-05-orient-search/evidence/ORI-CI-001/positive.log
- tests/sprint-05-orient-search/evidence/ORI-CI-001/duplicate.log
- tests/sprint-05-orient-search/evidence/ORI-CI-001/missing.log
- tests/sprint-05-orient-search/evidence/ORI-CI-001/noncanonical.log
- tests/sprint-05-orient-search/evidence/ORI-CI-001/restored.log

writeProhibited:
- Authored content
- Registry and example implementation
- Workflow files
- Planning artifacts

Every repository path outside writeAllowed is prohibited. The authorized scratch mutations do not authorize authored-content changes in the candidate.

## Boundary contracts

1. Validate tutorial metadata against the complete published collection before route filtering.
2. Require exactly one published tutorial, whose canonical destination is /docs/quickstart.
3. Apply the same draft/publication rules as the actual collection and route generator.
4. Report offending source IDs and propagate failure through Astro and the public build command.
5. ORI-CONT-003 authors tutorial: true against the declared schema contract; it must not depend on completion of this enforcement task.
6. Content review remains responsible for detecting an undeclared second tutorial. Metadata cardinality alone cannot prove accurate classification.

## Boundaries: Always / Ask first

Always:
- Consume the prerequisite schema and real Quickstart content before implementing enforcement.
- Keep the invariant in deterministic typed code, invoked by the actual Astro build before route selection.
- Preserve raw child-process status and output; distinguish tutorial violations from setup errors.
- Use fresh owned content/build copies and restore their source bytes before the final passing build.
- Record evidence only from observed runs and preserve prior run identity in the allowed evidence files.

Ask first:
- Any dependency or write-scope change beyond the locked task.
- A change to the prerequisite metadata, publication, or canonical-route contract.
- Any request to introduce workflow, credential, deployment, or external mutation work.

These boundaries apply during subsequent implementation. This charter rendering performs no implementation or product verification.

## Deliverables

- `scripts/docs-data/single-tutorial.ts` — deterministic tutorial-cardinality and canonical-destination validation with source-identifying diagnostics.
- `apps/docs/src/content.config.ts` and `apps/docs/src/pages/docs/[...id].astro` — integrate the declared metadata contract and complete-collection validation into the real build without changing publication semantics.
- `tests/sprint-05-orient-search/single-tutorial-gate.test.ts` — real subprocess integration drill with five stable test tokens and the unpublished-copy boundary case.
- The six allowed evidence files — manifest plus positive, duplicate, missing, noncanonical, and restored execution logs.

## Agent instructions

TDD_MODE is skipped because this task configures build enforcement without an independent visitor action. This classification does not waive tests or seeded integration evidence. Expected negative build exits are required discriminating observations; they are not claims that a RED-first feature cycle ran.

1. Read prerequisite outputs and capture candidate identity. If the schema, real Quickstart, or build prerequisites are unavailable, report the concrete blocker; do not fabricate replacements.
2. Implement the deterministic gate and invoke it on the complete published collection before route filtering. Reuse the declared publication and route rules.
3. Implement the real filesystem drill inside the owned test file. A selected test token must execute fresh setup and the real build it proves. Shared setup may run the complete drill once per invocation; previous receipts cannot replace execution.
4. Run the locked suite and required quality gates. A positive build failure blocks attribution of later negative cases. Each rejected mutation must carry the tutorial-specific diagnostic, and the restored run must use the identical command.
5. Capture evidence, scan touched production/test files for stubs, skips, placeholders, fake success, and deferred required behavior, then hand the isolated candidate to astro-reviewer. Workers do not merge or perform trunk lifecycle operations.

## Reading list

1. `scripts/docs-data/gates.ts`, lines 1–81 — PRIMARY PATTERN: deterministic violations, source identity, and propagation through build errors. Read as a pattern; this file is outside the write allowlist.
2. `tests/sprint-04-generated-reference/enrichment-drill.test.ts` — real child-process execution, discriminating output assertions, source-hash restoration, and fresh shared setup. Keep this task's mutations in scratch copies.
3. `.spec/prds/docs-site/04-uc-docs.md`, UC-DOCS-02 — exactly one tutorial at `/docs/quickstart`.
4. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`, Quickstart and content gates — machine enforcement complements authored-content review.
5. `/Users/justinrich/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md`, What authors must do — OS-derived scratch roots, owned cleanup, and external reaper boundary.

## Design and coding guidance

This task changes build behavior and has no visual design deliverable. Follow the existing docs-data diagnostic style, the prerequisite collection schema, and the actual route convention. Use explicit types, named exports, static imports, and deterministic parsing/validation. Do not add runtime UI, new dependencies, environment switches, alternate content classifications, or a second publication predicate.

## Evidence gates

1. Readiness and scope: ORI-AST-001 and ORI-CONT-003 outputs are present; candidate identity and owned scratch roots are recorded. Review changed paths against the exact allowlist, including new files.
2. Required quality checks: `pnpm typecheck` and `pnpm lint`, each exit 0. Root typecheck excludes apps; do not present it as an Astro route typecheck.
3. Required integration command: `pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts`, exit 0. Every build case invokes `pnpm --filter @rnr-ai-elements/docs build`; direct validator calls alone are insufficient.
4. Causal evidence: positive and restored builds exit 0 and emit fresh Quickstart HTML; duplicate, missing, and noncanonical builds exit nonzero for their exact tutorial violations; the unpublished duplicate follows the real publication rules.
5. Independent acceptance: astro-reviewer reruns the task proof against the candidate, checks source restoration and evidence hashes, and rejects stubs, skipped cases, stale receipts, unrelated failures, or changes outside scope. The orchestrator validates charter/scenario projections and sprint flow coverage.

Evidence destinations are future outputs:

| Path | Required observation |
|---|---|
| tests/sprint-05-orient-search/evidence/ORI-CI-001/manifest.json | Run identity, candidate/source and lockfile hashes, test/gate hashes, exact command and cwd per run, actual source IDs/routes/publication states, before/after content hashes, exit codes, log hashes, and emitted Quickstart artifact hash |
| tests/sprint-05-orient-search/evidence/ORI-CI-001/positive.log | Original content build output, exit status, and fresh Quickstart observation |
| tests/sprint-05-orient-search/evidence/ORI-CI-001/duplicate.log | Published duplicate rejection naming both sources and the unpublished-copy comparison |
| tests/sprint-05-orient-search/evidence/ORI-CI-001/missing.log | Zero-tutorial rejection, canonical expectation, and Quickstart source identity |
| tests/sprint-05-orient-search/evidence/ORI-CI-001/noncanonical.log | Rejection naming the actual source, moved destination, and canonical destination |
| tests/sprint-05-orient-search/evidence/ORI-CI-001/restored.log | Byte-exact restoration and fresh successful repeat of the identical command |

Append identifiable runs within these exact files; do not invent additional evidence paths. No command has been run or artifact observed as part of this charter rendering.

## Security and CI handoff

Local filesystem access is restricted to the assigned checkout and owned scratch copies. No credentials or external mutations are required. GitHub permission requirement is `contents: read`; secrets are empty. This task introduces no workflow actions, OIDC grant, deployment, or attestation operation. Action SHA pinning, workflow permissions, and hosted artifact handling remain with the downstream CI owners. Source/log hashes here establish local evidence identity and are not a hosted attestation.

## Out of scope

- Authoring or reclassifying real documentation content; ORI-CONT-003 owns Quickstart authoring.
- Detecting an undeclared second tutorial through semantic prose analysis; content review owns that judgment.
- Workflow files, hosted checks, required-check configuration, publication, deployment, and credentials.
- Registry/example implementation, native/browser feature verification, new human flows, or journey ownership.
- Dependency changes, unrelated build repairs, refactors, and planning-artifact edits.

## Context and references

At rendering time, `apps/docs/src/content.config.ts` and `apps/docs/src/pages/docs/[...id].astro` are absent in this checkout. They are prerequisite surfaces supplied by ORI-AST-001; this observation is not an implementation failure claim. The current docs package declares the public build command, and this task must preserve that entrypoint. The missing capability is enforcement of the single-tutorial invariant over the complete published collection.

PRD references: `.spec/prds/docs-site/04-uc-docs.md#uc-docs-02-build-a-chat-screen-with-the-single-quickstart-tutorial`; `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md`; capability `CAP-DOCS-01` in `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`.

The fixed sprint gate remains: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half). The sprint retains 13 flows: 9 task flows and 4 journeys. This task owns none of those flows; its dark proof step is ORI-DARK-ORI-CI-001. It adds no canonical RED path or journey proof.

## Review for astro-reviewer

Must pass:
- Complete published collection is validated before route filtering, with the same publication and canonical-route rules as production.
- All five ACs and the unpublished-copy boundary run through the actual public build and produce their specified observations.
- Each failure identifies the tutorial violation and relevant source IDs; an earlier unrelated failure is rejected as proof.
- Restoration hashes, fresh HTML, evidence identity, and exact write scope are verified independently.
- No required behavior is stubbed, skipped, deferred, or represented by a cached/static success result.

Should verify:
- Typed gate code follows the existing docs-data diagnostic pattern without introducing a parallel collection model.
- Scratch copies isolate mutable inputs and build outputs from the candidate and shared WIP.
- Missing-designation diagnostics explain the canonical expectation even though the designated tutorial set is empty.
- Metadata enforcement does not claim to classify prose or replace content review.

Verdict: APPROVED or NEEDS_FIXES, with file/line references and concrete missing evidence for every requested fix.

## Dependencies and ownership

Depends on:
- ORI-AST-001 — declared collection schema, publication semantics, and route-generation surface.
- ORI-CONT-003 — actual Quickstart content with `tutorial: true` at `/docs/quickstart`.

Blocks/enables downstream: ORI-CI-002 and ORI-CI-003 consume enforcement through the public build. ORI-CONT-003 must not acquire a reverse dependency on this task.

Provides: deterministic complete-collection tutorial enforcement; public-build failure propagation; source-bound discriminating integration evidence.

Consumes: prerequisite collection/route contracts, actual authored Quickstart, and the existing public Astro build.

Agent rationale: ghactions-planner specifies the build-gate and downstream enforcement contract; astro-implementer owns the Astro collection/route implementation; astro-reviewer verifies its runtime integration. No workflow implementation is assigned here.

Provenance: proposed_by ghactions-planner; co_authored_by []; source proposal `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/ghactions-planner-absorb-prerequisites.json`; source task IDs [ORI-CI-001]; artifact status planned_output_not_observed; supersedes [].

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CI-001","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"real_quickstart_tree":{"description":"An owned filesystem copy of the actual candidate after ORI-AST-001 and ORI-CONT-003, loaded through the real Astro content and build entrypoints.","seed_method":"cli","records":["The actual Quickstart source declares tutorial: true and publishes at /docs/quickstart.","Exactly 1 entry in the complete published collection is designated a tutorial.","All other real content, source imports, publication metadata, and build prerequisites are preserved; baseline source bytes and hashes are captured before mutation."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN the real prerequisite content contains exactly one published tutorial at /docs/quickstart WHEN the public Astro build runs THEN it exits 0 and emits fresh Quickstart HTML.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/single-tutorial-gate.test.ts","test_function":"ORI-CI-001-positive","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-positive","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CI-001-1","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["The build is a no-op or returns static success without loading the real collection and emitting Quickstart HTML."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["Create an owned filesystem copy of the prerequisite-complete candidate with fresh build outputs.","Run pnpm --filter @rnr-ai-elements/docs build in that copy."]},"end_state":{"must_observe":["Build exit code 0 with exactly 1 published tutorial at /docs/quickstart.","Fresh apps/docs/dist/docs/quickstart/index.html contains a decoded title whose text == the title read from the real Quickstart source."],"must_not_observe":["Missing or empty Quickstart HTML.","A tutorial-validation failure on the original one-tutorial tree."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN the real Quickstart is copied to a second published slug WHEN the public Astro build runs THEN it rejects both tutorial source IDs; an unpublished copy does not count.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/single-tutorial-gate.test.ts","test_function":"ORI-CI-001-duplicate","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-duplicate","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CI-001-2","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["Validation is disconnected from the build, filters to Quickstart before counting, or counts an unpublished copy as a published tutorial."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In the owned copy, duplicate the real Quickstart source at slug ori-ci-001-second-tutorial, preserving tutorial designation and published status.","Run pnpm --filter @rnr-ai-elements/docs build without adding the duplicate to navigation."]},"end_state":{"must_observe":["Nonzero build exit with a tutorial-cardinality diagnostic reporting 2 published tutorials and both actual source IDs."],"must_not_observe":["Exit code 0 for the duplicate tree.","An empty diagnostic or failure caused only by an earlier unrelated build stage."]}},{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In a fresh owned copy, duplicate Quickstart at slug ori-ci-001-second-tutorial and mark only the copy unpublished using the prerequisite schema's actual publication metadata.","Run pnpm --filter @rnr-ai-elements/docs build."]},"end_state":{"must_observe":["Build exit code 0 with 1 published tutorial at /docs/quickstart."],"must_not_observe":["A duplicate-tutorial failure caused by the unpublished copy, or missing or empty Quickstart HTML at /docs/quickstart.","Published HTML for /docs/ori-ci-001-second-tutorial."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN the real Quickstart remains published but loses its tutorial designation WHEN the public Astro build runs THEN it fails with observed count 0 and expected canonical destination /docs/quickstart.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/single-tutorial-gate.test.ts","test_function":"ORI-CI-001-missing","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-missing","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CI-001-3","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["The gate is disconnected or treats an empty tutorial set as successful."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In a fresh owned copy, remove the real Quickstart tutorial designation while preserving its content and published route.","Run pnpm --filter @rnr-ai-elements/docs build."]},"end_state":{"must_observe":["Nonzero build exit with a tutorial diagnostic stating observed 0, expected 1, and /docs/quickstart.","The diagnostic includes the exact source ID read from the published entry at `/docs/quickstart` whose tutorial designation was removed."],"must_not_observe":["Exit code 0 for the zero-tutorial tree.","An empty diagnostic or failure caused only by an earlier unrelated build stage."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN the sole designated tutorial moves to /docs/ori-ci-001-moved-tutorial WHEN the public Astro build runs THEN it fails naming the source, actual route, and required /docs/quickstart destination.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/single-tutorial-gate.test.ts","test_function":"ORI-CI-001-noncanonical","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-noncanonical","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CI-001-4","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["Canonical-route validation is a no-op or accepts any sole tutorial destination."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["In a fresh owned copy, move the real designated tutorial to slug ori-ci-001-moved-tutorial through the actual content route convention, retaining exactly one published designation.","Run pnpm --filter @rnr-ai-elements/docs build."]},"end_state":{"must_observe":["Nonzero build exit naming the actual source ID, /docs/ori-ci-001-moved-tutorial, and required /docs/quickstart."],"must_not_observe":["Exit code 0 for the noncanonical tree.","An empty diagnostic or failure caused only by an earlier unrelated build stage."]}}]}},{"id":"AC-5","type":"acceptance_criterion","primary":false,"description":"GIVEN the negative mutations have run in owned copies WHEN original content is restored and the identical build command reruns THEN source hashes match baseline and fresh Quickstart HTML builds successfully.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/single-tutorial-gate.test.ts","test_function":"ORI-CI-001-restored","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-restored","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"id":"SC-ORI-CI-001-5","ac_ref":"AC-5","primary":false,"tier":"visible","test_tier":"integration","verification_service":"real Astro build and filesystem content collection","negative_control":{"would_fail_if":["Restoration is a no-op, the build reuses a static success receipt, or content mutations escape into the candidate checkout."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"real_quickstart_tree","action":{"actor":"cli_user","steps":["Execute the real positive, duplicate, missing, and noncanonical build cases; retain the captured baseline content bytes and hashes.","Restore original content and remove only owned duplicate or moved entries in the scratch copies.","With fresh build outputs, rerun pnpm --filter @rnr-ai-elements/docs build and compare source hashes and candidate content bytes with baseline."]},"end_state":{"must_observe":["Restored build exit code 0 and fresh apps/docs/dist/docs/quickstart/index.html containing the real Quickstart title.","For every restored source, SHA-256(restored bytes) == SHA-256(baseline bytes); changed candidate authored-content files == 0."],"must_not_observe":["Missing or empty restored Quickstart HTML.","Residual ori-ci-001-second-tutorial or ori-ci-001-moved-tutorial entries, changed candidate content, or a reused receipt."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The positive run exits 0 and its fresh Quickstart HTML contains the real title.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-positive","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"A published duplicate fails naming both sources, while an unpublished duplicate leaves one published tutorial and passes.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-duplicate","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Removing the designation fails with observed 0, expected 1, the Quickstart source ID, and /docs/quickstart.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-missing","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Moving the sole tutorial fails naming its actual source, /docs/ori-ci-001-moved-tutorial, and /docs/quickstart.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-noncanonical","maps_to_ac":"AC-4"},{"id":"TC-5","type":"test_criterion","description":"Restored content hashes match baseline, candidate content is unchanged, and the identical build command emits fresh Quickstart HTML.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/single-tutorial-gate.test.ts -t ORI-CI-001-restored","maps_to_ac":"AC-5"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-CI-001",
  "commit_sha": "1d9d9e783e2316ed1c2c79cc80e788ca758e779d",
  "done": "Landed the fail-closed single-tutorial enforcement (apps/docs/src/pages/docs/[...id].astro invokes assertSinglePublishedTutorial over the complete published collection before any route filtering, loaded from scripts/docs-data/single-tutorial.ts through a prerender-time dynamic import because Astro 7's bundler rejects static out-of-root imports) plus the real-build integration drill (tests/sprint-05-orient-search/single-tutorial-gate.test.ts: one owned fs.cpSync scratch copy per invocation, six real `pnpm --filter @rnr-ai-elements/docs build` executions proving positive, published-duplicate, draft-duplicate, missing-designation, moved-destination, and byte-exact-restored cases with source-identifying diagnostics) and the six appended evidence files with per-run manifest hashes; the locked vitest command exits 0 (PASS 5/0), pnpm typecheck and biome pass, and the merged result builds the docs cleanly at 67 pages.",
  "deviations": [
    "The route generator loads the gate with a runtime dynamic import (/* @vite-ignore */ pathToFileURL(join(process.cwd(), '..', '..', 'scripts', 'docs-data', 'single-tutorial.ts')).href) instead of a static import, because Astro 7's bundler cannot resolve ANY static import escaping the apps/docs project root and the task allowlist contains no writable in-root file that could re-export the module.",
    "The fallow unused-file directive stays on scripts/docs-data/single-tutorial.ts although cycle 1 planned to remove it with the wiring: fallow's static import graph cannot see the dynamic consumer, so removal fails the pre-commit audit; the directive's comment now documents the dynamic-load reality.",
    "Every drill build implicitly runs the docs package's prebuild script (tsx prebuild.ts) ahead of registry:build + gallery:manifest + astro build because pnpm auto-runs prebuild before build — the ACs name the command, not its four-stage expansion.",
    "AC-1's 'decoded title' is observed as the rendered h1 (PageHeader.astro:16) rather than the <title> tag, which by design reads `${title} — RNR AI Elements` and can never equal the source title.",
    "The committed evidence logs/manifest contain four appended drill invocations, including two earlier harness-defeat runs (a symlink-dropping hand-rolled copy, then an h1 regex that ignored scoped-style attributes) — kept as honest history under the 'append identifiable runs' rule."
  ],
  "concerns": [
    "Every `-t ORI-CI-001-<token>` verify command re-executes the complete drill (six full builds plus a whole-repo copy, ~3.5 minutes warm here), so the reviewer's five literal per-token commands each pay the full cost — budget review and CI time accordingly.",
    "The runtime import anchors on build-process cwd (apps/docs) resolving ../../scripts/docs-data/single-tutorial.ts; a future change to the docs build cwd or the scripts/ location would fail getStaticPaths with a module-not-found that is NOT a tutorial diagnostic.",
    "The dynamic import relies on Node's native TypeScript type stripping (default since Node 23.6); pinning CI to an older Node would break the docs build at getStaticPaths rather than at install time.",
    "os.tmpdir() resolves to ~/.cache/agent-scratch in this sandbox and the drill removes its scratch root only via its own finally block, so a SIGKILL mid-drill would strand a roughly 1.7 GB copy that nothing else reaps."
  ],
  "findings": [
    "Astro 7 (rolldown-vite) fails to bundle any static import from apps/docs that escapes the project root — probe-verified with gates.ts and token-map.ts at the identical depth — and unused aliased imports are tree-shaken before resolution, so naive probe builds silently skip resolution and lie about what works.",
    "readdirSync({ withFileTypes: true }) reports symlinks as neither file nor directory, so a Dirent-based recursive copy silently drops the entire pnpm node_modules symlink fabric and the copied workspace dies at its first bin invocation; fs.cpSync preserves symlinks and copy-on-writes on APFS.",
    "pnpm implicitly runs any prebuild script before build, so the 'public docs build' is really a four-stage chain (prebuild → registry:build → gallery:manifest → astro build) and failure triage must check the earliest stage.",
    "Astro 7 scoped styles stamp data-astro-cid-* attributes onto plain elements, so the built page renders `<h1 data-astro-cid-...>` and text oracles over built HTML must match `<h1[^>]*>` and decode entities.",
    "fallow reports stale suppressions, which makes a temporary ignore directive self-enforcing: the moment the suppressed finding stops firing (here, a future static import) the audit flags the directive and forces its removal."
  ],
  "scope_impact": [
    {
      "target": "ORI-CI-002",
      "found": "The public docs build now fails closed on tutorial violations with deterministic markers: `[docs-data] single-tutorial: item \"tutorial-cardinality\" ...; observed N versus 1` and `[docs-data] canonical-destination: item \"<id>\" ... must publish at /docs/quickstart`, emitted at prerender from the real build.",
      "change": "Pin the workflow's required-check or log-grep for content gates on those exact diagnostic strings instead of re-deriving the invariant."
    },
    {
      "target": "ORI-CONT-004",
      "found": "Any authored-content change that adds, drafts, renames, or removes the `tutorial: true` designation now fails the public build unless the collection returns to exactly one designated published tutorial at /docs/quickstart, and metadata alone cannot detect an undeclared second tutorial in prose.",
      "change": "Content tasks must change the designation only in one atomic edit (remove old + add new together), and content review keeps sole ownership of prose-level tutorial classification."
    },
    {
      "target": "ROADMAP",
      "found": "scripts/docs-data modules are statically unimportable from apps/docs (project-root bundler boundary), so every future task wiring build-time enforcement into the docs build hits the same dynamic-load or allowlist problem this task solved ad hoc.",
      "change": "Record the boundary in the docs technical requirements: either standardize the prerender-time dynamic-import shape for gates, or allowlist one in-root bridge file (e.g. apps/docs/src/lib/gates.ts) for future enforcement tasks."
    }
  ],
  "feedback": [
    "The three-file production allowlist assumed [...id].astro could statically import scripts/docs-data; the bundler boundary only surfaced by probing actual builds — Astro charters that wire scripts into app builds should state that boundary up front or pre-authorize an in-root bridge file.",
    "The drill skeleton (whole-candidate cpSync clone with symlink preservation, N real builds with fresh dist/.astro, byte-hash restoration proof, per-run evidence appends) is reusable for any content-invariant task; extracting it into tests/sprint-05-orient-search/support/ would save the next task the symlink, cwd, and compression lessons.",
    "The charter's 'Shared setup may run the complete drill once per invocation' clause is load-bearing for cost control — future charters should state explicitly whether reviewers may run the full suite once or must pay the per-token drill cost five times.",
    "The blocked-checkpoint cycle worked exactly as designed: cycle 1 landed two green behavior-neutral pieces, the orchestrator routed the one-line prerequisite to a FIX task, and the cycle-2 merge reconciled my identical schema line with zero conflicts."
  ]
}
```
