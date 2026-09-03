import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/registry/{engine}/components/ui/item';
import { Text } from '@/registry/{engine}/components/ui/text';
import { hostnameOf, isSafeOpenUrl } from '@/registry/{engine}/lib/url';
import { cn } from '@/registry/{engine}/lib/utils';
import { BookIcon, ChevronDownIcon, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { Image, Linking, Platform, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { usedSourcesLabel, type SourceLike } from './sources.logic';

/**
 * Sources — the grouped sources behind an answer (UC web original: a Collapsible whose
 * trigger reads "Used N sources" and whose rows are anchors).
 *
 * THE PRD VERDICT IS A COLLAPSIBLE LIST OF SOURCE ROWS — "RNR collapsible, separator,
 * and text" — NOT a table, and the current web original agrees (Sources/SourcesTrigger/
 * SourcesContent/Source; there is no SourcesTable upstream). Rows compose the `item`
 * primitive, the house list row (queue.tsx precedent), which is where the separator and
 * text rules live.
 *
 * UC-CHAT-05, AC BY AC:
 *  - AC-1: expanding the list shows each source's TITLE AND DOMAIN — so each row carries
 *    a second line with the hostname (lib/url's no-throw extractor), which the web gets
 *    from the same value its favicon pipeline would use. No favicon fetch ships: RN has
 *    no favicon service without a new dependency, and the web row's icon is a book, not
 *    a favicon. A caller-supplied `faviconUri` (SourceData's own optional field) renders
 *    in the icon slot instead — declared, opt-in.
 *  - AC-2 belongs to inline-citation (press, not hover) — this list is the detail
 *    surface the citation chip's callback composes into a popover/sheet.
 *  - AC-3: the web row is an anchor (target="_blank" rel="noreferrer"). RN's platform
 *    link handler is Linking.openURL, guarded by lib/url's http/https allowlist — the
 *    data-schema doc's security-review surface. `rel` has no RN equivalent; the
 *    allowlist is the whole guard. A caller-supplied `onOpen` REPLACES the hop —
 *    re-apply `isSafeOpenUrl` in your handler if you open URLs yourself, or you
 *    reintroduce the javascript:/file: footgun the default path guards against.
 *    (speech-input precedent: caller-supplied contract).
 *
 * The web's data-[state] slide on the content is the collapsible's own motion on
 * native; the chevron carries the house rotation (queue/task precedent,
 * ReduceMotion.System).
 */

type SourcesContextValue = { open: boolean };

const SourcesContext = React.createContext<SourcesContextValue | null>(null);

function useSources() {
  const ctx = React.useContext(SourcesContext);
  if (!ctx) throw new Error('Sources sub-components must be used within <Sources>');
  return ctx;
}

type SourcesProps = Omit<ViewProps, 'children'> & {
  /** The web Collapsible's default: closed. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function Sources({ defaultOpen = false, onOpenChange, className, children, ...props }: SourcesProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  return (
    <SourcesContext.Provider value={{ open }}>
      <Collapsible open={open} onOpenChange={handleOpenChange} className={className} {...props}>
        {children}
      </Collapsible>
    </SourcesContext.Provider>
  );
}

type SourcesTriggerProps = {
  /** The count the web trigger reads: "Used N sources". */
  count: number;
  /** Overrides the default label, exactly as the web trigger's children do. */
  children?: React.ReactNode;
  className?: string;
};

function SourcesTrigger({ count, children, className }: SourcesTriggerProps) {
  const { open } = useSources();
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
    <CollapsibleTrigger
      className={cn(
        'flex-row items-center gap-2 rounded-md py-1 active:bg-accent',
        Platform.select({ web: 'transition-colors hover:bg-accent/50' }),
        className,
      )}
    >
      {children ?? (
        <Text className="flex-1 text-left text-sm font-medium text-primary">
          {usedSourcesLabel(count)}
        </Text>
      )}
      <Animated.View style={style}>
        <Icon as={ChevronDownIcon} size={14} className="text-primary" />
      </Animated.View>
    </CollapsibleTrigger>
  );
}

function SourcesContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('mt-3 gap-2', className)} {...props}>
      {children}
    </CollapsibleContent>
  );
}

/** The row's leading mark: the caller's favicon when supplied, the web's book otherwise. */
function SourceMedia({ source }: { source: SourceLike }) {
  if (source.faviconUri) {
    // Numeric style sizing alongside the class (persona.tsx's hardening rule): an
    // inline image whose one size class drops on a stale stylesheet rebuild would
    // otherwise lay out at its intrinsic pixel size mid-transcript.
    return (
      <Image
        source={{ uri: source.faviconUri }}
        resizeMode="contain"
        className="size-4 rounded-sm bg-muted/50"
        style={{ width: 16, height: 16 }}
      />
    );
  }
  return <Icon as={BookIcon} size={16} className="text-muted-foreground" />;
}

type SourceProps = {
  /** Where the row opens — the platform link handler, behind the scheme allowlist. */
  href: string;
  /** The source title (the web anchor's visible text). */
  title: string;
  /** Opt-in favicon for the icon slot. RN has no favicon service without a new dep. */
  faviconUri?: string;
  /** Replaces the default Linking hop (caller-supplied contract, speech-input precedent). */
  onOpen?: (href: string) => void;
  /** Fires when the allowlist refuses the URL or the platform open fails. Never silent. */
  onOpenError?: (error: Error) => void;
  className?: string;
};

function Source({ href, title, faviconUri, onOpen, onOpenError, className }: SourceProps) {
  const domain = hostnameOf(href);

  function handlePress() {
    if (onOpen) {
      onOpen(href);
      return;
    }
    if (!isSafeOpenUrl(href)) {
      onOpenError?.(new Error(`Refused to open a non-http(s) URL: ${href}`));
      return;
    }
    Linking.openURL(href).catch((error: Error) => onOpenError?.(error));
  }

  return (
    <Item
      onPress={handlePress}
      // The web row is an anchor — announce "link", not "button" (Item's default).
      accessibilityRole="link"
      accessibilityLabel={`${title}, ${domain}`}
      className={cn('py-2', className)}
    >
      <ItemMedia>
        <SourceMedia source={{ title, url: href, faviconUri }} />
      </ItemMedia>
      <ItemContent>
        <ItemTitle>{title}</ItemTitle>
        <ItemDescription>{domain}</ItemDescription>
      </ItemContent>
    </Item>
  );
}

export { Sources, SourcesContent, SourcesTrigger, Source, useSources };
export type { SourceLike };
