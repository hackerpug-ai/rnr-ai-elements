================================================================================
TASK: FIX-FUSE-04-1 - Serialize vitest file parallelism so the registry drill cannot race readers
================================================================================

TASK_TYPE:  FIX
STATUS:     Completed (landed)
COMMIT:     f5a8894f57b168177b0e409a6e90a7d2a19513df
PRIORITY:   P0
POINTS:     1
AGENT:      implementer=ai-tooling-implementer | reviewer=ai-tooling-reviewer
PROPOSED-BY: orchestrator (react-native-reusables-reviewer finding)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <token>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
FINDING (from FUSE-04 cycle-1 review, reproduced 2/2 by the reviewer)
--------------------------------------------------------------------------------

FUSE-04's contracted drill (scripts/docs-data/drill-item-count.ts) mutates the real
packages/registry/registry.json for ~13s and byte-restores it. Under vitest's default
file parallelism, a concurrent test file (enrichment-modules.test.ts) reads the
mutated 55-item registry mid-drill and fails its 56-item assertions. A plain
`pnpm vitest run` on merged main exits 1 DETERMINISTICALLY (not flaky). The fix is
one line in the root vitest.config.ts — outside FUSE-04's writeAllowed.

Sequencing: must land BEFORE FUSE-05 merges (it adds more registry-reading tests)
and before FUSE-12's CI lane runs suites.

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

A plain `pnpm vitest run` at the repo root exits 0 (all sprint suites green,
including the drill), and the drill still performs its real mutation + real
restores. The whole suite is serialized: full-suite wall time roughly doubles —
accepted cost.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier)
--------------------------------------------------------------------------------

- MUST: the change is `fileParallelism: false` inside the `test:` block of the root
  vitest.config.ts (or an equivalent single-key config change that serializes test
  FILES — not a runtime-gated skip of the drill, which is banned)
- MUST: prove RED first — on a worktree WITHOUT the fix, run plain `pnpm vitest run`
  and capture the exit-1 with the 56-vs-55 overlap failures under .tmp/FIX-FUSE-04-1/cycle-1/red/
- MUST: prove GREEN after — plain `pnpm vitest run` exits 0 with the drill executed
  (assert the drill's real-registry mutation ran; e.g. its report output in the log)
- NEVER: never skip, gate, or weaken the drill test itself; never touch the drill,
  gates, or any test file
- NEVER: never change maxWorkers to a value that still allows the drill file to run
  concurrently with registry readers (serialization must be total)
- STRICTLY: capture exit codes via wrapper (`sh -c '...; echo exit=$?'`) — rtk masks them

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [x] AC-1: plain `pnpm vitest run` exits 0 on the fixed tree (RED without, GREEN with)
- [x] pnpm typecheck clean; biome ci clean on touched paths (vitest.config.ts)
- [x] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA
--------------------------------------------------------------------------------

AC-1: Full suite green with serialized files
  GIVEN: main with FUSE-04's drill landed (known deterministic full-suite failure)
  WHEN:  plain `pnpm vitest run` runs (RED capture), then vitest.config.ts sets
         fileParallelism:false, then plain `pnpm vitest run` runs again (GREEN capture)
  THEN:  RED shows exit 1 with the registry 56-vs-55 overlap; GREEN shows exit 0 with
         every suite passing and the drill's mutation+restore observable in the log

  TEST_TIER:            integration
  VERIFICATION_SERVICE: real vitest runner over the real suites incl. the real registry drill
  TEST_FILE:            n/a — the verify IS the full-suite command (evidence logs under .tmp/FIX-FUSE-04-1/)
  VERIFY:               sh -c 'pnpm vitest run; echo exit=$?'

--------------------------------------------------------------------------------
SCOPE
--------------------------------------------------------------------------------

writeAllowed:
- vitest.config.ts
- .tmp/FIX-FUSE-04-1/ (evidence)

Depends on: none (FUSE-04 is landed)
