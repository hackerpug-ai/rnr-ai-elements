import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, expect, test } from 'vitest';

const project = resolve(import.meta.dirname, '../..');
const manifest = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'));
const registryManifest = JSON.parse(
  readFileSync(join(project, 'packages/registry/package.json'), 'utf8'),
);
let fixture: string;

function run(command: string, args: string[]) {
  const result = spawnSync(command, args, {
    cwd: fixture,
    encoding: 'utf8',
    timeout: 60_000,
    maxBuffer: 4 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
  });
  if (result.error) throw result.error;
  return { status: result.status, output: result.stdout + result.stderr };
}

function succeed(command: string, args: string[]) {
  const result = run(command, args);
  expect(result.status, result.output).toBe(0);
  return result.output;
}

function writeJson(path: string, value: unknown) {
  writeFileSync(join(fixture, path), `${JSON.stringify(value, null, 2)}\n`);
}

beforeEach(() => {
  fixture = mkdtempSync(join(tmpdir(), 'rnr-righthook-'));
  succeed('git', ['init', '-q', '--initial-branch=main']);
  succeed('git', ['config', 'user.name', 'Hook integration test']);
  succeed('git', ['config', 'user.email', 'hook-test@example.invalid']);
  succeed('git', ['config', 'commit.gpgsign', 'false']);
  for (const file of ['righthook.yml', 'biome.json', '.fallowrc.json', 'pnpm-workspace.yaml']) {
    copyFileSync(join(project, file), join(fixture, file));
  }
  mkdirSync(join(fixture, 'scripts'));
  copyFileSync(
    join(project, 'scripts/install-git-hooks.sh'),
    join(fixture, 'scripts/install-git-hooks.sh'),
  );
  writeFileSync(join(fixture, '.gitignore'), 'node_modules/\n.fallow/\n.righthook/\n');
  symlinkSync(join(project, 'node_modules'), join(fixture, 'node_modules'), 'dir');
  writeJson('package.json', {
    name: 'hook-integration-fixture',
    private: true,
    type: 'module',
    main: 'index.ts',
    scripts: {
      typecheck: manifest.scripts.typecheck,
      lint: manifest.scripts.lint,
      'check:fallow': manifest.scripts['check:fallow'],
    },
    devDependencies: {
      '@biomejs/biome': manifest.devDependencies['@biomejs/biome'],
      typescript: manifest.devDependencies.typescript,
      fallow: manifest.devDependencies.fallow,
    },
  });
  const compiler = {
    compilerOptions: { strict: true, skipLibCheck: true, noEmit: true, types: [] },
    include: ['*.ts'],
  };
  writeJson('tsconfig.json', compiler);
  mkdirSync(join(fixture, 'packages/registry'), { recursive: true });
  writeJson('packages/registry/package.json', {
    name: registryManifest.name,
    scripts: { typecheck: registryManifest.scripts.typecheck },
  });
  writeJson('packages/registry/tsconfig.json', compiler);
  writeFileSync(join(fixture, 'packages/registry/index.ts'), 'export {};\n');
  writeFileSync(
    join(fixture, 'index.ts'),
    "import { value } from './helper';\n\nconsole.log(value);\n",
  );
  writeFileSync(join(fixture, 'helper.ts'), 'export const value = 1;\n');
  succeed(join(project, 'node_modules/.bin/biome'), ['format', '--write', 'tsconfig.json']);
  succeed('git', ['add', '.']);
  // Establish HEAD before installing the hook: no commit-hook bypass.
  succeed('git', ['commit', '-qm', 'Seed real compiler and analyzer inputs']);
  succeed(join(project, 'node_modules/.bin/righthook'), ['install', '--hook', 'pre-commit']);
}, 60_000);

afterEach(() => {
  rmSync(fixture, { recursive: true, force: true });
});

test('Git runs all three real gates for a clean commit', () => {
  writeFileSync(join(fixture, 'helper.ts'), 'export const value = 2;\n');
  succeed('git', ['add', 'helper.ts']);
  const before = succeed('git', ['rev-parse', 'HEAD']);
  const output = succeed('git', ['commit', '-m', 'Verify the installed pre-commit hook']);
  for (const command of ['biome ci .', 'fallow audit --base HEAD', 'tsc --noEmit']) {
    expect(output).toContain(command);
  }
  expect(succeed('git', ['rev-parse', 'HEAD'])).not.toBe(before);
}, 60_000);

test('installation is repeatable in a linked worktree and preserves an existing hook', () => {
  const hook = join(fixture, '.git/hooks/pre-commit');
  const original = readFileSync(hook, 'utf8');
  succeed('git', ['worktree', 'add', '--detach', 'linked-checkout', 'HEAD']);
  // The linked checkout has its own real Go-built binary, not a shared bin directory.
  for (let attempt = 0; attempt < 2; attempt++) {
    succeed('bash', ['linked-checkout/scripts/install-git-hooks.sh']);
    expect(readFileSync(hook, 'utf8')).toBe(original);
  }
  // A foreign hook must survive byte-for-byte and make installation fail closed.
  const foreign = '#!/bin/sh\n# A hook owned by another tool.\n';
  writeFileSync(hook, foreign);
  const result = run('bash', ['linked-checkout/scripts/install-git-hooks.sh']);
  expect(result.status, result.output).not.toBe(0);
  expect(result.output).toContain('pre-commit not installed');
  expect(readFileSync(hook, 'utf8')).toBe(foreign);
}, 60_000);

test.each([
  ['typecheck', "export const value: number = 'wrong';\n", 'TS2322'],
  ['biome', 'export const value=2\n', 'format'],
  ['fallow', 'export const value = 1;\nexport const unusedHookProbe = 2;\n', 'unusedHookProbe'],
])(
  '%s rejects a real failing commit without changing staged or unstaged bytes',
  (gate, source, diagnostic) => {
    writeFileSync(join(fixture, 'helper.ts'), source);
    succeed('git', ['add', 'helper.ts']);
    // A partially staged file must remain intact when any gate rejects the commit.
    writeFileSync(join(fixture, 'helper.ts'), `${source}// Keep this unstaged note.\n`);
    const staged = succeed('git', ['diff', '--cached', '--binary']);
    const unstaged = succeed('git', ['diff', '--binary']);
    const before = succeed('git', ['rev-parse', 'HEAD']);
    const result = run('git', ['commit', '-m', 'Must be rejected by the real gate']);
    expect(result.status, result.output).not.toBe(0);
    expect(result.output).toContain(diagnostic);
    expect(result.output).toContain(`${gate} [failed]`);
    expect(succeed('git', ['rev-parse', 'HEAD'])).toBe(before);
    expect(succeed('git', ['diff', '--cached', '--binary'])).toBe(staged);
    expect(succeed('git', ['diff', '--binary'])).toBe(unstaged);
    expect(succeed('git', ['stash', 'list'])).toBe('');
  },
  60_000,
);
