# TASK-F4 AC-1 — alias verdict (measured, not assumed)

Measured against the TASK-F3 install fixture (`installed-consumer-tree`): apps/example after the
real RNR CLI run from the pinned v0.1.0 tag (transcript: `.tmp/TASK-F3/cycle-1/green/f3-install.log`,
"✔ Created 22 files"). Baseline captured at worktree HEAD `142a115`, before any file edit.

## Verdict: BRANCH A

The CLI already rewrites every emitted import specifier of the three-segment
`@/registry/{engine}/components/ai|components/ui|lib` shape into the consumer's own aliases. All
three shapes resolve inside the consumer tree. No source migration, no emitter change, and no
harness tsconfig change is needed; this task collapses to pinning the evidence and adding the
regression assertion, and re-sizes to 2 points per the task file.

## Raw counts — consumer side (apps/example, post-install, BEFORE cleanup)

Scanned set is non-vacuous: 17 `.tsx` files under `apps/example/components/` (5 components/ai,
12 components/ui) plus 6 files under `apps/example/lib/`.

```
components/ui: 1 -> 0   (after the one-line JSDoc revert below)
components/ai: 0
lib:           0
```

The single surviving occurrence: `apps/example/components/ui/icon.tsx` line 36, inside the JSDoc
`@example` block — `import { Icon } from '@/registry/uniwind/registry/components/ui/icon';`. It is
a comment, not an import: all five real import specifiers in that file are already consumer-form
(`@/components/ui/text`, `@/lib/utils`, `lucide-react-native`, `react`, `uniwind`). It cannot fail
Metro, tsc, or the boot; it only fails the literal grep contract. Provenance: `icon` is not in this
repo's `packages/registry/src` or `public/r` at all — the CLI fetched it transitively from
reactnativereusables.com, so the comment is RNR upstream content that this repo's emitter never
emits and cannot migrate. The CLI's rewrite covers import statements; it does not rewrite comment
text. The in-scope remedy is the revert of that one-line install side-effect in the consumer
(`apps/example/**` write-allowance), not an upstream edit that does not exist here.

## Raw counts — upstream baseline (packages/registry/src, BEFORE any edit)

The task authored "254 occurrences across 50 of 56 items"; the measured tree at `142a115` is:

```
$ grep -ro '@/registry/' packages/registry/src/ | wc -l   -> 252
$ grep -rlo '@/registry/' packages/registry/src/ | wc -l  -> 62  (of 82 files)
  components/ai  51 files
  components/ui  11 files
  lib             0 files   (registry:lib items are clean, as authored)
```

The authored numbers no longer match the tree (the registry grew since authoring); the measured
values above are the BEFORE baseline and are committed verbatim in
`.tmp/TASK-F4/cycle-1/red/baseline-scan.txt`.

## Consequences recorded

- No migration commit: `packages/registry/src/**`, the emitter, and both harness tsconfigs are
  untouched. The measure-first ordering invariant is satisfied vacuously (no source commit exists
  after this one that touches those paths).
- Regression assertion added at `tests/sprint-01/alias-resolution.test.ts`: zero `@/registry/`
  literals over a non-vacuous scan (>= 10 .tsx files), consumer-alias imports in message.tsx, and
  no consumer-side resolution shim (metro.config.js / tsconfig.json must not reference
  packages/registry). RED at `1 -> 0` boundary, GREEN after the JSDoc revert.
- Device boot re-verification is not re-run for this task: Branch A changed no installed import
  content (one comment line only), so the TASK-F3 boot evidence stands and TASK-F8 owns the final
  cold-boot gates.
