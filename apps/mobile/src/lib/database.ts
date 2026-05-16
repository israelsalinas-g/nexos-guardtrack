import * as SQLite from 'expo-sqlite';

export const initDatabase = async () => {
  const db = await SQLite.openDatabaseAsync('guardtrack.db');

  // Create tables for offline storage - Aligned with Supabase Schema v1.1
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS puntos_control_local (
      id TEXT PRIMARY KEY,
      establecimiento_id TEXT,
      nombre TEXT,
      qr_token TEXT
    );

    CREATE TABLE IF NOT EXISTS escaneos_local (
      id TEXT PRIMARY KEY,
      ronda_id TEXT,
      punto_id TEXT,
      timestamp INTEGER,
      lat REAL,
      lng REAL,
      foto_path TEXT,
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS rondas_local (
      id TEXT PRIMARY KEY,
      turno_id TEXT,
      establecimiento_id TEXT,
      estado TEXT DEFAULT 'en_curso',
      inicio_real INTEGER,
      fin_real INTEGER,
      sincronizado INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS cola_sync (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tipo TEXT,
      referencia_id TEXT,
      intentos INTEGER DEFAULT 0,
      ultimo_error TEXT,
      created_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS incidentes_local (
      id TEXT PRIMARY KEY,
      ronda_id TEXT,
      tipo TEXT NOT NULL DEFAULT 'manual',
      descripcion TEXT NOT NULL,
      foto_path TEXT,
      sincronizado INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL
    );
  `);

  return db;
};
