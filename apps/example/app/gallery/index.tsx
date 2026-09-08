/**
 * /gallery — the library index: every shipped item, grouped by kind,
 * filterable by name. Rows deep-link to the item's four-state matrix.
 */
import { Link, Stack } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GALLERY_ITEMS, type GalleryItem } from '../../gallery/manifest';

const KIND_LABEL: Record<GalleryItem['kind'], string> = {
  component: 'Components',
  ui: 'UI primitives',
  lib: 'Libraries',
};

function GalleryRow({ item }: { item: GalleryItem }) {
  return (
    <Link href={`/gallery/${item.name}`} asChild>
      <Pressable
        testID={`gallery-row-${item.name}`}
        className="rounded-md border border-border bg-background px-3 py-2.5 active:bg-accent"
      >
        <Text className="text-sm font-medium text-foreground">{item.title}</Text>
        <Text className="mt-0.5 text-xs text-muted-foreground" numberOfLines={2}>
          {item.description}
        </Text>
      </Pressable>
    </Link>
  );
}

export default function GalleryIndex() {
  const [query, setQuery] = React.useState('');
  const filtered = GALLERY_ITEMS.filter((i) =>
    query.trim() === '' ? true : i.name.includes(query.trim().toLowerCase()),
  );

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <Stack.Screen options={{ title: 'Gallery' }} />
      <View className="gap-3 px-4 pb-4">
        <TextInput
          testID="gallery-filter"
          value={query}
          onChangeText={setQuery}
          placeholder="Filter items by name…"
          placeholderTextColor="hsl(0 0% 45.1%)"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
        />
        <Text className="text-xs text-muted-foreground">
          {filtered.length} of {GALLERY_ITEMS.length} items — every cell is live, no screenshots
        </Text>
      </View>
      <ScrollView contentContainerClassName="gap-5 px-4 pb-8">
        {(['component', 'ui', 'lib'] as const).map((kind) => {
          const rows = filtered.filter((i) => i.kind === kind);
          if (rows.length === 0) return null;
          return (
            <View key={kind} className="gap-2">
              <Text className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {KIND_LABEL[kind]} — {rows.length}
              </Text>
              {rows.map((item) => (
                <GalleryRow key={item.name} item={item} />
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
