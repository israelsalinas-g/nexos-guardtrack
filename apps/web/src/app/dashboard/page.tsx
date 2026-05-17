import { Suspense } from 'react';
import { Activity, ShieldCheck, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { getDashboardStats, getRecentRounds } from '@/lib/actions/dashboard';

const STATUS_STYLES: Record<string, string> = {
  completada: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  en_curso:   'bg-sky-500/10 text-sky-400 border-sky-500/20',
  incidente:  'bg-rose-500/10 text-rose-400 border-rose-500/20',
  pendiente:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const STATUS_LABELS: Record<string, string> = {
  completada: 'Completada',
  en_curso:   'En Curso',
  incidente:  'Incidente',
  pendiente:  'Pendiente',
};

async function StatsGrid() {
  const stats = await getDashboardStats();

  const cards = [
    { icon: ShieldCheck, label: 'Guardias Activos',   value: stats.activeGuards.toString(),    trend: 'en turno actual',  iconClass: 'text-emerald-400', trendClass: 'text-emerald-400' },
    { icon: Activity,    label: 'Rondas en Curso',    value: stats.activeRounds.toString(),    trend: 'ahora mismo',       iconClass: 'text-primary',     trendClass: 'text-primary'     },
    { icon: AlertCircle, label: 'Incidentes Hoy',     value: stats.openIncidents.toString(),   trend: 'sin resolver',      iconClass: 'text-rose-400',    trendClass: 'text-rose-400'    },
    { icon: Clock,       label: 'Tiempo de Respuesta',value: stats.averageResponseTime,        trend: '-2m vs ayer',       iconClass: 'text-amber-400',   trendClass: 'text-amber-400'   },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="rounded-2xl border-border/50 bg-card">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-secondary/60">
                  <Icon size={20} className={card.iconClass} />
                </div>
                <span className={`text-xs font-semibold ${card.trendClass}`}>{card.trend}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
                <p className="text-3xl font-bold tracking-tight">{card.value}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function StatsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="rounded-2xl border-border/50 bg-card">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RoundsTable() {
  const rounds = await getRecentRounds();

  if (rounds.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50 bg-card">
        <CardHeader className="px-6 py-4 border-b border-border/50">
          <CardTitle className="text-base font-semibold">Monitoreo en Tiempo Real</CardTitle>
        </CardHeader>
        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
          <Activity size={48} className="opacity-30" />
          <p className="text-base font-medium">Sin rondas activas hoy</p>
          <p className="text-sm">Las rondas de los guardias aparecerán aquí.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
      <CardHeader className="px-6 py-4 border-b border-border/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Monitoreo en Tiempo Real</CardTitle>
        <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10 text-xs">
          ● En Vivo
        </Badge>
      </CardHeader>
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Establecimiento</TableHead>
            <TableHead className="text-muted-foreground font-medium">Guardia</TableHead>
            <TableHead className="text-muted-foreground font-medium">Estado</TableHead>
            <TableHead className="text-muted-foreground font-medium">Progreso</TableHead>
            <TableHead className="text-muted-foreground font-medium">Inicio</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rounds.map((round) => (
            <TableRow key={round.id} className="border-border/30 hover:bg-secondary/30 transition-colors">
              <TableCell className="py-4 font-medium">{round.establishment}</TableCell>
              <TableCell className="py-4 text-muted-foreground">{round.guard}</TableCell>
              <TableCell className="py-4">
                <Badge variant="outline" className={STATUS_STYLES[round.status] ?? STATUS_STYLES.pendiente}>
                  {STATUS_LABELS[round.status] ?? round.status}
                </Badge>
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${round.progress}%` }} />
                  </div>
                  <span className="text-xs text-muted-foreground w-8">{round.progress}%</span>
                </div>
              </TableCell>
              <TableCell className="py-4 text-muted-foreground text-sm">{round.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function RoundsTableSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card">
      <CardHeader className="px-6 py-4 border-b border-border/50">
        <Skeleton className="h-5 w-52" />
      </CardHeader>
      <div className="p-4 space-y-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-2 py-4 border-b border-border/20 last:border-0">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-1.5 w-20 rounded-full" />
            <Skeleton className="h-4 w-14" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen general del sistema de vigilancia</p>
      </div>
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid />
      </Suspense>
      <Suspense fallback={<RoundsTableSkeleton />}>
        <RoundsTable />
      </Suspense>
    </div>
  );
}
