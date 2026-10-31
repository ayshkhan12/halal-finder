import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, Share, StyleSheet, View } from 'react-native';

import { useProduct } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button, IconButton } from '@/components/Button';
import { AttributeRow, CertificationPanel, DetailHero, DetailSection } from '@/components/Detail';
import { RestaurantCard } from '@/components/RestaurantCard';
import { EmptyState, ErrorState, ListSkeleton } from '@/components/States';
import { DIETARY_META } from '@/lib/format';
import { useFavourites } from '@/state/favourites';
import { useLocation } from '@/state/location';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';
import { Card } from '@/components/Controls';

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { origin } = useLocation();
  const favourites = useFavourites();
  const query = useProduct(id, origin);
  const p = query.data;

  if (!p) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: space.xl, paddingTop: 80, gap: space.lg }}>
        <IconButton icon="back" label="Back" variant="surface" onPress={() => router.back()} />
        {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <ListSkeleton rows={2} label="Loading product" />}
      </View>
    );
  }

  const saved = favourites.isSaved('product', p.id);

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: space.xxxl }}>
      <DetailHero
        imageUrl={p.imageUrl}
        name={p.name}
        saved={saved}
        onToggleSave={() => favourites.toggle('product', p.id, p.name)}
        onShare={() => Share.share({ message: `${p.brand} ${p.name} — ${p.certification.certifier?.shortName ?? ''} certified halal. Found on Halal Finder.` }).catch(() => {})}
      />
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={{ gap: space.xs }}>
          <AppText variant="label" color="goldText">
            {p.category}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {p.name}
          </AppText>
          <AppText variant="body" color="textMuted">
            {[p.brand, p.size].filter(Boolean).join(' · ')}
          </AppText>
        </View>

        <CertificationPanel certification={p.certification} />

        <AppText variant="body">{p.description}</AppText>

        {p.dietary.length > 0 && (
          <DetailSection title="Suitable for">
            <Card padded>
              {p.dietary.map((d) => (
                <AttributeRow key={d} icon={DIETARY_META[d].icon} title={DIETARY_META[d].label} positive />
              ))}
            </Card>
          </DetailSection>
        )}

        {p.barcode && (
          <View style={[styles.barcode, { backgroundColor: colors.surface, borderColor: colors.border }]} accessible accessibilityLabel={`Barcode ${p.barcode.split('').join(' ')}`}>
            <AppText variant="caption" color="textMuted">
              Barcode
            </AppText>
            <AppText variant="heading" style={{ letterSpacing: 2 }}>
              {p.barcode}
            </AppText>
          </View>
        )}

        <DetailSection title={origin ? 'Where to buy nearby' : 'Where to buy'}>
          {p.stockists.length ? (
            <View style={{ gap: space.md }}>
              {p.stockists.slice(0, 5).map((s) => (
                <RestaurantCard key={s.id} restaurant={s} compact />
              ))}
            </View>
          ) : (
            <EmptyState icon="store" title="No stockists listed yet" message="Halal butchers and Asian grocers often carry this brand." />
          )}
        </DetailSection>

        <Button
          label="Report a problem with this product"
          icon="report"
          variant="ghost"
          onPress={() => router.push({ pathname: '/report', params: { type: 'product', id: p.id, name: p.name } })}
        />
        <AppText variant="caption" color="textMuted" align="center">
          Demo listing. Always check the certification logo on the pack.
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: { marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, gap: space.xl },
  barcode: { padding: space.lg, borderRadius: radius.lg, borderWidth: 1, gap: space.xs },
});
