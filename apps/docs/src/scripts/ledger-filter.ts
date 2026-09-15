/**
 * `rnr-ledger-filter` — vanilla custom element, island 4/5 (FAM-004; extended
 * by ORI-AST-007).
 *
 * A WAI-ARIA search box over server-rendered rows/cards. The whole set — every
 * row carrying data-filter-text — is authored by the page's static template;
 * this element ONLY toggles the hidden attribute on rows, on the sections they
 * empty, and on the one muted no-results row. It never builds DOM, never
 * fetches, and filter state never reaches the URL (TR-10): no history writes,
 * no query params, no hash.
 *
 * Two independent narrowing controls, each optional by construction:
 * - CATEGORY: the optional `[data-category-filter]` buttons select a category
 *   id; a row matches when its `data-category` equals the selection (or the
 *   selection is "all"). Only the ledger carries these buttons and row
 *   attributes; the /components grid has neither, so the category term is a
 *   no-op there.
 * - TEXT: the input narrows by case-insensitive substring over each row's
 *   `data-filter-text`.
 *
 * Empty-state detection is ROW-BASED: the no-results row shows when zero rows
 * match the combined category + text filter, independently of any containing
 * section. Section hiding (a family section whose cards all hide, hides with
 * its header) is retained for the grid and is a separate, optional concern —
 * rows that carry no `closest('section')` (the ledger's <tr>) never trigger it.
 *
 * Inputs arrive via attributes so the SAME element mounts over a different
 * target: `target` is the selector of the container whose [data-filter-text]
 * rows are filtered. No engine machinery here — engine choice rides the shared
 * TabGroup island and the root data-engine contract (ORI-AST-002).
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
  private categoryButtons: HTMLButtonElement[] = [];
  /** The <li> (or row itself when bare) whose hidden attribute we toggle. */
  private items: {
    root: HTMLElement;
    text: string;
    category: string;
    section: HTMLElement | null;
  }[] = [];
  private category = 'all';

  connectedCallback(): void {
    const target = this.getAttribute('target');
    const container = target ? document.querySelector(target) : null;
    if (!container) return;
    if (this.dataset.ledgerFilterBound === 'true') return;
    this.items = [...container.querySelectorAll<HTMLElement>('[data-filter-text]')].map((card) => ({
      root: card.closest('li') ?? card,
      text: (card.getAttribute('data-filter-text') ?? '').toLowerCase(),
      category: card.getAttribute('data-category') ?? '',
      section: card.closest('section'),
    }));
    if (this.items.length === 0) return;
    this.dataset.ledgerFilterBound = 'true';

    // The served input ships disabled (zero-JS visitors never get a dead
    // control); upgrading it is what makes the filter live.
    this.input = this.querySelector<HTMLInputElement>('input');
    this.noResults = this.querySelector<HTMLElement>('[data-no-results]');

    this.categoryButtons = [...this.querySelectorAll<HTMLButtonElement>('[data-category-filter]')];
    for (const button of this.categoryButtons) {
      button.addEventListener('click', () => {
        this.setCategory(button.getAttribute('data-category-filter') ?? 'all');
      });
    }

    if (!this.input) return;
    this.input.disabled = false;
    this.input.addEventListener('input', () => this.apply());
  }

  /** Select a category facet and re-apply. The "all" selection matches every
   * row regardless of its data-category. */
  private setCategory(id: string): void {
    this.category = id;
    for (const button of this.categoryButtons) {
      const selected = button.getAttribute('data-category-filter') === id;
      button.setAttribute('aria-pressed', String(selected));
    }
    this.apply();
  }

  /**
   * The ONE state mutation: hidden on every non-matching row, on every
   * section whose rows all hid, and on the no-results row whenever anything
   * matches. An empty query + "all" category is the clear path — everything
   * comes back. Empty detection counts matching ROWS, never sections.
   */
  private apply(): void {
    const query = (this.input?.value ?? '').trim().toLowerCase();
    let matchCount = 0;
    for (const item of this.items) {
      const categoryMatch = this.category === 'all' || item.category === this.category;
      const textMatch = query === '' || item.text.includes(query);
      const match = categoryMatch && textMatch;
      item.root.hidden = !match;
      if (match) matchCount += 1;
    }
    for (const section of this.sections()) {
      const hasVisible = this.items.some((item) => item.section === section && !item.root.hidden);
      section.hidden = !hasVisible;
    }
    if (this.noResults) this.noResults.hidden = matchCount > 0;
  }

  /** The row sections, in DOM order, deduplicated (grid-only; the ledger's
   * rows carry no section and never appear here). */
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
