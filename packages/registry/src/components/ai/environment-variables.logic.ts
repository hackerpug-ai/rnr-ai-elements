/**
 * EnvironmentVariables — pure logic. Zero react-native imports, so the Vitest tier owns
 * it (see the header of lib/reasoning-lifecycle.ts for why component files themselves
 * cannot load under Node).
 *
 * Two pure behaviors from the web original:
 *  - MASKING: upstream masks values while `showValues` is false. The mask length is
 *    deterministic from the real value's length (clamped to 8–24 bullets) so rows
 *    visually differ without ever leaking the secret through geometry — an empty value
 *    still shows a full mask, never zero-width.
 *  - THE COPY FORMAT: the KB documents the copy feature as the `export KEY="value"`
 *    line. Double quotes inside the value are escaped (`\"`) so the pasted line parses
 *    in a POSIX shell; no other escaping is invented.
 *
 * The reveal toggle is a DISPLAY guard (shoulder-surfing), not an encryption boundary:
 * the clipboard always receives the real value. Declared here because a masked value
 * that silently copies its mask would be worse than useless.
 */

/** The mask never renders shorter than this, whatever the secret's length. */
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
