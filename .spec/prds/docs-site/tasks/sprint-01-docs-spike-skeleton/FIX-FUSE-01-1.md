================================================================================
TASK: FIX-FUSE-01-1 - Give the biome lint gate real coverage of apps/docs
================================================================================

TASK_TYPE:  FIX
STATUS:     in_progress
PRIORITY:   P1
POINTS:     1
AGENT:      implementer=ai-tooling-implementer | reviewer=ai-tooling-reviewer
PROPOSED-BY: orchestrator (astro-reviewer finding)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <token>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
FINDING (from FUSE-01 cycle-1 review, verified by the reviewer)
--------------------------------------------------------------------------------

`biome.json` `files.includes` has no apps/ entry, so `./node_modules/.bin/biome ci
apps/docs` checks ZERO files under apps/docs (observed: "Checked 1 file" = only the
test file). The sprint's lint gates claim to lint the docs package but check nothing.
This FIX gives the gate real coverage for the NEW docs package only.

Deliberately OUT of scope: adding all of apps/** (example, harness,
harness-nativewind were never biome-covered — changing that is repo-wide posture,
not this sprint). Only `apps/docs/**` is added.

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

`./node_modules/.bin/biome ci apps/docs` reports checking the real files under
apps/docs (count > 1) and exits 0; a deliberately broken scratch file under
apps/docs makes it exit non-zero (negative control); root `pnpm typecheck` and the
sprint's existing tests stay green.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier)
--------------------------------------------------------------------------------

- MUST: edit ONLY biome.json among product files (plus the new test file and .tmp evidence)
- MUST: the include pattern is scoped `apps/docs/**` variants (ts, mjs, json) — NOT all of apps/**
- MUST: `./node_modules/.bin/biome ci apps/docs` exits 0 after the change with >1 file checked
- NEVER: never disable or weaken any existing biome rule or include pattern
- NEVER: never touch files under apps/example, apps/harness, apps/harness-nativewind
- STRICTLY: capture exit codes through a wrapper (`sh -c '...; echo exit=$?'`) — an rtk
  hook rewrites command output and can mask exit codes

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: biome ci apps/docs checks real files and exits 0; broken-file negative control exits 1
- [ ] every AC verify command passes
- [ ] pnpm typecheck clean; sprint tests stay green
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA
--------------------------------------------------------------------------------

AC-1: Biome gate sees apps/docs
  GIVEN: main with apps/docs present (FUSE-01 landed) and biome.json without any apps/ include
  WHEN:  the test adds the apps/docs include patterns to biome.json (red first: run
         `./node_modules/.bin/biome ci apps/docs` and capture that it checks <2 files),
         then creates a scratch apps/docs file with a biome error, runs the command
         (expect exit 1), deletes the scratch file, and re-runs (expect exit 0 with >1 file checked)
  THEN:  final run exits 0 checking the real docs files; negative control demonstrated exit 1

  TEST_TIER:            integration
  VERIFICATION_SERVICE: real biome binary over the real apps/docs tree
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/biome-apps-docs-coverage.test.ts
  TEST_FUNCTION:        FIX-FUSE-01-1-biome-coverage
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/biome-apps-docs-coverage.test.ts -t FIX-FUSE-01-1-biome-coverage

--------------------------------------------------------------------------------
SCOPE
--------------------------------------------------------------------------------

writeAllowed:
- biome.json
- tests/sprint-01-docs-spike-skeleton/biome-apps-docs-coverage.test.ts (NEW)
- .tmp/FIX-FUSE-01-1/ (evidence)

Depends on: none
