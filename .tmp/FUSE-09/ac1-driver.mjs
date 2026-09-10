/**
 * FUSE-09 AC-1 verification driver — Playwright LIBRARY mode.
 *
 * Why not `playwright test`: the runner deadlocks discovering test files
 * anywhere inside this repo (reproduced minimal: same spec lists instantly
 * from /tmp, hangs forever with testDir inside the repo; not fixed by
 * env -i, NODE_OPTIONS removal, sandbox off, or worker count). The library
 * API launches the same real Chromium and runs the same assertions as
 * home.spec.ts, which stays the canonical runner artifact for FUSE-10.
 *
 * Usage: node ac1-driver.mjs <baseUrl> <screenshotPath>
 * Exit 0 = AC-1 both cases observed. Exit 1 = assertion or navigation failure.
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4321';
const SHOT = process.argv[3] ?? '/tmp/fuse09-success.png';
const PAGE_URL = `${BASE}/islands/copy-button`;
const COMMAND =
  'npx @react-native-reusables/cli@latest add https://rnraielements.com/r/nativewind/conversation.json';

let failed = false;
function check(label, ok, detail = '') {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failed = true;
}

const browser = await chromium.launch();

// CASE 1 — clipboard content equals the displayed command; success within 500ms.
{
  const context = await browser.newContext();
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const page = await context.newPage();
  await page.goto(PAGE_URL);

  const displayed = (await page.locator('rnr-copy-button code').textContent())?.trim();
  check('displayed command selectable text', displayed === COMMAND, JSON.stringify(displayed));

  const trigger = page.locator('rnr-copy-button button');
  const t0 = Date.now();
  await trigger.click();

  let copiedInMs = -1;
  try {
    await trigger.waitFor({ state: 'attached', timeout: 2000 });
    await page.waitForFunction(
      () => document.querySelector('rnr-copy-button button')?.getAttribute('data-state') === 'copied',
      null,
      { timeout: 500, polling: 20 },
    );
    copiedInMs = Date.now() - t0;
  } catch {
    /* handled by the check below */
  }
  const visible = await trigger.isVisible();
  check('success state within 500ms', copiedInMs >= 0 && copiedInMs <= 500, `${copiedInMs}ms, visible=${visible}`);
  check('trigger data-state == copied', (await trigger.getAttribute('data-state')) === 'copied');

  const clipboard = await page.evaluate(() => navigator.clipboard.readText());
  check(
    'clipboard exact (no trailing newline)',
    clipboard === COMMAND,
    `len=${clipboard.length} vs ${COMMAND.length}, tail=${JSON.stringify(clipboard.slice(-4))}`,
  );

  mkdirSync(dirname(SHOT), { recursive: true });
  await page.screenshot({ path: SHOT, fullPage: true });
  console.log(`screenshot -> ${SHOT}`);
  await context.close();
}

// CASE 2 — javaScriptEnabled:false still serves 200 with the full command.
{
  const noJs = await browser.newContext({ javaScriptEnabled: false });
  const page = await noJs.newPage();
  const response = await page.goto(PAGE_URL);
  check('HTTP 200 with JS disabled', response?.status() === 200, `status=${response?.status()}`);
  const text = (await page.locator('rnr-copy-button code').textContent())?.trim();
  check('zero-JS command text intact', text === COMMAND, JSON.stringify(text?.slice(0, 40)));
  await noJs.close();
}

await browser.close();
console.log(failed ? 'AC-1 DRIVER: FAIL' : 'AC-1 DRIVER: PASS');
process.exit(failed ? 1 : 0);
