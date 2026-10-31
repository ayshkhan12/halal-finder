import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';
import { ApiError, API_URL } from '@/api/client';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

type EmptyProps = {
  icon: IconName;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyProps) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: colors.primarySoft }]}>
        <Icon name={icon} size={30} color={colors.onPrimarySoft} />
      </View>
      <AppText variant="heading" align="center" accessibilityRole="header">
        {title}
      </AppText>
      {message && (
        <AppText variant="body" color="textMuted" align="center">
          {message}
        </AppText>
      )}
      {actionLabel && onAction && <Button label={actionLabel} variant="secondary" onPress={onAction} style={styles.action} />}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const isNetwork = error instanceof ApiError && error.isNetwork;
  const message = error instanceof ApiError ? error.message : 'Something went wrong.';
  return (
    <View accessibilityRole="alert" accessibilityLiveRegion="polite">
      <EmptyState
        icon={isNetwork ? 'offline' : 'info'}
        title={isNetwork ? "You're offline" : 'Something went wrong'}
        message={isNetwork && __DEV__ ? `${message}\n\nDev tip: start the API with "npm run api" (looking for ${API_URL}).` : message}
        actionLabel={onRetry ? 'Try again' : undefined}
        onAction={onRetry}
      />
    </View>
  );
}

/** Static placeholder rows (no shimmer, so it is calm for people sensitive to motion). */
export function ListSkeleton({ rows = 4, label = 'Loading' }: { rows?: number; label?: string }) {
  const { colors } = useAppTheme();
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={label} style={{ gap: space.md }}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.skeletonImage, { backgroundColor: colors.skeleton }]} />
          <View style={{ flex: 1, gap: space.sm }}>
            <View style={[styles.line, { width: '70%', backgroundColor: colors.skeleton }]} />
            <View style={[styles.line, { width: '50%', backgroundColor: colors.skeleton }]} />
            <View style={[styles.line, { width: '35%', backgroundColor: colors.skeleton }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: space.xxxl, paddingHorizontal: space.xl, gap: space.sm },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: space.sm },
  action: { marginTop: space.md },
  skeletonCard: { flexDirection: 'row', gap: space.md, padding: space.md, borderRadius: radius.lg, borderWidth: 1 },
  skeletonImage: { width: 84, height: 84, borderRadius: radius.md },
  line: { height: 14, borderRadius: 7 },
});
