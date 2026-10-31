import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { IconButton } from './Button';
import { Icon } from './Icon';
import { useAppTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  value: string;
  onChangeText: (text: string) => void;
  /** Spoken name of the field, e.g. "Search restaurants". */
  label: string;
};

export function SearchField({ value, onChangeText, label, placeholder, ...rest }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Icon name="search" size={20} color={colors.textMuted} />
      <TextInput
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        enterKeyHint="search"
        style={[styles.input, { color: colors.text }]}
        {...rest}
      />
      {value.length > 0 && <IconButton icon="close" label="Clear search" size={18} onPress={() => onChangeText('')} color={colors.textMuted} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 52,
    paddingLeft: space.lg,
    paddingRight: space.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, paddingVertical: space.md, minHeight: 48 },
});
