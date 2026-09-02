import { Button } from '@/registry/{engine}/components/ui/button';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { ScrollView, type ScrollViewProps } from 'react-native';

/**
 * Suggestion — starter prompts and follow-up chips a user taps instead of typing.
 *
 * Ported from Vercel AI Elements. Behaviors preserved from the web original:
 *  - the row SCROLLS horizontally and never wraps; layout does not reflow
 *  - `onPress` receives the suggestion STRING, not an event, so the caller can send it
 *    directly without unwrapping anything
 *
 * Deliberate native adaptations:
 *  - the web `ScrollArea` exists to restyle browser scrollbar chrome. React Native has no
 *    scrollbar chrome, so a plain horizontal ScrollView IS the scroll area. No primitive.
 *  - the web chips carry `hover:` only. On touch that renders identically at rest and is
 *    dead under a thumb, so press feedback comes from RNR Button's own `active:` variants.
 *  - `onClick` is `onPress`, the React Native name.
 *
 * Styling is entirely RNR's: this file declares no token and no colour.
 */

export type SuggestionsProps = ScrollViewProps & {
  className?: string;
  contentClassName?: string;
};

function Suggestions({ className, contentClassName, children, ...props }: SuggestionsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      className={cn('w-full', className)}
      contentContainerClassName={cn('flex-row gap-2 px-1 py-2', contentClassName)}
      {...props}
    >
      {children}
    </ScrollView>
  );
}

export type SuggestionProps = Omit<React.ComponentProps<typeof Button>, 'onPress' | 'children'> & {
  /** The prompt text. Also what `onPress` receives. */
  suggestion: string;
  /** Receives the suggestion string, not a press event. */
  onPress?: (suggestion: string) => void;
};

function Suggestion({
  suggestion,
  onPress,
  className,
  variant = 'outline',
  size = 'sm',
  ...props
}: SuggestionProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn('rounded-full', className)}
      onPress={() => onPress?.(suggestion)}
      accessibilityRole="button"
      accessibilityLabel={suggestion}
      {...props}
    >
      <Text>{suggestion}</Text>
    </Button>
  );
}

export { Suggestion, Suggestions };
