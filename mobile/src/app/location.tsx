import { router } from 'expo-router';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { useMeta } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card, ListRow } from '@/components/Controls';
import { ErrorState, ListSkeleton } from '@/components/States';
import { pluralise } from '@/lib/format';
import { useLocation } from '@/state/location';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function LocationScreen() {
  const { colors } = useAppTheme();
  const location = useLocation();
  const meta = useMeta();

  const locateMe = async () => {
    const ok = await location.requestDeviceLocation();
    if (ok) router.back();
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <View style={{ gap: space.sm }}>
        <Button
          label={location.status === 'locating' ? 'Finding your location…' : 'Use my current location'}
          icon="myLocation"
          loading={location.status === 'locating'}
          onPress={locateMe}
          fullWidth
        />
        <AppText variant="small" color="textMuted">
          Your location is only used to sort results by distance. It is never saved on our servers.
        </AppText>
        {location.status === 'denied' && (
          <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: colors.warningSoft }]}>
            <AppText variant="smallStrong" style={{ color: colors.warning }}>
              Location access is turned off for Halal Finder.
            </AppText>
            {Platform.OS !== 'web' ? (
              <Button label="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
            ) : (
              <AppText variant="small" style={{ color: colors.warning }}>
                Allow location in your browser&apos;s site settings, or pick a city below.
              </AppText>
            )}
          </View>
        )}
        {location.status === 'unavailable' && (
          <AppText variant="small" color="danger" accessibilityRole="alert">
            We couldn&apos;t get a location fix. Try again outdoors, or pick a city below.
          </AppText>
        )}
      </View>

      <View style={{ gap: space.md }}>
        <AppText variant="heading" accessibilityRole="header">
          Or choose a city
        </AppText>
        {meta.isPending ? (
          <ListSkeleton rows={3} label="Loading cities" />
        ) : meta.isError ? (
          <ErrorState error={meta.error} onRetry={() => meta.refetch()} />
        ) : (
          <Card>
            {meta.data.areas.map((a, i) => (
              <ListRow
                key={a.city}
                icon="city"
                title={a.city}
                subtitle={pluralise(a.count, 'listed place')}
                value={location.source === 'area' && location.label === a.city ? 'Selected' : undefined}
                onPress={() => {
                  location.chooseArea(a);
                  router.back();
                }}
                last={i === meta.data.areas.length - 1}
              />
            ))}
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.xxl, paddingBottom: space.xxxl },
  notice: { padding: space.lg, borderRadius: 12, gap: space.sm },
});
