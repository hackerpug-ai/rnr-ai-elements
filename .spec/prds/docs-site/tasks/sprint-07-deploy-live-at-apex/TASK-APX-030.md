================================================================================
TASK: APX-030 - Let the edge config files be committed so every fresh-checkout build ships them
================================================================================

TASK_TYPE:  CONFIG
STATUS:     Completed

Commit: 4fe580d5bc9b90b3a0e49b06d5847337ee4c5fda
PRIORITY:   P0
POINTS:     1
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: skipped
RED_GREEN_REQUIRED: no
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
- **Problem:** Line 4 of `apps/docs/.gitignore` ignores the whole `public/` directory. Only `public/r/` is generated. A new `apps/docs/public/_headers` or `_redirects` is therefore silently left out of every commit unless someone force-adds it.
- **Why it matters:** The deploy ships a dist built from a fresh CI checkout. An ignored `_headers` never reaches that checkout, so the site deploys with no cache tiers and no CSP, and nothing reports it.
- **Current:** Measured 2026-09-29 at HEAD 40fb4a62: `git check-ignore -v apps/docs/public/_headers` prints `apps/docs/.gitignore:4:public/`. The 5 self-hosted fonts are tracked only because they were force-added (ORI-VIS-001, 1c732dc1).
- **Desired:** Only the generated `public/r/` copy is ignored. Authored files under apps/docs/public, including APX-001's `_headers` and Sprint 08's `_redirects`, commit normally, and Astro copies them into dist byte-for-byte.

## Critical Constraints
MUST:
- MUST change exactly one line of apps/docs/.gitignore, `public/` to `public/r/`, and leave every other line byte-identical
NEVER:
- NEVER edit tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts. Sprint 05's in-flight FIX-ORI-SUITE-2-2 owns narrowing its tracked-files assertion to apps/docs/public/r, and this change keeps that narrowed assertion true
- NEVER create apps/docs/public/_headers or _redirects here (APX-001 authors _headers; Sprint 08 authors _redirects), and never `git add -f` anything under apps/docs/public
- NEVER stub or mock git: every assertion runs the real git binary against the real repository index from the repo root
STRICTLY:
- STRICTLY use `git check-ignore --no-index` for pattern checks, so the result does not depend on whether a later task has already tracked the file

## Specification
Objective: Narrow the docs app's ignore rule so authored edge config files under apps/docs/public can be committed normally, while the generated public/r copy stays ignored.

Success state: `git check-ignore --no-index` exits 1 for apps/docs/public/_headers and _redirects, and exits 0 naming pattern `public/r/` for every apps/docs/public/r path; `git ls-files apps/docs/public/r` is empty; the 5 authored fonts stay tracked; the other ignore rules still match.

PRD refs: 07-uc-deliv.md UC-DELIV-01 AC-4, 07-uc-deliv.md UC-DELIV-02 AC-3, 12-e2e-testing-criteria.md T-DELIV-004
Capabilities: CAP-DEP-01
Provides:
- apps/docs/public/_headers and apps/docs/public/_redirects are committable without `git add -f`; apps/docs/public/r stays generated-only and ignored
Consumes:
- nothing
Boundary contracts:
- CAP-DEP-01: the edge reads only edge-config files the commit carries, because Astro copies apps/docs/public into dist verbatim (measured on Astro 7.3.2: dist/_headers byte-equal to public/_headers)

### Fixtures
```json
{"narrowed_ignore_checkout": {"description": "the repository checkout at the APX-030 commit, where apps/docs/.gitignore carries `public/r/` in place of `public/`", "seed_method": "cli", "records": ["apps/docs/.gitignore contains the line `public/r/` and no line `public/`", "`git ls-files apps/docs/public/fonts` lists 5 authored files: OFL.txt, spline-sans-mono-var-latin-ext.woff2, spline-sans-mono-var-latin.woff2, spline-sans-var-latin-ext.woff2, spline-sans-var-latin.woff2", "apps/docs/.gitignore still lists `src/data/registry-items.json`, `src/data/gallery-manifest.json`, `src/data/site-facts.json` and `.astro/`"]}}
```

## Acceptance Criteria
### AC-1: Edge config sources are not ignored
  GIVEN: the narrowed ignore rule is committed
  WHEN:  `git check-ignore --no-index -v` runs from the repo root on apps/docs/public/_headers and apps/docs/public/_redirects
  THEN:  both exit 1 with no matching rule printed
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts
  TEST_FUNCTION: APX-030-AC1
  VERIFY: pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC1"
  TEST_TIER: integration
  VERIFICATION_SERVICE: real git binary and repository index
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["the ignore rule is left as the static `public/` pattern (HEAD 40fb4a62 prints `apps/docs/.gitignore:4:public/` for apps/docs/public/_headers, measured 2026-09-29)", "git is replaced by a mock that returns a canned exit code"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/_headers` from the repo root"]}, "end_state": {"must_observe": ["exit status `1`"], "must_not_observe": ["`apps/docs/.gitignore:4:public/` on stdout", "exit status `0`"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/_redirects` from the repo root"]}, "end_state": {"must_observe": ["exit status `1`"], "must_not_observe": ["`apps/docs/.gitignore:4:public/` on stdout", "exit status `0`"]}}]}
```

### AC-2: Generated registry copy stays ignored
  GIVEN: the narrowed ignore rule is committed
  WHEN:  `git check-ignore --no-index -v` runs on apps/docs/public/r/nativewind/conversation.json and apps/docs/public/r/uniwind/registry.json
  THEN:  each exits 0 and names apps/docs/.gitignore with pattern `public/r/`
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts
  TEST_FUNCTION: APX-030-AC2
  VERIFY: pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC2"
  TEST_TIER: integration
  VERIFICATION_SERVICE: real git binary and repository index
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["the ignore rule is deleted or emptied instead of narrowed, so the generated copy becomes committable", "git is replaced by a stub that echoes the path"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/r/nativewind/conversation.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `apps/docs/.gitignore:` and `public/r/` and `apps/docs/public/r/nativewind/conversation.json`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `apps/docs/public/r/nativewind/conversation.json`)"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/r/uniwind/registry.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `public/r/` and `apps/docs/public/r/uniwind/registry.json`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `apps/docs/public/r/uniwind/registry.json`)"]}}]}
```

### AC-3: Tracked public content is authored-only
  GIVEN: the narrowed ignore rule is committed
  WHEN:  `git ls-files` lists apps/docs/public/r and apps/docs/public/fonts
  THEN:  public/r lists 0 paths and fonts lists exactly the 5 authored files
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts
  TEST_FUNCTION: APX-030-AC3
  VERIFY: pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC3"
  TEST_TIER: integration
  VERIFICATION_SERVICE: real git binary and repository index
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["a generated public/r file was force-added to the index", "the fonts were untracked by an over-broad edit, leaving a static site without its self-hosted fonts"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git ls-files apps/docs/public/fonts`"]}, "end_state": {"must_observe": ["exactly `5` paths, including `apps/docs/public/fonts/OFL.txt` and `apps/docs/public/fonts/spline-sans-var-latin.woff2`"], "must_not_observe": ["`0` paths"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git ls-files apps/docs/public/r`"]}, "end_state": {"must_observe": ["exactly `0` paths printed for apps/docs/public/r while the fonts listing is non-empty"], "must_not_observe": ["any path starting `apps/docs/public/r/`", "no ignore rule covering apps/docs/public/r, so generated JSON appears in the tracked listing"]}}]}
```

### AC-4: Other generated outputs stay ignored
  GIVEN: the narrowed ignore rule is committed
  WHEN:  `git check-ignore --no-index` runs on apps/docs/src/data/registry-items.json, apps/docs/src/data/site-facts.json and apps/docs/.astro/data-store.json
  THEN:  each exits 0, proving the rest of the file was not rewritten
  TDD_STATE: N/A
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts
  TEST_FUNCTION: APX-030-AC4
  VERIFY: pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC4"
  TEST_TIER: integration
  VERIFICATION_SERVICE: real git binary and repository index
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["the edit deletes or rewrites other lines of apps/docs/.gitignore, leaving the generated data files unignored", "git is stubbed"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/src/data/registry-items.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `src/data/registry-items.json`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `src/data/registry-items.json`)"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/.astro/data-store.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `.astro/`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `.astro/`)"]}}]}
```

## Test Criteria
| TC | Statement | Maps to | Type | Verify |
|----|-----------|---------|------|--------|
| TC-1 | `git check-ignore --no-index apps/docs/public/_headers` exits 1 when run from the repo root | AC-1 | happy_path | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC1"` |
| TC-2 | `git check-ignore --no-index apps/docs/public/_redirects` exits 1 when run from the repo root | AC-1 | happy_path | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC1"` |
| TC-3 | `git check-ignore --no-index -v apps/docs/public/r/nativewind/conversation.json` prints a match whose pattern is `public/r/` | AC-2 | edge_case | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC2"` |
| TC-4 | `git ls-files apps/docs/public/r` prints zero paths when run from the repo root | AC-3 | edge_case | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC3"` |
| TC-5 | `git ls-files apps/docs/public/fonts` prints exactly 5 paths when run from the repo root | AC-3 | edge_case | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC3"` |
| TC-6 | `git check-ignore --no-index apps/docs/src/data/registry-items.json` exits 0 when run from the repo root | AC-4 | error_handling | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC4"` |
| TC-7 | `git check-ignore --no-index apps/docs/.astro/data-store.json` exits 0 when run from the repo root | AC-4 | error_handling | `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t "APX-030-AC4"` |

## Reading List
- `apps/docs/.gitignore` (lines 1-9) — line 4 `public/` is the rule to narrow; every other line stays
- `tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts` (lines 304-325) — house pattern for real `git check-ignore` / `--no-index` / `git ls-files` assertions (read only, never edit)
- `.spec/prds/docs-site/07-uc-deliv.md` (lines 19-27) — UC-DELIV-01 AC-4: apps/docs/public/r stays generated-only and gitignored
- `~/Projects/brain/docs/SCRATCH-ARTIFACTS-STANDARD.md` (lines all) — no scratch writes into the repo

Coding standards:
- brain/docs/TESTING-HIERARCHY.md
- brain/docs/ANTI-STUB-REVIEW.md
- brain/docs/FUNCTIONAL-FLOW-COVERAGE.md
- brain/docs/SCRATCH-ARTIFACTS-STANDARD.md

## Guardrails
WRITE-ALLOWED:
- apps/docs/.gitignore (MODIFY)
- tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts (NEW)
WRITE-PROHIBITED:
- apps/docs/public/_headers - authored by APX-001
- apps/docs/public/_redirects - authored by Sprint 08
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts - owned by Sprint 05 FIX-ORI-SUITE-2-2 (in flight)
- scripts/docs-data/prebuild.ts - owns the public/r copy, unchanged
- Any file not explicitly listed in write_allowed
SUPERSEDES: none

## Design
References:
- SPRINT.md step 4 (the Preflight dist `(tracked)` line proves a fresh CI checkout carried _headers)
- 07-uc-deliv.md UC-DELIV-01 AC-4
- 12-e2e-testing-criteria.md T-DELIV-004
Interaction notes:
- Measured 2026-09-29 on HEAD 40fb4a62: `git check-ignore -v apps/docs/public/_headers` prints `apps/docs/.gitignore:4:public/`. The fonts are tracked only because they were force-added (ORI-VIS-001, 1c732dc1). In a scratch worktree, narrowing to `public/r/` made _headers visible to git while public/r stayed ignored.
Pattern (source: tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts:304-320):
```ts
const r = spawnSync('git', ['check-ignore', '--no-index', '-v', path], { cwd: repoRoot, encoding: 'utf8' }); expect(r.status).toBe(1);
```
Anti-pattern: Force-adding apps/docs/public/_headers with `git add -f` (it works once, then Sprint 08's _redirects hits the same silent ignore); asserting `git ls-files apps/docs/public` is empty (red today because of the fonts, and false once _headers is tracked)

## Verification Gates
- **tests**: `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts` — expected: Exit 0; 4 tests pass (APX-030-AC1..AC4)
- **typecheck**: `pnpm typecheck` — expected: Exit 0
- **lint**: `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts` — expected: Exit 0
- **complexity**: `pnpm check:fallow` — expected: Exit 0
- **scope**: `git diff --name-only HEAD~1` — expected: Only apps/docs/.gitignore and tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts

## Agent Instructions
TDD_MODE is skipped (CONFIG task), but the test still comes first and runs against real git:
1. Create `tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts`. Give it one vitest `it` per AC, each title starting with its token (`APX-030-AC1` .. `APX-030-AC4`). Each test runs `spawnSync('git', [...], { cwd: repoRoot, encoding: 'utf8' })` and asserts the exit status and stdout named in its scenario.
2. Run `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts` against the unchanged `.gitignore` and keep the output. APX-030-AC1 fails because `apps/docs/.gitignore:4:public/` matches `_headers`. That is the observed start state, not a required RED gate.
3. Change line 4 of `apps/docs/.gitignore` from `public/` to `public/r/`. Touch no other line.
4. Re-run the file. All 4 tests pass. Then run the typecheck, lint, complexity and scope gates.
5. Record in the handoff: both vitest outputs, and the exact `git diff -- apps/docs/.gitignore`.

## Orchestrator Verification Protocol
1. `git diff --name-only <base>...<task-commit>` lists exactly `apps/docs/.gitignore` and `tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts`.
2. `git diff <base>...<task-commit> -- apps/docs/.gitignore` shows exactly one removed line `public/` and one added line `public/r/`.
3. Re-run `pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts`: exit 0, and 4 tests pass.
4. Independently run `git check-ignore --no-index -v apps/docs/public/_headers` (expect exit 1) and `git check-ignore --no-index -v apps/docs/public/r/nativewind/conversation.json` (expect exit 0, with stdout naming `public/r/`).
5. Run `pnpm typecheck`, `./node_modules/.bin/biome ci tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts` and `pnpm check:fallow`: each exits 0.

## Evidence Gates
- The vitest stdout before the change (APX-030-AC1 failing on `apps/docs/.gitignore:4:public/`) and after it (4 passed), recorded in the handoff.
- The one-line `git diff -- apps/docs/.gitignore`.
- The two independent `git check-ignore --no-index -v` outputs, with their exit codes.

## Review Criteria
REVIEWER CHECKS:
- The diff to apps/docs/.gitignore is exactly one line, `public/` to `public/r/`. Every other line is byte-identical.
- No path under apps/docs/public was added with `git add -f`, and no `_headers` or `_redirects` was created by this task.
- tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts is untouched.
- Every assertion runs the real git binary with `--no-index` for pattern checks. No git mock, and no canned exit code.
- `git ls-files apps/docs/public/fonts` still lists the 5 authored fonts.

## Dependencies
Depends on: []
Blocks:     ["APX-001", "APX-031", "APX-032"]

## Notes
- Precondition, not a dependency: Sprint 05's FIX-ORI-SUITE-2-2 (in flight) narrows the sprint-01 `copies public r generated-only and byte-identical` assertion from `git ls-files apps/docs/public` to `apps/docs/public/r`. That assertion is red at HEAD because of the 5 tracked fonts, not because of this task, and this change keeps the narrowed assertion true.
- APX-001 authors apps/docs/public/_headers after this lands. Sprint 08 authors apps/docs/public/_redirects. Both commit without `-f` once this lands.
- This vitest file needs no docs build, so it is safe in the CI `test` job.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails": {"write_allowed": ["apps/docs/.gitignore (MODIFY)", "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts (NEW)", ".tmp/APX-030/** (NEW - cycle evidence required by the sprint runner)"], "write_prohibited": ["apps/docs/public/_headers - authored by APX-001", "apps/docs/public/_redirects - authored by Sprint 08", "tests/sprint-01-docs-spike-skeleton/docs-data-prebuild.test.ts - owned by Sprint 05 FIX-ORI-SUITE-2-2 (in flight)", "scripts/docs-data/prebuild.ts - owns the public/r copy, unchanged", "Any file not explicitly listed in write_allowed"]},"version": "1", "task_id": "APX-030", "tdd_mode": "skipped", "verification_policy": {"requires_tests": true, "requires_red_evidence": false, "requires_seeded_evidence": true}, "fixtures": {"narrowed_ignore_checkout": {"description": "the repository checkout at the APX-030 commit, where apps/docs/.gitignore carries `public/r/` in place of `public/`", "seed_method": "cli", "records": ["apps/docs/.gitignore contains the line `public/r/` and no line `public/`", "`git ls-files apps/docs/public/fonts` lists 5 authored files: OFL.txt, spline-sans-mono-var-latin-ext.woff2, spline-sans-mono-var-latin.woff2, spline-sans-var-latin-ext.woff2, spline-sans-var-latin.woff2", "apps/docs/.gitignore still lists `src/data/registry-items.json`, `src/data/gallery-manifest.json`, `src/data/site-facts.json` and `.astro/`"]}}, "requirements": [{"id": "AC-1", "type": "acceptance_criterion", "description": "GIVEN the narrowed ignore rule is committed WHEN `git check-ignore --no-index -v` runs from the repo root on apps/docs/public/_headers and apps/docs/public/_redirects THEN both exit 1 with no matching rule printed", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC1", "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC1\"", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["the ignore rule is left as the static `public/` pattern (HEAD 40fb4a62 prints `apps/docs/.gitignore:4:public/` for apps/docs/public/_headers, measured 2026-09-29)", "git is replaced by a mock that returns a canned exit code"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/_headers` from the repo root"]}, "end_state": {"must_observe": ["exit status `1`"], "must_not_observe": ["`apps/docs/.gitignore:4:public/` on stdout", "exit status `0`"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/_redirects` from the repo root"]}, "end_state": {"must_observe": ["exit status `1`"], "must_not_observe": ["`apps/docs/.gitignore:4:public/` on stdout", "exit status `0`"]}}]}}, {"id": "AC-2", "type": "acceptance_criterion", "description": "GIVEN the narrowed ignore rule is committed WHEN `git check-ignore --no-index -v` runs on apps/docs/public/r/nativewind/conversation.json and apps/docs/public/r/uniwind/registry.json THEN each exits 0 and names apps/docs/.gitignore with pattern `public/r/`", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC2", "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC2\"", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["the ignore rule is deleted or emptied instead of narrowed, so the generated copy becomes committable", "git is replaced by a stub that echoes the path"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/r/nativewind/conversation.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `apps/docs/.gitignore:` and `public/r/` and `apps/docs/public/r/nativewind/conversation.json`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `apps/docs/public/r/nativewind/conversation.json`)"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/public/r/uniwind/registry.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `public/r/` and `apps/docs/public/r/uniwind/registry.json`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `apps/docs/public/r/uniwind/registry.json`)"]}}]}}, {"id": "AC-3", "type": "acceptance_criterion", "description": "GIVEN the narrowed ignore rule is committed WHEN `git ls-files` lists apps/docs/public/r and apps/docs/public/fonts THEN public/r lists 0 paths and fonts lists exactly the 5 authored files", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC3", "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC3\"", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["a generated public/r file was force-added to the index", "the fonts were untracked by an over-broad edit, leaving a static site without its self-hosted fonts"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git ls-files apps/docs/public/fonts`"]}, "end_state": {"must_observe": ["exactly `5` paths, including `apps/docs/public/fonts/OFL.txt` and `apps/docs/public/fonts/spline-sans-var-latin.woff2`"], "must_not_observe": ["`0` paths"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git ls-files apps/docs/public/r`"]}, "end_state": {"must_observe": ["exactly `0` paths printed for apps/docs/public/r while the fonts listing is non-empty"], "must_not_observe": ["any path starting `apps/docs/public/r/`", "no ignore rule covering apps/docs/public/r, so generated JSON appears in the tracked listing"]}}]}}, {"id": "AC-4", "type": "acceptance_criterion", "description": "GIVEN the narrowed ignore rule is committed WHEN `git check-ignore --no-index` runs on apps/docs/src/data/registry-items.json, apps/docs/src/data/site-facts.json and apps/docs/.astro/data-store.json THEN each exits 0, proving the rest of the file was not rewritten", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC4", "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC4\"", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary and repository index", "topology": "single-node", "negative_control": {"would_fail_if": ["the edit deletes or rewrites other lines of apps/docs/.gitignore, leaving the generated data files unignored", "git is stubbed"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/src/data/registry-items.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `src/data/registry-items.json`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `src/data/registry-items.json`)"]}}, {"start_ref": "narrowed_ignore_checkout", "action": {"actor": "cli_user", "steps": ["run `git check-ignore --no-index -v apps/docs/.astro/data-store.json`"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `.astro/`"], "must_not_observe": ["exit status `1`", "empty stdout (no ignore rule matches `.astro/`)"]}}]}}, {"id": "TC-1", "type": "test_criterion", "primary": false, "description": "`git check-ignore --no-index apps/docs/public/_headers` exits 1 when run from the repo root", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC1", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC1\"", "maps_to_ac": "AC-1"}, {"id": "TC-2", "type": "test_criterion", "primary": false, "description": "`git check-ignore --no-index apps/docs/public/_redirects` exits 1 when run from the repo root", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC1", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC1\"", "maps_to_ac": "AC-1"}, {"id": "TC-3", "type": "test_criterion", "primary": false, "description": "`git check-ignore --no-index -v apps/docs/public/r/nativewind/conversation.json` prints a match whose pattern is `public/r/`", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC2", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC2\"", "maps_to_ac": "AC-2"}, {"id": "TC-4", "type": "test_criterion", "primary": false, "description": "`git ls-files apps/docs/public/r` prints zero paths when run from the repo root", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC3", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC3\"", "maps_to_ac": "AC-3"}, {"id": "TC-5", "type": "test_criterion", "primary": false, "description": "`git ls-files apps/docs/public/fonts` prints exactly 5 paths when run from the repo root", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC3", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC3\"", "maps_to_ac": "AC-3"}, {"id": "TC-6", "type": "test_criterion", "primary": false, "description": "`git check-ignore --no-index apps/docs/src/data/registry-items.json` exits 0 when run from the repo root", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC4", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC4\"", "maps_to_ac": "AC-4"}, {"id": "TC-7", "type": "test_criterion", "primary": false, "description": "`git check-ignore --no-index apps/docs/.astro/data-store.json` exits 0 when run from the repo root", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts", "test_function": "APX-030-AC4", "test_tier": "integration", "verification_service": "real git binary and repository index", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm exec vitest run tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts -t \"APX-030-AC4\"", "maps_to_ac": "AC-4"}]}
-->

## Handoff

```json
{
  "task": "APX-030",
  "commit_sha": "4fe580d5bc9b90b3a0e49b06d5847337ee4c5fda",
  "done": "Landed the one-line apps/docs/.gitignore narrow from public/ to public/r/ plus tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts with APX-030-AC1..AC4 real-git assertions; approved replay is 4fe580d5 and merged to main as 60f18a6e.",
  "deviations": [],
  "concerns": [
    "APX-030-AC2 at tests/sprint-07-deploy-live-at-apex/edge-files-tracked.test.ts:47 uses toContain('public/r/') on the full check-ignore -v line, so a revert to pattern public/ still matches via the path apps/docs/public/r/... while AC-1 catches that revert."
  ],
  "findings": [
    "Fresh worktree typecheck fails until registry:build, gallery:manifest, and docs prebuild materialize the gitignored apps/docs/src/data/registry-items.json that code-primitives-contract.test.ts imports.",
    "Independent check-ignore --no-index after the narrow exits 1 for apps/docs/public/_headers and exits 0 naming apps/docs/.gitignore:4:public/r/ for apps/docs/public/r/nativewind/conversation.json."
  ],
  "scope_impact": [],
  "feedback": [
    "Task file Agent Instructions step 2 correctly treats the AC1 red on apps/docs/.gitignore:4:public/ as observed start state rather than a required RED gate for this CONFIG task."
  ]
}
```
