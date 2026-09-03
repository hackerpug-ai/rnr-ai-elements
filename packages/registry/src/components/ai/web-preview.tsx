import { InputGroup, InputGroupInput } from '@/registry/{engine}/components/ui/input-group';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { hostnameOf } from '@/registry/{engine}/lib/url';
import { cn } from '@/registry/{engine}/lib/utils';
import { TriangleAlertIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import WebView from 'react-native-webview';
import { normalizePreviewUrl } from './web-preview.logic';

/**
 * WebPreview — a live page rendered inside the app (UC-CODE-03).
 *
 * THE PRD VERDICT IS NATIVE-SUBSTITUTE: "An iframe with a URL bar and console.
 * Replaced by a native webview with the same URL bar and reload affordance, shipped as
 * an opt-in registry entry that declares react-native-webview as a peer dependency.
 * The console pane does not port and is dropped." Every clause, realized:
 *
 *  - NATIVE WEBVIEW: the body is react-native-webview, imported as a PEER. The
 *    registry package itself takes NO dependency on it — not even for typecheck, which
 *    reads the ambient boundary declaration in types/rnr-boundary.d.ts instead — so a
 *    consumer who never installs this item never resolves the module (AC-4: the rest
 *    of the library builds without it). The emitted registry item records
 *    `dependencies: ["react-native-webview"]`, which is the at-install notice (AC-2).
 *
 *  - THE SANDBOX MAPPING IS EXPLICIT (the UC-CODE-03 security scenario: "the iframe
 *    sandbox attribute has NO WebView equivalent"). Upstream hardcodes
 *    `sandbox="allow-scripts allow-same-origin allow-forms allow-popups
 *    allow-presentation"` on the iframe; a webview grants far more by default, so the
 *    guard is a fixed prop set, not a prop the caller can loosen:
 *      originWhitelist={['https://*', 'http://*']}  → only web origins may be navigated
 *                                                      (lib/url's allowlist, at the
 *                                                      webview layer);
 *      javaScriptEnabled (pinned true)               → the upstream sandbox's
 *                                                      allow-scripts GRANT, pinned
 *                                                      explicitly so a default flip
 *                                                      upstream cannot silently
 *                                                      change the posture — live
 *                                                      pages need it (AC-1);
 *      allowFileAccess={false}                       → no file:// access;
 *      allowFileAccessFromFileURLs={false} +
 *      allowUniversalAccessFromFileURLs={false}      → no file:// page reading other
 *                                                      file:// content;
 *      setSupportMultipleWindows={false}             → window.open cannot spawn windows
 *                                                      (the Android z-order
 *                                                      clickjacking vector; the
 *                                                      "multiple-windows" lockdown).
 *    NOT portable and not claimed: the iframe's allow-top-navigation/modals denials —
 *    a webview IS the top level; alert()/confirm() render platform dialogs exactly as
 *    a non-sandboxed page would.
 *
 *  - THE GUARD IS ALSO IN THE DATA: every commit passes normalizePreviewUrl
 *    (web-preview.logic, Vitest-owned) — scheme-less drafts gain https, loopback hosts
 *    gain http, and any javascript:/data:/file: draft is refused — and the BODY
 *    normalizes AGAIN at render, because the context can be fed from caller state.
 *    The check is never downgraded to a warning: a refused URL renders the empty
 *    placeholder, never a navigation. `onRefuse` on WebPreviewUrl reports the refusal
 *    (sources.tsx's never-silent law).
 *
 *  - AC-3, FAILED LOAD IS EXPLICIT: onError and onRenderProcessGone render a failure
 *    panel — icon, "Preview failed to load", the failing host, and a Retry wired to
 *    the context's reload — never a blank white view. HTTP error PAGES (4xx/5xx
 *    bodies) are deliberately NOT failures: the web iframe renders them as content,
 *    and so does the webview (parity; wiring onHttpError would additionally
 *    false-fail on Android's per-subresource http-error callbacks).
 *
 *  - SAME URL BAR, RELOAD AFFORDANCE: the upstream part set ports one-for-one —
 *    WebPreview (context state), WebPreviewNavigation, WebPreviewNavigationButton,
 *    WebPreviewUrl (placeholder "Enter URL...", Enter commits, derived-state sync),
 *    WebPreviewBody (the `loading` node). Two DECLARED divergences, both on the
 *    record: the web NavigationButton's tooltip becomes the accessibility `label`
 *    (hover is dead under a thumb), and the reload command rides the CONTEXT
 *    (`useWebPreview().reload()`) because the web's consumer-wired iframe ref has no
 *    RN counterpart — the context exposes exactly what the verdict names.
 *
 *  - THE CONSOLE PANE IS DROPPED, per the verdict: no WebPreviewConsole part and no
 *    consoleOpen in the context state.
 *
 * SIZING: the root is flex-1 inside a column — give the host a bounded height (the
 * web's `size-full` needs a sized parent here too). The webview itself takes NO
 * className: it is a third-party codegen component, and routing className into it
 * would need engine-specific cssInterop, which the styling contract forbids in
 * registry source. It fills its wrapper through numeric width/height — the same
 * belt-and-braces slot sources.tsx's favicon Image uses.
 */

type WebPreviewContextValue = {
  /** The committed URL — normalized, or '' when nothing is loaded. */
  url: string;
  /** Commit a URL: upstream's setUrl name, firing onUrlChange exactly as upstream does. */
  setUrl: (url: string) => void;
  /** The verdict's reload affordance: the webview's reload command (no-op unmounted). */
  reload: () => void;
  /** The body registers its webview instance here so reload reaches it. */
  attachWebview: (instance: WebView | null) => void;
};

const WebPreviewContext = React.createContext<WebPreviewContextValue | null>(null);

function useWebPreview() {
  const ctx = React.useContext(WebPreviewContext);
  // Upstream trap, message byte-verbatim.
  if (!ctx) {
    throw new Error('WebPreview components must be used within a WebPreview');
  }
  return ctx;
}

export type WebPreviewProps = ViewProps & {
  /** The initial URL. Committed as-is; the body normalizes before navigating. */
  defaultUrl?: string;
  /** Fires on every COMMIT (Enter in the URL bar), never per keystroke — upstream contract. */
  onUrlChange?: (url: string) => void;
  children?: React.ReactNode;
};

function WebPreview({ defaultUrl = '', onUrlChange, className, children, ...props }: WebPreviewProps) {
  const [url, setUrlState] = React.useState(defaultUrl);
  const webviewRef = React.useRef<WebView | null>(null);

  const attachWebview = React.useCallback((instance: WebView | null) => {
    webviewRef.current = instance;
  }, []);

  const handleUrlChange = React.useCallback(
    (nextUrl: string) => {
      setUrlState(nextUrl);
      onUrlChange?.(nextUrl);
    },
    [onUrlChange],
  );

  const reload = React.useCallback(() => {
    // No webview mounted → a no-op, never a pretend reload.
    webviewRef.current?.reload();
  }, []);

  const contextValue = React.useMemo<WebPreviewContextValue>(
    () => ({ url, setUrl: handleUrlChange, reload, attachWebview }),
    [url, handleUrlChange, reload, attachWebview],
  );

  return (
    <WebPreviewContext.Provider value={contextValue}>
      <View
        // overflow-hidden is a native addition: RN does not clip children to a rounded
        // border, and an unclipped webview pokes past the corners.
        className={cn('flex-1 flex-col overflow-hidden rounded-lg border border-border bg-card', className)}
        {...props}
      >
        {children}
      </View>
    </WebPreviewContext.Provider>
  );
}

type WebPreviewNavigationProps = ViewProps & {
  children?: React.ReactNode;
};

/** The control row — upstream's `flex items-center gap-1 border-b p-2`, flex-row explicit. */
function WebPreviewNavigation({ className, children, ...props }: WebPreviewNavigationProps) {
  return (
    <View
      className={cn('flex-row items-center gap-1 border-b border-border p-2', className)}
      {...props}
    >
      {children}
    </View>
  );
}

type WebPreviewNavigationButtonProps = {
  onPress?: () => void;
  disabled?: boolean;
  /**
   * The web tooltip's replacement (hover is dead under a thumb): the accessibility
   * label. Required — an icon-only button without one is a silent target.
   */
  label: string;
  children?: React.ReactNode;
  className?: string;
};

/**
 * A ghost icon button, mountable OUTSIDE a WebPreview root (the upstream test corpus
 * does exactly that — so this part reads no context).
 */
function WebPreviewNavigationButton({
  onPress,
  disabled,
  label,
  children,
  className,
}: WebPreviewNavigationButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      // House formula: RNR's h-10 (40pt) + hitSlop 2/side = the 44pt platform minimum.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={className}
    >
      {children}
    </Button>
  );
}

type WebPreviewUrlProps = {
  /** Fully controls the field's draft, upstream's value passthrough. */
  value?: string;
  /** Per-keystroke passthrough, upstream's onChange. */
  onChangeText?: (text: string) => void;
  /** Fires with the NORMALIZED url on Enter, alongside the root's onUrlChange. */
  onUrlCommit?: (url: string) => void;
  /** A non-empty draft the allowlist refused. Never silent, never navigated. */
  onRefuse?: (raw: string) => void;
  /** Upstream's placeholder, byte-verbatim by default. */
  placeholder?: string;
  className?: string;
};

/**
 * The URL bar, composed on the registered InputGroup atom exactly as the web composes
 * its own Input. Enter commits (the soft keyboard's "go" key); typing does not.
 * Derived-state sync: when the context URL changes from outside (the caller's state),
 * the draft follows it — the upstream pattern, kept.
 */
function WebPreviewUrl({
  value,
  onChangeText,
  onUrlCommit,
  onRefuse,
  placeholder = 'Enter URL...',
  className,
}: WebPreviewUrlProps) {
  const { url, setUrl } = useWebPreview();
  const [prevUrl, setPrevUrl] = React.useState(url);
  const [draft, setDraft] = React.useState(url);

  if (url !== prevUrl) {
    setPrevUrl(url);
    setDraft(url);
  }

  function handleCommit() {
    const trimmed = draft.trim();
    if (!trimmed) {
      // The web original commits the empty string (the iframe goes blank); so does the
      // port — the body renders its empty placeholder. Clearing is a real commit.
      setUrl('');
      onUrlCommit?.('');
      return;
    }
    const normalized = normalizePreviewUrl(trimmed);
    if (!normalized) {
      // Refused (javascript:, data:, file:, garbage). The field keeps the draft so the
      // user can see and fix what was wrong; the caller is told, never silently.
      onRefuse?.(draft);
      return;
    }
    setUrl(normalized);
    onUrlCommit?.(normalized);
  }

  return (
    <InputGroup className={cn('min-w-0 flex-1', className)}>
      <InputGroupInput
        value={value ?? draft}
        onChangeText={(text: string) => {
          setDraft(text);
          onChangeText?.(text);
        }}
        onSubmitEditing={handleCommit}
        placeholder={placeholder}
        // Keyboard-proofing for an address field (snippet.tsx's field rules).
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        accessibilityLabel="Preview URL"
      />
    </InputGroup>
  );
}

type WebPreviewBodyProps = {
  /** Overrides the context URL for this body — upstream's src passthrough. */
  src?: string;
  /** Shown as an overlay while the webview reports loading. Upstream's `loading` node. */
  loading?: React.ReactNode;
  className?: string;
};

/**
 * The webview itself. The committed URL was already normalized at the bar, but the
 * context can be fed from caller state — so the body normalizes AGAIN here. Nothing
 * but an allowlisted http(s) URL ever reaches `source` (the security scenario's guard
 * is not downgradable). No URL → an empty placeholder, never a navigation.
 */
function WebPreviewBody({ src, loading, className }: WebPreviewBodyProps) {
  const { url, reload, attachWebview } = useWebPreview();
  const target = React.useMemo(() => normalizePreviewUrl(src ?? url), [src, url]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  return (
    <View className={cn('flex-1 bg-background', className)}>
      {target ? (
        <WebView
          ref={attachWebview}
          source={{ uri: target }}
          // ---- The sandbox mapping. Fixed, not props — see the header. ----
          originWhitelist={['https://*', 'http://*']}
          // The upstream sandbox's allow-scripts GRANT, pinned explicit so a default
          // flip upstream cannot silently change the posture; live pages need it (AC-1).
          javaScriptEnabled={true}
          allowFileAccess={false}
          allowFileAccessFromFileURLs={false}
          allowUniversalAccessFromFileURLs={false}
          setSupportMultipleWindows={false}
          // ----------------------------------------------------------------
          // Belt-and-braces: the webview takes no className (see the header) and
          // must fill its wrapper exactly.
          style={{ width: '100%', height: '100%' }}
          onLoadStart={() => {
            // A fresh attempt clears the previous failure (Retry lands here too).
            setFailed(false);
            setIsLoading(true);
          }}
          onLoadEnd={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setFailed(true);
          }}
          onRenderProcessGone={() => {
            setIsLoading(false);
            setFailed(true);
          }}
        />
      ) : (
        // Upstream: an iframe with no src. A webview with no source is a blank white
        // view — the exact thing AC-3 forbids mistaking for a result — so the port
        // renders an explicit empty surface instead of mounting one.
        <View className="flex-1" />
      )}
      {target && isLoading && loading ? (
        <View className="absolute inset-0 items-center justify-center">{loading}</View>
      ) : null}
      {failed && target ? <FailurePanel url={target} onRetry={reload} /> : null}
    </View>
  );
}

/**
 * AC-3's explicit error state. Covers the webview (which may hold a half-rendered or
 * native error surface) with the background, names the failing host (lib/url's
 * no-throw extractor), and offers Retry — the context reload.
 */
function FailurePanel({ url, onRetry }: { url: string; onRetry: () => void }) {
  return (
    <View className="absolute inset-0 flex-col items-center justify-center gap-2 bg-background p-6">
      <Icon as={TriangleAlertIcon} size={24} className="text-destructive" />
      <Text className="text-center text-sm font-medium text-foreground">
        Preview failed to load
      </Text>
      <Text numberOfLines={1} className="text-center text-xs text-muted-foreground">
        {hostnameOf(url)}
      </Text>
      <Button
        variant="outline"
        size="sm"
        onPress={onRetry}
        accessibilityLabel="Retry loading the preview"
      >
        <Text>Retry</Text>
      </Button>
    </View>
  );
}

export {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
  useWebPreview,
};
