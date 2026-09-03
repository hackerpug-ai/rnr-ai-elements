import { describe, expect, it } from 'vitest';
import {
  type ModelSelectorModel,
  modelSelectorLogoUrl,
  resolveModelLabel,
  toCommandItems,
} from '../packages/registry/src/components/ai/model-selector.logic.ts';

/**
 * Pure logic only — the model list derivations (see agent-status.test.ts's header
 * for why rendering itself cannot live in this tier). The logo URL is byte-parity
 * with the web original's models.dev derivation, so its outputs here are parity
 * claims, not house style.
 */

const MODELS: ModelSelectorModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', description: 'Flagship' },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'anthropic' },
  { id: 'gpt-4o-mini', name: 'GPT-4o mini', provider: 'openai', keywords: 'cheap fast' },
];

describe('modelSelectorLogoUrl (the web logo derivation)', () => {
  it('is byte-parity with the web: https://models.dev/logos/{provider}.svg', () => {
    expect(modelSelectorLogoUrl('openai')).toBe('https://models.dev/logos/openai.svg');
    expect(modelSelectorLogoUrl('anthropic')).toBe('https://models.dev/logos/anthropic.svg');
  });

  it('interpolates the provider verbatim — no encoding, exactly like the web template', () => {
    expect(modelSelectorLogoUrl('meta-llama')).toBe('https://models.dev/logos/meta-llama.svg');
  });
});

describe('toCommandItems (the palette rows)', () => {
  it('maps id→value, name→label, provider→group', () => {
    const [first] = toCommandItems(MODELS);
    expect(first).toMatchObject({
      value: 'gpt-4o',
      label: 'GPT-4o',
      group: 'openai',
      description: 'Flagship',
    });
  });

  it('carries the provider in keywords — typing "openai" filters to OpenAI rows', () => {
    const items = toCommandItems(MODELS);
    const openai = items.find((i) => i.value === 'gpt-4o');
    expect(openai?.keywords).toContain('openai');
  });

  it('joins caller keywords after the provider, and omits keywords entirely when both are absent', () => {
    const items = toCommandItems(MODELS);
    expect(items.find((i) => i.value === 'gpt-4o-mini')?.keywords).toBe('openai cheap fast');
    expect(items.find((i) => i.value === 'claude-opus-4')?.keywords).toBe('anthropic');
    expect(toCommandItems([{ id: 'x', name: 'X', provider: 'p' }])[0].keywords).toBe('p');
  });

  it('preserves the caller list order — grouping reorders nothing', () => {
    expect(toCommandItems(MODELS).map((i) => i.value)).toEqual([
      'gpt-4o',
      'claude-opus-4',
      'gpt-4o-mini',
    ]);
  });

  it('maps an empty list to empty rows', () => {
    expect(toCommandItems([])).toEqual([]);
  });
});

describe('resolveModelLabel (the trigger readout)', () => {
  it('is the selected model name', () => {
    expect(resolveModelLabel(MODELS, 'claude-opus-4')).toBe('Claude Opus 4');
  });

  it('falls back to "Select model" for a missing value and for a stale id', () => {
    expect(resolveModelLabel(MODELS, undefined)).toBe('Select model');
    expect(resolveModelLabel(MODELS, 'deleted-model')).toBe('Select model');
  });

  it('honors the caller fallback', () => {
    expect(resolveModelLabel(MODELS, undefined, 'Pick one')).toBe('Pick one');
  });

  it('never throws on an empty list', () => {
    expect(resolveModelLabel([], 'anything')).toBe('Select model');
  });
});
