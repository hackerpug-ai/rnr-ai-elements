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
