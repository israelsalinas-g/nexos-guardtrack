-- GuardTrack Main Database Schema (Supabase/PostgreSQL)
-- Based on docs/1_GuardTrack_schema_base_datos.docx.md
-- Version 1.1

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Enums
create type public.user_role as enum ('guardia', 'supervisor', 'admin');
create type public.round_status as enum ('pendiente', 'en_curso', 'completada', 'incidente');
create type public.incident_type as enum ('ronda_vencida', 'ronda_incompleta', 'manual');
create type public.incident_status as enum ('nuevo', 'revisado', 'cerrado');

-- 2. usuarios (Extending Supabase Auth)
create table public.usuarios (
    id uuid primary key references auth.users(id) on delete cascade,
    nombre varchar(100) not null,
    email varchar(150) unique not null,
    telefono varchar(20),
    rol public.user_role not null default 'guardia',
    activo boolean default true,
    fcm_token text,
    created_at timestamptz default now()
);

-- 3. establecimientos
create table public.establecimientos (
    id uuid primary key default uuid_generate_v4(),
    nombre varchar(150) not null,
    direccion text,
    ciudad varchar(100),
    activo boolean default true,
    supervisor_id uuid references public.usuarios(id) on delete set null,
    created_at timestamptz default now()
);

-- 4. puntos_control
create table public.puntos_control (
    id uuid primary key default uuid_generate_v4(),
    establecimiento_id uuid references public.establecimientos(id) on delete cascade,
    nombre varchar(100) not null,
    descripcion text,
    qr_token varchar(64) unique not null,
    latitud numeric(10,7),
    longitud numeric(10,7),
    activo boolean default true,
    created_at timestamptz default now()
);

-- 5. turnos
create table public.turnos (
    id uuid primary key default uuid_generate_v4(),
    establecimiento_id uuid references public.establecimientos(id) on delete cascade,
    nombre varchar(100) not null,
    hora_inicio time not null,
    hora_fin time not null,
    dias_semana int[] not null, -- {1,2,3,4,5}
    intervalo_ronda_min integer not null default 60,
    activo boolean default true
);

-- 6. asignaciones
create table public.asignaciones (
    id uuid primary key default uuid_generate_v4(),
    guardia_id uuid references public.usuarios(id) on delete cascade,
    turno_id uuid references public.turnos(id) on delete cascade,
    fecha_inicio date not null default current_date,
    fecha_fin date,
    activo boolean default true
);

-- 7. rondas
create table public.rondas (
    id uuid primary key default uuid_generate_v4(),
    guardia_id uuid references public.usuarios(id) on delete set null,
    turno_id uuid references public.turnos(id) on delete set null,
    establecimiento_id uuid references public.establecimientos(id) on delete cascade,
    estado public.round_status not null default 'pendiente',
    inicio_programado timestamptz not null,
    inicio_real timestamptz,
    fin_real timestamptz,
    puntos_requeridos integer not null default 0,
    puntos_completados integer default 0,
    sincronizado boolean default false,
    created_at timestamptz default now()
);

-- 8. escaneos
create table public.escaneos (
    id uuid primary key default uuid_generate_v4(),
    ronda_id uuid references public.rondas(id) on delete cascade,
    punto_control_id uuid references public.puntos_control(id) on delete cascade,
    guardia_id uuid references public.usuarios(id) on delete set null,
    timestamp_escaneo timestamptz not null,
    timestamp_sync timestamptz default now(),
    latitud numeric(10,7),
    longitud numeric(10,7),
    offline boolean default false,
    foto_url text
);

-- 9. incidentes
create table public.incidentes (
    id uuid primary key default uuid_generate_v4(),
    ronda_id uuid references public.rondas(id) on delete cascade,
    tipo public.incident_type not null,
    descripcion text,
    estado public.incident_status not null default 'nuevo',
    notificado boolean default false,
    supervisor_id uuid references public.usuarios(id) on delete set null,
    created_at timestamptz default now(),
    cerrado_at timestamptz,
    notas_cierre text
);

-- 10. RLS & Policies
alter table public.usuarios enable row level security;
alter table public.establecimientos enable row level security;
alter table public.puntos_control enable row level security;
alter table public.turnos enable row level security;
alter table public.asignaciones enable row level security;
alter table public.rondas enable row level security;
alter table public.escaneos enable row level security;
alter table public.incidentes enable row level security;

-- Policies
create policy "Usuarios can view their own profile" on public.usuarios for select using (auth.uid() = id);
create policy "Admins can manage all usuarios" on public.usuarios for all using (exists (select 1 from public.usuarios where id = auth.uid() and rol = 'admin'));

create policy "Guards can see points of their establishments" on public.puntos_control for select using (true);

create policy "Guards can manage their own rounds" on public.rondas for all using (guardia_id = auth.uid());
create policy "Supervisors can view rounds of their establishments" on public.rondas for select using (exists (select 1 from public.establecimientos where id = establecimiento_id and supervisor_id = auth.uid()));

-- 11. Indexes
create index idx_rondas_guardia_fecha on rondas(guardia_id, inicio_programado desc);
create index idx_escaneos_ronda on escaneos(ronda_id);
create index idx_incidentes_abiertos on incidentes(estado) where estado != 'cerrado';
create unique index idx_qr_token on puntos_control(qr_token);
