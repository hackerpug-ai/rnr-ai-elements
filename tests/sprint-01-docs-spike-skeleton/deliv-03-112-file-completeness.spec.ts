import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * FLOW-DELIV-03-112-file-completeness — FUSE-02 lane check over the real
 * build chain: real pnpm child process, real filesystem, real
 * packages/registry/registry.json. Run directly:
 *
 *   pnpm exec tsx tests/sprint-01-docs-spike-skeleton/deliv-03-112-file-completeness.spec.ts
 *
 * The contracted runner command is `pnpm playwright test <this file> --grep
 * FLOW-DELIV-03-112-file-completeness`; @playwright/test is not yet a
 * dependency (it arrives with the FUSE-10 e2e runner). When it lands, wrap
 * FLOW_DELIV_03_112_file_completeness in a playwright `test()` of the same
 * name — the body below is runner-agnostic by design.
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

export async function FLOW_DELIV_03_112_file_completeness(): Promise<void> {
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
