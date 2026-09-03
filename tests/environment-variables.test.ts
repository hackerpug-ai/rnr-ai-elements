import { describe, expect, it } from 'vitest';
import {
  ENV_MASK_MAX,
  ENV_MASK_MIN,
  formatEnvLine,
  maskedValue,
} from '../packages/registry/src/components/ai/environment-variables.logic.ts';

/**
 * Pure logic only — masking and the copy format behind the environment-variables rows
 * (see agent-status.test.ts's header for why rendering itself cannot live in this
 * tier).
 *
 * The mask is a DISPLAY guard, not an encryption boundary: the clipboard always gets
 * the real value. The mask's geometry must never leak the secret through row width —
 * hence the 8–24 bullet clamp, and never a zero-width mask for an empty value.
 */

describe('maskedValue (the display guard)', () => {
  it('one bullet per character inside the clamp', () => {
    expect(maskedValue('1234567890')).toHaveLength(10);
    expect(maskedValue('1234567890')).toBe('••••••••••');
  });

  it('clamps short secrets up to the 8-bullet floor', () => {
    expect(maskedValue('')).toBe('•'.repeat(ENV_MASK_MIN));
    expect(maskedValue('abc')).toHaveLength(ENV_MASK_MIN);
  });

  it('clamps long secrets down to the 24-bullet ceiling', () => {
    const long = 'x'.repeat(200);
    expect(maskedValue(long)).toHaveLength(ENV_MASK_MAX);
    expect(maskedValue(long)).toBe('•'.repeat(ENV_MASK_MAX));
  });

  it('the mask length is deterministic — same value, same row geometry', () => {
    expect(maskedValue('hunter2')).toBe(maskedValue('hunter2'));
  });

  it('never leaks even the length beyond the ceiling — a 200-char secret and a 30-char one look identical', () => {
    expect(maskedValue('y'.repeat(30))).toBe(maskedValue('y'.repeat(300)));
  });
});

describe('formatEnvLine (the copy format, the KB’s export KEY="value")', () => {
  it('emits the export line with double quotes', () => {
    expect(formatEnvLine('DATABASE_URL', 'postgres://localhost:5432/app')).toBe(
      'export DATABASE_URL="postgres://localhost:5432/app"',
    );
  });

  it('escapes embedded double quotes so the pasted line parses in a POSIX shell', () => {
    expect(formatEnvLine('GREETING', 'she said "hi"')).toBe('export GREETING="she said \\"hi\\""');
  });

  it('trims a name that arrived with whitespace from a stream', () => {
    expect(formatEnvLine('  API_KEY ', 'v')).toBe('export API_KEY="v"');
  });

  it('passes the value through otherwise untouched — no invented escaping', () => {
    expect(formatEnvLine('A', 'a$b#c')).toBe('export A="a$b#c"');
  });

  it('an empty value still emits the quoted line', () => {
    expect(formatEnvLine('EMPTY', '')).toBe('export EMPTY=""');
  });
});
