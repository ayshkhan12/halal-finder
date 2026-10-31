import { createContext, useContext, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { darkColors, lightColors, type ColorTokens } from './tokens';
import { usePreferences } from '@/state/preferences';

type Theme = { colors: ColorTokens; scheme: 'light' | 'dark' };

const ThemeContext = createContext<Theme>({ colors: lightColors, scheme: 'light' });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const { appearance } = usePreferences();
  const scheme = appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;
  const value = { colors: scheme === 'dark' ? darkColors : lightColors, scheme } as const;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useAppTheme = () => useContext(ThemeContext);
