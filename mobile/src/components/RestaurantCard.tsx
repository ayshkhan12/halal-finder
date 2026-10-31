import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { IconButton } from './Button';
import { CertBadge } from './CertBadge';
import { Icon } from './Icon';
import type { Restaurant } from '@/api/types';
import {
  CATEGORY_META,
  certSummary,
  formatDistance,
  openLabel,
  priceLabel,
  spokenDistance,
  spokenOpen,
  spokenPrice,
} from '@/lib/format';
import { useFavourites } from '@/state/favourites';
import { usePreferences } from '@/state/preferences';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

export function restaurantSpokenSummary(r: Restaurant, unit: 'mi' | 'km') {
  const kind = CATEGORY_META[r.category].label.toLowerCase();
  return [
    r.name,
    r.cuisine.toLowerCase().includes(kind) ? r.cuisine : `${r.cuisine} ${kind}`,
    spokenDistance(r.distanceKm, unit),
    `Rated ${r.rating} from ${r.reviewCount} reviews`,
    spokenOpen(r.openStatus),
    certSummary(r.certification),
    r.halal.status === 'halal_options' ? 'Halal options only' : 'Fully halal',
    spokenPrice(r.priceLevel),
  ]
    .filter(Boolean)
    .join('. ');
}

export function RestaurantCard({ restaurant: r, compact = false }: { restaurant: Restaurant; compact?: boolean }) {
  const { colors } = useAppTheme();
  const { distanceUnit } = usePreferences();
  const favourites = useFavourites();
  const saved = favourites.isSaved('restaurant', r.id);
  const distance = formatDistance(r.distanceKm, distanceUnit);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={restaurantSpokenSummary(r, distanceUnit)}
        accessibilityHint="Opens details"
        onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: r.id } })}
        style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.85 : 1 }]}>
        <Image
          source={r.imageUrl ?? undefined}
          style={[styles.image, compact && styles.imageCompact, { backgroundColor: colors.primarySoft }]}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
        <View style={styles.body}>
          <AppText variant="subheading" numberOfLines={2} style={styles.name}>
            {r.name}
          </AppText>
          <AppText variant="small" color="textMuted" numberOfLines={2}>
            {[r.cuisine, priceLabel(r.priceLevel), distance].filter(Boolean).join(' · ')}
          </AppText>
          <View style={styles.metaRow}>
            <Icon name="star" size={14} color={colors.goldText} />
            <AppText variant="caption" color="text">
              {r.rating.toFixed(1)}
            </AppText>
            <AppText variant="caption" color="textMuted">
              ({r.reviewCount})
            </AppText>
            <AppText variant="caption" color="textMuted">
              ·
            </AppText>
            <AppText variant="caption" style={{ color: r.openStatus.isOpen ? colors.success : colors.textMuted, flexShrink: 1 }} numberOfLines={1}>
              {openLabel(r.openStatus)}
            </AppText>
          </View>
          {!compact && <CertBadge certification={r.certification} />}
        </View>
      </Pressable>
      <IconButton
        icon={saved ? 'savedFill' : 'saved'}
        label={saved ? `Remove ${r.name} from saved` : `Save ${r.name}`}
        selected={saved}
        color={saved ? colors.danger : colors.textMuted}
        onPress={() => favourites.toggle('restaurant', r.id, r.name)}
        style={styles.heart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  pressable: { flexDirection: 'row', gap: space.md, padding: space.md },
  image: { width: 92, height: 92, borderRadius: radius.md },
  imageCompact: { width: 64, height: 64 },
  body: { flex: 1, gap: space.xs, justifyContent: 'center' },
  name: { paddingRight: 40 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' },
  heart: { position: 'absolute', top: space.xs, right: space.xs },
});
