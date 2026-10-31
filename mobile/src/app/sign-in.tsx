import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { ApiError } from '@/api/client';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/Button';
import { FormField, type TextInputHandle } from '@/components/FormField';
import { announce } from '@/lib/a11y';
import { useAuth } from '@/state/auth';
import { useAppTheme } from '@/theme/ThemeProvider';
import { space } from '@/theme/tokens';

export default function SignInScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const passwordRef = useRef<TextInputHandle>(null);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Enter your password';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) {
      announce('Please fix the highlighted fields');
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      announce('Signed in');
      router.back();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not sign in.';
      setFormError(message);
      announce(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="body" color="textMuted">
          Sign in to keep your saved places and products on all your devices.
        </AppText>
        <FormField
          label="Email"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
        />
        <FormField
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secure
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
        />
        {formError && (
          <View accessibilityRole="alert" style={[styles.alert, { backgroundColor: colors.dangerSoft }]}>
            <AppText variant="smallStrong" color="danger">
              {formError}
            </AppText>
          </View>
        )}
        <Button label="Sign in" onPress={submit} loading={busy} fullWidth />
        <Button label="New here? Create an account" variant="ghost" onPress={() => router.replace('/sign-up')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.lg },
  alert: { padding: space.md, borderRadius: 10 },
});
