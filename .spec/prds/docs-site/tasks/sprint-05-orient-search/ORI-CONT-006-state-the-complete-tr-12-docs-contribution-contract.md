<!-- Version: TASK-TEMPLATE v5.2 · sprint-05-orient-search -->

# ORI-CONT-006: State the complete TR-12 docs contribution contract

## What this does

Contributors can execute the three real docs checks and identify all TR-12 submission criteria, including reviewer-enforced registry-description currency.

## Why

Read-only inspection found no CONTRIBUTING.md. apps/docs/package.json currently defines build but lacks check:snippets and check:links; ORI-CI-002 must provide those scripts before execution.

## How to verify

Run `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts`. Execute the documented build, snippet and link commands against the current candidate, then inspect the rendered checklist and recorded evidence. These are planned execution checks.

## Scope

- `CONTRIBUTING.md`
- `tests/sprint-05-orient-search/contributing-content.test.ts`
- `tests/sprint-05-orient-search/evidence/ORI-CONT-006-content-review.md`

<details>
<summary>▸ Full agent specification (TASK-TEMPLATE v5.2 — required reading for implementer + reviewer)</summary>

> Status: Backlog
> Assignee: techwriting-implementer (implementer) · techwriting-reviewer (reviewer)
> Priority: P2 · Points: 1 · Type: DOCS · Dependency phase: After ORI-CI-002
> Proposed By: techwriting-planner · Co-authored By: ghactions-planner
> TDD_MODE: skipped · RED_GREEN_REQUIRED: no
> Sprint: [SPRINT.md](./SPRINT.md) · Planned: 2026-09-14 · Source SHA: 38034e972490945b684f5bd5a706bca0479dc659
> AGENT: planner=techwriting-planner | implementer=techwriting-implementer | reviewer=techwriting-reviewer
> PROGRESS: 0/4 ACs; every TDD_STATE is none.

### OUTCOME

Contributors can execute the three real docs checks and identify all TR-12 submission criteria, including reviewer-enforced registry-description currency.

### 🚫 CRITICAL CONSTRAINTS

- Never replace real file reads, subprocesses or rendered review with mocks, canned output, static approval, skips or test-only product seams.
- Never edit CI, package scripts, registry descriptions or standards here; write only the three allowed files and preserve shared WIP.
- Never invent command bindings: wait for ORI-CI-002, use the three fixed pnpm commands and check links against the current built dist.
- Never duplicate the standards or glossary, expand into onboarding, or claim that CI fully proves prose accuracy.
- Never stash, reset, clean, broadly stage or perform trunk lifecycle operations; use the assigned candidate and OS-derived owned scratch.

### DONE WHEN

- [ ] AC-1 through AC-4 and TC-1 through TC-4 have concrete evidence.
- [ ] The exact task test command, all three docs commands, pnpm typecheck and pnpm lint pass.
- [ ] Rendered review verifies all local targets, canonical terms and concise imperative instructions.
- [ ] Only the three allowed files form the deliverable; generated verification outputs remain owned and uncommitted.

### SPECIFICATION

Add the smallest useful CONTRIBUTING section covering the fixed TR-12 docs-PR criteria and registry-description currency rule. Use the repository's actual build, snippet and link commands after ORI-CI-002 binds them. Link the current content standards and glossary rather than duplicating their complete text.

Success state: A short CONTRIBUTING.md checklist states all four independent docs-PR criteria, links the canonical standards and glossary, and proves the documented commands against the current candidate.

Page plan:

```json
[{"path":"CONTRIBUTING.md","quadrant":"how-to","audience":"Contributors who can make a reviewed source change and need the exact docs-change submission criteria.","reader_job":"Prepare a docs or behavior-changing registry contribution for review.","success_criterion":"The contributor can run the three real docs checks and identify the required voice, terminology, template and registry-description changes.","shape":"Short imperative contribution checklist with exact commands and authoritative links; no second onboarding tutorial."}]
```

### RUNTIME COMMANDS

```text
Test: pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts
Typecheck: pnpm typecheck
Lint: pnpm lint
```

Docs commands, in execution order:

- `pnpm --filter @rnr-ai-elements/docs build`
- `pnpm --filter @rnr-ai-elements/docs check:snippets`
- `pnpm --filter @rnr-ai-elements/docs check:links`

### ACCEPTANCE CRITERIA

No locked task or journey flow is assigned. All ACs are task-local integration proof with primary:false and flow_ref:null; surface_policy:null because this docs task has no governed UI flow.

AC-1 is the headline outcome. No AC claims PRIMARY flow ownership.

#### AC-1: Four independent docs-PR criteria

GIVEN the real candidate after ORI-CI-002 WHEN a contributor reads CONTRIBUTING.md THEN four independent criteria name build, link check, snippet gate and voice/terminology/page-template conformance.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/contributing-content.test.ts
TEST_FUNCTION: ORI-CONT-006-four-criteria
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-four-criteria
MAPS_TO_AC: null
```

SCENARIO (complete):

```json
{"id":"SC-ORI-CONT-006-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["CONTRIBUTING.md is empty or omits any criterion.","The checker returns static success after a documented command is mutated."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Read CONTRIBUTING.md from disk and check the contribution checklist against TR-12 and apps/docs/package.json."]},"end_state":{"must_observe":["4 independent criteria: build green, link check green, snippet gate green, and voice/terminology/page-template conformance.","3 exact commands: pnpm --filter @rnr-ai-elements/docs build; pnpm --filter @rnr-ai-elements/docs check:snippets; pnpm --filter @rnr-ai-elements/docs check:links."],"must_not_observe":["Empty CONTRIBUTING.md or a checklist with no content-standards criterion."]}},{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Copy the actual candidate content into owned scratch. Remove each criterion separately and replace check:snippets with check:snippet in a separate copy. Run the same assertions on every real file copy."]},"end_state":{"must_observe":["5 mutated copies fail with diagnostics naming the removed criterion or check:snippet; the unchanged source passes."],"must_not_observe":["A static success result for a copy with no snippet criterion or the wrong command."]}}]}
```

#### AC-2: Run the documented commands against the candidate

GIVEN ORI-CI-002 binds the three real scripts WHEN the test executes the documented commands as subprocesses THEN build, snippet and link checks succeed with command, exit and fresh artifact evidence.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/contributing-content.test.ts
TEST_FUNCTION: ORI-CONT-006-real-docs-checks
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-real-docs-checks
MAPS_TO_AC: null
```

SCENARIO (complete):

```json
{"id":"SC-ORI-CONT-006-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["A subprocess is mocked or replaced by static success.","Link verification is disconnected from the current built dist."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Read and validate the three documented commands against apps/docs/package.json. Execute build, check:snippets and check:links sequentially as real pnpm subprocesses from the candidate root.","Capture each command, working directory, exit status and stdout/stderr; bind the candidate source and built artifact hashes. Confirm check:links reads the dist produced by this build."]},"end_state":{"must_observe":["3 real subprocess receipts contain the exact documented commands and exit status 0.","The build produces `apps/docs/dist/docs/introduction/index.html`; the link-check receipt identifies this candidate's built dist and the snippet receipt records actual compiled source inputs."],"must_not_observe":["Empty command output substituted for execution, skipped subprocesses or a stale dist receipt."]}}]}
```

#### AC-3: Require registry-description currency review

GIVEN a PR changes a registry item's behavior WHEN a contributor reads the review rule THEN they must update that item's description in packages/registry/registry.json and request a reviewer accuracy check.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/contributing-content.test.ts
TEST_FUNCTION: ORI-CONT-006-description-currency
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-description-currency
MAPS_TO_AC: null
```

SCENARIO (complete):

```json
{"id":"SC-ORI-CONT-006-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["The description-currency rule is removed or the assertion is a no-op."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Read the actual contribution rule and resolve its registry link from CONTRIBUTING.md. Parse packages/registry/registry.json and record one actual item's name and description.","Require the behavior-change trigger, description update and reviewer accuracy judgment; reject any claim that prose accuracy is fully machine-gated."]},"end_state":{"must_observe":["The rule names `packages/registry/registry.json` and `description`, connects behavior changes to updates, and assigns sentence accuracy to reviewers.","1 real registry item's name and description are captured alongside the quoted contribution rule."],"must_not_observe":["No behavior-to-description rule or a claim that CI fully proves prose accuracy."]}},{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Copy the actual CONTRIBUTING.md into owned scratch, remove the description-currency rule, and run the same real-file assertion against the copy."]},"end_state":{"must_observe":["1 copy without the currency rule fails with a description-currency diagnostic; the original file remains byte-identical."],"must_not_observe":["Static success for the copy with no currency rule."]}}]}
```

#### AC-4: Link canonical standards and review the rendered checklist

GIVEN the canonical TR-12 standards and terminology lock WHEN the contributor follows local links and the reviewer reads rendered Markdown THEN all targets resolve and the checklist uses concise imperative prose and exact canonical terms.

```text
PRIMARY: false
FLOW_REF: null
TEST_TIER: integration
VERIFICATION_SERVICE: Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker
SURFACE_POLICY: null
TDD_STATE: none
TEST_FILE: tests/sprint-05-orient-search/contributing-content.test.ts
TEST_FUNCTION: ORI-CONT-006-standards-and-links
VERIFY: pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-standards-and-links
MAPS_TO_AC: null
```

SCENARIO (complete):

```json
{"id":"SC-ORI-CONT-006-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["Canonical links are absent or disconnected from their real files.","Rendered review is replaced by a static approval with no quoted candidate text."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Resolve every local CONTRIBUTING.md link and fragment from disk, including apps/docs/package.json, packages/registry/registry.json and the canonical content standards.","Resolve the glossary link to #terminology-lock-one-canonical-term-per-concept and the page-template link to #page-templates-authored.","Review the actual Markdown in a Markdown preview; record quoted checklist excerpts and the reviewer decision in the owned content-review evidence. Check active voice, short sentences, defined acronyms and imperative steps."]},"end_state":{"must_observe":["Links resolve to apps/docs/package.json, packages/registry/registry.json and .spec/prds/docs-site/11-technical-requirements/12-content-standards.md.","The 2 fragment targets are Terminology lock (one canonical term per concept) and Page templates (authored).","The review records quoted CONTRIBUTING.md checklist text using registry item and a concrete expected result for each of the 3 commands."],"must_not_observe":["Empty review evidence, dangling local targets or a duplicate glossary or onboarding lesson."]}}]}
```

### TEST CRITERIA

- **TC-1** → AC-1: CONTRIBUTING.md states all four independent criteria and all three exact commands; criterion removals and command mutation fail. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-four-criteria`.
- **TC-2** → AC-2: All three documented commands execute successfully as real subprocesses, and their receipts bind the current candidate and built dist. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-real-docs-checks`.
- **TC-3** → AC-3: The behavior-to-description rule names the registry path and reviewer judgment; removing the rule fails. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-description-currency`.
- **TC-4** → AC-4: Every local target and fragment resolves; rendered review records concise imperative prose, canonical terms and command outcomes. VERIFY: `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-standards-and-links`.

### SHARED FIXTURES

```json
{"docs_candidate":{"description":"At execution, use the assigned isolated candidate after ORI-CI-002 supplies the real docs scripts. Read source files through the CLI and real filesystem; copy actual bytes into owned OS-derived scratch for mutations. Do not inject content or command outcomes.","seed_method":"cli","records":["apps/docs/package.json names @rnr-ai-elements/docs and must bind build, check:snippets and check:links after ORI-CI-002.","packages/registry/registry.json supplies real registry items and their description fields.",".spec/prds/docs-site/11-technical-requirements/12-content-standards.md supplies the four docs-PR criteria, Terminology lock and page templates.","CONTRIBUTING.md is the task-authored input; missing or empty content must fail. Build outputs must be produced by the current candidate."]}}
```

All fixtures are execution-time real inputs; none is an observed success claim.

### SCOPE

writeAllowed:

- `CONTRIBUTING.md`
- `tests/sprint-05-orient-search/contributing-content.test.ts`
- `tests/sprint-05-orient-search/evidence/ORI-CONT-006-content-review.md`

writeProhibited:

- `.spec/**`
- `.github/**`
- `apps/**`
- `packages/**`
- `scripts/**`
- `package.json`
- `pnpm-lock.yaml`
- `Any file not explicitly listed in write_allowed`

Use the assigned isolated writable candidate/worktree and owned scratch roots. Preserve shared WIP; do not stash, reset, clean, broadly stage or run trunk lifecycle operations.

### BOUNDARIES

✅ Always:

- Read actual source files and script bindings before stating commands.
- Keep the checklist goal-oriented, imperative and consistent with the canonical terminology lock.
- Run mutations only on real file copies in owned OS-derived scratch; preserve the source bytes.
- Capture actual command output, candidate identity and quoted rendered-review evidence.
- Stop on missing prerequisites or failed checks and report concrete evidence to the owning task.

⚠️ Ask First:

- Changes to command contracts, canonical standards or the three-file scope.
- Additional contribution topics beyond the fixed TR-12 criteria.

### DELIVERABLE

- `CONTRIBUTING.md` (NEW or minimal MODIFY if supplied before dispatch): Short complete TR-12 contribution checklist.
- `tests/sprint-05-orient-search/contributing-content.test.ts` (NEW): Four task-local integration cases over real sources, commands and isolated mutations.
- `tests/sprint-05-orient-search/evidence/ORI-CONT-006-content-review.md` (NEW): Future source-bound command receipts, assertion output, mutation diagnostics and rendered content review.

### AGENT INSTRUCTIONS

This task authors a documentation checklist and its content proof. RED-first is skipped for pure docs; real integration, mutation controls and seeded evidence remain required.

Verification policy: `{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true}`.

1. Confirm the assigned candidate and ORI-CI-002 handoff; record source SHA, lockfile hash and actual script bindings. Missing commands block execution.
2. Author the smallest useful checklist and one named test per AC. TDD_MODE is skipped for docs; every AC retains integration proof and negative controls.
3. Read actual files; mutate only isolated copies. Assert missing content as a content failure, not a module-load error. Do not build a test-only product adapter.
4. Execute build, snippets and links in order as real subprocesses. Capture outputs and artifact identity in the owned evidence file. Missing, stale or skipped work fails.
5. Inspect rendered Markdown, record the author review, run the exact task command plus typecheck and lint, and hand the candidate to techwriting-reviewer for independent review.

### READING LIST

1. `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md` [PRIMARY PATTERN] — lines 11-38 — Voice, canonical glossary, page templates and the complete fixed TR-12 criteria.
2. `apps/docs/package.json` — Actual script owner; re-read after ORI-CI-002 supplies the missing checks.
3. `packages/registry/registry.json` — Real registry item descriptions; read only.
4. `tests/sprint-01-docs-spike-skeleton/enrichment-gates.test.ts` — lines 1-100 — Real filesystem and subprocess conventions; do not copy test-only component fixtures.
5. `.spec/prds/docs-site/08-uc-ext.md` — UC-EXT-03 docs criteria and currency subset; broader contribution topics remain outside this task.

### DESIGN AND REFERENCE GUIDANCE

CONTRIBUTING.md is a how-to for contributors who already know how to submit a reviewed change. Use a short goal statement, prerequisites, imperative checklist, exact commands with expected outcomes, and authoritative links. Link the terminology lock as the glossary and the authored page-template section. Inspect the actual Markdown preview; add no visual system, second tutorial or duplicated standards.

### CODING STANDARDS

- Use active voice, short sentences, second person and present tense; define PR as pull request on first use.
- Use one canonical term per concept; say registry item and description when stating the currency rule.
- Use real filesystem reads and argument-array subprocess calls in TypeScript tests; derive no expected criteria from the document under test.
- Use mkdtemp with os.tmpdir() for real copied-file mutations and remove only owned scratch in finally.
- Keep TypeScript and Markdown consistent with repository formatting; no dependencies or product seams.

### BOUNDARY CONTRACTS

- State build green, link check green, snippet gate green, and voice/terminology/page-template conformance as independent docs-PR criteria.
- Name pnpm --filter @rnr-ai-elements/docs build; pnpm --filter @rnr-ai-elements/docs check:snippets; pnpm --filter @rnr-ai-elements/docs check:links. Link the actual script-owning package.json and explain that link verification uses the current built dist.
- A PR changing an item's behavior updates that item's description in packages/registry/registry.json; reviewers assess whether the sentence remains accurate. Do not pretend prose accuracy is fully machine-gated.
- Use the canonical current path .spec/prds/docs-site/11-technical-requirements/12-content-standards.md and its terminology lock. Avoid a duplicate standards document or a second lesson.
- This task owns documentation only; CI owns implementing and enforcing the existing commands.

### CAPABILITIES AND PRD REFERENCES

Touches: CAP-DOCS-01.

- `.spec/prds/docs-site/11-technical-requirements/12-content-standards.md#content-gates-ci`
- `.spec/prds/docs-site/08-uc-ext.md#uc-ext-03-contribute-without-tribal-knowledge`
- `.spec/prds/docs-site/11-technical-requirements/09-capability-chains.md`

Provides:

- CONTRIBUTING.md states the complete fixed TR-12 docs-PR and registry-description review contract.
- The task-owned Vitest lane and content-review evidence prove commands, local targets and mutation sensitivity.

Consumes:

- ORI-CI-002: actual build, check:snippets and check:links scripts in apps/docs/package.json, including current-dist link verification.
- Canonical TR-12 content standards, terminology lock and page templates.
- Read-only packages/registry/registry.json descriptions.

### VERIFICATION GATES

1. Task integration lane: `pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts` — Exit 0 with all four named cases executed and non-empty seeded captures.
2. Docs build: `pnpm --filter @rnr-ai-elements/docs build` — Exit 0; current-candidate build artifacts captured.
3. Snippet gate: `pnpm --filter @rnr-ai-elements/docs check:snippets` — Exit 0; actual source-backed snippet compilation captured.
4. Link gate: `pnpm --filter @rnr-ai-elements/docs check:links` — Exit 0; current built dist checked.
5. Typecheck: `pnpm typecheck` — Exit 0.
6. Lint: `pnpm lint` — Exit 0.

Verification contract: Read the real CONTRIBUTING, package scripts, registry path and content-standard links from disk. Require all four docs-PR criteria and the behavior-to-description review rule; resolve every referenced local target. Mutating an actual command or removing the currency criterion in an isolated copy must fail. Review the rendered Markdown for a short goal-oriented checklist and exact terms. Execute the three documented commands as real subprocesses against the current built candidate; retain their command and exit evidence.

Human test hook: Use CONTRIBUTING to identify and execute the documented docs checks, then locate the review rule for a behavior-changing registry item.

### EVIDENCE GATES

1. Bind candidate source, lockfile, CONTRIBUTING bytes, test bytes, package scripts and built artifacts to one run. All evidence paths are future outputs.
2. Capture named assertions for all four criteria, exact commands, resolved targets and one actual registry item; retain rejected-copy diagnostics for command and currency mutations.
3. Retain all three real subprocess commands, working directory, exits and stdout/stderr; link verification must use the dist built in that run.
4. Record actual rendered Markdown review with quoted candidate text, canonical terminology checks and an independent reviewer decision; no static approval.
5. Require zero scenario findings, matching human/machine requirements, clean typecheck/lint, the exact task-lane pass and file-scope compliance before acceptance.

Planned evidence: `tests/sprint-05-orient-search/evidence/ORI-CONT-006-content-review.md`. Artifact status: `planned_output_not_observed`. No product command has run during charter rendering.

### OUT OF SCOPE

- Implementing or enforcing build, snippet or link scripts and CI checks; ORI-CI-002 owns that work.
- Changing registry behavior or descriptions, canonical standards, glossary or page templates.
- The broader UC-EXT-03 source-of-truth, fan-out and release-process documentation.
- New pages, dependencies, UI, native/provider verification, deployment, sprint flow ownership or journey proof.

### CONTEXT

Read-only inspection found no CONTRIBUTING.md. apps/docs/package.json currently defines build but lacks check:snippets and check:links; ORI-CI-002 must provide those scripts before execution.

techwriting-planner owns the how-to scope; co-author ghactions-planner grounds command ownership. techwriting-implementer writes verified prose and content tests; techwriting-reviewer independently checks correctness, links and rendered readability.

### REVIEW

For techwriting-reviewer.

Must pass:

- All four docs-PR criteria remain independent and every command matches its actual script owner.
- Real command receipts prove build, snippets and current-dist links; mutation controls reject the broken copies.
- Every local target and fragment resolves; the currency rule requires an item description update and human accuracy review.
- All four scenarios have seeded evidence and all required gates pass on the reviewed candidate.
- Only allowed deliverables change; touched tests contain no mocks, stubs, skips, placeholders or deferred proof.

Should verify:

- The rendered page is a short contribution how-to for the named reader.
- Imperative steps state expected outcomes and use the canonical glossary.
- The section links standards instead of reproducing them or adding onboarding.

Verdict: APPROVED or NEEDS_FIXES. Give concrete file/line or evidence references for any requested fix.

### DEPENDENCIES AND PROVENANCE

Depends on: ORI-CI-002. Blocks: none declared. Parallel work: only disjoint work under the orchestrator's assignment.

Source proposal: `.tmp/kb-sprint-tasks-plan/sprint-05-orient-search/proposals/techwriting-planner-absorb-prerequisites.json`. Source task IDs: ORI-CONT-004, ORI-CI-003. Supersedes: none. Co-author: ghactions-planner.

### FIXED SPRINT CONTRACT

```json
{"gate":"A stranger opening /docs/introduction over the built site's local preview can read in one pass that the library provides universal AI chat and agent UI components for React Native, that it is distributed as a copy-paste registry, and that it is not an npm package.","entrypoint":"docs site local preview — built dist served by astro preview (http://localhost:4321) or the pnpm e2e:docs webServer; route /docs/introduction","demonstrates":"UC-DOCS-01, UC-DOCS-02, UC-SHELL-02, UC-SHELL-01 (TokenTable half), UC-SHELL-03 (prose-persistence half)","flow_count":13,"task_flow_count":9,"journey_flow_count":4,"task_count":36,"point_total":131}
```

Existing coverage step:

```json
[{"step_id":"ORI-CONT-TR12","kind":"existing_coverage_content_check","step":"Use CONTRIBUTING to prepare a docs change: find the exact build, snippet and link commands, the content-style criteria and the behavior-to-registry-description review rule.","exercises":["ORI-CONT-006"],"coverage":"Fixed TR-12 full; no new locked flow."}]
```

This task adds no locked flow or journey proof.

### CHARTER VALIDATION

The read-only scenario validator received `{fixtures, requirements}` on stdin and returned exit 0: 4 scenarios, zero findings. This is charter validation only.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"version":"1","task_id":"ORI-CONT-006","tdd_mode":"skipped","verification_policy":{"requires_tests":true,"requires_red_evidence":false,"requires_seeded_evidence":true},"fixtures":{"docs_candidate":{"description":"At execution, use the assigned isolated candidate after ORI-CI-002 supplies the real docs scripts. Read source files through the CLI and real filesystem; copy actual bytes into owned OS-derived scratch for mutations. Do not inject content or command outcomes.","seed_method":"cli","records":["apps/docs/package.json names @rnr-ai-elements/docs and must bind build, check:snippets and check:links after ORI-CI-002.","packages/registry/registry.json supplies real registry items and their description fields.",".spec/prds/docs-site/11-technical-requirements/12-content-standards.md supplies the four docs-PR criteria, Terminology lock and page templates.","CONTRIBUTING.md is the task-authored input; missing or empty content must fail. Build outputs must be produced by the current candidate."]}},"requirements":[{"id":"AC-1","name":"Four independent docs-PR criteria","type":"acceptance_criterion","primary":false,"description":"GIVEN the real candidate after ORI-CI-002 WHEN a contributor reads CONTRIBUTING.md THEN four independent criteria name build, link check, snippet gate and voice/terminology/page-template conformance.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/contributing-content.test.ts","test_function":"ORI-CONT-006-four-criteria","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-four-criteria","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-006-1","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["CONTRIBUTING.md is empty or omits any criterion.","The checker returns static success after a documented command is mutated."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Read CONTRIBUTING.md from disk and check the contribution checklist against TR-12 and apps/docs/package.json."]},"end_state":{"must_observe":["4 independent criteria: build green, link check green, snippet gate green, and voice/terminology/page-template conformance.","3 exact commands: pnpm --filter @rnr-ai-elements/docs build; pnpm --filter @rnr-ai-elements/docs check:snippets; pnpm --filter @rnr-ai-elements/docs check:links."],"must_not_observe":["Empty CONTRIBUTING.md or a checklist with no content-standards criterion."]}},{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Copy the actual candidate content into owned scratch. Remove each criterion separately and replace check:snippets with check:snippet in a separate copy. Run the same assertions on every real file copy."]},"end_state":{"must_observe":["5 mutated copies fail with diagnostics naming the removed criterion or check:snippet; the unchanged source passes."],"must_not_observe":["A static success result for a copy with no snippet criterion or the wrong command."]}}]}},{"id":"AC-2","name":"Run the documented commands against the candidate","type":"acceptance_criterion","primary":false,"description":"GIVEN ORI-CI-002 binds the three real scripts WHEN the test executes the documented commands as subprocesses THEN build, snippet and link checks succeed with command, exit and fresh artifact evidence.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/contributing-content.test.ts","test_function":"ORI-CONT-006-real-docs-checks","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-real-docs-checks","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-006-2","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["A subprocess is mocked or replaced by static success.","Link verification is disconnected from the current built dist."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Read and validate the three documented commands against apps/docs/package.json. Execute build, check:snippets and check:links sequentially as real pnpm subprocesses from the candidate root.","Capture each command, working directory, exit status and stdout/stderr; bind the candidate source and built artifact hashes. Confirm check:links reads the dist produced by this build."]},"end_state":{"must_observe":["3 real subprocess receipts contain the exact documented commands and exit status 0.","The build produces `apps/docs/dist/docs/introduction/index.html`; the link-check receipt identifies this candidate's built dist and the snippet receipt records actual compiled source inputs."],"must_not_observe":["Empty command output substituted for execution, skipped subprocesses or a stale dist receipt."]}}]}},{"id":"AC-3","name":"Require registry-description currency review","type":"acceptance_criterion","primary":false,"description":"GIVEN a PR changes a registry item's behavior WHEN a contributor reads the review rule THEN they must update that item's description in packages/registry/registry.json and request a reviewer accuracy check.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/contributing-content.test.ts","test_function":"ORI-CONT-006-description-currency","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-description-currency","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-006-3","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["The description-currency rule is removed or the assertion is a no-op."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Read the actual contribution rule and resolve its registry link from CONTRIBUTING.md. Parse packages/registry/registry.json and record one actual item's name and description.","Require the behavior-change trigger, description update and reviewer accuracy judgment; reject any claim that prose accuracy is fully machine-gated."]},"end_state":{"must_observe":["The rule names `packages/registry/registry.json` and `description`, connects behavior changes to updates, and assigns sentence accuracy to reviewers.","1 real registry item's name and description are captured alongside the quoted contribution rule."],"must_not_observe":["No behavior-to-description rule or a claim that CI fully proves prose accuracy."]}},{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Copy the actual CONTRIBUTING.md into owned scratch, remove the description-currency rule, and run the same real-file assertion against the copy."]},"end_state":{"must_observe":["1 copy without the currency rule fails with a description-currency diagnostic; the original file remains byte-identical."],"must_not_observe":["Static success for the copy with no currency rule."]}}]}},{"id":"AC-4","name":"Link canonical standards and review the rendered checklist","type":"acceptance_criterion","primary":false,"description":"GIVEN the canonical TR-12 standards and terminology lock WHEN the contributor follows local links and the reviewer reads rendered Markdown THEN all targets resolve and the checklist uses concise imperative prose and exact canonical terms.","flow_ref":null,"test_file":"tests/sprint-05-orient-search/contributing-content.test.ts","test_function":"ORI-CONT-006-standards-and-links","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-standards-and-links","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","surface_policy":null,"tdd_state":"none","maps_to_ac":null,"scenario":{"id":"SC-ORI-CONT-006-4","primary":false,"tier":"visible","test_tier":"integration","verification_service":"Real repository filesystem, pnpm subprocesses, Astro build, snippet compiler and built-dist link checker","negative_control":{"would_fail_if":["Canonical links are absent or disconnected from their real files.","Rendered review is replaced by a static approval with no quoted candidate text."]},"evidence":{"artifact_type":"stdout","required_capture":true},"cases":[{"start_ref":"docs_candidate","action":{"actor":"cli_user","steps":["Resolve every local CONTRIBUTING.md link and fragment from disk, including apps/docs/package.json, packages/registry/registry.json and the canonical content standards.","Resolve the glossary link to #terminology-lock-one-canonical-term-per-concept and the page-template link to #page-templates-authored.","Review the actual Markdown in a Markdown preview; record quoted checklist excerpts and the reviewer decision in the owned content-review evidence. Check active voice, short sentences, defined acronyms and imperative steps."]},"end_state":{"must_observe":["Links resolve to apps/docs/package.json, packages/registry/registry.json and .spec/prds/docs-site/11-technical-requirements/12-content-standards.md.","The 2 fragment targets are Terminology lock (one canonical term per concept) and Page templates (authored).","The review records quoted CONTRIBUTING.md checklist text using registry item and a concrete expected result for each of the 3 commands."],"must_not_observe":["Empty review evidence, dangling local targets or a duplicate glossary or onboarding lesson."]}}]}},{"id":"TC-1","type":"test_criterion","description":"CONTRIBUTING.md states all four independent criteria and all three exact commands; criterion removals and command mutation fail.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-four-criteria","maps_to_ac":"AC-1"},{"id":"TC-2","type":"test_criterion","description":"All three documented commands execute successfully as real subprocesses, and their receipts bind the current candidate and built dist.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-real-docs-checks","maps_to_ac":"AC-2"},{"id":"TC-3","type":"test_criterion","description":"The behavior-to-description rule names the registry path and reviewer judgment; removing the rule fails.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-description-currency","maps_to_ac":"AC-3"},{"id":"TC-4","type":"test_criterion","description":"Every local target and fragment resolves; rendered review records concise imperative prose, canonical terms and command outcomes.","verify":"pnpm exec vitest run tests/sprint-05-orient-search/contributing-content.test.ts -t ORI-CONT-006-standards-and-links","maps_to_ac":"AC-4"}]}
-->
</details>
