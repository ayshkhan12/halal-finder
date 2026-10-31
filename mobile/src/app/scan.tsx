import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { fetchProductByBarcode } from '@/api/queries';
import { AppText } from '@/components/AppText';
import { Button, IconButton } from '@/components/Button';
import { FormField } from '@/components/FormField';
import { announce, useScreenReader } from '@/lib/a11y';
import { useAppTheme } from '@/theme/ThemeProvider';
import { palette, radius, space } from '@/theme/tokens';

/** Demo barcodes that exist in the sample data. */
const SAMPLE_CODES = [
  { code: '2001000000050', label: 'Greek-style yoghurt (certified)' },
  { code: '2001000000098', label: 'Cola bottles (certificate expired)' },
];

type Lookup = { state: 'idle' } | { state: 'looking'; code: string } | { state: 'not-found'; code: string } | { state: 'error'; message: string };

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const screenReader = useScreenReader();
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState(Platform.OS === 'web');
  const [torch, setTorch] = useState(false);
  const [code, setCode] = useState('');
  const [lookup, setLookup] = useState<Lookup>({ state: 'idle' });
  const busy = useRef(false);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/products'));

  const look = async (raw: string) => {
    const value = raw.replace(/\D/g, '');
    if (busy.current) return;
    if (value.length < 8 || value.length > 14) {
      setLookup({ state: 'error', message: 'Barcodes are 8 to 14 digits long.' });
      announce('Barcodes are 8 to 14 digits long.');
      return;
    }
    busy.current = true;
    setLookup({ state: 'looking', code: value });
    try {
      const product = await fetchProductByBarcode(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      router.replace({ pathname: '/product/[id]', params: { id: product.id } });
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      if (err instanceof ApiError && err.status === 404) {
        setLookup({ state: 'not-found', code: value });
        announce('This barcode is not in our database yet.');
      } else {
        const message = err instanceof ApiError ? err.message : 'Lookup failed.';
        setLookup({ state: 'error', message });
        announce(message);
      }
    } finally {
      busy.current = false;
    }
  };

  const onScanned = (result: BarcodeScanningResult) => {
    if (lookup.state === 'idle') look(result.data);
  };

  const showCamera = !manual && permission?.granted;

  return (
    <View style={[styles.fill, { backgroundColor: showCamera ? '#000' : colors.background }]}>
      {showCamera && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e'] }}
          onBarcodeScanned={lookup.state === 'idle' ? onScanned : undefined}
          accessibilityLabel="Camera viewfinder"
        />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <IconButton icon="close" label="Close scanner" variant={showCamera ? 'overlay' : 'surface'} onPress={close} />
        <AppText variant="heading" accessibilityRole="header" style={{ color: showCamera ? '#FFFFFF' : colors.text, flex: 1, textAlign: 'center' }}>
          Scan a barcode
        </AppText>
        {showCamera ? (
          <IconButton icon="torch" label={torch ? 'Turn torch off' : 'Turn torch on'} selected={torch} variant="overlay" onPress={() => setTorch((t) => !t)} />
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      {showCamera ? (
        <>
          <View style={styles.frameWrap} pointerEvents="none" aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={styles.frame} />
          </View>
          <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + space.lg, backgroundColor: colors.surface }]}>
            <Status lookup={lookup} onRetry={() => setLookup({ state: 'idle' })} />
            {lookup.state === 'idle' && (
              <AppText variant="body" align="center" accessibilityLiveRegion="polite">
                {screenReader ? 'Hold the barcode about 15 centimetres from the camera. You will feel a vibration when it is read.' : 'Point your camera at the barcode on the pack'}
              </AppText>
            )}
            <Button label="Type the barcode instead" icon="keyboard" variant="secondary" onPress={() => setManual(true)} />
          </View>
        </>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.fill}>
          <ScrollView contentContainerStyle={styles.manual} keyboardShouldPersistTaps="handled">
            {!manual && permission && !permission.granted && (
              <View style={[styles.permission, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AppText variant="subheading">Camera access</AppText>
                <AppText variant="body" color="textMuted">
                  Halal Finder uses the camera only to read barcodes. Nothing is recorded or uploaded.
                </AppText>
                {permission.canAskAgain ? (
                  <Button label="Allow camera" icon="scan" onPress={requestPermission} />
                ) : (
                  <Button label="Open Settings" variant="secondary" onPress={() => Linking.openSettings()} />
                )}
              </View>
            )}
            <FormField
              label="Barcode number"
              hint="The 8 to 13 digits under the barcode"
              value={code}
              onChangeText={(t) => {
                setCode(t.replace(/\D/g, ''));
                if (lookup.state !== 'looking') setLookup({ state: 'idle' });
              }}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={14}
              returnKeyType="search"
              onSubmitEditing={() => look(code)}
              autoFocus={manual && Platform.OS !== 'web'}
            />
            <Button label="Check product" onPress={() => look(code)} loading={lookup.state === 'looking'} fullWidth />
            <Status lookup={lookup} onRetry={() => setLookup({ state: 'idle' })} />
            {manual && (
              <Button
                label="Use the camera"
                icon="scan"
                variant="ghost"
                onPress={() => {
                  setManual(false);
                  if (!permission?.granted) requestPermission();
                }}
              />
            )}

            <View style={{ gap: space.sm, marginTop: space.md }}>
              <AppText variant="smallStrong" color="textMuted">
                Try a demo barcode
              </AppText>
              {SAMPLE_CODES.map((s) => (
                <Button
                  key={s.code}
                  label={`${s.code} · ${s.label}`}
                  variant="soft"
                  onPress={() => {
                    setCode(s.code);
                    look(s.code);
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

function Status({ lookup, onRetry }: { lookup: Lookup; onRetry: () => void }) {
  const { colors } = useAppTheme();
  if (lookup.state === 'idle') return null;
  if (lookup.state === 'looking') {
    return (
      <AppText variant="bodyStrong" align="center" accessibilityLiveRegion="polite">
        Checking {lookup.code}…
      </AppText>
    );
  }
  const message =
    lookup.state === 'not-found'
      ? `We don't have ${lookup.code} yet. Check the pack for a certifier's logo, and tell us about it so we can add it.`
      : lookup.message;
  return (
    <View accessibilityRole="alert" style={[styles.status, { backgroundColor: colors.warningSoft }]}>
      <AppText variant="smallStrong" style={{ color: colors.warning }}>
        {message}
      </AppText>
      <Button label="Scan again" variant="secondary" onPress={onRetry} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm, zIndex: 2 },
  frameWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  frame: { width: '78%', aspectRatio: 1.6, borderRadius: radius.lg, borderWidth: 3, borderColor: palette.gold300 },
  bottomSheet: { padding: space.xl, gap: space.md, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  manual: { padding: space.xl, gap: space.lg },
  permission: { padding: space.lg, borderRadius: radius.lg, borderWidth: 1, gap: space.md },
  status: { padding: space.md, borderRadius: radius.md, gap: space.sm },
});
