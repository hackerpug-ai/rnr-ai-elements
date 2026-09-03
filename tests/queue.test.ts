import { describe, expect, it } from 'vitest';
import {
  enqueueQueueItems,
  queueCompletedCount,
  removeQueueItem,
} from '../packages/registry/src/components/ai/queue.logic.ts';

/**
 * Pure logic only — the caller-side queue operations (see agent-status.test.ts's header
 * for why rendering itself cannot live in this tier).
 *
 * The component never owns the queue (speech-input precedent: caller-supplied contract
 * only), so these helpers are what the caller's reducer is made of. They must be pure:
 * an input array that comes back mutated is the bug this suite exists to catch.
 */

type Item = { id: string; label?: string };

function itemsOf(...ids: string[]): Item[] {
  return ids.map((id) => ({ id }));
}

describe('removeQueueItem (the remove action, pure)', () => {
  it('removes exactly the one id and preserves the order of the rest', () => {
    expect(removeQueueItem(itemsOf('a', 'b', 'c'), 'b').map((i) => i.id)).toEqual(['a', 'c']);
  });

  it('a missing id is a no-op, not an exception and not a reorder', () => {
    const items = itemsOf('a', 'b');
    expect(removeQueueItem(items, 'zz').map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('works on an empty queue', () => {
    expect(removeQueueItem([], 'a')).toEqual([]);
  });

  it('removes every item carrying the id, never a lookalike', () => {
    const items: Item[] = [{ id: 'a' }, { id: 'a' }, { id: 'ab' }];
    expect(removeQueueItem(items, 'a').map((i) => i.id)).toEqual(['ab']);
  });

  it('never mutates the input array — the caller’s state is the caller’s', () => {
    const items = itemsOf('a', 'b', 'c');
    const snapshot = [...items];
    removeQueueItem(items, 'b');
    expect(items).toEqual(snapshot);
  });
});

describe('enqueueQueueItems (the duplicate-guarded append, pure)', () => {
  it('appends a new item at the end, preserving arrival order', () => {
    expect(enqueueQueueItems(itemsOf('a', 'b'), { id: 'c' }).map((i) => i.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('skips an id that is already queued — the same action must not send twice', () => {
    const items: Item[] = [{ id: 'a' }, { id: 'b', label: 'first' }];
    const next = enqueueQueueItems(items, { id: 'b', label: 'duplicate' });
    expect(next.map((i) => i.id)).toEqual(['a', 'b']);
    expect(next[1].label).toBe('first');
  });

  it('accepts many items at once, keeping only the new ones', () => {
    const next = enqueueQueueItems(itemsOf('a'), [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect(next.map((i) => i.id)).toEqual(['a', 'b', 'c']);
  });

  it('appends to an empty queue, even with an empty batch', () => {
    expect(enqueueQueueItems([], [])).toEqual([]);
    expect(enqueueQueueItems([], { id: 'a' }).map((i) => i.id)).toEqual(['a']);
  });

  it('never mutates the input array', () => {
    const items = itemsOf('a');
    const snapshot = [...items];
    enqueueQueueItems(items, [{ id: 'b' }, { id: 'a' }]);
    expect(items).toEqual(snapshot);
  });
});

describe('queueCompletedCount (the trigger badge’s completed clause)', () => {
  it('counts only the completed items', () => {
    expect(
      queueCompletedCount([{ completed: true }, { completed: false }, { completed: true }]),
    ).toBe(2);
  });

  it('an item with no completion flag is not completed', () => {
    expect(queueCompletedCount([{}, {}, { completed: true }])).toBe(1);
  });

  it('an empty queue counts zero', () => {
    expect(queueCompletedCount([])).toBe(0);
  });
});
