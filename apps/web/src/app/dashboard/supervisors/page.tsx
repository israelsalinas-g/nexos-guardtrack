import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { UserCog, Building2 } from 'lucide-react';
import { createSupabaseServerClient } from '@/lib/supabase';
import { getSupervisors } from '@/lib/actions/supervisors';
import { CreateSupervisorDialog } from '@/components/supervisors/CreateSupervisorDialog';
import { SupervisorActions } from '@/components/supervisors/SupervisorActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

async function SupervisorsList() {
  const supervisors = await getSupervisors();

  if (supervisors.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
        <UserCog size={48} className="opacity-30" />
        <p className="text-lg font-medium text-foreground">Sin supervisores registrados</p>
        <p className="text-sm">Agrega el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Supervisores</CardTitle>
        <Badge variant="outline" className="text-muted-foreground">
          {supervisors.length} {supervisors.length === 1 ? 'supervisor' : 'supervisores'}
        </Badge>
      </CardHeader>

      <div className="divide-y divide-border/30">
        {supervisors.map((supervisor) => {
          const estCount = (supervisor.establecimientos as unknown as { count: number }[])?.[0]?.count ?? 0;
          return (
            <div
              key={supervisor.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-6 py-4 hover:bg-secondary/20 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-semibold text-sm">
                    {(supervisor.nombre ?? '?').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{supervisor.nombre}</p>
                  <p className="text-xs text-muted-foreground truncate">{supervisor.email}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-sm text-muted-foreground flex-shrink-0">
                <span className="flex items-center gap-1.5 text-xs">
                  <Building2 size={12} />
                  {estCount} {estCount === 1 ? 'establecimiento' : 'establecimientos'}
                </span>
                <Badge
                  variant="outline"
                  className={supervisor.activo
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                    : 'text-muted-foreground border-border/50'}
                >
                  {supervisor.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <div className="flex-shrink-0">
                {supervisor.activo ? (
                  <SupervisorActions supervisorId={supervisor.id} />
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

function SupervisorsListSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card">
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <div className="divide-y divide-border/30">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4">
            <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default async function SupervisorsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 'admin') redirect('/dashboard');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supervisores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona el personal supervisor de la plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UserCog size={18} className="text-muted-foreground hidden sm:block" />
          <CreateSupervisorDialog />
        </div>
      </div>

      <Suspense fallback={<SupervisorsListSkeleton />}>
        <SupervisorsList />
      </Suspense>
    </div>
  );
}
