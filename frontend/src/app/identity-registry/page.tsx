'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/store/demo-store';
import { KnownIdentityRecord, IdentityClassification, VisitorCategory } from '@/types';
import { IdentityClassificationBadge, VisitorCategoryBadge } from '@/components/shared/badge-status';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatDateTime } from '@/lib/utils';
import { useAccessibleDialog } from '@/lib/use-accessible-dialog';
import {
  Fingerprint,
  Search,
  Plus,
  Edit2,
  Trash2,
  History,
  RotateCcw,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  X,
  FileText,
} from 'lucide-react';

export default function IdentityRegistryPage() {
  const {
    knownIdentities,
    addKnownIdentity,
    editKnownIdentity,
    archiveKnownIdentity,
    restoreKnownIdentity,
    updateIdentityClassification,
    resetIdentityRegistry,
    visitorRequests,
  } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [recordFilter, setRecordFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [selectedIdentity, setSelectedIdentity] = useState<KnownIdentityRecord | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const addDialogProps = useAccessibleDialog(isAddModalOpen, () => setIsAddModalOpen(false));
  const editDialogProps = useAccessibleDialog(isEditModalOpen, () => setIsEditModalOpen(false));

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<VisitorCategory>('Not specified');
  const [department, setDepartment] = useState('Not specified');
  const [notes, setNotes] = useState('');

  // Confirm dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    type: 'archive' | 'classify' | 'reset';
    identityId?: string;
    newClassification?: IdentityClassification;
    title: string;
    description: string;
  }>({
    isOpen: false,
    type: 'archive',
    title: '',
    description: '',
  });

  const filteredIdentities = useMemo(() => {
    return knownIdentities.filter((item) => {
      if (recordFilter === 'active' && item.isArchived) return false;
      if (recordFilter === 'archived' && !item.isArchived) return false;
      if (classificationFilter !== 'all' && item.classification !== classificationFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [knownIdentities, classificationFilter, recordFilter, searchQuery]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addKnownIdentity(name.trim(), category, department.trim(), notes.trim());
    setIsAddModalOpen(false);
    setName('');
    setNotes('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdentity) return;
    editKnownIdentity(selectedIdentity.id, {
      name: name.trim(),
      category,
      department: department.trim(),
      notes: notes.trim(),
    });
    setSelectedIdentity((current) => current?.id === selectedIdentity.id
      ? { ...current, name: name.trim(), category, department: department.trim(), notes: notes.trim() }
      : current);
    setIsEditModalOpen(false);
  };

  const openEdit = (identity: KnownIdentityRecord) => {
    setSelectedIdentity(identity);
    setName(identity.name);
    setCategory(identity.category);
    setDepartment(identity.department);
    setNotes(identity.notes || '');
    setIsEditModalOpen(true);
  };

  const handleClassificationConfirm = (reason?: string) => {
    if (confirmState.type === 'reset') {
      resetIdentityRegistry();
    } else if (confirmState.type === 'archive' && confirmState.identityId) {
      archiveKnownIdentity(confirmState.identityId);
      if (selectedIdentity?.id === confirmState.identityId) {
        setSelectedIdentity(null);
      }
    } else if (confirmState.type === 'classify' && confirmState.identityId && confirmState.newClassification) {
      updateIdentityClassification(
        confirmState.identityId,
        confirmState.newClassification,
        reason || 'Manual identity registry update'
      );
      const latestIdentity = useDemoStore.getState().knownIdentities.find((item) => item.id === confirmState.identityId);
      if (latestIdentity && selectedIdentity?.id === confirmState.identityId) {
        setSelectedIdentity(latestIdentity);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Known Identity Registry</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Canonical Seeded Registry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Pre-registered identity registry. Initialized with canonical entries (Keshav, Praveen, Raj, Aditi, Supriya).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setConfirmState({ isOpen: true, type: 'reset', title: 'Restore canonical registry?',
                description: 'This restores Keshav, Praveen, Raj, Aditi, and Supriya. Visitor, request, and other demo data will remain unchanged.' });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
            title="Restores the 5 initial entries as specified in Section 6"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Restore Registry Defaults
          </button>

          <button
            onClick={() => {
              setName('');
              setCategory('Not specified');
              setDepartment('Not specified');
              setNotes('');
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Identity Record
          </button>
        </div>
      </div>

      {/* Registry Disclaimer Notice */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Design Integrity Note:</strong> The 5 canonical seeded records (Keshav, Praveen, Raj, Aditi, Supriya) are seeded without invented surnames, biometrics, or fabricated personal IDs. When a staff request arrives with a matching name, it is flagged as a <em>&ldquo;Demo registry match&rdquo;</em> for administrative correlation, not physical biometric proof.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search identity name or ID (e.g. Keshav, Raj)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Records:</span>
          <select
            value={recordFilter}
            onChange={(e) => setRecordFilter(e.target.value as 'active' | 'archived' | 'all')}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            aria-label="Filter active and archived identity records"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="all">All Records</option>
          </select>
          <span className="text-xs text-slate-500 font-medium">Classification:</span>
          <select
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Classifications</option>
            <option value="Known">Known</option>
            <option value="Unknown">Unknown</option>
            <option value="Verification Required">Verification Required</option>
          </select>
        </div>
      </div>

      {/* Registry Table & History Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table View (2 Cols when item selected, or full 3) */}
        <div className={`${selectedIdentity ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Registry Name</th>
                  <th className="py-3 px-4">Record ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Department / Liaison</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIdentities.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No identity records match the search query.
                    </td>
                  </tr>
                ) : (
                  filteredIdentities.map((item) => {
                    const isSelected = selectedIdentity?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/60 font-medium' : ''
                        }`}
                        onClick={() => setSelectedIdentity(item)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                            {item.isDemoRegistryMatch && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
                                Seeded Entry
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.id}</td>

                        <td className="py-3 px-4">
                          <VisitorCategoryBadge category={item.category} />
                        </td>

                        <td className="py-3 px-4">
                          <IdentityClassificationBadge classification={item.classification} />
                        </td>

                        <td className="py-3 px-4 text-slate-600">{item.department}</td>

                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {item.isArchived ? (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation();
                                  restoreKnownIdentity(item.id);
                                  setSelectedIdentity({ ...item, isArchived: false });
                                }}
                                className="px-2 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-50 rounded"
                              >
                                Restore
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => setSelectedIdentity(item)}
                                  className="px-2 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  Audit Trail
                                </button>
                                <button
                                  onClick={() => openEdit(item)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded hover:bg-slate-100"
                                  title="Edit details"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setConfirmState({
                                      isOpen: true,
                                      type: 'archive',
                                      identityId: item.id,
                                      title: `Archive Registry Record for ${item.name}?`,
                                      description: 'This marks the record as archived while preserving classification history.',
                                    })
                                  }
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                                  title="Archive identity"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Identity Detail & Classification History Drawer (1 Col) */}
        {selectedIdentity && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 flex flex-col justify-between space-y-4 animate-in fade-in">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedIdentity.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedIdentity.id}</span>
                </div>
                <button
                  onClick={() => setSelectedIdentity(null)}
                  className="text-slate-400 hover:text-slate-700 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Classification Controls */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">Current Classification:</span>
                <IdentityClassificationBadge classification={selectedIdentity.classification} />

                {selectedIdentity.isArchived ? (
                  <p className="pt-2 border-t border-slate-200 text-xs text-slate-500">Restore this archived identity before changing its classification.</p>
                ) : <div className="pt-2 border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Change Classification Manually:
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setConfirmState({
                          isOpen: true,
                          type: 'classify',
                          identityId: selectedIdentity.id,
                          newClassification: 'Known',
                          title: `Mark ${selectedIdentity.name} as Known?`,
                          description: 'Mark identity as pre-authorized and known across all campus gates.',
                        })
                      }
                      className="flex-1 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded"
                    >
                      Set Known
                    </button>
                    <button
                      onClick={() =>
                        setConfirmState({
                          isOpen: true,
                          type: 'classify',
                          identityId: selectedIdentity.id,
                          newClassification: 'Unknown',
                          title: `Mark ${selectedIdentity.name} as Unknown?`,
                          description: 'Revert identity to unverified / unknown status.',
                        })
                      }
                      className="flex-1 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded"
                    >
                      Set Unknown
                    </button>
                    <button
                      onClick={() =>
                        setConfirmState({
                          isOpen: true,
                          type: 'classify',
                          identityId: selectedIdentity.id,
                          newClassification: 'Verification Required',
                          title: `Flag ${selectedIdentity.name} for Verification?`,
                          description: 'Require physical verification on subsequent arrivals.',
                        })
                      }
                      className="flex-1 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded"
                    >
                      Set Verify
                    </button>
                  </div>
                </div>}
              </div>

              {/* Linked Requests */}
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-700 block mb-1">Associated Visitor Requests:</span>
                {visitorRequests.filter(
                  (r) => r.associatedIdentityRecordId === selectedIdentity.id
                ).length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">No incoming requests linked yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {visitorRequests
                      .filter(
                        (r) => r.associatedIdentityRecordId === selectedIdentity.id
                      )
                      .map((req) => (
                        <Link
                          key={req.requestId}
                          href={`/visitor-requests?id=${req.requestId}`}
                          className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded flex items-center justify-between text-xs transition-colors block"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">{req.requestId}</span>
                            <span className="text-[11px] text-slate-500 block">To meet: {req.personToMeet}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        </Link>
                      ))}
                  </div>
                )}
              </div>

              {/* Classification History Log */}
              <div className="mt-4">
                <span className="text-xs font-semibold text-slate-700 block mb-2 flex items-center gap-1">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Classification History Log:
                </span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedIdentity.classificationHistory.map((hist, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 rounded border border-slate-200 text-[11px] space-y-0.5">
                      <div className="flex justify-between text-slate-500">
                        <span>{hist.actor}</span>
                        <span>{formatDateTime(hist.timestamp)}</span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        {hist.previousClassification} → {hist.newClassification}
                      </div>
                      <p className="text-slate-600 italic">{hist.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between">
              <button
                onClick={() => openEdit(selectedIdentity)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit Details
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div {...addDialogProps} aria-labelledby="add-identity-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="add-identity-title" className="font-semibold text-sm">Add Known Identity Record</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rameshwar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VisitorCategory)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Not specified">Not specified</option>
                  <option value="Student">Student</option>
                  <option value="Parent/Guardian">Parent/Guardian</option>
                  <option value="Guest/External Visitor">Guest/External Visitor</option>
                  <option value="Teaching Staff">Teaching Staff</option>
                  <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Not specified"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Authorized liaison notes"
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
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
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Save Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div {...editDialogProps} aria-labelledby="edit-identity-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 id="edit-identity-title" className="font-semibold text-sm">Edit Identity Record</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VisitorCategory)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Not specified">Not specified</option>
                  <option value="Student">Student</option>
                  <option value="Parent/Guardian">Parent/Guardian</option>
                  <option value="Guest/External Visitor">Guest/External Visitor</option>
                  <option value="Teaching Staff">Teaching Staff</option>
                  <option value="Non-Teaching Staff">Non-Teaching Staff</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg"
                />
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
                  Update Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleClassificationConfirm}
        title={confirmState.title}
        description={confirmState.description}
        variant={confirmState.type === 'archive' ? 'danger' : confirmState.type === 'reset' ? 'warning' : 'info'}
        confirmLabel={confirmState.type === 'archive' ? 'Archive Record' : confirmState.type === 'reset' ? 'Restore Registry' : 'Confirm Classification'}
        requiresInput={confirmState.type === 'classify'}
        inputLabel="Reason for classification change"
        inputPlaceholder="e.g. Identity verified by registrar office documents"
      />
    </div>
  );
}
