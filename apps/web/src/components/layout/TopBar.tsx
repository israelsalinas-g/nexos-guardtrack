'use client';

import { usePathname } from 'next/navigation';
import { Menu, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':               'Dashboard',
  '/dashboard/establishments': 'Establecimientos',
  '/dashboard/incidents':      'Incidentes',
  '/dashboard/guards':         'Guardias',
  '/dashboard/shifts':         'Turnos',
  '/dashboard/assignments':    'Asignaciones',
  '/dashboard/reports':        'Reportes',
  '/dashboard/supervisors':    'Supervisores',
};

interface TopBarProps {
  role: string;
  userName: string;
}

export function TopBar({ role, userName }: TopBarProps) {
  const pathname = usePathname();

  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([key]) => pathname.startsWith(key))?.[1] ?? 'Dashboard';

  const today = new Date().toLocaleDateString('es-HN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 h-16 px-4 lg:px-6 flex items-center justify-between gap-4">
      {/* Mobile hamburger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden flex-shrink-0">
            <Menu size={20} />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-card border-border/50">
          <Sidebar role={role} userName={userName} />
        </SheetContent>
      </Sheet>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-bold tracking-tight truncate">{title}</h1>
        <p className="text-xs text-muted-foreground hidden sm:block capitalize">{today}</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={18} />
        </Button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary text-xs font-bold uppercase">
            {userName.charAt(0)}
          </span>
        </div>
      </div>
    </header>
  );
}
