'use client';

import React, { useState } from 'react';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { INITIAL_SETTINGS } from '@/mocks/demo-data';
import { useDemoStore } from '@/store/demo-store';
import {
  Settings,
  Save,
  RotateCcw,
  CheckCircle2,
  Server,
  Database,
  Key,
  Cpu,
  Video,
  ShieldCheck,
  Bell,
  Sliders,
  AlertCircle,
} from 'lucide-react';

export default function SystemSettingsPage() {
  const { settings, updateSettings, resetDemoData } = useDemoStore();

  const [categories, setCategories] = useState<string[]>(settings.visitorCategories);
  const [authorities, setAuthorities] = useState<string[]>(settings.authorizedMeetingAuthorities);
  const [newCategory, setNewCategory] = useState('');
  const [newAuthority, setNewAuthority] = useState('');

  const [autoFlagUnknown, setAutoFlagUnknown] = useState(settings.autoFlagUnknownVisitors);
  const [requireOtp, setRequireOtp] = useState(settings.requireOtpForGuests);
  const [enableWalkIn, setEnableWalkIn] = useState(settings.enableWalkInDirectReview);
  const [retentionDays, setRetentionDays] = useState(settings.retentionDays);

  const [saveToast, setSaveToast] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat: string) => {
    if (categories.length <= 1) return;
    setCategories(categories.filter((c) => c !== cat));
  };

  const handleAddAuthority = () => {
    if (newAuthority.trim() && !authorities.includes(newAuthority.trim())) {
      setAuthorities([...authorities, newAuthority.trim()]);
      setNewAuthority('');
    }
  };

  const handleRemoveAuthority = (auth: string) => {
    if (authorities.length <= 1) return;
    setAuthorities(authorities.filter((a) => a !== auth));
  };

  const handleSaveAll = () => {
    updateSettings({
      visitorCategories: categories,
      authorizedMeetingAuthorities: authorities,
      autoFlagUnknownVisitors: autoFlagUnknown,
      requireOtpForGuests: requireOtp,
      enableWalkInDirectReview: enableWalkIn,
      retentionDays,
    });

    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Configuration & Integration Desk</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
              Demo Parameters
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage workflow policies, meeting authority rosters, security rules, and inspect backend interface readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg shadow-2xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            Restore Defaults
          </button>
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={() => {
          resetDemoData();
          setCategories(INITIAL_SETTINGS.visitorCategories);
          setAuthorities(INITIAL_SETTINGS.authorizedMeetingAuthorities);
          setAutoFlagUnknown(INITIAL_SETTINGS.autoFlagUnknownVisitors);
          setRequireOtp(INITIAL_SETTINGS.requireOtpForGuests);
          setEnableWalkIn(INITIAL_SETTINGS.enableWalkInDirectReview);
          setRetentionDays(INITIAL_SETTINGS.retentionDays);
          setSaveToast(true);
        }}
        title="Restore all demo data?"
        description="This restores the full demo workspace, including requests, visitor records, notifications, logs, settings, and the five canonical identities."
        variant="warning"
        confirmLabel="Restore Demo Defaults"
      />

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          Settings successfully updated in client-side demo store!
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Configurable Visitor Categories */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Sliders className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Configurable Visitor Categories (WHO)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Options available to gate security personnel when logging who has arrived at campus gates.
          </p>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
              >
                {cat}
                <button
                  disabled={categories.length <= 1}
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-400 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={categories.length <= 1 ? 'At least one category must remain' : 'Remove category'}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add custom category..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
            />
            <button
              onClick={handleAddCategory}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 2: Authorized Person / Authority to Meet */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-900">Authorized Meeting Authorities (WHOM)</h3>
          </div>
          <p className="text-xs text-slate-500">
            Authoritative office roster for meeting requests. Kept separate from visitor categories.
          </p>

          <div className="flex flex-wrap gap-2">
            {authorities.map((auth) => (
              <span
                key={auth}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
              >
                {auth}
                <button
                  disabled={authorities.length <= 1}
                  onClick={() => handleRemoveAuthority(auth)}
                  className="text-blue-400 hover:text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed"
                  title={authorities.length <= 1 ? 'At least one meeting authority must remain' : 'Remove authority'}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add authority/office..."
              value={newAuthority}
              onChange={(e) => setNewAuthority(e.target.value)}
              className="flex-1 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
            />
            <button
              onClick={handleAddAuthority}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded-lg hover:bg-slate-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Section 3: Approval Workflow & Notifications Preferences */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Bell className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-semibold text-slate-900">Workflow & Alert Rules</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Require Mobile OTP for External Guests</span>
                <span className="text-[11px] text-slate-500">Enforce OTP verification at gate prior to admin dispatch</span>
              </div>
              <input
                type="checkbox"
                checked={requireOtp}
                onChange={(e) => setRequireOtp(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Create a review alert for Unknown identities</span>
                <span className="text-[11px] text-slate-500">Creates a demo security alert; Unknown does not automatically deny access.</span>
              </div>
              <input
                type="checkbox"
                checked={autoFlagUnknown}
                onChange={(e) => setAutoFlagUnknown(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="block p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800 block">Retention target (days)</span>
              <input
                type="number"
                min={1}
                max={3650}
                value={retentionDays}
                onChange={(e) => setRetentionDays(Math.max(1, Number(e.target.value) || 1))}
                className="mt-2 w-28 text-xs px-3 py-1.5 border border-slate-300 rounded-lg"
              />
              <span className="text-[11px] text-slate-500 block mt-1">Policy target only. This prototype does not automatically delete records.</span>
            </label>

            <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
              <div>
                <span className="font-semibold text-slate-800 block">Allow Immediate Walk-in Direct Review</span>
                <span className="text-[11px] text-slate-500">Route Walk-in requests with Urgent priority alert</span>
              </div>
              <input
                type="checkbox"
                checked={enableWalkIn}
                onChange={(e) => setEnableWalkIn(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

          </div>
        </div>

        {/* Section 4: Backend & Infrastructure Integration Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Integration Readiness Status</h3>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">Central API Gateway</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Awaiting Backend Integration
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">Staff Mobile Event Bus</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                Demo Mode Simulated
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">University Registrar ERP API</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700">
                Not Connected
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">SMS / OTP Gateway Provider</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700">
                Simulated Sandbox
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-medium text-slate-700">AI Video Stream Sensor Nodes</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-200 text-slate-700">
                Simulated Events Only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
