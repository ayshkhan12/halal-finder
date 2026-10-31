import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useRestaurants } from '@/api/queries';
import type { VenueCategory } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Hero } from '@/components/Hero';
import { Icon } from '@/components/Icon';
import { RestaurantCard } from '@/components/RestaurantCard';
import { SearchField } from '@/components/SearchField';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/States';
import { announce } from '@/lib/a11y';
import { CATEGORY_META, pluralise } from '@/lib/format';
import { useDebounced } from '@/lib/hooks';
import { RADIUS_STEPS, useFilters } from '@/state/filters';
import { useLocation } from '@/state/location';
import { usePreferences } from '@/state/preferences';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

const CATEGORIES = Object.keys(CATEGORY_META) as VenueCategory[];

export default function ExploreScreen() {
  const { colors } = useAppTheme();
  const location = useLocation();
  const { distanceUnit } = usePreferences();
  const { filters, setFilters, apiFilters, activeCount, reset } = useFilters();
  const [search, setSearch] = useState('');
  const q = useDebounced(search.trim(), 300);

  const query = useRestaurants({ ...apiFilters, q: q || undefined }, location.origin);
  const items = query.data?.pages.flatMap((p) => p.data) ?? [];
  const total = query.data?.pages[0]?.meta.total;

  useEffect(() => {
    if (total !== undefined && !query.isFetching) announce(`${pluralise(total, 'place')} found`);
  }, [total, query.isFetching]);

  const toggleCategory = (c: VenueCategory | 'all') => {
    if (c === 'all') return setFilters({ category: [] });
    const has = filters.category.includes(c);
    setFilters({ category: has ? filters.category.filter((x) => x !== c) : [...filters.category, c] });
  };

  const radiusText = `${RADIUS_STEPS[distanceUnit][filters.radiusStep]} ${distanceUnit === 'mi' ? 'miles' : 'km'}`;
  const heading = location.origin ? `Within ${radiusText}` : 'Top rated across the UK';

  const header = (
    <View>
      <Hero>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={location.label ? `Location: ${location.label}. Change location` : 'Choose your location'}
          onPress={() => router.push('/location')}
          hitSlop={8}
          style={({ pressed }) => [styles.locationButton, { opacity: pressed ? 0.7 : 1 }]}>
          <Icon name="location" size={16} color={colors.gold} />
          <AppText variant="label" style={{ color: '#F0D98A' }} numberOfLines={1}>
            {location.status === 'locating' ? 'Finding you…' : location.label ? `Near ${location.label}` : 'Set your location'}
          </AppText>
          <Icon name="chevronDown" size={16} color="#F0D98A" />
        </Pressable>
        <AppText variant="display" accessibilityRole="header" style={styles.wordmark}>
          Halal<AppText variant="display" style={{ color: '#F0D98A' }}>Finder</AppText>
        </AppText>
        <AppText variant="body" style={{ color: colors.heroTextMuted, marginBottom: space.lg }}>
          Certified halal restaurants and food near you
        </AppText>
        <SearchField
          value={search}
          onChangeText={setSearch}
          label="Search places"
          placeholder="Search by name, cuisine or city"
        />
      </Hero>

      {!location.origin && location.status !== 'locating' && (
        <View style={[styles.prompt, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText variant="subheading">See what&apos;s closest to you</AppText>
          <AppText variant="small" color="textMuted">
            Share your location, or pick a city. We only use it to sort results and never store it on our servers.
          </AppText>
          <View style={styles.promptActions}>
            <Button label="Use my location" icon="myLocation" onPress={() => location.requestDeviceLocation()} style={{ flexGrow: 1 }} />
            <Button label="Choose a city" variant="secondary" onPress={() => router.push('/location')} style={{ flexGrow: 1 }} />
          </View>
          {location.status === 'denied' && (
            <AppText variant="small" color="danger" accessibilityLiveRegion="polite">
              Location permission is off. You can turn it on in Settings, or choose a city instead.
            </AppText>
          )}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
        accessibilityLabel="Place types">
        <Chip label="All" icon="all" selected={filters.category.length === 0} onPress={() => toggleCategory('all')} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c}
            label={CATEGORY_META[c].plural}
            icon={CATEGORY_META[c].icon}
            selected={filters.category.includes(c)}
            onPress={() => toggleCategory(c)}
          />
        ))}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.chips, { paddingTop: 0 }]}>
        <Chip
          label="Filters"
          icon="filters"
          badge={activeCount || undefined}
          selected={activeCount > 0}
          onPress={() => router.push('/filters')}
          accessibilityHint="Opens all filters and sorting"
        />
        <Chip label="Open now" selected={filters.openNow} onPress={() => setFilters({ openNow: !filters.openNow })} />
        <Chip label="Fully halal" selected={filters.fullyHalal} onPress={() => setFilters({ fullyHalal: !filters.fullyHalal })} />
        <Chip label="Alcohol-free" selected={filters.alcoholFree} onPress={() => setFilters({ alcoholFree: !filters.alcoholFree })} />
      </ScrollView>

      <View style={styles.resultsHeader}>
        <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
          {q ? `Results for “${q}”` : heading}
        </AppText>
        {total !== undefined && (
          <AppText variant="small" color="textMuted">
            {pluralise(total, 'place')}
          </AppText>
        )}
      </View>
    </View>
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(r) => r.id}
      renderItem={({ item }) => (
        <View style={styles.pad}>
          <RestaurantCard restaurant={item} />
        </View>
      )}
      ListHeaderComponent={header}
      ListHeaderComponentStyle={{ marginBottom: space.sm }}
      contentContainerStyle={{ paddingBottom: space.xxxl }}
      ItemSeparatorComponent={() => <View style={{ height: space.md }} />}
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      onEndReachedThreshold={0.5}
      onEndReached={() => query.hasNextPage && !query.isFetchingNextPage && query.fetchNextPage()}
      refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => {
            query.refetch();
          }} tintColor={colors.primary} />}
      ListEmptyComponent={
        <View style={styles.pad}>
          {query.isPending ? (
            <ListSkeleton label="Loading places" />
          ) : query.isError ? (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          ) : (
            <EmptyState
              icon="search"
              title="No places match"
              message={location.origin ? 'Try a wider distance, a different search, or fewer filters.' : 'Try a different search or fewer filters.'}
              actionLabel="Clear filters"
              onAction={() => {
                reset();
                setSearch('');
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
  locationButton: { flexDirection: 'row', alignItems: 'center', gap: space.xs, alignSelf: 'flex-start', minHeight: 32, marginBottom: space.xs },
  wordmark: { color: '#FFFFFF', marginBottom: space.xs },
  prompt: { margin: space.xl, marginBottom: 0, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, gap: space.sm },
  promptActions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
  chips: { gap: space.sm, paddingHorizontal: space.xl, paddingVertical: space.lg },
  resultsHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.xl, paddingBottom: space.xs },
  pad: { paddingHorizontal: space.xl },
});
