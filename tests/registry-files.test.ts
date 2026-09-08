import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Every relative import inside an item's files must resolve to a file the item
 * itself ships. The web export caught this class live: prompt-input imported
 * ./prompt-input.logic, the manifest never listed it, and every consumer
 * install arrived with an unresolvable module — invisible to typecheck because
 * the consumer app is not part of the root typecheck project.
 *
 * Cross-item coupling through same-directory sibling imports (agent → persona)
 * ships the sibling with the item; cross-item coupling through the registry
 * alias (@/registry/…) goes through registryDependencies instead and is
 * unaffected here.
 */
const registry = JSON.parse(
  readFileSync(join(process.cwd(), 'packages/registry/registry.json'), 'utf8'),
) as { items: { name: string; files: { path: string }[] }[] };

describe('registry item files are self-resolving', () => {
  for (const item of registry.items) {
    it(`${item.name}: every relative import resolves within its own file set`, () => {
      const listedNames = new Set(item.files.map((f) => basename(f['path'])));
      const missing: string[] = [];
      for (const f of item.files) {
        const source = readFileSync(join(process.cwd(), f.path), 'utf8');
        const re = /from '(\.[^']+)'/g;
        let m: RegExpExecArray | null;
        while ((m = re.exec(source)) !== null) {
          // Compare on the FINAL path segment: the consumer tree flattens every
          // item's files into one directory, so ../ui/command.logic must find
          // command.logic.ts wherever the manifest lists it.
          const rel = m[1]
            .replace(/\.\.?\//, '')
            .split('/')
            .pop() as string;
          const candidates = new Set([
            rel,
            `${rel}.ts`,
            `${rel}.tsx`,
            `${rel}.js`,
            join(rel, 'index.ts'),
          ]);
          if (![...candidates].some((c) => listedNames.has(c))) {
            missing.push(`${basename(f.path)} → ${m[1]}`);
          }
        }
      }
      expect(missing, `add to ${item.name}'s files[]: ${missing.join(', ')}`).toEqual([]);
    });
  }
});
