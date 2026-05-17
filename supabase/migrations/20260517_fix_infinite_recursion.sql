-- ============================================================
-- GuardTrack: Fix Infinite Recursion in RLS Policies
-- Resolves error: infinite recursion detected in policy for relation "usuarios"
-- ============================================================

-- 1. Drop existing recursive admin policies
DROP POLICY IF EXISTS "Admins manage all establecimientos" ON public.establecimientos;
DROP POLICY IF EXISTS "Admins manage all turnos" ON public.turnos;
DROP POLICY IF EXISTS "Admins manage all asignaciones" ON public.asignaciones;
DROP POLICY IF EXISTS "Admins view all escaneos" ON public.escaneos;
DROP POLICY IF EXISTS "Admins manage all incidentes" ON public.incidentes;

-- 2. Recreate admin policies using non-recursive JWT checks
CREATE POLICY "Admins manage all establecimientos" ON public.establecimientos
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins manage all turnos" ON public.turnos
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins manage all asignaciones" ON public.asignaciones
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins view all escaneos" ON public.escaneos
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );

CREATE POLICY "Admins manage all incidentes" ON public.incidentes
  FOR ALL USING (
    (auth.jwt() ->> 'role') = 'admin' 
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
