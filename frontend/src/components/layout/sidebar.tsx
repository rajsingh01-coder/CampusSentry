'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Bell, Inbox, Users, Fingerprint, UserCheck, ShieldAlert,
  DoorOpen, BarChart3, ScanEye, FileText, Settings, ChevronLeft,
  ChevronRight, Shield, LogOut,
} from 'lucide-react';

type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: 'notifications' | 'requests' | 'alerts';
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Workspace',
    items: [
      { name: 'Overview', href: '/', icon: LayoutDashboard },
      { name: 'Staff Notifications', href: '/notifications', icon: Bell, badgeKey: 'notifications' as const },
      { name: 'Visitor Requests', href: '/visitor-requests', icon: Inbox, badgeKey: 'requests' as const },
      { name: 'Visitor Records', href: '/visitor-records', icon: Users },
      { name: 'Known Identity Registry', href: '/identity-registry', icon: Fingerprint },
    ],
  },
  {
    label: 'Campus operations',
    items: [
      { name: 'Staff Management', href: '/staff', icon: UserCheck },
      { name: 'Security Monitoring', href: '/security', icon: ShieldAlert, badgeKey: 'alerts' as const },
      { name: 'Entry/Exit Logs', href: '/entry-exit', icon: DoorOpen },
    ],
  },
  {
    label: 'Insights & system',
    items: [
      { name: 'Reports & Analytics', href: '/analytics', icon: BarChart3 },
      { name: 'AI Recognition Events', href: '/recognition-events', icon: ScanEye },
      { name: 'Audit Logs', href: '/audit-logs', icon: FileText },
      { name: 'System Settings', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { notifications, visitorRequests, securityAlerts, currentUser } = useDemoStore();

  const counts = {
    notifications: notifications.filter((item) => !item.isRead && !item.isArchived).length,
    requests: visitorRequests.filter((item) => item.requestStatus === 'Pending Approval').length,
    alerts: securityAlerts.filter((item) => item.status === 'Open' || item.status === 'Under Review').length,
  };

  const links = navGroups.flatMap((group) => group.items);
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <nav aria-label="Primary navigation" className="mobile-nav md:hidden">
        {links.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const count = item.badgeKey ? counts[item.badgeKey] : 0;
          return (
            <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} aria-label={`${item.name}${count > 0 ? `, ${count} updates` : ''}`} title={item.name}
              className={`mobile-nav-link ${active ? 'is-active' : ''}`}>
              <span className="relative"><Icon aria-hidden="true" className="h-4 w-4" />{count > 0 && <span className="mobile-nav-dot" />}</span>
              <span className="mobile-nav-label">{item.name.replace('Staff ', '').replace('Known Identity ', '').replace('Security ', '').replace('Reports & ', '')}</span>
            </Link>
          );
        })}
      </nav>

      <aside className={`app-sidebar hidden md:flex ${isCollapsed ? 'is-collapsed' : ''}`}>
        <div className="sidebar-top">
          <div className="sidebar-brand-row">
            <Link href="/" className="sidebar-brand" aria-label="CampusSentry overview">
              <span className="brand-mark"><Shield aria-hidden="true" className="h-[19px] w-[19px]" /></span>
              {!isCollapsed && <span className="brand-copy"><span>CampusSentry</span><small>Campus operations</small></span>}
            </Link>
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="sidebar-collapse" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          <nav aria-label="Primary navigation" className="sidebar-navigation">
            {navGroups.map((group) => (
              <div key={group.label} className="sidebar-group">
                {!isCollapsed && <p className="sidebar-section-label">{group.label}</p>}
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  const count = item.badgeKey ? counts[item.badgeKey] : 0;
                  return (
                    <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} aria-label={item.name} title={isCollapsed ? item.name : undefined}
                      className={`sidebar-nav-link ${active ? 'is-active' : ''}`}>
                      <Icon aria-hidden="true" className="sidebar-nav-icon" />
                      {!isCollapsed && <span className="sidebar-nav-name">{item.name}</span>}
                      {!isCollapsed && count > 0 && <span className={`sidebar-count ${item.badgeKey === 'alerts' ? 'is-alert' : item.badgeKey === 'requests' ? 'is-pending' : ''}`}>{count > 99 ? '99+' : count}</span>}
                      {isCollapsed && count > 0 && <span aria-hidden="true" className={`sidebar-count-dot ${item.badgeKey === 'alerts' ? 'is-alert' : ''}`} />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        <div className="sidebar-account">
          <span className="account-avatar">{currentUser.name.charAt(0)}</span>
          {!isCollapsed && <span className="account-copy"><strong>{currentUser.name}</strong><small>{currentUser.department}</small></span>}
          {!isCollapsed && <Link href="/login" className="account-signout" aria-label="Switch account" title="Switch account"><LogOut className="h-4 w-4" /></Link>}
        </div>
      </aside>
    </>
  );
}
