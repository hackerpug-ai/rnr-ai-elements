import { cn } from '@/registry/{engine}/lib/utils';
import * as SliderPrimitive from '@rn-primitives/slider';
import * as React from 'react';
import { Platform, View } from 'react-native';

/**
 * Slider — RNR does not wrap @rn-primitives/slider, so this is the styled shell.
 * Geometry is derived from RNR's Progress (h-2, rounded-full, bg-primary/20 track with a
 * bg-primary fill) so the two read as one family.
 *
 * Needed by audio-player (scrubber), transcription (seek), voice-selector (rate/pitch)
 * and controls.
 *
 * THE THUMB HIT AREA IS MUCH LARGER THAN THE THUMB. The web thumb size is a mouse target,
 * not a touch target — shipping it at its visual size makes the control feel broken.
 */

type SliderProps = Omit<React.ComponentProps<typeof SliderPrimitive.Root>, 'value'> & {
  className?: string;
  /** Normalised 0..1. The primitive works in min..max, so this maps onto 0..100. */
  value?: number;
};

function Slider({ className, value = 0, ...props }: SliderProps) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <SliderPrimitive.Root
      // The primitive requires `value` in its own scale; ours is normalised.
      value={pct * 100}
      min={0}
      max={100}
      className={cn('w-full justify-center', className)}
      accessibilityRole="adjustable"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(pct * 100) }}
      {...props}
    >
      <SliderPrimitive.Track className="h-2 w-full overflow-hidden rounded-full bg-primary/20">
        <View className="h-full rounded-full bg-primary" style={{ width: `${pct * 100}%` }} />
      </SliderPrimitive.Track>
      <View
        className="absolute size-4 rounded-full border border-border bg-primary shadow-sm shadow-black/5"
        style={{ left: `${pct * 100}%`, marginLeft: -8 }}
        // 22pt of slop around a 16pt thumb clears the platform minimum without changing
        // a single pixel of what is drawn.
        hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
        pointerEvents={Platform.OS === 'web' ? 'auto' : 'box-only'}
      />
    </SliderPrimitive.Root>
  );
}

export { Slider };
