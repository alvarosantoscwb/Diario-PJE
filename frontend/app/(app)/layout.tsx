'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { SidebarProvider } from '@/components/sidebar-context';
import { ThemeProvider } from '@/components/theme-script';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.replace('/login');
  }, [router]);

  return (
    <ThemeProvider>
      <SidebarProvider>
        <div className="flex flex-col h-screen bg-background">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}
