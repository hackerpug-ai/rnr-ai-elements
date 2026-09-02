import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

/**
 * ButtonGroup — a segmented row for controls, toolbar and message actions.
 *
 * React Native has NO `:first-child` / `:last-child`, and Tailwind's descendant selectors
 * (`[&>*:first-child]:`) compile to nothing here. So corner rounding is published through
 * context and read by each child rather than selected for. That is the whole reason this
 * is a component and not a `flex-row` div.
 */

type Position = 'first' | 'middle' | 'last' | 'only';
const ButtonGroupContext = React.createContext<Position>('only');

/** Corner classes for a child's position. Apply to the child's own className. */
export function useButtonGroupPosition(): { position: Position; className: string } {
  const position = React.useContext(ButtonGroupContext);
  const className =
    position === 'only'
      ? ''
      : position === 'first'
        ? 'rounded-r-none border-r-0'
        : position === 'last'
          ? 'rounded-l-none'
          : 'rounded-none border-r-0';
  return { position, className };
}

function ButtonGroup({ className, children, ...props }: ViewProps) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <View className={cn('flex-row items-center', className)} accessibilityRole="toolbar" {...props}>
      {items.map((child, i) => {
        const position: Position =
          items.length === 1 ? 'only' : i === 0 ? 'first' : i === items.length - 1 ? 'last' : 'middle';
        return (
          <ButtonGroupContext.Provider key={i} value={position}>
            {child}
          </ButtonGroupContext.Provider>
        );
      })}
    </View>
  );
}

/** Wrap a child to receive its group corner classes without threading props by hand. */
function ButtonGroupItem({ className, children, ...props }: ViewProps) {
  const { className: pos } = useButtonGroupPosition();
  return (
    <View className={cn(pos, className)} {...props}>
      {children}
    </View>
  );
}

export { ButtonGroup, ButtonGroupItem };
