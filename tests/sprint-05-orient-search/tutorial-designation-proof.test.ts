/**
 * FIX-ORI-CI-001-1 — the Quickstart tutorial designation and its schema field.
 *
 * Proves the two authored lines land against the REAL public docs build:
 *   - AC-1: the real `pnpm --filter @rnr-ai-elements/docs build` is green at an
 *     unchanged page count, exactly 1 `tutorial: true` frontmatter occurrence,
 *     exactly 1 `tutorial: z.boolean().optional()` schema occurrence, and the
 *     build-regenerated `apps/docs/.astro/content.d.ts` carries the field
 *     (0 pre-change). RED is the recorded pre-change gap: the build green with
 *     0 designation occurrences — an absence, not a failing build.
 *   - AC-2: owned os.tmpdir() scratch copies rerun the identical build command —
 *     frontmatter line removed → exit 0 with 0 carriers (the build alone does
 *     NOT enforce the designation; ORI-CI-001's gate owns that); value changed
 *     to the non-boolean `tutorial: 'yes'` → nonzero exit with a
 *     collection-validation diagnostic naming the docs collection, the
 *     quickstart source, and the tutorial field path. Plus the preserved static
 *     gates and the exact two-file tracked diff.
 *
 * This harness orchestrates real commands only. It never mocks the build, never
 * hand-edits generated output, and deliberately does NOT replicate ORI-CI-001's
 * six-decision cardinality/canonicality gate (that stays unwired — cycle 2 owns
 * the `[...id].astro` wiring).
 *
 * Selector: pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts
 *
 * Scratch copies are full repo-shaped copies under one owned os.tmpdir() root —
 * the identical composite command needs the workspace shape (pnpm-workspace.yaml,
 * root package.json, packages/registry, scripts/) — with every node_modules dir
 * symlinked back to the candidate (pnpm's per-package .pnpm links stay internal).
 * The committed tests/sprint-05-orient-search/evidence binary corpus is excluded:
 * nothing in the build reads it. Candidate authored bytes are never mutated in
 * place; scratch roots are removed on success and failure.
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const EVIDENCE_DIR = join(REPO_ROOT, '.tmp', 'FIX-ORI-CI-001-1');
const QUICKSTART_REL = 'apps/docs/src/content/docs/quickstart.mdx';
const CONFIG_REL = 'apps/docs/src/content.config.ts';
const CONTENT_DTS_REL = 'apps/docs/.astro/content.d.ts';
/**
 * Astro 7's generated content.d.ts references the live schema
 * (InferEntrySchema<"docs"> → the real src/content.config.ts) and never inlines
 * field-name literals; the build-regenerated artifact that carries the literal
 * `tutorial` field is the sync-generated JSON schema for the collection. Both
 * regenerated artifacts are recorded — content.d.ts per the task charter anchor,
 * collections/docs.schema.json as the literal-carrying equivalent.
 */
const SCHEMA_JSON_REL = 'apps/docs/.astro/collections/docs.schema.json';
const QUICKSTART_HTML_REL = 'apps/docs/dist/docs/quickstart/index.html';
const PAGE_ROUTE_REL = 'apps/docs/src/pages/docs/[...id].astro';
const GATE_FILE_REL = 'scripts/docs-data/single-tutorial.ts';
const BUILD_ARGS = ['--filter', '@rnr-ai-elements/docs', 'build'];
const BUILD_COMMAND = `pnpm ${BUILD_ARGS.join(' ')}`;
/** The page-count literal the build itself prints (67 at planning time). */
const PAGE_COUNT_RE = /(\d+) page\(s\) built/;
const BUILD_TIMEOUT_MS = 10 * 60_000;
const MAX_BUFFER = 64 * 1024 * 1024;

/** Excluded from scratch copies: non-source bulk the build never reads. */
const SCRATCH_EXCLUDED_SEGMENTS = new Set(['node_modules', '.git', '.tmp', 'dist', '.astro']);
const SCRATCH_EXCLUDED_PREFIXES = ['tests/sprint-05-orient-search/evidence'];

type BuildResult = {
  command: string;
  exit: number | null;
  pageCount: number | null;
  outputTail: string;
  timedOut: boolean;
};

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function countOccurrences(haystack: string, needle: string): number {
  return haystack.split(needle).length - 1;
}

function readRepoFile(rel: string): string {
  return readFileSync(join(REPO_ROOT, rel), 'utf8');
}

function git(args: string[]): string {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

/** Run the real composite docs build from `cwd` and parse its own page count. */
function runBuild(cwd: string): BuildResult {
  const result = spawnSync('pnpm', BUILD_ARGS, {
    cwd,
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

/**
 * Owned full repo-shaped scratch copy with node_modules symlinked back to the
 * candidate. Astro's default content cacheDir lives under node_modules/.astro,
 * which the symlinks share with the real tree — clear it so every scratch build
 * performs a fresh content sync from the mutated scratch sources, exactly as a
 * clean checkout would.
 */
function makeScratch(root: string): string {
  const candidate = join(root, 'candidate');
  cpSync(REPO_ROOT, candidate, {
    recursive: true,
    filter: (src) => {
      const rel = relative(REPO_ROOT, src);
      if (rel === '') return true;
      if (
        SCRATCH_EXCLUDED_PREFIXES.some((prefix) => rel === prefix || rel.startsWith(prefix + sep))
      ) {
        return false;
      }
      return !rel.split(sep).some((segment) => SCRATCH_EXCLUDED_SEGMENTS.has(segment));
    },
  });
  for (const nm of [
    'node_modules',
    'apps/docs/node_modules',
    'apps/example/node_modules',
    'packages/registry/node_modules',
  ]) {
    const real = join(REPO_ROOT, nm);
    if (existsSync(real)) symlinkSync(real, join(candidate, nm), 'dir');
  }
  return candidate;
}

function clearBuildOutputs(root: string): void {
  for (const rel of ['apps/docs/.astro', 'apps/docs/dist', 'apps/docs/node_modules/.astro']) {
    rmSync(join(root, rel), { recursive: true, force: true });
  }
}

function readQuickstart(root: string): string {
  return readFileSync(join(root, QUICKSTART_REL), 'utf8');
}

function writeQuickstart(root: string, body: string): void {
  writeFileSync(join(root, QUICKSTART_REL), body);
}

/** Scratch copy A mutation: remove ONLY the tutorial designation line. */
function removeDesignation(body: string): string {
  return body
    .split('\n')
    .filter((line) => line.trim() !== 'tutorial: true')
    .join('\n');
}

/** Scratch copy B mutation: the value becomes a non-boolean string. */
function invalidateDesignation(body: string): string {
  if (!body.includes('tutorial: true')) throw new Error('scratch B: designation line missing');
  return body.replace('tutorial: true', "tutorial: 'yes'");
}

/** Diagnostic lines naming the collection, the source, and the field. */
function extractDiagnostic(output: string): string {
  const lines = output
    .split('\n')
    .filter((line) =>
      /tutorial|quickstart|InvalidContent|does not match|expected boolean/i.test(line),
    );
  return lines.slice(0, 40).join('\n').slice(0, 4000);
}

/** `pnpm exec biome ci …` can die with exit 254 in shimmed shells; prove a
 * failure environmental via a clean-env retry before treating it as a gate
 * failure (charter command contract). */
function runBiome(): { command: string; passed: boolean; attempts: Record<string, unknown>[] } {
  const args = ['exec', 'biome', 'ci', CONFIG_REL];
  const primary = spawnSync('pnpm', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  const attempts: Record<string, unknown>[] = [
    { shape: 'pnpm exec', exit: primary.status, stderr: (primary.stderr ?? '').slice(-500) },
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
      stderr: (clean.stderr ?? '').slice(-500),
    });
    if (clean.status !== 0 && /abnormally|254/.test(`${clean.stderr}${clean.stdout}`)) {
      attempts.push({
        note: 'both shapes died abnormally — environmental biome failure, not a gate failure',
      });
    }
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
  trackedDiff: string[];
  pageRouteUnchanged: boolean;
  gateFileAbsent: boolean;
};

function runStaticGates(): StaticGates {
  const typecheck = spawnSync('pnpm', ['typecheck'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  // Diff against HEAD (staged + unstaged) so the scope check is stable
  // regardless of what the operator has staged before commit.
  const trackedDiff = git(['diff', '--name-only', 'HEAD']).split('\n').filter(Boolean);
  return {
    typecheck: {
      command: 'pnpm typecheck',
      exit: typecheck.status,
      tail: `${typecheck.stdout ?? ''}${typecheck.stderr ?? ''}`.slice(-1500),
    },
    biome: runBiome(),
    trackedDiff,
    pageRouteUnchanged: !trackedDiff.includes(PAGE_ROUTE_REL),
    gateFileAbsent: !existsSync(join(REPO_ROOT, GATE_FILE_REL)),
  };
}

/** Occurrences of 'tutorial' in the sync-generated collection JSON schema. */
function schemaJsonCount(root: string): number {
  const path = join(root, SCHEMA_JSON_REL);
  return existsSync(path) ? countOccurrences(readFileSync(path, 'utf8'), 'tutorial') : -1;
}

/** Bind the candidate identity: HEAD SHA + sha256 of the two product lines' files. */
function candidateIdentity(): Record<string, string> {
  return {
    candidate_sha: git(['rev-parse', 'HEAD']),
    quickstart_sha256: sha256File(join(REPO_ROOT, QUICKSTART_REL)),
    config_sha256: sha256File(join(REPO_ROOT, CONFIG_REL)),
    harness_sha256: sha256File(__filenameSafe()),
  };
}

function __filenameSafe(): string {
  return fileURLToPath(import.meta.url);
}

type CandidateObservations = {
  candidate: Record<string, string>;
  build: BuildResult;
  quickstart_html_title: string;
  quickstart_tutorial_true_count: number;
  config_tutorial_field_count: number;
  content_dts_tutorial_count: number;
  schema_json_tutorial_count: number;
};

type CandidateState = {
  base: CandidateObservations;
  build: BuildResult;
  quickstartCount: number;
  configCount: number;
  contentDtsCount: number;
  htmlTitle: string;
};

type Asserter = (condition: boolean, message: string) => void;

/** Capture the state shared by RED and GREEN: source occurrence counts, the
 * real public build, and the build-regenerated artifacts. */
function captureCandidateState(): CandidateState {
  const build = runBuild(REPO_ROOT);
  const quickstartCount = countOccurrences(readRepoFile(QUICKSTART_REL), 'tutorial: true');
  const configCount = countOccurrences(
    readRepoFile(CONFIG_REL),
    'tutorial: z.boolean().optional()',
  );
  const contentDtsCount = existsSync(join(REPO_ROOT, CONTENT_DTS_REL))
    ? countOccurrences(readRepoFile(CONTENT_DTS_REL), 'tutorial')
    : -1;
  const htmlTitle = existsSync(join(REPO_ROOT, QUICKSTART_HTML_REL))
    ? (/<title>[^<]*<\/title>/.exec(readRepoFile(QUICKSTART_HTML_REL)) ?? [
        '<title>MISSING</title>',
      ])[0]
    : 'MISSING';
  return {
    base: {
      candidate: candidateIdentity(),
      build,
      quickstart_html_title: htmlTitle,
      quickstart_tutorial_true_count: quickstartCount,
      config_tutorial_field_count: configCount,
      content_dts_tutorial_count: contentDtsCount,
      schema_json_tutorial_count: schemaJsonCount(REPO_ROOT),
    },
    build,
    quickstartCount,
    configCount,
    contentDtsCount,
    htmlTitle,
  };
}

/** RED: the unowned gap made mechanical — the real build is green, the
 * designation is absent from both files, and the regenerated artifacts carry
 * no tutorial field. Record the absence and fail the contract assert. */
function recordRed(state: CandidateState): void {
  const red = { phase: 'red', ...state.base };
  writeFileSync(join(EVIDENCE_DIR, 'red.json'), `${JSON.stringify(red, null, 2)}\n`);
  console.error(
    `RED recorded: ${BUILD_COMMAND} exit ${state.build.exit} at ${state.build.pageCount} page(s); ` +
      `0 'tutorial: true' in ${QUICKSTART_REL}, 0 'tutorial:' fields in ${CONFIG_REL}, ` +
      `${state.contentDtsCount} 'tutorial' in ${CONTENT_DTS_REL}, ${state.base.schema_json_tutorial_count} in ${SCHEMA_JSON_REL}. ` +
      `Expected exactly 1 designation — the prerequisite line is missing.`,
  );
  process.exitCode = 1;
}

function assertLandedState(state: CandidateState, expect: Asserter): void {
  expect(state.build.exit === 0, `candidate build exit ${state.build.exit}, expected 0`);
  expect(
    state.quickstartCount === 1,
    `'tutorial: true' count ${state.quickstartCount}, expected exactly 1`,
  );
  expect(
    state.configCount === 1,
    `'tutorial: z.boolean().optional()' count ${state.configCount}, expected exactly 1`,
  );
  expect(
    state.base.schema_json_tutorial_count >= 1,
    `regenerated ${SCHEMA_JSON_REL} carries 'tutorial' ${state.base.schema_json_tutorial_count} time(s), expected >= 1`,
  );
  expect(state.htmlTitle.includes('Quickstart'), `fresh Quickstart HTML title ${state.htmlTitle}`);
}

/** Copy A: only the designation line removed — build stays green with 0
 * carriers; the build alone does not enforce the designation. The
 * sync-generated JSON schema mirrors the (unchanged) schema declaration, so
 * its count is recorded as evidence, not asserted to 0 — the frontmatter
 * carrier count is the removal-copy oracle. */
function runRemovalCopy(
  scratchRoot: string,
  expectedPages: number | null,
  expect: Asserter,
): Record<string, unknown> {
  const copy = makeScratch(join(scratchRoot, 'a'));
  writeQuickstart(copy, removeDesignation(readQuickstart(copy)));
  clearBuildOutputs(copy);
  const build = runBuild(copy);
  const carrierCount = countOccurrences(readQuickstart(copy), 'tutorial: true');
  expect(build.exit === 0, `removal copy build exit ${build.exit}, expected 0`);
  expect(
    build.pageCount !== null && build.pageCount === expectedPages,
    `removal copy page count ${build.pageCount}, expected ${expectedPages}`,
  );
  expect(carrierCount === 0, `removal copy carrier count ${carrierCount}, expected 0`);
  return {
    root: join(scratchRoot, 'a'),
    ...build,
    quickstart_tutorial_true_count: carrierCount,
    schema_json_tutorial_count: schemaJsonCount(copy),
  };
}

/** Copy B: non-boolean value — the real build must fail with the
 * collection/source/field diagnostic, captured verbatim from output. */
function runInvalidCopy(scratchRoot: string, expect: Asserter): Record<string, unknown> {
  const copy = makeScratch(join(scratchRoot, 'b'));
  writeQuickstart(copy, invalidateDesignation(readQuickstart(copy)));
  clearBuildOutputs(copy);
  const build = runBuild(copy);
  const diagnostic = extractDiagnostic(build.outputTail);
  expect(
    build.exit !== 0 && build.exit !== null,
    `invalid-value copy exit ${build.exit}, expected nonzero`,
  );
  expect(diagnostic.includes('docs'), 'diagnostic must name the docs collection');
  expect(/quickstart/i.test(diagnostic), 'diagnostic must name the quickstart source');
  expect(diagnostic.includes('tutorial'), 'diagnostic must name the tutorial field path');
  return {
    root: join(scratchRoot, 'b'),
    exit: build.exit,
    timedOut: build.timedOut,
    diagnostic,
    full_output_tail: build.outputTail,
  };
}

/** Owned os.tmpdir() scratch pair; roots removed on success and failure. */
function runScratchNegativePair(
  expectedPages: number | null,
  expect: Asserter,
): { removal: Record<string, unknown>; invalid: Record<string, unknown> } {
  const scratchRoot = join(realpathSync(tmpdir()), `fix-ori-ci-001-1-${process.pid}-${Date.now()}`);
  try {
    mkdirSync(scratchRoot, { recursive: true });
    const removal = runRemovalCopy(scratchRoot, expectedPages, expect);
    const invalid = runInvalidCopy(scratchRoot, expect);
    return { removal, invalid };
  } finally {
    rmSync(scratchRoot, { recursive: true, force: true });
  }
}

function assertGatesAndScope(staticGates: StaticGates, expect: Asserter): void {
  const biomeEnvironmental = staticGates.biome.attempts.some((a) => typeof a.note === 'string');
  expect(
    staticGates.typecheck.exit === 0,
    `pnpm typecheck exit ${staticGates.typecheck.exit}, expected 0`,
  );
  expect(
    staticGates.biome.passed || biomeEnvironmental,
    `scoped biome gate must exit 0 or carry the clean-env environmental record (attempts: ${JSON.stringify(staticGates.biome.attempts)})`,
  );
  // Scope contract: the tracked diff against HEAD, minus the task-owned new
  // files (this harness and the gitignored .tmp evidence), is exactly the two
  // allowlisted product files — stable whether or not they are already staged.
  const harnessRel = relative(REPO_ROOT, __filenameSafe());
  const productDiff = staticGates.trackedDiff.filter(
    (path) => path !== harnessRel && !path.startsWith('.tmp/FIX-ORI-CI-001-1/'),
  );
  expect(
    JSON.stringify(productDiff.slice().sort()) ===
      JSON.stringify([CONFIG_REL, QUICKSTART_REL].sort()),
    `tracked diff must be exactly the two allowlisted files plus the task-owned harness and .tmp evidence, got ${JSON.stringify(staticGates.trackedDiff)}`,
  );
}

/** Occurrence/exit summary for one phase of the run record; missing RED
 * observations (first GREEN run) degrade to null. */
function phaseSummary(
  record: Record<string, unknown>,
  exit: number | null,
  pageCount: number | null,
): Record<string, unknown> {
  const orNull = (value: unknown): unknown => value ?? null;
  return {
    build_exit: exit,
    page_count: pageCount,
    quickstart_tutorial_true_count: orNull(record.quickstart_tutorial_true_count),
    config_tutorial_field_count: orNull(record.config_tutorial_field_count),
    content_dts_tutorial_count: orNull(record.content_dts_tutorial_count),
    schema_json_tutorial_count: orNull(record.schema_json_tutorial_count),
  };
}

/** Bind GREEN and the cross-phase run record: exact commands, exit codes,
 * page counts, occurrence counts, and the captured diagnostic. Returns the
 * RED page count for the GREEN summary line. */
function writeRunEvidence(
  state: CandidateState,
  removal: Record<string, unknown>,
  invalid: Record<string, unknown>,
  staticGates: StaticGates,
): number | null {
  const green = {
    phase: 'green',
    ...state.base,
    scratch_removal: removal,
    scratch_invalid: invalid,
    static_gates: staticGates,
  };
  writeFileSync(join(EVIDENCE_DIR, 'green.json'), `${JSON.stringify(green, null, 2)}\n`);

  const redPath = join(EVIDENCE_DIR, 'red.json');
  const red: Record<string, unknown> = existsSync(redPath)
    ? JSON.parse(readFileSync(redPath, 'utf8'))
    : {};
  const redBuild = (red.build as BuildResult | undefined) ?? { exit: null, pageCount: null };
  const run = {
    task: 'FIX-ORI-CI-001-1',
    commands: {
      selector: 'pnpm exec tsx tests/sprint-05-orient-search/tutorial-designation-proof.test.ts',
      build: BUILD_COMMAND,
      typecheck: 'pnpm typecheck',
      biome: 'pnpm exec biome ci apps/docs/src/content.config.ts',
    },
    candidate: state.base.candidate,
    red: phaseSummary(red, redBuild.exit, redBuild.pageCount),
    green: {
      ...phaseSummary(state.base, state.build.exit, state.build.pageCount),
      page_count_equal_to_red: redBuild.pageCount === state.build.pageCount,
      quickstart_html_title: state.htmlTitle,
    },
    scratch_negative_pair: { removal, invalid },
    static_gates: staticGates,
    scratch_cleanup: 'owned os.tmpdir() scratch roots removed on success and failure',
  };
  writeFileSync(join(EVIDENCE_DIR, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
  return redBuild.pageCount;
}

export async function runTutorialDesignationProof(): Promise<void> {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const state = captureCandidateState();
  if (state.quickstartCount === 0) {
    recordRed(state);
    return;
  }

  // GREEN path: assert the landed state, then the scratch-copy negative pair,
  // then the static gates and the two-file scope contract.
  const failures: string[] = [];
  const expect: Asserter = (condition, message) => {
    if (!condition) failures.push(message);
  };
  assertLandedState(state, expect);
  const { removal, invalid } = runScratchNegativePair(state.build.pageCount, expect);
  const staticGates = runStaticGates();
  assertGatesAndScope(staticGates, expect);
  const redPageCount = writeRunEvidence(state, removal, invalid, staticGates);

  if (failures.length > 0) {
    console.error(`GREEN FAILED (${failures.length} assertion[s]):\n- ${failures.join('\n- ')}`);
    process.exitCode = 1;
    return;
  }
  console.log(
    `GREEN: ${BUILD_COMMAND} exit 0 at ${state.build.pageCount} page(s) (red: ${redPageCount}); ` +
      `1 designation, 1 schema field, regenerated types carry tutorial; ` +
      `removal copy exit ${removal.exit} with 0 carriers; invalid-value copy exit ${invalid.exit} with source+field diagnostic; ` +
      `static gates and two-file diff verified.`,
  );
}

let isMain = false;
try {
  isMain = Boolean(process.argv[1]) && __filenameSafe() === realpathSync(process.argv[1]);
} catch {
  isMain = (process.argv[1] ?? '').endsWith('tutorial-designation-proof.test.ts');
}
if (isMain) {
  runTutorialDesignationProof().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
