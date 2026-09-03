/**
 * ModelSelector — pure logic. Zero react-native imports, so the Vitest tier owns it (see
 * the header of sources.logic.ts for why component files themselves cannot load under
 * Node).
 *
 * The web original's model list is data the caller owns (models.dev-shaped entries);
 * this file holds everything the component derives from that list — the palette rows
 * (with the provider as BOTH the section heading and a filter keyword), the trigger's
 * selected label, and the logo URL derivation.
 */

import type { CommandItem } from '../ui/command.logic';

/** One model the caller offers. `id` is what your route receives — the web contract. */
export type ModelSelectorModel = {
  id: string;
  name: string;
  /** Grouping heading AND the logo key — the web groups by provider with headings. */
  provider: string;
  description?: string;
  /** Extra filter terms beyond name, provider and description. */
  keywords?: string;
};

/**
 * The web original's logo derivation, byte-parity: ModelSelectorLogo renders
 * `https://models.dev/logos/{provider}.svg`. The SVG itself does NOT ship here —
 * React Native Image cannot render SVG, and a raw react-native-svg element cannot
 * receive className without the engine-specific cssInterop the styling contract
 * forbids in registry source (open-in-chat's brand-mark precedent). The derivation is
 * preserved as data for consumers who fetch their own raster mirror; the component's
 * default mark is a themed icon.
 */
export function modelSelectorLogoUrl(provider: string): string {
  return `https://models.dev/logos/${provider}.svg`;
}

/**
 * The palette rows: value = model id, label = name, group = provider, keywords carry
 * the provider (so typing "openai" filters to OpenAI's rows even when a model name
 * never mentions it). Order preserved — the caller's list order IS the display order,
 * within and across groups.
 */
export function toCommandItems(models: readonly ModelSelectorModel[]): CommandItem[] {
  return models.map((m) => ({
    value: m.id,
    label: m.name,
    description: m.description,
    keywords: [m.provider, m.keywords].filter(Boolean).join(' ') || undefined,
    group: m.provider,
  }));
}

/**
 * The trigger's label: the selected model's name, the caller's fallback (or the web
 * trigger's own "Select model") when the value matches nothing. No-throw — a stale
 * value (a model the list no longer carries) degrades to the placeholder.
 */
export function resolveModelLabel(
  models: readonly ModelSelectorModel[],
  value: string | undefined,
  fallback = 'Select model',
): string {
  if (!value) return fallback;
  return models.find((m) => m.id === value)?.name ?? fallback;
}
