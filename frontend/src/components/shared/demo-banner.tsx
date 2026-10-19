'use client';

import React, { useState } from 'react';
import { useDemoStore } from '@/store/demo-store';
import { Sparkles, RotateCcw, ShieldAlert, Cpu } from 'lucide-react';
import { ConfirmDialog } from './confirm-dialog';

export function DemoBanner() {
  const { setSimulationModalOpen, resetDemoData } = useDemoStore();
  const [showResetDialog, setShowResetDialog] = useState(false);

  return (
    <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 text-white px-4 py-2 text-xs border-b border-navy-700 flex flex-wrap items-center justify-between gap-3 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/30 text-[11px]">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          Demo Environment
        </span>
        <span className="text-slate-300 hidden md:inline text-[11px]">
          Simulated Staff Mobile submissions & Gate events. Identity registry includes canonical entries (Keshav, Praveen, Raj, Aditi, Supriya).
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSimulationModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-sm transition-all text-xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Simulate Incoming Staff Request
        </button>
        <button
          onClick={() => setShowResetDialog(true)}
          title="Reset database to initial 5 seeded identities and canonical demo records"
          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 font-medium transition-all text-xs"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
          Reset Demo Data
        </button>
      </div>
      <ConfirmDialog
        isOpen={showResetDialog}
        onClose={() => setShowResetDialog(false)}
        onConfirm={resetDemoData}
        title="Reset all demo data?"
        description="All demo records, including requests, visitors, notifications, logs, settings, and identities will return to their seeded state."
        variant="warning"
        confirmLabel="Reset Demo Data"
      />
    </div>
  );
}
