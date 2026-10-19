'use client';

import React, { useState, useMemo, Suspense, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';
import { VisitorRecord, IdentityClassification, VisitorCategory, RequestStatus } from '@/types';
import {
  IdentityClassificationBadge,
  VisitorCategoryBadge,
  RequestStatusBadge,
  OtpStatusBadge,
} from '@/components/shared/badge-status';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatDateTime, exportToCsv } from '@/lib/utils';
import { getLocalDateInputValue } from '@/lib/workflow';
import { useAccessibleDialog } from '@/lib/use-accessible-dialog';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  LogIn,
  LogOut,
  Building2,
  UserCheck,
  AlertTriangle,
  HelpCircle,
  X,
  CheckCircle,
} from 'lucide-react';

function VisitorRecordsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlClassification = searchParams.get('classification');

  const {
    visitorRecords,
    updateVisitorRecord,
    archiveVisitorRecord,
    updateIdentityClassification,
    recordCheckIn,
    recordCheckOut,
    currentUser,
    settings,
    simulateIncomingStaffRequest,
  } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState(urlClassification || 'all');
  const [presenceFilter, setPresenceFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<VisitorRecord | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const createSubmissionLock = useRef(false);
  const addDialogProps = useAccessibleDialog(isAddModalOpen, () => setIsAddModalOpen(false));
  const editDialogProps = useAccessibleDialog(isEditModalOpen, () => setIsEditModalOpen(false));

  // New visitor form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCategory, setFormCategory] = useState<VisitorCategory>('Guest/External Visitor');
  const [formClassification, setFormClassification] = useState<IdentityClassification>('Unknown');
  const [formPersonToMeet, setFormPersonToMeet] = useState('Principal/Director');
  const [formPurpose, setFormPurpose] = useState('');
  const [formVisitMode, setFormVisitMode] = useState<'Walk-in' | 'Scheduled'>('Walk-in');
  const [formRequestedDate, setFormRequestedDate] = useState(() => getLocalDateInputValue());
  const [formRequestedTime, setFormRequestedTime] = useState('09:00');
  const [formGate, setFormGate] = useState('Main Gate 1');
  const [formNotes, setFormNotes] = useState('');

  useEffect(() => {
    if (settings.visitorCategories.length && !settings.visitorCategories.includes(formCategory)) {
      setFormCategory(settings.visitorCategories[0] as VisitorCategory);
    }
  }, [settings.visitorCategories, formCategory]);
  useEffect(() => {
    if (settings.authorizedMeetingAuthorities.length && !settings.authorizedMeetingAuthorities.includes(formPersonToMeet)) {
      setFormPersonToMeet(settings.authorizedMeetingAuthorities[0]);
    }
  }, [settings.authorizedMeetingAuthorities, formPersonToMeet]);

  // Confirm Dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'archive' | 'classify';
    visitorId?: string;
    newClassification?: IdentityClassification;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: 'archive',
    title: '',
    description: '',
  });

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return visitorRecords.filter((rec) => {
      if (rec.isArchived) return false;
      if (categoryFilter !== 'all' && rec.visitorCategory !== categoryFilter) return false;
      if (classificationFilter !== 'all' && rec.identityClassification !== classificationFilter) return false;
      if (presenceFilter !== 'all' && rec.currentPresence !== presenceFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          rec.visitorName.toLowerCase().includes(q) ||
          rec.visitorId.toLowerCase().includes(q) ||
          rec.phoneNumber.toLowerCase().includes(q) ||
          rec.personToMeet.toLowerCase().includes(q) ||
          rec.purpose.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [visitorRecords, categoryFilter, classificationFilter, presenceFilter, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Visitor ID',
      'Visitor Name',
      'Phone Number',
      'Category',
      'Identity Classification',
      'Person To Meet',
      'Purpose',
      'Presence',
      'Request Status',
      'Gate Location',
      'Registered At',
      'Check-in Time',
      'Check-out Time',
    ];

    const rows = filteredRecords.map((r) => [
      r.visitorId,
      r.visitorName,
      r.phoneNumber,
      r.visitorCategory,
      r.identityClassification,
      r.personToMeet,
      r.purpose,
      r.currentPresence,
      r.requestStatus,
      r.gateLocation,
      r.registeredAt,
      r.checkInTime || 'N/A',
      r.checkOutTime || 'N/A',
    ]);

    exportToCsv('campus_visitor_records', headers, rows);
  };

  const handleCreateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPurpose.trim() || createSubmissionLock.current) return;
    createSubmissionLock.current = true;
    setIsCreating(true);

    const requestId = simulateIncomingStaffRequest({
      visitorName: formName.trim(),
      phoneNumber: formPhone.trim() || undefined,
      visitorCategory: formCategory,
      identityClassification: formClassification,
      personToMeet: formPersonToMeet,
      reasonForMeeting: formPurpose.trim() || 'General campus office meeting',
      visitMode: formVisitMode,
      requestedDate: formVisitMode === 'Walk-in' ? getLocalDateInputValue() : formRequestedDate,
      requestedTime: formVisitMode === 'Walk-in' ? 'Now' : formRequestedTime,
      submittingStaffId: currentUser.staffId,
      gateOrLocation: formGate,
      staffNotes: formNotes.trim() || undefined,
    });

    setIsAddModalOpen(false);
    setFormName('');
    setFormPurpose('');
    router.push(`/visitor-requests?id=${requestId}`);
    createSubmissionLock.current = false;
    setIsCreating(false);
  };

  const handleUpdateVisitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    updateVisitorRecord(selectedRecord.visitorId, {
      visitorName: formName.trim(),
      phoneNumber: formPhone.trim(),
      visitorCategory: formCategory,
      purpose: formPurpose.trim(),
      personToMeet: formPersonToMeet,
      notes: formNotes.trim(),
      gateLocation: formGate,
      visitMode: formVisitMode,
      requestedDateTime: `${formRequestedDate}T${formRequestedTime}`,
    });

    setIsEditModalOpen(false);
  };

  const openEditModal = (rec: VisitorRecord) => {
    setSelectedRecord(rec);
    setFormName(rec.visitorName);
    setFormPhone(rec.phoneNumber);
    setFormCategory(rec.visitorCategory);
    setFormPersonToMeet(rec.personToMeet);
    setFormPurpose(rec.purpose);
    setFormNotes(rec.notes || '');
    setFormGate(rec.gateLocation);
    setFormVisitMode(rec.visitMode ?? (rec.requestedDateTime.endsWith('Now') ? 'Walk-in' : 'Scheduled'));
    const dateSource = rec.requestedDateTime.endsWith('Now')
      ? `${rec.requestedDateTime.slice(0, -4)}T00:00`
      : rec.requestedDateTime.replace(' ', 'T');
    const parsedDateTime = new Date(dateSource);
    setFormRequestedDate(Number.isFinite(parsedDateTime.getTime()) ? getLocalDateInputValue(parsedDateTime) : getLocalDateInputValue());
    setFormRequestedTime(Number.isFinite(parsedDateTime.getTime())
      ? `${String(parsedDateTime.getHours()).padStart(2, '0')}:${String(parsedDateTime.getMinutes()).padStart(2, '0')}`
      : '09:00');
    setIsEditModalOpen(true);
  };

  const executeConfirmAction = (reason?: string) => {
    if (confirmState.type === 'archive' && confirmState.visitorId) {
      archiveVisitorRecord(confirmState.visitorId);
      if (selectedRecord?.visitorId === confirmState.visitorId) {
        setSelectedRecord(null);
      }
    } else if (confirmState.type === 'classify' && confirmState.visitorId && confirmState.newClassification) {
      const rec = visitorRecords.find((r) => r.visitorId === confirmState.visitorId);
      if (rec) {
        // If there's an associated identity or matched identity record, update that too
        updateIdentityClassification(
          rec.associatedIdentityId || rec.visitorId,
          confirmState.newClassification,
          reason || 'Manual administrative classification adjustment'
        );
        updateVisitorRecord(rec.visitorId, { identityClassification: confirmState.newClassification });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Visitor Records Repository</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              {filteredRecords.length} records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive ledger of all campus visitors, presence states, identity categories, and access histories.
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
            onClick={() => {
              setFormName('');
              setFormPhone('');
              setFormPurpose('');
              setFormCategory(settings.visitorCategories[0] as VisitorCategory || 'Guest/External Visitor');
              setFormClassification('Unknown');
              setFormPersonToMeet(settings.authorizedMeetingAuthorities[0] || '');
              setFormGate('Main Gate 1');
              setFormVisitMode('Walk-in');
              setFormRequestedDate(getLocalDateInputValue());
              setFormRequestedTime('09:00');
              setFormNotes('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Visitor Record
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="lg:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, ID, phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Visitor Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Visitor Categories</option>
              {settings.visitorCategories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          {/* Identity Classification */}
          <div>
            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Classifications</option>
              <option value="Known">Known</option>
              <option value="Unknown">Unknown</option>
              <option value="Verification Required">Verification Required</option>
            </select>
          </div>

          {/* Presence Status */}
          <div>
            <select
              value={presenceFilter}
              onChange={(e) => setPresenceFilter(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Presence States</option>
              <option value="Inside Campus">Inside Campus (Active)</option>
              <option value="Exited">Exited Campus</option>
              <option value="Not Checked In">Not Checked In</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Identity Classification</th>
                <th className="py-3 px-4">Person To Meet / Purpose</th>
                <th className="py-3 px-4">Campus Presence</th>
                <th className="py-3 px-4">Request Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No visitor records match the specified filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.visitorId} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{rec.visitorName}</span>
                        <span className="text-[10px] font-mono text-slate-400">{rec.visitorId}</span>
                        <span className="text-[11px] text-slate-500">{rec.phoneNumber}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <VisitorCategoryBadge category={rec.visitorCategory} />
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <IdentityClassificationBadge classification={rec.identityClassification} />
                        {/* Quick Classification Switcher */}
                        <div className="flex items-center gap-1 mt-1 text-[10px]">
                          <span className="text-slate-400">Set:</span>
                          <button
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                type: 'classify',
                                visitorId: rec.visitorId,
                                newClassification: 'Known',
                                title: `Classify ${rec.visitorName} as Known?`,
                                description: 'Mark this person as Known in campus records and append to identity history.',
                              })
                            }
                            className="text-emerald-700 hover:underline font-semibold"
                          >
                            Known
                          </button>
                          <span>·</span>
                          <button
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                type: 'classify',
                                visitorId: rec.visitorId,
                                newClassification: 'Unknown',
                                title: `Classify ${rec.visitorName} as Unknown?`,
                                description: 'Mark identity as unverified / unknown.',
                              })
                            }
                            className="text-slate-600 hover:underline font-semibold"
                          >
                            Unknown
                          </button>
                          <span>·</span>
                          <button
                            onClick={() =>
                              setConfirmState({
                                isOpen: true,
                                type: 'classify',
                                visitorId: rec.visitorId,
                                newClassification: 'Verification Required',
                                title: `Flag ${rec.visitorName} for Verification Required?`,
                                description: 'Indicate that security verification or ID confirmation is required.',
                              })
                            }
                            className="text-amber-700 hover:underline font-semibold"
                          >
                            Verify
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-slate-900">{rec.personToMeet}</p>
                      <p className="text-slate-500 text-[11px] line-clamp-1">{rec.purpose}</p>
                      <span className="text-[10px] text-slate-400">Gate: {rec.gateLocation}</span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {rec.currentPresence === 'Inside Campus' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                            Inside Campus
                          </span>
                          <button
                            onClick={() => recordCheckOut(rec.visitorId, rec.gateLocation, currentUser.name)}
                            className="block text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                          >
                            Record Gate Exit →
                          </button>
                        </div>
                      ) : rec.currentPresence === 'Exited' ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            Exited Campus
                          </span>
                          {rec.requestStatus === 'Approved' && (
                            <button
                              onClick={() => recordCheckIn(rec.visitorId, rec.gateLocation, currentUser.name)}
                              className="block text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                            >
                              Record Gate Entry →
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            Not Checked In
                          </span>
                          {rec.requestStatus === 'Approved' && (
                            <button
                              onClick={() => recordCheckIn(rec.visitorId, rec.gateLocation, currentUser.name)}
                              className="block text-[11px] font-semibold text-emerald-600 hover:text-emerald-800 transition-colors"
                            >
                              Record Gate Entry →
                            </button>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <RequestStatusBadge status={rec.requestStatus} />
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(rec)}
                          className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100 transition-colors"
                          title="Edit record details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          disabled={rec.currentPresence === 'Inside Campus'}
                          onClick={() =>
                            setConfirmState({
                              isOpen: true,
                              type: 'archive',
                              visitorId: rec.visitorId,
                              title: `Archive Record for ${rec.visitorName}?`,
                              description: `This removes the record from active view while preserving historical security audit logs.`,
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={rec.currentPresence === 'Inside Campus' ? 'Check the visitor out before archiving this record' : 'Archive visitor record'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Visitor Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div {...addDialogProps} aria-labelledby="add-visitor-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="add-visitor-title" className="font-semibold text-sm">Add New Visitor Record</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white" aria-label="Close add visitor form">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateVisitor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Visitor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as VisitorCategory)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {settings.visitorCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Identity Classification</label>
                  <select
                    value={formClassification}
                    onChange={(e) => setFormClassification(e.target.value as IdentityClassification)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Known">Known</option>
                    <option value="Unknown">Unknown</option>
                    <option value="Verification Required">Verification Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Authority To Meet</label>
                  <select
                    value={formPersonToMeet}
                    onChange={(e) => setFormPersonToMeet(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {settings.authorizedMeetingAuthorities.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  required
                  placeholder="Reason for campus access"
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Mode</label>
                  <select value={formVisitMode} onChange={(event) => setFormVisitMode(event.target.value as 'Walk-in' | 'Scheduled')} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white">
                    <option value="Walk-in">Walk-in</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                {formVisitMode === 'Scheduled' && <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Date</label>
                    <input type="date" required value={formRequestedDate} onChange={(event) => setFormRequestedDate(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Time</label>
                    <input type="time" required value={formRequestedTime} onChange={(event) => setFormRequestedTime(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                </>}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gate / Location</label>
                  <select value={formGate} onChange={(event) => setFormGate(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white">
                    <option>Main Gate 1</option><option>Main Gate 2</option><option>Main Gate 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Additional Notes</label>
                <textarea rows={2} value={formNotes} onChange={(event) => setFormNotes(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg" />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  {isCreating ? 'Creating…' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Visitor Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div {...editDialogProps} aria-labelledby="edit-visitor-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="edit-visitor-title" className="font-semibold text-sm">Edit Visitor Record ({selectedRecord?.visitorId})</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateVisitor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as VisitorCategory)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                  >
                    {settings.visitorCategories.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Person To Meet</label>
                <select
                  value={formPersonToMeet}
                  onChange={(e) => setFormPersonToMeet(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  {settings.authorizedMeetingAuthorities.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Reason</label>
                <input
                  type="text"
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visit Mode</label>
                  <select value={formVisitMode} onChange={(event) => setFormVisitMode(event.target.value as 'Walk-in' | 'Scheduled')} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white">
                    <option value="Walk-in">Walk-in</option><option value="Scheduled">Scheduled</option>
                  </select>
                </div>
                {formVisitMode === 'Scheduled' && <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Date</label>
                    <input type="date" required value={formRequestedDate} onChange={(event) => setFormRequestedDate(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Time</label>
                    <input type="time" required value={formRequestedTime} onChange={(event) => setFormRequestedTime(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg" />
                  </div>
                </>}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gate / Location</label>
                  <select value={formGate} onChange={(event) => setFormGate(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white">
                    <option>Main Gate 1</option><option>Main Gate 2</option><option>Main Gate 3</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes</label>
                <textarea rows={2} value={formNotes} onChange={(event) => setFormNotes(event.target.value)} className="w-full text-xs p-2.5 border border-slate-300 rounded-lg" />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Update Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Archive & Classification */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((p) => ({ ...p, isOpen: false }))}
        onConfirm={executeConfirmAction}
        title={confirmState.title}
        description={confirmState.description}
        variant={confirmState.type === 'archive' ? 'danger' : 'info'}
        confirmLabel={confirmState.type === 'archive' ? 'Confirm Archive' : 'Update Classification'}
        requiresInput={confirmState.type === 'classify'}
        inputLabel="Classification Note / Reason"
        inputPlaceholder="e.g. Identity verified by administrator"
      />
    </div>
  );
}

export default function VisitorRecordsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Visitor Records...</div>}>
      <VisitorRecordsContent />
    </Suspense>
  );
}
