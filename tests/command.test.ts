import { describe, expect, it } from 'vitest';
import {
  buildCommandRows,
  type CommandItem,
  filterCommandItems,
} from '../packages/registry/src/components/ui/command.logic.ts';

/**
 * Pure logic only — the palette's filter and its flat-item → render-rows transform.
 * These are the two behaviors model-selector (provider grouping), voice-selector
 * (custom rows) and mic-selector build on; the rendering itself belongs to the device
 * tier (see agent-status.test.ts's header for why).
 */

const ITEMS: CommandItem[] = [
  {
    value: 'gpt-4',
    label: 'GPT-4',
    description: 'OpenAI flagship',
    keywords: 'openai',
    group: 'OpenAI',
  },
  { value: 'opus', label: 'Claude Opus', keywords: 'anthropic', group: 'Anthropic' },
  { value: 'gpt-3', label: 'GPT-3', keywords: 'openai legacy', group: 'OpenAI' },
  { value: 'bare', label: 'No Group' },
];

describe('filterCommandItems (the palette filter)', () => {
  it('returns every item for a blank or whitespace query, in order', () => {
    expect(filterCommandItems(ITEMS, '')).toHaveLength(4);
    expect(filterCommandItems(ITEMS, '   ')).toHaveLength(4);
    expect(filterCommandItems(ITEMS, '').map((i) => i.value)).toEqual([
      'gpt-4',
      'opus',
      'gpt-3',
      'bare',
    ]);
  });

  it('matches the label case-insensitively', () => {
    expect(filterCommandItems(ITEMS, 'GPT')).toHaveLength(2);
    expect(filterCommandItems(ITEMS, 'claude opus').map((i) => i.value)).toEqual(['opus']);
  });

  it('matches description and keywords — provider search finds models whose names never mention it', () => {
    expect(filterCommandItems(ITEMS, 'openai flagship').map((i) => i.value)).toEqual(['gpt-4']);
    expect(filterCommandItems(ITEMS, 'anthropic').map((i) => i.value)).toEqual(['opus']);
  });

  it('preserves the caller list order — the list order IS the display order', () => {
    expect(filterCommandItems(ITEMS, 'gpt').map((i) => i.value)).toEqual(['gpt-4', 'gpt-3']);
  });

  it('returns an empty list when nothing matches — the caller renders the empty state', () => {
    expect(filterCommandItems(ITEMS, 'llama')).toEqual([]);
  });
});

describe('buildCommandRows (grouping + selection)', () => {
  it('renders ungrouped items with no header', () => {
    const rows = buildCommandRows([{ value: 'a', label: 'A' }]);
    expect(rows).toEqual([
      { kind: 'item', key: 'a', item: { value: 'a', label: 'A' }, selected: false },
    ]);
  });

  it('emits one header per group, before its first item, in first-appearance order', () => {
    const rows = buildCommandRows(ITEMS);
    const headers = rows
      .filter((r) => r.kind === 'header')
      .map((r) => (r as { label: string }).label);
    expect(headers).toEqual(['OpenAI', 'Anthropic']);
  });

  it('keeps interleaved groups unmerged: a later item of an earlier group gets no second header', () => {
    const rows = buildCommandRows(ITEMS);
    const kinds = rows.map((r) => (r.kind === 'header' ? `h:${r.label}` : `i:${r.item.value}`));
    expect(kinds).toEqual([
      'h:OpenAI',
      'i:gpt-4',
      'h:Anthropic',
      'i:opus',
      'i:gpt-3', // second OpenAI item, no repeated header
      'i:bare',
    ]);
  });

  it('marks exactly the selected item', () => {
    const rows = buildCommandRows(ITEMS, 'gpt-3');
    const selected = rows.filter((r) => r.kind === 'item' && r.selected);
    expect(selected).toHaveLength(1);
    expect((selected[0] as { item: CommandItem }).item.value).toBe('gpt-3');
  });

  it('renders no header for a group whose items were all filtered away', () => {
    // buildCommandRows runs AFTER the filter; a pre-filtered list with no Anthropic
    // survivors must not carry the Anthropic heading.
    const rows = buildCommandRows(
      ITEMS.filter((i) => i.group !== 'Anthropic'),
      undefined,
    );
    const headers = rows
      .filter((r) => r.kind === 'header')
      .map((r) => (r as { label: string }).label);
    expect(headers).toEqual(['OpenAI']);
  });

  it('treats a whitespace-only group as ungrouped', () => {
    const rows = buildCommandRows([{ value: 'a', label: 'A', group: '   ' }]);
    expect(rows.filter((r) => r.kind === 'header')).toHaveLength(0);
  });
});
