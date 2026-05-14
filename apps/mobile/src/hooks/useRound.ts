import { useState, useEffect, useCallback } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';

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
      
      // Check for active round in local DB
      const round = await db.getFirstAsync<Round>(
        'SELECT * FROM rondas_local WHERE estado = ?',
        ['en_curso']
      );

      if (round) {
        setActiveRound(round);
        
        // Load scanned points for this round
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

  const startRound = async (turnoId: string, establecimientoId: string) => {
    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      const roundId = Crypto.randomUUID();
      const startTime = Date.now();

      await db.runAsync(
        'INSERT INTO rondas_local (id, turno_id, establecimiento_id, inicio_real, estado, sincronizado) VALUES (?, ?, ?, ?, ?, ?)',
        [roundId, turnoId, establecimientoId, startTime, 'en_curso', 0]
      );

      setActiveRound({
        id: roundId,
        turno_id: turnoId,
        establecimiento_id: establecimientoId,
        inicio_real: startTime,
        estado: 'en_curso'
      });
      setScannedPoints([]);
      return roundId;
    } catch (error) {
      console.error('Error starting round:', error);
      throw error;
    }
  };

  const saveScan = async (pointId: string) => {
    if (!activeRound) return;
    
    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      const scanId = Crypto.randomUUID();
      const timestamp = Date.now();

      await db.runAsync(
        'INSERT INTO escaneos_local (id, ronda_id, punto_id, timestamp, sincronizado) VALUES (?, ?, ?, ?, ?)',
        [scanId, activeRound.id, pointId, timestamp, 0]
      );

      setScannedPoints(prev => [...prev, pointId]);
    } catch (error) {
      console.error('Error saving scan:', error);
      throw error;
    }
  };

  const finishRound = async () => {
    if (!activeRound) return;

    try {
      const db = await SQLite.openDatabaseAsync('guardtrack.db');
      const endTime = Date.now();

      await db.runAsync(
        'UPDATE rondas_local SET estado = ?, fin_real = ?, sincronizado = 0 WHERE id = ?',
        ['completada', endTime, activeRound.id]
      );

      setActiveRound(null);
      setScannedPoints([]);
    } catch (error) {
      console.error('Error finishing round:', error);
      throw error;
    }
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
    refresh: loadActiveRound 
  };
}
