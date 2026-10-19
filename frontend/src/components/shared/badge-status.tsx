'use client';

import React from 'react';
import { IdentityClassification, RequestStatus, VisitorCategory, OtpStatus } from '@/types';
import { CheckCircle2, AlertTriangle, HelpCircle, XCircle, Clock, ShieldCheck, UserCheck } from 'lucide-react';

export function IdentityClassificationBadge({ classification }: { classification: IdentityClassification }) {
  switch (classification) {
    case 'Known':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <UserCheck className="w-3.5 h-3.5" />
          Known
        </span>
      );
    case 'Verification Required':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3.5 h-3.5" />
          Verification Required
        </span>
      );
    case 'Unknown':
    default:
      return (
        <span
          title="Unknown indicates identity has not yet been matched or recorded. It does not imply unauthorized or malicious intent."
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300"
        >
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          Unknown
        </span>
      );
  }
}

export function VisitorCategoryBadge({ category }: { category: VisitorCategory | string }) {
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (category === 'Student') {
    colorStyles = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (category === 'Parent/Guardian') {
    colorStyles = 'bg-purple-50 text-purple-700 border-purple-200';
  } else if (category === 'Guest/External Visitor') {
    colorStyles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  } else if (category === 'Teaching Staff') {
    colorStyles = 'bg-teal-50 text-teal-700 border-teal-200';
  } else if (category === 'Non-Teaching Staff') {
    colorStyles = 'bg-cyan-50 text-cyan-700 border-cyan-200';
  } else if (category === 'Vendor') {
    colorStyles = 'bg-orange-50 text-orange-700 border-orange-200';
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colorStyles}`}>
      {category}
    </span>
  );
}

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  switch (status) {
    case 'Approved':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Approved
        </span>
      );
    case 'Pending Approval':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300">
          <Clock className="w-3.5 h-3.5" />
          Pending Approval
        </span>
      );
    case 'Pending Verification':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
          <Clock className="w-3.5 h-3.5" />
          Pending Verification
        </span>
      );
    case 'Additional Information Required':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
          <HelpCircle className="w-3.5 h-3.5" />
          Info Required
        </span>
      );
    case 'Rejected':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <XCircle className="w-3.5 h-3.5" />
          Rejected
        </span>
      );
    case 'Cancelled':
    case 'Expired':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          {status}
        </span>
      );
  }
}

export function OtpStatusBadge({ status }: { status: OtpStatus }) {
  switch (status) {
    case 'Verified':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          OTP Verified
        </span>
      );
    case 'Pending':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium">
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          OTP Pending
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-rose-600 font-medium">
          <XCircle className="w-3.5 h-3.5 text-rose-500" />
          OTP Failed
        </span>
      );
    default:
      return <span className="text-xs text-slate-500">N/A</span>;
  }
}
