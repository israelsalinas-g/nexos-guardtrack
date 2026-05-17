# Skill: Next.js & Supabase Fullstack Standard

## Description
Este skill se activa para el desarrollo de aplicaciones web modernas utilizando Next.js (App Router) y Supabase como Backend-as-a-Service. Se centra en la eficiencia, la seguridad por capas y la inferencia de tipos estricta.

## Goal
Generar código escalable, modular y seguro que minimice la deuda técnica y aproveche al máximo las capacidades de computación en el borde (Edge) y bases de datos relacionales.

## Instructions

### 1. Data Layer & Supabase
- **Strict Typing**: Siempre utiliza los tipos generados por el CLI de Supabase. No aceptes `any` en las respuestas de la base de datos.
- **RLS by Default**: Cada vez que se sugiera una tabla, se debe incluir el comando SQL para habilitar Row Level Security (RLS) y una política de acceso básica.
- **Auth Flow**: Implementar el flujo de autenticación mediante SSR (Server-Side Rendering) para evitar parpadeos de contenido (FOUC).
- **Storage**: Para manejo de archivos, prefiere siempre el uso de buckets firmados con políticas de expiración.

### 2. Next.js Architecture (App Router)
- **Component Hierarchy**: 
    - Server Components para fetch de datos (Data Owners).
    - Client Components para interactividad (UI Leaf Components).
- **Server Actions**: Agrupar acciones por entidad en archivos `.ts` dedicados (ej: `lib/actions/users.ts`).
- **Validation**: Uso obligatorio de **Zod** para validar tanto los inputs de los formularios como los resultados de las Server Actions.
- **Caching**: Implementar `revalidatePath` o `revalidateTag` después de cualquier mutación para mantener la coherencia de la caché.

### 3. Database & SQL Best Practices
- **Migrations over UI**: Favorece la escritura de SQL para migraciones sobre la edición manual en el Dashboard de Supabase.
- **Constraints**: Siempre definir llaves foráneas con `on delete cascade/set null` según la integridad referencial requerida.
- **Functions & Triggers**: Mover lógica de auditoría o cálculos complejos a funciones de PostgreSQL (PL/pgSQL) para asegurar consistencia a nivel de base de datos.

## Technical Constraints
- Prohibido el uso de la carpeta `pages/`.
- Prohibido exponer la `SERVICE_ROLE_KEY` en el cliente.
- Las variables de entorno de Supabase deben estar validadas al inicio del runtime.
- No utilizar Fetch API crudo si el SDK de Supabase puede resolver la consulta.

## Examples

### Input: "Necesito crear una estructura para gestión de documentos"
**Response Logic**:
1. Define el esquema SQL con RLS.
2. Genera el Server Action para el upload al bucket de Supabase Storage.
3. Crea el Server Component que lista los documentos con `suspense` para el estado de carga.

### Input: "Configura la autenticación"
**Response Logic**:
1. Configura el middleware de Next.js para proteger rutas.
2. Crea los helpers de `createClient` para servidor y cliente.
3. Implementa el manejo de sesión en el layout principal.