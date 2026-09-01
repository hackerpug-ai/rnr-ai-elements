import { describe, expect, it } from 'vitest';
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
      path: 'packages/registry/src/{engine}/components/ai/conversation.tsx',
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

  it('resolves paths, targets and registry dependencies per engine', () => {
    const built = buildItem(item(), 'uniwind', () => 'source');
    expect(built.registryDependencies).toEqual([
      'https://reactnativereusables.com/r/uniwind/text.json',
    ]);
    expect(built.files[0].path).toContain('/uniwind/');
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
