/**
 * CLASS SAFELIST — a consumer-side declaration of classes whose only in-repo home is a
 * DATA map (registry lib/status.ts), not a JSX literal. The CSS build's scanner does not
 * reach string constants in the registry package's .ts sources (empirically proven:
 * text-destructive compiles only because RNR's vendored files use it literally), so the
 * three sanctioned escape-hatch status colors must be declared here where the scanner
 * looks. This file is imported for its side effect and renders nothing.
 *
 * This mirrors what any Tailwind consumer gets from the default palette: a standard
 * shadcn/Tailwind app compiles text-green-600 out of the box; this engine's CSS-first
 * build does not carry Tailwind's default palette, so the harness declares the slice.
 */
import { View } from 'react-native';

export function ClassSafelist() {
  return null as unknown as React.ReactElement;
}

// The literal block the scanner reads. Never rendered; never removed.
const SAFELIST = [
  'text-green-600',
  'text-green-500',
  'dark:text-green-500',
  'text-orange-600',
] as const;

void SAFELIST;
void View;
