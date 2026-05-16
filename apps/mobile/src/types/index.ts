export type UserRole = 'guardia' | 'supervisor' | 'admin';

export interface AppUser {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface LocalRound {
  id: string;
  turno_id: string;
  establecimiento_id: string;
  estado: 'en_curso' | 'completada' | 'incidente';
  inicio_real: number;
  fin_real: number | null;
  sincronizado: 0 | 1;
}

export interface LocalScan {
  id: string;
  ronda_id: string;
  punto_id: string;
  timestamp: number;
  lat: number | null;
  lng: number | null;
  foto_path: string | null;
  sincronizado: 0 | 1;
}

export interface LocalIncident {
  id: string;
  ronda_id: string | null;
  tipo: 'manual';
  descripcion: string;
  foto_path: string | null;
  sincronizado: 0 | 1;
  created_at: number;
}

export interface SyncQueueItem {
  id: number;
  tipo: 'ronda' | 'escaneo' | 'incidente';
  referencia_id: string;
  intentos: number;
  ultimo_error: string | null;
  created_at: number;
}

export interface ControlPoint {
  id: string;
  establecimiento_id: string;
  nombre: string;
  qr_token: string;
}
