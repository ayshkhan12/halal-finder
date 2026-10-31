import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProductsByIds, useRestaurantsByIds } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Segmented } from '@/components/Controls';
import { ProductCard } from '@/components/ProductCard';
import { RestaurantCard } from '@/components/RestaurantCard';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/States';
import { useAuth } from '@/state/auth';
import { useFavourites } from '@/state/favourites';
import { useLocation } from '@/state/location';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

export default function SavedScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { origin } = useLocation();
  const favourites = useFavourites();
  const [tab, setTab] = useState<'places' | 'products'>('places');

  const placeIds = favourites.ids('restaurant');
  const productIds = favourites.ids('product');
  const places = useRestaurantsByIds(placeIds, origin);
  const products = useProductsByIds(productIds);
  const active = tab === 'places' ? places : products;
  const ids = tab === 'places' ? placeIds : productIds;
  // Hide items the user just un-saved without waiting for a refetch.
  const visiblePlaces = (places.data ?? []).filter((r) => placeIds.includes(r.id));
  const visibleProducts = (products.data ?? []).filter((p) => productIds.includes(p.id));

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + space.lg }]}>
      <AppText variant="title" accessibilityRole="header">
        Saved
      </AppText>
      <Segmented
        label="Show saved"
        value={tab}
        onChange={setTab}
        options={[
          { value: 'places', label: `Places (${placeIds.length})` },
          { value: 'products', label: `Products (${productIds.length})` },
        ]}
      />

      {!user && favourites.count > 0 && (
        <View style={[styles.banner, { backgroundColor: colors.primarySoft }]}>
          <AppText variant="small" style={{ color: colors.onPrimarySoft, flex: 1 }}>
            Saved on this device. Sign in to keep them on all your devices.
          </AppText>
          <Button label="Sign in" variant="ghost" onPress={() => router.push('/sign-in')} />
        </View>
      )}

      {ids.length === 0 ? (
        <EmptyState
          icon="saved"
          title={tab === 'places' ? 'No saved places yet' : 'No saved products yet'}
          message="Tap the heart on any listing to keep it here for later."
          actionLabel={tab === 'places' ? 'Explore places' : 'Browse products'}
          onAction={() => router.navigate(tab === 'places' ? '/' : '/products')}
        />
      ) : active.isPending ? (
        <ListSkeleton rows={Math.min(ids.length, 4)} label="Loading saved items" />
      ) : active.isError ? (
        <ErrorState error={active.error} onRetry={() => active.refetch()} />
      ) : (
        <View style={{ gap: space.md }}>
          {tab === 'places'
            ? visiblePlaces.map((r) => <RestaurantCard key={r.id} restaurant={r} />)
            : visibleProducts.map((p) => <ProductCard key={p.id} product={p} layout="row" />)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space.xl, paddingBottom: space.xxxl, gap: space.lg },
  banner: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingLeft: space.lg, paddingRight: space.xs, paddingVertical: space.xs, borderRadius: radius.md },
});
