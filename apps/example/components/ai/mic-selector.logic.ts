export const MIC_ROUTE_KINDS = ['built-in', 'wired', 'bluetooth', 'other'] as const;

export type MicRouteKind = (typeof MIC_ROUTE_KINDS)[number];

/** One audio input route the caller enumerated on their platform. */
export type MicRoute = {
  id: string;
  label: string;
  /** Optional — an unknown or unspecified kind falls to 'other' for ordering and icon. */
  kind?: MicRouteKind;
};

/** Display rank: built-in first (the sane default), then wired, bluetooth, other. */
const KIND_RANK: Record<MicRouteKind, number> = {
  'built-in': 0,
  wired: 1,
  bluetooth: 2,
  other: 3,
};

function rankOf(route: MicRoute): number {
  const kind = route.kind ?? 'other';
  return KIND_RANK[kind] ?? KIND_RANK.other;
}

/**
 * Deterministic display order for a list the caller supplied: stable-sorted by kind
 * rank, caller order preserved within a kind (Array.prototype.sort is stable per
 * spec). Never throws on a malformed entry — an unsortable route lands with 'other'.
 */
export function orderMicRoutes(routes: readonly MicRoute[]): MicRoute[] {
  return [...routes].sort((a, b) => rankOf(a) - rankOf(b));
}

/**
 * The trigger's label: the selected route's label, the caller's fallback (or "Input")
 * when the value matches nothing. No-throw — a stale route id degrades to the
 * placeholder, the way a disconnected device should read.
 */
export function findMicRoute(
  routes: readonly MicRoute[],
  value: string | undefined,
): MicRoute | undefined {
  if (!value) return undefined;
  return routes.find((r) => r.id === value);
}
