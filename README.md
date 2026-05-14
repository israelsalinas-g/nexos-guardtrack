# 🛡️ GuardTrack

Sistema de supervisión de rondas de seguridad con soporte offline y monitoreo en tiempo real.

## 🚀 Estructura del Proyecto

- `apps/web`: Aplicación web para supervisores y administradores (Next.js + PWA).
- `apps/mobile`: Aplicación móvil para guardias (Expo + SQLite).
- `packages/shared`: Esquemas de validación y tipos compartidos (Zod).
- `supabase`: Migraciones y configuración de la base de datos.

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React Native (Expo).
- **Backend**: Next.js API Routes / Supabase.
- **Base de Datos**: Supabase (PostgreSQL) + RLS.
- **Offline**: expo-sqlite para la app móvil.
- **Seguridad**: Supabase Auth (JWT).

## 🏃‍♂️ Desarrollo

1. Instalar dependencias:
   ```bash
   pnpm install
   ```

2. Configurar variables de entorno:
   Copiar `.env.example` a `.env` en cada aplicación.

3. Iniciar entorno de desarrollo:
   ```bash
   pnpm dev:web    # Inicia Next.js
   pnpm dev:mobile # Inicia Expo
   ```

## 📄 Requerimientos
Ver [Documento de Requerimientos](docs/2_guardtrack_requeriments_desarrollo.docx.md) para más detalles.
