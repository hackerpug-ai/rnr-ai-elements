import { Avatar, AvatarFallback } from '@/registry/{engine}/components/ui/avatar';
import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item } from '@/registry/{engine}/components/ui/item';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { statusColor } from '@/registry/{engine}/lib/status';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  FileIcon,
  GitCommitIcon,
  MinusIcon,
  PlusIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import {
  commitFileStatusMeta,
  formatRelativeDate,
} from './commit.logic';
import type { CommitFileStatus as CommitFileStatusValue } from './commit.logic';

/**
 * Commit — a commit reference row with its changed files behind a disclosure (UC web
 * original: a Collapsible card — hash, message, author, timestamp, and a file list
 * with per-file +/- counts). UC-CODE-01 AC-2 is the binding acceptance: view hash,
 * message, and author, and copy the hash with one tap.
 *
 * COMPOSITION: the container is the web's Collapsible with the card look (rounded-lg
 * border bg-card — the porting verdict's "Card of hash, message, and author" as the
 * Card-shaped Collapsible the web actually renders; queue.tsx's QueueSection is the
 * same composition). File rows compose the `item` atom — the house list row. The hash
 * renders as a Badge chip (task-brief contract) with the git-commit mark and the house
 * mono family; `shortSha(hash)` from commit.logic is the expected text.
 *
 * TOUCH ADAPTATIONS, DECLARED:
 *  - the web's affordance for "this header opens files" is a cursor hover — dead under
 *    a thumb — so the header carries the house rotating chevron (queue/task precedent,
 *    ReduceMotion.System);
 *  - the web's CommitActions wraps clicks in stopPropagation so pressing Copy does not
 *    toggle the disclosure. React Native's responder system hands the press to the
 *    deepest touchable and does not bubble it to the trigger, so no propagation dance
 *    exists — a plain nested Button is already correct;
 *  - the author avatar gets the persona.tsx hardening (explicit numeric size beside
 *    the class): the wave-7 device incident was EXACTLY an avatar's fallback blowing
 *    up to full-screen when a stale stylesheet dropped its size class mid-transcript.
 *
 * TIMESTAMP: web's Intl.RelativeTimeFormat is hand-rolled in commit.logic (Hermes
 * variance; Vitest-ownable with injected time) and rendered as plain text.
 */

type CommitContextValue = { open: boolean };

const CommitContext = React.createContext<CommitContextValue | null>(null);

function useCommit() {
  const ctx = React.useContext(CommitContext);
  if (!ctx) throw new Error('Commit sub-components must be used within <Commit>');
  return ctx;
}

type CommitProps = Omit<ViewProps, 'children'> & {
  /** The web Collapsible's default: closed. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Commit({ defaultOpen = false, onOpenChange, className, children, ...props }: CommitProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <CommitContext.Provider value={{ open }}>
      <Collapsible
        open={open}
        onOpenChange={handleOpenChange}
        className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}
        {...props}
      >
        {children}
      </Collapsible>
    </CommitContext.Provider>
  );
}

/** House chevron (queue/task precedent): 250ms open, 200ms close, system-reduced. */
function Chevron({ open }: { open: boolean }) {
  const rotation = useSharedValue(open ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(open ? 1 : 0, {
      duration: open ? 250 : 200,
      reduceMotion: ReduceMotion.System,
    });
  }, [open, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 180}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Icon as={ChevronDownIcon} size={14} className="shrink-0 text-muted-foreground" />
    </Animated.View>
  );
}

function CommitHeader({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  const { open } = useCommit();

  return (
    <CollapsibleTrigger
      className={cn(
        'flex-row items-center gap-3 p-3 text-left active:bg-accent',
        Platform.select({ web: 'transition-opacity hover:opacity-80' }),
        'active:opacity-80',
        className,
      )}
      {...props}
    >
      <View className="min-w-0 flex-1 flex-row items-center gap-3">{children}</View>
      <Chevron open={open} />
    </CollapsibleTrigger>
  );
}

/** The hash chip: the git-commit mark plus the caller's short SHA in the house mono. */
function CommitHash({ children, className }: { children: string; className?: string }) {
  return (
    <Badge variant="outline" className={cn('shrink-0', className)}>
      <Icon as={GitCommitIcon} size={12} className="text-muted-foreground" />
      <Text style={monoStyle} className="text-xs text-muted-foreground">
        {children}
      </Text>
    </Badge>
  );
}

function CommitMessage({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text numberOfLines={2} className={cn('text-sm font-medium text-foreground', className)} {...props} />;
}

/** Metadata row. Publishes the muted-xs pair so its Text children style without classes. */
function CommitMetadata({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <TextClassContext.Provider value="text-xs text-muted-foreground">
      <View className={cn('flex-row flex-wrap items-center gap-2', className)} {...props}>
        {children}
      </View>
    </TextClassContext.Provider>
  );
}

function CommitSeparator({ children, className }: { children?: string; className?: string }) {
  return (
    <Text className={cn('text-xs text-muted-foreground', className)}>{children ?? '•'}</Text>
  );
}

function CommitInfo({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('min-w-0 flex-1 gap-1', className)} {...props}>
      {children}
    </View>
  );
}

function CommitAuthor({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('flex-row items-center gap-2', className)} {...props}>
      {children}
    </View>
  );
}

type CommitAuthorAvatarProps = {
  /** The initials. Required — the fallback is the whole avatar until a URI ships. */
  initials: string;
  className?: string;
};

function CommitAuthorAvatar({ initials, className }: CommitAuthorAvatarProps) {
  return (
    // Numeric style sizing beside the class is persona.tsx's hardening rule: this is
    // the exact element whose size class was observed dropping on a stale uniwind
    // rebuild, ballooning a percent-sized fallback to full-screen mid-transcript.
    <Avatar alt={initials} className={cn('size-8', className)} style={{ width: 32, height: 32 }}>
      <AvatarFallback>
        <Text className="text-xs font-medium">{initials}</Text>
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * The relative day label ("yesterday", "5 days ago"), computed inline from the pure
 * formatter. The web's `<time dateTime>` attribute is DOM-only; the visible text is the
 * behavior. `children` overrides, exactly as the web allows.
 */
function CommitTimestamp({ date, children, className }: { date: Date; children?: string; className?: string }) {
  return (
    <Text className={cn('text-xs text-muted-foreground', className)}>
      {children ?? formatRelativeDate(date)}
    </Text>
  );
}

/**
 * Trailing controls. RN's responder system gives the press to the deepest touchable —
 * the nested buttons never toggle the disclosure, which is what the web's
 * stopPropagation wrapper was for.
 */
function CommitActions({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('flex-row items-center gap-1', className)} {...props}>
      {children}
    </View>
  );
}

type CommitCopyButtonProps = {
  /** The hash to copy — short or full, the caller's choice. */
  hash: string;
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
};

/** UC-CODE-01 AC-2's one-tap copy. Flip-and-revert per the code-block precedent. */
function CommitCopyButton({ hash, timeout = 2000, onCopy, onError, className }: CommitCopyButtonProps) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await Clipboard.setStringAsync(hash);
      setCopied(true);
      onCopy?.();
      timer.current = setTimeout(() => setCopied(false), timeout);
    } catch (error) {
      // Never silent — the web original calls onError and so do we.
      onError?.(error);
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={copy}
      accessibilityLabel={copied ? 'Copied' : 'Copy commit hash'}
      // House formula (confirmation.tsx): RNR's h-10 (40pt) + hitSlop 2/side = the 44pt
      // platform minimum, with no pixel of extra chrome.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('shrink-0 rounded-full', className)}
    >
      <Icon as={copied ? CheckIcon : CopyIcon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

function CommitContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('border-t border-border p-3', className)} {...props}>
      {children}
    </CollapsibleContent>
  );
}

function CommitFiles({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('gap-1', className)} {...props}>
      {children}
    </View>
  );
}

/**
 * The file row, composed on the item atom — the house list row (queue precedent).
 * Children are the fine-grained parts below, exactly as the web composes its div row.
 */
function CommitFile({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <Item className={cn('gap-2 rounded-sm px-1 py-0.5', className)} {...props}>
      {children}
    </Item>
  );
}

function CommitFileInfo({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('min-w-0 flex-1 flex-row items-center gap-2', className)} {...props}>
      {children}
    </View>
  );
}

function CommitFileIcon({ className }: { className?: string }) {
  return <Icon as={FileIcon} size={14} className={cn('shrink-0 text-muted-foreground', className)} />;
}

/**
 * status → letter + tone from the pure map. The letter is the web original's default
 * (A/M/D/R); `children` overrides, exactly as the web allows. The tone is the
 * compressed map's — the letter keeps color from being the sole channel (WCAG 1.4.1).
 */
function CommitFileStatus({ status, children, className }: { status: CommitFileStatusValue; children?: string; className?: string }) {
  const meta = commitFileStatusMeta(status);

  return (
    <Text
      style={monoStyle}
      accessibilityLabel={`Status: ${status}`}
      className={cn('shrink-0 text-xs font-medium', meta.className, className)}
    >
      {children ?? meta.label}
    </Text>
  );
}

function CommitFilePath({ children, className }: { children: string; className?: string }) {
  return (
    <Text style={monoStyle} numberOfLines={1} className={cn('flex-1 text-xs text-foreground', className)}>
      {children}
    </Text>
  );
}

function CommitFileChanges({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <TextClassContext.Provider value="text-xs">
      <View className={cn('flex-row shrink-0 items-center gap-1', className)} {...props}>
        {children}
      </View>
    </TextClassContext.Provider>
  );
}

/** The web's +count span: NULL at zero and below — a file with no additions shows no +0. */
function CommitFileAdditions({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <View className={cn('flex-row items-center gap-0.5', className)}>
      <Icon as={PlusIcon} size={12} className={statusColor.success} />
      <Text style={monoStyle} className={cn('text-xs', statusColor.success)}>
        {count}
      </Text>
    </View>
  );
}

/** The deletions twin — the web's red, our text-destructive escape hatch. */
function CommitFileDeletions({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <View className={cn('flex-row items-center gap-0.5', className)}>
      <Icon as={MinusIcon} size={12} className={statusColor.error} />
      <Text style={monoStyle} className={cn('text-xs', statusColor.error)}>
        {count}
      </Text>
    </View>
  );
}

export {
  Commit,
  CommitActions,
  CommitAuthor,
  CommitAuthorAvatar,
  CommitContent,
  CommitCopyButton,
  CommitFile,
  CommitFileAdditions,
  CommitFileChanges,
  CommitFileDeletions,
  CommitFileIcon,
  CommitFileInfo,
  CommitFilePath,
  CommitFileStatus,
  CommitFiles,
  CommitHash,
  CommitHeader,
  CommitInfo,
  CommitMessage,
  CommitMetadata,
  CommitSeparator,
  CommitTimestamp,
  useCommit,
};
