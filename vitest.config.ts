import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Pruebas de la lógica pura (sin navegador ni base de datos): npm test
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) }
  },
  test: {
    include: ["**/*.test.ts"],
    exclude: ["node_modules/**", ".next/**"]
  }
})
