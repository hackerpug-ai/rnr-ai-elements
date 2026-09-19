/**
 * ORI-AST-006 — reject broken links in the built documentation.
 *
 * Real behavior only: every assertion spawns the PRODUCTION checker
 * (scripts/docs-data/check-dist-links.ts) over real emitted Astro HTML, real
 * filesystem reads, real meta-refresh redirect documents, and real HTTP
 * requests. The complete-build fixture is an owned copy of the real
 * `pnpm --filter @rnr-ai-elements/docs build` output seeded with the
 * not-yet-landed manuscript routes (/docs/introduction,
 * /docs/owns-vs-does-not-own, /404) and the PRD redirects — the ORI-AST-001
 * scratch-fixture precedent. No mocks, no canned HTTP, no route allowlist.
 *
 * Four named selectors (one per AC), each RED-first:
 *   - ORI-AST-006-resolves-emitted-targets  (AC-1, integration)
 *   - ORI-AST-006-rejects-missing-documents (AC-2, integration)
 *   - ORI-AST-006-validates-fragments       (AC-3, integration)
 *   - ORI-AST-006-checks-external-policy    (AC-4, integration)
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, expect, test } from 'vitest';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_DIR = join(REPO_ROOT, 'apps/docs/dist');
const CHECKER = join(REPO_ROOT, 'scripts/docs-data/check-dist-links.ts');
const TSX = join(REPO_ROOT, 'node_modules/.bin/tsx');
const ORIGIN = 'https://rnraielements.com';

/** The confirmed-real HTTP 404 used for AC-4's ordinary-vs-required drill. */
const REAL_404_URL = 'https://github.com/vercel/ai-elements/__orast006_no_such__';

type Run = { exit: number; stdout: string; stderr: string };

function spawn(cmd: string, args: string[], cwd = REPO_ROOT): Run {
  const proc = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 240_000 });
  return { exit: proc.status ?? -1, stdout: proc.stdout ?? '', stderr: proc.stderr ?? '' };
}

function runChecker(args: string[]): Run {
  return spawn(TSX, [CHECKER, ...args]);
}

/** Deterministic tree hash: sorted (relativePath, content) pairs. */
function hashTree(dir: string): string {
  const h = createHash('sha256');
  const walk = (current: string): void => {
    for (const entry of readdirSync(current, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else {
        h.update(relative(dir, path));
        h.update(readFileSync(path));
      }
    }
  };
  walk(dir);
  return h.digest('hex');
}

/** Build the real docs site: the ordered production chain into apps/docs/dist. */
function buildSite(): Run {
  const registry = spawn('pnpm', ['-w', 'run', 'registry:build']);
  expect(registry.exit, 'registry:build exits 0').toBe(0);
  const manifest = spawn('pnpm', ['-w', 'run', 'gallery:manifest']);
  expect(manifest.exit, 'gallery:manifest exits 0').toBe(0);
  // Fresh content sync so no stale collection cache bleeds across runs.
  rmSync(join(REPO_ROOT, 'apps', 'docs', 'node_modules', '.astro'), {
    recursive: true,
    force: true,
  });
  return spawn('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build']);
}

function mkdirp(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

function writeFixture(relativePath: string, content: string, root: string): void {
  const abs = join(root, relativePath);
  mkdirp(dirname(abs));
  writeFileSync(abs, content);
}

/** Astro's real static-redirect template, parameterized for a fixture redirect. */
function redirectDoc(from: string, to: string): string {
  return `<!doctype html>
<title>Redirecting to: ${to}</title>
<meta http-equiv="refresh" content="0;url=${to}">
<meta name="robots" content="noindex">
<link rel="canonical" href="${ORIGIN}${to}">
<body>
\t<a href="${to}">Redirecting ${from ? `from <code>${from}</code> ` : ''}to <code>${to}</code></a>
</body>`;
}

const INTRO_HTML = `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>Introduction — RNR AI Elements</title></head>
  <body>
    <h1 id="getting-started">Introduction</h1>
    <nav>
      <a href="/components/message">message (root-relative)</a>
      <a href="../../components/message">message (relative)</a>
      <a href="${ORIGIN}/components/message">message (canonical-origin)</a>
      <a href="/registry">registry ledger</a>
      <a href="/docs/owns-vs-does-not-own">boundary</a>
      <a href="/404">recovery</a>
      <a href="#getting-started">own heading</a>
      <a href="/registry#row-message">registry fragment (plain)</a>
      <a href="../../registry#row-message">registry fragment (relative)</a>
      <a href="${ORIGIN}/registry#row-message">registry fragment (canonical)</a>
      <a href="/registry#row%2Dmessage">registry fragment (encoded)</a>
      <a href="/r/nativewind/message.json">message.json (nativewind)</a>
      <a href="/r/uniwind/message.json">message.json (uniwind)</a>
    </nav>
  </body>
</html>`;

const BOUNDARY_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>Owns vs does not own</title></head>
<body>
  <h1 id="boundary">Owns vs does not own</h1>
  <p><a href="/components/message">message</a></p>
  <p><a href="/registry">registry</a></p>
  <p><a href="/404">recovery</a></p>
</body></html>`;

const NOT_FOUND_HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>Not found</title></head>
<body>
  <h1 id="recovery">Page not found</h1>
  <p><a href="/docs/introduction">Go to the introduction</a></p>
  <p><a href="/registry">Browse the registry</a></p>
</body></html>`;

/** Seed the not-yet-landed manuscript routes, /404, and the PRD redirects. */
function seedInternalFixtures(dist: string): void {
  writeFixture('docs/introduction/index.html', INTRO_HTML, dist);
  writeFixture('docs/owns-vs-does-not-own/index.html', BOUNDARY_HTML, dist);
  writeFixture('404.html', NOT_FOUND_HTML, dist);
  // PRD redirects (UC-DELIV-04) plus the bare engine-base-URL repairs.
  writeFixture('docs/index.html', redirectDoc('/docs', '/docs/introduction'), dist);
  writeFixture('r/nativewind/index.html', redirectDoc('/r/nativewind', '/registry'), dist);
  writeFixture('r/uniwind/index.html', redirectDoc('/r/uniwind', '/registry'), dist);
}

/** Copy the real build into an owned scratch tree and seed the fixtures. */
function makeBaseline(): string {
  const dir = mkdtempSync(join(tmpdir(), 'orast006-baseline-'));
  cpSync(DIST_DIR, dir, { recursive: true });
  seedInternalFixtures(dir);
  return dir;
}

/** The first `/_astro/*.css` href emitted into the real registry page. */
function captureAssetHref(): string {
  const html = readFileSync(join(DIST_DIR, 'registry', 'index.html'), 'utf8');
  const match = /href="(\/_astro\/[^"]+\.css)"/.exec(html);
  expect(match, 'the real registry page links a /_astro/ stylesheet').not.toBeNull();
  return match?.[1] ?? '';
}

function expectedBaseline(): string {
  return baselineDir;
}

let baselineDir = '';
let baselineHash = '';

beforeAll(() => {
  const build = buildSite();
  expect(build.exit, `docs build exits 0: ${build.stdout}\n${build.stderr}`).toBe(0);
  expect(existsSync(join(DIST_DIR, 'index.html')), 'real dist emits /index.html').toBe(true);
  baselineDir = makeBaseline();
  baselineHash = hashTree(baselineDir);
}, 300_000);

afterAll(() => {
  if (baselineDir) rmSync(baselineDir, { recursive: true, force: true });
});

// AC-1: documents, canonical links, redirects and assets resolve in the build.
test('ORI-AST-006-resolves-emitted-targets', { timeout: 120_000 }, () => {
  const baseline = expectedBaseline();
  const run = runChecker(['--dist', baseline, '--origin', ORIGIN]);
  expect(run.exit, `baseline exit 0: ${run.stderr}`).toBe(0);

  // Nonempty traversal covering every required route.
  expect(run.stdout, 'traversal counts emitted html files').toMatch(/\d+ html files/);
  expect(
    Number(/^\[docs-data\] link-check: (\d+) html files/.exec(run.stdout)?.[1] ?? '0'),
  ).toBeGreaterThan(0);

  // All three /components/message forms resolve to the same captured file.
  expect(
    existsSync(join(baseline, 'components', 'message', 'index.html')),
    'message file present',
  ).toBe(true);
  expect(run.stderr, 'no errors').not.toContain('/components/message');

  // JSON assets resolve as files, not index.html.
  expect(
    existsSync(join(baseline, 'r', 'nativewind', 'message.json')),
    'nativewind message.json present',
  ).toBe(true);
  expect(
    existsSync(join(baseline, 'r', 'uniwind', 'message.json')),
    'uniwind message.json present',
  ).toBe(true);

  // A real redirect document is captured and its destination resolves.
  expect(existsSync(join(baseline, 'docs', 'index.html')), 'redirect doc emitted').toBe(true);
  const redirect = readFileSync(join(baseline, 'docs', 'index.html'), 'utf8');
  expect(redirect, 'redirect is a real meta-refresh doc').toContain('http-equiv="refresh"');

  // The captured /_astro/ asset resolves without appending index.html.
  const asset = captureAssetHref();
  expect(
    existsSync(join(baseline, asset.replace(/^\//, ''))),
    'captured /_astro/ asset exists',
  ).toBe(true);

  // Required routes are all present in the fixture.
  for (const route of [
    'docs/introduction/index.html',
    'components/message/index.html',
    'registry/index.html',
    'docs/owns-vs-does-not-own/index.html',
    '404.html',
  ]) {
    expect(existsSync(join(baseline, route)), `traversal target ${route} exists`).toBe(true);
  }
});

// AC-2: deleting a linked target fails with source+URL; empty/absent output fails.
// The five deletion drills + empty/absent cases are sequential subprocess drills —
// the complexity is inherent setup, not branching logic.
// fallow-ignore-next-line complexity
test('ORI-AST-006-rejects-missing-documents', { timeout: 120_000 }, () => {
  const baseline = expectedBaseline();
  const baselineHashBefore = baselineHash;

  const drills: { label: string; target: string; url: string; source: string }[] = [
    {
      label: 'message-document',
      target: 'components/message/index.html',
      url: '/components/message',
      source: 'docs/introduction/index.html',
    },
    {
      label: 'boundary-document',
      target: 'docs/owns-vs-does-not-own/index.html',
      url: '/docs/owns-vs-does-not-own',
      source: 'docs/introduction/index.html',
    },
    {
      label: 'recovery-target',
      target: 'docs/introduction/index.html',
      url: '/docs/introduction',
      source: '404.html',
    },
    {
      label: 'redirect-destination',
      target: 'registry/index.html',
      url: '/registry',
      source: 'r/nativewind/index.html',
    },
    {
      label: 'asset',
      target: captureAssetHref().replace(/^\//, ''),
      url: captureAssetHref(),
      source: 'registry/index.html',
    },
  ];

  for (const drill of drills) {
    const copy = mkdtempSync(join(tmpdir(), `orast006-${drill.label}-`));
    try {
      cpSync(baseline, copy, { recursive: true });
      const targetPath = join(copy, drill.target);
      expect(existsSync(targetPath), `${drill.label} target exists before drill`).toBe(true);
      rmSync(targetPath, { recursive: true, force: true });

      const failed = runChecker(['--dist', copy, '--origin', ORIGIN]);
      expect(failed.exit, `${drill.label} deletion fails the gate`).not.toBe(0);
      expect(failed.stderr, `${drill.label} names the unresolved URL`).toContain(drill.url);
      expect(failed.stderr, `${drill.label} names the referring file`).toContain(drill.source);

      // Restore the deleted target and rerun: exit 0.
      const sourcePath = join(baseline, drill.target);
      if (existsSync(sourcePath)) {
        cpSync(sourcePath, targetPath, { recursive: true });
      }
      const restored = runChecker(['--dist', copy, '--origin', ORIGIN]);
      expect(restored.exit, `${drill.label} restoration passes`).toBe(0);
    } finally {
      rmSync(copy, { recursive: true, force: true });
    }
  }

  // Empty output fails.
  const emptyDir = mkdtempSync(join(tmpdir(), 'orast006-empty-'));
  try {
    const empty = runChecker(['--dist', emptyDir, '--origin', ORIGIN]);
    expect(empty.exit, 'empty output fails the gate').not.toBe(0);
    expect(empty.stderr, 'empty output names its path').toContain(emptyDir);
  } finally {
    rmSync(emptyDir, { recursive: true, force: true });
  }

  // Absent output fails.
  const absentDir = join(
    tmpdir(),
    `orast006-absent-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const absent = runChecker(['--dist', absentDir, '--origin', ORIGIN]);
  expect(absent.exit, 'absent output fails the gate').not.toBe(0);
  expect(absent.stderr, 'absent output names its path').toContain(absentDir);

  // The baseline was never mutated: hash is stable.
  expect(hashTree(baseline), 'baseline SHA-256 unchanged after drills').toBe(baselineHashBefore);
});

// AC-3: fragments validate against real IDs; removing one ID fails precisely.
test('ORI-AST-006-validates-fragments', { timeout: 120_000 }, () => {
  const baseline = expectedBaseline();

  // Real target IDs captured before mutation.
  const registryHtml = readFileSync(join(baseline, 'registry', 'index.html'), 'utf8');
  expect(registryHtml, '/registry carries id="row-message"').toContain('id="row-message"');
  const introHtml = readFileSync(join(baseline, 'docs', 'introduction', 'index.html'), 'utf8');
  expect(introHtml, 'introduction carries id="getting-started"').toContain('id="getting-started"');

  // All fragment forms (plain, relative, canonical, encoded, same-document) resolve.
  const run = runChecker(['--dist', baseline, '--origin', ORIGIN]);
  expect(run.exit, `baseline fragments resolve: ${run.stderr}`).toBe(0);
  expect(run.stderr, 'no fragment errors on baseline').not.toContain('missing-fragment');

  // Remove only row-message's ID attribute, preserving document + incoming href.
  const copy = mkdtempSync(join(tmpdir(), 'orast006-fragment-'));
  try {
    cpSync(baseline, copy, { recursive: true });
    const registryPath = join(copy, 'registry', 'index.html');
    const mutated = readFileSync(registryPath, 'utf8').replace('id="row-message"', '');
    expect(mutated, 'row-message ID removed').not.toContain('id="row-message"');
    writeFileSync(registryPath, mutated);

    const failed = runChecker(['--dist', copy, '--origin', ORIGIN]);
    expect(failed.exit, 'missing fragment fails the gate').not.toBe(0);
    expect(failed.stderr, 'names the complete fragment URL').toContain('#row-message');
    expect(failed.stderr, 'names a referring file').toContain('docs/introduction/index.html');
    expect(failed.stderr, 'is a fragment failure, not a missing document').toContain('fragment');

    // Restore the ID and rerun: exit 0.
    writeFileSync(registryPath, registryHtml);
    const restored = runChecker(['--dist', copy, '--origin', ORIGIN]);
    expect(restored.exit, 'restored fragment passes').toBe(0);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

// AC-4: ordinary external failures warn; required-reference failures are hard.
test('ORI-AST-006-checks-external-policy', { timeout: 120_000 }, () => {
  const baseline = expectedBaseline();
  const copy = mkdtempSync(join(tmpdir(), 'orast006-external-'));
  try {
    cpSync(baseline, copy, { recursive: true });

    // Seed authoritative reference links plus one ordinary (non-required) 404.
    const externalPage = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" /><title>External references</title></head>
<body>
  <h1 id="external">External references</h1>
  <p><a href="https://github.com/vercel/ai-elements">Vercel AI Elements</a></p>
  <p><a href="https://elements.ai-sdk.dev">AI Elements site</a></p>
  <p><a href="https://github.com/muratcakmak/expo-ai-elements">expo-ai-elements prior art</a></p>
  <p><a href="https://reactnativereusables.com/">RNR base</a></p>
  <p><a href="https://reactnativereusables.com/docs/cli">RNR CLI reference</a></p>
  <p><a href="${REAL_404_URL}">ordinary 404</a></p>
</body></html>`;
    writeFixture('docs/external-references/index.html', externalPage, copy);

    // Ordinary 404 warns; required references pass; exit 0.
    const ordinary = runChecker(['--dist', copy, '--origin', ORIGIN]);
    expect(ordinary.exit, `ordinary 404 warns and required refs pass: ${ordinary.stderr}`).toBe(0);
    expect(ordinary.stderr, 'ordinary 404 produces a warning').toContain('warning');
    expect(ordinary.stderr, 'ordinary 404 names the URL').toContain(REAL_404_URL);
    expect(ordinary.stdout, 'external requests were actually made').toMatch(/[1-9]\d* external/);

    // The same URL declared required: hard failure, exit nonzero.
    const required = runChecker(['--dist', copy, '--origin', ORIGIN, '--required', REAL_404_URL]);
    expect(required.exit, 'required 404 fails the gate').not.toBe(0);
    expect(required.stderr, 'required 404 names the URL').toContain(REAL_404_URL);
    expect(required.stderr, 'required 404 is an error, not a warning').toContain('error');
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});
