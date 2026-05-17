import { Suspense } from 'react';
import { AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import { getIncidents } from '@/lib/actions/incidents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { IncidentActions } from '@/components/incidents/IncidentActions';

const STATUS_STYLES: Record<string, string> = {
  nuevo:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
  revisado: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cerrado:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  nuevo:    'Nuevo',
  revisado: 'Revisado',
  cerrado:  'Cerrado',
};

const TYPE_LABELS: Record<string, string> = {
  ronda_vencida:    'Ronda Vencida',
  ronda_incompleta: 'Ronda Incompleta',
  manual:           'Reporte Manual',
};

const TYPE_STYLES: Record<string, string> = {
  ronda_vencida:    'bg-rose-500/10 text-rose-400 border-rose-500/20',
  ronda_incompleta: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  manual:           'bg-sky-500/10 text-sky-400 border-sky-500/20',
};

interface IncidentRow {
  id: string;
  tipo: string;
  descripcion: string;
  estado: string;
  created_at: string;
  ronda?: {
    establecimiento?: { nombre: string } | null;
    guardia?: { nombre: string } | null;
  } | null;
}

async function IncidentsList() {
  const incidents = await getIncidents() as IncidentRow[];
  const pending = incidents.filter((i) => i.estado !== 'cerrado').length;

  if (incidents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
        <CheckCircle2 size={48} className="text-emerald-400 opacity-40" />
        <p className="text-lg font-medium text-foreground">Sin incidentes registrados</p>
        <p className="text-sm">Todo parece estar en orden en todos los establecimientos.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Todos los Incidentes</CardTitle>
        {pending > 0 && (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20">
            {pending} sin resolver
          </Badge>
        )}
      </CardHeader>

      <div className="divide-y divide-border/30">
        {incidents.map((incident) => (
          <div
            key={incident.id}
            className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors"
          >
            {/* Left: type + establishment */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="p-2 rounded-xl bg-secondary/60 flex-shrink-0 mt-0.5">
                <ShieldAlert size={16} className="text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="outline" className={TYPE_STYLES[incident.tipo] ?? ''}>
                    {TYPE_LABELS[incident.tipo] ?? incident.tipo}
                  </Badge>
                  <Badge variant="outline" className={STATUS_STYLES[incident.estado] ?? ''}>
                    {STATUS_LABELS[incident.estado] ?? incident.estado}
                  </Badge>
                </div>
                <p className="font-medium text-sm truncate">
                  {incident.ronda?.establecimiento?.nombre ?? 'General'}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {incident.descripcion || 'Sin descripción.'}
                </p>
              </div>
            </div>

            {/* Middle: meta */}
            <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:w-44 flex-shrink-0">
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {new Date(incident.created_at).toLocaleString('es-HN', {
                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                })}
              </span>
              {incident.ronda?.guardia?.nombre && (
                <span className="truncate">Guardia: {incident.ronda.guardia.nombre}</span>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex-shrink-0">
              {incident.estado === 'cerrado' ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                  <CheckCircle2 size={16} />
                  Resuelto
                </div>
              ) : (
                <IncidentActions
                  incidentId={incident.id}
                  currentEstado={incident.estado as 'nuevo' | 'revisado'}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function IncidentsListSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card">
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <div className="divide-y divide-border/30">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function IncidentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Incidentes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitoreo y resolución de anomalías en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle size={18} className="text-muted-foreground" />
        </div>
      </div>

      <Suspense fallback={<IncidentsListSkeleton />}>
        <IncidentsList />
      </Suspense>
    </div>
  );
}
