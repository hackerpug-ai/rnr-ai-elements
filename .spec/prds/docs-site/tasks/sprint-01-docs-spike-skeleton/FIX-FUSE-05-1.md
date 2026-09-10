================================================================================
TASK: FIX-FUSE-05-1 - Untrack the generated docs gallery-manifest JSON
================================================================================

TASK_TYPE:  FIX
STATUS:     Backlog (written by kb-run-sprint orchestrator, 2026-09-10 — ruling from FUSE-05 cycle-1 review)
PRIORITY:   P0
POINTS:     1
AGENT:      implementer=react-native-reusables-implementer | reviewer=react-native-reusables-reviewer
PROPOSED-BY: orchestrator (react-native-reusables-reviewer ruling)
TDD_MODE:   red_first | RED_GREEN_REQUIRED: yes
VERIFICATION_POLICY: requires_tests=true requires_red_evidence=true
SPRINT:     sprint-01-docs-spike-skeleton

RUNTIME_COMMANDS:
  test:      pnpm vitest run <file> -t <token>
  typecheck: pnpm typecheck
  lint:      ./node_modules/.bin/biome ci <paths>   # pnpm lint crashes locally

--------------------------------------------------------------------------------
FINDING (FUSE-05 cycle-1 review, BLOCKER-tracked-generated-json ruling)
--------------------------------------------------------------------------------

apps/docs/src/data/gallery-manifest.json is TRACKED (committed by FUSE-02 in d9af0f9)
but is generated output: FUSE-05's contract says generated src/data JSONs must never be
committed. Reviewer ruling: tracked-but-ignored is NOT acceptable long-term — it
violates T-DELIV-004 ("absent in fresh clone") and a bare docs build on a fresh clone
would consume a stale copy, masking gallery:manifest breakage. FUSE-05 did everything
in-scope (.gitignore line covers the pattern; check-ignore --no-index exits 0); the
untracking itself was outside its writeAllowed. The ordered chain regenerates the
manifest before consumption, so the human gate itself is not masked — this FIX removes
the stale-copy hazard permanently.

--------------------------------------------------------------------------------
OUTCOME (observable success)
--------------------------------------------------------------------------------

`git ls-files apps/docs/src/data/` is EMPTY (nothing under the generated-data dir is
tracked); the file remains on disk and gitignored for working trees; a fresh-clone
simulation (clone/checkout without the file) runs the ordered chain
(registry:build && gallery:manifest && docs build) and regenerates it byte-identically,
proving no consumer depended on the committed copy.

--------------------------------------------------------------------------------
🚫 CRITICAL CONSTRAINTS (Never tier)
--------------------------------------------------------------------------------

- MUST: `git rm --cached apps/docs/src/data/gallery-manifest.json` — untrack WITHOUT
  deleting the working-tree file
- MUST: after untracking, `git check-ignore apps/docs/src/data/gallery-manifest.json`
  exits 0 (the FUSE-05 .gitignore line now applies to the untracked file)
- MUST: prove regeneration — delete the file, run the ordered chain
  (pnpm -w run registry:build && pnpm -w run gallery:manifest), confirm the file
  returns byte-identical to what FUSE-02's emit produces
- MUST: RED first — before the change, `git ls-files apps/docs/src/data/` lists the
  file (capture under .tmp/FIX-FUSE-05-1/cycle-1/red/)
- NEVER: never delete the working-tree file in the commit; never touch families.json
  (it is authored and MUST stay tracked); never edit scripts/build-gallery-manifest.ts
- STRICTLY: capture exit codes via wrapper (`sh -c '...; echo exit=$?'`) — rtk masks them

--------------------------------------------------------------------------------
DONE WHEN
--------------------------------------------------------------------------------

- [ ] AC-1: git ls-files apps/docs/src/data/ empty; check-ignore exits 0; regeneration proof green
- [ ] pnpm typecheck clean; biome ci clean on touched paths (none expected beyond evidence)
- [ ] git diff --name-only ⊆ SCOPE.writeAllowed

--------------------------------------------------------------------------------
ACCEPTANCE CRITERIA
--------------------------------------------------------------------------------

AC-1: Generated JSON is untracked and regenerable
  GIVEN: main with the file tracked (RED) and FUSE-05's .gitignore line landed
  WHEN:  git rm --cached the file and commit the removal
  THEN:  git ls-files apps/docs/src/data/ is empty; git check-ignore exits 0;
         deleting the file and re-running registry:build && gallery:manifest
         regenerates it byte-identically

  TEST_TIER:            integration
  VERIFICATION_SERVICE: real git index + real gallery:manifest emit over the real registry
  TEST_FILE:            tests/sprint-01-docs-spike-skeleton/generated-data-untracked.test.ts
  TEST_FUNCTION:        FIX-FUSE-05-1-generated-data-untracked
  VERIFY:               pnpm vitest run tests/sprint-01-docs-spike-skeleton/generated-data-untracked.test.ts -t FIX-FUSE-05-1-generated-data-untracked

--------------------------------------------------------------------------------
SCOPE
--------------------------------------------------------------------------------

writeAllowed:
- apps/docs/src/data/gallery-manifest.json (index removal ONLY via git rm --cached)
- tests/sprint-01-docs-spike-skeleton/generated-data-untracked.test.ts (NEW)
- .tmp/FIX-FUSE-05-1/ (evidence)

Depends on: none (FUSE-05 is landed)
