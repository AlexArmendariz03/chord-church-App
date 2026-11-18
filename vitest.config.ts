import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Pruebas de la lógica pura (sin navegador ni base de datos): npm test
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
      // "server-only" falla fuera de Next a propósito; en las pruebas no hay navegador que proteger
      "server-only": fileURLToPath(new URL("./node_modules/server-only/empty.js", import.meta.url))
    }
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"]
  }
})
