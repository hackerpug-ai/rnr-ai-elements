import { describe, expect, it } from 'vitest';
import { normalizePreviewUrl } from '../packages/registry/src/components/ai/web-preview.logic.ts';

/**
 * Pure logic only — the URL commit gate (see agent-status.test.ts's header for why
 * rendering itself cannot live in this tier).
 *
 * This is the data half of the UC-CODE-03 security scenario ("WebView is not a
 * sandboxed iframe"): the web original commits the raw input value into the iframe's
 * src and lets the BROWSER be the guard; a native webview has no such chaperone, so
 * everything here stands between the keyboard and `source={{uri}}`. Every refusal
 * below must be an empty string — never a guess, never a throw — because the body
 * renders '' as its empty placeholder and would NAVIGATE to any wrong guess.
 */

describe('normalizePreviewUrl (the commit gate) — empties', () => {
  it('empty, whitespace, null, undefined are all the empty commit', () => {
    expect(normalizePreviewUrl('')).toBe('');
    expect(normalizePreviewUrl('   ')).toBe('');
    expect(normalizePreviewUrl(null)).toBe('');
    expect(normalizePreviewUrl(undefined)).toBe('');
  });
});

describe('normalizePreviewUrl — scheme-less drafts take the address-bar contract', () => {
  it('a bare domain gains https and canonicalizes', () => {
    expect(normalizePreviewUrl('example.com')).toBe('https://example.com/');
  });

  it('path and query ride along', () => {
    expect(normalizePreviewUrl('example.com/docs?a=1')).toBe('https://example.com/docs?a=1');
  });

  it('a domain with a port is host:port, not an unknown scheme', () => {
    // This is why the scheme test is a KNOWN list, not "has a colon": example.com:8443
    // must become a navigable preview, not a refusal.
    expect(normalizePreviewUrl('example.com:8443')).toBe('https://example.com:8443/');
  });

  it('surrounding whitespace is trimmed before anything else', () => {
    expect(normalizePreviewUrl('  https://example.com  ')).toBe('https://example.com/');
  });
});

describe('normalizePreviewUrl — loopback hosts gain http, not https', () => {
  it('localhost with and without port and path', () => {
    expect(normalizePreviewUrl('localhost')).toBe('http://localhost/');
    expect(normalizePreviewUrl('localhost:3000')).toBe('http://localhost:3000/');
    expect(normalizePreviewUrl('localhost:3000/app')).toBe('http://localhost:3000/app');
  });

  it('the numeric loopback too', () => {
    expect(normalizePreviewUrl('127.0.0.1:8080')).toBe('http://127.0.0.1:8080/');
  });

  it('case-insensitively, and the href lowercases the host', () => {
    expect(normalizePreviewUrl('LOCALHOST:3000')).toBe('http://localhost:3000/');
  });
});

describe('normalizePreviewUrl — full URLs canonicalize but never mutate meaning', () => {
  it('scheme and host lowercase, path preserved', () => {
    expect(normalizePreviewUrl('HTTPS://EXAMPLE.COM/Path')).toBe('https://example.com/Path');
  });

  it('http stays http', () => {
    expect(normalizePreviewUrl('http://example.com')).toBe('http://example.com/');
  });

  it('an explicit port survives', () => {
    expect(normalizePreviewUrl('https://192.168.1.10:8080/app')).toBe(
      'https://192.168.1.10:8080/app',
    );
  });
});

describe('normalizePreviewUrl — the hostile drafts are REFUSED, not guessed', () => {
  it('script URLs die here, before the webview layer', () => {
    expect(normalizePreviewUrl('javascript:alert(1)')).toBe('');
  });

  it('including in any case the user can type', () => {
    expect(normalizePreviewUrl('JAVASCRIPT:alert(1)')).toBe('');
    expect(normalizePreviewUrl('JaVaScRiPt:alert(1)')).toBe('');
  });

  it('data, file, about, ftp, and blob are the same refusal', () => {
    expect(normalizePreviewUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(normalizePreviewUrl('file:///etc/passwd')).toBe('');
    expect(normalizePreviewUrl('about:blank')).toBe('');
    expect(normalizePreviewUrl('ftp://example.com')).toBe('');
    expect(normalizePreviewUrl('blob:https://example.com/uuid')).toBe('');
  });

  it('a draft that cannot parse at all is refused, never thrown', () => {
    // A space in the host makes new URL throw — the exact failure class the web
    // original exposes bare.
    expect(normalizePreviewUrl('https://exa mple.com')).toBe('');
  });
});

describe('normalizePreviewUrl — the declared edges, on the record', () => {
  it('an unknown custom scheme becomes an inert https navigation, not a refusal', () => {
    // myapp://deep/link is not a known scheme, so the https-default treats it as a
    // host — the result navigates to a nonexistent https host and the FAILURE PANEL
    // reports it. No scheme can execute through this path; the allowlist sees https.
    expect(normalizePreviewUrl('myapp://deep/link')).toBe('https://myapp//deep/link');
  });

  it('a mailto-shaped draft lands on the address host, inertly', () => {
    // Not a known scheme → https default → the parser reads bar.com as the host. The
    // mail handler is not invoked (it could not be from a webview anyway); the
    // navigation is an ordinary https fetch that the failure panel owns.
    expect(normalizePreviewUrl('mailto:foo@bar.com')).toBe('https://mailto:foo@bar.com/');
  });
});
