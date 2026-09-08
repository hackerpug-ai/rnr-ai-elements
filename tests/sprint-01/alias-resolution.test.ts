/**
 * TASK-F4 alias resolution — executable proof of the sprint's one-line contract:
 * after install, no file under the consumer's components/ or lib/ may contain the
 * literal `@/registry/`. The RNR CLI rewrites every emitted import specifier of the
 * three-segment `@/registry/{engine}/...` shape into the consumer's own aliases
 * (AC-1 verdict: BRANCH A — design/goldens/sprint-01/install/alias-verdict.md), and
 * this test pins that so a registry change that reintroduces an unrewritable
 * specifier (or a consumer-side resolution shim that hides one) fails here first.
 *
 * Load-bearing negative control (TC-5): apps/example/metro.config.js and
 * apps/example/tsconfig.json must NOT reference packages/registry. A resolver.alias
 * or tsconfig path into the registry would make every boot pass while leaving every
 * real consumer broken.
 */
import { execSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const ROOT = join(__dirname, '..', '..');

const read = (...p: string[]) => readFileSync(join(ROOT, ...p), 'utf8');

const grepConsumerTree = () => {
  // spawnSync, not execSync: grep exits 1 when the scan finds NOTHING — which is
  // exactly the pass condition here — and execSync would treat that as a thrown
  // error. No shell success-wrapper is involved: the empty-stdout assertion below
  // is the whole proof.
  const r = spawnSync(
    'grep',
    ['-rn', '@/registry/', 'apps/example/components/', 'apps/example/lib/'],
    { cwd: ROOT, encoding: 'utf8' },
  );
  if (r.status !== 0 && r.status !== 1) {
    throw new Error(`grep scan failed (status ${r.status}): ${r.stderr}`);
  }
  return (r.stdout ?? '').trim();
};

describe('TASK-F4 alias resolution (cycle-1)', () => {
  test('THE CONTRACT: zero @/registry/ literals in the installed consumer tree', () => {
    // non-vacuous scan floor: the contract is meaningless over an empty directory
    const tsxFiles = execSync(`find apps/example/components -name '*.tsx'`, {
      cwd: ROOT,
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);
    expect(tsxFiles.length).toBeGreaterThanOrEqual(10);

    expect(grepConsumerTree()).toBe('');
  });

  test('message.tsx imports text/avatar through the CONSUMER alias, no @/registry/ specifier survives', () => {
    const src = read('apps/example', 'components', 'ai', 'message.tsx');
    expect(src).toContain(`from '@/components/ui/text'`);
    expect(src).toContain(`from '@/components/ui/avatar'`);
    expect(src).not.toContain(`from '@/registry/`);
  });

  test('TC-5: no consumer-side resolution shim — no resolver alias into packages/registry in metro or tsconfig', () => {
    // metro.config.js may MENTION packages/registry in a comment; the code must not
    // configure one. Strip line comments, then check the code and the shim APIs.
    const metroCode = read('apps/example', 'metro.config.js')
      .split('\n')
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');
    expect(metroCode).not.toContain('packages/registry');
    expect(metroCode).not.toMatch(/resolver\.alias|extraNodeModules|watchFolders/);

    // tsconfig paths are data, not prose — parse and check the mapping targets.
    const tsconfig = JSON.parse(read('apps/example', 'tsconfig.json')) as {
      compilerOptions?: { paths?: Record<string, string[]> };
    };
    const targets = Object.values(tsconfig.compilerOptions?.paths ?? {}).flat();
    expect(targets.some((t) => t.includes('packages/registry'))).toBe(false);
  });
});
