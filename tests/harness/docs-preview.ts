import type { BrowserContext, Page, Response } from '@playwright/test';

// L6: the clipboard API no-ops on insecure origins. localhost is a secure context;
// a LAN IP over http is not. Everything navigates via this origin and nothing else.
export const PREVIEW_PORT = 4321;
export const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

/**
 * Shell command Playwright runs as its webServer: a strict-port guard, then
 * `astro preview` over the built dist on 127.0.0.1:4321.
 *
 * Two Astro 7 behaviors would otherwise break or launder a broken run:
 * - `astro preview` is NOT strict about --port — when 4321 is occupied it silently
 *   hops to the next free port, so Playwright would either time out or (worse) test
 *   whatever else answers on 4321. The guard exits 1 while the port is owned.
 * - Astro auto-backgrounds the preview server when it detects an AI-agent
 *   environment; a backgrounded server outlives the run and trips its own lock file
 *   on the next run. ASTRO_PREVIEW_BACKGROUND pins foreground mode, and --ignore-lock
 *   skips the stale-lock check and leaves no lock residue when Playwright kills the
 *   server at teardown.
 */
export function strictPreviewCommand(): string {
  const portGuard =
    `node -e 'const net=require("node:net");` +
    `const s=net.connect(${PREVIEW_PORT},"127.0.0.1",()=>{` +
    `console.error("strict port: ${PREVIEW_PORT} is already in use; astro preview must own it");` +
    `s.destroy();process.exit(1)});` +
    `s.on("error",()=>process.exit(0))'`;
  return [
    portGuard,
    `ASTRO_PREVIEW_BACKGROUND=1 exec pnpm --filter @rnr-ai-elements/docs exec astro preview --host 127.0.0.1 --port ${PREVIEW_PORT} --ignore-lock`,
  ].join(' && ');
}

/**
 * L6: navigate ONLY via the localhost preview origin and assert the response.
 * A path that escapes the origin is a test bug, not a navigation.
 */
export async function navigateLocalhost(page: Page, path = '/'): Promise<Response | null> {
  const url = new URL(path, PREVIEW_URL);
  if (url.origin !== PREVIEW_URL) {
    throw new Error(`refusing non-localhost navigation: ${url.href}`);
  }
  return page.goto(url.href);
}

/**
 * L6: clipboard.writeText only works on a secure context with the permissions
 * granted. Callers must assert clipboard CONTENT, not a success class.
 */
export async function grantClipboardPermissions(context: BrowserContext): Promise<void> {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: PREVIEW_URL,
  });
}

/**
 * L7 post-load wait primitive. Module scripts execute once ever, so a test may
 * never wait on DOMContentLoaded. Settles on `astro:page-load` when the
 * ClientRouter is present (it fires on initial load and after every soft
 * navigation); on a router-less page the load event above is already the
 * post-load signal. Pass `islandInitFlag` to additionally wait for the window
 * key an island sets to true once its one-time init has run.
 */
export async function waitForAstroPageLoad(page: Page, islandInitFlag?: string): Promise<void> {
  await page.waitForLoadState('load');
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        // Browser-context callback, typed through globalThis: this repo's tsconfig
        // carries no DOM lib (it is a React Native workspace).
        const doc = (
          globalThis as unknown as {
            document: {
              addEventListener(
                type: string,
                listener: () => void,
                options?: { once?: boolean },
              ): void;
              removeEventListener(type: string, listener: () => void): void;
            };
          }
        ).document;
        const settle = () => {
          doc.removeEventListener('astro:page-load', settle);
          resolve();
        };
        doc.addEventListener('astro:page-load', settle, { once: true });
        // No ClientRouter on the page: the event never fires; the timeout is the
        // router-less path and the listener covers every soft navigation.
        setTimeout(settle, 500);
      }),
  );
  if (islandInitFlag) {
    await page.waitForFunction(
      (flag) => (globalThis as unknown as Record<string, unknown>)[flag] === true,
      islandInitFlag,
      { timeout: 10_000 },
    );
  }
}
