'use server';

import { createSupabaseServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getIncidents() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('incidentes')
    .select(`
      *,
      ronda:rondas (
        id,
        guardia:usuarios!rondas_guardia_id_fkey (nombre),
        establecimiento:establecimientos!rondas_establecimiento_id_fkey (nombre)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    return [];
  }

  return data;
}

interface IncidentUpdate {
  estado: 'nuevo' | 'revisado' | 'cerrado';
  notas_cierre?: string;
  cerrado_at?: string;
  supervisor_id?: string;
}

export async function updateIncidentStatus(id: string, estado: 'nuevo' | 'revisado' | 'cerrado', notas: string = '') {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const updateData: IncidentUpdate = {
    estado,
    notas_cierre: notas,
  };

  if (estado === 'cerrado') {
    updateData.cerrado_at = new Date().toISOString();
    updateData.supervisor_id = user?.id;
  }

  const { error } = await supabase
    .from('incidentes')
    .update(updateData)
    .eq('id', id);

  if (error) throw error;

  revalidatePath('/admin/incidents');
}
