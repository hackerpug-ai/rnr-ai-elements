import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { View } from 'react-native';

import {
  parsePathSegments,
} from '@/components/ai/schema-display.logic';
import {
  SchemaDisplay,
  SchemaDisplayContent,
  SchemaDisplayDescription,
  SchemaDisplayExample,
  SchemaDisplayHeader,
  SchemaDisplayMethod,
  SchemaDisplayParameters,
  SchemaDisplayPath,
  SchemaDisplayProperty,
  SchemaDisplayRequest,
  SchemaDisplayResponse,
  useSchemaDisplay,
} from '@/components/ai/schema-display';
import type { HttpMethod } from '@/components/ai/schema-display.logic';
import {
  StackTrace,
  StackTraceActions,
  StackTraceContent,
  StackTraceCopyButton,
  StackTraceError,
  StackTraceErrorMessage,
  StackTraceErrorType,
  StackTraceFrames,
  StackTraceHeader,
  useStackTrace,
} from '@/components/ai/stack-trace';
import type { TestSummary } from '@/components/ai/test-results.logic';
import {
  Test,
  TestDuration,
  TestError,
  TestErrorMessage,
  TestErrorStack,
  TestName,
  TestResults,
  TestResultsContent,
  TestResultsDuration,
  TestResultsHeader,
  TestResultsProgress,
  TestResultsSummary,
  TestStatus,
  TestSuite,
  TestSuiteContent,
  TestSuiteName,
  TestSuiteStats,
  useTest,
  useTestResults,
  useTestSuite,
} from '@/components/ai/test-results';
import { Text } from '@/components/ui/text';

/**
 * Wave 13 — the specialist/data organisms II: schema-display, stack-trace,
 * test-results (the FINAL component wave). One group, 'AI Elements/Data': these three
 * share a job — structured machine output a human reads — while their UCs differ
 * (schema-display is UC-AGENT-05; stack-trace and test-results are UC-CODE-02), so
 * neither the Dev Tools nor an agent-surface group alone would have been honest.
 *
 * Every state is visible statically (the fixture stories are what the device sign-off
 * screenshots), and each component gets one sandbox story with controls on its
 * primitive props. The stack-trace board's fixture is a REAL captured Node trace —
 * node:internal and node_modules frames light up the dimming, showInternalFrames=
 * {false} proves the upstream hide-internal trap, and the deep-path fixture proves
 * the verdict's horizontal-scroll branch: frames push RIGHT, never wrap.
 */
const meta = { title: 'AI Elements/Data' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

function Label({ children }: { children: string }) {
  return <Text variant="muted" className="text-xs uppercase">{children}</Text>;
}

/* ------------------------------------------------------------- fixtures ---- */

const ENDPOINT_PARAMETERS = [
  { name: 'userId', type: 'string', required: true, description: 'The user identifier.', location: 'path' as const },
  { name: 'expand', type: 'string[]', description: 'Relations to inline.', location: 'query' as const },
  { name: 'X-Request-Id', type: 'string', description: 'Idempotency key.', location: 'header' as const },
];

const USER_REQUEST_BODY = [
  {
    name: 'user',
    type: 'object',
    required: true,
    description: 'The user payload — open me, then open the nested address object.',
    properties: [
      { name: 'email', type: 'string', required: true, description: 'Unique across the workspace.' },
      { name: 'displayName', type: 'string' },
      {
        name: 'address',
        type: 'object',
        required: true,
        properties: [
          { name: 'street', type: 'string', required: true },
          { name: 'city', type: 'string', required: true },
          { name: 'postalCode', type: 'string' },
        ],
      },
      {
        name: 'roles',
        type: 'array',
        description: 'Array element schemas render as the items shape, named roles[].',
        items: { name: 'role', type: 'string' },
      },
    ],
  },
];

const USER_RESPONSE_BODY = [
  {
    name: 'user',
    type: 'object',
    required: true,
    properties: [
      { name: 'id', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'createdAt', type: 'string', description: 'ISO 8601, UTC.' },
    ],
  },
];

const DEEP_PROPERTY_TREE = [
  {
    name: 'root',
    type: 'object',
    description: 'Depth collapses at 2 — this node starts closed on every engine.',
    properties: [
      {
        name: 'levelOne',
        type: 'object',
        properties: [
          {
            name: 'levelTwo',
            type: 'object',
            properties: [
              {
                name: 'levelThree',
                type: 'object',
                properties: [{ name: 'leaf', type: 'string' }],
              },
            ],
          },
        ],
      },
    ],
  },
];

const REAL_NODE_TRACE = [
  'TypeError: Cannot read properties of undefined (reading \'id\')',
  '    at renderUser (/Users/justin/Projects/agent/src/components/user.tsx:42:18)',
  '    at div (/Users/justin/Projects/agent/src/components/user.tsx:61:3)',
  '    at Module._compile (node:internal/modules/cjs/loader:1105:14)',
  '    at /Users/justin/Projects/agent/node_modules/react-dom/cjs/react-dom-server.node.development.js:64:309',
  '    at Layer.handle [as handle_request] (/Users/justin/Projects/agent/node_modules/express/lib/router/layer.js:95:5)',
].join('\n');

const DEEP_PATH_TRACE = [
  'Error: ENOENT: no such file or directory, open \'/Users/justin/Projects/rnr-ai-elements/packages/registry/src/components/ai/some-very-long-artifact-name.generated.snapshot.json\'',
  '    at Object.openSync (node:fs:2442:12)',
  '    at writeSnapshot (/Users/justin/Projects/rnr-ai-elements/packages/registry/scripts/write-snapshots.ts:88:22)',
].join('\n');

const BARE_THROW_TRACE = [
  'boom',
  '    at Object.<anonymous> (/srv/agent/scripts/seed.js:7:9)',
].join('\n');

const RUNNING_SUITE_SUMMARY: TestSummary = {
  passed: 14,
  failed: 2,
  skipped: 1,
  total: 17,
  duration: 3542,
};

const PASSING_SUITE_SUMMARY: TestSummary = {
  passed: 6,
  failed: 0,
  skipped: 0,
  total: 6,
  duration: 820,
};

/* --------------------------------------------------------- schema-display ---- */

/** The default composition, custom sections, compression board, and the deep tree. */
export const SchemaDisplayBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>Default composition — method, path, description, sections</Label>
        <SchemaDisplay
          method="POST"
          path="/api/users/{userId}"
          description="Updates the user. Every {param} run renders accented — the port's replacement for the web's dangerouslySetInnerHTML."
          parameters={ENDPOINT_PARAMETERS}
          requestBody={USER_REQUEST_BODY}
          responseBody={USER_RESPONSE_BODY}
        />
      </View>
      <View className="gap-1">
        <Label>Composed explicitly — the caller arranges the same parts</Label>
        <SchemaDisplay method="GET" path="/healthz">
          <SchemaDisplayHeader>
            <SchemaDisplayMethod />
            <SchemaDisplayPath />
          </SchemaDisplayHeader>
          <SchemaDisplayDescription>Returns "ok" when the agent runtime is serving.</SchemaDisplayDescription>
          <SchemaDisplayContent>
            <SchemaDisplayExample code={'{\n  "status": "ok",\n  "version": "1.4.2"\n}'} language="json" />
          </SchemaDisplayContent>
        </SchemaDisplay>
      </View>
      <View className="gap-1">
        <Label>The five verbs, compressed onto the house status colors</Label>
        <View className="gap-2">
          {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as HttpMethod[]).map((verb) => (
            <SchemaDisplay key={verb} method={verb} path={`/${verb.toLowerCase()}`}>
              <SchemaDisplayHeader>
                <SchemaDisplayMethod />
                <SchemaDisplayPath />
              </SchemaDisplayHeader>
            </SchemaDisplay>
          ))}
        </View>
      </View>
      <View className="gap-1">
        <Label>Nested tree — depth collapses at 2, width pushes RIGHT (the verdict)</Label>
        <SchemaDisplay method="GET" path="/graph/{nodeId}" requestBody={DEEP_PROPERTY_TREE} />
      </View>
      <Text variant="muted">
        Port-adapted verdict: the nested schema tree ports, but nesting depth and key
        widths need collapsing AND horizontal scroll to stay legible at phone width.
        The five method washes compress onto the house palette; the badge's VERB is
        what you read.
      </Text>
    </View>
  ),
};

/** Controls on the primitive props; the path splitter runs live on the control. */
export const SchemaDisplaySandbox = {
  args: {
    method: 'DELETE',
    path: '/api/sessions/{sessionId}',
  },
  argTypes: {
    method: { control: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
    path: { control: 'text' },
  },
  render: (args: { method: HttpMethod; path: string }) => (
    <View className="gap-3">
      <SchemaDisplay method={args.method} path={args.path} parameters={ENDPOINT_PARAMETERS}>
        <SchemaDisplayHeader>
          <View className="flex-row items-center gap-3">
            <SchemaDisplayMethod />
            <SchemaDisplayPath />
          </View>
        </SchemaDisplayHeader>
      </SchemaDisplay>
      <Text variant="muted" selectable>
        {`parsePathSegments → ${JSON.stringify(parsePathSegments(args.path))}`}
      </Text>
      <Text variant="muted">
        The control edits the raw path; the {`{param}`} runs re-split live — try adding
        one. The verb control re-tints the badge without touching its word.
      </Text>
    </View>
  ),
};

/* ------------------------------------------------------------- stack-trace ---- */

/** Real captured traces: dimmed internals, hidden internals, deep paths, bare throws. */
export const StackTraceBoard: Story = {
  render: () => {
    const [lastFrame, setLastFrame] = useState<string>();

    return (
      <View className="gap-6">
        <View className="gap-1">
          <Label>A real Node trace — internals render dimmed (showInternalFrames true)</Label>
          <StackTrace trace={REAL_NODE_TRACE} defaultOpen onFilePathClick={(file, line, col) => setLastFrame(`${file}:${line}:${col}`)}>
            <StackTraceHeader>
              <StackTraceError>
                <StackTraceErrorType />
                <StackTraceErrorMessage />
              </StackTraceError>
              <StackTraceActions>
                <StackTraceCopyButton />
              </StackTraceActions>
            </StackTraceHeader>
            <StackTraceContent />
          </StackTrace>
        </View>
        <View className="gap-1">
          <Label>Internal frames hidden — node: and node_modules vanish (the upstream trap)</Label>
          <StackTrace trace={REAL_NODE_TRACE} defaultOpen>
            <StackTraceHeader>
              <StackTraceError>
                <StackTraceErrorType />
                <StackTraceErrorMessage />
              </StackTraceError>
              <StackTraceActions>
                <StackTraceCopyButton />
              </StackTraceActions>
            </StackTraceHeader>
            <StackTraceContent>
              <StackTraceFrames showInternalFrames={false} />
            </StackTraceContent>
          </StackTrace>
        </View>
        <View className="gap-1">
          <Label>Deep paths scroll RIGHT — frames never wrap, never truncate</Label>
          <StackTrace trace={DEEP_PATH_TRACE} defaultOpen>
            <StackTraceHeader>
              <StackTraceError>
                <StackTraceErrorType />
                <StackTraceErrorMessage />
              </StackTraceError>
            </StackTraceHeader>
            <StackTraceContent />
          </StackTrace>
        </View>
        <View className="gap-1">
          <Label>A bare throw — no error type, no file on the frame</Label>
          <StackTrace trace={BARE_THROW_TRACE} defaultOpen>
            <StackTraceHeader>
              <StackTraceError>
                <StackTraceErrorType />
                <StackTraceErrorMessage />
              </StackTraceError>
            </StackTraceHeader>
            <StackTraceContent />
          </StackTrace>
        </View>
        <Text variant="muted" numberOfLines={2} selectable>
          {`Last frame pressed: ${lastFrame ?? '— (tap a file:line:col in the first card)'}`}
        </Text>
        <Text variant="muted">
          The expand chevron is an INDICATOR, not a second toggle — the header is the
          only control, upstream verified. Copy hands over the RAW trace. Without
          onFilePathClick the file:line:col renders unpressable.
        </Text>
      </View>
    );
  },
};

/** Controls on open/onOpenChange — controlled disclosure, exactly as in an app. */
export const StackTraceSandbox = {
  args: {
    open: false,
    trace: REAL_NODE_TRACE,
  },
  argTypes: {
    open: { control: 'boolean' },
    trace: { control: 'text' },
  },
  render: (args: { open: boolean; trace: string }) => {
    const [open, setOpen] = useState(args.open);

    return (
      <View className="gap-3">
        <StackTrace trace={args.trace} open={open} onOpenChange={setOpen}>
          <StackTraceHeader>
            <StackTraceError>
              <StackTraceErrorType>TypeError</StackTraceErrorType>
              <StackTraceErrorMessage>controlled by the toggle</StackTraceErrorMessage>
            </StackTraceError>
            <StackTraceActions>
              <StackTraceCopyButton />
            </StackTraceActions>
          </StackTraceHeader>
          <StackTraceContent />
        </StackTrace>
        <Text variant="muted">
          open is CONTROLLED — the header fires onOpenChange and the control owns the
          state. Editing the trace control re-parses every frame from scratch.
        </Text>
      </View>
    );
  },
};

/* ------------------------------------------------------------- test-results ---- */

/** Summary badges, RNR progress, suites (collapsed + failing + running), empty state. */
export const TestResultsBoard: Story = {
  render: () => (
    <View className="gap-6">
      <View className="gap-1">
        <Label>A failing run — failing suite expanded to its message and stack</Label>
        <TestResults summary={RUNNING_SUITE_SUMMARY}>
          <TestResultsHeader>
            <TestResultsSummary />
            <TestResultsDuration />
          </TestResultsHeader>
          <TestResultsProgress className="px-4 pt-3" />
          <TestResultsContent>
            <TestSuite name="auth/service.test.ts" status="failed" defaultOpen>
              <TestSuiteName>
                {/* Suite-scoped parts only — <TestStatus />/<TestName /> are Test-context
                    parts and would throw here (review E1). */}
                <TestSuiteStats passed={3} failed={2} skipped={1} />
              </TestSuiteName>
              <TestSuiteContent>
                <Test name="refreshes the session token" status="passed" duration={42} />
                <Test name="rejects an expired token" status="passed" duration={17} />
                <Test name="fails closed when the provider is down" status="failed" duration={3021} />
                <TestError>
                  <TestErrorMessage>AssertionError: expected 503 to be 401</TestErrorMessage>
                  <TestErrorStack>
                    {
                      'AssertionError: expected 503 to be 401\n'
                      + '    at expect (/Users/justin/Projects/agent/test/auth.test.ts:88:28)\n'
                      + '    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)'
                    }
                  </TestErrorStack>
                </TestError>
                <Test name="skips the flaky clock test" status="skipped" />
              </TestSuiteContent>
            </TestSuite>
            <TestSuite name="queue/persistence.test.ts" status="running">
              <TestSuiteName />
              <TestSuiteContent>
                <Test name="persists an in-flight job" status="running" />
              </TestSuiteContent>
            </TestSuite>
          </TestResultsContent>
        </TestResults>
      </View>
      <View className="gap-1">
        <Label>A passing run — every count renders, nothing hidden</Label>
        <TestResults summary={PASSING_SUITE_SUMMARY}>
          <TestResultsHeader>
            <TestResultsSummary />
            <TestResultsDuration />
          </TestResultsHeader>
          <TestResultsProgress className="px-4 pt-3" />
        </TestResults>
      </View>
      <View className="gap-1">
        <Label>No summary — the root renders nothing; no suites → the empty atom</Label>
        <TestResults />
        <TestResults>
          <TestResultsContent />
        </TestResults>
      </View>
      <Text variant="muted">
        AC-2: the counts summarize the run; the failing test EXPANDS to its message.
        Progress composes RNR Progress per the data-schema contract — no chart — and
        keeps the web's two labels byte-for-byte. Per-test durations are ALWAYS
        milliseconds; only the run duration ever seconds.
      </Text>
    </View>
  ),
};

/** Controls on the summary — the badges and bar recompute live. */
export const TestResultsSandbox = {
  args: {
    passed: 8,
    failed: 2,
    skipped: 0,
    total: 10,
    duration: 5000,
  },
  argTypes: {
    passed: { control: 'number' },
    failed: { control: 'number' },
    skipped: { control: 'number' },
    total: { control: 'number' },
    duration: { control: 'number' },
  },
  render: (args: { passed: number; failed: number; skipped: number; total: number; duration: number }) => (
    <View className="gap-3">
      <TestResults summary={{ passed: args.passed, failed: args.failed, skipped: args.skipped, total: args.total, duration: args.duration }}>
        <TestResultsHeader>
          <TestResultsSummary />
          <TestResultsDuration />
        </TestResultsHeader>
        <TestResultsProgress className="px-4 pt-3" />
      </TestResults>
      <Text variant="muted">
        Zero a count and its badge disappears — the upstream rule. Clear the duration
        and the run time drops out. A zero total clamps the bar to 0% where the web
        rendered NaN.
      </Text>
    </View>
  ),
};

/* --------------------------------------------------------------- guards ---- */

/**
 * Every hook throws outside its root, byte-verbatim (the upstream trap contract). The
 * probes catch synchronously the way the Dev Tools story's probe does.
 */
export const ContractGuards: Story = {
  render: () => {
    const trapped: string[] = [];

    function Probe(): null {
      for (const probe of [
        () => useStackTrace(),
        () => useSchemaDisplay(),
        () => useTestResults(),
        () => useTestSuite(),
        () => useTest(),
      ]) {
        try {
          probe();
          trapped.push('NOT THROWN — the trap failed');
        } catch (error) {
          trapped.push((error as Error).message);
        }
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
