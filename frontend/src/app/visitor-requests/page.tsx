'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';
import { VisitorRequest, RequestStatus, VisitorCategory, IdentityClassification } from '@/types';
import {
  RequestStatusBadge,
  IdentityClassificationBadge,
  VisitorCategoryBadge,
  OtpStatusBadge,
} from '@/components/shared/badge-status';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatDateTime, exportToCsv } from '@/lib/utils';
import { canReviewRequest, canTransitionRequest } from '@/lib/workflow';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  Building,
  Sparkles,
  ArrowUpDown,
  History,
  FileText,
  ExternalLink,
  X,
} from 'lucide-react';

function VisitorRequestsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlId = searchParams.get('id');
  const urlStatus = searchParams.get('status');
  const urlQuery = searchParams.get('q');

  const {
    visitorRequests,
    approveRequest,
    rejectRequest,
    requestMoreInfo,
    markRequestPending,
    completeDemoOtpVerification,
    failDemoOtpVerification,
    settings,
    setSimulationModalOpen,
  } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState(urlQuery || '');
  const [statusFilter, setStatusFilter] = useState(urlStatus || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [recipientFilter, setRecipientFilter] = useState('all');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(urlId || null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Confirm Dialog States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'approve' | 'reject' | 'info' | 'pending';
    requestId: string;
    visitorName: string;
  }>({
    isOpen: false,
    type: 'approve',
    requestId: '',
    visitorName: '',
  });

  // Filtered dataset
  const filteredRequests = useMemo(() => {
    return visitorRequests.filter((req) => {
      if (statusFilter !== 'all' && req.requestStatus !== statusFilter) return false;
      if (categoryFilter !== 'all' && req.visitorCategory !== categoryFilter) return false;
      if (classificationFilter !== 'all' && req.identityClassification !== classificationFilter) return false;
      if (recipientFilter !== 'all' && req.personToMeet !== recipientFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          req.visitorName.toLowerCase().includes(q) ||
          req.requestId.toLowerCase().includes(q) ||
          (req.phoneNumber && req.phoneNumber.toLowerCase().includes(q)) ||
          req.personToMeet.toLowerCase().includes(q) ||
          req.reasonForMeeting.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [visitorRequests, statusFilter, categoryFilter, classificationFilter, recipientFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;
  const paginatedRequests = filteredRequests.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const activeRequest = useMemo(() => {
    if (!selectedRequestId) return null;
    return visitorRequests.find((r) => r.requestId === selectedRequestId) || null;
  }, [visitorRequests, selectedRequestId]);

  const handleExportCsv = () => {
    const headers = [
      'Request ID',
      'Visitor Name',
      'Phone Number',
      'Visitor Category',
      'Identity Classification',
      'Person To Meet',
      'Department',
      'Reason For Meeting',
      'Visit Mode',
      'Requested Date',
      'Requested Time',
      'Status',
      'Gate Location',
      'Submitting Staff',
      'Submission Timestamp',
      'OTP Status',
    ];

    const rows = filteredRequests.map((r) => [
      r.requestId,
      r.visitorName,
      r.phoneNumber || 'Not provided',
      r.visitorCategory,
      r.identityClassification,
      r.personToMeet,
      r.department || 'Not specified',
      r.reasonForMeeting,
      r.visitMode,
      r.requestedDate,
      r.requestedTime,
      r.requestStatus,
      r.gateOrLocation,
      r.submittedByStaffName,
      r.submittedAt,
      r.otpVerificationStatus,
    ]);

    exportToCsv('campus_visitor_requests', headers, rows);
  };

  const executeAction = (notesOrReason?: string) => {
    const { type, requestId } = confirmModal;
    if (type === 'approve') {
      approveRequest(requestId, notesOrReason);
    } else if (type === 'reject') {
      rejectRequest(requestId, notesOrReason || 'Administrative decision to decline meeting');
    } else if (type === 'info') {
      requestMoreInfo(requestId, notesOrReason || 'Please provide additional supporting documentation');
    } else if (type === 'pending') {
      markRequestPending(requestId, notesOrReason);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitor Meeting Requests</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              {filteredRequests.length} total
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluate, approve, or reject visitor requests dispatched by gate security staff via the Staff Mobile App.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={() => setSimulationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Staff Request
          </button>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search by visitor name, phone, or request ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Request Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Request Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Additional Information Required">Additional Information Required</option>
            </select>
          </div>

          {/* Visitor Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Categories (Who)</option>
              {settings.visitorCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </div>

          {/* Identity Classification Filter */}
          <div>
            <select
              value={classificationFilter}
              onChange={(e) => {
                setClassificationFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Classifications</option>
              <option value="Known">Known</option>
              <option value="Unknown">Unknown</option>
              <option value="Verification Required">Verification Required</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Recipient:</span>
            <select
              value={recipientFilter}
              onChange={(e) => setRecipientFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50"
            >
              <option value="all">All Meeting Recipients</option>
              {settings.authorizedMeetingAuthorities.map((authority) => <option key={authority} value={authority}>{authority}</option>)}
            </select>
          </div>

          {(statusFilter !== 'all' || categoryFilter !== 'all' || classificationFilter !== 'all' || recipientFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setCategoryFilter('all');
                setClassificationFilter('all');
                setRecipientFilter('all');
                setSearchQuery('');
              }}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Request Table & Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View (2 Cols when item selected, or full 3 cols) */}
        <div className={`${activeRequest ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Request / Visitor</th>
                  <th className="py-3 px-4">Category (WHO)</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Authority To Meet</th>
                  <th className="py-3 px-4">Mode / Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No visitor requests match the active filters.
                    </td>
                  </tr>
                ) : (
                  paginatedRequests.map((req) => {
                    const isSelected = selectedRequestId === req.requestId;
                    return (
                      <tr
                        key={req.requestId}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/60 font-medium' : ''
                        }`}
                        onClick={() => setSelectedRequestId(req.requestId)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{req.visitorName}</span>
                            <span className="text-[10px] font-mono text-slate-400">{req.requestId}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <VisitorCategoryBadge category={req.visitorCategory} />
                        </td>

                        <td className="py-3 px-4">
                          <IdentityClassificationBadge classification={req.identityClassification} />
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{req.personToMeet}</span>
                          <span className="text-[10px] text-slate-500 line-clamp-1">{req.reasonForMeeting}</span>
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {req.visitMode === 'Walk-in' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Walk-in (Now)
                            </span>
                          ) : (
                            <span className="text-slate-600 text-[11px]">
                              {req.requestedDate} {req.requestedTime}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <RequestStatusBadge status={req.requestStatus} />
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedRequestId(req.requestId)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {paginatedRequests.length} of {filteredRequests.length} requests
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-2 text-xs font-semibold">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2.5 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Review Drawer / Panel (1 Col) */}
        {activeRequest && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 flex flex-col justify-between space-y-4 animate-in fade-in duration-150">
            <div>
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{activeRequest.visitorName}</h3>
                    <RequestStatusBadge status={activeRequest.requestStatus} />
                  </div>
                  <span className="text-xs text-slate-400 font-mono">ID: {activeRequest.requestId}</span>
                </div>
                <button
                  onClick={() => setSelectedRequestId(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Classification & Category Split */}
              <div className="mt-4 grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Visitor Category (WHO):</span>
                  <div className="mt-1">
                    <VisitorCategoryBadge category={activeRequest.visitorCategory} />
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[11px]">Identity Classification:</span>
                  <div className="mt-1">
                    <IdentityClassificationBadge classification={activeRequest.identityClassification} />
                  </div>
                </div>
              </div>

              {/* Meeting Target and Reason */}
              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="font-semibold text-slate-600 block">Person / Authority to Meet:</span>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">{activeRequest.personToMeet}</p>
                  {activeRequest.department && (
                    <span className="text-[11px] text-slate-500">Dept: {activeRequest.department}</span>
                  )}
                </div>

                <div>
                  <span className="font-semibold text-slate-600 block">Stated Reason for Meeting:</span>
                  <p className="mt-1 text-slate-800 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic leading-relaxed">
                    &ldquo;{activeRequest.reasonForMeeting}&rdquo;
                  </p>
                </div>

                {activeRequest.adminNotes && (
                  <div>
                    <span className="font-semibold text-slate-600 block">Internal Admin Notes:</span>
                    <p className="mt-1 text-slate-800 bg-blue-50/50 p-2 rounded border border-blue-200 text-[11px]">
                      {activeRequest.adminNotes}
                    </p>
                  </div>
                )}

                {activeRequest.rejectionReason && (
                  <div>
                    <span className="font-semibold text-rose-700 block">Rejection Reason:</span>
                    <p className="mt-1 text-rose-800 bg-rose-50 p-2 rounded border border-rose-200 text-[11px]">
                      {activeRequest.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Submission Details */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Visit Mode:</span>
                    <span className="font-semibold text-slate-800">
                      {activeRequest.visitMode} ({activeRequest.requestedTime})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gate Location:</span>
                    <span className="font-semibold text-slate-800">{activeRequest.gateOrLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gate Staff:</span>
                    <span className="font-semibold text-slate-800">{activeRequest.submittedByStaffName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">OTP Status:</span>
                    <OtpStatusBadge status={activeRequest.otpVerificationStatus} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submitted At:</span>
                    <span>{formatDateTime(activeRequest.submittedAt)}</span>
                  </div>
                </div>

                {/* Audit Trail / Review History */}
                <div className="pt-3 border-t border-slate-100">
                  <span className="font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <History className="w-3.5 h-3.5 text-slate-500" />
                    Review Audit Trail:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {activeRequest.reviewHistory.map((h, i) => (
                      <div key={i} className="text-[10px] bg-slate-50 p-1.5 rounded border border-slate-100">
                        <div className="flex justify-between text-slate-500 font-medium">
                          <span>{h.actor}</span>
                          <span>{formatDateTime(h.timestamp)}</span>
                        </div>
                        <p className="text-slate-700 font-semibold mt-0.5">{h.action}</p>
                        {h.notes && <p className="text-slate-500 italic mt-0.5">{h.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Decision Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              {activeRequest.requestStatus === 'Pending Verification' && (
                <div className="space-y-2">
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    {activeRequest.otpVerificationStatus === 'Failed'
                      ? 'The last simulated OTP attempt failed. You can retry the demo verification.'
                      : 'OTP is awaiting a demo verification action. No SMS is sent by this prototype.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => completeDemoOtpVerification(activeRequest.requestId)}
                      className="py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                    >
                      {activeRequest.otpVerificationStatus === 'Failed' ? 'Retry Demo OTP' : 'Simulate OTP Success'}
                    </button>
                    {activeRequest.otpVerificationStatus === 'Pending' && (
                      <button
                        onClick={() => failDemoOtpVerification(activeRequest.requestId)}
                        className="py-2 px-3 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold"
                      >
                        Simulate OTP Failure
                      </button>
                    )}
                  </div>
                </div>
              )}
              {canReviewRequest(activeRequest.requestStatus) && <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Administrative Decision
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'approve',
                      requestId: activeRequest.requestId,
                      visitorName: activeRequest.visitorName,
                    })
                  }
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Approve Entry
                </button>

                <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'reject',
                      requestId: activeRequest.requestId,
                      visitorName: activeRequest.visitorName,
                    })
                  }
                  className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <XCircle className="w-4 h-4" />
                  Reject Request
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {canTransitionRequest(activeRequest.requestStatus, 'Additional Information Required') && <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'info',
                      requestId: activeRequest.requestId,
                      visitorName: activeRequest.visitorName,
                    })
                  }
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                  Request Info
                </button>}

                {canTransitionRequest(activeRequest.requestStatus, 'Pending Approval') && <button
                  onClick={() =>
                    setConfirmModal({
                      isOpen: true,
                      type: 'pending',
                      requestId: activeRequest.requestId,
                      visitorName: activeRequest.visitorName,
                    })
                  }
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-all"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Return to Pending
                </button>}
              </div>
              </>}
              {!canReviewRequest(activeRequest.requestStatus) && activeRequest.requestStatus !== 'Pending Verification' && (
                <p className="text-xs text-slate-500">This request is in a final state. No further decisions are available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Decision Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={executeAction}
        title={
          confirmModal.type === 'approve'
            ? `Approve Request for ${confirmModal.visitorName}?`
            : confirmModal.type === 'reject'
            ? `Reject Request for ${confirmModal.visitorName}?`
            : confirmModal.type === 'info'
            ? `Request Additional Information`
            : `Keep Request Pending`
        }
        description={
          confirmModal.type === 'approve'
            ? `This clears the visitor for gate entry. Security staff at the gate mobile app will receive the approval status.`
            : confirmModal.type === 'reject'
            ? `This will deny entrance to the campus. You must provide a valid rejection reason for gate staff records.`
            : confirmModal.type === 'info'
            ? `Ask gate security to collect additional verification or credentials before a decision is finalized.`
            : `Leave the request in pending status for further internal consultations.`
        }
        variant={confirmModal.type === 'approve' ? 'success' : confirmModal.type === 'reject' ? 'danger' : 'info'}
        confirmLabel={
          confirmModal.type === 'approve'
            ? 'Confirm Approval'
            : confirmModal.type === 'reject'
            ? 'Confirm Rejection'
            : confirmModal.type === 'info'
            ? 'Submit Info Request'
            : 'Keep Pending'
        }
        requiresInput={confirmModal.type === 'reject' || confirmModal.type === 'info'}
        inputLabel={confirmModal.type === 'reject' ? 'Rejection Reason' : 'Details required'}
        inputPlaceholder={
          confirmModal.type === 'reject'
            ? 'e.g. Authorized official is currently unavailable in campus'
            : 'e.g. Please verify visitor photo ID and appointment letter screenshot'
        }
      />
    </div>
  );
}

export default function VisitorRequestsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Visitor Requests...</div>}>
      <VisitorRequestsContent />
    </Suspense>
  );
}
