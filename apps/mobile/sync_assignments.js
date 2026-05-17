const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');

const SUPABASE_URL = 'https://pfgvtzgwbnkzluyaccps.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZ3Z0emd3Ym5remx1eWFjY3BzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcxNDg5MiwiZXhwIjoyMDk0MjkwODkyfQ.2iiUgmFkVhR2gP7xFec7Eu8yYjIyHjrKWNfSK1PSIYs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function syncAssignments() {
  console.log('Fetching supervisor and guard IDs...');
  const { data: users, error: userError } = await supabase.from('usuarios').select('id, email');
  if (userError) throw userError;

  const supervisorId = users.find(u => u.email === 'supervisor@nexos.com')?.id;
  const guardia01Id = users.find(u => u.email === 'guardia01@nexos.com')?.id;
  const guardia02Id = users.find(u => u.email === 'guardia02@nexos.com')?.id;

  if (!supervisorId) {
    console.error('Supervisor not found in usuarios table! Please ensure users are seeded.');
    return;
  }

  console.log('Inserting establecimientos...');
  await supabase.from('establecimientos').upsert([
    { id: 'e1000000-0000-0000-0000-000000000001', nombre: 'Oficinas Nexos Centro', direccion: 'Calle Principal #100', ciudad: 'Tegucigalpa', supervisor_id: supervisorId },
    { id: 'e1000000-0000-0000-0000-000000000002', nombre: 'Bodega Logística Norte', direccion: 'Zona Industrial Km 5', ciudad: 'San Pedro Sula', supervisor_id: supervisorId }
  ]);

  console.log('Inserting puntos_control...');
  await supabase.from('puntos_control').upsert([
    { id: 'b1000000-0000-0000-0000-000000000001', establecimiento_id: 'e1000000-0000-0000-0000-000000000001', nombre: 'Entrada Principal', descripcion: 'Lobby edificio A', qr_token: 'NEXOS_ENTRADA_LOBBY' },
    { id: 'b1000000-0000-0000-0000-000000000002', establecimiento_id: 'e1000000-0000-0000-0000-000000000001', nombre: 'Salida de Emergencia', descripcion: 'Pasillo posterior nivel 1', qr_token: 'NEXOS_SALIDA_EMERG' },
    { id: 'b1000000-0000-0000-0000-000000000003', establecimiento_id: 'e1000000-0000-0000-0000-000000000002', nombre: 'Muelle de Carga', descripcion: 'Área de embarque CEDIS', qr_token: 'CEDIS_MUELLE_A' }
  ]);

  console.log('Inserting turnos...');
  await supabase.from('turnos').upsert([
    { id: 'f1000000-0000-0000-0000-000000000001', establecimiento_id: 'e1000000-0000-0000-0000-000000000001', nombre: 'Turno Mañana', hora_inicio: '06:00:00', hora_fin: '14:00:00', dias_semana: [1,2,3,4,5,6], intervalo_ronda_min: 60 },
    { id: 'f1000000-0000-0000-0000-000000000002', establecimiento_id: 'e1000000-0000-0000-0000-000000000001', nombre: 'Turno Noche', hora_inicio: '22:00:00', hora_fin: '06:00:00', dias_semana: [1,2,3,4,5,6,7], intervalo_ronda_min: 45 }
  ]);

  console.log('Inserting asignaciones...');
  const asignaciones = [];
  if (guardia01Id) asignaciones.push({ id: 'a1000000-0000-0000-0000-000000000001', guardia_id: guardia01Id, turno_id: 'f1000000-0000-0000-0000-000000000001', activo: true });
  if (guardia02Id) asignaciones.push({ id: 'a1000000-0000-0000-0000-000000000002', guardia_id: guardia02Id, turno_id: 'f1000000-0000-0000-0000-000000000002', activo: true });

  if (asignaciones.length > 0) {
    await supabase.from('asignaciones').upsert(asignaciones);
    console.log(`Synced ${asignaciones.length} assignments!`);
  } else {
    console.log('No guards found to assign.');
  }
}

syncAssignments();
