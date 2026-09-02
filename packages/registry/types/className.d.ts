/**
 * `className` on React Native components.
 *
 * Both styling engines add this at build time — Uniwind generates uniwind-types.d.ts from
 * the Metro transform, NativeWind ships its own. Registry sources are engine-agnostic and
 * are typechecked outside either app, so the augmentation is declared here instead.
 */
import 'react-native';

declare module 'react-native' {
  interface ViewProps { className?: string }
  interface TextProps { className?: string }
  interface TextInputProps { className?: string; placeholderClassName?: string }
  interface PressableProps { className?: string }
  interface ImageProps { className?: string }
  interface ScrollViewProps { className?: string; contentContainerClassName?: string }
  interface FlatListProps<ItemT> { className?: string; contentContainerClassName?: string }
}
