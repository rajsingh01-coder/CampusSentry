'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/store/demo-store';
import { SecurityAlert, SecurityAlertPriority, SecurityAlertStatus } from '@/types';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { formatDateTime } from '@/lib/utils';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Video,
  ExternalLink,
  ShieldCheck,
  Eye,
  Radio,
  X,
} from 'lucide-react';

export default function SecurityMonitoringPage() {
  const { securityAlerts, updateSecurityAlertStatus, currentUser } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState<SecurityAlert | null>(null);

  // Resolution Dialog
  const [resolveDialog, setResolveDialog] = useState<{
    isOpen: boolean;
    alertId: string;
    newStatus: SecurityAlertStatus;
  }>({
    isOpen: false,
    alertId: '',
    newStatus: 'Resolved',
  });

  const filteredAlerts = useMemo(() => {
    return securityAlerts.filter((alert) => {
      if (priorityFilter !== 'all' && alert.priority !== priorityFilter) return false;
      if (statusFilter !== 'all' && alert.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          alert.description.toLowerCase().includes(q) ||
          alert.category.toLowerCase().includes(q) ||
          alert.id.toLowerCase().includes(q) ||
          (alert.relatedVisitorName && alert.relatedVisitorName.toLowerCase().includes(q)) ||
          alert.deviceOrGate.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [securityAlerts, priorityFilter, statusFilter, searchQuery]);

  const handleStatusChange = (notes?: string) => {
    if (resolveDialog.alertId) {
      updateSecurityAlertStatus(resolveDialog.alertId, resolveDialog.newStatus, notes);
      if (selectedAlert?.id === resolveDialog.alertId) {
        setSelectedAlert((prev) =>
          prev ? { ...prev, status: resolveDialog.newStatus, resolutionNotes: notes } : null
        );
      }
    }
  };

  const openAlertsCount = securityAlerts.filter((a) => a.status === 'Open').length;
  const underReviewCount = securityAlerts.filter((a) => a.status === 'Under Review').length;

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Incident Monitoring</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
              {openAlertsCount} Open Alerts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated sensor health and security review alerts. No live cameras, gates, or identity service are connected.
          </p>
        </div>
      </div>

      {/* Sensor & Health Status Banner (Simulated) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Gate Sensor Grid</span>
            <span className="text-sm font-bold text-slate-900">Simulated Devices Active</span>
            <span className="text-[10px] text-emerald-600 block font-medium">3 Gate Nodes Polling</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
            <Cpu className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">AI Matching Service</span>
            <span className="text-sm font-bold text-slate-900">Simulated Environment</span>
            <span className="text-[10px] text-blue-600 block font-medium">Zero real biometric data</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
            <Video className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Camera Video Feeds</span>
            <span className="text-sm font-bold text-slate-900">No Physical Streams</span>
            <span className="text-[10px] text-slate-500 block font-medium">Synthetic events only</span>
          </div>
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
            placeholder="Search security alerts by description, gate, or visitor..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Review Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Alerts Table & Review Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedAlert ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Alert ID / Time</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description / Target</th>
                  <th className="py-3 px-4">Device Node</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      No security alerts match criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isSelected = selectedAlert?.id === alert.id;
                    return (
                      <tr
                        key={alert.id}
                        className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/60 font-medium' : ''
                        }`}
                        onClick={() => setSelectedAlert(alert)}
                      >
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-900 font-mono block">{alert.id}</span>
                          <span className="text-[10px] text-slate-400">{formatDateTime(alert.timestamp)}</span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              alert.priority === 'Critical'
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : alert.priority === 'High'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : alert.priority === 'Medium'
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {alert.priority}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-semibold text-slate-800">{alert.category}</td>

                        <td className="py-3 px-4 max-w-xs">
                          <p className="text-slate-900 leading-snug line-clamp-1">{alert.description}</p>
                          {alert.relatedVisitorName && (
                            <span className="text-[11px] text-blue-600 block mt-0.5">
                              Visitor: {alert.relatedVisitorName}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{alert.deviceOrGate}</td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              alert.status === 'Open'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : alert.status === 'Under Review'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {alert.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded"
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
        </div>

        {/* Selected Alert Details Drawer */}
        {selectedAlert && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-md p-5 flex flex-col justify-between space-y-4 animate-in fade-in">
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{selectedAlert.category}</h3>
                  <span className="text-xs text-slate-400 font-mono">Incident: {selectedAlert.id}</span>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="text-slate-400 hover:text-slate-700 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Incident Narrative:</span>
                  <p className="mt-1 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-slate-800 leading-relaxed font-medium">
                    {selectedAlert.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Device Node:</span>
                    <span className="font-semibold text-slate-700">{selectedAlert.deviceOrGate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">AI Service Health:</span>
                    <span className="font-semibold text-emerald-600">{selectedAlert.recognitionServiceHealth}</span>
                  </div>
                </div>

                {selectedAlert.relatedVisitorName && (
                  <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-200 text-[11px]">
                    <span className="text-slate-500 block">Correlated Visitor:</span>
                    <span className="font-bold text-blue-800 text-xs block">{selectedAlert.relatedVisitorName}</span>
                    {selectedAlert.relatedRequestId && (
                      <Link
                        href={`/visitor-requests?id=${selectedAlert.relatedRequestId}`}
                        className="text-blue-600 hover:underline flex items-center gap-1 mt-1 font-semibold"
                      >
                        Inspect Request {selectedAlert.relatedRequestId} <ExternalLink className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                )}

                {selectedAlert.resolutionNotes && (
                  <div>
                    <span className="text-slate-500 block">Resolution Notes:</span>
                    <p className="mt-1 p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded">
                      {selectedAlert.resolutionNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Resolution Actions */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Security Desk Actions
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    setResolveDialog({
                      isOpen: true,
                      alertId: selectedAlert.id,
                      newStatus: 'Under Review',
                    })
                  }
                  className="py-1.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold"
                >
                  Mark Under Review
                </button>
                <button
                  onClick={() =>
                    setResolveDialog({
                      isOpen: true,
                      alertId: selectedAlert.id,
                      newStatus: 'Resolved',
                    })
                  }
                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                >
                  Resolve Alert
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={resolveDialog.isOpen}
        onClose={() => setResolveDialog((p) => ({ ...p, isOpen: false }))}
        onConfirm={handleStatusChange}
        title={`Update Incident Status to ${resolveDialog.newStatus}?`}
        description="Record administrative resolution or investigative note for the security log."
        requiresInput={true}
        inputLabel="Investigation / Resolution Notes"
        inputPlaceholder="e.g. Visitor identity re-checked against registrar list and cleared."
        confirmLabel="Save Security Log"
      />
    </div>
  );
}
