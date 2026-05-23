'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, LogOut, PanelRight, Bell, Sun, Moon } from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';
import { useTheme } from '@/components/theme-script';

function getInitials(): string {
  if (typeof window === 'undefined') return 'US';
  try {
    const token = localStorage.getItem('token');
    if (!token) return 'US';
    const payload = JSON.parse(atob(token.split('.')[1]));
    const email: string = payload.email ?? '';
    return email.slice(0, 2).toUpperCase();
  } catch {
    return 'US';
  }
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggle: toggleSidebar } = useSidebar();
  const { theme, toggle: toggleTheme } = useTheme();
  const isDetailPage = pathname.startsWith('/communications/');
  const [open, setOpen] = useState(false);
  const [initials, setInitials] = useState('US');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInitials(getInitials());
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  return (
    <header className="h-12 bg-background border-b border-border flex items-center justify-between pl-3 shrink-0">
      <div className="flex items-center gap-1">
        <button onClick={toggleSidebar} className="p-2 rounded-lg transition-colors text-muted-foreground hover:bg-accent cursor-pointer">
          <PanelRight size={16} />
        </button>
        <span className="text-sm font-semibold text-foreground">Diário PJE</span>
      </div>
      <div className="flex items-center gap-2 pr-3">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition cursor-pointer"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {isDetailPage && (
          <button className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition cursor-pointer">
            <Bell size={16} />
          </button>
        )}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-muted-foreground hover:opacity-80 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-foreground">
              {initials}
            </div>
            <ChevronDown size={14} />
          </button>
          {open && (
            <div className="absolute right-0 top-9 bg-popover rounded-lg shadow-lg border border-border py-1 min-w-[140px] z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition cursor-pointer"
              >
                <LogOut size={14} />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
