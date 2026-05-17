import { Suspense } from 'react';
import { BarChart3, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { getRoundsReport } from '@/lib/actions/reports';
import { getEstablishmentsSimple } from '@/lib/actions/establishments';
import { ReportsFilters } from '@/components/reports/ReportsFilters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const STATUS_STYLES: Record<string, string> = {
  completada:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  en_curso:    'bg-sky-500/10 text-sky-400 border-sky-500/20',
  incidente:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
  pendiente:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  completada: 'Completada',
  en_curso: 'En Curso',
  incidente: 'Incidente',
  pendiente: 'Pendiente',
};

interface PageProps {
  searchParams: Promise<{ estado?: string; establecimiento_id?: string; desde?: string; hasta?: string }>;
}

interface RoundRow {
  id: string;
  inicio_programado: string;
  inicio_real?: string | null;
  estado: string;
  guardia: { nombre: string } | null;
  turno: {
    nombre: string;
    establecimiento: { nombre: string } | null;
  } | null;
}

async function RoundsTable({ filters }: { filters: { estado?: string; establecimiento_id?: string; desde?: string; hasta?: string } }) {
  const rounds = await getRoundsReport(filters) as unknown as RoundRow[];

  const total = rounds.length;
  const completadas = rounds.filter((r) => r.estado === 'completada').length;
  const incidentes = rounds.filter((r) => r.estado === 'incidente').length;
  const pct = total > 0 ? Math.round((completadas / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-border/50 bg-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BarChart3 size={18} className="text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Rondas</p>
                <p className="text-2xl font-bold">{total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10">
                <CheckCircle2 size={18} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Completadas</p>
                <p className="text-2xl font-bold text-emerald-400">{pct}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10">
                <AlertCircle size={18} className="text-rose-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Incidentes</p>
                <p className="text-2xl font-bold text-rose-400">{incidentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {rounds.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
          <BarChart3 size={48} className="opacity-30" />
          <p className="text-lg font-medium text-foreground">Sin registros</p>
          <p className="text-sm">Ajusta los filtros para ver datos.</p>
        </div>
      ) : (
        <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
          <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">Historial de Rondas</CardTitle>
            <Badge variant="outline" className="text-muted-foreground">{total} registros</Badge>
          </CardHeader>
          <div className="divide-y divide-border/30">
            {rounds.map((round) => (
              <div
                key={round.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-3.5 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {round.turno?.establecimiento?.nombre ?? '—'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {round.turno?.nombre ?? '—'} · {round.guardia?.nombre ?? '—'}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(round.inicio_programado).toLocaleString('es-HN', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <Badge variant="outline" className={STATUS_STYLES[round.estado] ?? ''}>
                    {STATUS_LABELS[round.estado] ?? round.estado}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function RoundsTableSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="rounded-2xl border-border/50 bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="rounded-2xl border-border/50 bg-card">
        <CardHeader className="px-6 py-4 border-b border-border/50">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <div className="divide-y divide-border/30">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-3.5">
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const establishments = await getEstablishmentsSimple();

  const csvParams = new URLSearchParams();
  if (filters.estado) csvParams.set('estado', filters.estado);
  if (filters.establecimiento_id) csvParams.set('establecimiento_id', filters.establecimiento_id);
  if (filters.desde) csvParams.set('desde', filters.desde);
  if (filters.hasta) csvParams.set('hasta', filters.hasta);
  const csvHref = `/api/reports/rounds${csvParams.size ? `?${csvParams}` : ''}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Historial y análisis de rondas de seguridad
          </p>
        </div>
        <a
          href={csvHref}
          download
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors active:scale-95"
        >
          <Download size={15} />
          Descargar CSV
        </a>
      </div>

      <ReportsFilters establishments={establishments} currentFilters={filters} />

      <Suspense key={JSON.stringify(filters)} fallback={<RoundsTableSkeleton />}>
        <RoundsTable filters={filters} />
      </Suspense>
    </div>
  );
}
