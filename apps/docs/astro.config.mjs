import { defineConfig } from 'astro/config';

// Static output is Astro's default — no SSR wiring, no output override. The canonical
// origin feeds every absolute-URL install command rendered downstream.
export default defineConfig({
  site: 'https://rnraielements.com',
});
