/**
 * ORI-AST-003 — TC-5: the token-map extractor derives paired light/dark rows
 * from the real docs CSS sheet, keeps usage/classification separate from
 * palette values, and rejects empty or missing token pairs.
 *
 * Every assertion reads the real `apps/docs/src/styles/global.css` and the
 * authored `apps/docs/src/data/token-usage.json` through normal filesystem
 * APIs, then drives the same pure `deriveTokenMap` the build-time TokenTable
 * uses. No mocked palette and no canned rows: the light and dark columns are
 * compared against the actual `html.light` and `:root` declarations, and the
 * usage file is proven value-free (no oklch/hsl literal may appear there).
 *
 * Mutation controls mutate an in-memory copy of the real sheet — the
 * derivation is pure, so a removed declaration or an emptied value must throw
 * and name the offending token, never silently emit a half row.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import { deriveTokenMap, parseCssVariables } from '../../scripts/docs-data/token-map';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const CSS_PATH = join(REPO_ROOT, 'apps/docs/src/styles/global.css');
const USAGE_PATH = join(REPO_ROOT, 'apps/docs/src/data/token-usage.json');

const CSS = readFileSync(CSS_PATH, 'utf8');
const USAGE_JSON = readFileSync(USAGE_PATH, 'utf8');

/** Every oklch/hsl palette literal in a text — the palette's single-source scan. */
function paletteLiterals(text: string): string[] {
  return [
    ...new Set([
      ...(text.match(/oklch\(\s*[\d.]+\s+[\d.]+\s+[\d.]/g) ?? []),
      ...(text.match(/hsl\(\s*[\d.]+/g) ?? []),
    ]),
  ];
}

// One named selector (TC-5); its many assertions are the derivation contract,
// so the block is intentionally wide rather than split across artificial seams.
// fallow-ignore-next-line complexity
it('ORI-AST-003-token-map', () => {
  const usage = JSON.parse(USAGE_JSON) as Record<string, { usage: string; docsOnly: boolean }>;
  const rows = deriveTokenMap(CSS, usage);

  // At least ten semantic rows with nonempty usage and paired columns.
  expect(rows.length, 'at least ten semantic token rows').toBeGreaterThanOrEqual(10);

  const byName = new Map(rows.map((row) => [row.name, row]));
  for (const row of rows) {
    expect(row.usage.trim(), `--${row.name} must carry a nonempty usage label`).not.toBe('');
    expect(row.light.trim(), `--${row.name} must carry a nonempty light value`).not.toBe('');
    expect(row.dark.trim(), `--${row.name} must carry a nonempty dark value`).not.toBe('');
    expect(row.light, `--${row.name} light value must be an oklch color`).toMatch(/^oklch\(/);
    expect(row.dark, `--${row.name} dark value must be an oklch color`).toMatch(/^oklch\(/);
  }

  // The values derive from the real sheet: every row's pair matches the actual
  // `html.light` and `:root` declarations, not a fixture.
  const lightVars = parseCssVariables(CSS, 'html.light');
  const darkVars = parseCssVariables(CSS, ':root');
  for (const row of rows) {
    expect(lightVars[row.name], `--${row.name} light value traces to html.light`).toBe(row.light);
    expect(darkVars[row.name], `--${row.name} dark value traces to :root`).toBe(row.dark);
  }

  // Background row pairs the two canonical oklch values.
  const background = byName.get('background');
  expect(background, 'a background row exists').toBeTruthy();
  expect(background?.light, 'background light is oklch(1 0 0)').toBe('oklch(1 0 0)');
  expect(background?.dark, 'background dark is oklch(0.145 0 0)').toBe('oklch(0.145 0 0)');

  // The code pair is classified DOCS-ONLY and carries the canonical dark values.
  for (const name of ['code-background', 'code-foreground']) {
    const row = byName.get(name);
    expect(row, `a ${name} row exists`).toBeTruthy();
    expect(row?.docsOnly, `--${name} is classified DOCS-ONLY`).toBe(true);
  }
  expect(byName.get('code-background')?.dark, 'code-background dark').toBe('oklch(0.235 0 0)');
  expect(byName.get('code-foreground')?.dark, 'code-foreground dark').toBe('oklch(0.922 0 0)');
  expect(byName.get('code-background')?.light, 'code-background light').toBe('oklch(0.97 0 0)');
  expect(byName.get('code-foreground')?.light, 'code-foreground light').toBe('oklch(0.205 0 0)');

  // Usage/classification stays separate from values: the authored usage file
  // carries NO palette literal — only labels and the docs-only flag.
  expect(paletteLiterals(USAGE_JSON), 'token-usage.json must carry no palette value').toEqual([]);

  // Mutation control 1: removing the dark `--background` declaration must
  // fail the derivation, naming the token.
  let missingMessage = '';
  try {
    deriveTokenMap(CSS.replace(/^ *--background: .*$/m, ''), usage);
  } catch (error) {
    missingMessage = (error as Error).message;
  }
  expect(missingMessage, 'a removed --background declaration must fail the map').toContain(
    '--background',
  );

  // Mutation control 2: an emptied dark value must fail, naming the token.
  let emptyMessage = '';
  try {
    deriveTokenMap(CSS.replace(/^ *--foreground: .*$/m, '--foreground: ;'), usage);
  } catch (error) {
    emptyMessage = (error as Error).message;
  }
  expect(emptyMessage, 'an emptied --foreground declaration must fail the map').toContain(
    '--foreground',
  );

  // Mutation control 3: an emptied usage label must fail, naming the token.
  const emptiedUsage = { ...usage, muted: { ...usage.muted, usage: '   ' } };
  let usageMessage = '';
  try {
    deriveTokenMap(CSS, emptiedUsage);
  } catch (error) {
    usageMessage = (error as Error).message;
  }
  expect(usageMessage, 'an emptied usage label must fail the map').toContain('--muted');
});
