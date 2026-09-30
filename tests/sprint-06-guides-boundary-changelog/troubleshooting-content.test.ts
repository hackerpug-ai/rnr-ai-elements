/**
 * GBC-002 — the authored troubleshooting guide, source-scanned (AC-3, AC-4,
 * AC-5).
 *
 * Read-only over the authored manuscript: the four symptom-cause-fix
 * entries under apps/docs/src/content/docs/guides/troubleshooting.md. No
 * build, no network, no browser (the rendered FLOW-DOCS-03 proof belongs to
 * GBC-010's guides-index.spec.ts, which this file never edits).
 *
 * Frontmatter parses through Astro's own parser — the same single authority
 * the collection loader and GBC-012's gates use — so this scan's view of
 * section / order can never drift from the build's.
 *
 * Named checks (one per unit AC):
 *   - short-name collision entry names DOM symptom, shadcn cause, URL fix
 *     (AC-3) the entry names className or onClick as the symptom, the
 *     shadcn web registry as the cause, and an absolute https:// URL as
 *     the fix.
 *   - streaming crash entry names workletizableModules cause and
 *     importForwarding.moduleNames fix (AC-4) the Cause part names the
 *     renamed react-native-streamdown option; the Fix part names
 *     importForwarding.moduleNames and never offers the stale spelling.
 *   - four entries, one fix each, owning-page link, guides order 5 (AC-5)
 *     exactly four level-2 entries, exactly one Symptom/Cause/Fix label
 *     set each, at least one internal link per entry, and frontmatter
 *     section: guides with order 5.
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

const GUIDE_PATH = join(ROOT, 'apps/docs/src/content/docs/guides/troubleshooting.md');

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

/** One entry per level-2 heading: its heading text and the prose under it. */
function entryChunks(body: string): { heading: string; text: string }[] {
  const chunks: { heading: string; text: string }[] = [];
  for (const line of body.split('\n')) {
    const heading = line.match(/^## (.+)$/);
    if (heading) {
      chunks.push({ heading: heading[1], text: '' });
    } else if (chunks.length > 0) {
      chunks[chunks.length - 1].text += `${line}\n`;
    }
  }
  return chunks;
}

/** Occurrences of a literal label, e.g. '**Fix**'. */
function countLabel(text: string, label: string): number {
  return text.split(label).length - 1;
}

const SYMPTOM_LABEL = '**Symptom**';
const CAUSE_LABEL = '**Cause**';
const FIX_LABEL = '**Fix**';

describe('GBC-002 short-name collision entry names DOM symptom, shadcn cause, absolute URL fix', () => {
  const entries = entryChunks(bodyOf(readFileSync(GUIDE_PATH, 'utf8')));
  const collisionEntries = entries.filter(({ text }) => text.includes('shadcn'));

  it('exactly one entry is the short-name collision entry', () => {
    expect(collisionEntries, 'the entry naming the shadcn web registry is unique').toHaveLength(1);
  });

  it('the symptom names DOM props React Native does not take', () => {
    expect(collisionEntries[0].text).toMatch(/className|onClick/);
  });

  it('the fix names an absolute https URL', () => {
    expect(collisionEntries[0].text).toContain('https://');
  });
});

describe('GBC-002 streaming crash entry names workletizableModules cause and importForwarding.moduleNames fix', () => {
  const entries = entryChunks(bodyOf(readFileSync(GUIDE_PATH, 'utf8')));
  const streamingEntries = entries.filter(({ text }) =>
    text.includes('importForwarding.moduleNames'),
  );

  it('exactly one entry is the streaming crash entry', () => {
    expect(streamingEntries, 'the entry naming the renamed option is unique').toHaveLength(1);
  });

  it('the Cause part names the stale workletizableModules spelling', () => {
    const [beforeFix] = streamingEntries[0].text.split(FIX_LABEL);
    expect(beforeFix, 'workletizableModules appears before the Fix label').toContain(
      'workletizableModules',
    );
  });

  it('the Fix part names importForwarding.moduleNames and never the stale spelling', () => {
    const [, afterFix] = streamingEntries[0].text.split(FIX_LABEL);
    expect(afterFix, 'the fix names the renamed option').toContain('importForwarding.moduleNames');
    expect(afterFix, 'the fix never offers the stale spelling as the fix').not.toContain(
      'workletizableModules',
    );
  });
});

describe('GBC-002 four entries, one fix each, owning-page link, guides order 5', () => {
  const guide = readFileSync(GUIDE_PATH, 'utf8');
  const entries = entryChunks(bodyOf(guide));

  it('the frontmatter is section: guides with order 5', async () => {
    const fm = await parseFrontmatterWithAstro(guide);
    expect(fm.section, 'troubleshooting.md section is guides').toBe('guides');
    expect(fm.order, 'troubleshooting.md order is 5').toBe(5);
  });

  it('the guide holds exactly four entries', () => {
    expect(entries, 'four level-2 entry headings render in the guide body').toHaveLength(4);
    for (const { heading } of entries) {
      expect(heading.trim().length, 'every entry heading is non-empty').toBeGreaterThan(0);
    }
  });

  it('each entry carries exactly one Symptom, Cause and Fix label', () => {
    expect(entries).toHaveLength(4);
    for (const { heading, text } of entries) {
      expect(countLabel(text, SYMPTOM_LABEL), `"${heading}" has one Symptom label`).toBe(1);
      expect(countLabel(text, CAUSE_LABEL), `"${heading}" has one Cause label`).toBe(1);
      expect(countLabel(text, FIX_LABEL), `"${heading}" has exactly one Fix label`).toBe(1);
    }
  });

  it('each entry links at least one internal owning page', () => {
    for (const { heading, text } of entries) {
      expect(text, `"${heading}" links a page on this site`).toMatch(/\]\(\/[^)]*\)/);
    }
  });
});
