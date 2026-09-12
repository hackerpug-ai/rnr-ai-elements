import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * FUSE-02 lane: scripts/build-gallery-manifest.ts must dual-emit — the SAME
 * in-memory verdict array serialized to apps/example/gallery/manifest.ts
 * (byte-frozen) and apps/docs/src/data/gallery-manifest.json (the docs
 * dataset FUSE-05 consumes). Real pnpm child process, real filesystem, real
 * packages/registry/registry.json — no fixtures, no mocks. The expoGo verdict
 * existing in exactly one code path is proven by cross-checking both emitted
 * files name-by-name after a single run.
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
  // Real pnpm child process — throws (failing the test) on nonzero exit.
  execFileSync('pnpm', ['gallery:manifest'], { cwd: ROOT, stdio: 'pipe' });
}

function readJsonEntries(): Entry[] {
  return JSON.parse(readFileSync(MANIFEST_JSON, 'utf8')) as Entry[];
}

describe('gallery manifest dual emit (FUSE-02)', () => {
  it('dual-emits the docs verdict dataset', async () => {
    runManifestScript();
    expect(existsSync(MANIFEST_TS)).toBe(true);
    expect(existsSync(MANIFEST_JSON)).toBe(true);

    const entries = readJsonEntries();
    expect(entries).toHaveLength(56);

    const kindCounts = entries.reduce<Record<string, number>>((acc, e) => {
      acc[e.kind] = (acc[e.kind] ?? 0) + 1;
      return acc;
    }, {});
    expect(kindCounts).toEqual({ component: 39, ui: 11, lib: 6 });

    for (const e of entries) {
      expect(typeof e.expoGo, `${e.name}.expoGo must be boolean`).toBe('boolean');
    }

    // Entry shape mirrors GalleryItem field-for-field: no extra fields, no renames.
    const fields = [
      'dependencies',
      'description',
      'expoGo',
      'kind',
      'name',
      'permissions',
      'title',
    ];
    for (const e of entries) {
      expect(Object.keys(e).sort(), `${e.name} field set`).toEqual(fields);
    }

    // Verdict cross-check: one computation must reach both targets unchanged.
    const { GALLERY_ITEMS } = (await import(MANIFEST_TS)) as {
      GALLERY_ITEMS: { name: string; expoGo: boolean }[];
    };
    expect(GALLERY_ITEMS).toHaveLength(56);
    const tsVerdict = new Map(GALLERY_ITEMS.map((i) => [i.name, i.expoGo]));
    const drift = entries.filter((e) => tsVerdict.get(e.name) !== e.expoGo);
    expect(
      drift.map((e) => e.name),
      'expoGo drift between .ts and .json emits',
    ).toEqual([]);

    // Only prompt-input carries permissions; every other entry serializes null.
    const withPerms = entries.filter(
      (e) => e.permissions != null && Object.keys(e.permissions).length > 0,
    );
    expect(withPerms.map((e) => e.name)).toEqual(['prompt-input']);
    for (const e of entries) {
      if (e.name === 'prompt-input') continue;
      expect(e.permissions, `${e.name}.permissions`).toBeNull();
    }

    // The .ts emit is byte-frozen: regenerated output equals the committed output.
    const committed = execFileSync('git', ['show', 'HEAD:apps/example/gallery/manifest.ts']);
    expect(
      readFileSync(MANIFEST_TS).equals(committed),
      'apps/example/gallery/manifest.ts bytes changed',
    ).toBe(true);
  }, 120_000);

  it('regenerates byte-identical json', () => {
    runManifestScript();
    const first = readFileSync(MANIFEST_JSON);

    // The committed families map — snapshotted because the delete-dir case
    // below removes src/data wholesale (it regenerates only the manifest)
    // and FUSE-05's prebuild consumes families.json.
    const FAMILIES_JSON = join(DATA_DIR, 'families.json');
    const familiesBytes = readFileSync(FAMILIES_JSON);

    rmSync(MANIFEST_JSON);
    runManifestScript();
    expect(readFileSync(MANIFEST_JSON).equals(first), 'delete-file + rerun changed bytes').toBe(
      true,
    );

    rmSync(DATA_DIR, { recursive: true, force: true });
    runManifestScript();
    expect(readFileSync(MANIFEST_JSON).equals(first), 'delete-dir + rerun changed bytes').toBe(
      true,
    );

    // Restore the snapshotted families.json: the delete-dir case above removed
    // it along with the generated manifest.
    writeFileSync(FAMILIES_JSON, familiesBytes);
  }, 120_000);
});
