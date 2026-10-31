import { router, useLocalSearchParams } from 'expo-router';
import { Linking, Platform, ScrollView, Share, StyleSheet, View } from 'react-native';

import { useRestaurant } from '@/api/queries';
import type { Restaurant } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button, IconButton } from '@/components/Button';
import { Card, ListRow } from '@/components/Controls';
import { AttributeRow, CertificationPanel, DetailHero, DetailSection } from '@/components/Detail';
import { Icon } from '@/components/Icon';
import { ErrorState, ListSkeleton } from '@/components/States';
import {
  CATEGORY_META,
  DAY_NAMES,
  FEATURE_META,
  formatDistance,
  openLabel,
  priceLabel,
  spokenDistance,
  spokenOpen,
  spokenPrice,
  WEEK,
} from '@/lib/format';
import { useFavourites } from '@/state/favourites';
import { useLocation } from '@/state/location';
import { usePreferences } from '@/state/preferences';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

function directionsUrl(r: Restaurant) {
  const { lat, lng } = r.location;
  const label = encodeURIComponent(r.name);
  if (Platform.OS === 'ios') return `https://maps.apple.com/?daddr=${lat},${lng}&q=${label}`;
  if (Platform.OS === 'android') return `geo:0,0?q=${lat},${lng}(${label})`;
  return `https://www.openstreetmap.org/directions?to=${lat}%2C${lng}`;
}

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { origin } = useLocation();
  const { distanceUnit } = usePreferences();
  const favourites = useFavourites();
  const query = useRestaurant(id, origin);
  const r = query.data;

  if (!r) {
    return (
      <View style={[styles.fill, { backgroundColor: colors.background }]}>
        <View style={{ padding: space.xl, paddingTop: 80, gap: space.lg }}>
          <IconButton icon="back" label="Back" variant="surface" onPress={() => router.back()} />
          {query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <ListSkeleton rows={2} label="Loading place" />}
        </View>
      </View>
    );
  }

  const saved = favourites.isSaved('restaurant', r.id);
  const todayKey = WEEK[(new Date().getDay() + 6) % 7];
  const distance = formatDistance(r.distanceKm, distanceUnit);
  const share = () =>
    Share.share({ message: `${r.name} — ${r.cuisine}, ${r.address.line1}, ${r.address.city}. Found on Halal Finder.` }).catch(() => {});

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: space.xxxl }}>
      <DetailHero
        imageUrl={r.imageUrl}
        name={r.name}
        saved={saved}
        onToggleSave={() => favourites.toggle('restaurant', r.id, r.name)}
        onShare={share}
      />

      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={{ gap: space.xs }}>
          <AppText variant="label" color="goldText">
            {CATEGORY_META[r.category].label} · {r.address.city}
          </AppText>
          <AppText variant="title" accessibilityRole="header">
            {r.name}
          </AppText>
          <AppText
            variant="body"
            color="textMuted"
            accessibilityLabel={[r.cuisine, spokenPrice(r.priceLevel), spokenDistance(r.distanceKm, distanceUnit)].filter(Boolean).join(', ')}>
            {[r.cuisine, priceLabel(r.priceLevel), distance && `${distance} away`].filter(Boolean).join(' · ')}
          </AppText>
          <View style={styles.ratingRow} accessible accessibilityLabel={`Rated ${r.rating} out of 5 from ${r.reviewCount} reviews. ${spokenOpen(r.openStatus)}`}>
            <Icon name="star" size={16} color={colors.goldText} />
            <AppText variant="smallStrong">{r.rating.toFixed(1)}</AppText>
            <AppText variant="small" color="textMuted">
              ({r.reviewCount} reviews)
            </AppText>
            <AppText variant="smallStrong" style={{ color: r.openStatus.isOpen ? colors.success : colors.textMuted }}>
              · {openLabel(r.openStatus)}
            </AppText>
          </View>
        </View>

        <View style={styles.actions}>
          {r.phone && (
            <Button label="Call" icon="call" variant="soft" onPress={() => Linking.openURL(`tel:${r.phone!.replace(/\s/g, '')}`)} style={styles.action} />
          )}
          <Button label="Directions" icon="directions" variant="primary" onPress={() => Linking.openURL(directionsUrl(r))} style={styles.action} />
        </View>

        <CertificationPanel certification={r.certification} />

        <DetailSection title="Halal details">
          <Card padded>
            <AttributeRow
              icon="verified"
              positive={r.halal.status === 'fully_halal'}
              title={r.halal.status === 'fully_halal' ? 'Fully halal menu' : 'Halal options only'}
              detail={r.halal.status === 'fully_halal' ? 'Everything on the menu is halal.' : 'Not every dish is halal. Ask staff which ones are.'}
            />
            <AttributeRow
              icon={r.halal.alcoholFree ? 'noAlcohol' : 'alcohol'}
              positive={r.halal.alcoholFree}
              title={r.halal.alcoholFree ? 'Alcohol-free' : 'Alcohol served'}
              detail={r.halal.alcoholFree ? 'No alcohol is sold or served.' : 'Alcohol is sold on the premises.'}
            />
            <AttributeRow
              icon="hand"
              positive={r.halal.handSlaughtered}
              title={r.halal.handSlaughtered ? 'Hand-slaughtered meat' : 'Slaughter method not specified'}
              detail={r.halal.handSlaughtered ? 'Meat is hand slaughtered without stunning.' : 'Check the certifier’s standard if this matters to you.'}
            />
          </Card>
        </DetailSection>

        <AppText variant="body" color="text">
          {r.description}
        </AppText>

        {r.features.length > 0 && (
          <DetailSection title="Facilities">
            <View style={styles.features}>
              {r.features.map((f) => (
                <View key={f} style={[styles.feature, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Icon name={FEATURE_META[f].icon} size={18} color={colors.primary} />
                  <AppText variant="small">{FEATURE_META[f].label}</AppText>
                </View>
              ))}
            </View>
          </DetailSection>
        )}

        <DetailSection title="Opening hours">
          <Card padded>
            {WEEK.map((day) => {
              const ranges = r.hours[day] ?? [];
              const text = ranges.length ? ranges.map(([o, c]) => `${o}–${c}`).join(', ') : 'Closed';
              const spoken = ranges.length ? ranges.map(([o, c]) => `${o} to ${c}`).join(' and ') : 'Closed';
              const today = day === todayKey;
              return (
                <View key={day} style={styles.hoursRow} accessible accessibilityLabel={`${DAY_NAMES[day]}${today ? ', today' : ''}: ${spoken}`}>
                  <AppText variant={today ? 'bodyStrong' : 'body'} style={{ flex: 1 }}>
                    {DAY_NAMES[day]}
                    {today ? ' (today)' : ''}
                  </AppText>
                  <AppText variant={today ? 'bodyStrong' : 'body'} color={ranges.length ? 'text' : 'textMuted'}>
                    {text}
                  </AppText>
                </View>
              );
            })}
          </Card>
        </DetailSection>

        <DetailSection title="Address">
          <Card>
            <ListRow
              icon="location"
              title={r.address.line1}
              subtitle={[r.address.city, r.address.postcode].filter(Boolean).join(' ')}
              onPress={() => Linking.openURL(directionsUrl(r))}
              accessibilityHint="Opens directions in your maps app"
              external
            />
            {r.phone && <ListRow icon="call" title={r.phone} subtitle="Phone" onPress={() => Linking.openURL(`tel:${r.phone!.replace(/\s/g, '')}`)} last />}
          </Card>
        </DetailSection>

        <Button
          label="Report a problem with this listing"
          icon="report"
          variant="ghost"
          onPress={() => router.push({ pathname: '/report', params: { type: 'restaurant', id: r.id, name: r.name } })}
        />
        <AppText variant="caption" color="textMuted" align="center">
          Demo listing. Always check the certificate on display at the premises.
        </AppText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  sheet: { marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: space.xl, gap: space.xl },
  ratingRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: space.xs },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  action: { flexGrow: 1, flexBasis: 140 },
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  feature: { flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: space.md, paddingVertical: space.sm, borderRadius: radius.pill, borderWidth: 1 },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 32 },
});
