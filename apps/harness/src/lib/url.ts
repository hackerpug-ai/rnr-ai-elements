/**
 * URL — the one place that turns a source URL into display parts and an open decision.
 * Backs sources (UC-CHAT-05 AC-1: each row shows title AND domain) and inline-citation
 * (the web chip shows the first source's hostname), and guards the Linking.openURL hop
 * (UC-CHAT-05 AC-3) that replaces the web anchor's target="_blank".
 *
 * Zero imports on purpose, same rule as lib/status.ts: this file is imported by pure
 * logic modules and must stay loadable under Vitest, which cannot resolve a
 * react-native module graph.
 *
 * NO-THROW IS THE CONTRACT. The web original calls `new URL(sources[0]).hostname`
 * bare, which throws on a malformed entry and takes the transcript down with it. Every
 * function here degrades to a fallback instead — a bad URL in a streamed source list is
 * a rendering problem, never a crash.
 */

/**
 * The hostname of `url`, or `fallback` when it is missing or unparseable — the web
 * original's `new URL(...).hostname` with the throw replaced by a fallback. Lowercase
 * is URL-standard, so `HTTPS://EXAMPLE.COM` and `https://example.com` compare equal.
 */
export function hostnameOf(url: string | undefined | null, fallback = 'unknown'): string {
  if (!url) return fallback;
  try {
    const { hostname } = new URL(url.trim());
    return hostname || fallback;
  } catch {
    return fallback;
  }
}

const SAFE_OPEN_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * The scheme allowlist for handing a URL to the platform link handler (the
 * data-schema doc's security-review surface). `javascript:`/`data:`/`file:` and every
 * other scheme is refused BEFORE Linking sees it; the web anchor's `rel="noreferrer"`
 * has no RN equivalent, so the allowlist is the whole guard. No-throw by construction.
 */
export function isSafeOpenUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    return SAFE_OPEN_PROTOCOLS.has(new URL(url.trim()).protocol);
  } catch {
    return false;
  }
}
