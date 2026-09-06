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
