import { router, Stack } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/States';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function NotFound() {
  const { colors } = useAppTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center' }}>
      <Stack.Screen options={{ title: 'Not found' }} />
      <EmptyState icon="search" title="This page doesn't exist" actionLabel="Go to Explore" onAction={() => router.replace('/')} />
    </View>
  );
}
