import '@/global.css';

import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { PlayfairDisplay_700Bold, PlayfairDisplay_800ExtraBold } from '@expo-google-fonts/playfair-display';
import { focusManager, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';

import { ApiError } from '@/api/client';
import { AuthProvider, useAuth } from '@/state/auth';
import { FavouritesProvider } from '@/state/favourites';
import { FiltersProvider } from '@/state/filters';
import { LocationProvider } from '@/state/location';
import { PreferencesProvider, usePreferences } from '@/state/preferences';
import { AppThemeProvider, useAppTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

// Refetch when the app returns to the foreground.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => focusManager.setFocused(state === 'active'));
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        // Don't hammer a server that has answered; do retry flaky networks.
        retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
      },
    },
  });
}

function Navigation() {
  const { colors, scheme } = useAppTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.surface, text: colors.text, border: colors.border },
  };
  const headerOptions = {
    headerStyle: { backgroundColor: colors.surface },
    headerTintColor: colors.primary,
    headerTitleStyle: { fontFamily: fonts.bold, color: colors.text },
    headerBackTitle: 'Back',
    contentStyle: { backgroundColor: colors.background },
  };

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={headerOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="restaurant/[id]" options={{ headerShown: false, title: 'Place' }} />
        <Stack.Screen name="product/[id]" options={{ headerShown: false, title: 'Product' }} />
        <Stack.Screen name="certifier/[id]" options={{ title: 'Certification body' }} />
        <Stack.Screen name="certifiers" options={{ title: 'Certification bodies' }} />
        <Stack.Screen name="about" options={{ title: 'About Halal Finder' }} />
        <Stack.Screen name="filters" options={{ presentation: 'modal', title: 'Filters' }} />
        <Stack.Screen name="location" options={{ presentation: 'modal', title: 'Choose location' }} />
        <Stack.Screen name="sign-in" options={{ presentation: 'modal', title: 'Sign in' }} />
        <Stack.Screen name="sign-up" options={{ presentation: 'modal', title: 'Create account' }} />
        <Stack.Screen name="report" options={{ presentation: 'modal', title: 'Report a problem' }} />
        <Stack.Screen name="scan" options={{ presentation: 'fullScreenModal', headerShown: false, title: 'Scan a barcode' }} />
      </Stack>
    </ThemeProvider>
  );
}

/** Keeps the splash screen up until fonts, preferences and the saved session are loaded. */
function Gate({ children }: { children: ReactNode }) {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_800ExtraBold,
  });
  const prefs = usePreferences();
  const auth = useAuth();
  const ready = (fontsLoaded || !!fontError) && prefs.ready && auth.ready;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  return ready ? children : null;
}

export default function RootLayout() {
  const [queryClient] = useState(makeQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <PreferencesProvider>
        <AuthProvider>
          <LocationProvider>
            <FavouritesProvider>
              <FiltersProvider>
                <AppThemeProvider>
                  <Gate>
                    <Navigation />
                  </Gate>
                </AppThemeProvider>
              </FiltersProvider>
            </FavouritesProvider>
          </LocationProvider>
        </AuthProvider>
      </PreferencesProvider>
    </QueryClientProvider>
  );
}
