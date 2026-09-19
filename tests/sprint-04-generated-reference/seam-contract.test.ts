import { existsSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';

/**
 * REF-004 — source-contract scan over the authored seam artifacts (Callout.astro,
 * seam-map.ts, the modified theming.astro) plus pure derivation over the REAL
 * registry sources.
 *
 * UNIT_TEST_JUSTIFIED: static source-contract scans over authored .astro files
 * and a pure module executed over real source-file text — file reads plus a
 * pure function, no rendering, no network, no DB (the landed
 * primitives.test.ts and one-line-description patterns). Mounted seam callouts
 * and the rendered anchor/200 proof ride REF-009's page lanes and the preview
 * gates, outside this task's write_allowed.
 *
 * Ground truth (grep over packages/registry/src at task time):
 * - TextClassContext in exactly 8 registry:component items (5 further matches
 *   are registry:ui, out of scope).
 * - renderMarkdown/enriched-markdown in exactly 3 registry:component items.
 * - message carries both; 29/39 carry zero.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const CALLOUT = join(repoRoot, 'apps/docs/src/components/Callout.astro');
const SEAM_MAP = join(repoRoot, 'apps/docs/src/lib/seam-map.ts');
const THEMING = join(repoRoot, 'apps/docs/src/pages/docs/theming.astro');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;
const VARIANT_UNION = /'info'\s*\|\s*'warning'/;
const SCROLL_MARGIN = 'scroll-margin-block-start: calc(var(--layout-header-h) + 1rem)';
const COPY_STABLE_ANCHORS = ['ship no tokens', 'oklch', 'prefers-color-scheme', 'toggle'] as const;

/** The 39 registry:component items, sourceFiles shaped as the prebuild emits. */
function registryComponentItems(): {
  name: string;
  sourceFiles: { filename: string; text: string }[];
}[] {
  const registry = JSON.parse(
    readFileSync(join(repoRoot, 'packages/registry/registry.json'), 'utf8'),
  ) as { items: { name: string; type: string; files: { path: string }[] }[] };
  return registry.items
    .filter((item) => item.type === 'registry:component')
    .map((item) => ({
      name: item.name,
      sourceFiles: item.files.map((file) => ({
        filename: basename(file.path),
        text: readFileSync(join(repoRoot, file.path), 'utf8'),
      })),
    }));
}

/** Count non-empty `prop: value;` declarations inside one CSS rule body. */
function countDeclarations(ruleBody: string): number {
  return ruleBody
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0).length;
}

it('REF-004-callout-source-contract: info/warning variants, link slot, 2 tone rules / 4 declarations', () => {
  // RED at task start: the file does not exist yet.
  expect(existsSync(CALLOUT), `Callout exists at ${CALLOUT}`).toBe(true);
  const callout = readFileSync(CALLOUT, 'utf8');

  // TC-1 — the variant union is exactly info | warning, info default; title
  // required; body optional; exactly one named link slot.
  expect(callout, 'variant prop declares exactly info and warning').toMatch(VARIANT_UNION);
  const variantDecl = callout.match(/type CalloutVariant = ([^\n;]+)/)?.[1] ?? '';
  const variants = variantDecl.split('|').map((v) => v.trim().replaceAll("'", ''));
  expect(variants, 'no third variant exists in the union').toEqual(['info', 'warning']);
  expect(callout, 'info is the default variant').toMatch(/variant = 'info'/);
  expect(callout, 'title is required').toMatch(/title:\s*string/);
  expect(callout, 'body is optional').toMatch(/body\?:\s*string/);
  expect(callout.match(/<slot name="link" \/>/g) ?? [], 'exactly one link slot').toHaveLength(1);

  // TC-2 — exactly one aside root (base class + variant modifier), and the
  // tone rules carry exactly 4 declarations over the 4 pinned token pairs.
  expect(callout.match(/<aside[\s>]/g) ?? [], 'exactly one aside root').toHaveLength(1);
  expect(callout, 'base callout class on the aside').toMatch(/'callout'/);
  expect(callout, 'variant modifier derives from the variant prop').toMatch(
    /callout--\$\{variant\}/,
  );

  const toneSelectors = callout.match(/\.callout--[a-z]+/g) ?? [];
  expect(toneSelectors, 'exactly two tone rule selectors, one per variant').toHaveLength(2);
  expect(new Set(toneSelectors), 'exactly two tone rules').toEqual(
    new Set(['.callout--info', '.callout--warning']),
  );
  const infoBody = callout.match(/\.callout--info\s*\{([^}]*)\}/)?.[1] ?? '';
  const warningBody = callout.match(/\.callout--warning\s*\{([^}]*)\}/)?.[1] ?? '';
  expect(infoBody, 'info surfaces on the secondary token').toContain(
    'background: var(--secondary)',
  );
  expect(infoBody, 'info text is muted-foreground').toContain('color: var(--muted-foreground)');
  expect(warningBody, 'warning borders on the destructive token').toContain(
    'border-color: var(--destructive)',
  );
  expect(warningBody, 'warning text is destructive').toContain('color: var(--destructive)');
  const declarationCount = countDeclarations(infoBody) + countDeclarations(warningBody);
  expect(declarationCount, 'the two tone rules carry exactly 4 declarations').toBe(4);
  console.log(
    `[REF-004] Callout tone contract: 2 rules (.callout--info, .callout--warning), ` +
      `${declarationCount} declarations`,
  );

  // Zero-JS and token-only.
  expect(callout.match(HEX_LITERAL), 'no hex color literal').toBeNull();
  expect(callout, 'no script tag').not.toContain('<script');
  expect(callout, 'no custom element').not.toContain('customElements.define');
  expect(callout, 'no placeholder media').not.toMatch(/<(img|picture)[\s>]/);
});

it('REF-004-seam-map-derivation: real counts from real sourceFiles text', async () => {
  // RED at task start: the module does not exist yet (import names the path).
  const { deriveSeams } = await import(SEAM_MAP);

  const items = registryComponentItems();
  expect(items, 'the registry holds 39 component items').toHaveLength(39);

  const seamsByItem = items.map((item) => ({
    name: item.name,
    seams: deriveSeams(item.sourceFiles),
  }));
  const textClass = seamsByItem.filter((i) => i.seams.includes('textclasscontext'));
  const renderMarkdown = seamsByItem.filter((i) => i.seams.includes('rendermarkdown'));
  const both = seamsByItem.filter(
    (i) => i.seams.includes('textclasscontext') && i.seams.includes('rendermarkdown'),
  );
  const zero = seamsByItem.filter((i) => i.seams.length === 0);

  expect(textClass.map((i) => i.name).sort(), 'exactly the 8 TextClassContext users').toEqual(
    [
      'commit',
      'environment-variables',
      'message',
      'plan',
      'prompt-input',
      'queue',
      'terminal',
      'tool',
    ].sort(),
  );
  expect(renderMarkdown.map((i) => i.name).sort(), 'exactly the 3 renderMarkdown users').toEqual(
    ['context', 'message', 'reasoning'].sort(),
  );
  expect(both, 'message is the only item carrying both seams').toEqual([
    { name: 'message', seams: ['textclasscontext', 'rendermarkdown'] },
  ]);
  expect(zero, '29/39 items carry zero seams').toHaveLength(29);
  console.log(
    `[REF-004] derivation tallies: ${textClass.length} textclasscontext / ` +
      `${renderMarkdown.length} rendermarkdown / ${both.length} both / ${zero.length} zero`,
  );

  // TC-4 — no hand-curated item list: none of the seam-user names appears as a
  // string literal in the module; detection reads source text only.
  const seamMapSource = readFileSync(SEAM_MAP, 'utf8');
  for (const name of [...textClass.map((i) => i.name), ...renderMarkdown.map((i) => i.name)]) {
    expect(seamMapSource, `seam-map.ts contains no hardcoded '${name}'`).not.toContain(`'${name}'`);
  }
});

it('REF-004-theming-seam-sections: literal content anchors, 4 surviving copy anchors', () => {
  const theming = readFileSync(THEMING, 'utf8');

  // TC-5 — exactly one of each section id, appended after the existing prose.
  expect(
    theming.match(/<section id="textclasscontext">/g) ?? [],
    'exactly one section id="textclasscontext"',
  ).toHaveLength(1);
  expect(
    theming.match(/<section id="rendermarkdown">/g) ?? [],
    'exactly one section id="rendermarkdown"',
  ).toHaveLength(1);
  const proseEnd = theming.indexOf('The toggle in the site header');
  const tcAt = theming.indexOf('<section id="textclasscontext">');
  const rmAt = theming.indexOf('<section id="rendermarkdown">');
  expect(tcAt, 'the textclasscontext section follows the existing prose').toBeGreaterThan(proseEnd);
  expect(rmAt, 'the rendermarkdown section follows the existing prose').toBeGreaterThan(proseEnd);

  const tcSection = theming.slice(tcAt, rmAt);
  const rmSection = theming.slice(rmAt);

  // TC-6 — the sections state only the real seams.
  expect(tcSection, '#textclasscontext states the no-style-cascade fact').toContain(
    'no style cascade',
  );
  expect(tcSection, '#textclasscontext names the provider').toContain('TextClassContext');
  expect(rmSection, '#rendermarkdown names react-native-enriched-markdown').toContain(
    'react-native-enriched-markdown',
  );

  // One scroll-margin declaration covering both anchored sections (the ids
  // share a single rule, SectionHeader's sticky-Header idiom at page scope).
  expect(
    theming.match(new RegExp(SCROLL_MARGIN.replace(/[(){}[\]*+?\\^$|]/g, '\\$&'), 'g')) ?? [],
    'exactly one scroll-margin-block-start calc on the anchored sections',
  ).toHaveLength(1);
  expect(theming, 'both anchored ids share the one scroll-margin rule').toMatch(
    /#textclasscontext,\s*#rendermarkdown\s*\{/,
  );

  for (const anchor of COPY_STABLE_ANCHORS) {
    expect(theming, `copy-stable anchor '${anchor}' survives verbatim`).toContain(anchor);
  }
  console.log(
    `[REF-004] theming sections: 2 ids (#textclasscontext, #rendermarkdown); ` +
      `4/4 copy-stable anchors survive`,
  );

  // No sprint-06 /guides/ retarget, no added scripts.
  expect(theming, 'no /guides/ links this sprint').not.toContain('/guides/');
  expect(theming, 'no script tag added').not.toContain('<script');
});

it('REF-004-seam-scoping-no-invention: zero seams for non-users, exactly 2 kinds, one retarget surface', async () => {
  const { deriveSeams, SEAM_KINDS, SEAM_LINK_TARGETS } = await import(SEAM_MAP);

  // TC-7 — the probed non-users carry no marker, so they derive zero seams.
  const items = registryComponentItems();
  expect(items, 'the registry holds 39 component items').toHaveLength(39);
  const byName = new Map(items.map((item) => [item.name, item]));
  for (const name of ['shimmer', 'conversation', 'suggestion']) {
    const item = byName.get(name);
    expect(item, `${name} is a registry:component item`).toBeDefined();
    expect(deriveSeams(item?.sourceFiles ?? []), `${name} derives zero seams`).toEqual([]);
  }
  expect([...SEAM_KINDS], 'exactly two seam kinds').toEqual(['textclasscontext', 'rendermarkdown']);

  // TC-8 — the single retarget surface: 2 entries, both on this sprint's page.
  const targets = Object.entries(SEAM_LINK_TARGETS);
  expect(targets, 'SEAM_LINK_TARGETS carries exactly 2 entries').toHaveLength(2);
  expect(targets.map(([kind]) => kind).sort(), 'targets keyed by both seam kinds').toEqual([
    'rendermarkdown',
    'textclasscontext',
  ]);
  for (const [, target] of targets) {
    expect(target, `target '${target}' stays on /docs/theming this sprint`).toMatch(
      /^\/docs\/theming#/,
    );
  }
  console.log(
    `[REF-004] scoping: 3/3 non-users empty; kinds ${[...SEAM_KINDS].join(', ')}; ` +
      `targets ${targets.map(([, t]) => t).join(', ')}`,
  );
});
