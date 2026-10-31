/**
 * Design tokens. Text/background pairs are chosen to meet WCAG 2.2 AA
 * (4.5:1 for body text, 3:1 for large text and UI outlines) in both themes.
 * Gold is decorative only: never use `gold` for text on light surfaces, use `goldText`.
 */

export const palette = {
  emerald900: '#0B3A27',
  emerald800: '#0F4730',
  emerald700: '#17694A',
  emerald500: '#2D8F65',
  emerald300: '#5BC495',
  emerald100: '#E5F2EB',
  gold500: '#C9A84C',
  gold300: '#F0D98A',
  gold700: '#7A5E12',
  cream: '#FAF7F0',
};

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primarySoft: string;
  onPrimarySoft: string;
  hero: string;
  heroText: string;
  heroTextMuted: string;
  gold: string;
  goldText: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  focus: string;
  overlay: string;
  skeleton: string;
};

export const lightColors: ColorTokens = {
  background: palette.cream,
  surface: '#FFFFFF',
  surfaceMuted: '#F2EFE7',
  border: '#E2DCCF',
  borderStrong: '#8C8577', // 3.5:1 on white, for input outlines
  text: '#1C1C1E',
  textMuted: '#4F5864',
  primary: palette.emerald700,
  primaryPressed: palette.emerald800,
  onPrimary: '#FFFFFF',
  primarySoft: palette.emerald100,
  onPrimarySoft: palette.emerald800,
  hero: palette.emerald800,
  heroText: '#FFFFFF',
  heroTextMuted: '#D3E8DD',
  gold: palette.gold500,
  goldText: palette.gold700,
  success: palette.emerald700,
  successSoft: palette.emerald100,
  warning: '#7A4F00',
  warningSoft: '#FFF1CC',
  danger: '#B42318',
  dangerSoft: '#FDECEA',
  focus: palette.emerald900,
  overlay: 'rgba(12, 20, 16, 0.55)',
  skeleton: '#ECE7DC',
};

export const darkColors: ColorTokens = {
  background: '#0D1411',
  surface: '#151E1A',
  surfaceMuted: '#1D2823',
  border: '#2B3832',
  borderStrong: '#7D8C85',
  text: '#F2F0EA',
  textMuted: '#AEB9B3',
  primary: palette.emerald300,
  primaryPressed: '#7FD4AE',
  onPrimary: '#06261A',
  primarySoft: '#173B2C',
  onPrimarySoft: '#BFE8D4',
  hero: '#0A2F20',
  heroText: '#FFFFFF',
  heroTextMuted: '#BCD6C9',
  gold: '#E0C36F',
  goldText: '#E8CF86',
  success: palette.emerald300,
  successSoft: '#173B2C',
  warning: '#F5C46B',
  warningSoft: '#3A2C0C',
  danger: '#FF8A80',
  dangerSoft: '#3D1714',
  focus: palette.gold300,
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1F2A25',
};

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

/** Minimum touch target (Apple HIG 44pt, Material 48dp). */
export const MIN_TOUCH = 48;

export const fonts = {
  display: 'PlayfairDisplay_700Bold',
  displayHeavy: 'PlayfairDisplay_800ExtraBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  semibold: 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
} as const;
