import { statusColor } from '@/lib/status';

/** The web original's change-type union, verbatim. */
export type PackageChangeType = 'major' | 'minor' | 'patch' | 'added' | 'removed';

/** Every change type, spelled out — exhaustiveness for the meta table. */
export const PACKAGE_CHANGE_TYPE_KEYS = [
  'major',
  'minor',
  'patch',
  'added',
  'removed',
] as const satisfies readonly PackageChangeType[];

export type PackageChangeTypeMeta = {
  /** The badge's default label — the word itself carries the kind. */
  label: string;
  /** Precomposed text class from the shared statusColor map. */
  className: string;
};

/** change type → label + tone, one record, exhaustive by type. */
export const PACKAGE_CHANGE_TYPE_META: Record<PackageChangeType, PackageChangeTypeMeta> = {
  major: { label: 'major', className: statusColor.error },
  minor: { label: 'minor', className: statusColor.denied },
  patch: { label: 'patch', className: statusColor.success },
  added: { label: 'added', className: statusColor.running },
  removed: { label: 'removed', className: statusColor.pending },
};

export function packageChangeTypeMeta(changeType: PackageChangeType): PackageChangeTypeMeta {
  return PACKAGE_CHANGE_TYPE_META[changeType];
}

/**
 * The version transition as SEGMENTS: "1.2.3 → 2.0.0" splits so the card can
 * emphasize the upgrade target (new version bold/dark — the web's treatment) while
 * the old version stays muted. "1.2.3" (installed) / "2.0.0" (announced) render as
 * a single segment; null when neither arrives yet — null means render nothing, never
 * "undefined → undefined" mid-stream.
 */
export type VersionTransition =
  | { kind: 'both'; current: string; next: string }
  | { kind: 'single'; value: string }
  | null;

export function versionTransitionSegments(currentVersion?: string, newVersion?: string): VersionTransition {
  const current = currentVersion?.trim();
  const next = newVersion?.trim();
  if (current && next) return { kind: 'both', current, next };
  const value = current || next;
  return value ? { kind: 'single', value } : null;
}

/**
 * The flat string form of the same transition, for plain-text callers (a11y labels,
 * log lines). Pure join of the segments — one source of truth, never a second parse.
 */
export function formatVersionTransition(currentVersion?: string, newVersion?: string): string | null {
  const segments = versionTransitionSegments(currentVersion, newVersion);
  if (!segments) return null;
  return segments.kind === 'both' ? `${segments.current} → ${segments.next}` : segments.value;
}

/** AC-3's copyable line. `version` pins the install; absent means latest. */
export function installCommand(name: string, version?: string): string {
  const pkg = name.trim();
  const pinned = version?.trim();
  return pinned ? `npm install ${pkg}@${pinned}` : `npm install ${pkg}`;
}
