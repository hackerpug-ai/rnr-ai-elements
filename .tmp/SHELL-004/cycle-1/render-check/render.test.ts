import { experimental_AstroContainer as AstroContainer } from '../../../../apps/docs/node_modules/astro/dist/container/index.js';
import { describe, expect, it } from 'vitest';
import InstallCommand from '../../../../apps/docs/src/components/InstallCommand.astro';
import TabGroup from '../../../../apps/docs/src/components/islands/TabGroup.astro';

const PANELS = [
  { engine: 'nativewind', label: 'nativewind' },
  { engine: 'uniwind', label: 'uniwind' },
];

describe('SHELL-004 rendered DOM (real container render)', () => {
  it('TabGroup serves the WAI-ARIA tabs DOM: slotted panels resolve, nativewind visible, uniwind hidden', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(TabGroup, {
      props: { panels: PANELS },
      slots: { nativewind: '<code id="nw-slot">NW</code>', uniwind: '<code id="uw-slot">UW</code>' },
    });

    expect(html).toContain('storage-key="rnr-engine"');
    expect(html).toContain('role="tablist"');
    expect((html.match(/role="tab"/g) ?? []).length).toBe(2);
    expect((html.match(/role="tabpanel"/g) ?? []).length).toBe(2);
    expect(html).toContain('data-engine="nativewind"');
    expect(html).toContain('data-engine="uniwind"');
    // Source order: nativewind tab, then uniwind tab; nativewind panel, then uniwind.
    expect(html.indexOf('tab-nativewind')).toBeLessThan(html.indexOf('tab-uniwind'));
    expect(html.indexOf('panel-nativewind')).toBeLessThan(html.indexOf('panel-uniwind'));
    // Roving tabindex + selection on the served default (nativewind).
    expect(html).toContain('aria-selected="true"');
    expect(html).toContain('aria-selected="false"');
    expect(html).toContain('tabindex="0"');
    expect(html).toContain('tabindex="-1"');
    // Dynamic named slots resolve — panel content is really slotted.
    expect(html).toContain('>NW</code>');
    expect(html).toContain('>UW</code>');
    // Visibility is the hidden attribute ONLY: nativewind shown, uniwind hidden.
    expect(html).toContain('<code id="nw-slot"');
    expect(html).toMatch(/panel-uniwind[^>]*\shidden/);
    expect(html).not.toContain('hidden="false"');
    expect(html).not.toContain('max-height');
  });

  it('InstallCommand renders both absolute-URL commands through two CopyButtons, nativewind first', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(InstallCommand, {
      props: { item: 'conversation' },
    });

    expect(html).toContain(
      'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json',
    );
    expect(html).toContain(
      'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/uniwind/conversation.json',
    );
    expect((html.match(/<rnr-copy-button/g) ?? []).length).toBe(2);
    expect(html.indexOf('nativewind/conversation.json')).toBeLessThan(
      html.indexOf('uniwind/conversation.json'),
    );
    // The copy source is the displayed panel text (code child carries the command).
    expect((html.match(/<code class="copy-button__command"[^>]*>/g) ?? []).length).toBe(2);
  });
});
