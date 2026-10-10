/**
 * APX-031 — refuse an upload unless dist carries all 112 registry items,
 * both registry indexes, and the committed _headers byte-for-byte.
 *
 * Read-only preflight for the deploy job. Compares apps/docs/dist (or --dist)
 * against committed root public/r and tracked apps/docs/public/_headers.
 * Expected item set comes from packages/registry/registry.json × ENGINES —
 * never from listing dist.
 *
 * Host-side node:fs / node:crypto / node:path / node:child_process only.
 */
// CLI entry spawned via tsx, never imported — same directive as prepare.ts.
// fallow-ignore-file unused-file
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ENGINES } from '../../packages/registry/scripts/build-registry';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIST_DEFAULT = join(REPO_ROOT, 'apps', 'docs', 'dist');
const HEADERS_SRC = join(REPO_ROOT, 'apps', 'docs', 'public', '_headers');
const REDIRECTS_SRC = join(REPO_ROOT, 'apps', 'docs', 'public', '_redirects');
const REGISTRY_JSON = join(REPO_ROOT, 'packages', 'registry', 'registry.json');
const HEADERS_REPO_PATH = 'apps/docs/public/_headers';
const REDIRECTS_REPO_PATH = 'apps/docs/public/_redirects';
const ITEM_COUNT = 56;

const OK_LINE =
  '[docs-deploy] preflight ok: nativewind 56/56 items + registry.json, uniwind 56/56 items + registry.json (114 files byte-equal public/r at HEAD); _headers byte-equal apps/docs/public/_headers (tracked)';

interface CliArgs {
  dist: string;
}

type Offender =
  | `missing ${string}`
  | `extra ${string}`
  | `differs ${string}`
  | `untracked ${string}`
  | 'public/r differs from HEAD';

function sha256File(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

// fallow-ignore-next-line complexity
function walkFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile()) out.push(relative(dir, full).split(sep).join('/'));
    }
  }
  return out.sort();
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { dist: DIST_DEFAULT };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    if (flag === '--dist') {
      args.dist = resolve(argv[i + 1] ?? DIST_DEFAULT);
      i++;
      continue;
    }
    console.error(`[docs-deploy] preflight FAILED: unknown argument: ${flag}`);
    process.exit(1);
  }
  return args;
}

function loadItemNames(): string[] {
  const raw = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8')) as {
    items: Array<{ name: string }>;
  };
  return raw.items.map((item) => item.name).sort();
}

function expectedRelPaths(names: string[]): Set<string> {
  const expected = new Set<string>();
  for (const engine of ENGINES) {
    expected.add(`r/${engine}/registry.json`);
    for (const name of names) {
      expected.add(`r/${engine}/${name}.json`);
    }
  }
  return expected;
}

function git(args: string[]): { status: number; stdout: string } {
  const result = spawnSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: process.env,
  });
  return { status: result.status ?? -1, stdout: result.stdout ?? '' };
}

function isTracked(repoPath: string): boolean {
  return git(['ls-files', '--', repoPath])
    .stdout.split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .includes(repoPath);
}

function publicRDiffersFromHead(): boolean {
  if (git(['diff', '--cached', '--exit-code', 'HEAD', '--', 'public/r']).status !== 0) {
    return true;
  }
  return git(['diff', '--exit-code', 'HEAD', '--', 'public/r']).status !== 0;
}

function countPresentItems(dist: string, engine: string, names: string[]): number {
  return names.filter((name) => existsSync(join(dist, 'r', engine, `${name}.json`))).length;
}

function classifyExpectedPath(dist: string, rel: string): Offender | null {
  const distPath = join(dist, rel);
  if (!existsSync(distPath)) return `missing ${rel}`;
  const publicPath = join(REPO_ROOT, 'public', rel);
  if (!existsSync(publicPath) || sha256File(distPath) !== sha256File(publicPath)) {
    return `differs ${rel}`;
  }
  return null;
}

function compareExpected(dist: string, expected: Set<string>, offenders: Offender[]): void {
  for (const rel of [...expected].sort()) {
    const offender = classifyExpectedPath(dist, rel);
    if (offender) offenders.push(offender);
  }
}

function collectExtras(dist: string, expected: Set<string>, offenders: Offender[]): void {
  for (const rel of walkFiles(join(dist, 'r'))) {
    const distRel = `r/${rel}`;
    if (!expected.has(distRel)) offenders.push(`extra ${distRel}`);
  }
}

// fallow-ignore-next-line complexity
function checkHeaders(dist: string, offenders: Offender[]): void {
  if (!isTracked(HEADERS_REPO_PATH)) offenders.push(`untracked ${HEADERS_REPO_PATH}`);
  const distHeaders = join(dist, '_headers');
  if (!existsSync(distHeaders)) {
    offenders.push('missing _headers');
    return;
  }
  if (!existsSync(HEADERS_SRC) || sha256File(distHeaders) !== sha256File(HEADERS_SRC)) {
    offenders.push('differs _headers');
  }
}

// fallow-ignore-next-line complexity
function checkRedirects(dist: string, offenders: Offender[]): void {
  if (!isTracked(REDIRECTS_REPO_PATH)) return;
  const distRedirects = join(dist, '_redirects');
  if (!existsSync(distRedirects)) {
    offenders.push('missing _redirects');
    return;
  }
  if (!existsSync(REDIRECTS_SRC) || sha256File(distRedirects) !== sha256File(REDIRECTS_SRC)) {
    offenders.push('differs _redirects');
  }
}

function failWith(names: string[], dist: string, offenders: Offender[]): never {
  const nw = countPresentItems(dist, 'nativewind', names);
  const uw = countPresentItems(dist, 'uniwind', names);
  console.log(
    `[docs-deploy] preflight FAILED: nativewind ${nw}/${ITEM_COUNT} items, uniwind ${uw}/${ITEM_COUNT} items`,
  );
  for (const line of offenders) console.log(line);
  process.exit(1);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const names = loadItemNames();
  if (names.length !== ITEM_COUNT) {
    console.error(
      `[docs-deploy] preflight FAILED: registry.json lists ${names.length} items, expected ${ITEM_COUNT}`,
    );
    process.exit(1);
  }

  const expected = expectedRelPaths(names);
  const offenders: Offender[] = [];
  if (publicRDiffersFromHead()) offenders.push('public/r differs from HEAD');
  compareExpected(args.dist, expected, offenders);
  collectExtras(args.dist, expected, offenders);
  checkHeaders(args.dist, offenders);
  checkRedirects(args.dist, offenders);
  if (offenders.length > 0) failWith(names, args.dist, offenders);
  console.log(OK_LINE);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
