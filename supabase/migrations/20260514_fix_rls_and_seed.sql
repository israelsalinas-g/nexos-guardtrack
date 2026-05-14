-- ============================================================
-- GuardTrack: Fix RLS Policies + Seed
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Asegurarse de que pgcrypto esté disponible
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Crear tablas solo si no existen (idempotente)
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('guardia', 'supervisor', 'admin');
  END IF;
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'round_status') THEN
    CREATE TYPE public.round_status AS ENUM ('pendiente', 'en_curso', 'completada', 'incidente');
  END IF;
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'incident_type') THEN
    CREATE TYPE public.incident_type AS ENUM ('ronda_vencida', 'ronda_incompleta', 'manual');
  END IF;
  IF NOT EXISTS (SELECT FROM pg_type WHERE typname = 'incident_status') THEN
    CREATE TYPE public.incident_status AS ENUM ('nuevo', 'revisado', 'cerrado');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.usuarios (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre varchar(100) NOT NULL,
    email varchar(150) UNIQUE NOT NULL,
    telefono varchar(20),
    rol public.user_role NOT NULL DEFAULT 'guardia',
    activo boolean DEFAULT true,
    fcm_token text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.establecimientos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre varchar(150) NOT NULL,
    direccion text,
    ciudad varchar(100),
    activo boolean DEFAULT true,
    supervisor_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.puntos_control (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    establecimiento_id uuid REFERENCES public.establecimientos(id) ON DELETE CASCADE,
    nombre varchar(100) NOT NULL,
    descripcion text,
    qr_token varchar(64) UNIQUE NOT NULL,
    latitud numeric(10,7),
    longitud numeric(10,7),
    activo boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.turnos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    establecimiento_id uuid REFERENCES public.establecimientos(id) ON DELETE CASCADE,
    nombre varchar(100) NOT NULL,
    hora_inicio time NOT NULL,
    hora_fin time NOT NULL,
    dias_semana int[] NOT NULL,
    intervalo_ronda_min integer NOT NULL DEFAULT 60,
    activo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.asignaciones (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardia_id uuid REFERENCES public.usuarios(id) ON DELETE CASCADE,
    turno_id uuid REFERENCES public.turnos(id) ON DELETE CASCADE,
    fecha_inicio date NOT NULL DEFAULT current_date,
    fecha_fin date,
    activo boolean DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.rondas (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardia_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    turno_id uuid REFERENCES public.turnos(id) ON DELETE SET NULL,
    establecimiento_id uuid REFERENCES public.establecimientos(id) ON DELETE CASCADE,
    estado public.round_status NOT NULL DEFAULT 'pendiente',
    inicio_programado timestamptz NOT NULL,
    inicio_real timestamptz,
    fin_real timestamptz,
    puntos_requeridos integer NOT NULL DEFAULT 0,
    puntos_completados integer DEFAULT 0,
    sincronizado boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.escaneos (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ronda_id uuid REFERENCES public.rondas(id) ON DELETE CASCADE,
    punto_control_id uuid REFERENCES public.puntos_control(id) ON DELETE CASCADE,
    guardia_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    timestamp_escaneo timestamptz NOT NULL,
    timestamp_sync timestamptz DEFAULT now(),
    latitud numeric(10,7),
    longitud numeric(10,7),
    offline boolean DEFAULT false,
    foto_url text
);

CREATE TABLE IF NOT EXISTS public.incidentes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ronda_id uuid REFERENCES public.rondas(id) ON DELETE CASCADE,
    tipo public.incident_type NOT NULL,
    descripcion text,
    estado public.incident_status NOT NULL DEFAULT 'nuevo',
    notificado boolean DEFAULT false,
    supervisor_id uuid REFERENCES public.usuarios(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    cerrado_at timestamptz,
    notas_cierre text
);

-- 3. Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.establecimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puntos_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asignaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rondas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escaneos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidentes ENABLE ROW LEVEL SECURITY;

-- 4. ELIMINAR políticas anteriores que causan recursión
DROP POLICY IF EXISTS "Usuarios can view their own profile" ON public.usuarios;
DROP POLICY IF EXISTS "Admins can manage all usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Guards can see points of their establishments" ON public.puntos_control;
DROP POLICY IF EXISTS "Guards can manage their own rounds" ON public.rondas;
DROP POLICY IF EXISTS "Supervisors can view rounds of their establishments" ON public.rondas;

-- 5. NUEVAS POLÍTICAS RLS (sin recursión)
-- usuarios: cada usuario ve su propio perfil
CREATE POLICY "usuarios_select_own" ON public.usuarios
    FOR SELECT USING (auth.uid() = id);

-- usuarios: admins pueden ver todos — usando JWT metadata (sin recursión)
CREATE POLICY "usuarios_admin_all" ON public.usuarios
    FOR ALL USING (
        (auth.jwt() ->> 'role') = 'admin'
        OR auth.uid() = id
    );

-- usuarios: insertar perfil propio al registrarse
CREATE POLICY "usuarios_insert_own" ON public.usuarios
    FOR INSERT WITH CHECK (auth.uid() = id);

-- establecimientos: cualquier autenticado puede ver
CREATE POLICY "establecimientos_authenticated_select" ON public.establecimientos
    FOR SELECT USING (auth.role() = 'authenticated');

-- puntos_control: cualquier autenticado puede ver
CREATE POLICY "puntos_control_authenticated_select" ON public.puntos_control
    FOR SELECT USING (auth.role() = 'authenticated');

-- turnos: cualquier autenticado puede ver
CREATE POLICY "turnos_authenticated_select" ON public.turnos
    FOR SELECT USING (auth.role() = 'authenticated');

-- asignaciones: guardia ve las suyas
CREATE POLICY "asignaciones_select_own" ON public.asignaciones
    FOR SELECT USING (guardia_id = auth.uid());

-- rondas: guardia gestiona las suyas
CREATE POLICY "rondas_guardia_all" ON public.rondas
    FOR ALL USING (guardia_id = auth.uid());

-- escaneos: guardia gestiona los suyos
CREATE POLICY "escaneos_guardia_all" ON public.escaneos
    FOR ALL USING (guardia_id = auth.uid());

-- incidentes: guardia ve los de sus rondas
CREATE POLICY "incidentes_select_authenticated" ON public.incidentes
    FOR SELECT USING (auth.role() = 'authenticated');

-- 6. SEED: Usuarios de auth
INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    role, aud, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at, last_sign_in_at
) VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000',
     'admin@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(),
     'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}', '{"role":"admin"}',
     false, now(), now(), now()),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000',
     'supervisor@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(),
     'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}', '{"role":"supervisor"}',
     false, now(), now(), now()),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000',
     'guardia01@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(),
     'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}', '{"role":"guardia"}',
     false, now(), now(), now()),
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000',
     'guardia02@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(),
     'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}', '{"role":"guardia"}',
     false, now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 7. SEED: Identidades
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001',
     format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000001', 'admin@nexos.com')::jsonb,
     'email', '00000000-0000-0000-0000-000000000001', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002',
     format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000002', 'supervisor@nexos.com')::jsonb,
     'email', '00000000-0000-0000-0000-000000000002', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000003',
     format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000003', 'guardia01@nexos.com')::jsonb,
     'email', '00000000-0000-0000-0000-000000000003', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000004',
     format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000004', 'guardia02@nexos.com')::jsonb,
     'email', '00000000-0000-0000-0000-000000000004', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 8. SEED: Perfiles en public.usuarios
INSERT INTO public.usuarios (id, nombre, email, rol, activo)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'Administrador Nexos', 'admin@nexos.com', 'admin', true),
    ('00000000-0000-0000-0000-000000000002', 'Supervisor General', 'supervisor@nexos.com', 'supervisor', true),
    ('00000000-0000-0000-0000-000000000003', 'Juan Guardia 01', 'guardia01@nexos.com', 'guardia', true),
    ('00000000-0000-0000-0000-000000000004', 'Pedro Guardia 02', 'guardia02@nexos.com', 'guardia', true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol;

-- 9. SEED: Establecimientos
INSERT INTO public.establecimientos (id, nombre, direccion, ciudad, supervisor_id)
VALUES
    ('e1000000-0000-0000-0000-000000000001', 'Oficinas Nexos Centro', 'Calle Principal #100', 'Tegucigalpa', '00000000-0000-0000-0000-000000000002'),
    ('e1000000-0000-0000-0000-000000000002', 'Bodega Logística Norte', 'Zona Industrial Km 5', 'San Pedro Sula', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 10. SEED: Puntos de Control
INSERT INTO public.puntos_control (id, establecimiento_id, nombre, descripcion, qr_token)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Entrada Principal', 'Lobby edificio A', 'NEXOS_ENTRADA_LOBBY'),
    ('b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Salida de Emergencia', 'Pasillo posterior nivel 1', 'NEXOS_SALIDA_EMERG'),
    ('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', 'Muelle de Carga', 'Área de embarque CEDIS', 'CEDIS_MUELLE_A')
ON CONFLICT (id) DO NOTHING;

-- 11. SEED: Turnos
INSERT INTO public.turnos (id, establecimiento_id, nombre, hora_inicio, hora_fin, dias_semana, intervalo_ronda_min)
VALUES
    ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Turno Mañana', '06:00:00', '14:00:00', '{1,2,3,4,5,6}', 60),
    ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Turno Noche',  '22:00:00', '06:00:00', '{1,2,3,4,5,6,7}', 45)
ON CONFLICT (id) DO NOTHING;

-- 12. SEED: Asignaciones
INSERT INTO public.asignaciones (id, guardia_id, turno_id)
VALUES
    ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001'),
    ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- ✅ Verificación final
SELECT 'auth.users' as tabla, count(*) FROM auth.users WHERE email LIKE '%@nexos.com'
UNION ALL
SELECT 'public.usuarios', count(*) FROM public.usuarios;
