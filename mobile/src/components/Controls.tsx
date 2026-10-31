import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { MIN_TOUCH, radius, space } from '@/theme/tokens';

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading" accessibilityRole="header" style={{ flex: 1 }}>
        {title}
      </AppText>
      {action}
    </View>
  );
}

/** Groups rows on a rounded surface, like iOS settings. */
export function Card({ children, padded = false }: { children: ReactNode; padded?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, padded && { padding: space.lg, gap: space.md }, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

type RowProps = {
  icon?: IconName;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  value?: string;
  external?: boolean;
  last?: boolean;
  accessibilityHint?: string;
};

export function ListRow({ icon, title, subtitle, onPress, value, external, last, accessibilityHint }: RowProps) {
  const { colors } = useAppTheme();
  const content = (
    <>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name={icon} size={20} color={colors.onPrimarySoft} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle && (
          <AppText variant="small" color="textMuted">
            {subtitle}
          </AppText>
        )}
      </View>
      {value && (
        <AppText variant="small" color="textMuted">
          {value}
        </AppText>
      )}
      {onPress && <Icon name={external ? 'external' : 'chevronRight'} size={18} color={colors.textMuted} />}
    </>
  );
  const rowStyle = [styles.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }];
  if (!onPress) {
    return (
      <View style={rowStyle} accessible accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      accessibilityRole={external ? 'link' : 'button'}
      accessibilityLabel={[title, subtitle, value].filter(Boolean).join(', ')}
      accessibilityHint={accessibilityHint ?? (external ? 'Opens in your browser' : undefined)}
      onPress={onPress}
      style={({ pressed }) => [...rowStyle, pressed && { backgroundColor: colors.surfaceMuted }]}>
      {content}
    </Pressable>
  );
}

type SwitchRowProps = { title: string; description?: string; value: boolean; onChange: (v: boolean) => void; icon?: IconName; last?: boolean };

/** The whole row is one switch for screen readers; the visual Switch is hidden from them to avoid a double stop. */
export function SwitchRow({ title, description, value, onChange, icon, last }: SwitchRowProps) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [
        styles.row,
        !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}>
      {icon && (
        <View style={[styles.rowIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name={icon} size={20} color={colors.onPrimarySoft} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {description && (
          <AppText variant="small" color="textMuted">
            {description}
          </AppText>
        )}
      </View>
      {/* Purely visual: the row itself is the switch, so this must not be focusable. */}
      <View
        pointerEvents="none"
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={[styles.track, { backgroundColor: value ? colors.primary : colors.borderStrong }]}>
        <View style={[styles.thumb, { alignSelf: value ? 'flex-end' : 'flex-start' }]} />
      </View>
    </Pressable>
  );
}

type Option<T extends string | number> = { value: T; label: string };

/** Single-choice control with radio semantics. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[styles.segmented, { backgroundColor: colors.surfaceMuted }]}>
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: selected, selected }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, selected && [styles.segmentSelected, { backgroundColor: colors.surface, borderColor: colors.primary }]]}>
            <AppText variant="smallStrong" style={{ color: selected ? colors.primary : colors.textMuted }} align="center">
              {o.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginBottom: space.md },
  card: { borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: MIN_TOUCH + 8, paddingHorizontal: space.lg, paddingVertical: space.md },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  track: { width: 50, height: 30, borderRadius: 15, padding: 3, justifyContent: 'center' },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  segmented: { flexDirection: 'row', borderRadius: radius.md, padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, paddingHorizontal: space.xs, borderWidth: 1.5, borderColor: 'transparent' },
  segmentSelected: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
});
