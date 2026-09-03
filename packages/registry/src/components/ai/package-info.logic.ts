/**
 * PackageInfo — pure logic. Zero react-native imports, so the Vitest tier owns it (see
 * the header of lib/reasoning-lifecycle.ts for why component files themselves cannot
 * load under Node).
 *
 * COLOR COMPRESSION, DECLARED — same move as commit.logic, one file earlier in the
 * wave family. The web paints change types with FIVE escape-hatch hues (major red,
 * minor yellow, patch green, added blue, removed gray). The styling contract permits
 * exactly three non-token colors, confined to lib/status.ts, so the five compress onto
 * the house StatusTone vocabulary — major→error, minor→denied, patch→success,
 * added→running (the accent role carries "blue"), removed→pending (the muted pole
 * carries "gray"). The badge's own TEXT carries the kind ("major", "added"), so the
 * compression loses no information — color is never the sole channel (WCAG 1.4.1).
 *
 * The version line is the KB's "version transition display": current → next with an
 * arrow, each half optional, whitespace-trimmed (streamed metadata arrives dirty).
 * The install command is UC-CODE-01 AC-3's copyable line: `npm install <name>` with an
 * optional `@version` pin — the NEW version when one is present (an upgrade card pins
 * the target), nothing otherwise (a fresh install tracks latest).
 */

import { statusColor } from '@/registry/{engine}/lib/status';

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
 * The version transition line: "1.2.3 → 2.0.0" (upgrade), "1.2.3" (installed),
 * "2.0.0" (announced), or null when neither arrives yet — null means render nothing,
 * never "undefined → undefined".
 */
export function formatVersionTransition(currentVersion?: string, newVersion?: string): string | null {
  const current = currentVersion?.trim();
  const next = newVersion?.trim();
  if (current && next) return `${current} → ${next}`;
  return current || next || null;
}

/** AC-3's copyable line. `version` pins the install; absent means latest. */
export function installCommand(name: string, version?: string): string {
  const pkg = name.trim();
  const pinned = version?.trim();
  return pinned ? `npm install ${pkg}@${pinned}` : `npm install ${pkg}`;
}
