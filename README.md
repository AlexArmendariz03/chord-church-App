# Chord Church

Aplicación reorganizada a **Next.js + TypeScript** con estructura `src/` y pruebas de validación con **Jest**.

## Requisitos

- Node.js `20.x`
- npm `10+` recomendado

## Scripts principales

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test
```

## Estructura principal

- `src/pages`: páginas y API routes en TypeScript
- `src/components`: componentes de UI
- `src/lib`: utilidades compartidas (Prisma + validaciones)
- `src/styles`: estilos SCSS
- `src/lib/validation/*.test.ts`: pruebas unitarias

## Validaciones

Se añadió validación de credenciales reutilizable (`validateCredentials`) usada en login y registro para garantizar campos requeridos y mínimos de longitud.
