import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import {
  useWebPreview,
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewNavigationButton,
  WebPreviewUrl,
} from '@/components/ai/web-preview';
import { Icon } from '@/components/ui/icon';
import { RotateCwIcon } from 'lucide-react-native';
import { Text } from '@/components/ui/text';

/**
 * Wave 14 — the FINAL organism: web-preview (UC-CODE-03), the native webview
 * substitute. The one opt-in item in the registry: its react-native-webview peer is
 * the harness's own install, resolved through the Metro shim because the registry
 * source takes no dependency on it.
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and the sandbox carries controls on the primitive props. Two behaviors
 * are live on device by design: the core fixture loads https://example.com FOR REAL
 * through the native webview (AC-1's live render — a web-storybook capture shows the
 * webview package's own does-not-support-this-platform stub and proves nothing), and
 * the failure fixture points at a .invalid host (guaranteed DNS failure, RFC 2606) so
 * AC-3's explicit error state is observable, not simulated.
 *
 * The hostile-URL probe is the UC-CODE-03 security scenario's visible half: typing
 * `javascript:alert(1)` into the bar and pressing go must REFUSE — echo, no
 * navigation — because normalizePreviewUrl's allowlist gate sits before the webview.
 */
const meta = { title: 'AI Elements/Web Preview' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/** The verdict's reload affordance, composed from the upstream parts — the same shape
 *  the web docs compose their refresh button in, wired to the context reload. */
function ReloadButton() {
  const { reload } = useWebPreview();
  return (
    <WebPreviewNavigationButton label="Reload" onPress={reload}>
      <Icon as={RotateCwIcon} size={16} className="text-muted-foreground" />
    </WebPreviewNavigationButton>
  );
}

/** The caller's `loading` node — shown as an overlay while the webview reports loading. */
function LoadingNote() {
  return (
    <View className="items-center justify-center gap-2">
      <Text className="text-sm text-muted-foreground">Loading…</Text>
    </View>
  );
}

/* ----------------------------------------------------------------- board ---- */

/** Live render, failed load, and the hostile-URL refusal — all three ACs on glass. */
export const WebPreviewBoard: Story = {
  render: () => {
    const [committed, setCommitted] = useState('https://example.com');
    const [refused, setRefused] = useState('');

    return (
      <View className="gap-6">
        <View className="gap-1">
          <Label>Live page — a real URL through the native webview (AC-1)</Label>
          <View className="h-96">
            <WebPreview defaultUrl="https://example.com" onUrlChange={setCommitted}>
              <WebPreviewNavigation>
                <ReloadButton />
                <WebPreviewUrl onRefuse={setRefused} />
              </WebPreviewNavigation>
              <WebPreviewBody loading={<LoadingNote />} />
            </WebPreview>
          </View>
        </View>
        <View className="gap-1">
          <Label>Failed load is explicit — .invalid host, never a blank white view (AC-3)</Label>
          <View className="h-72">
            <WebPreview defaultUrl="https://rnr-ai-elements.invalid">
              <WebPreviewNavigation>
                <ReloadButton />
                <WebPreviewUrl />
              </WebPreviewNavigation>
              <WebPreviewBody loading={<LoadingNote />} />
            </WebPreview>
          </View>
        </View>
        <Text variant="muted" numberOfLines={2} selectable>
          {`Committed: ${committed}\nRefused: ${refused || '— (type javascript:alert(1) and press go)'}`}
        </Text>
        <Text variant="muted">
          The webview is a PEER, not a dependency of the registry: the emitted item
          records react-native-webview so the CLI tells you at install time (AC-2), and
          the sandbox lockdown is fixed — http/https origins only, file access off,
          multiple windows off. The console pane does not port and is dropped, per the
          verdict.
        </Text>
      </View>
    );
  },
};

/* -------------------------------------------------------------- sandbox ---- */

/** Controls on the primitive props; the commit echo is caller state, exactly as in an app. */
export const WebPreviewSandbox = {
  args: {
    initialUrl: 'https://example.com',
    srcOverride: '',
  },
  argTypes: {
    initialUrl: { control: 'text' },
    srcOverride: { control: 'text' },
  },
  render: (args: { initialUrl: string; srcOverride: string }) => {
    const [committed, setCommitted] = useState(args.initialUrl);

    return (
      <View className="gap-3">
        {/* defaultUrl is initial-only (the upstream useState contract) — the key
            remounts the fixture when the control changes, so the control is honest. */}
        <View className="h-80">
          <WebPreview key={args.initialUrl} defaultUrl={args.initialUrl} onUrlChange={setCommitted}>
            <WebPreviewNavigation>
              <ReloadButton />
              <WebPreviewUrl onRefuse={() => {}} />
            </WebPreviewNavigation>
            <WebPreviewBody src={args.srcOverride || undefined} loading={<LoadingNote />} />
          </WebPreview>
        </View>
        <Text variant="muted" numberOfLines={2} selectable>
          {`Committed: ${committed}\nsrc override: ${args.srcOverride || '— (the context URL drives the body)'}`}
        </Text>
        <Text variant="muted">
          srcOverride drives WebPreviewBody's src passthrough directly — it bypasses the
          bar but NOT the guard: the body re-normalizes whatever it is handed, and a
          refused value renders the empty surface, never a navigation.
        </Text>
      </View>
    );
  },
};

/* --------------------------------------------------------------- guards ---- */

/** The hook throws outside its root, byte-verbatim (the upstream trap contract). */
export const ContractGuards: Story = {
  render: () => {
    const trapped: string[] = [];

    function Probe(): null {
      try {
        useWebPreview();
        trapped.push('NOT THROWN — the trap failed');
      } catch (error) {
        trapped.push((error as Error).message);
      }
      return null;
    }

    return (
      <View className="gap-2">
        <Probe />
        <Text variant="muted" selectable>
          {trapped.join('\n')}
        </Text>
      </View>
    );
  },
};
