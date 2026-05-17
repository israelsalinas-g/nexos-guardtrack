# Skill: Next.js 16+ & Supabase Fullstack (Production-Ready)

## Description
Define estándares de ingeniería para aplicaciones Next.js con React 19 y Supabase, priorizando seguridad por RLS, tipado estricto de base de datos y optimización de Server Components.

## Instructions

### 1. Unified Data Fetching & Security
- **RLS First**: Se prohíbe el uso de `createServiceClient()` a menos que sea una tarea de mantenimiento en segundo plano (Cron/Worker). Las mutaciones de usuario DEBEN usar el cliente estándar y confiar en políticas RLS.
- **Auth Guard**: Siempre usa `supabase.auth.getUser()` en lugar de `getSession()` para validaciones de servidor, para evitar suplantación de identidad por JWT expirado.
- **Admin Check**: Para rutas protegidas, usar un middleware o un helper `checkRole('admin')` antes de ejecutar la lógica de negocio.

### 2. Next.js 16/React 19 Patterns
- **Async Handling**: 
    - `params` y `searchParams` deben ser tratados como Promises en `page.tsx`, `layout.tsx` y `generateMetadata`.
    - Uso de `useActionState` (antes `useFormState`) para formularios en el cliente.
- **Server Actions over API Routes**: Para mutaciones de formularios, prefiere Server Actions. Reserva las API Routes (`/api/...`) solo para integraciones de terceros o Webhooks.
- **Hydration**: No renderizar componentes dependientes del cliente (como fechas locales o estados de auth) sin envolverlos en un chequeo de montado o `dynamic(() => ..., { ssr: false })`.

### 3. Database & Type Safety
- **Schema Mapping**: Generar tipos con `supabase gen types` y usarlos como fuente única de verdad: `Database['public']['Tables']['nombre_tabla']['Row']`.
- **Relational Queries**: Al usar `.select('*, tabla_relacionada(*)')`, crear un tipo de intersección para evitar errores de propiedad inexistente.
- **Integridad**: Todas las tablas deben incluir `created_at` y `updated_at` (gestionado por trigger de base de datos).

### 4. Frontend & UX Standard
- **Internationalization**: Seguir el patrón `[locale]` de `next-intl`. No hardcodear strings en la UI.
- **Data Display**: 
    - Cantidades monetarias: Almacenar en enteros (centavos) para evitar errores de punto flotante.
    - Fechas: ISO strings en DB, formato local en UI mediante helpers centralizados.
- **Feedback**: Uso obligatorio de Skeletons (`loading.tsx`) y notificaciones tipo Toast (`sonner`) para acciones asíncronas.

### 5. Error Handling
- **Graceful Failures**: Implementar `error.tsx` a nivel de ruta para capturar excepciones de renderizado.
- **Validation**: Uso estricto de **Zod** para validar el `payload` de entrada en cualquier Server Action o API.

## Technical Constraints
- No usar `any`. Si un tipo es complejo, definir `unknown` y estrecharlo (narrowing) con Zod o Type Guards.
- Los componentes de UI deben ser puros (Atomic Design preferido).
- Separar lógica de Supabase en `@/lib/supabase/` y acciones en `@/lib/actions/`.