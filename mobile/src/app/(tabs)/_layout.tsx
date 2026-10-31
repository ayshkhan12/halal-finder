import { Tabs } from 'expo-router';
import { Platform, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { useFavourites } from '@/state/favourites';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

const tabIcon = (name: IconName) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <Icon name={name} size={24} color={color} />;
  };

export default function TabLayout() {
  const { colors } = useAppTheme();
  const { count } = useFavourites();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12 },
        tabBarAllowFontScaling: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          minHeight: 60 + (Platform.OS === 'web' ? 0 : insets.bottom),
          paddingTop: 6,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Explore', tabBarIcon: tabIcon('explore'), tabBarAccessibilityLabel: 'Explore' }} />
      <Tabs.Screen name="map" options={{ title: 'Map', tabBarIcon: tabIcon('map'), tabBarAccessibilityLabel: 'Map' }} />
      <Tabs.Screen name="products" options={{ title: 'Products', tabBarIcon: tabIcon('products'), tabBarAccessibilityLabel: 'Products' }} />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: tabIcon('saved'),
          tabBarBadge: count > 0 ? count : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.primary, color: colors.onPrimary, fontFamily: fonts.bold },
          tabBarAccessibilityLabel: count > 0 ? `Saved, ${count} items` : 'Saved',
        }}
      />
      <Tabs.Screen name="account" options={{ title: 'Account', tabBarIcon: tabIcon('account'), tabBarAccessibilityLabel: 'Account' }} />
    </Tabs>
  );
}
