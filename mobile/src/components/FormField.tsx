import { useState, type ComponentRef, type Ref } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppText } from './AppText';
import { IconButton } from './Button';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export type TextInputHandle = ComponentRef<typeof TextInput>;

type Props = TextInputProps & {
  label: string;
  error?: string;
  hint?: string;
  secure?: boolean;
  ref?: Ref<TextInputHandle>;
};

/** Labelled text input. The label stays visible (not just a placeholder) and errors are read out with the field. */
export function FormField({ label, error, hint, secure, style, ref, onFocus, onBlur, ...rest }: Props) {
  const { colors } = useAppTheme();
  const [hidden, setHidden] = useState(true);
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.borderStrong;

  return (
    <View style={{ gap: space.xs }}>
      <AppText variant="smallStrong">{label}</AppText>
      {hint && (
        <AppText variant="caption" color="textMuted">
          {hint}
        </AppText>
      )}
      <View style={[styles.box, { borderColor, backgroundColor: colors.surface, borderWidth: focused || error ? 2 : 1.5 }]}>
        <TextInput
          ref={ref}
          {...rest}
          accessibilityLabel={label}
          accessibilityHint={[hint, error && `Error: ${error}`].filter(Boolean).join('. ') || undefined}
          aria-invalid={!!error}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={secure && hidden}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[styles.input, { color: colors.text }, style]}
        />
        {secure && (
          <IconButton
            icon={hidden ? 'eye' : 'eyeOff'}
            label={hidden ? 'Show password' : 'Hide password'}
            onPress={() => setHidden((h) => !h)}
            color={colors.textMuted}
          />
        )}
      </View>
      {error && (
        <AppText variant="small" color="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center', borderRadius: radius.md, paddingLeft: space.md, minHeight: 52 },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, paddingVertical: space.md, minHeight: 48 },
});
