import { Image } from 'expo-image';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from './AppText';
import { IconButton } from './Button';
import { useCertTone } from './CertBadge';
import { Icon, type IconName } from './Icon';
import type { Certification } from '@/api/types';
import { CERT_META, certSentence, formatDate } from '@/lib/format';
import { useAppTheme } from '@/theme/ThemeProvider';
import { radius, space } from '@/theme/tokens';

type HeroProps = {
  imageUrl: string | null;
  saved: boolean;
  onToggleSave: () => void;
  onShare: () => void;
  name: string;
};

/** Photo header with floating back/save/share buttons. */
export function DetailHero({ imageUrl, saved, onToggleSave, onShare, name }: HeroProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  return (
    <View>
      <Image source={imageUrl ?? undefined} style={[styles.heroImage, { backgroundColor: colors.primarySoft }]} contentFit="cover" transition={200} accessible={false} />
      <View style={[styles.heroButtons, { top: insets.top + space.sm }]}>
        <IconButton
          icon="back"
          label="Back"
          variant="overlay"
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        />
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <IconButton icon="share" label={`Share ${name}`} variant="overlay" onPress={onShare} />
          <IconButton
            icon={saved ? 'savedFill' : 'saved'}
            label={saved ? `Remove ${name} from saved` : `Save ${name}`}
            selected={saved}
            variant="overlay"
            color={saved ? '#FF8A80' : '#FFFFFF'}
            onPress={onToggleSave}
          />
        </View>
      </View>
    </View>
  );
}

/** The most important block on a listing: who certified it and whether that's still valid. */
export function CertificationPanel({ certification }: { certification: Certification }) {
  const { colors } = useAppTheme();
  const { fg, bg } = useCertTone(certification.status);
  const meta = CERT_META[certification.status];
  return (
    <View style={[styles.cert, { backgroundColor: bg, borderColor: fg }]} accessible={false}>
      <View style={styles.certHeader}>
        <Icon name={meta.icon} size={28} color={fg} />
        <View style={{ flex: 1 }}>
          <AppText variant="label" style={{ color: fg }}>
            {meta.label}
          </AppText>
          <AppText variant="heading" style={{ color: colors.text }}>
            {certification.certifier?.name ?? 'No certifier'}
          </AppText>
        </View>
      </View>
      <AppText variant="body" color="text">
        {certSentence(certification)}
      </AppText>
      <View style={styles.certFacts}>
        {certification.number && <Fact label="Certificate no." value={certification.number} />}
        {certification.expiresOn && (
          <Fact label={certification.status === 'expired' ? 'Expired on' : 'Valid until'} value={formatDate(certification.expiresOn)} />
        )}
        {certification.lastVerified && <Fact label="Last checked" value={formatDate(certification.lastVerified)} />}
      </View>
      {certification.certifier && (
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`About ${certification.certifier.name}`}
          onPress={() => router.push({ pathname: '/certifier/[id]', params: { id: certification.certifier!.id } })}
          style={({ pressed }) => [styles.certLink, { opacity: pressed ? 0.7 : 1 }]}>
          <AppText variant="smallStrong" style={{ color: colors.primary }}>
            About {certification.certifier.shortName} and its standard
          </AppText>
          <Icon name="chevronRight" size={16} color={colors.primary} />
        </Pressable>
      )}
    </View>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View accessible accessibilityLabel={`${label}: ${value}`} style={{ minWidth: 120 }}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="smallStrong">{value}</AppText>
    </View>
  );
}

/** A labelled yes/no attribute, e.g. "Alcohol-free". The text always states the answer. */
export function AttributeRow({ icon, title, detail, positive }: { icon: IconName; title: string; detail?: string; positive: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.attr} accessible accessibilityLabel={[title, detail].filter(Boolean).join('. ')}>
      <View style={[styles.attrIcon, { backgroundColor: positive ? colors.successSoft : colors.surfaceMuted }]}>
        <Icon name={icon} size={20} color={positive ? colors.success : colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="bodyStrong">{title}</AppText>
        {detail && (
          <AppText variant="small" color="textMuted">
            {detail}
          </AppText>
        )}
      </View>
    </View>
  );
}

export function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  heroImage: { width: '100%', height: 260 },
  heroButtons: { position: 'absolute', left: space.lg, right: space.lg, flexDirection: 'row', justifyContent: 'space-between' },
  cert: { borderRadius: radius.lg, borderWidth: 1.5, padding: space.lg, gap: space.md },
  certHeader: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  certFacts: { flexDirection: 'row', flexWrap: 'wrap', gap: space.lg },
  certLink: { flexDirection: 'row', alignItems: 'center', gap: space.xs, minHeight: 44 },
  attr: { flexDirection: 'row', alignItems: 'center', gap: space.md, paddingVertical: space.xs },
  attrIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  section: { gap: space.md },
});
