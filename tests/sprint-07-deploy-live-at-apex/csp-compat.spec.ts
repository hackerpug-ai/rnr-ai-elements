/**
 * APX-032 — Prove the shipped CSP keeps Pagefind search and the pre-paint
 * theme script working on the built site.
 *
 * Serves real apps/docs/dist copies through the pinned wrangler 4.81.0 local
 * workerd (the only runtime that parses `_headers`). Never uses astro preview,
 * route.fulfill, or page.setExtraHTTPHeaders.
 */
import { type ChildProcess, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  type Browser,
  type BrowserContext,
  type ConsoleMessage,
  expect,
  type Page,
  test,
} from '@playwright/test';

const REPO_ROOT = process.cwd();
const DOCS_DIST = join(REPO_ROOT, 'apps', 'docs', 'dist');
const DOCS_HEADERS = join(REPO_ROOT, 'apps', 'docs', 'public', '_headers');
const DOCS_WRANGLER = join(REPO_ROOT, 'apps', 'docs', 'wrangler.jsonc');
const WRANGLER_BIN = join(REPO_ROOT, 'apps', 'docs', 'node_modules', '.bin', 'wrangler');
const COMPAT_DATE = '2026-04-12';
const READY_TIMEOUT_MS = 60_000;
const SEARCH_RESULT = 'a[data-search-result]';
const SEARCH_INPUT = 'dialog[aria-modal="true"] input[type="search"]';
const SEARCH_STATUS = 'dialog[aria-modal="true"] [data-search-status]';
const SEARCH_ERROR = 'dialog[aria-modal="true"] [data-search-error]';
const THEME_TOGGLE = 'button[aria-label="Toggle dark and light theme"]';
const STATUS_MULTI = /^\d+ results — ↵ opens, ↑↓ select, esc closes$/;
const CONVERSATION_HREF = '/components/conversation/';
const INTRODUCTION_PATH = '/docs/introduction';
const REGISTRY_JSON_PATH = '/r/nativewind/conversation.json';

interface WorkerdFixture {
  tmpDir: string;
  port: number;
  child: ChildProcess;
  origin: string;
  log: string;
}

const fixtures: WorkerdFixture[] = [];
let committedCsp = '';
let committedOrigin = '';
let wasmRemovedOrigin = '';
let inlineBlockedOrigin = '';

function chromiumOnly(): void {
  test.skip(
    test.info().project.name !== 'chromium-desktop',
    'APX-032 is chromium-desktop only — never edit playwright.config.ts',
  );
}

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => {
      const address = probe.address();
      if (address === null || typeof address === 'string') {
        probe.close();
        reject(new Error('failed to allocate a free TCP port'));
        return;
      }
      const { port } = address;
      probe.close((error) => {
        if (error) reject(error);
        else resolve(port);
      });
    });
  });
}

function readCommittedCsp(): string {
  const raw = readFileSync(DOCS_HEADERS, 'utf8');
  const lines = raw.split('\n');
  let inStarRule = false;
  for (const line of lines) {
    if (line === '/*') {
      inStarRule = true;
      continue;
    }
    if (inStarRule && line.startsWith('/') && !line.startsWith('/*')) {
      break;
    }
    if (inStarRule) {
      const match = line.match(/^\s*Content-Security-Policy:\s*(.+)\s*$/);
      if (match?.[1]) return match[1].trim();
    }
  }
  throw new Error(
    'committed /* Content-Security-Policy rule missing from apps/docs/public/_headers',
  );
}

function rewriteHeadersCsp(
  headersPath: string,
  mutateScriptSrc: (scriptSrc: string) => string,
): void {
  const raw = readFileSync(headersPath, 'utf8');
  const next = raw.replace(
    /(Content-Security-Policy:[\s\S]*?script-src )([^;]+)(;)/,
    (_full, prefix: string, scriptSrc: string, suffix: string) =>
      `${prefix}${mutateScriptSrc(scriptSrc)}${suffix}`,
  );
  if (next === raw) {
    throw new Error(`failed to rewrite script-src in ${headersPath}`);
  }
  writeFileSync(headersPath, next);
}

async function waitForReady(
  child: ChildProcess,
  port: number,
  logHolder: { log: string },
): Promise<void> {
  const readyToken = `Ready on http://127.0.0.1:${port}`;
  const deadline = Date.now() + READY_TIMEOUT_MS;

  const onChunk = (chunk: Buffer): void => {
    logHolder.log = `${logHolder.log}${chunk.toString('utf8')}`.slice(-12_000);
  };
  child.stdout?.on('data', onChunk);
  child.stderr?.on('data', onChunk);

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(
        `wrangler exited ${child.exitCode} before ready on :${port}\n${logHolder.log}`,
      );
    }
    if (logHolder.log.includes(readyToken)) return;
    try {
      const response = await fetch(`http://127.0.0.1:${port}/`, {
        signal: AbortSignal.timeout(1500),
      });
      await response.body?.cancel();
      if (response.status === 200) return;
    } catch {
      // keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`wrangler on :${port} not ready within ${READY_TIMEOUT_MS}ms\n${logHolder.log}`);
}

async function stopFixture(fixture: WorkerdFixture): Promise<void> {
  const { child } = fixture;
  if (child.pid === undefined || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch {
    return;
  }
  for (let waited = 0; waited < 10_000 && child.exitCode === null; waited += 100) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  if (child.exitCode === null && child.pid !== undefined) {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      /* already gone */
    }
  }
}

async function startWorkerd(
  label: string,
  mutateHeaders?: (headersPath: string) => void,
): Promise<WorkerdFixture> {
  expect(existsSync(DOCS_DIST), 'apps/docs/dist must exist — run docs build first').toBe(true);
  expect(existsSync(join(DOCS_DIST, '_headers')), 'built dist must include _headers').toBe(true);
  expect(
    existsSync(join(DOCS_DIST, 'pagefind', 'pagefind.js')),
    'built dist must include pagefind.js (search:index)',
  ).toBe(true);
  expect(existsSync(WRANGLER_BIN), 'pinned wrangler 4.81.0 binary missing under apps/docs').toBe(
    true,
  );

  const tmpDir = mkdtempSync(join(tmpdir(), `apx-032-${label}-`));
  const distDir = join(tmpDir, 'dist');
  const stateDir = join(tmpDir, 'state');
  const cfgPath = join(tmpDir, 'wrangler.jsonc');
  cpSync(DOCS_DIST, distDir, { recursive: true });
  cpSync(DOCS_WRANGLER, cfgPath);
  if (mutateHeaders) mutateHeaders(join(distDir, '_headers'));

  const port = await freePort();
  const logHolder = { log: '' };
  const child = spawn(
    WRANGLER_BIN,
    [
      'dev',
      '--config',
      cfgPath,
      '--ip',
      '127.0.0.1',
      '--port',
      String(port),
      '--compatibility-date',
      COMPAT_DATE,
      '--persist-to',
      stateDir,
    ],
    {
      cwd: tmpDir,
      detached: true,
      env: {
        ...process.env,
        CI: '1',
        WRANGLER_SEND_METRICS: 'false',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  const fixture: WorkerdFixture = {
    tmpDir,
    port,
    child,
    origin: `http://127.0.0.1:${port}`,
    log: '',
  };
  fixtures.push(fixture);

  try {
    await waitForReady(child, port, logHolder);
    fixture.log = logHolder.log;
  } catch (error) {
    await stopFixture(fixture);
    rmSync(tmpDir, { recursive: true, force: true });
    throw error;
  }
  return fixture;
}

function collectConsole(page: Page): string[] {
  const lines: string[] = [];
  page.on('console', (message: ConsoleMessage) => {
    lines.push(message.text());
  });
  page.on('pageerror', (error) => {
    lines.push(String(error));
  });
  return lines;
}

const BODY_CLASS_RECORDER = `(() => {
  // Explicit ready flag: evaluate turns bare undefined into null.
  window.__rnrClassAtBodyReady = false;
  window.__rnrClassAtBody = '';
  const record = () => {
    if (window.__rnrClassAtBodyReady) return;
    const root = document.documentElement;
    if (!root) return;
    window.__rnrClassAtBody = root.className;
    window.__rnrClassAtBodyReady = true;
  };
  if (document.body) {
    record();
    return;
  }
  // documentElement can be null when the init script first runs (engine-state
  // precedent), so observe the Document with subtree:true for BODY insertion.
  new MutationObserver(function (mutations, observer) {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeName === 'BODY' || (node.nodeType === 1 && node.querySelector && node.querySelector('body'))) {
          record();
          observer.disconnect();
          return;
        }
      }
    }
    if (document.body) {
      record();
      observer.disconnect();
    }
  }).observe(document, { childList: true, subtree: true });
})();`;

async function openSearch(page: Page): Promise<void> {
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+k' : 'Control+k');
  await expect(page.locator(SEARCH_INPUT)).toBeVisible({ timeout: 15_000 });
}

async function searchConversation(page: Page): Promise<void> {
  await openSearch(page);
  await page.locator(SEARCH_INPUT).fill('conversation');
  await expect
    .poll(async () => page.locator(SEARCH_RESULT).count(), { timeout: 20_000 })
    .toBeGreaterThan(0);
}

async function attachEvidence(
  testInfo: {
    attach: (
      name: string,
      options: { body: Buffer | string; contentType: string },
    ) => Promise<void>;
  },
  page: Page,
  consoleLines: string[],
  prefix: string,
): Promise<void> {
  await testInfo.attach(`${prefix}-screenshot`, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
  await testInfo.attach(`${prefix}-console`, {
    body: Buffer.from(`${consoleLines.join('\n')}\n`, 'utf8'),
    contentType: 'text/plain',
  });
}

async function withDarkThemeContext(
  browser: Browser,
  initExtras: string[] = [],
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ colorScheme: 'dark' });
  await context.addInitScript(BODY_CLASS_RECORDER);
  for (const script of initExtras) {
    await context.addInitScript(script);
  }
  const page = await context.newPage();
  return { context, page };
}

test.describe('APX-032 CSP compat under workerd', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(180_000);

  test.beforeAll(async () => {
    committedCsp = readCommittedCsp();
    expect(
      committedCsp.includes("'wasm-unsafe-eval'"),
      'committed CSP must keep wasm-unsafe-eval',
    ).toBe(true);
    expect(committedCsp.includes("'unsafe-inline'"), 'committed CSP must keep unsafe-inline').toBe(
      true,
    );

    const committed = await startWorkerd('committed');
    committedOrigin = committed.origin;

    const wasmRemoved = await startWorkerd('wasm-removed', (headersPath) => {
      rewriteHeadersCsp(headersPath, (scriptSrc) =>
        scriptSrc
          .replace(/\s*'wasm-unsafe-eval'/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      );
    });
    wasmRemovedOrigin = wasmRemoved.origin;

    const inlineBlocked = await startWorkerd('inline-blocked', (headersPath) => {
      rewriteHeadersCsp(headersPath, (scriptSrc) =>
        scriptSrc
          .replace(/\s*'unsafe-inline'/g, '')
          .replace(/\s+/g, ' ')
          .trim(),
      );
    });
    inlineBlockedOrigin = inlineBlocked.origin;
  });

  test.afterAll(async () => {
    const ports = fixtures.map((fixture) => fixture.port);
    for (const fixture of fixtures.splice(0)) {
      await stopFixture(fixture);
      rmSync(fixture.tmpDir, { recursive: true, force: true });
    }
    for (const port of ports) {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/`, {
          signal: AbortSignal.timeout(800),
        });
        await response.body?.cancel();
        throw new Error(`workerd still listening on :${port} after teardown`);
      } catch (error) {
        if (error instanceof Error && error.message.includes('still listening')) throw error;
      }
    }
  });

  test('APX-032-AC1 Pagefind search works under the committed CSP', async ({ page }, testInfo) => {
    chromiumOnly();
    const consoleLines = collectConsole(page);

    const response = await page.goto(`${committedOrigin}${INTRODUCTION_PATH}`, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status(), '/docs/introduction must be 200 under workerd').toBe(200);

    await searchConversation(page);

    const firstHref = await page.locator(SEARCH_RESULT).first().getAttribute('href');
    expect(firstHref, 'first result must be Conversation').toBe(CONVERSATION_HREF);

    const resultCount = await page.locator(SEARCH_RESULT).count();
    expect(resultCount, 'conversation search must list at least 2 results').toBeGreaterThanOrEqual(
      2,
    );

    const statusText = (await page.locator(SEARCH_STATUS).textContent())?.trim() ?? '';
    expect(statusText, `status text must match multi-result format (got ${statusText})`).toMatch(
      STATUS_MULTI,
    );

    await expect(page.locator(SEARCH_ERROR)).toBeHidden();

    const joined = consoleLines.join('\n');
    expect(joined, 'no Pagefind WASM failure under committed CSP').not.toContain(
      'Failed to load the Pagefind WASM',
    );
    expect(joined, 'no CSP console error under committed CSP').not.toContain(
      'Content Security Policy',
    );

    await attachEvidence(testInfo, page, consoleLines, 'APX-032-AC1');
  });

  test('APX-032-AC2 Stored light theme applies before first paint under the CSP', async ({
    browser,
  }, testInfo) => {
    chromiumOnly();
    const { context, page } = await withDarkThemeContext(browser);
    const consoleLines = collectConsole(page);

    try {
      const response = await page.goto(`${committedOrigin}${INTRODUCTION_PATH}`, {
        waitUntil: 'domcontentloaded',
      });
      expect(response?.status(), '/docs/introduction must be 200').toBe(200);

      const toggle = page.locator(THEME_TOGGLE);
      await expect(toggle).toBeVisible({ timeout: 15_000 });

      for (let attempt = 0; attempt < 4; attempt += 1) {
        const hasLight = await page.evaluate(
          `document.documentElement.classList.contains('light')`,
        );
        if (hasLight) break;
        await toggle.click();
        await expect
          .poll(async () => page.evaluate(`document.documentElement.classList.contains('light')`))
          .toBe(true);
      }

      expect(
        await page.evaluate(`document.documentElement.classList.contains('light')`),
        'theme toggle must reach html.light before reload',
      ).toBe(true);
      expect(await page.evaluate(`localStorage.getItem('rnr-theme')`)).toBe('light');

      await page.reload({ waitUntil: 'domcontentloaded' });

      await expect
        .poll(async () => page.evaluate(`window.__rnrClassAtBodyReady === true`), {
          timeout: 10_000,
        })
        .toBe(true);

      const classAtBody = String(await page.evaluate(`window.__rnrClassAtBody`));
      expect(
        classAtBody,
        `class at <body> insertion must contain light (got ${classAtBody})`,
      ).toContain('light');
      expect(
        classAtBody.includes('dark'),
        `class at <body> insertion must not contain dark (got ${classAtBody})`,
      ).toBe(false);
      expect(await page.evaluate(`localStorage.getItem('rnr-theme')`)).toBe('light');

      const joined = consoleLines.join('\n');
      expect(joined, 'no CSP console error on theme reload').not.toContain(
        'Content Security Policy',
      );

      await attachEvidence(testInfo, page, consoleLines, 'APX-032-AC2');
      await testInfo.attach('APX-032-AC2-class-at-body', {
        body: Buffer.from(`${String(classAtBody)}\n`, 'utf8'),
        contentType: 'text/plain',
      });
    } finally {
      await context.close();
    }
  });

  test('APX-032-AC3 The served CSP is the committed one', async ({ request }, testInfo) => {
    chromiumOnly();

    const html = await request.get(`${committedOrigin}${INTRODUCTION_PATH}`);
    expect(html.status(), '/docs/introduction status').toBe(200);
    const htmlCsp = html.headers()['content-security-policy'];
    expect(htmlCsp, 'HTML response must carry content-security-policy').toBeTruthy();
    expect(htmlCsp, 'HTML CSP must equal committed /* value').toBe(committedCsp);
    expect(htmlCsp, 'HTML CSP must include wasm-unsafe-eval').toContain("'wasm-unsafe-eval'");

    const json = await request.get(`${committedOrigin}${REGISTRY_JSON_PATH}`);
    expect(json.status(), '/r/nativewind/conversation.json status').toBe(200);
    expect(json.headers()['content-type'] ?? '', 'registry JSON content-type').toMatch(
      /application\/json/,
    );
    const jsonCsp = json.headers()['content-security-policy'];
    expect(jsonCsp, 'JSON response must carry content-security-policy').toBeTruthy();
    expect(jsonCsp, 'JSON CSP must equal committed /* value').toBe(committedCsp);
    expect(jsonCsp, 'JSON CSP must include wasm-unsafe-eval').toContain("'wasm-unsafe-eval'");

    await testInfo.attach('APX-032-AC3-csp', {
      body: Buffer.from(
        JSON.stringify(
          {
            committed: committedCsp,
            introduction: htmlCsp,
            conversationJson: jsonCsp,
          },
          null,
          2,
        ),
        'utf8',
      ),
      contentType: 'application/json',
    });
  });

  test('APX-032-AC4 The lane goes red on a CSP that breaks search or theme', async ({
    browser,
  }, testInfo) => {
    chromiumOnly();

    // Case 1 — wasm-unsafe-eval removed: Pagefind WASM fails, error state shows.
    {
      const context = await browser.newContext();
      const page = await context.newPage();
      const consoleLines = collectConsole(page);
      try {
        const response = await page.goto(`${wasmRemovedOrigin}${INTRODUCTION_PATH}`, {
          waitUntil: 'domcontentloaded',
        });
        expect(response?.status()).toBe(200);

        await openSearch(page);
        await page.locator(SEARCH_INPUT).fill('conversation');

        await expect(page.locator(SEARCH_ERROR)).toBeVisible({ timeout: 20_000 });
        await expect(page.locator(SEARCH_ERROR)).toContainText(
          'Search is unavailable right now. Check your connection and try again.',
        );

        const conversationHits = page.locator(`${SEARCH_RESULT}[href="${CONVERSATION_HREF}"]`);
        await expect(conversationHits).toHaveCount(0);

        await expect
          .poll(() => consoleLines.join('\n'), { timeout: 20_000 })
          .toContain('Failed to load the Pagefind WASM');

        await attachEvidence(testInfo, page, consoleLines, 'APX-032-AC4-wasm');
      } finally {
        await context.close();
      }
    }

    // Case 2 — unsafe-inline removed: pre-paint script refused; stored light never applied.
    {
      const { context, page } = await withDarkThemeContext(browser, [
        `(() => { try { localStorage.setItem('rnr-theme', 'light'); } catch (e) {} })();`,
      ]);
      const consoleLines = collectConsole(page);
      try {
        const response = await page.goto(`${inlineBlockedOrigin}${INTRODUCTION_PATH}`, {
          waitUntil: 'domcontentloaded',
        });
        expect(response?.status()).toBe(200);

        await expect
          .poll(async () => page.evaluate(`window.__rnrClassAtBodyReady === true`), {
            timeout: 10_000,
          })
          .toBe(true);

        const classAtBody = String(await page.evaluate(`window.__rnrClassAtBody`));
        const storedTheme = await page.evaluate(`localStorage.getItem('rnr-theme')`);

        expect(storedTheme, 'localStorage still holds the seeded light theme').toBe('light');
        expect(
          classAtBody,
          `blocked inline script must leave root without light (got ${classAtBody})`,
        ).not.toContain('light');

        // Chromium historically logged "Refused to execute inline script";
        // current Desktop Chrome logs "Executing inline script violates…".
        // Either form is an inline-script CSP refusal.
        await expect
          .poll(() => consoleLines.join('\n'), { timeout: 10_000 })
          .toMatch(/Refused to execute inline script|Executing inline script violates/);

        await attachEvidence(testInfo, page, consoleLines, 'APX-032-AC4-inline');
        await testInfo.attach('APX-032-AC4-inline-class-at-body', {
          body: Buffer.from(`${String(classAtBody)}\n`, 'utf8'),
          contentType: 'text/plain',
        });
      } finally {
        await context.close();
      }
    }
  });
});
