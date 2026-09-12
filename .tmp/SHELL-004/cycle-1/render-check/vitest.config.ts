import { getViteConfig } from '../../../../apps/docs/node_modules/astro/dist/config/entrypoint.js';

// Scratch harness — NOT a committed gate. Renders the new SHELL-004 components
// through Astro's container API so the served-DOM contract (slot resolution,
// hidden-attribute shape, absolute-URL commands) is observed, not assumed.
export default getViteConfig({
  test: {
    include: [new URL('./render.test.ts', import.meta.url).pathname],
  },
});
