import { router } from 'expo-router';
import { Bell, ChevronRight, HelpCircle, LogOut, Moon, ShieldCheck, Sun, Smartphone, UserRound } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark, Card, DemoBanner, Page, ScreenTitle } from '@/components/ui';
import { ThemePreference } from '@/lib/theme';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

const themeOptions: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Smartphone },
];

export default function ProfileScreen() {
  const { colors, isDark, preference, setPreference, storageError } = useAppTheme();
  const { mode, user, signOut } = useAuth();
  const [securityNotice, setSecurityNotice] = useState('');
  const activeColors = isDark ? { selected: '#BFDBFE', selectedBackground: '#142B49' } : { selected: '#1D4ED8', selectedBackground: '#EFF6FF' };

  return (
    <Page>
      <ScreenTitle title="Profile" subtitle="Staff account and app preferences." />
      {mode === 'demo' ? <DemoBanner>Local prototype · Authentication and permissions are not connected</DemoBanner> : null}

      <Card style={styles.profileCard}>
        <BrandMark size={48} />
        <View style={styles.profileCopy}>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name || 'Demo staff member'}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{user?.email || 'Local demo session'}</Text>
          <Text style={[styles.meta, { color: colors.muted }]}>{user?.role || 'Demo mode'}</Text>
        </View>
        <View style={[styles.roleBadge, { backgroundColor: mode === 'authenticated' ? `${colors.success}18` : `${colors.warning}18` }]}><Text style={[styles.roleText, { color: mode === 'authenticated' ? colors.success : colors.warning }]}>{mode === 'authenticated' ? 'LIVE' : 'DEMO'}</Text></View>
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <Text style={[styles.sectionHint, { color: colors.muted }]}>Choose how CampusSentry looks on this device.</Text>
        <Card style={styles.themeCard}>
          {themeOptions.map(({ id, label, icon: Icon }) => {
            const selected = preference === id;
            return (
              <Pressable
                key={id}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => void setPreference(id)}
                style={[styles.themeOption, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? activeColors.selectedBackground : colors.surface }]}
              >
                <Icon size={17} color={selected ? activeColors.selected : colors.muted} />
                <Text style={[styles.themeLabel, { color: selected ? activeColors.selected : colors.text }]}>{label}</Text>
              </Pressable>
            );
          })}
        </Card>
        {storageError ? <Text style={[styles.warning, { color: colors.warning }]}>{storageError}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>More</Text>
        <Card style={styles.menuCard}>
          <MenuRow icon={Bell} title="Notifications" detail="Request updates" onPress={() => router.push('/notifications')} />
          <MenuRow icon={HelpCircle} title="AI assistant" detail="Demo interface only" onPress={() => router.push('/assistant')} />
          <MenuRow icon={ShieldCheck} title="Security & privacy" detail="Staff permissions need backend connection" onPress={() => setSecurityNotice('Authentication, staff permissions and audit logging require the campus backend.')} last />
        </Card>
      </View>
      {securityNotice ? <Text accessibilityLiveRegion="polite" style={[styles.warning, { color: colors.warning }]}>{securityNotice}</Text> : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => {
          void signOut().then(() => router.replace('/login')).catch((error: unknown) => {
            setSecurityNotice(error instanceof Error ? error.message : 'Unable to sign out securely.');
          });
        }}
        style={[styles.signOut, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <LogOut size={18} color={colors.critical} />
        <Text style={[styles.signOutText, { color: colors.critical }]}>Sign out</Text>
      </Pressable>
    </Page>
  );
}

function MenuRow({ icon: Icon, title, detail, onPress, last = false }: { icon: typeof Bell; title: string; detail: string; onPress: () => void; last?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[styles.menuRow, !last ? { borderBottomWidth: 1, borderBottomColor: colors.border } : null]}>
      <Icon size={19} color={colors.muted} />
      <View style={styles.menuCopy}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.menuDetail, { color: colors.muted }]}>{detail}</Text>
      </View>
      <ChevronRight size={18} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  profileCopy: { flex: 1, gap: 4 },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 12 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 7 },
  roleText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  section: { gap: 7 },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionHint: { fontSize: 13, lineHeight: 18, marginBottom: 4 },
  themeCard: { flexDirection: 'row', padding: 8, gap: 6 },
  themeOption: { minHeight: 48, flex: 1, borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  themeLabel: { fontSize: 12, fontWeight: '600' },
  warning: { marginTop: 3, fontSize: 12, lineHeight: 17 },
  menuCard: { paddingVertical: 0, paddingHorizontal: 14, gap: 0 },
  menuRow: { minHeight: 67, flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuCopy: { flex: 1, gap: 4 },
  menuTitle: { fontSize: 14, fontWeight: '600' },
  menuDetail: { fontSize: 11 },
  signOut: { minHeight: 49, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  signOutText: { fontSize: 14, fontWeight: '600' },
});
