'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Map, AlertCircle, Shield, FileText } from 'lucide-react';

const MOBILE_NAV = [
  { href: '/dashboard',               label: 'Inicio',     icon: LayoutDashboard },
  { href: '/dashboard/establishments', label: 'Locales',   icon: Map },
  { href: '/dashboard/incidents',      label: 'Incidentes', icon: AlertCircle },
  { href: '/dashboard/guards',         label: 'Guardias',  icon: Shield },
  { href: '/dashboard/reports',        label: 'Reportes',  icon: FileText },
];

export function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-card/90 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around h-16 px-2">
        {MOBILE_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-0',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon size={20} />
              <span className="text-[10px] font-medium truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
