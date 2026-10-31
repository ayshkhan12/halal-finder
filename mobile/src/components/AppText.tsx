import { Text, type TextProps, type TextStyle } from 'react-native';

import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, type ColorTokens } from '@/theme/tokens';

const VARIANTS = {
  display: { fontFamily: fonts.displayHeavy, fontSize: 30, lineHeight: 38 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 31 },
  heading: { fontFamily: fonts.bold, fontSize: 18, lineHeight: 24 },
  subheading: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 22 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  smallStrong: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.bold, fontSize: 12, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof VARIANTS;

type Props = TextProps & {
  variant?: TextVariant;
  color?: keyof ColorTokens;
  align?: TextStyle['textAlign'];
};

/** Themed text. Font scaling stays on so system text size settings are respected. */
export function AppText({ variant = 'body', color = 'text', align, style, ...rest }: Props) {
  const { colors } = useAppTheme();
  return <Text {...rest} style={[VARIANTS[variant], { color: colors[color], textAlign: align }, style]} />;
}
