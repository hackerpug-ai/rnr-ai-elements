/**
 * GBC-001 — the four authored job guides, source-scanned (AC-5, AC-6).
 *
 * Read-only over the authored sources: the four guide manuscripts under
 * apps/docs/src/content/docs/guides/, the re-sectioned theming.mdx, and the
 * repointed seam-map.ts. No build, no network, no browser (the rendered
 * FLOW-DOCS-03 proof belongs to GBC-010's guides-index.spec.ts).
 *
 * Frontmatter parses through Astro's own parser — the same single authority
 * the collection loader and GBC-012's gates use — so this scan's view of
 * section / order can never drift from the build's.
 *
 * Named checks (one per unit AC):
 *   - engine facts pair Tailwind majors with the right tree    (AC-5)
 *     No sentence pairs Tailwind v4 (or @theme) with the nativewind
 *     tree, pairs Tailwind v3 with the uniwind tree, or prints the
 *     forbidden 'nativewind v3' / 'NativeWind 3' version claims;
 *     the re-theme guide states both true pairings.
 *   - guide frontmatter, goal sentence and seam targets        (AC-6)
 *     section: guides with orders {1,2,3,4} across the four files,
 *     exactly one 'This guide shows you how to' sentence each,
 *     theming.mdx section: getting-started, and SEAM_LINK_TARGETS
 *     pointing at both customize-rendering anchors.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { SEAM_LINK_TARGETS } from '../../apps/docs/src/lib/seam-map';

const ROOT = process.cwd();

const GUIDE_FILES = [
  're-theme',
  'update-installed-items',
  'preview-on-device',
  'customize-rendering',
] as const;

const GUIDES_DIR = join(ROOT, 'apps/docs/src/content/docs/guides');
const THEMING_PATH = join(ROOT, 'apps/docs/src/content/docs/theming.mdx');

/** Astro's own frontmatter parser, reached exactly the way GBC-012's gate reaches it. */
async function parseFrontmatterWithAstro(text: string): Promise<Record<string, unknown>> {
  const requireFromDocs = createRequire(pathToFileURL(join(ROOT, 'apps/docs/package.json')));
  const astroPackagePath = requireFromDocs.resolve('astro/package.json');
  const requireFromAstro = createRequire(astroPackagePath);
  const helperPath = requireFromAstro.resolve('@astrojs/internal-helpers/frontmatter');
  const module = (await import(pathToFileURL(helperPath).href)) as {
    parseFrontmatter: (source: string) => { frontmatter: Record<string, unknown> };
  };
  return module.parseFrontmatter(text).frontmatter;
}

/** The manuscript body: everything after the closing frontmatter fence. */
function bodyOf(text: string): string {
  const match = text.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/);
  return match ? text.slice(match[0].length) : text;
}

/** Sentences of a body: split on terminal punctuation, whitespace-collapsed. */
function sentencesOf(body: string): string[] {
  return body
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.replaceAll(/\s+/g, ' ').trim())
    .filter((sentence) => sentence.length > 0);
}

const GOAL_SENTENCE = 'This guide shows you how to';

describe('GBC-001 engine facts pair Tailwind majors with the right tree', () => {
  const guides = GUIDE_FILES.map((name) => ({
    name,
    text: readFileSync(join(GUIDES_DIR, `${name}.md`), 'utf8'),
  }));

  it('no guide prints a forbidden version claim', () => {
    for (const { name, text } of guides) {
      expect(text, `${name}.md never claims 'nativewind v3'`).not.toMatch(/nativewind v3/i);
      expect(text, `${name}.md never claims 'NativeWind 3'`).not.toMatch(/NativeWind 3/);
    }
  });

  it('no sentence inverts an engine pairing', () => {
    for (const { name, text } of guides) {
      for (const sentence of sentencesOf(bodyOf(text))) {
        const v4 = sentence.includes('Tailwind v4') || sentence.includes('@theme');
        const v3 = sentence.includes('Tailwind v3');
        if (v4) {
          expect(
            sentence,
            `${name}.md must not pair Tailwind v4/@theme with the nativewind tree: "${sentence}"`,
          ).not.toMatch(/nativewind (engine )?tree/);
        }
        if (v3) {
          expect(
            sentence,
            `${name}.md must not pair Tailwind v3 with the uniwind tree: "${sentence}"`,
          ).not.toMatch(/uniwind (engine )?tree/);
        }
      }
    }
  });

  it('the re-theme guide states both true pairings', () => {
    const sentences = sentencesOf(bodyOf(guides[0].text));
    const pairsV4WithUniwind = sentences.some(
      (sentence) => sentence.includes('Tailwind v4') && /uniwind (engine )?tree/.test(sentence),
    );
    const pairsV3WithNativewind = sentences.some(
      (sentence) => sentence.includes('Tailwind v3') && /nativewind (engine )?tree/.test(sentence),
    );
    expect(pairsV4WithUniwind, 'one sentence pairs Tailwind v4 with the uniwind tree').toBe(true);
    expect(pairsV3WithNativewind, 'one sentence pairs Tailwind v3 with the nativewind tree').toBe(
      true,
    );
    expect(guides[0].text, 'the nativewind pairing names NativeWind 4.2.6').toContain(
      'NativeWind 4.2.6',
    );
  });
});

describe('GBC-001 guide frontmatter, goal sentence and seam targets', () => {
  it('the four guides carry section: guides with unique orders 1..4', async () => {
    const orders: number[] = [];
    for (const name of GUIDE_FILES) {
      const fm = await parseFrontmatterWithAstro(
        readFileSync(join(GUIDES_DIR, `${name}.md`), 'utf8'),
      );
      expect(fm.section, `${name}.md section is guides`).toBe('guides');
      expect(typeof fm.order, `${name}.md order is a number`).toBe('number');
      orders.push(fm.order as number);
    }
    expect(new Set(orders).size, 'the four orders are unique').toBe(GUIDE_FILES.length);
    expect([...orders].sort(), 'the orders are exactly 1, 2, 3, 4').toEqual([1, 2, 3, 4]);
  });

  it('each guide carries exactly one goal sentence', () => {
    for (const name of GUIDE_FILES) {
      const text = readFileSync(join(GUIDES_DIR, `${name}.md`), 'utf8');
      const occurrences = text.split(GOAL_SENTENCE).length - 1;
      expect(occurrences, `${name}.md states the goal sentence exactly once`).toBe(1);
      const bodySentences = sentencesOf(bodyOf(text));
      const goalSentences = bodySentences.filter((sentence) => sentence.startsWith(GOAL_SENTENCE));
      expect(
        goalSentences,
        `${name}.md has exactly one sentence starting with the goal opener`,
      ).toHaveLength(1);
    }
  });

  it('theming.mdx is re-sectioned to getting-started', async () => {
    const fm = await parseFrontmatterWithAstro(readFileSync(THEMING_PATH, 'utf8'));
    expect(fm.section, 'theming.mdx section is getting-started').toBe('getting-started');
  });

  it('SEAM_LINK_TARGETS points at the customize-rendering anchors', () => {
    expect(SEAM_LINK_TARGETS.rendermarkdown).toBe('/guides/customize-rendering#rendermarkdown');
    expect(SEAM_LINK_TARGETS.textclasscontext).toBe('/guides/customize-rendering#textclasscontext');
  });
});
