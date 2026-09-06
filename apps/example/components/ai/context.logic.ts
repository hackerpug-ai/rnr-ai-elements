export type ContextUsage = {
  inputTokens?: number;
  outputTokens?: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
};

/**
 * The consumed fraction of the window, clamped to [0, 1]. The web original divides
 * bare and would render NaN% on a zero max; a budget of zero means nothing used, not
 * infinity.
 */
export function contextUsedPercent(usedTokens: number, maxTokens: number): number {
  if (!maxTokens || maxTokens <= 0) return 0;
  const ratio = usedTokens / maxTokens;
  if (Number.isNaN(ratio)) return 0;
  return Math.min(1, Math.max(0, ratio));
}

/**
 * The trigger and header percentage — the web original's exact formatter
 * (`Intl.NumberFormat('en-US', { maximumFractionDigits: 1, style: 'percent' })` over
 * the ratio), so 0.625 renders "62.5%" and 1 renders "100%".
 */
export function formatContextPercent(usedTokens: number, maxTokens: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    style: 'percent',
  }).format(contextUsedPercent(usedTokens, maxTokens));
}

/**
 * Compact token counts — the web original's exact formatter
 * (`Intl.NumberFormat('en-US', { notation: 'compact' })`), byte-parity with its
 * "12.3K / 200K" header readout.
 */
export function formatContextTokens(tokens: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(tokens);
}

/**
 * The usage-row visibility rule, upstream trap parity: a row whose token count is
 * missing or zero renders NOTHING — not a zero line. "Input — 0" is noise in a
 * breakdown the user opens to see where the window went.
 */
export function usageRowVisible(tokens: number | undefined): boolean {
  return Boolean(tokens);
}

/**
 * The composed "used / total" header readout, compact on both sides exactly as the
 * web original writes it (`{used} / {total}` with the spaces around the slash).
 */
export function formatContextRatio(usedTokens: number, maxTokens: number): string {
  return `${formatContextTokens(usedTokens)} / ${formatContextTokens(maxTokens)}`;
}
