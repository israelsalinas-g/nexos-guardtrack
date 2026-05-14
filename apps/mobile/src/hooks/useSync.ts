import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { supabase } from '../lib/supabase';

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncData = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');

      // 1. Sync Pending Rounds
      const pendingRounds = await db.getAllAsync<{id: string, turno_id: string, establecimiento_id: string, inicio_real: number, estado: string}>(
        'SELECT * FROM rondas_local WHERE sincronizado = 0'
      );

      for (const round of pendingRounds) {
        const { error } = await supabase.from('rondas').upsert({
          id: round.id,
          turno_id: round.turno_id,
          establecimiento_id: round.establecimiento_id,
          inicio_real: new Date(round.inicio_real).toISOString(),
          estado: round.estado
        });

        if (!error) {
          await db.runAsync('UPDATE rondas_local SET sincronizado = 1 WHERE id = ?', [round.id]);
        }
      }

      // 2. Sync Pending Scans
      const pendingScans = await db.getAllAsync<{id: string, ronda_id: string, punto_id: string, timestamp: number}>(
        'SELECT * FROM escaneos_local WHERE sincronizado = 0'
      );

      for (const scan of pendingScans) {
        const { error } = await supabase.from('escaneos').insert({
          ronda_id: scan.ronda_id,
          punto_control_id: scan.punto_id,
          timestamp_escaneo: new Date(scan.timestamp).toISOString(),
          offline: true
        });

        if (!error) {
          await db.runAsync('UPDATE escaneos_local SET sincronizado = 1 WHERE id = ?', [scan.id]);
        }
      }

    } catch (error) {
      console.error('Sync Error:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(syncData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { syncData, isSyncing };
}
