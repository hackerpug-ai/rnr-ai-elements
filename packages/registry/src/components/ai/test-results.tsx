import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/registry/{engine}/components/ui/collapsible';
import { Empty, EmptyIcon, EmptyTitle } from '@/registry/{engine}/components/ui/empty';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Item } from '@/registry/{engine}/components/ui/item';
import { Progress } from '@/registry/{engine}/components/ui/progress';
import { Text } from '@/registry/{engine}/components/ui/text';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import {
  ChevronRightIcon,
  CircleCheckBigIcon,
  CircleDotIcon,
  CircleIcon,
  CircleXIcon,
  FlaskConicalIcon,
  type LucideIcon,
} from 'lucide-react-native';
import * as React from 'react';
import { Platform, ScrollView, View, type ViewProps } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import {
  formatDuration,
  formatTestDuration,
  passedPercent,
  progressLabel,
  progressPercentLabel,
  testStatusMeta,
  type TestStatusIconName,
  type TestStatusType,
  type TestSummary,
} from './test-results.logic';

/**
 * TestResults — a test run summarized rather than dumped (UC-CODE-02 AC-2: passed /
 * failed / skipped counts, and a failing test EXPANDS to its message; AC-4: error
 * stacks copy from the run surfaces they belong to).
 *
 * THE PRD VERDICT IS PORT-AT-PARITY: "Pass, fail, and skip counts with expandable
 * per-test rows; composes from RNR badge, collapsible, and text." The upstream part
 * set, verified from source and ported part for part: TestResults root (summary?),
 * TestResultsHeader, TestResultsSummary (passed badge ALWAYS, failed/skipped badges
 * only when > 0), TestResultsDuration, TestResultsProgress ("8/10 tests passed" +
 * "80%"), TestResultsContent, TestSuite (collapsible card; closed by default — the
 * KB's "collapsed until the trigger is clicked"), TestSuiteName, TestSuiteStats
 * (counts render only when > 0), TestSuiteContent, Test (row; default composition
 * status + name + duration), TestStatus, TestName, TestDuration ("42ms" — upstream
 * never seconds a per-test duration), TestError, TestErrorMessage, TestErrorStack.
 *
 * THE DATA-SCHEMA SUBSTITUTION: the web's hand-rolled two-segment green/red bar is a
 * chart-shaped div with inline percent widths; the contract binds this surface to
 * "Progress bar via RNR Progress, no chart" — so TestResultsProgress composes RNR's
 * Progress (pass fraction, token indicator) and keeps BOTH text labels byte-for-byte;
 * the failed share is carried by the numbers and the failed badge, which is where the
 * web carried it too (color was never the sole channel).
 *
 * DECLARED ADAPTATIONS, on the record:
 *  - the web's `divide-y` wrappers become explicit border-b classes on rows (RN has
 *    no divide utilities); the last row's hairline sits above the section border —
 *    visually one rule;
 *  - the running status icon pulses on tool.tsx's exact mechanism (opacity 1→0.5,
 *    1000ms, reversed, ReduceMotion.System) in place of the web's `animate-pulse`,
 *    which has no native compiler target;
 *  - the red-50 error wash compresses to `bg-destructive/10` — an existing role with
 *    an opacity modifier, the contract's sanctioned form of a tint;
 *  - Test rows compose the `item` atom (the house list row) per the build plan;
 *  - TestResultsContent with no suites falls back to the `empty` atom — the
 *    inventory's "fallback surface for … test-results", file-tree precedent.
 */

type TestResultsContextValue = { summary?: TestSummary };

const TestResultsContext = React.createContext<TestResultsContextValue | null>(null);

function useTestResults() {
  const ctx = React.useContext(TestResultsContext);
  if (!ctx) throw new Error('TestResults components must be used within TestResults');
  return ctx;
}

export type TestResultsProps = Omit<ViewProps, 'children'> & {
  /** The run's counts and duration. The default composition renders nothing without it. */
  summary?: TestSummary;
  children?: React.ReactNode;
};

function TestResults({ summary, className, children, ...props }: TestResultsProps) {
  const contextValue = React.useMemo<TestResultsContextValue>(() => ({ summary }), [summary]);

  return (
    <TestResultsContext.Provider value={contextValue}>
      <View className={cn('overflow-hidden rounded-lg border border-border bg-background', className)} {...props}>
        {children ?? (
          summary ? (
            <TestResultsHeader>
              <TestResultsSummary />
              <TestResultsDuration />
            </TestResultsHeader>
          ) : null
        )}
      </View>
    </TestResultsContext.Provider>
  );
}

function TestResultsHeader({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('flex-row items-center justify-between gap-3 border-b border-border px-4 py-3', className)} {...props}>
      {children}
    </View>
  );
}

/**
 * The counts, as badges whose WORD carries the state (the compressed tones ride
 * along): passed always renders, failed and skipped only when non-zero — the
 * upstream rendering rule, verbatim.
 */
function TestResultsSummary({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  const { summary } = useTestResults();

  if (!summary) return null;

  return (
    <View className={cn('flex-row flex-wrap items-center gap-3', className)} {...props}>
      {children ?? (
        <>
          <SummaryBadge status="passed" count={summary.passed} />
          {summary.failed > 0 ? <SummaryBadge status="failed" count={summary.failed} /> : null}
          {summary.skipped > 0 ? <SummaryBadge status="skipped" count={summary.skipped} /> : null}
        </>
      )}
    </View>
  );
}

function SummaryBadge({ status, count }: { status: TestStatusType; count: number }) {
  const meta = testStatusMeta(status);

  return (
    <Badge variant="secondary" className="gap-1" accessibilityLabel={`${count} ${status}`}>
      <Icon as={STATUS_ICONS[meta.iconName]} size={12} className={cn(meta.className)} />
      <Text className={cn('text-xs', meta.className)}>
        {count} {status}
      </Text>
    </Badge>
  );
}

/** The run's wall-clock time, from context. No duration renders nothing. */
function TestResultsDuration({ children, className }: { children?: string; className?: string }) {
  const { summary } = useTestResults();

  if (!summary?.duration) return null;

  return (
    <Text style={monoStyle} className={cn('shrink-0 text-xs text-muted-foreground', className)}>
      {children ?? formatDuration(summary.duration)}
    </Text>
  );
}

/**
 * RNR Progress over the pass fraction + the two text labels, upstream bytes
 * ("8/10 tests passed" / "80%"). No summary renders nothing.
 */
function TestResultsProgress({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  const { summary } = useTestResults();

  if (!summary) return null;

  return (
    <View className={cn('gap-2', className)} {...props}>
      {children ?? (
        <>
          <Progress value={passedPercent(summary)} accessibilityLabel={progressLabel(summary)} />
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted-foreground">{progressLabel(summary)}</Text>
            <Text style={monoStyle} className="text-xs text-muted-foreground">
              {progressPercentLabel(summary)}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}

/** The suite list. No suites composed → the empty atom, not a blank card. */
function TestResultsContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('gap-2 p-4', className)} {...props}>
      {children ?? <TestResultsFallbackEmpty />}
    </View>
  );
}

function TestResultsFallbackEmpty() {
  return (
    <Empty className="gap-1 p-4">
      <EmptyIcon as={FlaskConicalIcon} />
      <EmptyTitle className="text-sm font-normal text-muted-foreground">No tests</EmptyTitle>
    </Empty>
  );
}

type TestSuiteContextValue = { name: string; status: TestStatusType; open: boolean };

const TestSuiteContext = React.createContext<TestSuiteContextValue | null>(null);

function useTestSuite() {
  const ctx = React.useContext(TestSuiteContext);
  if (!ctx) throw new Error('TestSuite components must be used within TestSuite');
  return ctx;
}

export type TestSuiteProps = Omit<ViewProps, 'children'> & {
  name: string;
  status: TestStatusType;
  /** The KB's documented default: collapsed until the trigger is clicked. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

function TestSuite({ name, status, defaultOpen = false, onOpenChange, className, children, ...props }: TestSuiteProps) {
  const [open, setOpen] = React.useState(defaultOpen);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
  }

  const contextValue = React.useMemo<TestSuiteContextValue>(
    () => ({ name, status, open }),
    [name, status, open],
  );

  return (
    <TestSuiteContext.Provider value={contextValue}>
      <Collapsible open={open} onOpenChange={handleOpenChange}>
        <View className={cn('overflow-hidden rounded-lg border border-border', className)} {...props}>
          {children}
        </View>
      </Collapsible>
    </TestSuiteContext.Provider>
  );
}

/** The suite trigger: right chevron (house rotation), the status mark, the name. */
function TestSuiteName({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  const { name, status, open } = useTestSuite();

  return (
    <CollapsibleTrigger
      className={cn(
        'flex-row items-center gap-2 px-4 py-3 text-left active:bg-muted/50',
        Platform.select({ web: 'transition-colors hover:bg-muted/50' }),
        className,
      )}
      {...props}
    >
      <SectionChevron open={open} />
      {/* Suite-scoped status — NOT <TestStatus /> (Test context; would throw here).
          Rendered from the suite context exactly as SummaryBadge/StatText do. */}
      {(() => {
        const meta = testStatusMeta(status);
        return (
          <Icon as={STATUS_ICONS[meta.iconName]} size={14} className={cn(meta.className)} />
        );
      })()}
      {children ? (
        <>
          <Text numberOfLines={1} className="min-w-0 flex-1 text-left text-sm font-medium text-foreground">
            {name}
          </Text>
          {children}
        </>
      ) : (
        <Text numberOfLines={1} className="min-w-0 flex-1 text-left text-sm font-medium text-foreground">
          {name}
        </Text>
      )}
    </CollapsibleTrigger>
  );
}

function SectionChevron({ open }: { open: boolean }) {
  const rotation = useSharedValue(open ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(open ? 1 : 0, {
      duration: open ? 250 : 200,
      reduceMotion: ReduceMotion.System,
    });
  }, [open, rotation]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value * 90}deg` }],
  }));

  return (
    <Animated.View style={style}>
      <Icon as={ChevronRightIcon} size={16} className="shrink-0 text-muted-foreground" />
    </Animated.View>
  );
}

type TestSuiteStatsProps = ViewProps & {
  passed?: number;
  failed?: number;
  skipped?: number;
  children?: React.ReactNode;
};

/** The per-suite counts; each renders ONLY when non-zero, upstream rule verbatim. */
function TestSuiteStats({ passed = 0, failed = 0, skipped = 0, className, children, ...props }: TestSuiteStatsProps) {
  return (
    <View className={cn('ml-auto flex-row shrink-0 items-center gap-2', className)} {...props}>
      {children ?? (
        <>
          {passed > 0 ? <StatText count={passed} status="passed" /> : null}
          {failed > 0 ? <StatText count={failed} status="failed" /> : null}
          {skipped > 0 ? <StatText count={skipped} status="skipped" /> : null}
        </>
      )}
    </View>
  );
}

function StatText({ count, status }: { count: number; status: TestStatusType }) {
  const meta = testStatusMeta(status);

  return (
    <Text accessibilityLabel={`${count} ${status}`} className={cn('text-xs', meta.className)}>
      {count} {status}
    </Text>
  );
}

function TestSuiteContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <CollapsibleContent className={cn('border-t border-border', className)} {...props}>
      <View>{children}</View>
    </CollapsibleContent>
  );
}

type TestContextValue = { name: string; status: TestStatusType; duration?: number };

const TestContext = React.createContext<TestContextValue | null>(null);

function useTest() {
  const ctx = React.useContext(TestContext);
  if (!ctx) throw new Error('Test components must be used within Test');
  return ctx;
}

export type TestProps = Omit<ViewProps, 'children'> & {
  name: string;
  status: TestStatusType;
  duration?: number;
  children?: React.ReactNode;
};

/**
 * The test row, composed on the item atom (the house list row). A failing test's
 * message/stack compose TestError as a SIBLING block beneath this row inside
 * TestSuiteContent — the KB's "nested under TestResults" composition, kept out of the
 * row itself so the row stays one tappable-height line.
 */
function Test({ name, status, duration, className, children, ...props }: TestProps) {
  const contextValue = React.useMemo<TestContextValue>(
    () => ({ name, status, duration }),
    [name, status, duration],
  );

  return (
    <TestContext.Provider value={contextValue}>
      <Item className={cn('border-b border-border px-4 py-2', className)} {...props}>
        {children ?? (
          <>
            <TestStatus />
            <TestName />
            {duration !== undefined ? <TestDuration /> : null}
          </>
        )}
      </Item>
    </TestContext.Provider>
  );
}

/** The status mark. Running pulses (system-reduced); the others stand still. */
function TestStatus({ className }: { className?: string }) {
  const { status } = useTest();
  const meta = testStatusMeta(status);
  const reduced = useReducedMotion();
  const looping = status === 'running';
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (!looping || reduced) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.5, { duration: 1000, reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [looping, reduced, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style} className={cn('shrink-0', className)}>
      <Icon as={STATUS_ICONS[meta.iconName]} size={16} className={cn(meta.className)} />
    </Animated.View>
  );
}

function TestName({ children, className }: { children?: string; className?: string }) {
  const { name } = useTest();

  return (
    <Text numberOfLines={1} className={cn('min-w-0 flex-1 text-sm text-foreground', className)}>
      {children ?? name}
    </Text>
  );
}

/** ALWAYS milliseconds — the upstream TestDuration format, never seconds. */
function TestDuration({ children, className }: { children?: string; className?: string }) {
  const { duration } = useTest();

  if (duration === undefined) return null;

  return (
    <Text style={monoStyle} className={cn('shrink-0 text-xs text-muted-foreground', className)}>
      {children ?? formatTestDuration(duration)}
    </Text>
  );
}

/** The red-50 wash compressed to the sanctioned bg-destructive/10 token tint. */
function TestError({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View className={cn('m-4 mt-2 rounded-md bg-destructive/10 p-3', className)} {...props}>
      {children}
    </View>
  );
}

function TestErrorMessage({ children, className }: { children?: string; className?: string }) {
  return (
    <Text selectable className={cn('text-sm font-medium text-destructive', className)}>
      {children}
    </Text>
  );
}

/**
 * The failure stack: house mono (lib/mono), destructive, SELECTABLE, and horizontally
 * scrollable — dense output scrolls rather than wraps (UC-CODE-02's constitution).
 */
function TestErrorStack({ children, className }: { children: string; className?: string }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="min-w-full"
      className={cn('mt-2', className)}
    >
      <Text selectable style={monoStyle} className="text-xs text-destructive">
        {children}
      </Text>
    </ScrollView>
  );
}

/** icon name → Lucide component, typed exhaustively (tool.logic precedent). */
const STATUS_ICONS: Record<TestStatusIconName, LucideIcon> = {
  'circle-check-big': CircleCheckBigIcon,
  'circle-x': CircleXIcon,
  circle: CircleIcon,
  'circle-dot': CircleDotIcon,
};

export {
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
};
