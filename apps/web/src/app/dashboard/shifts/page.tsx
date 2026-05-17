import { Suspense } from 'react';
import { Clock3, Calendar } from 'lucide-react';
import { getShifts } from '@/lib/actions/shifts';
import { getEstablishmentsSimple } from '@/lib/actions/establishments';
import { CreateShiftDialog } from '@/components/shifts/CreateShiftDialog';
import { ShiftActions } from '@/components/shifts/ShiftActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const DAY_LABELS: Record<number, string> = {
  1: 'L', 2: 'M', 3: 'X', 4: 'J', 5: 'V', 6: 'S', 7: 'D',
};

interface PageProps {
  searchParams: Promise<{ establishment?: string }>;
}

async function ShiftsList({ establishmentId }: { establishmentId?: string }) {
  const shifts = await getShifts(establishmentId);

  if (shifts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
        <Clock3 size={48} className="opacity-30" />
        <p className="text-lg font-medium text-foreground">Sin turnos registrados</p>
        <p className="text-sm">Crea el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Turnos</CardTitle>
        <Badge variant="outline" className="text-muted-foreground">
          {shifts.length} {shifts.length === 1 ? 'turno' : 'turnos'}
        </Badge>
      </CardHeader>

      <div className="divide-y divide-border/30">
        {shifts.map((shift) => {
          const estName = (shift.establecimientos as unknown as { nombre: string } | null)?.nombre ?? '—';
          const days: number[] = Array.isArray(shift.dias_semana) ? shift.dias_semana : [];
          return (
            <div
              key={shift.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-primary/10 flex-shrink-0">
                  <Clock3 size={16} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{shift.nombre}</p>
                  <p className="text-xs text-muted-foreground">{estName}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
                <span className="text-xs font-mono">
                  {shift.hora_inicio?.slice(0, 5)} – {shift.hora_fin?.slice(0, 5)}
                </span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <span
                      key={d}
                      className={`text-xs w-5 h-5 rounded flex items-center justify-center font-medium ${
                        days.includes(d)
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground/30'
                      }`}
                    >
                      {DAY_LABELS[d]}
                    </span>
                  ))}
                </div>
                <span className="text-xs">{shift.intervalo_ronda_min ?? 60} min</span>
              </div>

              <div className="flex-shrink-0">
                <ShiftActions shiftId={shift.id} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ShiftsListSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card">
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <div className="divide-y divide-border/30">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-9 w-9 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function ShiftsPage({ searchParams }: PageProps) {
  const { establishment: establishmentId } = await searchParams;
  const establishments = await getEstablishmentsSimple();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turnos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configura los horarios de ronda por establecimiento
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-muted-foreground hidden sm:block" />
          <CreateShiftDialog
            establishments={establishments}
            preselectedEstablishmentId={establishmentId}
          />
        </div>
      </div>

      <Suspense fallback={<ShiftsListSkeleton />}>
        <ShiftsList establishmentId={establishmentId} />
      </Suspense>
    </div>
  );
}
