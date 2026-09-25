/**
 * FIX-ORI-VIS-001-1 — the reserved theming entry in section navigation.
 *
 * Proves the one semantic split against the REAL publication contract, the REAL
 * public docs build, and the built dist nav HTML:
 *   - AC-1: `sectionNavigation` over entries parsed from the real authored
 *     content directory (real js-yaml frontmatter parse, real github-slugger
 *     ids — the theming-manuscript.test.ts precedent) carries a `guides` group
 *     with exactly 1 entry at href `/docs/theming` ordered after every
 *     getting-started entry; the real `pnpm --filter @rnr-ai-elements/docs
 *     build` exits 0 at exactly the RED page count (the static theming.astro
 *     route still owns the destination — no new route); the built introduction
 *     page's `nav[data-docs-nav]` region carries exactly 1 `/docs/theming`
 *     anchor inside the section titled "Guides". RED is the recorded pre-change
 *     absence: (0) theming nav entries, (0) guides groups, (0) theming anchors
 *     in the built nav region — a whole-HTML grep would not prove this (prose
 *     links satisfy it pre-change), so only the nav-region-scoped read is the
 *     oracle.
 *   - AC-2: the preserved contracts — `publishedDocs` derivation identical to
 *     its RED baseline (still (0) theming entries: the catch-all never admits
 *     the reserved slug), the real `orientation-content.spec.ts` run
 *     (chromium-desktop) exits 0 with its relative-order assertions intact, and
 *     the static gates (pnpm typecheck, scoped biome) pass or carry the
 *     clean-env environmental record.
 *
 * This harness orchestrates real commands only. It never mocks the module, the
 * build, the built HTML, or the spec, and is not a second navigation gate.
 *
 * Selector: pnpm exec tsx tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts
 */
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
const EVIDENCE_DIR = join(REPO_ROOT, '.tmp', 'FIX-ORI-VIS-001-1');
const MODULE_REL = 'apps/docs/src/lib/docs-navigation.ts';
const CONTENT_DIR_REL = 'apps/docs/src/content/docs';
const INTRO_HTML_REL = 'apps/docs/dist/docs/introduction/index.html';
const THEMING_HTML_REL = 'apps/docs/dist/docs/theming/index.html';
const THEMING_HREF = '/docs/theming';
const GUIDES_SECTION = 'guides';
const GUIDES_SECTION_TITLE = 'Guides';
const GETTING_STARTED_SECTION = 'getting-started';
/** The page-count literal the build itself prints (68 at planning time). */
const PAGE_COUNT_RE = /(\d+) page\(s\) built/;
const BUILD_ARGS = ['--filter', '@rnr-ai-elements/docs', 'build'];
const BUILD_COMMAND = `pnpm ${BUILD_ARGS.join(' ')}`;
const PLAYWRIGHT_ARGS = [
  'exec',
  'playwright',
  'test',
  'tests/sprint-05-orient-search/orientation-content.spec.ts',
  '--project=chromium-desktop',
];
const PLAYWRIGHT_COMMAND = `pnpm ${PLAYWRIGHT_ARGS.join(' ')}`;
const BUILD_TIMEOUT_MS = 10 * 60_000;
const SPEC_TIMEOUT_MS = 10 * 60_000;
const MAX_BUFFER = 64 * 1024 * 1024;
const HARNESS_REL = 'tests/sprint-05-orient-search/theming-nav-inclusion-proof.test.ts';
/** Scope contract: the tracked diff outside the owned .tmp evidence root. */
const ALLOWLIST = new Set([MODULE_REL, HARNESS_REL]);

// --- real installed parsers (theming-manuscript.test.ts precedent) -----------
const require_ = createRequire(import.meta.url);

function storeDir(prefix: string): string {
  const store = join(REPO_ROOT, 'node_modules', '.pnpm');
  const hits = readdirSync(store).filter((entry) => entry.startsWith(prefix));
  if (hits.length === 0) throw new Error(`pnpm store is missing ${prefix}*`);
  return join(store, hits.at(-1) as string);
}

type YamlApi = { load: (text: string) => unknown };
const yaml = require_(join(storeDir('js-yaml@'), 'node_modules', 'js-yaml', 'index.js')) as YamlApi;
const { slug: githubSlug } = (await import(
  pathToFileURL(join(REPO_ROOT, 'apps/docs/node_modules/github-slugger/index.js')).href
)) as { slug: (text: string) => string };

// --- real module + real authored entries --------------------------------------
type Derivations = {
  publishedDocs: (entries: DocsEntry[]) => { href: string }[];
  sectionNavigation: (entries: DocsEntry[]) => { section: string; entries: { href: string }[] }[];
};

interface DocsEntry {
  id: string;
  filePath: string;
  data: {
    title: string;
    description: string;
    section: string;
    order: number;
    draft?: boolean;
  };
}

async function importRealModule(): Promise<Derivations> {
  const module = await import(pathToFileURL(join(REPO_ROOT, MODULE_REL)).href);
  return module as unknown as Derivations;
}

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

/** Parse the real authored content directory into collection entries: real
 * js-yaml frontmatter, real github-slugger ids, flat directory. */
function loadAuthoredEntries(): DocsEntry[] {
  const dir = join(REPO_ROOT, CONTENT_DIR_REL);
  return readdirSync(dir)
    .filter((name) => /\.(md|mdx)$/.test(name))
    .sort()
    .map((name) => {
      const raw = readFileSync(join(dir, name), 'utf8');
      const match = FRONTMATTER_RE.exec(raw);
      if (!match) throw new Error(`${CONTENT_DIR_REL}/${name} has no YAML frontmatter fence`);
      const data = yaml.load(match[1]) as DocsEntry['data'];
      const id = githubSlug(name.replace(/\.(md|mdx)$/, ''));
      return { id, filePath: `${CONTENT_DIR_REL}/${name}`, data };
    });
}

// --- observations ----------------------------------------------------------------
type NavObservation = {
  nav_hrefs: string[];
  getting_started_hrefs: string[];
  guides_group_count: number;
  guides_group_hrefs: string[];
  theming_nav_count: number;
  published_hrefs: string[];
  published_theming_count: number;
};

function observeDerivations(derivations: Derivations, entries: DocsEntry[]): NavObservation {
  const nav = derivations.sectionNavigation(entries);
  const navHrefs = nav.flatMap((group) => group.entries.map((entry) => entry.href));
  const guides = nav.filter((group) => group.section === GUIDES_SECTION);
  const published = derivations.publishedDocs(entries).map((doc) => doc.href);
  return {
    nav_hrefs: navHrefs,
    getting_started_hrefs: nav
      .filter((group) => group.section === GETTING_STARTED_SECTION)
      .flatMap((group) => group.entries.map((entry) => entry.href)),
    guides_group_count: guides.length,
    guides_group_hrefs: guides.flatMap((group) => group.entries.map((entry) => entry.href)),
    theming_nav_count: navHrefs.filter((href) => href === THEMING_HREF).length,
    published_hrefs: published,
    published_theming_count: published.filter((href) => href === THEMING_HREF).length,
  };
}

type BuildResult = {
  command: string;
  exit: number | null;
  pageCount: number | null;
  theming_page_built: boolean;
  tail: string;
};

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
    theming_page_built: existsSync(join(REPO_ROOT, THEMING_HTML_REL)),
    tail: output.slice(-3000),
  };
}

type BuiltNavObservation = {
  nav_region_found: boolean;
  section_titles: string[];
  guides_title_count: number;
  anchors: { href: string; section: string }[];
  theming_anchor_count: number;
};

function emptyBuiltNav(): BuiltNavObservation {
  return {
    nav_region_found: false,
    section_titles: [],
    guides_title_count: 0,
    anchors: [],
    theming_anchor_count: 0,
  };
}

/** Read the built nav region: per-section titles and their anchors, in order. */
function observeBuiltNav(htmlRel: string): BuiltNavObservation {
  if (!existsSync(join(REPO_ROOT, htmlRel))) return emptyBuiltNav();
  const html = readFileSync(join(REPO_ROOT, htmlRel), 'utf8');
  const region = /<nav[^>]*data-docs-nav[^>]*>[\s\S]*?<\/nav>/.exec(html);
  if (!region) return emptyBuiltNav();
  const anchors: { href: string; section: string }[] = [];
  const titles: string[] = [];
  for (const section of region[0].matchAll(/<section\b[\s\S]*?<\/section>/g)) {
    const title = /<h2[^>]*docs-nav__section-title[^>]*>([^<]*)<\/h2>/.exec(section[0])?.[1] ?? '';
    titles.push(title);
    for (const anchor of section[0].matchAll(/<a\b[^>]*href="([^"]+)"/g)) {
      anchors.push({ href: anchor[1], section: title });
    }
  }
  return {
    nav_region_found: true,
    section_titles: titles,
    guides_title_count: titles.filter((title) => title === GUIDES_SECTION_TITLE).length,
    anchors,
    theming_anchor_count: anchors.filter((anchor) => anchor.href === THEMING_HREF).length,
  };
}

// --- commands ----------------------------------------------------------------------
function sha256File(rel: string): string {
  return createHash('sha256')
    .update(readFileSync(join(REPO_ROOT, rel)))
    .digest('hex');
}

function git(args: string[]): string {
  const result = spawnSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(`git ${args.join(' ')} failed: ${result.stderr}`);
  return result.stdout.trim();
}

function candidateIdentity(): Record<string, string> {
  return {
    candidate_sha: git(['rev-parse', 'HEAD']),
    module_sha256: sha256File(MODULE_REL),
    harness_sha256: sha256File(HARNESS_REL),
  };
}

function runPlaywright(): { command: string; exit: number | null; tail: string } {
  const result = spawnSync('pnpm', PLAYWRIGHT_ARGS, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
    timeout: SPEC_TIMEOUT_MS,
    env: { ...process.env, CI: 'true' },
  });
  return {
    command: PLAYWRIGHT_COMMAND,
    exit: result.status,
    tail: `${result.stdout ?? ''}${result.stderr ?? ''}`.slice(-4000),
  };
}

/** `pnpm exec biome ci …` can die with exit 254 in shimmed shells; retry via a
 * clean env before treating a failure as a gate failure (charter contract). */
function runBiome(): { command: string; passed: boolean; attempts: Record<string, unknown>[] } {
  const args = ['exec', 'biome', 'ci', MODULE_REL, HARNESS_REL];
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
      attempts.push({ note: 'both shapes died abnormally — environmental biome failure' });
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
  changed_paths_outside_tmp: string[];
};

/** Untracked side effects of the required spec run (Playwright report and
 * last-run state). Removed after every run and never committed — the same
 * class as the gitignored build outputs. */
const SPEC_SIDE_EFFECTS = ['apps/docs/playwright-report', 'test-results'];

function removeSpecSideEffects(): string[] {
  return SPEC_SIDE_EFFECTS.filter((rel) => {
    const path = join(REPO_ROOT, rel);
    if (!existsSync(path)) return false;
    rmSync(path, { recursive: true, force: true });
    return true;
  });
}

function runTypecheck(): StaticGates['typecheck'] {
  const typecheck = spawnSync('pnpm', ['typecheck'], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: MAX_BUFFER,
  });
  return {
    command: 'pnpm typecheck',
    exit: typecheck.status,
    tail: `${typecheck.stdout ?? ''}${typecheck.stderr ?? ''}`.slice(-1500),
  };
}

function changedPathsOutsideTmp(): string[] {
  const changed = new Set(git(['diff', '--name-only', 'HEAD']).split('\n').filter(Boolean));
  for (const untracked of git(['ls-files', '--others', '--exclude-standard']).split('\n')) {
    if (untracked) changed.add(untracked);
  }
  return [...changed].filter((path) => !path.startsWith('.tmp/'));
}

function runStaticGates(): StaticGates {
  return {
    typecheck: runTypecheck(),
    biome: runBiome(),
    changed_paths_outside_tmp: changedPathsOutsideTmp(),
  };
}

function positionAfter(haystack: string[], needle: string, predecessors: string[]): boolean {
  const at = haystack.indexOf(needle);
  if (at === -1) return false;
  return predecessors.every((href) => {
    const before = haystack.indexOf(href);
    return before !== -1 && before < at;
  });
}

// --- asserters ------------------------------------------------------------------------
type Asserter = (message: string) => void;
type RedRecord = Record<string, unknown>;

/** The recorded RED must carry the true pre-change zero signature. */
function assertRedBaseline(red: RedRecord, fail: Asserter): void {
  const redDerivation = red.derivation as NavObservation;
  const redBuiltNav = red.built_nav as BuiltNavObservation;
  if (redDerivation.theming_nav_count !== 0 || redDerivation.guides_group_count !== 0) {
    fail('red.json must record the pre-change absence (0 theming nav entries, 0 guides groups)');
  }
  if (redBuiltNav.theming_anchor_count !== 0 || redBuiltNav.guides_title_count !== 0) {
    fail('red.json must record the built-nav absence (0 theming anchors, 0 Guides titles)');
  }
}

/** AC-1: the derivation split, over the real authored collection. */
function assertDerivationSplit(derivation: NavObservation, fail: Asserter): void {
  if (derivation.guides_group_count !== 1) {
    fail(`guides group count ${derivation.guides_group_count}, expected exactly 1`);
  }
  if (JSON.stringify(derivation.guides_group_hrefs) !== JSON.stringify([THEMING_HREF])) {
    fail(
      `guides group hrefs ${JSON.stringify(derivation.guides_group_hrefs)}, expected ["${THEMING_HREF}"]`,
    );
  }
  if (derivation.theming_nav_count !== 1)
    fail(`theming nav count ${derivation.theming_nav_count}, expected 1`);
  if (!positionAfter(derivation.nav_hrefs, THEMING_HREF, derivation.getting_started_hrefs)) {
    fail('theming must be ordered after every getting-started entry in the derivation');
  }
}

/** AC-1: the build route count is unchanged — the static route owns the
 * destination; the catch-all fan-out is unchanged. */
function assertBuildRouteOwnership(
  redBuild: BuildResult,
  build: BuildResult,
  fail: Asserter,
): void {
  if (build.exit !== 0) fail(`build exit ${build.exit}, expected 0`);
  if (build.pageCount === null || build.pageCount !== redBuild.pageCount) {
    fail(`build page count ${build.pageCount}, expected the RED count ${redBuild.pageCount}`);
  }
  if (!build.theming_page_built) fail(`built static route page missing: ${THEMING_HTML_REL}`);
}

/** AC-1: the built introduction page's nav region carries the anchor inside
 * the Guides section, after every getting-started anchor. */
function assertBuiltNavRegion(builtNav: BuiltNavObservation, fail: Asserter): void {
  if (!builtNav.nav_region_found) fail(`nav[data-docs-nav] region not found in ${INTRO_HTML_REL}`);
  if (builtNav.theming_anchor_count !== 1) {
    fail(`built nav theming anchors ${builtNav.theming_anchor_count}, expected exactly 1`);
  }
  if (builtNav.guides_title_count !== 1) {
    fail(`built nav Guides titles ${builtNav.guides_title_count}, expected exactly 1`);
  }
  const themingAnchor = builtNav.anchors.find((anchor) => anchor.href === THEMING_HREF);
  if (themingAnchor?.section !== GUIDES_SECTION_TITLE) {
    fail(
      `theming anchor must sit inside the ${GUIDES_SECTION_TITLE} section, got ${themingAnchor?.section}`,
    );
  }
  const regionHrefs = builtNav.anchors.map((anchor) => anchor.href);
  const regionGettingStarted = builtNav.anchors
    .filter((anchor) => anchor.section === 'Getting started')
    .map((anchor) => anchor.href);
  if (!positionAfter(regionHrefs, THEMING_HREF, regionGettingStarted)) {
    fail('built nav theming anchor must follow every Getting started anchor');
  }
}

/** AC-2: preserved contracts — publishedDocs baseline and the real spec run. */
function assertPreservedContracts(
  red: RedRecord,
  derivation: NavObservation,
  spec: { command: string; exit: number | null },
  fail: Asserter,
): void {
  const redDerivation = red.derivation as NavObservation;
  if (
    JSON.stringify(derivation.published_hrefs) !== JSON.stringify(redDerivation.published_hrefs)
  ) {
    fail('publishedDocs derivation must be identical to its RED baseline');
  }
  if (derivation.published_theming_count !== 0) {
    fail(`publishedDocs theming count ${derivation.published_theming_count}, expected 0`);
  }
  if (spec.exit !== 0) fail(`${spec.command} exit ${spec.exit}, expected 0`);
}

/** AC-2: static gates and the exact scope boundary. */
function assertStaticGatesAndScope(gates: StaticGates, fail: Asserter): void {
  if (gates.typecheck.exit !== 0) fail(`pnpm typecheck exit ${gates.typecheck.exit}, expected 0`);
  const biomeEnvironmental = gates.biome.attempts.some(
    (attempt) => typeof attempt.note === 'string',
  );
  if (!gates.biome.passed && !biomeEnvironmental) {
    fail(
      `scoped biome gate must exit 0 or carry the environmental record: ${JSON.stringify(gates.biome.attempts)}`,
    );
  }
  const outsideAllowlist = gates.changed_paths_outside_tmp.filter((path) => !ALLOWLIST.has(path));
  if (outsideAllowlist.length > 0) {
    fail(`tracked diff outside the allowlist: ${JSON.stringify(gates.changed_paths_outside_tmp)}`);
  }
}

function assertGreen(
  red: RedRecord,
  derivation: NavObservation,
  build: BuildResult,
  builtNav: BuiltNavObservation,
  spec: { command: string; exit: number | null; tail: string },
  gates: StaticGates,
  fail: Asserter,
): void {
  assertRedBaseline(red, fail);
  assertDerivationSplit(derivation, fail);
  assertBuildRouteOwnership(
    (red.build as BuildResult) ?? {
      pageCount: null,
      exit: null,
      theming_page_built: false,
      command: '',
      tail: '',
    },
    build,
    fail,
  );
  assertBuiltNavRegion(builtNav, fail);
  assertPreservedContracts(red, derivation, spec, fail);
  assertStaticGatesAndScope(gates, fail);
}

// --- phases ------------------------------------------------------------------------------
function recordRed(
  identity: Record<string, string>,
  derivation: NavObservation,
  build: BuildResult,
  builtNav: BuiltNavObservation,
): void {
  const red = { phase: 'red', ...identity, derivation, build, built_nav: builtNav };
  writeFileSync(join(EVIDENCE_DIR, 'red.json'), `${JSON.stringify(red, null, 2)}\n`);
  console.error(
    `RED recorded: derivation carries ${derivation.theming_nav_count} /docs/theming nav entries and ` +
      `${derivation.guides_group_count} guides groups; publishedDocs baseline ` +
      `${derivation.published_hrefs.length} entries with ${derivation.published_theming_count} theming; ` +
      `build exit ${build.exit} at ${build.pageCount} page(s); built nav region: ` +
      `${builtNav.theming_anchor_count} theming anchors, ${builtNav.guides_title_count} Guides titles. ` +
      `Expected the guides group with exactly 1 theming entry — the nav inclusion is missing.`,
  );
  process.exitCode = 1;
}

function redSummary(red: RedRecord): Record<string, unknown> {
  return {
    candidate_sha: (red.candidate_sha as string | undefined) ?? null,
    ...redModuleSummary(red.derivation as NavObservation | undefined),
    ...redBuildSummary(red.build as BuildResult | undefined),
    ...redBuiltNavSummary(red.built_nav as BuiltNavObservation | undefined),
  };
}

function redModuleSummary(derivation: NavObservation | undefined): Record<string, unknown> {
  return {
    theming_nav_count: derivation?.theming_nav_count ?? null,
    guides_group_count: derivation?.guides_group_count ?? null,
    published_hrefs: derivation?.published_hrefs ?? null,
  };
}

function redBuildSummary(build: BuildResult | undefined): Record<string, unknown> {
  return { build_exit: build?.exit ?? null, page_count: build?.pageCount ?? null };
}

function redBuiltNavSummary(builtNav: BuiltNavObservation | undefined): Record<string, unknown> {
  return {
    nav_theming_anchors: builtNav?.theming_anchor_count ?? null,
    nav_guides_titles: builtNav?.guides_title_count ?? null,
  };
}

type GreenObservations = {
  identity: Record<string, string>;
  derivation: NavObservation;
  build: BuildResult;
  builtNav: BuiltNavObservation;
  spec: { command: string; exit: number | null; tail: string };
  gates: StaticGates;
  spec_side_effects_removed: string[];
};

/** Bind GREEN and the cross-phase run record: exact commands, exit codes, page
 * counts, derivation hrefs, and the nav-region anchors. */
function writeRunEvidence(red: RedRecord, o: GreenObservations): void {
  const green = { phase: 'green', ...o.identity, ...o };
  writeFileSync(join(EVIDENCE_DIR, 'green.json'), `${JSON.stringify(green, null, 2)}\n`);
  const redBuild = (red.build as BuildResult | undefined) ?? null;
  const run = {
    task: 'FIX-ORI-VIS-001-1',
    candidate: o.identity,
    commands: {
      selector: `pnpm exec tsx ${HARNESS_REL}`,
      build: BUILD_COMMAND,
      orientation_spec: PLAYWRIGHT_COMMAND,
      typecheck: 'pnpm typecheck',
      biome: o.gates.biome.command,
    },
    red: redSummary(red),
    green: {
      theming_nav_count: o.derivation.theming_nav_count,
      guides_group_hrefs: o.derivation.guides_group_hrefs,
      theming_after_getting_started: positionAfter(
        o.derivation.nav_hrefs,
        THEMING_HREF,
        o.derivation.getting_started_hrefs,
      ),
      published_hrefs: o.derivation.published_hrefs,
      build_exit: o.build.exit,
      page_count: o.build.pageCount,
      page_count_equal_to_red: o.build.pageCount === redBuild?.pageCount,
      theming_page_built: o.build.theming_page_built,
      nav_theming_anchors: o.builtNav.theming_anchor_count,
      nav_guides_titles: o.builtNav.guides_title_count,
      theming_anchor_section:
        o.builtNav.anchors.find((a) => a.href === THEMING_HREF)?.section ?? null,
      orientation_spec_exit: o.spec.exit,
      static_gates: { typecheck_exit: o.gates.typecheck.exit, biome: o.gates.biome },
      changed_paths_outside_tmp: o.gates.changed_paths_outside_tmp,
      spec_side_effects_removed: o.spec_side_effects_removed,
    },
  };
  writeFileSync(join(EVIDENCE_DIR, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
}

/** RED branch: the real build and the built dist nav HTML complete the absence
 * signature recorded before the line lands. */
function runRedPhase(identity: Record<string, string>, derivation: NavObservation): void {
  const build = runBuild();
  const builtNav = observeBuiltNav(INTRO_HTML_REL);
  recordRed(identity, derivation, build, builtNav);
}

export async function runThemingNavInclusionProof(): Promise<void> {
  mkdirSync(EVIDENCE_DIR, { recursive: true });
  const derivations = await importRealModule();
  const entries = loadAuthoredEntries();
  const identity = candidateIdentity();

  // Phase 1: module derivation over the real authored collection.
  const derivation = observeDerivations(derivations, entries);
  const preChange = derivation.theming_nav_count === 0 && derivation.guides_group_count === 0;
  if (preChange) {
    runRedPhase(identity, derivation);
    return;
  }

  // GREEN phase: same observations, then the preserved spec and the gates.
  const build = runBuild();
  const builtNav = observeBuiltNav(INTRO_HTML_REL);
  const spec = runPlaywright();
  const specSideEffectsRemoved = removeSpecSideEffects();
  const gates = runStaticGates();

  const failures: string[] = [];
  const redPath = join(EVIDENCE_DIR, 'red.json');
  const red: RedRecord = existsSync(redPath)
    ? (JSON.parse(readFileSync(redPath, 'utf8')) as RedRecord)
    : {};
  assertGreen(red, derivation, build, builtNav, spec, gates, (message) => failures.push(message));
  writeRunEvidence(red, {
    identity,
    derivation,
    build,
    builtNav,
    spec,
    gates,
    spec_side_effects_removed: specSideEffectsRemoved,
  });

  if (failures.length > 0) {
    console.error(`GREEN FAILED (${failures.length} assertion[s]):\n- ${failures.join('\n- ')}`);
    process.exitCode = 1;
    return;
  }
  const redBuild = (red.build as BuildResult | undefined) ?? null;
  console.log(
    `GREEN: derivation guides group = [${derivation.guides_group_hrefs.join(', ')}] after ` +
      `[${derivation.getting_started_hrefs.join(', ')}]; publishedDocs baseline unchanged ` +
      `(${derivation.published_hrefs.length} entries, ${derivation.published_theming_count} theming); ` +
      `build exit 0 at ${build.pageCount} page(s) (red: ${redBuild?.pageCount ?? null}); built nav region: ` +
      `${builtNav.theming_anchor_count} /docs/theming anchor inside "${GUIDES_SECTION_TITLE}"; ` +
      `orientation spec exit 0; static gates green; scope = ${JSON.stringify(gates.changed_paths_outside_tmp)}.`,
  );
}

let isMain = false;
try {
  isMain =
    Boolean(process.argv[1]) && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
} catch {
  isMain = (process.argv[1] ?? '').endsWith('theming-nav-inclusion-proof.test.ts');
}
if (isMain) {
  runThemingNavInclusionProof().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
