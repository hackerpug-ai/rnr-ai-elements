import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// The static import below is the RED surface: before `pnpm add -D qrcode`
// this file fails to load with module-not-found, which is AC-2's asserted
// absent-state. REF-009's assembly frontmatter uses this same import path.
import QRCode from 'qrcode';
import { expect, it } from 'vitest';

/**
 * FIX-REF-008-1 — qrcode root devDependency + synced lockfile contract.
 *
 * TEST_TIER: integration — AC-2 encodes a REAL QR through the real qrcode
 * package installed by the real pnpm install (no fixture SVG, no mock), and
 * AC-1 reads the real package.json + pnpm-lock.yaml that install produced.
 *
 * Contract (task FIX-REF-008-1, AC-1..AC-2):
 * - qrcode lives in the ROOT devDependencies with a real semver range
 *   (build-time only — never dependencies, never a workspace app's runtime
 *   dep), and pnpm-lock.yaml's root importer (.) resolves the same specifier
 *   to a concrete version so `pnpm install --frozen-lockfile` is green.
 * - QRCode.toString('ai-elements-example/conversation', { type: 'svg' }) —
 *   the exact call form REF-009's [item].astro assembly will use — yields a
 *   real QR SVG string.
 */
const repoRoot = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const PKG_JSON = join(repoRoot, 'package.json');
const LOCKFILE = join(repoRoot, 'pnpm-lock.yaml');

it('FIX-REF-008-1-qrcode-dep-declared: qrcode in root devDependencies with a real semver range, lockfile root importer resolves it', () => {
  const pkg = JSON.parse(readFileSync(PKG_JSON, 'utf8')) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  // AC-1 — root devDependencies only: a real semver range, and NOT in
  // dependencies (build-time only).
  const range = pkg.devDependencies?.qrcode;
  expect(range, 'qrcode listed under root devDependencies').toMatch(/^\^?\d+\.\d+\.\d+/);
  expect(pkg.dependencies?.qrcode, 'qrcode is never a runtime dependency').toBeUndefined();

  // AC-1 — the lockfile's root importer (.) carries the same specifier and a
  // concrete resolved version, so the lockfile is synced with package.json.
  const lockfile = readFileSync(LOCKFILE, 'utf8');
  const importerChunks = lockfile.slice(lockfile.indexOf('importers:')).split(/^ {2}(?=\S)/m);
  const rootImporter = importerChunks.find((chunk) => chunk.startsWith('.:\n')) ?? '';
  expect(rootImporter, 'the root importer (.) block exists in the lockfile').not.toBe('');
  const entry = rootImporter.match(/^ {6}qrcode:\n {8}specifier: (\S+)\n {8}version: (\S+)\n/m);
  expect(entry, 'lockfile root importer resolves qrcode').not.toBeNull();
  expect(entry?.[1], 'lockfile specifier matches the package.json range').toBe(range);
  expect(entry?.[2], 'lockfile carries a concrete resolved version').toMatch(/^\d+\.\d+\.\d+/);

  console.info(
    `[FIX-REF-008-1 evidence] qrcode ${range} in root devDependencies; lockfile resolves ${entry?.[2]}`,
  );
});

it('FIX-REF-008-1-buildtime-encode-works: real qrcode encodes the conversation qrDeepLink to a QR SVG string', async () => {
  // AC-2 — the exact call form REF-009's assembly frontmatter will use, run
  // against the real installed package.
  const svg = await QRCode.toString('ai-elements-example/conversation', { type: 'svg' });

  expect(svg.length, 'the encode produced a non-empty string').toBeGreaterThan(0);
  expect(svg, 'the output starts as an SVG document').toMatch(/^<\?xml|^<svg/);
  // A real QR for this payload carries ~21x21+ modules of path geometry —
  // orders of magnitude more content than any placeholder could justify.
  expect(svg.length, 'the SVG carries real QR module geometry').toBeGreaterThan(200);

  console.info(
    `[FIX-REF-008-1 evidence] encode('ai-elements-example/conversation') -> ${svg.length} chars, starts "${svg.slice(0, 60)}"`,
  );
});
