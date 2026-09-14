import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, it } from 'vitest';
import registryItems from '../../apps/docs/src/data/registry-items.json';

/**
 * REF-003 — source-contract scan over the three authored visual primitives in
 * the REAL apps/docs/src/components tree (CodeBlock / ThemingNote /
 * UsageSnippet), grounded on the real registry dataset.
 *
 * UNIT_TEST_JUSTIFIED: pure static source-contract scan over authored .astro
 * files plus a real registry-items.json import — file reads only, no runtime
 * rendering (same pattern as the landed sprint-02 primitives.test.ts). The
 * rendered byte-match / no-clip / chip proofs are FLOW-GEND-35 and gate steps
 * 10-11 over REF-009's page assembly, outside this task's write_allowed.
 *
 * Contract (task REF-003, AC-1..AC-5):
 * - CodeBlock: composes the UNMODIFIED rnr-copy-button island with
 *   command={code} passed through verbatim (zero normalization); token-governed
 *   scoped styles; full untruncated body; always-visible copy with a 44px touch
 *   target and the 'Copy code' label default.
 * - ThemingNote: exactly one hyphenated-lowercase identifier regex; matches
 *   render as counter-less Chip mono pills; the note prop is the sole string
 *   source, grounded on the real 39-note dataset (37 with >=1 identifier, 147
 *   identifiers total; conversation and suggestion carry none).
 * - UsageSnippet: required snippet prop with no default, one verbatim CodeBlock
 *   passthrough, zero canned fallbacks.
 * - All three: token-only (zero hex literals), zero script tags, zero
 *   customElements.define — zero-JS primitives composing existing islands.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const componentsDir = join(repoRoot, 'apps', 'docs', 'src', 'components');

const SOURCES = {
  CodeBlock: join(componentsDir, 'CodeBlock.astro'),
  ThemingNote: join(componentsDir, 'ThemingNote.astro'),
  UsageSnippet: join(componentsDir, 'UsageSnippet.astro'),
  CopyButtonIsland: join(componentsDir, 'islands', 'CopyButton.astro'),
  CopyButtonScript: join(repoRoot, 'apps', 'docs', 'src', 'scripts', 'copy-button.ts'),
} as const;

const components = registryItems.filter((item) => item.type === 'registry:component');

const HEX_LITERAL = /#[0-9a-fA-F]{3,8}/;

/** Read a component source, failing loudly (with its path) when absent. */
function readSource(name: keyof typeof SOURCES): string {
  const path = SOURCES[name];
  expect(existsSync(path), `${name} exists at ${path}`).toBe(true);
  return readFileSync(path, 'utf8');
}

/** Slice one CSS rule (selector up to its closing brace) out of a source. */
function cssRule(source: string, selector: string): string {
  const start = source.indexOf(selector);
  expect(start, `rule ${selector} present`).toBeGreaterThanOrEqual(0);
  const end = source.indexOf('}', start);
  return source.slice(start, end + 1);
}

function count(source: string, pattern: RegExp): number {
  return [...source.matchAll(pattern)].length;
}

it('REF-003-code-block-verbatim-island-composition: one CopyButton with command={code}, counted token declarations, zero normalization', () => {
  // RED at task start: CodeBlock.astro does not exist yet.
  const source = readSource('CodeBlock');
  const island = readSource('CopyButtonIsland');

  // TC-1 — the single island composition over the real island seam.
  expect(
    count(source, /import CopyButton from '\.\/islands\/CopyButton\.astro'/g),
    'exactly 1 CopyButton import',
  ).toBe(1);
  expect(
    count(source, /<CopyButton command=\{code\}/g),
    'exactly 1 <CopyButton command={code}> composition',
  ).toBe(1);
  expect(
    count(source, /background:\s*var\(--code-background\)/g),
    'exactly 1 background: var(--code-background)',
  ).toBe(1);
  expect(
    count(source, /color:\s*var\(--code-foreground\)/g),
    'exactly 1 color: var(--code-foreground)',
  ).toBe(1);
  const commandRule = cssRule(source, ':global(.copy-button__command)');
  expect(count(commandRule, /white-space:\s*pre-wrap/g), '1 pre-wrap on the code surface').toBe(1);
  expect(
    count(commandRule, /font-family:\s*var\(--font-mono\)/g),
    '1 var(--font-mono) on the code surface',
  ).toBe(1);
  console.log(
    `[REF-003 AC-1] declarations: background var(--code-background)=1, color var(--code-foreground)=1, pre-wrap=1, font-mono=1`,
  );

  // The composed seam is real: the island renders the command as its <code>
  // child (the surface the script copies) and binds the label to aria-label.
  expect(island, 'island renders the command as its code child').toMatch(
    /<code class="copy-button__command">\{command\}<\/code>/,
  );
  expect(island, 'island binds the label to aria-label').toMatch(/aria-label=\{label\}/);

  // TC-2 — zero-JS, token-only, zero normalization on the code prop.
  expect(source.match(HEX_LITERAL), 'CodeBlock carries no hex color literal').toBeNull();
  expect(source, 'CodeBlock ships no script tag').not.toContain('<script');
  expect(source, 'CodeBlock defines no custom element').not.toContain('customElements.define');
  for (const forbidden of ['.trim(', '.replace(', '.normalize(', 'dedent(', 'set:html']) {
    expect(source, `no ${forbidden} normalization`).not.toContain(forbidden);
  }
});

it('REF-003-code-block-untruncated-body: no height limit, no clipping, overflow-wrap anywhere, multi-line dataset grounding', () => {
  // RED at task start: CodeBlock.astro does not exist yet.
  const source = readSource('CodeBlock');

  // TC-3 — the code surface never clamps or clips.
  const commandRule = cssRule(source, ':global(.copy-button__command)');
  expect(commandRule, 'no max-height on the code surface').not.toContain('max-height');
  expect(commandRule, 'no fixed height on the code surface').not.toMatch(/(?:^|[^-])height\s*:/);
  expect(source, 'no line-clamp').not.toContain('-webkit-line-clamp');
  expect(source, 'no ellipsis').not.toContain('text-overflow');
  expect(source, 'no overflow: hidden').not.toMatch(/overflow:\s*hidden/);
  expect(
    count(commandRule, /overflow-wrap:\s*anywhere/g),
    'exactly 1 overflow-wrap: anywhere on the code surface',
  ).toBe(1);

  // TC-4 — no collapse affordance; the real dataset's newlines survive.
  expect(source, 'no details collapse').not.toContain('<details');
  expect(source, 'no summary collapse').not.toContain('<summary');
  const multiLine = components.filter((item) => item.usageSnippet.includes('\n'));
  expect(components.length, 'the real component dataset is 39 items').toBe(39);
  expect(multiLine.length, '38/39 usage snippets are multi-line').toBe(38);
  console.log(
    `[REF-003 AC-2] dataset: ${multiLine.length}/${components.length} multi-line usage snippets; declarations: max-height=0, overflow-wrap anywhere=1`,
  );
});

it('REF-003-code-block-copy-affordance: always-visible trigger, 44px touch target, label plumbing, byte-identical island pair', () => {
  // RED at task start: CodeBlock.astro does not exist yet.
  const source = readSource('CodeBlock');

  // TC-5 — no hover gating; the 'Copy code' default flows to the island's
  // aria-label prop.
  expect(source, 'no opacity: 0 reveal').not.toMatch(/opacity:\s*0/);
  expect(source, 'no visibility: hidden reveal').not.toMatch(/visibility:\s*hidden/);
  expect(source, 'no :hover reveal rules').not.toContain(':hover');
  expect(count(source, /label = 'Copy code'/g), "exactly 1 label default 'Copy code'").toBe(1);
  expect(source, 'the label default flows to the CopyButton label (aria-label) prop').toMatch(
    /<CopyButton command=\{code\} label=\{label\}/,
  );

  // TC-6 — exactly one trigger override with the 44px touch target, no
  // outline suppression, and the island pair byte-identical to task start.
  const triggerRule = cssRule(source, ':global(.copy-button__trigger)');
  expect(count(triggerRule, /min-height:\s*44px/g), 'exactly 1 min-height: 44px override').toBe(1);
  expect(triggerRule, 'no outline suppression on the trigger').not.toMatch(/outline/);
  console.log('[REF-003 AC-3] declarations: min-height 44px=1, opacity:0=0, visibility:hidden=0');

  const islandBaseline = execSync(
    'git show HEAD:apps/docs/src/components/islands/CopyButton.astro',
    {
      cwd: repoRoot,
    },
  );
  const scriptBaseline = execSync('git show HEAD:apps/docs/src/scripts/copy-button.ts', {
    cwd: repoRoot,
  });
  expect(
    readFileSync(SOURCES.CopyButtonIsland),
    'islands/CopyButton.astro is byte-identical to task start',
  ).toEqual(islandBaseline);
  expect(
    readFileSync(SOURCES.CopyButtonScript),
    'scripts/copy-button.ts is byte-identical to task start',
  ).toEqual(scriptBaseline);
});

it('REF-003-theming-note-token-chips: one identifier regex, counter-less Chip composition, real-dataset grounding', () => {
  // RED at task start: ThemingNote.astro does not exist yet.
  const source = readSource('ThemingNote');

  // TC-7 — exactly one token-identifier regex literal, composed through Chip.
  const literalDeclarations = [...source.matchAll(/TOKEN_IDENTIFIER\s*=\s*\/([^/\n]+)\/([a-z]*)/g)];
  expect(literalDeclarations.length, 'exactly 1 token-identifier regex literal').toBe(1);
  expect(source, 'no dynamic RegExp construction').not.toContain('new RegExp');
  const [, patternSource, flags] = literalDeclarations[0];
  const identifierPattern = new RegExp(patternSource, flags);
  expect(patternSource, 'the pattern is the hyphenated-lowercase class form').toMatch(/\[a-z\]/);
  expect(patternSource, 'the pattern spans hyphenated runs').toContain('-');
  expect(count(source, /import Chip from '\.\/Chip\.astro'/g), 'exactly 1 Chip import').toBe(1);
  expect(
    count(source, /<Chip value=\{/g),
    'matches composed in the counter-less value-only Chip form',
  ).toBe(1);
  expect(source, 'no counter prop passed to Chip').not.toMatch(/counter=\{/);
  expect(source, 'the note prop is destructured').toMatch(/const \{ note \} = Astro\.props/);

  // Ground the split over the real dataset: 37/39 notes carry >=1 identifier
  // (147 total); every note reconstructs exactly from prose + identifiers.
  let notesWithChips = 0;
  let totalIdentifiers = 0;
  for (const item of components) {
    const identifiers = item.themingNote.match(identifierPattern) ?? [];
    const segments = item.themingNote.split(identifierPattern);
    totalIdentifiers += identifiers.length;
    if (identifiers.length > 0) notesWithChips += 1;
    expect(segments.length, `${item.name}: split segments align with matches`).toBe(
      identifiers.length + 1,
    );
    let rebuilt = '';
    segments.forEach((segment, index) => {
      rebuilt += segment + (identifiers[index] ?? '');
    });
    expect(rebuilt, `${item.name}: note reconstructs from chips + prose`).toBe(item.themingNote);
  }
  expect(notesWithChips, '37/39 notes render >=1 chip').toBe(37);
  expect(totalIdentifiers, 'the 147-identifier dataset').toBe(147);
  for (const chipless of ['conversation', 'suggestion']) {
    const item = components.find((candidate) => candidate.name === chipless);
    if (item === undefined) {
      throw new Error(`${chipless} is missing from the real dataset`);
    }
    expect(
      item.themingNote.match(identifierPattern) ?? [],
      `${chipless} renders 0 chips`,
    ).toHaveLength(0);
  }
  console.log(
    `[REF-003 AC-4] dataset: ${notesWithChips}/${components.length} notes with chips, ${totalIdentifiers} identifiers; declarations: regex literal=1, Chip import=1`,
  );

  // TC-8 — the note prop is the sole string source; token-only; zero-JS.
  for (const item of components) {
    expect(source, `no hardcoded sentence from ${item.name}'s note`).not.toContain(
      item.themingNote.slice(0, 24),
    );
  }
  expect(source.match(HEX_LITERAL), 'ThemingNote carries no hex color literal').toBeNull();
  expect(source, 'ThemingNote ships no script tag').not.toContain('<script');
  expect(source, 'ThemingNote defines no custom element').not.toContain('customElements.define');
});

it('REF-003-usage-snippet-verbatim: required snippet prop, single verbatim CodeBlock passthrough, zero fabrication', () => {
  // RED at task start: UsageSnippet.astro does not exist yet.
  const source = readSource('UsageSnippet');

  // TC-9 — one required prop, one passthrough composition.
  expect(source, 'snippet prop is declared as string').toMatch(/snippet:\s*string/);
  expect(source, 'snippet is destructured without a default').toMatch(
    /const \{ snippet \} = Astro\.props/,
  );
  expect(source, 'no default assigned to snippet').not.toMatch(/snippet\s*=\s*['"`]/);
  expect(
    count(source, /<CodeBlock code=\{snippet\}/g),
    'exactly 1 <CodeBlock code={snippet}> composition',
  ).toBe(1);

  // TC-10 — zero canned fallbacks, zero substitution branches, zero
  // normalization; the real dataset carries 39/39 non-empty snippets.
  expect(source, 'no canned arrow-function snippet strings').not.toMatch(/\(\)\s*=>/);
  expect(source, 'no conditional substitution on snippet').not.toMatch(/snippet\s*(\?|\?\?|\|\|)/);
  for (const forbidden of ['.trim(', '.replace(', '.normalize(', 'dedent(', 'set:html']) {
    expect(source, `no ${forbidden} normalization`).not.toContain(forbidden);
  }
  expect(
    components.filter((item) => item.usageSnippet.length > 0).length,
    '39/39 real usage snippets are non-empty',
  ).toBe(39);
  expect(source.match(HEX_LITERAL), 'UsageSnippet carries no hex color literal').toBeNull();
  expect(source, 'UsageSnippet ships no script tag').not.toContain('<script');
  expect(source, 'UsageSnippet defines no custom element').not.toContain('customElements.define');
  console.log(
    `[REF-003 AC-5] dataset: 39/${components.length} non-empty usage snippets; composition: CodeBlock passthrough=1, defaults=0`,
  );
});
