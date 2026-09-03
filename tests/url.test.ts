import { describe, expect, it } from 'vitest';
import { hostnameOf, isSafeOpenUrl } from '../packages/registry/src/lib/url.ts';

/**
 * Pure logic only — the URL helpers every citation surface leans on (see
 * agent-status.test.ts's header for why rendering itself cannot live in this tier).
 *
 * NO-THROW IS THE CONTRACT UNDER TEST. The web original calls
 * `new URL(sources[0]).hostname` bare, which throws on a malformed entry and takes the
 * transcript down with it. Every case below where the web would crash must come back as
 * a fallback instead.
 */

describe('hostnameOf (the domain line and the citation chip label)', () => {
  it('extracts the hostname from an https URL', () => {
    expect(hostnameOf('https://reactnativereusables.com/docs/installation')).toBe(
      'reactnativereusables.com',
    );
  });

  it('drops the port, query, and hash — the host only', () => {
    expect(hostnameOf('https://example.dev:8080/a/b?q=1#top')).toBe('example.dev');
  });

  it('keeps subdomains — they are the host', () => {
    expect(hostnameOf('https://docs.uniwind.dev/quickstart')).toBe('docs.uniwind.dev');
  });

  it('strips user credentials from the URL', () => {
    expect(hostnameOf('https://user:secret@example.com/page')).toBe('example.com');
  });

  it('lowercases the host — URL semantics, so two spellings compare equal', () => {
    expect(hostnameOf('HTTPS://EXAMPLE.COM/Page')).toBe('example.com');
  });

  it('trims surrounding whitespace before parsing', () => {
    expect(hostnameOf('  https://example.com  ')).toBe('example.com');
  });

  it('preserves IPv4 and localhost hosts', () => {
    expect(hostnameOf('http://127.0.0.1:8081')).toBe('127.0.0.1');
    expect(hostnameOf('http://localhost:3000/x')).toBe('localhost');
  });

  it('a schemeless "example.com/path" is unparseable — fallback, not a crash', () => {
    expect(hostnameOf('example.com/path')).toBe('unknown');
  });

  it('an empty string and a missing URL fall back', () => {
    expect(hostnameOf('')).toBe('unknown');
    expect(hostnameOf(undefined)).toBe('unknown');
    expect(hostnameOf(null)).toBe('unknown');
  });

  it('a bare "https://" parses to an empty hostname — still the fallback', () => {
    expect(hostnameOf('https://')).toBe('unknown');
  });

  it('the fallback is caller-suppliable for non-transcript contexts', () => {
    expect(hostnameOf('not a url', '—')).toBe('—');
  });
});

describe('isSafeOpenUrl (the scheme allowlist behind the platform link handler)', () => {
  it('allows http and https — the whole point', () => {
    expect(isSafeOpenUrl('https://reactnativereusables.com')).toBe(true);
    expect(isSafeOpenUrl('http://localhost:3000')).toBe(true);
  });

  it('allows an uppercase or padded scheme — the parse normalizes', () => {
    expect(isSafeOpenUrl('HTTPS://EXAMPLE.COM')).toBe(true);
    expect(isSafeOpenUrl('  https://example.com  ')).toBe(true);
  });

  it('refuses every scripting and local scheme', () => {
    expect(isSafeOpenUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeOpenUrl('data:text/html,hi')).toBe(false);
    expect(isSafeOpenUrl('file:///etc/passwd')).toBe(false);
    expect(isSafeOpenUrl('ws://example.com')).toBe(false);
    expect(isSafeOpenUrl('ftp://example.com/pub')).toBe(false);
  });

  it('refuses a lookalike scheme built into the path', () => {
    expect(isSafeOpenUrl('https://example.com/redirect?to=javascript:alert(1)')).toBe(true);
    expect(isSafeOpenUrl('not-javascript:alert(1)')).toBe(false);
  });

  it('refuses empty, missing, and unparseable input without throwing', () => {
    expect(isSafeOpenUrl('')).toBe(false);
    expect(isSafeOpenUrl(undefined)).toBe(false);
    expect(isSafeOpenUrl(null)).toBe(false);
    expect(isSafeOpenUrl('example.com')).toBe(false);
  });
});
