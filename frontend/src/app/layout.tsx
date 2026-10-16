import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/app-layout';
import { ThemeProvider } from '@/components/layout/theme-provider';

export const metadata: Metadata = {
  title: 'CampusSentry AI — Admin Web Application',
  description: 'Enterprise AI-powered campus visitor management & security workflow system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var p=localStorage.getItem('campussentry-theme')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.themePreference=p;document.documentElement.dataset.theme=d?'dark':'light';if(d)document.documentElement.classList.add('dark');document.documentElement.style.colorScheme=d?'dark':'light'}catch(_){}})();` }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider><AppLayout>{children}</AppLayout></ThemeProvider>
      </body>
    </html>
  );
}
