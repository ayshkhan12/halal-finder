import { ActivityIndicator, Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { MIN_TOUCH, palette, radius, space } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'soft' | 'ghost' | 'danger' | 'onHero';

type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, variant = 'primary', icon, loading, disabled, fullWidth, style, ...rest }: ButtonProps) {
  const { colors } = useAppTheme();
  const variants: Record<Variant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.surface, fg: colors.primary, border: colors.borderStrong },
    soft: { bg: colors.primarySoft, fg: colors.onPrimarySoft },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
    onHero: { bg: '#FFFFFF', fg: palette.emerald800 },
  };
  const p = variants[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      {...rest}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: p.bg, borderColor: p.border ?? 'transparent', opacity: isDisabled ? 0.55 : pressed ? 0.8 : 1 },
        fullWidth && styles.full,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={p.fg} accessibilityElementsHidden importantForAccessibility="no" />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={20} color={p.fg} />}
          <AppText variant="bodyStrong" style={{ color: p.fg }} numberOfLines={2}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

type IconButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  icon: IconName;
  /** Required: icon-only buttons must have a spoken name. */
  label: string;
  variant?: 'plain' | 'surface' | 'overlay' | 'hero';
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
};

export function IconButton({ icon, label, variant = 'plain', color, size = 22, style, selected, ...rest }: IconButtonProps) {
  const { colors } = useAppTheme();
  const bg = { plain: 'transparent', surface: colors.surface, overlay: 'rgba(0,0,0,0.55)', hero: 'rgba(255,255,255,0.16)' }[variant];
  const fg = color ?? (variant === 'overlay' || variant === 'hero' ? '#FFFFFF' : colors.text);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected }}
      hitSlop={4}
      {...rest}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: bg, opacity: pressed ? 0.7 : 1 },
        variant === 'surface' && { borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
        style,
      ]}>
      <Icon name={icon} size={size} color={fg} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: MIN_TOUCH,
    paddingHorizontal: space.xl,
    paddingVertical: space.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { alignSelf: 'stretch' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
