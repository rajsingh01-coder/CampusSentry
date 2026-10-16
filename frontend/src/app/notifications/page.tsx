'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';
import {
  RequestStatusBadge,
  IdentityClassificationBadge,
  VisitorCategoryBadge,
  OtpStatusBadge,
} from '@/components/shared/badge-status';
import { formatDateTime } from '@/lib/utils';
import {
  Bell,
  Search,
  Filter,
  CheckCheck,
  Archive,
  ArrowRight,
  ExternalLink,
  Sparkles,
  MapPin,
  Clock,
  User,
  Phone,
  Building,
  CheckCircle,
} from 'lucide-react';

export default function StaffNotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    archiveNotification,
    setSimulationModalOpen,
    settings,
  } = useDemoStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [classificationFilter, setClassificationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Filtered and sorted notifications
  const filteredNotifications = useMemo(() => {
    return notifications
      .filter((notif) => {
        if (notif.isArchived) return false;
        if (readFilter === 'unread' && notif.isRead) return false;
        if (readFilter === 'read' && !notif.isRead) return false;
        if (categoryFilter !== 'all' && notif.visitorCategory !== categoryFilter) return false;
        if (classificationFilter !== 'all' && notif.identityClassification !== classificationFilter) return false;
        if (statusFilter !== 'all' && notif.requestStatus !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            notif.visitorName.toLowerCase().includes(q) ||
            notif.requestId.toLowerCase().includes(q) ||
            notif.personToMeet.toLowerCase().includes(q) ||
            notif.reasonForMeeting.toLowerCase().includes(q) ||
            notif.submittedByStaffName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.submittedAt).getTime();
        const timeB = new Date(b.submittedAt).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [notifications, searchQuery, categoryFilter, classificationFilter, statusFilter, readFilter, sortOrder]);

  const unreadCount = notifications.filter((n) => !n.isRead && !n.isArchived).length;

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Meeting Request Alerts</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated notifications generated in this browser. Cross-device delivery requires the staff app and a backend service.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              Mark all as read
            </button>
          )}

          <button
            onClick={() => setSimulationModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Simulate Incoming Staff Request
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by visitor name, request ID, person to meet, or staff member..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

          {/* Read / Unread */}
          <div>
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value as 'all' | 'unread' | 'read')}
              className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-500 font-medium">Filter by:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50"
            >
              <option value="all">All Categories (Who arrived)</option>
              {settings.visitorCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>

            <select
              value={classificationFilter}
              onChange={(e) => setClassificationFilter(e.target.value)}
              className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50"
            >
              <option value="all">All Classifications</option>
              <option value="Known">Known</option>
              <option value="Unknown">Unknown</option>
              <option value="Verification Required">Verification Required</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500">Sort by:</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
              className="px-2 py-1 text-xs border border-slate-200 rounded bg-slate-50 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No staff-submitted meeting requests match the selected filters. Use the simulation tool to create a new arrival.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-xl border transition-all p-5 shadow-xs ${
                !notif.isRead
                  ? 'bg-blue-50/30 border-blue-200 hover:border-blue-300'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Left Section: Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                    )}
                    <span className="font-bold text-base text-slate-900">{notif.visitorName}</span>
                    <span className="text-xs text-slate-400 font-mono">({notif.requestId})</span>
                    <IdentityClassificationBadge classification={notif.identityClassification} />
                    <VisitorCategoryBadge category={notif.visitorCategory} />
                    {notif.isWalkIn ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        Walk-in / Immediate
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        Scheduled: {notif.requestedDate} @ {notif.requestedTime}
                      </span>
                    )}
                    <RequestStatusBadge status={notif.requestStatus} />
                  </div>

                  {/* Core Meeting Info: Whom & Why */}
                  <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-100 space-y-1 text-xs">
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Intended Recipient:</strong>{' '}
                      <span className="text-blue-700 font-semibold">{notif.personToMeet}</span>
                      {notif.departmentOrOffice && notif.departmentOrOffice !== 'Not provided' && (
                        <span className="text-slate-500"> ({notif.departmentOrOffice})</span>
                      )}
                    </p>
                    <p className="text-slate-700">
                      <strong className="text-slate-900">Stated Purpose:</strong>{' '}
                      <span className="italic">&ldquo;{notif.reasonForMeeting}&rdquo;</span>
                    </p>
                    {notif.staffNotes && (
                      <p className="text-slate-600 text-[11px] pt-1 border-t border-slate-200/60">
                        <strong className="text-slate-800">Staff Remark:</strong> {notif.staffNotes}
                      </p>
                    )}
                  </div>

                  {/* Meta: Location, Gate Staff, Phone, OTP */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {notif.gateLocation}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      Staff: {notif.submittedByStaffName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {notif.phoneNumber}
                    </span>
                    <OtpStatusBadge status={notif.otpStatus} />
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(notif.submittedAt)}
                    </span>
                  </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <Link
                    href={`/visitor-requests?id=${notif.requestId}`}
                    onClick={() => markNotificationAsRead(notif.id)}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>Review Request</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <div className="flex items-center gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="px-2 py-1 text-[11px] text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Mark as read"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => archiveNotification(notif.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                      title="Archive notification"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
