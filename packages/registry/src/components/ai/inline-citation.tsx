import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { Platform } from 'react-native';
import { citationBadgeLabel } from './inline-citation.logic';

/**
 * InlineCitation — the numbered reference inline with the claim it backs (UC web
 * original: a span run inside the assistant text with a hover-card badge).
 *
 * IT RENDERS INLINE, INSIDE TEXT. The web nests <span>s; React Native nests <Text>s —
 * the vendored Text (an RN Text) composes inside a Text run exactly the same way, so
 * the port keeps the web's shape: InlineCitation (root) wraps InlineCitationText (the
 * cited words) plus the chip, all Text nodes in one run. No View may enter this tree —
 * a View inside a Text run is the one nesting RN forbids.
 *
 * THE WEB'S HOVER CARD IS DEAD ON TOUCH, and the PRD verdict already ruled the
 * replacement: "a pressable inline chip that opens a popover". The popover is the
 * CONSUMER's composition — the chip reports `onSelect` (task-brief contract: a
 * callback, NOT navigation) and the caller opens the detail surface it owns, typically
 * this registry's Popover or Sheet hosting this registry's Sources list. That also
 * settles the inline-layout constraint: a portal trigger cannot live inside a Text
 * run, but a Text chip with a callback can, and the detail opens OUTSIDE the run.
 *
 * DROPPED WITH THE HOVER CARD, declared: InlineCitationCard/CardBody (HoverCard),
 * the embla Carousel and its Prev/Next/Index chrome, and InlineCitationSource/Quote
 * (only reachable from the card body). Their data surfaces through Sources composed in
 * the consumer's popover instead.
 *
 * The chip keeps the web trigger's Badge look (secondary, rounded-full) rendered in
 * Text — padding, radius and background all work on a nested Text on both platforms.
 * Web's group-hover:bg-accent on the text is a hover surface: dead under a thumb, and
 * the chip's active: twin is its replacement.
 */

/**
 * The cited words. Web: a span with a hover tint. RN: the plain run — children is a
 * string, per the house rule that text-bearing parts type their children narrowly
 * (MessageText precedent).
 */
function InlineCitationText({ children, className, ...props }: { children: string; className?: string }) {
  return (
    <Text className={cn('text-foreground', className)} {...props}>
      {children}
    </Text>
  );
}

type InlineCitationProps = {
  /** Overrides the default run (web: children on the root span). */
  children?: React.ReactNode;
  className?: string;
};

function InlineCitation({ children, className, ...props }: InlineCitationProps) {
  return (
    <Text className={cn('text-foreground', className)} {...props}>
      {children}
    </Text>
  );
}

type InlineCitationChipProps = {
  /** The source URLs behind the claim. The first drives the hostname, the rest the +N. */
  sources: readonly string[];
  /**
   * Fired on press with the first source URL (undefined when the list is empty).
   * Opening the detail surface is the caller's job — this is a callback, not navigation.
   */
  onSelect?: (url: string | undefined) => void;
  /** Overrides the computed label (web: children on the Badge). */
  children?: React.ReactNode;
  className?: string;
};

/**
 * The pressable chip — the web's InlineCitationCardTrigger, renamed: there is no card
 * to trigger (HoverCard does not exist on touch), and the honest name is what it is.
 * The label is the web's, byte-for-byte, via citationBadgeLabel.
 */
function InlineCitationChip({ sources, onSelect, children, className }: InlineCitationChipProps) {
  const label = citationBadgeLabel(sources);

  return (
    <Text
      onPress={onSelect ? () => onSelect(sources[0]) : undefined}
      accessibilityRole="button"
      accessibilityLabel={`Citation: ${label}`}
      className={cn(
        'overflow-hidden rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground',
        'active:bg-accent',
        Platform.select({ web: 'transition-colors hover:bg-secondary/80' }),
        className,
      )}
    >
      {children ?? label}
    </Text>
  );
}

export { InlineCitation, InlineCitationChip, InlineCitationText };
