'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Send } from 'lucide-react';
import { useSidebar } from '@/components/sidebar-context';

const links = [
  { href: '/communications', icon: Home, label: 'Início' },
  { href: '/communications', icon: Send, label: 'Comunicações' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();

  if (!open) return null;

  return (
    <aside className="hidden md:flex w-14 bg-background border-r border-border flex-col items-center py-4 gap-6 shrink-0">
      {links.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={label}
            href={href}
            title={label}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${active ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent'}`}
          >
            <Icon size={16} />
          </Link>
        );
      })}
    </aside>
  );
}
