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

  // Wave-9 (attachments/context/open-in-chat): classes whose only JSX home is a
  // new file. The engine's CSS build intermittently omits NEW-file classes from the
  // compiled style map even on cold rebuilds (wave-7 root cause, reconfirmed on
  // attachments.tsx — size-24/size-12/flex-wrap had zero compiled entries while
  // identical classes from older files compiled). Declaring them here forces
  // generation. New waves: extend this block when device verification shows a
  // missing class — the pattern is any 'absent visual + zero style-map entry'.
  'flex-wrap',
  'gap-1',
  'gap-1.5',
  'gap-2',
  'h-8',
  'px-1.5',
  'size-3',
  'size-12',
  'size-24',
] as const;

void SAFELIST;
void View;
