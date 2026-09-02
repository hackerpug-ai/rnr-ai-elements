import { Button } from '@/registry/{engine}/components/ui/button';
import { Card } from '@/registry/{engine}/components/ui/card';
import { Icon } from '@/registry/{engine}/components/ui/icon';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { CheckIcon, MessageCircleQuestionIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * Question — the agent asks, the user answers with one tap.
 *
 * THE TOUCH ADAPTATION IS THE DESIGN. The web original is select-then-submit: options
 * toggle, a QuestionSubmit stays disabled until something is selected, and the answer
 * arrives as onSubmit({ selectedValues, text }). This port ships the PRD's chat verdict
 * instead — "tap a clarifying question offered by the assistant and have it sent
 * WITHOUT RETYPING" (UC-CHAT-04 AC-2) — so a tap on an option IS the submission:
 * one target, one action, no disabled-button dead-ends on a thumb. The web's
 * multi-select and free-text modes are dropped with it: a clarifying question has one
 * answer, and free text is what the composer is for. That is the porting verdict's
 * shape: "a pressable card or pill; RNR button and card".
 *
 * THE OUTCOME PERSISTS. After the answer, the transcript must still read — the chosen
 * option flips to a filled, check-marked state and the alternatives go disabled, so the
 * choice remains visible in the transcript afterward (UC-AGENT-04's persistence rule,
 * applied to a question). An already-answered or disabled card swallows further presses;
 * the component never decides an outcome by itself — `onOptionSelect` hands the value to
 * the caller, whose job is sending it.
 */

type QuestionContextValue = {
  answered: boolean;
  disabled: boolean;
  /** The chosen option, controlled or internal. */
  value: string | null;
  select: (value: string) => void;
};

const QuestionContext = React.createContext<QuestionContextValue | null>(null);

function useQuestion() {
  const ctx = React.useContext(QuestionContext);
  if (!ctx) throw new Error('Question sub-components must be used within <Question>');
  return ctx;
}

type QuestionProps = Omit<ViewProps, 'children'> & {
  /** Controlled answer. Omit it and the card owns its selection. */
  value?: string | null;
  /** Fires once, with the chosen option's value. Sending the message is the caller's job. */
  onOptionSelect?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

function Question({
  value: valueProp,
  onOptionSelect,
  disabled = false,
  className,
  children,
  ...props
}: QuestionProps) {
  const [internal, setInternal] = React.useState<string | null>(null);
  const value = valueProp !== undefined ? valueProp : internal;
  const answered = value !== null;

  function select(next: string) {
    if (disabled || answered) return;
    setInternal(next);
    onOptionSelect?.(next);
  }

  return (
    <QuestionContext.Provider value={{ answered, disabled, value, select }}>
      <Card className={cn('gap-3 p-3', className)} {...props}>
        {children}
      </Card>
    </QuestionContext.Provider>
  );
}

/** What the agent wants to know. One line, with the house question mark. */
function QuestionPrompt({ className, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <View className="flex-row items-start gap-2">
      <Icon as={MessageCircleQuestionIcon} size={16} className="mt-0.5 text-muted-foreground" />
      <Text className={cn('flex-1 text-sm font-medium text-foreground', className)} {...props} />
    </View>
  );
}

function QuestionOptions({ className, ...props }: ViewProps) {
  return <View className={cn('gap-2', className)} {...props} />;
}

type QuestionOptionProps = Omit<React.ComponentProps<typeof Button>, 'onPress' | 'children'> & {
  /** The value `onOptionSelect` receives. */
  value: string;
  /** The option's label. */
  children: string;
};

function QuestionOption({ value, children, className, ...props }: QuestionOptionProps) {
  const { answered, disabled, value: selected, select } = useQuestion();
  const isSelected = selected === value;
  // After the answer, the choice persists and the alternatives dead-stop — a mistap
  // would change what the agent was told, so they must not just be unselected but off.
  const isOff = disabled || (answered && !isSelected);

  return (
    <Button
      variant={isSelected ? 'secondary' : 'outline'}
      disabled={isOff}
      onPress={() => select(value)}
      accessibilityRole="button"
      accessibilityLabel={children}
      accessibilityState={{ selected: isSelected, disabled: isOff }}
      className={cn('justify-start', className)}
      {...props}
    >
      {isSelected ? <Icon as={CheckIcon} size={14} /> : null}
      <Text>{children}</Text>
    </Button>
  );
}

export { Question, QuestionOption, QuestionOptions, QuestionPrompt, useQuestion };
