import { cn } from '@/registry/{engine}/lib/utils';
import * as DialogPrimitive from '@rn-primitives/dialog';
import { PortalHost } from '@rn-primitives/portal';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Platform, View, type GestureResponderEvent } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ReduceMotion,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideInUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  SlideOutUp,
} from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

/**
 * Sheet — the most load-bearing primitive in this registry.
 *
 * RNR ships no sheet, drawer, resizable or sidebar. This one backs all of them plus
 * command, panel, open-in-chat and model-selector, because on a phone a dropdown, a
 * command palette and a side panel all collapse to the same surface.
 *
 * Built on @rn-primitives/dialog, styled from RNR's own dialog so the two are visually one
 * family: same overlay (bg-black/50), same FullWindowOverlay guard on iOS, same
 * ReduceMotion handling.
 *
 * THE CRITICAL DETAIL — SheetContent mounts its OWN NAMED PortalHost. An RNR Select or
 * DropdownMenu opened from inside a sheet portals to the ROOT host and renders BEHIND the
 * sheet. There is no error; it just appears to do nothing, and it reproduces only on
 * device. Pass `portalHost={useSheetPortalHost()}` to any overlay you nest in here.
 */

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

type Side = 'bottom' | 'top' | 'left' | 'right';

const SheetPortalHostContext = React.createContext<string | undefined>(undefined);

/** Name of the sheet's own portal host. Pass to nested RNR overlays. */
function useSheetPortalHost() {
  return React.useContext(SheetPortalHostContext);
}

const sheetVariants = cva('absolute z-50 gap-4 border-border bg-background p-6 shadow-sm shadow-black/5', {
  variants: {
    side: {
      bottom: 'bottom-0 left-0 right-0 rounded-t-xl border-t',
      top: 'left-0 right-0 top-0 rounded-b-xl border-b',
      left: 'bottom-0 left-0 top-0 w-3/4 max-w-sm rounded-r-xl border-r',
      right: 'bottom-0 right-0 top-0 w-3/4 max-w-sm rounded-l-xl border-l',
    },
  },
  defaultVariants: { side: 'bottom' },
});

const ENTER = { bottom: SlideInDown, top: SlideInUp, left: SlideInLeft, right: SlideInRight };
const EXIT = { bottom: SlideOutDown, top: SlideOutUp, left: SlideOutLeft, right: SlideOutRight };

function SheetOverlay({
  className,
  onPress,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, 'asChild'>) {
  const { onOpenChange } = DialogPrimitive.useRootContext();
  function onOverlayPress(event: GestureResponderEvent) {
    onPress?.(event);
    if (event.target === event.currentTarget && !event.isDefaultPrevented()) onOpenChange(false);
  }
  return (
    <DialogPrimitive.Overlay
      className={cn('absolute bottom-0 left-0 right-0 top-0 z-50 bg-black/50', className)}
      onPress={onOverlayPress}
      {...props}
    />
  );
}

type SheetContentProps = Omit<React.ComponentProps<typeof DialogPrimitive.Content>, 'asChild'> &
  VariantProps<typeof sheetVariants> & {
    /** Unique host name. Defaults to a generated one; set it if you nest sheets. */
    portalHostName?: string;
  };

function SheetContent({ className, side = 'bottom', portalHostName, children, ...props }: SheetContentProps) {
  const generated = React.useId();
  const hostName = portalHostName ?? `sheet-${generated}`;
  const s = (side ?? 'bottom') as Side;

  return (
    <DialogPrimitive.Portal>
      <FullWindowOverlay>
        <SheetOverlay />
        <Animated.View
          entering={ENTER[s].duration(200).reduceMotion(ReduceMotion.System)}
          exiting={EXIT[s].duration(150).reduceMotion(ReduceMotion.System)}
          className={cn(sheetVariants({ side: s }), className)}
        >
          <DialogPrimitive.Content {...props}>
            <SheetPortalHostContext.Provider value={hostName}>
              {s === 'bottom' ? (
                // Grab handle — the affordance that says this is draggable/dismissable.
                <View className="mx-auto h-1 w-10 rounded-full bg-muted-foreground/40" />
              ) : null}
              {children}
              {/* Nested overlays portal HERE, not to the root, or they render behind. */}
              <PortalHost name={hostName} />
            </SheetPortalHostContext.Provider>
          </DialogPrimitive.Content>
        </Animated.View>
      </FullWindowOverlay>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('gap-1.5', className)} {...props} />;
}

function SheetFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn('flex-row justify-end gap-2 pt-2', className)} {...props} />;
}

const SheetTitle = DialogPrimitive.Title;
const SheetDescription = DialogPrimitive.Description;

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetTitle,
  SheetTrigger,
  sheetVariants,
  useSheetPortalHost,
};

export const FadeInOut = { FadeIn, FadeOut };
