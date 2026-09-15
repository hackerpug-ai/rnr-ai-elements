/**
 * ORI-RN-003 support — Web session: export each installed consumer to a real static
 * export, serve it, and drive Chromium through Playwright against the actual served
 * bundle. No static receipts, no mocked DOM — the browser scrolls, types and submits
 * through the same accessibility surface the learner's browser would.
 *
 * Web proves parity, never native appearance: the portal/inset/keyboard observations
 * are owned by the native session (native-session.ts) and are NOT claimed here.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join } from 'node:path';

import { type Browser, chromium } from '@playwright/test';
import type { Engine } from './native-session';
import { run as runShell } from './quickstart-consumer';

export type WebExportReceipt = {
  engine: Engine;
  root: string;
  distDir: string;
  exportExit: number;
  exportLog: string;
};

export type WebServeHandle = {
  port: number;
  server: Server;
  url: string;
};

/** The olderSeed literal — the oldest authored turn the browser must reach. */
export const OLDER_SEED = 'Seed turn 01: Plan a weekend walk.';

/* ------------------------------------------------------------ web export -- */

/** Runs the real `expo export --platform web` for a consumer into a scratch dist dir. */
export function exportWeb(engine: Engine, root: string): WebExportReceipt {
  const distDir = join(tmpdir(), `ori-rn-003-${engine}-dist-${Date.now()}`);
  mkdirSync(distDir, { recursive: true });
  const res = runShell(
    `npx expo export --platform web --output-dir "${distDir}"`,
    root,
    30 * 60_000,
  );
  return { engine, root, distDir, exportExit: res.exit, exportLog: res.output };
}

/* ------------------------------------------------------------- web serve -- */

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
  '.txt': 'text/plain',
};

/** Serves a static export directory over HTTP on an owned port. */
export function serveExport(distDir: string, port: number): Promise<WebServeHandle> {
  return new Promise((resolveServe, reject) => {
    const server = createServer((req, res) => {
      try {
        let path = (req.url ?? '/').split('?')[0];
        if (path === '/') path = '/index.html';
        let filePath = join(distDir, path);
        if (!existsSync(filePath) && !extname(path)) filePath = `${filePath}.html`;
        if (!existsSync(filePath)) filePath = join(distDir, 'index.html');
        const body = readFileSync(filePath);
        res.writeHead(200, {
          'content-type': MIME[extname(filePath)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      resolveServe({ port, server, url: `http://127.0.0.1:${port}` });
    });
  });
}

export function stopServe(handle: WebServeHandle | null): Promise<void> {
  return new Promise((resolveStop) => {
    if (!handle) return resolveStop();
    handle.server.close(() => resolveStop());
  });
}

/* ------------------------------------------------------------ playwright -- */

type PlaywrightHandle = {
  browser: Browser;
};

/**
 * Launches a real Chromium through the workspace's @playwright/test dependency. The
 * browser is NOT a fixture here — it is launched, driven and closed by this helper.
 */
export async function launchChromium(): Promise<PlaywrightHandle> {
  const browser = await chromium.launch({ headless: true });
  return { browser };
}

export type WebLegResult = {
  seedVisible: boolean;
  olderSeedReached: boolean;
  markerSubmitted: boolean;
  inputCleared: boolean;
  markerVisible: boolean;
  error?: string;
};

/**
 * Drives the served web consumer through the same flow the native Maestro flow proves:
 * newest seed visible, scroll to olderSeed, type a fresh marker, submit, input cleared,
 * new marker visible. Returns discrete booleans — the orchestrator turns them into a
 * pass/fail, never an authored success flag.
 */
export async function driveWeb(
  browser: Browser,
  url: string,
  marker: string,
  olderSeed: string,
): Promise<WebLegResult> {
  const result: WebLegResult = {
    seedVisible: false,
    olderSeedReached: false,
    markerSubmitted: false,
    inputCleared: false,
    markerVisible: false,
  };

  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });

    const newest = page.getByText('Seed turn 24: Ready for your message.', { exact: true });
    result.seedVisible = await newest.isVisible().catch(() => false);

    // The inverted list keeps the newest at the bottom; scroll the container to reveal
    // the oldest turn. react-native-web's FlatList is a scroll div, so scrolling to top
    // reaches the oldest authored message.
    const list = page.locator('div').filter({ has: newest }).last();
    await list.scrollIntoViewIfNeeded().catch(() => {});
    const older = page.getByText(olderSeed, { exact: true });
    await older.scrollIntoViewIfNeeded().catch(() => {});
    result.olderSeedReached = await older.isVisible().catch(() => false);

    // Exact label match: "Send message" also contains "Message", so a bare getByLabel
    // would resolve to two elements. The textarea carries aria-label="Message".
    const textarea = page.getByLabel('Message', { exact: true });
    await textarea.click().catch(() => {});
    await textarea.fill(marker);
    const send = page.getByLabel('Send message', { exact: true });
    await send.click().catch(() => {});

    // PromptInput clears its field only after a successful submit; wait for that clear
    // rather than racing it. (String form: evaluated in the browser, no DOM lib needed.)
    await page
      .waitForFunction(`document.querySelector('textarea[aria-label="Message"]')?.value === ''`, {
        timeout: 15_000,
      })
      .catch(() => {});
    result.inputCleared = (await textarea.inputValue().catch(() => marker)) === '';

    const markerText = page.getByText(marker, { exact: true });
    await markerText.scrollIntoViewIfNeeded().catch(() => {});
    result.markerVisible = await markerText.isVisible().catch(() => false);
    result.markerSubmitted = result.markerVisible;
  } catch (e) {
    result.error = e instanceof Error ? e.message : String(e);
  } finally {
    await context.close().catch(() => {});
  }
  return result;
}
