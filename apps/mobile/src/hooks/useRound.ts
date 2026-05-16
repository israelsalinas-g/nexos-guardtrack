import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { addToQueue } from '@/lib/queue';

export interface Round {
  id: string;
  turno_id: string;
  establecimiento_id: string;
  estado: string;
  inicio_real: number;
}

export function useRound() {
  const [activeRound, setActiveRound] = useState<Round | null>(null);
  const [scannedPoints, setScannedPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadActiveRound = useCallback(async () => {
    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      const round = await db.getFirstAsync<Round>(
        'SELECT * FROM rondas_local WHERE estado = ?',
        ['en_curso']
      );

      if (round) {
        setActiveRound(round);
        const scans = await db.getAllAsync<{ punto_id: string }>(
          'SELECT punto_id FROM escaneos_local WHERE ronda_id = ?',
          [round.id]
        );
        setScannedPoints(scans.map(s => s.punto_id));
      } else {
        setActiveRound(null);
        setScannedPoints([]);
      }
    } catch (error) {
      console.error('Error loading round:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const startRound = async (turnoId: string, establecimientoId: string): Promise<string> => {
    const db = await SQLite.openDatabaseAsync('guardtrack.db');
    const roundId = Crypto.randomUUID();
    const startTime = Date.now();

    await db.runAsync(
      'INSERT INTO rondas_local (id, turno_id, establecimiento_id, inicio_real, estado, sincronizado) VALUES (?, ?, ?, ?, ?, ?)',
      [roundId, turnoId, establecimientoId, startTime, 'en_curso', 0]
    );
    await addToQueue('ronda', roundId);

    setActiveRound({ id: roundId, turno_id: turnoId, establecimiento_id: establecimientoId, inicio_real: startTime, estado: 'en_curso' });
    setScannedPoints([]);
    return roundId;
  };

  const saveScan = async (
    pointId: string,
    lat?: number | null,
    lng?: number | null,
    fotoPath?: string | null
  ): Promise<string> => {
    if (!activeRound) throw new Error('No active round');

    const db = await SQLite.openDatabaseAsync('guardtrack.db');
    const scanId = Crypto.randomUUID();
    const timestamp = Date.now();

    await db.runAsync(
      'INSERT INTO escaneos_local (id, ronda_id, punto_id, timestamp, lat, lng, foto_path, sincronizado) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [scanId, activeRound.id, pointId, timestamp, lat ?? null, lng ?? null, fotoPath ?? null, 0]
    );
    await addToQueue('escaneo', scanId);

    setScannedPoints(prev => [...prev, pointId]);
    return scanId;
  };

  const finishRound = async () => {
    if (!activeRound) return;

    const db = await SQLite.openDatabaseAsync('guardtrack.db');
    const endTime = Date.now();

    await db.runAsync(
      'UPDATE rondas_local SET estado = ?, fin_real = ?, sincronizado = 0 WHERE id = ?',
      ['completada', endTime, activeRound.id]
    );
    await addToQueue('ronda', activeRound.id);

    setActiveRound(null);
    setScannedPoints([]);
  };

  useEffect(() => {
    loadActiveRound();
  }, [loadActiveRound]);

  return {
    activeRound,
    scannedPoints,
    loading,
    startRound,
    saveScan,
    finishRound,
    refresh: loadActiveRound,
  };
}
