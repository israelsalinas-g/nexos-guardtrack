'use server';

import { createSupabaseServerClient } from '@/lib/supabase';

interface ReportFilters {
  estado?: string;
  establecimiento_id?: string;
  desde?: string;
  hasta?: string;
}

export async function getRoundsReport(filters: ReportFilters = {}) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('rondas')
    .select(`
      id, inicio_programado, inicio_real, estado, created_at,
      guardia:usuarios!rondas_guardia_id_fkey(id, nombre),
      turno:turnos!rondas_turno_id_fkey(
        id, nombre,
        establecimiento:establecimientos!turnos_establecimiento_id_fkey(id, nombre)
      )
    `)
    .order('inicio_programado', { ascending: false });

  if (filters.estado) query = query.eq('estado', filters.estado);
  if (filters.desde) query = query.gte('inicio_programado', filters.desde);
  if (filters.hasta) query = query.lte('inicio_programado', filters.hasta + 'T23:59:59');

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  let rows = data ?? [];

  if (filters.establecimiento_id) {
    rows = rows.filter((r) => {
      const turno = r.turno as unknown as { establecimiento: { id: string } | null } | null;
      return turno?.establecimiento?.id === filters.establecimiento_id;
    });
  }

  return rows;
}

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
