# Chord Church

Alabanzas, servicios y letras con acordes en vivo para el equipo de alabanza.
Next.js (App Router) + Prisma + PostgreSQL (Supabase), desplegada en Vercel.

## Requisitos

- Node 22 (ver `.nvmrc`)

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
| `npm run create-user -- <usuario> <contraseña> [rol]` | Crea o actualiza un usuario |
| `npm run import-songs -- <archivo.json> [--apply]` | Importa alabanzas desde un JSON; sin `--apply` solo muestra qué haría |

Las pruebas van junto al archivo que prueban (`transpose.ts` → `transpose.test.ts`) y cubren la lógica
pura: transposición, letras, paginación, reglas de servicios, permisos y validación de la API.
En GitHub, cada push a `main` o `dev` y cada PR corre lint, tipos y pruebas (`.github/workflows/ci.yml`).

## Usuarios y roles

Crea o actualiza usuarios en la base de datos con:

```bash
npm run create-user -- <usuario> <contraseña> leader   # o musico, o proyeccion
```

| Rol | Qué puede hacer |
|---|---|
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

Aplica las migraciones **antes** de publicar el código que las usa.

## Estructura

```
app/            Páginas y rutas de la API (App Router), sin lógica: solo llaman a features/
  (app)/        Páginas con sesión; su layout pone el encabezado, el menú y el recorrido
  api/          Rutas de la API: revisan permisos, validan y llaman a las consultas
features/       Cada funcionalidad con su parte client/ y server/
  auth/         Inicio de sesión
  dashboard/    Inicio
  layout/       Encabezado, menú, sesión y tema
  live/         En curso: letras con acordes, transposición, paginación y modo escenario
  services/     Servicios: lista, formulario, tarjetas y sus consultas
  songs/        Alabanzas: lista, editor y sus consultas
  tour/         Recorrido de ayuda
shared/         Código común
  auth/         Roles y permisos
  client/       Llamadas a la API y hooks del navegador
  server/       Prisma, sesión y respuestas de la API
  components/   Componentes que usan varias funcionalidades
  utils/        Funciones puras (fechas, reglas de servicios)
types/          Tipos compartidos entre cliente y servidor, derivados de Prisma
styles/         Estilos globales y de cada componente (SCSS)
prisma/         Esquema, migraciones y scripts de usuarios e importación
generated/      Cliente de Prisma generado (no se versiona)
```

Para agregar una funcionalidad: su carpeta en `features/` con `client/` (componentes, hooks y su
`*-api.ts` para llamar a la API) y `server/` (validación `*-input.ts` y consultas `*-queries.ts`),
y en `app/` solo la página o ruta que la usa. Las listas piden solo los campos que muestran
(`types/services.ts`).

## Despliegue

Configura en el hosting las variables `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET`.
