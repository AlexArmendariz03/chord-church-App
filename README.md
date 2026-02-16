# Chord Church

Aplicación Next.js modernizada para Node 20, con arquitectura de negocio desacoplada para facilitar mantenimiento, validación y pruebas automatizadas.

## Requisitos

- Node.js 20+
- npm 10+

## Estructura clave

- `pages/`: UI y rutas HTTP de Next.js.
- `src/server/auth/`: capa de negocio de autenticación (validaciones + casos de uso).
- `tests/`: pruebas de reglas de negocio con `node:test`.

## Scripts

```bash
npm run dev      # Desarrollo
npm run build    # Build de producción
npm run start    # Ejecutar build
npm run lint     # Lint
npm run test     # Pruebas de negocio
```

## Flujo de autenticación

1. `pages/api/register.js` y `pages/api/login.js` sólo manejan protocolo HTTP.
2. Delegan a `createAuthService` para ejecutar reglas de negocio.
3. La validación de credenciales se centraliza en `validation.mjs`.
4. La persistencia se encapsula en `repository.mjs` (Prisma).

Esto permite probar reglas de negocio sin depender de base de datos real.
