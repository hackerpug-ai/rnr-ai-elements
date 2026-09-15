/**
 * ORI-AST-003 — FLOW-SHELL-01-theme-toggle-persisted-flash-free (AC-1, AC-3, AC-4).
 *
 * The one locked flow that owns the live Theming token table: a persisted,
 * flash-free theme toggle whose TokenTable swatches and current values follow
 * every selection, survives a hard reload without a light flash, renders its
 * static paired columns without JavaScript, and re-connects its current values
 * after a ClientRouter soft-navigation round trip.
 *
 * Three cases share one test function (the flow id is the --grep key):
 *   - AC-1 (fresh light → toggle dark → hard reload → toggle light): storage,
 *     both complementary root classes, color-scheme, page background, the
 *     background swatch and the current-value cell follow each selection, and
 *     the first reload frame is dark.
 *   - AC-3 (no JavaScript): at least ten semantic rows with nonempty usage,
 *     paired light/dark columns derived from the real sheet, DOCS-ONLY labels
 *     on both code tokens, and exactly one #textclasscontext / #rendermarkdown.
 *   - AC-4 (ClientRouter reconnect + code themes): current values refresh after
 *     a soft round trip, one click flips once, and the code token columns match
 *     the computed code theme in light and dark.
 *
 * Nothing is mocked: every observation reads the real built preview on
 * localhost:4321 through the browser's own CSS engine and origin localStorage.
 */
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost, waitForAstroPageLoad } from '../harness/docs-preview';

// The root tsconfig carries no DOM lib, so every in-page read uses string
// expressions (the sprint-01 ledger spec precedent).
const READ_THEME = `(() => {
  const root = document.documentElement;
  let theme = null;
  try { theme = localStorage.getItem('rnr-theme'); } catch (e) { /* denied */ }
  return {
    light: root.classList.contains('light'),
    dark: root.classList.contains('dark'),
    scheme: getComputedStyle(root).colorScheme,
    theme,
    bodyBg: getComputedStyle(document.body).backgroundColor,
  };
})()`;

/** Sample the first navigation frame at DOMContentLoaded, before first paint. */
const FRAME_RECORDER = `(() => {
  const holder = globalThis;
  holder.__rnrFrames = { frames: [] };
  const capture = () => {
    holder.__rnrFrames.frames.push({
      cls: document.documentElement.className,
      bg: getComputedStyle(document.body).backgroundColor,
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    capture();
    requestAnimationFrame(() => capture());
  });
})()`;

interface ThemeState {
  light: boolean;
  dark: boolean;
  scheme: string;
  theme: string | null;
  bodyBg: string;
}

interface TokenRowState {
  light: string;
  dark: string;
  swatch: string;
  current: string;
  docsOnly: string;
  usage: string;
}

async function readTheme(page: Page): Promise<ThemeState> {
  return page.evaluate(READ_THEME) as Promise<ThemeState>;
}

/** Read one token row's static columns, live swatch and current-value cell.
 * A string expression keeps every browser global out of the TS surface (this
 * repo's tsconfig carries no DOM lib — the sprint-01 ledger precedent). */
async function readTokenRow(page: Page, name: string): Promise<TokenRowState> {
  const expression = `(() => {
    const row = document.querySelector('tr[data-token="${name}"]');
    const text = (s) => (row ? (row.querySelector(s)?.textContent ?? '') : '').trim();
    const swatch = row ? row.querySelector('[data-swatch]') : null;
    const swatchBg = swatch ? getComputedStyle(swatch).backgroundColor : '';
    return {
      light: text('[data-value="light"]'),
      dark: text('[data-value="dark"]'),
      swatch: swatchBg,
      current: text('[data-token-current]'),
      docsOnly: text('[data-docs-only]'),
      usage: text('[data-usage]'),
    };
  })()`;
  return page.evaluate(expression) as Promise<TokenRowState>;
}

test('FLOW-SHELL-01-theme-toggle-persisted-flash-free', async ({ browser }) => {
  test.setTimeout(240_000);
  const soft = expect.soft;

  // ---------------------------------------------------------------------------
  // AC-1: persisted theme and live values — fresh light, toggle, reload, return.
  // ---------------------------------------------------------------------------
  {
    const context = await browser.newContext({ colorScheme: 'light', javaScriptEnabled: true });
    await context.addInitScript(FRAME_RECORDER);
    const page = await context.newPage();

    await navigateLocalhost(page, '/docs/theming');
    await waitForAstroPageLoad(page);

    // The static table must render at least ten rows — a hard gate that fails
    // fast on a pre-implementation route and lets the softer assertions below
    // collect their own detail once it exists.
    expect(
      await page.locator('tr[data-token]').count(),
      'the TokenTable renders at least ten semantic rows',
    ).toBeGreaterThanOrEqual(10);

    // Fresh light: complementary classes + scheme + canvas + storage.
    let state = await readTheme(page);
    soft(state.light, 'fresh light visit: html.light is true').toBe(true);
    soft(state.dark, 'fresh light visit: html.dark is complementary false').toBe(false);
    soft(state.scheme, 'fresh light visit: color-scheme is light').toBe('light');
    soft(state.bodyBg, 'fresh light visit: page canvas is oklch(1 0 0)').toBe('oklch(1 0 0)');
    soft(state.theme, 'fresh light visit: no stored rnr-theme yet').toBeNull();

    // The static table is present and paired before any toggle.
    const backgroundLight = await readTokenRow(page, 'background');
    soft(backgroundLight.light, 'background light column is oklch(1 0 0)').toBe('oklch(1 0 0)');
    soft(backgroundLight.dark, 'background dark column is oklch(0.145 0 0)').toBe(
      'oklch(0.145 0 0)',
    );

    // Toggle dark through the real control.
    await page.locator('button[aria-label="Toggle dark and light theme"]').click();
    state = await readTheme(page);
    soft(state.theme, 'dark selection stores rnr-theme=dark').toBe('dark');
    soft(state.dark, 'dark selection sets html.dark').toBe(true);
    soft(state.light, 'dark selection clears html.light').toBe(false);
    soft(state.scheme, 'dark selection sets color-scheme dark').toBe('dark');
    soft(state.bodyBg, 'dark selection paints oklch(0.145 0 0)').toBe('oklch(0.145 0 0)');

    const backgroundDark = await readTokenRow(page, 'background');
    soft(backgroundDark.swatch, 'background swatch resolves oklch(0.145 0 0)').toBe(
      'oklch(0.145 0 0)',
    );
    soft(
      backgroundDark.current,
      'background current-value cell equals the computed --background',
    ).toBe('oklch(0.145 0 0)');
    soft(backgroundDark.current.trim().length, 'current-value cell is not blank').toBeGreaterThan(
      0,
    );

    // Hard reload: the first recorded frame must already be dark.
    await navigateLocalhost(page, '/docs/theming');
    await waitForAstroPageLoad(page);
    const frames = (await page.evaluate(`(globalThis.__rnrFrames ?? { frames: [] }).frames`)) as {
      cls: string;
      bg: string;
    }[];
    soft(frames.length, 'reload recorded at least one navigation frame').toBeGreaterThan(0);
    const firstFrame = frames[0];
    soft(firstFrame?.cls.includes('dark'), 'first reload frame carries html.dark').toBe(true);
    soft(firstFrame?.cls.includes('light'), 'first reload frame has no light class').toBe(false);
    soft(firstFrame?.bg, 'first reload frame is dark oklch(0.145 0 0)').toBe('oklch(0.145 0 0)');

    const afterReload = await readTheme(page);
    soft(afterReload.dark, 'after reload html.dark is true').toBe(true);
    soft(afterReload.light, 'after reload html.light is false').toBe(false);
    soft(afterReload.bodyBg, 'after reload page is dark').toBe('oklch(0.145 0 0)');

    // Return to light through the same control.
    await page.locator('button[aria-label="Toggle dark and light theme"]').click();
    state = await readTheme(page);
    soft(state.theme, 'light selection stores rnr-theme=light').toBe('light');
    soft(state.light, 'light selection sets html.light').toBe(true);
    soft(state.dark, 'light selection clears html.dark').toBe(false);
    soft(state.scheme, 'light selection sets color-scheme light').toBe('light');
    soft(state.bodyBg, 'light selection paints oklch(1 0 0)').toBe('oklch(1 0 0)');
    const backgroundBack = await readTokenRow(page, 'background');
    soft(backgroundBack.swatch, 'light background swatch resolves oklch(1 0 0)').toBe(
      'oklch(1 0 0)',
    );
    soft(backgroundBack.current, 'light current-value cell is oklch(1 0 0)').toBe('oklch(1 0 0)');

    await context.close();
  }

  // ---------------------------------------------------------------------------
  // AC-3: CSS-derived static table and manuscript binding — no JavaScript.
  // ---------------------------------------------------------------------------
  {
    const nojsContext = await browser.newContext({ javaScriptEnabled: false });
    const nojsPage = await nojsContext.newPage();
    await navigateLocalhost(nojsPage, '/docs/theming');
    await nojsPage.waitForLoadState('load');

    const rowCount = await nojsPage.locator('tr[data-token]').count();
    soft(rowCount, 'at least ten semantic token rows').toBeGreaterThanOrEqual(10);

    // Every row carries nonempty usage and both value columns.
    const rows = (await nojsPage.evaluate(`(() => {
      return Array.from(document.querySelectorAll('tr[data-token]')).map((row) => ({
        name: row.getAttribute('data-token'),
        usage: (row.querySelector('[data-usage]')?.textContent ?? '').trim(),
        light: (row.querySelector('[data-value="light"]')?.textContent ?? '').trim(),
        dark: (row.querySelector('[data-value="dark"]')?.textContent ?? '').trim(),
      }));
    })()`)) as { name: string; usage: string; light: string; dark: string }[];
    for (const row of rows) {
      soft(row.usage, `--${row.name} usage is nonempty`).not.toBe('');
      soft(row.light, `--${row.name} light column is readable`).toMatch(/^oklch\(/);
      soft(row.dark, `--${row.name} dark column is readable`).toMatch(/^oklch\(/);
    }

    const backgroundNojs = await readTokenRow(nojsPage, 'background');
    soft(backgroundNojs.light, 'no-JS background light column is oklch(1 0 0)').toBe(
      'oklch(1 0 0)',
    );
    soft(backgroundNojs.dark, 'no-JS background dark column is oklch(0.145 0 0)').toBe(
      'oklch(0.145 0 0)',
    );

    // Both code tokens carry the DOCS-ONLY classification.
    for (const name of ['code-background', 'code-foreground']) {
      const code = await readTokenRow(nojsPage, name);
      soft(code.docsOnly, `--${name} carries DOCS-ONLY`).toBe('DOCS-ONLY');
    }

    // The preserved seam anchors each resolve exactly once (the real MDX).
    soft(
      await nojsPage.locator('#textclasscontext').count(),
      '#textclasscontext occurs exactly 1 time',
    ).toBe(1);
    soft(
      await nojsPage.locator('#rendermarkdown').count(),
      '#rendermarkdown occurs exactly 1 time',
    ).toBe(1);

    // One TokenTable on the one route (no second palette source, no second route).
    soft(await nojsPage.locator('[data-token-table]').count(), 'one TokenTable binds').toBe(1);

    await nojsContext.close();
  }

  // ---------------------------------------------------------------------------
  // AC-4: refresh after ClientRouter reconnect and match code themes.
  // ---------------------------------------------------------------------------
  {
    const context = await browser.newContext({ colorScheme: 'light', javaScriptEnabled: true });
    const page = await context.newPage();
    await navigateLocalhost(page, '/docs/theming');
    await waitForAstroPageLoad(page);

    await page.locator('button[aria-label="Toggle dark and light theme"]').click();
    let background = await readTokenRow(page, 'background');
    let codeBack = await readTokenRow(page, 'code-background');
    soft(background.current, 'dark background current value is oklch(0.145 0 0)').toBe(
      'oklch(0.145 0 0)',
    );
    soft(codeBack.current, 'dark code-background current value is oklch(0.235 0 0)').toBe(
      'oklch(0.235 0 0)',
    );

    // Soft round trip through real links: Theming → Dark mode → Theming.
    // Away via the docs sidebar (a clean, top-of-page link); back via the
    // manuscript's own Theming link (a regular click scrolls it into view).
    // Both ride the shared ClientRouter.
    await page.locator('nav[data-docs-nav] a[href="/docs/dark-mode"]').click();
    await waitForAstroPageLoad(page);
    soft(page.url().endsWith('/docs/dark-mode'), 'soft navigation reached /docs/dark-mode').toBe(
      true,
    );
    await page.locator('main a[href="/docs/theming"]').click();
    await waitForAstroPageLoad(page);
    soft(page.url().endsWith('/docs/theming'), 'soft navigation returned to /docs/theming').toBe(
      true,
    );

    // After the reconnect, current values are re-populated (not blank or stale).
    background = await readTokenRow(page, 'background');
    codeBack = await readTokenRow(page, 'code-background');
    soft(background.current, 'after reconnect background reads oklch(0.145 0 0)').toBe(
      'oklch(0.145 0 0)',
    );
    soft(codeBack.current, 'after reconnect code-background reads oklch(0.235 0 0)').toBe(
      'oklch(0.235 0 0)',
    );

    // The real component-page code frame resolves the active (dark) code theme —
    // the same --code-background the table's row prints, on /components/message.
    const codeFramePage = await context.newPage();
    await navigateLocalhost(codeFramePage, '/components/message');
    await codeFramePage.waitForLoadState('load');
    const messageCodeFrame = await codeFramePage.evaluate(
      `(() => {
        const frame = document.querySelector('.code-block');
        return frame ? getComputedStyle(frame).backgroundColor : '';
      })()`,
    );
    soft(messageCodeFrame, '/components/message code frame uses the dark code theme').toBe(
      'oklch(0.235 0 0)',
    );
    await codeFramePage.close();

    // One click to light: light code columns resolve, one transition.
    await page.locator('button[aria-label="Toggle dark and light theme"]').click();
    let state = await readTheme(page);
    soft(state.light, 'one click returns to light').toBe(true);
    soft(state.theme, 'one click stores rnr-theme=light').toBe('light');
    const codeBackLight = await readTokenRow(page, 'code-background');
    const codeForeLight = await readTokenRow(page, 'code-foreground');
    soft(codeBackLight.current, 'light code-background resolves oklch(0.97 0 0)').toBe(
      'oklch(0.97 0 0)',
    );
    soft(codeForeLight.current, 'light code-foreground resolves oklch(0.205 0 0)').toBe(
      'oklch(0.205 0 0)',
    );

    // One click back to dark: dark code columns resolve, no duplicate transition.
    await page.locator('button[aria-label="Toggle dark and light theme"]').click();
    state = await readTheme(page);
    soft(state.dark, 'one click returns to dark (no duplicate toggle)').toBe(true);
    soft(state.theme, 'one click stores rnr-theme=dark').toBe('dark');
    const codeBackDark = await readTokenRow(page, 'code-background');
    const codeForeDark = await readTokenRow(page, 'code-foreground');
    soft(codeBackDark.current, 'dark code-background resolves oklch(0.235 0 0)').toBe(
      'oklch(0.235 0 0)',
    );
    soft(codeForeDark.current, 'dark code-foreground resolves oklch(0.922 0 0)').toBe(
      'oklch(0.922 0 0)',
    );

    await context.close();
  }
});
