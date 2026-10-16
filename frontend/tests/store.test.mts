import assert from 'node:assert/strict';
import test, { beforeEach } from 'node:test';
import { useDemoStore } from '../src/store/demo-store.ts';
import { apiClient } from '../src/services/api-client.ts';
import { serializeCsv } from '../src/lib/utils.ts';

const store = useDemoStore;

function submitRequest(visitorName = 'Test Visitor', visitorCategory: 'Parent/Guardian' | 'Guest/External Visitor' = 'Parent/Guardian') {
  return store.getState().simulateIncomingStaffRequest({
    visitorName,
    phoneNumber: '000-000-0000',
    visitorCategory,
    identityClassification: 'Unknown',
    personToMeet: 'Principal/Director',
    department: 'Office',
    reasonForMeeting: 'Test visit',
    visitMode: 'Walk-in',
    requestedDate: '2026-10-16',
    requestedTime: 'Now',
    submittingStaffId: store.getState().currentUser.staffId,
    gateOrLocation: 'Main Gate 1',
  });
}

beforeEach(() => store.getState().resetDemoData());

test('request submission, approval, linked views, and repeated decisions stay consistent', () => {
  const requestId = submitRequest();
  const submitted = store.getState();
  const request = submitted.visitorRequests.find((item) => item.requestId === requestId)!;
  const record = submitted.visitorRecords.find((item) => item.visitorId === request.visitorId)!;
  const notification = submitted.notifications.find((item) => item.requestId === requestId)!;
  assert.equal(request.requestStatus, 'Pending Approval');
  assert.equal(record.requestStatus, 'Pending Approval');
  assert.equal(notification.requestStatus, 'Pending Approval');
  assert.equal(notification.isRead, false);
  assert.equal(record.currentPresence, 'Not Checked In');

  const auditCount = submitted.auditLogs.length;
  store.getState().approveRequest(requestId, 'Reviewed at gate');
  const approved = store.getState();
  assert.equal(approved.visitorRequests.find((item) => item.requestId === requestId)?.requestStatus, 'Approved');
  assert.equal(approved.visitorRecords.find((item) => item.visitorId === request.visitorId)?.requestStatus, 'Approved');
  assert.equal(approved.notifications.find((item) => item.requestId === requestId)?.requestStatus, 'Approved');
  assert.equal(approved.visitorRecords.find((item) => item.visitorId === request.visitorId)?.currentPresence, 'Not Checked In');
  assert.equal(approved.auditLogs.length, auditCount + 1);

  store.getState().approveRequest(requestId);
  store.getState().rejectRequest(requestId, 'Contradictory decision');
  assert.equal(store.getState().auditLogs.length, auditCount + 1);
  assert.equal(store.getState().visitorRequests.find((item) => item.requestId === requestId)?.reviewHistory.length, request.reviewHistory.length + 1);
});

test('rejection and information requests require notes and cannot be repeated as duplicate events', () => {
  const requestId = submitRequest();
  const request = store.getState().visitorRequests.find((item) => item.requestId === requestId)!;
  const baseline = store.getState();
  store.getState().rejectRequest(requestId, '   ');
  assert.equal(store.getState().auditLogs.length, baseline.auditLogs.length);
  store.getState().requestMoreInfo(requestId, '  Please provide the host office.  ');
  const informationRequested = store.getState();
  assert.equal(informationRequested.visitorRequests.find((item) => item.requestId === requestId)?.adminNotes, 'Please provide the host office.');
  assert.equal(informationRequested.visitorRecords.find((item) => item.visitorId === request.visitorId)?.requestStatus, 'Additional Information Required');
  assert.equal(informationRequested.notifications.find((item) => item.requestId === requestId)?.requestStatus, 'Additional Information Required');

  store.getState().markRequestPending(requestId, 'Review resumed');
  const returnedToPending = store.getState();
  const nextHistoryLength = returnedToPending.visitorRequests.find((item) => item.requestId === requestId)!.reviewHistory.length;
  const nextAuditLength = returnedToPending.auditLogs.length;
  store.getState().markRequestPending(requestId, 'Duplicate');
  assert.equal(store.getState().visitorRequests.find((item) => item.requestId === requestId)?.reviewHistory.length, nextHistoryLength);
  assert.equal(store.getState().auditLogs.length, nextAuditLength);

  store.getState().rejectRequest(requestId, '  Not approved  ');
  const rejected = store.getState();
  assert.equal(rejected.visitorRequests.find((item) => item.requestId === requestId)?.rejectionReason, 'Not approved');
  assert.equal(rejected.visitorRecords.find((item) => item.visitorId === request.visitorId)?.requestStatus, 'Rejected');
  assert.equal(rejected.notifications.find((item) => item.requestId === requestId)?.requestStatus, 'Rejected');
  store.getState().requestMoreInfo(requestId, 'Contradictory');
  assert.equal(store.getState().visitorRequests.find((item) => item.requestId === requestId)?.requestStatus, 'Rejected');
});

test('OTP failure stays pending and successful retry updates every linked view once', () => {
  const requestId = submitRequest('External Guest', 'Guest/External Visitor');
  const request = store.getState().visitorRequests.find((item) => item.requestId === requestId)!;
  assert.equal(request.requestStatus, 'Pending Verification');
  assert.equal(request.otpVerificationStatus, 'Pending');
  store.getState().approveRequest(requestId);
  assert.equal(store.getState().visitorRequests.find((item) => item.requestId === requestId)?.requestStatus, 'Pending Verification');

  const beforeFailure = store.getState().auditLogs.length;
  store.getState().failDemoOtpVerification(requestId);
  const failed = store.getState();
  assert.equal(failed.visitorRequests.find((item) => item.requestId === requestId)?.requestStatus, 'Pending Verification');
  assert.equal(failed.visitorRequests.find((item) => item.requestId === requestId)?.otpVerificationStatus, 'Failed');
  assert.equal(failed.visitorRecords.find((item) => item.visitorId === request.visitorId)?.otpStatus, 'Failed');
  assert.equal(failed.notifications.find((item) => item.requestId === requestId)?.otpStatus, 'Failed');
  assert.equal(failed.auditLogs.length, beforeFailure + 1);
  store.getState().failDemoOtpVerification(requestId);
  assert.equal(store.getState().auditLogs.length, beforeFailure + 1);

  store.getState().completeDemoOtpVerification(requestId);
  const verified = store.getState();
  assert.equal(verified.visitorRequests.find((item) => item.requestId === requestId)?.requestStatus, 'Pending Approval');
  assert.equal(verified.visitorRequests.find((item) => item.requestId === requestId)?.otpVerificationStatus, 'Verified');
  assert.equal(verified.visitorRecords.find((item) => item.visitorId === request.visitorId)?.otpStatus, 'Verified');
  assert.equal(verified.notifications.find((item) => item.requestId === requestId)?.otpStatus, 'Verified');
  const auditCount = verified.auditLogs.length;
  store.getState().completeDemoOtpVerification(requestId);
  assert.equal(store.getState().auditLogs.length, auditCount);
});

test('identity classification uses stable IDs, preserves decision state, and supports archive/restore', () => {
  const linkedRequestId = submitRequest('Keshav');
  const linkedRequest = store.getState().visitorRequests.find((item) => item.requestId === linkedRequestId)!;
  const identityId = linkedRequest.associatedIdentityRecordId!;
  store.getState().updateIdentityClassification(identityId, 'Verification Required', '  ID checked  ');
  const changed = store.getState();
  assert.equal(changed.visitorRequests.find((item) => item.requestId === linkedRequestId)?.identityClassification, 'Verification Required');
  assert.equal(changed.visitorRecords.find((item) => item.visitorId === linkedRequest.visitorId)?.identityClassification, 'Verification Required');
  assert.equal(changed.notifications.find((item) => item.requestId === linkedRequestId)?.identityClassification, 'Verification Required');
  assert.equal(changed.visitorRequests.find((item) => item.requestId === linkedRequestId)?.requestStatus, 'Pending Approval');
  assert.equal(changed.knownIdentities.find((item) => item.id === identityId)?.classificationHistory.at(-1)?.reason, 'ID checked');

  store.getState().archiveKnownIdentity(identityId);
  assert.equal(store.getState().knownIdentities.find((item) => item.id === identityId)?.isArchived, true);
  store.getState().restoreKnownIdentity(identityId);
  assert.equal(store.getState().knownIdentities.find((item) => item.id === identityId)?.isArchived, false);
  assert.equal(store.getState().visitorRequests.find((item) => item.requestId === linkedRequestId)?.associatedIdentityRecordId, identityId);

  store.getState().addKnownIdentity('Keshav', 'Student');
  const ambiguousRequestId = submitRequest('Keshav');
  assert.equal(store.getState().visitorRequests.find((item) => item.requestId === ambiguousRequestId)?.associatedIdentityRecordId, undefined);
});

test('registry-only reset preserves visitor workflows while full reset restores five canonical identities', () => {
  const requestId = submitRequest('Someone New');
  store.getState().addKnownIdentity('Temporary Identity', 'Other');
  store.getState().resetIdentityRegistry();
  assert.equal(store.getState().knownIdentities.length, 5);
  assert.ok(store.getState().visitorRequests.some((item) => item.requestId === requestId));

  store.getState().addKnownIdentity('Temporary Identity', 'Other');
  store.getState().resetDemoData();
  assert.deepEqual(store.getState().knownIdentities.map((identity) => identity.name).sort(), ['Aditi', 'Keshav', 'Praveen', 'Raj', 'Supriya']);
  assert.equal(store.getState().knownIdentities.length, 5);
  assert.equal(store.getState().visitorRequests.some((item) => item.requestId === requestId), false);
});

test('record edits cannot bypass request state or presence guards and remain linked by visitor ID', () => {
  const requestId = submitRequest();
  const request = store.getState().visitorRequests.find((item) => item.requestId === requestId)!;
  const record = store.getState().visitorRecords.find((item) => item.visitorId === request.visitorId)!;
  store.getState().updateVisitorRecord(record.visitorId, {
    visitorName: '  Corrected Name  ',
    purpose: 'Updated purpose',
    visitMode: 'Scheduled',
    requestedDateTime: '2026-10-20T14:30',
    gateLocation: 'Main Gate 2',
    requestStatus: 'Approved',
    currentPresence: 'Inside Campus',
    isArchived: true,
  } as never);
  const edited = store.getState();
  assert.equal(edited.visitorRecords.find((item) => item.visitorId === record.visitorId)?.visitorName, 'Corrected Name');
  assert.equal(edited.visitorRequests.find((item) => item.requestId === requestId)?.visitorName, 'Corrected Name');
  assert.equal(edited.notifications.find((item) => item.requestId === requestId)?.visitorName, 'Corrected Name');
  assert.equal(edited.visitorRequests.find((item) => item.requestId === requestId)?.visitMode, 'Scheduled');
  assert.equal(edited.visitorRequests.find((item) => item.requestId === requestId)?.requestedTime, '14:30');
  assert.equal(edited.notifications.find((item) => item.requestId === requestId)?.gateLocation, 'Main Gate 2');
  assert.equal(edited.visitorRecords.find((item) => item.visitorId === record.visitorId)?.requestStatus, 'Pending Approval');
  assert.equal(edited.visitorRecords.find((item) => item.visitorId === record.visitorId)?.currentPresence, 'Not Checked In');
  assert.equal(edited.visitorRecords.find((item) => item.visitorId === record.visitorId)?.isArchived, false);
  const auditCount = edited.auditLogs.length;
  store.getState().approveRequest(requestId);
  store.getState().recordCheckIn(record.visitorId, 'Main Gate 1', 'Demo Security');
  store.getState().recordCheckIn(record.visitorId, 'Main Gate 1', 'Demo Security');
  const checkedIn = store.getState();
  assert.equal(checkedIn.visitorRecords.find((item) => item.visitorId === record.visitorId)?.currentPresence, 'Inside Campus');
  assert.equal(checkedIn.entryExitLogs.filter((item) => item.visitorId === record.visitorId && item.eventType === 'Entry').length, 1);
  assert.equal(checkedIn.entryExitLogs[0].relatedRequestId, requestId);
  assert.equal(checkedIn.auditLogs.length, auditCount + 2);

  store.getState().archiveVisitorRecord(record.visitorId);
  assert.equal(store.getState().visitorRecords.find((item) => item.visitorId === record.visitorId)?.isArchived, false);
  store.getState().recordCheckOut(record.visitorId, 'Main Gate 1', 'Demo Security');
  store.getState().recordCheckOut(record.visitorId, 'Main Gate 1', 'Demo Security');
  assert.equal(store.getState().visitorRecords.find((item) => item.visitorId === record.visitorId)?.currentPresence, 'Exited');
  assert.equal(store.getState().entryExitLogs.filter((item) => item.visitorId === record.visitorId && item.eventType === 'Exit').length, 1);
  store.getState().recordCheckIn(record.visitorId, 'Main Gate 2', 'Demo Security');
  assert.equal(store.getState().visitorRecords.find((item) => item.visitorId === record.visitorId)?.currentPresence, 'Inside Campus');
});

test('notification archive/read behavior keeps badges and unread archive state consistent', () => {
  const requestId = submitRequest();
  const notification = store.getState().notifications.find((item) => item.requestId === requestId)!;
  store.getState().archiveNotification(notification.id);
  const archived = store.getState().notifications.find((item) => item.id === notification.id)!;
  assert.equal(archived.isArchived, true);
  assert.equal(archived.isRead, false);
  const auditCount = store.getState().auditLogs.length;
  store.getState().markAllNotificationsAsRead();
  assert.equal(store.getState().notifications.find((item) => item.id === notification.id)?.isRead, false);
  store.getState().archiveNotification(notification.id);
  assert.equal(store.getState().auditLogs.length, auditCount);
});

test('role selection and configured OTP, unknown review, and walk-in rules change demo behavior', () => {
  store.getState().setDemoRole('security');
  assert.equal(store.getState().currentUser.role, 'Security/Staff');
  store.getState().setDemoRole('admin');
  assert.equal(store.getState().currentUser.role, 'Admin');
  store.getState().updateSettings({ requireOtpForGuests: false, autoFlagUnknownVisitors: true, enableWalkInDirectReview: true });
  const requestId = submitRequest('Guest Without OTP', 'Guest/External Visitor');
  const state = store.getState();
  const request = state.visitorRequests.find((item) => item.requestId === requestId)!;
  const notification = state.notifications.find((item) => item.requestId === requestId)!;
  assert.equal(request.requestStatus, 'Pending Approval');
  assert.equal(request.otpVerificationStatus, 'Not Applicable');
  assert.equal(notification.priority, 'Urgent');
  assert.ok(state.securityAlerts.some((alert) => alert.relatedRequestId === requestId));
});

test('staff updates prevent duplicate email accounts and keep the active user in sync', () => {
  const initialUsers = store.getState().staffUsers;
  const active = store.getState().currentUser;
  const existingEmail = initialUsers.find((user) => user.staffId !== active.staffId)!.email;
  const auditCount = store.getState().auditLogs.length;
  store.getState().addStaffUser({
    name: 'Duplicate Email', email: existingEmail, department: 'Security', role: 'Security/Staff',
    status: 'Active', assignedGate: 'Main Gate 2',
  });
  assert.equal(store.getState().staffUsers.length, initialUsers.length);
  assert.equal(store.getState().auditLogs.length, auditCount);

  store.getState().updateStaffUser(active.staffId, { name: 'Updated Admin', role: 'Supervisor' });
  assert.equal(store.getState().currentUser.name, 'Updated Admin');
  assert.equal(store.getState().currentUser.role, 'Supervisor');
  store.getState().updateStaffUser(active.staffId, { staffId: 'FORGED-ID', submittedRequestsCount: 999 } as never);
  assert.equal(store.getState().currentUser.staffId, active.staffId);
  assert.equal(store.getState().staffUsers.some((user) => user.staffId === 'FORGED-ID'), false);
});

test('security alert and recognition review actions require meaningful unique transitions', () => {
  const alert = store.getState().securityAlerts[0];
  const auditCount = store.getState().auditLogs.length;
  store.getState().updateSecurityAlertStatus(alert.id, 'Resolved');
  assert.equal(store.getState().securityAlerts.find((item) => item.id === alert.id)?.status, alert.status);
  store.getState().updateSecurityAlertStatus(alert.id, 'Under Review', 'Checked in the demo review queue.');
  const afterStatus = store.getState();
  assert.equal(afterStatus.securityAlerts.find((item) => item.id === alert.id)?.status, 'Under Review');
  const changedAuditCount = afterStatus.auditLogs.length;
  store.getState().updateSecurityAlertStatus(alert.id, 'Under Review', 'Checked in the demo review queue.');
  assert.equal(store.getState().auditLogs.length, changedAuditCount);
  assert.equal(changedAuditCount, auditCount + 1);

  const event = store.getState().recognitionEvents.find((item) => item.reviewerStatus !== 'Reviewed')!;
  store.getState().reviewAIRecognitionEvent(event.id, 'Known');
  assert.equal(store.getState().recognitionEvents.find((item) => item.id === event.id)?.reviewerStatus, event.reviewerStatus);
  store.getState().reviewAIRecognitionEvent(event.id, 'Known', 'Manual demo review completed.');
  const reviewedAuditCount = store.getState().auditLogs.length;
  assert.equal(store.getState().recognitionEvents.find((item) => item.id === event.id)?.reviewerStatus, 'Reviewed');
  store.getState().reviewAIRecognitionEvent(event.id, 'Unknown', 'Duplicate review.');
  assert.equal(store.getState().auditLogs.length, reviewedAuditCount);
});

test('service adapters apply declared filters and direct visitor creation creates a reviewable linked request', async () => {
  const beforeCount = store.getState().visitorRequests.length;
  await apiClient.records.createRecord({
    visitorName: 'API Created Visitor', phoneNumber: '000', visitorCategory: 'Parent/Guardian',
    identityClassification: 'Unknown', purpose: 'Service test', personToMeet: 'Principal/Director',
    requestedDateTime: '2026-10-16T10:30:00', registeredAt: new Date().toISOString(), otpStatus: 'Verified',
    requestStatus: 'Approved', currentPresence: 'Inside Campus', associatedStaffName: 'Demo Staff',
    gateLocation: 'Main Gate 1', isArchived: false,
  });
  const current = store.getState();
  assert.equal(current.visitorRequests.length, beforeCount + 1);
  const createdRecord = current.visitorRecords.find((item) => item.visitorName === 'API Created Visitor')!;
  const createdRequest = current.visitorRequests.find((item) => item.visitorId === createdRecord.visitorId)!;
  assert.equal(createdRequest.requestStatus, 'Pending Approval');
  assert.equal(createdRecord.currentPresence, 'Not Checked In');
  assert.ok(current.notifications.some((item) => item.requestId === createdRequest.requestId));
  assert.equal((await apiClient.requests.getRequests({ query: 'API Created', status: 'Pending Approval' })).length, 1);
  assert.equal((await apiClient.identities.getIdentityById('KID-001'))?.name, 'Keshav');
  assert.equal((await apiClient.identities.getIdentities({ query: 'no matching identity' })).length, 0);
  assert.ok(apiClient.security.getAlerts);
});

test('CSV serialization quotes commas, quotes, line breaks, and empty fields', () => {
  assert.equal(
    serializeCsv(['Name', 'Notes', 'Blank'], [['Visitor, One', 'Said "hello"\r\nthen left', null]]),
    '"Name","Notes","Blank"\r\n"Visitor, One","Said ""hello""\r\nthen left",""',
  );
});
