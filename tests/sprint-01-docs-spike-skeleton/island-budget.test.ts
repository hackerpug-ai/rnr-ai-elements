import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * FUSE-09-island-budget — AC-2 island budget accounting over the REAL
 * apps/docs/src tree on disk.
 *
 * Boundary contract: exactly five vanilla custom elements site-wide, and this
 * task registers only `rnr-copy-button`. So the whole docs source must contain
 * exactly ONE customElements.define call naming rnr-copy-button, and zero
 * client-framework imports (react/svelte/vue/preact/solid).
 *
 * UNIT_TEST_JUSTIFIED: pure static source scan — file reads only, no runtime
 * behavior, no network, no rendering.
 */
const SRC_ROOT = join(process.cwd(), 'apps', 'docs', 'src');
const SOURCE_EXTENSIONS = ['.ts', '.mjs', '.js', '.astro'];
const ELEMENT_NAME = 'rnr-copy-button';

function collectSourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      collectSourceFiles(full, found);
    } else if (SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext))) {
      found.push(full);
    }
  }
  return found;
}

// Import/export statements or dynamic imports pulling a client-side framework.
const FRAMEWORK_IMPORT =
  /(?:^|\n)\s*(?:import|export)\s[^;]*?from\s*['"](react|react-dom|svelte|vue|preact|solid-js)(?:\/[\w.-]+)*['"]|(?:^|\n)\s*import\s*\(\s*['"](react|react-dom|svelte|vue|preact|solid-js)(?:\/[\w.-]+)*['"]\s*\)/g;

describe('FUSE-09 island budget', () => {
  it('FUSE-09-island-budget: exactly one customElements.define (rnr-copy-button), zero framework imports', () => {
    const files = collectSourceFiles(SRC_ROOT);
    expect(files.length).toBeGreaterThan(0);

    const defineSites: { file: string; tag: string }[] = [];
    const frameworkImports: string[] = [];

    for (const file of files) {
      const content = readFileSync(file, 'utf8');

      for (const match of content.matchAll(/customElements\.define\(\s*['"]([^'"]+)['"]/g)) {
        defineSites.push({ file, tag: match[1] });
      }

      for (const match of content.matchAll(FRAMEWORK_IMPORT)) {
        frameworkImports.push(`${file}: ${match[0].trim()}`);
      }
    }

    expect(defineSites).toEqual([
      { file: expect.stringContaining('copy-button.ts'), tag: ELEMENT_NAME },
    ]);
    expect(frameworkImports).toEqual([]);
  });
});
