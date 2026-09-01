import { Uniwind } from 'uniwind';

export const ENGINE = 'uniwind' as const;

/**
 * Uniwind compiles `@variant light/dark` to `:root:where(.light, .light *)` plus a
 * prefers-color-scheme fallback. In a Storybook iframe neither matched, so every
 * --color-* resolved to `unset` and buttons rendered with correct geometry and no fill —
 * visible only by looking at a story, never by an HTTP check.
 *
 * setTheme drives Uniwind's own runtime; the explicit root class is what satisfies the
 * compiled selector inside the iframe.
 */
export function setTheme(theme: 'light' | 'dark'): void {
  Uniwind.setTheme(theme);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }
}
