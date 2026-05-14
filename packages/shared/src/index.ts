import { z } from 'zod';

// --- Establishments ---
export const EstablishmentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  address: z.string().optional(),
});

// --- Control Points ---
export const ControlPointSchema = z.object({
  id: z.string().uuid().optional(),
  establishment_id: z.string().uuid(),
  name: z.string().min(2, "El nombre es requerido"),
  qr_token: z.string(),
  order_index: z.number().default(0),
});

// --- Rounds ---
export const RoundStatus = z.enum(['pending', 'in_progress', 'completed', 'incident']);
export const RoundSchema = z.object({
  id: z.string().uuid().optional(),
  guard_id: z.string().uuid(),
  shift_id: z.string().uuid(),
  scheduled_start: z.string().datetime(),
  actual_start: z.string().datetime().optional(),
  actual_end: z.string().datetime().optional(),
  status: RoundStatus.default('pending'),
});

// --- Scans ---
export const ScanSchema = z.object({
  id: z.string().uuid().optional(),
  round_id: z.string().uuid(),
  control_point_id: z.string().uuid(),
  scanned_at: z.string().datetime().optional(),
  evidence_url: z.string().url().optional(),
  notes: z.string().optional(),
});

// --- Incidents ---
export const IncidentSeverity = z.enum(['low', 'medium', 'high', 'critical']);
export const IncidentStatus = z.enum(['open', 'investigating', 'resolved', 'closed']);
export const IncidentSchema = z.object({
  id: z.string().uuid().optional(),
  establishment_id: z.string().uuid(),
  reporter_id: z.string().uuid(),
  round_id: z.string().uuid().optional(),
  title: z.string().min(5, "Título demasiado corto"),
  description: z.string().optional(),
  severity: IncidentSeverity.default('medium'),
  status: IncidentStatus.default('open'),
  evidence_url: z.string().url().optional(),
});

export type Establishment = z.infer<typeof EstablishmentSchema>;
export type ControlPoint = z.infer<typeof ControlPointSchema>;
export type Round = z.infer<typeof RoundSchema>;
export type Scan = z.infer<typeof ScanSchema>;
export type Incident = z.infer<typeof IncidentSchema>;
