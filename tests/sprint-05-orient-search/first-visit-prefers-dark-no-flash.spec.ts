/**
 * ORI-AST-003 — FLOW-SHELL-02-first-visit-prefers-dark-no-flash (AC-2).
 *
 * A first-time dark-preference visitor, cold-loading with empty storage, must
 * land dark on every locked route: the complementary html.dark marker and
 * color-scheme dark precede body paint, every first nonblank frame is the dark
 * canvas, the Theming code-background row reads the dark code value, and the
 * /components/message code frame uses the dark code theme.
 *
 * One test function (the flow id is the --grep key) with one independent cold
 * context per route — same discipline as the sprint-02 shell-hero predecessor,
 * extended to observe the ORI-AST-002 html.dark complementary marker and the
 * ORI-AST-003 TokenTable code row. No light frame may appear during load.
 *
 * Nothing is mocked: every observation reads the real built preview through
 * the browser's own CSS engine with genuinely empty origin storage.
 */
import { expect, type Page, test } from '@playwright/test';
import { navigateLocalhost } from '../harness/docs-preview';

/** Sample the theme at DOMContentLoaded (body parsed, before first paint) and
 * again at the first animation frame — the two "first frame" proof points. */
const FRAME_RECORDER = `(() => {
  const holder = globalThis;
  holder.__rnrFrames = { frames: [] };
  const capture = () => {
    holder.__rnrFrames.frames.push({
      light: document.documentElement.classList.contains('light'),
      dark: document.documentElement.classList.contains('dark'),
      scheme: getComputedStyle(document.documentElement).colorScheme,
      bg: getComputedStyle(document.body).backgroundColor,
    });
  };
  document.addEventListener('DOMContentLoaded', () => {
    capture();
    requestAnimationFrame(() => capture());
  });
})()`;

interface Frame {
  light: boolean;
  dark: boolean;
  scheme: string;
  bg: string;
}

async function readFrames(page: Page): Promise<Frame[]> {
  return page.evaluate(`(globalThis.__rnrFrames ?? { frames: [] }).frames`) as Promise<Frame[]>;
}

const DARK_BG = 'oklch(0.145 0 0)';

test('FLOW-SHELL-02-first-visit-prefers-dark-no-flash', async ({ browser }) => {
  test.setTimeout(180_000);
  const soft = expect.soft;

  for (const route of ['/docs/theming', '/', '/components/message'] as const) {
    // One independent cold context per route: dark scheme, empty storage,
    // recorder installed before any page script runs.
    const context = await browser.newContext({ colorScheme: 'dark', javaScriptEnabled: true });
    await context.addInitScript(FRAME_RECORDER);
    const page = await context.newPage();

    const response = await navigateLocalhost(page, route);
    soft(response?.status(), `${route} answers 200 from the built preview`).toBe(200);
    await page.waitForLoadState('load');

    const frames = await readFrames(page);
    soft(frames.length, `${route}: recorder observed pre-navigation frames`).toBeGreaterThan(0);

    // The first frame (DOMContentLoaded) must already be dark and complementary.
    const first = frames[0];
    soft(first?.dark, `${route}: html.dark is true when body is first parseable`).toBe(true);
    soft(first?.light, `${route}: html.light is false when body is first parseable`).toBe(false);
    soft(first?.scheme, `${route}: color-scheme is dark before body paint`).toBe('dark');
    soft(first?.bg, `${route}: first frame paints the dark canvas`).toBe(DARK_BG);

    // No later light frame occurs during load.
    for (const [index, frame] of frames.entries()) {
      soft(frame.bg, `${route}: frame ${index} stays dark (no light flash)`).toBe(DARK_BG);
      soft(frame.light, `${route}: frame ${index} never carries html.light`).toBe(false);
    }

    if (route === '/docs/theming') {
      const codeBackDark = await page.evaluate(
        `(() => {
          const row = document.querySelector('tr[data-token="code-background"]');
          return (row?.querySelector('[data-value="dark"]')?.textContent ?? '').trim();
        })()`,
      );
      soft(codeBackDark, '/docs/theming code-background row reads oklch(0.235 0 0)').toBe(
        'oklch(0.235 0 0)',
      );
    }

    if (route === '/components/message') {
      const codeFrameBg = await page.evaluate(
        `(() => {
          const frame = document.querySelector('.code-block');
          return frame ? getComputedStyle(frame).backgroundColor : '';
        })()`,
      );
      soft(
        codeFrameBg,
        '/components/message code frame uses the dark code theme (oklch(0.235 0 0))',
      ).toBe('oklch(0.235 0 0)');
    }

    await context.close();
  }
});
