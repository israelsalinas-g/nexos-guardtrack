'use server';

import { createSupabaseServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getShiftsByEstablishment(establishmentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('turnos')
    .select('*')
    .eq('establecimiento_id', establishmentId)
    .order('hora_inicio', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getShifts(establishmentId?: string) {
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from('turnos')
    .select('*, establecimientos!turnos_establecimiento_id_fkey(nombre)')
    .order('hora_inicio', { ascending: true });

  if (establishmentId) {
    query = query.eq('establecimiento_id', establishmentId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function createShift(_prevState: unknown, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const establecimiento_id = formData.get('establecimiento_id') as string;
  const nombre = formData.get('nombre') as string;
  const hora_inicio = formData.get('hora_inicio') as string;
  const hora_fin = formData.get('hora_fin') as string;
  const dias_semana = formData.getAll('dias_semana').map(Number);
  const intervalo_ronda_min = Number(formData.get('intervalo_ronda_min')) || 60;

  if (!establecimiento_id || !nombre || !hora_inicio || !hora_fin) {
    return { success: false, error: 'Todos los campos son requeridos' };
  }
  if (dias_semana.length === 0) {
    return { success: false, error: 'Selecciona al menos un día' };
  }

  const { data, error } = await supabase
    .from('turnos')
    .insert([{ establecimiento_id, nombre, hora_inicio, hora_fin, dias_semana, intervalo_ronda_min }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/establishments');
  revalidatePath('/dashboard/shifts');
  return { success: true, data };
}

export async function deleteShift(id: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from('turnos').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/establishments');
  revalidatePath('/dashboard/shifts');
}
