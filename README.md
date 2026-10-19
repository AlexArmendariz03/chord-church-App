# Chord Church

## Node Version

- Requerido: Node 22 (ver `.nvmrc`)

## Getting Started

1. Copia `.env.examples` a `.env` y completa `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET`
   (genera el secreto con `openssl rand -base64 48`).
2. Instala dependencias (`npm install` también genera el cliente de Prisma).
3. Ejecuta el servidor de desarrollo:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Usuarios

Crea o actualiza usuarios en la base de datos con:

```bash
npm run create-user -- <usuario> <contraseña> leader   # o musico
```

En desarrollo (`npm run dev`) existen además dos usuarios de prueba: `leader` y `musico`.
**En producción están desactivados**: solo pueden entrar usuarios de la base de datos.

## Despliegue

Configura en el hosting las variables `DATABASE_URL`, `DIRECT_URL` y `SESSION_SECRET`.
