export const ENV_MASK_MIN = 8;

/** The mask never renders longer than this — a 200-char secret must not widen the row. */
export const ENV_MASK_MAX = 24;

/** The masked presentation of a value: one bullet per character, clamped to 8–24. */
export function maskedValue(value: string): string {
  const length = Math.min(Math.max(value.length, ENV_MASK_MIN), ENV_MASK_MAX);
  return '•'.repeat(length);
}

/** The line the copy button puts on the clipboard: `export KEY="value"`. */
export function formatEnvLine(name: string, value: string): string {
  return `export ${name.trim()}="${value.replace(/"/g, '\\"')}"`;
}
