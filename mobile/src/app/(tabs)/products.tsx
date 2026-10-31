import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { useMeta, useProducts } from '@/api/queries';
import type { Dietary } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Hero } from '@/components/Hero';
import { ProductCard } from '@/components/ProductCard';
import { SearchField } from '@/components/SearchField';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/States';
import { announce } from '@/lib/a11y';
import { DIETARY_META, pluralise } from '@/lib/format';
import { useDebounced } from '@/lib/hooks';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

const DIETARY: Dietary[] = ['gelatine_free', 'vegetarian', 'vegan', 'hand_slaughtered'];

export default function ProductsScreen() {
  const { colors } = useAppTheme();
  const { width, fontScale } = useWindowDimensions();
  // Two columns normally; one column for large text or narrow screens so nothing truncates.
  const columns = fontScale > 1.3 || width < 340 ? 1 : 2;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [dietary, setDietary] = useState<Dietary[]>([]);
  const q = useDebounced(search.trim(), 300);
  const meta = useMeta();
  const query = useProducts({ q: q || undefined, category, dietary });
  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.meta.total;

  useEffect(() => {
    if (total !== undefined && !query.isFetching) announce(`${pluralise(total, 'product')} found`);
  }, [total, query.isFetching]);

  const toggleDiet = (d: Dietary) => setDietary((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const header = (
    <View>
      <Hero>
        <AppText variant="title" accessibilityRole="header" style={{ color: '#FFFFFF' }}>
          Halal products
        </AppText>
        <AppText variant="body" style={{ color: colors.heroTextMuted, marginBottom: space.lg }}>
          Check a product&apos;s certificate before you buy
        </AppText>
        <SearchField value={search} onChangeText={setSearch} label="Search products" placeholder="Product, brand or barcode" />
        <Button
          label="Scan a barcode"
          icon="scan"
          variant="onHero"
          onPress={() => router.push('/scan')}
          style={{ marginTop: space.md }}
          accessibilityHint="Opens the camera to check a product"
        />
      </Hero>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips} accessibilityLabel="Product categories">
        <Chip label="All" selected={!category} onPress={() => setCategory(undefined)} />
        {meta.data?.productCategories.map((c) => (
          <Chip key={c.value} label={c.value} selected={category === c.value} onPress={() => setCategory(category === c.value ? undefined : c.value)} />
        ))}
      </ScrollView>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]} accessibilityLabel="Dietary needs">
        {DIETARY.map((d) => (
          <Chip key={d} label={DIETARY_META[d].label} selected={dietary.includes(d)} onPress={() => toggleDiet(d)} />
        ))}
      </ScrollView>

      {total !== undefined && (
        <AppText variant="small" color="textMuted" style={styles.count}>
          {pluralise(total, 'certified product')}
        </AppText>
      )}
    </View>
  );

  return (
    <FlatList
      key={columns}
      data={items}
      numColumns={columns}
      keyExtractor={(p) => p.id}
      columnWrapperStyle={columns > 1 ? { gap: space.md, paddingHorizontal: space.xl } : undefined}
      renderItem={({ item }) => (
        <View style={columns > 1 ? { flex: 1 / columns } : { paddingHorizontal: space.xl }}>
          <ProductCard product={item} layout={columns > 1 ? 'grid' : 'row'} />
        </View>
      )}
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      contentContainerStyle={{ paddingBottom: space.xxxl }}
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReachedThreshold={0.5}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
      refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => {
            query.refetch();
          }} tintColor={colors.primary} />}
      ListEmptyComponent={
        <View style={{ paddingHorizontal: space.xl }}>
          {query.isPending ? (
            <ListSkeleton label="Loading products" />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          ) : (
            <EmptyState
              icon="products"
              title="No products found"
              message="Try another search, or scan the barcode on the pack."
              actionLabel="Clear filters"
              onAction={() => {
                setSearch('');
                setCategory(undefined);
                setDietary([]);
              }}
            />
          )}
        </View>
      }
      ListFooterComponent={query.isFetchingNextPage ? <ActivityIndicator style={{ margin: space.xl }} color={colors.primary} /> : undefined}
    />
  );
}

const styles = StyleSheet.create({
  chips: { gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.lg },
  count: { paddingHorizontal: space.xl, paddingBottom: space.md },
});
