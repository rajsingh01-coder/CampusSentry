'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';
import {
  Bell,
  Search,
  Sparkles,
  RotateCcw,
  User,
  CheckCheck,
  ChevronDown,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { RequestStatusBadge, IdentityClassificationBadge } from '@/components/shared/badge-status';
import { useThemePreference } from './theme-provider';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

export function Header() {
  const router = useRouter();
  const { preference, setPreference } = useThemePreference();

  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setSimulationModalOpen,
    resetDemoData,
    currentUser,
    globalSearchQuery,
    setGlobalSearchQuery,
  } = useDemoStore();

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.isRead && !n.isArchived);
  const recentNotifs = notifications.filter((n) => !n.isArchived).slice(0, 5);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
        setIsProfileMenuOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNotifDropdownOpen(false);
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalSearchQuery.trim()) {
      router.push(`/visitor-requests?q=${encodeURIComponent(globalSearchQuery.trim())}`);
    }
  };

  return (
    <header className="min-h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between gap-3 sticky top-0 z-30 shadow-xs">
      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} aria-label="Search visitor requests" className="max-w-md flex-1 min-w-0 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={globalSearchQuery}
          onChange={(e) => setGlobalSearchQuery(e.target.value)}
          placeholder="Search requests by visitor, phone, or request ID..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </form>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 shrink-0" ref={dropdownRef}>
        {/* Simulate Staff Request CTA */}
        <button
          onClick={() => setSimulationModalOpen(true)}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-200" />
          <span>Simulate Staff Request</span>
        </button>

        {/* Notifications Bell & Dropdown */}
        <div className="relative">
          <button
            aria-label="Notifications"
            aria-expanded={isNotifDropdownOpen}
            aria-haspopup="true"
            onClick={() => {
              setIsNotifDropdownOpen(!isNotifDropdownOpen);
              setIsProfileMenuOpen(false);
            }}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg relative transition-colors"
            title="Staff Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-rose-500 text-white rounded-full px-1 shadow animate-pulse">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifDropdownOpen && (
            <div role="dialog" aria-label="Recent visitor request notifications" className="absolute right-0 mt-2 w-[min(24rem,calc(100vw-1rem))] bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-150">
              <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">Staff Meeting Requests</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500 text-white font-bold">
                    {unreadNotifs.length} unread
                  </span>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1 transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {recentNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No recent staff notifications
                  </div>
                ) : (
                  recentNotifs.map((notif) => (
                    <Link
                      key={notif.id}
                      href={`/visitor-requests?id=${notif.requestId}`}
                      onClick={() => {
                        markNotificationAsRead(notif.id);
                        setIsNotifDropdownOpen(false);
                      }}
                      className={`block p-3 text-xs hover:bg-slate-50 transition-colors ${
                        !notif.isRead ? 'bg-blue-50/40 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{notif.visitorName}</span>
                          <IdentityClassificationBadge classification={notif.identityClassification} />
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {formatDateTime(notif.submittedAt)}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] mt-1 line-clamp-1">
                        Seeking meeting with: <strong className="text-slate-800">{notif.personToMeet}</strong>
                      </p>
                      <p className="text-slate-500 text-[11px] line-clamp-1 italic">
                        &ldquo;{notif.reasonForMeeting}&rdquo;
                      </p>

                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Submitted by: {notif.submittedByStaffName}</span>
                        <RequestStatusBadge status={notif.requestStatus} />
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
                <Link
                  href="/notifications"
                  onClick={() => setIsNotifDropdownOpen(false)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1"
                >
                  View all staff notifications <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Menu */}
        <div className="relative">
          <button
            aria-label={`Profile menu for ${currentUser.name}`}
            aria-expanded={isProfileMenuOpen}
            aria-haspopup="true"
            onClick={() => {
              setIsProfileMenuOpen(!isProfileMenuOpen);
              setIsNotifDropdownOpen(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <span className="font-semibold text-slate-900 block leading-tight">{currentUser.name}</span>
              <span className="text-[11px] text-slate-500 leading-tight block">{currentUser.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {isProfileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="mt-1 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {currentUser.department}
                </span>
              </div>

              <div className="px-4 py-2 border-b border-slate-100">
                <label htmlFor="theme-preference" className="block text-[11px] font-medium text-slate-600 mb-1">Appearance</label>
                <select
                  id="theme-preference"
                  value={preference}
                  onChange={(event) => setPreference(event.target.value as 'light' | 'dark' | 'system')}
                  className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <Link
                href="/settings"
                onClick={() => setIsProfileMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                System Settings
              </Link>
              <button
                onClick={() => {
                  setShowResetDialog(true);
                  setIsProfileMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Demo Data
              </button>
              <div className="border-t border-slate-100 my-1"></div>
              <Link
                href="/login"
                onClick={() => setIsProfileMenuOpen(false)}
                className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                Sign Out
              </Link>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={resetDemoData}
        title="Reset all demo data?"
        description="Requests, visitors, notifications, logs, settings, and the identity registry will return to their seeded state."
        variant="warning"
        confirmLabel="Reset Demo Data"
      />
    </header>
  );
}
