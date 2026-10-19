'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/store/demo-store';
import { EntryExitType } from '@/types';
import { formatDateTime, exportToCsv } from '@/lib/utils';
import { getLocalDateRange, isInDateRange } from '@/lib/workflow';
import {
  DoorOpen,
  Search,
  Filter,
  Download,
  LogIn,
  LogOut,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default function EntryExitLogsPage() {
  const { entryExitLogs, visitorRecords } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<'all' | EntryExitType>('all');
  const [gateFilter, setGateFilter] = useState('all');
  const todayRange = getLocalDateRange('today');

  // Derive campus occupancy accurately
  const activeOccupancy = visitorRecords.filter((v) => !v.isArchived && v.currentPresence === 'Inside Campus').length;
  const totalEntriesToday = entryExitLogs.filter((l) => l.eventType === 'Entry' && isInDateRange(l.timestamp, todayRange)).length;
  const totalExitsToday = entryExitLogs.filter((l) => l.eventType === 'Exit' && isInDateRange(l.timestamp, todayRange)).length;

  const filteredLogs = useMemo(() => {
    return entryExitLogs.filter((log) => {
      if (eventTypeFilter !== 'all' && log.eventType !== eventTypeFilter) return false;
      if (gateFilter !== 'all' && log.gateOrLocation !== gateFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          log.visitorName.toLowerCase().includes(q) ||
          log.visitorId.toLowerCase().includes(q) ||
          log.id.toLowerCase().includes(q) ||
          log.recordingStaffName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [entryExitLogs, eventTypeFilter, gateFilter, searchQuery]);

  const handleExportCsv = () => {
    const headers = [
      'Log ID',
      'Visitor ID',
      'Visitor Name',
      'Event Type',
      'Gate Location',
      'Timestamp',
      'Recording Staff',
      'Source',
    ];

    const rows = filteredLogs.map((l) => [
      l.id,
      l.visitorId,
      l.visitorName,
      l.eventType,
      l.gateOrLocation,
      l.timestamp,
      l.recordingStaffName,
      l.source,
    ]);

    exportToCsv('campus_entry_exit_logs', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gate Entry & Exit Logs</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              Simulated Gate Event Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of campus access gates. Occupancy statistics derived from check-in & check-out records.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          Export CSV
        </button>
      </div>

      {/* Occupancy Derived KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">Current Inside Campus</span>
            <span className="text-2xl font-bold text-slate-900">{activeOccupancy}</span>
            <p className="text-[11px] text-emerald-600 mt-0.5">Current presence from simulated check-in/out events</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">Total Entries</span>
            <span className="text-2xl font-bold text-slate-900">{totalEntriesToday}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Gate check-ins recorded</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <LogIn className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block uppercase">Total Exits</span>
            <span className="text-2xl font-bold text-slate-900">{totalExitsToday}</span>
            <p className="text-[11px] text-slate-400 mt-0.5">Gate check-outs recorded</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <LogOut className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by visitor name, log ID, or staff..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value as 'all' | EntryExitType)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Events (Entry & Exit)</option>
            <option value="Entry">Entry Only</option>
            <option value="Exit">Exit Only</option>
          </select>

          <select
            value={gateFilter}
            onChange={(e) => setGateFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
          >
            <option value="all">All Gate Locations</option>
            <option value="Main Gate 1">Main Gate 1</option>
            <option value="North Gate 2">North Gate 2</option>
            <option value="South Service Gate 3">South Service Gate 3</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Visitor</th>
                <th className="py-3 px-4">Gate Location</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Recording Staff</th>
                <th className="py-3 px-4">Source Channel</th>
                <th className="py-3 px-4 text-right">Log ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No entry/exit logs recorded matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.eventType === 'Entry' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <LogIn className="w-3.5 h-3.5" />
                          Gate Entry
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          <LogOut className="w-3.5 h-3.5" />
                          Gate Exit
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{log.visitorName}</span>
                      <span className="text-[10px] font-mono text-slate-400">{log.visitorId}</span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">{log.gateOrLocation}</td>

                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {formatDateTime(log.timestamp)}
                    </td>

                    <td className="py-3 px-4 text-slate-700">{log.recordingStaffName}</td>

                    <td className="py-3 px-4 text-slate-500">
                      <span className="text-[11px] font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {log.source}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">{log.id}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
