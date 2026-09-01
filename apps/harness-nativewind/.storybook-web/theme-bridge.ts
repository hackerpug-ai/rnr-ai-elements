import { colorScheme } from 'nativewind';

export const ENGINE = 'nativewind' as const;

/** NativeWind's dark mode is class-based (darkMode: 'class' in tailwind.config.js). */
export function setTheme(theme: 'light' | 'dark'): void {
  colorScheme.set(theme);
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.style.colorScheme = theme;
  }
}
