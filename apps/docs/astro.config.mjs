import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import astroExpressiveCode from 'astro-expressive-code';

// Static output is Astro's default — no SSR wiring, no output override. The canonical
// origin feeds every absolute-URL install command rendered downstream.
export default defineConfig({
  site: 'https://rnraielements.com',
  // Emit real dist/_astro/*.css bundles instead of inlining <style> tags — the
  // sprint-02 tokens lane scans the emitted files, and SHELL-002 pins a
  // /_astro/*.css <link> in the served HTML.
  build: { inlineStylesheets: 'never' },
  // Duplicate destinations (two routes or two collection sources resolving to one
  // published URL) must fail the build, not silently warn: the collection + catch-all
  // contract pins unique destinations, and the collision diagnostic must name the
  // destination and both source paths (the reserved /docs/theming slug is excluded
  // from catch-all generation, so it never trips this gate).
  prerenderConflictBehavior: 'error',
  integrations: [
    astroExpressiveCode({
      // One dark + one light theme, mapped to the site's OWN theme mechanism —
      // dark on :root, light under html.light — never the OS media query
      // (the pre-paint class flip is the single theme mechanism).
      themes: ['github-dark', 'github-light'],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) => (theme.type === 'dark' ? '' : '.light'),
    }),
    mdx(),
  ],
});
