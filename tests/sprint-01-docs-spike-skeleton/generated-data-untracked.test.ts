import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

/**
 * FIX-FUSE-05-1 lane: apps/docs/src/data/gallery-manifest.json is GENERATED
 * output (emitted by scripts/build-gallery-manifest.ts) and must never be
 * tracked — a tracked copy would let a fresh docs build consume stale bytes,
 * masking gallery:manifest breakage. Real git index, real check-ignore, real
 * ordered chain (registry:build && gallery:manifest) over the real registry —
 * no fixtures, no mocks. families.json is authored and MUST stay tracked.
 */
const ROOT = process.cwd();
const DATA_DIR = 'apps/docs/src/data';
const MANIFEST_JSON = join(ROOT, DATA_DIR, 'gallery-manifest.json');
const FAMILIES_JSON = `${DATA_DIR}/families.json`;
const MANIFEST_TRACKED = `${DATA_DIR}/gallery-manifest.json`;

function git(args: string[]): string {
  return execFileSync('git', args, { cwd: ROOT, stdio: 'pipe' }).toString();
}

function runOrderedChain(): void {
  // The exact ordered chain a fresh checkout runs — throws on nonzero exit.
  execFileSync('pnpm', ['-w', 'run', 'registry:build'], { cwd: ROOT, stdio: 'pipe' });
  execFileSync('pnpm', ['-w', 'run', 'gallery:manifest'], { cwd: ROOT, stdio: 'pipe' });
}

it('FIX-FUSE-05-1-generated-data-untracked: gallery-manifest.json is untracked, ignored, regenerable', () => {
  // 1. The generated JSON is NOT tracked (RED while FUSE-02's commit tracks it).
  expect(git(['ls-files', '--', MANIFEST_TRACKED]), 'generated JSON must not be tracked').toBe('');

  // 2. families.json is authored and stays tracked — untracking stops at generated output.
  const tracked = git(['ls-files', '--', DATA_DIR]).trim().split('\n').filter(Boolean);
  expect(tracked, 'only the authored families.json remains tracked').toEqual([FAMILIES_JSON]);

  // 3. FUSE-05's apps/docs/.gitignore line now APPLIES (exit 0 only once untracked).
  let ignored = false;
  try {
    execFileSync('git', ['check-ignore', MANIFEST_TRACKED], { cwd: ROOT, stdio: 'pipe' });
    ignored = true;
  } catch {
    ignored = false;
  }
  expect(ignored, 'check-ignore must exit 0 for the untracked file').toBe(true);

  // 4. Fresh-clone proof: delete the file, run the ordered chain, bytes return.
  expect(existsSync(MANIFEST_JSON), 'working-tree file must survive untracking').toBe(true);
  const committedEmit = readFileSync(MANIFEST_JSON);

  rmSync(MANIFEST_JSON);
  expect(existsSync(MANIFEST_JSON)).toBe(false);

  runOrderedChain();
  expect(
    readFileSync(MANIFEST_JSON).equals(committedEmit),
    'ordered chain must regenerate byte-identical output',
  ).toBe(true);
}, 180_000);
