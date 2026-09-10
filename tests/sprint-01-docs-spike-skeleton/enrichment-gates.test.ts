import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extractProps } from '../../scripts/docs-data/props';
import { buildThemingNotes } from '../../scripts/docs-data/theming-note';
import { extractUsageSnippets } from '../../scripts/docs-data/usage-snippet';

/**
 * FUSE-03 lane gate (FLOW-DELIV-01-fail-closed-item-count): the three
 * enrichment modules run over ALL 56 real registry items — real ts-morph over
 * the real packages/registry/src sources, real AST ranges over the real cells
 * batch files, real filesystem reads for theming — and the broken-type fixture
 * drill proves the fail-closed error path end to end (throw + exit 1) via a
 * real subprocess of the module CLI.
 */
const ROOT = process.cwd();

type Item = { name: string; type: string; files: { path: string }[] };

/**
 * CANONICAL semantic-class regex — token alternation longest-first so
 * compounds (muted-foreground) never capture truncated at their prefix
 * (muted). Must match theming-note.ts's TOKEN_CLASS ordering.
 */
const SEMANTIC_CLASS =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|caret|accent)-(?:card-foreground|popover-foreground|primary-foreground|secondary-foreground|muted-foreground|accent-foreground|destructive-foreground|background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring)\b/g;

/** Truncation oracle: the named class must appear NOT followed by another token character. */
function appearsWhole(source: string, cls: string): boolean {
  const escaped = cls.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
  return new RegExp(`${escaped}(?![\\w-])`).test(source);
}

const BROKEN_FIXTURE = [
  'type BrokenCardProps = {',
  '  title: string;',
  '  tone: NonexistentFlavorTone;',
  '};',
  '',
  'export function BrokenCard(_props: BrokenCardProps) {',
  '  return null;',
  '}',
  '',
].join('\n');

describe('enrichment gates', () => {
  it('FLOW-DELIV-01-fail-closed-item-count', { timeout: 300_000 }, () => {
    const items = JSON.parse(
      readFileSync(join(ROOT, 'packages/registry/registry.json'), 'utf8'),
    ) as { items: Item[] };
    const all = items.items;
    expect(all).toHaveLength(56);
    const components = all.filter((i) => i.type === 'registry:component');
    expect(components).toHaveLength(39);

    // AC-1 case 1: props over the real registry — 0 throws, pinned names,
    // full untruncated type text, null for the 17 ui/lib items.
    const props = extractProps(all);
    for (const item of components) {
      expect(Array.isArray(props[item.name]), `${item.name} props`).toBe(true);
      for (const prop of props[item.name] ?? []) {
        expect(prop.type.includes('…'), `${item.name}.${prop.name} ellipsis`).toBe(false);
        expect(prop.type === 'any', `${item.name}.${prop.name} silent any`).toBe(false);
      }
    }
    expect((props.conversation ?? []).some((p) => p.name === 'data')).toBe(true);
    expect((props['prompt-input'] ?? []).some((p) => p.name === 'onSubmit')).toBe(true);
    for (const item of all.filter((i) => i.type !== 'registry:component')) {
      expect(props[item.name], `${item.name} (${item.type})`).toBeNull();
    }

    // AC-2 case 1: 56 verbatim snippets, each a byte-substring of a real batch file.
    const snippets = extractUsageSnippets();
    expect(Object.keys(snippets)).toHaveLength(56);
    const batchTexts = ['ai-chat', 'ai-agent', 'ai-code', 'ui', 'lib'].map((b) =>
      readFileSync(join(ROOT, `apps/example/gallery/cells/${b}.tsx`), 'utf8'),
    );
    for (const [name, snippet] of Object.entries(snippets)) {
      expect(snippet.length > 0, `${name} empty snippet`).toBe(true);
      expect(
        batchTexts.some((src) => src.includes(snippet)),
        `${name} snippet absent from every batch file`,
      ).toBe(true);
    }
    expect(snippets.conversation.includes('Conversation')).toBe(true);
    expect(
      readFileSync(join(ROOT, 'apps/example/gallery/cells/ai-chat.tsx'), 'utf8').includes(
        snippets.conversation,
      ),
    ).toBe(true);

    // AC-3 case 1: 56 non-empty deterministic notes; every named class appears
    // WHOLE in the item's real source (truncation guard); shimmer pinned.
    const notesRun1 = buildThemingNotes(all);
    const notesRun2 = buildThemingNotes(all);
    expect(Object.keys(notesRun1)).toHaveLength(56);
    for (const item of all) {
      expect(notesRun1[item.name].length > 0, `${item.name} note empty`).toBe(true);
      expect(notesRun1[item.name]).toBe(notesRun2[item.name]);
      const combined = item.files.map((f) => readFileSync(join(ROOT, f.path), 'utf8')).join('\n');
      const named = [...notesRun1[item.name].matchAll(SEMANTIC_CLASS)].map((m) => m[0]);
      for (const cls of named) {
        expect(
          appearsWhole(combined, cls),
          `${item.name}: note names "${cls}" which is absent/truncated in source`,
        ).toBe(true);
      }
    }
    const shimmerSource = readFileSync(
      join(ROOT, 'packages/registry/src/components/ai/shimmer.tsx'),
      'utf8',
    );
    const shimmerClasses = [...notesRun1.shimmer.matchAll(SEMANTIC_CLASS)].map((m) => m[0]);
    expect(shimmerClasses).toContain('text-muted-foreground');
    expect(notesRun1.shimmer).toBe('Themed via text-muted-foreground.');
    for (const cls of shimmerClasses) {
      expect(appearsWhole(shimmerSource, cls), `shimmer note names absent class ${cls}`).toBe(true);
    }

    // AC-1 case 2: the broken-type fixture drill, as a real module subprocess.
    const dir = mkdtempSync(join(tmpdir(), 'fuse03-gate-broken-'));
    const fixture = join(dir, 'broken-card.tsx');
    writeFileSync(fixture, BROKEN_FIXTURE);
    const proc = spawnSync(
      join(ROOT, 'node_modules/.bin/tsx'),
      [join(ROOT, 'scripts/docs-data/props.ts'), '--file', fixture, '--name', 'broken-card'],
      { encoding: 'utf8' },
    );
    rmSync(dir, { recursive: true, force: true });
    expect(proc.error).toBeUndefined();
    expect(proc.status, `props.ts CLI should exit non-zero, stdout: ${proc.stdout}`).not.toBe(0);
    expect(proc.status).not.toBeNull();
    expect(proc.stderr.startsWith('[docs-data] props:'), `stderr: ${proc.stderr}`).toBe(true);
    expect(proc.stderr).toMatch(
      /\[docs-data\] props: item "broken-card" prop "tone" has unresolved type/,
    );
  });
});
