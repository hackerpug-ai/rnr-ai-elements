import { describe, expect, it } from 'vitest';
import { repairIncompleteMarkdown } from '../packages/registry/src/lib/markdown.ts';

/**
 * Pure logic, which is exactly what Vitest owns here. Rendering and any style assertion
 * belong to the device tier — the styling engine compiles classes in the Metro transform,
 * so under Vitest a className is an inert string.
 *
 * Without this repair, every streamed message flashes raw markdown syntax mid-token. That
 * is the documented regression, so it gets a real test rather than trust.
 */
describe('repairIncompleteMarkdown', () => {
  it('closes a half-streamed bold run', () => {
    expect(repairIncompleteMarkdown('hello **wor')).toBe('hello **wor**');
  });

  it('closes a half-streamed inline code run', () => {
    expect(repairIncompleteMarkdown('call `fn')).toBe('call `fn`');
  });

  it('closes an unterminated fenced block', () => {
    expect(repairIncompleteMarkdown('```ts\nconst a = 1')).toBe('```ts\nconst a = 1```');
  });

  it('leaves balanced markdown untouched', () => {
    const balanced = 'a **bold** and `code` and _em_';
    expect(repairIncompleteMarkdown(balanced)).toBe(balanced);
  });

  it('leaves plain prose untouched', () => {
    expect(repairIncompleteMarkdown('no markdown here')).toBe('no markdown here');
  });

  it('handles the empty string', () => {
    expect(repairIncompleteMarkdown('')).toBe('');
  });
});
