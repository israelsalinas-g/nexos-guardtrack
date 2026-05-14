🛡  **GuardTrack**  
Documento de Requerimientos — Equipo de Desarrollo Móvil y Web

Versión 1.0   **BORRADOR**    Fecha: 13/5/2026

# **1\. Resumen del Proyecto**

GuardTrack es una solución digital para la supervisión de rondas de seguridad. Permite verificar que los guardias realizan sus recorridos periódicamente mediante el escaneo de códigos QR ubicados en puntos de control físicos dentro de los establecimientos vigilados.

**Alcance inicial:** 2–3 establecimientos privados, \~10 guardias, \~5 supervisores.

# **2\. Stack Tecnológico**

| Capa | Tecnología | Justificación |
| :---- | :---- | :---- |
| App Guardia | React Native \+ Expo | Una base de código para Android; APK distribuido directamente sin tiendas |
| App Supervisor | React \+ Vite (PWA) | Funciona en cualquier navegador; evita el fee de Apple Developer ($99/año) |
| Backend | Node.js \+ Express | Mismo lenguaje en toda la plataforma; gran ecosistema de librerías |
| Base de datos | Supabase (PostgreSQL) | Auth, RLS, Realtime y Storage incluidos; tier gratuito suficiente al inicio |
| BD Móvil | expo-sqlite | Nativa en Android/iOS; soporte offline completo sin dependencias externas |
| Notificaciones | Web Push API \+ Expo Notifications | Push sin FCM para la PWA; Expo abstrae FCM/APNs para la app nativa |
| QR | react-native-camera \+ qrcode.react | Escaneo nativo en el móvil; generación e impresión desde la web |
| Hosting | Railway o Render | Bajo costo (\~$10/mes); despliegue automático desde GitHub |

# **3\. Requerimientos Funcionales — App Guardia (Android APK)**

## **3.1 Autenticación**

| ID | Prioridad | Descripción | Criterio de aceptación |
| :---- | :---- | :---- | :---- |
| RF-01 | **Alta** | Login con email y contraseña mediante Supabase Auth | El guardia accede con sus credenciales y queda autenticado localmente para uso offline |
| RF-02 | **Alta** | Sesión persistente en el dispositivo — no pide login en cada turno | La sesión se mantiene al cerrar la app y se renueva automáticamente |
| RF-03 | **Media** | Recuperación de contraseña por email | El guardia recibe un email con enlace para restablecer su contraseña |

## **3.2 Gestión de Rondas**

| ID | Prioridad | Descripción | Criterio de aceptación |
| :---- | :---- | :---- | :---- |
| RF-04 | **Alta** | Iniciar ronda con un tap desde la pantalla principal | Se crea un registro de ronda en SQLite local y en Supabase si hay conexión |
| RF-05 | **Alta** | Escanear QR de cada punto de control con la cámara del teléfono | La app valida el qr\_token contra los puntos descargados; muestra confirmación visual |
| RF-06 | **Alta** | Escaneo funciona sin conexión a internet (modo offline) | El escaneo se guarda en escaneos\_local y se agrega a la cola de sincronización |
| RF-07 | **Alta** | Sincronización automática al recuperar conexión | La cola se procesa en background; se notifica al guardia si algún escaneo falló |
| RF-08 | **Media** | Ver historial de rondas del turno actual | Lista de rondas del día con estado: completada, en curso, incidente |
| RF-09 | **Media** | Adjuntar foto evidencia al escanear un punto | Foto opcional desde la cámara, almacenada en Supabase Storage tras la sincronización |
| RF-10 | **Baja** | Reportar incidente manual durante una ronda | El guardia puede crear un incidente con descripción de texto y foto |

# **4\. Requerimientos Funcionales — PWA Supervisor/Admin**

## **4.1 Dashboard y Monitoreo**

| ID | Prioridad | Descripción | Criterio de aceptación |
| :---- | :---- | :---- | :---- |
| RF-11 | **Alta** | Dashboard en tiempo real con estado de todas las rondas activas | Se actualiza cada 30 segundos o vía WebSocket; muestra guardias activos e inactivos |
| RF-12 | **Alta** | Recibir notificación push cuando una ronda venza sin completarse | La notificación llega incluso con el navegador cerrado si la PWA está instalada |
| RF-13 | **Alta** | Ver detalle de una ronda: puntos escaneados, timestamps, mapa | Mapa con los puntos marcados y la ruta temporal del guardia |
| RF-14 | **Alta** | Lista de incidentes activos con opción de cerrar y agregar notas | Flujo: nuevo → revisado → cerrado; registro de quién cerró y cuándo |
| RF-15 | **Media** | Filtrar historial de rondas por guardia, fecha y establecimiento | Exportar resultado filtrado a CSV para reportes externos |
| RF-16 | **Media** | Ver mapa del establecimiento con estado de cada punto de control | Puntos en verde (escaneado hoy), amarillo (sin escanear) o rojo (incidente) |

## **4.2 Administración**

| ID | Prioridad | Descripción | Criterio de aceptación |
| :---- | :---- | :---- | :---- |
| RF-17 | **Alta** | Crear y editar establecimientos con sus zonas y puntos de control | Formulario con nombre, dirección y lista de puntos de control |
| RF-18 | **Alta** | Generar QR para cada punto de control e imprimir en PDF | Un PDF por establecimiento con todos los QR listos para imprimir |
| RF-19 | **Alta** | Crear y gestionar usuarios (guardias y supervisores) | Asignar rol, establecimiento y turno; activar/desactivar cuenta |
| RF-20 | **Alta** | Configurar turnos: horario, días de semana e intervalo de ronda | El intervalo define cada cuántos minutos se espera una ronda completada |
| RF-21 | **Media** | Asignar guardias a turnos específicos | Un guardia puede tener múltiples asignaciones en diferentes turnos o fechas |

# **5\. Requerimientos No Funcionales**

| Categoría | Métrica | Descripción |
| :---- | :---- | :---- |
| Offline | 100% funcional sin red | Escaneo, inicio de ronda y almacenamiento local deben funcionar sin ninguna conexión |
| Sincronización | \< 5 seg tras reconexión | La cola offline debe procesarse en menos de 5 segundos al recuperar señal |
| Rendimiento PWA | Carga inicial \< 3 seg | Medido con Lighthouse en conexión 4G; caché de assets estáticos con Service Worker |
| Seguridad | JWT \+ RLS | Tokens renovados automáticamente; RLS en Supabase para aislamiento de datos por rol |
| Disponibilidad | 99.5% mensual | Backend en Railway con auto-restart; Supabase SLA cubre la base de datos |
| Android mínimo | Android 8.0 (API 26\) | Cubre más del 95% de los dispositivos Android activos en Honduras |
| iOS PWA | iOS 16.4+ | Requerido para Web Push en Safari; notificar al supervisor de este requisito |
| Escalabilidad | Hasta 50 usuarios | Arquitectura actual soporta crecimiento sin cambios mayores hasta \~50 usuarios |

# **6\. Motor de Detección de Rondas Vencidas**

Un job programado (cron) evalúa periódicamente si alguna ronda debió iniciarse y no lo hizo, o si inició pero no se completó dentro del tiempo esperado.

| Evento | Condición | Acción automática | Notificación |
| :---- | :---- | :---- | :---- |
| Ronda no iniciada | Han pasado \+15 min desde inicio\_programado y estado \= pendiente | Crea incidente tipo ronda\_vencida | Push al supervisor asignado |
| Ronda incompleta | fin del turno y puntos\_completados \< puntos\_requeridos | Cierra ronda con estado incidente | Push al supervisor con detalle de puntos faltantes |
| Ronda completada | puntos\_completados \= puntos\_requeridos | Actualiza estado a completada | Sin notificación (flujo normal) |

**Frecuencia del cron:** cada 5 minutos. Puede ajustarse según el intervalo\_ronda\_min del turno más corto configurado.

# **7\. API REST — Endpoints Principales**

| Método | Endpoint | Auth | Descripción |
| :---- | :---- | :---- | :---- |
| **POST** | /auth/login | Público | Autenticación; retorna JWT |
| **GET** | /turnos/activo | Guardia | Turno activo del guardia autenticado |
| **POST** | /rondas | Guardia | Crear nueva ronda |
| **POST** | /rondas/:id/escaneos | Guardia | Registrar escaneo (individual o en batch offline) |
| **POST** | /sync/batch | Guardia | Enviar múltiples escaneos y rondas offline en un solo request |
| **GET** | /dashboard | Supervisor | Estado actual de todas las rondas activas |
| **GET** | /rondas | Supervisor | Historial con filtros (fecha, guardia, establecimiento) |
| **GET** | /incidentes | Supervisor | Lista de incidentes con filtros |
| **PATCH** | /incidentes/:id | Supervisor | Actualizar estado del incidente |
| **POST** | /puntos-control/:id/qr | Admin | Generar o regenerar el QR de un punto |
| **GET** | /establecimientos/:id/qr-pdf | Admin | PDF con todos los QR del establecimiento |

# **8\. Distribución y Despliegue**

| Componente | Método | Notas |
| :---- | :---- | :---- |
| App Guardia (Android) | APK directo | Enviado por WhatsApp o enlace privado; sin Google Play Store; habilitar 'instalar fuentes desconocidas' |
| PWA Supervisor | URL privada | Acceso por navegador; guiar al supervisor a 'Agregar a pantalla de inicio' en iPhone para habilitar notificaciones |
| Backend \+ PWA | Railway/Render | Deploy automático desde GitHub main branch; variables de entorno para secretos |
| Base de datos | Supabase cloud | Tier gratuito: 500 MB, 2 GB transferencia/mes — suficiente para el alcance inicial |
| Actualizaciones app | Reinstalar APK | Proceso manual; considerar Expo OTA updates para cambios menores sin reinstalar |

