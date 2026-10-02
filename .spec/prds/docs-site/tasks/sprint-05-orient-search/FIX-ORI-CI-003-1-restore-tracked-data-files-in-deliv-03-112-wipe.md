---
id: FIX-ORI-CI-003-1
title: Restore tracked data files in deliv-03-112's wipe cycle
sprint: sprint-05-orient-search
created_by: orchestrator (disposition: ORI-CI-003 cycle-1 discovery, 2026-10-02)
implementer: ghactions-implementer
reviewer: ghactions-reviewer
points: 2
depends_on: []
status: open
---

## Problem

The full `pnpm e2e:docs` lane is broken on main: 116 of ~358 specs fail mid-suite with ENOENT, and every subsequent docs build fails the matrix gate. Root cause is a cross-sprint collision:

- `tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts` (commit `5352178c`, sprint-01) `rmSync`s `apps/docs/src/data/` **wholesale** mid-suite and restores only `families.json`.
- Sprint-04 (`5102be28`) later added **tracked** `apps/docs/src/data/dev-client-matrix.json` and `token-usage.json` into that directory.
- Result: mid-suite the tracked files are deleted and never restored; 116 later specs ENOENT; every later docs build fails the matrix gate (which reads dev-client-matrix.json at `gates.ts:341`).

Proof of pre-existence (ORI-CI-003 cycle 1): `git diff main` on the spec and the data dir is empty; the spec predates the data files. Observed full-suite run: 242 passed / 116 failed in 31.8m.

This single bug accounts for a large share of sprint-06's 56 gate failures (its gate's one FAIL was `pnpm e2e:docs` exit 1) and of FIX-ORI-SUITE-1's aggregate red.

## Remedy (either, implementer's judgment with rationale)

- **Option A (preferred, smallest)**: in the spec's wipe cycle, snapshot the directory's tracked files before `rmSync` and restore them after (not just `families.json`). The wipe must still delete the generated/untracked outputs it was written to test.
- **Option B**: relocate the two tracked files out of the wiped directory (touches importers — larger diff; only if A is somehow wrong).

## write_allowed

- `tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts (MODIFY)`
- (Option B only, if chosen: the moved file paths + their importers — document each in the report)

## Acceptance criteria

- **AC-1**: The wipe-and-restore cycle in deliv-03-112 restores ALL tracked files that existed under `apps/docs/src/data/` before the wipe. Proof: a real full-suite (or scoped representative) run showing the tracked files present on disk immediately after the spec's wipe phase and at suite end.
- **AC-2**: `git status --short apps/docs/src/data/` is clean after a full run (no tracked deletions left behind).
- **AC-3**: The lane-level effect is measured honestly: run the e2e subsets that previously ENOENT'd (at minimum the 116-failure sample OR the full suite if time permits; full suite is ~32m) and report before/after counts. The 116 ENOENT failures must be gone; any REMAINING failures must be enumerated and attributed to their owners (do not fix unrelated frozen lanes in this task — that is re-baseline scope).

## Critical constraints

- Do NOT widen scope to other frozen-lane failures — enumerate and route them.
- No `--no-verify`, no skipped assertions, no weakening of the spec's own file-completeness checks.
- Port 4321 discipline: CI=true for playwright runs; sweep for orphan previews serving your worktree before launching.
- Pre-commit needs generated registry-items.json (gitignored): `pnpm registry:build && pnpm gallery:manifest && pnpm exec tsx scripts/docs-data/prebuild.ts` in a fresh worktree.
- Known local flakes: biome OOM (use `./node_modules/.bin/biome`, retry once); Android/keyboard flakes do not apply (web lane).
