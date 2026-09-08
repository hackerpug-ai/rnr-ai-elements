import { hostnameOf } from '@/lib/url';

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
