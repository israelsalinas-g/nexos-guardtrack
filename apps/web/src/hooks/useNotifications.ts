'use client';

import { useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

export function useNotifications() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const supabase = createSupabaseBrowserClient();

    const channel = supabase
      .channel('realtime_incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidentes' },
        (payload) => {
          if (Notification.permission === 'granted') {
            new Notification('¡Alerta de Incidente!', {
              body: payload.new.descripcion || 'Se ha registrado un nuevo incidente.',
              icon: '/assets/logo_nexos_guardtrack.png',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
