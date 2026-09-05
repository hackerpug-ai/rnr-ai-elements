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

  // Wave-10 (model/mic/voice-selector + the rewritten command atom): only two classes
  // in the wave are absent from every older file — both pre-existing wave-2 Command
  // classes that now live ONLY in command.tsx (rewritten this wave): the sheet height
  // and the empty-state padding. Every class the three new selector files use resolves
  // in older sources (verified by cross-file scan), but the scan-then-declare rule
  // stands: absent visual + zero style-map entry is the pattern these prevent.
  'h-3/4',
  'py-10',

  // Wave-10 stories (device-visible fixtures): the attribute-anatomy name column.
  'w-24',

  // Wave-11 (audio-player/transcription): the only tokens in the wave absent from
  // every older file (cross-file scan). tabular-nums keeps the transport clock's
  // digits from jittering the row as it ticks; max-w-xs bounds the volume slider in
  // custom compositions. Same wave-9/10 pattern: new-file classes can drop from the
  // compiled style map, so their first in-repo home is declared here.
  'max-w-xs',
  'tabular-nums',

  // Wave-11 finding — a SYSTEMATIC subtype: opacity-MODIFIER classes (/NN) never
  // compiled regardless of file age (text-muted-foreground/60 has been in code-block
  // since wave 3 rendering full-opacity; sheet's bg-muted-foreground/40 grabber since
  // wave 2; size-1.5 likewise). Declaring the modifier forms forces generation.
  'text-muted-foreground/60',
  'bg-muted-foreground/40',
  'size-1.5',

  // Wave-12 (terminal/file-tree/environment-variables/package-info): the only classes
  // in the wave absent from every older file (cross-file scan at HEAD). The scroll
  // bounds are the two new components' default hosts (terminal max-h-64, file-tree
  // max-h-80) plus the DevTools story's tighter terminal (max-h-24); min-w-full makes
  // a horizontal ScrollView's content fill its host before overflowing; w-40 is the
  // env-vars/dependencies table's key column and items-stretch lets the file-tree's
  // two press targets span the full row height (their touch target). font-bold and
  // text-background exist ONLY inside terminal.logic.ts's ANSI class map (string
  // constants the scanner cannot see as JSX) — the exact case this file exists for.
  'max-h-24',
  'max-h-64',
  'max-h-80',
  'min-w-full',
  'w-40',
  'items-stretch',
  'font-bold',
  'text-background',
  'underline',
  'dark:text-orange-500',

  // Wave 13 (schema-display/stack-trace/test-results): classes whose only in-repo
  // home is a new file (cross-file scan at HEAD), plus the wave-11 systematic subtype
  // — opacity-MODIFIER forms — added regardless of age. text-foreground/90 and
  // text-muted-foreground/50 are the stack-trace frame rows' byte-classes (the
  // upstream internal/app dimming); text-muted-foreground/50 has an older RNR home
  // (input.tsx) but /NN forms never compiled from file age alone. The trigger rows'
  // active:bg-muted/50 and the web twins hover:bg-muted/50, hover:text-primary are
  // modifier forms whose only home is the wave. The spacing four (mx-4 mb-4, the
  // schema Example margins; mt-1/mt-2, description and error offsets; pr-4, the leaf
  // property's right pad; pl-10, the parameter indent) are the wave's only new
  // spacing tokens.
  'text-foreground/90',
  'text-muted-foreground/50',
  'active:bg-muted/50',
  'hover:bg-muted/50',
  'hover:text-primary',
  'mx-4',
  'mb-4',
  'mt-1',
  'mt-2',
  'pr-4',
  'pl-10',
  'bg-destructive/10',
  'bg-muted/30',

  // Wave 14 (web-preview — the FINAL organism): classes whose only in-repo home is a
  // new file (cross-file scan at HEAD). inset-0 is the webview body's loading overlay
  // and failure panel (the AC-3 explicit error state); h-96 and h-72 are the story
  // board's bounded hosts — the webview, like the web original's size-full iframe,
  // needs a sized parent. Same wave-9 pattern: new-file classes can drop from the
  // compiled style map, so their first in-repo home is declared here.
  'inset-0',
  'h-96',
  'h-72',

  // Remediation waves A-C — classes introduced by design/style-parity-remediation.md;
  // data-map strings the CSS scanner cannot see, plus new-file drop guards. The ANSI
  // class map (terminal.logic.ts) and the tool status map (tool.logic.ts) are string
  // constants, the exact case this file exists for; the zinc surface/green-red bar
  // classes land in JSX but in remapped files, so they are declared here too per the
  // standing scan-then-declare rule.
  'bg-zinc-950',
  'text-zinc-100',
  'text-zinc-500',
  'border-zinc-800',
  'bg-zinc-800',
  'bg-zinc-700',
  // The ANSI inverse pair (terminal.logic.ts BG_FORCED_FG) — data-map strings the
  // scanner cannot see; the 47/107 and SGR-7 spans render white-on-near-black.
  'bg-zinc-100',
  'text-zinc-950',
  'bg-green-500',
  'bg-red-500',
  'text-yellow-600',
  'dark:text-yellow-400',
  'text-blue-600',
  'dark:text-blue-400',
  'text-blue-400',
  'text-blue-500',
  'gap-8',
  'py-3.5',
  // Wave C (voice-selector): the • bullet's dim tint (text-xs text-border) — its only
  // in-repo home is this JSX in a remapped file; scan-then-declare.
  'text-border',

  // Remediation wave B (conversation/transcription/speech-input/file-tree): the same
  // scan-then-declare rule. text-neutral-400/dark:text-neutral-500 are the interim
  // dim pair (transcription.logic.ts SEGMENT_STATE_CLASS — data-map strings the
  // scanner cannot see), replacing the banned /60 modifier form; border-2 is the
  // speech-input pulse rings' stroke and has NO other in-repo home (cross-file scan
  // at HEAD). gap-8 and text-blue-500 were already declared for wave A above.
  'text-neutral-400',
  'dark:text-neutral-500',
  'border-2',
] as const;

void SAFELIST;
void View;
