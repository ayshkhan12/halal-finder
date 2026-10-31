import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRestaurantsForMap } from '@/api/queries';
import type { Restaurant } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button, IconButton } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { VenueMap } from '@/components/map/VenueMap';
import { UK_CENTRE } from '@/components/map/VenueMap.types';
import { RestaurantCard } from '@/components/RestaurantCard';
import { announce } from '@/lib/a11y';
import { pluralise } from '@/lib/format';
import { useFilters } from '@/state/filters';
import { useLocation } from '@/state/location';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

export default function MapScreen() {
  const { colors, scheme } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const location = useLocation();
  const { apiFilters, activeCount } = useFilters();
  const query = useRestaurantsForMap(apiFilters, location.origin);
  const venues = query.data?.data ?? [];

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [center, setCenter] = useState(location.origin ?? UK_CENTRE);
  const [focusKey, setFocusKey] = useState(0);
  const listRef = useRef<FlatList<Restaurant>>(null);
  const cardWidth = Math.min(width - space.xl * 2, 420);
  const zoomKm = location.origin ? (apiFilters.radiusKm ?? 10) : 300;

  // Follow the chosen location.
  useEffect(() => {
    setCenter(location.origin ?? UK_CENTRE);
    setFocusKey((k) => k + 1);
  }, [location.origin]);

  useEffect(() => {
    if (query.data) announce(`${pluralise(query.data.meta.total, 'place')} on the map`);
  }, [query.data]);

  const select = (id: string, fromList = false) => {
    setSelectedId(id);
    const index = venues.findIndex((v) => v.id === id);
    if (index < 0) return;
    if (!fromList) listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    else {
      setCenter(venues[index].location);
      setFocusKey((k) => k + 1);
    }
  };

  const recenter = async () => {
    if (location.source !== 'device') {
      const ok = await location.requestDeviceLocation();
      if (!ok) router.push('/location');
      return;
    }
    setCenter(location.origin ?? UK_CENTRE);
    setFocusKey((k) => k + 1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <VenueMap
        restaurants={venues}
        center={center}
        focusKey={focusKey}
        zoomKm={zoomKm}
        selectedId={selectedId}
        onSelect={(id) => select(id)}
        showUser={location.source === 'device'}
        scheme={scheme}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]} pointerEvents="box-none">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={location.label ? `Location: ${location.label}. Change location` : 'Choose your location'}
          onPress={() => router.push('/location')}
          style={({ pressed }) => [styles.locationPill, { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.8 : 1 }]}>
          <Icon name="location" size={18} color={colors.primary} />
          <AppText variant="smallStrong" numberOfLines={1} style={{ flexShrink: 1 }}>
            {location.label ?? 'All of the UK'}
          </AppText>
          <Icon name="chevronDown" size={16} color={colors.textMuted} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <IconButton
            icon="filters"
            label={activeCount ? `Filters, ${activeCount} on` : 'Filters'}
            variant="surface"
            color={colors.primary}
            onPress={() => router.push('/filters')}
          />
          <IconButton icon="myLocation" label="Centre on my location" variant="surface" color={colors.primary} onPress={recenter} />
        </View>
      </View>

      <View style={[styles.bottom, { paddingBottom: space.md }]} pointerEvents="box-none">
        <View style={[styles.legend, { backgroundColor: colors.surface, borderColor: colors.border }]} accessible accessibilityLabel="Legend: tick means certified, exclamation means certificate expiring soon">
          <LegendDot color={colors.success} label="Certified" />
          <LegendDot color={colors.warning} label="Expiring soon" />
          {query.isFetching && <ActivityIndicator size="small" color={colors.primary} />}
        </View>

        {query.isError ? (
          <View style={[styles.message, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="smallStrong">Couldn&apos;t load places.</AppText>
            <Button label="Try again" variant="secondary" onPress={() => query.refetch()} />
          </View>
        ) : query.data && venues.length === 0 ? (
          <View style={[styles.message, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText variant="smallStrong">No places in this area match your filters.</AppText>
            <Button label="Change filters" variant="secondary" onPress={() => router.push('/filters')} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={venues}
            horizontal
            keyExtractor={(r) => r.id}
            showsHorizontalScrollIndicator={false}
            snapToInterval={cardWidth + space.md}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.md }}
            getItemLayout={(_, index) => ({ length: cardWidth + space.md, offset: (cardWidth + space.md) * index, index })}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (cardWidth + space.md));
              const v = venues[index];
              if (v && v.id !== selectedId) select(v.id, true);
            }}
            accessibilityLabel="Places on the map"
            renderItem={({ item }) => (
              <View style={[{ width: cardWidth }, item.id === selectedId && { borderRadius: radius.lg, borderWidth: 2, borderColor: colors.primary }]}>
                <RestaurantCard restaurant={item} compact />
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg },
  locationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, gap: space.sm },
  legend: {
    alignSelf: 'flex-start',
    marginLeft: space.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.xs + 2,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  message: { marginHorizontal: space.xl, padding: space.lg, borderRadius: radius.lg, borderWidth: 1, gap: space.md },
});
