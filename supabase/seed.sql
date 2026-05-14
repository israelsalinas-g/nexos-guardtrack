-- GuardTrack Test Data Seed
-- Password for all users: Admin1234!
-- Generated on: 2026-05-14

-- 1. Enable pgcrypto for password hashing if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Clean existing data to ensure idempotency (optional, but good for local dev)
-- DELETE FROM auth.users WHERE email LIKE '%@nexos.com';

-- 3. Insert into auth.users (Supabase Auth)
-- We use fixed UUIDs to allow referencing them in other tables
INSERT INTO auth.users (
    id, 
    instance_id, 
    email, 
    encrypted_password, 
    email_confirmed_at, 
    role, 
    aud, 
    raw_app_meta_data, 
    raw_user_meta_data, 
    is_super_admin, 
    created_at, 
    updated_at,
    last_sign_in_at
)
VALUES 
    -- Admin
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'admin@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, now(), now(), now()),
    -- Supervisor
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'supervisor@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, now(), now(), now()),
    -- Guardia 01
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'guardia01@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, now(), now(), now()),
    -- Guardia 02
    ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'guardia02@nexos.com', crypt('Admin1234!', gen_salt('bf')), now(), 'authenticated', 'authenticated', '{"provider":"email","providers":["email"]}', '{}', false, now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert into auth.identities (Required for some Supabase features)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
VALUES 
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000001', 'admin@nexos.com')::jsonb, 'email', '00000000-0000-0000-0000-000000000001', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000002', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000002', 'supervisor@nexos.com')::jsonb, 'email', '00000000-0000-0000-0000-000000000002', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000003', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000003', 'guardia01@nexos.com')::jsonb, 'email', '00000000-0000-0000-0000-000000000003', now(), now(), now()),
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000004', format('{"sub":"%s","email":"%s"}', '00000000-0000-0000-0000-000000000004', 'guardia02@nexos.com')::jsonb, 'email', '00000000-0000-0000-0000-000000000004', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- 5. Insert into public.usuarios (Application Profiles)
INSERT INTO public.usuarios (id, nombre, email, rol, activo)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Administrador Nexos', 'admin@nexos.com', 'admin', true),
    ('00000000-0000-0000-0000-000000000002', 'Supervisor General', 'supervisor@nexos.com', 'supervisor', true),
    ('00000000-0000-0000-0000-000000000003', 'Juan Guardia 01', 'guardia01@nexos.com', 'guardia', true),
    ('00000000-0000-0000-0000-000000000004', 'Pedro Guardia 02', 'guardia02@nexos.com', 'guardia', true)
ON CONFLICT (id) DO UPDATE SET 
    nombre = EXCLUDED.nombre,
    rol = EXCLUDED.rol;

-- 6. Seed Establishments
INSERT INTO public.establecimientos (id, nombre, direccion, ciudad, supervisor_id)
VALUES 
    ('e1000000-0000-0000-0000-000000000001', 'Oficinas Nexos Centro', 'Calle Principal #100', 'Tegucigalpa', '00000000-0000-0000-0000-000000000002'),
    ('e1000000-0000-0000-0000-000000000002', 'Bodega Logística Norte', 'Zona Industrial Km 5', 'San Pedro Sula', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 7. Seed Puntos de Control (Control Points)
INSERT INTO public.puntos_control (id, establecimiento_id, nombre, descripcion, qr_token)
VALUES 
    ('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Entrada Principal', 'Lobby edificio A', 'NEXOS_ENTRADA_LOBBY'),
    ('b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Salida de Emergencia', 'Pasillo posterior nivel 1', 'NEXOS_SALIDA_EMERG'),
    ('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', 'Muelle de Carga', 'Área de embarque CEDIS', 'CEDIS_MUELLE_A')
ON CONFLICT (id) DO NOTHING;

-- 8. Seed Turnos (Shifts)
INSERT INTO public.turnos (id, establecimiento_id, nombre, hora_inicio, hora_fin, dias_semana, intervalo_ronda_min)
VALUES 
    ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Turno Mañana (CORP)', '06:00:00', '14:00:00', '{1,2,3,4,5,6}', 60),
    ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Turno Noche (CORP)', '22:00:00', '06:00:00', '{1,2,3,4,5,6,7}', 45)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed Asignaciones (Assignments)
INSERT INTO public.asignaciones (id, guardia_id, turno_id)
VALUES 
    ('a1000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000001'),
    ('a1000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

