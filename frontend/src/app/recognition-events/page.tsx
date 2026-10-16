'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/store/demo-store';
import { AIRecognitionEvent, IdentityClassification } from '@/types';
import { IdentityClassificationBadge } from '@/components/shared/badge-status';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatDateTime } from '@/lib/utils';
import {
  ScanEye,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Shield,
  HelpCircle,
  ExternalLink,
  X,
  FileText,
} from 'lucide-react';

export default function AIRecognitionEventsPage() {
  const { recognitionEvents, reviewAIRecognitionEvent, knownIdentities } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState<AIRecognitionEvent | null>(null);

  // Review Dialog
  const [reviewDialog, setReviewDialog] = useState<{
    isOpen: boolean;
    eventId: string;
    newClassification: IdentityClassification;
  }>({
    isOpen: false,
    eventId: '',
    newClassification: 'Known',
  });

  const filteredEvents = useMemo(() => {
    return recognitionEvents.filter((evt) => {
      if (classificationFilter !== 'all' && evt.matchClassification !== classificationFilter) return false;
      if (statusFilter !== 'all' && evt.reviewerStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          evt.id.toLowerCase().includes(q) ||
          evt.sourceDevice.toLowerCase().includes(q) ||
          (evt.associatedIdentityName && evt.associatedIdentityName.toLowerCase().includes(q)) ||
          (evt.notes && evt.notes.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [recognitionEvents, classificationFilter, statusFilter, searchQuery]);

  const handleReviewConfirm = (notes?: string) => {
    if (reviewDialog.eventId) {
      reviewAIRecognitionEvent(reviewDialog.eventId, reviewDialog.newClassification, notes);
      if (selectedEvent?.id === reviewDialog.eventId) {
        setSelectedEvent((prev) =>
          prev
            ? {
                ...prev,
                matchClassification: reviewDialog.newClassification,
                reviewerStatus: 'Reviewed',
                notes: notes || prev.notes,
              }
            : null
        );
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AI Sensor Recognition Events</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Simulated Evaluation Desk
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit simulated optical scan events, match confidence estimates, and administrator verification adjustments.
          </p>
        </div>
      </div>

      {/* Mandatory Biometric Disclaimer */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Cpu className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Mandatory Compliance & Architecture Disclaimer:</strong> All events in this view are synthetic demo match events. No actual facial recognition models, biometric embeddings, or face images are collected, stored, or processed in this frontend application. An AI match does not automatically approve or reject gate entrance.
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
            placeholder="Search recognition event by ID, device, or identity..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Review States</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Flagged">Flagged</option>
          </select>
        </div>
      </div>

      {/* Main Table & Event Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedEvent ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Event ID / Time</th>
                  <th className="py-3 px-4">Source Device (Simulated)</th>
                  <th className="py-3 px-4">Match Classification</th>
                  <th className="py-3 px-4">Matched Identity</th>
                  <th className="py-3 px-4">Simulated Confidence</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEvents.map((evt) => {
                  const isSelected = selectedEvent?.id === evt.id;
                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                        isSelected ? 'bg-blue-50/60 font-medium' : ''
                      }`}
                      onClick={() => setSelectedEvent(evt)}
                    >
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 font-mono block">{evt.id}</span>
                        <span className="text-[10px] text-slate-400">{formatDateTime(evt.timestamp)}</span>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{evt.sourceDevice}</td>

                      <td className="py-3 px-4">
                        <IdentityClassificationBadge classification={evt.matchClassification} />
                      </td>

                      <td className="py-3 px-4">
                        {evt.associatedIdentityName ? (
                          <span className="font-bold text-slate-900">{evt.associatedIdentityName}</span>
                        ) : (
                          <span className="text-slate-400 italic">No registry match</span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.round(evt.confidenceScore * 100)}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px] font-semibold">
                            {Math.round(evt.confidenceScore * 100)}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            evt.reviewerStatus === 'Reviewed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {evt.reviewerStatus}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Event Drawer */}
        {selectedEvent && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 flex flex-col justify-between space-y-4 animate-in fade-in">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Scan Event Details</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedEvent.id}</span>
                </div>
                <button onClick={() => setSelectedEvent(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capture Device:</span>
                    <span className="font-semibold text-slate-800">{selectedEvent.sourceDevice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Simulated Score:</span>
                    <span className="font-mono font-bold text-blue-600">
                      {Math.round(selectedEvent.confidenceScore * 100)}% (Demo Model)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Classification:</span>
                    <IdentityClassificationBadge classification={selectedEvent.matchClassification} />
                  </div>
                </div>

                {selectedEvent.associatedIdentityName && (
                  <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                    <span className="text-slate-500 block text-[11px]">Matched Registry Record:</span>
                    <span className="font-bold text-blue-900 text-sm block">{selectedEvent.associatedIdentityName}</span>
                    {selectedEvent.associatedIdentityId && (
                      <Link
                        href="/identity-registry"
                        className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        Inspect in Registry ({selectedEvent.associatedIdentityId}) <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                {selectedEvent.notes && (
                  <div>
                    <span className="text-slate-500 block">Review Notes:</span>
                    <p className="mt-1 p-2 bg-slate-50 border border-slate-200 text-slate-700 rounded italic">
                      &ldquo;{selectedEvent.notes}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Manual Admin Classification Controls */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Administrative Classification Adjustment
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setReviewDialog({
                      isOpen: true,
                      eventId: selectedEvent.id,
                      newClassification: 'Known',
                    })
                  }
                  className="flex-1 py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold"
                >
                  Confirm Known
                </button>
                <button
                  onClick={() =>
                    setReviewDialog({
                      isOpen: true,
                      eventId: selectedEvent.id,
                      newClassification: 'Unknown',
                    })
                  }
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  Set Unknown
                </button>
                <button
                  onClick={() =>
                    setReviewDialog({
                      isOpen: true,
                      eventId: selectedEvent.id,
                      newClassification: 'Verification Required',
                    })
                  }
                  className="flex-1 py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold"
                >
                  Flag Verify
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={reviewDialog.isOpen}
        onClose={() => setReviewDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleReviewConfirm}
        title={`Adjust AI Event Classification to ${reviewDialog.newClassification}?`}
        description="Save your review determination to the audit log."
        requiresInput={true}
        inputLabel="Admin Review Notes"
        inputPlaceholder="e.g. Identity manually verified against registry photo badge"
        confirmLabel="Save Review"
      />
    </div>
  );
}
