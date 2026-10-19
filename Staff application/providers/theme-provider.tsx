import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { AppColors, palettes, ThemePreference } from '@/lib/theme';

const THEME_STORAGE_KEY = 'campussentry-mobile-theme';

type ThemeContextValue = {
  colors: AppColors;
  isDark: boolean;
  isReady: boolean;
  preference: ThemePreference;
  storageError: string | null;
  setPreference: (preference: ThemePreference) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: React.PropsWithChildren) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((stored) => {
        if (!mounted) return;
        if (stored === 'light' || stored === 'dark' || stored === 'system') {
          setPreferenceState(stored);
        }
      })
      .catch(() => {
        if (mounted) setStorageError('Theme preference could not be loaded. System appearance is being used.');
      })
      .finally(() => {
        if (mounted) setIsReady(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  const setPreference = useCallback(async (next: ThemePreference) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, next);
      setPreferenceState(next);
      setStorageError(null);
    } catch {
      setStorageError('Theme changed for this session but could not be saved on this device.');
      setPreferenceState(next);
    }
  }, []);

  const value = useMemo(
    () => ({
      colors: isDark ? palettes.dark : palettes.light,
      isDark,
      isReady,
      preference,
      storageError,
      setPreference,
    }),
    [isDark, isReady, preference, setPreference, storageError],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useAppTheme must be used inside ThemeProvider');
  return value;
}
