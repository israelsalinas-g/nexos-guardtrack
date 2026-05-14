# Guía para Ejecutar el Proyecto GuardTrack

Esta guía detalla los pasos para poner en marcha el monorepo, incluyendo el backend (Supabase), el módulo web (Next.js) y el módulo móvil (Expo).

## 📋 Requisitos Previos
- **Node.js**: v18 o superior.
- **pnpm**: Recomendado para la gestión del monorepo (`npm install -g pnpm`).
- **Supabase CLI**: Para desarrollo local (opcional).

---

## 🛠️ 1. Configuración Inicial

Desde la raíz del proyecto:

1. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

2. **Configurar variables de entorno:**
   Copia el archivo de ejemplo y asegúrate de tener las credenciales de Supabase correctas.
   ```bash
   cp .env.example .env
   # También en la carpeta web si es necesario
   cp .env.example apps/web/.env.local
   ```

---

## 🗄️ 2. Base de Datos (Supabase)

Si estás trabajando con **Supabase Local**:
```bash
supabase start
supabase db reset  # Esto aplica migraciones y el archivo seed.sql
```

Si usas una instancia **remota**:
1. Ejecuta las migraciones de `supabase/migrations/` en el SQL Editor.
2. Ejecuta el contenido de `supabase/seed.sql` para tener los usuarios de prueba.

---

## 🌐 3. Módulo Web (Next.js)

El módulo web es el panel administrativo.

- **Comando desde la raíz:**
  ```bash
  pnpm dev:web
  ```
- **O directamente en la carpeta:**
  ```bash
  cd apps/web
  pnpm dev
  ```
Acceso en: [http://localhost:3000](http://localhost:3000)

---

## 📱 4. Módulo Móvil (Expo)

El módulo móvil es para los guardias de seguridad.

- **Comando desde la raíz:**
  ```bash
  pnpm dev:mobile
  ```
- **O directamente en la carpeta:**
  ```bash
  cd apps/mobile
  pnpm start
  ```

### Visualización:
- **Android/iOS**: Descarga la app **Expo Go** en tu teléfono y escanea el código QR que aparecerá en la terminal.
- **Emuladores**: Presiona `a` para Android o `i` para iOS en la terminal (requiere Android Studio o Xcode).
- **Web**: Presiona `w` para ver una versión preliminar en el navegador.

---

## 🔑 Usuarios de Prueba
| Email | Rol | Clave |
| :--- | :--- | :--- |
| `admin@nexos.com` | Administrador | `Admin1234!` |
| `supervisor@nexos.com` | Supervisor | `Admin1234!` |
| `guardia01@nexos.com` | Guardia | `Admin1234!` |
| `guardia02@nexos.com` | Guardia | `Admin1234!` |

---

## 📜 Otros Comandos Útiles
- **Linting:** `pnpm lint`
- **Build Web:** `pnpm build:web`
- **Typescript Check:** `pnpm -r tsc`
