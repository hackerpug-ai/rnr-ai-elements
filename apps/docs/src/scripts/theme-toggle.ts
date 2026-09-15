/**
 * `rnr-theme-toggle` — vanilla custom element, island 2/5 (SHELL-003).
 *
 * Flips the root theme class and persists the choice. The pre-paint script in
 * DocsLayout.astro owns theme RESOLUTION (stored `rnr-theme` > system scheme >
 * dark); this island only MUTATES the two things that script reads — the
 * `html.light` class and localStorage. There is deliberately no second theme
 * mechanism: no media-query listener, no URL state, no inline styles.
 *
 * ORI-AST-003 widens the island in two ways, still inside the SAME element:
 *   1. The click now updates BOTH complementary root markers in the one
 *      transition — `html.light` (authoritative for CSS) and `html.dark`
 *      (the compatibility marker) are opposite sides of one resolved boolean,
 *      never two stores.
 *   2. It refreshes the Theming TokenTable's current-value cells
 *      (`[data-token-current]`) from the root's computed custom properties on
 *      every connect and every click. Because ClientRouter swaps in a fresh
 *      island on soft navigation, `connectedCallback` re-runs and re-fills the
 *      freshly-inserted cells — no new custom element, no duplicate listeners.
 *
 * The Header renders an inert `[data-theme-slot]` mount inside its actions
 * cluster; the island relocates itself into it on connect, so the control
 * sits in the header without the layout and the island knowing each other's
 * internals. Without JS the element never upgrades and its
 * `:not(:defined)` rule keeps it hidden — the site stays dark-first and fully
 * readable, and nothing pretends to be a working control.
 *
 * Loaded as a processed (bundled) module script — executes once per full
 * page load; soft-navigation re-init safety comes from the registration
 * guard plus per-instance wiring in connectedCallback (same pattern as
 * copy-button.ts).
 */
declare global {
  interface Window {
    __rnrThemeToggleRegistered?: boolean;
  }
}

/**
 * Fill every `[data-token-current]` cell from its sibling swatch's RESOLVED
 * color. The swatch carries `background: var(--<token>)`, so its computed
 * `backgroundColor` is the token's used value under the active theme — the same
 * oklch number form the static columns print, unlike `getPropertyValue`, which
 * Chromium re-serializes as percentages (`oklch(23.5% 0 0)`). Pages without a
 * TokenTable have no such cells, so this is a no-op elsewhere. Idempotent and
 * cheap by construction.
 */
function refreshTokenValues(): void {
  document.querySelectorAll('[data-token-current]').forEach((cell) => {
    const swatch = cell.closest('tr')?.querySelector('[data-swatch]');
    if (!swatch) return;
    const color = getComputedStyle(swatch).backgroundColor;
    if (color) cell.textContent = color;
  });
}

class RnrThemeToggle extends HTMLElement {
  // Relocate + wire + refresh is one lifecycle unit; splitting it would scatter
  // the click guard and the reconnect refresh across artificial seams.
  // fallow-ignore-next-line complexity
  connectedCallback(): void {
    // Sit inside the Header's theme mount: move once, only if not already there.
    const mount = document.querySelector('[data-theme-slot]');
    if (mount && this.parentElement !== mount) mount.appendChild(this);

    const trigger = this.querySelector('button');
    if (!trigger) return;

    // Wire the click once per trigger element. A ClientRouter swap discards the
    // old element (and its listener) and upgrades a fresh one, so the guard
    // prevents stacking while reconnect still wires the new instance.
    if (trigger.dataset.themeBound !== 'true') {
      trigger.dataset.themeBound = 'true';
      this.syncTrigger(trigger as HTMLButtonElement);
      trigger.addEventListener('click', () => {
        const root = document.documentElement;
        const next = root.classList.contains('light') ? 'dark' : 'light';
        // The class flip is the ONLY theme mechanism; storage only persists it.
        // Both complementary markers update in this same transition.
        root.classList.toggle('light', next === 'light');
        root.classList.toggle('dark', next === 'dark');
        try {
          localStorage.setItem('rnr-theme', next);
        } catch {
          // Storage unavailable (privacy mode): the flip still applies this visit.
        }
        this.syncTrigger(trigger as HTMLButtonElement);
        refreshTokenValues();
      });
    }

    // Refresh on every (re)connect — including the relocation move above, which
    // re-fires connectedCallback — so a soft-navigation swap re-populates the
    // freshly-inserted TokenTable cells.
    refreshTokenValues();
  }

  private syncTrigger(trigger: HTMLButtonElement): void {
    trigger.setAttribute(
      'aria-pressed',
      document.documentElement.classList.contains('light') ? 'true' : 'false',
    );
  }
}

// The module is loaded as a side-effect script (`<script src>`), so `init` has
// no import-time consumer — it is the entry point, same as the sibling islands.
// fallow-ignore-next-line unused-export
export function init(): void {
  // Window-guarded flag + registration guard: safe under soft navigation where
  // the bundled module must not re-run its side effects. The tag is spelled
  // out literally at the registration site so the island budget test can pin
  // the registered name by source scan.
  if (window.__rnrThemeToggleRegistered || customElements.get('rnr-theme-toggle')) return;
  window.__rnrThemeToggleRegistered = true;
  customElements.define('rnr-theme-toggle', RnrThemeToggle);
}

init();
