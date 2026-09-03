/**
 * WebPreview — pure logic. Zero react-native imports, so the Vitest tier owns it (see
 * the header of lib/reasoning-lifecycle.ts for why component files themselves cannot
 * load under Node).
 *
 * The URL commit pipeline. The web original commits the raw input value straight into
 * the iframe's src — the BROWSER is the guard there (a scheme-less draft resolves
 * against the page origin, and `javascript:` in a src assignment is dead). A native
 * webview has no such chaperone: whatever reaches `source={{uri}}` is navigated, so
 * the guard has to live here, BEFORE the webview ever sees the string.
 *
 * NO-THROW IS THE CONTRACT (lib/url's rule). A malformed draft is refused, never a
 * crash — and refusal returns '' rather than a best-effort guess, because an empty
 * result renders the body's empty placeholder while a wrong guess would NAVIGATE.
 */

import { isSafeOpenUrl } from '@/registry/{engine}/lib/url';

/**
 * Schemes that are recognized AS schemes. Everything else the user typed —
 * `example.com:8443`, `myhost:3000` — is host:port, not a scheme, so it takes the
 * https-default branch instead of being refused for carrying an unknown protocol.
 * The known list is what a hostile draft can actually ride: javascript:/data:/file:
 * are recognized precisely so the allowlist gate can refuse them below.
 */
const KNOWN_SCHEME = /^(https?|file|javascript|data|blob|about|ftp|ws|wss):/i;

/**
 * Dev-preview hosts. `localhost:3000` looks like a scheme but is host:port, and it is
 * the ONE host a plain-https prefix would break — local previews are http. The
 * loopback forms gain `http://`, everything else gains `https://`.
 */
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?([/?#].*)?$/i;

/**
 * The commit gate: a draft becomes a navigable URL or ''. Rules, in order:
 *  1. empty/whitespace → '' (a real commit of the empty string — the web original
 *     commits it too, and the body renders its empty placeholder);
 *  2. loopback host[:port][:path] → `http://…`;
 *  3. scheme-less input → `https://…` (the browser address-bar contract);
 *  4. anything with a known scheme stands as typed;
 *  5. FINAL GATE — lib/url's http/https allowlist. `javascript:`, `data:`,
 *     `file:`, every other scheme is refused ('') no matter how it got here.
 *
 * Every branch funnels through one canonicalization, so the result is always the URL
 * standard's `href` (scheme and host lowercased, path normalized) and the URL bar
 * shows the form that will actually load. A draft that cannot parse at all — and any
 * unknown custom scheme, which the https-default turns into an inert navigation to a
 * nonexistent host — is the failure panel's job, never a crash.
 */
export function normalizePreviewUrl(raw: string | null | undefined): string {
  if (!raw) return '';
  const trimmed = raw.trim();
  if (!trimmed) return '';

  const candidate = LOCAL_HOST.test(trimmed)
    ? `http://${trimmed}`
    : KNOWN_SCHEME.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
  if (!isSafeOpenUrl(candidate)) return '';
  try {
    return new URL(candidate).href;
  } catch {
    return '';
  }
}
