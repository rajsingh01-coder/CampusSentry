import { router } from 'expo-router';
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark, Field, Page, PrimaryButton } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const { signIn } = useAuth();
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitLogin = async () => {
    const email = staffId.trim();
    if (!email || !password.trim()) {
      setNotice('Enter your campus email and password before signing in.');
      return;
    }

    setIsSubmitting(true);
    setNotice('');

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign-in failed. Please try again.';
      setNotice(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Page contentStyle={styles.page}>
      <View style={[styles.loginCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.brandPanel, { backgroundColor: colors.navy }]}>
          <BrandMark size={50} />
          <Text style={styles.brandName}>CampusSentry AI</Text>
          <Text style={styles.tagline}>Campus operations, at a glance.</Text>
          <View style={[styles.demoPill, { backgroundColor: `${colors.warning}22`, borderColor: `${colors.warning}66` }]}>
            <Text style={[styles.demoPillText, { color: colors.warning }]}>CAMPUS STAFF ACCESS</Text>
          </View>
        </View>

        <View style={styles.formBody}>
          <View style={styles.formIntro}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Sign in with your campus staff account.</Text>
          </View>

          {notice ? <Text accessibilityLiveRegion="polite" style={[styles.notice, { color: colors.warning }]}>{notice}</Text> : null}

          <View style={styles.fieldWithIcon}>
            <UserRound size={17} color={colors.muted} />
            <Field label="Campus email" placeholder="Enter your campus email" value={staffId} onChangeText={setStaffId} autoCapitalize="none" autoComplete="username" keyboardType="email-address" style={styles.flex} />
          </View>
          <View style={styles.fieldWithIcon}>
            <LockKeyhole size={17} color={colors.muted} />
            <Field label="Password" placeholder="Enter your password" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoComplete="current-password" style={styles.flex} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              accessibilityState={{ selected: showPassword }}
              onPress={() => setShowPassword((visible) => !visible)}
              style={[styles.passwordToggle, { borderColor: colors.border }]}
            >
              {showPassword
                ? <EyeOff size={18} color={colors.muted} />
                : <Eye size={18} color={colors.muted} />}
            </Pressable>
          </View>

          <Pressable accessibilityRole="button" onPress={() => setNotice('Password reset requires the campus authentication service, which is not connected.')} style={styles.forgot}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
          </Pressable>

          <PrimaryButton label={isSubmitting ? 'Signing in…' : 'Sign in'} disabled={isSubmitting} onPress={submitLogin} />
        </View>

        <Text style={[styles.footer, { color: colors.muted, backgroundColor: colors.surfaceMuted, borderTopColor: colors.border }]}>
          Sign-in is checked by the campus backend. Permissions are enforced server-side.
        </Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, justifyContent: 'center', paddingTop: 24 },
  loginCard: { width: '100%', borderWidth: 1, borderRadius: 20, overflow: 'hidden' },
  brandPanel: { alignItems: 'center', paddingHorizontal: 20, paddingVertical: 24, gap: 8 },
  brandName: { color: '#FFFFFF', fontSize: 21, fontWeight: '700', letterSpacing: -0.4 },
  tagline: { color: '#CBD5E1', fontSize: 13 },
  demoPill: { marginTop: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  demoPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  formBody: { padding: 20, gap: 14 },
  formIntro: { gap: 6, marginBottom: 2 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 13, lineHeight: 19 },
  fieldWithIcon: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  forgot: { alignSelf: 'flex-end', paddingVertical: 5 },
  forgotText: { fontSize: 13, fontWeight: '600' },
  notice: { fontSize: 13, lineHeight: 18 },
  flex: { flex: 1 },
  passwordToggle: { width: 44, height: 52, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 23 },
  footer: { paddingHorizontal: 14, paddingVertical: 11, borderTopWidth: 1, textAlign: 'center', fontSize: 10, lineHeight: 15 },
});
