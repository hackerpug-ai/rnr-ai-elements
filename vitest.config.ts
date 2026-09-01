import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Logic tier only. Rendering and any style assertion belong to the device tier:
    // Uniwind compiles classes in the Metro transform, so under Vitest a className is
    // an inert string and no style can be asserted at all.
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**', 'apps/**'],
  },
});
