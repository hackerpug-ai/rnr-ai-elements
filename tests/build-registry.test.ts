import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildItem,
  ENGINES,
  type Registry,
  type RegistryItem,
  resolveEngine,
  rewriteSource,
} from '../packages/registry/scripts/build-registry.ts';

const item = (over: Partial<RegistryItem> = {}): RegistryItem => ({
  name: 'conversation',
  type: 'registry:component',
  registryDependencies: ['https://reactnativereusables.com/r/{engine}/text.json'],
  files: [
    {
      path: 'packages/registry/src/components/ai/conversation.tsx',
      type: 'registry:component',
      target: 'components/ai/conversation.tsx',
    },
  ],
  ...over,
});

describe('engine fan-out', () => {
  it('ships exactly the two engines RNR ships', () => {
    expect([...ENGINES]).toEqual(['nativewind', 'uniwind']);
  });

  it('substitutes every occurrence of the placeholder, not just the first', () => {
    expect(resolveEngine('@/registry/{engine}/lib/{engine}', 'uniwind')).toBe(
      '@/registry/uniwind/lib/uniwind',
    );
  });

  it('rewrites only the alias segment and preserves classes and logic verbatim', () => {
    const src = `import { cn } from '@/registry/{engine}/lib/utils';\nconst v = cn('bg-muted/50 rounded-md h-10');`;
    const out = rewriteSource(src, 'nativewind');
    expect(out).toContain('@/registry/nativewind/lib/utils');
    // the class string is untouched — this is what makes 125 shared tokens possible
    expect(out).toContain("cn('bg-muted/50 rounded-md h-10')");
    expect(out).not.toContain('{engine}');
  });

  it('leaves the SOURCE path engine-free and substitutes deps and target', () => {
    const built = buildItem(item(), 'uniwind', () => 'source');
    expect(built.registryDependencies).toEqual([
      'https://reactnativereusables.com/r/uniwind/text.json',
    ]);
    // There is ONE shared source tree. Substituting its path would imply two, which is
    // the duplication this design exists to avoid.
    expect(built.files[0].path).not.toContain('/uniwind/');
    expect(built.files[0].path).toBe('packages/registry/src/components/ai/conversation.tsx');
    // target is the CONSUMER's path and must not carry the engine segment
    expect(built.files[0].target).toBe('components/ai/conversation.tsx');
  });

  it('produces different output for each engine from one source', () => {
    const read = () => "import { cn } from '@/registry/{engine}/lib/utils';";
    const a = buildItem(item(), 'nativewind', read);
    const b = buildItem(item(), 'uniwind', read);
    expect(a).not.toEqual(b);
    expect(JSON.stringify(a)).toContain('nativewind');
    expect(JSON.stringify(b)).toContain('uniwind');
  });

  it('REJECTS a short-name registry dependency', () => {
    // A bare "card" resolves against the shadcn WEB registry and installs a DOM
    // component into a React Native app. This is the documented silent trap.
    expect(() => buildItem(item({ registryDependencies: ['card'] }), 'uniwind', () => '')).toThrow(
      /not an absolute URL/,
    );
  });

  it('accepts a same-host unversioned self-dependency URL', () => {
    const deps = ['https://rnraielements.com/r/{engine}/message.json'];
    const built = buildItem(item({ registryDependencies: deps }), 'nativewind', () => '');
    expect(built.registryDependencies?.[0]).toBe(
      'https://rnraielements.com/r/nativewind/message.json',
    );
  });
});

describe('UC-REG-01/edge-a-short-name-registry-dependency', () => {
  const ROOT = fileURLToPath(new URL('..', import.meta.url));
  const PKG_VERSION = (
    JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as { version: string }
  ).version;

  // The fixture is the REAL emitted tree. Rebuild from the committed source inside the
  // test run so a stale public/r can never hide an emitter bug from these scans.
  let emitted: { file: string; text: string }[] = [];
  beforeAll(() => {
    execSync('pnpm registry:build', { cwd: ROOT, stdio: 'pipe' });
    emitted = ENGINES.flatMap((engine) =>
      readdirSync(join(ROOT, 'public/r', engine))
        .filter((f) => f.endsWith('.json'))
        .map((file) => ({
          file: `${engine}/${file}`,
          text: readFileSync(join(ROOT, 'public/r', engine, file), 'utf8'),
        })),
    );
  });

  const itemFiles = () => emitted.filter(({ file }) => !file.endsWith('registry.json'));

  it('package.json still carries a semver version (release receipts and the docs resolver guard)', () => {
    // Version is no longer substituted into self-deps (they are same-host and
    // unversioned after FIX-ORI-DEP-001-1), but the repo still versions package.json
    // for releases and the attended-deploy receipts.
    expect(PKG_VERSION, 'package.json version').toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('emits 112 item files whose every registryDependencies entry is an absolute https:// URL (TC-1)', () => {
    expect(emitted, 'total json files under public/r (112 items + 2 indexes)').toHaveLength(114);
    const deps = itemFiles().flatMap(
      ({ text }) => (JSON.parse(text) as RegistryItem).registryDependencies ?? [],
    );
    expect(deps.length, 'registryDependencies strings across the 112 item files').toBeGreaterThan(
      0,
    );
    for (const dep of deps) {
      expect(dep.startsWith('https://'), `bare/short dependency: ${dep}`).toBe(true);
    }
  });

  it('refuses a bare short-name registry dependency with "is not an absolute URL" (TC-2)', () => {
    expect(() => buildItem(item({ registryDependencies: ['card'] }), 'uniwind', () => '')).toThrow(
      /is not an absolute URL/,
    );
  });

  it('every self-dependency in registry.json is the unversioned same-host token form (TC-3)', () => {
    const registry = JSON.parse(
      readFileSync(join(ROOT, 'packages/registry/registry.json'), 'utf8'),
    ) as Registry;
    const selfDeps = registry.items.flatMap(
      (i) =>
        i.registryDependencies?.filter((d) => !d.startsWith('https://reactnativereusables.com/')) ??
        [],
    );
    expect(selfDeps.length, 'self-dependency URLs in registry.json').toBe(64);
    for (const dep of selfDeps) {
      expect(dep, 'self-dep token form').toMatch(
        /^https:\/\/rnraielements\.com\/r\/\{engine\}\/[\w.-]+\.json$/,
      );
      expect(dep).not.toContain('raw.githubusercontent.com');
      expect(dep).not.toContain('v{version}');
      expect(dep).not.toContain('/main/');
    }
  });

  it('emits every self-dependency as the unversioned same-host substituted form (TC-4/TC-5)', () => {
    const selfUrlRe = /^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[\w.-]+\.json$/;
    const counts = { nativewind: 0, uniwind: 0 };
    for (const { file, text } of emitted) {
      if (!file.endsWith('registry.json')) {
        for (const dep of (JSON.parse(text) as RegistryItem).registryDependencies ?? []) {
          if (!dep.startsWith('https://rnraielements.com/')) {
            continue;
          }
          expect(dep, `${file}: self-dep substituted form`).toMatch(selfUrlRe);
          const engine = file.startsWith('nativewind/') ? 'nativewind' : 'uniwind';
          counts[engine]++;
        }
      }
      expect(text.includes('/main/public/r/'), `${file}: mutable /main/ segment`).toBe(false);
      expect(
        text.includes('raw.githubusercontent.com'),
        `${file}: immutable-tag self-dep remains`,
      ).toBe(false);
      expect(text.includes('{version}'), `${file}: unsubstituted {version} token`).toBe(false);
      expect(text.includes('{engine}'), `${file}: unsubstituted {engine} token`).toBe(false);
    }
    // The 64 self-dep URLs in registry.json fan out per engine: 64 nativewind + 64 uniwind.
    expect(counts.nativewind, 'self-dep occurrences in the nativewind tree').toBe(64);
    expect(counts.uniwind, 'self-dep occurrences in the uniwind tree').toBe(64);
  });

  it('leaves all 14 distinct RNR dependencies unpinned on reactnativereusables.com (TC-6)', () => {
    const distinct = new Set<string>();
    for (const { text } of itemFiles()) {
      for (const dep of (JSON.parse(text) as RegistryItem).registryDependencies ?? []) {
        if (!dep.startsWith('https://reactnativereusables.com/')) continue;
        // Exactly host / r / <engine> / <name>.json — a version segment would make it 5.
        expect(dep, `RNR dependency gained a segment: ${dep}`).toMatch(
          /^https:\/\/reactnativereusables\.com\/r\/(nativewind|uniwind)\/[\w.-]+\.json$/,
        );
        distinct.add(
          dep.replace(/^https:\/\/reactnativereusables\.com\/r\/(nativewind|uniwind)\//, ''),
        );
      }
    }
    expect(distinct.size, 'distinct RNR dependency names').toBe(14);
  });
});
