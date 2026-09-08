/**
 * Gallery chrome: the scheme strip (P8) and the Expo Go status chip (P12).
 *
 * The scheme strip makes the dark flip OBSERVABLE: it shows the live scheme and
 * flips the whole app via Appearance.setColorScheme — uniwind's adaptive themes
 * follow it, so every cell re-themes mid-render and a stranger can watch the
 * terminal surface stay dark while everything else flips.
 *
 * The chip surfaces the registry's per-item install verdict — Expo Go ✓ or
 * "dev client required" — read from the GENERATED manifest, never assumed.
 */
import { MoonIcon, SmartphoneIcon, SunIcon } from 'lucide-react-native';
import * as React from 'react';
import { Appearance, Pressable, Text, useColorScheme, View } from 'react-native';

type SchemeChoice = 'system' | 'light' | 'dark';

const CHOICES: { key: SchemeChoice; label: string; icon: typeof SunIcon }[] = [
  { key: 'system', label: 'System', icon: SmartphoneIcon },
  { key: 'light', label: 'Light', icon: SunIcon },
  { key: 'dark', label: 'Dark', icon: MoonIcon },
];

/** The P8 scheme strip: live scheme readout + system/light/dark flip. */
export function SchemeStrip() {
  const scheme = useColorScheme();
  const [choice, setChoice] = React.useState<SchemeChoice>('system');

  const apply = (next: SchemeChoice) => {
    setChoice(next);
    Appearance.setColorScheme(next === 'system' ? null : next);
  };

  return (
    <View
      testID="gallery-scheme-strip"
      className="flex-row items-center justify-between rounded-md border border-border bg-background px-3 py-2"
    >
      <Text className="text-xs text-muted-foreground">
        Scheme: <Text className="font-medium text-foreground">{scheme ?? 'system'}</Text>
      </Text>
      <View className="flex-row gap-1">
        {CHOICES.map(({ key, label, icon: Icon }) => {
          const active = choice === key;
          return (
            <Pressable
              key={key}
              onPress={() => apply(key)}
              accessibilityLabel={`Set scheme ${label}`}
              className={`flex-row items-center gap-1 rounded-full border px-2.5 py-1 ${active ? 'border-primary bg-primary/10' : 'border-border'}`}
            >
              <Icon size={12} className={active ? 'text-primary' : 'text-muted-foreground'} />
              <Text className={`text-xs ${active ? 'text-primary' : 'text-foreground'}`}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

/** The P12 install verdict chip: shown for EVERY item, never silently skipped. */
export function ExpoGoChip({ expoGo }: { expoGo: boolean }) {
  return (
    <View
      testID={expoGo ? 'expo-go-ok' : 'expo-go-dev-client'}
      className={`self-start rounded-full border px-2 py-0.5 ${expoGo ? 'border-border' : 'border-destructive/50'}`}
    >
      <Text className={`text-[10px] ${expoGo ? 'text-muted-foreground' : 'text-destructive'}`}>
        {expoGo ? 'Expo Go ✓' : 'dev client required'}
      </Text>
    </View>
  );
}
