'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDemoStore } from '@/store/demo-store';
import { Shield, Lock, ArrowRight, User } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { setDemoRole } = useDemoStore();

  const [username, setUsername] = useState('sunita.admin');
  const [password, setPassword] = useState('demo-password');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'security'>('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoRole(selectedRole);
    router.push('/');
  };

  const handleQuickDemoEnter = (role: 'admin' | 'security') => {
    setDemoRole(role);
    router.push('/');
  };

  return (
    <div className="login-shell min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="login-card bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="login-brand-panel p-7 sm:p-8 text-center">
          <div className="login-brand-mark w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">CampusSentry AI</h2>
          <p className="text-xs text-slate-500 mt-1">Campus operations, at a glance.</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
            <span>Demo Mode — Frontend Prototype</span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 space-y-4">
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Demo Username / Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="demo-role" className="block text-xs font-semibold text-slate-700 mb-1">Demo role</label>
              <select
                id="demo-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as 'admin' | 'security')}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="admin">Administrator — Sunita Sharma</option>
                <option value="security">Gate Security — Ramesh Kumar</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow flex items-center justify-center gap-1.5 transition-all mt-2"
            >
              <span>Sign In to Admin Cabin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Explicit 1-Click Demo Access */}
          <p className="text-[11px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
            Demo sign-in does not validate credentials. Role selection only changes the client-side demo user; production access control must be enforced by the backend.
          </p>

          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2 text-center">
              Or launch direct demo access:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoEnter('admin')}
                className="py-2 px-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-center transition-all"
              >
                <strong className="block text-slate-900">Admin Mode</strong>
                <span className="text-[10px] text-slate-500">Sunita Sharma</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoEnter('security')}
                className="py-2 px-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 text-center transition-all"
              >
                <strong className="block text-slate-900">Security Mode</strong>
                <span className="text-[10px] text-slate-500">Gate 1 Operator</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400">
          Security Boundary: Authentication & verification will be backed by university SSO in production.
        </div>
      </div>
    </div>
  );
}
