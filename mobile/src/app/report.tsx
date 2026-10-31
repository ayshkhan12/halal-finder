import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { useSubmitReport } from '@/api/queries';
import type { ReportReason } from '@/api/types';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Controls';
import { FormField } from '@/components/FormField';
import { EmptyState } from '@/components/States';
import { announce } from '@/lib/a11y';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

const REASONS: { value: ReportReason; label: string; detail: string }[] = [
  { value: 'not_halal', label: 'It isn’t halal', detail: 'Something on sale or served isn’t halal' },
  { value: 'certificate_expired', label: 'Certificate is out of date', detail: 'The certificate on display has expired' },
  { value: 'permanently_closed', label: 'Permanently closed', detail: 'This place has shut down' },
  { value: 'wrong_details', label: 'Wrong details', detail: 'Address, hours or phone number are wrong' },
  { value: 'other', label: 'Something else', detail: '' },
];

export default function ReportScreen() {
  const { type, id, name } = useLocalSearchParams<{ type: 'restaurant' | 'product'; id: string; name?: string }>();
  const { colors } = useAppTheme();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mutation = useSubmitReport();

  const submit = () => {
    if (!reason) {
      setError('Choose what’s wrong');
      announce('Choose what’s wrong');
      return;
    }
    setError(null);
    mutation.mutate(
      { itemType: type, itemId: id, reason, details: details.trim() || undefined },
      {
        onSuccess: () => announce('Report sent. Thank you.'),
        onError: (err) => {
          const message = err instanceof ApiError ? err.message : 'Could not send your report.';
          setError(message);
          announce(message);
        },
      },
    );
  };

  if (mutation.isSuccess) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: space.xl }}>
        <EmptyState
          icon="check"
          title="Thanks for letting us know"
          message="Your report has been sent for review. The listing will be checked against the certifier's records."
          actionLabel="Done"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {name && (
          <AppText variant="body" color="textMuted">
            Reporting <AppText variant="bodyStrong">{name}</AppText>
          </AppText>
        )}
        <AppText variant="heading" accessibilityRole="header" nativeID="reason-label">
          What&apos;s wrong?
        </AppText>
        <View accessibilityRole="radiogroup" accessibilityLabel="What's wrong?">
          <Card>
            {REASONS.map((r, i) => {
              const selected = reason === r.value;
              return (
                <Pressable
                  key={r.value}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={[r.label, r.detail].filter(Boolean).join('. ')}
                  onPress={() => setReason(r.value)}
                  style={({ pressed }) => [
                    styles.option,
                    i < REASONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    pressed && { backgroundColor: colors.surfaceMuted },
                  ]}>
                  <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.borderStrong }]}>
                    {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyStrong">{r.label}</AppText>
                    {!!r.detail && (
                      <AppText variant="small" color="textMuted">
                        {r.detail}
                      </AppText>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </Card>
        </View>
        <FormField
          label="Details (optional)"
          hint="Anything that helps us check, like the date you visited"
          value={details}
          onChangeText={setDetails}
          multiline
          maxLength={1000}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
        {error && (
          <AppText variant="smallStrong" color="danger" accessibilityRole="alert">
            {error}
          </AppText>
        )}
        <Button label="Send report" onPress={submit} loading={mutation.isPending} fullWidth />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.lg, paddingBottom: space.xxxl },
  option: { flexDirection: 'row', alignItems: 'center', gap: space.md, padding: space.lg, minHeight: 56 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
});
