/**
 * Streaming-markdown repair. Pure — no React, no React Native, no engine import — so it
 * is unit-testable, which is what the architecture lens scoped Vitest to own.
 *
 * The web original does this inside its HTML-producing parser. The behaviour is
 * renderer-agnostic and MUST survive the port: without it every streamed message flashes
 * literal `**` and backticks between tokens. That is the documented regression.
 */

const PAIRED_TOKENS = ['```', '**', '__', '*', '_', '`'] as const;

/**
 * Closes an unterminated emphasis or code run at the end of a streaming chunk.
 * Longest tokens first, so ``` is consumed before `.
 */
export function repairIncompleteMarkdown(input: string): string {
  let out = input;
  for (const token of PAIRED_TOKENS) {
    const count = out.split(token).length - 1;
    if (count % 2 === 1) out += token;
  }
  return out;
}
