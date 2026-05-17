const { createClient } = require('@supabase/supabase-js');
global.WebSocket = require('ws');

// Configuración con Service Role (Bypasses RLS)
const SUPABASE_URL = 'https://pfgvtzgwbnkzluyaccps.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmZ3Z0emd3Ym5remx1eWFjY3BzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODcxNDg5MiwiZXhwIjoyMDk0MjkwODkyfQ.2iiUgmFkVhR2gP7xFec7Eu8yYjIyHjrKWNfSK1PSIYs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function syncUsers() {
  try {
    console.log('Fetching auth users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    const authUsers = authData.users;
    console.log(`Found ${authUsers.length} users in auth.users`);

    console.log('Fetching public profiles...');
    const { data: publicData, error: publicError } = await supabase
      .from('usuarios')
      .select('id');
      
    if (publicError) throw publicError;
    
    const existingIds = new Set(publicData.map(u => u.id));
    const missingUsers = authUsers.filter(u => !existingIds.has(u.id));
    
    console.log(`Found ${missingUsers.length} users missing a profile.`);

    if (missingUsers.length === 0) {
      console.log('All users are synced!');
      return;
    }

    const profilesToInsert = missingUsers.map(user => {
      const name = user.user_metadata?.nombre || user.email.split('@')[0];
      const role = user.user_metadata?.role || 'guardia';
      
      return {
        id: user.id,
        nombre: name,
        email: user.email,
        rol: role,
        activo: true
      };
    });

    console.log('Inserting profiles:', profilesToInsert);
    
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert(profilesToInsert);
      
    if (insertError) throw insertError;
    
    console.log('Successfully synced all users!');
  } catch (error) {
    console.error('Error syncing users:', error);
  }
}

syncUsers();
