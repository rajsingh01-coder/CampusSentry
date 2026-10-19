import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(isoOrDateString?: string | null): string {
  if (!isoOrDateString) return 'Not provided';
  try {
    const d = typeof isoOrDateString === 'string' && isoOrDateString.includes('T')
      ? parseISO(isoOrDateString)
      : new Date(isoOrDateString);
    if (isNaN(d.getTime())) return isoOrDateString;
    return format(d, 'MMM d, yyyy h:mm a');
  } catch {
    return isoOrDateString;
  }
}

export function formatDateOnly(dateString?: string | null): string {
  if (!dateString) return 'Not provided';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function formatTimeOnly(timeOrIso?: string | null): string {
  if (!timeOrIso) return 'Not provided';
  if (timeOrIso.toLowerCase() === 'now') return 'Immediate (Walk-in)';
  try {
    if (timeOrIso.includes('T')) {
      return format(parseISO(timeOrIso), 'h:mm a');
    }
    return timeOrIso;
  } catch {
    return timeOrIso;
  }
}

/**
 * Robust CSV Generator adhering to RFC 4180
 */
export function serializeCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const escapeCell = (val: string | number | boolean | null | undefined): string => {
    const str = val === null || val === undefined ? '' : String(val);
    return `"${str.replace(/"/g, '""')}"`;
  };
  return [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\r\n');
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]): boolean {
  try {
    const csvContent = serializeCsv(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    return true;
  } catch (error) {
    console.error('Failed to export CSV:', error);
    return false;
  }
}

export function generateId(prefix: string): string {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const datePart = format(new Date(), 'yyMMdd');
  return `${prefix}-${datePart}-${randomPart}`;
}
