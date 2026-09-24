import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  appendFileSync,
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { beforeAll, expect, test } from 'vitest';

/**
 * ORI-CI-001 — the single-tutorial gate, proven through the REAL public docs
 * build (`pnpm --filter @rnr-ai-elements/docs build`) over REAL mutated
 * content in an OWNED scratch copy of the whole candidate (os.tmpdir(),
 * never symlinked back into the candidate). One drill is shared by the five
 * test tokens — the beforeAll only runs when at least one of them is
 * selected, so every `-t ORI-CI-001-<token>` verify command still executes
 * the complete drill (sprint-04 enrichment-drill precedent):
 *
 *   ORI-CI-001-positive     the pristine one-tutorial tree builds; fresh
 *                           Quickstart HTML carries the source title
 *   ORI-CI-001-duplicate    a published duplicate fails naming both source
 *                           IDs (observed 2 versus 1); a draft duplicate
 *                           does not count and publishes nothing
 *   ORI-CI-001-missing      removing the designation fails with observed 0
 *                           versus 1, the canonical destination, and the
 *                           source ID that lost its designation
 *   ORI-CI-001-noncanonical the sole tutorial at the wrong slug fails
 *                           naming the actual source, actual route, and
 *                           required /docs/quickstart
 *   ORI-CI-001-restored     byte-exact restoration (SHA-256 over every
 *                           authored content file), zero candidate content
 *                           changes, and a fresh successful repeat of the
 *                           identical build command
 *
 * Negative mutations live ONLY in the scratch copy; the candidate's authored
 * content is hashed before and after the drill to prove zero drift. Every
 * observed run is appended to tests/sprint-05-orient-search/evidence/ORI-CI-001/
 * (five logs + manifest.json) — source-bound captures, never planned output.
 */

const ROOT = process.cwd();
const CANDIDATE_CONTENT = join(ROOT, 'apps', 'docs', 'src', 'content', 'docs');
const QUICKSTART_SOURCE = join(CANDIDATE_CONTENT, 'quickstart.mdx');
const BUILD_COMMAND = ['pnpm', '--filter', '@rnr-ai-elements/docs', 'build'] as const;
const GATE_MODULE = join(ROOT, 'scripts', 'docs-data', 'single-tutorial.ts');
const ROUTE_FILE = join(ROOT, 'apps', 'docs', 'src', 'pages', 'docs', '[...id].astro');
const CONTENT_CONFIG = join(ROOT, 'apps', 'docs', 'src', 'content.config.ts');
const TEST_FILE = join(ROOT, 'tests', 'sprint-05-orient-search', 'single-tutorial-gate.test.ts');
const EVIDENCE_DIR = join(ROOT, 'tests', 'sprint-05-orient-search', 'evidence', 'ORI-CI-001');
const DUPLICATE_SLUG = 'ori-ci-001-second-tutorial';
const MOVED_SLUG = 'ori-ci-001-moved-tutorial';

/** Build timeout: one full public build (registry:build, gallery:manifest, astro build). */
const BUILD_TIMEOUT_MS = 780_000;
/** Whole-drill timeout: scratch copy + six full builds. */
const DRILL_TIMEOUT_MS = 2_700_000;

interface BuildResult {
  label: string;
  command: string;
  cwd: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  /** Dist observations captured right after THIS build (later builds wipe dist). */
  dist: Record<string, boolean>;
}

interface DrillReport {
  runId: string;
  startedAt: string;
  scratchRoot: string;
  candidateHeadSha: string;
  candidateLockfileSha256: string;
  quickstartTitle: string;
  baselineContent: Record<string, string>;
  candidateFinalContent: Record<string, string>;
  scratchFinalContent: Record<string, string>;
  builds: Record<string, BuildResult>;
  quickstartHtmlSha256: string;
  quickstartH1: string;
  restoredMatchesBaseline: boolean;
  candidateUnchanged: boolean;
  fatal: string | null;
}

const state: { report: DrillReport | null } = { report: null };

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

/** sha256 of every authored docs source under a content dir, keyed relatively. */
function contentSnapshot(contentDir: string): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        out[
          full
            .slice(contentDir.length + 1)
            .split('\\')
            .join('/')
        ] = sha256File(full);
      }
    }
  };
  walk(contentDir);
  return out;
}

function equalSnapshots(a: Record<string, string>, b: Record<string, string>): boolean {
  const aKeys = Object.keys(a).sort();
  const bKeys = Object.keys(b).sort();
  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key, index) => key === bKeys[index] && a[key] === b[key])
  );
}

/** The manuscript title parsed from the real Quickstart source frontmatter. */
function quickstartSourceTitle(): string {
  const match = /^title:\s*'([^']+)'$/m.exec(readFileSync(QUICKSTART_SOURCE, 'utf8'));
  if (!match) throw new Error(`no title in ${QUICKSTART_SOURCE}`);
  return match[1];
}

function childGitHead(): string {
  const proc = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
  return proc.status === 0 ? (proc.stdout ?? '').trim() : 'unknown';
}

/** Fresh dist/.astro, then the real public build over the scratch candidate. */
function runBuild(report: DrillReport, label: string, distChecks: string[]): BuildResult {
  rmSync(join(report.scratchRoot, 'apps', 'docs', 'dist'), { recursive: true, force: true });
  rmSync(join(report.scratchRoot, 'apps', 'docs', '.astro'), { recursive: true, force: true });
  const started = Date.now();
  const proc = spawnSync(BUILD_COMMAND[0], BUILD_COMMAND.slice(1), {
    cwd: report.scratchRoot,
    encoding: 'utf8',
    timeout: BUILD_TIMEOUT_MS,
  });
  const result: BuildResult = {
    label,
    command: BUILD_COMMAND.join(' '),
    cwd: report.scratchRoot,
    exitCode: proc.status ?? -1,
    stdout: proc.stdout ?? '',
    stderr: proc.stderr ?? '',
    durationMs: Date.now() - started,
    dist: {},
  };
  const docsDist = join(report.scratchRoot, 'apps', 'docs', 'dist', 'docs');
  for (const check of distChecks) {
    result.dist[check] = existsSync(join(docsDist, check, 'index.html'));
  }
  report.builds[label] = result;
  return result;
}

/** Copy the whole candidate (minus VCS/state/scratch noise) into an owned tmpdir root. */
function cloneCandidate(report: DrillReport): void {
  report.scratchRoot = join(
    tmpdir(),
    'ori-ci-001-scratch',
    `${Date.now()}-${report.runId.slice(0, 8)}`,
  );
  const excluded = new Set(['.git', '.kb-run-sprint', '.tmp', 'test-results', 'playwright-report']);
  // cpSync (not a hand-rolled readdir walk): it preserves symlinks — the
  // pnpm node_modules fabric is symlink-based and a Dirent-based walk drops
  // every link — and uses APFS copy-on-write where available.
  cpSync(ROOT, report.scratchRoot, {
    recursive: true,
    force: true,
    filter: (src) => !excluded.has(basename(src)),
  });
}

/** The h1 text of the built Quickstart page, HTML-decoded. */
function builtH1(htmlPath: string): string {
  const html = readFileSync(htmlPath, 'utf8');
  const match = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html);
  if (!match) return '';
  return match[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/** Capture the built Quickstart page observations from the freshest dist. */
function captureQuickstartHtml(report: DrillReport): void {
  const quickstartHtmlPath = join(
    report.scratchRoot,
    'apps',
    'docs',
    'dist',
    'docs',
    'quickstart',
    'index.html',
  );
  if (!existsSync(quickstartHtmlPath)) return;
  report.quickstartH1 = builtH1(quickstartHtmlPath);
  report.quickstartHtmlSha256 = sha256File(quickstartHtmlPath);
}

/** AC-1 positive: the pristine one-tutorial tree builds and emits fresh HTML. */
function runPositiveCase(report: DrillReport): void {
  runBuild(report, 'positive', ['quickstart']);
  captureQuickstartHtml(report);
}

/** AC-2: a published duplicate fails; an unpublished duplicate does not count. */
function runDuplicateCases(report: DrillReport, scratchContent: string): void {
  const scratchQuickstart = join(scratchContent, 'quickstart.mdx');
  // Published duplicate: same designation, same published status.
  copyFileSync(scratchQuickstart, join(scratchContent, `${DUPLICATE_SLUG}.mdx`));
  runBuild(report, 'duplicatePublished', [DUPLICATE_SLUG]);
  rmSync(join(scratchContent, `${DUPLICATE_SLUG}.mdx`));

  // Unpublished duplicate: only the copy is marked draft: true.
  const quickstartBytes = readFileSync(scratchQuickstart, 'utf8');
  const unpublishedCopy = quickstartBytes.replace(
    /^tutorial: true$/m,
    'tutorial: true\ndraft: true',
  );
  if (unpublishedCopy === quickstartBytes) {
    throw new Error('could not mark the scratch duplicate unpublished');
  }
  writeFileSync(join(scratchContent, `${DUPLICATE_SLUG}.mdx`), unpublishedCopy);
  runBuild(report, 'duplicateUnpublished', [DUPLICATE_SLUG, 'quickstart']);
  rmSync(join(scratchContent, `${DUPLICATE_SLUG}.mdx`));
}

/** AC-3 missing designation: content and published route preserved. */
function runMissingCase(report: DrillReport, scratchContent: string): void {
  const scratchQuickstart = join(scratchContent, 'quickstart.mdx');
  const quickstartBytes = readFileSync(scratchQuickstart, 'utf8');
  writeFileSync(scratchQuickstart, quickstartBytes.replace(/^tutorial: true\n/m, ''));
  if (readFileSync(scratchQuickstart, 'utf8') === quickstartBytes) {
    throw new Error('could not remove the tutorial designation');
  }
  runBuild(report, 'missing', ['quickstart']);
  writeFileSync(scratchQuickstart, quickstartBytes);
}

/** AC-4 noncanonical destination: the file move IS the route convention. */
function runNoncanonicalCase(report: DrillReport, scratchContent: string): void {
  const scratchQuickstart = join(scratchContent, 'quickstart.mdx');
  renameSync(scratchQuickstart, join(scratchContent, `${MOVED_SLUG}.mdx`));
  runBuild(report, 'noncanonical', [MOVED_SLUG]);
  renameSync(join(scratchContent, `${MOVED_SLUG}.mdx`), scratchQuickstart);
}

/** AC-5 restoration: byte-exact hashes, untouched candidate, identical command. */
function runRestoredCase(report: DrillReport, scratchContent: string): void {
  report.scratchFinalContent = contentSnapshot(scratchContent);
  report.candidateFinalContent = contentSnapshot(CANDIDATE_CONTENT);
  report.restoredMatchesBaseline = equalSnapshots(
    report.scratchFinalContent,
    report.baselineContent,
  );
  report.candidateUnchanged = equalSnapshots(report.candidateFinalContent, report.baselineContent);
  runBuild(report, 'restored', ['quickstart']);
  captureQuickstartHtml(report);
  report.restoredMatchesBaseline = report.restoredMatchesBaseline && report.candidateUnchanged;
}

/** Run the complete six-build drill. Mutations touch the scratch copy only. */
function runDrill(): DrillReport {
  const report: DrillReport = {
    runId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    scratchRoot: '',
    candidateHeadSha: childGitHead(),
    candidateLockfileSha256: sha256File(join(ROOT, 'pnpm-lock.yaml')),
    quickstartTitle: quickstartSourceTitle(),
    baselineContent: contentSnapshot(CANDIDATE_CONTENT),
    candidateFinalContent: {},
    scratchFinalContent: {},
    builds: {},
    quickstartHtmlSha256: '',
    quickstartH1: '',
    restoredMatchesBaseline: false,
    candidateUnchanged: false,
    fatal: null,
  };
  try {
    cloneCandidate(report);
    const scratchContent = join(report.scratchRoot, 'apps', 'docs', 'src', 'content', 'docs');
    runPositiveCase(report);
    runDuplicateCases(report, scratchContent);
    runMissingCase(report, scratchContent);
    runNoncanonicalCase(report, scratchContent);
    runRestoredCase(report, scratchContent);
  } catch (error) {
    report.fatal = (error as Error).stack ?? (error as Error).message;
  } finally {
    writeEvidence(report);
    if (report.scratchRoot !== '' && existsSync(report.scratchRoot)) {
      rmSync(report.scratchRoot, { recursive: true, force: true });
    }
  }
  return report;
}

const CASE_LOG_FILE: Record<string, string> = {
  positive: 'positive.log',
  duplicatePublished: 'duplicate.log',
  duplicateUnpublished: 'duplicate.log',
  missing: 'missing.log',
  noncanonical: 'noncanonical.log',
  restored: 'restored.log',
};

/** Append every executed build to its case's evidence log; return log hashes. */
function appendBuildLogs(report: DrillReport): Record<string, string> {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  for (const [label, result] of Object.entries(report.builds)) {
    const file = CASE_LOG_FILE[label];
    if (!file) continue;
    const block = [
      `=== ORI-CI-001 run ${report.runId} ${new Date().toISOString()} — ${label} ===`,
      `command: ${result.command}`,
      `cwd: ${result.cwd}`,
      `exit code: ${result.exitCode}`,
      `duration ms: ${result.durationMs}`,
      `dist observations: ${JSON.stringify(result.dist)}`,
      '--- stdout ---',
      result.stdout,
      '--- stderr ---',
      result.stderr,
      '',
    ].join('\n');
    appendFileSync(join(EVIDENCE_DIR, file), block);
  }
  const logHashes: Record<string, string> = {};
  for (const file of Object.values(CASE_LOG_FILE)) {
    const path = join(EVIDENCE_DIR, file);
    if (existsSync(path)) logHashes[file] = sha256File(path);
  }
  return logHashes;
}

/** Load the shared manifest, appending this run to its run history. */
function appendManifestRun(report: DrillReport, logHashes: Record<string, string>): void {
  const manifestPath = join(EVIDENCE_DIR, 'manifest.json');
  let manifest: { runs: unknown[] } = { runs: [] };
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as { runs: unknown[] };
    } catch {
      manifest = { runs: [] };
    }
  }
  manifest.runs.push({
    runId: report.runId,
    recordedAt: new Date().toISOString(),
    candidate: {
      root: ROOT,
      headSha: report.candidateHeadSha,
      lockfileSha256: report.candidateLockfileSha256,
    },
    sourceHashes: {
      gateModule: sha256File(GATE_MODULE),
      routeFile: sha256File(ROUTE_FILE),
      contentConfig: sha256File(CONTENT_CONFIG),
      testFile: sha256File(TEST_FILE),
      quickstartSource: sha256File(QUICKSTART_SOURCE),
    },
    quickstart: {
      sourceTitle: report.quickstartTitle,
      builtH1: report.quickstartH1,
      htmlSha256: report.quickstartHtmlSha256,
    },
    observed: {
      quickstartSourceId: 'quickstart',
      quickstartRoute: '/docs/quickstart',
      duplicateSlug: DUPLICATE_SLUG,
      movedSlug: MOVED_SLUG,
      duplicatePublication: 'published (no draft field)',
      duplicateUnpublishedPublication: 'draft: true in frontmatter',
    },
    commands: Object.entries(report.builds).map(([label, result]) => ({
      label,
      command: result.command,
      cwd: result.cwd,
      exitCode: result.exitCode,
      durationMs: result.durationMs,
    })),
    contentHashComparisons: {
      baselineFiles: report.baselineContent,
      scratchRestoredMatchesBaseline: report.restoredMatchesBaseline,
      candidateUnchanged: report.candidateUnchanged,
    },
    fatal: report.fatal,
    logHashes,
  });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

/** Append every observed run to the six allowed evidence files. */
function writeEvidence(report: DrillReport): void {
  appendManifestRun(report, appendBuildLogs(report));
}

beforeAll(() => {
  state.report = runDrill();
}, DRILL_TIMEOUT_MS);

/** All five tokens share one executed drill; a fatal drill error fails every AC. */
function reportOrThrow(): DrillReport {
  expect(state.report, 'the shared drill must have produced a report').not.toBeNull();
  const report = state.report as DrillReport;
  expect(report.fatal, `drill fatal error: ${report.fatal ?? ''}`).toBeNull();
  return report;
}

function buildOf(report: DrillReport, label: string): BuildResult {
  const result = report.builds[label];
  expect(result, `the drill must have executed the ${label} build`).toBeDefined();
  return result;
}

test('ORI-CI-001-positive', () => {
  const report = reportOrThrow();
  const build = buildOf(report, 'positive');
  expect(build.exitCode, `positive build output:\n${build.stdout}\n${build.stderr}`).toBe(0);
  expect(build.dist.quickstart, 'fresh Quickstart HTML must exist in dist').toBe(true);
  expect(report.quickstartH1, 'Quickstart HTML must carry the source title').toBe(
    report.quickstartTitle,
  );
  expect(
    `${build.stdout}\n${build.stderr}`,
    'the positive tree must not trip the tutorial gate',
  ).not.toContain('[docs-data] single-tutorial');
});

test('ORI-CI-001-duplicate', () => {
  const report = reportOrThrow();
  const published = buildOf(report, 'duplicatePublished');
  expect(
    published.exitCode,
    `duplicate build output:\n${published.stdout}\n${published.stderr}`,
  ).not.toBe(0);
  const output = `${published.stdout}\n${published.stderr}`;
  expect(output).toMatch(/\[docs-data\] single-tutorial: item "tutorial-cardinality"/);
  expect(output).toContain('observed 2 versus 1');
  expect(output).toContain(`"${DUPLICATE_SLUG}"`);
  expect(output).toContain('"quickstart"');

  const unpublished = buildOf(report, 'duplicateUnpublished');
  expect(
    unpublished.exitCode,
    `unpublished-duplicate build output:\n${unpublished.stdout}\n${unpublished.stderr}`,
  ).toBe(0);
  expect(unpublished.dist[DUPLICATE_SLUG], 'the draft copy must publish no HTML').toBe(false);
  expect(unpublished.dist.quickstart, 'Quickstart must remain published').toBe(true);
  expect(`${unpublished.stdout}\n${unpublished.stderr}`).not.toContain(
    '[docs-data] single-tutorial',
  );
});

test('ORI-CI-001-missing', () => {
  const report = reportOrThrow();
  const build = buildOf(report, 'missing');
  expect(build.exitCode, `missing build output:\n${build.stdout}\n${build.stderr}`).not.toBe(0);
  const output = `${build.stdout}\n${build.stderr}`;
  expect(output).toMatch(/\[docs-data\] single-tutorial: item "tutorial-cardinality"/);
  expect(output).toContain('observed 0 versus 1');
  expect(output).toContain('/docs/quickstart');
  expect(output).toContain('"quickstart"');
});

test('ORI-CI-001-noncanonical', () => {
  const report = reportOrThrow();
  const build = buildOf(report, 'noncanonical');
  expect(build.exitCode, `noncanonical build output:\n${build.stdout}\n${build.stderr}`).not.toBe(
    0,
  );
  const output = `${build.stdout}\n${build.stderr}`;
  expect(output).toContain(`"${MOVED_SLUG}"`);
  expect(output).toContain(`/docs/${MOVED_SLUG}`);
  expect(output).toContain('/docs/quickstart');
  expect(output).toMatch(/\[docs-data\] canonical-destination/);
});

test('ORI-CI-001-restored', () => {
  const report = reportOrThrow();
  expect(report.restoredMatchesBaseline, 'every restored source must hash back to baseline').toBe(
    true,
  );
  expect(report.candidateUnchanged, 'candidate authored content must have zero changes').toBe(true);
  for (const relative of Object.keys(report.baselineContent)) {
    expect(
      relative.startsWith(DUPLICATE_SLUG) || relative.startsWith(MOVED_SLUG),
      `no residual owned mutation may remain: ${relative}`,
    ).toBe(false);
  }
  const build = buildOf(report, 'restored');
  expect(build.exitCode, `restored build output:\n${build.stdout}\n${build.stderr}`).toBe(0);
  expect(build.dist.quickstart, 'fresh Quickstart HTML must exist after restoration').toBe(true);
  expect(report.quickstartH1).toBe(report.quickstartTitle);
});
