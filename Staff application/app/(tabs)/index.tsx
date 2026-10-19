import { router } from 'expo-router';
import { Bell, Building2, Camera, CheckCircle2, ChevronRight, Clock3, UserPlus, Users, Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark, Card, DemoBanner, Page, PrimaryButton, SectionHeading, StatusBadge } from '@/components/ui';
import { useDemoData } from '@/providers/demo-data-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const { requests, records, isDemo, isConnected, isLoading, loadError, refresh } = useDemoData();
  const pendingCount = requests.filter((item) => ['Pending', 'Pending Verification', 'Pending Approval', 'Verification Required'].includes(item.status)).length;
  const insideCount = records.filter((item) => item.presence === 'Inside Campus').length;
  const approvedCount = requests.filter((item) => item.status === 'Approved').length;
  const today = new Date().toDateString();
  const visitorsToday = requests.filter((item) => new Date(item.submittedAt).toDateString() === today).length;
  const recent = requests.slice(0, 3);
  const quickActions = [
    { label: 'Identify visitor', hint: 'Camera verification', icon: Camera, route: '/identify', color: colors.info },
    { label: 'Register visitor', hint: 'New gate request', icon: UserPlus, route: '/register', color: colors.teal },
    { label: 'Pending requests', hint: 'Review status', icon: Clock3, route: '/(tabs)/requests', color: colors.warning },
    { label: 'Visitor records', hint: 'Search and check-out', icon: Users, route: '/(tabs)/records', color: colors.info },
  ] as const;

  return (
    <Page contentStyle={styles.content}>
      <View style={styles.topbar}>
        <View style={styles.brandGroup}>
          <BrandMark size={42} />
          <View>
            <Text style={[styles.brandName, { color: colors.text }]}>CampusSentry</Text>
            <Text style={[styles.brandCaption, { color: colors.muted }]}>Campus operations</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          onPress={() => router.push('/notifications')}
          style={[styles.iconButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
        >
          <Bell size={20} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.dashboardHeading}>
        <Text style={[styles.dashboardTitle, { color: colors.text }]}>Security & visitor overview</Text>
        <Text style={[styles.dashboardSubtitle, { color: colors.muted }]}>{isDemo ? 'Simulated request and gate activity.' : 'Live visitor and gate activity from the backend.'}</Text>
      </View>

      {isDemo ? <DemoBanner>Demo Environment · Actions stay on this device</DemoBanner> : null}
      {!isDemo ? (
        <Text accessibilityLiveRegion="polite" style={[styles.connectionStatus, { color: isConnected ? colors.success : loadError ? colors.critical : colors.muted }]}>
          {isConnected ? 'Backend connected · Live data loaded' : loadError ? 'Backend unavailable · Check the connection' : 'Connecting to backend…'}
        </Text>
      ) : null}
      {loadError ? (
        <Card>
          <Text style={[styles.emptyText, { color: colors.critical }]}>{loadError}</Text>
          <PrimaryButton label="Retry loading dashboard" variant="secondary" onPress={() => void refresh()} />
        </Card>
      ) : null}
      {isLoading ? <Card><Text style={[styles.emptyText, { color: colors.muted }]}>Loading live visitor data…</Text></Card> : null}

      <View style={styles.metrics}>
        <MetricCard label="Visitor requests today" value={String(visitorsToday)} detail={isDemo ? 'Submitted in this demo' : 'Submitted today'} accent={colors.info} icon={Users} />
        <MetricCard label="Visitors inside" value={String(insideCount)} detail={isDemo ? 'From local entry records' : 'From backend entry logs'} accent={colors.success} icon={Building2} />
        <MetricCard label="Pending requests" value={String(pendingCount)} detail="Awaiting review" accent={colors.warning} icon={Clock3} />
        <MetricCard label="Approved requests" value={String(approvedCount)} detail={isDemo ? 'Cleared in demo data' : 'Approved visitor requests'} accent={colors.success} icon={CheckCircle2} />
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading title="Quick actions" />
        <View style={styles.actionGrid}>
          {quickActions.map(({ label, hint, icon: Icon, route, color }) => (
            <Pressable
              accessibilityRole="button"
              key={label}
              onPress={() => router.push(route)}
              style={({ pressed }) => [
                styles.actionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed ? styles.pressed : null,
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: `${color}18` }]}><Icon size={20} color={color} /></View>
              <Text style={[styles.actionTitle, { color: colors.text }]}>{label}</Text>
              <Text style={[styles.actionHint, { color: colors.muted }]}>{hint}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <SectionHeading
          title="Recent visitor activity"
          action={<Pressable accessibilityRole="button" onPress={() => router.push('/(tabs)/requests')}><Text style={[styles.link, { color: colors.primary }]}>View all</Text></Pressable>}
        />
        <Card style={styles.activityCard}>
          {recent.map((item, index) => (
            <View key={item.id} style={[styles.activityRow, index < recent.length - 1 ? { borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: 13 } : null]}>
              <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{item.name.slice(0, 1).toUpperCase()}</Text></View>
              <View style={styles.activityCopy}>
                <Text style={[styles.activityName, { color: colors.text }]}>{item.name}</Text>
                <Text numberOfLines={1} style={[styles.activityMeta, { color: colors.muted }]}>{item.category} · {item.id}</Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          ))}
          {recent.length === 0 ? <Text style={[styles.emptyText, { color: colors.muted }]}>{isDemo ? 'No demo requests yet.' : 'No visitor requests yet.'}</Text> : null}
        </Card>
      </View>

      <Pressable accessibilityRole="button" onPress={() => router.push('/assistant')} style={[styles.assistantLink, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.assistantIcon, { backgroundColor: colors.surfaceMuted }]}><Sparkles size={18} color={colors.primary} /></View>
        <View style={styles.assistantCopy}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>CampusSentry assistant</Text>
          <Text style={[styles.actionHint, { color: colors.muted }]}>Assistant service is not connected yet</Text>
        </View>
        <ChevronRight size={19} color={colors.muted} />
      </Pressable>
    </Page>
  );
}

function MetricCard({ label, value, detail, accent, icon: Icon }: { label: string; value: string; detail: string; accent: string; icon: typeof Users }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.metricCard, { backgroundColor: `${accent}10`, borderColor: `${accent}44` }]}>
      <View style={styles.metricTop}>
        <Text numberOfLines={2} style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
        <View style={[styles.metricIcon, { backgroundColor: accent }]}><Icon size={16} color="#FFFFFF" /></View>
      </View>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricDetail, { color: colors.muted }]}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 8, gap: 18 },
  dashboardHeading: { gap: 4 },
  dashboardTitle: { fontSize: 23, lineHeight: 29, fontWeight: '700', letterSpacing: -0.5 },
  dashboardSubtitle: { fontSize: 13, lineHeight: 18 },
  connectionStatus: { marginTop: -12, fontSize: 12, fontWeight: '600' },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandName: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  brandCaption: { marginTop: 2, fontSize: 12 },
  iconButton: { width: 44, height: 44, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  metricCard: { width: '48%', minHeight: 122, padding: 12, borderWidth: 1, borderRadius: 15, gap: 5, justifyContent: 'space-between' },
  metricTop: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  metricIcon: { width: 31, height: 31, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  metricValue: { fontSize: 26, lineHeight: 31, fontWeight: '700' },
  metricLabel: { flex: 1, fontSize: 11, lineHeight: 15, fontWeight: '600', textTransform: 'uppercase' },
  metricDetail: { fontSize: 10, lineHeight: 14 },
  sectionBlock: { gap: 12 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actionCard: { width: '48%', minHeight: 126, padding: 13, borderWidth: 1, borderRadius: 15, justifyContent: 'space-between' },
  actionIcon: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { fontSize: 14, fontWeight: '600' },
  actionHint: { fontSize: 11, lineHeight: 15 },
  pressed: { opacity: 0.78 },
  link: { fontSize: 13, fontWeight: '600' },
  activityCard: { paddingVertical: 14, gap: 13 },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  avatar: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontWeight: '700' },
  activityCopy: { flex: 1, gap: 4 },
  activityName: { fontSize: 14, fontWeight: '600' },
  activityMeta: { fontSize: 11 },
  emptyText: { fontSize: 13, paddingVertical: 8 },
  assistantLink: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderWidth: 1, borderRadius: 15 },
  assistantIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  assistantCopy: { flex: 1, gap: 4 },
});
