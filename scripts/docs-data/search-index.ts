/**
 * SearchIndex (ORI-AST-004) — the real post-build Pagefind indexer for the
 * docs site: real emitted HTML in, real `dist/pagefind/` output out.
 *
 * Ordered invocation is owned by CI after the Astro build; locally the same
 * entrypoint runs by hand:
 *
 *   pnpm exec tsx scripts/docs-data/search-index.ts [--site <dist-dir>]
 *
 * Fail-closed discipline:
 *   - every expected published destination (all 56 registry items plus every
 *     published, non-draft document, including the boundary page and the
 *     reserved /docs/theming static route) must exist as emitted
 *     `<href>/index.html` under the site dir — a missing destination aborts
 *     the index NAMING it, never silently omitted;
 *   - the real Pagefind CLI (pinned version, resolved through `pnpm dlx` so
 *     no package.json/lockfile change is needed) must exit 0;
 *   - the emitted pagefind-entry.json must report at least one indexed page
 *     per expected destination.
 *
 * The CLI body runs ONLY when executed directly (the vitest integration test
 * imports the derivation functions without triggering an index run).
 * Draft documents are excluded from the expected set — they emit no route, so
 * indexing them is impossible by construction; the dialog renders outside the
 * `data-pagefind-body` regions, so navigation and dialog chrome are excluded
 * by the same marker contract, and no 404 document exists in the pre-recovery
 * candidate (ORI-AST-009 composes it later).
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  type DestinationDocSource,
  deriveExpectedDestinations,
  type ExpectedDestination,
} from '../../apps/docs/src/lib/search-page-model';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const ITEMS_JSON = join(REPO_ROOT, 'apps/docs/src/data/registry-items.json');
const CONTENT_DOCS_DIR = join(REPO_ROOT, 'apps/docs/src/content/docs');
const DEFAULT_SITE_DIR = join(REPO_ROOT, 'apps/docs/dist');
/** Pinned for reproducible indexes; resolved at run time through pnpm dlx. */
const PAGEFIND_VERSION = '1.5.2';

/** The `draft: true` frontmatter flag, read from the raw source bytes. */
function isDraftSource(sourcePath: string): boolean {
  const source = readFileSync(sourcePath, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return false;
  return /^\s*draft:\s*true\s*$/m.test(frontmatter[1]);
}

/** The `title:` frontmatter value, when present (first line only). */
function frontmatterTitle(sourcePath: string): string | undefined {
  const source = readFileSync(sourcePath, 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) return undefined;
  const title = frontmatter[1].match(/^\s*title:\s*["']?([^"'\n]+)["']?\s*$/m);
  return title ? title[1].trim() : undefined;
}

/** The published-destination list derived from the candidate's real sources. */
function deriveExpectedDestinationsFromSources(
  itemsJsonPath: string = ITEMS_JSON,
  contentDocsDir: string = CONTENT_DOCS_DIR,
): ExpectedDestination[] {
  const items = JSON.parse(readFileSync(itemsJsonPath, 'utf8')) as {
    name: string;
    type: string;
    title: string;
  }[];
  const docs: DestinationDocSource[] = readdirSync(contentDocsDir)
    .filter((entry) => entry.endsWith('.md') || entry.endsWith('.mdx'))
    .map((entry) => {
      const sourcePath = join(contentDocsDir, entry);
      const id = entry.replace(/\.(md|mdx)$/, '');
      return { id, draft: isDraftSource(sourcePath), title: frontmatterTitle(sourcePath) };
    });
  return deriveExpectedDestinations(items, docs);
}

/** The fs-backed expected-destination list the integration test asserts over. */
/** Exported for the vitest integration gate (tests/sprint-05-orient-search/
 * search-index.test.ts), which asserts the derivation against the real dist. */
export function expectedDestinations(): ExpectedDestination[] {
  return deriveExpectedDestinationsFromSources();
}

/** Fail closed naming every expected destination that the build did not emit. */
function assertDestinationsEmitted(
  siteDir: string,
  destinations: readonly ExpectedDestination[],
): void {
  const missing = destinations.filter(
    (destination) => !existsSync(join(siteDir, ...destination.href.split('/'), 'index.html')),
  );
  if (missing.length > 0) {
    const listed = missing.map((destination) => destination.href).join(', ');
    throw new Error(
      `[search-index] missing expected published destination(s) under ${siteDir}: ${listed} — ` +
        'the build did not emit the full published corpus; refusing to index a partial site.',
    );
  }
}

/** Run the real Pagefind CLI over the completed dist; never intercept it. */
function runPagefind(siteDir: string): { status: number | null; output: string } {
  const result = spawnSync('pnpm', ['dlx', `pagefind@${PAGEFIND_VERSION}`, '--site', siteDir], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  };
}

function parseSiteDir(argv: readonly string[]): string {
  const siteFlag = argv.indexOf('--site');
  if (siteFlag === -1) return DEFAULT_SITE_DIR;
  const value = argv[siteFlag + 1];
  if (!value) {
    throw new Error('[search-index] --site requires a directory argument');
  }
  return resolve(value);
}

function main(): void {
  const siteDir = parseSiteDir(process.argv);
  const destinations = deriveExpectedDestinationsFromSources();
  const itemCount = destinations.filter((destination) => destination.kind === 'item').length;
  const docCount = destinations.filter((destination) => destination.kind === 'doc').length;
  console.log(
    `[search-index] ${destinations.length} expected destinations (${itemCount} items, ${docCount} docs) derived from the real sources`,
  );

  assertDestinationsEmitted(siteDir, destinations);
  console.log(`[search-index] all expected destinations emitted under ${siteDir}`);

  const index = runPagefind(siteDir);
  if (index.status !== 0) {
    throw new Error(`[search-index] pagefind exited ${index.status}\n${index.output}`);
  }
  console.log(index.output.trim());

  const entryPath = join(siteDir, 'pagefind', 'pagefind-entry.json');
  if (!existsSync(entryPath)) {
    throw new Error('[search-index] pagefind produced no pagefind-entry.json');
  }
  const entry = JSON.parse(readFileSync(entryPath, 'utf8')) as {
    languages: Record<string, { page_count: number }>;
  };
  const pageCount = Object.values(entry.languages).reduce(
    (total, language) => total + language.page_count,
    0,
  );
  if (pageCount < destinations.length) {
    throw new Error(
      `[search-index] index covers ${pageCount} pages but ${destinations.length} destinations are expected`,
    );
  }
  console.log(
    `[search-index] index complete: ${pageCount} pages cover all ${destinations.length} expected destinations`,
  );
}

// Run as CLI only; importers (the vitest integration gate) get pure functions.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main();
}
