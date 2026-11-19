# Chord Church

Alabanzas, servicios y letras con acordes en vivo para el equipo de alabanza.
Next.js (App Router) + Prisma + PostgreSQL (Supabase), desplegada en Vercel.

## Requisitos

- Node 24 (ver `.nvmrc`)

## Empezar

1. Copia `.env.examples` a `.env` y completa `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET`
   (genera el secreto con `openssl rand -base64 48`).
2. Instala dependencias (`npm install` también genera el cliente de Prisma).
3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `npm start` | Compila y sirve la versión de producción |
| `npm run lint` | Revisa el código con ESLint (`npm run lint:fix` corrige lo automático) |
| `npm run typecheck` | Revisa los tipos de TypeScript |
| `npm test` | Corre las pruebas (Vitest); `npm run test:watch` las repite al guardar |
| `npm run create-user -- <usuario> <contraseña> [rol] [iglesia]` | Crea o actualiza un usuario |
| `npm run import-songs -- <archivo.json> [--apply] [--iglesia=<id o nombre>]` | Importa alabanzas al cancionero de una iglesia; sin `--apply` solo muestra qué haría |

Las pruebas van junto al archivo que prueban (`transpose.ts` → `transpose.test.ts`) y cubren la lógica
pura: transposición, letras, paginación, reglas de servicios, permisos y validación de la API.
En GitHub, cada push a `main` o `dev` y cada PR corre lint, tipos, pruebas y la revisión de migraciones
(`.github/workflows/ci.yml`). `main` y `dev` están protegidas: solo cambian por PR y con esos checks y
el de Vercel en verde.

## Iglesias, usuarios y roles

Cada iglesia tiene sus propios usuarios, su cancionero y sus servicios; una iglesia nunca ve los de otra.
Cada usuario pertenece a una sola iglesia y los roles son los mismos en todas. La sesión lleva la
iglesia (`churchId`) y cada consulta de `server/` la recibe para filtrar por ella. La base también lo
cuida: `ServiceSong` guarda la iglesia y sus llaves van a `(id, churchId)` del servicio y de la
alabanza, así que no acepta en un servicio una alabanza del cancionero de otra iglesia.

El master crea iglesias en la página **Iglesias**. Cada una tiene su página (`/iglesias/<id>`) con dos
pestañas, **Usuarios** y **Alabanzas**, para administrar a sus usuarios y su cancionero (con el mismo
editor) sin cambiar la iglesia de su sesión. Para trabajar en sus servicios o en En curso, entra a ella.
Las rutas `/api/churches/[id]/users` y `/api/churches/[id]/songs` responden igual que `/api/users` y
`/api/songs` (comparten `user-responses.ts` y `song-responses.ts`), pero para esa iglesia. El rol master no se asigna desde la
app, solo con el script:

```bash
npm run create-user -- <usuario> <contraseña> leader "Iglesia Centro"   # rol: master, leader, musico, proyeccion
```

La iglesia es su id o su nombre exacto. Sin ella, un usuario nuevo va a El Palomar (la que
creó la migración `add_churches` con todo lo que ya existía) y uno que ya existe se queda en la suya.
El nombre de usuario es único en toda la app, no solo en su iglesia.

| Rol | Qué puede hacer |
|---|---|
| `master` (Master) | Todas las iglesias: las crea, entra a cualquiera y administra a sus usuarios |
| `leader` (Dirigente) | Todo: alabanzas, servicios y En curso con la vista del dirigente |
| `musico` (Músico) | Ver los servicios y seguir En curso con letras, acordes y tono |
| `proyeccion` (Proyección) | Solo ver la lista de servicios con sus alabanzas, sin tonos |

Los permisos de cada rol están en un solo lugar: `shared/auth/permissions.ts`.

## Base de datos

El esquema está en `prisma/schema.prisma` y cada cambio va en una migración de `prisma/migrations/`.
Con Prisma 7 las conexiones ya no van en el esquema: las migraciones usan `DIRECT_URL` desde
`prisma.config.ts` y la app usa `DATABASE_URL` (con pooling) en `shared/server/prisma.ts`.
El cliente se genera en `generated/prisma/` (no se versiona) al instalar dependencias o con `npx prisma generate`;
se importa desde `@/generated/prisma/client`.

- Crear una migración después de cambiar el esquema: `npx prisma migrate dev --name <descripcion>`
- Aplicar las migraciones pendientes: `npx prisma migrate deploy`
- Ver cuáles faltan: `npx prisma migrate status`

Al llegar a `main`, el workflow **Migraciones en producción** (`.github/workflows/migraciones-produccion.yml`)
aplica las pendientes con `prisma migrate deploy`; necesita el secreto `DIRECT_URL` en GitHub. Como Vercel
publica el código nuevo al mismo tiempo, cada migración debe funcionar también con el código anterior
(agregar columnas o tablas; quitar algo, en un segundo PR cuando el código ya no lo use).
En cada PR, el CI aplica todas las migraciones a un Postgres temporal y revisa que el resultado sea igual
a `prisma/schema.prisma`: si cambias el esquema sin crear su migración, el PR falla.

## Estructura

```
app/            Páginas y rutas de la API (App Router), sin lógica: solo llaman a features/
  (app)/        Páginas con sesión; su layout pone el encabezado, el menú y el recorrido
  api/          Rutas de la API: revisan permisos, validan y llaman a las consultas
features/       Cada funcionalidad: client/ (interfaz), server/ (base de datos) y, en la raíz, sus
                tipos y su lógica pura (sin React ni Prisma), que puede usar cualquiera de las dos
  auth/         Inicio de sesión y la sesión en la interfaz (session-provider)
  churches/     Iglesias (solo el master): lista, crear, renombrar y entrar a una
  dashboard/    Inicio
  layout/       Encabezado, menú y tema
  live/         En curso: paginación en pantalla, controles y modo escenario
  services/     Servicios: lista, formulario, tarjetas, reglas y sus consultas
  songs/        Alabanzas: lista, vista previa, editor (sheet-layout) y sus consultas
  tour/         Recorrido de ayuda
shared/         Código común a varias funcionalidades
  auth/         Roles y permisos
  client/       Llamadas a la API y hooks del navegador
  lyrics/       Letras con acordes: lectura, transposición y paginación (lógica pura; la app móvil
                usa una copia)
  server/       Prisma, sesión y respuestas de la API
  types/        Tipos genéricos (cómo llega un modelo de Prisma por JSON)
  utils/        Funciones puras pequeñas (fechas, nombres)
styles/         Estilos globales y de cada componente (SCSS)
prisma/         Esquema, migraciones y scripts de usuarios e importación
generated/      Cliente de Prisma generado (no se versiona)
```

Para agregar una funcionalidad: su carpeta en `features/` con `client/` (componentes, hooks y su
`*-api.ts` para llamar a la API), `server/` (validación `*-input.ts`, consultas `*-queries.ts` y
qué campos pide cada vista en `*-selects.ts`) y `types.ts` con los tipos que recibe la interfaz;
en `app/` solo la página o ruta que la usa.

- `shared/` no importa nada de `features/`; las funcionalidades sí pueden usar `shared/` y otras
  funcionalidades.
- Los archivos de `server/` empiezan con `import "server-only"`: si un componente los importa por
  error, el build falla en lugar de mandar Prisma o secretos al navegador.

## Despliegue

Configura en el hosting las variables `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET`.
