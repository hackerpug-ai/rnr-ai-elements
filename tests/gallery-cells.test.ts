import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Completeness tripwire for the gallery matrix: every non-lib item in the
 * manifest must have all four seeded cells authored in a batch file, and
 * lib items must be demonstrated. Text-level by necessity — the cell files
 * import react-native, which the node test environment cannot load — but
 * the shape is rigid enough (top-level `name: {` entries each carrying the
 * four state keys) that a missing cell cannot slip through. Typecheck owns
 * the render code's correctness; this owns coverage.
 */
const GALLERY_DIR = join(process.cwd(), 'apps/example/gallery');
const BATCH_FILES = [
  'cells/ai-chat.tsx',
  'cells/ai-agent.tsx',
  'cells/ai-code.tsx',
  'cells/ui.tsx',
  'cells/lib.tsx',
] as const;
const STATES = ['populated', 'empty', 'loading', 'error'] as const;

type Entry = { name: string; states: string[] };

function parseEntries(source: string): Entry[] {
  const entries: Entry[] = [];
  const lines = source.split('\n');
  let current: Entry | null = null;
  for (const line of lines) {
    const open = line.match(/^ {2}'?([A-Za-z0-9_-]+)'?: \{$/);
    if (open) {
      current = { name: open[1], states: [] };
      entries.push(current);
      continue;
    }
    if (current) {
      const state = line.match(/^ {4}(populated|empty|loading|error): /);
      if (state) current.states.push(state[1]);
      if (/^ {2}\},?$/.test(line)) current = null;
    }
  }
  return entries;
}

const allEntries: Record<string, Entry[]> = {};
for (const file of BATCH_FILES) {
  allEntries[file] = parseEntries(readFileSync(join(GALLERY_DIR, file), 'utf8'));
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const manifest = (
  await import(join(process.cwd(), 'apps/example/gallery/manifest.ts').replace(/\.ts$/, '.ts'))
).GALLERY_ITEMS as { name: string; kind: string }[];

describe('gallery matrix completeness', () => {
  it('every batch file parses', () => {
    for (const file of BATCH_FILES) {
      expect(allEntries[file], `${file} did not parse`).toBeDefined();
    }
  });

  it('every non-lib item has all four states', () => {
    const authored = new Map<string, string[]>();
    for (const file of BATCH_FILES) {
      for (const e of allEntries[file]) authored.set(e.name, e.states);
    }
    const missing: string[] = [];
    for (const item of manifest) {
      if (item.kind === 'lib') continue;
      const states = authored.get(item.name);
      if (!states || STATES.some((s) => !states.includes(s))) {
        missing.push(`${item.name} (${states?.join(',') ?? 'no entry'})`);
      }
    }
    expect(missing, `items missing cells: ${missing.join(', ')}`).toEqual([]);
  });

  it('every lib item has a demo entry', () => {
    const authored = new Map<string, string[]>();
    for (const file of BATCH_FILES) {
      for (const e of allEntries[file]) authored.set(e.name, e.states);
    }
    const missing = manifest
      .filter((i) => i.kind === 'lib' && !authored.has(i.name))
      .map((i) => i.name);
    expect(missing, `lib items missing demos: ${missing.join(', ')}`).toEqual([]);
  });

  it('no cell entries exist for unknown items', () => {
    const known = new Set(manifest.map((i) => i.name));
    const stray: string[] = [];
    for (const file of BATCH_FILES) {
      for (const e of allEntries[file]) {
        if (!known.has(e.name)) stray.push(`${file}: ${e.name}`);
      }
    }
    expect(stray, `entries not in the manifest: ${stray.join(', ')}`).toEqual([]);
  });
});
