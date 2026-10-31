import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Line, Pattern, Polygon, Rect, Stop } from 'react-native-svg';

import { useAppTheme } from '@/theme/ThemeProvider';
import { palette, space } from '@/theme/tokens';

/** Decorative eight-fold geometric pattern drawn over the emerald header. */
export function GeometricPattern({ opacity = 0.09 }: { opacity?: number }) {
  return (
    <View
      pointerEvents="none"
      style={StyleSheet.absoluteFill}
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <Pattern id="hf-geo" x="0" y="0" width="44" height="44" patternUnits="userSpaceOnUse">
            <Polygon points="22,2 42,12 42,32 22,42 2,32 2,12" fill="none" stroke={palette.gold300} strokeWidth="0.9" />
            <Polygon points="22,11 31,16 31,28 22,33 13,28 13,16" fill="none" stroke={palette.gold300} strokeWidth="0.6" />
            <Line x1="22" y1="2" x2="22" y2="42" stroke={palette.gold300} strokeWidth="0.35" />
            <Line x1="2" y1="12" x2="42" y2="32" stroke={palette.gold300} strokeWidth="0.35" />
            <Line x1="42" y1="12" x2="2" y2="32" stroke={palette.gold300} strokeWidth="0.35" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hf-geo)" opacity={opacity} />
      </Svg>
    </View>
  );
}

function HeroBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id="hf-hero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={palette.emerald900} />
            <Stop offset="0.65" stopColor={palette.emerald800} />
            <Stop offset="1" stopColor={palette.emerald700} />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#hf-hero)" />
      </Svg>
      <GeometricPattern />
    </View>
  );
}

type Props = { children: ReactNode; style?: StyleProp<ViewStyle>; safeTop?: boolean };

/** Emerald header with the brand pattern. Pads for the status bar when it sits at the top of a screen. */
export function Hero({ children, style, safeTop = true }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View style={[styles.hero, { backgroundColor: colors.hero, paddingTop: (safeTop ? insets.top : 0) + space.lg }, style]}>
      <HeroBackground />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xl,
    overflow: 'hidden',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
});
