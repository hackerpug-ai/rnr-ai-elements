import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

type GitResult = { status: number | null; stdout: string; stderr: string };

function git(args: string[]): GitResult {
  const proc = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return { status: proc.status, stdout: proc.stdout ?? '', stderr: proc.stderr ?? '' };
}

const AUTHORED_FONTS = [
  'apps/docs/public/fonts/OFL.txt',
  'apps/docs/public/fonts/spline-sans-mono-var-latin-ext.woff2',
  'apps/docs/public/fonts/spline-sans-mono-var-latin.woff2',
  'apps/docs/public/fonts/spline-sans-var-latin-ext.woff2',
  'apps/docs/public/fonts/spline-sans-var-latin.woff2',
] as const;

describe('APX-030 edge config files are committable', () => {
  it('APX-030-AC1: edge config sources are not ignored', () => {
    for (const path of ['apps/docs/public/_headers', 'apps/docs/public/_redirects']) {
      const result = git(['check-ignore', '--no-index', '-v', path]);
      expect(result.status, `${path} must not match an ignore rule\n${result.stdout}`).toBe(1);
      expect(result.stdout, `${path} must print no matching rule`).toBe('');
    }
  });

  it('APX-030-AC2: generated registry copy stays ignored', () => {
    for (const path of [
      'apps/docs/public/r/nativewind/conversation.json',
      'apps/docs/public/r/uniwind/registry.json',
    ]) {
      const result = git(['check-ignore', '--no-index', '-v', path]);
      expect(result.status, `${path} must be ignored\n${result.stderr}`).toBe(0);
      expect(result.stdout, `${path} must name apps/docs/.gitignore`).toContain(
        'apps/docs/.gitignore:',
      );
      expect(result.stdout, `${path} must name pattern public/r/`).toContain('public/r/');
      expect(result.stdout, `${path} must name the checked path`).toContain(path);
    }
  });

  it('APX-030-AC3: tracked public content is authored-only', () => {
    const fonts = git(['ls-files', 'apps/docs/public/fonts']);
    expect(fonts.status).toBe(0);
    const fontPaths = fonts.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .sort();
    expect(fontPaths).toEqual([...AUTHORED_FONTS].sort());

    const generated = git(['ls-files', 'apps/docs/public/r']);
    expect(generated.status).toBe(0);
    expect(generated.stdout, 'apps/docs/public/r must not be tracked').toBe('');
  });

  it('APX-030-AC4: other generated outputs stay ignored', () => {
    const registryItems = git([
      'check-ignore',
      '--no-index',
      '-v',
      'apps/docs/src/data/registry-items.json',
    ]);
    expect(registryItems.status).toBe(0);
    expect(registryItems.stdout).toContain('src/data/registry-items.json');

    const siteFacts = git([
      'check-ignore',
      '--no-index',
      '-v',
      'apps/docs/src/data/site-facts.json',
    ]);
    expect(siteFacts.status).toBe(0);
    expect(siteFacts.stdout).toContain('src/data/site-facts.json');

    const astroStore = git([
      'check-ignore',
      '--no-index',
      '-v',
      'apps/docs/.astro/data-store.json',
    ]);
    expect(astroStore.status).toBe(0);
    expect(astroStore.stdout).toContain('.astro/');
  });
});
