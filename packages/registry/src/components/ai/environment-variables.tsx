import { Badge } from '@/registry/{engine}/components/ui/badge';
import { Button } from '@/registry/{engine}/components/ui/button';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Switch } from '@/registry/{engine}/components/ui/switch';
import { Text, TextClassContext } from '@/registry/{engine}/components/ui/text';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/registry/{engine}/components/ui/table';
import { monoStyle } from '@/registry/{engine}/lib/mono';
import { cn } from '@/registry/{engine}/lib/utils';
import * as Clipboard from 'expo-clipboard';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { formatEnvLine, maskedValue } from './environment-variables.logic';

/**
 * EnvironmentVariables — masked key/value rows for the agent's environment
 * (UC-CODE-01 AC-4: "view environment variables with values masked by default and
 * reveal a single value on demand").
 *
 * THE PRD VERDICT IS PORT-AT-PARITY. The upstream part set, from the KB, ported part
 * for part: EnvironmentVariables root (showValues / defaultShowValues=false /
 * onShowValuesChange), EnvironmentVariablesHeader (Title + Toggle — the KB's "...props
 * Switch", so the toggle is RNR's vendored Switch, matching upstream exactly),
 * EnvironmentVariablesContent, EnvironmentVariable (name + value, both required),
 * EnvironmentVariableName, EnvironmentVariableValue, EnvironmentVariableRequired
 * (Badge), EnvironmentVariableCopyButton, and EnvironmentVariableGroup.
 *
 * THE ONE DECLARED ADDITION: upstream's reveal is a single global Switch, but AC-4
 * says "reveal a SINGLE value on demand" — so each row also carries a per-value eye
 * toggle (EnvironmentVariableRevealButton), wired from the Variable's local state.
 * Visible = global toggle OR the row's own reveal. The clipboard always receives the
 * REAL value either way (environment-variables.logic documents why).
 *
 * COMPOSITION: the build plan names `table` as the backing primitive for this surface,
 * so the content is ONE Table — KEY/VALUE header, one row per variable, groups as
 * label rows inside the same body. Columns have fixed sizes and the table scrolls
 * horizontally when keys overflow (the table atom's own contract). Keys and values
 * ride the house mono family (lib/mono).
 *
 * ON THE VERDICT'S WORD "input": the upstream part set contains no editable field —
 * these are display rows, not a form — so no input ships. Masking/reveal is display
 * state; editing the environment is the caller's app, not this registry's.
 */

type EnvVarsContextValue = {
  showValues: boolean;
  setShowValues: (next: boolean) => void;
};

const EnvVarsContext = React.createContext<EnvVarsContextValue | null>(null);

function useEnvVars() {
  const ctx = React.useContext(EnvVarsContext);
  if (!ctx) throw new Error('EnvironmentVariables sub-components must be used within <EnvironmentVariables>');
  return ctx;
}

type VariableContextValue = {
  name: string;
  value: string;
  required: boolean;
  /** Global toggle OR the row's own reveal. */
  visible: boolean;
  toggleRevealed: () => void;
};

const VariableContext = React.createContext<VariableContextValue | null>(null);

function useVariable() {
  const ctx = React.useContext(VariableContext);
  if (!ctx) throw new Error('EnvironmentVariable sub-components must be used within <EnvironmentVariable>');
  return ctx;
}

export type EnvironmentVariablesProps = Omit<ViewProps, 'children'> & {
  /** Controlled reveal-all. Present → the component never holds state. */
  showValues?: boolean;
  /** Uncontrolled seed. The web default: false — masked by default IS the surface. */
  defaultShowValues?: boolean;
  onShowValuesChange?: (showValues: boolean) => void;
  children?: React.ReactNode;
};

function EnvironmentVariables({
  showValues: controlledShowValues,
  defaultShowValues = false,
  onShowValuesChange,
  className,
  children,
  ...props
}: EnvironmentVariablesProps) {
  const [internal, setInternal] = React.useState(defaultShowValues);
  const showValues = controlledShowValues ?? internal;

  const contextValue = React.useMemo<EnvVarsContextValue>(
    () => ({
      showValues,
      setShowValues: (next) => {
        if (controlledShowValues === undefined) setInternal(next);
        onShowValuesChange?.(next);
      },
    }),
    [showValues, controlledShowValues, onShowValuesChange],
  );

  return (
    <EnvVarsContext.Provider value={contextValue}>
      <View
        className={cn('overflow-hidden rounded-lg border border-border bg-card', className)}
        {...props}
      >
        {children}
      </View>
    </EnvVarsContext.Provider>
  );
}

function EnvironmentVariablesHeader({ className, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <View
      className={cn('flex-row items-center justify-between gap-3 border-b border-border px-3 py-2', className)}
      {...props}
    />
  );
}

/** Tolerates a missing title like every house header — "Environment Variables" renders. */
function EnvironmentVariablesTitle({ children, className }: { children?: string; className?: string }) {
  return (
    <Text numberOfLines={1} className={cn('min-w-0 flex-1 text-sm font-medium text-foreground', className)}>
      {children ?? 'Environment Variables'}
    </Text>
  );
}

/** The upstream Toggle, as the KB documents it: a Switch bound to the reveal-all state. */
function EnvironmentVariablesToggle({ className }: { className?: string }) {
  const { showValues, setShowValues } = useEnvVars();

  return (
    <Switch
      checked={showValues}
      onCheckedChange={setShowValues}
      accessibilityLabel={showValues ? 'Hide values' : 'Reveal values'}
      // RNR's Switch is ~18×32pt; hitSlop brings the target to the 44pt floor with no
      // pixel change.
      hitSlop={{ top: 13, bottom: 13, left: 6, right: 6 }}
      className={className}
    />
  );
}

/**
 * The table scaffold: KEY/VALUE header, one body, groups and rows composed inside.
 * Fixed column sizes + the table's own horizontal scroll handle overflowing keys.
 */
function EnvironmentVariablesContent({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <Table scrollable className={className}>
      <TableHeader>
        <TableHead className="w-40 shrink-0">
          <Text className="text-xs font-medium text-muted-foreground">Key</Text>
        </TableHead>
        <TableHead className="w-64 shrink-0">
          <Text className="text-xs font-medium text-muted-foreground">Value</Text>
        </TableHead>
      </TableHeader>
      <TableBody>{children}</TableBody>
    </Table>
  );
}

export type EnvironmentVariableProps = {
  /** Required upstream, and kept required — a keyless row is not an environment. */
  name: string;
  value: string;
  /** Renders the required badge beside the key. */
  required?: boolean;
  className?: string;
  /**
   * Override the default value cell (value text + reveal + copy). The name cell keeps
   * its default; compose the fine-grained parts for fully custom rows.
   */
  children?: React.ReactNode;
};

function EnvironmentVariable({ name, value, required = false, className, children }: EnvironmentVariableProps) {
  const { showValues } = useEnvVars();
  const [revealed, setRevealed] = React.useState(false);

  const contextValue = React.useMemo<VariableContextValue>(
    () => ({
      name,
      value,
      required,
      visible: showValues || revealed,
      toggleRevealed: () => setRevealed((current) => !current),
    }),
    [name, value, required, showValues, revealed],
  );

  return (
    <VariableContext.Provider value={contextValue}>
      <TableRow className={className}>
        <TableCell className="w-40 shrink-0">
          <View className="flex-row items-center gap-1.5">
            <Text numberOfLines={1} style={monoStyle} className="shrink-0 text-xs text-foreground">
              {name}
            </Text>
            {required ? <EnvironmentVariableRequired /> : null}
          </View>
        </TableCell>
        <TableCell className="w-64 shrink-0">
          {children ?? (
            <View className="flex-row items-center gap-1">
              <EnvironmentVariableValue />
              <EnvironmentVariableRevealButton />
              <EnvironmentVariableCopyButton />
            </View>
          )}
        </TableCell>
      </TableRow>
    </VariableContext.Provider>
  );
}

/** The key, from context — the part the KB describes as "defaults to name". */
function EnvironmentVariableName({ className }: { className?: string }) {
  const { name } = useVariable();
  return (
    <Text numberOfLines={1} style={monoStyle} className={cn('text-xs text-foreground', className)}>
      {name}
    </Text>
  );
}

/**
 * The value cell's text: masked by default (AC-4), real when visible. The mask renders
 * in the muted pole so a masked row reads as "deliberately hidden", not broken.
 */
function EnvironmentVariableValue({ className }: { className?: string }) {
  const { name, value, visible } = useVariable();

  return (
    <Text
      numberOfLines={1}
      style={monoStyle}
      accessibilityLabel={visible ? `${name} is ${value}` : `${name} is masked`}
      className={cn('min-w-0 flex-1 text-xs', visible ? 'text-foreground' : 'text-muted-foreground', className)}
    >
      {visible ? value : maskedValue(value)}
    </Text>
  );
}

/** The upstream badge — outline chip reading "required" beside the key. */
function EnvironmentVariableRequired({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn('shrink-0', className)}>
      <Text>required</Text>
    </Badge>
  );
}

/** THE DECLARED ADDITION: the per-row half of AC-4's "reveal a single value on demand". */
function EnvironmentVariableRevealButton({ className }: { className?: string }) {
  const { visible, toggleRevealed } = useVariable();

  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={toggleRevealed}
      accessibilityLabel={visible ? 'Hide value' : 'Reveal value'}
      accessibilityState={{ selected: visible }}
      // House formula: RNR's h-10 (40pt) + hitSlop 2/side = the 44pt platform minimum.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('shrink-0', className)}
    >
      <Icon as={visible ? EyeOffIcon : EyeIcon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

type EnvironmentVariableCopyButtonProps = {
  timeout?: number;
  onCopy?: () => void;
  onError?: (error: unknown) => void;
  className?: string;
};

/**
 * Copies the KB's documented format — `export KEY="value"` — with the REAL value even
 * while masked (the mask is a display guard; a copied mask is worse than useless).
 */
function EnvironmentVariableCopyButton({ timeout = 2000, onCopy, onError, className }: EnvironmentVariableCopyButtonProps) {
  const { name, value } = useVariable();
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  async function copy() {
    try {
      await Clipboard.setStringAsync(formatEnvLine(name, value));
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
      accessibilityLabel={copied ? 'Copied' : `Copy ${name}`}
      // House formula: RNR's h-10 (40pt) + hitSlop 2/side = the 44pt platform minimum.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('shrink-0', className)}
    >
      <Icon as={copied ? CheckIcon : CopyIcon} size={14} className="text-muted-foreground" />
    </Button>
  );
}

/**
 * A labelled band of rows inside the one shared table — a muted label row, then the
 * group's rows. (Upstream's group is an unstyled div; the label row is the smallest
 * RN-honest shape that keeps one table, one scroll.)
 */
function EnvironmentVariableGroup({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <React.Fragment>
      <TableRow className={cn('bg-muted/50', className)}>
        <TableCell className="w-40 shrink-0">
          <TextClassContext.Provider value="text-xs font-medium text-muted-foreground">
            <Text>{label}</Text>
          </TextClassContext.Provider>
        </TableCell>
      </TableRow>
      {children}
    </React.Fragment>
  );
}

export {
  EnvironmentVariable,
  EnvironmentVariableCopyButton,
  EnvironmentVariableGroup,
  EnvironmentVariableName,
  EnvironmentVariableRequired,
  EnvironmentVariableRevealButton,
  EnvironmentVariableValue,
  EnvironmentVariables,
  EnvironmentVariablesContent,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesToggle,
  useEnvVars,
  useVariable,
};
