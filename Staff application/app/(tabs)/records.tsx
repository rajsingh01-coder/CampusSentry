import { ChevronDown, ChevronUp, Search } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, DemoBanner, IdentityBadge, Page, PrimaryButton, ScreenTitle, StatusBadge } from '@/components/ui';
import { useDemoData, VisitorCategory, VisitorRecord } from '@/providers/demo-data-provider';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

const statusFilters = ['All status', 'Needs review', 'Approved', 'Inside', 'Exited', 'Cancelled', 'Expired'] as const;
const categoryFilters: { label: string; value: VisitorCategory | 'All' }[] = [
  { label: 'All categories', value: 'All' },
  { label: 'Parent', value: 'Parent/Guardian' },
  { label: 'Guest', value: 'Guest' },
  { label: 'Vendor', value: 'Vendor' },
  { label: 'Other', value: 'Other' },
];

export default function RecordsScreen() {
  const { colors } = useAppTheme();
  const { mode, user } = useAuth();
  const { records, checkIn, checkOut, isDemo, isLoading, loadError, refresh } = useDemoData();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusFilters)[number]>('All status');
  const [categoryFilter, setCategoryFilter] = useState<VisitorCategory | 'All'>('All');
  const [dateFilter, setDateFilter] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isUpdatingEntry, setIsUpdatingEntry] = useState(false);
  const [expandedVisitorId, setExpandedVisitorId] = useState<string | null>(null);
  const validDateFilter = !dateFilter.trim() || isValidDate(dateFilter.trim());
  const filtered = useMemo(() => records.filter((record) => {
    const searchMatch = !query.trim() || [record.name, record.phone, record.visitorId, record.id]
      .some((value) => value.toLowerCase().includes(query.trim().toLowerCase()));
    const categoryMatch = categoryFilter === 'All' || record.category === categoryFilter;
    const statusMatch = statusFilter === 'All status'
      || (statusFilter === 'Needs review' && ['Pending', 'Pending Verification', 'Pending Approval', 'Verification Required'].includes(record.status))
      || (statusFilter === 'Approved' && ['Approved', 'Checked In', 'Checked Out'].includes(record.status))
      || (statusFilter === 'Inside' && record.presence === 'Inside Campus')
      || (statusFilter === 'Exited' && record.presence === 'Exited')
      || (statusFilter === 'Cancelled' && record.status === 'Cancelled')
      || (statusFilter === 'Expired' && record.status === 'Expired');
    const dateMatch = !dateFilter.trim()
      || (validDateFilter && record.submittedAt.slice(0, 10) === dateFilter.trim());
    return searchMatch && categoryMatch && statusMatch && dateMatch;
  }), [categoryFilter, dateFilter, query, records, statusFilter, validDateFilter]);
  const inside = records.filter((record) => record.presence === 'Inside Campus').length;
  const canOperateGate = isDemo || (mode === 'authenticated' && (user?.role === 'admin' || user?.role === 'security'));

  const performCheckIn = async (record: VisitorRecord) => {
    if (isUpdatingEntry) return;
    setIsUpdatingEntry(true);
    try {
      if (await checkIn(record.visitorId)) {
        setFeedback(isDemo ? `${record.name} is marked inside in this on-device demo only.` : `${record.name} was checked in successfully.`);
      } else {
        setFeedback('Check-in is unavailable. The visitor needs an Approved request and cannot already be inside.');
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Check-in failed.');
    } finally {
      setIsUpdatingEntry(false);
    }
  };
  const performCheckOut = async (record: VisitorRecord) => {
    if (isUpdatingEntry) return;
    setIsUpdatingEntry(true);
    try {
      if (await checkOut(record.visitorId)) {
        setFeedback(isDemo ? `${record.name} is marked as exited in this on-device demo only.` : `${record.name} was checked out successfully.`);
      } else {
        setFeedback('Check-out is unavailable. Only visitors currently marked inside can be checked out.');
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Check-out failed.');
    } finally {
      setIsUpdatingEntry(false);
    }
  };

  return (
    <Page>
      <ScreenTitle title="Visitor records" subtitle="Search visitors and review campus presence." />
      {isDemo ? <DemoBanner>Sample records · Check-in and check-out are local simulations</DemoBanner> : null}
      {loadError ? (
        <Card>
          <Text style={[styles.empty, { color: colors.critical }]}>{loadError}</Text>
          <PrimaryButton label="Retry loading records" variant="secondary" onPress={() => void refresh()} />
        </Card>
      ) : null}
      {isLoading ? <Card><Text style={[styles.empty, { color: colors.muted }]}>Loading visitor records…</Text></Card> : null}
      {feedback ? <Text accessibilityLiveRegion="polite" style={[styles.feedback, { color: colors.info }]}>{feedback}</Text> : null}

      <Card style={styles.occupancyCard}>
        <View style={[styles.occupancyIcon, { backgroundColor: `${colors.success}18` }]}><Text style={[styles.occupancyGlyph, { color: colors.success }]}>●</Text></View>
        <View style={styles.occupancyCopy}>
          <Text style={[styles.occupancyLabel, { color: colors.muted }]}>CURRENTLY INSIDE</Text>
          <Text style={[styles.occupancyValue, { color: colors.text }]}>{inside} <Text style={[styles.occupancyUnit, { color: colors.muted }]}>{isDemo ? 'demo visitors' : 'visitors inside'}</Text></Text>
        </View>
      </Card>

      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Search size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search visitor records"
          placeholder="Search name, phone or visitor ID"
          placeholderTextColor={colors.muted}
          value={query}
          onChangeText={setQuery}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      <View style={styles.filterGroup}>
        <Text style={[styles.filterHeading, { color: colors.text }]}>Status</Text>
        <View style={styles.filterRow}>
          {statusFilters.map((item) => {
            const selected = statusFilter === item;
            return (
              <Pressable accessibilityRole="radio" accessibilityState={{ selected }} key={item} onPress={() => setStatusFilter(item)} style={[styles.filterChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}16` : colors.surface }]}>
                <Text style={[styles.filterText, { color: selected ? colors.primary : colors.muted }]}>{item}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.filterGroup}>
        <Text style={[styles.filterHeading, { color: colors.text }]}>Category</Text>
        <View style={styles.filterRow}>
          {categoryFilters.map(({ label, value }) => {
            const selected = categoryFilter === value;
            return (
              <Pressable accessibilityRole="radio" accessibilityState={{ selected }} key={value} onPress={() => setCategoryFilter(value)} style={[styles.filterChip, { borderColor: selected ? colors.primary : colors.border, backgroundColor: selected ? `${colors.primary}16` : colors.surface }]}>
                <Text style={[styles.filterText, { color: selected ? colors.primary : colors.muted }]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.dateFilter, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.dateLabel, { color: colors.muted }]}>Date</Text>
        <TextInput
          accessibilityLabel="Filter visitor records by date"
          keyboardType="numbers-and-punctuation"
          maxLength={10}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.muted}
          value={dateFilter}
          onChangeText={setDateFilter}
          style={[styles.dateInput, { color: colors.text }]}
        />
        {dateFilter ? <Pressable accessibilityRole="button" accessibilityLabel="Clear date filter" onPress={() => setDateFilter('')} style={styles.clearButton}><Text style={[styles.clearDate, { color: colors.primary }]}>Clear</Text></Pressable> : null}
      </View>
      {!validDateFilter ? (
        <Text accessibilityLiveRegion="polite" style={[styles.dateError, { color: colors.critical }]}>
          Enter a real date in YYYY-MM-DD format.
        </Text>
      ) : null}

      <Text style={[styles.resultCount, { color: colors.muted }]}>{filtered.length} records</Text>
      {filtered.map((record) => (
        <Card key={record.visitorId} style={styles.recordCard}>
          <View style={styles.cardTop}>
            <View style={[styles.avatar, { backgroundColor: colors.surfaceMuted }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{record.name.slice(0, 1)}</Text></View>
            <View style={styles.personCopy}>
              <Text style={[styles.personName, { color: colors.text }]}>{record.name}</Text>
              <Text style={[styles.personMeta, { color: colors.muted }]}>{record.phone} · {record.category}</Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <StatusBadge status={record.status} />
            <Text style={[styles.presence, { color: record.presence === 'Inside Campus' ? colors.success : colors.muted }]}>{record.presence}</Text>
          </View>
          <IdentityBadge status={record.identity} />
          <View style={[styles.metaRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.metaLabel, { color: colors.muted }]}>Visitor ID</Text>
            <Text style={[styles.metaValue, { color: colors.text }]}>{record.visitorId}</Text>
          </View>
          <View style={styles.buttonRow}>
            <Pressable
              accessibilityRole="button"
              disabled={isUpdatingEntry || !canOperateGate || record.presence === 'Inside Campus' || !['Approved', 'Checked Out'].includes(record.status)}
              onPress={() => void performCheckIn(record)}
              style={[styles.smallButton, { borderColor: colors.primary, backgroundColor: `${colors.primary}12` }, (isUpdatingEntry || !canOperateGate || record.presence === 'Inside Campus' || !['Approved', 'Checked Out'].includes(record.status)) && styles.disabled]}
            >
              <Text style={[styles.smallButtonText, { color: colors.primary }]}>{isUpdatingEntry ? 'Saving…' : 'Check in'}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={isUpdatingEntry || !canOperateGate || record.presence !== 'Inside Campus'}
              onPress={() => void performCheckOut(record)}
              style={[styles.smallButton, { borderColor: colors.border, backgroundColor: colors.surface }, (isUpdatingEntry || !canOperateGate || record.presence !== 'Inside Campus') && styles.disabled]}
            >
              <Text style={[styles.smallButtonText, { color: colors.text }]}>Check out</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: expandedVisitorId === record.visitorId }}
            accessibilityLabel={`${expandedVisitorId === record.visitorId ? 'Hide' : 'Show'} ${record.name} registration and entry history`}
            onPress={() => setExpandedVisitorId((current) => current === record.visitorId ? null : record.visitorId)}
            style={[styles.detailsToggle, { borderTopColor: colors.border }]}
          >
            <Text style={[styles.detailsToggleText, { color: colors.primary }]}>
              {expandedVisitorId === record.visitorId ? 'Hide full record' : 'View full record'}
            </Text>
            {expandedVisitorId === record.visitorId
              ? <ChevronUp size={17} color={colors.primary} />
              : <ChevronDown size={17} color={colors.primary} />}
          </Pressable>
          {expandedVisitorId === record.visitorId ? (
            <View style={[styles.fullDetails, { borderTopColor: colors.border }]}>
              <RecordDetail label="Request ID" value={record.id} />
              <RecordDetail label="Purpose" value={record.purpose} />
              <RecordDetail label="Meeting" value={record.personToMeet} />
              <RecordDetail label="Appointment" value={record.appointmentDetails || 'Not provided'} />
              <RecordDetail label="OTP status" value={record.otpStatus} />
              <RecordDetail label="Submitted" value={formatDateTime(record.submittedAt)} />
              <RecordDetail label="Checked in" value={formatDateTime(record.checkInTime)} />
              <RecordDetail label="Checked out" value={formatDateTime(record.checkOutTime)} />
            </View>
          ) : null}
        </Card>
      ))}
      {!isLoading && !loadError && filtered.length === 0 ? <Card><Text style={[styles.empty, { color: colors.muted }]}>No visitor records match this search.</Text></Card> : null}
    </Page>
  );
}

function RecordDetail({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.fullDetailRow}>
      <Text style={[styles.fullDetailLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.fullDetailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function formatDateTime(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString();
}

const styles = StyleSheet.create({
  occupancyCard: { flexDirection: 'row', alignItems: 'center', gap: 13 },
  occupancyIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  occupancyGlyph: { fontSize: 15 },
  occupancyCopy: { gap: 4 },
  occupancyLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  occupancyValue: { fontSize: 24, fontWeight: '700' },
  occupancyUnit: { fontSize: 12, fontWeight: '500' },
  searchWrap: { minHeight: 50, paddingHorizontal: 13, borderWidth: 1, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, paddingVertical: 9, fontSize: 14 },
  filterGroup: { gap: 8 },
  filterHeading: { fontSize: 13, fontWeight: '600' },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  filterChip: { minHeight: 44, borderWidth: 1, borderRadius: 22, paddingHorizontal: 10, justifyContent: 'center' },
  filterText: { fontSize: 11, fontWeight: '600' },
  dateFilter: { minHeight: 46, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateLabel: { fontSize: 12, fontWeight: '600' },
  dateInput: { flex: 1, minHeight: 42, fontSize: 13 },
  dateError: { marginTop: -10, fontSize: 12, lineHeight: 17 },
  clearDate: { fontSize: 12, fontWeight: '600' },
  clearButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  resultCount: { marginTop: -8, fontSize: 12 },
  recordCard: { gap: 13 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 17, fontWeight: '700' },
  personCopy: { flex: 1, gap: 4 },
  personName: { fontSize: 15, fontWeight: '700' },
  personMeta: { fontSize: 11 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  presence: { fontSize: 12, fontWeight: '500' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 10 },
  metaLabel: { fontSize: 11 },
  metaValue: { fontSize: 11, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: 8 },
  smallButton: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 11, borderWidth: 1 },
  smallButtonText: { fontSize: 13, fontWeight: '600' },
  detailsToggle: { minHeight: 44, borderTopWidth: 1, paddingTop: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  detailsToggleText: { fontSize: 13, fontWeight: '600' },
  fullDetails: { borderTopWidth: 1, paddingTop: 10, gap: 10 },
  fullDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  fullDetailLabel: { width: 84, fontSize: 12 },
  fullDetailValue: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '500' },
  disabled: { opacity: 0.45 },
  empty: { fontSize: 14 },
  feedback: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
});
