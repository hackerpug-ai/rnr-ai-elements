/**
 * token-map — the build-time token extractor (ORI-AST-003).
 *
 * Derives the paired light/dark token rows for the Theming page's TokenTable
 * from the real docs CSS sheet joined with the authored usage metadata. This
 * module is pure: it parses a CSS string and returns rows, so the Astro
 * TokenTable (build time), the docs-data pipeline, and the token-map test all
 * drive the exact same derivation and can never disagree on a value.
 *
 * Separation of concerns, enforced here:
 *   - Values come ONLY from the actual `:root` (dark) and `html.light` (light)
 *     declarations in `apps/docs/src/styles/global.css`.
 *   - Usage labels and the docs-only classification come ONLY from the authored
 *     `apps/docs/src/data/token-usage.json` (no palette value may live there).
 *
 * Fail-closed: a token named in the usage map with a missing or empty light or
 * dark declaration throws and names the token — never a half row.
 */

/** One rendered row of the token map. */
export interface TokenRow {
  /** Token name without the leading `--` (e.g. `background`). */
  name: string;
  /** Full custom-property name including the leading `--` (e.g. `--background`). */
  property: string;
  /** Human-readable usage label from token-usage.json. */
  usage: string;
  /** Light value verbatim from the `html.light` block. */
  light: string;
  /** Dark value verbatim from the `:root` block. */
  dark: string;
  /** True for docs-only tokens (code-background, code-foreground). */
  docsOnly: boolean;
}

/** Authored usage metadata for one token (the token-usage.json entry shape). */
export interface TokenUsage {
  usage: string;
  docsOnly: boolean;
}

/** The two selectors the docs sheet declares: dark on `:root`, light under `html.light`. */
const DARK_SELECTOR = ':root';
const LIGHT_SELECTOR = 'html.light';

const DECLARATION = /--([a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;

/** Escape a selector for a literal regular-expression match. */
function escapeRegExp(selector: string): string {
  return selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse `--name: value;` custom-property declarations inside one CSS rule.
 * The selector is matched as a whole rule anchored at line start
 * (`^selector\s*\{`, multiline) so a comment that merely mentions the selector
 * name — the sheet's prose names `html.light` and `:root` long before their
 * rules — can never be mistaken for the declaration block. Returns name ->
 * value without the `--` prefix. The rules contain no nested braces.
 */
export function parseCssVariables(css: string, selector: string): Record<string, string> {
  const ruleRe = new RegExp(`^${escapeRegExp(selector)}\\s*\\{`, 'm');
  const rule = ruleRe.exec(css);
  if (!rule) return {};
  const open = css.indexOf('{', rule.index);
  const close = css.indexOf('}', open);
  if (close === -1) return {};
  const block = css.slice(open + 1, close);
  const out: Record<string, string> = {};
  for (const match of block.matchAll(DECLARATION)) {
    out[match[1]] = match[2].trim();
  }
  return out;
}

/**
 * Derive the paired rows. Ordering follows the authored usage map's key order
 * (JSON insertion order), so the rendered table is deterministic and mirrors
 * the sheet's semantic grouping.
 *
 * @throws when a usage-listed token has a missing or empty light/dark value,
 *         or when its usage label is empty — naming the offending token.
 */
export function deriveTokenMap(css: string, usage: Record<string, TokenUsage>): TokenRow[] {
  const dark = parseCssVariables(css, DARK_SELECTOR);
  const light = parseCssVariables(css, LIGHT_SELECTOR);
  const rows: TokenRow[] = [];
  for (const [name, meta] of Object.entries(usage)) {
    const darkValue = dark[name];
    const lightValue = light[name];
    if (!darkValue || !lightValue) {
      const missing = !darkValue ? 'dark' : 'light';
      throw new Error(
        `[token-map] token --${name} is missing its ${missing} value in the CSS sheet`,
      );
    }
    if (typeof meta.usage !== 'string' || meta.usage.trim() === '') {
      throw new Error(`[token-map] token --${name} has an empty usage label in token-usage.json`);
    }
    rows.push({
      name,
      property: `--${name}`,
      usage: meta.usage,
      light: lightValue,
      dark: darkValue,
      docsOnly: meta.docsOnly === true,
    });
  }
  return rows;
}
