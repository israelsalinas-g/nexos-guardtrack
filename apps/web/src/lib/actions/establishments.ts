'use server';

import { createSupabaseServerClient } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function createEstablishment(_prevState: unknown, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const nombre = formData.get('nombre') as string;
  const direccion = formData.get('direccion') as string;
  const ciudad = formData.get('ciudad') as string;

  if (!nombre || nombre.length < 3) {
    return { success: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }

  const { data, error } = await supabase
    .from('establecimientos')
    .insert([{ nombre, direccion: direccion || null, ciudad: ciudad || null }])
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath('/dashboard/establishments');
  return { success: true, data };
}

export async function getEstablishments() {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('establecimientos')
    .select(`
      *,
      supervisor:usuarios!establecimientos_supervisor_id_fkey(nombre),
      puntos_count:puntos_control(count)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getEstablishmentById(id: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('establecimientos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getControlPoints(establishmentId: string) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('puntos_control')
    .select('*')
    .eq('establecimiento_id', establishmentId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEstablishment(id: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('establecimientos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/establishments');
}

export async function getEstablishmentsSimple() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('establecimientos')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createControlPoint(_prevState: unknown, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const nombre = formData.get('nombre') as string;
  const descripcion = formData.get('descripcion') as string;
  const establecimiento_id = formData.get('establecimiento_id') as string;

  if (!nombre || !establecimiento_id) {
    return { success: false, error: 'El nombre y el establecimiento son requeridos.' };
  }

  const qr_token = crypto.randomUUID();

  const { error } = await supabase
    .from('puntos_control')
    .insert([{ nombre, descripcion: descripcion || null, establecimiento_id, qr_token }]);

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/establishments/${establecimiento_id}`);
  revalidatePath('/dashboard/establishments');
  return { success: true };
}

export async function deleteControlPoint(id: string, establishmentId: string) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from('puntos_control')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);

  revalidatePath(`/dashboard/establishments/${establishmentId}`);
  revalidatePath('/dashboard/establishments');
}
