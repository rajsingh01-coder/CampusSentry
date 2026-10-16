'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = 'campussentry-theme';

function readPreference(): ThemePreference {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
  } catch {
    return 'system';
  }
}

function applyTheme(preference: ThemePreference, isDark: boolean) {
  const root = document.documentElement;
  root.dataset.theme = isDark ? 'dark' : 'light';
  root.classList.toggle('dark', isDark);
  root.style.colorScheme = isDark ? 'dark' : 'light';
  root.dataset.themePreference = preference;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    const initial = readPreference();
    setPreferenceState(initial);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyTheme(initial, initial === 'dark' || (initial === 'system' && media.matches));
    apply();
    const onChange = () => {
      if (document.documentElement.dataset.themePreference === 'system') {
        applyTheme('system', media.matches);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setPreference = (next: ThemePreference) => {
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* use the selected appearance for this session */ }
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(next, next === 'dark' || (next === 'system' && media.matches));
    setPreferenceState(next);
  };

  const value = useMemo(() => ({ preference, setPreference }), [preference]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemePreference() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useThemePreference must be used within ThemeProvider');
  return value;
}
