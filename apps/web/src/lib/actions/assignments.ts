'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase';

type ActionResult = { success: boolean; error?: string };

export async function getAssignments() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('asignaciones')
    .select(`
      id, fecha_inicio, fecha_fin, activo, created_at,
      guardia:usuarios!asignaciones_guardia_id_fkey(id, nombre, email),
      turno:turnos(id, nombre, hora_inicio, hora_fin,
        establecimiento:establecimientos(id, nombre)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAssignment(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const guardia_id = formData.get('guardia_id') as string;
  const turno_id = formData.get('turno_id') as string;
  const fecha_inicio = formData.get('fecha_inicio') as string;
  const fecha_fin = formData.get('fecha_fin') as string | null;

  if (!guardia_id || !turno_id || !fecha_inicio) {
    return { success: false, error: 'Guardia, turno y fecha de inicio son requeridos.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('asignaciones')
    .insert({
      guardia_id,
      turno_id,
      fecha_inicio,
      fecha_fin: fecha_fin || null,
      activo: true,
    });

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true };
}

export async function deactivateAssignment(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('asignaciones')
    .update({ activo: false })
    .eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/assignments');
  return { success: true };
}
