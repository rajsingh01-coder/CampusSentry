'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useDemoStore } from '@/store/demo-store';
import { KpiCard } from '@/components/shared/kpi-card';
import {
  RequestStatusBadge,
  IdentityClassificationBadge,
  VisitorCategoryBadge,
} from '@/components/shared/badge-status';
import { formatDateTime } from '@/lib/utils';
import { getCustomDateRange, getHourlyEventCounts, getLocalDateInputValue, getLocalDateRange, isInDateRange } from '@/lib/workflow';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  UserCheck,
  HelpCircle,
  AlertTriangle,
  Bell,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  BarChart2,
  Calendar,
  Check,
  X,
  Eye,
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
} from 'recharts';

export default function OverviewDashboard() {
  const {
    visitorRequests,
    visitorRecords,
    knownIdentities,
    notifications,
    securityAlerts,
    auditLogs,
    entryExitLogs,
    approveRequest,
    rejectRequest,
    setSimulationModalOpen,
  } = useDemoStore();

  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('today');
  const [customStartDate, setCustomStartDate] = useState(() => getLocalDateInputValue());
  const [customEndDate, setCustomEndDate] = useState(() => getLocalDateInputValue());

  // Computed data-driven metrics
  const range = timeRange === 'custom'
    ? getCustomDateRange(customStartDate, customEndDate)!
    : getLocalDateRange(timeRange);
  const periodRequests = visitorRequests.filter((request) => isInDateRange(request.submittedAt, range));
  const pendingRequests = periodRequests.filter((r) => r.requestStatus === 'Pending Approval');
  const approvedRequests = periodRequests.filter((r) => r.requestStatus === 'Approved');
  const rejectedRequests = periodRequests.filter((r) => r.requestStatus === 'Rejected');
  
  // Real campus presence derived strictly from visitor records
  const visitorsInsideCampus = visitorRecords.filter((v) => !v.isArchived && v.currentPresence === 'Inside Campus').length;

  const knownCount = knownIdentities.filter((k) => !k.isArchived && k.classification === 'Known').length;
  const unknownCount = visitorRecords.filter((v) => v.identityClassification === 'Unknown').length;
  const verificationReqCount = visitorRecords.filter((v) => v.identityClassification === 'Verification Required').length;

  const unreadNotifsCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;
  const openAlertsCount = securityAlerts.filter((a) => a.status === 'Open' || a.status === 'Under Review').length;

  // Chart 1: Visitors by Category
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    periodRequests.forEach((req) => {
      counts[req.visitorCategory] = (counts[req.visitorCategory] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [periodRequests]);

  // Chart 2: Requests by Status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    periodRequests.forEach((req) => {
      counts[req.requestStatus] = (counts[req.requestStatus] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [periodRequests]);

  // Chart 3: Hourly Entry / Exit Activity from real EntryExitLogs
  const hourlyActivityData = getHourlyEventCounts(entryExitLogs, range);

  const PIE_COLORS = ['#2563eb', '#7c3aed', '#059669', '#d97706', '#0891b2', '#e11d48', '#64748b'];

  return (
    <div className="space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Security & Visitor Overview</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated request and gate activity with period-based operational summaries.
          </p>
        </div>

        {/* Date Filter & Quick Actions */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setTimeRange('today')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                timeRange === 'today' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('custom')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                timeRange === 'custom' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Custom
            </button>
          </div>

          <button
            onClick={() => setSimulationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Staff Request
          </button>
        </div>
      </div>
      {timeRange === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
          <label className="flex items-center gap-2">From <input type="date" value={customStartDate} max={customEndDate} onChange={(event) => { if (event.target.value) setCustomStartDate(event.target.value); }} className="rounded border border-slate-300 px-2 py-1" /></label>
          <label className="flex items-center gap-2">To <input type="date" value={customEndDate} min={customStartDate} onChange={(event) => { if (event.target.value) setCustomEndDate(event.target.value); }} className="rounded border border-slate-300 px-2 py-1" /></label>
        </div>
      )}

      {/* Row 1: High Priority Workflow KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting administrative review"
          icon={Clock}
          variant="amber"
          badge="Action Needed"
          href="/visitor-requests?status=Pending Approval"
        />
        <KpiCard
          title="Visitors Inside Campus"
          value={visitorsInsideCampus}
          subtitle="Based on verified entry logs"
          icon={Building2}
          variant="emerald"
          badge="Occupancy"
          href="/entry-exit"
        />
        <KpiCard
          title="Unread Notifications"
          value={unreadNotifsCount}
          subtitle="Staff gate submissions"
          icon={Bell}
          variant="blue"
          badge="Staff Feed"
          href="/notifications"
        />
        <KpiCard
          title="Security Alerts"
          value={openAlertsCount}
          subtitle="Require classification review"
          icon={ShieldAlert}
          variant="rose"
          badge="Audit Flag"
          href="/security"
        />
      </div>

      {/* Row 2: Secondary Classification & Volume KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <KpiCard
          title="Approved Requests"
          value={approvedRequests.length}
          subtitle="Cleared for gate entry"
          icon={CheckCircle2}
          variant="emerald"
          href="/visitor-requests?status=Approved"
        />
        <KpiCard
          title="Rejected Requests"
          value={rejectedRequests.length}
          subtitle="Denied entry at cabin"
          icon={XCircle}
          variant="slate"
          href="/visitor-requests?status=Rejected"
        />
        <KpiCard
          title="Known Registry"
          value={knownCount}
          subtitle="5 canonical seeded records"
          icon={UserCheck}
          variant="indigo"
          href="/identity-registry"
        />
        <KpiCard
          title="Verification Required"
          value={verificationReqCount}
          subtitle="Identity or pass mismatch"
          icon={AlertTriangle}
          variant="amber"
          href="/visitor-records?classification=Verification Required"
        />
      </div>

      {/* Row 3: Actionable Requests Feed & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests Requiring Immediate Admin Review (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                  <span>Priority Visitor Requests Awaiting Decision</span>
                  {pendingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                      {pendingRequests.length} Pending
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct requests submitted by gate security through the Staff Mobile App.
                </p>
              </div>

              <Link
                href="/visitor-requests"
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 overflow-x-auto">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">All visitor requests reviewed!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click &ldquo;Simulate Staff Request&rdquo; to simulate a new arrival at campus gate.
                  </p>
                </div>
              ) : (
                pendingRequests.slice(0, 4).map((req) => (
                  <div key={req.requestId} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{req.visitorName}</span>
                          <IdentityClassificationBadge classification={req.identityClassification} />
                          <VisitorCategoryBadge category={req.visitorCategory} />
                          {req.visitMode === 'Walk-in' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                              Walk-in Arrival
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 flex flex-wrap gap-x-3 gap-y-1">
                          <span>
                            To meet: <strong className="text-slate-800">{req.personToMeet}</strong>
                          </span>
                          <span>•</span>
                          <span>At: {req.gateOrLocation}</span>
                          <span>•</span>
                          <span className="text-slate-400">{formatDateTime(req.submittedAt)}</span>
                        </div>

                        <p className="text-xs text-slate-600 italic line-clamp-1 bg-slate-50 p-1.5 rounded border border-slate-100">
                          &ldquo;{req.reasonForMeeting}&rdquo;
                        </p>
                      </div>

                      {/* Immediate Decision Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/visitor-requests?id=${req.requestId}`}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg flex items-center gap-1 shadow-2xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          Details
                        </Link>
                        <button
                          onClick={() => approveRequest(req.requestId, 'Approved from Overview Dashboard')}
                          className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs flex items-center gap-1 transition-all"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <Link
                          href={`/visitor-requests?id=${req.requestId}`}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          Review / Reject
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
            <span>Decisions update this browser&apos;s demo records. Gate sync requires a production backend.</span>
            <span className="text-[11px] font-mono text-slate-400">DEMO MODE</span>
          </div>
        </div>

        {/* Security Alerts Needing Review & System Audit Timeline (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm text-slate-900">Security Alerts & Audit Log</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recent simulated gate and review events</p>
            </div>
            <Link href="/audit-logs" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
              Logs
            </Link>
          </div>

          <div className="p-4 divide-y divide-slate-100 max-h-96 overflow-y-auto space-y-3">
            {auditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="pt-2 first:pt-0 text-xs">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-medium text-slate-700">{log.action}</span>
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
                <p className="text-slate-600 mt-0.5 leading-snug">{log.description}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
                  <span>Actor: {log.actor}</span>
                  <span>•</span>
                  <span className="font-mono">{log.entityId}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-3 bg-slate-50 border-t border-slate-200">
            <Link
              href="/security"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
            >
              Inspect Security Monitoring Desk <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Row 4: Analytics Charts (Visitors by Category & Request Status Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visitors by Category Donut Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Visitors by Category</h3>
          <p className="text-xs text-slate-500 mb-4">Distribution of arrival classifications</p>

          <div className="h-60">
            {categoryData.length === 0 ? <div className="h-full grid place-items-center text-sm text-slate-500">No requests in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [`${val} visitors`, 'Count']}
                  contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Requests by Approval Status Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Requests by Status</h3>
          <p className="text-xs text-slate-500 mb-4">Administrative workflow breakdown</p>

          <div className="h-60">
            {statusData.length === 0 ? <div className="h-full grid place-items-center text-sm text-slate-500">No requests in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Simulated Hourly Entry / Exit Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <h3 className="font-semibold text-sm text-slate-900 mb-1">Hourly Campus Activity</h3>
          <p className="text-xs text-slate-500 mb-4">Gate turnstile entries vs exits</p>

          <div className="h-60">
            {!hourlyActivityData.some((event) => event.entries || event.exits) ? <div className="h-full grid place-items-center text-sm text-slate-500">No gate events in this period.</div> :
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyActivityData}>
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="entries" stroke="#10b981" fill="#d1fae5" name="Gate Entries" />
                <Area type="monotone" dataKey="exits" stroke="#6366f1" fill="#e0e7ff" name="Gate Exits" />
              </AreaChart>
            </ResponsiveContainer>
            }
          </div>
        </div>
      </div>
    </div>
  );
}
