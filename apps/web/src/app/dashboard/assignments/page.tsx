import { Suspense } from 'react';
import { ClipboardList, Clock } from 'lucide-react';
import { getAssignments } from '@/lib/actions/assignments';
import { getGuards } from '@/lib/actions/guards';
import { getShifts } from '@/lib/actions/shifts';
import { CreateAssignmentDialog } from '@/components/assignments/CreateAssignmentDialog';
import { AssignmentActions } from '@/components/assignments/AssignmentActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface AssignmentRow {
  id: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
  guardia: { id: string; nombre: string | null; email: string | null } | null;
  turno: {
    id: string;
    nombre: string | null;
    hora_inicio: string | null;
    hora_fin: string | null;
    establecimiento: { id: string; nombre: string | null } | null;
  } | null;
}

async function AssignmentsList() {
  const assignments = await getAssignments() as unknown as AssignmentRow[];

  if (assignments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
        <ClipboardList size={48} className="opacity-30" />
        <p className="text-lg font-medium text-foreground">Sin asignaciones registradas</p>
        <p className="text-sm">Crea la primera con el botón de arriba.</p>
      </div>
    );
  }

  const active = assignments.filter((a) => a.activo).length;

  return (
    <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Asignaciones</CardTitle>
        {active > 0 && (
          <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
            {active} activa{active !== 1 ? 's' : ''}
          </Badge>
        )}
      </CardHeader>

      <div className="divide-y divide-border/30">
        {assignments.map((assignment) => {
          const guardName = assignment.guardia?.nombre ?? assignment.guardia?.email ?? '—';
          const shiftName = assignment.turno?.nombre ?? '—';
          const estName = assignment.turno?.establecimiento?.nombre ?? '—';
          const desde = assignment.fecha_inicio
            ? new Date(assignment.fecha_inicio).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';
          const hasta = assignment.fecha_fin
            ? new Date(assignment.fecha_fin).toLocaleDateString('es-HN', { day: '2-digit', month: 'short', year: 'numeric' })
            : '—';

          return (
            <div
              key={assignment.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-secondary/60 flex-shrink-0 mt-0.5">
                  <ClipboardList size={16} className="text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{guardName}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {shiftName} · {estName}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-muted-foreground flex-shrink-0">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {desde} → {hasta}
                </span>
                <Badge
                  variant="outline"
                  className={assignment.activo
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : 'text-muted-foreground border-border/50'}
                >
                  {assignment.activo ? 'Activa' : 'Finalizada'}
                </Badge>
              </div>

              <div className="flex-shrink-0">
                {assignment.activo ? (
                  <AssignmentActions assignmentId={assignment.id} />
                ) : (
                  <div className="w-8" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AssignmentsListSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card">
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <div className="divide-y divide-border/30">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function AssignmentsPage() {
  const [guards, shifts] = await Promise.all([getGuards(), getShifts()]);

  const guardsForDialog = guards
    .filter((g) => g.activo)
    .map((g) => ({ id: g.id, nombre: g.nombre as string | null, email: g.email as string | null }));

  const shiftsForDialog = (shifts ?? []).map((s) => ({
    id: s.id,
    nombre: s.nombre as string | null,
    hora_inicio: s.hora_inicio as string | null,
    hora_fin: s.hora_fin as string | null,
    establecimientos: (s.establecimientos as unknown as { nombre: string } | null),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Asignaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vincula guardias a turnos de cada establecimiento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ClipboardList size={18} className="text-muted-foreground hidden sm:block" />
          <CreateAssignmentDialog guards={guardsForDialog} shifts={shiftsForDialog} />
        </div>
      </div>

      <Suspense fallback={<AssignmentsListSkeleton />}>
        <AssignmentsList />
      </Suspense>
    </div>
  );
}
