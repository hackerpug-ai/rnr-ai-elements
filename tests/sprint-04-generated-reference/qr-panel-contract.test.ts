import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * REF-005 — QrPanel.astro source-contract scan over the REAL working tree.
 *
 * UNIT_TEST_JUSTIFIED: pure static source-contract scan over the authored
 * .astro file plus one real config read (apps/example/app.json) — file reads
 * only, no rendering, no network, no DB (same pattern as the landed
 * tests/sprint-02-shell-hero/primitives.test.ts). The rendered decodability
 * proof rides REF-001's qr-panel.spec.ts lane over REF-009's assembly, outside
 * this task's write_allowed.
 *
 * Contract (task REF-005, AC-1..AC-4):
 * - The prebuild (REF-008) owns encoding; QrPanel renders the prop-fed inline
 *   SVG verbatim through exactly one set:html and never encodes or rewrites it.
 * - role=img with the item-derived accessible name
 *   'Open the {item} gallery screen in Expo Go'.
 * - Its own <aside data-qr-panel> root outside any preview panel, exactly 3
 *   token references on the surface, 0 focusables, 0 JS.
 * - No fabricated QR: no placeholder, no authored <svg>/<path>, no conditional
 *   substitution. RED at task start: QrPanel.astro is absent.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const QR_PANEL = join(repoRoot, 'apps', 'docs', 'src', 'components', 'QrPanel.astro');
const APP_JSON = join(repoRoot, 'apps', 'example', 'app.json');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;

function count(source: string, pattern: RegExp): number {
  const flags = `${pattern.flags.replace('g', '')}g`;
  return (source.match(new RegExp(pattern.source, flags)) ?? []).length;
}

function readQrPanel(): string {
  expect(existsSync(QR_PANEL), `QrPanel.astro exists at ${QR_PANEL}`).toBe(true);
  return readFileSync(QR_PANEL, 'utf8');
}

it('REF-005-qr-panel-source-contract: 1 required {item, svg} props interface, 1 <aside data-qr-panel> root, 1 role=img with the item-derived accessible name, 1 set:html={svg} entry point', () => {
  const source = readQrPanel();

  // TC-1 — the prop pair: both required, 0 defaults.
  const propsBlock = source.match(/interface\s+Props\s*\{([^}]*)\}/)?.[1] ?? '';
  expect(propsBlock, 'declares an interface Props block').not.toBe('');
  expect(propsBlock, 'item prop is a required string').toMatch(/\bitem:\s*string;/);
  expect(propsBlock, 'svg prop is a required string').toMatch(/\bsvg:\s*string;/);
  expect(propsBlock, 'neither prop is optional').not.toContain('?');
  expect(propsBlock, 'neither prop carries a default').not.toContain('=');

  // TC-1 — exactly 1 aside root carrying data-qr-panel, 0 nested section/article.
  expect(count(source, /<aside[\s>]/), 'exactly one aside element').toBe(1);
  expect(source, 'the aside root is <aside data-qr-panel>').toContain('<aside data-qr-panel>');
  expect(source, 'no nested section roots').not.toMatch(/<section[\s>]/);
  expect(source, 'no nested article roots').not.toMatch(/<article[\s>]/);

  // TC-2 — exactly 1 role=img carrying the accessible-name formula.
  expect(count(source, /role="img"/), 'exactly one role="img" element').toBe(1);
  expect(
    count(source, /aria-label=\{`Open the \$\{item\} gallery screen in Expo Go`\}/),
    'exactly one aria-label composed from the item prop',
  ).toBe(1);

  // TC-2 — exactly 1 set:html={svg}: the module's only raw-HTML entry point.
  expect(count(source, /set:html=\{svg\}/), 'exactly one set:html={svg} binding').toBe(1);
  expect(count(source, /set:html/g), 'set:html={svg} is the only raw-HTML entry point').toBe(1);

  // Zero-JS and placeholder-free.
  expect(source, 'ships no script tag').not.toContain('<script');
  expect(source, 'defines no custom element').not.toContain('customElements.define');
  expect(source, 'carries no hex color literal').not.toMatch(HEX_LITERAL);
  expect(source, 'no img placeholder').not.toMatch(/<img[\s>]/);
  expect(source, 'no picture placeholder').not.toMatch(/<picture[\s>]/);

  console.info(
    `[REF-005 seeded evidence] asideRoots=${count(source, /<aside[\s>]/)} nestedRoots=0 roleImg=${count(source, /role="img"/)} setHtmlBindings=${count(source, /set:html/g)}`,
  );
});

it('REF-005-qr-panel-readonly-svg-prop: 0 encoding imports, 0 transformations of the svg prop, 1 documented scheme comment matching the real app.json expo.scheme', () => {
  const source = readQrPanel();

  // TC-3 — 0 encoding libraries imported.
  const importLines = source.match(/^\s*import[^\n]*/gm) ?? [];
  expect(
    importLines.filter((line) => /qrcode|crypto|encod/i.test(line)),
    'no import resolves to an encoder',
  ).toHaveLength(0);
  expect(source, 'the encoder devDep is never referenced').not.toMatch(/qrcode/i);

  // TC-3 — 0 transformation calls applied to the svg prop: no member access
  // on svg at all, so nothing can trim/replace/slice it.
  expect(source, 'no member access on the svg prop (0 .trim/.replace/.slice)').not.toMatch(
    /\bsvg\s*\./,
  );

  // TC-3/TC-4 — exactly 1 comment naming the scheme base + '/' + item name
  // and the sprint-09 dead-end, pinned against the REAL app.json.
  const scheme = (JSON.parse(readFileSync(APP_JSON, 'utf8')) as { expo: { scheme?: string } }).expo
    ?.scheme;
  expect(scheme, 'apps/example/app.json pins expo.scheme').toBe('ai-elements-example');
  const schemeLiteral = scheme ?? ''; // pinned by the assert above
  const schemeComment = (source.match(/\/\*[\s\S]*?\*\//g) ?? []).filter((block) =>
    block.includes(schemeLiteral),
  );
  expect(schemeComment, 'exactly one source comment names the scheme base').toHaveLength(1);
  expect(schemeComment[0] ?? '', 'the comment composes scheme + / + item name').toContain(
    `'${schemeLiteral}' + '/' + item name`,
  );
  expect(schemeComment[0] ?? '', 'the comment names the sprint-09 dead-end').toMatch(/sprint-09/);
  expect(schemeComment[0] ?? '', 'the comment calls the link a dead-end').toMatch(/dead-?end/i);

  console.info(
    `[REF-005 seeded evidence] encodingImports=${importLines.filter((line) => /qrcode|crypto|encod/i.test(line)).length} svgMemberAccess=${count(source, /\bsvg\s*\./)} scheme=${schemeLiteral} (app.json expo.scheme match)`,
  );
});

it('REF-005-qr-panel-own-aside: standalone aside outside any preview panel, exactly 3 token references, 0 hex, 0 focusables, 0 script', () => {
  const source = readQrPanel();

  // TC-5 — 1 aside root, 0 preview/matrix/tab markup, counted token surface.
  expect(count(source, /<aside[\s>]/), 'exactly one aside element').toBe(1);
  expect(source, 'the aside root is <aside data-qr-panel>').toContain('<aside data-qr-panel>');
  expect(source, 'no nested section roots').not.toMatch(/<section[\s>]/);
  expect(source, 'no nested article roots').not.toMatch(/<article[\s>]/);
  expect(source, 'no preview panel markup').not.toMatch(/preview/i);
  expect(source, 'no matrix markup').not.toMatch(/matrix/i);
  expect(source, 'no tab markup').not.toMatch(/\btabs?\b/i);

  const tokenRefs = source.match(/var\(--[a-z-]+\)/g) ?? [];
  expect(tokenRefs, 'exactly 3 token references style the surface').toHaveLength(3);
  expect(count(source, /var\(--card\)/), 'the card token fills the surface').toBe(1);
  expect(count(source, /var\(--border\)/), 'the border token strokes the surface').toBe(1);
  expect(
    count(source, /var\(--radius(-[a-z]+)?\)/),
    'exactly one radius token rounds the surface',
  ).toBe(1);
  expect(source, 'carries no hex color literal').not.toMatch(HEX_LITERAL);

  // TC-6 — 0 focusable elements, 0 script.
  expect(source, 'no anchor wrapper (deep link inert until sprint-09)').not.toMatch(/<a[\s>]/);
  expect(source, 'no button element').not.toMatch(/<button[\s>]/);
  expect(source, 'ships no script tag').not.toContain('<script');
  expect(source, 'defines no custom element').not.toContain('customElements.define');

  console.info(
    `[REF-005 seeded evidence] tokenRefs=[${tokenRefs.join(', ')}] focusables=0 scripts=0`,
  );
});

it('REF-005-qr-panel-no-fabrication: the item=conversation literal proves the name template; 0 hardcoded paths, 0 authored svg/path markup, 0 substitution branches', () => {
  const source = readQrPanel();

  // TC-7 — evaluate the authored aria-label template for item=conversation.
  const template = source.match(/aria-label=\{`([^`]*)`\}/)?.[1] ?? '';
  expect(template, 'the aria-label is the authored template literal').not.toBe('');
  expect(
    template.replace(/\$\{item\}/g, 'conversation'),
    'item=conversation renders the exact positive literal',
  ).toBe('Open the conversation gallery screen in Expo Go');
  console.info(
    `[REF-005 seeded evidence] aria-label(item=conversation)="${template.replace(/\$\{item\}/g, 'conversation')}"`,
  );

  // TC-8 — 0 fabricated QR content.
  expect(source, 'no hardcoded .svg path').not.toMatch(/\.svg\b/);
  expect(source, 'no public/ asset reference').not.toContain('public/');
  expect(source, 'no authored inline svg element').not.toMatch(/<svg[\s>]/);
  expect(source, 'no authored inline path element').not.toMatch(/<path[\s>]/);
  expect(source, 'no conditional branch on svg truthiness').not.toMatch(/\bsvg\s*&&/);
  expect(source, 'no nullish fallback for svg').not.toMatch(/\bsvg\s*\?\?/);
  expect(source, 'no undefined check on svg').not.toMatch(
    /\bsvg\s*(===|!==)\s*(undefined|null|'')/,
  );
  expect(source, 'no ternary substitution on svg').not.toMatch(/\bsvg\s*\?/);
});
