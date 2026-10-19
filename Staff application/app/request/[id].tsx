import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card, DemoBanner, IdentityBadge, Page, PrimaryButton, ScreenTitle, StatusBadge } from '@/components/ui';
import { useDemoData } from '@/providers/demo-data-provider';
import { useAuth } from '@/providers/auth-provider';
import { useAppTheme } from '@/providers/theme-provider';

export default function RequestDetailScreen() {
  const { colors } = useAppTheme();
  const { mode, user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { requests, records, approveVisitor, rejectVisitor, isLoading, loadError, refresh } = useDemoData();
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [actionMessage, setActionMessage] = useState('');
  const [actionFailed, setActionFailed] = useState(false);
  const request = requests.find((item) => item.id === id);
  const record = records.find((item) => item.id === id);
  const canApprove = mode === 'authenticated' && user?.role === 'admin' && request?.status === 'Pending Approval';

  const updateApproval = async (decision: 'approve' | 'reject') => {
    if (!request) return;
    setAction(decision);
    setActionMessage('');
    setActionFailed(false);
    try {
      if (decision === 'approve') await approveVisitor(request.visitorId);
      else await rejectVisitor(request.visitorId);
      setActionMessage(decision === 'approve' ? 'Visitor request approved.' : 'Visitor request rejected.');
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'The approval action failed.');
      setActionFailed(true);
    } finally {
      setAction(null);
    }
  };

  return (
    <Page>
      <ScreenTitle title="Request details" subtitle="Visitor approval and verification status." back backFallback="/(tabs)/requests" />
      {mode !== 'authenticated' ? <DemoBanner>Demo request · Status is not from the live server</DemoBanner> : null}
      {loadError ? (
        <Card>
          <Text style={[styles.noticeText, { color: colors.critical }]}>{loadError}</Text>
          <PrimaryButton label="Retry loading request" variant="secondary" onPress={() => void refresh()} />
        </Card>
      ) : null}
      {isLoading ? <Card><Text style={[styles.detailValue, { color: colors.muted }]}>Loading visitor request…</Text></Card> : null}
      {!request ? (
        !isLoading && !loadError ? <Card><Text style={[styles.detailValue, { color: colors.muted }]}>{mode === 'authenticated' ? 'This visitor request was not returned by the backend.' : 'This request is not available in the local demo data.'}</Text></Card> : null
      ) : (
        <>
          <Card style={styles.personCard}>
            <View style={[styles.avatar, { backgroundColor: `${colors.primary}16` }]}><Text style={[styles.avatarText, { color: colors.primary }]}>{request.name.slice(0, 1)}</Text></View>
            <View style={styles.personCopy}>
              <Text style={[styles.personName, { color: colors.text }]}>{request.name}</Text>
              <Text style={[styles.detailValue, { color: colors.muted }]}>{request.id}</Text>
            </View>
            <StatusBadge status={request.status} />
          </Card>
          <Card style={styles.detailsCard}>
            <View style={[styles.identityRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>Identity</Text>
              <IdentityBadge status={request.identity} />
            </View>
            <Detail label="Phone" value={request.phone || 'Not provided'} />
            <Detail label="Category" value={request.category} />
            <Detail label="Purpose" value={request.purpose} />
            <Detail label="Meeting" value={request.personToMeet} />
            <Detail label="Department" value={request.department || 'Not provided'} />
            <Detail label="Appointment" value={request.appointmentDetails || 'Not provided'} />
            <Detail label="Submitted" value={formatDateTime(request.submittedAt)} />
            <Detail label="OTP status" value={request.otpStatus} />
          </Card>
          <Card style={styles.detailsCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Entry and exit history</Text>
            <Detail label="Presence" value={record?.presence || 'No record'} />
            <Detail label="Checked in" value={formatDateTime(record?.checkInTime)} />
            <Detail label="Checked out" value={formatDateTime(record?.checkOutTime)} />
          </Card>
          {request.status === 'Rejected' ? (
            <Card style={styles.notice}>
              <Text style={[styles.noticeText, { color: colors.muted }]}>{mode === 'authenticated'
                ? `This visitor request was rejected. Reason: ${request.rejectionReason || 'Not specified'}`
                : 'This sample request is rejected. The rejection reason is withheld in demo mode.'}</Text>
            </Card>
          ) : null}
          <Card style={styles.approvalCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Approval actions</Text>
            <Text style={[styles.noticeText, { color: colors.muted }]}>{mode === 'authenticated'
              ? user?.role === 'admin'
                ? 'The backend checks administrator permission before changing this request.'
                : 'Only an administrator can approve or reject visitor requests.'
              : 'Sign in with an authorized campus account to use server-side approvals.'}</Text>
            {actionMessage ? <Text accessibilityLiveRegion="polite" style={[styles.noticeText, { color: action ? colors.muted : actionFailed ? colors.critical : colors.info }]}>{actionMessage}</Text> : null}
            <View style={styles.actionRow}>
              <PrimaryButton label={action === 'approve' ? 'Approving…' : 'Approve'} disabled={!canApprove || action !== null} onPress={() => void updateApproval('approve')} style={styles.actionButton} />
              <PrimaryButton label={action === 'reject' ? 'Rejecting…' : 'Reject'} disabled={!canApprove || action !== null} variant="danger" onPress={() => void updateApproval('reject')} style={styles.actionButton} />
            </View>
          </Card>
          <Text style={[styles.footnote, { color: colors.muted }]}>Only administrators can approve or reject. The backend remains the authority for permissions.</Text>
        </>
      )}
    </Page>
  );
}

function formatDateTime(value?: string) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unavailable' : date.toLocaleString();
}

function Detail({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  personCard: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '700' },
  personCopy: { flex: 1, gap: 4 },
  personName: { fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  detailsCard: { paddingVertical: 5, gap: 0 },
  detailRow: { minHeight: 54, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  identityRow: { minHeight: 54, borderBottomWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailLabel: { width: 88, fontSize: 12 },
  detailValue: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: '500' },
  notice: { borderColor: '#D9770655' },
  approvalCard: { borderColor: '#D9770655' },
  noticeText: { fontSize: 13, lineHeight: 19 },
  footnote: { fontSize: 12, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 9 },
  actionButton: { flex: 1 },
});
