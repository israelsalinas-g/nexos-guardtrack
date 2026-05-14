# Guía de Datos de Prueba (Seed)

Se ha creado un archivo de semilla (`supabase/seed.sql`) para inicializar el entorno de desarrollo con datos consistentes.

## Usuarios de Prueba
Todos los usuarios tienen la misma contraseña: **`Admin1234!`**

| Email | Rol | Propósito |
|-------|-----|-----------|
| `admin@nexos.com` | `admin` | Acceso total al panel administrativo. |
| `supervisor@nexos.com` | `supervisor` | Gestión de establecimientos y rondas. |
| `guardia01@nexos.com` | `guardia` | Ejecución de rondas (Turno Mañana). |
| `guardia02@nexos.com` | `guardia` | Ejecución de rondas (Turno Noche). |

## Cómo Aplicar el Seed

### Localmente (Supabase CLI)
Si estás usando el CLI de Supabase para desarrollo local, puedes aplicar el seed reiniciando la base de datos:
```bash
supabase db reset
```
*Nota: Esto borrará todos los datos actuales y aplicará las migraciones + seed.*

### Manualmente (Supabase Dashboard)
Si deseas aplicar los datos a una instancia remota:
1. Copia el contenido de `supabase/seed.sql`.
2. Ve al **SQL Editor** en tu dashboard de Supabase.
3. Pega el código y ejecútalo.

## Datos Adicionales Incluidos
- **Establecimientos**: "Oficinas Nexos Centro" y "Bodega Logística Norte".
- **Puntos de Control**: Entrada, Salida de Emergencia y Muelle de Carga.
- **Turnos**: Turnos de mañana y noche pre-configurados.
- **Asignaciones**: Los guardias ya están asignados a sus respectivos turnos.
