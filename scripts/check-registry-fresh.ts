/**
 * Registry freshness gate — the local twin of the CI registry job's
 * `pnpm registry:build && git diff --exit-code -- public/r`.
 *
 * The deliverable is a copy-paste registry: public/r/*.json must stay in sync with the
 * component sources, or `npx @react-native-reusables/cli add <url>` ships stale code to
 * every consumer. This check rebuilds the expected output IN MEMORY and compares it
 * byte-for-byte against the committed tree — it never writes, so it cannot paper over
 * drift by regenerating it.
 *
 * Fails if any emitted item is missing, stale, or would differ after a rebuild.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  buildItem,
  ENGINES,
  type Registry,
  type RegistryItem,
} from '../packages/registry/scripts/build-registry.ts';

function main(): void {
  const root = process.cwd();
  const manifestPath = join(root, 'packages/registry/registry.json');
  if (!existsSync(manifestPath)) {
    console.error(`FAIL: registry manifest not found at ${manifestPath}`);
    process.exit(2);
  }
  const registry: Registry = JSON.parse(readFileSync(manifestPath, 'utf8'));

  let failures = 0;
  let checked = 0;

  for (const engine of ENGINES) {
    const expectedIndex = {
      ...registry,
      items: registry.items.map((i) => ({ name: i.name, type: i.type, title: i.title })),
    };
    for (const item of registry.items as RegistryItem[]) {
      const built = buildItem(item, engine, (p) => readFileSync(join(root, p), 'utf8'));
      const expected = `${JSON.stringify(built, null, 2)}\n`;
      const outPath = join(root, 'public/r', engine, `${item.name}.json`);
      checked++;
      if (!existsSync(outPath)) {
        console.error(
          `FAIL [missing] public/r/${engine}/${item.name}.json — run 'pnpm registry:build' and commit`,
        );
        failures++;
        continue;
      }
      const actual = readFileSync(outPath, 'utf8');
      if (actual !== expected) {
        console.error(
          `FAIL [stale] public/r/${engine}/${item.name}.json differs from a fresh build — ` +
            "run 'pnpm registry:build' and commit",
        );
        failures++;
      }
    }

    // The per-engine index must be fresh too — a consumer browsing it should see every
    // shipped item, not the set as of some earlier wave.
    const indexPath = join(root, 'public/r', engine, 'registry.json');
    checked++;
    if (!existsSync(indexPath)) {
      console.error(`FAIL [missing] public/r/${engine}/registry.json — run 'pnpm registry:build'`);
      failures++;
    } else if (readFileSync(indexPath, 'utf8') !== `${JSON.stringify(expectedIndex, null, 2)}\n`) {
      console.error(
        `FAIL [stale] public/r/${engine}/registry.json differs from a fresh build — ` +
          "run 'pnpm registry:build' and commit",
      );
      failures++;
    }
  }

  if (failures > 0) {
    console.error(`\nregistry is stale — ${failures} of ${checked} file(s) out of date.`);
    process.exit(1);
  }
  console.log(
    `registry fresh — ${registry.items.length} item(s) x ${ENGINES.length} engine(s) = ${checked} file(s) match the sources.`,
  );
}

main();
