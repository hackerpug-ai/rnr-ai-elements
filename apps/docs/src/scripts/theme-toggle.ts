/**
 * `rnr-theme-toggle` — vanilla custom element, island 2/5 (SHELL-003).
 *
 * Flips the root theme class and persists the choice. The pre-paint script in
 * DocsLayout.astro owns theme RESOLUTION (stored `rnr-theme` > system scheme >
 * dark); this island only MUTATES the two things that script reads — the
 * `html.light` class and localStorage. There is deliberately no second theme
 * mechanism: no media-query listener, no URL state, no inline styles.
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

class RnrThemeToggle extends HTMLElement {
  connectedCallback(): void {
    // Sit inside the Header's theme mount: move once, only if not already there.
    const mount = document.querySelector('[data-theme-slot]');
    if (mount && this.parentElement !== mount) mount.appendChild(this);

    const trigger = this.querySelector('button');
    if (!trigger || trigger.dataset.themeBound === 'true') return;
    trigger.dataset.themeBound = 'true';
    this.syncTrigger(trigger as HTMLButtonElement);
    trigger.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.classList.contains('light') ? 'dark' : 'light';
      // The class flip is the ONLY theme mechanism; storage only persists it.
      root.classList.toggle('light', next === 'light');
      try {
        localStorage.setItem('rnr-theme', next);
      } catch {
        // Storage unavailable (privacy mode): the flip still applies this visit.
      }
      this.syncTrigger(trigger as HTMLButtonElement);
    });
  }

  private syncTrigger(trigger: HTMLButtonElement): void {
    trigger.setAttribute(
      'aria-pressed',
      document.documentElement.classList.contains('light') ? 'true' : 'false',
    );
  }
}

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
