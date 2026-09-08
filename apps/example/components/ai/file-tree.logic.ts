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
