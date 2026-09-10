import { spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

// Duplicated from ci-chain-order.test.ts on purpose: SCOPE.writeAllowed for this task
// admits only the two test files, so no shared helper module may be created. The
// filesystem lock keeps the two full build chains from racing on dist/ when vitest
// runs this lane's files in parallel workers.
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
        // Steal a lock abandoned by a crashed run.
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
    const result = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: process.env,
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: result.status, stdout: result.stdout ?? '', stderr: result.stderr ?? '' };
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

function countHtmlFiles(dir: string): number {
  let count = 0;
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.html')) count += 1;
    }
  }
  return count;
}

describe('FUSE-01', () => {
  it('FUSE-01-scaffold-build', { timeout: 300_000 }, () => {
    const build = runDocsBuild();
    const evidence = `--- stdout ---\n${build.stdout}\n--- stderr ---\n${build.stderr}`;

    expect(build.status, `docs build exited ${build.status}\n${evidence}`).toBe(0);
    expect(
      build.stdout + build.stderr,
      'the product surface is built dist — astro dev must never run',
    ).not.toContain('astro dev');

    // Step-completion markers emitted by the real scripts, not the echoed header.
    const registryDone = build.stdout.indexOf('registry built');
    const galleryDone = build.stdout.indexOf('gallery manifest');
    const astroDone = build.stdout.indexOf('Complete!');
    expect(
      registryDone,
      'registry:build produced no completion output\n' + evidence,
    ).toBeGreaterThan(-1);
    expect(
      galleryDone,
      'gallery:manifest produced no completion output\n' + evidence,
    ).toBeGreaterThan(-1);
    expect(astroDone, 'astro build produced no completion output\n' + evidence).toBeGreaterThan(-1);
    expect(registryDone, 'registry:build must complete before gallery:manifest').toBeLessThan(
      galleryDone,
    );
    expect(galleryDone, 'gallery:manifest must complete before the astro build step').toBeLessThan(
      astroDone,
    );

    const distIndex = join(repoRoot, 'apps/docs/dist/index.html');
    const indexStat = statSync(distIndex);
    expect(indexStat.isFile(), `${distIndex} is not a real file`).toBe(true);
    expect(indexStat.size, 'apps/docs/dist/index.html is empty').toBeGreaterThan(0);
    expect(
      countHtmlFiles(join(repoRoot, 'apps/docs/dist')),
      'no HTML files under apps/docs/dist',
    ).toBeGreaterThan(0);
  });

  // UNIT_TEST_JUSTIFIED: pure structural assertion over two authored config files —
  // no runtime behavior, no external service.
  it('FUSE-01-manifest-contract', () => {
    const pkg = JSON.parse(readFileSync(join(repoRoot, 'apps/docs/package.json'), 'utf8')) as {
      name?: string;
      private?: boolean;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      scripts?: Record<string, string>;
    };
    const config = readFileSync(join(repoRoot, 'apps/docs/astro.config.mjs'), 'utf8');

    expect(pkg.name).toBe('@rnr-ai-elements/docs');
    expect(pkg.private).toBe(true);

    // TR-06 boundary contract: nothing outside the allowed set may be declared.
    const tr06Allowed = new Set([
      'astro',
      '@astrojs/mdx',
      'astro-expressive-code',
      '@tailwindcss/vite',
      'tailwindcss',
      'pagefind',
      '@astrojs/sitemap',
      'ts-morph',
      'qrcode',
      '@playwright/test',
    ]);
    const declared = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });
    expect(declared.length, 'the docs package must declare at least astro').toBeGreaterThan(0);
    for (const dep of declared) {
      expect(tr06Allowed.has(dep), `dependency "${dep}" is outside the TR-06 allowed set`).toBe(
        true,
      );
    }

    // Negative controls called out by the scenario, explicit despite the subset check.
    const banned = [
      /^@astrojs\/(?:node|vercel|netlify|cloudflare|deno)$/,
      /^(?:react|react-dom|vue|svelte|solid-js|preact)$/,
    ];
    for (const dep of declared) {
      for (const pattern of banned) {
        expect(
          pattern.test(dep),
          `banned package "${dep}" declared (adapter or client framework)`,
        ).toBe(false);
      }
    }

    // Build script chains the ordered gate, preview serves built dist on the default port.
    expect(pkg.scripts?.build).toBe(
      'pnpm -w run registry:build && pnpm -w run gallery:manifest && astro build',
    );
    expect(pkg.scripts?.preview).toBe('astro preview');

    // Astro 7, static output, canonical origin.
    expect(pkg.devDependencies?.astro, 'astro must be pinned to major 7').toMatch(/^\^?7\./);
    expect(config).toContain("site: 'https://rnraielements.com'");
    expect(config).not.toMatch(/output:\s*['"]server['"]/);
    expect(config).not.toMatch(/prerender/);
    expect(config).not.toMatch(/adapter/i);
  });
});
