import { Button } from '@/registry/{engine}/components/ui/button';
import { Empty, EmptyTitle } from '@/registry/{engine}/components/ui/empty';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item, ItemActions, ItemContent, ItemMedia } from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  CircleAlertIcon,
  FileTextIcon,
  ImageIcon,
  LoaderCircleIcon,
  Music2Icon,
  PaperclipIcon,
  VideoIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Image, Platform, View, type ViewProps } from 'react-native';
import {
  attachmentStateLabel,
  formatAttachmentSize,
  getAttachmentLabel,
  getMediaCategory,
  type AttachmentData,
  type AttachmentMediaCategory,
  type AttachmentState,
  type AttachmentVariant,
} from './attachments.logic';

/**
 * Attachments — the pending-attachment chips above the composer (UC-CHAT-03 AC-3: a
 * removable chip per attached file, before sending).
 *
 * THE CHIP ROW PORTS AT PARITY; FILE ACQUISITION DOES NOT — the PRD verdict
 * (native-substitute, pure-rnr) is explicit: drag-and-drop and the file input are
 * replaced by the native image and document pickers, which is the CALLER's wiring
 * (expo-image-picker / expo-document-picker land in the consumer's app, with their
 * permission contracts — none of it ships here). The component renders the list the
 * caller owns; there is no picker, no hook, no useAttachments state — queue precedent
 * (the component NEVER owns the queue).
 *
 * Composition is the web original's, flat and context-driven:
 *   <Attachments variant="…"> <Attachment data={file} onRemove={…}>
 *     <AttachmentPreview /> <AttachmentInfo /> <AttachmentRemove label="…" />
 *   </Attachment> </Attachments>
 * Each sub-part reads the row context, so order is the caller's. Rows (the list
 * variant) compose the `item` primitive — the PRD's own reuse ledger ("sources,
 * file-tree, attachments, … all render lists of these").
 *
 * FOUR TOUCH-ADAPTATIONS, each the web original's hover/pointer machinery dying on a
 * thumb:
 *  1. The remove control is ALWAYS VISIBLE (the web reveals it on group-hover — queue
 *     and message-actions precedent).
 *  2. With no onRemove wired it DISABLES rather than disappears — a control vanishing
 *     mid-press is the failure queue.tsx's shape prevents (upstream returns null).
 *  3. The inline chip ships at h-10, not the web's h-8: the house standard (queue.tsx)
 *     rejects a sub-40pt visual control, and RNR's size="icon" Button is exactly
 *     h-10 — the chip is control-height because a compliant remove control lives in it.
 *  4. AttachmentHoverCard/Trigger/Content do NOT ship — a hover preview is unreachable
 *     under a thumb (inline-citation precedent). The row itself carries preview + name;
 *     the detail surface, where wanted, is the consumer's composition.
 *
 * THE UPLOAD STATE IS DECLARED, NOT UPSTREAM: 'uploading' | 'done' | 'error' per the
 * wave brief, rendered as icon + label + accessibility (never color alone). The
 * lifecycle is the caller's; the state is only the display seam. `done` renders no
 * extra chrome — the chip is the proof.
 *
 * The web <video> preview does NOT ship (a media dependency for one thumbnail);
 * video chips fall to the category icon like every other non-image type, which is the
 * web original's own fallback affordance.
 */

const mediaCategoryIcons: Record<AttachmentMediaCategory, LucideIcon> = {
  image: ImageIcon,
  video: VideoIcon,
  audio: Music2Icon,
  document: FileTextIcon,
  unknown: PaperclipIcon,
};

type AttachmentsContextValue = { variant: AttachmentVariant };

const AttachmentsContext = React.createContext<AttachmentsContextValue | null>(null);

function useAttachmentsContext(): AttachmentsContextValue {
  // The web original defaults a stray part to "grid"; parity, including the leniency.
  return React.useContext(AttachmentsContext) ?? { variant: 'grid' };
}

type AttachmentContextValue = {
  data: AttachmentData;
  mediaCategory: AttachmentMediaCategory;
  state: AttachmentState;
  removable: boolean;
  remove: () => void;
  variant: AttachmentVariant;
};

const AttachmentContext = React.createContext<AttachmentContextValue | null>(null);

function useAttachmentContext(): AttachmentContextValue {
  const ctx = React.useContext(AttachmentContext);
  if (!ctx) throw new Error('Attachment components must be used within <Attachment>');
  return ctx;
}

type AttachmentsProps = Omit<ViewProps, 'children'> & {
  /** grid: right-aligned thumbnails · inline: compact chips · list: full-width rows. */
  variant?: AttachmentVariant;
  children?: React.ReactNode;
};

function Attachments({ variant = 'grid', className, children, ...props }: AttachmentsProps) {
  return (
    <AttachmentsContext.Provider value={{ variant }}>
      <View
        className={cn(
          'items-start gap-2',
          variant === 'list' ? 'flex-col' : 'flex-row flex-wrap',
          // The web grid container is ml-auto + w-fit: a right-aligned block. React
          // Native has auto margins too, but justify-end right-aligns every WRAPPED
          // line, which is what a chip grid in a column host actually needs.
          variant === 'grid' && 'justify-end self-end',
          className,
        )}
        {...props}
      >
        {children}
      </View>
    </AttachmentsContext.Provider>
  );
}

type AttachmentProps = Omit<ViewProps, 'children'> & {
  data: AttachmentData;
  /** The caller-owned transport lifecycle; defaults to `done` (no extra chrome). */
  state?: AttachmentState;
  /** Omit it and every remove control on this row DISABLES rather than disappears. */
  onRemove?: () => void;
  children?: React.ReactNode;
};

function Attachment({ data, state = 'done', onRemove, className, children, ...props }: AttachmentProps) {
  const { variant } = useAttachmentsContext();
  const mediaCategory = getMediaCategory(data.mimeType);
  const removable = typeof onRemove === 'function';
  const remove = React.useCallback(() => {
    onRemove?.();
  }, [onRemove]);
  const stateText = attachmentStateLabel(state);
  const label = getAttachmentLabel(data);

  const contextValue = React.useMemo<AttachmentContextValue>(
    () => ({ data, mediaCategory, state, removable, remove, variant }),
    [data, mediaCategory, state, removable, remove, variant],
  );

  return (
    <AttachmentContext.Provider value={contextValue}>
      {variant === 'list' ? (
        <Item
          variant="outline"
          className={cn('w-full rounded-lg p-3', className)}
          {...props}
        >
          {children}
        </Item>
      ) : (
        <View
          className={cn(
            variant === 'grid' && 'size-24 overflow-hidden rounded-lg',
            variant === 'inline' &&
              'h-10 flex-row items-center gap-1.5 rounded-md border border-border px-1.5',
            className,
          )}
          // Belt-and-braces (persona.tsx hardening rule): if the size class drops
          // from a stale stylesheet rebuild, an unsized tile fills all available
          // space — the wave-7 avatar balloon, exactly.
          style={
            variant === 'grid'
              ? { width: 96, height: 96 }
              : // The inline chip needs a BOUNDED width: Yoga gives a flex-1 child
                // zero basis inside a shrink-wrapping row (CSS min-content sizing,
                // which the web relies on, does not apply), so the filename Text
                // would measure zero and vanish. 240 caps the chip; numberOfLines
                // truncates the name inside it.
                { maxWidth: 240 }
          }
          {...props}
        >
          {children}
        </View>
      )}
    </AttachmentContext.Provider>
  );
}

/**
 * The media slot: the picked image when there is one, otherwise the category icon —
 * with the upload state taking the slot while a file is in flight or failed (an
 * uploading image has no meaningful preview yet, and the state is what the user needs
 * to see).
 */
function AttachmentPreview({ className }: { className?: string }) {
  const { data, mediaCategory, state, variant } = useAttachmentContext();

  // The grid tile is the one variant with no text inside. Scope the a11y grouping to
  // the PREVIEW leaf — announcing label + upload state — never the tile itself: an
  // `accessible` tile flattens the nested remove Button out of the a11y tree, and a
  // VoiceOver user could not remove an attachment (queue.tsx's QueueItemIndicator
  // established the leaf-scoping pattern for exactly this reason).
  const previewAccessibility =
    variant === 'grid'
      ? {
          accessible: true,
          accessibilityLabel: [getAttachmentLabel(data), attachmentStateLabel(state)]
            .filter(Boolean)
            .join(', '),
          accessibilityRole: 'image' as const,
        }
      : {};

  const wrapperClasses = cn(
    'items-center justify-center overflow-hidden',
    variant === 'grid' && 'size-full bg-muted',
    variant === 'inline' && 'size-5 rounded bg-background',
    variant === 'list' && 'size-12 rounded bg-muted',
    className,
  );
  // Belt-and-braces numeric sizing (persona.tsx hardening rule) — the class-based
  // sizes are new-file classes the engine has dropped before on stale rebuilds.
  const previewSize =
    variant === 'inline'
      ? { width: 20, height: 20 }
      : variant === 'list'
        ? { width: 48, height: 48 }
        : undefined;

  if (state !== 'done') {
    return (
      <View className={wrapperClasses} style={previewSize} {...previewAccessibility}>
        <Icon
          as={state === 'error' ? CircleAlertIcon : LoaderCircleIcon}
          size={variant === 'inline' ? 12 : 16}
          className={cn(
            variant === 'inline' ? 'size-3' : 'size-4',
            state === 'error' ? 'text-destructive' : 'text-muted-foreground',
          )}
        />
      </View>
    );
  }

  if (mediaCategory === 'image' && data.uri) {
    // Belt-and-braces numeric sizing (persona.tsx's hardening rule): an inline image
    // whose one size class drops on a stale stylesheet rebuild would otherwise lay
    // out at its intrinsic pixel size mid-composer.
    const size = variant === 'inline' ? 20 : variant === 'list' ? 48 : 96;
    return (
      <View className={wrapperClasses} style={previewSize} {...previewAccessibility}>
        <Image
          source={{ uri: data.uri }}
          resizeMode="cover"
          className="size-full"
          style={{ width: size, height: size }}
        />
      </View>
    );
  }

  // (continued previewAccessibility — applied on the done-state surface below too)

  return (
    <View className={wrapperClasses} style={previewSize} {...previewAccessibility}>
      <Icon
        as={mediaCategoryIcons[mediaCategory]}
        size={variant === 'inline' ? 12 : 16}
        className={cn(variant === 'inline' ? 'size-3' : 'size-4', 'text-muted-foreground')}
      />
    </View>
  );
}

type AttachmentInfoProps = {
  /** The mimeType under the name — the web original's default-off `showMediaType`. */
  showMediaType?: boolean;
  className?: string;
};

/**
 * Name and meta. Renders nothing on grid (a thumbnail needs no caption — the web
 * original returns null there too). The meta line carries the mimeType (opt-in) and
 * the formatted byte size (when the caller supplied sizeBytes — the data-schema shape
 * carries it for exactly this display; the web shows neither).
 */
function AttachmentInfo({ showMediaType = false, className }: AttachmentInfoProps) {
  const { data, state, variant } = useAttachmentContext();

  if (variant === 'grid') return null;

  const label = getAttachmentLabel(data);
  const stateText = attachmentStateLabel(state);
  const metaParts = [
    showMediaType ? data.mimeType : undefined,
    formatAttachmentSize(data.sizeBytes),
  ].filter((part): part is string => Boolean(part));

  const name = (
    <Text numberOfLines={1} className="text-sm font-medium text-foreground">
      {label}
    </Text>
  );
  const meta = metaParts.length > 0 && state === 'done'
    ? (
      <Text numberOfLines={1} className="text-xs text-muted-foreground">
        {metaParts.join(' · ')}
      </Text>
    )
    : null;
  const stateLine = stateText ? (
    <Text
      numberOfLines={1}
      className={cn('text-xs', state === 'error' ? 'text-destructive' : 'text-muted-foreground')}
    >
      {stateText}
    </Text>
  ) : null;

  if (variant === 'list') {
    return (
      <ItemContent className={className}>
        {name}
        {meta}
        {stateLine}
      </ItemContent>
    );
  }
  return (
    <View
      className={cn(
        // flex-1 only OUTSIDE the inline chip: the className's flexBasis:0 defeats
        // the content basis the shrink-wrapping chip needs (see style below).
        variant === 'inline' ? 'min-w-0' : 'min-w-0 flex-1',
        className,
      )}
      // In the inline chip the parent shrink-wraps, and Yoga gives a flexBasis-0
      // child ZERO width in that context (CSS min-content sizing does not apply) —
      // the filename would measure zero and vanish. Content basis + grow lets the
      // chip wrap to the name up to its 240 cap, then truncate.
      style={
        variant === 'inline' ? { flexGrow: 1, flexShrink: 1, flexBasis: 'auto' } : undefined
      }
    >
      {name}
      {meta}
      {stateLine}
    </View>
  );
}

type AttachmentRemoveProps = {
  /** The accessibility label — the web original's default is "Remove". */
  label?: string;
  className?: string;
};

/**
 * The remove control. ALWAYS VISIBLE, and DISABLED — not absent — when the row has no
 * onRemove (upstream hides it; queue.tsx documents why a vanishing control is worse).
 * The web's group-hover reveal and backdrop-blur are pointer machinery with no thumb.
 */
function AttachmentRemove({ label = 'Remove', className }: AttachmentRemoveProps) {
  const { removable, remove, variant } = useAttachmentContext();

  const button = (
    <Button
      variant="ghost"
      size="icon"
      disabled={!removable}
      onPress={remove}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !removable }}
      // House formula (queue/artifact precedent): RNR's h-10 + hitSlop 2/side = the
      // 44pt platform minimum, with no pixel of extra chrome.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn(
        'rounded-full',
        variant === 'grid' && 'absolute right-1 top-1 bg-background/80',
        className,
      )}
    >
      <Icon as={XIcon} size={16} className="text-muted-foreground" />
    </Button>
  );

  if (variant === 'list') {
    return <ItemActions>{button}</ItemActions>;
  }
  return button;
}

type AttachmentEmptyProps = {
  /** Overrides the web original's default "No attachments". */
  children?: string;
  className?: string;
};

/**
 * The empty state, composed on the shared `empty` primitive (the PRD's build-once
 * reuse ledger names attachments as one of its consumers) — tuned down from the
 * full-surface paddings to a composer strip.
 */
function AttachmentEmpty({ children, className }: AttachmentEmptyProps) {
  return (
    <Empty className={cn('flex-none gap-1 p-4', className)}>
      <EmptyTitle className="text-sm font-normal text-muted-foreground">
        {children ?? 'No attachments'}
      </EmptyTitle>
    </Empty>
  );
}

export {
  Attachment,
  AttachmentEmpty,
  AttachmentInfo,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
  useAttachmentContext,
  useAttachmentsContext,
};
export type { AttachmentData, AttachmentState, AttachmentVariant };
export type { AttachmentMediaCategory };
