'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { logout } from '@/lib/actions/auth';
import {
  LayoutDashboard, Map, AlertCircle, Shield, Clock, Users, FileText, LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

function getNavItems(role: string): NavItem[] {
  return [
    { href: '/dashboard',               label: 'Dashboard',        icon: LayoutDashboard },
    { href: '/dashboard/establishments', label: 'Establecimientos', icon: Map },
    { href: '/dashboard/incidents',      label: 'Incidentes',       icon: AlertCircle },
    { href: '/dashboard/guards',         label: 'Guardias',         icon: Shield },
    { href: '/dashboard/shifts',         label: 'Turnos',           icon: Clock },
    { href: '/dashboard/assignments',    label: 'Asignaciones',     icon: Users },
    { href: '/dashboard/reports',        label: 'Reportes',         icon: FileText },
    ...(role === 'admin'
      ? [{ href: '/dashboard/supervisors', label: 'Supervisores', icon: Users }]
      : []),
  ];
}

interface SidebarProps {
  role: string;
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const items = getNavItems(role);

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-card h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border/50">
        <div className="w-8 h-8 relative flex-shrink-0">
          <Image
            src="/assets/logo_nexos_guardtrack.png"
            alt="GuardTrack"
            fill
            className="object-contain"
            onError={() => {}}
          />
        </div>
        <span className="font-bold text-lg tracking-tight">GuardTrack</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <span
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon size={18} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* User + logout */}
      <div className="px-4 py-4 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-bold uppercase">
              {userName.charAt(0)}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{userName}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
        <form action={logout}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 active:scale-95 transition-all"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </Button>
        </form>
      </div>
    </aside>
  );
}
