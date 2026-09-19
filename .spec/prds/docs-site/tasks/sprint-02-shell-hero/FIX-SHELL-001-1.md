================================================================================
TASK: FIX-SHELL-001-1 - Guard gallery-manifest-dual-emit.test.ts against deleting tracked families.json
================================================================================
TASK_TYPE:  FIX
STATUS:     Completed (landed)
COMMIT:     806e85a270661d12453745254473db3a49026d14
PRIORITY:   P1
POINTS:     1
AGENT:      implementer=astro-implementer | reviewer=astro-reviewer
PROPOSED-BY: orchestrator (SHELL-001 cycle-2 remediation flag, 2026-09-11)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true requires_seeded_evidence=false
SPRINT:     sprint-02-shell-hero | WAVE: A (independent — Depends on: none)
RUNTIME_COMMANDS:
  test:      pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally
--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------
Running the sprint-01 vitest lane (or just gallery-manifest-dual-emit.test.ts) must leave the
working tree clean: the TRACKED, authored apps/docs/src/data/families.json survives the test's
delete-and-regenerate case, restored exactly as deliv-03-112-file-completeness.spec.ts already
does.
**Success state:** `pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts`
exits 0 AND `git status --porcelain -- apps/docs/src/data/` is empty afterward — every run, any
order.
--------------------------------------------------------------------------------
CRITICAL CONSTRAINTS (Never tier — read before acting)
--------------------------------------------------------------------------------
- MUST: Fix the test's hygiene (snapshot before the wipe, restore after), mirroring the proven
  pattern in tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
  (snapshot ~line 44, restore ~line 100)
- MUST: families.json's restored bytes must be byte-identical to the tracked original
- NEVER: Never weaken, skip, or delete any existing assertion in dual-emit.test.ts
- NEVER: Never touch the generated artifacts' content expectations — the dual-emit verdict
  behavior the test pins is correct and stays pinned
- NEVER: Never edit any file outside SCOPE.writeAllowed
--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------
- [x] AC-1: running the dual-emit test file exits 0 and leaves apps/docs/src/data/families.json
      byte-identical to HEAD (git status --porcelain -- apps/docs/src/data/ empty)
- [x] AC-2: running the whole sprint-01 vitest lane (tests/sprint-01-docs-spike-skeleton) exits 0
      and leaves the working tree clean of tracked-file modifications under apps/docs/src/data/
- [x] typecheck + lint clean on touched paths
- [x] git diff --name-only ⊆ SCOPE.writeAllowed
--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA (TDD beads — ordered happy-path first)
--------------------------------------------------------------------------------
AC-1: The dual-emit wipe case no longer destroys tracked families.json
  GIVEN: the repo checkout with the sprint-01 lane green (RED at start: running dual-emit.test.ts
         alone deletes families.json — verify `git status --porcelain -- apps/docs/src/data/`
         is non-empty after the run, then `git checkout -- apps/docs/src/data/families.json`)
  WHEN:  the fixed test runs as a real subprocess
  THEN:  it exits 0 and leaves apps/docs/src/data/families.json byte-identical to HEAD
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real vitest subprocess + real filesystem + real git index
  TEST_FILE:             tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts (MODIFY)
  VERIFY:                pnpm vitest run tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts && git status --porcelain -- apps/docs/src/data/ | wc -l  # expect 0

AC-2: Whole sprint-01 lane stays green and tree-clean
  GIVEN: the fixed dual-emit test
  WHEN:  the full sprint-01 vitest lane runs
  THEN:  it exits 0 and apps/docs/src/data/ carries no tracked-file modifications afterward
  TEST_TIER:             integration
  VERIFICATION_SERVICE:  real vitest subprocess + real filesystem + real git index
  VERIFY:                pnpm vitest run tests/sprint-01-docs-spike-skeleton && git status --porcelain -- apps/docs/src/data/ | wc -l  # expect 0

--------------------------------------------------------------------------------
SCOPE (file-level write permissions)
--------------------------------------------------------------------------------
writeAllowed:
- tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts (MODIFY)
writeProhibited:
- everything else
--------------------------------------------------------------------------------
READING LIST (max 2)
--------------------------------------------------------------------------------
- tests/sprint-01-docs-spike-skeleton/gallery-manifest-dual-emit.test.ts:109 — the offending rmSync
- tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts:44,100 — the proven snapshot/restore pattern to mirror
