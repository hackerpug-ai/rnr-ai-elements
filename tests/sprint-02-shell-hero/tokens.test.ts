import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, expect, it } from 'vitest';

/**
 * SHELL-001 — token sheet contract over the REAL docs build.
 *
 * Integration tier: this lane spawns the real filtered pnpm build as a subprocess,
 * reads the emitted dist/_astro/*.css bundles and the authored
 * apps/docs/src/styles/global.css from the real filesystem, and asserts the TR-07
 * table (11-technical-requirements/07-ui-infrastructure.md:15-29) landed verbatim:
 * exact oklch pairs for all 18 core tokens plus the 2 DOCS-ONLY code tokens,
 * radius/measure/layout/typography constants, dark-first on :root with light
 * scoped to the html light class, zero hex literals, zero prefers-color-scheme,
 * zero 'max-height'.
 *
 * The build runs once (beforeAll). The root vitest config sets
 * fileParallelism:false, so this lane never races the sprint-01 build lanes.
 *
 * Emission facts (verified against a real Astro 7.3.2 build of this repo):
 * - global.css only reaches the build once a layout imports it — SHELL-002's
 *   DocsLayout contract ("imports SHELL-001's global.css exactly once").
 * - Astro's default inlineStylesheets:'auto' inlines the sheet into a <style> tag
 *   and emits ZERO dist/_astro/*.css files; the /_astro/*.css link that SHELL-002's
 *   gate pins requires build.inlineStylesheets:'never' in apps/docs/astro.config.mjs.
 * - The CSS minifier serializes oklch lightness as a percentage (0.145 -> 14.5%,
 *   1 -> 100%), drops leading zeros (.245), and rewrites alpha 10% -> .1 — same
 *   values, different form. The value patterns below accept exactly those forms.
 */

const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const GLOBAL_CSS_PATH = join(repoRoot, 'apps/docs/src/styles/global.css');
const DIST_ASTRO_DIR = join(repoRoot, 'apps/docs/dist/_astro');

/** TR-07 style-token table, transcribed verbatim: [token, light, dark]. */
const CORE_TOKEN_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ['--background', 'oklch(1 0 0)', 'oklch(0.145 0 0)'],
  ['--foreground', 'oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
  ['--card', 'oklch(1 0 0)', 'oklch(0.205 0 0)'],
  ['--card-foreground', 'oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
  ['--popover', 'oklch(1 0 0)', 'oklch(0.205 0 0)'],
  ['--popover-foreground', 'oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
  ['--primary', 'oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
  ['--primary-foreground', 'oklch(0.985 0 0)', 'oklch(0.205 0 0)'],
  ['--secondary', 'oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
  ['--secondary-foreground', 'oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
  ['--muted', 'oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
  ['--muted-foreground', 'oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
  ['--accent', 'oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
  ['--accent-foreground', 'oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
  ['--destructive', 'oklch(0.577 0.245 27.325)', 'oklch(0.704 0.191 22.216)'],
  ['--border', 'oklch(0.922 0 0)', 'oklch(1 0 0 / 10%)'],
  ['--input', 'oklch(0.922 0 0)', 'oklch(1 0 0 / 15%)'],
  ['--ring', 'oklch(0.708 0 0)', 'oklch(0.556 0 0)'],
];

/** DOCS-ONLY pair, comment-flagged in the sheet so sprint-05's TokenTable can label it. */
const CODE_TOKEN_PAIRS: ReadonlyArray<readonly [string, string, string]> = [
  ['--code-background', 'oklch(0.97 0 0)', 'oklch(0.235 0 0)'],
  ['--code-foreground', 'oklch(0.205 0 0)', 'oklch(0.922 0 0)'],
];

const ALL_TOKEN_PAIRS = [...CORE_TOKEN_PAIRS, ...CODE_TOKEN_PAIRS];

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;

/** Escape only the regex specials that occur in CSS values. */
function escapeValue(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/%]/g, '\\$&');
}

/** Percentage serialization equal to a 0.x-style decimal (0.97 -> 97), float-noise-safe. */
function percentForm(decimal: string): string {
  return (Number(decimal) * 100).toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
}

/** Decimal serialization equal to a percentage (10% -> 0?.1 covering 0.1 and .1). */
function decimalForm(percent: string): string {
  const value = Number(percent.replace(/%$/, '')) / 100;
  const trimmed = value.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');
  return trimmed.startsWith('0.') ? `0?${escapeValue(trimmed.slice(1))}` : escapeValue(trimmed);
}

/**
 * Alternation for one numeric literal covering every serialization of the IDENTICAL
 * value the build is known to emit (verified against a real Astro 7.3.2 build):
 * authored 0.145, the minifier's leading-zero drop .145, and its percentage form
 * 14.5%. A re-picked or rounded value (0.15, 98%) matches none of them.
 *
 * Every alternation is anchored with (?![\d.]): a real CSS number is never
 * immediately followed by another digit or dot, so a longer re-picked number
 * (e.g. minified alpha .15 prefix-matching the .1 form of 10%) can never
 * satisfy a value pattern.
 */
function numberAlternatives(num: string): string {
  if (num === '1') {
    return '(?:1\\b|100%)(?![\\d.])';
  }
  if (/^0?\.\d+$/.test(num)) {
    return `(?:0?\\.${num.replace(/^0?\./, '')}|${escapeValue(percentForm(num))}%)(?![\\d.])`;
  }
  if (/^\d+(\.\d+)?%$/.test(num)) {
    return `(?:${escapeValue(num)}|${decimalForm(num)})(?![\\d.])`;
  }
  if (num === '0') {
    return '(?:0\\b|0%)(?![\\d.])';
  }
  return `${escapeValue(num)}(?![\\d.])`;
}

/**
 * Exact-value pattern for a CSS value as authored OR as the build emits it:
 * whitespace around separators may collapse; numbers may switch serialization.
 */
function cssValuePattern(value: string): string {
  const numberToken = /(\d+\.?\d*%?|\.\d+%?)/g;
  let pattern = '';
  let last = 0;
  for (const match of value.matchAll(numberToken)) {
    const index = match.index ?? 0;
    pattern += escapeValue(value.slice(last, index));
    pattern += numberAlternatives(match[0]);
    last = index + match[0].length;
  }
  pattern += escapeValue(value.slice(last));
  return pattern.replace(/ /g, '\\s*');
}

/** `--token: value` declaration pattern; name anchored so --card never matches --card-foreground. */
function declarationPattern(name: string, value: string): RegExp {
  return new RegExp(`(?<![\\w-])${name}\\s*:\\s*${cssValuePattern(value)}`);
}

function readGlobalCss(): string {
  return readFileSync(GLOBAL_CSS_PATH, 'utf8');
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Bodies of every rule whose selector matches; brace-balanced, comments stripped. */
function ruleBodies(css: string, selector: RegExp): string[] {
  const source = stripComments(css);
  const global = selector.flags.includes('g')
    ? selector
    : new RegExp(selector.source, `${selector.flags}g`);
  const bodies: string[] = [];
  for (const match of source.matchAll(global)) {
    const open = source.indexOf('{', match.index);
    if (open === -1) {
      continue;
    }
    let depth = 0;
    for (let i = open; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === '{') {
        depth += 1;
      } else if (ch === '}') {
        depth -= 1;
        if (depth === 0) {
          bodies.push(source.slice(open + 1, i));
          break;
        }
      }
    }
  }
  return bodies;
}

/** The rule body that actually declares --background (skips foreign :root rules). */
function themeRule(css: string, selector: RegExp): string | null {
  return ruleBodies(css, selector).find((body) => /(?<![\w-])--background\s*:/.test(body)) ?? null;
}

let buildExit: number | null = null;
let buildLog = '';
let builtCss = '';
let cssBundleCount = 0;

/** Real subprocess step; throws its log on failure so the chain fail-stops like `&&`. */
function runStep(command: string, args: string[], label: string): string {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const log = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  expect(result.error, `${label} failed to spawn: ${result.error?.message}`).toBeUndefined();
  expect(result.status, `${label} exited ${result.status}\n${log}`).toBe(0);
  return log;
}

beforeAll(() => {
  // Seed the real ordered chain first (registry:build -> gallery:manifest): a fresh
  // checkout has no apps/docs/src/data/gallery-manifest.json yet, and pnpm runs the
  // docs package's prebuild hook BEFORE its build script, so the contracted filtered
  // build alone cannot bootstrap a clean tree. Same ordering as the root e2e:docs
  // script and the sprint-01 ci-chain-order lane.
  runStep('pnpm', ['registry:build'], 'registry:build');
  runStep('pnpm', ['gallery:manifest'], 'gallery:manifest');
  const result = spawnSync('pnpm', ['--filter', '@rnr-ai-elements/docs', 'build'], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  buildExit = result.status;
  buildLog = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
  let bundles: string[] = [];
  try {
    bundles = readdirSync(DIST_ASTRO_DIR)
      .filter((file) => file.endsWith('.css'))
      .map((file) => readFileSync(join(DIST_ASTRO_DIR, file), 'utf8'));
  } catch {
    bundles = [];
  }
  cssBundleCount = bundles.length;
  builtCss = bundles.join('\n');
}, 900_000);

it('SHELL-001-token-sheet-contract: real build emits the complete TR-07 vocabulary verbatim', () => {
  expect(buildExit, `docs build exited ${buildExit}\n${buildLog}`).toBe(0);
  expect(
    buildLog,
    'the docs prebuild marker is absent — the pnpm filter matched nothing or the chain broke',
  ).toContain('56 items');
  expect(
    cssBundleCount,
    'no dist/_astro/*.css bundles exist on disk — global.css must be imported by the layout ' +
      '(SHELL-002 DocsLayout contract) and apps/docs/astro.config.mjs must set ' +
      "build.inlineStylesheets:'never' (Astro's default 'auto' inlines styles into HTML instead)",
  ).toBeGreaterThan(0);

  // TC-1: every token name with its exact light AND dark value in the built CSS.
  for (const [name, light, dark] of ALL_TOKEN_PAIRS) {
    expect(builtCss, `${name}: dark value missing from every built CSS bundle`).toMatch(
      declarationPattern(name, dark),
    );
    expect(builtCss, `${name}: light value missing from built CSS`).toMatch(
      declarationPattern(name, light),
    );
  }

  // TC-2, built side: the emitted token rules carry no hex literal and no 'max-height'.
  const builtTokenRules = [themeRule(builtCss, /:root\s*\{/), themeRule(builtCss, /\.light\s*\{/)]
    .filter((body): body is string => body !== null)
    .join('\n');
  expect(builtTokenRules, 'the built CSS lost both token rules').not.toBe('');
  expect(builtTokenRules, 'a hex literal slipped into the emitted token rules').not.toMatch(
    HEX_LITERAL,
  );
  expect(builtTokenRules).not.toContain('max-height');

  // Authored sheet: the constants SHELL-002+ consume (fixture authored_global_css).
  const sheet = readGlobalCss();
  expect(sheet, '--radius must be 0.625rem, verbatim from apps/example/global.css').toMatch(
    /--radius:\s*0\.625rem\b/,
  );
  for (const step of ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl']) {
    expect(sheet, `${step} must be a calc(...) derivative of --radius`).toMatch(
      new RegExp(`${step}\\s*:\\s*calc\\(\\s*var\\(--radius\\)`),
    );
  }
  expect(sheet).toMatch(/--measure:\s*70ch\b/);
  expect(sheet).toMatch(/--layout-header-h:\s*3\.5rem\b/);
  expect(sheet).toMatch(/--layout-sidebar-w:\s*16\.5rem\b/);
  expect(sheet).toMatch(/--layout-toc-w:\s*14rem\b/);

  const h1 = ruleBodies(sheet, /h1\s*\{/).find((body) => body.includes('font-size'));
  expect(h1, 'no h1 rule carries the typographic scale').toBeDefined();
  expect(h1).toMatch(/font-size:\s*2\.25rem\b/);
  expect(h1).toMatch(/line-height:\s*1\.2\b/);
  expect(h1).toMatch(/font-weight:\s*600\b/);

  const focus = ruleBodies(sheet, /:focus-visible\s*\{/).at(0);
  expect(focus, 'no :focus-visible contract in the sheet').toBeDefined();
  expect(focus).toMatch(/var\(--ring\)/);
  expect(focus).toMatch(/2px/);

  // TC-2, authored side: zero hex, zero 'max-height', DOCS-ONLY flag on code tokens.
  expect(sheet, 'a hex literal slipped into global.css').not.toMatch(HEX_LITERAL);
  expect(sheet, "the string 'max-height' is pinned out of the stylesheet").not.toContain(
    'max-height',
  );
  expect(sheet, 'the code-* tokens must be comment-flagged DOCS-ONLY').toContain('DOCS-ONLY');
});

it('SHELL-001-dark-first-single-mechanism: dark on :root, light scoped to the html light class', () => {
  const sheet = readGlobalCss();

  // Authored structure: the default (unclassed html) rule carries the DARK column.
  const defaultRule = themeRule(sheet, /:root\s*\{/);
  expect(defaultRule, 'no :root rule declares tokens in global.css').not.toBeNull();
  expect(defaultRule).toMatch(declarationPattern('--background', 'oklch(0.145 0 0)'));
  expect(defaultRule).toMatch(declarationPattern('--foreground', 'oklch(0.985 0 0)'));
  expect(
    defaultRule,
    'the default unclassed rule must never carry the light canvas — that flashes light before the pre-paint class flip',
  ).not.toMatch(declarationPattern('--background', 'oklch(1 0 0)'));

  // Every light value lives under the html light class.
  const lightRule = themeRule(sheet, /html\.light\s*\{/) ?? themeRule(sheet, /\.light\s*\{/);
  expect(lightRule, 'no html.light-scoped rule declares the light column').not.toBeNull();
  expect(lightRule).toMatch(declarationPattern('--background', 'oklch(1 0 0)'));

  // No second theme mechanism anywhere.
  expect(
    stripComments(sheet),
    'prefers-color-scheme would race the SHELL-003 pre-paint class flip',
  ).not.toContain('prefers-color-scheme');

  // Built structure: the emitted bundle keeps dark-first + the class flip intact.
  const builtDefault = themeRule(builtCss, /:root\s*\{/);
  expect(builtDefault, 'the built CSS lost the dark :root rule').not.toBeNull();
  expect(builtDefault).toMatch(declarationPattern('--background', 'oklch(0.145 0 0)'));
  expect(builtDefault).not.toMatch(declarationPattern('--background', 'oklch(1 0 0)'));
  const builtLight = themeRule(builtCss, /html\.light\s*\{/) ?? themeRule(builtCss, /\.light\s*\{/);
  expect(builtLight, 'the built CSS lost the light-scoped rule').not.toBeNull();
  expect(builtLight).toMatch(declarationPattern('--background', 'oklch(1 0 0)'));
});
