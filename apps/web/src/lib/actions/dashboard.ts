'use server';

import { supabase } from '@/lib/supabase';

export async function getDashboardStats() {
  const { count: activeGuards } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true })
    .eq('rol', 'guardia');

  const { count: activeRounds } = await supabase
    .from('rondas')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'en_curso');

  const { count: openIncidents } = await supabase
    .from('incidentes')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'nuevo');

  return {
    activeGuards: activeGuards || 0,
    activeRounds: activeRounds || 0,
    openIncidents: openIncidents || 0,
    averageResponseTime: '14m',
  };
}

export async function getRecentRounds() {
  const { data, error } = await supabase
    .from('rondas')
    .select(`
      id,
      inicio_programado,
      estado,
      usuarios!rondas_guardia_id_fkey (nombre),
      turnos!rondas_turno_id_fkey (
        establecimientos!turnos_establecimiento_id_fkey (nombre)
      )
    `)
    .order('inicio_programado', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching recent rounds:', error);
    return [];
  }

  interface RawRound {
    id: string;
    inicio_programado: string;
    estado: string;
    usuarios: { nombre: string } | null;
    turnos: { 
      establecimientos: { nombre: string } | null 
    } | null;
  }

  return (data as unknown as RawRound[]).map((r) => ({
    id: r.id,
    establishment: r.turnos?.establecimientos?.nombre || 'Desconocido',
    guard: r.usuarios?.nombre || 'Sin asignar',
    status: r.estado,
    time: new Date(r.inicio_programado).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    progress: r.estado === 'completada' ? 100 : r.estado === 'en_curso' ? 45 : 0
  }));
}
