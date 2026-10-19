import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

const INTRO_TEXT = 'CAMPUS OPERATIONS, AT A GLANCE';

export default function IntroScreen() {
  const { colors } = useAppTheme();
  const { isReady, mode } = useAuth();
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let redirect: ReturnType<typeof setTimeout> | undefined;
    let disposed = false;
    const navigate = () => {
      if (disposed) return;
      if (!isReady) {
        redirect = setTimeout(navigate, 100);
        return;
      }
      router.replace(mode === 'signed-out' ? '/login' : '/(tabs)');
    };

    const finish = () => {
      setTypedText(INTRO_TEXT);
      redirect = setTimeout(navigate, 550);
    };

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reducedMotion) => {
        if (disposed) return;
        if (reducedMotion) {
          finish();
          return;
        }
        let index = 0;
        interval = setInterval(() => {
          index += 1;
          setTypedText(INTRO_TEXT.slice(0, index));
          if (index >= INTRO_TEXT.length) {
            if (interval) clearInterval(interval);
            redirect = setTimeout(navigate, 650);
          }
        }, 38);
      })
      .catch(finish);

    return () => {
      disposed = true;
      if (interval) clearInterval(interval);
      if (redirect) clearTimeout(redirect);
    };
  }, [isReady, mode]);

  return (
    <View style={[styles.container, { backgroundColor: colors.navy }]}>
      <BrandMark size={68} />
      <Text style={styles.wordmark}>CampusSentry<Text style={styles.ai}> AI</Text></Text>
      <Text accessibilityLiveRegion="polite" style={styles.tagline}>{typedText}<Text style={styles.cursor}>|</Text></Text>
      <Text style={styles.footer}>STAFF & SECURITY MOBILE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  wordmark: { marginTop: 18, color: '#FFFFFF', fontSize: 27, fontWeight: '700', letterSpacing: -0.8 },
  ai: { color: '#60A5FA' },
  tagline: { minHeight: 22, marginTop: 12, color: '#CBD5E1', fontSize: 12, fontWeight: '600', letterSpacing: 1.2 },
  cursor: { color: '#60A5FA' },
  footer: { position: 'absolute', bottom: 44, color: '#94A3B8', fontSize: 10, fontWeight: '600', letterSpacing: 1.6 },
});
