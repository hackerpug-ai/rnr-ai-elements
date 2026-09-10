import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  InterfaceDeclaration,
  IntersectionTypeNode,
  type Node,
  ParenthesizedTypeNode,
  type Project,
  type PropertySignature,
  TypeAliasDeclaration,
  TypeLiteralNode,
} from 'ts-morph';
import { describe, expect, it } from 'vitest';
import { createDocsProject, extractProps } from '../../scripts/docs-data/props';
import { buildThemingNotes } from '../../scripts/docs-data/theming-note';
import { extractUsageSnippets } from '../../scripts/docs-data/usage-snippet';

/**
 * FUSE-03 module tests (TC-1..TC-4). Every fixture here is the real repo: the
 * real 56-item registry.json, the real five cells batch files, the real
 * packages/registry/src sources. The broken-type fixture is the one synthetic
 * input, written to a real temp dir so the unresolved-prop drill runs against
 * the real checker.
 */
const ROOT = process.cwd();
const BATCHES = ['ai-chat', 'ai-agent', 'ai-code', 'ui', 'lib'] as const;

type Item = { name: string; type: string; files: { path: string }[] };

function loadItems(): Item[] {
  return (
    JSON.parse(readFileSync(join(ROOT, 'packages/registry/registry.json'), 'utf8')) as {
      items: Item[];
    }
  ).items;
}

/** Semantic theme-token class shape — mirrors check-tokens.ts's semantic set. */
const SEMANTIC_CLASS =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|caret|accent)-(?:background|foreground|card|card-foreground|popover|popover-foreground|primary|primary-foreground|secondary|secondary-foreground|muted|muted-foreground|accent|accent-foreground|destructive|destructive-foreground|border|input|ring)\b/g;

function namedClasses(note: string): string[] {
  return [...note.matchAll(SEMANTIC_CLASS)].map((m) => m[0]);
}

/**
 * Independent checker walk: for one component source file, collect EVERY
 * property signature of EVERY top-level `*Props` interface/alias into
 * name -> set of checker type texts. No name-preference logic — a superset
 * the extractor's picks must land inside with byte-identical type text.
 */
function checkerPropsByFile(
  projects: Map<string, Map<string, Set<string>>>,
  relPath: string,
  project: Project,
): Map<string, Set<string>> {
  const cached = projects.get(relPath);
  if (cached) return cached;
  const sf = project.addSourceFileAtPath(join(ROOT, relPath));
  const out = new Map<string, Set<string>>();
  const add = (prop: PropertySignature) => {
    const set = out.get(prop.getName()) ?? new Set<string>();
    set.add(prop.getType().getText(sf));
    out.set(prop.getName(), set);
  };
  const walk = (node: Node): void => {
    if (node instanceof IntersectionTypeNode) {
      for (const member of node.getTypeNodes()) walk(member);
    } else if (node instanceof ParenthesizedTypeNode) {
      walk(node.getTypeNode());
    } else if (node instanceof TypeLiteralNode) {
      for (const prop of node.getProperties()) add(prop);
    }
  };
  for (const statement of sf.getStatements()) {
    if (statement instanceof InterfaceDeclaration) {
      for (const prop of statement.getProperties()) add(prop);
    } else if (statement instanceof TypeAliasDeclaration) {
      const typeNode = statement.getTypeNode();
      if (typeNode) walk(typeNode);
    }
  }
  projects.set(relPath, out);
  return out;
}

describe('extracts props for 39 components', () => {
  // Real ts-morph over the real registry sources takes seconds, not ms.
  it('returns full-text arrays for all 39 components and null for the 17 ui/lib items', {
    timeout: 180_000,
  }, () => {
    const items = loadItems();
    const results = extractProps(items);
    const components = items.filter((i) => i.type === 'registry:component');
    expect(components).toHaveLength(39);

    // 0 throws across the 39 (this call already threw otherwise), arrays back.
    for (const item of components) {
      expect(Array.isArray(results[item.name]), `${item.name} should be an array`).toBe(true);
      for (const prop of results[item.name] ?? []) {
        expect(prop.type.length > 0, `${item.name}.${prop.name} empty type`).toBe(true);
        expect(prop.type.includes('…'), `${item.name}.${prop.name} truncated (…)`).toBe(false);
      }
    }

    // Pinned props from the AC.
    expect((results.conversation ?? []).some((p) => p.name === 'data')).toBe(true);
    expect((results['prompt-input'] ?? []).some((p) => p.name === 'onSubmit')).toBe(true);

    // ui/lib items are null by contract — all 17.
    const nonComponents = items.filter((i) => i.type !== 'registry:component');
    expect(nonComponents.filter((i) => i.type === 'registry:ui')).toHaveLength(11);
    expect(nonComponents.filter((i) => i.type === 'registry:lib')).toHaveLength(6);
    for (const item of nonComponents) {
      expect(results[item.name], `${item.name} (${item.type}) should be null`).toBeNull();
    }

    // Full untruncated type text: every extracted type string equals the
    // checker's own getText for the same property in the same source file.
    const project = createDocsProject();
    const projects = new Map<string, Map<string, Set<string>>>();
    let longest = { item: '', prop: '', type: '' };
    for (const item of components) {
      const byFile = checkerPropsByFile(projects, item.files[0].path, project);
      for (const prop of results[item.name] ?? []) {
        if (prop.type.length > longest.type.length)
          longest = { item: item.name, prop: prop.name, type: prop.type };
        const checkerTexts = byFile.get(prop.name);
        expect(
          checkerTexts?.has(prop.type),
          `${item.name}.${prop.name} type text differs from checker: ${prop.type}`,
        ).toBe(true);
      }
    }
    // The longest observed type survived at full length.
    expect(longest.type.length).toBeGreaterThan(20);
  });

  it('throws naming the item and the prop for a broken-type fixture (TC-2)', {
    timeout: 120_000,
  }, () => {
    const dir = mkdtempSync(join(tmpdir(), 'fuse03-broken-props-'));
    const file = join(dir, 'broken-card.tsx');
    writeFileSync(
      file,
      [
        'type BrokenCardProps = {',
        '  title: string;',
        '  tone: NonexistentFlavorTone;',
        '};',
        '',
        'export function BrokenCard(_props: BrokenCardProps) {',
        '  return null;',
        '}',
        '',
      ].join('\n'),
    );
    const item: Item = { name: 'broken-card', type: 'registry:component', files: [{ path: file }] };
    expect(() => extractProps([item])).toThrow(
      '[docs-data] props: item "broken-card" prop "tone" has unresolved type',
    );
    rmSync(dir, { recursive: true, force: true });
  });
});

describe('extracts verbatim usage snippets', () => {
  it('yields 56 non-empty snippets, each a byte-substring of its declaring batch file', () => {
    const snippets = extractUsageSnippets();
    const items = loadItems();
    expect(Object.keys(snippets)).toHaveLength(56);
    expect([...new Set(items.map((i) => i.name))].sort()).toEqual(
      [...new Set(Object.keys(snippets))].sort(),
    );

    const batchSources = new Map<string, string>();
    for (const batch of BATCHES) {
      batchSources.set(
        batch,
        readFileSync(join(ROOT, `apps/example/gallery/cells/${batch}.tsx`), 'utf8'),
      );
    }

    for (const [name, snippet] of Object.entries(snippets)) {
      expect(snippet.length > 0, `${name} snippet empty`).toBe(true);
      // The declaring batch file: the one whose CELLS object carries the entry.
      let declaring: string | null = null;
      for (const [batch, source] of batchSources) {
        const bare = new RegExp(`^ {2}${name}: \\{`, 'm');
        const quoted = new RegExp(`^ {2}'${name}': \\{`, 'm');
        if (bare.test(source) || quoted.test(source)) declaring = batch;
      }
      expect(declaring, `${name} has no declaring batch file`).not.toBeNull();
      expect(
        batchSources.get(declaring ?? '')?.includes(snippet),
        `${name} snippet is not a byte-substring of cells/${declaring}.tsx`,
      ).toBe(true);
    }

    // Pinned: conversation's populated cell, verbatim from ai-chat.tsx.
    expect(snippets.conversation.includes('Conversation')).toBe(true);
    expect(batchSources.get('ai-chat')?.includes(snippets.conversation)).toBe(true);
  });
});

describe('derives deterministic theming notes', () => {
  it('produces 56 non-empty notes, identical across two runs, with verbatim class names', () => {
    const items = loadItems();
    const run1 = buildThemingNotes(items);
    const run2 = buildThemingNotes(items);
    expect(Object.keys(run1)).toHaveLength(56);

    const tokenless: string[] = [];
    for (const item of items) {
      const note1 = run1[item.name];
      expect(typeof note1 === 'string' && note1.length > 0, `${item.name} note empty`).toBe(true);
      expect(note1).toBe(run2[item.name]);
      // Independent token scan over the item's real sources.
      let hasToken = false;
      for (const f of item.files) {
        const source = readFileSync(join(ROOT, f.path), 'utf8');
        if (SEMANTIC_CLASS.test(source)) hasToken = true;
        SEMANTIC_CLASS.lastIndex = 0;
      }
      if (!hasToken) tokenless.push(item.name);
    }
    expect(
      tokenless.length,
      'expected at least one tokenless item for the default note',
    ).toBeGreaterThan(0);
    // Every tokenless item gets the SAME defined default note.
    expect(new Set(tokenless.map((n) => run1[n])).size).toBe(1);

    // Pinned: shimmer's note names only classes verbatim in shimmer.tsx.
    const shimmerSource = readFileSync(
      join(ROOT, 'packages/registry/src/components/ai/shimmer.tsx'),
      'utf8',
    );
    const shimmerClasses = namedClasses(run1.shimmer);
    expect(shimmerClasses.length).toBeGreaterThan(0);
    for (const cls of shimmerClasses) {
      expect(shimmerSource.includes(cls), `shimmer note names absent class ${cls}`).toBe(true);
    }
  });
});
