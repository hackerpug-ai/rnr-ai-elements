import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Declared dependencies must match actual package imports — both directions.
 *
 * Under-declaring ships a consumer an item that cannot resolve its imports
 * (speech-input imported react-native-reanimated for a week before anything
 * caught it). Over-declaring forces installs nothing uses. Both were real.
 *
 * BASE_PACKAGES are exempt from the "must declare" direction: every consumer
 * of this registry already has react, react-native core, and RNR's icon set.
 */
const BASE_PACKAGES = new Set(['react', 'react-native', 'lucide-react-native']);

/** Package specifiers imported by one source file (relative and @/ aliases excluded). */
function packageImports(source: string): Set<string> {
  const out = new Set<string>();
  for (const m of source.matchAll(/from '([^']+)'/g)) {
    const spec = m[1];
    if (spec.startsWith('.') || spec.startsWith('@/')) continue;
    out.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
  }
  return out;
}

const registry = JSON.parse(
  readFileSync(join(process.cwd(), 'packages/registry/registry.json'), 'utf8'),
) as {
  items: { name: string; dependencies?: string[]; files: { path: string }[] }[];
};

describe('registry dependency declarations match imports', () => {
  for (const item of registry.items) {
    it(`${item.name}: declared deps match imported packages`, () => {
      const imported = new Set<string>();
      for (const f of item.files) {
        for (const pkg of packageImports(readFileSync(join(process.cwd(), f.path), 'utf8'))) {
          imported.add(pkg);
        }
      }
      for (const base of BASE_PACKAGES) imported.delete(base);
      const declared = new Set(item.dependencies ?? []);
      const undeclared = [...imported].filter((p) => !declared.has(p));
      const stale = [...declared].filter((p) => !imported.has(p));
      expect(
        { undeclared, stale },
        `${item.name}: add [${undeclared}] to dependencies, remove [${stale}] — or, if the package is universal, extend BASE_PACKAGES`,
      ).toEqual({ undeclared: [], stale: [] });
    });
  }
});
