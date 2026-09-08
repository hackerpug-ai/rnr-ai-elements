/**
 * Token law gate — the registry declares ZERO tokens of its own; every color a
 * component renders must come from the consumer's theme via a semantic class
 * (bg-primary, text-muted-foreground, …) so theme overrides flow through with no
 * per-component wiring.
 *
 * This check fails on raw color values in shipped sources: tailwind palette
 * classes (bg-zinc-950, text-blue-500, bg-black, …) and color literals (#737373,
 * oklch(, rgb(, hsl(, …). Raw values erode the one-promise of the library — a
 * consumer swapping their theme finds surfaces that do not move.
 *
 * The only escape is TOKEN_EXCEPTIONS below: an exact file + exact token with a
 * written reason. Exceptions exist only where a raw value is load-bearing —
 * parity with the web original, a platform prop that cannot take a class, or a
 * scheme-independent surface by design. Adding one requires a reason a reviewer
 * can check against the source.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Grandfathered raw values. Each entry is an exact file + an exact token list;
 * the reason must name the constraint that makes the raw values correct.
 */
const TOKEN_EXCEPTIONS: { file: string; tokens: string[]; reason: string }[] = [
  {
    file: 'packages/registry/src/components/ai/file-tree.tsx',
    tokens: ['text-blue-500'],
    reason:
      'folder-glyph hue pinned to the web original (web file-tree.tsx:198); safelisted consumer-side',
  },
  {
    file: 'packages/registry/src/components/ai/terminal.tsx',
    tokens: ['bg-zinc-950', 'border-zinc-800', 'text-zinc-100', 'text-zinc-500', 'text-zinc-950'],
    reason: 'terminal surface is scheme-independent by design (web terminal.tsx:250 parity)',
  },
  {
    file: 'packages/registry/src/components/ai/terminal.logic.ts',
    tokens: [
      'bg-zinc-100',
      'bg-zinc-700',
      'bg-zinc-800',
      'bg-zinc-950',
      'text-zinc-100',
      'text-zinc-500',
      'text-zinc-950',
      'text-blue-400',
      'text-green-500',
      'text-green-600',
      'text-orange-500',
      'text-orange-600',
    ],
    reason:
      'ANSI-to-class palette for the scheme-independent terminal surface — the colors ARE the data (web parity)',
  },
  {
    file: 'packages/registry/src/components/ai/tool.logic.ts',
    tokens: ['text-blue-400', 'text-blue-600', 'text-yellow-400', 'text-yellow-600'],
    reason: 'tool-state encoding (running/warn) — status data, not theming; light/dark pairs',
  },
  {
    file: 'packages/registry/src/components/ai/transcription.logic.ts',
    tokens: ['text-neutral-400', 'text-neutral-500'],
    reason: 'transcript secondary text on the fixed terminal surface — fixed grays by design',
  },
  {
    file: 'packages/registry/src/lib/status.ts',
    tokens: ['text-green-500', 'text-green-600', 'text-orange-500', 'text-orange-600'],
    reason: 'status→color mapping (ok/pending) — status data, not theming; light/dark pairs',
  },
  {
    file: 'packages/registry/src/components/ai/speech-input.tsx',
    tokens: ['border-red-400'],
    reason: 'recording/error border — red is the data encoding of "live mic", not theming',
  },
  {
    file: 'packages/registry/src/components/ai/test-results.tsx',
    tokens: ['bg-green-500', 'bg-red-500'],
    reason: 'pass/fail dots — green/red encode test status (data), not theme',
  },
  {
    file: 'packages/registry/src/components/ui/sheet.tsx',
    tokens: ['bg-black'],
    reason: 'overlay scrim — deliberately unthemed dimmer behind the sheet',
  },
  {
    file: 'packages/registry/src/components/ui/input-group.tsx',
    tokens: ['#737373', '#a3a3a3', 'hsl('],
    reason:
      'placeholderTextColor RN prop carrying the exact --color-muted-foreground light/dark values; no engine-agnostic way to pass a token through the prop',
  },
];

/** Raw tailwind palette classes. Semantic classes (bg-primary, text-foreground) do not match. */
const RAW_CLASS =
  /\b(?:bg|text|border|ring|fill|stroke|from|to|via|divide|outline|decoration|caret|accent)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone|white|black)(?:-\d{2,3})?\b/g;
/** Color literals. Catches hex, oklch, rgb(a), hsl(a) — including inside comments. */
const RAW_LITERAL = /#[0-9a-fA-F]{3,8}\b|oklch\(|rgba?\(|hsla?\(/g;

/**
 * Returns every raw color token in one source line (may be empty). Pure; the
 * unit under test. `hsla?(` and `rgba?(` normalize to 'hsl(' / 'rgb(' so an
 * exception entry covers all alpha forms of the same color.
 */
export function findRawColorTokens(line: string): string[] {
  const out: string[] = [];
  for (const m of line.matchAll(RAW_CLASS)) out.push(m[0]);
  for (const m of line.matchAll(RAW_LITERAL)) {
    out.push(m[0].replace(/(hsl|rgb)a\(/, '$1(').toLowerCase());
  }
  return out;
}

function main(): void {
  const root = process.cwd();
  const registry = JSON.parse(
    readFileSync(join(root, 'packages/registry/registry.json'), 'utf8'),
  ) as {
    items: { files: { path: string }[] }[];
  };

  let failures = 0;
  let documented = 0;
  const files = new Set(registry.items.flatMap((i) => i.files.map((f) => f.path)));

  for (const path of files) {
    const source = readFileSync(join(root, path), 'utf8');
    const lines = source.split('\n');
    for (let i = 0; i < lines.length; i++) {
      for (const token of findRawColorTokens(lines[i])) {
        const entry = TOKEN_EXCEPTIONS.find((e) => e.file === path && e.tokens.includes(token));
        if (entry) {
          documented++;
          continue;
        }
        console.error(`FAIL ${path}:${i + 1} — raw color "${token}"`);
        failures++;
      }
    }
  }

  if (failures > 0) {
    console.error(
      `\ntoken law violated — ${failures} undocumented raw color(s). ` +
        'Use a semantic class (the consumer theme provides it), or add a TOKEN_EXCEPTIONS entry with a reason.',
    );
    process.exit(1);
  }
  console.log(
    `tokens clean — ${files.size} shipped source file(s), ${documented} raw value(s), all documented.`,
  );
}

// Run main() only when THIS file is the entrypoint, so the vitest unit test can
// import findRawColorTokens without executing the scan (build-registry pattern).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
