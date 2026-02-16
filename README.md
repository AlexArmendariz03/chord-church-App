# Chord Church App

Aplicación Next.js + TypeScript para planificación de alabanzas en iglesia con dos roles: **dirigente** y **músico**.

## Requisitos

- Node.js 20+

## Stack

- Next.js 14 (Pages Router)
- TypeScript
- Jest

## Funcionalidades

- Inicio de sesión por credenciales (usuario/contraseña), con detección automática de rol (`dirigente` o `musico`).
- Dirigente:
  - Carga alabanzas con nombre, letra, tono y categoría (`jubilo`, `adoracion`).
  - Crea un plan por fecha con exactamente 2 alabanzas de júbilo y 2 de adoración.
  - Consulta planes guardados.
- Músico:
  - Consulta los planes guardados.
  - Abre cada alabanza para ver letra y tono.

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run build
npm start
```

## API

- `POST /api/auth/login`
- `GET /api/songs`
- `POST /api/songs`
- `PUT /api/songs/:id`
- `GET /api/service-plans`
- `POST /api/service-plans`

Persistencia local en `data/church-data.json`.
