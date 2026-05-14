'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useNotifications() {
  useEffect(() => {
    // 1. Request Permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // 2. Subscribe to new incidents
    const channel = supabase
      .channel('realtime_incidents')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'incidents' },
        (payload) => {
          if (Notification.permission === 'granted') {
            new Notification('¡Alerta de Incidente!', {
              body: payload.new.title || 'Se ha registrado un nuevo incidente.',
              icon: '/shield.png'
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
