import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from '@playwright/test';

/**
 * FLOW-DELIV-03-112-file-completeness — FUSE-02 lane check over the real
 * build chain: real pnpm child process, real filesystem, real
 * packages/registry/registry.json. Runs through the FUSE-10 playwright lane
 * (`pnpm e2e:docs --grep FLOW-DELIV-03-112-file-completeness`), and can also
 * be run directly without a browser:
 *
 *   pnpm exec tsx tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
 *
 * The body below is runner-agnostic by design; the playwright `test()` wrapper
 * of the same name delegates to it.
 */
const ROOT = process.cwd();
const MANIFEST_TS = join(ROOT, 'apps/example/gallery/manifest.ts');
const MANIFEST_JSON = join(ROOT, 'apps/docs/src/data/gallery-manifest.json');
const DATA_DIR = join(ROOT, 'apps/docs/src/data');

type Entry = {
  name: string;
  kind: string;
  expoGo: boolean;
  permissions: { ios?: string[]; android?: string[] } | null;
};

function runManifestScript(): void {
  execFileSync('pnpm', ['gallery:manifest'], { cwd: ROOT, stdio: 'pipe' });
}

// biome-ignore lint/suspicious/noExportsInTest: FUSE-02 contract keeps this exported for direct tsx runs
export async function FLOW_DELIV_03_112_file_completeness(): Promise<void> {
  // The committed families map — snapshotted because the delete-dir case
  // below removes src/data wholesale (it regenerates only the manifest) and
  // the FUSE-05 prebuild below consumes families.json.
  const FAMILIES_JSON = join(DATA_DIR, 'families.json');
  const familiesBytes = readFileSync(FAMILIES_JSON);

  // AC-1 case: single run, both emits, verdict consistency.
  runManifestScript();
  assert.ok(existsSync(MANIFEST_TS), 'apps/example/gallery/manifest.ts missing');
  assert.ok(existsSync(MANIFEST_JSON), 'apps/docs/src/data/gallery-manifest.json missing');

  const entries = JSON.parse(readFileSync(MANIFEST_JSON, 'utf8')) as Entry[];
  assert.equal(entries.length, 56, `expected 56 entries, got ${entries.length}`);

  const kindCounts = entries.reduce<Record<string, number>>((acc, e) => {
    acc[e.kind] = (acc[e.kind] ?? 0) + 1;
    return acc;
  }, {});
  assert.deepEqual(kindCounts, { component: 39, ui: 11, lib: 6 });

  for (const e of entries) {
    assert.equal(typeof e.expoGo, 'boolean', `${e.name}.expoGo must be boolean`);
  }

  const { GALLERY_ITEMS } = (await import(MANIFEST_TS)) as {
    GALLERY_ITEMS: { name: string; expoGo: boolean }[];
  };
  const tsVerdict = new Map(GALLERY_ITEMS.map((i) => [i.name, i.expoGo]));
  const drift = entries.filter((e) => tsVerdict.get(e.name) !== e.expoGo);
  assert.deepEqual(drift, [], 'expoGo drift between the .ts and .json emits');

  const withPerms = entries.filter(
    (e) => e.permissions != null && Object.keys(e.permissions).length > 0,
  );
  assert.deepEqual(
    withPerms.map((e) => e.name),
    ['prompt-input'],
  );

  const committed = execFileSync('git', ['show', 'HEAD:apps/example/gallery/manifest.ts']);
  assert.ok(
    readFileSync(MANIFEST_TS).equals(committed),
    'apps/example/gallery/manifest.ts bytes changed',
  );

  // AC-2 case: delete + rerun must regenerate byte-identical content, also
  // from a state where the target directory itself is absent.
  const first = readFileSync(MANIFEST_JSON);
  rmSync(MANIFEST_JSON);
  runManifestScript();
  assert.ok(readFileSync(MANIFEST_JSON).equals(first), 'delete-file + rerun changed bytes');

  rmSync(DATA_DIR, { recursive: true, force: true });
  runManifestScript();
  assert.ok(readFileSync(MANIFEST_JSON).equals(first), 'delete-dir + rerun changed bytes');

  // FUSE-05 (AC-2): the apps/docs/public/r copy — generated-only, wholesale
  // from the root public/r, byte-identical, gitignored, deterministic under
  // delete+rebuild. Restore the snapshotted families.json first: the
  // delete-dir case above removed it along with the generated manifest.
  writeFileSync(FAMILIES_JSON, familiesBytes);
  runPrebuild();
  const DOCS_PUBLIC_R = join(ROOT, 'apps/docs/public/r');
  const perEngine = (engine: string): string[] => {
    const dir = join(DOCS_PUBLIC_R, engine);
    assert.ok(existsSync(dir), `${dir} missing`);
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .sort();
  };
  assert.equal(perEngine('nativewind').length, 57, 'nativewind must hold 57 JSON files');
  assert.equal(perEngine('uniwind').length, 57, 'uniwind must hold 57 JSON files');
  assert.ok(perEngine('nativewind').includes('registry.json'), 'missing nativewind index');
  assert.ok(perEngine('uniwind').includes('registry.json'), 'missing uniwind index');

  const snapshot = snapshotPublicR(DOCS_PUBLIC_R);
  const diffVsRoot = diffAgainstRoot(snapshot);
  assert.deepEqual(diffVsRoot, [], 'apps/docs/public/r files differing from root public/r');

  const ignoredPath = execFileSync('git', [
    'check-ignore',
    'apps/docs/public/r/nativewind/conversation.json',
  ]).toString();
  assert.equal(ignoredPath.trim(), 'apps/docs/public/r/nativewind/conversation.json');

  rmSync(DOCS_PUBLIC_R, { recursive: true, force: true });
  runPrebuild();
  assert.deepEqual(
    diffAgainstRoot(snapshotPublicR(DOCS_PUBLIC_R)),
    [],
    'delete + re-run prebuild not byte-identical',
  );
}

function runPrebuild(): void {
  execFileSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'prebuild'], {
    cwd: ROOT,
    stdio: 'pipe',
  });
}

/** rel path -> sha256 of every JSON file under dir. */
function snapshotPublicR(dir: string): Map<string, string> {
  const out = new Map<string, string>();
  for (const engine of readdirSync(dir)) {
    for (const file of readdirSync(join(dir, engine)).sort()) {
      if (!file.endsWith('.json')) continue;
      out.set(
        `${engine}/${file}`,
        createHash('sha256')
          .update(readFileSync(join(dir, engine, file)))
          .digest('hex'),
      );
    }
  }
  return out;
}

/** Files whose bytes differ from (or are absent from) the root public/r. */
function diffAgainstRoot(snapshot: Map<string, string>): string[] {
  const differing: string[] = [];
  for (const [rel, sha] of snapshot) {
    const rootFile = join(ROOT, 'public/r', rel);
    const rootSha = existsSync(rootFile)
      ? createHash('sha256').update(readFileSync(rootFile)).digest('hex')
      : 'absent';
    if (rootSha !== sha) differing.push(rel);
  }
  return differing;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  FLOW_DELIV_03_112_file_completeness()
    .then(() => {
      console.log('FLOW-DELIV-03-112-file-completeness: PASS');
    })
    .catch((err: unknown) => {
      console.error('FLOW-DELIV-03-112-file-completeness: FAIL');
      console.error(err);
      process.exitCode = 1;
    });
}

test('FLOW-DELIV-03-112-file-completeness', async () => {
  // The body deletes and regenerates shared repo paths (apps/docs/src/data), so it
  // must run once, not once per project worker racing itself.
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'filesystem-mutating lane check runs once, on chromium-desktop',
  );
  await FLOW_DELIV_03_112_file_completeness();
});
