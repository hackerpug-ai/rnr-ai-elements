import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
  categoryFromItemType,
  type ExpectedDestination,
  searchCategories,
} from '../../apps/docs/src/lib/search-page-model';
import { expectedDestinations } from '../../scripts/docs-data/search-index';

/**
 * ORI-AST-004 — the real Pagefind index over the real built dist (gate 2).
 *
 * Every assertion runs against actual completed production HTML and the real
 * indexer entrypoint (`scripts/docs-data/search-index.ts`, which invokes the
 * Pagefind CLI over apps/docs/dist):
 *
 *   1. the typed published-destination model covers every emitted destination
 *      — all 56 registry items plus every published document — and
 *      categorizes samples from source data, never from URL text;
 *   2. the real indexer exits 0 over the built dist and emits a genuine
 *      Pagefind index whose entry file reports every expected page;
 *   3. each expected destination is emitted with a data-pagefind-body region
 *      carrying the prop, verdict, and hidden engine-panel content the
 *      contract requires to be searchable;
 *   4. the indexer FAILS CLOSED naming the destination when a required
 *      emitted destination is removed from an owned scratch copy of the real
 *      build.
 *
 * Nothing is fabricated: no synthetic documents, no authored index entries,
 * no relabeled unit proof. INTEGRATION tier — real filesystem, real build
 * outputs, real Pagefind CLI subprocess.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const DIST_DIR = join(repoRoot, 'apps', 'docs', 'dist');
const INDEX_SCRIPT = 'scripts/docs-data/search-index.ts';
const SCRATCH_ROOT = join(repoRoot, '.tmp', 'ORI-AST-004', 'search-index-scratch');

// Duplicated from island-budget.test.ts on purpose (same precedent): the
// SAME filesystem lock, because both lanes build/inspect the same dist/.
const lockDir = join(repoRoot, 'node_modules/.cache/FUSE-01-docs-build.lock');
const LOCK_TIMEOUT_MS = 15 * 60_000;

function acquireBuildLock(): void {
  mkdirSync(join(repoRoot, 'node_modules/.cache'), { recursive: true });
  const startedAt = Date.now();
  for (;;) {
    try {
      mkdirSync(lockDir);
      return;
    } catch {
      if (Date.now() - startedAt > LOCK_TIMEOUT_MS) {
        throw new Error(`timed out waiting for docs build lock at ${lockDir}`);
      }
      try {
        if (Date.now() - statSync(lockDir).mtimeMs > LOCK_TIMEOUT_MS) {
          rmSync(lockDir, { recursive: true, force: true });
        }
      } catch {
        // Lock vanished between mkdir and stat — retry the acquire.
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

function releaseBuildLock(): void {
  rmSync(lockDir, { recursive: true, force: true });
}

/** The real production build chain (registry -> gallery -> docs data -> astro). */
function runBuildChain(): { status: number | null; output: string } {
  acquireBuildLock();
  try {
    const result = spawnSync(
      'sh',
      [
        '-c',
        'pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build',
      ],
      { cwd: repoRoot, encoding: 'utf8', env: process.env, maxBuffer: 64 * 1024 * 1024 },
    );
    return {
      status: result.status,
      output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
    };
  } finally {
    releaseBuildLock();
  }
}

/** The real task-owned indexer entrypoint against a real dist directory. */
function runIndexer(siteDir: string): { status: number | null; output: string } {
  const result = spawnSync('pnpm', ['exec', 'tsx', INDEX_SCRIPT, '--site', siteDir], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
  };
}

/** The emitted HTML of one expected destination, read from the real dist. */
function destinationHtml(destination: ExpectedDestination): string {
  return readFileSync(join(DIST_DIR, destination.href, 'index.html'), 'utf8');
}

/** The main[data-pagefind-body] region of one emitted document. */
function pagefindBodyRegion(html: string): string {
  const start = html.indexOf('data-pagefind-body');
  expect(start, 'the document carries a data-pagefind-body region').toBeGreaterThan(-1);
  const mainStart = html.lastIndexOf('<main', start);
  const mainEnd = html.indexOf('</main>', start);
  expect(mainEnd, 'the pagefind body region closes').toBeGreaterThan(mainStart);
  return html.slice(mainStart, mainEnd);
}

describe('ORI-AST-004 real Pagefind index', () => {
  it('ORI-AST-004-index-model: the typed destination model covers every real emitted destination', () => {
    const destinations = expectedDestinations();
    const itemDestinations = destinations.filter((destination) => destination.kind === 'item');
    const docDestinations = destinations.filter((destination) => destination.kind === 'doc');

    // 56 actual registry items plus every published document; nothing invented.
    expect(itemDestinations.length, 'all 56 registry item destinations').toBe(56);
    expect(docDestinations.map((destination) => destination.href)).toEqual([
      '/docs/cli',
      '/docs/dark-mode',
      '/docs/installation',
      '/docs/introduction',
      '/docs/owns-vs-does-not-own',
      '/docs/quickstart',
      '/docs/theming',
    ]);
    expect(
      new Set(destinations.map((destination) => destination.href)).size,
      'destination hrefs are unique',
    ).toBe(destinations.length);

    // Categories derive from source data, never /components URL prefixes:
    // the ui and lib items keep their kinds while living under /components/.
    expect(categoryFromItemType('registry:component')).toBe('components');
    expect(categoryFromItemType('registry:ui')).toBe('ui');
    expect(categoryFromItemType('registry:lib')).toBe('lib');
    const uiItem = itemDestinations.find((destination) => destination.href === '/components/item');
    const libItem = itemDestinations.find(
      (destination) => destination.href === '/components/stack-trace-parser',
    );
    expect(uiItem?.category, 'the ui item keeps its source-backed kind').toBe('ui');
    expect(libItem?.category, 'the lib item keeps its source-backed kind').toBe('lib');
    for (const doc of docDestinations) {
      expect(doc.category, 'published documents group as pages').toBe('pages');
    }
    expect([...searchCategories()]).toEqual(['components', 'ui', 'lib', 'pages']);
  });

  it('ORI-AST-004-index-model: a known item type outside the vocabulary fails closed', () => {
    expect(() => categoryFromItemType('registry:unknown')).toThrow(/registry:unknown/);
  });

  it('ORI-AST-004-indexer: the real indexer indexes the real built dist', {
    timeout: 900_000,
  }, () => {
    if (!existsSync(join(DIST_DIR, 'index.html'))) {
      const build = runBuildChain();
      expect(build.status, `docs build chain exited ${build.status}\n${build.output}`).toBe(0);
    }

    const index = runIndexer(DIST_DIR);
    expect(index.status, `search indexer exited ${index.status}\n${index.output}`).toBe(0);
    expect(index.output).toContain('Indexed');

    // The real Pagefind entry file reports one language covering every page.
    const entryPath = join(DIST_DIR, 'pagefind', 'pagefind-entry.json');
    expect(existsSync(entryPath), 'pagefind-entry.json exists in the real dist').toBe(true);
    const entry = JSON.parse(readFileSync(entryPath, 'utf8')) as {
      version: string;
      languages: Record<string, { page_count: number }>;
    };
    const destinations = expectedDestinations();
    const pageCount = Object.values(entry.languages).reduce(
      (total, language) => total + language.page_count,
      0,
    );
    expect(
      pageCount,
      `the index covers all ${destinations.length} expected destinations`,
    ).toBeGreaterThanOrEqual(destinations.length);
    expect(entry.version, 'the index was produced by the real Pagefind').toMatch(/^\d+\.\d+/);
  });

  it('ORI-AST-004-index-content: emitted bodies carry props, verdicts, and hidden engine panels', () => {
    const destinations = expectedDestinations();

    // Every expected destination is emitted with a searchable body region.
    for (const destination of destinations) {
      const htmlPath = join(DIST_DIR, destination.href, 'index.html');
      expect(
        existsSync(htmlPath),
        `expected published destination is emitted: ${destination.href}`,
      ).toBe(true);
      expect(
        destinationHtml(destination).includes('data-pagefind-body'),
        `${destination.href} exposes a data-pagefind-body search region`,
      ).toBe(true);
    }

    // Prop content: nearBottomThreshold inside Conversation's indexed region.
    const conversation = destinations.find(
      (destination) => destination.href === '/components/conversation',
    );
    expect(conversation).toBeDefined();
    const conversationBody = pagefindBodyRegion(
      destinationHtml(conversation as ExpectedDestination),
    );
    expect(conversationBody).toContain('nearBottomThreshold');

    // Verdict text: the real expo verdict phrase inside the indexed region.
    // (Every current item is Expo-Go-clean; the dev-client consequence text
    // lives on the boundary document — the corpus has no dev-client item.)
    expect(conversationBody).toContain('runs in Expo Go');
    const boundary = destinations.find(
      (destination) => destination.href === '/docs/owns-vs-does-not-own',
    );
    expect(boundary).toBeDefined();
    expect(pagefindBodyRegion(destinationHtml(boundary as ExpectedDestination))).toContain(
      'dev client',
    );

    // Hidden engine panels: the uniwind command lives inside the indexed
    // region of item documents (the inactive TabGroup panel is hidden only).
    const messageBody = pagefindBodyRegion(
      destinationHtml(
        destinations.find((destination) => destination.href === '/components/message') ??
          ({} as ExpectedDestination),
      ),
    );
    expect(messageBody).toContain('/r/uniwind/message.json');
  });

  it('ORI-AST-004-index-fail-closed: removing one emitted destination fails the indexer naming it', {
    timeout: 300_000,
  }, () => {
    if (!existsSync(join(DIST_DIR, 'index.html'))) {
      const build = runBuildChain();
      expect(build.status, `docs build chain exited ${build.status}\n${build.output}`).toBe(0);
    }

    rmSync(SCRATCH_ROOT, { recursive: true, force: true });
    mkdirSync(join(SCRATCH_ROOT, '..'), { recursive: true });
    cpSync(DIST_DIR, SCRATCH_ROOT, { recursive: true });
    const removed = join(SCRATCH_ROOT, 'components', 'conversation');
    rmSync(removed, { recursive: true, force: true });

    const failure = runIndexer(SCRATCH_ROOT);
    try {
      expect(
        failure.status,
        `the indexer must fail closed on a missing destination\n${failure.output}`,
      ).not.toBe(0);
      expect(failure.output).toContain('/components/conversation');
    } finally {
      rmSync(SCRATCH_ROOT, { recursive: true, force: true });
    }
  });
});
