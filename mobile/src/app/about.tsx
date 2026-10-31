import { ScrollView, View } from 'react-native';

import type { CertStatus } from '@/api/types';
import { AppText } from '@/components/AppText';
import { CertBadge } from '@/components/CertBadge';
import { Card } from '@/components/Controls';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

const EXAMPLES: { status: CertStatus; days: number | null; text: string }[] = [
  { status: 'verified', days: 200, text: 'The certificate is current and has more than 30 days left.' },
  { status: 'expiring', days: 12, text: 'The certificate is current but ends within 30 days. Renewals are usually routine.' },
  { status: 'expired', days: -5, text: 'The certificate has lapsed. These are hidden unless you turn off “Current certificates only”.' },
];

export default function AboutScreen() {
  const { colors } = useAppTheme();
  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={{ padding: space.xl, gap: space.xl }}>
      <Section title="What Halal Finder does">
        <AppText variant="body">
          Halal Finder helps you find restaurants, takeaways, butchers and grocers with a current halal certificate, and check whether a packaged product is
          certified before you buy it.
        </AppText>
      </Section>

      <Section title="How verification works">
        <AppText variant="body">
          Every listing is linked to the certification body that issued its certificate, with the certificate number and expiry date. The app works out a
          status from that date each time you look:
        </AppText>
        <Card padded>
          {EXAMPLES.map((e) => (
            <View key={e.status} style={{ gap: space.xs }}>
              <CertBadge
                certification={{
                  status: e.status,
                  daysRemaining: e.days,
                  number: null,
                  expiresOn: null,
                  lastVerified: null,
                  certifier: { id: 'hmc', name: 'Halal Monitoring Committee', shortName: 'HMC' },
                }}
              />
              <AppText variant="small" color="textMuted">
                {e.text}
              </AppText>
            </View>
          ))}
        </Card>
        <AppText variant="body">
          If something looks wrong, use “Report a problem” on any listing. Reports go to a review queue so the listing can be checked with the certifier.
        </AppText>
      </Section>

      <Section title="Demo data">
        <View style={{ padding: space.lg, borderRadius: 12, backgroundColor: colors.warningSoft }}>
          <AppText variant="body" style={{ color: colors.warning }}>
            This build uses sample data. The venues, brands, certificate numbers and phone numbers are made up. The certification bodies are real organisations,
            but they have not certified these sample listings.
          </AppText>
        </View>
      </Section>

      <Section title="Accessibility">
        <AppText variant="body">
          Halal Finder is built to work with VoiceOver, TalkBack and keyboards. It follows your device&apos;s text size, dark mode and reduce-motion settings.
          Every status is shown with text and an icon, never colour alone, and the map has a list with the same places.
        </AppText>
      </Section>

      <Section title="Credits">
        <AppText variant="small" color="textMuted">
          Map data © OpenStreetMap contributors. Food photography from Unsplash.
        </AppText>
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.md }}>
      <AppText variant="heading" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}
