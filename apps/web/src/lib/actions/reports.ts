'use server';

import { createSupabaseServerClient } from '@/lib/supabase';

export async function exportRoundsToCSV() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('rondas')
    .select(`
      inicio_programado,
      inicio_real,
      estado,
      usuarios!rondas_guardia_id_fkey (nombre),
      turnos!rondas_turno_id_fkey (nombre, establecimientos!turnos_establecimiento_id_fkey (nombre))
    `)
    .order('inicio_programado', { ascending: false });

  if (error) throw new Error(error.message);

  interface RawReport {
    inicio_programado: string;
    inicio_real: string | null;
    estado: string;
    usuarios: { nombre: string } | null;
    turnos: {
      nombre: string;
      establecimientos: { nombre: string } | null;
    } | null;
  }

  const rows = (data as unknown as RawReport[]).map(r => [
    r.turnos?.establecimientos?.nombre || 'N/A',
    r.usuarios?.nombre || 'N/A',
    r.turnos?.nombre || 'N/A',
    new Date(r.inicio_programado).toLocaleString('es-HN'),
    r.inicio_real ? new Date(r.inicio_real).toLocaleString('es-HN') : 'N/A',
    r.estado,
  ]);

  const headers = ['Establecimiento', 'Guardia', 'Turno', 'Inicio Programado', 'Inicio Real', 'Estado'];
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
