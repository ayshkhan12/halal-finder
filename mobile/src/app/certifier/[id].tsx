import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ScrollView, View } from 'react-native';

import { useCertifier } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card, ListRow } from '@/components/Controls';
import { AttributeRow } from '@/components/Detail';
import { ErrorState, ListSkeleton } from '@/components/States';
import { pluralise } from '@/lib/format';
import { useFilters } from '@/state/filters';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

const POLICY = {
  hand_only: { title: 'Hand slaughter only', detail: 'Animals must be slaughtered by hand without stunning.', positive: true },
  stunning_permitted: { title: 'Some stunning permitted', detail: 'Its standard allows certain forms of pre-slaughter stunning.', positive: false },
  varies: { title: 'Standard varies by product', detail: 'Check the specific certificate for slaughter details.', positive: false },
};

export default function CertifierScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { setFilters } = useFilters();
  const query = useCertifier(id);
  const c = query.data;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.xl, gap: space.xl }}>
      <Stack.Screen options={{ title: c?.shortName ?? 'Certification body' }} />
      {!c ? (
        query.isError ? <ErrorState error={query.error} onRetry={() => query.refetch()} /> : <ListSkeleton rows={2} label="Loading" />
      ) : (
        <>
          <View style={{ gap: space.xs }}>
            <AppText variant="label" color="goldText">
              {c.country}
            </AppText>
            <AppText variant="title" accessibilityRole="header">
              {c.name}
            </AppText>
          </View>
          <AppText variant="body">{c.description}</AppText>
          <Card padded>
            <AttributeRow icon="hand" title={POLICY[c.slaughterPolicy].title} detail={POLICY[c.slaughterPolicy].detail} positive={POLICY[c.slaughterPolicy].positive} />
          </Card>
          <Card>
            <ListRow icon="store" title="Places in Halal Finder" value={pluralise(c.restaurantCount, 'place')} />
            <ListRow icon="products" title="Products in Halal Finder" value={pluralise(c.productCount, 'product')} last={!c.website} />
            {c.website && <ListRow icon="website" title="Official website" subtitle={c.website.replace(/^https?:\/\//, '')} onPress={() => WebBrowser.openBrowserAsync(c.website!)} external last />}
          </Card>
          {c.restaurantCount > 0 && (
            <Button
              label={`Show places certified by ${c.shortName}`}
              onPress={() => {
                setFilters({ certifier: c.id });
                router.dismissTo('/');
              }}
            />
          )}
        </>
      )}
    </ScrollView>
  );
}
