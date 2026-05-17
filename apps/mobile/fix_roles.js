const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');

const SUPABASE_URL = 'https://pfgvtzgwbnkzluyaccps.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZ3Z0emd3Ym5remx1eWFjY3BzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcxNDg5MiwiZXhwIjoyMDk0MjkwODkyfQ.2iiUgmFkVhR2gP7xFec7Eu8yYjIyHjrKWNfSK1PSIYs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function fixRoles() {
  await supabase.from('usuarios').update({ rol: 'admin' }).eq('email', 'admin@nexos.com');
  await supabase.from('usuarios').update({ rol: 'supervisor' }).eq('email', 'supervisor@nexos.com');
  console.log('Roles corrected!');
}

fixRoles();
