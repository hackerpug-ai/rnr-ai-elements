import { describe, expect, it } from 'vitest';
import {
  isExpanded,
  toggleExpanded,
} from '../packages/registry/src/components/ai/file-tree.logic.ts';

/**
 * Pure logic only — the file-tree's expansion transition (see agent-status.test.ts's
 * header for why rendering itself cannot live in this tier).
 *
 * The regression class these tests pin is MUTATION: `expanded` lives in React state as
 * a Set, and an in-place add/delete keeps the object identity, so memoized children and
 * `has()` checks go stale silently. The toggle must return a NEW snapshot every time.
 */

describe('toggleExpanded (the copy-on-write transition)', () => {
  it('adds a closed folder’s path', () => {
    const next = toggleExpanded(new Set(), 'src');
    expect(isExpanded(next, 'src')).toBe(true);
  });

  it('removes an open folder’s path', () => {
    const next = toggleExpanded(new Set(['src', 'docs']), 'src');
    expect(isExpanded(next, 'src')).toBe(false);
    expect(isExpanded(next, 'docs')).toBe(true);
  });

  it('never mutates the input snapshot — the caller’s state object is the caller’s', () => {
    const current = new Set(['src']);
    const next = toggleExpanded(current, 'docs');
    expect(isExpanded(current, 'docs')).toBe(false);
    expect(isExpanded(current, 'src')).toBe(true);
    expect(next).not.toBe(current);
  });

  it('returns a Set the caller can hand straight back through onExpandedChange', () => {
    const next = toggleExpanded(new Set<string>(), 'packages/registry/src');
    expect(next).toBeInstanceOf(Set);
    expect([...next]).toEqual(['packages/registry/src']);
  });

  it('is an involution — toggling twice restores the original snapshot’s membership', () => {
    const start = new Set(['a', 'b']);
    const end = toggleExpanded(toggleExpanded(start, 'a'), 'a');
    expect([...end].sort()).toEqual([...start].sort());
  });

  it('treats paths as opaque strings — no normalization is invented', () => {
    const next = toggleExpanded(new Set(['src/']), 'src');
    // 'src/' and 'src' are different keys, exactly as the caller named them.
    expect(isExpanded(next, 'src/')).toBe(true);
    expect(next.size).toBe(2);
  });
});

describe('isExpanded (the snapshot read)', () => {
  it('reads membership without touching the set', () => {
    const snapshot = new Set(['src/components']);
    expect(isExpanded(snapshot, 'src/components')).toBe(true);
    expect(isExpanded(snapshot, 'src')).toBe(false);
  });

  it('reads ReadonlySets — the component’s controlled prop accepts the caller’s frozen state', () => {
    const frozen: ReadonlySet<string> = new Set(['x']);
    expect(isExpanded(frozen, 'x')).toBe(true);
  });
});
