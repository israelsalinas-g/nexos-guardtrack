🛡  **GuardTrack**  
Schema de Base de Datos — Supabase (PostgreSQL) & SQLite Móvil

Versión 1.0   **CONFIDENCIAL**    Fecha: 13/5/2026

# **1\. Arquitectura de Datos**

El sistema utiliza una arquitectura dual: Supabase (PostgreSQL) como base de datos principal en la nube y SQLite local en los dispositivos Android de los guardias para operación offline.

**Supabase** actúa como fuente de verdad. **SQLite** almacena escaneos y rondas pendientes de sincronizar.

# **2\. Tablas — Supabase (PostgreSQL)**

## **2.1 usuarios**

Gestiona todos los perfiles: guardias y supervisores/administradores.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK, default gen\_random\_uuid() | Identificador único |
| nombre | varchar(100) | NOT NULL | Nombre completo |
| email | varchar(150) | UNIQUE, NOT NULL | Correo electrónico |
| telefono | varchar(20) |  | Teléfono de contacto |
| rol | enum | NOT NULL: guardia|supervisor|admin | Perfil del usuario |
| activo | boolean | DEFAULT true | Estado de la cuenta |
| fcm\_token | text |  | Token para notificaciones push |
| created\_at | timestamptz | DEFAULT now() | Fecha de creación |

## **2.2 establecimientos**

Representa cada propiedad o edificio que debe ser vigilado.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador único |
| nombre | varchar(150) | NOT NULL | Nombre del establecimiento |
| direccion | text |  | Dirección completa |
| ciudad | varchar(100) |  | Ciudad / municipio |
| activo | boolean | DEFAULT true | Estado operativo |
| supervisor\_id | uuid | FK → usuarios(id) | Supervisor asignado |
| created\_at | timestamptz | DEFAULT now() | Fecha de creación |

## **2.3 puntos\_control**

Ubicaciones físicas dentro de un establecimiento donde se colocan los códigos QR.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador único |
| establecimiento\_id | uuid | FK → establecimientos(id) | Establecimiento al que pertenece |
| nombre | varchar(100) | NOT NULL | Ej: Entrada principal, Bodega 2 |
| descripcion | text |  | Descripción de la ubicación |
| qr\_token | varchar(64) | UNIQUE, NOT NULL | Token único codificado en el QR |
| latitud | numeric(10,7) |  | Coordenada GPS |
| longitud | numeric(10,7) |  | Coordenada GPS |
| activo | boolean | DEFAULT true | Estado del punto |
| created\_at | timestamptz | DEFAULT now() | Fecha de creación |

## **2.4 turnos**

Define los horarios y frecuencia de rondas esperada para cada establecimiento.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador único |
| establecimiento\_id | uuid | FK → establecimientos(id) | Establecimiento asociado |
| nombre | varchar(100) | NOT NULL | Ej: Turno noche, Turno día |
| hora\_inicio | time | NOT NULL | Hora de inicio del turno |
| hora\_fin | time | NOT NULL | Hora de fin del turno |
| dias\_semana | int\[\] | NOT NULL | Ej: {1,2,3,4,5} (lun-vie) |
| intervalo\_ronda\_min | integer | NOT NULL | Minutos entre rondas requeridas |
| activo | boolean | DEFAULT true | Estado del turno |

## **2.5 asignaciones**

Relaciona guardias con turnos específicos.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador único |
| guardia\_id | uuid | FK → usuarios(id) | Guardia asignado |
| turno\_id | uuid | FK → turnos(id) | Turno asignado |
| fecha\_inicio | date | NOT NULL | Inicio de la asignación |
| fecha\_fin | date |  | Fin (null \= indefinido) |
| activo | boolean | DEFAULT true | Estado |

## **2.6 rondas**

Registro de cada ciclo de vigilancia realizado por un guardia.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador único (generado en móvil) |
| guardia\_id | uuid | FK → usuarios(id) | Guardia que ejecuta |
| turno\_id | uuid | FK → turnos(id) | Turno correspondiente |
| establecimiento\_id | uuid | FK → establecimientos(id) | Establecimiento |
| estado | enum | NOT NULL: pendiente|en\_curso|completada|incidente | Estado actual |
| inicio\_programado | timestamptz | NOT NULL | Cuándo debía empezar |
| inicio\_real | timestamptz |  | Cuándo inició realmente |
| fin\_real | timestamptz |  | Cuándo terminó |
| puntos\_requeridos | integer | NOT NULL | Total de puntos a escanear |
| puntos\_completados | integer | DEFAULT 0 | Puntos escaneados |
| sincronizado | boolean | DEFAULT false | Sync desde móvil completado |
| created\_at | timestamptz | DEFAULT now() |  |

## **2.7 escaneos**

Registro de cada QR escaneado durante una ronda. Esta es la tabla central de evidencia.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador (generado en móvil) |
| ronda\_id | uuid | FK → rondas(id) | Ronda a la que pertenece |
| punto\_control\_id | uuid | FK → puntos\_control(id) | Punto escaneado |
| guardia\_id | uuid | FK → usuarios(id) | Guardia que escaneó |
| timestamp\_escaneo | timestamptz | NOT NULL | Momento real del escaneo (offline-safe) |
| timestamp\_sync | timestamptz |  | Momento en que llegó al servidor |
| latitud | numeric(10,7) |  | GPS en el momento del escaneo |
| longitud | numeric(10,7) |  | GPS en el momento del escaneo |
| offline | boolean | DEFAULT false | true si se escaneó sin conexión |
| foto\_url | text |  | URL en Storage (evidencia fotográfica) |

## **2.8 incidentes**

Generado automáticamente cuando una ronda vence sin completarse, o manualmente por el guardia.

| Columna | Tipo | Restricción | Descripción |
| :---- | :---- | :---- | :---- |
| id | uuid | PK | Identificador único |
| ronda\_id | uuid | FK → rondas(id) | Ronda relacionada |
| tipo | enum | NOT NULL: ronda\_vencida|ronda\_incompleta|manual | Origen del incidente |
| descripcion | text |  | Detalle adicional |
| estado | enum | NOT NULL: nuevo|revisado|cerrado | Estado de gestión |
| notificado | boolean | DEFAULT false | Si se envió push al supervisor |
| supervisor\_id | uuid | FK → usuarios(id) | Supervisor notificado |
| created\_at | timestamptz | DEFAULT now() | Momento del incidente |
| cerrado\_at | timestamptz |  | Cuándo fue cerrado |
| notas\_cierre | text |  | Observaciones al cerrar |

# **3\. Schema SQLite — App Móvil (Guardia)**

El dispositivo Android mantiene una copia local mínima para operar completamente offline. Solo incluye los datos necesarios para que el guardia ejecute su turno activo.

## **3.1 Tablas locales**

| Tabla | Propósito | Sincronización |
| :---- | :---- | :---- |
| config\_sesion | Datos del guardia autenticado y turno activo | Solo lectura — descarga al iniciar sesión |
| puntos\_control\_local | Lista de puntos QR del establecimiento asignado | Solo lectura — descarga al iniciar turno |
| rondas\_local | Rondas creadas localmente pendientes de sync | Subida — se elimina tras sync exitoso |
| escaneos\_local | Escaneos realizados offline | Subida — se elimina tras sync exitoso |
| cola\_sync | Cola ordenada de operaciones pendientes | Cola de trabajo — se vacía al sincronizar |

## **3.2 Tabla: escaneos\_local**

CREATE TABLE IF NOT EXISTS escaneos\_local (

  id           TEXT PRIMARY KEY,  \-- UUID generado en el móvil

  ronda\_id     TEXT NOT NULL,

  punto\_id     TEXT NOT NULL,

  qr\_token     TEXT NOT NULL,      \-- token leído del QR

  timestamp    INTEGER NOT NULL,    \-- Unix epoch ms (momento real)

  lat          REAL,

  lng          REAL,

  foto\_path    TEXT,               \-- ruta local del archivo

  sincronizado INTEGER DEFAULT 0   \-- 0=pendiente, 1=enviado

);

## **3.3 Tabla: rondas\_local**

CREATE TABLE IF NOT EXISTS rondas\_local (

  id                 TEXT PRIMARY KEY,

  turno\_id           TEXT NOT NULL,

  establecimiento\_id TEXT NOT NULL,

  estado             TEXT DEFAULT 'en\_curso',

  inicio\_real        INTEGER NOT NULL,  \-- Unix epoch ms

  fin\_real           INTEGER,

  sincronizado       INTEGER DEFAULT 0

);

## **3.4 Tabla: cola\_sync**

CREATE TABLE IF NOT EXISTS cola\_sync (

  id          INTEGER PRIMARY KEY AUTOINCREMENT,

  tipo        TEXT NOT NULL,    \-- 'escaneo' | 'ronda'

  referencia\_id TEXT NOT NULL,  \-- id del registro a sincronizar

  intentos    INTEGER DEFAULT 0,

  ultimo\_error TEXT,

  created\_at  INTEGER NOT NULL  \-- Unix epoch ms

);

# **4\. Políticas de Row Level Security (Supabase)**

Supabase RLS garantiza que cada rol solo acceda a los datos que le corresponden.

| Tabla | Rol | Política |
| :---- | :---- | :---- |
| escaneos | guardia | Solo puede ver e insertar sus propios escaneos (guardia\_id \= auth.uid()) |
| rondas | guardia | Solo puede ver e insertar sus propias rondas |
| rondas | supervisor | Ve todas las rondas de sus establecimientos asignados |
| incidentes | supervisor | Ve y actualiza incidentes de sus establecimientos |
| puntos\_control | guardia | Solo lectura — SELECT únicamente |
| usuarios | admin | Acceso completo a todos los registros |
| incidentes | admin | Acceso completo — puede cerrar y gestionar |

# **5\. Índices recomendados**

\-- Rondas por guardia y fecha (consultas frecuentes del dashboard)

CREATE INDEX idx\_rondas\_guardia\_fecha ON rondas(guardia\_id, inicio\_programado DESC);

\-- Escaneos por ronda (carga del detalle de ronda)

CREATE INDEX idx\_escaneos\_ronda ON escaneos(ronda\_id);

\-- Incidentes no cerrados (para el dashboard del supervisor)

CREATE INDEX idx\_incidentes\_abiertos ON incidentes(estado) WHERE estado \!= 'cerrado';

\-- QR token lookup (crítico: es la búsqueda de cada escaneo)

CREATE UNIQUE INDEX idx\_qr\_token ON puntos\_control(qr\_token);