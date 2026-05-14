-- ============================================================
-- GuardTrack: Fix Auth Users (Paso 2)
-- Problema: GoTrue no autentica usuarios insertados via SQL directo.
-- Solución: Crear perfiles de public.usuarios usando los UUIDs 
--           que GoTrue asignó al crear usuarios desde el Dashboard.
-- ============================================================

-- PASO 1: Limpiar usuarios que no funcionan (insertados via SQL)
DELETE FROM public.usuarios WHERE email IN (
    'admin@nexos.com',
    'supervisor@nexos.com',
    'guardia01@nexos.com',
    'guardia02@nexos.com'
);

DELETE FROM auth.identities WHERE user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
);

DELETE FROM auth.users WHERE id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004'
);

-- ✅ Verificar que quedaron limpios
SELECT email FROM auth.users WHERE email LIKE '%@nexos.com';

-- ============================================================
-- DESPUÉS de ejecutar esto:
-- 1. Ve a Authentication > Users en el Dashboard de Supabase
-- 2. Crea manualmente los 4 usuarios con "Add user" > "Create new user":
--    - admin@nexos.com       / Admin1234!
--    - supervisor@nexos.com  / Admin1234!
--    - guardia01@nexos.com   / Admin1234!
--    - guardia02@nexos.com   / Admin1234!
--    (marca "Auto Confirm User" en cada uno)
-- 3. Una vez creados, ejecuta el PASO 2 de abajo
-- ============================================================

-- PASO 2: Insertar perfiles usando los UUIDs que GoTrue asignó
-- (Este SELECT obtiene automáticamente los IDs correctos)
INSERT INTO public.usuarios (id, nombre, email, rol, activo)
SELECT 
    id,
    CASE email
        WHEN 'admin@nexos.com'      THEN 'Administrador Nexos'
        WHEN 'supervisor@nexos.com' THEN 'Supervisor General'
        WHEN 'guardia01@nexos.com'  THEN 'Juan Guardia 01'
        WHEN 'guardia02@nexos.com'  THEN 'Pedro Guardia 02'
    END as nombre,
    email,
    CASE email
        WHEN 'admin@nexos.com'      THEN 'admin'::public.user_role
        WHEN 'supervisor@nexos.com' THEN 'supervisor'::public.user_role
        ELSE                             'guardia'::public.user_role
    END as rol,
    true as activo
FROM auth.users
WHERE email IN (
    'admin@nexos.com',
    'supervisor@nexos.com',
    'guardia01@nexos.com',
    'guardia02@nexos.com'
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    rol    = EXCLUDED.rol;

-- PASO 3: Seed de datos de negocio (establecimientos, turnos, etc.)
INSERT INTO public.establecimientos (id, nombre, direccion, ciudad, supervisor_id)
SELECT
    'e1000000-0000-0000-0000-000000000001'::uuid,
    'Oficinas Nexos Centro',
    'Calle Principal #100',
    'Tegucigalpa',
    u.id
FROM auth.users u WHERE u.email = 'supervisor@nexos.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.establecimientos (id, nombre, direccion, ciudad, supervisor_id)
SELECT
    'e1000000-0000-0000-0000-000000000002'::uuid,
    'Bodega Logística Norte',
    'Zona Industrial Km 5',
    'San Pedro Sula',
    u.id
FROM auth.users u WHERE u.email = 'supervisor@nexos.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.puntos_control (id, establecimiento_id, nombre, descripcion, qr_token)
VALUES
    ('b1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Entrada Principal',    'Lobby edificio A',        'NEXOS_ENTRADA_LOBBY'),
    ('b1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Salida de Emergencia', 'Pasillo posterior nivel 1','NEXOS_SALIDA_EMERG'),
    ('b1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', 'Muelle de Carga',      'Área de embarque CEDIS',  'CEDIS_MUELLE_A')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.turnos (id, establecimiento_id, nombre, hora_inicio, hora_fin, dias_semana, intervalo_ronda_min)
VALUES
    ('f1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'Turno Mañana', '06:00:00', '14:00:00', '{1,2,3,4,5,6}',   60),
    ('f1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'Turno Noche',  '22:00:00', '06:00:00', '{1,2,3,4,5,6,7}', 45)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.asignaciones (id, guardia_id, turno_id)
SELECT 'a1000000-0000-0000-0000-000000000001'::uuid, u.id, 'f1000000-0000-0000-0000-000000000001'::uuid
FROM auth.users u WHERE u.email = 'guardia01@nexos.com'
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.asignaciones (id, guardia_id, turno_id)
SELECT 'a1000000-0000-0000-0000-000000000002'::uuid, u.id, 'f1000000-0000-0000-0000-000000000002'::uuid
FROM auth.users u WHERE u.email = 'guardia02@nexos.com'
ON CONFLICT (id) DO NOTHING;

-- ✅ Verificación final
SELECT 
    u.email,
    pu.nombre,
    pu.rol,
    pu.activo
FROM auth.users u
JOIN public.usuarios pu ON pu.id = u.id
WHERE u.email LIKE '%@nexos.com'
ORDER BY pu.rol;
