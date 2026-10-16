'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon, ArrowUpRight } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  href?: string;
  badge?: string;
  variant?: 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'slate';
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  href,
  badge,
  variant = 'blue',
}: KpiCardProps) {
  const getColors = () => {
    switch (variant) {
      case 'emerald':
        return {
          bg: 'bg-emerald-50/70 hover:bg-emerald-50 border-emerald-200',
          iconBg: 'bg-emerald-600 text-white',
          valueText: 'text-emerald-950',
          badgeBg: 'bg-emerald-100 text-emerald-800',
        };
      case 'amber':
        return {
          bg: 'bg-amber-50/70 hover:bg-amber-50 border-amber-200',
          iconBg: 'bg-amber-500 text-white',
          valueText: 'text-amber-950',
          badgeBg: 'bg-amber-100 text-amber-800',
        };
      case 'rose':
        return {
          bg: 'bg-rose-50/70 hover:bg-rose-50 border-rose-200',
          iconBg: 'bg-rose-600 text-white',
          valueText: 'text-rose-950',
          badgeBg: 'bg-rose-100 text-rose-800',
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50/70 hover:bg-indigo-50 border-indigo-200',
          iconBg: 'bg-indigo-600 text-white',
          valueText: 'text-indigo-950',
          badgeBg: 'bg-indigo-100 text-indigo-800',
        };
      case 'slate':
        return {
          bg: 'bg-slate-50/90 hover:bg-slate-100 border-slate-200',
          iconBg: 'bg-slate-700 text-white',
          valueText: 'text-slate-900',
          badgeBg: 'bg-slate-200 text-slate-800',
        };
      case 'blue':
      default:
        return {
          bg: 'bg-blue-50/60 hover:bg-blue-50 border-blue-200',
          iconBg: 'bg-blue-600 text-white',
          valueText: 'text-blue-950',
          badgeBg: 'bg-blue-100 text-blue-800',
        };
    }
  };

  const c = getColors();

  const CardContent = (
    <div
      className={`rounded-xl border p-5 transition-all shadow-xs relative flex flex-col justify-between ${c.bg} ${
        href ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg shadow-sm ${c.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${c.valueText}`}>{value}</span>
          {badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c.badgeBg}`}>
              {badge}
            </span>
          )}
        </div>
        {subtitle && <p className="mt-1 text-xs text-slate-500 leading-normal">{subtitle}</p>}
      </div>

      {href && (
        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-medium text-blue-600">
          <span>Inspect records</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}
