export type ThemePreference = 'light' | 'dark' | 'system';

export const palettes = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceMuted: '#F1F5F9',
    primary: '#2563EB',
    primaryPressed: '#1D4ED8',
    navy: '#0B1528',
    text: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    teal: '#0D9488',
    success: '#15803D',
    warning: '#B45309',
    critical: '#BE123C',
    info: '#1D4ED8',
    onPrimary: '#FFFFFF',
  },
  dark: {
    background: '#0B1220',
    surface: '#111C2E',
    surfaceMuted: '#172338',
    primary: '#60A5FA',
    primaryPressed: '#3B82F6',
    navy: '#0B1220',
    text: '#F8FAFC',
    muted: '#94A3B8',
    border: '#263449',
    teal: '#2DD4BF',
    success: '#4ADE80',
    warning: '#FBBF24',
    critical: '#FB7185',
    info: '#93C5FD',
    onPrimary: '#0B1220',
  },
} as const;

export type AppColors = { [Color in keyof (typeof palettes)['light']]: string };
