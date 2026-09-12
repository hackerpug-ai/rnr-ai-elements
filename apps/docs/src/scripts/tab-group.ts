/**
 * `rnr-tab-group` — vanilla custom element, island 3/5 (SHELL-004).
 *
 * WAI-ARIA tabs over server-rendered panels. The whole DOM (tablist, role=tab
 * buttons, role=tabpanel divs carrying data-engine) is authored by
 * TabGroup.astro and fully present in the served HTML; this element ONLY
 * toggles the panels' hidden attribute, syncs aria-selected/roving tabindex,
 * and persists the chosen engine. Panels are never client-fetched, and engine
 * state never reaches the URL.
 *
 * The storage key comes from the `storage-key` attribute (default
 * `rnr-engine`), so a page may namespace its tabs. Loaded as a processed
 * (bundled) module script — executes once per full page load; per-instance
 * wiring in connectedCallback keeps it safe under ClientRouter soft
 * navigation (same pattern as copy-button.ts).
 */
declare global {
  interface Window {
    __rnrTabGroupRegistered?: boolean;
  }
}

class RnrTabGroup extends HTMLElement {
  private storageKey = 'rnr-engine';
  private tabs: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];

  connectedCallback(): void {
    this.tabs = [...this.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    this.panels = [...this.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    if (this.tabs.length === 0 || this.panels.length === 0) return;
    if (this.dataset.tabGroupBound === 'true') return;
    this.dataset.tabGroupBound = 'true';
    this.storageKey = this.getAttribute('storage-key') ?? 'rnr-engine';

    for (const tab of this.tabs) {
      tab.addEventListener('click', () => this.activate(tab.dataset.engine));
      tab.addEventListener('keydown', (event) => this.onKeydown(event));
    }
    // Persisted engine wins; otherwise the server-rendered default (the first
    // panel, nativewind) stays exactly as served.
    this.activate(this.persistedEngine() ?? this.tabs[0]?.dataset.engine);
  }

  /** ArrowLeft/ArrowRight: move focus AND activate (automatic activation). */
  private onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const current = this.tabs.indexOf(event.currentTarget as HTMLButtonElement);
    const step = event.key === 'ArrowRight' ? 1 : -1;
    const next = this.tabs[(current + step + this.tabs.length) % this.tabs.length];
    next?.focus();
    this.activate(next?.dataset.engine);
  }

  /** Selected engine from storage, or null when unset or unreadable. */
  private persistedEngine(): string | null {
    try {
      return localStorage.getItem(this.storageKey);
    } catch {
      return null; // Storage unavailable (privacy mode): default panel stays.
    }
  }

  /**
   * The ONE state mutation: aria-selected + roving tabindex on the tabs,
   * hidden on every panel whose data-engine does not match, then persistence.
   * An unknown stored value (or none) keeps the server-rendered default —
   * nativewind, the first panel in source order.
   */
  private activate(engine: string | undefined): void {
    if (!engine || !this.tabs.some((tab) => tab.dataset.engine === engine)) return;
    for (const tab of this.tabs) {
      const selected = tab.dataset.engine === engine;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const panel of this.panels) {
      panel.hidden = panel.dataset.engine !== engine;
    }
    try {
      localStorage.setItem(this.storageKey, engine);
    } catch {
      // Storage unavailable (privacy mode): the tabs still switch this visit.
    }
  }
}

export function init(): void {
  // Window-guarded flag + registration guard: safe under soft navigation where
  // the bundled module must not re-run its side effects. The tag is spelled
  // out literally at the registration site so the island budget test can pin
  // the registered name by source scan.
  if (window.__rnrTabGroupRegistered || customElements.get('rnr-tab-group')) return;
  window.__rnrTabGroupRegistered = true;
  customElements.define('rnr-tab-group', RnrTabGroup);
}

init();
