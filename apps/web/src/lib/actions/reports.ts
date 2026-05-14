'use server';

import { supabase } from '@/lib/supabase';

export async function exportRoundsToCSV() {
  const query = supabase
    .from('rondas')
    .select(`
      inicio_programado,
      inicio_real,
      estado,
      usuarios (nombre),
      turnos (nombre, establecimientos (nombre))
    `)
    .order('inicio_programado', { ascending: false });

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  interface RawReport {
    inicio_programado: string;
    inicio_real: string | null;
    estado: string;
    usuarios: { nombre: string } | null;
    turnos: { 
      nombre: string;
      establecimientos: { nombre: string } | null 
    } | null;
  }

  const rows = (data as unknown as RawReport[]).map(r => [
    r.turnos?.establecimientos?.nombre || 'N/A',
    r.usuarios?.nombre || 'N/A',
    r.turnos?.nombre || 'N/A',
    new Date(r.inicio_programado).toLocaleString(),
    r.inicio_real ? new Date(r.inicio_real).toLocaleString() : 'N/A',
    r.estado
  ]);

  const headers = ['Establecimiento', 'Guardia', 'Turno', 'Inicio Programado', 'Inicio Real', 'Estado'];

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}
