'use client';

import React, { useState, useMemo } from 'react';
import { useDemoStore } from '@/store/demo-store';
import { formatDateTime, exportToCsv } from '@/lib/utils';
import {
  FileText,
  Search,
  Filter,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ShieldAlert,
} from 'lucide-react';

export default function AuditLogsPage() {
  const { auditLogs } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const [resultFilter, setResultFilter] = useState('all');

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      if (entityFilter !== 'all' && log.entityType !== entityFilter) return false;
      if (resultFilter !== 'all' && log.result !== resultFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.description.toLowerCase().includes(q) ||
          log.action.toLowerCase().includes(q) ||
          log.actor.toLowerCase().includes(q) ||
          log.entityId.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [auditLogs, entityFilter, resultFilter, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Event ID',
      'Timestamp',
      'Actor',
      'Action',
      'Entity Type',
      'Entity ID',
      'Description',
      'Result',
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      l.actor,
      l.action,
      l.entityType,
      l.entityId,
      l.description,
      l.result,
    ]);

    exportToCsv('campus_audit_logs', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Audit & Compliance Log</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              {filteredLogs.length} events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Client-side demo audit trail for visitor decisions, classification changes, and staff actions. Browser storage is editable and is not tamper-proof.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export Audit CSV
        </button>
      </div>

      {/* Compliance Disclaimer Notice */}
      <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Compliance Architecture Notice:</strong> This audit trail records all demo operations sequentially. In production, audit logs are forwarded to an append-only, tamper-evident SIEM service with cryptographic hashing and hardware security module (HSM) timestamps.
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
            placeholder="Search audit trail by actor, entity ID, action, or description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Entity Types</option>
            <option value="Request">Requests</option>
            <option value="Visitor">Visitors</option>
            <option value="Identity">Identities</option>
            <option value="Staff">Staff</option>
            <option value="SecurityAlert">Security Alerts</option>
            <option value="RecognitionEvent">Recognition Events</option>
            <option value="Settings">Settings</option>
          </select>

          <select
            value={resultFilter}
            onChange={(e) => setResultFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Results</option>
            <option value="Success">Success</option>
            <option value="Warning">Warning</option>
            <option value="Error">Error</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Event ID / Time</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="font-bold text-slate-900 font-mono block">{log.id}</span>
                    <span className="text-[10px] text-slate-400">{formatDateTime(log.timestamp)}</span>
                  </td>

                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">{log.actor}</td>

                  <td className="py-3 px-4">
                    <span className="font-medium text-blue-700 bg-blue-50/60 px-2 py-0.5 rounded border border-blue-100">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-600 font-medium">{log.entityType}</span>
                    <span className="text-[10px] font-mono text-slate-400 block">{log.entityId}</span>
                  </td>

                  <td className="py-3 px-4 max-w-md">
                    <p className="text-slate-700 leading-snug">{log.description}</p>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {log.result === 'Success' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Success
                      </span>
                    ) : log.result === 'Warning' ? (
                      <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Warning
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" /> Error
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
