import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import * as React from 'react';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * Shimmer — the "still generating" signal, applied TO text rather than beside it.
 *
 * THE HIGHEST DESIGN RISK IN THE PORT, and the only genuinely invented treatment.
 * The web effect is a linear-gradient with `background-clip: text` and an animated
 * background-position. React Native has no background-clip:text — not "hard", absent — so
 * whatever we ship here is new visual vocabulary rather than a port.
 *
 * The design lens's resolution, followed exactly: reuse RNR SKELETON'S OWN MOTION
 * SIGNATURE — opacity 1 → 0.5, 1000ms, withRepeat(-1, reverse) — on text at
 * `text-muted-foreground`, which is also the web original's resting colour. An invented
 * treatment that borrows the house pulse reads as house style; a 2000ms gradient sweep
 * reads as a foreign component sitting in someone's app.
 *
 * The masked-gradient variant is deliberately NOT here. It would need
 * @react-native-masked-view and a motion identity RNR does not have, so if it ever ships
 * it ships opt-in.
 *
 * GATED ON REDUCED MOTION. RNR's own Skeleton does not honour it, so this is one place we
 * are stricter — which changes nothing visually when the setting is off, so parity holds.
 * A continuously looping animation is also a WCAG 2.2.2 concern, and streamed responses
 * routinely run past five seconds.
 */

type ShimmerProps = React.ComponentProps<typeof Text> & {
  /** Pulse period in ms. RNR Skeleton's is 1000; changing it gives us our own tempo. */
  duration?: number;
  active?: boolean;
};

function Shimmer({ className, duration = 1000, active = true, children, ...props }: ShimmerProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(1);

  React.useEffect(() => {
    if (!active || reduced) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.5, { duration, reduceMotion: ReduceMotion.System }),
      -1,
      true,
    );
  }, [active, reduced, duration, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={style}>
      <Text className={cn('text-muted-foreground', className)} {...props}>
        {children}
      </Text>
    </Animated.View>
  );
}

export { Shimmer };
