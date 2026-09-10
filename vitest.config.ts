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
    // Serializing test files makes the mutation invisible to every other file.
    fileParallelism: false,
  },
});
