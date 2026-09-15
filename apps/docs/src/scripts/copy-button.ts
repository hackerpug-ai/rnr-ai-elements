/**
 * `rnr-copy-button` — vanilla custom element, island 1/5 (FUSE-09).
 *
 * Copies the text of the `<code>` child it wraps. The command is read from
 * the rendered DOM, so what lands on the clipboard can never drift from what
 * is displayed. Without JS the element stays unregistered: its children are
 * plain HTML and the command remains selectable, crawlable text.
 *
 * Loaded as a processed (bundled) module script — executes once per full
 * page load. Soft-navigation re-init safety comes from the registration
 * guard plus per-instance wiring in connectedCallback, so newly swapped-in
 * elements upgrade without re-registering the definition.
 */
declare global {
  interface Window {
    __rnrCopyButtonRegistered?: boolean;
  }
}

class RnrCopyButton extends HTMLElement {
  connectedCallback(): void {
    const trigger = this.querySelector('button');
    const command = this.querySelector('code');
    if (!trigger || !command || trigger.dataset.copyBound === 'true') return;
    trigger.dataset.copyBound = 'true';
    // Remember the server-rendered label so the idle reset can restore it.
    trigger.dataset.copyLabel = (trigger.textContent ?? 'Copy').trim();
    trigger.addEventListener('click', () => {
      void this.copy(trigger as HTMLButtonElement, command);
    });
  }

  private async copy(trigger: HTMLButtonElement, command: Element): Promise<void> {
    // Copied exactly: the clipboard carries the displayed source byte-for-byte,
    // boundary whitespace (leading indentation, terminal newline) included.
    const text = command.textContent ?? '';
    try {
      await navigator.clipboard.writeText(text);
      this.setState(trigger, 'copied', 'Copied');
    } catch {
      // Zero-JS-compatible failure path: the text is still on screen to copy by hand.
      this.setState(trigger, 'error', 'Copy failed — select the command and copy it manually.');
    }
    window.setTimeout(() => {
      if (trigger.dataset.state !== 'idle') this.setState(trigger, 'idle', '');
    }, 2000);
  }

  private setState(trigger: HTMLButtonElement, state: string, label: string): void {
    trigger.dataset.state = state;
    // Empty label means "back to the original server-rendered text".
    trigger.textContent = label || trigger.dataset.copyLabel || 'Copy';
    const status = this.querySelector('.copy-button__status');
    if (status) status.textContent = label;
  }
}

export function init(): void {
  // Window-guarded flag + registration guard: safe under ClientRouter soft
  // navigation where the bundled module must not re-run its side effects.
  // The tag is spelled out literally at the registration site so the island
  // budget test can pin the registered name by source scan.
  if (window.__rnrCopyButtonRegistered || customElements.get('rnr-copy-button')) return;
  window.__rnrCopyButtonRegistered = true;
  customElements.define('rnr-copy-button', RnrCopyButton);
}

init();
