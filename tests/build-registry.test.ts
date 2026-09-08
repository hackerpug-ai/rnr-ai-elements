import { execSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildItem,
  ENGINES,
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

  it('accepts an intra-registry absolute URL', () => {
    const deps = [
      'https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/main/public/r/{engine}/message.json',
    ];
    const built = buildItem(item({ registryDependencies: deps }), 'nativewind', () => '');
    expect(built.registryDependencies?.[0]).toContain('/nativewind/message.json');
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

  it('keeps package.json, the release tag and the emitted URLs on one version', () => {
    // AC-2 GIVEN. Version-agnostic since v0.2.0: the emitted URLs below must pin
    // whatever package.json carries, so a release bump needs no test edit.
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

  it('substitutes {version} and {engine} in one resolveEngine pass (TC-3)', () => {
    const out = resolveEngine(
      'https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v{version}/public/r/{engine}/message.json',
      'nativewind',
      PKG_VERSION,
    );
    expect(out).toBe(
      `https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v${PKG_VERSION}/public/r/nativewind/message.json`,
    );
  });

  it('pins every self-referencing URL to v0.1.0 with no /main/ and no leftover token (TC-4/TC-5)', () => {
    let selfUrls = 0;
    for (const { file, text } of emitted) {
      if (!file.endsWith('registry.json')) {
        for (const dep of (JSON.parse(text) as RegistryItem).registryDependencies ?? []) {
          if (!dep.startsWith('https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/')) {
            continue;
          }
          selfUrls++;
          expect(dep, `${file}: self URL not tag-pinned`).toMatch(
            new RegExp(
              `^https:\\/\\/raw\\.githubusercontent\\.com\\/hackerpug-ai\\/rnr-ai-elements\\/v${PKG_VERSION.replace(/\./g, '\\.')}\\/public\\/r\\/(nativewind|uniwind)\\/[\\w.-]+\\.json$`,
            ),
          );
        }
      }
      expect(text.includes('/main/public/r/'), `${file}: mutable /main/ segment`).toBe(false);
      expect(text.includes('{version}'), `${file}: unsubstituted {version} token`).toBe(false);
      expect(text.includes('{engine}'), `${file}: unsubstituted {engine} token`).toBe(false);
    }
    expect(selfUrls, 'self-referencing URLs checked').toBeGreaterThan(0);
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
