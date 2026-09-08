/**
 * /gallery/[item] — one item, four states, live controls. The matrix is the
 * contract: populated / empty / loading / error, all rendered by the real
 * component from seeded literals a stranger can read.
 */
import { Link, Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CELL_STATES, CELLS, type CellOverrides } from '../../gallery/cells';
import { CONTROLS } from '../../gallery/controls';
import { GALLERY_ITEMS } from '../../gallery/manifest';

const STATE_LABEL: Record<(typeof CELL_STATES)[number], string> = {
  populated: 'Populated',
  empty: 'Empty',
  loading: 'Loading',
  error: 'Error',
};

export default function GalleryItemScreen() {
  const { item: name } = useLocalSearchParams<{ item: string }>();
  const item = GALLERY_ITEMS.find((i) => i.name === name);
  const [overrides, setOverrides] = React.useState<CellOverrides>({});
  const cells = name ? CELLS[name] : undefined;
  const controls = name ? (CONTROLS[name] ?? []) : [];

  if (!item) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-2 bg-background">
        <Stack.Screen options={{ title: 'Not found' }} />
        <Text className="text-sm text-destructive">No gallery item named “{name}”</Text>
        <Link href="/gallery" className="text-sm text-primary">
          Back to the gallery
        </Link>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: item.title }} />
      <ScrollView contentContainerClassName="gap-4 px-4 pb-8">
        <Text className="text-xs text-muted-foreground" numberOfLines={4}>
          {item.description}
        </Text>

        {controls.length > 0 && (
          <View className="gap-2 rounded-md border border-border p-3" testID="gallery-controls">
            <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Controls — real props
            </Text>
            {controls.map((control) => (
              <View key={control.prop} className="gap-1.5">
                <Text className="text-xs text-muted-foreground">{control.label}</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {control.options.map((option) => {
                    const active = overrides[control.prop] === undefined
                      ? option === control.options[0]
                      : overrides[control.prop] === option.value;
                    return (
                      <Pressable
                        key={String(option.label)}
                        onPress={() => setOverrides((o) => ({ ...o, [control.prop]: option.value }))}
                        className={`rounded-full border px-2.5 py-1 ${active ? 'border-primary bg-primary/10' : 'border-border'}`}
                      >
                        <Text
                          className={`text-xs ${active ? 'text-primary' : 'text-foreground'}`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        <View className="flex-row flex-wrap gap-3">
          {CELL_STATES.map((state) => {
            const cell = cells?.[state];
            return (
              <View
                key={state}
                testID={`gallery-cell-${item.name}-${state}`}
                className="min-w-[47%] flex-1 gap-2 rounded-md border border-border p-3"
              >
                <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {STATE_LABEL[state]}
                </Text>
                {cell ? (
                  cell(overrides)
                ) : (
                  <Text className="text-sm text-muted-foreground">
                    (cell not authored yet — {item.name}/{state})
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
