# RED reproduction method (AC-1)

The pre-fix RED was reproduced two ways, both exit 1:

1. **Scratch reproduction in this worktree** (`red.txt`): the two committed ORI-RN-001
   templates were copied under `packages/docs-snippets/{nativewind,uniwind}/` (24 files),
   then `pnpm check:fallow` was run. Result: exit 1 — `97 unused dependencies · 8
   dev/optional`, `9 clone groups` (711 lines / 14 files) over 23 changed files. The
   scratch copy was then relocated to `$TMPDIR` and removed from the working tree.

2. **Sibling ORI-RN-001 worktree verbatim** (`sibling-red-baseline.txt`): the sibling
   `ORI-RN-001` worktree (which carries the templates plus the quickstart-consumer
   support files) was run verbatim. Result: exit 1 — `97 unused dependencies · 8
   dev/optional`, `10 clone groups` (769 lines / 15 files) over 31 changed files. This
   matches the FIX doc's baseline section.

The duplication delta (9 vs 10 clone groups, 711 vs 769 lines) is because the sibling
also carries `tests/sprint-05-orient-search/support/quickstart-consumer.ts` (with its own
internal clone group), absent from the scratch reproduction here. The unused-dependency
signal is identical in both (97 + 8).
