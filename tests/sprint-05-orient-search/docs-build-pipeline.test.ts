import { spawn, spawnSync } from 'node:child_process';
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
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { beforeAll, expect, test } from 'vitest';

/**
 * ORI-CI-002 — the ordered public docs build, proven through the REAL public
 * command (`pnpm --filter @rnr-ai-elements/docs build`) over REAL mutated
 * inputs in OWNED scratch copies of the whole candidate (os.tmpdir(), never
 * symlinked back into the candidate). One drill is shared by the four test
 * tokens — the beforeAll runs when at least one token is selected, so every
 * `-t ORI-CI-002-<token>` verify command executes the complete drill
 * (single-tutorial-gate precedent):
 *
 *   ORI-CI-002-ordered-public-build     cold seven-stage build + standalone
 *                                       prebuild trio + lifecycle setting
 *   ORI-CI-002-authored-source-failures corrupted source binding and invalid
 *                                       JSX prop fail before Astro, restore
 *   ORI-CI-002-content-gate-failures    missing route, missing fragment, and
 *                                       duplicate tutorial fail at their
 *                                       owning gates, restore
 *   ORI-CI-002-pagefind-failure-and-restore
 *                                       unavailable Pagefind executable fails
 *                                       search:index, suppresses check:links;
 *                                       all six variants restore and rebuild
 *
 * Stage observation is stdout/stderr streaming over the real child process:
 * each pnpm lifecycle header (`> <pkg>@<version> <script> <cwd>`) is printed
 * by pnpm exactly when that stage STARTS (deliberately distinct from the
 * top-level script echo, which prints every step name before any has run),
 * and each stage's own completion line marks its end. Astro has no pnpm
 * header of its own (it runs as a direct binary inside the build script), so
 * its start is its own first build line. The observer never synthesizes an
 * event; it records observed lines and timestamps. Spawn errors, exit codes,
 * and signals are captured separately.
 *
 * Mutations live ONLY in the scratch copies; mutation targets are hashed
 * before and after and restored in finally. Every observed run is appended
 * to tests/sprint-05-orient-search/evidence/ORI-CI-002/.
 */

const ROOT = process.cwd();
const BUILD_COMMAND = ['pnpm', '--filter', '@rnr-ai-elements/docs', 'build'] as const;
const TEST_FILE = join(ROOT, 'tests', 'sprint-05-orient-search', 'docs-build-pipeline.test.ts');
const EVIDENCE_DIR = join(ROOT, 'tests', 'sprint-05-orient-search', 'evidence', 'ORI-CI-002');
const MUTATIONS_DIR = join(EVIDENCE_DIR, 'mutations');
const PROOF_RED_DIR = join(MUTATIONS_DIR, 'proof.red');
const STAGE_EVENTS_FILE = join(EVIDENCE_DIR, 'stage-events.jsonl');
const RESTORED_BUILD_LOG = join(EVIDENCE_DIR, 'restored-build.log');
const MANIFEST_FILE = join(EVIDENCE_DIR, 'manifest.json');
/** The planning charter's Source SHA — binds the executed candidate to its plan. */
const PLANNING_SOURCE_SHA = '38034e972490945b684f5bd5a706bca0479dc659';

const DUPLICATE_TUTORIAL_SLUG = 'ori-ci-002-second-tutorial';
const MISSING_ROUTE = '/docs/ori-ci-002-missing-route';
const MISSING_FRAGMENT = '/docs/introduction#ori-ci-002-missing-fragment';
const PAGEFIND_UNAVAILABLE_SUFFIX = '.orici002-unavailable';

/** Per-build timeout: one full seven-stage public build, cold tolerances included. */
const BUILD_TIMEOUT_MS = 1_200_000;
/** Whole-drill timeout: scratch copies + ~20 full public builds. */
const DRILL_TIMEOUT_MS = 4 * 3_600_000;

type StageName =
  | 'registry:build'
  | 'gallery:manifest'
  | 'prebuild'
  | 'check:snippets'
  | 'astro build'
  | 'search:index'
  | 'check:links';

const STAGE_ORDER: StageName[] = [
  'registry:build',
  'gallery:manifest',
  'prebuild',
  'check:snippets',
  'astro build',
  'search:index',
  'check:links',
];

/**
 * How each stage is observed: `header` matches the pnpm lifecycle line pnpm
 * prints when the stage starts; `done` matches the stage's own completion
 * output. The top-level script echo (`> pnpm -w run registry:build && …`)
 * matches neither shape, so echoed text can never count as execution.
 */
const STAGE_SPECS: Record<StageName, { header: RegExp | null; done: RegExp }> = {
  'registry:build': {
    header: /^> rnr-ai-elements@\S+ registry:build \//,
    done: /registry built — /,
  },
  'gallery:manifest': {
    header: /^> rnr-ai-elements@\S+ gallery:manifest \//,
    done: /gallery manifest — /,
  },
  prebuild: {
    header: /^> @rnr-ai-elements\/docs@\S+ prebuild \//,
    done: /\[docs-data\] prebuild: /,
  },
  'check:snippets': {
    header: /^> @rnr-ai-elements\/docs@\S+ check:snippets \//,
    done: /"compilerReceipts"/,
  },
  'astro build': {
    header: /\[build\] Collecting build info/,
    done: /\[build\] Complete!/,
  },
  'search:index': {
    header: /^> @rnr-ai-elements\/docs@\S+ search:index \//,
    done: /\[search-index\] index complete: /,
  },
  'check:links': {
    header: /^> @rnr-ai-elements\/docs@\S+ check:links \//,
    done: /\[docs-data\] link-check: /,
  },
};

interface StageEvent {
  run: string;
  label: string;
  stage: StageName;
  kind: 'start' | 'end';
  line: string;
  at: string;
  elapsedMs: number;
}

interface BuildObservation {
  label: string;
  command: string;
  cwd: string;
  pid: number | undefined;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  exitCode: number | null;
  signal: string | null;
  spawnError: string | null;
  stdout: string;
  stderr: string;
  events: StageEvent[];
  /** Dist facts captured right after this build (later builds wipe dist). */
  dist: Record<string, boolean>;
}

interface MutationTarget {
  path: string;
  action: 'edit' | 'add' | 'rename';
  baselineSha256: string;
  mutatedSha256: string;
  restoredSha256: string;
}

interface VariantResult {
  variant: string;
  targets: MutationTarget[];
  seed: BuildObservation;
  failing: BuildObservation;
  restored: BuildObservation;
  restorationByteExact: boolean;
  executable?: {
    path: string;
    baselineSha256: string;
    restoredSha256: string;
    privateInode: number;
    storeInodeDifferent: boolean;
  };
}

interface StandaloneTrio {
  registry: BuildObservation;
  gallery: BuildObservation;
  prebuild: BuildObservation;
  prebuildStartCount: number;
  enablePrePostScripts: string;
  datasetHasMessageAndConversation: boolean;
}

interface DrillReport {
  runId: string;
  startedAt: string;
  scratchRoots: string[];
  candidateHeadSha: string;
  candidateStatus: string;
  candidateLockfileSha256: string;
  testSha256: string;
  cold: BuildObservation | null;
  e2eDocsSegments: string[];
  playwrightConfigIntact: boolean;
  standalone: StandaloneTrio | null;
  variants: Record<string, VariantResult>;
  fatal: string | null;
}

const state: { report: DrillReport | null } = { report: null };

function sha256Text(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function stripAnsi(line: string): string {
  // Built dynamically: a literal ESC in a regex literal trips
  // noControlCharactersInRegex, and the char is exactly what must be matched.
  const esc = String.fromCharCode(27);
  return line.replace(new RegExp(`${esc}\\[[0-9;]*[A-Za-z]`, 'g'), '');
}

function childGit(args: string[]): string {
  const proc = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return proc.status === 0 ? (proc.stdout ?? '').trim() : 'unknown';
}

function outputOf(build: BuildObservation): string {
  return `${build.stdout}\n${build.stderr}`;
}

/** The ordered start events of one build, in observation order. */
function startsOf(build: BuildObservation): StageName[] {
  return build.events.filter((event) => event.kind === 'start').map((event) => event.stage);
}

function startCount(build: BuildObservation, stage: StageName): number {
  return build.events.filter((event) => event.kind === 'start' && event.stage === stage).length;
}

function doneSeen(build: BuildObservation, stage: StageName): boolean {
  return build.events.some((event) => event.kind === 'end' && event.stage === stage);
}

/** Dist observations: the introduction route and the Pagefind output. */
function distOf(cwd: string): Record<string, boolean> {
  const dist = join(cwd, 'apps', 'docs', 'dist');
  const intro = join(dist, 'docs', 'introduction', 'index.html');
  const entry = join(dist, 'pagefind', 'pagefind-entry.json');
  let pagefindNonEmpty = false;
  if (existsSync(join(dist, 'pagefind'))) {
    for (const file of readdirSync(join(dist, 'pagefind'))) {
      if (statSync(join(dist, 'pagefind', file)).size > 0) pagefindNonEmpty = true;
    }
  }
  return {
    'docs/introduction/index.html': existsSync(intro) && statSync(intro).size > 0,
    'pagefind/pagefind-entry.json': existsSync(entry),
    pagefindNonEmpty,
  };
}

/** Record stage events for one chunk of output text. */
function scanEvents(
  report: DrillReport,
  label: string,
  text: string,
  startedMs: number,
  events: StageEvent[],
): void {
  for (const rawLine of text.split('\n')) {
    const line = stripAnsi(rawLine);
    for (const stage of STAGE_ORDER) {
      const spec = STAGE_SPECS[stage];
      const kind = spec.header?.test(line) ? 'start' : spec.done.test(line) ? 'end' : null;
      if (kind !== null) {
        events.push({
          run: report.runId,
          label,
          stage,
          kind,
          line: line.trim().slice(0, 200),
          at: new Date().toISOString(),
          elapsedMs: Date.now() - startedMs,
        });
      }
    }
  }
}

/**
 * Run one real command as a streaming child process and observe its stages.
 * Spawn errors, exit code, and signal are captured separately; the observer
 * never fabricates an event.
 */
async function observeBuild(
  report: DrillReport,
  label: string,
  cwd: string,
  command: readonly string[] = BUILD_COMMAND,
  envExtra: Record<string, string> = {},
): Promise<BuildObservation> {
  const startedAt = new Date().toISOString();
  const startedMs = Date.now();
  const base: Omit<BuildObservation, 'dist'> = {
    label,
    command: command.join(' '),
    cwd,
    pid: undefined,
    startedAt,
    endedAt: '',
    durationMs: 0,
    exitCode: null,
    signal: null,
    spawnError: null,
    stdout: '',
    stderr: '',
    events: [],
  };
  const child = spawn(command[0], command.slice(1), {
    cwd,
    env: { ...process.env, ...envExtra },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const events: StageEvent[] = [];
  const outChunks: string[] = [];
  const errChunks: string[] = [];
  let spawnError: string | null = null;
  const scan = (chunk: Buffer, sink: string[]): void => {
    const text = chunk.toString('utf8');
    sink.push(text);
    scanEvents(report, label, text, startedMs, events);
  };
  child.stdout.on('data', (chunk: Buffer) => scan(chunk, outChunks));
  child.stderr.on('data', (chunk: Buffer) => scan(chunk, errChunks));
  const timer = setTimeout(() => child.kill('SIGKILL'), BUILD_TIMEOUT_MS);
  await new Promise<void>((resolve) => {
    child.on('error', (err) => {
      spawnError = err.message;
      resolve();
    });
    child.on('close', (code, signal) => {
      base.pid = child.pid;
      base.endedAt = new Date().toISOString();
      base.durationMs = Date.now() - startedMs;
      base.exitCode = code;
      base.signal = signal ?? null;
      base.spawnError = spawnError;
      base.stdout = outChunks.join('');
      base.stderr = errChunks.join('');
      base.events = events;
      resolve();
    });
  });
  clearTimeout(timer);
  return { ...base, dist: existsSync(cwd) ? distOf(cwd) : {} };
}

/** Run a short exact command synchronously (the standalone trio, config reads). */
async function observeCommand(
  report: DrillReport,
  label: string,
  command: string[],
  cwd: string,
): Promise<BuildObservation> {
  return observeBuild(report, label, cwd, command);
}

/** Copy the whole candidate (minus VCS/state/output noise) into an owned scratch root. */
function cloneCandidate(report: DrillReport, name: string): string {
  const scratchRoot = join(tmpdir(), 'ori-ci-002-scratch', `${name}-${report.runId.slice(0, 8)}`);
  const excluded = new Set([
    '.git',
    '.kb-run-sprint',
    '.tmp',
    'test-results',
    'playwright-report',
    'dist',
    '.astro',
    '.expo',
    '.wrangler',
  ]);
  cpSync(ROOT, scratchRoot, {
    recursive: true,
    force: true,
    filter: (src) => !excluded.has(basename(src)),
  });
  report.scratchRoots.push(scratchRoot);
  return scratchRoot;
}

function removeScratch(scratchRoot: string): void {
  if (scratchRoot !== '' && existsSync(scratchRoot)) {
    rmSync(scratchRoot, { recursive: true, force: true });
  }
}

/** The structural spine every green build must show: seven starts, in order, once each. */
function assertOrderedStages(build: BuildObservation, context: string): void {
  const starts = startsOf(build);
  if (JSON.stringify(starts) !== JSON.stringify(STAGE_ORDER)) {
    throw new Error(
      `${context}: observed stage starts [${starts.join(', ')}] do not match the ordered ` +
        `seven-stage chain [${STAGE_ORDER.join(', ')}]`,
    );
  }
  for (const stage of STAGE_ORDER) {
    if (startCount(build, stage) !== 1) {
      throw new Error(`${context}: stage ${stage} started ${startCount(build, stage)} times`);
    }
  }
}

/** Replace exactly one occurrence of `from` with `to` in a file; fails when not unique. */
function editOnce(path: string, from: string, to: string): void {
  const original = readFileSync(path, 'utf8');
  const first = original.indexOf(from);
  if (first === -1) {
    throw new Error(`mutation target not found in ${path}: ${from}`);
  }
  if (original.indexOf(from, first + 1) !== -1) {
    throw new Error(`mutation target is not unique in ${path}: ${from}`);
  }
  writeFileSync(path, original.slice(0, first) + to + original.slice(first + from.length));
}

interface MutationPlan {
  /** Apply the mutation to the scratch copy; returns the mutated target list. */
  apply: () => MutationTarget[];
  /** Undo the mutation; must restore every target byte-exactly. */
  restore: () => void;
  /** The diagnostic token the failing build must carry. */
  diagnostic: RegExp;
}

/** A single edited file, mutated by a unique string replacement and restored by bytes. */
function planEdit(
  path: string,
  relative: string,
  from: string,
  to: string,
  diagnostic: RegExp,
): MutationPlan {
  const baseline = readFileSync(path, 'utf8');
  return {
    apply: () => {
      editOnce(path, from, to);
      return [
        {
          path: relative,
          action: 'edit' as const,
          baselineSha256: sha256Text(baseline),
          mutatedSha256: sha256File(path),
          restoredSha256: '',
        },
      ];
    },
    restore: () => writeFileSync(path, baseline),
    diagnostic,
  };
}

function planSourceBinding(scratch: string): MutationPlan {
  return planEdit(
    join(scratch, 'scripts', 'docs-data', 'authored-snippets.ts'),
    'scripts/docs-data/authored-snippets.ts',
    "source: 'packages/docs-snippets/shared/quickstart-messages.ts'",
    "source: './ORI_CI_002_MISSING_SOURCE.tsx'",
    /ORI_CI_002_MISSING_SOURCE\.tsx/,
  );
}

function planInvalidProp(scratch: string): MutationPlan {
  return planEdit(
    join(scratch, 'packages', 'docs-snippets', 'shared', 'quickstart-screen.tsx'),
    'packages/docs-snippets/shared/quickstart-screen.tsx',
    '<Message from={item.from}>',
    '<Message from={item.from} oriCi002InvalidProp={true}>',
    /oriCi002InvalidProp/,
  );
}

function planMissingRoute(scratch: string): MutationPlan {
  return planEdit(
    join(scratch, 'apps', 'docs', 'src', 'content', 'docs', 'introduction.md'),
    'apps/docs/src/content/docs/introduction.md',
    '](/docs/theming)',
    `](${MISSING_ROUTE})`,
    new RegExp(MISSING_ROUTE.replaceAll('/', '\\/')),
  );
}

function planMissingFragment(scratch: string): MutationPlan {
  return planEdit(
    join(scratch, 'apps', 'docs', 'src', 'content', 'docs', 'introduction.md'),
    'apps/docs/src/content/docs/introduction.md',
    '](/docs/owns-vs-does-not-own)',
    `](${MISSING_FRAGMENT})`,
    /ori-ci-002-missing-fragment/,
  );
}

/**
 * The duplicate-tutorial mutation. The copied tutorial also needs snippet
 * bindings for its four source-bound blocks, or check:snippets would reject
 * the copy as an unbound block BEFORE Astro's tutorial gate could speak —
 * the scenario requires ASTRO's uniqueness failure, so the scratch copy
 * extends the committed bindings for the duplicate (restored byte-exactly).
 */
function planDuplicateTutorial(scratch: string): MutationPlan {
  const content = join(scratch, 'apps', 'docs', 'src', 'content', 'docs');
  const copyPath = join(content, `${DUPLICATE_TUTORIAL_SLUG}.mdx`);
  const gatePath = join(scratch, 'scripts', 'docs-data', 'authored-snippets.ts');
  const gateBaseline = readFileSync(gatePath, 'utf8');
  // The COMMITTED_BINDINGS array's last entry (theming.mdx fence-0) ends with
  // this exact tail; the duplicate's entries are inserted before the `];`.
  const anchor = '838,\n    },\n  },\n];';
  const sources: Record<string, string> = {
    messagesSource: 'packages/docs-snippets/shared/quickstart-messages.ts',
    screenSource: 'packages/docs-snippets/shared/quickstart-screen.tsx',
    entrypointNativewind: 'packages/docs-snippets/nativewind/app/index.tsx',
    entrypointUniwind: 'packages/docs-snippets/uniwind/app/index.tsx',
  };
  const inserted = Object.entries(sources)
    .flatMap(([snippet, source]) => [
      '  {',
      `    doc: 'apps/docs/src/content/docs/${DUPLICATE_TUTORIAL_SLUG}.mdx',`,
      `    snippet: '${snippet}',`,
      `    source: '${source}',`,
      '  },',
    ])
    .join('\n');
  return {
    apply: () => {
      copyFileSync(join(content, 'quickstart.mdx'), copyPath);
      const first = gateBaseline.indexOf(anchor);
      if (first === -1 || gateBaseline.indexOf(anchor, first + 1) !== -1) {
        throw new Error(
          'bindings insertion anchor not found or not unique in authored-snippets.ts',
        );
      }
      // Keep everything up to (and including) the theming entry's closing
      // `  },\n`, then the duplicate's entries, then the array's `\n];`.
      writeFileSync(gatePath, `${gateBaseline.slice(0, first + anchor.length - 2) + inserted}\n];`);
      return [
        {
          path: `apps/docs/src/content/docs/${DUPLICATE_TUTORIAL_SLUG}.mdx`,
          action: 'add' as const,
          baselineSha256: '',
          mutatedSha256: sha256File(copyPath),
          restoredSha256: '',
        },
        {
          path: 'scripts/docs-data/authored-snippets.ts',
          action: 'edit' as const,
          baselineSha256: sha256Text(gateBaseline),
          mutatedSha256: sha256File(gatePath),
          restoredSha256: '',
        },
      ];
    },
    restore: () => {
      rmSync(copyPath, { force: true });
      writeFileSync(gatePath, gateBaseline);
    },
    diagnostic: /\[docs-data\] single-tutorial: item "tutorial-cardinality"/,
  };
}

/** Collect the pagefind binary inside the private dlx cache of a built scratch copy. */
function findPagefindBinary(privateCache: string): string {
  const found: string[] = [];
  const walk = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name === 'pagefind_extended' && entry.isFile()) found.push(p);
    }
  };
  walk(join(privateCache, 'dlx'));
  if (found.length !== 1) {
    throw new Error(
      `expected one pagefind_extended under ${privateCache}/dlx, found ${found.length}`,
    );
  }
  return found[0];
}

interface PagefindFacts {
  path: string;
  baselineSha256: string;
  restoredSha256: string;
  privateInode: number;
  storeInodeDifferent: boolean;
}

/**
 * One full mutation variant in its own isolated copy: seed build (the stale
 * -dist negative control), mutate, failing build, restore in finally,
 * byte-exact check, fresh restored build.
 */
// The per-variant lifecycle is the specification — the pagefind file mutation
// and the three restoration accountings (rename, added-file, edited-file) are
// one drill each, not incidental branching.
// fallow-ignore-next-line complexity
async function runVariant(
  report: DrillReport,
  name: string,
  planFor: (scratch: string) => MutationPlan,
  envFor: (scratch: string) => Record<string, string> = () => ({}),
): Promise<VariantResult> {
  const scratch = cloneCandidate(report, name);
  const env = envFor(scratch);
  const isPagefind = name === 'pagefind-unavailable';
  const plan = planFor(scratch);
  const seed = await observeBuild(report, `${name}-seed`, scratch, BUILD_COMMAND, env);
  if (seed.exitCode !== 0) {
    throw new Error(
      `${name}: seed build exited ${seed.exitCode} — the variant needs a successful baseline\n${outputOf(seed).slice(-4000)}`,
    );
  }

  const targets: MutationTarget[] = [];
  let executable: PagefindFacts | undefined;
  let failing: BuildObservation | null = null;
  try {
    if (isPagefind) {
      const binary = findPagefindBinary(join(scratch, 'ori-ci-002-pnpm-cache'));
      const baselineSha = sha256File(binary);
      const inodeBefore = statSync(binary).ino;
      // Break any hardlink to the shared pnpm store: copy to a fresh inode,
      // then rename over the original path. The store copy is never touched.
      const privatized = `${binary}.privatized`;
      copyFileSync(binary, privatized);
      renameSync(privatized, binary);
      const privateInode = statSync(binary).ino;
      if (privateInode === inodeBefore) {
        throw new Error('pagefind privatization did not produce a fixture-private inode');
      }
      renameSync(binary, `${binary}${PAGEFIND_UNAVAILABLE_SUFFIX}`);
      executable = {
        path: binary,
        baselineSha256: baselineSha,
        restoredSha256: '',
        privateInode,
        storeInodeDifferent: privateInode !== inodeBefore,
      };
      targets.push({
        path: binary,
        action: 'rename',
        baselineSha256: baselineSha,
        mutatedSha256: 'unavailable (renamed away)',
        restoredSha256: '',
      });
    } else {
      targets.push(...plan.apply());
    }
    failing = await observeBuild(report, `${name}-failing`, scratch, BUILD_COMMAND, env);
    if (failing.exitCode === 0) {
      throw new Error(
        `${name}: the mutated build exited 0 — the mutation failed to fail the public build`,
      );
    }
  } finally {
    if (executable !== undefined) {
      renameSync(`${executable.path}${PAGEFIND_UNAVAILABLE_SUFFIX}`, executable.path);
    } else {
      plan.restore();
    }
  }
  const observedFailing = failing as BuildObservation;

  let restorationByteExact = true;
  if (executable !== undefined) {
    executable.restoredSha256 = sha256File(executable.path);
    restorationByteExact = executable.restoredSha256 === executable.baselineSha256;
    targets[0].restoredSha256 = executable.restoredSha256;
  } else {
    for (const target of targets) {
      if (target.action === 'add') {
        target.restoredSha256 = existsSync(join(scratch, target.path))
          ? 'still-present'
          : 'removed';
        restorationByteExact = restorationByteExact && target.restoredSha256 === 'removed';
      } else {
        target.restoredSha256 = sha256File(join(scratch, target.path));
        restorationByteExact =
          restorationByteExact && target.restoredSha256 === target.baselineSha256;
      }
    }
  }

  const restored = await observeBuild(report, `${name}-restored`, scratch, BUILD_COMMAND, env);
  if (restored.exitCode !== 0) {
    throw new Error(
      `${name}: restored build exited ${restored.exitCode}\n${outputOf(restored).slice(-4000)}`,
    );
  }
  assertOrderedStages(restored, `${name} restored build`);

  const result: VariantResult = {
    variant: name,
    targets,
    seed,
    failing: observedFailing,
    restored,
    restorationByteExact,
    executable,
  };
  report.variants[name] = result;
  removeScratch(scratch);
  return result;
}

/** AC-1 case 2: the explicit standalone prebuild trio and the lifecycle setting. */
async function runStandaloneTrio(report: DrillReport, scratch: string): Promise<StandaloneTrio> {
  const registry = await observeCommand(
    report,
    'standalone-registry',
    ['pnpm', '-w', 'run', 'registry:build'],
    scratch,
  );
  const gallery = await observeCommand(
    report,
    'standalone-gallery',
    ['pnpm', '-w', 'run', 'gallery:manifest'],
    scratch,
  );
  const prebuild = await observeCommand(
    report,
    'standalone-prebuild',
    ['pnpm', '--filter', '@rnr-ai-elements/docs', 'prebuild'],
    scratch,
  );
  const setting = await observeCommand(
    report,
    'enable-pre-post-scripts',
    ['pnpm', 'config', 'get', 'enable-pre-post-scripts'],
    scratch,
  );
  const dataset = JSON.parse(
    readFileSync(join(scratch, 'apps', 'docs', 'src', 'data', 'registry-items.json'), 'utf8'),
  ) as { name: string }[];
  const names = new Set(dataset.map((item) => item.name));
  const prebuildStartCount =
    startCount(registry, 'prebuild') +
    startCount(gallery, 'prebuild') +
    startCount(prebuild, 'prebuild');
  return {
    registry,
    gallery,
    prebuild,
    prebuildStartCount,
    enablePrePostScripts: setting.stdout.trim(),
    datasetHasMessageAndConversation: names.has('message') && names.has('conversation'),
  };
}

/** The whole ORI-CI-002 drill: cold build, standalone trio, six mutation variants. */
async function runDrill(): Promise<DrillReport> {
  const report: DrillReport = {
    runId: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    scratchRoots: [],
    candidateHeadSha: childGit(['rev-parse', 'HEAD']),
    candidateStatus: childGit(['status', '--porcelain']),
    candidateLockfileSha256: sha256File(join(ROOT, 'pnpm-lock.yaml')),
    testSha256: sha256File(TEST_FILE),
    cold: null,
    e2eDocsSegments: [],
    playwrightConfigIntact: false,
    standalone: null,
    variants: {},
    fatal: null,
  };
  try {
    // AC-1 case 1: the cold candidate build through the complete chain.
    const coldScratch = cloneCandidate(report, 'real-candidate');
    const cold = await observeBuild(report, 'cold', coldScratch);
    report.cold = cold;
    assertOrderedStages(cold, 'cold candidate build');
    if (cold.exitCode !== 0) {
      throw new Error(`cold build exited ${cold.exitCode}\n${outputOf(cold).slice(-4000)}`);
    }
    // AC-1 case 2: the standalone trio over the same owned copy.
    report.standalone = await runStandaloneTrio(report, coldScratch);
    removeScratch(coldScratch);

    // The root command surface, parsed from the real files.
    const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
      scripts: Record<string, string>;
    };
    report.e2eDocsSegments = (pkg.scripts['e2e:docs'] ?? '').split('&&').map((s) => s.trim());
    const playwright = readFileSync(join(ROOT, 'playwright.config.ts'), 'utf8');
    report.playwrightConfigIntact = [
      /workers:\s*1/,
      /retries:\s*0/,
      /chromium-desktop/,
      /chromium-mobile/,
      /chromium-nojs/,
      /PREVIEW_URL/,
    ].every((re) => re.test(playwright));

    // The six mutation variants, each in its own isolated copy.
    await runVariant(report, 'source-binding', planSourceBinding);
    await runVariant(report, 'invalid-prop', planInvalidProp);
    await runVariant(report, 'missing-route', planMissingRoute);
    await runVariant(report, 'missing-fragment', planMissingFragment);
    await runVariant(report, 'duplicate-tutorial', planDuplicateTutorial);
    await runVariant(
      report,
      'pagefind-unavailable',
      () => ({ apply: () => [], restore: () => {}, diagnostic: /.*/ }),
      (scratch) => ({ npm_config_cache_dir: join(scratch, 'ori-ci-002-pnpm-cache') }),
    );
  } catch (error) {
    report.fatal = (error as Error).stack ?? (error as Error).message;
  } finally {
    writeEvidence(report);
    for (const scratch of report.scratchRoots) removeScratch(scratch);
  }
  return report;
}

/** Append every observed stage event to the shared event log. */
function appendStageEvents(report: DrillReport): void {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const lines: string[] = [];
  const collect = (build: BuildObservation | null | undefined): void => {
    if (!build) return;
    for (const event of build.events) lines.push(JSON.stringify(event));
  };
  collect(report.cold);
  if (report.standalone) {
    collect(report.standalone.registry);
    collect(report.standalone.gallery);
    collect(report.standalone.prebuild);
  }
  for (const variant of Object.values(report.variants)) {
    collect(variant.seed);
    collect(variant.failing);
    collect(variant.restored);
  }
  if (lines.length > 0) appendFileSync(STAGE_EVENTS_FILE, `${lines.join('\n')}\n`);
}

/** The failing diagnostic: the gate's own error lines, excerpted. */
function extractDiagnostic(build: BuildObservation): string {
  const lines = outputOf(build)
    .split('\n')
    .filter((line) =>
      /\[docs-data\]|\[authored-snippets\]|\[search-index\]|error TS|Failed to run pagefind/.test(
        line,
      ),
    );
  return lines.slice(0, 12).join('\n');
}

/** Write one mutation receipt per variant plus the failing-build RED transcripts. */
function writeMutationReceipts(report: DrillReport): Record<string, string> {
  mkdirSync(PROOF_RED_DIR, { recursive: true });
  const receiptHashes: Record<string, string> = {};
  for (const variant of Object.values(report.variants)) {
    const receipt = {
      runId: report.runId,
      variant: variant.variant,
      command: variant.failing.command,
      cwd: variant.failing.cwd,
      targets: variant.targets,
      executable: variant.executable ?? null,
      failingBuild: {
        exitCode: variant.failing.exitCode,
        signal: variant.failing.signal,
        durationMs: variant.failing.durationMs,
        stagesStarted: startsOf(variant.failing),
        diagnostic: extractDiagnostic(variant.failing),
      },
      downstreamSuppression: {
        astroStarted: startsOf(variant.failing).includes('astro build'),
        searchIndexStarted: startsOf(variant.failing).includes('search:index'),
        checkLinksStarted: startsOf(variant.failing).includes('check:links'),
      },
      restoration: { byteExact: variant.restorationByteExact },
      restoredBuild: {
        exitCode: variant.restored.exitCode,
        durationMs: variant.restored.durationMs,
        stagesStarted: startsOf(variant.restored),
        dist: variant.restored.dist,
      },
    };
    const receiptPath = join(MUTATIONS_DIR, `${variant.variant}.json`);
    writeFileSync(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`);
    receiptHashes[variant.variant] = sha256File(receiptPath);
    appendFileSync(
      join(PROOF_RED_DIR, `${variant.variant}-failing-build.log`),
      [
        `=== ORI-CI-002 run ${report.runId} — ${variant.variant} failing build ===`,
        `command: ${variant.failing.command}`,
        `cwd: ${variant.failing.cwd}`,
        `exit code: ${variant.failing.exitCode}`,
        '--- stdout ---',
        variant.failing.stdout,
        '--- stderr ---',
        variant.failing.stderr,
        '',
      ].join('\n'),
    );
  }
  if (report.fatal !== null) {
    appendFileSync(
      join(PROOF_RED_DIR, 'drill-fatal.log'),
      `=== ORI-CI-002 run ${report.runId} fatal ===\n${report.fatal}\n`,
    );
  }
  return receiptHashes;
}

/** Append the restored-build sections and the run manifest. */
function writeEvidence(report: DrillReport): void {
  appendStageEvents(report);
  const receiptHashes = writeMutationReceipts(report);
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  for (const variant of Object.values(report.variants)) {
    appendFileSync(
      RESTORED_BUILD_LOG,
      [
        `=== ORI-CI-002 run ${report.runId} — ${variant.variant} restored build ===`,
        `command: ${variant.restored.command}`,
        `cwd: ${variant.restored.cwd}`,
        `exit code: ${variant.restored.exitCode}`,
        `duration ms: ${variant.restored.durationMs}`,
        `stages: ${startsOf(variant.restored).join(' -> ')}`,
        `dist: ${JSON.stringify(variant.restored.dist)}`,
        '--- stdout ---',
        variant.restored.stdout,
        '--- stderr ---',
        variant.restored.stderr,
        '',
      ].join('\n'),
    );
  }
  const stageEventsSha = existsSync(STAGE_EVENTS_FILE) ? sha256File(STAGE_EVENTS_FILE) : 'absent';
  let manifest: { runs: unknown[] } = { runs: [] };
  if (existsSync(MANIFEST_FILE)) {
    try {
      manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')) as { runs: unknown[] };
    } catch {
      manifest = { runs: [] };
    }
  }
  manifest.runs.push({
    runId: report.runId,
    recordedAt: new Date().toISOString(),
    planning: { sourceSha: PLANNING_SOURCE_SHA, task: 'ORI-CI-002' },
    candidate: {
      root: ROOT,
      headSha: report.candidateHeadSha,
      gitStatus: report.candidateStatus,
      lockfileSha256: report.candidateLockfileSha256,
      testSha256: report.testSha256,
    },
    commands: {
      publicBuild: BUILD_COMMAND.join(' '),
      standalone: [
        'pnpm -w run registry:build',
        'pnpm -w run gallery:manifest',
        'pnpm --filter @rnr-ai-elements/docs prebuild',
      ],
    },
    mutationPaths: Object.values(report.variants).flatMap((variant) =>
      variant.targets.map((target) => target.path),
    ),
    evidence: {
      stageEventsFile: STAGE_EVENTS_FILE,
      stageEventsSha256: stageEventsSha,
      restoredBuildLog: RESTORED_BUILD_LOG,
      receiptHashes,
    },
    fatal: report.fatal,
  });
  writeFileSync(MANIFEST_FILE, `${JSON.stringify(manifest, null, 2)}\n`);
}

beforeAll(async () => {
  state.report = await runDrill();
}, DRILL_TIMEOUT_MS);

/** All four tokens share one executed drill; a fatal drill error fails every AC. */
function reportOrThrow(): DrillReport {
  expect(state.report, 'the shared drill must have produced a report').not.toBeNull();
  const report = state.report as DrillReport;
  expect(report.fatal, `drill fatal error: ${report.fatal ?? ''}`).toBeNull();
  return report;
}

function variantOf(report: DrillReport, name: string): VariantResult {
  const variant = report.variants[name];
  expect(variant, `the drill must have executed the ${name} variant`).toBeDefined();
  return variant as VariantResult;
}

/** Shared restoration assertions: bytes back to baseline, fresh green rebuild. */
function expectRestoration(variant: VariantResult): void {
  expect(
    variant.restorationByteExact,
    `${variant.variant} must restore every target to its baseline bytes`,
  ).toBe(true);
  expect(variant.restored.exitCode).toBe(0);
}

test('ORI-CI-002-ordered-public-build', () => {
  const report = reportOrThrow();
  const cold = report.cold as BuildObservation;

  // Case 1: seven real stages, once each, in order; exit 0; real output.
  expect(cold.exitCode).toBe(0);
  expect(cold.spawnError).toBeNull();
  expect(cold.pid, 'the observer must record the real child process').toBeDefined();
  expect(startsOf(cold)).toEqual(STAGE_ORDER);
  for (const stage of STAGE_ORDER) {
    expect(startCount(cold, stage), `${stage} must start exactly once`).toBe(1);
    expect(doneSeen(cold, stage), `${stage} must produce its own completion output`).toBe(true);
  }
  expect(
    cold.dist['docs/introduction/index.html'],
    'the build must emit the introduction HTML',
  ).toBe(true);
  expect(cold.dist['pagefind/pagefind-entry.json'], 'the build must emit Pagefind output').toBe(
    true,
  );
  expect(cold.dist.pagefindNonEmpty, 'the Pagefind output must be nonempty').toBe(true);

  // The root e2e:docs command: exactly 3 &&-joined segments.
  expect(report.e2eDocsSegments).toEqual([
    'pnpm --filter @rnr-ai-elements/docs build',
    'pnpm exec playwright install chromium',
    'pnpm exec playwright test',
  ]);
  expect(report.playwrightConfigIntact, 'the Playwright contract must be unchanged').toBe(true);

  // Case 2: the explicit standalone prebuild still works, once, no implicit runs.
  const trio = report.standalone as StandaloneTrio;
  expect(trio.registry.exitCode).toBe(0);
  expect(trio.gallery.exitCode).toBe(0);
  expect(trio.prebuild.exitCode).toBe(0);
  expect(trio.prebuildStartCount, 'prebuild must execute exactly once across the trio').toBe(1);
  expect(trio.enablePrePostScripts, 'enablePrePostScripts must be false').toBe('false');
  expect(
    trio.datasetHasMessageAndConversation,
    'the standalone dataset must contain message and conversation',
  ).toBe(true);
});

test('ORI-CI-002-authored-source-failures', () => {
  const report = reportOrThrow();

  const binding = variantOf(report, 'source-binding');
  expect(binding.failing.exitCode).not.toBe(0);
  expect(outputOf(binding.failing)).toMatch(/ORI_CI_002_MISSING_SOURCE\.tsx/);
  expect(startsOf(binding.failing)).not.toContain('astro build');
  expect(startsOf(binding.failing)).not.toContain('search:index');
  expect(startsOf(binding.failing)).not.toContain('check:links');
  expectRestoration(binding);
  expect(startsOf(binding.restored)).toEqual(STAGE_ORDER);

  const prop = variantOf(report, 'invalid-prop');
  expect(prop.failing.exitCode).not.toBe(0);
  const propOutput = outputOf(prop.failing);
  expect(propOutput).toMatch(/oriCi002InvalidProp/);
  expect(propOutput, 'the real TypeScript compiler must name the fault').toMatch(
    /quickstart-screen\.tsx|error TS/,
  );
  expect(startsOf(prop.failing)).not.toContain('astro build');
  expectRestoration(prop);
  expect(startsOf(prop.restored)).toEqual(STAGE_ORDER);
});

test('ORI-CI-002-content-gate-failures', () => {
  const report = reportOrThrow();

  const route = variantOf(report, 'missing-route');
  expect(route.failing.exitCode).not.toBe(0);
  expect(outputOf(route.failing)).toContain(MISSING_ROUTE);
  expect(startsOf(route.failing)).toContain('check:links');
  expectRestoration(route);

  const fragment = variantOf(report, 'missing-fragment');
  expect(fragment.failing.exitCode).not.toBe(0);
  expect(outputOf(fragment.failing)).toMatch(/ori-ci-002-missing-fragment/);
  expect(startsOf(fragment.failing)).toContain('check:links');
  expect(
    fragment.seed.dist['docs/introduction/index.html'],
    'the fragment destination route must really exist',
  ).toBe(true);
  expectRestoration(fragment);

  const duplicate = variantOf(report, 'duplicate-tutorial');
  const duplicateOutput = outputOf(duplicate.failing);
  expect(duplicate.failing.exitCode).not.toBe(0);
  expect(duplicateOutput).toMatch(/\[docs-data\] single-tutorial: item "tutorial-cardinality"/);
  expect(duplicateOutput).toContain('observed 2 versus 1');
  expect(duplicateOutput).toContain(`"${DUPLICATE_TUTORIAL_SLUG}"`);
  expect(startsOf(duplicate.failing)).toContain('astro build');
  expect(startsOf(duplicate.failing)).not.toContain('search:index');
  expect(startsOf(duplicate.failing)).not.toContain('check:links');
  expectRestoration(duplicate);
  expect(
    duplicate.targets.find((target) => target.action === 'add')?.restoredSha256,
    'no leftover duplicate tutorial source',
  ).toBe('removed');
});

test('ORI-CI-002-pagefind-failure-and-restore', () => {
  const report = reportOrThrow();

  const pagefind = variantOf(report, 'pagefind-unavailable');
  const pagefindOutput = outputOf(pagefind.failing);
  expect(pagefind.failing.exitCode).not.toBe(0);
  expect(pagefindOutput).toMatch(/\[search-index\] pagefind exited/);
  expect(pagefindOutput).toMatch(/Failed to run pagefind via the npx wrapper/);
  expect(startsOf(pagefind.failing)).toContain('search:index');
  expect(startsOf(pagefind.failing)).not.toContain('check:links');
  expect(pagefindOutput, 'no browser process may start in a static build').not.toMatch(
    /playwright|chromium/i,
  );
  expect(pagefind.executable?.storeInodeDifferent, 'the executable must be fixture-private').toBe(
    true,
  );
  expectRestoration(pagefind);

  // The six-variant restoration sweep: byte-exact restore + fresh green builds.
  const expectedVariants = [
    'source-binding',
    'invalid-prop',
    'missing-route',
    'missing-fragment',
    'duplicate-tutorial',
    'pagefind-unavailable',
  ];
  expect(Object.keys(report.variants).sort()).toEqual([...expectedVariants].sort());
  for (const name of expectedVariants) {
    const variant = variantOf(report, name);
    expect(variant.restorationByteExact, `${name} must restore byte-exactly`).toBe(true);
    expect(variant.restored.exitCode, `${name} must rebuild green`).toBe(0);
    expect(startsOf(variant.restored), `${name} restored build stage order`).toEqual(STAGE_ORDER);
    for (const stage of STAGE_ORDER) {
      expect(startCount(variant.restored, stage), `${name} ${stage} once`).toBe(1);
    }
    expect(variant.restored.dist['docs/introduction/index.html'], `${name} rebuilt HTML`).toBe(
      true,
    );
    expect(variant.restored.dist.pagefindNonEmpty, `${name} rebuilt Pagefind output`).toBe(true);
  }

  // The manifest binds the run to the candidate, commands, and evidence files.
  const manifest = JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')) as {
    runs: Array<{ runId: string; candidate: { lockfileSha256: string } }>;
  };
  const run = manifest.runs.find((entry) => entry.runId === report.runId);
  expect(run, 'the captured run must be indexed in manifest.json').toBeDefined();
  expect(run?.candidate.lockfileSha256).toBe(report.candidateLockfileSha256);
  expect(existsSync(STAGE_EVENTS_FILE), 'stage-events.jsonl must exist').toBe(true);
  expect(existsSync(RESTORED_BUILD_LOG), 'restored-build.log must exist').toBe(true);
});
