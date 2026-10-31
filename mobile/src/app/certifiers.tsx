import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { useCertifiers } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Card, ListRow } from '@/components/Controls';
import { ErrorState, ListSkeleton } from '@/components/States';
import { pluralise } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function CertifiersScreen() {
  const { colors } = useAppTheme();
  const query = useCertifiers();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.xl, gap: space.lg }}>
      <AppText variant="body" color="textMuted">
        Certification bodies inspect kitchens, suppliers and factories. Standards differ, especially on stunning before slaughter.
      </AppText>
      {query.isPending ? (
        <ListSkeleton rows={4} label="Loading certification bodies" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <Card>
          {query.data.map((c, i) => (
            <ListRow
              key={c.id}
              icon="building"
              title={`${c.shortName} · ${c.country}`}
              subtitle={`${c.name}. ${pluralise(c.restaurantCount, 'place')}, ${pluralise(c.productCount, 'product')}`}
              onPress={() => router.push({ pathname: '/certifier/[id]', params: { id: c.id } })}
              last={i === query.data.length - 1}
            />
          ))}
        </Card>
      )}
      <View />
    </ScrollView>
  );
}
