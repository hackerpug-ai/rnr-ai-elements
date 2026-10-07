import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { expect, test } from '@playwright/test';
import { navigateLocalhost, PREVIEW_URL } from '../harness/docs-preview';

/**
 * REF-001 riding spec — T-GEND-016-site-crawl (describe token pinned so gate
 * step 1 and REF-010 grep it mechanically). Two clause sets, both
 * dataset-derived:
 *
 * 1. Crawl purity (T-GEND-016): starting from the dataset-derived page set
 *    (/, /components, and all 39 item pages) and following every internal
 *    href the served HTML exposes, every `cli@latest add` invocation on every
 *    crawled page carries ONLY absolute rnraielements.com /r/ URL arguments —
 *    0 short-name adds, 0 relative forms, 0 un-tabbed duplicates.
 *
 * 2. Family install commands (T-GEND-014 rides this lane; REF-010 greens
 *    these clauses): each of the seven anchored family sections on
 *    /components exposes an engine-tabbed copyable command listing every
 *    family item's /r/{engine}/{item}.json — RED until REF-010 lands the
 *    family variant.
 *
 * Locators for DOM reads (no page.evaluate); UNGUARDED across
 * chromium-desktop, chromium-mobile, and chromium-nojs, retries 0; expect.soft
 * accumulates the full diff; the writer fires on a genuine full pass only, to
 * the token's locked artifact path.
 */

/** Read a spec fixture, bridging a short window if the file is transiently absent. */
function readJson<T>(relative: string): T {
  const url = new URL(relative, import.meta.url);
  const deadline = Date.now() + 15_000;
  for (;;) {
    try {
      return JSON.parse(readFileSync(url, 'utf8')) as T;
    } catch (error) {
      const retryable = (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!retryable || Date.now() > deadline) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

interface ItemEntry {
  name: string;
  type: string;
}

interface Family {
  id: string;
  order: number;
  itemNames: string[];
}

const items = readJson<ItemEntry[]>('../../apps/docs/src/data/registry-items.json');
const families = readJson<Family[]>('../../apps/docs/src/data/families.json');

const components = items.filter((item) => item.type === 'registry:component');
const componentNames = new Set(components.map((item) => item.name));
/** The families whose members are ALL registry:component items, in committed order. */
const componentFamilies = families
  .filter((family) => family.itemNames.every((name) => componentNames.has(name)))
  .sort((a, b) => a.order - b.order);

/** The pinned INSTALL-command origin — Astro.site in apps/docs/astro.config.mjs. */
const CLI_PREFIX = 'npx @react-native-reusables/cli@latest add ';
const ABSOLUTE_ARG = /^https:\/\/rnraielements\.com\/r\/(nativewind|uniwind)\/[a-z0-9-]+\.json$/;

// Evidence JSON at the locked sprint-04 riding-spec path.
const EVIDENCE_PATH = join(
  process.cwd(),
  '.tmp/sprint-04-generated-reference/e2e-evidence/T-GEND-016-site-crawl.json',
);

function writeEvidence(observed: Record<string, unknown>): void {
  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(
    EVIDENCE_PATH,
    JSON.stringify(
      {
        token: 'T-GEND-016-site-crawl',
        capturedAt: new Date().toISOString(),
        ...observed,
      },
      null,
      2,
    ),
  );
}

test('T-GEND-016-site-crawl', async ({ page, request }, testInfo) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // ---- Crawl: dataset-seeded, following every internal <a href> once.
  const seedPaths = ['/', '/components', ...components.map((item) => `/components/${item.name}`)];
  const visited = new Set<string>(seedPaths);
  const queue = [...seedPaths];
  const crawledHtml = new Map<string, string>();
  let crawlOk = true;
  const violations: string[] = [];

  while (queue.length > 0) {
    const path = queue.shift() as string;
    const response = await request.get(new URL(path, PREVIEW_URL).href);
    if (response.status() !== 200) {
      soft(response.status(), `crawled page ${path} serves 200`).toBe(200);
      crawlOk = false;
      continue;
    }
    const html = await response.text();
    crawledHtml.set(path, html);

    // Command purity on the raw served bytes: every add invocation's
    // arguments are absolute registry URLs — no short-name, no relative form.
    // The served bytes run through expressive-code, which interleaves span
    // markup, control characters (0x7F line separators), and a data-code
    // attribute copy of the command; the token cleanup strips those rendering
    // artifacts so the check sees the commands a user reads. CLI flags (e.g.
    // the update-installed-items guide's `--overwrite`, GBC-001/AC-2) are not
    // add ARGUMENTS — every argument that is not a flag must be an absolute
    // registry URL or the page violates purity.
    const segments = html.split(CLI_PREFIX);
    for (let index = 1; index < segments.length; index++) {
      // The invocation text ends at the first markup or attribute boundary.
      const segment = segments[index].split('<')[0];
      for (const argument of segment.split(/\s+/)) {
        // Attribute-close markup (">) rides the last token of a data-code
        // attribute copy; strip it with the control characters and quotes.
        // Constructor form: the literal-class form trips biome's
        // noControlCharactersInRegex (the control range is the point here).
        const token = argument.replace(new RegExp(`[\\u0000-\\u001f\\u007f"'>]`, 'g'), '');
        if (token === '' || token === 'add') continue;
        if (/^--[a-z][a-z0-9-]*$/.test(token)) continue;
        if (!ABSOLUTE_ARG.test(token)) {
          violations.push(`${path}: non-absolute add argument "${token}"`);
        }
      }
    }
    const relativeForms = (html.match(/add \/r\//g) ?? []).length;
    if (relativeForms > 0) violations.push(`${path}: ${relativeForms} relative add forms`);
    const untabbed = html.includes('install-row');
    if (untabbed) violations.push(`${path}: un-tabbed install-row duplicates`);

    // Follow internal hrefs (same-origin paths only).
    for (const match of html.matchAll(/href="(\/[^"#]*)"/g)) {
      const href = match[1];
      if (!visited.has(href) && /\.(html|json|css|js|svg|png|ico)$/.test(href) === false) {
        visited.add(href);
        queue.push(href);
      }
    }
  }
  soft(violations.length, 'crawl purity: 0 short-name/relative/un-tabbed command forms').toBe(0);
  crawlOk &&= violations.length === 0;
  soft(
    crawledHtml.size,
    `crawled pages from the dataset-seeded frontier (${seedPaths.length} seeds)`,
  ).toBeGreaterThanOrEqual(seedPaths.length);
  crawlOk &&= crawledHtml.size >= seedPaths.length;

  // ---- Family install commands (T-GEND-014 clauses riding this lane).
  await navigateLocalhost(page, '/components');
  let familiesOk = true;
  const missingMembers: string[] = [];
  for (const family of componentFamilies) {
    const section = page.locator(`main section[id="${family.id}"]`);
    for (const engine of ['nativewind', 'uniwind'] as const) {
      const command = section.locator(
        `[role="tabpanel"][data-engine="${engine}"] rnr-copy-button code`,
      );
      // Count first — the command is the RED surface until REF-010 lands, and
      // textContent on a zero-element locator would wait out the clock.
      const rendered = await command.count();
      soft(
        rendered,
        `family ${family.id} ${engine}: one copyable command renders in the panel`,
      ).toBe(1);
      familiesOk &&= rendered === 1;
      const text = rendered > 0 ? ((await command.first().textContent()) ?? '').trim() : '';
      const expectedPrefix = `npx @react-native-reusables/cli@latest add https://rnraielements.com/r/${engine}/`;
      soft(
        text.startsWith(expectedPrefix),
        `family ${family.id} ${engine}: copyable command carries the absolute-URL form`,
      ).toBe(true);
      familiesOk &&= text.startsWith(expectedPrefix);

      // Every family member's registry URL is listed in the invocation.
      for (const member of family.itemNames) {
        if (!text.includes(`/${engine}/${member}.json`)) {
          missingMembers.push(`${family.id}/${engine}: ${member}.json`);
        }
      }
    }
  }
  soft(missingMembers.length, '0 missing family-member URLs across the families').toBe(0);
  familiesOk &&= missingMembers.length === 0;

  if (crawlOk && familiesOk) {
    writeEvidence({
      project: testInfo.project.name,
      seeds: seedPaths.length,
      crawledPages: crawledHtml.size,
      families: componentFamilies.map((family) => family.id),
      violations: violations.length,
    });
  }
});
