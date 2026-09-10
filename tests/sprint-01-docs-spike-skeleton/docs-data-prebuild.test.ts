import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const ITEMS_JSON = join(repoRoot, 'apps/docs/src/data/registry-items.json');
const FAMILIES_JSON = join(repoRoot, 'apps/docs/src/data/families.json');
const MANIFEST_JSON = join(repoRoot, 'apps/docs/src/data/gallery-manifest.json');
const REGISTRY_JSON = join(repoRoot, 'packages/registry/registry.json');
const ROOT_PUBLIC_R = join(repoRoot, 'public/r');
const DOCS_PUBLIC_R = join(repoRoot, 'apps/docs/public/r');
const DOCS_PKG = '@rnr-ai-elements/docs';

// The registry-items-v1 entry keys, in contract order — the LOCKED field list
// FUSE-06/07/08 consume. (The task prose says "15 contract fields"; the
// boundary_contracts literal enumerates exactly these 14 — the enumerated
// shape is authoritative, see the task's assumptions.)
const CONTRACT_KEYS = [
  'name',
  'title',
  'description',
  'type',
  'engines',
  'expoGo',
  'permissions',
  'family',
  'registryDependencies',
  'dependencies',
  'sourceFiles',
  'props',
  'usageSnippet',
  'themingNote',
] as const;

// The pinned family assignment: 9 families; the 7 AI families split the 39
// components 3+7+6+7+4+1+11; ui holds the 11, lib the 6.
const FAMILY_IDS = [
  'conversation',
  'message',
  'prompt-input',
  'reasoning',
  'sources',
  'suggestion',
  'tool',
  'ui',
  'lib',
] as const;
const FAMILY_SIZES: Record<string, number> = {
  conversation: 3,
  message: 7,
  'prompt-input': 6,
  reasoning: 7,
  sources: 4,
  suggestion: 1,
  tool: 11,
  ui: 11,
  lib: 6,
};

// Duplicated from scaffold.build.test.ts on purpose: no shared helper module
// may be created inside SCOPE.writeAllowed, and the lock keeps this lane's
// full build chains from racing on dist/ and public/r against the FUSE-01
// lane's chains when vitest runs files in parallel workers.
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

type Run = { status: number | null; stdout: string; stderr: string };

function run(cmd: string, args: string[], timeout = 300_000): Run {
  const proc = spawnSync(cmd, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
  });
  return { status: proc.status, stdout: proc.stdout ?? '', stderr: proc.stderr ?? '' };
}

/** The ordered chain from the human gate: registry:build, gallery:manifest, docs build. */
function runOrderedChain(): { registry: Run; gallery: Run; docs: Run } {
  acquireBuildLock();
  try {
    const registry = run('pnpm', ['registry:build']);
    const gallery = registry.status === 0 ? run('pnpm', ['gallery:manifest']) : emptyRun();
    const docs =
      gallery.status === 0 ? run('pnpm', ['--filter', DOCS_PKG, 'build'], 600_000) : emptyRun();
    return { registry, gallery, docs };
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

function runDocsPrebuild(): Run {
  acquireBuildLock();
  try {
    return run('pnpm', ['--filter', DOCS_PKG, 'prebuild']);
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
}

function emptyRun(): Run {
  return { status: null, stdout: '', stderr: 'skipped: earlier chain step failed' };
}

function listJsonFiles(dir: string): Map<string, Buffer> {
  const out = new Map<string, Buffer>();
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop() as string;
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const full = join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.name.endsWith('.json')) out.set(relative(dir, full), readFileSync(full));
    }
  }
  return out;
}

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');

describe('FUSE-05 docs-data prebuild', () => {
  it('prebuild produces the 56-item gated dataset', { timeout: 900_000 }, () => {
    // AC-1 case 1: the real ordered chain, all three steps exiting 0.
    const chain = runOrderedChain();
    const evidence =
      `--- registry stdout ---\n${chain.registry.stdout}\n${chain.registry.stderr}` +
      `--- gallery stdout ---\n${chain.gallery.stdout}\n${chain.gallery.stderr}` +
      `--- docs stdout ---\n${chain.docs.stdout}\n${chain.docs.stderr}`;
    expect(chain.registry.status, `registry:build failed\n${evidence}`).toBe(0);
    expect(chain.gallery.status, `gallery:manifest failed\n${evidence}`).toBe(0);
    expect(chain.docs.status, `docs build failed\n${evidence}`).toBe(0);

    const docsOut = `${chain.docs.stdout}\n${chain.docs.stderr}`;
    expect(docsOut, `prebuild log must report the item count\n${evidence}`).toContain('56 items');
    expect(docsOut, `prebuild log must report props resolution\n${evidence}`).toContain(
      'props resolved for 39/39 component items',
    );

    // The gated dataset: exactly 56 entries, exactly the contract fields.
    const entries = JSON.parse(readFileSync(ITEMS_JSON, 'utf8')) as Record<string, unknown>[];
    expect(entries).toHaveLength(56);
    const registry = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8')) as {
      items: { name: string; type: string; files: { path: string }[] }[];
    };
    const manifest = JSON.parse(readFileSync(MANIFEST_JSON, 'utf8')) as {
      name: string;
      expoGo: boolean;
      permissions: { ios?: string[]; android?: string[] } | null;
    }[];
    const manifestByName = new Map(manifest.map((m) => [m.name, m]));
    const registryByName = new Map(registry.items.map((i) => [i.name, i]));

    let componentCount = 0;
    let nullPropsCount = 0;
    const withPermissions: string[] = [];
    for (const entry of entries) {
      expect(
        Object.keys(entry),
        `${entry.name}: field set must be exactly the contract fields`,
      ).toEqual([...CONTRACT_KEYS]);
      expect(typeof entry.expoGo, `${entry.name}.expoGo`).toBe('boolean');
      expect(entry.engines).toEqual(['nativewind', 'uniwind']);
      expect(typeof entry.usageSnippet, `${entry.name}.usageSnippet`).toBe('string');
      expect(
        (entry.usageSnippet as string).length,
        `${entry.name}.usageSnippet empty`,
      ).toBeGreaterThan(0);
      expect(typeof entry.themingNote, `${entry.name}.themingNote`).toBe('string');
      expect(
        (entry.themingNote as string).length,
        `${entry.name}.themingNote empty`,
      ).toBeGreaterThan(0);

      const item = registryByName.get(entry.name as string);
      expect(item, `${entry.name} absent from registry.json`).toBeDefined();
      const sourceFiles = entry.sourceFiles as { filename: string; text: string }[];
      expect(sourceFiles, `${entry.name}.sourceFiles must mirror files[].path`).toHaveLength(
        item?.files.length ?? -1,
      );
      for (const file of sourceFiles) {
        expect(file.text.length, `${entry.name}:${file.filename} empty text`).toBeGreaterThan(0);
      }

      // expoGo consumed VERBATIM from gallery-manifest.json, never recomputed.
      const verdict = manifestByName.get(entry.name as string);
      expect(verdict, `${entry.name} absent from gallery-manifest.json`).toBeDefined();
      expect(entry.expoGo, `${entry.name}.expoGo drift from manifest`).toBe(verdict?.expoGo);
      expect(entry.permissions, `${entry.name}.permissions drift from manifest`).toEqual(
        verdict?.permissions ?? null,
      );
      if (entry.permissions !== null) withPermissions.push(entry.name as string);

      if (entry.type === 'registry:component') {
        componentCount += 1;
        expect(Array.isArray(entry.props), `${entry.name}.props must be an array`).toBe(true);
      } else {
        nullPropsCount += 1;
        expect(entry.props, `${entry.name} (${entry.type}).props must be null`).toBeNull();
      }
    }
    expect(componentCount, 'component entries').toBe(39);
    expect(nullPropsCount, 'ui/lib entries with props null').toBe(17);
    expect(withPermissions, 'only prompt-input carries permissions').toEqual(['prompt-input']);

    // AC-1 negative controls — the 55-item drill through the REAL chain:
    // a registry missing shimmer must fail the build naming it, with the
    // pinned 55-versus-56 pair, and must NOT publish a degraded dataset.
    const preItemsBytes = readFileSync(ITEMS_JSON);
    const preRegistryBytes = readFileSync(REGISTRY_JSON);
    const mutated = JSON.parse(preRegistryBytes.toString('utf8')) as {
      items: { name: string }[];
    };
    expect(mutated.items).toHaveLength(56);
    mutated.items = mutated.items.filter((i) => i.name !== 'shimmer');
    try {
      writeFileSync(REGISTRY_JSON, `${JSON.stringify(mutated, null, 2)}\n`);
      const drill = runOrderedChain();
      const drillOut = `${drill.docs.stdout}\n${drill.docs.stderr}`;
      expect(drill.docs.status, `docs build must fail on a 55-item registry\n${drillOut}`).not.toBe(
        0,
      );
      expect(drillOut, 'the failure must name the missing item').toContain('shimmer');
      expect(drillOut, 'the failure must pin the observed-vs-expected pair').toMatch(
        /\[docs-data\] count: item "shimmer" missing; observed 55 versus 56/,
      );
      expect(
        readFileSync(ITEMS_JSON).equals(preItemsBytes),
        'a failed gate run must not touch registry-items.json (ungated bytes)',
      ).toBe(true);
    } finally {
      writeFileSync(REGISTRY_JSON, preRegistryBytes);
    }

    // Restore: the chain is green again and the dataset is byte-identical.
    const restored = runOrderedChain();
    expect(
      restored.docs.status,
      `restored chain must exit 0\n${restored.docs.stdout}\n${restored.docs.stderr}`,
    ).toBe(0);
    expect(
      readFileSync(ITEMS_JSON).equals(preItemsBytes),
      'delete+rebuild must be byte-identical (deterministic dataset)',
    ).toBe(true);
    expect(readFileSync(REGISTRY_JSON).equals(preRegistryBytes)).toBe(true);
  });

  it('copies public r generated-only and byte-identical', { timeout: 300_000 }, () => {
    // GIVEN: a fresh prebuild run (self-sufficient setup).
    const prebuild = runDocsPrebuild();
    expect(prebuild.status, `prebuild failed\n${prebuild.stdout}\n${prebuild.stderr}`).toBe(0);

    // 57 files per engine: 56 item JSONs + the registry.json index.
    const copied = listJsonFiles(DOCS_PUBLIC_R);
    const perEngine = (engine: string): number =>
      [...copied.keys()].filter((rel) => rel.startsWith(`${engine}/`)).length;
    expect(perEngine('nativewind'), 'nativewind file count').toBe(57);
    expect(perEngine('uniwind'), 'uniwind file count').toBe(57);
    expect(copied.has('nativewind/registry.json'), 'missing nativewind index').toBe(true);
    expect(copied.has('uniwind/registry.json'), 'missing uniwind index').toBe(true);

    // Every file byte-identical to its root public/r counterpart.
    const root = listJsonFiles(ROOT_PUBLIC_R);
    const relPaths = [...copied.keys()].sort();
    expect(relPaths, 'the copy must mirror the root file set').toEqual([...root.keys()].sort());
    for (const rel of relPaths) {
      expect(
        copied.get(rel)?.equals(root.get(rel) as Buffer),
        `${rel} differs from root public/r`,
      ).toBe(true);
    }

    // Gitignored (generated-only): check-ignore exits 0 printing the path.
    const checkIgnore = run('git', [
      'check-ignore',
      'apps/docs/public/r/nativewind/conversation.json',
    ]);
    expect(checkIgnore.status, `check-ignore must exit 0\n${checkIgnore.stderr}`).toBe(0);
    expect(checkIgnore.stdout.trim()).toBe('apps/docs/public/r/nativewind/conversation.json');
    // --no-index tests the PATTERN (gallery-manifest.json is tracked from
    // FUSE-02's landing; git never reports tracked files as ignored).
    for (const generated of [
      'apps/docs/src/data/registry-items.json',
      'apps/docs/src/data/gallery-manifest.json',
    ]) {
      const check = run('git', ['check-ignore', '--no-index', generated]);
      expect(check.status, `${generated} must be covered by an ignore pattern`).toBe(0);
    }
    // Never committed: a fresh clone lacks the copy.
    const tracked = run('git', ['ls-files', 'apps/docs/public']);
    expect(tracked.status).toBe(0);
    expect(tracked.stdout, 'apps/docs/public must not be tracked').toBe('');

    // Delete + rebuild reproduces byte-identical output.
    const snapshot = new Map([...copied.entries()].map(([rel, bytes]) => [rel, sha256(bytes)]));
    const itemsSha = sha256(readFileSync(ITEMS_JSON));
    rmSync(DOCS_PUBLIC_R, { recursive: true, force: true });
    rmSync(ITEMS_JSON);
    const rebuild = runDocsPrebuild();
    expect(rebuild.status, `rebuild failed\n${rebuild.stdout}\n${rebuild.stderr}`).toBe(0);
    const rebuilt = listJsonFiles(DOCS_PUBLIC_R);
    expect([...rebuilt.keys()].sort()).toEqual(relPaths);
    for (const rel of relPaths) {
      expect(sha256(rebuilt.get(rel) as Buffer), `${rel} rebuild not byte-identical`).toBe(
        snapshot.get(rel),
      );
    }
    expect(sha256(readFileSync(ITEMS_JSON)), 'registry-items.json rebuild not byte-identical').toBe(
      itemsSha,
    );
  });

  it('families map covers 56 exactly once', { timeout: 300_000 }, () => {
    const families = JSON.parse(readFileSync(FAMILIES_JSON, 'utf8')) as {
      id: string;
      title: string;
      order: number;
      itemNames: string[];
    }[];
    expect(families).toHaveLength(9);
    const byOrder = [...families].sort((a, b) => a.order - b.order);
    expect(
      byOrder.map((f) => f.id),
      'family ids in order',
    ).toEqual([...FAMILY_IDS]);

    const registry = JSON.parse(readFileSync(REGISTRY_JSON, 'utf8')) as {
      items: { name: string; type: string }[];
    };
    const names = registry.items.map((i) => i.name);
    const typeOf = new Map(registry.items.map((i) => [i.name, i.type]));

    const seen = new Map<string, number>();
    for (const family of families) {
      expect(family.itemNames, `${family.id} size`).toHaveLength(FAMILY_SIZES[family.id]);
      for (const name of family.itemNames) {
        seen.set(name, (seen.get(name) ?? 0) + 1);
      }
    }
    expect(
      [...seen.entries()].filter(([, n]) => n !== 1),
      'duplicated names',
    ).toEqual([]);
    expect([...seen.keys()].sort(), 'families must cover the registry exactly').toEqual(
      [...names].sort(),
    );

    const members = (id: string): string[] =>
      (families.find((f) => f.id === id) as { itemNames: string[] }).itemNames;
    for (const name of members('ui')) expect(typeOf.get(name)).toBe('registry:ui');
    for (const name of members('lib')) expect(typeOf.get(name)).toBe('registry:lib');
    const aiFamilies = FAMILY_IDS.slice(0, 7);
    const aiUnion = aiFamilies.flatMap(members);
    expect(aiUnion).toHaveLength(39);
    for (const name of aiUnion) expect(typeOf.get(name)).toBe('registry:component');
    expect(new Set(aiUnion).size, 'AI families must not overlap').toBe(39);

    // Committed, NOT gitignored: check-ignore exits non-zero for families.json.
    const check = run('git', ['check-ignore', 'apps/docs/src/data/families.json']);
    expect(check.status, 'families.json must not be gitignored').not.toBe(0);

    // The real prebuild passes the family gate consuming the committed map.
    const prebuild = runDocsPrebuild();
    expect(prebuild.status, `prebuild failed\n${prebuild.stdout}\n${prebuild.stderr}`).toBe(0);
  });
});
