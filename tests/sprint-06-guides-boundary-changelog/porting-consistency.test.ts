/**
 * GBC-012 — porting consistency gates drill.
 *
 * Runs the REAL exported check prebuild.ts calls (runPortingConsistencyGates —
 * the same function the docs prebuild wires in) over $TMPDIR copies of the
 * real porting.md and boundary gaps array plus the tracked
 * packages/registry/registry.json, with no mocks. UNIT_TEST_JUSTIFIED per the
 * task contract: tier label is for proof binding only — these are real files
 * and real I/O; FLOW-DOCS-05's rendered proof and its one primary belong to
 * GBC-009's porting-map.spec.ts, and these planted-drift cases are this
 * task's own artifact.
 *
 * Four named selectors (one per drill AC), each RED-first:
 *   - GBC-012-unknown-slug-rejected      (AC-2) mapping item `chat-conversation`
 *                                             fails naming entry `conversation`
 *   - GBC-012-mapped-and-not-ported      (AC-3) `conversation` in both mapping
 *                                             and notPorted fails naming both lists;
 *                                             a gap naming shipped slug `conversation`
 *                                             fails naming the gap (TC-5)
 *   - GBC-012-untracked-upstream         (AC-4) `DrillOnlyElement` in neither list
 *                                             fails naming the element
 *   - GBC-012-healthy-content-passes     (control) the real files pass with the
 *                                             check running — the false-fire guard
 *
 * Mutations live only in $TMPDIR copies: the real content files and the
 * registry are never touched (asserted by the clean-tree requirement —
 * `git status --porcelain apps/docs/src/content packages/registry` prints
 * nothing after the drill).
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, expect, test } from 'vitest';
import { runPortingConsistencyGates } from '../../scripts/docs-data/porting-consistency';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const REAL_PORTING = join(ROOT, 'apps/docs/src/content/docs/porting.md');
const REAL_GAPS = join(ROOT, 'apps/docs/src/content/docs/owns-vs-does-not-own.mdx');
const REAL_REGISTRY = join(ROOT, 'packages/registry/registry.json');
const REAL_FILES = { portingPath: REAL_PORTING, gapsPath: REAL_GAPS, registryPath: REAL_REGISTRY };

/** $TMPDIR dirs created this file's run, removed after each test. */
const tmpDirs: string[] = [];

/** A mutated $TMPDIR copy of the real porting.md; the mutation MUST apply. */
function portingCopy(mutate: (raw: string) => string): string {
  const raw = readFileSync(REAL_PORTING, 'utf8');
  const mutated = mutate(raw);
  expect(mutated).not.toBe(raw);
  const dir = mkdtempSync(join(tmpdir(), 'gbc-012-porting-'));
  tmpDirs.push(dir);
  const path = join(dir, 'porting.md');
  writeFileSync(path, mutated);
  return path;
}

/** A mutated $TMPDIR copy of the real boundary frontmatter; the mutation MUST apply. */
function gapsCopy(mutate: (raw: string) => string): string {
  const raw = readFileSync(REAL_GAPS, 'utf8');
  const mutated = mutate(raw);
  expect(mutated).not.toBe(raw);
  const dir = mkdtempSync(join(tmpdir(), 'gbc-012-gaps-'));
  tmpDirs.push(dir);
  const path = join(dir, 'owns-vs-does-not-own.mdx');
  writeFileSync(path, mutated);
  return path;
}

/** Runs the real exported check over the given files; returns the thrown message. */
function gateMessage(files: {
  portingPath: string;
  gapsPath: string;
  registryPath: string;
}): string {
  try {
    runPortingConsistencyGates(files);
  } catch (err) {
    return err instanceof Error ? err.message : String(err);
  }
  return '';
}

afterEach(() => {
  while (tmpDirs.length > 0) {
    rmSync(tmpDirs.pop() as string, { recursive: true, force: true });
  }
});

test('GBC-012-unknown-slug-rejected', () => {
  // The `conversation` mapping entry ({ upstream: conversation, item: conversation })
  // gets its item rewritten to a slug absent from registry.json.
  const copy = portingCopy((raw) =>
    raw.replace(
      'upstream: conversation\n    item: conversation',
      'upstream: conversation\n    item: chat-conversation',
    ),
  );

  const message = gateMessage({ ...REAL_FILES, portingPath: copy });
  expect(message).not.toBe('');
  expect(message).toContain('chat-conversation');
  // The offending mapping entry is named exactly as its `upstream` key appears
  // in the frontmatter (lowercase kebab) — `"conversation"` with quotes cannot
  // false-match inside `"chat-conversation"`.
  expect(message).toContain('"conversation"');
  expect(message).toMatch(/mapping/);

  // Control: the unmodified real files pass.
  expect(() => runPortingConsistencyGates(REAL_FILES)).not.toThrow();
});

test('GBC-012-mapped-and-not-ported-rejected', () => {
  // Case 1 (TC-3): `conversation` keeps its mapping entry and is also appended
  // to notPorted — fails naming the element and BOTH lists.
  const copy = portingCopy((raw) =>
    raw.replace('notPorted:\n  - canvas', 'notPorted:\n  - conversation\n  - canvas'),
  );
  const message = gateMessage({ ...REAL_FILES, portingPath: copy });
  expect(message).not.toBe('');
  expect(message).toContain('conversation');
  expect(message).toMatch(/mapping/);
  expect(message).toMatch(/notPorted/);

  // Case 2 (TC-5): the boundary `gaps` array gains `conversation`, one of the
  // 56 shipped slugs — fails naming the gap and stating it ships.
  const gaps = gapsCopy((raw) =>
    raw.replace('gaps:\n  - Transcript state', 'gaps:\n  - conversation\n  - Transcript state'),
  );
  const gapMessage = gateMessage({ ...REAL_FILES, gapsPath: gaps });
  expect(gapMessage).not.toBe('');
  expect(gapMessage).toContain('"conversation"');
  expect(gapMessage).toMatch(/56 shipped/);

  // Control: the unmodified real files pass.
  expect(() => runPortingConsistencyGates(REAL_FILES)).not.toThrow();
});

test('GBC-012-untracked-upstream-rejected', () => {
  // `DrillOnlyElement` joins `upstream` only — tracked in neither mapping nor
  // notPorted, so the complement is broken and the element must be named.
  const copy = portingCopy((raw) =>
    raw.replace('upstream:\n  - agent', 'upstream:\n  - DrillOnlyElement\n  - agent'),
  );
  const message = gateMessage({ ...REAL_FILES, portingPath: copy });
  expect(message).not.toBe('');
  expect(message).toContain('DrillOnlyElement');

  // Control: the unmodified real files pass.
  expect(() => runPortingConsistencyGates(REAL_FILES)).not.toThrow();
});

test('GBC-012-healthy-content-passes', () => {
  // The tracked registry really is the 56-item source (never the gitignored
  // registry-items.json), and the real porting.md + gaps array pass the check.
  const registry = JSON.parse(readFileSync(REAL_REGISTRY, 'utf8')) as {
    items: { name: string }[];
  };
  const names = registry.items.map((item) => item.name);
  expect(names).toHaveLength(56);

  expect(() => runPortingConsistencyGates(REAL_FILES)).not.toThrow();

  // The ledger shape the gates read: 40 mapped + 9 not-ported = 49 upstream,
  // per the landed GBC-004 source.
  const raw = readFileSync(REAL_PORTING, 'utf8');
  expect(raw.match(/^ {2}- upstream: /gm)).toHaveLength(40);
  const notPortedBlock = raw.slice(raw.indexOf('notPorted:'), raw.indexOf('\n---'));
  expect(notPortedBlock.match(/^ {2}- /gm)).toHaveLength(9);
});
