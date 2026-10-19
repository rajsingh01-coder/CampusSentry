'use client';

import React, { useEffect } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { DemoBanner } from '@/components/shared/demo-banner';
import { SimulationModal } from '@/components/shared/simulation-modal';
import { useDemoStore } from '@/store/demo-store';
import { usePathname } from 'next/navigation';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { setHasHydrated } = useDemoStore();

  useEffect(() => {
    setHasHydrated(true);
  }, [setHasHydrated]);

  // If on login page, render full screen without sidebar/header
  if (pathname === '/login') {
    return <main className="min-h-screen bg-slate-900">{children}</main>;
  }

  return (
    <div className="app-shell flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased">
      <DemoBanner />
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-[calc(100vh-38px)]">
        <Sidebar />
        <div className="app-workspace flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Header />
          <main className="app-main flex-1 p-5 sm:p-6 xl:p-8 max-w-[1600px] w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
      <SimulationModal />
    </div>
  );
}
