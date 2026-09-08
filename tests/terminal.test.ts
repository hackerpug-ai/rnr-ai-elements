import { describe, expect, it } from 'vitest';
import {
  ANSI_BG_CLASS,
  ANSI_COLOR_CLASS,
  BG_FORCED_FG,
  parseAnsiLines,
  spanClassNames,
  stripAnsi,
} from '../packages/registry/src/components/ai/terminal.logic.ts';
import { statusColor } from '../packages/registry/src/lib/status.ts';

/**
 * Pure logic only — the ANSI SGR tokenizer behind the terminal's themed spans (see
 * agent-status.test.ts's header for why rendering itself cannot live in this tier).
 *
 * The tokenizer is the port of ansi-to-react: escapes must never reach rendered text,
 * the color map must resolve onto the FIXED remediation palette (zinc/blue classes on
 * the always-dark bg-zinc-950 surface — scheme-flipping roles would render invisible
 * in light mode) plus the sanctioned status colors for red/green/orange, attributes
 * must survive newlines the way real logs stream in, and a truncated escape from a
 * mid-chunk stream must degrade to text instead of crashing.
 */

const texts = (lines: string[][]) => lines;

describe('ANSI_COLOR_CLASS (the compression table)', () => {
  it('every color resolves to a fixed remediation-palette class or a sanctioned status color', () => {
    expect(ANSI_COLOR_CLASS.black).toBe('text-zinc-500');
    expect(ANSI_COLOR_CLASS.red).toBe(statusColor.error);
    expect(ANSI_COLOR_CLASS.green).toBe(statusColor.success);
    expect(ANSI_COLOR_CLASS.yellow).toBe(statusColor.denied);
    expect(ANSI_COLOR_CLASS.blue).toBe('text-blue-400');
    expect(ANSI_COLOR_CLASS.magenta).toBe('text-blue-400'); // declared compression
    expect(ANSI_COLOR_CLASS.cyan).toBe('text-blue-400'); // declared compression
    expect(ANSI_COLOR_CLASS.white).toBe('text-zinc-100');
  });

  it('no entry invents a color outside the fixed palette + sanctioned set', () => {
    const allowed = new Set([
      'text-zinc-500',
      'text-zinc-100',
      'text-blue-400',
      statusColor.error,
      statusColor.success,
      statusColor.denied,
    ]);
    for (const cls of Object.values(ANSI_COLOR_CLASS)) {
      expect(allowed.has(cls)).toBe(true);
    }
  });

  it('no entry in any of the three color maps is a scheme-flipping token — the surface is always dark', () => {
    // ANSI_COLOR_CLASS, ANSI_BG_CLASS, and BG_FORCED_FG all render on the fixed
    // bg-zinc-950 surface, so none may carry a token that flips with colorScheme.
    // The sanctioned status escapes (text-destructive, green/orange) match no banned
    // stem and stay legal. BG_FORCED_FG.neutral is null — nothing to ban.
    const maps: string[][] = [
      Object.values(ANSI_COLOR_CLASS),
      Object.values(ANSI_BG_CLASS),
      Object.values(BG_FORCED_FG).filter((cls): cls is string => cls !== null),
    ];
    for (const map of maps) {
      for (const cls of map) {
        expect(cls).not.toMatch(/foreground|primary|muted/);
      }
    }
  });
});

describe('parseAnsiLines (the SGR tokenizer)', () => {
  it('plain text passes through with no classes', () => {
    const lines = parseAnsiLines('$ pnpm test\n22 passed');
    expect(lines).toHaveLength(2);
    expect(lines[0][0]).toEqual({ text: '$ pnpm test', classNames: [] });
    expect(lines[1][0].text).toBe('22 passed');
  });

  it('a foreground SGR colors only the span it covers', () => {
    const lines = parseAnsiLines('\x1b[31mERROR\x1b[0m all done');
    expect(lines[0]).toHaveLength(2);
    expect(lines[0][0]).toEqual({ text: 'ERROR', classNames: [statusColor.error] });
    expect(lines[0][1]).toEqual({ text: ' all done', classNames: [] });
  });

  it('multiple params in one sequence apply in order', () => {
    const lines = parseAnsiLines('\x1b[1;32mok\x1b[0m');
    expect(lines[0][0].classNames).toEqual(['font-bold', statusColor.success]);
  });

  it('bright variants keep their base color class and add the weight bump — never a second hue', () => {
    const base = parseAnsiLines('\x1b[31mhot')[0][0].classNames;
    const bright = parseAnsiLines('\x1b[91mhot')[0][0].classNames;
    expect(bright).toEqual(['font-medium', ...base]);
    expect(parseAnsiLines('\x1b[97mw')[0][0].classNames).toEqual(['font-medium', 'text-zinc-100']);
  });

  it('bold, italic, and underline each map to their decoration class', () => {
    expect(parseAnsiLines('\x1b[1mb')[0][0].classNames).toEqual(['font-bold']);
    expect(parseAnsiLines('\x1b[3mi')[0][0].classNames).toEqual(['italic']);
    expect(parseAnsiLines('\x1b[4mu')[0][0].classNames).toEqual(['underline']);
  });

  it('the explicit clears (21/22/23/24) remove exactly their attribute', () => {
    expect(parseAnsiLines('\x1b[1;2mb\x1b[22mplain')[0][1].classNames).toEqual([]);
    expect(parseAnsiLines('\x1b[3mi\x1b[23mplain')[0][1].classNames).toEqual([]);
    expect(parseAnsiLines('\x1b[4mu\x1b[24mplain')[0][1].classNames).toEqual([]);
    expect(parseAnsiLines('\x1b[1mb\x1b[21mplain')[0][1].classNames).toEqual([]);
  });

  it('dim renders the zinc-500 pole when no explicit color is set, and yields to one that is', () => {
    expect(parseAnsiLines('\x1b[2mfaint')[0][0].classNames).toEqual(['text-zinc-500']);
    expect(parseAnsiLines('\x1b[2;34mfaint blue')[0][0].classNames).toEqual(['text-blue-400']);
    expect(parseAnsiLines('\x1b[2;34m\x1b[22mf')[0][0].classNames).toEqual(['text-blue-400']);
  });

  it('39 returns the default foreground, 49 the default background', () => {
    expect(parseAnsiLines('\x1b[32mg\x1b[39mplain')[0][1].classNames).toEqual([]);
    expect(parseAnsiLines('\x1b[41mcover\x1b[49mplain')[0][1].classNames).toEqual([]);
  });

  it('reset (0) clears every attribute at once', () => {
    const lines = parseAnsiLines('\x1b[1;3;4;32;41meverything\x1b[0mplain');
    expect(lines[0][0].classNames).toEqual([
      'font-bold',
      'italic',
      'underline',
      statusColor.success,
      'bg-zinc-700',
      'text-zinc-100',
    ]);
    expect(lines[0][1].classNames).toEqual([]);
  });

  it('colored backgrounds force their legible foreground pair; neutral keeps the current fg', () => {
    // 41 red-bg → accent block (declared compression), forced zinc-100 text.
    expect(parseAnsiLines('\x1b[41m x ')[0][0].classNames).toEqual([
      'bg-zinc-700',
      'text-zinc-100',
    ]);
    // 47 white-bg → the inverse look on the fixed ramp.
    expect(parseAnsiLines('\x1b[47m x ')[0][0].classNames).toEqual([
      'bg-zinc-100',
      'text-zinc-950',
    ]);
    // 40 black-bg → the neutral wash, foreground untouched.
    expect(parseAnsiLines('\x1b[40mplain on zinc')[0][0].classNames).toEqual(['bg-zinc-800']);
    // The bright band backgrounds behave like their base (100 ≡ 40, 107 ≡ 47).
    expect(parseAnsiLines('\x1b[107mx')[0][0].classNames).toEqual(['bg-zinc-100', 'text-zinc-950']);
    expect(ANSI_BG_CLASS.neutral).toBe('bg-zinc-800');
    expect(ANSI_BG_CLASS.inverse).toBe('bg-zinc-100');
    expect(ANSI_BG_CLASS.accent).toBe('bg-zinc-700');
  });

  it('extended colors (256 / truecolor) resolve to default and never leak their parameters as SGRs', () => {
    // If 38;5;196 were applied naively, the trailing 196th param logic would smear;
    // worse, the 5 would land as a blink no-op and the 196 as nothing. The span must
    // simply be default with the text intact.
    expect(parseAnsiLines('\x1b[38;5;196mhot\x1b[0m')[0][0]).toEqual({
      text: 'hot',
      classNames: [],
    });
    expect(parseAnsiLines('\x1b[38;2;255;100;0mhot\x1b[0m')[0][0]).toEqual({
      text: 'hot',
      classNames: [],
    });
    // 48 (background introducer) is consumed the same way.
    expect(parseAnsiLines('\x1b[48;5;21mhi\x1b[0m')[0][0]).toEqual({ text: 'hi', classNames: [] });
  });

  it('unknown SGR params are ignored, never guessed into classes', () => {
    expect(parseAnsiLines('\x1b[5;9;53mx')[0][0].classNames).toEqual([]);
  });

  it('an empty param list resets — ESC[m is ESC[0m', () => {
    const lines = parseAnsiLines('\x1b[1;31mbold\x1b[mplain');
    expect(lines[0][1].classNames).toEqual([]);
  });

  it('non-SGR escapes are stripped and never reach the text', () => {
    // Cursor movement, erase, and private modes.
    expect(parseAnsiLines('a\x1b[2Kb\x1b[1;1Hc\x1b[?25hd')[0][0].text).toBe('abcd');
  });

  it('OSC sequences (window title) strip, BEL and ST terminated alike', () => {
    expect(parseAnsiLines('\x1b]0;title\x07log')[0][0].text).toBe('log');
    expect(parseAnsiLines('\x1b]0;title\x1b\\log')[0][0].text).toBe('log');
  });

  it('a lone ESC (truncated mid-chunk sequence) degrades to text, never a crash', () => {
    expect(parseAnsiLines('stream cut\x1b')[0][0].text).toBe('stream cut');
    expect(parseAnsiLines('\x1b')[0][0].text).toBe(' ');
  });

  it('attributes persist across newlines, exactly as a terminal keeps them', () => {
    const lines = parseAnsiLines('\x1b[32mfirst\nsecond\n\x1b[0mplain');
    expect(lines).toHaveLength(3);
    expect(lines[0][0].classNames).toEqual([statusColor.success]);
    expect(lines[1][0].classNames).toEqual([statusColor.success]);
    expect(lines[2][0].classNames).toEqual([]);
  });

  it('an empty line yields one space span so the row keeps its height', () => {
    const lines = parseAnsiLines('a\n\nb');
    expect(lines[1][0]).toEqual({ text: ' ', classNames: [] });
  });

  it('exactly one trailing newline ends the output — a second is a visible blank line', () => {
    expect(parseAnsiLines('a\n')).toHaveLength(1);
    expect(parseAnsiLines('a\n\n')).toHaveLength(2);
  });

  it('carriage returns are dropped, never smuggled into a span', () => {
    expect(parseAnsiLines('wheel\r\n')[0][0].text).toBe('wheel');
    expect(parseAnsiLines('spin\r')[0][0].text).toBe('spin');
    expect(parseAnsiLines('10%\r20%\r50%')[0][0].text).toBe('10%20%50%');
  });

  it('a run of styled spans keeps text in order with no gaps', () => {
    const lines = parseAnsiLines('\x1b[31mERR\x1b[0m: \x1b[32m42\x1b[0m tests');
    expect(texts([lines[0].map((s) => s.text)])[0].join('')).toBe('ERR: 42 tests');
  });

  it('an empty output is one blank line, not zero', () => {
    expect(parseAnsiLines('')).toEqual([[{ text: ' ', classNames: [] }]]);
  });
});

describe('spanClassNames (the resolver, pinned directly)', () => {
  it('orders decorations, foreground, then background so the background wins a tie', () => {
    const classes = spanClassNames({
      bold: true,
      italic: false,
      underline: false,
      bright: true,
      dim: false,
      fg: 'white',
      bg: 'inverse',
    });
    // text-zinc-100 (fg) precedes the bg pair; a conflict would resolve to the bg's
    // forced foreground, which is the legible one.
    expect(classes).toEqual([
      'font-bold',
      'font-medium',
      'text-zinc-100',
      'bg-zinc-100',
      'text-zinc-950',
    ]);
  });
});

describe('stripAnsi (what the copy button hands the clipboard)', () => {
  it('strips every escape class and keeps the visible text', () => {
    expect(stripAnsi('\x1b[1;32m✓\x1b[0m built in \x1b[2m1.2s\x1b[0m')).toBe('✓ built in 1.2s');
  });

  it('strips OSC titles and cursor traffic', () => {
    expect(stripAnsi('\x1b]0;ci\x07$ \x1b[?25hok\x1b[2K')).toBe('$ ok');
  });

  it('plain text is returned untouched', () => {
    expect(stripAnsi('$ pnpm test\n22 passed')).toBe('$ pnpm test\n22 passed');
  });
});
