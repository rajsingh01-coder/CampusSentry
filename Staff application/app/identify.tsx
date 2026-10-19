import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { AlertTriangle, Camera, ShieldCheck } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, DemoBanner, Page, PrimaryButton, ScreenTitle } from '@/components/ui';
import { useAppTheme } from '@/providers/theme-provider';

export default function IdentifyScreen() {
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraAttempt, setCameraAttempt] = useState(0);
  const [captureNotice, setCaptureNotice] = useState('');

  useFocusEffect(useCallback(() => () => {
    setCameraActive(false);
    setCameraReady(false);
  }, []));

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setCameraActive(false);
        setCameraReady(false);
      }
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!cameraActive) return undefined;
    const timeout = setTimeout(() => {
      setCameraActive(false);
      setCameraReady(false);
      setCaptureNotice('Camera preview stopped automatically after five minutes. Start it again if needed.');
    }, 5 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [cameraActive]);

  const capturePhoto = async () => {
    if (!cameraActive || !cameraReady || !cameraRef.current) return;
    setCapturing(true);
    try {
      await cameraRef.current.takePictureAsync({ quality: 0.6, shutterSound: false });
      setCaptureNotice('Photo captured to the device’s temporary camera cache. It is not uploaded or matched because no AI service is connected.');
      setCameraActive(false);
      setCameraReady(false);
    } catch {
      setCaptureNotice('Could not capture a photo. Check camera permission and device availability, then try again.');
      setCameraActive(false);
      setCameraReady(false);
    } finally {
      setCapturing(false);
    }
  };

  return (
    <Page>
      <ScreenTitle title="Identify visitor" subtitle="Camera capture and manual verification." back />
      <DemoBanner>Camera demo · No face matching or recognition is connected</DemoBanner>

      {!permission ? (
        <Card><Text style={[styles.message, { color: colors.muted }]}>Checking camera permission…</Text></Card>
      ) : !permission.granted ? (
        <Card style={styles.permissionCard}>
          <View style={[styles.permissionIcon, { backgroundColor: `${colors.warning}18` }]}><Camera color={colors.warning} size={23} /></View>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Camera access needed</Text>
          <Text style={[styles.message, { color: colors.muted }]}>
            Allow camera access to preview a visitor. You can still choose manual verification without taking a photo.
          </Text>
          {permission.canAskAgain ? (
            <PrimaryButton label="Allow camera" onPress={() => void requestPermission()} />
          ) : (
            <View style={[styles.permissionWarning, { backgroundColor: `${colors.warning}18` }]}>
              <AlertTriangle size={17} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>Camera permission was denied. Enable it in your device settings.</Text>
            </View>
          )}
        </Card>
      ) : cameraError ? (
          <Card style={[styles.cameraErrorCard, { borderColor: `${colors.warning}66` }]}>
            <View style={[styles.permissionIcon, { backgroundColor: `${colors.warning}18` }]}><AlertTriangle color={colors.warning} size={23} /></View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Camera could not start</Text>
            <Text style={[styles.message, { color: colors.muted }]}>
              Check camera permission and device availability, or continue with manual verification.
            </Text>
            <Text accessibilityLiveRegion="polite" style={[styles.cameraErrorDetail, { color: colors.muted }]}>{cameraError}</Text>
            <PrimaryButton
              label="Retry camera"
              variant="secondary"
              onPress={() => {
                setCameraReady(false);
                setCameraError(null);
                setCameraActive(true);
                setCameraAttempt((current) => current + 1);
              }}
            />
          </Card>
        ) : !cameraActive ? (
          <Card style={styles.permissionCard}>
            <View style={[styles.permissionIcon, { backgroundColor: `${colors.info}18` }]}><Camera color={colors.info} size={23} /></View>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Camera inactive</Text>
            <Text style={[styles.message, { color: colors.muted }]}>The camera stays off until you explicitly start the preview. It stops when you leave this screen, the app goes inactive, after capture, or after five minutes.</Text>
            <PrimaryButton label="Start camera preview" onPress={() => {
              setCameraError(null);
              setCameraActive(true);
            }} />
          </Card>
        ) : (
          <View style={[styles.cameraFrame, { backgroundColor: '#07111F' }]}>
            <CameraView
              key={cameraAttempt}
              ref={cameraRef}
              facing="front"
              onCameraReady={() => setCameraReady(true)}
              onMountError={(event) => {
                setCameraReady(false);
                setCameraError(event.message);
              }}
              style={StyleSheet.absoluteFill}
            />
            <View pointerEvents="none" style={styles.cameraOverlay}>
              <View style={styles.cameraTopLabel}><View style={styles.liveDot} /><Text style={styles.cameraLabel}>CAMERA PREVIEW</Text></View>
              <View style={styles.faceFrame} />
              <Text style={styles.cameraHelp}>Position the visitor’s face inside the frame</Text>
            </View>
          </View>
        )}

      {permission?.granted && cameraActive && !cameraError ? (
        <>
          <PrimaryButton label={capturing ? 'Capturing…' : 'Capture photo'} loading={capturing} disabled={!cameraReady || capturing} onPress={() => void capturePhoto()} />
          <PrimaryButton label="Stop camera" variant="secondary" disabled={capturing} onPress={() => {
            setCameraActive(false);
            setCameraReady(false);
          }} />
        </>
      ) : null}

      {captureNotice ? (
        <Card style={styles.captureCard}>
          <View style={styles.captureTitleRow}><AlertTriangle size={18} color={colors.warning} /><Text style={[styles.cardTitle, { color: colors.text }]}>Recognition unavailable</Text></View>
          <Text style={[styles.message, { color: colors.muted }]}>{captureNotice}</Text>
        </Card>
      ) : null}

      <Card style={styles.verificationCard}>
        <View style={[styles.verificationIcon, { backgroundColor: `${colors.primary}16` }]}><ShieldCheck size={20} color={colors.primary} /></View>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Identity needs human review</Text>
        <Text style={[styles.message, { color: colors.muted }]}>An unknown face is not automatically unauthorized. Confirm identity and access through the approved campus workflow.</Text>
        <Pressable accessibilityRole="button" onPress={() => router.push('/register')} style={[styles.secondaryAction, { borderColor: colors.border }]}>
          <Text style={[styles.secondaryLabel, { color: colors.text }]}>Start manual visitor verification</Text>
        </Pressable>
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  permissionCard: { alignItems: 'flex-start' },
  permissionIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  message: { fontSize: 13, lineHeight: 19 },
  permissionWarning: { width: '100%', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '500' },
  cameraFrame: { height: 370, borderRadius: 18, overflow: 'hidden', position: 'relative' },
  cameraOverlay: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', padding: 16 },
  cameraTopLabel: { position: 'absolute', top: 14, left: 14, flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: '#07111FCC', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 5, backgroundColor: '#34D399' },
  cameraLabel: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  faceFrame: { width: 205, height: 260, borderWidth: 2, borderColor: '#BFDBFE', borderRadius: 100, borderStyle: 'dashed' },
  cameraHelp: { position: 'absolute', bottom: 17, color: '#FFFFFF', fontSize: 13, fontWeight: '500', textAlign: 'center', textShadowColor: '#00000088', textShadowRadius: 5 },
  captureCard: { borderColor: '#D9770655' },
  cameraErrorCard: { alignItems: 'flex-start' },
  cameraErrorDetail: { fontSize: 11, lineHeight: 16 },
  captureTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  verificationCard: { alignItems: 'flex-start' },
  verificationIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  secondaryAction: { width: '100%', minHeight: 46, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  secondaryLabel: { fontSize: 13, fontWeight: '600' },
});
