# GBC-006 evidence index

Worktree: sprint-06-guides-boundary-changelog/GBC-006 at trunk fdac4bae. Date: 2026-09-29.

## Cross-check result (AC-1/TC-1)

The landed content reconciles with ZERO contradictions and ZERO omissions — no
content edits were required. Verified by dry-run and by the shipped checker
(`tests/sprint-06-guides-boundary-changelog/content-reconciliation.test.ts`):

- gaps (5) name no shipped item under exact case-insensitive equality
  ('Tool execution' vs shipped 'tool' correctly does NOT match);
- the absence-claim oracle (mirrored from boundary-tables.spec.ts gapRowNamesItem)
  flags no gap row;
- every gap is stated in the boundary page's '## What your app supplies' section;
- all 9 notPorted names are absent from the 56-item ledger;
- upstream complement is exact: mapping 40 + notPorted 9 = upstream 49, no overlap.

## Files

- `cycle-1/green/vitest-green.txt` — the four named checks pass on the real files.
- `cycle-1/red/vitest-red.txt` — 'button' planted into the real gaps frontmatter;
  the checker rejects it by name ("gap 'button' is neither stated in the
  consumer-responsibility section nor a not-ported element") and the file was
  reverted (`/usr/bin/git checkout --`). The AC-1 row-count oracle fires first
  (5 rows vs 6 gaps), and the AC-4 real-files precondition shows the checker's
  own throw naming 'button'.
- `changelog-git-reconciliation.md` — the GBC-005 per-entry git-log
  reconciliation (each entry's body bullets vs its cited commit range, with the
  emitted-registry verification of the v0.2.1 broken-tree claim).
- `vitest-sprint06.log` — all 10 sprint-06 vitest files green (56 tests),
  including the new content-reconciliation.test.ts.
- `ac3-porting-map.log` — AC-3 keep-passing proof: the locked command
  (docs build + CI=1 playwright --grep FLOW-DOCS-05-porting-map-and-prior-art)
  exits 0, 18/18 tests across desktop, mobile, and no-JS projects.
- `docs-build.log`, `tsc.log`, `biome.log` — the task's other verification gates,
  all exit 0.
- `vitest-full.log` — the whole-repo vitest run, killed at the 30-minute
  background limit mid-drill. Non-sprint-06 failures observed are pre-existing
  or worktree-environmental (see next section); tracked run artifacts the killed
  run left behind were restored with `git checkout --`.
- `preexisting-proof-single-tutorial-gate.txt` — root cause of the non-listed
  sprint-05 failures: those lanes copy the working tree to
  `~/.cache/agent-scratch/...` and run `git tag` inside the copy; a copied
  linked-worktree `.git` file dangles, so every drill dies with
  `fatal: not a git repository`. Structural to running the suite from this
  worktree, independent of any content. ORI-AST-001 x3, SHELL-002, and REF-006
  match the orchestrator's documented pre-existing list.

## Note on the AC-4 contract example

The contract's example gap 'button' is NOT one of the 56 shipped registry items
('button-group' is; 'button' is an RNR primitive resolved from RNR's own
registry). The shipped test plants BOTH 'button' (rejected by name via the
omission branch) and 'tool' (a genuinely shipped name, rejected via the
exact-equality branch), so the contract's literal example and the endorsed
matching semantics are both exercised.
