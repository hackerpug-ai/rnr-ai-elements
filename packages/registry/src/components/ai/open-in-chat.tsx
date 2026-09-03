import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/registry/{engine}/components/ui/dropdown-menu';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { isSafeOpenUrl } from '@/registry/{engine}/lib/url';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  BotIcon,
  BoxIcon,
  ChevronDownIcon,
  ExternalLinkIcon,
  MessageCircleIcon,
  SparkleIcon,
  SparklesIcon,
  TriangleIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Linking } from 'react-native';
import {
  openInProviderUrl,
  OPEN_IN_PROVIDER_TITLES,
  type OpenInProvider,
} from './open-in-chat.logic';

/**
 * OpenIn — the "open this query in another chat" hand-off (UC-CHAT-05 AC-4: send the
 * current conversation to an external chat application).
 *
 * THE PRD VERDICT IS PORT-ADAPTED, PURE-RNR: "Same buttons and same targets, but
 * window opening is replaced by the platform link handler, and unavailable targets
 * must be hidden rather than opened into a dead tab." All three clauses, realized:
 *
 *  - SAME BUTTONS: the web original is a DropdownMenu of platform rows (icon + title +
 *    external-link mark) behind an "Open in chat" trigger. The port is the same menu
 *    through RNR's dropdown-menu — the same six targets, each title byte-verbatim
 *    (open-in-chat.logic).
 *  - SAME TARGETS: the URL is the contract. The web templates are reproduced exactly
 *    (including `hints=search` on ChatGPT and URLSearchParams's `+`-for-space), so the
 *    platform receives the query the web would have delivered.
 *  - PLATFORM LINK HANDLER: the anchor's target="_blank" becomes Linking.openURL,
 *    guarded by lib/url's http/https allowlist (sources precedent — the allowlist is
 *    the whole guard; `rel` has no RN equivalent). A caller-supplied `onOpen`
 *    REPLACES the hop (speech-input precedent: caller-supplied contract); re-apply
 *    `isSafeOpenUrl` in your own handler if you open URLs yourself.
 *  - UNAVAILABLE TARGETS ARE HIDDEN, NOT OPENED: composition is the mechanism — the
 *    consumer mounts only the rows that exist for their users, exactly as the web
 *    original composes only the items it wants. There is no "dead tab" on a phone, but
 *    a target the caller hides costs one line of JSX; a target the component guessed
 *    at would cost a broken promise. A REFUSED or FAILED open never dies silently:
 *    `onOpenError` surfaces it.
 *
 * THE BRAND MARKS ARE A DECLARED SUBSTITUTION: the web rows carry inline SVG brand
 * paths — web assets, not behavior. The rows ship themed lucide marks in the same
 * slot (T3 keeps the web original's own MessageCircleIcon choice); the title text
 * carries the identity, so the icon is never the sole channel. A consumer who wants
 * brand marks composes OpenInItem rows themselves — the generic parts are exported
 * for exactly that.
 */

type OpenInContextValue = {
  query: string;
  onOpen?: (url: string, provider: OpenInProvider) => void;
  onOpenError?: (error: Error) => void;
};

const OpenInContext = React.createContext<OpenInContextValue | null>(null);

function useOpenIn(): OpenInContextValue {
  const ctx = React.useContext(OpenInContext);
  // Upstream trap, message byte-verbatim.
  if (!ctx) throw new Error('OpenIn components must be used within an OpenIn provider');
  return ctx;
}

type OpenInProps = OpenInContextValue & {
  children?: React.ReactNode;
};

function OpenIn({ query, onOpen, onOpenError, children }: OpenInProps) {
  const contextValue = React.useMemo<OpenInContextValue>(
    () => ({ query, onOpen, onOpenError }),
    [query, onOpen, onOpenError],
  );

  return (
    <OpenInContext.Provider value={contextValue}>
      <DropdownMenu>{children}</DropdownMenu>
    </OpenInContext.Provider>
  );
}

type OpenInTriggerProps = {
  /** Overrides the default "Open in chat" button (web: children on the trigger). */
  children?: React.ReactNode;
  className?: string;
};

function OpenInTrigger({ children, className }: OpenInTriggerProps) {
  return (
    <DropdownMenuTrigger asChild>
      {children ?? (
        // The web trigger's exact label and chevron.
        <Button variant="outline" className={className}>
          <Text>Open in chat</Text>
          <Icon as={ChevronDownIcon} size={16} className="text-muted-foreground" />
        </Button>
      )}
    </DropdownMenuTrigger>
  );
}

type OpenInContentProps = React.ComponentProps<typeof DropdownMenuContent> & {
  children?: React.ReactNode;
};

/** The web content's align="start" and width, with insets flowing to the primitive. */
function OpenInContent({ className, children, ...props }: OpenInContentProps) {
  return (
    <DropdownMenuContent align="start" className={cn('w-60', className)} {...props}>
      {children}
    </DropdownMenuContent>
  );
}

type OpenInLabelProps = React.ComponentProps<typeof DropdownMenuLabel>;

function OpenInLabel(props: OpenInLabelProps) {
  return <DropdownMenuLabel {...props} />;
}

type OpenInItemProps = React.ComponentProps<typeof DropdownMenuItem>;

function OpenInItem(props: OpenInItemProps) {
  return <DropdownMenuItem {...props} />;
}

type OpenInSeparatorProps = React.ComponentProps<typeof DropdownMenuSeparator>;

function OpenInSeparator(props: OpenInSeparatorProps) {
  return <DropdownMenuSeparator {...props} />;
}

/** The row's leading mark — lucide stand-ins for the web's inline brand SVGs. */
const providerIcons: Record<OpenInProvider, typeof BotIcon> = {
  chatgpt: BotIcon,
  claude: SparkleIcon,
  cursor: BoxIcon,
  scira: SparklesIcon,
  // The web original uses this exact lucide mark for T3.
  t3: MessageCircleIcon,
  v0: TriangleIcon,
};

type OpenInProviderItemProps = {
  provider: OpenInProvider;
  className?: string;
};

/**
 * One platform row. Pressing builds the web template's URL and hands it to onOpen, or
 * opens it through the guarded platform link handler.
 */
function OpenInProviderItem({ provider, className }: OpenInProviderItemProps) {
  const { query, onOpen, onOpenError } = useOpenIn();
  const IconMark = providerIcons[provider];
  const title = OPEN_IN_PROVIDER_TITLES[provider];

  function handlePress() {
    const url = openInProviderUrl(provider, query);
    if (onOpen) {
      onOpen(url, provider);
      return;
    }
    if (!isSafeOpenUrl(url)) {
      onOpenError?.(new Error(`Refused to open a non-http(s) URL: ${url}`));
      return;
    }
    Linking.openURL(url).catch((error: Error) => onOpenError?.(error));
  }

  return (
    <DropdownMenuItem onPress={handlePress} className={cn('gap-2', className)}>
      <Icon as={IconMark} size={16} className="text-muted-foreground" />
      <Text numberOfLines={1} className="flex-1">
        {title}
      </Text>
      <Icon as={ExternalLinkIcon} size={14} className="shrink-0 text-muted-foreground" />
    </DropdownMenuItem>
  );
}

/** The six web targets, each byte-verbatim on title and URL template. */
function OpenInChatGPT(props: Omit<OpenInProviderItemProps, 'provider'>) {
  return <OpenInProviderItem provider="chatgpt" {...props} />;
}

function OpenInClaude(props: Omit<OpenInProviderItemProps, 'provider'>) {
  return <OpenInProviderItem provider="claude" {...props} />;
}

function OpenInCursor(props: Omit<OpenInProviderItemProps, 'provider'>) {
  return <OpenInProviderItem provider="cursor" {...props} />;
}

function OpenInScira(props: Omit<OpenInProviderItemProps, 'provider'>) {
  return <OpenInProviderItem provider="scira" {...props} />;
}

function OpenInT3(props: Omit<OpenInProviderItemProps, 'provider'>) {
  return <OpenInProviderItem provider="t3" {...props} />;
}

function OpenInv0(props: Omit<OpenInProviderItemProps, 'provider'>) {
  return <OpenInProviderItem provider="v0" {...props} />;
}

export {
  OpenIn,
  OpenInChatGPT,
  OpenInClaude,
  OpenInContent,
  OpenInCursor,
  OpenInItem,
  OpenInLabel,
  OpenInScira,
  OpenInSeparator,
  OpenInT3,
  OpenInTrigger,
  OpenInv0,
  useOpenIn,
};
export type { OpenInProvider };
