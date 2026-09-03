import { Avatar, AvatarFallback, AvatarImage } from '@/registry/{engine}/components/ui/avatar';
import { Text } from '@/registry/{engine}/components/ui/text';
import { cn } from '@/registry/{engine}/lib/utils';
import { View, type ViewProps } from 'react-native';

/**
 * Persona — who is speaking.
 *
 * DIVERGES FROM THE WEB ORIGINAL, deliberately. The web `persona` is a RIVE animation on a
 * WebGL2 canvas — six variants driven by five state-machine inputs — not the avatar card it
 * resembles. `rive-react-native` is a first-party runtime, so an animated port is possible,
 * but it would make this the only registry item pulling a native animation runtime.
 *
 * What ships here is the identity surface: avatar, name, description, status. The animated
 * avatar is NOT ported. If it is ever wanted it belongs as a separate opt-in item that
 * declares rive-react-native, rather than as a dependency every consumer inherits for a
 * component most will use as a header.
 *
 * That is a real gap, and the porting-verdict table says so rather than implying parity.
 */

type PersonaProps = ViewProps & {
  name: string;
  description?: string;
  avatarUri?: string;
  /** Shown as a muted trailing label — "thinking", "idle", a model id. */
  status?: string;
};

function Persona({ name, description, avatarUri, status, className, ...props }: PersonaProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View className={cn('flex-row items-center gap-3', className)} {...props}>
      {/* Explicit RN style sizing, redundant with `size-10` on purpose. The avatar's
          percent-sized fallback (`size-full`) resolves against the nearest DEFINITE
          ancestor when the root loses its class-driven size — observed on device as a
          full-screen `bg-muted` pill when the runtime stylesheet dropped the size rules
          (stale uniwind stylesheet state). A numeric style bypasses the stylesheet, so
          the fallback can never exceed 40pt in any engine. */}
      <Avatar alt={name} className="size-10" style={{ width: 40, height: 40 }}>
        {avatarUri ? <AvatarImage source={{ uri: avatarUri }} /> : null}
        <AvatarFallback>
          <Text className="text-sm font-medium">{initials}</Text>
        </AvatarFallback>
      </Avatar>
      <View className="min-w-0 flex-1 gap-0.5">
        <Text numberOfLines={1} className="text-sm font-medium text-foreground">
          {name}
        </Text>
        {description ? (
          <Text numberOfLines={2} className="text-xs text-muted-foreground">
            {description}
          </Text>
        ) : null}
      </View>
      {status ? (
        <Text numberOfLines={1} className="shrink-0 text-xs text-muted-foreground">
          {status}
        </Text>
      ) : null}
    </View>
  );
}

export { Persona };
