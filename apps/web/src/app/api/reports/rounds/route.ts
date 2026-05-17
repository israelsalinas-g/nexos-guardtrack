import { NextRequest, NextResponse } from 'next/server';
import { getRoundsReport } from '@/lib/actions/reports';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const estado = searchParams.get('estado') ?? undefined;
  const establecimiento_id = searchParams.get('establecimiento_id') ?? undefined;
  const desde = searchParams.get('desde') ?? undefined;
  const hasta = searchParams.get('hasta') ?? undefined;

  const rows = await getRoundsReport({ estado, establecimiento_id, desde, hasta });

  interface RoundRow {
    inicio_programado: string;
    inicio_real?: string | null;
    estado: string;
    guardia: { nombre: string } | null;
    turno: {
      nombre: string;
      establecimiento: { nombre: string } | null;
    } | null;
  }

  const headers = ['Establecimiento', 'Guardia', 'Turno', 'Inicio Programado', 'Inicio Real', 'Estado'];
  const csvRows = (rows as unknown as RoundRow[]).map((r) => [
    r.turno?.establecimiento?.nombre ?? 'N/A',
    r.guardia?.nombre ?? 'N/A',
    r.turno?.nombre ?? 'N/A',
    new Date(r.inicio_programado).toLocaleString('es-HN'),
    r.inicio_real ? new Date(r.inicio_real).toLocaleString('es-HN') : 'N/A',
    r.estado,
  ].map((v) => `"${v}"`).join(','));

  const csv = [headers.join(','), ...csvRows].join('\n');
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="rondas-${date}.csv"`,
    },
  });
}
