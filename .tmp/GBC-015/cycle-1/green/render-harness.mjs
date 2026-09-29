// GBC-015 real-render harness (scratch — not committed).
//
// Renders apps/docs/src/components/IndexList.astro through the REAL Astro
// compiler + SSR (vite dev server with Astro's own plugin chain, then the
// experimental AstroContainer), with representative rows of both forms, and
// asserts the rendered contract the GBC-008/GBC-010 specs will key on.
// Run with cwd = apps/docs. Exits non-zero on the first failed assertion.

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const DOCS = '/Users/justinrich/Projects/rnr-ai-elements/.kb-run-sprint/worktrees/sprint-06-guides-boundary-changelog/GBC-015/apps/docs';
// vite is not a direct dep of apps/docs (pnpm isolated linker) — resolve the
// instance astro itself uses, via astro's REAL .pnpm location (realpath, so
// dependency resolution finds astro's own node_modules).
const { createRequire } = await import('node:module');
const { realpathSync } = await import('node:fs');
const astroReal = realpathSync(`${DOCS}/node_modules/astro`);
const astroRequire = createRequire(`${astroReal}/package.json`);
const vitePath = astroRequire.resolve('vite');
const { createServer } = await import(`file://${vitePath}`);
const { getViteConfig } = await import(`file://${DOCS}/node_modules/astro/dist/config/index.js`);
const { experimental_AstroContainer: AstroContainer } = await import(
  `file://${DOCS}/node_modules/astro/dist/container/index.js`
);

// Boot vite with Astro's own plugin chain (the same factory astro docs ship
// for vitest), then compile the component through it.
const factory = getViteConfig({});
const astroVite = await factory({ mode: 'development', command: 'serve' });
const server = await createServer({
  ...astroVite,
  configFile: false,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
const { default: IndexList } = await server.ssrLoadModule('/src/components/IndexList.astro');

const GUIDE_ROW = {
  href: '/guides/re-theme',
  title: 'Re-theme every primitive',
  description: 'Point the token sheet at your palette and flip both themes.',
};
const CHANGELOG_ROW = {
  id: 'r021',
  href: '/changelog/0.2.1',
  title: '0.2.1',
  meta: '2026-09-08',
  links: [
    { href: '/components/message', label: 'message' },
    { href: '/components/tool', label: 'tool' },
  ],
};

const container = await AstroContainer.create();
const html = await container.renderToString(IndexList, {
  props: { rows: [GUIDE_ROW, CHANGELOG_ROW] },
});

console.log('--- rendered IndexList HTML ---');
console.log(html);
console.log('--- end rendered HTML ---');

// List root: exactly one ul carrying data-index-list.
const ulOpens = html.match(/<ul[^>]*>/g) ?? [];
assert.equal(ulOpens.length, 1, 'exactly one ul root');
assert.ok(ulOpens[0].includes('data-index-list'), 'ul carries data-index-list');

// Rows: li elements carrying data-index-list-row, in prop order.
const rowOpens = html.match(/<li[^>]*data-index-list-row[^>]*>/g) ?? [];
assert.equal(rowOpens.length, 2, 'one li per row');
const rowsHtml = html
  .split(/<li[^>]*data-index-list-row[^>]*>/)
  .slice(1)
  .map((chunk) => chunk.split('</li>')[0]);
assert.equal(rowsHtml.length, 2);

// Guide row: title anchor + description, no chip, no component links.
assert.ok(
  rowsHtml[0].includes('href="/guides/re-theme"'),
  'guide row title anchor href',
);
const guideTitleMatch = rowsHtml[0].match(/<a[^>]*data-index-list-title[^>]*>([\s\S]*?)<\/a>/);
assert.ok(guideTitleMatch, 'guide row title anchor exists');
assert.equal(guideTitleMatch[1].trim(), GUIDE_ROW.title, 'title anchor holds only the title text');
assert.ok(rowsHtml[0].includes('data-index-list-description'), 'guide description element');
assert.ok(
  rowsHtml[0].includes(GUIDE_ROW.description),
  'the description text renders inside the row',
);
assert.ok(!rowsHtml[0].includes('class="chip'), 'guide row carries no chip');

// Changelog row: id lands, no description element, exactly one date chip,
// two touched-component links as SIBLINGS of the title anchor.
assert.ok(rowOpens[1].includes('id="r021"'), 'the deep-link id lands on the anchorable row');
assert.ok(rowsHtml[1].includes('href="/changelog/0.2.1"'), 'changelog title anchor href');
assert.ok(
  !rowsHtml[1].includes('data-index-list-description'),
  'no empty description element when the prop is absent',
);
const chips = rowsHtml[1].match(/<span[^>]*class="[^"]*\bchip\b[^"]*"[^>]*>[\s\S]*?<\/span>/g) ?? [];
assert.equal(chips.length, 1, 'exactly one chip in the changelog row');
assert.ok(chips[0].includes('2026-09-08'), 'the chip renders the date meta');
const componentLinks =
  rowsHtml[1].match(/<a[^>]*href="\/components\/[a-z0-9-]+"[^>]*>[\s\S]*?<\/a>/g) ?? [];
assert.equal(componentLinks.length, 2, 'both touched-component links render');
assert.ok(componentLinks[0].includes('/components/message') && componentLinks[0].includes('>message<'));
assert.ok(componentLinks[1].includes('/components/tool'));

// The never-nested-anchor rule on the REAL raw HTML: nothing opens inside a
// title anchor (invalid HTML the parser would split).
for (const [index, row] of rowsHtml.entries()) {
  const title = row.match(/<a[^>]*data-index-list-title[^>]*>/)?.[0] ?? '';
  assert.ok(title.length > 0, `row ${index}: title anchor present`);
  const after = row.slice(row.indexOf(title) + title.length);
  const close = after.indexOf('</a>');
  assert.ok(close >= 0, `row ${index}: title anchor closes`);
  assert.ok(
    !after.slice(0, close).includes('<a'),
    `row ${index}: no anchor opens inside the title anchor`,
  );
  assert.ok(!after.slice(0, close).includes('<span'), `row ${index}: no chip inside the title anchor`);
}

// Zero JS: the render emits no script tag of any kind.
assert.equal((html.match(/<script/g) ?? []).length, 0, '0 script tags in the render');

// The scoped stylesheet: Astro 7's container renders partials without <style>
// tags and vite's SSR pipeline discards CSS — so fetch the CLIENT transform
// of the component's style module, the exact code a browser loads for it.
const styleUrl = '/src/components/IndexList.astro?astro&type=style&index=0&lang.css';
const styleResult = await server.transformRequest(styleUrl, { ssr: false });
const css = styleResult?.code ?? '';
assert.ok(css.length > 0, 'the component emits a compiled stylesheet');
assert.ok(css.includes('data-astro-cid'), 'the stylesheet is scoped to the component');
assert.ok(css.includes('min-height: 44px'), '44px min-height in rendered css');
assert.ok(css.includes('inset: 0'), '::after inset 0 stretch in rendered css');
assert.ok(
  css.includes('scroll-margin-block-start: calc(var(--layout-header-h) + 1rem)'),
  'scroll-margin in rendered css',
);
for (const token of [
  'var(--foreground)',
  'var(--muted-foreground)',
  'var(--border)',
  'var(--accent)',
  'var(--radius-md)',
]) {
  assert.ok(css.includes(token), `${token} rides the rendered stylesheet`);
}
assert.equal(css.match(/#[0-9a-fA-F]{3,8}/), null, 'no hex literal in the rendered css');

// The container compiled THIS file: the rendered stylesheet is the authored
// one (the source rule text reappears verbatim in the scoped output).
const source = readFileSync(`${DOCS}/src/components/IndexList.astro`, 'utf8');
assert.ok(source.includes('min-height: 44px'), 'source still carries the contract (not a cache)');

console.log(
  'GBC-015 render harness: PASS — 2/2 rows rendered through the real Astro compiler+SSR; ' +
    'data hooks, sibling anchors, 1 chip, 0 scripts, scoped style with 44px min-height / ' +
    '::after inset 0 / scroll-margin / 5 tokens all present in the real output.',
);
await server.close();
