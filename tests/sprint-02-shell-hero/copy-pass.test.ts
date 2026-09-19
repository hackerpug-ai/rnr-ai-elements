import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * SHELL-010 — the copy pass's authored-source contract.
 *
 * Unit tier, island-budget.test.ts / scaffold.build.test.ts file-scan
 * precedent: pure reads of the authored source with zero I/O beyond the
 * filesystem — no runtime, no network, no browser. The rendered-output
 * proofs ride the locked flow specs (home-hero.spec.ts FLOW-GEND-01/02,
 * theming-route.test.ts, component-page.spec.ts FLOW-GEND-14); this lane
 * pins that the words-only pass landed the deliverable strings themselves.
 *
 * - SHELL-010-hero-copy-contract (AC-1): identity sentence, copy-paste
 *   registry, NOT-an-npm-package, CTA label/href pairings, the 'Registry
 *   items' counter label, zero banned terminology, no hero sentence over
 *   25 words (after comment-stripping and tag-stripping).
 * - SHELL-010-theming-copy-contract (AC-2): the four copy-stable anchors
 *   survive the polish; zero placeholder signatures; zero banned
 *   terminology; every internal href stays within {/, /components}.
 * - SHELL-010-microcopy-and-anatomy-contract (AC-3): install stays the
 *   first data-section in [item].astro; both islands carry aria-label
 *   attributes; none of the three files gains banned terminology or a
 *   placeholder signature.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));

const INDEX_PATH = join(repoRoot, 'apps/docs/src/pages/index.astro');
const THEMING_PATH = join(repoRoot, 'apps/docs/src/pages/docs/theming.astro');
const ITEM_PATH = join(repoRoot, 'apps/docs/src/pages/components/[item].astro');
const TOGGLE_PATH = join(repoRoot, 'apps/docs/src/components/islands/ThemeToggle.astro');
const TABS_PATH = join(repoRoot, 'apps/docs/src/components/islands/TabGroup.astro');

/** The TR-12 lock's Not-column synonyms — never in a touched string. */
const BANNED_TERMS = ['styling engine', 'flavor', 'registry variant'] as const;
/** Placeholder signatures — a placeholder page is a stub page. */
const PLACEHOLDER_SIGNATURES = ['coming soon', 'todo', 'placeholder', 'lorem'] as const;
/** The only internal routes the theming page's own content may link. */
const ALLOWED_THEMING_HREFS = ['/', '/components'] as const;

/** Strip Astro comment blocks: frontmatter /* ... *&#47; and <!-- --> HTML comments. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
}

function readStripped(path: string): string {
  return stripComments(readFileSync(path, 'utf8'));
}

/** Tag-strip to visible text, collapse whitespace, split on sentence enders. */
function visibleSentences(html: string): string[] {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
}

function wordCount(sentence: string): number {
  return sentence.split(/\s+/).filter(Boolean).length;
}

function expectNoBannedTerms(name: string, source: string): void {
  const lowered = source.toLowerCase();
  for (const term of BANNED_TERMS) {
    expect(lowered, `${name} must not contain the banned terminology '${term}'`).not.toContain(
      term,
    );
  }
}

function expectNoPlaceholderSignatures(name: string, source: string): void {
  const lowered = source.toLowerCase();
  for (const signature of PLACEHOLDER_SIGNATURES) {
    expect(
      lowered,
      `${name} must not contain the placeholder signature '${signature}'`,
    ).not.toContain(signature);
  }
}

it('SHELL-010-hero-copy-contract: identity, copy-paste registry, NOT-an-npm, CTA pairing, Registry items counter, clean terminology, 25-word sentences', () => {
  const source = readStripped(INDEX_PATH);

  // The pinned identity sentence survives byte-exact (T-GEND-001 grep set).
  expect(source, 'the sprint-01 identity h1 must survive the pass').toContain(
    'Universal AI chat and agent UI components for React Native',
  );
  expect(source).toContain('copy-paste registry');
  expect(source).toContain('NOT an npm package');

  // CTA labels pair with their hrefs in the authored source.
  expect(source, "'Get started' must link /registry").toMatch(
    /href="\/registry"\s*>\s*Get started\s*</,
  );
  expect(source, "'Browse components' must link /components").toMatch(
    /href="\/components"\s*>\s*Browse components\s*</,
  );

  // The 56-counter label reads 'Registry items' (terminology lock: registry item).
  expect(source, "the total counter label must read 'Registry items'").toContain('Registry items');

  expectNoBannedTerms('index.astro', source);

  // No hero sentence exceeds 25 words after comment- and tag-stripping.
  const h1 = source.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '';
  const statement = source.match(/<p class="hero__statement">([\s\S]*?)<\/p>/)?.[1] ?? '';
  expect(h1, 'the hero h1 block must exist').not.toBe('');
  expect(statement, 'the hero statement block must exist').not.toBe('');
  for (const sentence of [...visibleSentences(h1), ...visibleSentences(statement)]) {
    const words = wordCount(sentence);
    expect(
      words,
      `hero sentence must stay within 25 words (${words}): "${sentence.slice(0, 80)}"`,
    ).toBeLessThanOrEqual(25);
  }
});

it('SHELL-010-theming-copy-contract: four anchors survive the polish, honest sentences only, internal hrefs within {/, /components}', () => {
  const source = readStripped(THEMING_PATH);

  // The copy-stable anchors (theming-route.test.ts pins them in the served HTML).
  for (const anchor of ['ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'] as const) {
    expect(source, `the copy-stable anchor '${anchor}' must survive the polish`).toContain(anchor);
  }

  expectNoPlaceholderSignatures('theming.astro', source);
  expectNoBannedTerms('theming.astro', source);

  // Every internal href the page's own content carries stays in {/, /components}.
  const internalHrefs = [...source.matchAll(/href="(\/[^"]*)"/g)].map((match) => match[1]);
  expect(internalHrefs, 'the theming page must carry onward internal links').not.toEqual([]);
  for (const href of internalHrefs) {
    const normalized = href.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
    expect(
      ALLOWED_THEMING_HREFS,
      `theming.astro internal href '${href}' must stay within {/, /components}`,
    ).toContain(normalized);
  }
});

it('SHELL-010-microcopy-and-anatomy-contract: install first, both islands aria-labeled, touched files clean', () => {
  const itemSource = readStripped(ITEM_PATH);
  const toggleSource = readStripped(TOGGLE_PATH);
  const tabsSource = readStripped(TABS_PATH);

  // install remains the FIRST section value (SHELL-008's anatomy pin).
  const sectionValues = [...itemSource.matchAll(/data-section="([^"]*)"/g)].map(
    (match) => match[1],
  );
  expect(sectionValues, '[item].astro must carry data-section values').not.toEqual([]);
  expect(sectionValues[0], "the first data-section value must stay 'install'").toBe('install');

  // Both island files carry aria-label attributes (AC-3). The value form is
  // authored-source JSX (static string or template literal), so pin the
  // attribute itself, not its quoting.
  expect(toggleSource, 'ThemeToggle.astro must carry an aria-label attribute').toMatch(
    /aria-label=/,
  );
  expect(tabsSource, 'TabGroup.astro must carry an aria-label attribute').toMatch(/aria-label=/);

  expectNoBannedTerms('[item].astro', itemSource);
  expectNoPlaceholderSignatures('[item].astro', itemSource);
  expectNoBannedTerms('ThemeToggle.astro', toggleSource);
  expectNoPlaceholderSignatures('ThemeToggle.astro', toggleSource);
  expectNoBannedTerms('TabGroup.astro', tabsSource);
  expectNoPlaceholderSignatures('TabGroup.astro', tabsSource);
});
