'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useDemoStore } from '@/store/demo-store';
import { VisitorCategory, IdentityClassification, VisitMode } from '@/types';
import { X, Send, Sparkles, AlertCircle, CheckCircle2, User, Phone, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { findUniqueIdentityNameMatch } from '@/lib/workflow';

export function SimulationModal() {
  const {
    isSimulationModalOpen,
    setSimulationModalOpen,
    simulateIncomingStaffRequest,
    knownIdentities,
    staffUsers,
    settings,
  } = useDemoStore();

  const router = useRouter();

  const [visitorName, setVisitorName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91 9');
  const [visitorCategory, setVisitorCategory] = useState<VisitorCategory>('Guest/External Visitor');
  const [identityClassification, setIdentityClassification] = useState<IdentityClassification>('Unknown');
  const [personToMeet, setPersonToMeet] = useState('Principal/Director');
  const [department, setDepartment] = useState('');
  const [reasonForMeeting, setReasonForMeeting] = useState('');
  const [visitMode, setVisitMode] = useState<VisitMode>('Walk-in');
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedTime, setRequestedTime] = useState('Now');
  const [submittingStaffId, setSubmittingStaffId] = useState(staffUsers[0]?.staffId || 'STF-101');
  const [gateOrLocation, setGateOrLocation] = useState('Main Gate 1');
  const [staffNotes, setStaffNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (settings.visitorCategories.length && !settings.visitorCategories.includes(visitorCategory)) {
      setVisitorCategory(settings.visitorCategories[0] as VisitorCategory);
    }
  }, [settings.visitorCategories, visitorCategory]);
  useEffect(() => {
    if (settings.authorizedMeetingAuthorities.length && !settings.authorizedMeetingAuthorities.includes(personToMeet)) {
      setPersonToMeet(settings.authorizedMeetingAuthorities[0]);
    }
  }, [settings.authorizedMeetingAuthorities, personToMeet]);

  useEffect(() => {
    if (!isSimulationModalOpen) return;
    const returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSimulationModalOpen(false);
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])',
        ));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('input:not([disabled])')?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnFocus?.focus();
    };
  }, [isSimulationModalOpen, setSimulationModalOpen]);

  if (!isSimulationModalOpen) return null;

  // Check if name matches any seeded known identity
  const matchingIdentities = knownIdentities.filter(
    (k) => k.name.trim().toLowerCase() === visitorName.trim().toLowerCase() && !k.isArchived
  );
  const matchedIdentity = findUniqueIdentityNameMatch(knownIdentities, visitorName);

  const handleQuickFill = (preset: 'keshav' | 'parent' | 'vendor' | 'supriya') => {
    if (preset === 'keshav') {
      setVisitorName('Keshav');
      setPhoneNumber('+91 98765 43210');
      setVisitorCategory('Guest/External Visitor');
      setIdentityClassification('Known');
      setPersonToMeet('Principal/Director');
      setReasonForMeeting('Discussion regarding engineering curriculum accreditation review');
      setVisitMode('Walk-in');
      setRequestedTime('Now');
      setStaffNotes('Visitor arrived by taxi at Gate 1. Prior email thread mentioned.');
    } else if (preset === 'parent') {
      setVisitorName('Nandini Deshmukh');
      setPhoneNumber('+91 98220 11223');
      setVisitorCategory('Parent/Guardian');
      setIdentityClassification('Unknown');
      setPersonToMeet('Dean/HOD');
      setReasonForMeeting('Inquiring about hostel allocation and scholarship payment schedule');
      setVisitMode('Walk-in');
      setRequestedTime('Now');
      setStaffNotes('Parent seeking urgent 15-minute consultation.');
    } else if (preset === 'vendor') {
      setVisitorName('Raj');
      setPhoneNumber('+91 99887 76655');
      setVisitorCategory('Vendor');
      setIdentityClassification('Known');
      setPersonToMeet('Administrator');
      setReasonForMeeting('Quarterly supply delivery for Science Lab and sign-off on invoice');
      setVisitMode('Walk-in');
      setRequestedTime('Now');
      setStaffNotes('Delivery vehicle parked at Gate 1 service lane.');
    } else if (preset === 'supriya') {
      setVisitorName('Supriya');
      setPhoneNumber('+91 91234 56789');
      setVisitorCategory('Teaching Staff');
      setIdentityClassification('Known');
      setPersonToMeet('Dean/HOD');
      setReasonForMeeting('Inter-departmental faculty council documents handover');
      setVisitMode('Scheduled');
      setRequestedTime('02:30 PM');
      setStaffNotes('Scheduled appointment as per faculty liaison desk.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName.trim() || successMessage) return;

    const createdRequestId = simulateIncomingStaffRequest({
      visitorName: visitorName.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      visitorCategory,
      identityClassification: matchedIdentity ? matchedIdentity.classification : identityClassification,
      personToMeet,
      department: department.trim() || undefined,
      reasonForMeeting: reasonForMeeting.trim() || 'General campus office meeting',
      visitMode,
      requestedDate,
      requestedTime: visitMode === 'Walk-in' ? 'Now' : requestedTime,
      submittingStaffId,
      gateOrLocation,
      staffNotes: staffNotes.trim() || undefined,
    });

    setSuccessMessage(createdRequestId);
    setTimeout(() => {
      setSuccessMessage(null);
      setSimulationModalOpen(false);
      router.push(`/visitor-requests?id=${createdRequestId}`);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="simulation-dialog-title" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-600 rounded-md">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="simulation-dialog-title" className="font-semibold text-base text-white">Simulate Incoming Staff Request</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                  Demo Simulation
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Simulates gate security staff capturing visitor details on the mobile app and dispatching a request to your admin desk.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSimulationModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 flex-wrap text-xs">
          <span className="font-medium text-slate-600">Quick Test Presets:</span>
          <button
            type="button"
            onClick={() => handleQuickFill('keshav')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-300 rounded text-slate-700 font-medium transition-all"
          >
            Keshav (Seeded Known Guest)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('parent')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-300 rounded text-slate-700 font-medium transition-all"
          >
            Nandini (Unknown Parent)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('vendor')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-300 rounded text-slate-700 font-medium transition-all"
          >
            Raj (Seeded Known Vendor)
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('supriya')}
            className="px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-300 rounded text-slate-700 font-medium transition-all"
          >
            Supriya (Seeded Known Staff)
          </button>
        </div>

        {/* Modal Form */}
        <form id="simulation-request-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-800 text-sm font-medium animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Simulated Request {successMessage} successfully submitted! Navigating to review...</span>
            </div>
          )}

          {/* Visitor Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Visitor Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Keshav or visitor name"
                  value={visitorName}
                  onChange={(e) => setVisitorName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {matchedIdentity && (
                <p className="mt-1 text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Demo registry match: Matches seeded Known Registry record &ldquo;{matchedIdentity.name}&rdquo;!
                </p>
              )}
              {matchingIdentities.length > 1 && (
                <p className="mt-1 text-xs text-amber-700">More than one demo registry record has this name. No identity link will be selected automatically.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="+91 98765 00000"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Visitor Category & Identity Classification (Kept separate as mandated by Section 5) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Visitor Category (WHO has arrived?)
              </label>
              <select
                value={visitorCategory}
                onChange={(e) => setVisitorCategory(e.target.value as VisitorCategory)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {settings.visitorCategories.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Describes the person arrived at campus</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Identity Classification (HOW classified?)
              </label>
              <select
                value={matchedIdentity ? matchedIdentity.classification : identityClassification}
                onChange={(e) => setIdentityClassification(e.target.value as IdentityClassification)}
                disabled={!!matchedIdentity}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="Known">Known (Pre-registered or in registry)</option>
                <option value="Unknown">Unknown (Unregistered / first visit)</option>
                <option value="Verification Required">Verification Required (Mismatch / suspicious)</option>
              </select>
              <p className="mt-1 text-[11px] text-slate-500">
                Unknown is not automatically dangerous or rejected.
              </p>
            </div>
          </div>

          {/* Intended Person to Meet & Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Person / Authority to Meet <span className="text-red-500">*</span>
              </label>
              <select
                value={personToMeet}
                onChange={(e) => setPersonToMeet(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {settings.authorizedMeetingAuthorities.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <p className="mt-1 text-[11px] text-slate-500">Intended recipient of meeting request</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Office</label>
              <input
                type="text"
                placeholder="e.g. Dean Academics or Central Office"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Meeting <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              placeholder="State the purpose provided by visitor (e.g. Fee inquiry, Document submission, Vendor delivery)"
              value={reasonForMeeting}
              onChange={(e) => setReasonForMeeting(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Visit Mode & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">Visit Mode</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVisitMode('Walk-in');
                    setRequestedTime('Now');
                  }}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                    visitMode === 'Walk-in'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Walk-in (Now)
                </button>
                <button
                  type="button"
                  onClick={() => setVisitMode('Scheduled')}
                  className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg border transition-all ${
                    visitMode === 'Scheduled'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  Scheduled
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Date</label>
              <input
                type="date"
                value={requestedDate}
                onChange={(e) => setRequestedDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Requested Time</label>
              <input
                type="text"
                disabled={visitMode === 'Walk-in'}
                value={requestedTime}
                onChange={(e) => setRequestedTime(e.target.value)}
                placeholder="e.g. 11:30 AM or Now"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Submitting Staff & Gate */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Submitting Gate Security Staff
              </label>
              <select
                value={submittingStaffId}
                onChange={(e) => setSubmittingStaffId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
              >
                {staffUsers.map((staff) => (
                  <option key={staff.staffId} value={staff.staffId}>
                    {staff.name} — {staff.role} ({staff.assignedGate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gate / Entry Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={gateOrLocation}
                  onChange={(e) => setGateOrLocation(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Main Gate 1">Main Gate 1 (Pedestrian & Vehicle)</option>
                  <option value="North Gate 2">North Gate 2 (Hostel & Sports)</option>
                  <option value="South Service Gate 3">South Service Gate 3 (Vendors)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Staff Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Notes (Gate remarks)</label>
            <input
              type="text"
              placeholder="e.g. Verified government ID at gate; waiting in lobby"
              value={staffNotes}
              onChange={(e) => setStaffNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Dispatches notification & creates synchronized request record
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSimulationModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="simulation-request-form"
              disabled={!!successMessage}
              className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Simulated Staff Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
