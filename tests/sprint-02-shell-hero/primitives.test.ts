import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * SHELL-005 — token-contract scan over the three authored primitives in the
 * REAL apps/docs/src/components tree (Button / Chip / Badge).
 *
 * UNIT_TEST_JUSTIFIED: pure static source-contract scan over authored .astro
 * files — file reads only, no runtime behavior, no network, no rendering
 * (same pattern as the landed island-budget.test.ts). The rendered behavioral
 * proof is AC-2's non-primary flow reference (home-hero.spec.ts, owned by
 * SHELL-011, final wave).
 *
 * Contract (task SHELL-005, AC-1):
 * - Button: filled var(--primary) / outline / link variants, prop-driven; href
 *   renders an anchor, absence renders a button; a :focus-visible rule
 *   consumes the ring token.
 * - Chip: renders the <data data-counter> passthrough with the exact sprint-01
 *   hook names (version, total, components, ui, libs).
 * - Badge: exactly two verdict tones — Expo Go positive and dev-client warning
 *   keyed to var(--destructive); tone classes derive from the tone prop.
 * - All three: token-only (zero hex literals), zero script tags, zero
 *   customElements.define — zero-JS primitives.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const componentsDir = join(repoRoot, 'apps', 'docs', 'src', 'components');

const SOURCES = {
  Button: join(componentsDir, 'Button.astro'),
  Chip: join(componentsDir, 'Chip.astro'),
  Badge: join(componentsDir, 'Badge.astro'),
} as const;

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
const VARIANT_UNION = /'primary'\s*\|\s*'outline'\s*\|\s*'link'/;
const COUNTER_HOOK_UNION = /'version'\s*\|\s*'total'\s*\|\s*'components'\s*\|\s*'ui'\s*\|\s*'libs'/;
const TONE_UNION = /'expo-go'\s*\|\s*'dev-client'/;

it('SHELL-005-primitives-token-contract: Button variants and polymorphism, Chip data-counter passthrough, Badge verdict tones, token-only and script-free', () => {
  // RED at task start: none of the three files exists yet.
  for (const [name, path] of Object.entries(SOURCES)) {
    expect(existsSync(path), `${name} exists at ${path}`).toBe(true);
  }
  const sources: Record<string, string> = {
    Button: readFileSync(SOURCES.Button, 'utf8'),
    Chip: readFileSync(SOURCES.Chip, 'utf8'),
    Badge: readFileSync(SOURCES.Badge, 'utf8'),
  };

  // TC-1 — Button: prop-driven filled/outline/link variants, anchor/button
  // polymorphism, :focus-visible ring.
  const button = sources.Button;
  expect(button, 'variant prop declares primary/outline/link').toMatch(VARIANT_UNION);
  expect(button, 'filled variant consumes the primary token').toContain('var(--primary)');
  expect(button, 'filled variant pairs primary with its foreground').toContain(
    'var(--primary-foreground)',
  );
  expect(button, 'outline variant class exists').toContain('btn--outline');
  expect(button, 'link variant class exists').toContain('btn--link');
  expect(button, 'variant class is derived from the variant prop').toMatch(/btn--\$\{variant\}/);
  expect(button, 'href branch renders an anchor').toMatch(/<a[\s>]/);
  expect(button, 'no-href branch renders a button').toMatch(/<button[\s>]/);
  expect(button, 'polymorphism keys off the href prop').toMatch(/href\s*!==\s*undefined/);
  expect(button, 'focus-visible rule present').toContain(':focus-visible');
  expect(button, 'focus ring consumes the ring token').toContain('var(--ring)');

  // TC-2 — Chip: the <data data-counter> passthrough with the sprint-01 hooks.
  const chip = sources.Chip;
  expect(chip, 'renders a data element').toMatch(/<data[\s>]/);
  expect(chip, 'data-counter attribute is passed through').toMatch(/data-counter=\{counter\}/);
  expect(chip, 'counter hooks are the sprint-01 five').toMatch(COUNTER_HOOK_UNION);
  expect(chip, 'value is passed to the data element').toMatch(/value=\{String\(value\)\}/);

  // TC-3 — Badge: exactly two verdict tones; warning keyed to --destructive.
  const badge = sources.Badge;
  expect(badge, 'tone prop declares exactly expo-go and dev-client').toMatch(TONE_UNION);
  expect(badge, 'names the Expo Go verdict').toContain('Expo Go');
  expect(badge, 'names the dev-client verdict').toContain('dev-client');
  expect(badge, 'warning tone consumes the destructive token').toContain('var(--destructive)');
  expect(badge, 'tone class is derived from the tone prop').toMatch(/badge--\$\{tone\}/);

  // Token-only and script-free, all three files.
  for (const [name, source] of Object.entries(sources)) {
    expect(source.match(HEX_LITERAL), `${name} carries no hex color literal`).toBeNull();
    expect(source, `${name} ships no script tag`).not.toContain('<script');
    expect(source, `${name} defines no custom element`).not.toContain('customElements.define');
  }
});
