import { router } from 'expo-router';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, DemoBanner, IdentityBadge, Page, PrimaryButton, ScreenTitle, StatusBadge } from '@/components/ui';
import { useDemoData, VisitorRequest } from '@/providers/demo-data-provider';
import { useAppTheme } from '@/providers/theme-provider';

const filters = ['All', 'Needs review', 'Approved', 'Rejected', 'Cancelled', 'Expired'] as const;

export default function RequestsScreen() {
  const { colors } = useAppTheme();
  const { requests, isDemo, isLoading, loadError, refresh } = useDemoData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('All');

  const filtered = useMemo(() => requests.filter((request) => {
    const searchMatch = !query.trim() || [request.name, request.phone, request.id]
      .some((value) => value.toLowerCase().includes(query.trim().toLowerCase()));
    const statusMatch = filter === 'All'
      || (filter === 'Needs review' && ['Pending', 'Pending Verification', 'Pending Approval', 'Verification Required'].includes(request.status))
      || (filter === 'Approved' && ['Approved', 'Checked In', 'Checked Out'].includes(request.status))
      || request.status === filter;
    return searchMatch && statusMatch;
  }), [filter, query, requests]);

  return (
    <Page>
      <ScreenTitle title="Visitor requests" subtitle="Review request status and verification needs." />
      {isDemo ? <DemoBanner>Local demo queue · Not synced with campus servers</DemoBanner> : null}
      {loadError ? (
        <Card>
          <Text style={[styles.empty, { color: colors.critical }]}>{loadError}</Text>
          <PrimaryButton label="Retry loading requests" variant="secondary" onPress={() => void refresh()} />
        </Card>
      ) : null}
      {isLoading ? <Card><Text style={[styles.empty, { color: colors.muted }]}>Loading visitor requests…</Text></Card> : null}

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search requests"
          placeholder="Search name, phone or request ID"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text }]}
        />
        <SlidersHorizontal size={17} color={colors.muted} />
      </View>

      <View style={styles.filterRow}>
        {filters.map((item) => {
          const active = filter === item;
          return (
            <Pressable
              accessibilityRole="radio"
              key={item}
              accessibilityState={{ selected: active }}
              onPress={() => setFilter(item)}
              style={[styles.filterChip, { borderColor: active ? colors.primary : colors.border, backgroundColor: active ? `${colors.primary}16` : colors.surface }]}
            >
              <Text style={[styles.filterText, { color: active ? colors.primary : colors.muted }]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.resultCount, { color: colors.muted }]}>{filtered.length} {isDemo ? 'demo ' : ''}{filtered.length === 1 ? 'request' : 'requests'}</Text>
      {filtered.map((request) => <RequestCard key={request.id} request={request} />)}
      {!isLoading && !loadError && filtered.length === 0 ? (
        <Card><Text style={[styles.empty, { color: colors.muted }]}>No requests match your search.</Text></Card>
      ) : null}
    </Page>
  );
}

function RequestCard({ request }: { request: VisitorRequest }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${request.name}, ${request.status}`}
      onPress={() => router.push(`/request/${request.id}`)}
      style={({ pressed }) => [styles.cardPressable, pressed ? styles.pressed : null]}
    >
      <Card style={styles.requestCard}>
        <View style={styles.cardTop}>
          <View style={styles.personAvatar}><Text style={[styles.personInitial, { color: colors.primary }]}>{request.name.slice(0, 1)}</Text></View>
          <View style={styles.personCopy}>
            <Text style={[styles.personName, { color: colors.text }]}>{request.name}</Text>
            <Text style={[styles.personMeta, { color: colors.muted }]}>{request.category} · {request.id}</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.muted }]}>›</Text>
        </View>
        <View style={styles.badgeRow}>
          <StatusBadge status={request.status} />
          <IdentityBadge status={request.identity} />
        </View>
        <View style={[styles.details, { borderTopColor: colors.border }]}>
          <View style={styles.detailLine}><Text style={[styles.detailLabel, { color: colors.muted }]}>Meeting</Text><Text numberOfLines={1} style={[styles.detailValue, { color: colors.text }]}>{request.personToMeet}</Text></View>
          <View style={styles.detailLine}><Text style={[styles.detailLabel, { color: colors.muted }]}>Purpose</Text><Text numberOfLines={1} style={[styles.detailValue, { color: colors.text }]}>{request.purpose}</Text></View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  searchWrap: { minHeight: 50, paddingHorizontal: 13, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, paddingVertical: 9, fontSize: 14 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filterChip: { minHeight: 44, borderWidth: 1, borderRadius: 22, paddingHorizontal: 12, justifyContent: 'center' },
  filterText: { fontSize: 12, fontWeight: '600' },
  resultCount: { marginTop: -7, fontSize: 12, fontWeight: '500' },
  cardPressable: { borderRadius: 16 },
  pressed: { opacity: 0.78 },
  requestCard: { gap: 13 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personAvatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#2563EB18', alignItems: 'center', justifyContent: 'center' },
  personInitial: { fontSize: 17, fontWeight: '700' },
  personCopy: { flex: 1, gap: 4 },
  personName: { fontSize: 15, fontWeight: '700' },
  personMeta: { fontSize: 11 },
  chevron: { fontSize: 28, lineHeight: 30 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  details: { borderTopWidth: 1, paddingTop: 11, gap: 8 },
  detailLine: { flexDirection: 'row', gap: 10 },
  detailLabel: { width: 57, fontSize: 11 },
  detailValue: { flex: 1, fontSize: 12, fontWeight: '500' },
  empty: { fontSize: 14 },
});
