import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * meta.permissions must match what an item's imports actually imply — both
 * directions. Over-declaring makes consumers add permission prompts they never
 * show; under-declaring ships an app the OS refuses at the moment the user
 * taps the feature.
 *
 * The mining table maps each known permission-implying package to the literal
 * manifest keys a consumer must declare. A package absent from the table
 * implies nothing — adding an entry here is a deliberate act, not a default.
 */
const PACKAGE_PERMISSIONS: Record<string, { ios: string[]; android: string[] }> = {
  'expo-image-picker': {
    ios: ['NSPhotoLibraryUsageDescription', 'NSCameraUsageDescription'],
    android: ['READ_MEDIA_IMAGES', 'CAMERA'],
  },
};

function packageImports(source: string): Set<string> {
  const out = new Set<string>();
  for (const m of source.matchAll(/from '([^']+)'/g)) {
    const spec = m[1];
    if (spec.startsWith('.') || spec.startsWith('@/')) continue;
    out.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
  }
  return out;
}

const registry = JSON.parse(
  readFileSync(join(process.cwd(), 'packages/registry/registry.json'), 'utf8'),
) as {
  items: {
    name: string;
    meta?: { permissions?: { ios?: string[]; android?: string[] } };
    files: { path: string }[];
  }[];
};

describe('registry meta.permissions matches implied permissions', () => {
  for (const item of registry.items) {
    it(`${item.name}: declared permissions match implied permissions`, () => {
      const imported = new Set<string>();
      for (const f of item.files) {
        for (const pkg of packageImports(readFileSync(join(process.cwd(), f.path), 'utf8'))) {
          imported.add(pkg);
        }
      }
      const implied = { ios: new Set<string>(), android: new Set<string>() };
      for (const pkg of imported) {
        const table = PACKAGE_PERMISSIONS[pkg];
        if (!table) continue;
        for (const k of table.ios) implied.ios.add(k);
        for (const k of table.android) implied.android.add(k);
      }
      const declared = {
        ios: new Set(item.meta?.permissions?.ios ?? []),
        android: new Set(item.meta?.permissions?.android ?? []),
      };
      const undeclared = [...implied.ios].filter((k) => !declared.ios.has(k));
      const stale = [...declared.ios].filter((k) => !implied.ios.has(k));
      const undeclaredAndroid = [...implied.android].filter((k) => !declared.android.has(k));
      const staleAndroid = [...declared.android].filter((k) => !implied.android.has(k));
      expect(
        { undeclared, stale, undeclaredAndroid, staleAndroid },
        `${item.name}: ios add [${undeclared}] remove [${stale}]; android add [${undeclaredAndroid}] remove [${staleAndroid}]`,
      ).toEqual({ undeclared: [], stale: [], undeclaredAndroid: [], staleAndroid: [] });
    });
  }
});
