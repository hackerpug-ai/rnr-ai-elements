/**
 * FileTree — pure logic. Zero react-native imports, so the Vitest tier owns it (see the
 * header of lib/reasoning-lifecycle.ts for why component files themselves cannot load
 * under Node).
 *
 * The tree's ONE behavior worth a pure home is the expansion transition: upstream keeps
 * `expanded: Set<string>` in the root and reports changes through onExpandedChange. The
 * regression class this guards is MUTATION — a Set updated in place inside React state
 * keeps its identity, so memoized children and `has()` checks go stale silently. The
 * transition is therefore a pure copy-on-write, and the component treats the result as
 * a new snapshot every time.
 *
 * The tree SHAPE itself is caller-composed JSX (upstream's declarative FileTreeFolder /
 * FileTreeFile parts), so there is no data structure to flatten, walk, or validate here
 * — depth lives in React context, not in a recursive model.
 */

/** Immutable expansion toggle: add `path` when closed, remove it when open. */
export function toggleExpanded(expanded: ReadonlySet<string>, path: string): Set<string> {
  const next = new Set(expanded);
  if (next.has(path)) {
    next.delete(path);
  } else {
    next.add(path);
  }
  return next;
}

/** Snapshot read — the component's `open` check, kept next to the transition it pairs with. */
export function isExpanded(expanded: ReadonlySet<string>, path: string): boolean {
  return expanded.has(path);
}
