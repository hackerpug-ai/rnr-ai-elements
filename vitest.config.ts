import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        // Registry lib imports in source use the engine placeholder alias
        // (`@/registry/{engine}/lib/status`); build-registry rewrites the segment on
        // fan-out. The test graph reaches the .logic.ts files, so Vitest needs the
        // same mapping tsc gets from tsconfig paths.
        find: /^@\/registry\/\{engine\}\/lib\/(.+)$/,
        replacement: resolve(__dirname, 'packages/registry/src/lib/$1'),
      },
    ],
  },
  test: {
    // Logic tier only. Rendering and any style assertion belong to the device tier:
    // Uniwind compiles classes in the Metro transform, so under Vitest a className is
    // an inert string and no style can be asserted at all.
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'apps/**'],
    // The count drill (scripts/docs-data/drill-item-count.ts) mutates the real
    // packages/registry/registry.json for ~13s and byte-restores it. With parallel
    // test files, registry readers (enrichment-modules) see the mutated 55-item
    // registry mid-drill and fail their 56-item assertions — deterministically.
    // The enrichment drill (scripts/docs-data/drill-enrichment.ts) widens the
    // same hazard to four mutation windows (shimmer.tsx, dev-client-matrix.json,
    // registry.json, conversation.tsx) plus two full docs builds over the
    // mutated tree — any parallel lane file reading those paths mid-drill fails.
    // Serializing test files makes every mutation window invisible to other files.
    fileParallelism: false,
  },
});
