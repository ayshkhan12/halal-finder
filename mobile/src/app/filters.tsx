import { router, Stack } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCertifiers, useRestaurantCount } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Card, Segmented, SwitchRow } from '@/components/Controls';
import { pluralise } from '@/lib/format';
import { RADIUS_STEPS, useFilters } from '@/state/filters';
import { useLocation } from '@/state/location';
import { usePreferences } from '@/state/preferences';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function FiltersScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { filters, setFilters, reset, apiFilters } = useFilters();
  const { origin } = useLocation();
  const { distanceUnit } = usePreferences();
  const certifiers = useCertifiers();
  const count = useRestaurantCount(apiFilters, origin);
  const ukCertifiers = (certifiers.data ?? []).filter((c) => c.restaurantCount > 0);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerRight: () => <Button label="Reset" variant="ghost" onPress={reset} /> }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Sort by">
          <Segmented
            label="Sort by"
            value={filters.sort ?? (origin ? 'distance' : 'rating')}
            onChange={(sort) => setFilters({ sort })}
            options={[
              ...(origin ? [{ value: 'distance' as const, label: 'Nearest' }] : []),
              { value: 'rating' as const, label: 'Top rated' },
              { value: 'name' as const, label: 'A–Z' },
            ]}
          />
        </Section>

        {origin && (
          <Section title="Distance">
            <Segmented
              label={`Maximum distance in ${distanceUnit === 'mi' ? 'miles' : 'kilometres'}`}
              value={filters.radiusStep}
              onChange={(radiusStep) => setFilters({ radiusStep })}
              options={RADIUS_STEPS[distanceUnit].map((v, i) => ({ value: i, label: `${v} ${distanceUnit}` }))}
            />
          </Section>
        )}

        <Section title="Halal standards">
          <Card>
            <SwitchRow
              icon="shield"
              title="Current certificates only"
              description="Hide places whose certificate has expired"
              value={filters.currentCertOnly}
              onChange={(currentCertOnly) => setFilters({ currentCertOnly })}
            />
            <SwitchRow
              icon="verified"
              title="Fully halal menu"
              description="Hide places that only have some halal dishes"
              value={filters.fullyHalal}
              onChange={(fullyHalal) => setFilters({ fullyHalal })}
            />
            <SwitchRow
              icon="noAlcohol"
              title="Alcohol-free"
              description="Only places that don't serve alcohol"
              value={filters.alcoholFree}
              onChange={(alcoholFree) => setFilters({ alcoholFree })}
            />
            <SwitchRow
              icon="hand"
              title="Hand-slaughtered meat"
              description="Meat slaughtered by hand without stunning"
              value={filters.handSlaughtered}
              onChange={(handSlaughtered) => setFilters({ handSlaughtered })}
              last
            />
          </Card>
        </Section>

        <Section title="Availability">
          <Card>
            <SwitchRow icon="clock" title="Open now" value={filters.openNow} onChange={(openNow) => setFilters({ openNow })} last />
          </Card>
        </Section>

        <Section title="Certified by">
          <View style={styles.chips}>
            <Chip label="Any" selected={!filters.certifier} onPress={() => setFilters({ certifier: undefined })} />
            {ukCertifiers.map((c) => (
              <Chip
                key={c.id}
                label={c.shortName}
                accessibilityHint={c.name}
                selected={filters.certifier === c.id}
                onPress={() => setFilters({ certifier: filters.certifier === c.id ? undefined : c.id })}
              />
            ))}
          </View>
        </Section>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md, backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <Button
          label={count.data === undefined ? 'Show results' : count.data === 0 ? 'No places match' : `Show ${pluralise(count.data, 'place')}`}
          onPress={() => router.back()}
          loading={count.isFetching && count.data === undefined}
          fullWidth
          accessibilityHint="Closes filters"
        />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.xxl, paddingBottom: space.xxxl },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  footer: { paddingHorizontal: space.xl, paddingTop: space.md, borderTopWidth: StyleSheet.hairlineWidth },
});
