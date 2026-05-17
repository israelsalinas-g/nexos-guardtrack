import { z } from 'zod';

// --- Establishments ---
export const EstablishmentSchema = z.object({
  id: z.string().uuid().optional(),
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  direccion: z.string().optional(),
  ciudad: z.string().optional(),
  supervisor_id: z.string().uuid().optional(),
});

// --- Control Points ---
export const ControlPointSchema = z.object({
  id: z.string().uuid().optional(),
  establecimiento_id: z.string().uuid(),
  nombre: z.string().min(2, 'El nombre es requerido'),
  descripcion: z.string().optional(),
  qr_token: z.string(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
});

// --- Shifts ---
export const ShiftSchema = z.object({
  id: z.string().uuid().optional(),
  establecimiento_id: z.string().uuid(),
  nombre: z.string().min(2, 'El nombre es requerido'),
  hora_inicio: z.string().regex(/^\d{2}:\d{2}/, 'Formato HH:MM requerido'),
  hora_fin: z.string().regex(/^\d{2}:\d{2}/, 'Formato HH:MM requerido'),
  dias_semana: z.array(z.number().min(1).max(7)).min(1, 'Selecciona al menos un día'),
  intervalo_ronda_min: z.number().min(15).max(480).default(60),
});

// --- Guards / Users ---
export const GuardSchema = z.object({
  nombre: z.string().min(2, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const SupervisorSchema = GuardSchema;

// --- Assignments ---
export const AssignmentSchema = z.object({
  guardia_id: z.string().uuid('Selecciona un guardia'),
  turno_id: z.string().uuid('Selecciona un turno'),
  fecha_inicio: z.string(),
  fecha_fin: z.string().optional(),
});

// --- Rounds ---
export const RoundStatus = z.enum(['pendiente', 'en_curso', 'completada', 'incidente']);
export const RoundSchema = z.object({
  id: z.string().uuid().optional(),
  guardia_id: z.string().uuid(),
  turno_id: z.string().uuid(),
  establecimiento_id: z.string().uuid(),
  estado: RoundStatus.default('pendiente'),
  inicio_programado: z.string().datetime(),
  inicio_real: z.string().datetime().optional(),
  fin_real: z.string().datetime().optional(),
});

// --- Scans ---
export const ScanSchema = z.object({
  id: z.string().uuid().optional(),
  ronda_id: z.string().uuid(),
  punto_control_id: z.string().uuid(),
  guardia_id: z.string().uuid(),
  timestamp_escaneo: z.string().datetime().optional(),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
  foto_url: z.string().url().optional(),
  offline: z.boolean().default(false),
});

// --- Incidents ---
export const IncidentType = z.enum(['ronda_vencida', 'ronda_incompleta', 'manual']);
export const IncidentStatus = z.enum(['nuevo', 'revisado', 'cerrado']);
export const IncidentSchema = z.object({
  id: z.string().uuid().optional(),
  ronda_id: z.string().uuid().optional(),
  tipo: IncidentType.default('manual'),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  estado: IncidentStatus.default('nuevo'),
  reportado_por: z.string().uuid().optional(),
});

// --- Exported types ---
export type Establishment = z.infer<typeof EstablishmentSchema>;
export type ControlPoint = z.infer<typeof ControlPointSchema>;
export type Shift = z.infer<typeof ShiftSchema>;
export type Guard = z.infer<typeof GuardSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
export type Round = z.infer<typeof RoundSchema>;
export type Scan = z.infer<typeof ScanSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
