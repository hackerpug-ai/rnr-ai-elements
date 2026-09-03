import { describe, expect, it } from 'vitest';
import { citationBadgeLabel } from '../packages/registry/src/components/ai/inline-citation.logic.ts';

/**
 * Pure logic only — the citation chip's label (see agent-status.test.ts's header for
 * why rendering itself cannot live in this tier).
 *
 * The composition under test is the web original's InlineCitationCardTrigger, verbatim:
 * the FIRST source's hostname, then " +N" when more than one source backs the claim,
 * and "unknown" when the list is empty. The behavioral delta is the no-throw rule: the
 * web calls `new URL(sources[0]).hostname` bare, which THROWS on a malformed first
 * entry — every malformed case below must degrade, never crash.
 */

describe('citationBadgeLabel (the chip text)', () => {
  it('a single source renders its hostname, no count', () => {
    expect(citationBadgeLabel(['https://expo.dev/changelog/sdk-57'])).toBe('expo.dev');
  });

  it('more sources append the web original +N clause', () => {
    expect(
      citationBadgeLabel([
        'https://reactnativereusables.com/docs',
        'https://docs.uniwind.dev/quickstart',
      ]),
    ).toBe('reactnativereusables.com +1');
    expect(
      citationBadgeLabel([
        'https://reactnativereusables.com/docs',
        'https://docs.uniwind.dev/quickstart',
        'https://expo.dev/changelog/sdk-57',
      ]),
    ).toBe('reactnativereusables.com +2');
  });

  it('an empty list renders the web unknown fallback', () => {
    expect(citationBadgeLabel([])).toBe('unknown');
  });

  it('a malformed FIRST source degrades to unknown — the web crashes here instead', () => {
    expect(citationBadgeLabel(['not a url'])).toBe('unknown');
  });

  it('a malformed first source still counts the rest — no-throw, unlike the web', () => {
    expect(citationBadgeLabel(['example.com/path', 'https://a.dev', 'https://b.dev'])).toBe(
      'unknown +2',
    );
  });

  it('only the FIRST source drives the hostname; the rest only drive +N', () => {
    expect(
      citationBadgeLabel(['https://first.dev/x', 'https://second.dev/y', 'totally-invalid']),
    ).toBe('first.dev +2');
  });

  it('an undefined list behaves like an empty one', () => {
    // The caller may not have the sources yet while the part streams in.
    expect(citationBadgeLabel(undefined)).toBe('unknown');
    expect(citationBadgeLabel(null)).toBe('unknown');
  });
});
