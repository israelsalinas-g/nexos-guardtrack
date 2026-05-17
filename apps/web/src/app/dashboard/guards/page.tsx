import { Suspense } from 'react';
import { Shield, UserCheck } from 'lucide-react';
import { getGuards } from '@/lib/actions/guards';
import { CreateGuardDialog } from '@/components/guards/CreateGuardDialog';
import { GuardActions } from '@/components/guards/GuardActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

async function GuardsList() {
  const guards = await getGuards();

  if (guards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
        <Shield size={48} className="opacity-30" />
        <p className="text-lg font-medium text-foreground">Sin guardias registrados</p>
        <p className="text-sm">Agrega el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Guardias de Seguridad</CardTitle>
        <Badge variant="outline" className="text-muted-foreground">
          {guards.length} {guards.length === 1 ? 'guardia' : 'guardias'}
        </Badge>
      </CardHeader>

      <div className="divide-y divide-border/30">
        {guards.map((guard) => {
          const assignmentCount = (guard.asignaciones as unknown as { count: number }[])?.[0]?.count ?? 0;
          return (
            <div
              key={guard.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {(guard.nombre ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{guard.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{guard.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground flex-shrink-0">
                {guard.telefono && (
                  <span className="text-xs">{guard.telefono}</span>
                )}
                <span className="text-xs">
                  {assignmentCount} {assignmentCount === 1 ? 'asignación' : 'asignaciones'}
                </span>
                <Badge
                  variant="outline"
                  className={guard.activo
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : 'text-muted-foreground border-border/50'}
                >
                  {guard.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="flex-shrink-0">
                {guard.activo ? (
                  <GuardActions guardId={guard.id} />
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

function GuardsListSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card">
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <div className="divide-y divide-border/30">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function GuardsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guardias</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el personal de seguridad
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UserCheck size={18} className="text-muted-foreground hidden sm:block" />
          <CreateGuardDialog />
        </div>
      </div>

      <Suspense fallback={<GuardsListSkeleton />}>
        <GuardsList />
      </Suspense>
    </div>
  );
}
