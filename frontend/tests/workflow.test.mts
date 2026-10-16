import test from 'node:test';
import assert from 'node:assert/strict';
import { canReviewRequest, canTransitionRequest, findUniqueIdentityNameMatch, getCustomDateRange, getHourlyEventCounts, getLocalDateRange, requiresDemoOtp } from '../src/lib/workflow.ts';

test('only open requests can be reviewed', () => {
  assert.equal(canReviewRequest('Pending Approval'), true);
  assert.equal(canReviewRequest('Additional Information Required'), true);
  assert.equal(canReviewRequest('Approved'), false);
  assert.equal(canReviewRequest('Rejected'), false);
  assert.equal(canReviewRequest('Cancelled'), false);
});

test('terminal request decisions cannot be reversed', () => {
  assert.equal(canTransitionRequest('Rejected', 'Approved'), false);
  assert.equal(canTransitionRequest('Approved', 'Rejected'), false);
  assert.equal(canTransitionRequest('Pending Approval', 'Rejected'), true);
  assert.equal(canTransitionRequest('Additional Information Required', 'Approved'), true);
  assert.equal(canTransitionRequest('Pending Approval', 'Pending Approval'), false);
});

test('custom local date ranges include both boundary days and reject invalid or reversed dates', () => {
  const range = getCustomDateRange('2026-10-10', '2026-10-12');
  assert.ok(range);
  assert.equal(range.start.getHours(), 0);
  assert.equal(range.end.getHours(), 23);
  assert.equal(range.end.getMilliseconds(), 999);
  assert.equal(getCustomDateRange('2026-02-30', '2026-03-01'), null);
  assert.equal(getCustomDateRange('2026-10-12', '2026-10-10'), null);
});

test('identity name matching links only a unique active match', () => {
  const identities = [
    { id: 'identity-1', name: 'Keshav', isArchived: false },
    { id: 'identity-2', name: 'Keshav', isArchived: false },
    { id: 'identity-3', name: 'Raj', isArchived: true },
  ];
  assert.equal(findUniqueIdentityNameMatch(identities, 'Keshav'), undefined);
  assert.equal(findUniqueIdentityNameMatch(identities, 'Raj'), undefined);
  assert.equal(findUniqueIdentityNameMatch(identities, ' keshav '), undefined);
  assert.equal(findUniqueIdentityNameMatch([identities[0]], ' keshav ')?.id, 'identity-1');
});

test('demo OTP requirement only applies to external guests when enabled', () => {
  assert.equal(requiresDemoOtp('Guest/External Visitor', true), true);
  assert.equal(requiresDemoOtp('Guest/External Visitor', false), false);
  assert.equal(requiresDemoOtp('Parent/Guardian', true), false);
});

test('local date ranges begin on Monday and hourly bins use event timestamps', () => {
  const now = new Date(2026, 9, 14, 12, 0, 0);
  const range = getLocalDateRange('week', now);
  assert.equal(range.start.getDay(), 1);
  const bins = getHourlyEventCounts([
    { timestamp: new Date(2026, 9, 14, 9, 15).toISOString(), eventType: 'Entry' },
    { timestamp: new Date(2026, 9, 14, 17, 45).toISOString(), eventType: 'Exit' },
    { timestamp: new Date(2026, 9, 4, 22, 0).toISOString(), eventType: 'Entry' },
  ], range);
  assert.equal(bins[9].entries, 1);
  assert.equal(bins[17].exits, 1);
  assert.equal(bins[22].entries, 0);
});
