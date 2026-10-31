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

export default function SignUpScreen() {
  const { colors } = useAppTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const emailRef = useRef<TextInputHandle>(null);
  const passwordRef = useRef<TextInputHandle>(null);

  const submit = async () => {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Enter your name';
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = 'Enter a valid email address';
    if (password.length < 8) next.password = 'Use at least 8 characters';
    setErrors(next);
    setFormError(null);
    if (Object.keys(next).length) {
      announce('Please fix the highlighted fields');
      return;
    }
    setBusy(true);
    try {
      await signUp(name.trim(), email.trim(), password);
      announce('Account created');
      router.back();
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      const message = err instanceof ApiError ? err.message : 'Could not create your account.';
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
          An account is optional. It lets you sync saved places across devices.
        </AppText>
        <FormField
          label="Name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />
        <FormField
          ref={emailRef}
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
          hint="At least 8 characters"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secure
          autoComplete="new-password"
          textContentType="newPassword"
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
        <Button label="Create account" onPress={submit} loading={busy} fullWidth />
        <Button label="Already have an account? Sign in" variant="ghost" onPress={() => router.replace('/sign-in')} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.lg },
  alert: { padding: space.md, borderRadius: 10 },
});
