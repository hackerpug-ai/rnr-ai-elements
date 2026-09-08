import { Platform } from 'react-native';

/**
 * One monospace family, one file, used by every mono surface — code-block, terminal,
 * stack-trace, snippet, schema-display, tool-input.
 *
 * Tailwind's `font-mono` is a CSS font STACK; React Native needs a single resolvable
 * family name, and whether Uniwind resolves `font-mono` to a working native family is
 * unverified. Six components each picking their own family is guaranteed drift, so the
 * decision lives here.
 *
 * DELETE THIS FILE the moment a device test proves `font-mono` resolves — inheriting
 * whatever RNR's `Text variant="code"` renders is strictly better parity than any family
 * we pick ourselves.
 */
export const MONO_FAMILY = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
}) as string;

export const monoStyle = { fontFamily: MONO_FAMILY } as const;
