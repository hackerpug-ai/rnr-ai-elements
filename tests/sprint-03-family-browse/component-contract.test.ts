import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * FAM-002 — contract scan over the family-browse primitives in the REAL
 * apps/docs/src tree (SectionHeader / ComponentCard / one-line-description /
 * the counter-optionalized Chip).
 *
 * UNIT_TEST_JUSTIFIED: AC-1 executes the pure clamp over the real
 * registry-items.json dataset (a file read + pure function — no rendering, no
 * network, no DB); AC-2/3/4 are static source-contract scans over authored
 * .astro files, the same real-file-read pattern as the landed
 * tests/sprint-02-shell-hero/primitives.test.ts. Rendered card/anchor behavior
 * belongs to FAM-003's card-anatomy.spec.ts playwright lane (flow owner),
 * outside this task's write_allowed.
 *
 * The oneLineDescription import is dynamic so each AC keeps its own RED
 * reason: AC-1 fails on the missing module, AC-2/3 on the missing files,
 * AC-4 on the still-required counter.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const componentsDir = join(repoRoot, 'apps', 'docs', 'src', 'components');

const CARD = join(componentsDir, 'ComponentCard.astro');
const HEADER = join(componentsDir, 'SectionHeader.astro');
const CHIP = join(componentsDir, 'Chip.astro');
const REGISTRY = join(repoRoot, 'apps', 'docs', 'src', 'data', 'registry-items.json');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
const COUNTER_HOOK_UNION = /'version'\s*\|\s*'total'\s*\|\s*'components'\s*\|\s*'ui'\s*\|\s*'libs'/;
const ELLIPSIS = '…';
const MAX_LENGTH = 120;

function styleBlock(source: string, name: string): string {
  const match = source.match(/<style>([\s\S]*)<\/style>/);
  expect(match, `${name} carries a scoped style block`).toBeTruthy();
  return match?.[1] ?? '';
}

function ruleFor(style: string, selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = style.match(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`));
  expect(match, `style carries a ${selector} rule`).toBeTruthy();
  return match?.[1] ?? '';
}

it('FAM-002-one-line-description-clamp: all 39 real descriptions window to <=120 chars at a word boundary, ellipsis only on truncation', async () => {
  // RED at task start: the module does not exist, so this dynamic import fails.
  const { oneLineDescription } = await import('../../apps/docs/src/lib/one-line-description');

  expect(existsSync(REGISTRY), `the real registry exists at ${REGISTRY}`).toBe(true);
  const items = JSON.parse(readFileSync(REGISTRY, 'utf8')) as Array<{
    name: string;
    type: string;
    description: string;
  }>;
  const components = items.filter((item) => item.type === 'registry:component');
  expect(components.length, 'the real registry carries the 39 registry:component items').toBe(39);

  let truncated = 0;
  for (const item of components) {
    const oneLiner = oneLineDescription(item.description);
    expect(oneLiner.length, `${item.name}: output is non-empty`).toBeGreaterThan(0);
    expect(oneLiner.length, `${item.name}: output stays <=120 chars`).toBeLessThanOrEqual(
      MAX_LENGTH,
    );
    if (oneLiner.endsWith(ELLIPSIS)) {
      truncated += 1;
      const clamped = oneLiner.slice(0, -1);
      expect(
        item.description.startsWith(clamped),
        `${item.name}: output is a prefix of the source description`,
      ).toBe(true);
      expect(
        item.description[clamped.length],
        `${item.name}: cut lands on a word boundary, never mid-word`,
      ).toBe(' ');
    } else {
      expect(oneLiner, `${item.name}: non-truncated output passes through unchanged`).toBe(
        item.description,
      );
    }
  }

  // Seeded evidence: the counts on stdout, not just exit 0.
  const lengths = components.map((item) => oneLineDescription(item.description).length);
  console.log(
    `FAM-002 clamp: ${components.length}/${components.length} one-liners non-empty and ` +
      `<=${MAX_LENGTH} chars (longest output ${Math.max(...lengths)}); ` +
      `${truncated}/${components.length} truncated with the ellipsis`,
  );

  // The real descriptions are 132-1840 chars, so every output truncates.
  expect(
    components.every((item) => item.description.length > MAX_LENGTH),
    'every real description exceeds the window',
  ).toBe(true);
  expect(truncated, 'all 39 outputs truncate and end with the ellipsis').toBe(components.length);

  // TC-2 — boundary inputs: short and exactly-120 pass through; a word
  // boundary landing exactly at 120 still yields a <=120 prefix + ellipsis.
  const short = 'tiny summary';
  expect(short.length).toBe(12);
  expect(oneLineDescription(short), 'short input returns its exact input').toBe(short);

  const exactly120 = `${'a'.repeat(60)} ${'b'.repeat(59)}`;
  expect(exactly120.length).toBe(MAX_LENGTH);
  expect(oneLineDescription(exactly120), 'exactly-120 input gains no ellipsis').toBe(exactly120);

  const boundaryAt120 = `${'c'.repeat(120)} tail`;
  const windowed = oneLineDescription(boundaryAt120);
  expect(windowed.endsWith(ELLIPSIS), 'over-window input gains the ellipsis').toBe(true);
  expect(windowed.length).toBeLessThanOrEqual(MAX_LENGTH);
  expect(
    boundaryAt120.startsWith(windowed.slice(0, -1)),
    'boundary case output is still a prefix of its source',
  ).toBe(true);
});

it('FAM-002-component-card-source-contract: one anchor root, inheriting h3, clamped one-liner, Chip+Badge footer, token surface, hover/focus idiom, gated motion, data hooks', () => {
  expect(existsSync(CARD), `ComponentCard exists at ${CARD}`).toBe(true);
  const card = readFileSync(CARD, 'utf8');
  const style = styleBlock(card, 'ComponentCard');

  // Anatomy: exactly one anchor — the card root — one h3, one footer row.
  expect(card.match(/<a[\s>]/g)?.length, 'exactly one anchor (the card root)').toBe(1);
  expect(card, 'the root binds class card and the href prop').toMatch(
    /<a class="card" href=\{href\}/,
  );
  expect(card.match(/<h3[\s>]/g)?.length, 'one h3 title').toBe(1);
  expect(card.match(/<footer[\s>]/g)?.length, 'one footer row').toBe(1);

  // The one-liner: 0.875rem, muted, 2-line clamp.
  const summaryRule = ruleFor(style, '.card__summary');
  expect(summaryRule).toContain('font-size: 0.875rem');
  expect(summaryRule).toContain('color: var(--muted-foreground)');
  expect(summaryRule).toContain('-webkit-line-clamp: 2');

  // The h3 inherits the base heading scale — no font-size override.
  expect(card).not.toMatch(/h3[^{]*\{[^}]*font-size/);

  // Footer: pinned to the card base, composing Chip(category) + Badge(tone).
  const footerRule = ruleFor(style, '.card__footer');
  expect(footerRule).toContain('margin-top: auto');
  expect(card).toContain('<Chip value={category}');
  expect(card).toMatch(/<Badge tone=\{expoGo \? 'expo-go' : 'dev-client'\}/);
  expect(card).toContain("import Badge from './Badge.astro'");
  expect(card).toContain("import Chip from './Chip.astro'");

  // Token surface.
  const cardRule = ruleFor(style, '.card');
  expect(cardRule).toContain('background: var(--card)');
  expect(cardRule).toContain('border: 1px solid var(--border)');
  expect(cardRule).toContain('border-radius: var(--radius-lg)');
  expect(cardRule).toContain('padding: 1rem 1.25rem');

  // Button's outline hover idiom — exactly one hover rule.
  expect(card.match(/:hover/g)?.length, 'exactly one hover rule').toBe(1);
  const hoverRule = ruleFor(style, '.card:hover');
  expect(hoverRule).toContain('border-color: var(--input)');
  expect(hoverRule).toContain('background: var(--accent)');

  // The focus ring is consumed, never suppressed.
  const focusRule = ruleFor(style, '.card:focus-visible');
  expect(focusRule).toContain('var(--ring)');
  expect(card).not.toContain('outline: none');
  expect(card).not.toContain('outline-width: 0');

  // The 120ms transition lives only inside the reduced-motion media query.
  const media = style.match(/@media \(prefers-reduced-motion: no-preference\)\s*\{([\s\S]*)\}\s*$/);
  expect(media, 'the motion rule is declared inside the media query').toBeTruthy();
  expect(media?.[1]).toContain('transition');
  expect(media?.[1]).toContain('120ms');
  expect(media?.[1]).toContain('ease');
  const outsideMedia = style.replace(
    /@media \(prefers-reduced-motion: no-preference\)[\s\S]*$/,
    '',
  );
  expect(outsideMedia, 'no transition escapes the media query').not.toContain('transition');

  // Data hooks: the card plus the filter island's text (name + one-liner + family).
  expect(card).toContain('data-card');
  expect(card).toContain('data-filter-text={filterText}');
  expect(card).toMatch(/const filterText = \[title, oneLiner, category\]\.join\(' '\)/);
  expect(card).toContain("import { oneLineDescription } from '../lib/one-line-description'");

  // MUST_NOT: hex, scripts, custom elements, local verdict text, imagery.
  expect(card.match(HEX_LITERAL), 'no hex color literals').toBeNull();
  expect(card).not.toContain('<script');
  expect(card).not.toContain('customElements.define');
  expect(card, 'Badge owns the verdict strings, not the card').not.toContain('Expo Go');
  expect(card).not.toContain('VERDICTS');
  expect(card).not.toContain('<img');
  expect(card).not.toContain('<picture');
});

it('FAM-002-section-header-source-contract: anchored h2, scroll-margin clearing the sticky Header, baseline flex row, counter-less count Chip', () => {
  expect(existsSync(HEADER), `SectionHeader exists at ${HEADER}`).toBe(true);
  const header = readFileSync(HEADER, 'utf8');
  const style = styleBlock(header, 'SectionHeader');

  // The anchor binding.
  expect(header.match(/<h2 id=\{anchor\}>/g)?.length, 'one h2 bound to the anchor prop').toBe(1);

  // Anchor jumps stop clear of the sticky Header.
  expect(
    header.match(/scroll-margin-block-start:\s*calc\(var\(--layout-header-h\) \+ 1rem\)/g)?.length,
  ).toBe(1);

  // The layout row.
  const rowRule = ruleFor(style, '.section-header');
  expect(rowRule).toContain('display: flex');
  expect(rowRule).toContain('align-items: baseline');
  expect(rowRule).toContain('gap: 0.75rem');

  // The optional count composes through Chip's counter-less form.
  expect(header).toMatch(/count !== undefined/);
  expect(header).toContain("import Chip from './Chip.astro'");
  const chipCall = header.match(/<Chip[^>]*>/)?.[0] ?? '';
  expect(chipCall, 'the count rides the Chip value prop').toContain('value={count}');
  expect(chipCall, 'the count Chip carries no counter prop').not.toContain('counter=');
  expect(header, 'the header never hand-rolls a data-counter pill').not.toContain('data-counter');

  // The counter-less form keeps tabular numerals (asserted against Chip itself).
  expect(existsSync(CHIP), `Chip exists at ${CHIP}`).toBe(true);
  const chip = readFileSync(CHIP, 'utf8');
  expect(chip.match(/var\(--font-mono\)/g)?.length, 'one mono rule in Chip').toBe(1);
  expect(chip.match(/tabular-nums/g)?.length, 'one tabular-nums value style in Chip').toBe(1);

  // MUST_NOT: hex, scripts, heading-scale overrides, decorated rows.
  expect(header.match(HEX_LITERAL), 'no hex color literals').toBeNull();
  expect(header).not.toContain('<script');
  expect(header, 'no font-size override anywhere in the header').not.toContain('font-size');
  expect(style).not.toMatch(/border|background/);
});

it('FAM-002-chip-counter-optional: counter is optional, the counter-less path emits no data-counter, the counter-present passthrough and styles stay sprint-02', () => {
  expect(existsSync(CHIP), `Chip exists at ${CHIP}`).toBe(true);
  const chip = readFileSync(CHIP, 'utf8');

  // The optional signature — exactly one optional marker.
  expect(chip.match(/counter\?:/g)?.length, "one 'counter?:' optional marker").toBe(1);

  // The sprint-01 hook union survives untouched: exactly the five names.
  expect(chip).toMatch(COUNTER_HOOK_UNION);
  for (const hook of ['version', 'total', 'components', 'ui', 'libs']) {
    expect(chip, `the CounterHook union still names ${hook}`).toContain(hook);
  }

  // The counter-present passthrough is byte-identical: the <data> element with
  // both the hook attribute and the stringified value, in both label forms.
  expect(chip.match(/data-counter=\{counter\}/g)?.length).toBe(2);
  expect(chip.match(/value=\{String\(value\)\}/g)?.length).toBe(2);
  expect(chip).toMatch(
    /<data class:list=\{\['chip', 'chip__value'\]\} data-counter=\{counter\} value=\{String\(value\)\}>/,
  );
  expect(chip).toMatch(
    /<data class="chip__value" data-counter=\{counter\} value=\{String\(value\)\}>/,
  );

  // The counter-less render path: a plain pill, zero data-counter emissions.
  const lessStart = chip.indexOf('counter === undefined');
  const presentStart = chip.indexOf('counter !== undefined');
  expect(lessStart, 'the counter-less branch exists').toBeGreaterThan(-1);
  expect(presentStart, 'the counter-present branch exists').toBeGreaterThan(lessStart);
  const counterLessPath = chip.slice(lessStart, presentStart);
  expect(
    counterLessPath.match(/data-counter/g)?.length ?? 0,
    'the counter-less path emits exactly 0 data-counter attributes',
  ).toBe(0);
  expect(counterLessPath).toMatch(/<span/);

  // Sprint-02 styling unchanged: the .chip and .chip__value rules verbatim.
  const chipRule = ruleFor(styleBlock(chip, 'Chip'), '.chip');
  expect(chipRule).toContain('display: inline-flex');
  expect(chipRule).toContain('align-items: baseline');
  expect(chipRule).toContain('gap: 0.5rem');
  expect(chipRule).toContain('padding: 0.25rem 0.75rem');
  expect(chipRule).toContain('border: 1px solid var(--border)');
  expect(chipRule).toContain('border-radius: var(--radius-lg)');
  expect(chipRule).toContain('background: var(--secondary)');
  expect(chipRule).toContain('color: var(--muted-foreground)');
  expect(chipRule).toContain('font-size: 0.875rem');

  const valueRule = ruleFor(styleBlock(chip, 'Chip'), '.chip__value');
  expect(valueRule).toContain('font-family: var(--font-mono)');
  expect(valueRule).toContain('font-weight: 700');
  expect(valueRule).toContain('font-variant-numeric: tabular-nums');
  expect(valueRule).toContain('color: var(--foreground)');
});
