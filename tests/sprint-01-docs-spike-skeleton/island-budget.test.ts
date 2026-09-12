import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * FUSE-09-island-budget — AC-2 island budget accounting over the REAL
 * apps/docs/src tree on disk.
 *
 * Boundary contract: exactly five vanilla custom elements site-wide. Two are
 * registered so far — `rnr-copy-button` (FUSE-09) and `rnr-theme-toggle`
 * (SHELL-003). So the whole docs source must contain exactly TWO
 * customElements.define calls naming those tags, and zero client-framework
 * imports (react/svelte/vue/preact/solid).
 *
 * UNIT_TEST_JUSTIFIED: pure static source scan — file reads only, no runtime
 * behavior, no network, no rendering.
 */
const SRC_ROOT = join(process.cwd(), 'apps', 'docs', 'src');
const SOURCE_EXTENSIONS = ['.ts', '.mjs', '.js', '.astro'];
const ELEMENT_NAME = 'rnr-copy-button';
const THEME_ELEMENT_NAME = 'rnr-theme-toggle';

function collectSourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, found);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      found.push(full);
    }
  }
  return found;
}

// Import/export statements or dynamic imports pulling a client-side framework.
const FRAMEWORK_IMPORT =
  /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s*['"](react|react-dom|svelte|vue|preact|solid-js)(?:\/[\w.-]+)*['"]|(?:^|\n)\s*import\s*\(\s*['"](react|react-dom|svelte|vue|preact|solid-js)(?:\/[\w.-]+)*['"]\s*\)/g;

describe('FUSE-09 island budget', () => {
  it('FUSE-09-island-budget: exactly two customElements.define (rnr-copy-button, rnr-theme-toggle), zero framework imports', () => {
    const files = collectSourceFiles(SRC_ROOT);
    expect(files.length).toBeGreaterThan(0);

    const defineSites: { file: string; tag: string }[] = [];
    const frameworkImports: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf8');

      for (const match of content.matchAll(/customElements\.define\(\s*['"]([^'"]+)['"]/g)) {
        defineSites.push({ file, tag: match[1] });
      }

      for (const match of content.matchAll(FRAMEWORK_IMPORT)) {
        frameworkImports.push(`${file}: ${match[0].trim()}`);
      }
    }

    expect(defineSites).toEqual([
      { file: expect.stringContaining('copy-button.ts'), tag: ELEMENT_NAME },
      { file: expect.stringContaining('theme-toggle.ts'), tag: THEME_ELEMENT_NAME },
    ]);
    expect(frameworkImports).toEqual([]);
  });
});

/**
 * SHELL-003-theme-island-contract — TC-1/TC-2 over the REAL build chain and
 * the REAL built dist: the docs build runs as a subprocess and every built
 * DocsLayout page must serve the inline pre-paint theme script in <head>
 * (is:inline + data-astro-rerun, never a fetched module) and the
 * rnr-theme-toggle island element in its body.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

// Duplicated from scaffold.build.test.ts on purpose (same precedent): SCOPE
// .writeAllowed for this task admits no shared helper module. The SAME
// filesystem lock is reused because both lanes build the same dist/.
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

function runDocsBuild(): { status: number | null; stdout: string; stderr: string } {
  acquireBuildLock();
  try {
    // The full ordered fixture chain (the e2e:docs chain minus the browser
    // lane): gallery-manifest.json is gitignored, so the docs prebuild gate
    // fails closed on a fresh checkout unless the workspace generators run
    // first. Same steps, same order, real subprocess.
    const result = spawnSync(
      'sh',
      [
        '-c',
        'pnpm registry:build && pnpm gallery:manifest && pnpm --filter @rnr-ai-elements/docs build',
      ],
      {
        cwd: repoRoot,
        encoding: 'utf8',
        env: process.env,
        maxBuffer: 64 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

function collectHtmlFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectHtmlFiles(full, found);
    } else if (entry.endsWith('.html')) {
      found.push(full);
    }
  }
  return found;
}

describe('SHELL-003 theme island contract', () => {
  it('SHELL-003-theme-island-contract: built DocsLayout pages serve the inline pre-paint theme script and the rnr-theme-toggle island', {
    timeout: 300_000,
  }, () => {
    const build = runDocsBuild();
    const evidence = `--- stdout ---\n${build.stdout}\n--- stderr ---\n${build.stderr}`;
    expect(build.status, `docs build chain exited ${build.status}\n${evidence}`).toBe(0);

    // Step-completion markers emitted by the real scripts, in chain order
    // (same discipline as ci-chain-order.test.ts).
    const log = build.stdout + build.stderr;
    const registryDone = log.indexOf('registry built');
    const galleryDone = log.indexOf('gallery manifest');
    const astroDone = log.indexOf('Complete!');
    expect(
      registryDone,
      `registry:build produced no completion output\n${evidence}`,
    ).toBeGreaterThan(-1);
    expect(
      galleryDone,
      `gallery:manifest produced no completion output\n${evidence}`,
    ).toBeGreaterThan(-1);
    expect(astroDone, `astro build produced no completion output\n${evidence}`).toBeGreaterThan(-1);
    expect(registryDone, 'registry:build must complete before gallery:manifest').toBeLessThan(
      galleryDone,
    );
    expect(galleryDone, 'gallery:manifest must complete before the astro build step').toBeLessThan(
      astroDone,
    );

    const distDir = join(repoRoot, 'apps', 'docs', 'dist');
    const docsPages = collectHtmlFiles(distDir).filter((page) =>
      readFileSync(page, 'utf8').includes('data-theme-slot'),
    );
    expect(docsPages.length, 'no built DocsLayout pages found under dist').toBeGreaterThan(0);

    for (const page of docsPages) {
      const html = readFileSync(page, 'utf8');
      const head = html.slice(0, html.indexOf('</head>'));
      const body = html.slice(html.indexOf('<body'));
      const label = page.slice(repoRoot.length + 1);

      // TC-1: the pre-paint script is INLINE in <head> — is:inline output
      // keeps data-astro-rerun and the theme strings; never a fetched module.
      const themeScripts = [...head.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(
        ([, attrs, content]) => attrs.includes('data-astro-rerun') && content.includes('rnr-theme'),
      );
      expect(
        themeScripts.length,
        `${label}: no inline data-astro-rerun theme script in <head> — first paint runs theme-less`,
      ).toBeGreaterThan(0);

      const themeLogic = themeScripts.map(([, , content]) => content).join('\n');
      expect(themeLogic, `${label}: theme script must resolve via prefers-color-scheme`).toContain(
        'prefers-color-scheme',
      );
      expect(themeLogic, `${label}: theme script must fall back to dark`).toContain('dark');
      for (const [, attrs] of themeScripts) {
        expect(attrs.includes('src='), `${label}: theme logic shipped as a fetched module`).toBe(
          false,
        );
      }

      // TC-2: the island element renders in the body of every DocsLayout page.
      expect(body, `${label}: rnr-theme-toggle missing from body`).toContain('rnr-theme-toggle');
    }
  });
});
