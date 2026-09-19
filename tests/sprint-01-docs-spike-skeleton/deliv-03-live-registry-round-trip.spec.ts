import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { PREVIEW_URL } from '../harness/docs-preview';

/**
 * FUSE-11 AC-2 / TC-2 / TC-3 — FLOW-DELIV-03-live-registry-round-trip: the
 * registry JSON the docs site ADVERTISES (install commands pointing at
 * rnraielements.com) is the registry JSON the same origin actually SERVES, and
 * it is byte-identical to the file the real chain just generated.
 *
 * The proof is the sha256 of the served response BODY against the sha256 of
 * apps/docs/public/r/nativewind/conversation.json read from disk — comparing a
 * canned fixture, or only asserting JSON.parse succeeds, cannot pass: a preview
 * serving a stale conversation.json fails the byte comparison. The served body
 * must also BE real registry JSON (name/type/files/registryDependencies).
 *
 * Zero-JS observables only (pure HTTP + filesystem), so this test stays
 * UNGUARDED and the chromium-nojs project proves the round trip rather than
 * skipping it.
 */
const SERVED_URL = `${PREVIEW_URL}/r/nativewind/conversation.json`;
const GENERATED_FILE = 'apps/docs/public/r/nativewind/conversation.json';

/**
 * Read the generated artifact, bridging a short window if it is transiently
 * absent: the lane's deliv-03 spec rmSyncs generated dirs wholesale mid-run and
 * its prebuild leg regenerates them ~20-30s later, so a read landing in that
 * window must retry, not ENOENT the whole file (same pattern as ledger.spec.ts
 * / component-page.spec.ts). Retry is ENOENT-only and bounded; a genuinely
 * missing artifact still fails after the deadline.
 */
function readGeneratedFile(relative: string): Buffer {
  const deadline = Date.now() + 60_000;
  for (;;) {
    try {
      return readFileSync(join(process.cwd(), relative));
    } catch (error) {
      const retryable = (error as NodeJS.ErrnoException).code === 'ENOENT';
      if (!retryable || Date.now() > deadline) throw error;
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
    }
  }
}

const sha256 = (bytes: Buffer): string => createHash('sha256').update(bytes).digest('hex');

test('FLOW-DELIV-03-live-registry-round-trip TC-2 TC-3 — served conversation.json is real registry JSON byte-identical to the generated file', async ({
  request,
}) => {
  const response = await request.get(SERVED_URL);
  expect(response.status(), 'served conversation.json must return 200').toBe(200);
  expect(response.headers()['content-type'] ?? '', 'served content-type').toContain(
    'application/json',
  );

  // TC-2 — the served body IS a real registry item, not an HTML error page that
  // happens to parse: identity, type, and the structural fields a consumer needs.
  const served = (await response.json()) as {
    name: string;
    type: string;
    files: unknown[];
    registryDependencies: unknown[];
  };
  expect(served.name).toBe('conversation');
  expect(served.type).toBe('registry:component');
  expect(served.files.length, 'files must be present and non-empty').toBeGreaterThan(0);
  expect(
    served.registryDependencies.length,
    'registryDependencies must be present and non-empty',
  ).toBeGreaterThan(0);

  // TC-3 — byte round trip: sha256 of the response body equals sha256 of the
  // freshly generated file (same-deploy proof: docs and registry JSON from ONE
  // origin, built by ONE chain run).
  const servedSha = sha256(await response.body());
  const generatedSha = sha256(readGeneratedFile(GENERATED_FILE));
  expect(servedSha, 'sha256(served bytes) must equal sha256(generated file bytes)').toBe(
    generatedSha,
  );
});
