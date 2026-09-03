import { Button } from '@/registry/{engine}/components/ui/button';
import { Card } from '@/registry/{engine}/components/ui/card';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { XIcon, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { ScrollView, View, type ViewProps } from 'react-native';

/**
 * Artifact — the container for a generated deliverable (code, document, output), with
 * the header chrome the web original ships: title, description, actions, close, and a
 * scrollable content area.
 *
 * TWO BRIEF CORRECTIONS AGAINST THE TASK'S STARTING POSITION, on the record:
 *  1. NO ArtifactTrigger AND NO VERSIONING — verified against the current upstream
 *     artifact.tsx (Artifact/Header/Close/Title/Description/Actions/Action/Content —
 *     nothing else) and against the KB (same part set). The PRD's verdict says nothing
 *     of versions either. There is no version state or onVersionChange to port or to
 *     test, so none ships; inventing one would be an API the web never had.
 *  2. THE FULL-SCREEN SHEET IS THE HOST'S PRESENTATION, NOT THIS COMPONENT. The PRD
 *     verdict ("a phone has no side; it becomes a full-screen sheet with a return
 *     control") describes how the container is PRESENTED — on the web the same container
 *     is presented as a side panel, also host layout. The component ships the container
 *     plus the close/return control; the consumer mounts it inside this registry's Sheet
 *     (which backs exactly this: "drawer, command, sidebar, panel…") and wires Close to
 *     the sheet's dismissal, exactly as the web host wires ArtifactClose.
 *
 * DROPPED: the web ArtifactAction's optional Tooltip wrapper — a hover surface, dead
 * under a thumb (queue.tsx's always-visible precedent). The action's `label` becomes
 * the accessibility label instead.
 */

type ArtifactProps = ViewProps & { children?: React.ReactNode };

function Artifact({ className, children, ...props }: ArtifactProps) {
  return (
    // Composed Card per the porting verdict, overridden to the web container's shape:
    // no default padding/gap (the header owns its own), clipped corners, background on
    // `background` exactly as the web writes it.
    <Card className={cn('gap-0 overflow-hidden rounded-lg py-0', className)} {...props}>
      {children}
    </Card>
  );
}

function ArtifactHeader({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn('flex-row items-center justify-between gap-2 border-b border-border bg-muted/50 px-4 py-3', className)}
      {...props}
    />
  );
}

type ArtifactCloseProps = Omit<React.ComponentProps<typeof Button>, 'children'> & {
  /** Overrides the default X mark. */
  children?: React.ReactNode;
  className?: string;
};

/** The return control. The consumer wires onPress to whatever presented the artifact. */
function ArtifactClose({ children, className, ...props }: ArtifactCloseProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      // House formula (queue/confirmation precedent): RNR's h-10 + hitSlop 2/side is
      // the 44pt platform minimum, with no pixel of extra chrome.
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      accessibilityLabel="Close"
      className={cn('rounded-full', className)}
      {...props}
    >
      {children ?? <Icon as={XIcon} size={16} className="text-muted-foreground" />}
    </Button>
  );
}

function ArtifactTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      numberOfLines={1}
      className={cn('flex-1 text-sm font-medium text-foreground', className)}
      {...props}
    />
  );
}

function ArtifactDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text numberOfLines={1} className={cn('text-sm text-muted-foreground', className)} {...props} />;
}

function ArtifactActions({ className, ...props }: ViewProps) {
  return <View className={cn('flex-row items-center gap-1', className)} {...props} />;
}

type ArtifactActionProps = {
  /** The icon. Renders alone unless children are supplied (web precedence). */
  icon?: LucideIcon;
  /** The accessibility label — the web's tooltip/sr-only pair, on a touch surface. */
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  /** Overrides the icon. */
  children?: React.ReactNode;
  className?: string;
};

function ArtifactAction({ icon, label, onPress, disabled, children, className }: ArtifactActionProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      hitSlop={{ top: 2, bottom: 2, left: 2, right: 2 }}
      className={cn('rounded-full', className)}
    >
      {children ?? (icon ? <Icon as={icon} size={16} className="text-muted-foreground" /> : null)}
    </Button>
  );
}

/**
 * The content area. The web's `flex-1 overflow-auto p-4` — on React Native the
 * overflow-auto leg IS a ScrollView, so long artifacts scroll inside the container
 * (terminal.tsx's different-axis rule keeps it from fighting the transcript scroller).
 */
function ArtifactContent({ className, children, ...props }: ViewProps & { children?: React.ReactNode }) {
  return (
    <ScrollView
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
      className={cn('flex-1', className)}
      contentContainerClassName="p-4"
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export { Artifact, ArtifactAction, ArtifactActions, ArtifactClose, ArtifactContent, ArtifactDescription, ArtifactHeader, ArtifactTitle };
