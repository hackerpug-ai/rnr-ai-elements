/**
 * `rnr-tab-group` — vanilla custom element, island 3/5 (SHELL-004 + ORI-AST-002).
 *
 * WAI-ARIA tabs over server-rendered panels. The whole DOM (tablist, role=tab
 * buttons, role=tabpanel divs carrying data-engine) is authored by
 * TabGroup.astro and fully present in the served HTML; this element ONLY
 * toggles the panels' hidden attribute, syncs aria-selected/roving tabindex,
 * and — for persistent engine groups — drives the ONE shared engine-state
 * contract. Panels are never client-fetched, and engine state never reaches
 * the URL.
 *
 * Two group kinds, keyed off the server-rendered `data-persistent` attribute:
 * - ENGINE groups (data-persistent="true"): every selection validates the
 *   value against the two real engines (nativewind/uniwind), sets
 *   `document.documentElement.dataset.engine`, persists `rnr-engine`, and
 *   applies the SAME selection to every engine group on the page. One state
 *   transition, no per-group drift.
 * - GENERIC groups (data-persistent="false"): selection is local — no storage
 *   read/write, no root engine, no cross-group sync. The server-rendered
 *   default (first panel) stays on a fresh load; generic labels never reach
 *   rnr-engine.
 *
 * Storage is read/written through try/catch: a denied or unreadable store
 * falls back to the nativewind default (read) or a this-visit-only switch
 * (write), never an uncaught error, never every panel hidden.
 *
 * Loaded as a processed (bundled) module script — executes once per full page
 * load; per-instance wiring in connectedCallback keeps it safe under
 * ClientRouter soft navigation (same pattern as copy-button.ts).
 */
declare global {
  interface Window {
    __rnrTabGroupRegistered?: boolean;
  }
}

/** The one validated engine contract: only these values may reach root
 * data-engine or the rnr-engine storage key. Anything else — absent, malformed,
 * bogus — collapses to the documented nativewind default. */
const ENGINES = ['nativewind', 'uniwind'] as const;
type Engine = (typeof ENGINES)[number];

function resolveEngine(raw: string | null | undefined): Engine {
  return ENGINES.includes(raw as Engine) ? (raw as Engine) : 'nativewind';
}

class RnrTabGroup extends HTMLElement {
  private storageKey = 'rnr-engine';
  private tabs: HTMLButtonElement[] = [];
  private panels: HTMLElement[] = [];
  private persistent = true;

  connectedCallback(): void {
    this.tabs = [...this.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
    this.panels = [...this.querySelectorAll<HTMLElement>('[role="tabpanel"]')];
    if (this.tabs.length === 0 || this.panels.length === 0) return;
    if (this.dataset.tabGroupBound === 'true') return;
    this.dataset.tabGroupBound = 'true';
    this.storageKey = this.getAttribute('storage-key') ?? 'rnr-engine';
    this.persistent = this.getAttribute('data-persistent') !== 'false';

    for (const tab of this.tabs) {
      tab.addEventListener('click', () => this.activate(tab.dataset.engine));
      tab.addEventListener('keydown', (event) => this.onKeydown(event));
    }

    // Engine groups restore the shared validated engine (data-engine + every
    // engine group's panels) without writing storage, so a fresh context stays
    // free of an rnr-engine entry. Generic groups keep the server-rendered
    // default (the first panel, already visible).
    if (this.persistent) {
      this.synchronize(this.readEngine());
    }
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

  /** The validated persisted engine, or the nativewind default when unset or
   * unreadable. */
  private readEngine(): Engine {
    try {
      return resolveEngine(localStorage.getItem(this.storageKey));
    } catch {
      return 'nativewind'; // Storage unavailable (privacy mode): default panel stays.
    }
  }

  /** Every engine group in the current document (this one included). */
  private engineGroups(): RnrTabGroup[] {
    return [
      ...document.querySelectorAll<RnrTabGroup>(
        'rnr-tab-group[data-persistent="true"], rnr-tab-group:not([data-persistent])',
      ),
    ];
  }

  /**
   * The ONE state transition for engine groups: validate, set root data-engine,
   * persist rnr-engine, then apply visibility + ARIA to every engine group on
   * the page. Generic groups bypass everything except their own visibility.
   */
  activate(engine: string | undefined): void {
    if (!engine || !this.tabs.some((tab) => tab.dataset.engine === engine)) return;
    if (!this.persistent) {
      this.applyToGroup(engine);
      return;
    }
    const resolved = resolveEngine(engine);
    document.documentElement.dataset.engine = resolved;
    try {
      localStorage.setItem(this.storageKey, resolved);
    } catch {
      // Storage unavailable (privacy mode): the tabs still switch this visit.
    }
    for (const group of this.engineGroups()) {
      group.applyToGroup(resolved);
    }
  }

  /** Shared activation from the engine contract, used on connect and on
   * cross-group sync. Sets root data-engine and applies to every engine group
   * without touching storage (the connect path must not invent an rnr-engine
   * entry on a fresh context). */
  private synchronize(engine: Engine): void {
    document.documentElement.dataset.engine = engine;
    for (const group of this.engineGroups()) {
      group.applyToGroup(engine);
    }
  }

  /** Set aria-selected/roving tabindex/hidden on THIS group's own elements only. */
  private applyToGroup(engine: string): void {
    for (const tab of this.tabs) {
      const selected = tab.dataset.engine === engine;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    }
    for (const panel of this.panels) {
      panel.hidden = panel.dataset.engine !== engine;
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
