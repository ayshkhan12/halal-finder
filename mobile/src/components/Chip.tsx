import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
  /** Extra context for screen readers, e.g. "3 filters on". */
  accessibilityHint?: string;
  badge?: number;
  tone?: 'default' | 'hero';
};

/** A toggle chip. Uses the button role with a "selected" state so VoiceOver/TalkBack read it as a toggle. */
export function Chip({ label, selected = false, onPress, icon, accessibilityHint, badge, tone = 'default' }: Props) {
  const { colors } = useAppTheme();
  const onHero = tone === 'hero';
  const bg = selected ? (onHero ? '#FFFFFF' : colors.primary) : onHero ? 'rgba(255,255,255,0.14)' : colors.surface;
  const fg = selected ? (onHero ? '#0F4730' : colors.onPrimary) : onHero ? '#FFFFFF' : colors.text;
  const border = selected ? 'transparent' : onHero ? 'rgba(255,255,255,0.45)' : colors.borderStrong;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={badge ? `${label}, ${badge} on` : label}
      accessibilityState={{ selected }}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
      hitSlop={{ top: 4, bottom: 4 }}
      style={({ pressed }) => [styles.chip, { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.75 : 1 }]}>
      {icon && <Icon name={icon} size={18} color={fg} />}
      <AppText variant="smallStrong" style={{ color: fg }}>
        {label}
      </AppText>
      {selected && !onHero && !badge && <Icon name="check" size={16} color={fg} />}
      {!!badge && (
        <View style={[styles.badge, { backgroundColor: selected ? colors.onPrimary : colors.primary }]}>
          <AppText variant="caption" style={{ color: selected ? colors.primary : colors.onPrimary }}>
            {badge}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs + 2,
    minHeight: 40,
    paddingHorizontal: space.md + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  badge: { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
});
