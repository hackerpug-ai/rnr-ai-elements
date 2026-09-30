/**
 * GBC-009 — the section-aware routing drill (AC-3 + the href-derivation unit).
 *
 * UNIT_TEST_JUSTIFIED (task contract): the porting-entry guard takes entry
 * arrays as arguments, so the 0/1/2 cases are exact without a build; the href
 * derivation is a pure function over (id, section); and porting.astro is one
 * static read. Zero network, zero build I/O. The rendered /porting proof is
 * AC-2's primary FLOW-DOCS-05 spec (porting-map.spec.ts) over the real build.
 *
 * Named selectors:
 *   - GBC-009-porting-entry-count    (AC-3) 0 and 2 porting entries throw
 *                                    naming 'porting' and the count; exactly 1
 *                                    returns the published entry at /porting;
 *                                    porting.astro imports and calls the guard.
 *   - GBC-009-section-href-derivation (TC-1) the one derivation: getting-started
 *                                    -> /docs/{id}, guides -> /guides/{basename}
 *                                    (never /guides/guides/...), porting ->
 *                                    /porting, reserved theming -> /docs/theming.
 *   - GBC-009-duplicate-destinations (TC-1) cross-section same-slug entries are
 *                                    legal; a same derived destination throws.
 */

import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import {
  type DocsCollectionEntry,
  type DocsSection,
  hrefFor,
  portingEntry,
  publishedDocs,
} from '../../apps/docs/src/lib/docs-navigation';
import { deriveExpectedDestinations } from '../../apps/docs/src/lib/search-page-model';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** Literal collection entry shaped exactly as the glob loader emits it. */
function entry(id: string, section: DocsSection, order = 1, draft?: boolean): DocsCollectionEntry {
  return {
    id,
    data: { title: `Title of ${id}`, description: `Description of ${id}`, section, order, draft },
  };
}

test('GBC-009-porting-entry-count', () => {
  // 0 porting entries -> throws naming 'porting' and the count 0.
  const zero = [entry('introduction', 'getting-started'), entry('re-theme', 'guides')];
  expect(() => portingEntry(zero)).toThrow(/porting/);
  expect(() => portingEntry(zero)).toThrow(/found 0/);
  // A draft porting entry is not a published porting entry: still 0.
  const draftOnly = [
    entry('introduction', 'getting-started'),
    entry('porting', 'porting', 1, true),
  ];
  expect(() => portingEntry(draftOnly)).toThrow(/found 0/);

  // 2 porting entries -> throws naming 'porting' and the count 2 (the count
  // check must fire before any duplicate-destination derivation, because two
  // porting entries share the single /porting destination by design).
  const two = [entry('porting', 'porting'), entry('porting-2', 'porting')];
  expect(() => portingEntry(two)).toThrow(/porting/);
  expect(() => portingEntry(two)).toThrow(/found 2/);

  // Exactly 1 -> returns the one published entry, at href /porting.
  const one = [entry('introduction', 'getting-started'), entry('porting', 'porting')];
  const doc = portingEntry(one);
  expect(doc.href).toBe('/porting');
  expect(doc.id).toBe('porting');
  expect(doc.section).toBe('porting');

  // porting.astro imports and calls the same guard the build runs.
  const astro = readFileSync(join(ROOT, 'apps/docs/src/pages/porting.astro'), 'utf8');
  expect(astro, 'porting.astro imports the portingEntry guard').toMatch(/portingEntry/);
  expect(astro, 'porting.astro imports the guard from docs-navigation').toMatch(
    /from '\.\.\/lib\/docs-navigation'/,
  );
  expect(astro, 'porting.astro calls the guard').toMatch(/portingEntry\(/);
});

test('GBC-009-section-href-derivation', () => {
  // TC-1: getting-started -> /docs/{id}, guides -> /guides/{basename(id)},
  // porting -> /porting. The guides prefix is stripped: `guides/re-theme`
  // publishes at /guides/re-theme, never /guides/guides/re-theme.
  expect(hrefFor('introduction', 'getting-started')).toBe('/docs/introduction');
  expect(hrefFor('guides/re-theme', 'guides')).toBe('/guides/re-theme');
  expect(hrefFor('guides/re-theme', 'guides')).not.toBe('/guides/guides/re-theme');
  expect(hrefFor('troubleshooting', 'guides')).toBe('/guides/troubleshooting');
  expect(hrefFor('porting', 'porting')).toBe('/porting');

  // The reserved theming slug keeps its static /docs/theming destination even
  // though its authored section is guides (ORI-AST-003's nav pin stays intact).
  expect(hrefFor('theming', 'guides')).toBe('/docs/theming');

  // The published contract emits section-aware hrefs in declared section order
  // and still excludes the reserved slug from the published set.
  const docs = publishedDocs([
    entry('porting', 'porting', 1),
    entry('guides/re-theme', 'guides', 1),
    entry('introduction', 'getting-started', 1),
    entry('theming', 'guides', 2),
  ]);
  expect(docs.map((doc) => doc.href)).toEqual([
    '/docs/introduction',
    '/guides/re-theme',
    '/porting',
  ]);
});

test('GBC-009-duplicate-destinations', () => {
  // Cross-section same final slug is legal: /docs/troubleshooting and
  // /guides/troubleshooting are different destinations.
  const legal = [
    entry('troubleshooting', 'getting-started'),
    entry('guides/troubleshooting', 'guides'),
  ];
  expect(() => publishedDocs(legal)).not.toThrow();

  // The same derived destination still fails, naming the destination.
  const duplicate = [entry('re-theme', 'guides'), entry('guides/re-theme', 'guides')];
  expect(() => publishedDocs(duplicate)).toThrow(/duplicate docs destination "\/guides\/re-theme"/);
});

test('GBC-009-search-destinations-track-the-publication-contract', () => {
  // The search index's expected-destination derivation (browser-pure mirror of
  // hrefFor) must agree with the publication contract: /porting for the porting
  // section, /guides/{basename} for guides, /docs/{id} for reserved slugs.
  const destinations = deriveExpectedDestinations(
    [],
    [
      { id: 'porting', section: 'porting' },
      { id: 'guides/re-theme', section: 'guides' },
      { id: 'theming', section: 'guides' },
      { id: 'introduction', section: 'getting-started' },
    ],
  );
  expect(destinations.map((destination) => destination.href)).toEqual([
    '/docs/introduction',
    '/docs/theming',
    '/guides/re-theme',
    '/porting',
  ]);
});
