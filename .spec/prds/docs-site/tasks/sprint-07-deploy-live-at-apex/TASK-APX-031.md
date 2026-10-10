================================================================================
TASK: APX-031 - Refuse an upload unless dist carries all 112 registry items, both registry indexes, and the committed _headers byte-for-byte
================================================================================

TASK_TYPE:  FEATURE
STATUS:     Completed

Commit: c150198b07c8b32f374e7b3954670b66636319e4
PRIORITY:   P0
POINTS:     3
AGENT:      planner=astro-planner | implementer=astro-implementer | reviewer=astro-reviewer

PROPOSED BY: astro-planner
TDD_MODE: red_first
RED_GREEN_REQUIRED: yes
Sprint: [SPRINT.md](./SPRINT.md)

---
## Background
- **Problem:** Nothing checks the directory that wrangler uploads. The prebuild's 114-file count checks apps/docs/public/r before Astro copies it, and the sprint-01 count is a test lane, not a deploy step.
- **Why it matters:** A missing or stale registry item breaks every install command that names it. A dist without `_headers` ships no CSP and no cache tiers. `wrangler rollback` is only sound if every deploy carries the full /r/ set (CAP-DEP-01).
- **Current:** No dist-side preflight exists. The gated deploy job is added by APX-023 and downloads the `docs-dist` artifact that docs-e2e built and tested (APX-022).
- **Desired:** The `Preflight dist` step refuses the upload unless dist/r is byte-equal to the committed public/r (56 items plus registry.json per engine) and dist/_headers is byte-equal to the tracked apps/docs/public/_headers. On success it prints the exact ok line that SPRINT step 4 reads.

## Critical Constraints
MUST:
- MUST print exactly `[docs-deploy] preflight ok: nativewind 56/56 items + registry.json, uniwind 56/56 items + registry.json (114 files byte-equal public/r at HEAD); _headers byte-equal apps/docs/public/_headers (tracked)` on success (SPRINT step 4 reads it literally)
NEVER:
- NEVER write under apps/docs/dist, apps/docs/public, public/r or the repository's real git index. Mutations happen only in os.tmpdir() copies and GIT_INDEX_FILE temp indexes, because docs-e2e uploads apps/docs/dist as `docs-dist` after this lane runs
- NEVER derive the expected item set from dist; it comes from packages/registry/registry.json names times ENGINES
- NEVER add the preflight to the apps/docs `build` script (tests/sprint-05-orient-search/docs-build-pipeline.test.ts pins the stage order) and never edit ci.yml (APX-023 wires the `Preflight dist` step)
STRICTLY:
- STRICTLY node:fs, node:crypto, node:path and node:child_process only, with `// fallow-ignore-file unused-file` because the script is spawned via tsx and never imported (the prepare.ts precedent)
- OUTPUT FORMAT: on failure, print a first line `[docs-deploy] preflight FAILED: nativewind <n>/56 items, uniwind <n>/56 items`, then one line per offender: `missing <path>`, `extra <path>`, `differs <path>`, `untracked <repo path>`, or `public/r differs from HEAD`. Dist paths are relative to --dist, for example `r/uniwind/tool.json` or `_headers`.

## Specification
Objective: Give the deploy job a read-only preflight that refuses to upload any dist whose registry tree or edge headers differ from the committed sources.

Success state: On the real built dist the script exits 0 with the literal ok line. For each seeded defect in a temp copy or temp index it exits 1 and names the per-engine tallies plus the exact offending path.

PRD refs: 07-uc-deliv.md UC-DELIV-03 AC-2, 12-e2e-testing-criteria.md T-DELIV-012, 11-technical-requirements/09-capability-chains.md CAP-DEP-01 failure modes, 07-uc-deliv.md UC-DELIV-02 AC-3
Capabilities: CAP-DEP-01, CAP-INST-01
Provides:
- `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts [--dist <dir>]`: exit 0 plus the literal ok line only when the dist about to be uploaded is the committed tree; otherwise exit 1 naming every offender
Consumes:
- apps/docs/dist (downloaded `docs-dist` artifact in the deploy job, or a local build)
- root public/r at HEAD
- packages/registry/registry.json item names
- ENGINES from packages/registry/scripts/build-registry.ts
- apps/docs/public/_headers committed by APX-001
Boundary contracts:
- CAP-DEP-01: the deploy job uploads nothing unless dist/r equals committed public/r and dist/_headers equals the tracked source
- CAP-INST-01: every /r/{engine}/{item}.json an install command can name exists in the upload, and no fabricated slug ships
- Build once: the preflight only reads; it never rebuilds or rewrites dist

### Fixtures
```json
{"built_dist_committed_headers": {"description": "apps/docs/dist from `pnpm --filter @rnr-ai-elements/docs build` at a commit where APX-030 and APX-001 have landed", "seed_method": "cli", "records": ["apps/docs/dist/r/nativewind and apps/docs/dist/r/uniwind each hold 57 JSON files (56 items + registry.json)", "apps/docs/dist/_headers byte-equal to the tracked apps/docs/public/_headers", "packages/registry/registry.json lists 56 item names including `conversation` and `tool`"]}, "temp_dist_copy": {"description": "a byte-identical copy of the real built dist under mkdtemp(join(os.tmpdir(), 'apx-031-')), mutated by the case's action; apps/docs/dist is never modified", "seed_method": "cli", "records": ["copy holds the same 114 dist/r JSON files and _headers as apps/docs/dist before mutation"]}, "temp_git_index": {"description": "a temporary index file seeded by `GIT_INDEX_FILE=<tmp>/index git read-tree HEAD` and edited by the case's action; the repository's real .git/index is untouched", "seed_method": "cli", "records": ["the temp index lists apps/docs/public/_headers and all 114 public/r paths before the case's edit"]}}
```

## Acceptance Criteria
### AC-1: Real dist passes with the literal ok line
  GIVEN: the real built dist and the committed, tracked _headers
  WHEN:  `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts` runs from the repo root with the default --dist
  THEN:  it exits 0, prints the literal ok line, and leaves apps/docs/dist bytes unchanged
  TDD_STATE: RED
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts
  TEST_FUNCTION: APX-031-AC1
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1
  TEST_TIER: integration
  VERIFICATION_SERVICE: real built apps/docs/dist, root public/r and git index, through the real tsx preflight process
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built apps/docs/dist, root public/r and git index, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the script is a stub that prints the ok line without reading dist (AC-2..AC-6 expose it)", "dist/r is empty because the build never copied public/r", "the script is missing, so tsx exits with a module-not-found error (the RED state)"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "built_dist_committed_headers", "action": {"actor": "cli_user", "steps": ["snapshot sha256 of every file under apps/docs/dist/r plus apps/docs/dist/_headers", "run `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts`", "re-hash the same files"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `[docs-deploy] preflight ok: nativewind 56/56 items + registry.json, uniwind 56/56 items + registry.json (114 files byte-equal public/r at HEAD); _headers byte-equal apps/docs/public/_headers (tracked)`", "`115` file hashes identical before and after"], "must_not_observe": ["`preflight FAILED`", "`0/56 items`"]}}]}
```

### AC-2: A missing registry item is refused by name
  GIVEN: a temp dist copy with r/uniwind/tool.json deleted
  WHEN:  the preflight runs with `--dist <copy>`
  THEN:  it exits 1 with the per-engine tallies and `missing r/uniwind/tool.json`
  TDD_STATE: RED
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts
  TEST_FUNCTION: APX-031-AC2
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC2
  TEST_TIER: integration
  VERIFICATION_SERVICE: real built dist copy on the local filesystem, through the real tsx preflight process
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the expected set is read from dist itself, so a missing file is never expected", "the script only counts files, so a static total hides which item is gone"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["delete `<copy>/r/uniwind/tool.json`", "run `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts --dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `uniwind 55/56 items`", "stdout contains `nativewind 56/56 items`", "stdout contains `missing r/uniwind/tool.json`"], "must_not_observe": ["`preflight ok`", "exit status `0`"]}}]}
```

### AC-3: A fabricated extra file is refused
  GIVEN: a temp dist copy with an added r/nativewind/not-an-item.json containing `{"name":"not-an-item"}`
  WHEN:  the preflight runs with `--dist <copy>`
  THEN:  it exits 1 naming `extra r/nativewind/not-an-item.json` while both tallies stay 56/56
  TDD_STATE: RED
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts
  TEST_FUNCTION: APX-031-AC3
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC3
  TEST_TIER: integration
  VERIFICATION_SERVICE: real built dist copy on the local filesystem, through the real tsx preflight process
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the script checks only that expected files exist, so a fabricated slug that would serve 200 in production passes as static extra content"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["write `<copy>/r/nativewind/not-an-item.json` with `{\"name\":\"not-an-item\"}`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `extra r/nativewind/not-an-item.json`", "stdout contains `nativewind 56/56 items`"], "must_not_observe": ["`preflight ok`", "no offender lines (an empty offender list although `r/nativewind/not-an-item.json` was added)"]}}]}
```

### AC-4: Byte drift or a missing registry index is refused
  GIVEN: temp dist copies with one byte appended to r/nativewind/conversation.json, or with r/uniwind/registry.json deleted
  WHEN:  the preflight runs on each copy
  THEN:  each exits 1 naming `differs r/nativewind/conversation.json` or `missing r/uniwind/registry.json`
  TDD_STATE: RED
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts
  TEST_FUNCTION: APX-031-AC4
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC4
  TEST_TIER: integration
  VERIFICATION_SERVICE: real built dist copy on the local filesystem, through the real tsx preflight process
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["files are compared by name or size only, so a stale item body ships", "registry.json is not part of the expected set, so the CLI's index can go missing", "the byte comparison is a stub that always reports equal, so a deleted or drifted file passes unchanged"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["append one `\\n` byte to `<copy>/r/nativewind/conversation.json`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `differs r/nativewind/conversation.json`"], "must_not_observe": ["`preflight ok`", "no `differs` line (an empty offender list after the one-byte change)"]}}, {"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["delete `<copy>/r/uniwind/registry.json`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `missing r/uniwind/registry.json`"], "must_not_observe": ["`preflight ok`", "no `missing` line for `r/uniwind/registry.json` (an empty offender list)"]}}]}
```

### AC-5: Missing or drifted _headers is refused
  GIVEN: temp dist copies with _headers deleted, or with the line `  X-Drift: 1` appended to it
  WHEN:  the preflight runs on each copy
  THEN:  each exits 1 naming `missing _headers` or `differs _headers`
  TDD_STATE: RED
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts
  TEST_FUNCTION: APX-031-AC5
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC5
  TEST_TIER: integration
  VERIFICATION_SERVICE: real built dist copy on the local filesystem, through the real tsx preflight process
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the script ignores _headers, so a deploy ships with no cache tiers or CSP (the static state the live site shows today, measured 2026-09-29)", "_headers is checked for existence only, not bytes"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["delete `<copy>/_headers`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `missing _headers`"], "must_not_observe": ["`preflight ok`", "no `missing _headers` line (an empty offender list with `_headers` deleted)"]}}, {"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["append `  X-Drift: 1` to `<copy>/_headers`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `differs _headers`"], "must_not_observe": ["`preflight ok`", "no `differs _headers` line (an empty offender list with `_headers` drifted)"]}}]}
```

### AC-6: Untracked source or a dirty public/r is refused
  GIVEN: the real dist, run with GIT_INDEX_FILE pointing at a temp index that lacks apps/docs/public/_headers, or at one whose public/r/nativewind/conversation.json entry points at a different blob
  WHEN:  the preflight runs with that GIT_INDEX_FILE in its environment
  THEN:  it exits 1 naming `untracked apps/docs/public/_headers` or `public/r differs from HEAD`
  TDD_STATE: RED
  FLOW_REF: null (task-local)
  TEST_FILE: tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts
  TEST_FUNCTION: APX-031-AC6
  VERIFY: pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC6
  TEST_TIER: integration
  VERIFICATION_SERVICE: real git binary with a temporary index file, real built dist, through the real tsx preflight process
  SURFACE_POLICY: null (task-local integration)
  SCENARIO:
```json
{"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary with a temporary index file, real built dist, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the tracked check is skipped, so an ignored local-only _headers passes locally while a fresh CI checkout ships none", "the public/r check is a stub that always passes"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_git_index", "action": {"actor": "cli_user", "steps": ["run `GIT_INDEX_FILE=<tmp>/index git rm --cached --quiet apps/docs/public/_headers`", "run the preflight on the real dist with `GIT_INDEX_FILE=<tmp>/index` in its env"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `untracked apps/docs/public/_headers`"], "must_not_observe": ["`preflight ok`", "no `untracked` line (an empty offender list while `apps/docs/public/_headers` is absent from the index)"]}}, {"start_ref": "temp_git_index", "action": {"actor": "cli_user", "steps": ["repoint the temp index entry with `git update-index --cacheinfo 100644,<blob of public/r/uniwind/conversation.json>,public/r/nativewind/conversation.json`", "run the preflight on the real dist with that GIT_INDEX_FILE"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `public/r differs from HEAD`"], "must_not_observe": ["`preflight ok`", "no `public/r differs from HEAD` line (an empty offender list with the index entry repointed)"]}}]}
```

## Test Criteria
| TC | Statement | Maps to | Type | Verify |
|----|-----------|---------|------|--------|
| TC-1 | The preflight exits 0 when run on the real built apps/docs/dist | AC-1 | happy_path | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1` |
| TC-2 | The preflight stdout contains the exact ok literal when run on the real built apps/docs/dist | AC-1 | happy_path | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1` |
| TC-3 | Every apps/docs/dist file hash is identical before and after the spec run | AC-1 | happy_path | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1` |
| TC-4 | The preflight prints `missing r/uniwind/tool.json` when that file is deleted from a temp dist copy | AC-2 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC2` |
| TC-5 | The preflight prints `uniwind 55/56 items` when r/uniwind/tool.json is deleted from a temp dist copy | AC-2 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC2` |
| TC-6 | The preflight prints `extra r/nativewind/not-an-item.json` when that file is added to a temp dist copy | AC-3 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC3` |
| TC-7 | The preflight prints `differs r/nativewind/conversation.json` when one byte is appended to that file in a temp dist copy | AC-4 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC4` |
| TC-8 | The preflight prints `missing r/uniwind/registry.json` when that index is deleted from a temp dist copy | AC-4 | edge_case | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC4` |
| TC-9 | The preflight prints `missing _headers` when _headers is deleted from a temp dist copy | AC-5 | error_handling | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC5` |
| TC-10 | The preflight prints `differs _headers` when a line is appended to _headers in a temp dist copy | AC-5 | error_handling | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC5` |
| TC-11 | The preflight prints `untracked apps/docs/public/_headers` when its GIT_INDEX_FILE lacks that path | AC-6 | error_handling | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC6` |
| TC-12 | The preflight prints `public/r differs from HEAD` when its GIT_INDEX_FILE maps public/r/nativewind/conversation.json to another blob | AC-6 | error_handling | `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC6` |

## Reading List
- `scripts/docs-deploy/prepare.ts` (lines 30-45, 85-100, 187-235, 348-356, 388-390) — CLI-script house pattern: fallow-ignore directive, REPO_ROOT, walkFiles, parseArgs, sha256 hashing, direct-run guard (read only, never edit)
- `scripts/docs-data/prebuild.ts` (lines 42, 60-70, 338-350) — ENGINES import, the ROOT_PUBLIC_R/DOCS_PUBLIC_R paths, and the 114-file count the public-side copy already asserts
- `packages/registry/scripts/build-registry.ts` (lines 25-26) — the ENGINES tuple to import
- `tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts` (lines 1-8, 183-191) — Playwright-spec-as-filesystem-lane precedent with the chromium-desktop test.skip
- `playwright.config.ts` (lines 1-45) — root collection (testMatch **/*.spec.ts, testIgnore *.remote.spec.ts, workers 1, three projects)

Coding standards:
- brain/docs/TESTING-HIERARCHY.md
- brain/docs/ANTI-STUB-REVIEW.md
- brain/docs/FUNCTIONAL-FLOW-COVERAGE.md
- brain/docs/SCRATCH-ARTIFACTS-STANDARD.md
- brain/docs/kanban/SCENARIO-CONTRACT-V1.md

## Guardrails
WRITE-ALLOWED:
- scripts/docs-deploy/preflight-dist.ts (NEW)
- tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts (NEW)
WRITE-PROHIBITED:
- scripts/docs-deploy/prepare.ts - ORI-DEP-001 lineage, read only
- apps/docs/package.json - build stage order pinned by the sprint-05 pipeline test
- package.json - no new root script
- .github/workflows/ci.yml - APX-023 wires the Preflight dist step
- apps/docs/public/_headers - authored by APX-001
- apps/docs/dist/** - uploaded by docs-e2e after the lane
- Any file not explicitly listed in write_allowed
SUPERSEDES: none

## Design
References:
- SPRINT.md steps 2 and 4
- 12-e2e-testing-criteria.md T-DELIV-012
- 09-capability-chains.md CAP-DEP-01 (rollback stranding new JSONs)
Interaction notes:
- Failure output format: first line `[docs-deploy] preflight FAILED: nativewind <n>/56 items, uniwind <n>/56 items`, then one line per offender: `missing <path>`, `extra <path>`, `differs <path>`, `untracked <repo path>`, `public/r differs from HEAD`. Dist paths are relative to --dist.
- In the deploy job it runs on the downloaded docs-dist artifact against the HEAD checkout (shallow clone is fine for ls-files and diff; tsx comes from `pnpm install`).
- _redirects follows the same byte-and-tracked rule only when apps/docs/public/_redirects is tracked (Sprint 08).
Pattern (source: scripts/docs-data/prebuild.ts:42, 338-350):
```ts
for (const engine of ENGINES) { for (const name of names) { const rel = `r/${engine}/${name}.json`; /* exists? bytes equal public/r? */ } }
```
Anti-pattern: Listing dist/r to build the expected set; counting files instead of comparing bytes; mutating apps/docs/dist in the spec; faking the tracked state by editing .git/index instead of using a GIT_INDEX_FILE temp index

## Verification Gates
- **tests**: `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop` — expected: Exit 0; APX-031-AC1..AC6 pass on chromium-desktop
- **typecheck**: `pnpm typecheck` — expected: Exit 0
- **lint**: `./node_modules/.bin/biome ci scripts/docs-deploy/preflight-dist.ts tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts` — expected: Exit 0
- **complexity**: `pnpm check:fallow` — expected: Exit 0

## Agent Instructions
TDD_MODE is red_first. Work one AC at a time, in order AC-1 .. AC-6:
- RED: add the AC's test to `tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts`. The title starts with its token (`APX-031-AC1` ..), and the test calls `test.skip(test.info().project.name !== 'chromium-desktop', ...)`. Run the AC's VERIFY and keep the failing output. For AC-1, before the script exists, tsx fails with module-not-found. For AC-2 .. AC-6, the expected offender line is absent.
- GREEN: implement the smallest change in `scripts/docs-deploy/preflight-dist.ts` that makes that AC pass, then re-run its VERIFY.
- REFACTOR: keep node builtins only, and keep the `// fallow-ignore-file unused-file` directive and the direct-run guard from prepare.ts.
Harness rules: spawn the real script with `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts [--dist <dir>]` from the repo root. Make temp dist copies with `mkdtemp(join(tmpdir(), 'apx-031-'))` plus `cpSync(..., { recursive: true })`, and remove them in `finally`. Seed each AC-6 temp index from HEAD inside the spec's own child processes, with `GIT_INDEX_FILE=<tmp>/index` set only in those children's env. Never type those index commands into an agent shell. Hash apps/docs/dist before and after the file runs (TC-3).
Record every RED and GREEN run output in the handoff.

## Orchestrator Verification Protocol
1. For each AC, confirm the handoff records a RED run whose failure names the missing behaviour, and a GREEN run of the same VERIFY.
2. Re-run `pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop`: exit 0, with APX-031-AC1 .. AC6 passing.
3. On that fresh build, run `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts` by hand. Expect exit 0 and stdout containing the exact ok literal from AC-1.
4. Copy dist to a temp dir, delete `r/nativewind/conversation.json`, and run with `--dist <copy>`. Expect exit 1 and `missing r/nativewind/conversation.json`.
5. `git diff --cached --name-only` is empty and `git status --porcelain -- apps/docs/dist public/r apps/docs/public` shows no changes. The spec never touched the real index or tree.
6. `git diff --name-only <base>...<task-commit>` lists exactly the 2 write-allowed files. Typecheck, lint and fallow each exit 0.

## Evidence Gates
- The RED and GREEN Playwright output per AC (APX-031-AC1 .. AC6), in the handoff.
- Preflight stdout for the real dist (the ok literal) and for one seeded defect (the FAILED line plus the offender line).
- The before and after hash comparison of apps/docs/dist (115 identical hashes).

## Review Criteria
REVIEWER CHECKS:
- The expected set is `packages/registry/registry.json` names times ENGINES plus each registry.json. It is never a listing of dist.
- Files are compared by bytes, not by name, size or count alone.
- No write lands under apps/docs/dist, apps/docs/public, public/r or the real .git/index. Only os.tmpdir() copies and GIT_INDEX_FILE temp indexes are used.
- The ok line is byte-identical to the AC-1 literal.
- The preflight is not wired into apps/docs/package.json, package.json or ci.yml.
- `_redirects` is checked only when apps/docs/public/_redirects is tracked.

## Dependencies
Depends on: ["APX-030", "APX-001"]
Blocks:     ["APX-023"]

## Notes
- APX-023 runs this script as the `Preflight dist` step in the deploy job, after the `docs-dist` download and before cloudflare/wrangler-action. It needs no change to run on the downloaded artifact: the job checks out HEAD, so root public/r and apps/docs/public/_headers are present, and `pnpm install` supplies tsx.
- The AC-6 temp-index commands run only as child processes of the spec, against a temp index file. The subagent git guard blocks raw index commands typed into an agent shell, so reproduce AC-6 by running its VERIFY, never by hand.
- The spec runs in docs-e2e (`pnpm e2e:docs`). Until it is green, docs-e2e is red and the gated deploy is Skipped by design, so the human sync PR should merge after this task lands.
- Preconditions, not dependencies: Sprint 05's ORI-CI-003 and ORI-DEP-003 land first. The deploy-side human preconditions (CLOUDFLARE_API_TOKEN secret, main sync PR, production environment) belong to APX-020 and APX-023 and are not needed for this task's own tests.

<!-- REQUIREMENT-CONTRACT v1 -->
<!--
{"guardrails": {"write_allowed": ["scripts/docs-deploy/preflight-dist.ts (NEW)", "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts (NEW)", ".tmp/APX-031/** (NEW - cycle evidence required by the sprint runner)"], "write_prohibited": ["scripts/docs-deploy/prepare.ts - ORI-DEP-001 lineage, read only", "apps/docs/package.json - build stage order pinned by the sprint-05 pipeline test", "package.json - no new root script", ".github/workflows/ci.yml - APX-023 wires the Preflight dist step", "apps/docs/public/_headers - authored by APX-001", "apps/docs/dist/** - uploaded by docs-e2e after the lane", "Any file not explicitly listed in write_allowed"]},"version": "1", "task_id": "APX-031", "tdd_mode": "red_first", "verification_policy": {"requires_tests": true, "requires_red_evidence": true, "requires_seeded_evidence": true}, "fixtures": {"built_dist_committed_headers": {"description": "apps/docs/dist from `pnpm --filter @rnr-ai-elements/docs build` at a commit where APX-030 and APX-001 have landed", "seed_method": "cli", "records": ["apps/docs/dist/r/nativewind and apps/docs/dist/r/uniwind each hold 57 JSON files (56 items + registry.json)", "apps/docs/dist/_headers byte-equal to the tracked apps/docs/public/_headers", "packages/registry/registry.json lists 56 item names including `conversation` and `tool`"]}, "temp_dist_copy": {"description": "a byte-identical copy of the real built dist under mkdtemp(join(os.tmpdir(), 'apx-031-')), mutated by the case's action; apps/docs/dist is never modified", "seed_method": "cli", "records": ["copy holds the same 114 dist/r JSON files and _headers as apps/docs/dist before mutation"]}, "temp_git_index": {"description": "a temporary index file seeded by `GIT_INDEX_FILE=<tmp>/index git read-tree HEAD` and edited by the case's action; the repository's real .git/index is untouched", "seed_method": "cli", "records": ["the temp index lists apps/docs/public/_headers and all 114 public/r paths before the case's edit"]}}, "requirements": [{"id": "AC-1", "type": "acceptance_criterion", "description": "GIVEN the real built dist and the committed, tracked _headers WHEN `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts` runs from the repo root with the default --dist THEN it exits 0, prints the literal ok line, and leaves apps/docs/dist bytes unchanged", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC1", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1", "test_tier": "integration", "verification_service": "real built apps/docs/dist, root public/r and git index, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built apps/docs/dist, root public/r and git index, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the script is a stub that prints the ok line without reading dist (AC-2..AC-6 expose it)", "dist/r is empty because the build never copied public/r", "the script is missing, so tsx exits with a module-not-found error (the RED state)"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "built_dist_committed_headers", "action": {"actor": "cli_user", "steps": ["snapshot sha256 of every file under apps/docs/dist/r plus apps/docs/dist/_headers", "run `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts`", "re-hash the same files"]}, "end_state": {"must_observe": ["exit status `0`", "stdout contains `[docs-deploy] preflight ok: nativewind 56/56 items + registry.json, uniwind 56/56 items + registry.json (114 files byte-equal public/r at HEAD); _headers byte-equal apps/docs/public/_headers (tracked)`", "`115` file hashes identical before and after"], "must_not_observe": ["`preflight FAILED`", "`0/56 items`"]}}]}}, {"id": "AC-2", "type": "acceptance_criterion", "description": "GIVEN a temp dist copy with r/uniwind/tool.json deleted WHEN the preflight runs with `--dist <copy>` THEN it exits 1 with the per-engine tallies and `missing r/uniwind/tool.json`", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC2", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC2", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the expected set is read from dist itself, so a missing file is never expected", "the script only counts files, so a static total hides which item is gone"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["delete `<copy>/r/uniwind/tool.json`", "run `pnpm exec tsx scripts/docs-deploy/preflight-dist.ts --dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `uniwind 55/56 items`", "stdout contains `nativewind 56/56 items`", "stdout contains `missing r/uniwind/tool.json`"], "must_not_observe": ["`preflight ok`", "exit status `0`"]}}]}}, {"id": "AC-3", "type": "acceptance_criterion", "description": "GIVEN a temp dist copy with an added r/nativewind/not-an-item.json containing `{\"name\":\"not-an-item\"}` WHEN the preflight runs with `--dist <copy>` THEN it exits 1 naming `extra r/nativewind/not-an-item.json` while both tallies stay 56/56", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC3", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC3", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the script checks only that expected files exist, so a fabricated slug that would serve 200 in production passes as static extra content"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["write `<copy>/r/nativewind/not-an-item.json` with `{\"name\":\"not-an-item\"}`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `extra r/nativewind/not-an-item.json`", "stdout contains `nativewind 56/56 items`"], "must_not_observe": ["`preflight ok`", "no offender lines (an empty offender list although `r/nativewind/not-an-item.json` was added)"]}}]}}, {"id": "AC-4", "type": "acceptance_criterion", "description": "GIVEN temp dist copies with one byte appended to r/nativewind/conversation.json, or with r/uniwind/registry.json deleted WHEN the preflight runs on each copy THEN each exits 1 naming `differs r/nativewind/conversation.json` or `missing r/uniwind/registry.json`", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC4", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC4", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["files are compared by name or size only, so a stale item body ships", "registry.json is not part of the expected set, so the CLI's index can go missing", "the byte comparison is a stub that always reports equal, so a deleted or drifted file passes unchanged"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["append one `\\n` byte to `<copy>/r/nativewind/conversation.json`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `differs r/nativewind/conversation.json`"], "must_not_observe": ["`preflight ok`", "no `differs` line (an empty offender list after the one-byte change)"]}}, {"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["delete `<copy>/r/uniwind/registry.json`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `missing r/uniwind/registry.json`"], "must_not_observe": ["`preflight ok`", "no `missing` line for `r/uniwind/registry.json` (an empty offender list)"]}}]}}, {"id": "AC-5", "type": "acceptance_criterion", "description": "GIVEN temp dist copies with _headers deleted, or with the line `  X-Drift: 1` appended to it WHEN the preflight runs on each copy THEN each exits 1 naming `missing _headers` or `differs _headers`", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC5", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC5", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the script ignores _headers, so a deploy ships with no cache tiers or CSP (the static state the live site shows today, measured 2026-09-29)", "_headers is checked for existence only, not bytes"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["delete `<copy>/_headers`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `missing _headers`"], "must_not_observe": ["`preflight ok`", "no `missing _headers` line (an empty offender list with `_headers` deleted)"]}}, {"start_ref": "temp_dist_copy", "action": {"actor": "cli_user", "steps": ["append `  X-Drift: 1` to `<copy>/_headers`", "run the preflight with `--dist <copy>`"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `differs _headers`"], "must_not_observe": ["`preflight ok`", "no `differs _headers` line (an empty offender list with `_headers` drifted)"]}}]}}, {"id": "AC-6", "type": "acceptance_criterion", "description": "GIVEN the real dist, run with GIT_INDEX_FILE pointing at a temp index that lacks apps/docs/public/_headers, or at one whose public/r/nativewind/conversation.json entry points at a different blob WHEN the preflight runs with that GIT_INDEX_FILE in its environment THEN it exits 1 naming `untracked apps/docs/public/_headers` or `public/r differs from HEAD`", "primary": false, "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC6", "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC6", "test_tier": "integration", "verification_service": "real git binary with a temporary index file, real built dist, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "maps_to_ac": null, "scenario": {"primary": false, "tier": "visible", "test_tier": "integration", "verification_service": "real git binary with a temporary index file, real built dist, through the real tsx preflight process", "topology": "single-node", "negative_control": {"would_fail_if": ["the tracked check is skipped, so an ignored local-only _headers passes locally while a fresh CI checkout ships none", "the public/r check is a stub that always passes"]}, "evidence": {"artifact_type": "stdout", "required_capture": true}, "cases": [{"start_ref": "temp_git_index", "action": {"actor": "cli_user", "steps": ["run `GIT_INDEX_FILE=<tmp>/index git rm --cached --quiet apps/docs/public/_headers`", "run the preflight on the real dist with `GIT_INDEX_FILE=<tmp>/index` in its env"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `untracked apps/docs/public/_headers`"], "must_not_observe": ["`preflight ok`", "no `untracked` line (an empty offender list while `apps/docs/public/_headers` is absent from the index)"]}}, {"start_ref": "temp_git_index", "action": {"actor": "cli_user", "steps": ["repoint the temp index entry with `git update-index --cacheinfo 100644,<blob of public/r/uniwind/conversation.json>,public/r/nativewind/conversation.json`", "run the preflight on the real dist with that GIT_INDEX_FILE"]}, "end_state": {"must_observe": ["exit status `1`", "stdout contains `public/r differs from HEAD`"], "must_not_observe": ["`preflight ok`", "no `public/r differs from HEAD` line (an empty offender list with the index entry repointed)"]}}]}}, {"id": "TC-1", "type": "test_criterion", "primary": false, "description": "The preflight exits 0 when run on the real built apps/docs/dist", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC1", "test_tier": "integration", "verification_service": "real built apps/docs/dist, root public/r and git index, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-2", "type": "test_criterion", "primary": false, "description": "The preflight stdout contains the exact ok literal when run on the real built apps/docs/dist", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC1", "test_tier": "integration", "verification_service": "real built apps/docs/dist, root public/r and git index, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-3", "type": "test_criterion", "primary": false, "description": "Every apps/docs/dist file hash is identical before and after the spec run", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC1", "test_tier": "integration", "verification_service": "real built apps/docs/dist, root public/r and git index, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC1", "maps_to_ac": "AC-1"}, {"id": "TC-4", "type": "test_criterion", "primary": false, "description": "The preflight prints `missing r/uniwind/tool.json` when that file is deleted from a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC2", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC2", "maps_to_ac": "AC-2"}, {"id": "TC-5", "type": "test_criterion", "primary": false, "description": "The preflight prints `uniwind 55/56 items` when r/uniwind/tool.json is deleted from a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC2", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC2", "maps_to_ac": "AC-2"}, {"id": "TC-6", "type": "test_criterion", "primary": false, "description": "The preflight prints `extra r/nativewind/not-an-item.json` when that file is added to a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC3", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC3", "maps_to_ac": "AC-3"}, {"id": "TC-7", "type": "test_criterion", "primary": false, "description": "The preflight prints `differs r/nativewind/conversation.json` when one byte is appended to that file in a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC4", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC4", "maps_to_ac": "AC-4"}, {"id": "TC-8", "type": "test_criterion", "primary": false, "description": "The preflight prints `missing r/uniwind/registry.json` when that index is deleted from a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC4", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC4", "maps_to_ac": "AC-4"}, {"id": "TC-9", "type": "test_criterion", "primary": false, "description": "The preflight prints `missing _headers` when _headers is deleted from a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC5", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC5", "maps_to_ac": "AC-5"}, {"id": "TC-10", "type": "test_criterion", "primary": false, "description": "The preflight prints `differs _headers` when a line is appended to _headers in a temp dist copy", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC5", "test_tier": "integration", "verification_service": "real built dist copy on the local filesystem, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC5", "maps_to_ac": "AC-5"}, {"id": "TC-11", "type": "test_criterion", "primary": false, "description": "The preflight prints `untracked apps/docs/public/_headers` when its GIT_INDEX_FILE lacks that path", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC6", "test_tier": "integration", "verification_service": "real git binary with a temporary index file, real built dist, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC6", "maps_to_ac": "AC-6"}, {"id": "TC-12", "type": "test_criterion", "primary": false, "description": "The preflight prints `public/r differs from HEAD` when its GIT_INDEX_FILE maps public/r/nativewind/conversation.json to another blob", "flow_ref": null, "test_file": "tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts", "test_function": "APX-031-AC6", "test_tier": "integration", "verification_service": "real git binary with a temporary index file, real built dist, through the real tsx preflight process", "surface_policy": null, "unit_test_justified": null, "verify": "pnpm --filter @rnr-ai-elements/docs build && CI=1 pnpm exec playwright test tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts --project chromium-desktop --grep APX-031-AC6", "maps_to_ac": "AC-6"}]}
-->

## Handoff

```json
{
  "task": "APX-031",
  "commit_sha": "c150198b07c8b32f374e7b3954670b66636319e4",
  "done": "Landed scripts/docs-deploy/preflight-dist.ts and tests/sprint-07-deploy-live-at-apex/dist-preflight.spec.ts. The preflight refuses upload unless dist/r matches packages/registry/registry.json \u00d7 ENGINES against committed public/r and dist/_headers matches tracked apps/docs/public/_headers, printing the literal ok line on success and the contracted FAILED offender format on defects. AC-1..AC-6 passed on chromium-desktop against the real built dist with temp copies and GIT_INDEX_FILE indexes only; evidence is under .tmp/APX-031/cycle-1/.",
  "deviations": [],
  "concerns": [],
  "findings": [],
  "scope_impact": [],
  "feedback": []
}
```
