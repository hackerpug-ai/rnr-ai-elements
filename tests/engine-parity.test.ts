import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Engine parity: public/r/nativewind and public/r/uniwind must serve the SAME
 * item set with the SAME manifest metadata — the two trees may differ ONLY by
 * the substituted engine token (import aliases and registry-host URLs).
 *
 * A consumer picks an engine at install time; if one tree ships an item the
 * other lacks, or one tree's declared deps drift from the other's, the engine
 * choice silently changes what the library is.
 */
const R = join(process.cwd(), 'public/r');

function itemFiles(engine: string): string[] {
  return readdirSync(join(R, engine))
    .filter((f) => f.endsWith('.json') && f !== 'registry.json')
    .sort();
}

/**
 * Both trees normalized to the engine placeholder — any residual diff is drift.
 * The build substitutes `{engine}` ONLY inside slash-delimited segments (import
 * aliases `@/registry/{engine}/…` and registry URLs `…/r/{engine}/…`), so the
 * normalization replaces exactly that footprint. Prose that deliberately NAMES
 * an engine (a comment about uniwind's extraction quirk) is identical in both
 * trees by construction and must not be normalized away.
 */
function normalized(engine: string, file: string): string {
  return readFileSync(join(R, engine, file), 'utf8').replaceAll(`/${engine}/`, '/{engine}/');
}

describe('engine parity (public/r)', () => {
  it('both engines ship the same item files', () => {
    expect(itemFiles('nativewind')).toEqual(itemFiles('uniwind'));
  });

  it('each item differs only by the engine token', () => {
    for (const file of itemFiles('nativewind')) {
      expect(normalized('uniwind', file), `${file}: trees differ beyond the engine token`).toBe(
        normalized('nativewind', file),
      );
    }
  });

  it('both per-engine indexes are identical', () => {
    const read = (e: string) =>
      existsSync(join(R, e, 'registry.json'))
        ? readFileSync(join(R, e, 'registry.json'), 'utf8')
        : null;
    expect(read('uniwind'), 'uniwind index missing or differs').toBe(read('nativewind'));
  });
});
