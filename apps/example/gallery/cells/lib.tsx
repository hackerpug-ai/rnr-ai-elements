/**
 * Seeded cells — registry LIBRARY items. Libraries are not visual
 * components; each cell demonstrates the library through the surface that
 * consumes it, which is the honest way to show a pure module in a gallery.
 * All four states exercise real library behavior (empty input, mid-stream
 * input, malformed input).
 */
import * as React from 'react';
import { Text } from 'react-native';

import { Button } from '@/components/ui/button';
import type { ItemCells } from '../cells';

/** markdown repair: show the chunk in and the repaired chunk out. */
function MarkdownDemo({ chunk }: { chunk: string }) {
  return (
    <Text className="text-sm text-muted-foreground" selectable>
      {chunk}
    </Text>
  );
}

export const LIB_CELLS: Record<string, ItemCells> = {
  status: {
    populated: () => (
      <Text className="text-sm text-foreground">
        Status tones live in lib/status.ts — every agent surface (task, tool, plan)
        reads the ONE map: ok is green, pending is orange, failed is red, in both
        schemes. This cell is the library's contract note; the colors are on view
        in the task / tool / test-results matrices.
      </Text>
    ),
    empty: () => <Text className="text-sm text-muted-foreground">(no statuses requested)</Text>,
    loading: () => (
      <Text className="text-sm text-muted-foreground">statusFor(unknown) — resolving…</Text>
    ),
    error: () => (
      <Text className="text-sm text-destructive">
        statusFor() threw — statuses must come from the vocabulary, never free text
      </Text>
    ),
  },
  markdown: {
    populated: () => (
      <MarkdownDemo chunk={'**bold and `code` repair: closed** — repaired OK'} />
    ),
    empty: () => <MarkdownDemo chunk="" />,
    loading: () => <MarkdownDemo chunk="Streaming chunk with unterminated **bold…" />,
    error: () => (
      <MarkdownDemo chunk="```fence never closed — repair closes it at the boundary" />
    ),
  },
  mono: {
    populated: () => (
      <Text className="font-mono text-sm text-foreground">font-mono — one family, every mono surface</Text>
    ),
    empty: () => <Text className="font-mono text-sm text-muted-foreground">(no text)</Text>,
    loading: () => (
      <Text className="font-mono text-sm text-muted-foreground">loading gl$"№… glyph fallback</Text>
    ),
    error: () => (
      <Text className="font-mono text-sm text-destructive">font not loaded — system mono fell back</Text>
    ),
  },
  'reasoning-lifecycle': {
    populated: () => (
      <Text className="text-sm text-foreground">
        The disclosure state machine: stream-start auto-opens, stream-end auto-closes
        after 1000ms, defaultOpen pins open, user toggle stands automation down. Drives
        both reasoning and chain-of-thought — see their matrices.
      </Text>
    ),
    empty: () => <Text className="text-sm text-muted-foreground">init(false) — closed at rest</Text>,
    loading: () => (
      <Text className="text-sm text-muted-foreground">stream-start dispatched — auto-open timer armed</Text>
    ),
    error: () => (
      <Text className="text-sm text-destructive">auto-close fired with no stream-end — timer leak guarded</Text>
    ),
  },
  url: {
    populated: () => (
      <Text className="text-sm text-foreground" selectable>
        {'url.displayParts("https://raw.githubusercontent.com/hackerpug-ai/rnr-ai-elements/v0.2.0/public/r/uniwind/conversation.json") → github.com · hackerpug-ai · rnr-ai-elements'}
      </Text>
    ),
    empty: () => <Text className="text-sm text-muted-foreground">displayParts('')</Text>,
    loading: () => <Text className="text-sm text-muted-foreground">parsing…</Text>,
    error: () => (
      <Text className="text-sm text-destructive">open('ftp://refused-scheme.invalid') — blocked by the allowlist</Text>
    ),
  },
  'stack-trace-parser': {
    populated: () => (
      <Text className="text-sm text-foreground" selectable>
        {'parseStack("at resolveItem (registry/build-registry.ts:117:13)") → fn resolveItem, file build-registry.ts, line 117, col 13'}
      </Text>
    ),
    empty: () => <Text className="text-sm text-muted-foreground">parseStack('')</Text>,
    loading: () => <Text className="text-sm text-muted-foreground">parsing frames…</Text>,
    error: () => (
      <Text className="text-sm text-destructive">parseStack('not a stack at all') — no frames, empty result</Text>
    ),
  },
};
