import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

/**
 * ORI-DEP-002 — guarded remote-only Cloudflare lane (charter boundary 4).
 *
 * It selects only the *.remote.spec.ts files, never starts a local webServer,
 * runs each test once (retries: 0), and keeps certificate validation strict.
 * The test origin is derived from THIS RUN's receipt
 * (evidence/ORI-DEP-002/release.json): the recorded Cloudflare version origin
 * and https://rnraielements.com are the only eligible origins — localhost,
 * example.com, and any other host are rejected before any network activity.
 * A missing or empty receipt is a hard config-load failure (fail closed), so
 * a bare `playwright test --config …` can never silently fall back to the
 * apex or a preview host.
 */

export const RECEIPT_PATH = 'tests/sprint-05-orient-search/evidence/ORI-DEP-002/release.json';
const APEX_ORIGIN = 'https://rnraielements.com';

export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

export interface OriginBinding {
  eligible: string[];
  selected: string;
}

interface DepReceipt {
  verified_surface: { version_id?: string; origin?: string };
  eligible_origins?: string[];
}

function isEligibleHost(origin: string): boolean {
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }
  if (url.protocol !== 'https:' || url.pathname !== '/' || url.search !== '') return false;
  // The charter's two allowed shapes: the literal apex, or a Cloudflare
  // workers.dev version/preview host. Everything else is out of contract.
  return url.origin === APEX_ORIGIN || url.hostname.endsWith('.workers.dev');
}

/**
 * The one origin-guard seam (AC-1 case 2): pure validation, no I/O beyond the
 * receipt argument given to it, so the rejection cases can be exercised
 * before any network activity. Throws on every untrusted input.
 */
export function resolveOriginBinding(input: {
  receipt: DepReceipt | null;
  override?: string;
}): OriginBinding {
  const { receipt, override } = input;
  if (!receipt || typeof receipt !== 'object') {
    throw new Error(
      `[ORI-DEP-002] configuration rejected: missing run receipt (${RECEIPT_PATH}). ` +
        'This lane runs only against this run’s recorded Cloudflare surface; it never falls back to localhost or the apex.',
    );
  }
  const versionOrigin = receipt.verified_surface?.origin;
  const versionId = receipt.verified_surface?.version_id;
  if (typeof versionOrigin !== 'string' || versionOrigin.length === 0 || !versionId) {
    throw new Error(
      '[ORI-DEP-002] configuration rejected: receipt records no verified version origin/id',
    );
  }
  const eligible = [...new Set([versionOrigin, APEX_ORIGIN])];
  for (const origin of eligible) {
    if (!isEligibleHost(origin)) {
      throw new Error(
        `[ORI-DEP-002] configuration rejected: ineligible origin ${origin} (only the recorded Cloudflare version origin or ${APEX_ORIGIN})`,
      );
    }
  }
  const selected = override ?? versionOrigin;
  if (!eligible.includes(selected)) {
    throw new Error(
      `[ORI-DEP-002] configuration rejected: requested origin ${selected} is not the recorded version origin (${eligible.join(', ')})`,
    );
  }
  return { eligible, selected };
}

export function loadRunReceipt(): DepReceipt {
  let raw: string;
  try {
    raw = readFileSync(join(REPO_ROOT, RECEIPT_PATH), 'utf8');
  } catch (error) {
    throw new Error(
      `[ORI-DEP-002] configuration rejected: run receipt ${RECEIPT_PATH} is unreadable (${(error as Error).message})`,
    );
  }
  return JSON.parse(raw) as DepReceipt;
}

const binding = resolveOriginBinding({ receipt: loadRunReceipt() });

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.remote.spec.ts',
  retries: 0,
  workers: 1,
  use: {
    baseURL: binding.selected,
    ignoreHTTPSErrors: false,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'] } },
  ],
});
