'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SlidersHorizontal } from 'lucide-react';

interface Establishment {
  id: string;
  nombre: string;
}

interface ReportsFiltersProps {
  establishments: Establishment[];
  currentFilters: {
    estado?: string;
    establecimiento_id?: string;
    desde?: string;
    hasta?: string;
  };
}

export function ReportsFilters({ establishments, currentFilters }: ReportsFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams();
    const merged = { ...currentFilters, [key]: value };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => router.push(pathname);

  const hasFilters = Object.values(currentFilters).some(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-border/30">
      <SlidersHorizontal size={15} className="text-muted-foreground flex-shrink-0" />

      <select
        value={currentFilters.establecimiento_id ?? ''}
        onChange={(e) => handleChange('establecimiento_id', e.target.value)}
        className="h-9 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring min-w-40"
      >
        <option value="">Todos los establecimientos</option>
        {establishments.map((est) => (
          <option key={est.id} value={est.id}>{est.nombre}</option>
        ))}
      </select>

      <select
        value={currentFilters.estado ?? ''}
        onChange={(e) => handleChange('estado', e.target.value)}
        className="h-9 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">Todos los estados</option>
        <option value="completada">Completada</option>
        <option value="en_curso">En Curso</option>
        <option value="incidente">Incidente</option>
        <option value="pendiente">Pendiente</option>
      </select>

      <input
        type="date"
        value={currentFilters.desde ?? ''}
        onChange={(e) => handleChange('desde', e.target.value)}
        className="h-9 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="Desde"
      />

      <input
        type="date"
        value={currentFilters.hasta ?? ''}
        onChange={(e) => handleChange('hasta', e.target.value)}
        className="h-9 px-3 rounded-xl bg-secondary/50 border border-border/50 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        placeholder="Hasta"
      />

      {hasFilters && (
        <button
          onClick={handleClear}
          className="h-9 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
        >
          Limpiar
        </button>
      )}
    </div>
  );
}
