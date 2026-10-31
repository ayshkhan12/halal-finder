import Constants from 'expo-constants';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card, ListRow, Segmented } from '@/components/Controls';
import { Hero } from '@/components/Hero';
import { useAuth } from '@/state/auth';
import { usePreferences } from '@/state/preferences';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function AccountScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const prefs = usePreferences();

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: insets.bottom + space.xxxl }}>
      <Hero>
        <AppText variant="title" accessibilityRole="header" style={{ color: '#FFFFFF' }}>
          {user ? `Salaam, ${user.name.split(' ')[0]}` : 'Your account'}
        </AppText>
        <AppText variant="body" style={{ color: colors.heroTextMuted, marginBottom: space.lg }}>
          {user ? user.email : 'Browse freely. Sign in only if you want your saved places on every device.'}
        </AppText>
        {user ? (
          <Button label="Sign out" variant="onHero" icon="logout" onPress={signOut} />
        ) : (
          <View style={styles.authRow}>
            <Button label="Sign in" variant="onHero" onPress={() => router.push('/sign-in')} style={{ flexGrow: 1 }} />
            <Button label="Create account" variant="secondary" onPress={() => router.push('/sign-up')} style={{ flexGrow: 1 }} />
          </View>
        )}
      </Hero>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Preferences
        </AppText>
        <Card padded>
          <AppText variant="bodyStrong" nativeID="units-label">
            Distance units
          </AppText>
          <Segmented
            label="Distance units"
            value={prefs.distanceUnit}
            onChange={prefs.setDistanceUnit}
            options={[
              { value: 'mi', label: 'Miles' },
              { value: 'km', label: 'Kilometres' },
            ]}
          />
          <AppText variant="bodyStrong" style={{ marginTop: space.sm }}>
            Appearance
          </AppText>
          <Segmented
            label="Appearance"
            value={prefs.appearance}
            onChange={prefs.setAppearance}
            options={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <AppText variant="heading" accessibilityRole="header">
          Learn
        </AppText>
        <Card>
          <ListRow icon="building" title="Certification bodies" subtitle="Who certifies what, and their standards" onPress={() => router.push('/certifiers')} />
          <ListRow icon="shield" title="How verification works" subtitle="What the badges mean" onPress={() => router.push('/about')} />
          <ListRow icon="scan" title="Scan a product" subtitle="Check a barcode in seconds" onPress={() => router.push('/scan')} last />
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <ListRow icon="info" title="About Halal Finder" subtitle="Demo data, accessibility and credits" onPress={() => router.push('/about')} />
          <ListRow icon="info" title="Version" value={Constants.expoConfig?.version ?? '1.0.0'} last />
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  authRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  section: { paddingHorizontal: space.xl, paddingTop: space.xl, gap: space.md },
});
