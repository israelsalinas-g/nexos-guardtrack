import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  // Simple auth check for cron (using a secret header)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Find late rounds
  const { data: lateRounds, error: fetchError } = await supabase
    .from('rondas')
    .select('id, turno_id')
    .eq('estado', 'pendiente')
    .lt('inicio_programado', fifteenMinutesAgo);

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!lateRounds || lateRounds.length === 0) {
    return NextResponse.json({ message: 'No late rounds found' });
  }

  // Mark as incident and create incident records
  for (const round of lateRounds) {
    await supabase
      .from('rondas')
      .update({ estado: 'incidente' })
      .eq('id', round.id);

    await supabase
      .from('incidentes')
      .insert({
        ronda_id: round.id,
        tipo: 'ronda_vencida',
        descripcion: 'La ronda no fue iniciada dentro de los 15 minutos permitidos.',
        estado: 'nuevo'
      });
  }

  return NextResponse.json({ 
    message: `Processed ${lateRounds.length} late rounds`,
    processed: lateRounds.length 
  });
}
