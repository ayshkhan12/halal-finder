import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { IconButton } from './Button';
import { CertBadge } from './CertBadge';
import type { Product } from '@/api/types';
import { certSummary, DIETARY_META } from '@/lib/format';
import { useFavourites } from '@/state/favourites';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

export function ProductCard({ product: p, layout = 'grid' }: { product: Product; layout?: 'grid' | 'row' }) {
  const { colors } = useAppTheme();
  const favourites = useFavourites();
  const saved = favourites.isSaved('product', p.id);
  const spoken = [
    p.name,
    `by ${p.brand}`,
    p.size,
    certSummary(p.certification),
    p.dietary.map((d) => DIETARY_META[d].label).join(', '),
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <View style={[styles.card, layout === 'grid' && styles.grid, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={spoken}
        accessibilityHint="Opens product details"
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
        style={({ pressed }) => [layout === 'row' ? styles.row : styles.column, { opacity: pressed ? 0.85 : 1 }]}>
        <Image
          source={p.imageUrl ?? undefined}
          style={[layout === 'row' ? styles.imageRow : styles.imageGrid, { backgroundColor: colors.primarySoft }]}
          contentFit="cover"
          transition={150}
          accessible={false}
        />
        <View style={styles.body}>
          <AppText variant="smallStrong" numberOfLines={2} style={layout === 'row' && { paddingRight: 40 }}>
            {p.name}
          </AppText>
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {[p.brand, p.size].filter(Boolean).join(' · ')}
          </AppText>
          <CertBadge certification={p.certification} />
        </View>
      </Pressable>
      <IconButton
        icon={saved ? 'savedFill' : 'saved'}
        label={saved ? `Remove ${p.name} from saved` : `Save ${p.name}`}
        selected={saved}
        variant={layout === 'grid' ? 'surface' : 'plain'}
        color={saved ? colors.danger : colors.textMuted}
        onPress={() => favourites.toggle('product', p.id, p.name)}
        style={styles.heart}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  grid: { flex: 1 },
  column: { padding: space.sm, gap: space.sm },
  row: { flexDirection: 'row', padding: space.md, gap: space.md },
  imageGrid: { width: '100%', aspectRatio: 1.2, borderRadius: radius.md },
  imageRow: { width: 72, height: 72, borderRadius: radius.md },
  body: { flex: 1, gap: space.xs, paddingHorizontal: space.xxs, paddingBottom: space.xs },
  heart: { position: 'absolute', top: space.sm, right: space.sm },
});
