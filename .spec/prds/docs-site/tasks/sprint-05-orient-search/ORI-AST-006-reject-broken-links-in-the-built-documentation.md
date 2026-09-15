<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search -->

# ORI-AST-006: Reject broken links in the built documentation

## What this does

The built documentation fails link validation for missing internal targets or declared references, with precise diagnostics and proof from real build mutations.

## Why

Broken links can survive source checks and strand readers. This gate checks the files Astro actually emitted.

## How to verify

After complete HTML emission, run `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts` and `pnpm exec tsx scripts/docs-data/check-dist-links.ts`. Inspect real target-deletion, fragment and HTTP severity evidence.

## Scope

Three files: the production checker, its task-owned integration tests, and its evidence manifest. All implementation and product evidence remain future work.

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

TASK: ORI-AST-006 — Reject broken links in the built documentation

> Status: ✅ Completed

Commit: ab8935974b71724cec2d948786404c9ca23a660f
> Assignee: astro-implementer
> Priority: P1 · Points: 3 · Type: BUILD · Dependency phase: After ORI-AST-001
> Proposed By: astro-planner · Co-authored By: none
> TDD_MODE: red_first · RED_GREEN_REQUIRED: true
> Sprint: [SPRINT.md](./SPRINT.md) · Planned date: 2026-09-14
> Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

### OUTCOME

The built documentation fails link validation for missing internal targets or declared references, with precise diagnostics and proof from real build mutations.

### CRITICAL CONSTRAINTS — Never

- Preserve shared WIP and shared build output. Mutate only owned physical build copies under OS-derived scratch roots; keep persistent repository edits inside the exact allowlist.
- Use real emitted HTML, filesystem reads, checker processes and HTTP requests. Never use mocks, canned responses, test-only success seams, skipped cases or static success.
- Resolve canonical-origin links against the checked build and fragments against actual target IDs. Never maintain an internal route allowlist or exempt a missing future route, boundary or recovery destination.
- Ordinary external failures warn; declared prior-art/reference failures fail closed. Preserve the default required-reference set and normal TLS verification.
- Treat every evidence path as a future output. Link reachability cannot establish live useChat, provider or native behavior.

### DONE WHEN

- [ ] AC-1 proves real emitted document, redirect and asset resolution.
- [ ] AC-2 proves independent target deletions fail precisely and empty output cannot pass.
- [ ] AC-3 proves fragment lookup against actual IDs, including an ID-only failure.
- [ ] AC-4 proves real HTTP warnings and required-reference hard failures.
- [ ] Exact verification commands, typecheck, scoped lint, seeded evidence and independent review pass within the allowlist.

### RUNTIME COMMANDS AND PROGRESS

- Test: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts`
- Checker: `pnpm exec tsx scripts/docs-data/check-dist-links.ts`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm exec biome ci scripts/docs-data/check-dist-links.ts tests/sprint-05-orient-search/dist-link-gate.test.ts tests/sprint-05-orient-search/evidence/ORI-AST-006/manifest.json`

PROGRESS: 0/4 acceptance criteria complete; all TDD_STATE values are none.

VERIFICATION_POLICY: requires_tests=true; requires_red_evidence=true; requires_seeded_evidence=true.

### SPECIFICATION AND IMPLEMENTATION SURFACE

Parse real dist HTML and resolve relative, root-relative, and canonical-origin internal links using the site's actual static output conventions. Validate document targets and fragments across authored docs, generated item pages, ledger, and recovery links. Recognize actual generated redirect documents and real asset files. Report the referring file and unresolved URL on failure. Treat ordinary external failures as warnings and the declared prior-art/reference URLs as hard failures through real HTTP requests. CI runs the gate after all HTML is emitted; no missing future route is exempted.

Walk all emitted HTML and preserve original referring filenames and URLs. Resolve documents and assets from the checked tree, decode fragment spellings, and inspect IDs in actual target HTML. Missing or empty HTML input must fail.

Keep the default checker command unchanged. Provide ordinary production CLI configuration for selecting a dist directory and adding a required reference URL. The additive option must preserve all default required references and run the same production checker. This supports real build validation and isolated-copy verification without a test-only branch.

Capture actual HTTP statuses and redirects. Required-reference severity follows the originally declared URL across redirects. Network or TLS failures cannot become success. Non-HTTP application links are not fetched as web documents.

CI integration consumes this command after HTML emission. Workflow and pipeline edits remain with their owners.

### ACCEPTANCE CRITERIA

This BUILD task has no assigned human flow. Every AC below is a non-primary, task-owned integration proof with flow_ref:null and surface_policy:null. No UI policy or flow is invented; no journey ownership is claimed.

**AC-1: Resolve actual emitted targets**

GIVEN a complete real documentation build WHEN the production checker resolves emitted links THEN documents, canonical links, actual redirects and assets resolve within that build.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/dist-link-gate.test.ts

TEST_FUNCTION: ORI-AST-006-resolves-emitted-targets

VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-resolves-emitted-targets`

VERIFICATION_SERVICE: Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints

SURFACE_POLICY: null

SCENARIO:

```json
{"id":"SC-ORI-AST-006-1","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["A static success stub never reads the emitted HTML or filesystem.","Canonical links use the deployed site while the checked build is disconnected from its targets."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Run the production CLI on the baseline and copies expressing an existing /components/message link as relative, root-relative and canonical-origin URLs."]},"end_state":{"must_observe":["All 3 forms resolve to the same captured message file with exit 0.","Traversal includes /docs/introduction, /components/message, /registry, /docs/owns-vs-does-not-own and /404."],"must_not_observe":["0 HTML files traversed with success.","Canonical internal links checked against public HTTP instead of the build."]}},{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Check actual emitted redirect documents and their destinations, the linked /_astro/ asset and both message registry JSON files."]},"end_state":{"must_observe":["Capture a real redirect filename and destination; exit 0.","Both `/r/nativewind/message.json` and `/r/uniwind/message.json` and the captured `/_astro/` asset resolve without appending `index.html`."],"must_not_observe":["An empty redirect or asset inventory accepted as proof.","A redirect exemption that skips its destination."]}}],"use_case_ref":"UC-DELIV-01"}
```

**AC-2: Reject missing documents and assets**

GIVEN isolated copies of a real build WHEN a linked document or asset is removed THEN the checker fails with its referring file and unresolved URL.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/dist-link-gate.test.ts

TEST_FUNCTION: ORI-AST-006-rejects-missing-documents

VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-rejects-missing-documents`

VERIFICATION_SERVICE: Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints

SURFACE_POLICY: null

SCENARIO:

```json
{"id":"SC-ORI-AST-006-2","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["The checker is a no-op that exits successfully after a target file is deleted.","An author-maintained route allowlist hides missing boundary, recovery or future destinations."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["In independent copies, delete a linked message document, boundary document, recovery target referenced by /404, redirect destination and asset, one per run. Run the real CLI, restore each owned copy and rerun."]},"end_state":{"must_observe":["All 5 deletion runs have exitCode != 0 and name the captured referring file and unresolved URL.","Restoration returns exit 0; baseline SHA-256 hashes remain equal."],"must_not_observe":["Exit 0 while a deleted target remains referenced.","No source filename or target URL in the diagnostic."]}},{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Run the production CLI on an owned absent output path and an owned directory with no HTML."]},"end_state":{"must_observe":["Both runs have exitCode != 0 and identify their missing HTML input path."],"must_not_observe":["Exit 0 for empty or absent output."]}}],"use_case_ref":"UC-DELIV-01"}
```

**AC-3: Validate actual fragment IDs**

GIVEN real target documents with emitted IDs WHEN fragment links are checked and one target ID is removed THEN valid fragments pass and missing fragments fail precisely.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/dist-link-gate.test.ts

TEST_FUNCTION: ORI-AST-006-validates-fragments

VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-validates-fragments`

VERIFICATION_SERVICE: Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints

SURFACE_POLICY: null

SCENARIO:

```json
{"id":"SC-ORI-AST-006-3","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["A stub checks document existence but omits target ID lookup.","Fragment validation consults stale cached HTML after an ID is removed."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Capture /registry ID row-message and a real heading ID. Check same-document, relative and canonical fragment links, including encoded spellings, in owned copies."]},"end_state":{"must_observe":["All 3 URL forms resolve their captured IDs with exit 0.","Encoded and plain fragments both resolve to `row-message`."],"must_not_observe":["0 IDs read while claiming fragment coverage.","A missing-fragment error for an existing captured ID."]}},{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Remove only row-message's ID attribute in a fresh build copy, preserving its document and incoming href. Run the production CLI, restore the ID and rerun."]},"end_state":{"must_observe":["The failing run has exitCode != 0 and names its captured referring file and complete URL including `#row-message`.","The target file remains present; restoring its ID returns exit 0."],"must_not_observe":["Exit 0 with the target ID absent.","An empty diagnostic or a missing-document error instead of missing fragment."]}}],"use_case_ref":"UC-DELIV-01"}
```

**AC-4: Enforce real external-link severity**

GIVEN real external HTTP responses WHEN ordinary and declared reference links fail THEN ordinary failures warn while declared reference failures make the checker exit nonzero.

PRIMARY: false · FLOW_REF: null · TEST_TIER: integration · TDD_STATE: none

TEST_FILE: tests/sprint-05-orient-search/dist-link-gate.test.ts

TEST_FUNCTION: ORI-AST-006-checks-external-policy

VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-checks-external-policy`

VERIFICATION_SERVICE: Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints

SURFACE_POLICY: null

SCENARIO:

```json
{"id":"SC-ORI-AST-006-4","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["Mocked HTTP or a canned success response replaces actual external requests.","The checker omits required-reference classification or treats every external failure as a warning."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"external_links","action":{"actor":"cli_user","steps":["Run the real checker on every emitted authoritative reference URL. Capture actual redirects/statuses; resolve internal canonical links locally."]},"end_state":{"must_observe":["Every declared reference has an observed final HTTP status in 200..299 before baseline exit 0.","Capture requested/final URLs and statuses; any `apps/example` result states `reachability only`."],"must_not_observe":["0 real HTTP requests with a passing reference verdict.","Live useChat or native behavior inferred from reachability."]}},{"start_ref":"external_links","action":{"actor":"cli_user","steps":["Run the checker with the confirmed real 404 as an ordinary anchor, then with the same URL additionally declared required; preserve default required references."]},"end_state":{"must_observe":["Ordinary HTTP 404 produces a source/URL/status warning and exit 0 when required links pass.","The same required-reference HTTP 404 produces a source/URL/status hard failure and exitCode != 0."],"must_not_observe":["No warning for the ordinary HTTP 404.","Exit 0 for the declared-required HTTP 404.","Mocked HTTP, a simulated external server or a skipped request."]}}],"use_case_ref":"UC-DELIV-01"}
```

### TEST CRITERIA

- **TC-1 → AC-1:** The real checker resolves all three internal URL forms, actual redirects and emitted assets, with nonempty traversal evidence. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-resolves-emitted-targets`
- **TC-2 → AC-2:** Deleting each linked target causes a nonzero process exit naming source and URL; restoring the owned copy passes, and empty output fails. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-rejects-missing-documents`
- **TC-3 → AC-3:** Existing and encoded fragments pass; removing only a target ID fails with source and complete fragment URL; restoring it passes. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-validates-fragments`
- **TC-4 → AC-4:** Real HTTP reference successes are recorded, an ordinary HTTP 404 warns, and the same declared-required HTTP 404 fails. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-checks-external-policy`

TCs inherit their mapped AC scenarios and carry no independent fixtures.

### SHARED FIXTURES

```json
{"built_docs":{"description":"Future fixture: real complete candidate build and separate physical fault-drill copies under node:os.tmpdir().","seed_method":"cli","records":["Run pnpm registry:build, pnpm gallery:manifest, then pnpm --filter @rnr-ai-elements/docs build in the owned candidate.","Capture emitted filenames, hrefs, targets and IDs for /docs/introduction, /components/message, /registry, /docs/owns-vs-does-not-own and /404 before mutation.","Capture actual redirect documents, a linked /_astro/ asset and both /r/{nativewind,uniwind}/message.json files; missing prerequisite output blocks proof.","Read https://rnraielements.com from the candidate config; capture candidate SHA and baseline build hashes."]},"external_links":{"description":"Future fixture: built_docs entrypoints, actual authoritative reference hrefs and real HTTP responses.","seed_method":"cli","records":["Read emitted declarations for Vercel AI Elements, expo-ai-elements prior art and the authoritative RNR CLI reference; request their exact URLs with normal TLS.","Confirm an actual HTTP 404 at a unique nonexistent path on a real external reference origin, then replace one existing anchor href in an owned build copy.","Check that same URL first as ordinary, then additionally declared required through production configuration; keep every default required reference."]}}
```

### SCOPE — FILE-LEVEL WRITE PERMISSIONS

writeAllowed:

- scripts/docs-data/check-dist-links.ts
- tests/sprint-05-orient-search/dist-link-gate.test.ts
- tests/sprint-05-orient-search/evidence/ORI-AST-006/manifest.json

writeProhibited:

- .spec/**
- .github/**
- apps/**
- packages/**
- package.json
- pnpm-lock.yaml
- Any repository path not explicitly listed in write_allowed; shared build outputs are never mutation targets.

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

The allowlist governs persistent repository edits. Build generation and fault drills use the assigned candidate and owned OS-derived scratch roots; this grants no permission to mutate shared output.

### BOUNDARIES — Always / Ask First

Always:

- Run RED-first integration cases sequentially and retain actual assertion failures; missing tests, import errors and unavailable builds are blockers rather than functional RED.
- Capture source identity and pre-mutation target bytes/IDs before each drill; hash the untouched baseline before and after.
- Keep the default production CLI executable from the repository root and run it after all HTML is emitted.
- Record sanitized command, exit, diagnostic, target and HTTP evidence in the task-owned manifest; clean only owned scratch data.

Ask first:

- A required repair or dependency change exceeds the three allowed files.
- The canonical origin or declared authoritative reference contract must change.

### DELIVERABLE

- scripts/docs-data/check-dist-links.ts (NEW): production checker over emitted files, with precise diagnostics and external-reference severity.
- tests/sprint-05-orient-search/dist-link-gate.test.ts (NEW): four tokenized integration tests with real build and HTTP cases.
- tests/sprint-05-orient-search/evidence/ORI-AST-006/manifest.json (NEW, planned): bounded, source-bound per-run RED/GREEN evidence.

### AGENT INSTRUCTIONS — RED / GREEN / REFACTOR

For each AC, write its exact tokenized integration test first, seed through real build entrypoints and observe a behavioral assertion failure before implementation. Report unavailable dependencies or builds as concrete blockers; a missing test token or import failure is not RED evidence.

After RED verification, implement only the current failing behavior in the allowed checker file. Rerun the exact AC command and capture GREEN with the seeded values. Refactor only while those same real cases remain green; introduce no new behavior.

After all ACs, run both immutable verify commands, typecheck and scoped lint. The independent astro-reviewer verifies the exact candidate and evidence before approval.

### READING LIST

1. scripts/docs-data/drill-item-count.ts [PRIMARY PATTERN], lines 16-47 and 75-145: real subprocess results, discriminating mutation and hash evidence. Reuse the evidence pattern; replace its shared-file mutation with owned build copies.
2. apps/docs/astro.config.mjs, lines 1-11: canonical origin and static output configuration; recheck the assigned candidate.
3. apps/docs/package.json, lines 1-16: actual build/prebuild entrypoints and their ordering.
4. tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts, lines 65-122: real process execution and build serialization; do not copy synthetic failure helpers or mutate shared output.
5. .spec/prds/docs-site/11-technical-requirements/12-content-standards.md, lines 33-38: internal-link failures and ordinary/reference external severity.

### DESIGN AND REFERENCE GUIDANCE

This build safeguard has no separate site control. Follow actual Astro output and existing docs-data diagnostic conventions. No layout, token, island or native UI changes are required.

### CODING STANDARDS

- Use TypeScript with explicit result/error types and node: filesystem, path, URL, crypto and child-process APIs as appropriate. Preserve source and unresolved URL in diagnostics.
- Keep parsing, target resolution, severity and exit status deterministic. Exercise the same production code from CLI and tests; add no test-only branch.
- Use installed, declared dependencies. Dependency or lockfile changes require expanded authorization; do not import undeclared transitive packages.
- Run typecheck and scoped Biome checks. Never bypass hooks or attribute failures to prior work without evidence.

### BOUNDARY CONTRACTS AND CAPABILITIES

- The link checker validates emitted product files, not an author-maintained route allowlist.
- Canonical-domain internal links resolve against the same build that is being checked.
- Fragment checks inspect actual target document IDs.
- The absorbed boundary and 404 destinations are ordinary required internal targets.
- A successful apps/example link check proves reachability only; live useChat verification remains with the AI SDK and native tasks.

Touches: CAP-DOCS-01.

Provides: production checker, task-owned integration tests, precise source/URL diagnostics and source-bound evidence for the post-HTML CI gate.

Consumes: ORI-AST-001 routing conventions; the complete candidate's authored docs, generated pages, ledger, boundary/recovery destinations, redirects and assets; configured canonical origin and declared reference hrefs.

PRD references:

- .spec/prds/docs-site/11-technical-requirements/12-content-standards.md — Content gates, item 2
- .spec/prds/docs-site/07-uc-deliv.md — UC-DELIV-01
- .spec/prds/docs-site/12-e2e-testing-criteria.md — T-DELIV-017
- .spec/prds/docs-site/11-technical-requirements/10-routing.md — routes, redirects and assets
- .spec/prds/docs-site/11-technical-requirements/09-capability-chains.md — CAP-DOCS-01

### EVIDENCE GATES

1. RED: each exact AC test demonstrates a real assertion failure before implementation. All TDD_STATE values remain none until execution.
2. Seeded behavior: inspect nonempty traversal, source/URL diagnostics, fragment-only failure, restoration hashes and real HTTP severity pairs.
3. GREEN: run `pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts` and `pnpm exec tsx scripts/docs-data/check-dist-links.ts` unchanged after complete HTML emission. Missing downstream destinations fail rather than receive exemptions.
4. Quality: typecheck and scoped lint exit 0; persistent changes remain inside writeAllowed.
5. Independent review: reject stubs, placeholders, skips and fake success; rerun real proofs on the reviewed candidate and validate its identical Scenario Contract.

Verification contract: Run the production checker on a real build and isolated copies of that build. Introduce a missing document and missing fragment separately and require nonzero exits naming both source and target. Exercise authoritative external links with real HTTP. Do not mutate shared build output during parallel verification.

Planned evidence path: tests/sprint-05-orient-search/evidence/ORI-AST-006/manifest.json.

The manifest must retain candidate/source identity; lockfile/checker/test hashes; exact commands; pre-mutation hrefs, targets and IDs; RED/GREEN stdout, stderr and process exits; mutation/restoration results; untouched-tree hashes; actual requested/final HTTP URLs, statuses and redirects; owned scratch identity and cleanup. Store bounded per-run records while preserving prior run identities. Never capture credentials.

There is no locked flow RED path for this dark task. Embed task-owned RED records in the allowed manifest. Do not claim or rename another flow's canonical proof.red. No additional repository evidence path is authorized.

Read-only charter validation: the exact normalized fixtures and requirements were piped to `python3 /Users/justinrich/Projects/brain/tools/validate-scenario/validate_scenario.py`; exit 0, scenario_count 4, violations []. This validates the authored scenarios only. No product verification ran.

### OUT OF SCOPE

- Writing or repairing docs pages, redirects, registry components or app code.
- Changing manifests, lockfiles, CI workflows, deployment or canonical-domain ownership.
- Live useChat/provider/native execution, visual sign-off and search behavior.
- Owning a task flow or sprint journey; ORI-AST-010 retains journey ownership.

### CONTEXT

Current gap: the inspected scripts/docs-data tree has no check-dist-links.ts; the content standard requires a gate over emitted HTML. No product behavior was verified during authoring.

Success state: the complete candidate passes the real checker; independent missing-document, missing-ID and required-reference failures produce precise nonzero results, and owned-copy restoration passes.

Dark justification: This build safeguard has no separate site control. Its proof is a real emitted-site mutation causing a precise link-check failure.

Fixed sprint gate: A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.

Entrypoint: docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction.

Demonstrates: UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half).

The sprint retains 13 flows: nine task flows and four journeys. This task owns none.

### REVIEW — astro-reviewer

Must pass:

- All four ACs and mapped TCs have real source-bound RED/GREEN evidence.
- Canonical links, emitted redirects, assets and IDs use the checked build; no route exemptions.
- Document and fragment drills fail separately with exact source and URL; shared output hashes remain unchanged.
- Actual HTTP proves warning versus required-reference failure without mocking or default-reference downgrades.
- Exact scope, immutable commands, typecheck, lint and manifest completeness pass on the reviewed candidate.

Should verify:

- URL decoding and redirects follow emitted bytes and preserve diagnostic context.
- External requests are bounded and failures remain explicit, without unbounded retries.
- Reachability evidence makes no live-example or native claim.

Verdict: Pending independent review. Return APPROVED or NEEDS_FIXES only after real verification; findings must identify the failed AC and evidence.

Agent rationale: astro-planner owns the emitted-site and routing contract; astro-implementer builds the checker; astro-reviewer independently verifies actual output resolution and failure diagnostics.

### DEPENDENCIES AND PROVENANCE

Depends on: ORI-AST-001. Blocks: no additional dependency edges declared in this compact context. Final pipeline consumers require complete HTML; no missing route is exempted.

Proposed by: astro-planner. Co-authored by: []. Source proposal: .tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/astro-planner-absorb-prerequisites.json. Source task IDs: [ORI-AST-006]. Supersedes: []. Artifact status: planned_output_not_observed. Human test hook: null.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-AST-006","tdd_mode":"red_first","verification_policy":{"requires_tests":true,"requires_red_evidence":true,"requires_seeded_evidence":true},"fixtures":{"built_docs":{"description":"Future fixture: real complete candidate build and separate physical fault-drill copies under node:os.tmpdir().","seed_method":"cli","records":["Run pnpm registry:build, pnpm gallery:manifest, then pnpm --filter @rnr-ai-elements/docs build in the owned candidate.","Capture emitted filenames, hrefs, targets and IDs for /docs/introduction, /components/message, /registry, /docs/owns-vs-does-not-own and /404 before mutation.","Capture actual redirect documents, a linked /_astro/ asset and both /r/{nativewind,uniwind}/message.json files; missing prerequisite output blocks proof.","Read https://rnraielements.com from the candidate config; capture candidate SHA and baseline build hashes."]},"external_links":{"description":"Future fixture: built_docs entrypoints, actual authoritative reference hrefs and real HTTP responses.","seed_method":"cli","records":["Read emitted declarations for Vercel AI Elements, expo-ai-elements prior art and the authoritative RNR CLI reference; request their exact URLs with normal TLS.","Confirm an actual HTTP 404 at a unique nonexistent path on a real external reference origin, then replace one existing anchor href in an owned build copy.","Check that same URL first as ordinary, then additionally declared required through production configuration; keep every default required reference."]}},"requirements":[{"id":"AC-1","name":"Resolve actual emitted targets","type":"acceptance_criterion","primary":false,"description":"GIVEN a complete real documentation build WHEN the production checker resolves emitted links THEN documents, canonical links, actual redirects and assets resolve within that build.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/dist-link-gate.test.ts","test_function":"ORI-AST-006-resolves-emitted-targets","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-resolves-emitted-targets","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-006-1","ac_ref":"AC-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["A static success stub never reads the emitted HTML or filesystem.","Canonical links use the deployed site while the checked build is disconnected from its targets."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Run the production CLI on the baseline and copies expressing an existing /components/message link as relative, root-relative and canonical-origin URLs."]},"end_state":{"must_observe":["All 3 forms resolve to the same captured message file with exit 0.","Traversal includes /docs/introduction, /components/message, /registry, /docs/owns-vs-does-not-own and /404."],"must_not_observe":["0 HTML files traversed with success.","Canonical internal links checked against public HTTP instead of the build."]}},{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Check actual emitted redirect documents and their destinations, the linked /_astro/ asset and both message registry JSON files."]},"end_state":{"must_observe":["Capture a real redirect filename and destination; exit 0.","Both `/r/nativewind/message.json` and `/r/uniwind/message.json` and the captured `/_astro/` asset resolve without appending `index.html`."],"must_not_observe":["An empty redirect or asset inventory accepted as proof.","A redirect exemption that skips its destination."]}}],"use_case_ref":"UC-DELIV-01"}},{"id":"AC-2","name":"Reject missing documents and assets","type":"acceptance_criterion","primary":false,"description":"GIVEN isolated copies of a real build WHEN a linked document or asset is removed THEN the checker fails with its referring file and unresolved URL.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/dist-link-gate.test.ts","test_function":"ORI-AST-006-rejects-missing-documents","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-rejects-missing-documents","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-006-2","ac_ref":"AC-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["The checker is a no-op that exits successfully after a target file is deleted.","An author-maintained route allowlist hides missing boundary, recovery or future destinations."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["In independent copies, delete a linked message document, boundary document, recovery target referenced by /404, redirect destination and asset, one per run. Run the real CLI, restore each owned copy and rerun."]},"end_state":{"must_observe":["All 5 deletion runs have exitCode != 0 and name the captured referring file and unresolved URL.","Restoration returns exit 0; baseline SHA-256 hashes remain equal."],"must_not_observe":["Exit 0 while a deleted target remains referenced.","No source filename or target URL in the diagnostic."]}},{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Run the production CLI on an owned absent output path and an owned directory with no HTML."]},"end_state":{"must_observe":["Both runs have exitCode != 0 and identify their missing HTML input path."],"must_not_observe":["Exit 0 for empty or absent output."]}}],"use_case_ref":"UC-DELIV-01"}},{"id":"AC-3","name":"Validate actual fragment IDs","type":"acceptance_criterion","primary":false,"description":"GIVEN real target documents with emitted IDs WHEN fragment links are checked and one target ID is removed THEN valid fragments pass and missing fragments fail precisely.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/dist-link-gate.test.ts","test_function":"ORI-AST-006-validates-fragments","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-validates-fragments","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-006-3","ac_ref":"AC-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["A stub checks document existence but omits target ID lookup.","Fragment validation consults stale cached HTML after an ID is removed."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Capture /registry ID row-message and a real heading ID. Check same-document, relative and canonical fragment links, including encoded spellings, in owned copies."]},"end_state":{"must_observe":["All 3 URL forms resolve their captured IDs with exit 0.","Encoded and plain fragments both resolve to `row-message`."],"must_not_observe":["0 IDs read while claiming fragment coverage.","A missing-fragment error for an existing captured ID."]}},{"start_ref":"built_docs","action":{"actor":"cli_user","steps":["Remove only row-message's ID attribute in a fresh build copy, preserving its document and incoming href. Run the production CLI, restore the ID and rerun."]},"end_state":{"must_observe":["The failing run has exitCode != 0 and names its captured referring file and complete URL including `#row-message`.","The target file remains present; restoring its ID returns exit 0."],"must_not_observe":["Exit 0 with the target ID absent.","An empty diagnostic or a missing-document error instead of missing fragment."]}}],"use_case_ref":"UC-DELIV-01"}},{"id":"AC-4","name":"Enforce real external-link severity","type":"acceptance_criterion","primary":false,"description":"GIVEN real external HTTP responses WHEN ordinary and declared reference links fail THEN ordinary failures warn while declared reference failures make the checker exit nonzero.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/dist-link-gate.test.ts","test_function":"ORI-AST-006-checks-external-policy","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-checks-external-policy","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-AST-006-4","ac_ref":"AC-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Production check-dist-links.ts process, real Astro dist files, and real HTTP endpoints","negative_control":{"would_fail_if":["Mocked HTTP or a canned success response replaces actual external requests.","The checker omits required-reference classification or treats every external failure as a warning."]},"evidence":{"artifact_type":"file_artifact","required_capture":true},"cases":[{"start_ref":"external_links","action":{"actor":"cli_user","steps":["Run the real checker on every emitted authoritative reference URL. Capture actual redirects/statuses; resolve internal canonical links locally."]},"end_state":{"must_observe":["Every declared reference has an observed final HTTP status in 200..299 before baseline exit 0.","Capture requested/final URLs and statuses; any `apps/example` result states `reachability only`."],"must_not_observe":["0 real HTTP requests with a passing reference verdict.","Live useChat or native behavior inferred from reachability."]}},{"start_ref":"external_links","action":{"actor":"cli_user","steps":["Run the checker with the confirmed real 404 as an ordinary anchor, then with the same URL additionally declared required; preserve default required references."]},"end_state":{"must_observe":["Ordinary HTTP 404 produces a source/URL/status warning and exit 0 when required links pass.","The same required-reference HTTP 404 produces a source/URL/status hard failure and exitCode != 0."],"must_not_observe":["No warning for the ordinary HTTP 404.","Exit 0 for the declared-required HTTP 404.","Mocked HTTP, a simulated external server or a skipped request."]}}],"use_case_ref":"UC-DELIV-01"}},{"id":"TC-1","type":"test_criterion","description":"The real checker resolves all three internal URL forms, actual redirects and emitted assets, with nonempty traversal evidence.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-resolves-emitted-targets","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"Deleting each linked target causes a nonzero process exit naming source and URL; restoring the owned copy passes, and empty output fails.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-rejects-missing-documents","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"Existing and encoded fragments pass; removing only a target ID fails with source and complete fragment URL; restoring it passes.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-validates-fragments","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Real HTTP reference successes are recorded, an ordinary HTTP 404 warns, and the same declared-required HTTP 404 fails.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/dist-link-gate.test.ts -t ORI-AST-006-checks-external-policy","maps_to_ac":"AC-4"}]}
-->
</details>

## Handoff

```json
{
  "task": "ORI-AST-006",
  "commit_sha": "ab8935974b71724cec2d948786404c9ca23a660f",
  "done": "Shipped scripts/docs-data/check-dist-links.ts (production emitted-HTML link gate) plus four tokenized integration tests and the RED/GREEN evidence manifest, all committed and merged.",
  "deviations": [],
  "concerns": [
    "The default checker run is exit-1 on today's real build because the /registry ledger emits two genuinely broken canonical-origin links, so ORI-CI-002 must not gate CI on it until both fixes land.",
    "The PRD route map declares four 301 redirects (/docs, /install, /quickstart, /theming) that are not yet configured in astro.config.mjs, so the checker's redirect-document recognition is only exercised against fixture redirects, not real emitted ones."
  ],
  "findings": [
    "The real /registry ledger bulk-add section links the bare engine base URLs https://rnraielements.com/r/nativewind and /r/uniwind (apps/docs/src/pages/registry.astro:18-19), both of which return 404 on the deployed site; the checker correctly flags both with source registry/index.html.",
    "The checker's default required-reference set (5 URLs) was derived from the PRD prior-art/reference declarations and live-verified 200, but the plan never pinned the exact list, so a future manuscript adding a new authoritative reference needs either a --required addition or a set update in the checker.",
    "The 'complete build exits 0' success state is blocked by the two bare base URLs plus the six not-yet-landed ORI-CONT manuscripts, so the checker cannot demonstrate a clean pass over the real dist until both resolve."
  ],
  "scope_impact": [
    {
      "target": "ORI-AST-002",
      "found": "The registry ledger page (apps/docs/src/pages/registry.astro:18-19) emits the two bare engine-base-URL links that 404 on the deployed site.",
      "change": "Owner of the ledger page should either drop the <a href> wrapper around the copyable base URLs or point them at a resolvable target so the checker passes over the real build."
    },
    {
      "target": "ORI-CI-002",
      "found": "The checker command is ready to consume after HTML emission but will exit nonzero on the current real dist due to the bare-base-URL 404s.",
      "change": "CI must wire the checker only after the bare-base-URL fix and the ORI-CONT manuscripts land, otherwise the post-HTML gate is permanently red."
    },
    {
      "target": "ROADMAP",
      "found": "The fixed sprint gate's 'complete build passes the real checker' success state depends on the registry ledger fix and the un-landed manuscripts.",
      "change": "Re-sequence the link-gate GREEN to run once ORI-AST-002 (ledger) and ORI-CONT-* (manuscripts) have landed, rather than as an immediate CI assertion."
    }
  ],
  "feedback": []
}
```
