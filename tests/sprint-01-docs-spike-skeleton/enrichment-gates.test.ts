import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  deriveKindFamilies,
  type EnrichedItem,
  EXPECTED_ITEM_COUNT,
  type Expectation,
  formatViolation,
  GateError,
  gateImagery,
  gateMatrix,
  loadDefaultDataset,
  runAllGates,
} from '../../scripts/docs-data/gates';
import { createDocsProject, extractProps, loadRegistryItems } from '../../scripts/docs-data/props';
import { buildThemingNotes } from '../../scripts/docs-data/theming-note';
import { extractUsageSnippets } from '../../scripts/docs-data/usage-snippet';

/**
 * FUSE-03 lane gate (FLOW-DELIV-01-fail-closed-item-count): the three
 * enrichment modules run over ALL 56 real registry items — real ts-morph over
 * the real packages/registry/src sources, real AST ranges over the real cells
 * batch files, real filesystem reads for theming — and the broken-type fixture
 * drill proves the fail-closed error path end to end (throw + exit 1) via a
 * real subprocess of the module CLI.
 */
const ROOT = process.cwd();

type Item = { name: string; type: string; files: { path: string }[] };

/**
 * CANONICAL semantic-class regex — token alternation longest-first so
 * compounds (muted-foreground) never capture truncated at their prefix
 * (muted). Must match theming-note.ts's TOKEN_CLASS ordering.
 */
const SEMANTIC_CLASS =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|caret|accent)-(?:card-foreground|popover-foreground|primary-foreground|secondary-foreground|muted-foreground|accent-foreground|destructive-foreground|background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)\b/g;

/** Truncation oracle: the named class must appear NOT followed by another token character. */
function appearsWhole(source: string, cls: string): boolean {
  const escaped = cls.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  return new RegExp(`${escaped}(?![\\w-])`).test(source);
}

const BROKEN_FIXTURE = [
  'type BrokenCardProps = {',
  '  title: string;',
  '  tone: NonexistentFlavorTone;',
  '};',
  '',
  'export function BrokenCard(_props: BrokenCardProps) {',
  '  return null;',
  '}',
  '',
].join('\n');

describe('enrichment gates', () => {
  it('FLOW-DELIV-01-fail-closed-item-count', { timeout: 300_000 }, () => {
    const items = JSON.parse(
      readFileSync(join(ROOT, 'packages/registry/registry.json'), 'utf8'),
    ) as { items: Item[] };
    const all = items.items;
    expect(all).toHaveLength(56);
    const components = all.filter((i) => i.type === 'registry:component');
    expect(components).toHaveLength(39);

    // AC-1 case 1: props over the real registry — 0 throws, pinned names,
    // full untruncated type text, null for the 17 ui/lib items.
    const props = extractProps(all);
    for (const item of components) {
      expect(Array.isArray(props[item.name]), `${item.name} props`).toBe(true);
      for (const prop of props[item.name] ?? []) {
        expect(prop.type.includes('…'), `${item.name}.${prop.name} ellipsis`).toBe(false);
        expect(prop.type === 'any', `${item.name}.${prop.name} silent any`).toBe(false);
      }
    }
    expect((props.conversation ?? []).some((p) => p.name === 'data')).toBe(true);
    expect((props['prompt-input'] ?? []).some((p) => p.name === 'onSubmit')).toBe(true);
    for (const item of all.filter((i) => i.type !== 'registry:component')) {
      expect(props[item.name], `${item.name} (${item.type})`).toBeNull();
    }

    // AC-2 case 1: 56 verbatim snippets, each a byte-substring of a real batch file.
    const snippets = extractUsageSnippets();
    expect(Object.keys(snippets)).toHaveLength(56);
    const batchTexts = ['ai-chat', 'ai-agent', 'ai-code', 'ui', 'lib'].map((b) =>
      readFileSync(join(ROOT, `apps/example/gallery/cells/${b}.tsx`), 'utf8'),
    );
    for (const [name, snippet] of Object.entries(snippets)) {
      expect(snippet.length > 0, `${name} empty snippet`).toBe(true);
      expect(
        batchTexts.some((src) => src.includes(snippet)),
        `${name} snippet absent from every batch file`,
      ).toBe(true);
    }
    expect(snippets.conversation.includes('Conversation')).toBe(true);
    expect(
      readFileSync(join(ROOT, 'apps/example/gallery/cells/ai-chat.tsx'), 'utf8').includes(
        snippets.conversation,
      ),
    ).toBe(true);

    // AC-3 case 1: 56 non-empty deterministic notes; every named class appears
    // WHOLE in the item's real source (truncation guard); shimmer pinned.
    const notesRun1 = buildThemingNotes(all);
    const notesRun2 = buildThemingNotes(all);
    expect(Object.keys(notesRun1)).toHaveLength(56);
    for (const item of all) {
      expect(notesRun1[item.name].length > 0, `${item.name} note empty`).toBe(true);
      expect(notesRun1[item.name]).toBe(notesRun2[item.name]);
      const combined = item.files.map((f) => readFileSync(join(ROOT, f.path), 'utf8')).join('\n');
      const named = [...notesRun1[item.name].matchAll(SEMANTIC_CLASS)].map((m) => m[0]);
      for (const cls of named) {
        expect(
          appearsWhole(combined, cls),
          `${item.name}: note names "${cls}" which is absent/truncated in source`,
        ).toBe(true);
      }
    }
    const shimmerSource = readFileSync(
      join(ROOT, 'packages/registry/src/components/ai/shimmer.tsx'),
      'utf8',
    );
    const shimmerClasses = [...notesRun1.shimmer.matchAll(SEMANTIC_CLASS)].map((m) => m[0]);
    expect(shimmerClasses).toContain('text-muted-foreground');
    expect(notesRun1.shimmer).toBe('Themed via text-muted-foreground.');
    for (const cls of shimmerClasses) {
      expect(appearsWhole(shimmerSource, cls), `shimmer note names absent class ${cls}`).toBe(true);
    }

    // AC-1 case 2: the broken-type fixture drill, as a real module subprocess.
    const dir = mkdtempSync(join(tmpdir(), 'fuse03-gate-broken-'));
    const fixture = join(dir, 'broken-card.tsx');
    writeFileSync(fixture, BROKEN_FIXTURE);
    const proc = spawnSync(
      join(ROOT, 'node_modules/.bin/tsx'),
      [join(ROOT, 'scripts/docs-data/props.ts'), '--file', fixture, '--name', 'broken-card'],
      { encoding: 'utf8' },
    );
    rmSync(dir, { recursive: true, force: true });
    expect(proc.error).toBeUndefined();
    expect(proc.status, `props.ts CLI should exit non-zero, stdout: ${proc.stdout}`).not.toBe(0);
    expect(proc.status).not.toBeNull();
    expect(proc.stderr.startsWith('[docs-data] props:'), `stderr: ${proc.stderr}`).toBe(true);
    expect(proc.stderr).toMatch(
      /\[docs-data\] props: item "broken-card" prop "tone" has unresolved type/,
    );
  });

  /**
   * FUSE-04 AC-1: the count drill as a real child process. The drill deletes
   * item "shimmer" from the real packages/registry/registry.json, rebuilds
   * public/r via real `pnpm registry:build`, runs the gate CLI (expectation
   * captured from the CLEAN pre-mutation tree), then byte-exact-restores and
   * rebuilds in a finally — reporting both runs' real exit codes as JSON.
   */
  it('FLOW-DELIV-01-fail-closed-item-count: drill — 55-vs-56 fails naming shimmer, restore exits 0', {
    timeout: 300_000,
  }, () => {
    const preBytes = readFileSync(join(ROOT, 'packages/registry/registry.json'));
    const proc = spawnSync(
      join(ROOT, 'node_modules/.bin/tsx'),
      [join(ROOT, 'scripts/docs-data/drill-item-count.ts')],
      { encoding: 'utf8', cwd: ROOT },
    );
    expect(proc.error).toBeUndefined();
    expect(proc.status, `drill stdout: ${proc.stdout}\ndrill stderr: ${proc.stderr}`).toBe(0);

    const report = JSON.parse(proc.stdout) as {
      mutated: { exitCode: number; stdout: string; stderr: string };
      restored: { exitCode: number; stdout: string; stderr: string };
      registryBuilds: { mutated: number; restored: number };
      publicR: { pre: number; postMutation: number; postRestore: number };
      registryJson: { bytesIdentical: boolean; preSha256: string; postSha256: string };
      expectationsHeld: boolean;
    };
    expect(report.expectationsHeld).toBe(true);

    // Case 1: mutated run exits 1 naming shimmer, observed 55 versus 56.
    expect(report.mutated.exitCode).toBe(1);
    const mutatedOut = `${report.mutated.stdout}\n${report.mutated.stderr}`;
    expect(mutatedOut).toContain('shimmer');
    expect(mutatedOut).toMatch(
      /\[docs-data\] count: item "shimmer" missing; observed 55 versus 56/,
    );

    // Restore: gate exits 0, registry.json byte-identical, public/r re-fanned.
    expect(
      report.restored.exitCode,
      `restored stdout: ${report.restored.stdout}\nrestored stderr: ${report.restored.stderr}`,
    ).toBe(0);
    expect(report.restored.stdout).toContain(`${EXPECTED_ITEM_COUNT} of ${EXPECTED_ITEM_COUNT}`);
    expect(report.registryJson.bytesIdentical).toBe(true);
    expect(report.registryJson.preSha256).toBe(report.registryJson.postSha256);
    expect(readFileSync(join(ROOT, 'packages/registry/registry.json'))).toEqual(preBytes);
    expect(report.registryBuilds.mutated).toBe(0);
    expect(report.registryBuilds.restored).toBe(0);
    expect(report.publicR.postMutation).toBe(112);
    expect(report.publicR.postRestore).toBe(114);
    expect(report.publicR.postRestore).toBe(report.publicR.pre);

    // No leftover mutation in the paths the drill touched. (apps/docs is
    // deliberately excluded: a parallel scaffold-build worker can leave an
    // untracked .astro/ cache that is not this drill's doing.)
    const git = spawnSync('git', ['status', '--porcelain', 'packages/registry', 'public/r'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    expect(git.status).toBe(0);
    expect(git.stdout, `leftover mutation:\n${git.stdout}`).toBe('');

    // Case 2: the gate CLI directly over the clean real tree, expectation
    // captured from the clean registry — exit 0, 56 of 56 names match.
    const items = loadRegistryItems();
    const dir = mkdtempSync(join(tmpdir(), 'fuse04-clean-expectation-'));
    try {
      const expectationPath = join(dir, 'expectation.json');
      writeFileSync(
        expectationPath,
        JSON.stringify({
          expectedNames: items.map((i) => i.name),
          families: deriveKindFamilies(items),
        }),
      );
      const clean = spawnSync(
        join(ROOT, 'node_modules/.bin/tsx'),
        [join(ROOT, 'scripts/docs-data/gates.ts'), '--expectation', expectationPath],
        { encoding: 'utf8', cwd: ROOT },
      );
      expect(clean.error).toBeUndefined();
      expect(clean.status, `stdout: ${clean.stdout}\nstderr: ${clean.stderr}`).toBe(0);
      expect(clean.stdout).toContain(
        `${EXPECTED_ITEM_COUNT} of ${EXPECTED_ITEM_COUNT} names match`,
      );
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /**
   * FUSE-04 AC-2 (T-DELIV-002): field-level fail-closed gates over real temp
   * fixtures — empty file, unresolved props type via the real FUSE-03
   * extractor, a family map that double-assigns one item and omits another,
   * and an entry missing its expoGo verdict. The aggregate GateError must list
   * EVERY violation, each naming the item; the clean real 56-item dataset
   * passes all five gates.
   */
  it('field gates fail closed naming the item', { timeout: 120_000 }, () => {
    const dir = mkdtempSync(join(tmpdir(), 'fuse04-field-fixtures-'));
    const emptyFile = join(dir, 'empty.ts');
    const brokenFile = join(dir, 'broken-card.tsx');
    const plainFile = join(dir, 'plain-thing.tsx');
    writeFileSync(emptyFile, '');
    writeFileSync(brokenFile, BROKEN_FIXTURE);
    writeFileSync(plainFile, 'export function PlainThing() {\n  return null;\n}\n');
    try {
      const dataset: EnrichedItem[] = [
        { name: 'files-item', type: 'registry:component', files: [{ path: emptyFile }] },
        { name: 'broken-card', type: 'registry:component', files: [{ path: brokenFile }] },
        {
          name: 'plain-thing',
          type: 'registry:component',
          files: [{ path: plainFile }],
          expoGo: true,
        },
        { name: 'verdict-item', type: 'registry:ui', files: [{ path: plainFile }] },
      ];
      const expectation: Expectation = {
        expectedNames: dataset.map((i) => i.name),
        families: {
          'fam-main': ['files-item', 'broken-card', 'plain-thing'],
          'fam-dupe': ['plain-thing'],
        },
      };
      const project = createDocsProject();
      let err: unknown;
      try {
        runAllGates(dataset, expectation, project);
      } catch (e) {
        err = e;
      }
      expect(err, 'runAllGates must throw on violations').toBeInstanceOf(GateError);
      const aggregate = err as GateError;

      expect(aggregate.message).toContain(
        `[docs-data] files: item "files-item" references missing/empty file ${emptyFile}`,
      );
      expect(aggregate.message).toContain(
        '[docs-data] props: item "broken-card" prop "tone" has unresolved type',
      );
      expect(aggregate.message).toContain(
        '[docs-data] family: item "plain-thing" assigned to 2 families',
      );
      expect(aggregate.message).toContain(
        '[docs-data] family: item "verdict-item" not covered by any family',
      );
      expect(aggregate.message).toContain(
        '[docs-data] verdict: item "verdict-item" missing expoGo verdict',
      );
      // Aggregate-all, not first-throw: at least the five field violations above.
      expect(aggregate.violations.length).toBeGreaterThanOrEqual(5);
      // Empty-resolved props ([]) is legal — plain-thing extracts to [] and
      // must raise NO props violation.
      expect(aggregate.message).not.toContain('props: item "plain-thing"');

      // Case 2: the clean real 56-item dataset passes all five gates, with
      // props resolved via the real extractor for the 39 component items.
      const realItems = loadRegistryItems();
      const cleanDataset = loadDefaultDataset();
      expect(cleanDataset).toHaveLength(56);
      expect(realItems.filter((i) => i.type === 'registry:component')).toHaveLength(39);
      expect(() =>
        runAllGates(
          cleanDataset,
          {
            expectedNames: realItems.map((i) => i.name),
            families: deriveKindFamilies(realItems),
          },
          project,
        ),
      ).not.toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  /** FUSE-04 AC-3: the pinned '[docs-data] <gate>: item "<name>" ...' shape. */
  it('formats gate errors', () => {
    expect(
      formatViolation({
        gate: 'count',
        item: 'shimmer',
        detail: 'missing',
        observed: 55,
        expected: 56,
      }),
    ).toBe('[docs-data] count: item "shimmer" missing; observed 55 versus 56');
    expect(
      formatViolation({
        gate: 'files',
        item: 'button',
        detail: 'references missing/empty file packages/registry/src/x.tsx',
      }),
    ).toBe(
      '[docs-data] files: item "button" references missing/empty file packages/registry/src/x.tsx',
    );
    expect(
      formatViolation({
        gate: 'props',
        item: 'broken-card',
        detail: 'prop "tone" has unresolved type',
      }),
    ).toBe('[docs-data] props: item "broken-card" prop "tone" has unresolved type');
    expect(
      formatViolation({
        gate: 'family',
        item: 'verdict-item',
        detail: 'not covered by any family',
      }),
    ).toBe('[docs-data] family: item "verdict-item" not covered by any family');
    expect(
      formatViolation({ gate: 'verdict', item: 'shimmer', detail: 'missing expoGo verdict' }),
    ).toBe('[docs-data] verdict: item "shimmer" missing expoGo verdict');
  });
});

/**
 * REF-008: the matrix shape gate over REF-007's committed dev-client matrix
 * and the flag-gated imagery gate pair (T-GEND-022). Same build-lock
 * discipline as docs-data-prebuild.test.ts (duplicated on purpose — no
 * shared helper module inside SCOPE.writeAllowed) because the matrix case
 * runs the real prebuild, whose wired gates must exit 0.
 */
describe('REF-008 matrix + imagery gates', () => {
  const MATRIX_JSON = join(ROOT, 'apps/docs/src/data/dev-client-matrix.json');
  const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');

  // Duplicated from docs-data-prebuild.test.ts on purpose: no shared helper
  // module may be created inside SCOPE.writeAllowed, and the lock keeps this
  // lane's prebuild from racing the FUSE-01/05 lane's chains on dist/ and
  // public/r when vitest runs files in parallel workers.
  const lockDir = join(ROOT, 'node_modules/.cache/FUSE-01-docs-build.lock');
  const LOCK_TIMEOUT_MS = 15 * 60_000;

  function acquireBuildLock(): void {
    mkdirSync(join(ROOT, 'node_modules/.cache'), { recursive: true });
    const startedAt = Date.now();
    for (;;) {
      try {
        mkdirSync(lockDir);
        return;
      } catch {
        if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
          throw new Error(`timed out waiting for docs build lock at ${lockDir}`);
        }
        try {
          if (Date.now() - statSync(lockDir).mtimeMs > LOCK_TIMEOUT_MS) {
            rmSync(lockDir, { recursive: true, force: true });
          }
        } catch {
          // Lock vanished between mkdir and stat — retry the acquire.
        }
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
      }
    }
  }

  function cleanExpectation(): Expectation {
    const items = loadRegistryItems();
    return {
      expectedNames: items.map((i) => i.name),
      families: deriveKindFamilies(items),
    };
  }

  type MatrixRow = {
    id: string;
    peers: unknown[];
    permissions: { ios?: string[]; android?: string[] } | null;
  };

  it('REF-008-matrix-gate: committed 4-entry dataset passes; renamed-entry drill fails closed and restores byte-exact', {
    timeout: 300_000,
  }, () => {
    // Clean case: 0 matrix violations over the real committed dataset — the
    // expected names are the PIN, never derived from the file under test.
    // (The matrix entries are consumer-opt-in capability names, not docs
    // registry item names, so no registry-item join here: AC-3 pins 0
    // violations over the committed four as the false-positive guard.)
    const dataset = loadDefaultDataset();
    const expectation = cleanExpectation();
    const project = createDocsProject();
    expect(gateMatrix(), 'matrix violations over the committed dataset').toEqual([]);

    const matrix = JSON.parse(readFileSync(MATRIX_JSON, 'utf8')) as MatrixRow[];
    expect(matrix, 'the committed dev-client matrix pins exactly 4 entries').toHaveLength(4);
    expect(matrix.map((e) => e.id).sort(), 'the pinned four dev-client matrix entries').toEqual([
      'enriched-markdown',
      'extended-audio',
      'speech-recognition',
      'streamdown',
    ]);
    for (const entry of matrix) {
      expect(entry.peers.length, `${entry.id}.peers non-empty`).toBeGreaterThan(0);
      expect(
        entry.permissions?.ios?.length,
        `${entry.id}.permissions.ios non-empty`,
      ).toBeGreaterThan(0);
      expect(
        entry.permissions?.android?.length,
        `${entry.id}.permissions.android non-empty`,
      ).toBeGreaterThan(0);
    }

    // Wiring: the clean real tree passes the WHOLE aggregate with the flag off.
    delete process.env.DOCS_GATE_IMAGERY;
    expect(() => runAllGates(dataset, expectation, project)).not.toThrow();

    // The real prebuild — matrix + imagery gates now wired into it — exits 0.
    acquireBuildLock();
    let prebuild: ReturnType<typeof spawnSync>;
    try {
      prebuild = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'prebuild'], {
        encoding: 'utf8',
        cwd: ROOT,
      });
    } finally {
      rmSync(lockDir, { recursive: true, force: true });
    }
    expect(prebuild.error).toBeUndefined();
    expect(prebuild.status, `prebuild failed\n${prebuild.stdout}\n${prebuild.stderr}`).toBe(0);

    // Drill: rename 'speech-recognition' -> 'speech-recognition-x' on disk
    // (count still 4) — the gate must fail closed naming it, and the file
    // must restore byte-exact in the finally (shimmer-drill precedent).
    const preBytes = readFileSync(MATRIX_JSON);
    const preSha = sha256(preBytes);
    let err: unknown;
    try {
      const mutated = JSON.parse(preBytes.toString('utf8')) as MatrixRow[];
      const renamed = mutated.find((e) => e.id === 'speech-recognition');
      expect(renamed, 'speech-recognition present pre-mutation').toBeDefined();
      if (renamed) renamed.id = 'speech-recognition-x';
      writeFileSync(MATRIX_JSON, `${JSON.stringify(mutated, null, 2)}\n`);
      try {
        runAllGates(loadDefaultDataset(), cleanExpectation(), project);
      } catch (e) {
        err = e;
      }
    } finally {
      writeFileSync(MATRIX_JSON, preBytes);
    }
    expect(err, 'the mutated tree must fail the gates').toBeInstanceOf(GateError);
    const gateError = err as GateError;
    const matrixViolations = gateError.violations.filter((v) => v.gate === 'matrix');
    expect(matrixViolations, 'exactly one matrix violation for the renamed entry').toHaveLength(1);
    expect(matrixViolations[0]?.item).toBe('speech-recognition-x');
    expect(gateError.message).toMatch(/\[docs-data\] matrix: item "speech-recognition-x"/);
    expect(
      sha256(readFileSync(MATRIX_JSON)),
      'dev-client-matrix.json must restore byte-exact',
    ).toBe(preSha);
  });

  it('REF-008-imagery-flag: unset flag holds 0 imagery violations; DOCS_GATE_IMAGERY=1 fails closed naming items', {
    timeout: 120_000,
  }, () => {
    const dataset = loadDefaultDataset();
    expect(dataset).toHaveLength(56);
    const expectation = cleanExpectation();
    const project = createDocsProject();
    const hadFlag = process.env.DOCS_GATE_IMAGERY;
    const dir = mkdtempSync(join(tmpdir(), 'ref008-clean-expectation-'));
    try {
      const expectationPath = join(dir, 'expectation.json');
      writeFileSync(expectationPath, JSON.stringify(cleanExpectation()));

      // Flag OFF: the gate is inert over the all-null-imagery dataset; the
      // clean real tree passes the whole aggregate (default-build parity).
      expect(gateImagery(dataset), 'imagery violations with the flag unset').toEqual([]);
      expect(() => runAllGates(dataset, expectation, project)).not.toThrow();

      // The gates CLI success line names all six always-on gates — extend
      // never delete — asserted through the real CLI subprocess.
      const clean = spawnSync(
        join(ROOT, 'node_modules/.bin/tsx'),
        [join(ROOT, 'scripts/docs-data/gates.ts'), '--expectation', expectationPath],
        { encoding: 'utf8', cwd: ROOT },
      );
      expect(clean.error).toBeUndefined();
      expect(clean.status, `stdout: ${clean.stdout}\nstderr: ${clean.stderr}`).toBe(0);
      expect(clean.stdout).toContain('count, files, props, family, verdict, matrix gates pass');

      // Flag ON: every null-imagery item is one violation naming it — 56/56
      // over the real dataset — and the aggregate fails closed.
      process.env.DOCS_GATE_IMAGERY = '1';
      const violations = gateImagery(dataset);
      expect(violations, 'one imagery violation per null-imagery item').toHaveLength(56);
      expect(violations[0]?.item, 'the first offending item is a real dataset name').toBe(
        dataset[0]?.name,
      );
      let err: unknown;
      try {
        runAllGates(dataset, expectation, project);
      } catch (e) {
        err = e;
      }
      expect(err, 'the flag-on run must fail closed').toBeInstanceOf(GateError);
      const gateError = err as GateError;
      expect(gateError.violations.filter((v) => v.gate === 'imagery')).toHaveLength(56);
      expect(gateError.message).toMatch(/\[docs-data\] imagery: item "[a-z0-9-]+" missing imagery/);
      expect(gateError.message).toContain(
        `[docs-data] imagery: item "${dataset[0]?.name}" missing imagery`,
      );

      // The real CLI under the flag exits non-zero naming the item.
      const flagged = spawnSync(
        join(ROOT, 'node_modules/.bin/tsx'),
        [join(ROOT, 'scripts/docs-data/gates.ts'), '--expectation', expectationPath],
        { encoding: 'utf8', cwd: ROOT },
      );
      expect(flagged.status, `flag-on CLI must exit non-zero\n${flagged.stdout}`).not.toBe(0);
      expect(flagged.stderr).toMatch(/\[docs-data\] imagery: item "[a-z0-9-]+" missing imagery/);
    } finally {
      if (hadFlag === undefined) delete process.env.DOCS_GATE_IMAGERY;
      else process.env.DOCS_GATE_IMAGERY = hadFlag;
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
