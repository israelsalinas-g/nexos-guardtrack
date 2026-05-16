-- ============================================================
-- GuardTrack: Supervisor RLS Policies + Schema Additions
-- ============================================================

-- 1. Add reportado_por to incidentes
--    Tracks the guard (or supervisor) who created the manual incident
ALTER TABLE public.incidentes
  ADD COLUMN IF NOT EXISTS reportado_por uuid REFERENCES public.usuarios(id) ON DELETE SET NULL;

-- 2. establecimientos — supervisors see only theirs; admins see all
CREATE POLICY "Supervisors view their establecimientos" ON public.establecimientos
  FOR SELECT USING (supervisor_id = auth.uid());

CREATE POLICY "Admins manage all establecimientos" ON public.establecimientos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 3. turnos — supervisors see turnos of their establishments
CREATE POLICY "Supervisors view their turnos" ON public.turnos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.establecimientos e
      WHERE e.id = establecimiento_id AND e.supervisor_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all turnos" ON public.turnos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 4. asignaciones — supervisors see assignments in their establishments
CREATE POLICY "Supervisors view asignaciones in their establecimientos" ON public.asignaciones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.turnos t
      JOIN public.establecimientos e ON e.id = t.establecimiento_id
      WHERE t.id = turno_id AND e.supervisor_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage all asignaciones" ON public.asignaciones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 5. usuarios — supervisors see guards assigned to their establishments
--    (guards can already see their own profile from the initial policy)
CREATE POLICY "Supervisors view guards in their establecimientos" ON public.usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.asignaciones a
      JOIN public.turnos t ON t.id = a.turno_id
      JOIN public.establecimientos e ON e.id = t.establecimiento_id
      WHERE a.guardia_id = public.usuarios.id
        AND e.supervisor_id = auth.uid()
    )
  );

-- 6. escaneos — supervisors see scans from their establishments
CREATE POLICY "Supervisors view escaneos in their establecimientos" ON public.escaneos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.rondas r
      JOIN public.establecimientos e ON e.id = r.establecimiento_id
      WHERE r.id = ronda_id AND e.supervisor_id = auth.uid()
    )
  );

CREATE POLICY "Admins view all escaneos" ON public.escaneos
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );

-- 7. incidentes — supervisors manage incidents from their establishments;
--    guards can INSERT manual incidents
CREATE POLICY "Guards can report incidentes" ON public.incidentes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Supervisors manage incidentes in their establecimientos" ON public.incidentes
  FOR ALL USING (
    -- Incidents linked to a round (from their establishments)
    (ronda_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.rondas r
      JOIN public.establecimientos e ON e.id = r.establecimiento_id
      WHERE r.id = ronda_id AND e.supervisor_id = auth.uid()
    ))
    OR
    -- Unlinked manual incidents: visible to all supervisors
    ronda_id IS NULL
  );

CREATE POLICY "Admins manage all incidentes" ON public.incidentes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.usuarios WHERE id = auth.uid() AND rol = 'admin')
  );
