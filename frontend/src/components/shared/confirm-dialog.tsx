'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notesOrReason?: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'success' | 'warning' | 'info';
  requiresInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  initialInputValue?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
  requiresInput = false,
  inputLabel = 'Notes / Reason',
  inputPlaceholder = 'Enter reason...',
  initialInputValue = '',
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = useState(initialInputValue);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setInputValue(initialInputValue);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled]), input:not([disabled])',
        ));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>('textarea, button')?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus();
    };
  }, [isOpen, initialInputValue]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(inputValue);
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <XCircle className="w-6 h-6 text-rose-600" />,
          btn: 'bg-rose-600 hover:bg-rose-700 text-white',
          badgeBg: 'bg-rose-100',
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
          btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
          badgeBg: 'bg-emerald-100',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
          btn: 'bg-amber-600 hover:bg-amber-700 text-white',
          badgeBg: 'bg-amber-100',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-600" />,
          btn: 'bg-blue-600 hover:bg-blue-700 text-white',
          badgeBg: 'bg-blue-100',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150" role="presentation">
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-full ${styles.badgeBg} shrink-0`}>
              {styles.icon}
            </div>
            <div className="flex-1">
              <h3 id="confirm-dialog-title" className="text-base font-semibold text-slate-900">{title}</h3>
              <p id="confirm-dialog-description" className="mt-1 text-xs text-slate-600 leading-relaxed">{description}</p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors"
              aria-label="Close confirmation dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {requiresInput && (
            <div className="mt-4">
              <label htmlFor="confirm-dialog-input" className="block text-xs font-semibold text-slate-700 mb-1">
                {inputLabel} {variant === 'danger' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                id="confirm-dialog-input"
                rows={3}
                required
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={inputPlaceholder}
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={requiresInput && !inputValue.trim()}
            onClick={handleConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${styles.btn}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
