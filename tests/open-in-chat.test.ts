import { describe, expect, it } from 'vitest';
import {
  OPEN_IN_PROVIDER_TITLES,
  OPEN_IN_PROVIDERS,
  openInProviderUrl,
} from '../packages/registry/src/components/ai/open-in-chat.logic.ts';

/**
 * Pure logic only — the provider table (see agent-status.test.ts's header for why
 * rendering itself cannot live in this tier). The URL is the contract: the PRD verdict
 * says "same targets", so every expectation below is the byte-for-byte output the web
 * original's own templates produce, URLSearchParams encoding and all.
 */

describe('openInProviderUrl (the deep link per target)', () => {
  it('builds the ChatGPT link with hints=search — upstream verbatim', () => {
    expect(openInProviderUrl('chatgpt', 'Explain RN portals')).toBe(
      'https://chatgpt.com/?hints=search&prompt=Explain+RN+portals',
    );
  });

  it('builds the Claude, Scira, T3 and v0 links over the q parameter', () => {
    expect(openInProviderUrl('claude', 'hello')).toBe('https://claude.ai/new?q=hello');
    expect(openInProviderUrl('scira', 'hello')).toBe('https://scira.ai/?q=hello');
    expect(openInProviderUrl('t3', 'hello')).toBe('https://t3.chat/new?q=hello');
    expect(openInProviderUrl('v0', 'hello')).toBe('https://v0.app?q=hello');
  });

  it('builds the Cursor link over text, via URL exactly as upstream does', () => {
    expect(openInProviderUrl('cursor', 'hello')).toBe('https://cursor.com/link/prompt?text=hello');
  });

  it('encodes a space as + and special characters as the web original would', () => {
    // URLSearchParams: space → '+', '&' and '=' percent-escaped, exactly upstream.
    expect(openInProviderUrl('claude', 'what is rnr & why?')).toBe(
      'https://claude.ai/new?q=what+is+rnr+%26+why%3F',
    );
    expect(openInProviderUrl('cursor', 'a b')).toBe('https://cursor.com/link/prompt?text=a+b');
  });

  it('produces only http(s) URLs — the allowlist guard never has to refuse these', () => {
    for (const provider of OPEN_IN_PROVIDERS) {
      expect(openInProviderUrl(provider, 'x').startsWith('https://')).toBe(true);
    }
  });

  it('handles an empty query without throwing', () => {
    expect(openInProviderUrl('claude', '')).toBe('https://claude.ai/new?q=');
  });
});

describe('the provider table (the six targets)', () => {
  it('is exhaustive — every provider has a title and every title has a provider', () => {
    expect(OPEN_IN_PROVIDERS).toHaveLength(6);
    expect([...OPEN_IN_PROVIDERS].sort()).toEqual(
      ['chatgpt', 'claude', 'cursor', 'scira', 't3', 'v0'].sort(),
    );
    expect(Object.keys(OPEN_IN_PROVIDER_TITLES).sort()).toEqual([...OPEN_IN_PROVIDERS].sort());
  });

  it('carries the web original titles byte-verbatim', () => {
    expect(OPEN_IN_PROVIDER_TITLES).toEqual({
      chatgpt: 'Open in ChatGPT',
      claude: 'Open in Claude',
      cursor: 'Open in Cursor',
      scira: 'Open in Scira',
      t3: 'Open in T3 Chat',
      v0: 'Open in v0',
    });
  });
});
