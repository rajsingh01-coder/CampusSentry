import { router } from 'expo-router';
import { Bell, ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card, DemoBanner, Page, ScreenTitle, StatusBadge } from '@/components/ui';
import { useDemoData } from '@/providers/demo-data-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function NotificationsScreen() {
  const { colors } = useAppTheme();
  const { requests, isDemo, isLoading, loadError, refresh } = useDemoData();
  const [readIds, setReadIds] = useState<string[]>([]);

  return (
    <Page>
      <ScreenTitle title="Notifications" subtitle={isDemo ? 'Request status updates for the staff demo.' : 'Recent visitor request status.'} back />
      {isDemo ? <DemoBanner>Sample notifications · Push delivery is not configured</DemoBanner> : null}
      {loadError ? (
        <Card>
          <Text style={[styles.message, { color: colors.critical }]}>{loadError}</Text>
          <Pressable accessibilityRole="button" onPress={() => void refresh()}><Text style={[styles.message, { color: colors.primary }]}>Retry loading</Text></Pressable>
        </Card>
      ) : null}
      {isLoading ? <Card><Text style={[styles.message, { color: colors.muted }]}>Loading visitor updates…</Text></Card> : null}
      {requests.slice(0, 4).map((request) => {
        const isRead = readIds.includes(request.id);
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${request.name} request notification`}
            key={request.id}
            onPress={() => {
              setReadIds((current) => current.includes(request.id) ? current : [...current, request.id]);
              router.push(`/request/${request.id}`);
            }}
          >
            <Card style={styles.notificationCard}>
              <View style={[styles.iconWrap, { backgroundColor: isRead ? colors.surfaceMuted : `${colors.primary}16` }]}>
                <Bell size={18} color={isRead ? colors.muted : colors.primary} />
              </View>
              <View style={styles.copy}>
                <View style={styles.titleRow}>
                  <Text style={[styles.title, { color: colors.text }]}>{request.name}</Text>
                  {!isRead ? <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} /> : null}
                </View>
                <Text style={[styles.message, { color: colors.muted }]}>Request status: {request.status} · {request.id}</Text>
                <StatusBadge status={request.status} />
              </View>
              <ChevronRight size={18} color={colors.muted} />
            </Card>
          </Pressable>
        );
      })}
      {!isLoading && !loadError && requests.length === 0 ? (
        <Card><Text style={[styles.message, { color: colors.muted }]}>There are no visitor updates to show.</Text></Card>
      ) : null}
      <Text style={[styles.note, { color: colors.muted }]}>{isDemo
        ? 'These entries are derived from the local demo request list. No push notifications or live status updates are received.'
        : 'These updates are derived from backend visitor records. Push notifications are not configured.'}</Text>
    </Page>
  );
}

const styles = StyleSheet.create({
  notificationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  iconWrap: { width: 39, height: 39, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  copy: { flex: 1, gap: 9 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontSize: 14, fontWeight: '700' },
  unreadDot: { width: 7, height: 7, borderRadius: 5 },
  message: { fontSize: 12, lineHeight: 18 },
  note: { fontSize: 12, lineHeight: 18 },
});
