'use client';

import React, { useState, useMemo } from 'react';
import { useDemoStore } from '@/store/demo-store';
import { exportToCsv } from '@/lib/utils';
import { getCustomDateRange, getHourlyEventCounts, getLocalDateInputValue, getLocalDateRange, isInDateRange } from '@/lib/workflow';
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Users,
  CheckCircle2,
  XCircle,
  Building2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line,
} from 'recharts';

export default function ReportsAnalyticsPage() {
  const {
    visitorRequests,
    visitorRecords,
    entryExitLogs,
    staffUsers,
  } = useDemoStore();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState(() => getLocalDateInputValue());
  const [customEndDate, setCustomEndDate] = useState(() => getLocalDateInputValue());
  const range = dateFilter === 'custom'
    ? getCustomDateRange(customStartDate, customEndDate)!
    : getLocalDateRange(dateFilter);
  const periodRequests = visitorRequests.filter((request) => isInDateRange(request.submittedAt, range));
  const periodVisitors = visitorRecords.filter((visitor) => !visitor.isArchived && isInDateRange(visitor.registeredAt, range));

  // Compute stats strictly from shared store
  const totalVisitors = periodVisitors.length;
  const approvedRequests = periodRequests.filter((r) => r.requestStatus === 'Approved').length;
  const rejectedRequests = periodRequests.filter((r) => r.requestStatus === 'Rejected').length;
  const pendingRequests = periodRequests.filter((r) => r.requestStatus === 'Pending Approval').length;
  const decidedRequests = approvedRequests + rejectedRequests;
  const campusOccupancy = visitorRecords.filter((v) => !v.isArchived && v.currentPresence === 'Inside Campus').length;

  // Chart 1: Category Breakdown
  const categoryChartData = useMemo(() => {
    const map: Record<string, number> = {};
      periodRequests.forEach((r) => {
      map[r.visitorCategory] = (map[r.visitorCategory] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodRequests]);

  // Chart 2: Identity Classification Breakdown
  const classificationChartData = useMemo(() => {
    const map: Record<string, number> = {
      Known: 0,
      Unknown: 0,
      'Verification Required': 0,
    };
    periodVisitors.forEach((r) => {
      map[r.identityClassification] = (map[r.identityClassification] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [periodVisitors]);

  // Chart 3: Requests Submitted by Gate Staff
  const staffActivityData = useMemo(() => {
    return staffUsers.map((staff) => ({
      name: staff.name.split(' ')[0],
      role: staff.role,
      requests: periodRequests.filter((request) => request.submittedByStaffId === staff.staffId).length,
    }));
  }, [staffUsers, periodRequests]);

  // Chart 4: Hourly Turnstile Activity
  const hourlyActivityData = getHourlyEventCounts(entryExitLogs, range);

  const COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0891b2', '#e11d48', '#64748b'];

  const handleExportSummaryCsv = () => {
    const headers = ['Metric', 'Value', 'Scope'];
    const rows = [
      ['Selected Period Start', range.start.toISOString(), 'Local date filter'],
      ['Selected Period End', range.end.toISOString(), 'Local date filter'],
      ['Visitors Registered', totalVisitors, 'Selected period'],
      ['Pending Approval Requests', pendingRequests, 'Selected period'],
      ['Approved Requests', approvedRequests, 'Selected period'],
      ['Rejected Requests', rejectedRequests, 'Selected period'],
      ['Current Campus Presence', campusOccupancy, 'Current snapshot; not period-filtered'],
    ];

    exportToCsv('campussentry_analytics_summary', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security & Visitor Analytics</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Aggregated Metrics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational intelligence derived strictly from shared demo records, gate logs, and staff submissions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                dateFilter === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('week')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                dateFilter === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setDateFilter('month')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                dateFilter === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                dateFilter === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={handleExportSummaryCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Summary CSV
          </button>
        </div>
      </div>
      {dateFilter === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
          <label className="flex items-center gap-2">From <input type="date" value={customStartDate} max={customEndDate} onChange={(event) => { if (event.target.value) setCustomStartDate(event.target.value); }} className="rounded border border-slate-300 px-2 py-1" /></label>
          <label className="flex items-center gap-2">To <input type="date" value={customEndDate} min={customStartDate} onChange={(event) => { if (event.target.value) setCustomEndDate(event.target.value); }} className="rounded border border-slate-300 px-2 py-1" /></label>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Visitors</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{totalVisitors}</p>
          <span className="text-[11px] text-slate-400">Total registered in ledger</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Approval Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {decidedRequests > 0 ? `${Math.round((approvedRequests / decidedRequests) * 100)}%` : '0%'}
          </p>
          <span className="text-[11px] text-slate-400">
            {approvedRequests} approved vs {rejectedRequests} rejected
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Campus Presence</span>
          <p className="text-2xl font-bold text-blue-600 mt-1">{campusOccupancy}</p>
          <span className="text-[11px] text-slate-400">Currently verified inside campus</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Awaiting Action</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{pendingRequests}</p>
          <span className="text-[11px] text-slate-400">Pending administrative decision</span>
        </div>
      </div>

      {/* Charts Row 1: Category vs Classification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Visitor Category Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution by visitor type (Who arrived)</p>
          <div className="h-64">
            {categoryChartData.length === 0 ? <div className="h-full grid place-items-center text-sm text-slate-500">No requests in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Identity Classification Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Known vs Unknown vs Verification Required</p>
          <div className="h-64">
            {periodVisitors.length === 0 ? <div className="h-full grid place-items-center text-sm text-slate-500">No visitor records in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classificationChartData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            }
          </div>
        </div>
      </div>

      {/* Charts Row 2: Staff Activity & Hourly Turnstile Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Staff Submissions by Gate Personnel</h3>
          <p className="text-xs text-slate-500 mb-4">Visitor meeting requests dispatched per security staff</p>
          <div className="h-64">
            {periodRequests.length === 0 ? <div className="h-full grid place-items-center text-sm text-slate-500">No submissions in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffActivityData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="requests" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            }
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Hourly Campus Turnstile Traffic</h3>
          <p className="text-xs text-slate-500 mb-4">Entries and exits recorded across gates</p>
          <div className="h-64">
            {!hourlyActivityData.some((event) => event.entries || event.exits) ? <div className="h-full grid place-items-center text-sm text-slate-500">No gate events in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyActivityData}>
                <XAxis dataKey="time" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="entries" stroke="#10b981" fill="#d1fae5" name="Entries" />
                <Area type="monotone" dataKey="exits" stroke="#8b5cf6" fill="#ede9fe" name="Exits" />
              </AreaChart>
            </ResponsiveContainer>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
