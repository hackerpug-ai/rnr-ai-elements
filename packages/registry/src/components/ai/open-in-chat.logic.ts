/**
 * OpenIn — pure logic. Zero react-native imports, so the Vitest tier owns it (see the
 * header of sources.logic.ts for why component files themselves cannot load under
 * Node).
 *
 * The provider table is the web original's, template-for-template — the PRD verdict
 * ("same buttons and same targets") makes the URL the contract: each template below is
 * byte-what-upstream-produces, `URLSearchParams` encoding and all (a space encodes as
 * `+`, exactly as the web original ships it). The cursor template goes through
 * `new URL(...)` for the same reason upstream's does.
 */

export const OPEN_IN_PROVIDERS = ['chatgpt', 'claude', 'cursor', 'scira', 't3', 'v0'] as const;

export type OpenInProvider = (typeof OPEN_IN_PROVIDERS)[number];

/** The web original's item titles, byte-verbatim. */
export const OPEN_IN_PROVIDER_TITLES: Record<OpenInProvider, string> = {
  chatgpt: 'Open in ChatGPT',
  claude: 'Open in Claude',
  cursor: 'Open in Cursor',
  scira: 'Open in Scira',
  t3: 'Open in T3 Chat',
  v0: 'Open in v0',
};

/**
 * The deep link a target opens with — the web anchor's href, produced by the same
 * templates. Always http(s) by construction; lib/url's `isSafeOpenUrl` still guards
 * the hop, because the allowlist exists for the day a caller composes a custom
 * target whose URL did not come from this table.
 */
export function openInProviderUrl(provider: OpenInProvider, query: string): string {
  switch (provider) {
    case 'chatgpt':
      return `https://chatgpt.com/?${new URLSearchParams({ hints: 'search', prompt: query })}`;
    case 'claude':
      return `https://claude.ai/new?${new URLSearchParams({ q: query })}`;
    case 'cursor': {
      const url = new URL('https://cursor.com/link/prompt');
      url.searchParams.set('text', query);
      return url.toString();
    }
    case 'scira':
      return `https://scira.ai/?${new URLSearchParams({ q: query })}`;
    case 't3':
      return `https://t3.chat/new?${new URLSearchParams({ q: query })}`;
    case 'v0':
      return `https://v0.app?${new URLSearchParams({ q: query })}`;
  }
}
