import { Suspense } from 'react';
import { MapPin, QrCode, ChevronRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import { getEstablishments } from '@/lib/actions/establishments';
import { CreateEstablishmentDialog } from '@/components/establishments/CreateEstablishmentDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

async function EstablishmentsGrid() {
  const establishments = await getEstablishments();

  if (establishments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-muted-foreground rounded-2xl border border-dashed border-border">
        <Building2 size={48} className="opacity-30" />
        <p className="text-lg font-medium text-foreground">Sin establecimientos</p>
        <p className="text-sm">Crea el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {establishments.map((est) => {
        const puntosCount = (est.puntos_count as unknown as { count: number }[])?.[0]?.count ?? 0;
        return (
          <Card
            key={est.id}
            className="rounded-2xl border-border/50 bg-card hover:border-primary/30 transition-colors group"
          >
            <CardContent className="p-5 flex flex-col gap-4">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate">{est.nombre}</h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {est.ciudad ? `${est.ciudad} — ` : ''}{est.direccion || 'Sin dirección'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={est.activo
                    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 flex-shrink-0'
                    : 'text-muted-foreground flex-shrink-0'}
                >
                  {est.activo ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-1">Puntos de Control</p>
                  <div className="flex items-center gap-1.5">
                    <QrCode size={14} className="text-emerald-400" />
                    <span className="font-semibold text-sm">{puntosCount} punto{puntosCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="rounded-xl bg-secondary/50 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground mb-1">Supervisor</p>
                  <p className="font-semibold text-sm truncate">
                    {(est.supervisor as unknown as { nombre: string } | null)?.nombre ?? '—'}
                  </p>
                </div>
              </div>

              {/* Action */}
              <Button asChild variant="secondary" className="w-full rounded-xl justify-between group-hover:bg-secondary/80 transition-colors">
                <Link href={`/dashboard/establishments/${est.id}`}>
                  Configurar Puntos y Turnos
                  <ChevronRight size={16} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function EstablishmentsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-border/50 bg-card">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function EstablishmentsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Establecimientos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los locales y sus puntos de control
          </p>
        </div>
        <CreateEstablishmentDialog />
      </div>

      <Suspense fallback={<EstablishmentsGridSkeleton />}>
        <EstablishmentsGrid />
      </Suspense>
    </div>
  );
}
