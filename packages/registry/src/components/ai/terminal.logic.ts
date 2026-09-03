/**
 * Terminal — pure logic. Zero react-native imports, so the Vitest tier owns it (see the
 * header of lib/reasoning-lifecycle.ts for why component files themselves cannot load
 * under Node).
 *
 * The web original renders its `output` string through `ansi-to-react`, which turns ANSI
 * escape sequences into inline styles with hardcoded hex colors. Both halves are foreign
 * here: React Native has no DOM spans, and the styling contract forbids color literals.
 * So the port owns a small SGR tokenizer instead, and its COLOR MAP compresses onto the
 * house palette exactly the way commit.logic's file-status map does — every hue resolves
 * to an RNR role or to one of the THREE sanctioned escape-hatch colors confined to
 * lib/status.ts. No fourth color exists anywhere in this file.
 *
 * THE COMPRESSION TABLE, DECLARED (color is never the sole channel — WCAG 1.4.1 — the
 * log text itself carries the information):
 *   black   → text-muted-foreground        (the dim pole of the token ramp)
 *   red     → statusColor.error            (text-destructive)
 *   green   → statusColor.success          (text-green-600 dark:text-green-500)
 *   yellow  → statusColor.denied           (text-orange-600 dark:text-orange-500)
 *   blue    → text-primary                 (the accent role)
 *   magenta → text-primary                 (declared compression — runs out of hues)
 *   cyan    → text-primary                 (declared compression)
 *   white   → text-foreground
 * The BRIGHT half (90–97) resolves to its base color's class plus a `font-medium` weight
 * bump rather than a second hue — every rendered color stays inside the sanctioned set.
 * Extended palettes (38;5;N / 38;2;R;G;B) have no token counterpart at all, so 38/48
 * resolve to the DEFAULT foreground and their parameter run is consumed (a stray `5`
 * must never apply as a stray SGR).
 *
 * Backs: 40/100 → bg-muted (neutral); 47/107 → bg-foreground forced with
 * text-background (the inverse look, token-pure); the colored middles (41–46, 101–106)
 * → bg-primary forced with text-primary-foreground. Backgrounds never ship a hue.
 *
 * Attributes PERSIST ACROSS NEWLINES — a color opened on one line is still open on the
 * next (real terminal semantics, and how streamed logs actually arrive).
 */

import { statusColor } from '@/registry/{engine}/lib/status';

/** The 8 ANSI base colors, by name. Bright variants reuse these names. */
export type AnsiColorName =
  | 'black'
  | 'red'
  | 'green'
  | 'yellow'
  | 'blue'
  | 'magenta'
  | 'cyan'
  | 'white';

/**
 * color name → precomposed text class. The only color table in the port; every entry is
 * an RNR role or a lib/status.ts escape, auditable right here.
 */
export const ANSI_COLOR_CLASS: Record<AnsiColorName, string> = {
  black: 'text-muted-foreground',
  red: statusColor.error,
  green: statusColor.success,
  yellow: statusColor.denied,
  blue: 'text-primary',
  magenta: 'text-primary',
  cyan: 'text-primary',
  white: 'text-foreground',
};

/** SGR 30–37 → name. */
const BASE_FG_CODES: Record<number, AnsiColorName> = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'white',
};

/** SGR 90–97 → the same names; the bright pole is a weight bump, not a hue. */
const BRIGHT_FG_CODES: Record<number, AnsiColorName> = {
  90: 'black',
  91: 'red',
  92: 'green',
  93: 'yellow',
  94: 'blue',
  95: 'magenta',
  96: 'cyan',
  97: 'white',
};

/**
 * The three background shapes a token palette can express: the neutral wash, the
 * inverse block, and the accent block. Compressed from the web's 16 — colored
 * backgrounds have no token counterpart, so the whole middle band resolves to accent.
 */
export type AnsiBackground = 'neutral' | 'inverse' | 'accent';

/** background shape → precomposed background class. */
export const ANSI_BG_CLASS: Record<AnsiBackground, string> = {
  neutral: 'bg-muted',
  inverse: 'bg-foreground',
  accent: 'bg-primary',
};

/** The foreground class a background forces, so text stays legible on its own block. */
const BG_FORCED_FG: Record<AnsiBackground, string | null> = {
  neutral: null,
  inverse: 'text-background',
  accent: 'text-primary-foreground',
};

/** SGR 40–47 / 100–107 → shape. */
function bgShape(code: number): AnsiBackground {
  const base = code >= 100 ? code - 60 : code; // 100..107 → 40..47
  if (base === 40) return 'neutral';
  if (base === 47) return 'inverse';
  return 'accent';
}

/** One styled run of a log line, classes fully resolved — the renderer never decides. */
export type AnsiSpan = {
  text: string;
  /** Ordered classes: decorations, then foreground, then background (bg wins ties). */
  classNames: string[];
};

type SpanState = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  bright: boolean;
  /** SGR 2 — renders as the muted pole when no explicit foreground is set. */
  dim: boolean;
  fg: AnsiColorName | null;
  bg: AnsiBackground | null;
};

const INITIAL_STATE: SpanState = {
  bold: false,
  italic: false,
  underline: false,
  bright: false,
  dim: false,
  fg: null,
  bg: null,
};

/** state → ordered class list. Pure, and the exact thing the tests pin. */
export function spanClassNames(state: SpanState): string[] {
  const classes: string[] = [];
  if (state.bold) classes.push('font-bold');
  if (state.italic) classes.push('italic');
  if (state.underline) classes.push('underline');
  if (state.bright) classes.push('font-medium');
  if (state.fg) classes.push(ANSI_COLOR_CLASS[state.fg]);
  else if (state.dim) classes.push('text-muted-foreground');
  if (state.bg) {
    classes.push(ANSI_BG_CLASS[state.bg]);
    const forced = BG_FORCED_FG[state.bg];
    if (forced) classes.push(forced);
  }
  return classes;
}

/**
 * Apply one SGR parameter list to the state, in order, mutating the working copy.
 * `38`/`48` are extended-color introducers: `38;5;N` and `38;2;R;G;B` are consumed
 * whole and resolve to the default (extended palettes have no token counterpart).
 */
function applySgr(params: number[], state: SpanState): void {
  for (let i = 0; i < params.length; i++) {
    const p = params[i];
    if (p === 38 || p === 48) {
      const mode = params[i + 1];
      i += mode === 2 ? 4 : mode === 5 ? 2 : 0; // skip the color spec's parameters
      continue;
    }
    switch (p) {
      case 0:
        Object.assign(state, INITIAL_STATE);
        break;
      case 1:
        state.bold = true;
        break;
      case 2:
        state.dim = true;
        break;
      case 3:
        state.italic = true;
        break;
      case 4:
        state.underline = true;
        break;
      // 21 is doubly-underlined in ECMA-48 and bold-off in xterm; the xterm reading is
      // the one terminals actually emit, so it clears bold.
      case 21:
        state.bold = false;
        break;
      case 22:
        state.bold = false;
        state.dim = false;
        break;
      case 23:
        state.italic = false;
        break;
      case 24:
        state.underline = false;
        break;
      case 7:
        state.bg = 'inverse';
        break;
      case 27:
        state.bg = null;
        break;
      case 39:
        state.fg = null;
        break;
      case 49:
        state.bg = null;
        break;
      default: {
        const base = BASE_FG_CODES[p];
        if (base) {
          state.fg = base;
          state.bright = false;
          break;
        }
        const bright = BRIGHT_FG_CODES[p];
        if (bright) {
          state.fg = bright;
          state.bright = true;
          break;
        }
        if ((p >= 40 && p <= 47) || (p >= 100 && p <= 107)) {
          state.bg = bgShape(p);
        }
        // Anything else (blink, fonts, IDE-related modes) is ignored, never guessed.
      }
    }
  }
}

/**
 * `output` → lines of styled spans. The renderer's contract:
 *  - escape sequences never reach the rendered text
 *  - a line with no visible text yields ONE span holding a single space (the code-block
 *    `{line || ' '}` precedent — an empty Text collapses to zero height otherwise)
 *  - exactly one trailing newline ends the output; a second one is a visible blank line
 *  - a bare `\r` (progress-bar carriage returns) is dropped, never smuggled into a span
 */
export function parseAnsiLines(output: string): AnsiSpan[][] {
  // OSC (ESC ] ... BEL or ESC \) strips whole. Complete CSI strips WHOLE unless its
  // final byte is m (SGR — left for the line walker); an UNTERMINATED CSI (truncated
  // mid-chunk) strips to the next ESC or end of string; finally any leftover ESC — one
  // that opens no bracket sequence — strips alone. Order matters: a whole-sequence
  // class that excludes 'm' would fail to match SGR and this bare-ESC pass would eat
  // only the ESC, leaving raw "[31m" as visible text.
  const cleaned = output
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[0-9;:?<=> ]*([A-Za-z])/g, (sequence, final: string) => (final === 'm' ? sequence : ''))
    .replace(/\x1b\[[0-9;:?<=> ]*(?=\x1b|$)/g, '')
    .replace(/\x1b(?!\[)/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '');

  const withoutTrailingNewline = cleaned.endsWith('\n') ? cleaned.slice(0, -1) : cleaned;
  const rawLines = withoutTrailingNewline.split('\n');

  let state: SpanState = { ...INITIAL_STATE };

  return rawLines.map((line) => {
    const spans: AnsiSpan[] = [];
    let buffer = '';

    const flush = () => {
      if (buffer.length > 0) {
        spans.push({ text: buffer, classNames: spanClassNames(state) });
        buffer = '';
      }
    };

    // Walk the line, splitting on SGR sequences. Non-SGR sequences were already
    // stripped, so every remaining ESC here is an SGR.
    const sgr = /\x1b\[([0-9;:]*)(m)/g;
    let cursor = 0;
    for (const match of line.matchAll(sgr)) {
      buffer += line.slice(cursor, match.index);
      flush();
      const params = (match[1] || '')
        .split(/[;:]/)
        .map((token) => Number.parseInt(token, 10) || 0);
      applySgr(params, state);
      cursor = (match.index ?? 0) + match[0].length;
    }
    buffer += line.slice(cursor);
    flush();

    if (spans.length === 0) spans.push({ text: ' ', classNames: [] });
    return spans;
  });
}

/**
 * The plain text behind a log — what TerminalCopyButton puts on the clipboard. Escape
 * codes are useless once copied; the copy hands over what the eye saw.
 */
export function stripAnsi(output: string): string {
  return output
    .replace(/\x1b\][^\x07\x1b]*(?:\x07|\x1b\\)/g, '')
    // EVERY complete CSI goes — SGR included — then unterminated ones, then leftover
    // ESCs, so the clipboard never sees a bracket sequence or a control char.
    .replace(/\x1b\[[0-9;:?<=> ]*[A-Za-z]/g, '')
    .replace(/\x1b\[[0-9;:?<=> ]*(?=\x1b|$)/g, '')
    .replace(/\x1b/g, '');
}
