/**
 * `rnr-ledger-filter` — vanilla custom element, island 4/5 (FAM-004).
 *
 * A WAI-ARIA search box over server-rendered cards. The whole grid — every
 * card carrying data-filter-text — is authored by the page's static template;
 * this element ONLY toggles the hidden attribute on cards, on the sections
 * they empty, and on the one muted no-results row. It never builds DOM, never
 * fetches, and filter state never reaches the URL (TR-10): no history writes,
 * no query params, no hash.
 *
 * Inputs arrive via attributes so a later sprint can remount the SAME element
 * over a different ledger: `target` is the selector of the container whose
 * [data-filter-text] cards are filtered. No tab machinery, no facets — free
 * text over the attribute, case-insensitive substring.
 *
 * Loaded as a processed (bundled) module script — executes once per full page
 * load. The registration guard keeps the define idempotent across
 * astro:page-load re-fires and ClientRouter soft navigation (same pattern as
 * tab-group.ts); per-instance wiring in connectedCallback is guarded by a
 * dataset flag.
 */
declare global {
  interface Window {
    __rnrLedgerFilterRegistered?: boolean;
  }
}

class RnrLedgerFilter extends HTMLElement {
  private input: HTMLInputElement | null = null;
  private noResults: HTMLElement | null = null;
  /** The <li> (or card itself when bare) whose hidden attribute we toggle. */
  private items: { root: HTMLElement; text: string; section: HTMLElement | null }[] = [];

  connectedCallback(): void {
    const target = this.getAttribute('target');
    const container = target ? document.querySelector(target) : null;
    if (!container) return;
    if (this.dataset.ledgerFilterBound === 'true') return;
    this.items = [...container.querySelectorAll<HTMLElement>('[data-filter-text]')].map((card) => ({
      root: card.closest('li') ?? card,
      text: (card.getAttribute('data-filter-text') ?? '').toLowerCase(),
      section: card.closest('section'),
    }));
    if (this.items.length === 0) return;
    this.dataset.ledgerFilterBound = 'true';

    // The served input ships disabled (zero-JS visitors never get a dead
    // control); upgrading it is what makes the filter live.
    this.input = this.querySelector<HTMLInputElement>('input');
    this.noResults = this.querySelector<HTMLElement>('[data-no-results]');
    if (!this.input) return;
    this.input.disabled = false;
    this.input.addEventListener('input', () => this.apply(this.input?.value ?? ''));
  }

  /**
   * The ONE state mutation: hidden on every non-matching card, on every
   * section whose cards all hid, and on the no-results row whenever anything
   * matches. An empty query is the clear path — everything comes back.
   */
  private apply(raw: string): void {
    if (!this.input) return;
    const query = raw.trim().toLowerCase();
    if (query === '') {
      for (const item of this.items) item.root.hidden = false;
      for (const section of this.sections()) section.hidden = false;
      if (this.noResults) this.noResults.hidden = true;
      return;
    }
    const visible = new Set<HTMLElement>();
    for (const item of this.items) {
      const match = item.text.includes(query);
      item.root.hidden = !match;
      if (match && item.section) visible.add(item.section);
    }
    for (const section of this.sections()) section.hidden = !visible.has(section);
    if (this.noResults) this.noResults.hidden = visible.size > 0;
  }

  /** The card sections, in DOM order, deduplicated. */
  private sections(): HTMLElement[] {
    return [...new Set(this.items.map((item) => item.section).filter(Boolean))] as HTMLElement[];
  }
}

export function init(): void {
  // Window-guarded flag + registration guard: safe under soft navigation where
  // the bundled module must not re-run its side effects. The tag is spelled
  // out literally at the registration site so the island budget test can pin
  // the registered name by source scan.
  if (window.__rnrLedgerFilterRegistered || customElements.get('rnr-ledger-filter')) return;
  window.__rnrLedgerFilterRegistered = true;
  customElements.define('rnr-ledger-filter', RnrLedgerFilter);
}

// The router lifecycle re-runs init on every soft navigation; the direct call
// covers router-less pages, where astro:page-load never fires.
document.addEventListener('astro:page-load', () => init());
init();
