import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import type { Certification } from '@/api/types';
import { CERT_META, certSummary } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

export function useCertTone(status: Certification['status']) {
  const { colors } = useAppTheme();
  const tone = CERT_META[status].tone;
  return {
    success: { fg: colors.success, bg: colors.successSoft },
    warning: { fg: colors.warning, bg: colors.warningSoft },
    danger: { fg: colors.danger, bg: colors.dangerSoft },
    muted: { fg: colors.textMuted, bg: colors.surfaceMuted },
  }[tone];
}

/** Compact status pill. Status is shown by icon shape and text, never colour alone. */
export function CertBadge({ certification }: { certification: Certification }) {
  const { fg, bg } = useCertTone(certification.status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Icon name={CERT_META[certification.status].icon} size={15} color={fg} />
      <AppText variant="caption" style={{ color: fg }} numberOfLines={2}>
        {certSummary(certification)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexShrink: 1,
    gap: space.xs,
    paddingHorizontal: space.sm + 2,
    paddingVertical: space.xs,
    borderRadius: radius.pill,
  },
});
