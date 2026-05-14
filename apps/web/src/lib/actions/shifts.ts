'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function getShiftsByEstablishment(establishmentId: string) {
  const { data, error } = await supabase
    .from('shifts')
    .select('*')
    .eq('establishment_id', establishmentId)
    .order('start_time', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createShift(establishmentId: string, name: string, startTime: string, endTime: string, interval: number) {
  const { data, error } = await supabase
    .from('shifts')
    .insert([{
      establishment_id: establishmentId,
      name,
      start_time: startTime,
      end_time: endTime,
      round_interval_minutes: interval
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath('/admin/establishments');
  return data;
}
