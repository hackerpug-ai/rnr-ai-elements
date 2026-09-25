/**
 * FIX-ORI-AST-004-1 — the docs-owned /components/streamdown destination.
 *
 * Proves the dependency-explainer page lands against the REAL docs pipeline:
 *   - AC-1 [PRIMARY]: RED is the recorded pre-change gap on the real candidate
 *     — the real `pnpm --filter @rnr-ai-elements/docs build`, then the pinned
 *     real Pagefind run (ALWAYS after the build: any astro build wipes
 *     dist/pagefind), then the real built preview on the owned port — the
 *     route 404s while the build and index carry their base page counts.
 *     GREEN is the identical pipeline with the page authored: build exit 0 at
 *     exactly RED + 1 page, HTTP 200 with the main h1 carrying Streamdown and
 *     the pinned honest sentence, and the real index page_count exactly
 *     RED + 1 — the page is IN the index, not just on disk.
 *   - AC-2: the served route HTML carries the pinned sentence with exactly 0
 *     occurrences of `streamdown.json` and `@react-native-reusables/cli`
 *     (never a registry command), renders peers/permissions/verdict from the
 *     committed dev-client-matrix.json entry, links only to destinations the
 *     build really serves, and the static gates plus the two-file tracked
 *     diff hold.
 *
 * This harness orchestrates real commands only. It never mocks the build, the
 * indexer, or the preview, never hand-counts pages, and never becomes a second
 * search gate (the dialog, indexer, and page model land with ORI-AST-004).
 *
 * Selector: pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts
 */
import { type ChildProcess, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PREVIEW_PORT, strictPreviewCommand } from '../harness/docs-preview';

const REPO_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const EVIDENCE_DIR = join(REPO_ROOT, '.tmp', 'FIX-ORI-AST-004-1');
const PAGE_REL = 'apps/docs/src/pages/components/streamdown.astro';
const MATRIX_REL = 'apps/docs/src/data/dev-client-matrix.json';
const PAGEFIND_ENTRY_REL = 'apps/docs/dist/pagefind/pagefind-entry.json';
const BUILD_ARGS = ['--filter', '@rnr-ai-elements/docs', 'build'];
const BUILD_COMMAND = `pnpm ${BUILD_ARGS.join(' ')}`;
const PAGEFIND_ARGS = ['dlx', 'pagefind@1.5.2', '--site', 'apps/docs/dist'];
const PAGEFIND_COMMAND = `pnpm ${PAGEFIND_ARGS.join(' ')}`;
const ROUTE = '/components/streamdown';
/** The pinned honest framing — visible page content, verbatim. */
const PINNED_SENTENCE = 'Streamdown is not a registry item.';
/** Registry-command literals that must NEVER appear in the served route HTML. */
const FORBIDDEN_HTML_LITERALS: readonly string[] = [
  'streamdown.json',
  '@react-native-reusables/cli',
];
/** The page's main h1 and its Pagefind category must carry these. */
const H1_TEXT = 'Streamdown';
const PAGEFIND_META = 'category:components';
const PAGE_COUNT_RE = /(\d+) page\(s\) built/;
const BUILD_TIMEOUT_MS = 10 * 60_000;
const PAGEFIND_TIMEOUT_MS = 5 * 60_000;
const MAX_BUFFER = 64 * 1024 * 1024;
const PREVIEW_READY_TIMEOUT_MS = 60_000;

type BuildResult = {
  command: string;
  exit: number | null;
  pageCount: number | null;
  outputTail: string;
  timedOut: boolean;
};

type PagefindResult = {
  command: string;
  exit: number | null;
  indexPageCount: number | null;
  outputTail: string;
};

type RouteObservation = {
  path: string;
  status: number | null;
  h1_text: string | null;
  pinned_sentence_present: boolean;
  pagefind_meta_present: boolean;
  forbidden_counts: Record<string, number>;
  /** Full served HTML — assertion input only, stripped from evidence files. */
  html: string;
};

type PublicRouteObservation = Omit<RouteObservation, 'html'>;

function publicRoute(route: RouteObservation): PublicRouteObservation {
  const { html: _html, ...rest } = route;
  return rest;
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

function gitLines(args: string[]): string[] {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim().split('\n').filter(Boolean);
}

/** Candidate identity: HEAD SHA plus sha256 of the page, harness, and matrix. */
function candidateIdentity(pageExists: boolean): Record<string, string | null> {
  const at = (rel: string): string | null =>
    existsSync(join(REPO_ROOT, rel)) ? sha256File(join(REPO_ROOT, rel)) : null;
  return {
    candidate_sha: gitLines(['rev-parse', 'HEAD'])[0],
    page_sha256: at(PAGE_REL),
    matrix_sha256: at(MATRIX_REL),
    harness_sha256: sha256File(fileURLToPath(import.meta.url)),
    page_present: pageExists ? 'true' : 'false',
  };
}

/** Run the real composite docs build from the candidate root and parse the
 * page count the build itself prints — never a hand count. */
function runBuild(): BuildResult {
  const result = spawnSync('pnpm', BUILD_ARGS, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    timeout: BUILD_TIMEOUT_MS,
    env: { ...process.env, CI: 'true' },
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  const match = PAGE_COUNT_RE.exec(output);
  return {
    command: BUILD_COMMAND,
    exit: result.status,
    pageCount: match ? Number(match[1]) : null,
    outputTail: output.slice(-6000),
    timedOut:
      (result.error as NodeJS.ErrnoException | undefined)?.code === 'ETIMEDOUT' ||
      result.signal === 'SIGTERM',
  };
}

/** The pinned real Pagefind run over the completed dist — the identical
 * invocation ORI-AST-004's indexer runs. Always AFTER the build: any astro
 * build wipes dist/pagefind. */
function runPagefind(): PagefindResult {
  const result = spawnSync('pnpm', PAGEFIND_ARGS, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    timeout: PAGEFIND_TIMEOUT_MS,
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  return {
    command: PAGEFIND_COMMAND,
    exit: result.status,
    indexPageCount: readIndexPageCount(),
    outputTail: output.slice(-4000),
  };
}

/** The observed pagefind-entry.json page_count (summed over languages) — the
 * only accepted index evidence. null means the run emitted no readable entry. */
function readIndexPageCount(): number | null {
  const path = join(REPO_ROOT, PAGEFIND_ENTRY_REL);
  if (!existsSync(path)) return null;
  try {
    const entry = JSON.parse(readFileSync(path, 'utf8')) as {
      languages?: Record<string, { page_count?: number }>;
    };
    const counts = Object.values(entry.languages ?? {}).map((language) => language.page_count ?? 0);
    return counts.length > 0 ? counts.reduce((sum, count) => sum + count, 0) : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// The real built preview (shared strict-port shape, owned port 4321)
// ---------------------------------------------------------------------------

/** Decode the five entities Astro's escaping can emit so text assertions run
 * over rendered text, not serialized markup. */
function decodeHtml(html: string): string {
  return html
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&');
}

async function portAccepts(): Promise<boolean> {
  try {
    const probe = await fetch(`http://127.0.0.1:${PREVIEW_PORT}/`, {
      signal: AbortSignal.timeout(1500),
    });
    await probe.body?.cancel();
    return true;
  } catch {
    return false;
  }
}

/** SIGTERM the owned process group (strictPreviewCommand execs into pnpm, so
 * the group is exactly this server's chain), then wait for a full exit. */
async function stopPreviewGroup(child: ChildProcess): Promise<void> {
  if (child.pid === undefined || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    return;
  }
  for (let waited = 0; waited < 10_000 && child.exitCode === null; waited += 100) {
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
  if (child.exitCode === null) {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      /* already gone */
    }
  }
}

/** Start the shared strict-port preview as the ONLY owned server. The guard
 * exits 1 while the port is owned by anything else — refuse, never kill. */
async function startPreview(): Promise<{ stop: () => Promise<void> }> {
  const child = spawn('sh', ['-c', strictPreviewCommand()], {
    cwd: REPO_ROOT,
    detached: true,
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  let stderrTail = '';
  child.stderr?.on('data', (chunk: Buffer) => {
    stderrTail = `${stderrTail}${chunk.toString()}`.slice(-2000);
  });
  const deadline = Date.now() + PREVIEW_READY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `owned preview exited ${child.exitCode} before serving — port ${PREVIEW_PORT} ` +
          `owned by another process or astro preview failed: ${stderrTail}`,
      );
    }
    if (await portAccepts()) {
      return { stop: () => stopPreviewGroup(child) };
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  await stopPreviewGroup(child);
  throw new Error(`owned preview on port ${PREVIEW_PORT} never became ready: ${stderrTail}`);
}

/** Fetch the route over the real built preview and read everything AC-1/AC-2
 * assert on the served HTML. */
async function observeRoute(): Promise<RouteObservation> {
  const { stop } = await startPreview();
  let status: number | null = null;
  let html = '';
  try {
    const response = await fetch(`http://127.0.0.1:${PREVIEW_PORT}${ROUTE}`);
    status = response.status;
    html = await response.text();
  } finally {
    await stop();
  }
  const decoded = decodeHtml(html);
  const main = /<main[^>]*>[\s\S]*<\/main>/.exec(decoded)?.[0] ?? '';
  const h1Text = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(main)?.[1]?.trim() ?? null;
  const forbiddenCounts = Object.fromEntries(
    FORBIDDEN_HTML_LITERALS.map((literal): [string, number] => [
      literal,
      countOccurrences(decoded, literal),
    ]),
  );
  return {
    path: ROUTE,
    status,
    h1_text: h1Text,
    pinned_sentence_present: decoded.includes(PINNED_SENTENCE),
    pagefind_meta_present: decoded.includes(`data-pagefind-meta="${PAGEFIND_META}"`),
    forbidden_counts: forbiddenCounts,
    html,
  };
}

/** Every root-relative href the served page carries, de-duplicated and
 * fragment-stripped, fetched over a fresh owned preview. */
async function checkInternalLinks(html: string): Promise<Record<string, number>> {
  const links = [
    ...new Set([...decodeHtml(html).matchAll(/href="(\/[^"#]*)[^"]*"/g)].map((match) => match[1])),
  ];
  const broken: Record<string, number> = {};
  const { stop } = await startPreview();
  try {
    for (const link of links) {
      try {
        const response = await fetch(`http://127.0.0.1:${PREVIEW_PORT}${link}`, {
          signal: AbortSignal.timeout(10_000),
        });
        await response.body?.cancel();
        if (response.status !== 200) broken[link] = response.status;
      } catch {
        broken[link] = -1;
      }
    }
  } finally {
    await stop();
  }
  return broken;
}

// ---------------------------------------------------------------------------
// AC-2 helpers: matrix parity and the static gates
// ---------------------------------------------------------------------------

interface MatrixPeer {
  name: string;
  range: string;
}

interface MatrixEntry {
  id: string;
  label: string;
  peers: MatrixPeer[];
  permissions: { ios: string[]; android: string[] };
}

function loadMatrixEntry(): MatrixEntry {
  const matrix = JSON.parse(readFileSync(join(REPO_ROOT, MATRIX_REL), 'utf8')) as MatrixEntry[];
  const entry = matrix.find((candidate) => candidate.id === 'streamdown');
  if (!entry) throw new Error(`committed ${MATRIX_REL} has no streamdown entry`);
  return entry;
}

/** The rendered peers/permissions/verdict equal the committed entry — parity
 * over the decoded served HTML, never hand-typed literals. */
function matrixParityGaps(html: string, entry: MatrixEntry): string[] {
  const decoded = decodeHtml(html);
  const gaps: string[] = [];
  for (const peer of entry.peers) {
    if (!decoded.includes(`${peer.name} ${peer.range}`))
      gaps.push(`peer ${peer.name} ${peer.range}`);
  }
  for (const permission of [...entry.permissions.ios, ...entry.permissions.android]) {
    if (!decoded.includes(permission)) gaps.push(`permission ${permission}`);
  }
  if (!decoded.includes('requires a dev client')) gaps.push('dev-client verdict');
  return gaps;
}

/** `pnpm exec biome ci …` can die with exit 254 in shimmed shells; prove a
 * failure environmental via a clean-env retry before treating it as a gate
 * failure (charter command contract). */
function runScopedBiome(): {
  command: string;
  passed: boolean;
  attempts: Record<string, unknown>[];
} {
  const args = [
    'exec',
    'biome',
    'ci',
    PAGE_REL,
    relative(REPO_ROOT, fileURLToPath(import.meta.url)),
  ];
  const primary = spawnSync('pnpm', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  const attempts: Record<string, unknown>[] = [
    {
      shape: 'pnpm exec',
      exit: primary.status,
      tail: `${primary.stdout ?? ''}${primary.stderr ?? ''}`.slice(-800),
    },
  ];
  if (primary.status !== 0) {
    const clean = spawnSync(
      'env',
      [
        '-i',
        `PATH=${dirname(process.execPath)}:/usr/bin:/bin:/usr/sbin:/sbin`,
        `HOME=${process.env.HOME}`,
        'pnpm',
        ...args,
      ],
      { cwd: REPO_ROOT, encoding: 'utf8', maxBuffer: MAX_BUFFER },
    );
    attempts.push({
      shape: 'env -i clean-env',
      exit: clean.status,
      tail: `${clean.stdout ?? ''}${clean.stderr ?? ''}`.slice(-800),
    });
  }
  return {
    command: `pnpm ${args.join(' ')}`,
    attempts,
    passed: attempts.some((a) => a.exit === 0),
  };
}

type StaticGates = {
  typecheck: { command: string; exit: number | null; tail: string };
  biome: { command: string; passed: boolean; attempts: Record<string, unknown>[] };
  tracked_diff: string[];
};

function runStaticGates(): StaticGates {
  const typecheck = spawnSync('pnpm', ['typecheck'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  return {
    typecheck: {
      command: 'pnpm typecheck',
      exit: typecheck.status,
      tail: `${typecheck.stdout ?? ''}${typecheck.stderr ?? ''}`.slice(-1500),
    },
    biome: runScopedBiome(),
    tracked_diff: gitLines(['status', '--porcelain', '--untracked-files=all']).map((line) =>
      line.slice(3).trim(),
    ),
  };
}

/** The tracked diff is exactly the allowlisted files plus the owned evidence:
 * every changed path outside .tmp/FIX-ORI-AST-004-1 must be one of them. */
function scopeGaps(trackedDiff: string[], allowlist: string[]): string[] {
  return trackedDiff.filter(
    (path) => !path.startsWith('.tmp/FIX-ORI-AST-004-1/') && !allowlist.includes(path),
  );
}

// ---------------------------------------------------------------------------
// Phase orchestration
// ---------------------------------------------------------------------------

type PhasePipeline = {
  candidate: Record<string, string | null>;
  build: BuildResult;
  pagefind: PagefindResult;
  route: RouteObservation | null;
  route_error: string | null;
};

/** The identical real pipeline for both phases: build, pinned Pagefind, then
 * the real built preview. A route-observation failure keeps the pipeline
 * record and surfaces as an assertion gap — never silent success. */
async function runPipeline(pageExists: boolean): Promise<PhasePipeline> {
  const build = runBuild();
  const pagefind = runPagefind();
  let route: RouteObservation | null = null;
  let routeError: string | null = null;
  try {
    route = await observeRoute();
  } catch (error) {
    routeError = error instanceof Error ? error.message : String(error);
  }
  return {
    candidate: candidateIdentity(pageExists),
    build,
    pagefind,
    route,
    route_error: routeError,
  };
}

/** RED: the unowned gap made mechanical — the real build and index carry the
 * base page counts while the route 404s over the real built preview. */
function recordRed(pipeline: PhasePipeline): void {
  const route = pipeline.route;
  const red = {
    phase: 'red',
    candidate: pipeline.candidate,
    build: pipeline.build,
    pagefind: pipeline.pagefind,
    route: route ? { ...publicRoute(route), html_bytes: route.html.length } : null,
    route_error: pipeline.route_error,
  };
  writeFileSync(join(EVIDENCE_DIR, 'red.json'), `${JSON.stringify(red, null, 2)}\n`);
  console.error(
    `RED recorded: ${BUILD_COMMAND} exit ${pipeline.build.exit} at ${pipeline.build.pageCount} page(s); ` +
      `${PAGEFIND_COMMAND} exit ${pipeline.pagefind.exit} at index page_count ${pipeline.pagefind.indexPageCount}; ` +
      `${ROUTE} served HTTP ${route?.status}. ` +
      `Expected HTTP 200 — the docs-owned destination is missing from the built candidate.`,
  );
  process.exitCode = 1;
}

/** RED must itself be a real observation: green build and index with concrete
 * counts, and the route genuinely absent. */
function redPrerequisiteFailures(pipeline: PhasePipeline): string[] {
  const failures: string[] = [];
  if (pipeline.build.exit !== 0)
    failures.push(`pre-change build exit ${pipeline.build.exit}, expected 0`);
  if (pipeline.build.pageCount === null) failures.push('pre-change build printed no page count');
  if (pipeline.pagefind.exit !== 0)
    failures.push(`pre-change Pagefind exit ${pipeline.pagefind.exit}, expected 0`);
  if (pipeline.pagefind.indexPageCount === null) {
    failures.push(`pre-change run emitted no readable ${PAGEFIND_ENTRY_REL} page_count`);
  }
  if (pipeline.route?.status !== 404) {
    failures.push(`pre-change route status ${pipeline.route?.status}, expected 404`);
  }
  return failures;
}

/** GREEN part 1: the real build and index counts against the RED baseline. */
function pipelineCountFailures(pipeline: PhasePipeline, red: RedBaseline): string[] {
  const failures: string[] = [];
  if (pipeline.build.exit !== 0) failures.push(`build exit ${pipeline.build.exit}, expected 0`);
  if (pipeline.build.pageCount !== red.build.pageCount + 1) {
    failures.push(
      `build page count ${pipeline.build.pageCount}, expected exactly RED ${red.build.pageCount} + 1`,
    );
  }
  if (pipeline.pagefind.exit !== 0)
    failures.push(`Pagefind exit ${pipeline.pagefind.exit}, expected 0`);
  if (pipeline.pagefind.indexPageCount === null) {
    failures.push(`run emitted no readable ${PAGEFIND_ENTRY_REL} page_count`);
  } else if (pipeline.pagefind.indexPageCount !== red.pagefind.indexPageCount + 1) {
    failures.push(
      `index page_count ${pipeline.pagefind.indexPageCount}, expected exactly RED ${red.pagefind.indexPageCount} + 1`,
    );
  }
  return failures;
}

/** GREEN part 2: the served route HTML — h1, pinned sentence, Pagefind meta,
 * zero registry-command literals, and matrix parity over rendered text. */
function routeHtmlFailures(route: RouteObservation, matrixEntry: MatrixEntry): string[] {
  const failures: string[] = [];
  if (route.status !== 200) failures.push(`route status ${route.status}, expected 200`);
  if (!route.h1_text?.includes(H1_TEXT)) {
    failures.push(`main h1 ${JSON.stringify(route.h1_text)} does not carry ${H1_TEXT}`);
  }
  if (!route.pinned_sentence_present) {
    failures.push(`served HTML lacks the pinned sentence: ${PINNED_SENTENCE}`);
  }
  if (!route.pagefind_meta_present) {
    failures.push(`served HTML lacks data-pagefind-meta="${PAGEFIND_META}"`);
  }
  for (const [literal, count] of Object.entries(route.forbidden_counts)) {
    if (count !== 0)
      failures.push(`served HTML carries ${literal} ${count} time(s), expected exactly 0`);
  }
  for (const gap of matrixParityGaps(route.html, matrixEntry)) {
    failures.push(`matrix parity: served HTML missing ${gap}`);
  }
  return failures;
}

/** GREEN: the landed state asserted against the recorded RED baseline. */
function greenFailures(
  pipeline: PhasePipeline,
  red: RedBaseline,
  matrixEntry: MatrixEntry,
  linkAudit: Record<string, number>,
): string[] {
  return [
    ...pipelineCountFailures(pipeline, red),
    ...(pipeline.route ? routeHtmlFailures(pipeline.route, matrixEntry) : []),
    ...(Object.keys(linkAudit).length > 0
      ? [`internal links not served at HTTP 200: ${JSON.stringify(linkAudit)}`]
      : []),
  ];
}

type RedBaseline = {
  build: BuildResult & { pageCount: number };
  pagefind: PagefindResult & { indexPageCount: number };
};

function readRedBaseline(): RedBaseline | null {
  const path = join(EVIDENCE_DIR, 'red.json');
  if (!existsSync(path)) return null;
  try {
    const red = JSON.parse(readFileSync(path, 'utf8')) as {
      build?: BuildResult;
      pagefind?: PagefindResult;
    };
    const build = red.build;
    const pagefind = red.pagefind;
    if (typeof build?.pageCount !== 'number' || typeof pagefind?.indexPageCount !== 'number') {
      return null;
    }
    return {
      build: { ...build, pageCount: build.pageCount },
      pagefind: { ...pagefind, indexPageCount: pagefind.indexPageCount },
    };
  } catch {
    return null;
  }
}

/** The full GREEN phase record — pipeline + gates, route HTML stripped. */
function greenRecord(
  pipeline: PhasePipeline,
  linkAudit: Record<string, number>,
  staticGates: StaticGates,
): Record<string, unknown> {
  const route = pipeline.route;
  return {
    phase: 'green',
    candidate: pipeline.candidate,
    build: pipeline.build,
    pagefind: pipeline.pagefind,
    route: route
      ? { ...publicRoute(route), html_bytes: route.html.length, broken_internal_links: linkAudit }
      : null,
    route_error: pipeline.route_error,
    static_gates: staticGates,
  };
}

/** The served-route anchors run.json binds: status, h1, framing, links. */
function servedRouteSummary(route: RouteObservation): Record<string, unknown> {
  return {
    route_status: route.status,
    h1_text: route.h1_text,
    pinned_sentence_present: route.pinned_sentence_present,
    pagefind_meta_present: route.pagefind_meta_present,
    forbidden_counts: route.forbidden_counts,
    internal_links: [
      ...new Set([...decodeHtml(route.html).matchAll(/href="(\/[^"#]*)[^"]*"/g)].map((m) => m[1])),
    ],
    html_bytes: route.html.length,
  };
}

/** The absent-route counterpart for a broken observation phase. */
function absentRouteSummary(): Record<string, unknown> {
  return {
    route_status: null,
    h1_text: null,
    pinned_sentence_present: false,
    pagefind_meta_present: false,
    forbidden_counts: null,
    internal_links: [],
    html_bytes: 0,
  };
}

/** The GREEN summary run.json carries: observed counts, anchors, and links. */
function runGreenSummary(
  pipeline: PhasePipeline,
  linkAudit: Record<string, number>,
  matrixEntry: MatrixEntry,
): Record<string, unknown> {
  const routeSummary = pipeline.route ? servedRouteSummary(pipeline.route) : absentRouteSummary();
  return {
    build_exit: pipeline.build.exit,
    build_page_count: pipeline.build.pageCount,
    pagefind_exit: pipeline.pagefind.exit,
    index_page_count: pipeline.pagefind.indexPageCount,
    ...routeSummary,
    matrix_entry: matrixEntry,
    broken_internal_links: linkAudit,
  };
}

function writeGreenAndRun(
  pipeline: PhasePipeline,
  linkAudit: Record<string, number>,
  staticGates: StaticGates,
  matrixEntry: MatrixEntry,
): void {
  const green = greenRecord(pipeline, linkAudit, staticGates);
  writeFileSync(join(EVIDENCE_DIR, 'green.json'), `${JSON.stringify(green, null, 2)}\n`);
  const red = readRedBaseline();
  const run = {
    task: 'FIX-ORI-AST-004-1',
    commands: {
      selector: 'pnpm exec tsx tests/sprint-05-orient-search/streamdown-destination-proof.test.ts',
      build: BUILD_COMMAND,
      pagefind: PAGEFIND_COMMAND,
      preview: `astro preview over apps/docs/dist on 127.0.0.1:${PREVIEW_PORT} (shared strict-port shape)`,
      typecheck: staticGates.typecheck.command,
      biome: staticGates.biome.command,
    },
    candidate: pipeline.candidate,
    red: red
      ? {
          candidate: null,
          build_exit: red.build.exit,
          build_page_count: red.build.pageCount,
          pagefind_exit: red.pagefind.exit,
          index_page_count: red.pagefind.indexPageCount,
        }
      : null,
    green: runGreenSummary(pipeline, linkAudit, matrixEntry),
    static_gates: staticGates,
    teardown: 'owned preview server stopped on every exit path',
  };
  writeFileSync(join(EVIDENCE_DIR, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
}

export async function runStreamdownDestinationProof(): Promise<void> {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const pageExists = existsSync(join(REPO_ROOT, PAGE_REL));
  const harnessRel = relative(REPO_ROOT, fileURLToPath(import.meta.url));

  if (!pageExists) {
    const pipeline = await runPipeline(false);
    const failures = redPrerequisiteFailures(pipeline);
    if (failures.length > 0) {
      console.error(`RED RUN BROKEN (not a clean RED record):\n- ${failures.join('\n- ')}`);
      process.exitCode = 1;
      return;
    }
    recordRed(pipeline);
    return;
  }

  const red = readRedBaseline();
  if (!red) {
    console.error(
      'GREEN requires the recorded RED baseline at .tmp/FIX-ORI-AST-004-1/red.json — ' +
        'run this selector on the pre-change candidate (page absent) first.',
    );
    process.exitCode = 1;
    return;
  }

  const pipeline = await runPipeline(true);
  const matrixEntry = loadMatrixEntry();
  const linkAudit = pipeline.route ? await checkInternalLinks(pipeline.route.html) : {};
  const staticGates = runStaticGates();
  const failures = [
    ...greenFailures(pipeline, red, matrixEntry, linkAudit),
    ...(staticGates.typecheck.exit === 0
      ? []
      : [`pnpm typecheck exit ${staticGates.typecheck.exit}`]),
    ...(staticGates.biome.passed
      ? []
      : [`scoped biome gate failed: ${JSON.stringify(staticGates.biome.attempts)}`]),
    ...scopeGaps(staticGates.tracked_diff, [PAGE_REL, harnessRel]).map(
      (path) => `path outside the write allowlist changed: ${path}`,
    ),
  ];
  writeGreenAndRun(pipeline, linkAudit, staticGates, matrixEntry);
  if (failures.length > 0) {
    console.error(`GREEN FAILED (${failures.length} assertion[s]):\n- ${failures.join('\n- ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `GREEN: ${BUILD_COMMAND} exit 0 at ${pipeline.build.pageCount} page(s) (red: ${red.build.pageCount}); ` +
      `${ROUTE} HTTP 200 with h1 + pinned sentence; index page_count ${pipeline.pagefind.indexPageCount} ` +
      `(red: ${red.pagefind.indexPageCount}); 0 registry-command literals; matrix parity; links resolve; ` +
      'static gates and two-file diff verified.',
  );
}

let isMain = false;
try {
  isMain =
    Boolean(process.argv[1]) && fileURLToPath(import.meta.url) === realpathSync(process.argv[1]);
} catch {
  isMain = (process.argv[1] ?? '').endsWith('streamdown-destination-proof.test.ts');
}
if (isMain) {
  runStreamdownDestinationProof().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
