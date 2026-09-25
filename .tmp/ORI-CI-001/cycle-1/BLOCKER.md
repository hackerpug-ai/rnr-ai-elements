# ORI-CI-001 cycle 1 — checkpoint + blocker

Status: BLOCKED on one authored-content line; checkpoint commits the two green in-scope pieces.

## The blocker

The task's prerequisite (fixture `real_quickstart_tree`, dependency list, boundary
contract 5) requires the actual Quickstart source to declare `tutorial: true` at
`/docs/quickstart`. It does not:

- `apps/docs/src/content/docs/quickstart.mdx` (landed by ORI-CONT-003, 22780223)
  declares only title/description/section/order(2.5). No `tutorial` field.
- ORI-CONT-003's own task contract never asked it to author `tutorial: true`
  (its deviations list records only `order: 2.5` and never mentions the
  designation). ORI-CI-001's boundary contract 5 attributes an obligation to
  ORI-CONT-003 that ORI-CONT-003's file does not contain.
- ORI-AST-001 landed the schema without a `tutorial` field — correctly, since
  "tutorial cardinality enforcement" is explicitly out of ORI-AST-001's scope.

## Why the gate cannot be wired this cycle

The designation must be declared metadata (AC-2's negative control bans
counting that filters to Quickstart; the reviewer charter bans classifying
prose). A fail-closed gate over declared metadata counts 0 on the real tree
today, so wiring `assertSinglePublishedTutorial` into
`apps/docs/src/pages/docs/[...id].astro` fails the real build immediately —
breaking AC-1 ("must not observe a tutorial-validation failure on the original
one-tutorial tree"), every sibling worktree's docs build, and the trunk.
Authored content is writeProhibited to this task, and the fix is one line
(`tutorial: true` in the quickstart frontmatter).

## What this checkpoint commits (green, in scope, behavior-neutral)

- `apps/docs/src/content.config.ts` — declares
  `tutorial: z.boolean().optional()` (the declared metadata contract that
  boundary contract 5 presupposes). No authored file carries the key today, so
  the build is unchanged: 67 pages, exit 0.
- `scripts/docs-data/single-tutorial.ts` — the deterministic gate module
  (gates.ts violation style): pinned EXPECTED_TUTORIAL_COUNT=1 and
  CANONICAL_TUTORIAL_DESTINATION=/docs/quickstart, publication parity with
  docs-navigation (`draft !== true`), complete-collection counting before any
  route filter, source-identifying diagnostics (both IDs on duplicates;
  observed 0 versus 1 + canonical destination + lost-designation source on
  missing; actual vs required destination on noncanonical). NOT wired into the
  route generator — wiring is the blocked step.

## Evidence (this cycle, observed runs)

- `green/docs-build.log` — real `pnpm --filter @rnr-ai-elements/docs build`,
  exit 0, 67 pages, with the schema change in place.
- `green/typecheck.log` — `pnpm typecheck` exit 0.
- `green/biome.log` — biome ci on both touched files, exit 0.
- `green/single-tutorial-exercise.ts` + `green/module-exercise.log` — tsx run
  of the real module through all six decision shapes (canonical pass, draft
  boundary pass, duplicate/missing/noncanonical rejections with the exact
  required diagnostic facts, fail-closed throw). Module-behavior demonstration
  only — the AC proof stays the wired real build in cycle 2.

## Cycle 2 path (after the scope question is resolved)

1. Someone authorized to touch authored content adds `tutorial: true` to
   `apps/docs/src/content/docs/quickstart.mdx` frontmatter (one line), OR the
   task's write allowlist is extended by exactly that file.
2. Wire `assertSinglePublishedTutorial(typed)` into `[...id].astro`
   getStaticPaths before `publishedDocs` (import from
   `../../../../scripts/docs-data/single-tutorial`).
3. Author `tests/sprint-05-orient-search/single-tutorial-gate.test.ts` (the
   real subprocess drill over owned os.tmpdir() copies) and capture the six
   evidence files; every AC then runs against the real build.
