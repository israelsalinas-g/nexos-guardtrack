import { useEffect, useRef, useState, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '@/lib/supabase';

const MAX_INTENTOS = 5;
const POLL_INTERVAL_MS = 60_000;

export interface UseSyncReturn {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  syncNow: () => void;
}

export function useNetSync(): UseSyncReturn {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const syncingRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    const db = await SQLite.openDatabaseAsync('guardtrack.db');
    const pending = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) as n FROM cola_sync WHERE intentos < ?', [MAX_INTENTOS]
    );
    const failed = await db.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) as n FROM cola_sync WHERE intentos >= ?', [MAX_INTENTOS]
    );
    setPendingCount(pending?.n ?? 0);
    setFailedCount(failed?.n ?? 0);
  }, []);

  const processQueue = useCallback(async () => {
    if (syncingRef.current) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    syncingRef.current = true;
    setIsSyncing(true);

    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      const items = await db.getAllAsync<{
        id: number; tipo: string; referencia_id: string; intentos: number;
      }>(
        'SELECT id, tipo, referencia_id, intentos FROM cola_sync WHERE intentos < ? ORDER BY created_at ASC',
        [MAX_INTENTOS]
      );

      for (const item of items) {
        if (item.tipo === 'ronda') {
          await syncRound(db, item, user.id);
        } else if (item.tipo === 'escaneo') {
          await syncScan(db, item, user.id);
        } else if (item.tipo === 'incidente') {
          await syncIncident(db, item, user.id);
        }
      }
    } catch (err) {
      console.error('[useNetSync] queue processing error:', err);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
      await refreshCounts();
    }
  }, [refreshCounts]);

  useEffect(() => {
    refreshCounts();

    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        processQueue();
      }
    });

    const interval = setInterval(processQueue, POLL_INTERVAL_MS);

    return () => {
      unsubscribeNetInfo();
      clearInterval(interval);
    };
  }, [processQueue, refreshCounts]);

  return { isSyncing, pendingCount, failedCount, syncNow: processQueue };
}

// --- helpers ---

async function syncRound(
  db: SQLite.SQLiteDatabase,
  item: { id: number; referencia_id: string },
  userId: string
) {
  const round = await db.getFirstAsync<{
    id: string; turno_id: string; establecimiento_id: string;
    estado: string; inicio_real: number; fin_real: number | null;
  }>('SELECT * FROM rondas_local WHERE id = ?', [item.referencia_id]);

  if (!round) {
    await db.runAsync('DELETE FROM cola_sync WHERE id = ?', [item.id]);
    return;
  }

  const payload: Record<string, unknown> = {
    id: round.id,
    guardia_id: userId,
    turno_id: round.turno_id,
    establecimiento_id: round.establecimiento_id,
    inicio_programado: new Date(round.inicio_real).toISOString(),
    inicio_real: new Date(round.inicio_real).toISOString(),
    estado: round.estado,
  };
  if (round.fin_real) {
    payload.fin_real = new Date(round.fin_real).toISOString();
  }

  const { error } = await supabase.from('rondas').upsert(payload);
  if (!error) {
    await db.runAsync('DELETE FROM cola_sync WHERE id = ?', [item.id]);
    await db.runAsync('UPDATE rondas_local SET sincronizado = 1 WHERE id = ?', [round.id]);
  } else {
    await db.runAsync(
      'UPDATE cola_sync SET intentos = intentos + 1, ultimo_error = ? WHERE id = ?',
      [error.message, item.id]
    );
  }
}

async function syncScan(
  db: SQLite.SQLiteDatabase,
  item: { id: number; referencia_id: string },
  userId: string
) {
  const scan = await db.getFirstAsync<{
    id: string; ronda_id: string; punto_id: string;
    timestamp: number; lat: number | null; lng: number | null; foto_path: string | null;
  }>('SELECT * FROM escaneos_local WHERE id = ?', [item.referencia_id]);

  if (!scan) {
    await db.runAsync('DELETE FROM cola_sync WHERE id = ?', [item.id]);
    return;
  }

  const payload: Record<string, unknown> = {
    id: scan.id,
    ronda_id: scan.ronda_id,
    punto_control_id: scan.punto_id,
    guardia_id: userId,
    timestamp_escaneo: new Date(scan.timestamp).toISOString(),
    offline: true,
  };
  if (scan.lat !== null) payload.latitud = scan.lat;
  if (scan.lng !== null) payload.longitud = scan.lng;

  // foto_url upload will be handled in Phase 3 — skip for now if foto_path present
  // but still sync the scan record without the photo

  const { error } = await supabase.from('escaneos').upsert(payload);
  if (!error) {
    await db.runAsync('DELETE FROM cola_sync WHERE id = ?', [item.id]);
    await db.runAsync('UPDATE escaneos_local SET sincronizado = 1 WHERE id = ?', [scan.id]);
  } else {
    await db.runAsync(
      'UPDATE cola_sync SET intentos = intentos + 1, ultimo_error = ? WHERE id = ?',
      [error.message, item.id]
    );
  }
}

async function syncIncident(
  db: SQLite.SQLiteDatabase,
  item: { id: number; referencia_id: string },
  userId: string
) {
  const incident = await db.getFirstAsync<{
    id: string; ronda_id: string | null; tipo: string;
    descripcion: string; foto_path: string | null; created_at: number;
  }>('SELECT * FROM incidentes_local WHERE id = ?', [item.referencia_id]);

  if (!incident) {
    await db.runAsync('DELETE FROM cola_sync WHERE id = ?', [item.id]);
    return;
  }

  const payload: Record<string, unknown> = {
    id: incident.id,
    tipo: incident.tipo,
    descripcion: incident.descripcion,
    estado: 'nuevo',
    reportado_por: userId,   // columna añadida en migración 20260515
    created_at: new Date(incident.created_at).toISOString(),
  };
  if (incident.ronda_id) payload.ronda_id = incident.ronda_id;

  const { error } = await supabase.from('incidentes').upsert(payload);
  if (!error) {
    await db.runAsync('DELETE FROM cola_sync WHERE id = ?', [item.id]);
    await db.runAsync('UPDATE incidentes_local SET sincronizado = 1 WHERE id = ?', [incident.id]);
  } else {
    await db.runAsync(
      'UPDATE cola_sync SET intentos = intentos + 1, ultimo_error = ? WHERE id = ?',
      [error.message, item.id]
    );
  }
}
