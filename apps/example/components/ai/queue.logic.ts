export type QueueItemLike = { id: string };

/**
 * Removes the one item with this id, preserving order. Pure: the input array is never
 * mutated, and a missing id is a no-op returning the same items in the same order —
 * never an exception, never a reordered list.
 */
export function removeQueueItem<T extends QueueItemLike>(items: readonly T[], id: string): T[] {
  return items.filter((item) => item.id !== id);
}

/**
 * Appends items, skipping any whose id is already queued — the duplicate guard the web
 * original's useQueue enforces (the same action queued twice must not send twice).
 * Accepts one item or many; input is never mutated; order is arrival order.
 */
export function enqueueQueueItems<T extends QueueItemLike>(
  items: readonly T[],
  next: T | readonly T[],
): T[] {
  const incoming = Array.isArray(next) ? next : [next];
  const known = new Set(items.map((item) => item.id));
  const additions = incoming.filter((item) => !known.has(item.id));
  return [...items, ...additions];
}

/** How many queued items are already done — the trigger badge's completed clause. */
export function queueCompletedCount(items: ReadonlyArray<{ completed?: boolean }>): number {
  return items.filter((item) => item.completed).length;
}
