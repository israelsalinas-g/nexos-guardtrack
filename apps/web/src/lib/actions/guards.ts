'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

type ActionResult = { success: boolean; error?: string };

export async function getGuards() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autorizado');

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.rol !== 'admin' && profile.rol !== 'supervisor')) {
    throw new Error('No autorizado');
  }

  const { data, error } = await supabaseAdmin
    .from('usuarios')
    .select(`
      id, nombre, email, telefono, activo, created_at,
      asignaciones:asignaciones(count)
    `)
    .eq('rol', 'guardia')
    .order('nombre');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createGuard(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
  const telefono = formData.get('telefono') as string;
  const password = formData.get('password') as string;

  if (!nombre || !email || !password) {
    return { success: false, error: 'Nombre, email y contraseña son requeridos.' };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) return { success: false, error: authError.message };

  const { error: insertError } = await supabaseAdmin
    .from('usuarios')
    .upsert({
      id: authData.user.id,
      nombre,
      email,
      telefono: telefono || null,
      rol: 'guardia',
      activo: true,
    });

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: insertError.message };
  }

  revalidatePath('/dashboard/guards');
  return { success: true };
}

export async function deactivateGuard(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'No autorizado' };

  const { data: profile } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (!profile || (profile.rol !== 'admin' && profile.rol !== 'supervisor')) {
    return { success: false, error: 'No autorizado' };
  }

  const { error } = await supabaseAdmin
    .from('usuarios')
    .update({ activo: false })
    .eq('id', id)
    .eq('rol', 'guardia');

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/guards');
  return { success: true };
}
