import { defineConfig } from 'astro/config';

// Static output is Astro's default — no SSR wiring, no output override. The canonical
// origin feeds every absolute-URL install command rendered downstream.
export default defineConfig({
  site: 'https://rnraielements.com',
  // Emit real dist/_astro/*.css bundles instead of inlining <style> tags — the
  // sprint-02 tokens lane scans the emitted files, and SHELL-002 pins a
  // /_astro/*.css <link> in the served HTML.
  build: { inlineStylesheets: 'never' },
});
