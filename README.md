# Chord Church

## Node Version

- Requerido: `v20.18.0` (ver `.nvmrc`)

## Getting Started

Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Credenciales hardcodeadas (no expiran)

Para acceso rápido sin depender de la base de datos, existen dos usuarios estáticos en `pages/api/login.ts`:

- **Leader**
  - usuario: `leader`
  - contraseña: `leader123`
- **Músico**
  - usuario: `musico`
  - contraseña: `musico123`

Estas credenciales siempre están disponibles para login.

## Notas

- También puedes seguir usando usuarios guardados en base de datos; el endpoint `/api/login` primero valida usuarios estáticos y luego usuarios en Prisma.
