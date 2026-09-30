/**
 * GBC-011 — the five-page launch cap gate (T-DOCS-014 mirror).
 *
 * Real behavior only: every assertion spawns the PRODUCTION docs build
 * (`pnpm --filter @rnr-ai-elements/docs build` — the same ordered chain CI
 * runs: registry:build, gallery:manifest, prebuild, check:snippets, astro
 * build, search:index, check:links) over the real apps/docs content tree.
 * Drill mutations are transient fixtures under
 * apps/docs/src/content/docs/guides/ — the sixth guide is deleted and the
 * moved guide restored in finally blocks, and each case asserts
 * `git status --porcelain apps/docs/src/content/docs/guides` prints nothing.
 * No mocks, no canned output.
 *
 * UNIT_TEST_JUSTIFIED (task contract): tier label for proof binding only —
 * the file spawns the real docs build with no mocks; FLOW-DOCS-03's rendered
 * proof and its one primary belong to GBC-010's guides-index.spec.ts.
 * This file never asserts on /guides itself.
 *
 * Named selectors:
 *   - GBC-011-five-guides-cap-satisfied (AC-2 / TC-2) the real five-guide
 *     tree builds exit 0, stdout carries the computed
 *     `[docs-data] guides: 5 guides — cap satisfied` line, and exactly 5
 *     guide pages are emitted under apps/docs/dist/guides/.
 *   - GBC-011-sixth-guide-rejected (AC-1 / TC-1, TC-3, TC-4) a sixth
 *     guides/migrating-from-v0.md fails the full build naming the file and
 *     the five-page launch cap; `astro build` alone over the same tree also
 *     fails the same way (the check lives in the /guides/[slug]
 *     getStaticPaths, not only prebuild); a four-guide tree fails naming
 *     the count 4.
 */
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, test } from 'vitest';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const GUIDES_DIR_REL = 'apps/docs/src/content/docs/guides';
const GUIDES_DIR = join(REPO_ROOT, GUIDES_DIR_REL);
const DIST_GUIDES_DIR = join(REPO_ROOT, 'apps', 'docs', 'dist', 'guides');
const SIXTH_GUIDE = join(GUIDES_DIR, 'migrating-from-v0.md');
const MOVED_GUIDE_NAME = 'preview-on-device.md';
const MOVED_GUIDE = join(GUIDES_DIR, MOVED_GUIDE_NAME);

/** The five launch guides the tree must hold before any drill (pinned names). */
const FIVE_GUIDE_FILES = [
  'customize-rendering.md',
  'preview-on-device.md',
  're-theme.md',
  'troubleshooting.md',
  'update-installed-items.md',
] as const;

/** The exact guide pages the cap-satisfied build must emit under dist/guides/. */
const FIVE_GUIDE_SLUGS = [
  'customize-rendering',
  'preview-on-device',
  're-theme',
  'troubleshooting',
  'update-installed-items',
] as const;

/** The drill-written sixth guide: valid frontmatter, guides section, order 6. */
const SIXTH_GUIDE_MD = `---
title: 'Migrating from v0'
description: 'Drill fixture for the five-page launch cap gate; never published.'
section: 'guides'
order: 6
---

This fixture exists only to prove the cap gate rejects a sixth guides-section entry.
`;

type Run = { exit: number; stdout: string; stderr: string };

function spawn(cmd: string, args: string[], cwd = REPO_ROOT, timeout = 420_000): Run {
  const proc = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    timeout,
    maxBuffer: 64 * 1024 * 1024,
  });
  return { exit: proc.status ?? -1, stdout: proc.stdout ?? '', stderr: proc.stderr ?? '' };
}

function gitStatusGuides(): string {
  return spawn('/usr/bin/git', ['status', '--porcelain', '--', GUIDES_DIR_REL]).stdout;
}

/** Fresh content sync so no stale collection cache bleeds across runs. */
function clearContentCache(): void {
  rmSync(join(REPO_ROOT, 'apps', 'docs', 'node_modules', '.astro'), {
    recursive: true,
    force: true,
  });
}

/** The full production docs build: the ordered chain into apps/docs/dist. */
function buildSite(): Run {
  const registry = spawn('pnpm', ['-w', 'run', 'registry:build']);
  expect(registry.exit, `registry:build exits 0: ${registry.stderr}`).toBe(0);
  const manifest = spawn('pnpm', ['-w', 'run', 'gallery:manifest']);
  expect(manifest.exit, `gallery:manifest exits 0: ${manifest.stderr}`).toBe(0);
  clearContentCache();
  return spawn('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build']);
}

/** `astro build` alone (no prebuild) — proves the gate lives in getStaticPaths. */
function astroBuildAlone(): Run {
  clearContentCache();
  return spawn('pnpm', ['--filter', '@rnr-ai-elements/docs', 'exec', 'astro', 'build']);
}

/** The guides-section source files currently in the content tree. */
function guideFileNames(): string[] {
  return readdirSync(GUIDES_DIR)
    .filter((name) => name.endsWith('.md') || name.endsWith('.mdx'))
    .sort();
}

/** Guide pages actually emitted under dist/guides/ (subdirs holding index.html). */
function emittedGuideSlugs(): string[] {
  return readdirSync(DIST_GUIDES_DIR, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && existsSync(join(DIST_GUIDES_DIR, entry.name, 'index.html')),
    )
    .map((entry) => entry.name)
    .sort();
}

let greenRun: Run;

beforeAll(() => {
  // Fixture gate: the tree must hold EXACTLY the five launch guides and be
  // clean before any drill mutates it.
  expect(guideFileNames(), 'the guides dir holds exactly the five launch guides').toEqual([
    ...FIVE_GUIDE_FILES,
  ]);
  expect(gitStatusGuides(), 'guides dir is clean before the drill').toBe('');
  greenRun = buildSite();
}, 600_000);

afterAll(() => {
  // Defensive sweep: the drills must never leave a fixture behind.
  rmSync(SIXTH_GUIDE, { force: true });
}, 60_000);

// AC-2 / TC-2: the five-guide set passes with the computed cap-satisfied line.
test('GBC-011-five-guides-cap-satisfied', () => {
  expect(
    greenRun.exit,
    `build exits 0 over the five-guide tree:\n${greenRun.stdout}\n${greenRun.stderr}`,
  ).toBe(0);

  // The success line is COMPUTED from the counted entries — present, exact,
  // and never at any other count.
  const counts = [
    ...greenRun.stdout.matchAll(/\[docs-data\] guides: (\d+) guides — cap satisfied/g),
  ];
  expect(counts.length, 'the cap-satisfied line is printed').toBeGreaterThanOrEqual(1);
  for (const [, count] of counts) {
    expect(count, 'the guides line carries the count 5').toBe('5');
  }
  expect(greenRun.stdout).toContain('[docs-data] guides: 5 guides — cap satisfied');

  // No cap-violation message anywhere in a healthy build.
  expect(greenRun.stdout + greenRun.stderr, 'no cap violation message').not.toContain(
    'five-page launch cap',
  );

  // Exactly the five guide pages are emitted (the /guides index count is
  // GBC-010/AC-1's proof — asserted nowhere here).
  expect(emittedGuideSlugs(), 'dist/guides emits exactly the five guide pages').toEqual([
    ...FIVE_GUIDE_SLUGS,
  ]);
});

// AC-1 / TC-1, TC-3, TC-4: overflow and shortfall both fail the build.
// Three sequential real-build drills — the setup IS the test, not branching
// logic to factor.
// fallow-ignore-next-line complexity
test('GBC-011-sixth-guide-rejected', { timeout: 900_000 }, () => {
  // TC-1: a sixth guide fails the FULL production chain.
  writeFileSync(SIXTH_GUIDE, SIXTH_GUIDE_MD);
  try {
    const sixth = buildSite();
    const combined = sixth.stdout + sixth.stderr;
    expect(sixth.exit, `a sixth guide must fail the build:\n${combined}`).not.toBe(0);
    expect(combined, 'the failure names the offending file').toContain(
      'guides/migrating-from-v0.md',
    );
    expect(combined, 'the failure names the five-page launch cap').toContain(
      'five-page launch cap',
    );
    expect(combined, 'no cap-satisfied line on a rejected tree').not.toContain('cap satisfied');
  } finally {
    rmSync(SIXTH_GUIDE, { force: true });
    expect(gitStatusGuides(), 'sixth-guide drill leaves the guides dir clean').toBe('');
  }

  // TC-3: after a full build has generated the prebuild data, `astro build`
  // alone over the sixth-guide tree also fails — the check lives in the
  // /guides/[slug] getStaticPaths, not only in prebuild.
  writeFileSync(SIXTH_GUIDE, SIXTH_GUIDE_MD);
  try {
    const alone = astroBuildAlone();
    const combined = alone.stdout + alone.stderr;
    expect(alone.exit, `astro build alone must fail over six guides:\n${combined}`).not.toBe(0);
    expect(combined, 'the astro-alone failure names the offending file').toContain(
      'guides/migrating-from-v0.md',
    );
    expect(combined, 'the astro-alone failure names the five-page launch cap').toContain(
      'five-page launch cap',
    );
  } finally {
    rmSync(SIXTH_GUIDE, { force: true });
    expect(gitStatusGuides(), 'astro-alone drill leaves the guides dir clean').toBe('');
  }

  // TC-4: a four-guide tree fails the build naming the count 4.
  const holdDir = mkdtempSync(join(tmpdir(), 'gbc011-hold-'));
  const holdPath = join(holdDir, MOVED_GUIDE_NAME);
  renameSync(MOVED_GUIDE, holdPath);
  try {
    expect(existsSync(MOVED_GUIDE), 'the moved guide is out of the tree').toBe(false);
    expect(readFileSync(holdPath, 'utf8'), 'the moved guide is held intact').toContain('section:');
    const four = buildSite();
    const combined = four.stdout + four.stderr;
    expect(four.exit, `a four-guide tree must fail the build:\n${combined}`).not.toBe(0);
    expect(combined, 'the failure names the observed count 4').toMatch(
      /found 4 published guides-section entries/,
    );
    expect(combined, 'the failure names the five-page launch cap').toContain(
      'five-page launch cap',
    );
  } finally {
    renameSync(holdPath, MOVED_GUIDE);
    rmSync(holdDir, { recursive: true, force: true });
    expect(gitStatusGuides(), 'four-guide drill restores the guides dir clean').toBe('');
  }

  expect(guideFileNames(), 'the five launch guides are restored intact').toEqual([
    ...FIVE_GUIDE_FILES,
  ]);
});
