# ORI-CI-002: Make the public docs build execute every content gate in order

## What this does

Make the public docs build run registry generation, gallery generation, docs-data prebuild, authored-source compilation, Astro, Pagefind, and link verification once, in order.

## Why

The current root command repeats generation already present in the docs build. The docs build lacks the explicit content-gate chain. A successful public build must establish that every required stage ran against the current sources.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts` in the assigned provisioned execution checkout. The tests invoke the real public build in isolated copies, corrupt six real inputs or dependencies separately, verify failure propagation, restore the copies, and capture fresh successful builds. Run `pnpm typecheck` and `pnpm lint`. Full `pnpm e2e:docs`, the existing browser execution assertions, and `pnpm test` belong to ORI-CI-004's fully provisioned acceptance context.

## Scope

Modify the root and docs package scripts, workspace lifecycle configuration, the task-owned build integration test, and only the earlier test's five-segment root-script expectation. Write evidence only under the four declared evidence paths. Gate implementations, workflows, dependencies, app code, and planning files remain outside implementation scope.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

## Metadata

- Task: ORI-CI-002 — Make the public docs build execute every content gate in order
> Status: ✅ Completed

Commit: 3573a23792b17c0fb2815b404aa65dd10815e4d7
- Assignee: ghactions-implementer
- Priority: P1
- Points: 5
- Type: INFRA
- Dependency phase: After all declared prerequisites; before ORI-CI-004 acceptance
- Proposed By: ghactions-planner
- Co-authored By: []
- AGENT: planner=ghactions-planner | implementer=ghactions-implementer | reviewer=ghactions-reviewer
- TDD_MODE: skipped
- RED_GREEN_REQUIRED: no
- Verification policy: requires_tests=true; requires_red_evidence=false; requires_seeded_evidence=true
- Sprint: [SPRINT.md](./SPRINT.md)
- Planned date: 2026-09-14
- Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
- Progress: 0/4 acceptance criteria; all TDD_STATE values are none; execution evidence is planned.

RUNTIME_COMMANDS:

```text
test: pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts
typecheck: pnpm typecheck
lint: pnpm lint
public build exercised by tests: pnpm --filter @rnr-ai-elements/docs build
```

## Outcome

The public docs build executes all seven real stages once in order, rejects corrupted inputs, and succeeds again after isolated mutations are restored.

## Critical constraints — Never

1. Never replace a build stage, compiler, filesystem, or process result with a stub, canned output, skipped check, or static success. Existing dist cannot establish success after failure.
2. Never spend provider credentials or launch native devices in the static build. Full runtime acceptance belongs to ORI-CI-004; do not recursively invoke this Vitest suite.
3. Never change files outside the exact write allowlist or alter gate semantics owned by Astro. Preserve shared WIP and confine mutation drills to owned isolated copies.
4. Never duplicate generation through root scripts or automatic lifecycle hooks. Preserve the exact explicit seven-stage chain and standalone prebuild behavior.
5. Never broaden the compiler claim to the whole example or gallery, weaken the existing real execution assertions, or change the three Playwright projects, workers: 1, retries: 0, or localhost:4321 preview contract.

## Done when

- [ ] AC-1 proves seven real stages run once in order, and explicit standalone prebuild still produces the real dataset.
- [ ] AC-2 and AC-3 prove the source-binding, TypeScript prop, route, fragment, and duplicate-tutorial failures through the public command.
- [ ] AC-4 proves genuine Pagefind process failure, downstream suppression, byte-exact restoration, and fresh successful builds.
- [ ] The focused suite, root typecheck, and lint pass with captured seeded evidence; independent review confirms every criterion.
- [ ] Candidate changes stay within writeAllowed; full runtime acceptance remains explicitly assigned to ORI-CI-004.

## Acceptance criteria

All four criteria are task-owned integration proofs. Each has PRIMARY=false, FLOW_REF=null, SURFACE_POLICY=null, and TDD_STATE=none. This INFRA task has no locked human flow and claims no journey ownership. The null surface policy denotes a task-owned CLI proof, not a replacement UI policy.

### AC-1 — Ordered public build and explicit standalone prebuild

GIVEN an isolated provisioned candidate with real authored sources WHEN the public docs build runs THEN all seven stages succeed once in order and standalone prebuild still works.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/docs-build-pipeline.test.ts
- TEST_FUNCTION: ORI-CI-002-ordered-public-build
- VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-ordered-public-build
- TEST_TIER: integration
- VERIFICATION_SERVICE: real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker
- SURFACE_POLICY: null
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["The public build is a no-op or accepts stale dist without executing all seven stages.","Automatic lifecycle execution duplicates prebuild or root scripts repeat registry and gallery generation."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"real_candidate","action":{"actor":"cli_user","steps":["Run pnpm --filter @rnr-ai-elements/docs build in the isolated copy without dist, observing actual subprocess starts and exits.","Read generated HTML, registry data, and Pagefind files; inspect the real root command and unchanged Playwright configuration."]},"end_state":{"must_observe":["7 successful stages in order: registry:build, gallery:manifest, prebuild, check:snippets, astro build, search:index, check:links; each executes once.","Generated HTML for /docs/introduction and nonempty Pagefind output under apps/docs/dist; public build exit 0.","The root e2e:docs script has exactly 3 &&-joined segments: docs build, Chromium installation, Playwright execution."],"must_not_observe":["The starting absent dist or empty Pagefind output being accepted as success.","A second prebuild execution, a skipped stage, a provider request, or a native-device launch."]}},{"start_ref":"real_candidate","action":{"actor":"cli_user","steps":["Run pnpm -w run registry:build, then pnpm -w run gallery:manifest, then pnpm --filter @rnr-ai-elements/docs prebuild in an owned isolated copy.","Read the generated docs dataset and subprocess receipts."]},"end_state":{"must_observe":["Explicit standalone prebuild exits 0 and registry-items.json contains message and conversation.","The effective enablePrePostScripts setting equals false; the standalone prebuild execution count equals 1."],"must_not_observe":["An absent or empty dataset, 0 prebuild executions, or an implicit second prebuild execution."]}}]}
```

### AC-2 — Real source-binding and compiler failures

GIVEN real authored bindings and compiled source WHEN each is corrupted separately THEN the public build names the fault and stops before Astro.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/docs-build-pipeline.test.ts
- TEST_FUNCTION: ORI-CI-002-authored-source-failures
- VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-authored-source-failures
- TEST_TIER: integration
- VERIFICATION_SERVICE: real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker
- SURFACE_POLICY: null
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["The snippet gate is disconnected from actual authored bindings or compiles substitute declarations instead of installed packages.","The public build ignores compiler failure or treats the existing dist as successful output."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["In an isolated copy, replace one actual Quickstart source binding with ./ORI_CI_002_MISSING_SOURCE.tsx and record its real owner path and original bytes.","Run pnpm --filter @rnr-ai-elements/docs build and capture the targeted diagnostic and process exits; restore the original bytes in finally."]},"end_state":{"must_observe":["Public build exit is nonzero and the source-binding diagnostic identifies ORI_CI_002_MISSING_SOURCE.tsx.","No Astro, search:index, or check:links stage starts; the mutated file's restored SHA-256 equals its baseline hash."],"must_not_observe":["The existing successful dist being accepted after the corrupted binding.","Exit 0, an anonymous unrelated failure, or a remaining mutated source binding."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["In a separate isolated copy, add the unsupported oriCi002InvalidProp={true} JSX prop to the actual Message invocation consumed by the authored-source compiler.","Run pnpm --filter @rnr-ai-elements/docs build against installed source-owner packages; capture the compiler diagnostic and restore the original bytes in finally."]},"end_state":{"must_observe":["Public build exit is nonzero and the actual TypeScript diagnostic identifies oriCi002InvalidProp in the recorded source file.","Astro never starts; the restored source SHA-256 equals its baseline hash."],"must_not_observe":["A canned compiler result, substitute component types, stale dist accepted as a successful build, or 0 real compiler executions.","A remaining oriCi002InvalidProp mutation after restoration."]}}]}
```

### AC-3 — Route, fragment, and tutorial failures

GIVEN real authored pages WHEN a route, fragment, or tutorial uniqueness rule is violated separately THEN the public build rejects the targeted violation.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/docs-build-pipeline.test.ts
- TEST_FUNCTION: ORI-CI-002-content-gate-failures
- VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-content-gate-failures
- TEST_TIER: integration
- VERIFICATION_SERVICE: real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker
- SURFACE_POLICY: null
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["The link checker is a no-op, checks only route existence, or reads stale HTML instead of the current build.","Astro's tutorial enforcement is disconnected or allows a second tutorial without failing the public build."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Change one actual authored internal link to /docs/ori-ci-002-missing-route in an isolated copy.","Run pnpm --filter @rnr-ai-elements/docs build, capture the final link-check failure, and restore the authored file in finally."]},"end_state":{"must_observe":["The final check:links stage rejects /docs/ori-ci-002-missing-route and the public build exits nonzero.","The restored authored-file SHA-256 equals its baseline hash."],"must_not_observe":["Exit 0 based on the earlier valid dist or an unexamined newly generated link."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Change a real authored link to /docs/introduction#ori-ci-002-missing-fragment, preserving the existing destination route.","Run pnpm --filter @rnr-ai-elements/docs build, capture the fragment diagnostic, and restore the authored file in finally."]},"end_state":{"must_observe":["The real destination HTML exists, but check:links rejects ori-ci-002-missing-fragment; the public build exits nonzero.","The restored authored-file SHA-256 equals its baseline hash."],"must_not_observe":["Exit 0 from checking only /docs/introduction or accepting the earlier valid dist."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Copy the real Quickstart authored source into a second tutorial with the distinct slug ori-ci-002-second-tutorial in an isolated copy, preserving valid tutorial metadata.","Run pnpm --filter @rnr-ai-elements/docs build and record Astro's tutorial-uniqueness failure; remove only the added copy in finally."]},"end_state":{"must_observe":["Astro rejects the 2 real tutorial sources with a tutorial-uniqueness diagnostic and the public build exits nonzero.","search:index and check:links do not start; restoration leaves exactly the original Quickstart tutorial."],"must_not_observe":["Successful generation of a second tutorial, acceptance of the earlier one-tutorial dist as current success, or 0 tutorial-uniqueness diagnostics for the duplicate sources.","A leftover ori-ci-002-second-tutorial source."]}}]}
```

### AC-4 — Pagefind failure, downstream suppression, and restoration

GIVEN a successful real build and an isolated installed Pagefind executable WHEN Pagefind becomes unavailable THEN the build fails before links; restoring mutations permits a fresh complete build.

- PRIMARY: false
- FLOW_REF: null
- TEST_FILE: tests/sprint-05-orient-search/docs-build-pipeline.test.ts
- TEST_FUNCTION: ORI-CI-002-pagefind-failure-and-restore
- VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-pagefind-failure-and-restore
- TEST_TIER: integration
- VERIFICATION_SERVICE: real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker
- SURFACE_POLICY: null
- TDD_STATE: none
- MAPS_TO_AC: null

SCENARIO:

```json
{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["search:index returns static success, substitutes a fake executable, or reuses stale Pagefind output after process failure.","The harness fabricates stage events, ignores downstream execution, or reports restoration without comparing real bytes and rerunning the public build."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Resolve the actual installed Pagefind executable and confirm its writable copy is private to the isolated fixture, with no shared dependency-store inode or external symlink target.","Temporarily make that real executable unavailable, then run pnpm --filter @rnr-ai-elements/docs build; capture the genuine process error and restore the executable in finally."]},"end_state":{"must_observe":["search:index attempts actual Pagefind execution, receives a genuine unavailable-executable failure, and the public build exits nonzero.","0 subsequent check:links or browser-process starts occur in this static invocation; the restored executable SHA-256 equals its baseline hash."],"must_not_observe":["Existing Pagefind files accepted as success, a fabricated process failure, a modified shared executable, or 0 actual Pagefind execution attempts."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["For each of the six isolated mutation variants, restore every changed input or executable and compare its bytes with the recorded baseline.","Run a fresh pnpm --filter @rnr-ai-elements/docs build after each restoration; capture real stage execution and regenerated outputs in restored-build.log and index all receipts in manifest.json."]},"end_state":{"must_observe":["6 mutation variants have targeted failing-build receipts and byte-exact restoration receipts.","Each restored variant has a fresh exit-0 public build with all 7 stage exits in order and nonempty generated HTML and Pagefind output.","manifest.json binds the candidate identity, lockfile and test SHA-256 hashes, exact commands, all 6 mutation paths, and stage-events.jsonl to equal values in the captured runs."],"must_not_observe":["An empty evidence manifest, missing mutation receipts, leftover mutated bytes, or an old successful log substituted for a restored build."]}}]}
```

## Test criteria

- TC-1 → AC-1: The public build records seven successful ordered stage executions, generates real HTML and Pagefind output, and explicit standalone prebuild produces message and conversation dataset entries. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-ordered-public-build`.
- TC-2 → AC-2: Both source-binding and TypeScript prop mutations produce targeted nonzero public-build failures before Astro and restore their original bytes. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-authored-source-failures`.
- TC-3 → AC-3: Separate route, fragment, and duplicate-tutorial mutations fail through the real public build at their owning gates and leave no changed fixture sources. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-content-gate-failures`.
- TC-4 → AC-4: Actual Pagefind unavailability prevents link execution, and all six mutation variants have targeted failure, byte-exact restoration, and fresh successful seven-stage build receipts. Verify: `pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-pagefind-failure-and-restore`.

## Shared fixtures

```json
{"real_candidate":{"description":"An owned provisioned filesystem copy of the selected candidate after all ten prerequisites, with real authored sources and installed compiler/build dependencies, initially without docs dist.","seed_method":"cli","records":["Copy actual candidate sources into an OS-derived owned scratch directory and record source, lockfile, and input hashes; do not fabricate rendered outputs.","Real Quickstart source bindings, a compiled Message invocation, /docs/introduction, internal links, and the single Quickstart tutorial come from prerequisite-owned files.","Resolve installed executables and source-owner compiler entrypoints from the actual candidate; missing inputs or dependencies block the run."]},"built_candidate":{"description":"A separate owned candidate copy whose existing docs dist and Pagefind files were created by a successful real public build, providing a stale-output negative control.","seed_method":"cli","records":["Seed by running pnpm --filter @rnr-ai-elements/docs build successfully and capturing its actual generated files and baseline source hashes.","Use separate copies for source-binding, invalid-prop, route, fragment, duplicate-tutorial, and Pagefind-unavailable mutations.","Pagefind mutation uses a private installed executable copy; never alter a shared store inode or a symlink target outside the fixture."]}}
```

Fixture preparation changes real source copies through filesystem/CLI operations and feeds them through normal product entrypoints. It never injects view state, hand-authors dist, mocks HTTP, supplies a stub provider, substitutes compiler types, or adds a test-only product seam. Record exact resolved mutation paths before changing them; fail if the required source or executable is absent. Generated files and deliberately corrupted inputs exist only in owned scratch copies. This does not expand the candidate write allowlist.

## Scope — file-level write permissions

writeAllowed:

- package.json
- apps/docs/package.json
- pnpm-workspace.yaml
- tests/sprint-05-orient-search/docs-build-pipeline.test.ts
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts
- tests/sprint-05-orient-search/evidence/ORI-CI-002/manifest.json
- tests/sprint-05-orient-search/evidence/ORI-CI-002/stage-events.jsonl
- tests/sprint-05-orient-search/evidence/ORI-CI-002/mutations/
- tests/sprint-05-orient-search/evidence/ORI-CI-002/restored-build.log

writeProhibited:

- pnpm-lock.yaml
- .github/**
- scripts/docs-data/**
- apps/docs/src/**
- apps/example/**
- packages/registry/**
- .spec/**

Any candidate path not explicitly allowed is prohibited. The charter itself is a planning-owned output; it is not an implementation write permission.

## Boundaries — Always / Ask first

Always:

1. Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage, or run trunk lifecycle operations.
2. Invoke real stages sequentially and retain their actual failure statuses and diagnostics. Observer logging must not replace execution.
3. Restore each isolated mutation in finally, verify original bytes, and run the real public build again.
4. Keep implementation ownership with the existing source owners and preserve the earlier test's real execution and failure-propagation assertions.
5. Keep evidence source-bound, sanitized, and confined to the declared paths; record unavailable prerequisites as blockers.

Ask first:

1. A required gate or compiler contract cannot be consumed without changing a prohibited file: return the exact missing contract to its owner before proposing broader work.
2. A dependency or version change is required: obtain a separate scope decision; this task cannot modify the lockfile.
3. A whole-example gate, workflow change, native/provider execution, or publication is requested: route it to its declared owner rather than expanding this task.

## Deliverable and exact script surface

- apps/docs/package.json: modify the public build and expose the existing owner-provided commands exactly as follows.
- package.json: reduce e2e:docs to the public build followed by the existing Playwright steps; retain pnpm typecheck as the root type gate.
- pnpm-workspace.yaml: set enablePrePostScripts to false.
- tests/sprint-05-orient-search/docs-build-pipeline.test.ts: add real isolated subprocess integration tests for AC-1 through AC-4.
- tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts: replace only the exact five-segment root-script expectation with the three-segment root command. Preserve every real execution and failure-propagation assertion.
- The four declared evidence paths: capture the manifest, actual stage events, six mutation receipts, and restored build logs.

```json
{"apps/docs/package.json":{"prebuild":"tsx ../../scripts/docs-data/prebuild.ts","check:snippets":"tsx ../../scripts/docs-data/authored-snippets.ts","search:index":"tsx ../../scripts/docs-data/search-index.ts","check:links":"tsx ../../scripts/docs-data/check-dist-links.ts","build":"pnpm -w run registry:build && pnpm -w run gallery:manifest && pnpm run prebuild && pnpm run check:snippets && astro build && pnpm run search:index && pnpm run check:links"},"package.json":{"e2e:docs":"pnpm --filter @rnr-ai-elements/docs build && pnpm exec playwright install chromium && pnpm exec playwright test"},"pnpm-workspace.yaml":{"enablePrePostScripts":false}}
```

## Boundary contracts

1. Keep one complete public build entrypoint. Preserve standalone prebuild behavior and invoke it explicitly.
2. Execute registry generation, gallery generation, docs-data prebuild, real authored-source compilation, Astro generation with tutorial enforcement, Pagefind indexing, and final link verification sequentially.
3. Every failed stage prevents subsequent stages. Existing dist is never accepted after a failed build.
4. Astro retains ownership of snippet extraction, compiler contexts, search indexing, and link semantics.
5. Source-owner compilation uses actual installed packages and real entrypoints. The worked example runs its scoped live-chat compiler; the existing root gate remains pnpm typecheck. Neither command establishes whole-example/gallery correctness, and this sprint does not add a whole-example gate.
6. Do not launch native devices or spend provider credentials inside a static build merely to manufacture build success. Runtime proof follows through ORI-CI-004.
7. Preserve the existing three Playwright projects, workers: 1, retries: 0, and localhost:4321 preview contract.
8. Replace only the earlier test's exact five-segment root-script expectation. Preserve its real execution and failure-propagation assertions.

## Agent instructions

This configuration task uses TDD_MODE=skipped. That waives a chronological RED-before-implementation requirement only; tests, deliberate failing builds, and seeded evidence remain mandatory.

1. Read the selected prerequisite candidate and verify that all consumed source-owner commands and real packages exist. Record identity and original bytes before edits. Missing prerequisites block execution; do not implement their behavior here.
2. Implement the exact script surface and lifecycle setting. Update only the earlier test's five-segment expectation. Add the task-owned integration tests without reimplementing stage semantics.
3. Exercise the real public build from a cold output state. Observe actual process starts, completions, statuses, and output files; a printed shell script is not execution evidence.
4. Run the six independent mutation cases, require their targeted failures, restore every copy, and capture fresh successful builds. Keep fixture dependencies private before withholding Pagefind. Never recursively invoke Vitest or run the full root e2e command in this focused lane.
5. Run the focused gates and return the scoped candidate with evidence for independent ghactions-reviewer review. Keep full runtime/browser acceptance assigned to ORI-CI-004 and do not claim it from static build proof.

## Reading list

1. apps/docs/package.json, lines 6–9 — PRIMARY PATTERN: the existing docs build and standalone prebuild entrypoints.
2. package.json, lines 9–26 — root typecheck, lint, registry/gallery generation, and e2e:docs composition.
3. pnpm-workspace.yaml, lines 1–3 — preserve workspace members while adding the explicit lifecycle setting.
4. tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts, lines 43–139 and 187–329 — real execution assertions and the narrowly superseded root-script expectation at lines 313–327.
5. playwright.config.ts, lines 7–39 — preserve the three named projects, workers, retries, and preview integration.

## Design/reference guidance and coding standards

Use package-script composition with explicit && ordering. Treat source-owner entrypoints as the implementation of each gate; do not create parallel extraction, compilation, indexing, or link-checking logic. Prefer small typed functions, static imports, node: filesystem/process APIs, and explicit subprocess argument arrays in the integration test. Capture spawn errors, exit codes, and signals separately. Use OS-derived scratch roots and finally cleanup. Do not copy historical mock patterns or stale lint claims from the example charter.

PRD references:

- .spec/prds/docs-site/04-uc-docs.md — UC-DOCS-01 and UC-DOCS-02; the single Quickstart tutorial.
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md — CAP-DOCS-01.
- .spec/prds/docs-site/11-technical-requirements/11-e2e-testing.md — built fixture, three browser projects, ordered execution, and zero retries.
- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md — source-backed snippets and build/link/snippet gates.
- /Users/justinrich/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md — owned temporary artifacts.

## Permissions and security

Local execution needs an owned writable checkout, isolated mutation copies, and outbound dependency/authoritative-reference HTTP access. GitHub permissions remain contents: read. Secrets: []. External mutations: None.

This task introduces no workflow actions, OpenID Connect token permission, deployment identity, or attestation publication. Action pinning, protected runners, and hosted artifact governance remain with their workflow owners. Do not read credential values or forward provider credentials into static build subprocesses. Source and artifact hashes in local evidence are provenance records, not hosted attestations.

## Verification and evidence gates

1. Scope/readiness: check the exact candidate, prerequisite entrypoints, installed tools, and write boundary. Compare changed paths with writeAllowed, including untracked files. No shared-worktree cleanup or stash is permitted.
2. Cheap checks: pnpm typecheck and pnpm lint must exit 0. Root typecheck is not evidence of whole-example or gallery correctness.
3. Behavioral integration: pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts must exit 0 while observing each required real failing build and subsequent restored build. Every AC has its exact test token and captured scenario evidence.
4. Evidence integrity: manifest.json identifies the planning source SHA and actual executed candidate separately; includes lockfile, test, command, and relevant input/output hashes; and points to actual stage-events.jsonl, six mutation receipts, and restored-build.log. Stage records contain run identity, actual executable/arguments/cwd, process identity, start/end timestamps, exit status or signal, and diagnostic references. Logging observes execution and cannot synthesize success. Each mutation receipt includes the resolved target, baseline/mutated/restored hashes, exact command, actual diagnostic, downstream-start observations, and restoration result. All paths are future outputs.
5. Independent review and runtime handoff: ghactions-reviewer verifies the real receipts and the preserved earlier assertions. The parent validates Requirement/Scenario Contract identity and sprint flow ownership. ORI-CI-004 alone runs pnpm e2e:docs and pnpm test, including the preserved old browser execution assertions, after all real services and devices exist. Focused static proof does not establish browser/runtime acceptance.

The immutable focused verify command is `pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts`. Per-AC -t commands are direct selections within that owned file.

## Evidence contract

Planned outputs only:

- tests/sprint-05-orient-search/evidence/ORI-CI-002/manifest.json
- tests/sprint-05-orient-search/evidence/ORI-CI-002/stage-events.jsonl
- tests/sprint-05-orient-search/evidence/ORI-CI-002/mutations/
- tests/sprint-05-orient-search/evidence/ORI-CI-002/restored-build.log

Mutation variants are source-binding, invalid-prop, missing-route, missing-fragment, duplicate-tutorial, and pagefind-unavailable. Preserve per-run identities and prior evidence within the allowed boundaries. Negative-control transcripts stored as RED proof use proof.red beneath the owned mutations directory. There is no locked human-flow RED path owned by this task.

## Out of scope

- Whole-example/gallery compiler repairs or a whole-example gate; changing snippet, tutorial, search, or link semantics.
- Workflow, lockfile, dependency, app, registry-source, or planning-file changes.
- Native devices, provider requests, full pnpm e2e:docs or pnpm test execution, hosted acceptance, and deployment.
- Changing browser projects, retry/worker policy, preview origin, or existing real execution/failure-propagation assertions.
- Additional sprint tasks, flow ownership, journey proofs, or claims that planned evidence already exists.

## Context and fixed sprint contract

Current state: apps/docs/package.json defines prebuild separately and builds registry, gallery, and Astro; package.json e2e:docs also invokes registry and gallery first. pnpm-workspace.yaml currently declares workspace members without the explicit lifecycle setting. These source observations do not establish observed runtime behavior.

Gap: the public docs build does not yet explicitly compose the seven required content stages or provide task-owned mutation/restoration evidence.

Success state: the exact public command owns the complete ordered chain, propagates real failures, and produces fresh validated output after restoration.

Gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)

The sprint retains 13 flows: nine task flows and four journey flows. ORI-CI-002 owns none of them. Its dark proof is ORI-DARK-ORI-CI-002. The full sprint remains 36 tasks / 131 points; this charter does not modify promotion or authorize execution.

## Review — ghactions-reviewer

Must pass:

1. Exact scripts and lifecycle setting match the contract; real subprocess evidence proves one complete ordered public build.
2. All six mutation variants fail for their intended causes, retain downstream suppression evidence, and restore real bytes before fresh successful builds.
3. Tests use actual sources, installed compilers, Astro, Pagefind, and link checking; no stubs, placeholders, skipped behavior, fake success, or deferred core logic remain.
4. Only allowed files change; the earlier test changes only its five-segment expectation, with real execution and failure-propagation assertions preserved.
5. Human AC fields/scenarios, machine requirements, and captured evidence agree; focused green is not reported as full runtime or hosted acceptance.

Should verify:

- Process observation distinguishes execution from pnpm's echoed command text.
- Missing prerequisites fail with actionable diagnostics and do not trigger gate reimplementation.
- Mutation copies cannot alter shared dependency stores or shared WIP.
- Compiler scope and credential boundaries remain exact.
- Evidence identifies fresh runs and cannot be satisfied by stale dist or logs.

Verdict: APPROVED or NEEDS_FIXES, with evidence-backed file/line feedback for required fixes. No verdict is claimed in this planning charter.

## Dependencies, provides, and consumes

Depends on: ORI-AST-001, ORI-AST-004, ORI-AST-005, ORI-AST-006, ORI-AST-009, ORI-CONT-001, ORI-CONT-002, ORI-CONT-003, ORI-CONT-005, ORI-CI-001.

Blocks: ORI-CI-004 acceptance of the complete ordered build.

Provides: one public ordered static-build entrypoint; the unchanged root e2e handoff after successful build; task-owned mutation/restoration evidence.

Consumes: prerequisite-owned authored content, source bindings, compiler contexts and real installed packages, tutorial enforcement, search/link entrypoints, and execution prerequisites; existing registry/gallery generation, standalone prebuild, and Playwright contracts.

Touches capabilities: CAP-DOCS-01.

Supersedes: tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts, limited to its exact five-segment root-script expectation.

Agent rationale: ghactions-planner specifies command composition and failure propagation; ghactions-implementer implements the allowed script/test surface; ghactions-reviewer independently checks execution ordering, boundaries, and evidence. Astro owners retain gate semantics.

Provenance: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/ghactions-planner-absorb-prerequisites.json; source task IDs [ORI-CI-002]; co-authors [].

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CI-002","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"real_candidate":{"description":"An owned provisioned filesystem copy of the selected candidate after all ten prerequisites, with real authored sources and installed compiler/build dependencies, initially without docs dist.","seed_method":"cli","records":["Copy actual candidate sources into an OS-derived owned scratch directory and record source, lockfile, and input hashes; do not fabricate rendered outputs.","Real Quickstart source bindings, a compiled Message invocation, /docs/introduction, internal links, and the single Quickstart tutorial come from prerequisite-owned files.","Resolve installed executables and source-owner compiler entrypoints from the actual candidate; missing inputs or dependencies block the run."]},"built_candidate":{"description":"A separate owned candidate copy whose existing docs dist and Pagefind files were created by a successful real public build, providing a stale-output negative control.","seed_method":"cli","records":["Seed by running pnpm --filter @rnr-ai-elements/docs build successfully and capturing its actual generated files and baseline source hashes.","Use separate copies for source-binding, invalid-prop, route, fragment, duplicate-tutorial, and Pagefind-unavailable mutations.","Pagefind mutation uses a private installed executable copy; never alter a shared store inode or a symlink target outside the fixture."]}},"requirements":[{"id":"AC-1","type":"acceptance_criterion","primary":false,"description":"GIVEN an isolated provisioned candidate with real authored sources WHEN the public docs build runs THEN all seven stages succeed once in order and standalone prebuild still works.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/docs-build-pipeline.test.ts","test_function":"ORI-CI-002-ordered-public-build","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-ordered-public-build","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["The public build is a no-op or accepts stale dist without executing all seven stages.","Automatic lifecycle execution duplicates prebuild or root scripts repeat registry and gallery generation."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"real_candidate","action":{"actor":"cli_user","steps":["Run pnpm --filter @rnr-ai-elements/docs build in the isolated copy without dist, observing actual subprocess starts and exits.","Read generated HTML, registry data, and Pagefind files; inspect the real root command and unchanged Playwright configuration."]},"end_state":{"must_observe":["7 successful stages in order: registry:build, gallery:manifest, prebuild, check:snippets, astro build, search:index, check:links; each executes once.","Generated HTML for /docs/introduction and nonempty Pagefind output under apps/docs/dist; public build exit 0.","The root e2e:docs script has exactly 3 &&-joined segments: docs build, Chromium installation, Playwright execution."],"must_not_observe":["The starting absent dist or empty Pagefind output being accepted as success.","A second prebuild execution, a skipped stage, a provider request, or a native-device launch."]}},{"start_ref":"real_candidate","action":{"actor":"cli_user","steps":["Run pnpm -w run registry:build, then pnpm -w run gallery:manifest, then pnpm --filter @rnr-ai-elements/docs prebuild in an owned isolated copy.","Read the generated docs dataset and subprocess receipts."]},"end_state":{"must_observe":["Explicit standalone prebuild exits 0 and registry-items.json contains message and conversation.","The effective enablePrePostScripts setting equals false; the standalone prebuild execution count equals 1."],"must_not_observe":["An absent or empty dataset, 0 prebuild executions, or an implicit second prebuild execution."]}}]}},{"id":"AC-2","type":"acceptance_criterion","primary":false,"description":"GIVEN real authored bindings and compiled source WHEN each is corrupted separately THEN the public build names the fault and stops before Astro.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/docs-build-pipeline.test.ts","test_function":"ORI-CI-002-authored-source-failures","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-authored-source-failures","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["The snippet gate is disconnected from actual authored bindings or compiles substitute declarations instead of installed packages.","The public build ignores compiler failure or treats the existing dist as successful output."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["In an isolated copy, replace one actual Quickstart source binding with ./ORI_CI_002_MISSING_SOURCE.tsx and record its real owner path and original bytes.","Run pnpm --filter @rnr-ai-elements/docs build and capture the targeted diagnostic and process exits; restore the original bytes in finally."]},"end_state":{"must_observe":["Public build exit is nonzero and the source-binding diagnostic identifies ORI_CI_002_MISSING_SOURCE.tsx.","No Astro, search:index, or check:links stage starts; the mutated file's restored SHA-256 equals its baseline hash."],"must_not_observe":["The existing successful dist being accepted after the corrupted binding.","Exit 0, an anonymous unrelated failure, or a remaining mutated source binding."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["In a separate isolated copy, add the unsupported oriCi002InvalidProp={true} JSX prop to the actual Message invocation consumed by the authored-source compiler.","Run pnpm --filter @rnr-ai-elements/docs build against installed source-owner packages; capture the compiler diagnostic and restore the original bytes in finally."]},"end_state":{"must_observe":["Public build exit is nonzero and the actual TypeScript diagnostic identifies oriCi002InvalidProp in the recorded source file.","Astro never starts; the restored source SHA-256 equals its baseline hash."],"must_not_observe":["A canned compiler result, substitute component types, stale dist accepted as a successful build, or 0 real compiler executions.","A remaining oriCi002InvalidProp mutation after restoration."]}}]}},{"id":"AC-3","type":"acceptance_criterion","primary":false,"description":"GIVEN real authored pages WHEN a route, fragment, or tutorial uniqueness rule is violated separately THEN the public build rejects the targeted violation.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/docs-build-pipeline.test.ts","test_function":"ORI-CI-002-content-gate-failures","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-content-gate-failures","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["The link checker is a no-op, checks only route existence, or reads stale HTML instead of the current build.","Astro's tutorial enforcement is disconnected or allows a second tutorial without failing the public build."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Change one actual authored internal link to /docs/ori-ci-002-missing-route in an isolated copy.","Run pnpm --filter @rnr-ai-elements/docs build, capture the final link-check failure, and restore the authored file in finally."]},"end_state":{"must_observe":["The final check:links stage rejects /docs/ori-ci-002-missing-route and the public build exits nonzero.","The restored authored-file SHA-256 equals its baseline hash."],"must_not_observe":["Exit 0 based on the earlier valid dist or an unexamined newly generated link."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Change a real authored link to /docs/introduction#ori-ci-002-missing-fragment, preserving the existing destination route.","Run pnpm --filter @rnr-ai-elements/docs build, capture the fragment diagnostic, and restore the authored file in finally."]},"end_state":{"must_observe":["The real destination HTML exists, but check:links rejects ori-ci-002-missing-fragment; the public build exits nonzero.","The restored authored-file SHA-256 equals its baseline hash."],"must_not_observe":["Exit 0 from checking only /docs/introduction or accepting the earlier valid dist."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Copy the real Quickstart authored source into a second tutorial with the distinct slug ori-ci-002-second-tutorial in an isolated copy, preserving valid tutorial metadata.","Run pnpm --filter @rnr-ai-elements/docs build and record Astro's tutorial-uniqueness failure; remove only the added copy in finally."]},"end_state":{"must_observe":["Astro rejects the 2 real tutorial sources with a tutorial-uniqueness diagnostic and the public build exits nonzero.","search:index and check:links do not start; restoration leaves exactly the original Quickstart tutorial."],"must_not_observe":["Successful generation of a second tutorial, acceptance of the earlier one-tutorial dist as current success, or 0 tutorial-uniqueness diagnostics for the duplicate sources.","A leftover ori-ci-002-second-tutorial source."]}}]}},{"id":"AC-4","type":"acceptance_criterion","primary":false,"description":"GIVEN a successful real build and an isolated installed Pagefind executable WHEN Pagefind becomes unavailable THEN the build fails before links; restoring mutations permits a fresh complete build.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/docs-build-pipeline.test.ts","test_function":"ORI-CI-002-pagefind-failure-and-restore","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-pagefind-failure-and-restore","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","surface_policy":null,"maps_to_ac":null,"tdd_state":"none","scenario":{"primary":false,"tier":"visible","test_tier":"integration","verification_service":"real pnpm subprocesses, filesystem, source-owner TypeScript compilers, Astro, Pagefind, and docs link checker","negative_control":{"would_fail_if":["search:index returns static success, substitutes a fake executable, or reuses stale Pagefind output after process failure.","The harness fabricates stage events, ignores downstream execution, or reports restoration without comparing real bytes and rerunning the public build."]},"evidence":{"artifact_type":"event_log","required_capture":true},"cases":[{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["Resolve the actual installed Pagefind executable and confirm its writable copy is private to the isolated fixture, with no shared dependency-store inode or external symlink target.","Temporarily make that real executable unavailable, then run pnpm --filter @rnr-ai-elements/docs build; capture the genuine process error and restore the executable in finally."]},"end_state":{"must_observe":["search:index attempts actual Pagefind execution, receives a genuine unavailable-executable failure, and the public build exits nonzero.","0 subsequent check:links or browser-process starts occur in this static invocation; the restored executable SHA-256 equals its baseline hash."],"must_not_observe":["Existing Pagefind files accepted as success, a fabricated process failure, a modified shared executable, or 0 actual Pagefind execution attempts."]}},{"start_ref":"built_candidate","action":{"actor":"cli_user","steps":["For each of the six isolated mutation variants, restore every changed input or executable and compare its bytes with the recorded baseline.","Run a fresh pnpm --filter @rnr-ai-elements/docs build after each restoration; capture real stage execution and regenerated outputs in restored-build.log and index all receipts in manifest.json."]},"end_state":{"must_observe":["6 mutation variants have targeted failing-build receipts and byte-exact restoration receipts.","Each restored variant has a fresh exit-0 public build with all 7 stage exits in order and nonempty generated HTML and Pagefind output.","manifest.json binds the candidate identity, lockfile and test SHA-256 hashes, exact commands, all 6 mutation paths, and stage-events.jsonl to equal values in the captured runs."],"must_not_observe":["An empty evidence manifest, missing mutation receipts, leftover mutated bytes, or an old successful log substituted for a restored build."]}}]}},{"id":"TC-1","type":"test_criterion","description":"The public build records seven successful ordered stage executions, generates real HTML and Pagefind output, and explicit standalone prebuild produces message and conversation dataset entries.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-ordered-public-build","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Both source-binding and TypeScript prop mutations produce targeted nonzero public-build failures before Astro and restore their original bytes.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-authored-source-failures","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Separate route, fragment, and duplicate-tutorial mutations fail through the real public build at their owning gates and leave no changed fixture sources.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-content-gate-failures","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Actual Pagefind unavailability prevents link execution, and all six mutation variants have targeted failure, byte-exact restoration, and fresh successful seven-stage build receipts.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/docs-build-pipeline.test.ts -t ORI-CI-002-pagefind-failure-and-restore","maps_to_ac":"AC-4"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-CI-002",
  "commit_sha": "3573a23792b17c0fb2815b404aa65dd10815e4d7",
  "done": "Approved at 3573a23792b17c0fb2815b404aa65dd10815e4d7 and merged to main as c9bb5cc51c8eb101d04beafec274522633b37535: the public docs build (apps/docs/package.json:8) now runs the exact seven-stage chain registry:build, gallery:manifest, prebuild, check:snippets, astro build, search:index, check:links with fail-stop semantics; pnpm-workspace.yaml:4 pins enablePrePostScripts:false so prebuild runs exactly once and explicitly; root e2e:docs (package.json:20) reduced to the 3-segment public-build + Playwright form with ci-chain-order's five-segment expectation superseded (tests/sprint-01-docs-spike-skeleton/ci-chain-order.test.ts:313-327); tests/sprint-05-orient-search/docs-build-pipeline.test.ts proves the chain through the real public command in owned scratch copies (cold ordered build, standalone prebuild trio, six mutation variants each with targeted failing build, byte-exact restoration, fresh green rebuild), with receipts under tests/sprint-05-orient-search/evidence/ORI-CI-002/ and RED/GREEN at .tmp/ORI-CI-002/cycle-1/.",
  "deviations": [
    "The duplicate-tutorial fixture additionally extends COMMITTED_BINDINGS inside its scratch copy of scripts/docs-data/authored-snippets.ts:80 (restored byte-exactly in finally) because the plan's bare quickstart copy would fail check:snippets as unbound blocks before Astro's tutorial gate could fire, and the scenario requires Astro's uniqueness failure.",
    "The missing-route and missing-fragment mutations anchor on introduction.md's unique ](/docs/theming) and ](/docs/owns-vs-does-not-own) links rather than the ](/docs/cli) or ](/docs/installation) links the plan's prose implies, because those two strings each occur twice in introduction.md and a non-unique anchor killed the first drill attempt.",
    "TDD_MODE was skipped per the charter but RED evidence was still captured before the script changes (.tmp/ORI-CI-002/cycle-1/red/ordered-public-build.log) per the sprint's RED-before-GREEN rule.",
    "The evidence files preserve appended run history (the RED run plus one intermediate fatal run with the non-unique anchor) rather than being single-run pristine outputs, per the contract's preserve-prior-evidence clause."
  ],
  "concerns": [
    "ORI-CI-001's single-tutorial-gate.test.ts duplicate and noncanonical tokens are broken on main as of this merge: a copied or renamed tutorial doc now fails check:snippets with unbound-block diagnostics before Astro's tutorial gate, verified empirically with ORI-CI-001's exact mutation.",
    "The invalid-prop failing-build diagnostic names the compiler case-clone path (ori-ast-005-<engine>-case-*/shared/quickstart-screen.tsx), not the repo-relative source path, so the test asserts on the basename plus the real error TS2322 line rather than a repo path.",
    "The public build now depends on network when cold: check:links performs real external HTTP (7 ordinary 404 warnings on the github mirror source links, non-fatal) and search:index resolves pagefind through pnpm dlx, so CI and ORI-CI-004 inherit both the dependency and roughly 90s warm build time (up from ~15s for the old three-stage build).",
    "Stage-start observation matches pnpm 10.32.1 lifecycle header shapes and Astro 7's [build] markers (STAGE_SPECS at tests/sprint-05-orient-search/docs-build-pipeline.test.ts:103), so a pnpm or Astro major bump that changes output shapes will need those regexes updated.",
    "The righthook pre-commit pnpm lint job failed once with full-repo useLiteralKeys diagnostics that an immediate rerun (direct binary and pnpm lint) showed as clean — transient and unreproduced, but worth watching if CI's lint job ever flakes."
  ],
  "findings": [
    "Trunk before this task silently auto-ran prebuild as a pnpm lifecycle hook before the build script body (the RED run observed stage starts [prebuild, registry:build, gallery:manifest]), meaning the old public build double-generated data once per invocation.",
    "pnpm dlx reuses its cached install dir across invocations and honors an npm_config_cache_dir env redirect, and the pagefind_extended binary inside it is a hardlink to the global store, so copy+rename yields a fixture-private inode that can be made genuinely unavailable without touching the store.",
    "Astro 7 emits [build] Collecting build info at build start and [build] Complete! at end — there is no 'Building client bundle' line that older Astro docs suggest.",
    "pnpm config get enable-pre-post-scripts reads the pnpm-workspace.yaml camelCase key and returns false, which is how the test proves the effective lifecycle setting inside the isolated copies."
  ],
  "scope_impact": [
    {
      "target": "ORI-CI-001",
      "found": "single-tutorial-gate.test.ts duplicatePublished and noncanonical drills expect Astro's tutorial-gate diagnostics from the public build, but the new check:snippets stage rejects the copied/renamed tutorial as unbound blocks first (scripts/docs-data/authored-snippets.ts:858), so those two tokens fail under pnpm test.",
      "change": "Extend that drill's scratch COMMITTED_BINDINGS for the duplicate/moved doc exactly as ORI-CI-002's duplicate variant does (tests/sprint-05-orient-search/docs-build-pipeline.test.ts planDuplicateTutorial), as a small owner-scoped remediation task."
    },
    {
      "target": "ORI-CI-004",
      "found": "Its acceptance lane runs pnpm e2e:docs and pnpm test, which now inherit the ORI-CI-001 breakage above plus a ~90s docs build containing external HTTP link checks and a pnpm dlx pagefind resolution.",
      "change": "Sequence the ORI-CI-001 remediation before ORI-CI-004 acceptance and budget for the longer, network-dependent docs build in its lane."
    },
    {
      "target": "ROADMAP",
      "found": "The sprint plan's dependency graph treats ORI-CI-002 as a pure wiring task, but its corpus-wide gate reordering changed the observable outcome of an already-landed sibling drill.",
      "change": "When a task inserts a corpus-wide gate ahead of Astro, scan landed tests that mutate the corpus for outcome-gate assumptions and list them in the new task's Supersedes field."
    }
  ],
  "feedback": [
    "The exact script-surface contract (the JSON block pinning every build script verbatim) made implementation and review deterministic — keep that pattern for wiring tasks.",
    "Scenario prose that names exact string mutations should verify anchor uniqueness in the live corpus at plan time; two of the implied anchors in introduction.md were ambiguous and cost one full drill cycle.",
    "Charters adding an earlier-failing gate should carry an explicit supersedes list covering affected landed drills, not only the root-script expectation, so cross-task breakage lands in scope instead of in the next task's acceptance lane."
  ]
}
```
