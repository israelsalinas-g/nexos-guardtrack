import { Suspense } from 'react';
import { ArrowLeft, Plus, QrCode, MapPin } from 'lucide-react';
import Link from 'next/link';
import { getEstablishmentById, getControlPoints } from '@/lib/actions/establishments';
import { QRDownloadButton } from '@/components/QRGenerator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function ControlPointsList({ id }: { id: string }) {
  const controlPoints = await getControlPoints(id);

  if (controlPoints.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground rounded-xl border border-dashed border-border">
        <QrCode size={36} className="opacity-30" />
        <p className="text-sm font-medium">Sin puntos de control</p>
        <p className="text-xs">Agrega el primero con el botón de arriba.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {controlPoints.map((point, index) => (
        <div
          key={point.id}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30 border border-border/30 hover:border-border/60 transition-colors"
        >
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <QrCode size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{point.nombre ?? point.name}</p>
            <p className="text-xs text-muted-foreground font-mono">
              {point.qr_token}
            </p>
          </div>
          <Badge variant="outline" className="text-primary border-primary/30 text-xs flex-shrink-0">
            #{index + 1}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function ControlPointsSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/30">
          <Skeleton className="h-9 w-9 rounded-xl" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="h-5 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export default async function EstablishmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const establishment = await getEstablishmentById(id);
  const controlPoints = await getControlPoints(id);

  const nombre = establishment.nombre ?? establishment.name ?? 'Establecimiento';
  const direccion = establishment.direccion ?? establishment.address ?? '';

  return (
    <div className="flex flex-col gap-6">
      {/* Back + header */}
      <div>
        <Link
          href="/dashboard/establishments"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft size={15} />
          Volver a Establecimientos
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={18} className="text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">{nombre}</h1>
            </div>
            {direccion && (
              <p className="text-sm text-muted-foreground">{direccion}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {controlPoints.length > 0 && (
              <QRDownloadButton
                establishmentName={nombre}
                points={controlPoints.map((p) => ({
                  name: p.nombre ?? p.name ?? '',
                  qr_token: p.qr_token,
                }))}
              />
            )}
            <Button className="rounded-xl gap-2 active:scale-95 transition-all">
              <Plus size={16} />
              Agregar Punto
            </Button>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Control Points */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-border/50 bg-card">
            <CardHeader className="px-6 py-4 border-b border-border/50">
              <CardTitle className="text-base font-semibold">Puntos de Control</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <Suspense fallback={<ControlPointsSkeleton />}>
                <ControlPointsList id={id} />
              </Suspense>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          <Card className="rounded-2xl border-border/50 bg-card">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm mb-1">Configuración de Turnos</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Define los horarios en los que se esperan rondas obligatorias.
              </p>
              <Button
                asChild
                variant="secondary"
                className="w-full rounded-xl active:scale-95 transition-all"
              >
                <Link href={`/dashboard/shifts?establishment=${id}`}>
                  Gestionar Turnos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-emerald-500/20 bg-emerald-500/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="font-semibold text-sm text-emerald-400">Estado del Sitio</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Última ronda completada hace 45 minutos.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
