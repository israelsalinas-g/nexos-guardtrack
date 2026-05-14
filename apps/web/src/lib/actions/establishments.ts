'use server';

import { supabase } from '@/lib/supabase';
import { EstablishmentSchema, type Establishment } from '@guardtrack/shared';
import { revalidatePath } from 'next/cache';

export async function createEstablishment(data: Establishment) {
  const validated = EstablishmentSchema.parse(data);
  
  const { data: result, error } = await supabase
    .from('establecimientos')
    .insert([validated])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  revalidatePath('/admin/establishments');
  return result;
}

export async function getEstablishments() {
  const { data, error } = await supabase
    .from('establecimientos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getEstablishmentById(id: string) {
  const { data, error } = await supabase
    .from('establecimientos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getControlPoints(establishmentId: string) {
  const { data, error } = await supabase
    .from('puntos_control')
    .select('*')
    .eq('establecimiento_id', establishmentId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteEstablishment(id: string) {
  const { error } = await supabase
    .from('establecimientos')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
  revalidatePath('/admin/establishments');
}
