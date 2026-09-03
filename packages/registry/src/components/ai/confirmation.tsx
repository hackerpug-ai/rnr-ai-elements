import { Button } from '@/registry/{engine}/components/ui/button';
import { Card } from '@/registry/{engine}/components/ui/card';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { CheckIcon, CircleCheckIcon, CircleSlashIcon, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import {
  CONFIRMATION_OUTCOME,
  confirmationPhase,
  resolveDecision,
  type ConfirmationApproval,
  type ConfirmationPhase,
  type ToolStatus,
} from './confirmation.logic';

/**
 * Confirmation — human-in-the-loop approve/deny, sized for a thumb (UC-AGENT-04).
 *
 * THE WEB ORIGINAL'S RENDER CONTRACT, VERBATIM: it renders NOTHING without an approval
 * and nothing while the tool part is still streaming its arguments — the phase machine
 * in confirmation.logic.ts (Vitest-owned) is that contract made total. While pending,
 * the request is legible (AC-2: the caller renders exactly what is being asked, args
 * included, in the request slot) and the pair is live.
 *
 * THE OUTCOME PERSISTS, question.tsx'S WAY. The web swaps the buttons for
 * Accepted/Rejected rows; on a phone the pair STAYS — the chosen side flips to a
 * filled, check-marked resolved state and the other side disables (a mistap must not
 * re-decide what the agent was told). The answer thus remains visible in the transcript
 * afterward (AC-3), and the component never decides by itself: `onRespond` hands the
 * boolean to the caller, whose job is feeding it back through `approval` — an
 * unanswered optimistic press is held only until props speak.
 *
 * VARIANT MAPPING, DECLARED: Approve carries RNR's `destructive` variant because
 * approval is the one destructive direction in the exchange — it EXECUTES the agent's
 * requested action; Deny is the safe escape and takes `outline`. A benign approval can
 * re-map through the action's own props.
 *
 * Touch targets: RNR's h-10 control plus hitSlop reaches the 44pt platform minimum
 * (AC-1) without a pixel of extra chrome.
 */

type ConfirmationContextValue = {
  phase: ConfirmationPhase;
  /** The decision, once made — controlled or optimistic. */
  decision: boolean | null;
  respond: (approved: boolean) => void;
};

const ConfirmationContext = React.createContext<ConfirmationContextValue | null>(null);

function useConfirmation() {
  const ctx = React.useContext(ConfirmationContext);
  if (!ctx) throw new Error('Confirmation sub-components must be used within <Confirmation>');
  return ctx;
}

type ConfirmationProps = Omit<ViewProps, 'children'> & {
  /** The tool part's state, streamed straight in. */
  state: ToolStatus;
  /** The tool part's approval object. Omit it and the card renders nothing. */
  approval?: ConfirmationApproval | null;
  /** Fires once per decision. Wiring the outcome back is the caller's job. */
  onRespond?: (approved: boolean) => void;
  children?: React.ReactNode;
};

function Confirmation({
  state,
  approval,
  onRespond,
  className,
  children,
  ...props
}: ConfirmationProps) {
  const [local, setLocal] = React.useState<boolean | null>(null);
  const phase = confirmationPhase(state, approval, local);
  const decision = resolveDecision(approval, local);

  const respond = React.useCallback(
    (approved: boolean) => {
      if (confirmationPhase(state, approval, local) !== 'pending') return;
      setLocal(approved);
      onRespond?.(approved);
    },
    [state, approval, local, onRespond],
  );

  // The web original's contract: no approval (or a still-streaming request) renders
  // NOTHING — not an empty card, not a spinner.
  if (phase === 'hidden') return null;

  return (
    <ConfirmationContext.Provider value={{ phase, decision, respond }}>
      <Card className={cn('gap-2 p-3', className)} {...props}>
        {children}
      </Card>
    </ConfirmationContext.Provider>
  );
}

/** What is being asked. One line, styled by the caller's children. */
function ConfirmationTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn('text-sm font-semibold text-foreground', className)} {...props} />;
}

/** The request body — exactly which action, arguments included (AC-2). Pending only. */
function ConfirmationRequest({
  className,
  children,
  ...props
}: ViewProps & { children?: React.ReactNode }) {
  const { phase } = useConfirmation();
  if (phase !== 'pending') return null;

  return (
    <View className={cn('gap-1', className)} {...props}>
      {children}
    </View>
  );
}

/** iconName (from confirmation.logic.ts) → Lucide component. Static and exhaustive. */
const OUTCOME_ICONS: Record<'circle-check' | 'circle-slash', LucideIcon> = {
  'circle-check': CircleCheckIcon,
  'circle-slash': CircleSlashIcon,
};

/** One thumb-sized control. Generic on purpose — the pair below is the default layout. */
function ConfirmationAction({
  children,
  onPress,
  disabled,
  selected = false,
  variant = 'outline',
  accessibilityLabel,
  className,
}: Omit<React.ComponentProps<typeof Button>, 'children' | 'onPress'> & {
  children: string;
  onPress: () => void;
  /** Marks the resolved answer with the check — question.tsx's chosen-option form. */
  selected?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Button
      variant={variant}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? children}
      accessibilityState={{ selected, disabled: Boolean(disabled) }}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('flex-1', className)}
    >
      {selected ? <Icon as={CheckIcon} size={14} /> : null}
      <Text>{children}</Text>
    </Button>
  );
}

/**
 * The approve/deny pair. Renders the whole time it is mounted — pending, both live;
 * answered, the chosen side resolved (secondary + check) and the other dead. A pair
 * that vanished would un-ask the question the transcript already answered.
 */
function ConfirmationActions({ className }: { className?: string }) {
  const { phase, decision, respond } = useConfirmation();
  if (phase === 'hidden') return null;

  const pending = phase === 'pending';

  return (
    <View className={cn('flex-row items-center gap-2', className)}>
      <ConfirmationAction
        variant={decision === true ? 'secondary' : 'destructive'}
        disabled={!pending && decision !== true}
        selected={decision === true}
        onPress={() => respond(true)}
        accessibilityLabel="Approve this action"
      >
        Approve
      </ConfirmationAction>
      <ConfirmationAction
        variant={decision === false ? 'secondary' : 'outline'}
        disabled={!pending && decision !== false}
        selected={decision === false}
        onPress={() => respond(false)}
        accessibilityLabel="Deny this action"
      >
        Deny
      </ConfirmationAction>
    </View>
  );
}

/**
 * The persisted outcome, as the outcome map renders it — for callers composing their
 * own resolved card (or a summary line under the pair). Icons keep color from being
 * the sole channel (WCAG 1.4.1).
 */
function ConfirmationOutcome({ outcome }: { outcome: 'approved' | 'denied' }) {
  const meta = CONFIRMATION_OUTCOME[outcome];

  return (
    <View className="flex-row items-center gap-1.5">
      <Icon as={OUTCOME_ICONS[meta.iconName]} size={14} className={cn(meta.className)} />
      <Text className={cn('text-xs font-medium', meta.className)}>{meta.label}</Text>
    </View>
  );
}

export { Confirmation, ConfirmationAction, ConfirmationActions, ConfirmationOutcome, ConfirmationTitle, ConfirmationRequest, useConfirmation };
