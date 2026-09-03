/**
 * InlineCitation — pure logic. Zero react-native imports, so the Vitest tier owns it.
 *
 * The chip label is the web original's InlineCitationCardTrigger composition, verbatim:
 * the FIRST source's hostname, then " +N" when more than one source backs the claim
 * (`{hostname}{' '}{sources.length > 1 && `+${length - 1}`}`), and the string
 * "unknown" when the list is empty. The one behavioral fix on the port: the web calls
 * `new URL(sources[0]).hostname` bare, which THROWS on a malformed first entry and
 * takes the whole transcript down. Here a malformed entry degrades through
 * lib/url's no-throw hostnameOf instead — a bad citation is a rendering problem, never
 * a crash.
 */

import { hostnameOf } from '@/registry/{engine}/lib/url';

/**
 * The chip's text. Examples: `example.com`, `example.com +2` (three sources),
 * `unknown` (none), `unknown +2` (a malformed first entry among three — no-throw,
 * unlike the web original). A missing list (a part still streaming in) is `unknown`.
 */
export function citationBadgeLabel(urls: readonly string[] | undefined | null): string {
  const first = urls?.[0];
  if (first === undefined) return 'unknown';
  const hostname = hostnameOf(first);
  const rest = (urls?.length ?? 0) - 1;
  return rest > 0 ? `${hostname} +${rest}` : hostname;
}
