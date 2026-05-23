'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown, LogOut, PanelRight, Bell } from 'lucide-react';
import Image from "next/image";
import { useSidebar } from '@/components/sidebar-context';

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
  const { toggle } = useSidebar();
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
    <header className="h-12 bg-white border-b border-gray-200 flex items-center justify-between pl-3 shrink-0">

      <div className="flex items-center">
        <button onClick={toggle} className="p-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100 cursor-pointer">
          <PanelRight size={16} />
        </button>
        <Image
          src="/logoBlue.png"
          alt="Diário PJE Logo"
          width={124}
          height={19}
          className="object-contain"
          priority
        />
      </div>
      <div className="flex items-center gap-2 pr-3">
        {isDetailPage && (
          <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition cursor-pointer">
            <Bell size={16} />
          </button>
        )}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-gray-700 hover:opacity-80 transition cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#E5E5E5] flex items-center justify-center text-xs font-semibold text-[#262626]">
              {initials}
            </div>
            <ChevronDown size={14} />
          </button>
          {open && (
            <div className="absolute right-0 top-9 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[140px] z-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition cursor-pointer"
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
