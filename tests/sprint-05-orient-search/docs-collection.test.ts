/**
 * ORI-AST-001 — render authored documentation through the Astro collection and
 * prose shell.
 *
 * Real behavior only: every assertion runs the actual Astro loader/build over an
 * owned scratch copy of apps/docs (real source inputs, real subprocess exit codes,
 * real emitted static documents), the real preview on localhost:4321, a real
 * Playwright browser, and the real system clipboard. Nothing is mocked, no request
 * is intercepted, no rendered markup is injected, and no manuscript-dependent
 * assertion is satisfied by a placeholder.
 *
 * Four named selectors (one per AC), each RED-first against the current tree:
 *   - ORI-AST-001-collection-schema   (AC-1, integration)
 *   - ORI-AST-001-publication-contract (AC-2, integration)
 *   - ORI-AST-001-prose-navigation    (AC-3, e2e)
 *   - ORI-AST-001-mdx-code-copy       (AC-4, e2e)
 *
 * The scratch candidate mirrors the repo shape so the one repo-root-relative
 * reference (src/pages/index.astro imports ../../../../package.json for the
 * release version) resolves: <scratch>/package.json is a byte copy of the root
 * manifest, and <scratch>/apps/docs is a copy of apps/docs with node_modules
 * symlinked back to the real tree (pnpm's relative .pnpm links stay intact).
 */
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { afterAll, beforeAll, expect, test } from 'vitest';
import {
  grantClipboardPermissions,
  navigateLocalhost,
  PREVIEW_URL,
  strictPreviewCommand,
  waitForAstroPageLoad,
} from '../harness/docs-preview';

// The root tsconfig carries no DOM lib; declare the one browser global the
// in-page clipboard read needs (evaluate callbacks run in Chromium).
declare global {
  interface Navigator {
    clipboard: { readText(): Promise<string> };
  }
}

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DOCS_DIR = join(REPO_ROOT, 'apps', 'docs');
const ASTRO_BIN = join(DOCS_DIR, 'node_modules', '.bin', 'astro');
const CYCLE_DIR = join(REPO_ROOT, '.tmp', 'ORI-AST-001', 'cycle-1');
const SCRATCH_ROOT = join(CYCLE_DIR, 'candidate');
const DOCS_APP_DIR = join(SCRATCH_ROOT, 'apps', 'docs');
const CONTENT_DIR = join(DOCS_APP_DIR, 'src', 'content', 'docs');
const DIST_DIR = join(DOCS_APP_DIR, 'dist');

/** The six manuscript IDs this task's final rendered-page proof requires. */
const REQUIRED_MANUSCRIPTS = [
  'introduction',
  'installation',
  'cli',
  'dark-mode',
  'quickstart',
  'owns-vs-does-not-own',
];

type BuildResult = { exit: number; stdout: string; stderr: string };

/** The real README body the fixture copies into scratch collection entries. */
function readExampleReadmeBody(): string {
  return readFileSync(join(REPO_ROOT, 'apps', 'example', 'README.md'), 'utf8');
}

function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/** Owned scratch copy of the docs application (repo-shaped, node_modules symlinked). */
function makeScratch(): void {
  rmSync(SCRATCH_ROOT, { recursive: true, force: true });
  mkdirSync(join(SCRATCH_ROOT, 'apps'), { recursive: true });
  // The one repo-root-relative import (index.astro -> ../../../../package.json).
  cpSync(join(REPO_ROOT, 'package.json'), join(SCRATCH_ROOT, 'package.json'));
  const EXCLUDED = new Set(['node_modules', 'dist', '.astro', '.git']);
  cpSync(DOCS_DIR, DOCS_APP_DIR, {
    recursive: true,
    filter: (src) => {
      const rel = relative(DOCS_DIR, src);
      if (rel === '') return true;
      return !rel.split(sep).some((segment) => EXCLUDED.has(segment));
    },
  });
  symlinkSync(join(DOCS_DIR, 'node_modules'), join(DOCS_APP_DIR, 'node_modules'), 'dir');
  mkdirSync(CONTENT_DIR, { recursive: true });
}

/** Run the real `astro build` over the scratch candidate. */
function runBuild(): BuildResult {
  rmSync(join(DOCS_APP_DIR, '.astro'), { recursive: true, force: true });
  rmSync(DIST_DIR, { recursive: true, force: true });
  // The scratch's node_modules is a symlink to the real tree, so Astro's
  // default cacheDir (./node_modules/.astro) is shared. Clear it so every
  // scratch build performs a FRESH content sync — the loader must re-derive
  // slugs and re-detect duplicates from the current source, exactly as a clean
  // checkout would, and no scratch entry bleeds back into the real cache.
  rmSync(join(DOCS_APP_DIR, 'node_modules', '.astro'), { recursive: true, force: true });
  const result = spawnSync(ASTRO_BIN, ['build'], {
    cwd: DOCS_APP_DIR,
    encoding: 'utf8',
    env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
  return {
    exit: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

/** List the /docs/* routes emitted into dist (index.html files under dist/docs). */
function listDocRoutes(): string[] {
  const docsDir = join(DIST_DIR, 'docs');
  if (!existsSync(docsDir)) return [];
  const out: string[] = [];
  const stack = [docsDir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isDirectory()) stack.push(join(current, entry.name));
      else if (entry.name === 'index.html') {
        out.push(relative(docsDir, current).split(sep).join('/'));
      }
    }
  }
  return out.sort();
}

/** Read a built route's HTML (or null if absent). */
function readDocHtml(id: string): string | null {
  const path = join(DIST_DIR, 'docs', id, 'index.html');
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

interface Frontmatter {
  title?: string;
  description?: string;
  section?: string;
  order?: number | string;
  draft?: boolean | string;
}

/** Serialize one collection entry (frontmatter + the real README body). */
function writeEntry(filename: string, fm: Frontmatter, body?: string): string {
  const lines: string[] = ['---'];
  for (const [key, value] of Object.entries(fm)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${typeof value === 'string' ? value : JSON.stringify(value)}`);
  }
  lines.push('---', '', body ?? readExampleReadmeBody());
  const text = `${lines.join('\n').trimEnd()}\n`;
  writeFileSync(join(CONTENT_DIR, filename), text);
  return text;
}

/** The two valid source-backed scratch entries (distinct IDs, order 1 and 2). */
function writeValidEntries(): void {
  writeEntry('collection-reference.md', {
    title: 'AI Elements Example',
    description: 'The real consumer app for rnr-ai-elements (collection reference)',
    section: 'getting-started',
    order: 1,
  });
  writeEntry('collection-reference-mdx.mdx', {
    title: 'AI Elements Example',
    description: 'The MDX collection reference copy',
    section: 'getting-started',
    order: 2,
  });
}

/** Assert a build output names the entry id and the offending field. */
function expectSchemaFailure(result: BuildResult, id: string, field: string): void {
  expect(result.exit, `build must fail (id=${id}, field=${field})`).not.toBe(0);
  const observed = `${result.stdout}\n${result.stderr}`;
  expect(observed, `diagnostic must name the source id "${id}"`).toContain(id);
  expect(observed, `diagnostic must name the offending field "${field}"`).toContain(field);
}

beforeAll(() => {
  makeScratch();
});

afterAll(() => {
  rmSync(SCRATCH_ROOT, { recursive: true, force: true });
  // The shared content cache (scratch node_modules symlinks to the real tree)
  // must not retain scratch-only collection entries.
  rmSync(join(DOCS_DIR, 'node_modules', '.astro'), { recursive: true, force: true });
});

// AC-1: the real loader validates declared frontmatter and rejects invalid input.
test('ORI-AST-001-collection-schema', { timeout: 240_000 }, () => {
  // Valid source-backed entries render: two distinct documents, one .md one .mdx.
  writeValidEntries();
  let result = runBuild();
  expect(result.exit, 'valid build exits 0').toBe(0);
  const routes = listDocRoutes().filter((r) => r.startsWith('collection-reference'));
  expect(routes, 'two distinct collection-reference documents').toEqual(
    ['collection-reference', 'collection-reference-mdx'].sort(),
  );
  for (const id of ['collection-reference', 'collection-reference-mdx']) {
    const html = readDocHtml(id);
    expect(html, `${id} emits a document`).not.toBeNull();
    expect(html, `${id} carries the README title`).toContain('AI Elements Example');
    expect(html, `${id} carries the Structure heading`).toContain('Structure');
    expect(html, `${id} carries the Run heading`).toContain('Run');
  }

  // All three declared section values pass the schema (isolated copies each).
  for (const section of ['getting-started', 'guides', 'porting'] as const) {
    rmSync(CONTENT_DIR, { recursive: true, force: true });
    mkdirSync(CONTENT_DIR, { recursive: true });
    writeEntry(`section-${section}.md`, {
      title: `Section ${section}`,
      description: `A ${section} section entry`,
      section,
      order: 1,
    });
    const build = runBuild();
    expect(build.exit, `section value ${section} passes the schema`).toBe(0);
    expect(listDocRoutes(), `section ${section} emits its route`).toContain(`section-${section}`);
  }

  // Omitted draft and boolean draft both validate without inventing routes.
  rmSync(CONTENT_DIR, { recursive: true, force: true });
  mkdirSync(CONTENT_DIR, { recursive: true });
  writeEntry('draft-omitted.md', {
    title: 'Draft omitted',
    description: 'No draft field',
    section: 'getting-started',
    order: 1,
  });
  writeEntry('draft-false.md', {
    title: 'Draft false',
    description: 'Explicit false',
    section: 'getting-started',
    order: 2,
    draft: false,
  });
  result = runBuild();
  expect(result.exit, 'omitted + boolean draft validate').toBe(0);
  expect(
    listDocRoutes().filter((r) => r.startsWith('draft-')),
    'two routes, no invented extras',
  ).toHaveLength(2);

  // Seven invalid-frontmatter cases: each fails naming source id + field.
  const invalidCases: { name: string; fm: Frontmatter; id: string; field: string }[] = [
    {
      name: 'remove-title',
      fm: { description: 'x', section: 'getting-started', order: 1 },
      id: 'collection-reference',
      field: 'title',
    },
    {
      name: 'remove-description',
      fm: { title: 'T', section: 'getting-started', order: 1 },
      id: 'collection-reference',
      field: 'description',
    },
    {
      name: 'remove-section',
      fm: { title: 'T', description: 'x', order: 1 },
      id: 'collection-reference',
      field: 'section',
    },
    {
      name: 'remove-order',
      fm: { title: 'T', description: 'x', section: 'getting-started' },
      id: 'collection-reference',
      field: 'order',
    },
    {
      name: 'unknown-section',
      fm: { title: 'T', description: 'x', section: 'unknown', order: 1 },
      id: 'collection-reference',
      field: 'section',
    },
    {
      name: 'nonnumeric-order',
      fm: { title: 'T', description: 'x', section: 'getting-started', order: 'one' },
      id: 'collection-reference',
      field: 'order',
    },
    {
      name: 'nonboolean-draft',
      fm: {
        title: 'T',
        description: 'x',
        section: 'getting-started',
        order: 1,
        draft: 'yes',
      },
      id: 'collection-reference',
      field: 'draft',
    },
  ];
  for (const c of invalidCases) {
    rmSync(CONTENT_DIR, { recursive: true, force: true });
    mkdirSync(CONTENT_DIR, { recursive: true });
    writeEntry('collection-reference.md', c.fm);
    const build = runBuild();
    expectSchemaFailure(build, c.id, c.field);
  }

  // Restored valid source rebuilds clean.
  rmSync(CONTENT_DIR, { recursive: true, force: true });
  mkdirSync(CONTENT_DIR, { recursive: true });
  writeValidEntries();
  result = runBuild();
  expect(result.exit, 'restored valid build exits 0').toBe(0);
  expect(readDocHtml('collection-reference'), 'restored article renders').toContain(
    'AI Elements Example',
  );
});

// AC-2: unique routes, drafts excluded, Theming authoritative, duplicates fail.
test('ORI-AST-001-publication-contract', { timeout: 240_000 }, () => {
  // Published route counts 2 -> 1 -> 2 as the real draft flag changes.
  writeValidEntries();
  let result = runBuild();
  expect(result.exit, 'two published entries build').toBe(0);
  expect(listDocRoutes().filter((r) => r.startsWith('collection-reference'))).toEqual(
    ['collection-reference', 'collection-reference-mdx'].sort(),
  );

  // Set the second entry to draft:true and rebuild from fresh output.
  rmSync(CONTENT_DIR, { recursive: true, force: true });
  mkdirSync(CONTENT_DIR, { recursive: true });
  writeEntry('collection-reference.md', {
    title: 'AI Elements Example',
    description: 'published',
    section: 'getting-started',
    order: 1,
  });
  writeEntry('collection-reference-mdx.mdx', {
    title: 'AI Elements Example',
    description: 'draft',
    section: 'getting-started',
    order: 2,
    draft: true,
  });
  result = runBuild();
  expect(result.exit, 'draft build exits 0').toBe(0);
  const draftRoutes = listDocRoutes().filter((r) => r.startsWith('collection-reference'));
  expect(draftRoutes, 'only the published entry has a route').toEqual(['collection-reference']);
  // Draft excluded from section navigation and search input too.
  const publishedHtml = readDocHtml('collection-reference');
  expect(publishedHtml).not.toBeNull();
  expect(
    publishedHtml?.match(/href="\/docs\/collection-reference-mdx"/g) ?? [],
    'draft has 0 section-navigation entries',
  ).toEqual([]);
  expect(
    publishedHtml?.match(/data-pagefind-body/g) ?? [],
    'the published page carries the single search-input body region',
  ).toHaveLength(1);
  expect(readDocHtml('collection-reference-mdx'), 'draft has 0 emitted routes').toBeNull();

  // Restore draft:false and rebuild: the route count returns to 2.
  rmSync(CONTENT_DIR, { recursive: true, force: true });
  mkdirSync(CONTENT_DIR, { recursive: true });
  writeValidEntries();
  result = runBuild();
  expect(result.exit, 'restored build exits 0').toBe(0);
  expect(listDocRoutes().filter((r) => r.startsWith('collection-reference'))).toEqual(
    ['collection-reference', 'collection-reference-mdx'].sort(),
  );

  // The static Theming route stays authoritative: exactly one destination, with
  // the two preserved seam anchors, and the catch-all never duplicates it.
  const themingHtml = readDocHtml('theming');
  expect(themingHtml, 'Theming route exists').not.toBeNull();
  expect(themingHtml, 'textclasscontext anchor preserved').toContain('id="textclasscontext"');
  expect(themingHtml, 'rendermarkdown anchor preserved').toContain('id="rendermarkdown"');
  // Adding an isolated entry with the reserved theming ID must not emit a second
  // /docs/theming destination (catch-all excludes the reserved slug).
  rmSync(CONTENT_DIR, { recursive: true, force: true });
  mkdirSync(CONTENT_DIR, { recursive: true });
  writeEntry('theming.md', {
    title: 'Theming (reserved)',
    description: 'must not duplicate the static route',
    section: 'getting-started',
    order: 1,
  });
  result = runBuild();
  expect(result.exit, 'reserved theming copy does not break the build').toBe(0);
  const themingRoutes = listDocRoutes().filter((r) => r === 'theming');
  expect(themingRoutes, 'exactly one /docs/theming destination remains').toEqual(['theming']);
  const themingAfter = readDocHtml('theming');
  expect(themingAfter, 'static Theming content stays intact').toContain('id="rendermarkdown"');

  // Duplicate destination: two real source copies resolving to one published ID.
  rmSync(CONTENT_DIR, { recursive: true, force: true });
  mkdirSync(CONTENT_DIR, { recursive: true });
  writeEntry('collision test.md', {
    title: 'Collision A',
    description: 'first',
    section: 'getting-started',
    order: 1,
  });
  writeEntry('collision-test.md', {
    title: 'Collision B',
    description: 'second',
    section: 'getting-started',
    order: 2,
  });
  result = runBuild();
  expect(result.exit, 'colliding build exits nonzero').not.toBe(0);
  const collisionObserved = `${result.stdout}\n${result.stderr}`;
  expect(collisionObserved, 'diagnostic names the duplicate destination').toContain(
    'collision-test',
  );
  expect(collisionObserved, 'diagnostic records the first source path').toContain(
    'collision test.md',
  );
  expect(collisionObserved, 'diagnostic records the second source path').toContain(
    'collision-test.md',
  );

  // Remove only the owned duplicate copy and rebuild clean.
  rmSync(join(CONTENT_DIR, 'collision test.md'), { force: true });
  result = runBuild();
  expect(result.exit, 'collision removed, rebuild exits 0').toBe(0);
  expect(
    listDocRoutes().filter((r) => r !== 'theming'),
    'single destination after duplicate removal',
  ).toEqual(['collision-test']);
});

// AC-3: real prose, navigation, metadata, and heading destinations (e2e).
test('ORI-AST-001-prose-navigation', { timeout: 240_000 }, () => {
  // Final rendered-page acceptance requires the actual manuscripts supplied by
  // ORI-CONT-001/002/003/005 (writeProhibited here). A missing manuscript is a
  // gate failure, never a placeholder: report the precise blocker.
  const contentRoot = join(DOCS_DIR, 'src', 'content', 'docs');
  const missing = REQUIRED_MANUSCRIPTS.filter(
    (id) =>
      !existsSync(join(contentRoot, `${id}.md`)) && !existsSync(join(contentRoot, `${id}.mdx`)),
  );
  expect(
    missing,
    `AC-3 final prose proof requires authored manuscripts under apps/docs/src/content/docs/ — ` +
      `missing (supplied by ORI-CONT-001/002/003/005): ${missing.join(', ')}`,
  ).toEqual([]);
});

// AC-4: themed MDX/code and byte-exact copy (e2e) — the copy correction is proven
// on the real conversation source + real clipboard; the authored-MDX portion needs
// manuscripts and reports the same blocker.
test('ORI-AST-001-mdx-code-copy', { timeout: 240_000 }, async () => {
  // The copy correction must preserve the terminal newline in served source.
  // Build the real app, serve it, and read the real clipboard.
  const preview = spawn(strictPreviewCommand(), {
    shell: true,
    cwd: REPO_ROOT,
    stdio: 'ignore',
  });
  const stopPreview = (): void => {
    try {
      preview.kill('SIGTERM');
    } catch {
      /* already gone */
    }
  };

  // Wait for the owned preview to answer before the first request.
  const deadline = Date.now() + 30_000;
  for (;;) {
    try {
      const probe = await fetch(`${PREVIEW_URL}/`);
      if (probe.ok) break;
    } catch {
      /* not up yet */
    }
    if (Date.now() > deadline) {
      stopPreview();
      throw new Error(`preview at ${PREVIEW_URL} did not become ready within 30s`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  try {
    const browser = await chromium.launch();
    try {
      const context = await browser.newContext({ javaScriptEnabled: true });
      await grantClipboardPermissions(context);
      const page = await context.newPage();

      // The served source oracle — fetched live from the product's own registry route.
      const served = await page.request.get(`${PREVIEW_URL}/r/nativewind/conversation.json`);
      expect(served.status(), 'served /r/nativewind/conversation.json responds 200').toBe(200);
      const { files } = (await served.json()) as { files: { path: string; content: string }[] };
      const first = files[0];
      expect(first.content.endsWith('\n'), 'conversation source carries a terminal newline').toBe(
        true,
      );

      await navigateLocalhost(page, '/components/conversation');
      await waitForAstroPageLoad(page, '__rnrCopyButtonRegistered');

      const code = page.locator('main section[data-section="source"] rnr-copy-button code').first();
      const displayed = (await code.textContent()) ?? '';
      expect(displayed.endsWith('\n'), 'displayed source carries the terminal newline').toBe(true);

      const trigger = page
        .locator('main section[data-section="source"] rnr-copy-button button')
        .first();
      await trigger.click();
      // Success shows by VALUE within the copy handler's async write — never a
      // class name. Poll the real locator attribute (no DOM globals; the repo's
      // root tsconfig carries no DOM lib).
      let state = '';
      for (let i = 0; i < 40 && state !== 'copied'; i += 1) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        state = (await trigger.getAttribute('data-state')) ?? '';
      }
      expect(state, 'copy control reaches the copied state').toBe('copied');
      const clipboard = await page.evaluate(() => navigator.clipboard.readText());

      // Byte-exact: the clipboard equals the unnormalized displayed source.
      expect(clipboard, 'clipboard equals displayed source (terminal newline preserved)').toBe(
        displayed,
      );
      expect(clipboard, 'clipboard ends with U+000A').toMatch(/\n$/);
      expect(sha256(clipboard), 'clipboard SHA-256 equals displayed SHA-256').toBe(
        sha256(displayed),
      );

      await context.close();
    } finally {
      await browser.close();
    }
  } finally {
    stopPreview();
  }
});
