import * as SQLite from 'expo-sqlite';
import { SyncQueueItem } from '@/types';

export async function addToQueue(
  tipo: SyncQueueItem['tipo'],
  referenciaId: string
): Promise<void> {
  const db = await SQLite.openDatabaseAsync('guardtrack.db');
  await db.runAsync(
    'INSERT INTO cola_sync (tipo, referencia_id, intentos, created_at) VALUES (?, ?, 0, ?)',
    [tipo, referenciaId, Date.now()]
  );
}
