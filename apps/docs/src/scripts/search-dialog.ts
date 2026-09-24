/**
 * `rnr-search-dialog` — vanilla custom element, island 5/5 (ORI-AST-004).
 *
 * The header's Cmd/Ctrl+K search: a native <dialog> that opens the instant
 * the trigger fires, then lazy-loads the same-origin Pagefind index produced
 * post-build by scripts/docs-data/search-index.ts. The module-level
 * `pagefindPromise` outlives every element instance, so initialization
 * survives unchanged reopens and ClientRouter soft navigation without a
 * second `/pagefind/` module request; per-element state (query, results,
 * invoker) dies with each swapped-in instance, exactly like theme-toggle.
 *
 * Safety posture:
 *   - query text, titles, and excerpts are rendered as TEXT NODES only —
 *     Pagefind excerpts are tag-stripped and links are same-origin validated
 *     before one attribute is written; no innerHTML anywhere;
 *   - stale query completions are discarded through a monotonic token;
 *   - the trigger stays `:not(:defined)`-hidden without JavaScript and the
 *     island un-hides the Header's mount only once it upgrades.
 *
 * ORI-AST-009 consumes `activateSearch(invoker?)` for the custom 404's
 * "Search the site" control — the SAME dialog implementation, never a copy.
 */
import { groupForResultMeta } from '../lib/search-page-model';

declare global {
  interface Window {
    __rnrSearchDialogRegistered?: boolean;
    /** One-time (per JS realm) flag: the Pagefind module finished loading. */
    __rnrSearchReady?: boolean;
    /** The island's own activation-to-visible measurement, in ms. */
    __rnrSearchLastOpenMs?: number;
    /** Queries this element's latest search fully settled (test witness). */
    __rnrSearchSettledQueries?: string[];
  }
}

interface PagefindResultData {
  url: string;
  meta: { title?: string; category?: string; section?: string };
  /** Pagefind HTML excerpt with <mark> tags — stripped before rendering. */
  excerpt?: string;
}

interface PagefindModule {
  search(query: string): Promise<{ results: { data(): Promise<PagefindResultData> }[] }>;
}

// The result groups and their normalization come from the ONE page model the
// build-time indexer uses, so the dialog can never drift from the index.
const GROUP_ORDER = ['components', 'ui', 'lib', 'pages'] as const;
const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  components: 'Components',
  ui: 'UI',
  lib: 'Libraries',
  pages: 'Documentation',
};

/**
 * The session-wide Pagefind loader. The dynamic import is deliberately NOT
 * touched until the first activation — nothing at module scope fetches
 * anything — and the cached promise is what makes every later open and every
 * soft-navigated instance free: the browser module map has it after the first
 * load, so no second `/pagefind/` module request ever happens.
 */
let pagefindPromise: Promise<PagefindModule> | null = null;

function loadPagefind(): Promise<PagefindModule> {
  if (!pagefindPromise) {
    // Same-origin absolute specifier; @vite-ignore keeps Vite from touching it.
    // The module is served post-build by scripts/docs-data/search-index.ts.
    // fallow-ignore-next-line unresolved-import
    pagefindPromise = import(/* @vite-ignore */ '/pagefind/pagefind.js') as Promise<PagefindModule>;
    pagefindPromise.catch(() => {
      // A failed (e.g. offline) attempt must not poison later retries.
      pagefindPromise = null;
    });
  }
  return pagefindPromise;
}

/** Strip every tag from a Pagefind excerpt (including <mark>) so only text
 * is ever rendered. */
function excerptText(html: string | undefined): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

class RnrSearchDialog extends HTMLElement {
  private dialog!: HTMLDialogElement;
  private input!: HTMLInputElement;
  private statusEl!: HTMLElement;
  private resultsEl!: HTMLElement;
  private emptyEl!: HTMLElement;
  private emptyQueryEl!: HTMLElement;
  private errorEl!: HTMLElement;
  private loadingEl!: HTMLElement;
  private trigger: HTMLButtonElement | null = null;
  private invoker: HTMLElement | null = null;
  private searchToken = 0;
  private settled: string[] = [];

  // Relocation, un-hide, ref resolution, and per-instance wiring are one
  // lifecycle unit (the theme-toggle.ts precedent).
  // fallow-ignore-next-line complexity
  connectedCallback(): void {
    // Sit inside the Header's search mount: move once, and un-hide the mount
    // the island upgrade makes real. Without JS neither happens.
    const mount = document.querySelector('[data-search-slot]');
    if (mount && this.parentElement !== mount) {
      mount.removeAttribute('hidden');
      mount.appendChild(this);
    }

    this.dialog = this.querySelector('dialog') as HTMLDialogElement;
    this.input = this.querySelector('input[type="search"]') as HTMLInputElement;
    this.statusEl = this.querySelector('[data-search-status]') as HTMLElement;
    this.resultsEl = this.querySelector('[data-search-results]') as HTMLElement;
    this.emptyEl = this.querySelector('[data-search-empty]') as HTMLElement;
    this.emptyQueryEl = this.querySelector('[data-search-empty-query]') as HTMLElement;
    this.errorEl = this.querySelector('[data-search-error]') as HTMLElement;
    this.loadingEl = this.querySelector('[data-search-loading]') as HTMLElement;
    this.trigger = this.querySelector('button');
    if (!this.dialog || !this.input) return;

    // Per-instance wiring: a ClientRouter swap discards the old element (and
    // its listeners) with the old page, so there is nothing to unbind.
    this.trigger?.addEventListener('click', () => this.activate(this.trigger));
    this.input.addEventListener('input', () => {
      this.scheduleSearch(this.input.value);
    });
    this.input.addEventListener('keydown', (event) => {
      this.handleInputKeydown(event);
    });
    this.dialog.addEventListener('close', () => {
      this.restoreInvokerFocus();
    });
    this.dialog.addEventListener('click', (event) => {
      // Backdrop click dismisses, matching the Escape affordance.
      if (event.target === this.dialog) this.dialog.close();
    });
  }

  /**
   * Open the dialog immediately — visibility never waits on the index. The
   * module-level initialization (first activation only) runs in parallel.
   */
  activate(invoker?: HTMLElement | null): void {
    this.invoker =
      invoker ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const startedAt = performance.now();
    this.dialog.showModal();
    window.__rnrSearchLastOpenMs = Math.round(performance.now() - startedAt);
    this.input.focus();

    if (window.__rnrSearchReady !== true) {
      this.setLoading(true);
      loadPagefind()
        .then(() => {
          window.__rnrSearchReady = true;
          this.setLoading(false);
          this.setStatus(this.input.value ? '' : 'Type to search documentation and components.');
          if (this.input.value) this.scheduleSearch(this.input.value);
        })
        .catch(() => {
          this.setLoading(false);
          this.showError();
        });
    }
  }

  private restoreInvokerFocus(): void {
    const invoker = this.invoker;
    this.invoker = null;
    if (invoker?.isConnected) invoker.focus();
  }

  private setLoading(loading: boolean): void {
    this.loadingEl.hidden = !loading;
  }

  private setStatus(text: string): void {
    this.statusEl.textContent = text;
  }

  private showError(): void {
    this.errorEl.hidden = false;
    this.resultsEl.hidden = true;
    this.emptyEl.hidden = true;
    this.setStatus('');
  }

  private clearError(): void {
    this.errorEl.hidden = true;
  }

  private scheduleSearch(query: string): void {
    const token = ++this.searchToken;
    window.setTimeout(() => {
      void this.runSearch(query, token);
    }, 80);
  }

  // One guard per correctness rule: empty query reset, two stale-completion
  // discards, and the failure path.
  // fallow-ignore-next-line complexity
  private async runSearch(query: string, token: number): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) {
      if (token === this.searchToken) this.renderIdle();
      return;
    }
    this.clearError();
    try {
      const pagefind = await loadPagefind();
      const response = await pagefind.search(trimmed);
      // Discard stale completions: only the newest input renders.
      if (token !== this.searchToken) return;
      const items = await Promise.all(response.results.slice(0, 20).map((result) => result.data()));
      if (token !== this.searchToken) return;
      this.renderResults(trimmed, items);
      this.settled.push(trimmed);
      window.__rnrSearchSettledQueries = [...this.settled];
    } catch {
      if (token === this.searchToken) this.showError();
    }
  }

  private renderIdle(): void {
    this.resultsEl.hidden = true;
    this.resultsEl.replaceChildren();
    this.emptyEl.hidden = true;
    this.clearError();
    this.setStatus('Type to search documentation and components.');
  }

  /**
   * Render grouped results. Everything is created through createElement and
   * textContent — a query or result can never create DOM beyond the fixed
   * structure below.
   */
  // The branch count IS the safety posture: per-item origin validation,
  // category normalization, and the zero-result state are each a guard this
  // dialog must keep.
  // fallow-ignore-next-line complexity
  private renderResults(query: string, items: PagefindResultData[]): void {
    this.resultsEl.replaceChildren();
    this.clearError();

    const origin = window.location.origin;
    const groups = new Map<string, HTMLElement[]>();
    let rendered = 0;

    for (const item of items) {
      // Same-origin destinations only; anything else is dropped, never guessed.
      let url: URL;
      try {
        url = new URL(item.url, origin);
      } catch {
        continue;
      }
      if (url.origin !== origin) continue;

      const category = groupForResultMeta(item.meta);

      const link = document.createElement('a');
      link.setAttribute('data-search-result', '');
      link.setAttribute('data-category', category);
      link.setAttribute('href', url.pathname);
      if (rendered === 0) link.setAttribute('data-active', 'true');

      const title = document.createElement('span');
      title.className = 'search-dialog__result-title';
      title.textContent = item.meta.title || url.pathname;
      const excerpt = document.createElement('span');
      excerpt.className = 'search-dialog__result-excerpt';
      excerpt.textContent = excerptText(item.excerpt);
      const kind = document.createElement('span');
      kind.className = 'search-dialog__result-kind';
      kind.textContent = category;
      link.append(kind, title, excerpt);

      const list = groups.get(category) ?? [];
      list.push(link);
      groups.set(category, list);
      rendered += 1;
    }

    if (rendered === 0) {
      this.resultsEl.hidden = true;
      this.emptyQueryEl.textContent = query;
      this.emptyEl.hidden = false;
      this.setStatus('0 results');
      return;
    }

    for (const category of GROUP_ORDER) {
      const links = groups.get(category);
      if (!links) continue;
      const group = document.createElement('div');
      group.setAttribute('data-search-group', '');
      group.setAttribute('data-category', category);
      const heading = document.createElement('h3');
      heading.className = 'search-dialog__group-label';
      heading.textContent = GROUP_LABELS[category];
      group.append(heading, ...links);
      this.resultsEl.append(group);
    }

    this.resultsEl.hidden = false;
    this.emptyEl.hidden = true;
    // The highlighted (top-ranked) result must be ON SCREEN: groups render in
    // fixed category order, so the best match can sit below the fold of the
    // scroll area when another category group sorts earlier.
    this.resultsEl
      .querySelector('a[data-search-result][data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' });
    const count = this.resultsEl.querySelectorAll('a[data-search-result]').length;
    this.setStatus(count === 1 ? '1 result' : `${count} results — ↵ opens, ↑↓ select, esc closes`);
  }

  // Wrap-around selection, status announcement, and scroll syncing are the
  // whole keyboard contract in one place.
  // fallow-ignore-next-line complexity
  private moveActive(delta: 1 | -1): void {
    const links = Array.from(
      this.resultsEl.querySelectorAll<HTMLAnchorElement>('a[data-search-result]'),
    );
    if (links.length === 0) return;
    const currentIndex = links.findIndex((link) => link.getAttribute('data-active') === 'true');
    // Wrap in both directions so ArrowUp on the first result still changes
    // the selection — an unchanged selection is a dead control.
    const nextIndex =
      (currentIndex === -1 ? 0 : currentIndex + delta + links.length) % links.length;
    for (const [index, link] of links.entries()) {
      if (index === nextIndex) link.setAttribute('data-active', 'true');
      else link.removeAttribute('data-active');
    }
    links[nextIndex].scrollIntoView({ block: 'nearest' });
    const count = this.resultsEl.querySelectorAll('a[data-search-result]').length;
    this.setStatus(
      count === 1
        ? '1 result'
        : `${count} results — ${nextIndex + 1} of ${count}, ↵ opens, esc closes`,
    );
  }

  // One branch per key the search contract binds: ArrowDown, ArrowUp,
  // Enter, Escape.
  // fallow-ignore-next-line complexity
  private handleInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.moveActive(1);
      return;
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.moveActive(-1);
      return;
    }
    if (event.key === 'Enter') {
      const active = this.resultsEl.querySelector<HTMLAnchorElement>(
        'a[data-search-result][data-active="true"]',
      );
      if (!active) return;
      event.preventDefault();
      // Close, then hand the real link click to the document — the
      // ClientRouter intercepts it exactly like any ordinary link.
      this.dialog.close();
      active.click();
      return;
    }
    if (event.key === 'Escape') {
      // Chromium gives type=search inputs a clear-on-Escape default that
      // swallows the dialog's native cancel path, so close explicitly — the
      // 'close' listener restores the invoking control's focus.
      event.preventDefault();
      this.dialog.close();
    }
  }
}

/**
 * The one activation seam (ORI-AST-004): every search activation on the site
 * — header trigger, platform shortcut, and the custom 404's "Search the
 * site" control (ORI-AST-009) — goes through this function and therefore the
 * same dialog implementation.
 */
// The ORI-AST-009 404 seam: consumed by the custom 404's "Search the site"
// control once that task composes it (not yet in the import graph).
// fallow-ignore-next-line unused-export
export function activateSearch(invoker?: HTMLElement): void {
  const host = document.querySelector('rnr-search-dialog');
  if (host instanceof RnrSearchDialog) host.activate(invoker);
}

// The module is loaded as a side-effect script (`<script src>`), so `init`
// has no import-time consumer — it is the entry point, same as the sibling
// islands. Window-guarded flag + registration guard: safe under soft
// navigation. The tag is spelled out literally at the registration site so
// the island budget test can pin the registered name by source scan.
// fallow-ignore-next-line unused-export
export function init(): void {
  if (window.__rnrSearchDialogRegistered || customElements.get('rnr-search-dialog')) return;
  window.__rnrSearchDialogRegistered = true;
  customElements.define('rnr-search-dialog', RnrSearchDialog);

  // The platform shortcut is bound once per JS realm (not per element), so a
  // ClientRouter swap cannot stack duplicate listeners or open two dialogs.
  // Modifier, collision, and re-entry guards for the one site shortcut.
  // fallow-ignore-next-line complexity
  window.addEventListener('keydown', (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    const openDialogs = document.querySelectorAll('dialog[open]');
    if (openDialogs.length > 0) return;
    const host = document.querySelector('rnr-search-dialog');
    if (host instanceof RnrSearchDialog) host.activate(host.trigger ?? undefined);
  });
}

init();
