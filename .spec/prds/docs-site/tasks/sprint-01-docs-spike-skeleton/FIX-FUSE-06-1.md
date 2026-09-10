================================================================================
TASK: FIX-FUSE-06-1 - Serialize the docs e2e lane so destructive specs cannot race readers
================================================================================

TASK_TYPE:  FIX
STATUS:     Backlog (written by kb-run-sprint orchestrator, 2026-09-10 — finding from FUSE-06 cycle-1 review)
PRIORITY:   P0
POINTS:     1
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: orchestrator (astro-reviewer finding)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm e2e:docs   # the real lane; also pnpm vitest run <file> -t <token>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
FINDING (FUSE-06 cycle-1 review, reproduced 2/2 by the reviewer)
--------------------------------------------------------------------------------

Playwright runs different spec FILES in parallel workers. The deliv-03 spec's
contracted destructive cases rmSync apps/docs/src/data/* (and public/r) mid-run and
regenerate them; any concurrently-importing spec that reads those artifacts at module
scope ENOENTs (observed: FUSE-06's ledger.spec.ts 2 failed / 8 did-not-run in the real
lane). The same latent hazard exists on main for component-page.spec.ts (currently
masked by its 15s fixture bridge). FUSE-12's CI lane (docs-e2e job runs `pnpm e2e:docs`
on every PR) inherits this flake class.

This FIX makes the lane deterministic at the config level: serialize the lane's
workers. Per-spec bounded retries (FUSE-07/FUSE-06 pattern) remain as defense-in-depth.

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

`pnpm e2e:docs` runs with workers serialized (1 worker for the lane) and exits 0
repeatedly; the deliv-03 destructive cases and every reader spec coexist without
ENOENT races. Lane wall time increases (accepted cost, still seconds-scale).

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier)
--------------------------------------------------------------------------------

- MUST: the change is in playwright.config.ts only (product diff = config + evidence;
  a config-level serialization such as `workers: 1`, or a dedicated serial project for
  the deliv-03 spec — your choice must be proven equivalent)
- MUST: RED first — on the unfixed tree, demonstrate the race is real (e.g. run the
  lane with a spec that reads src/data at module scope, or quote FUSE-06 cycle-1's
  captured failure .kb-run-sprint/sprint-01-docs-spike-skeleton/FUSE-06/cycle-1.verdict.json)
  and capture it under .tmp/FIX-FUSE-06-1/cycle-1/red/
- MUST: GREEN — full `pnpm e2e:docs` exit 0, run TWICE, both logs under cycle-1/green/
- NEVER: never delete, skip, or weaken any spec or its assertions (deliv-03's
  destructive cases are contracted — they stay; they just stop racing)
- NEVER: never change retries away from 0, never touch the webServer contract
  (strict 4321, astro preview over dist)
- STRICTLY: sequential execution in your worktree (never lane+vitest concurrent);
  verify port 4321 free before lane runs; wrap exit codes (rtk masks them)

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: lane serialized at config level; full `pnpm e2e:docs` exit 0 twice (RED first)
- [ ] pnpm typecheck clean; biome ci clean on touched paths
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA
--------------------------------------------------------------------------------

AC-1: Deterministic lane
  GIVEN: main with worker-parallel lane (known ENOENT race class)
  WHEN:  playwright.config.ts serializes the lane (RED: capture the race evidence;
         GREEN: full lane exit 0 twice)
  THEN:  lane deterministic; all contracted tests still run (no new skips beyond the
         established nojs guards + deliv wrapper single-project run); config contract
         test (FUSE-10's runner-config.test.ts) updated ONLY if it asserts workers —
         if so the update must assert the NEW serialized value, never delete the assertion

  TEST_TIER:            integration
  VERIFICATION_SERVICE: real playwright lane over real astro preview + real deliv-03 destructive cases
  TEST_FILE:            n/a — the verify IS the full lane (evidence under .tmp/FIX-FUSE-06-1/) plus FUSE-10's runner-config vitest
  VERIFY:               sh -c 'pnpm e2e:docs; echo exit=$?'

--------------------------------------------------------------------------------
SCOPE
--------------------------------------------------------------------------------

writeAllowed:
- playwright.config.ts
- tests/sprint-01-docs-spike-skeleton/runner-config.test.ts (ONLY if it asserts workers)
- .tmp/FIX-FUSE-06-1/ (evidence)

Depends on: none (landed independently of FUSE-06's cycle-2 branch sync)
