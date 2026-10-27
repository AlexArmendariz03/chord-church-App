import { defineConfig } from "prisma/config"

// Prisma 7 ya no lee .env solo. En local se carga aquí; en Vercel y en CI las variables ya vienen del entorno.
try {
  process.loadEnvFile()
} catch {
  // Sin archivo .env
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations"
  },
  // Las migraciones usan la conexión directa (sin pooling). `prisma generate` no la necesita,
  // por eso no se exige aquí con env().
  datasource: {
    url: process.env.DIRECT_URL
  }
})
