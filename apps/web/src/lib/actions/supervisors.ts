'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';

type ActionResult = { success: boolean; error?: string };

export async function getSupervisors() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('usuarios')
    .select(`
      id, nombre, email, activo, created_at,
      establecimientos:establecimientos(count)
    `)
    .eq('rol', 'supervisor')
    .order('nombre');

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createSupervisor(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
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
    .insert({
      id: authData.user.id,
      nombre,
      email,
      rol: 'supervisor',
      activo: true,
    });

  if (insertError) {
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return { success: false, error: insertError.message };
  }

  revalidatePath('/dashboard/supervisors');
  return { success: true };
}

export async function deactivateSupervisor(id: string): Promise<ActionResult> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('usuarios')
    .update({ activo: false })
    .eq('id', id)
    .eq('rol', 'supervisor');

  if (error) return { success: false, error: error.message };
  revalidatePath('/dashboard/supervisors');
  return { success: true };
}
