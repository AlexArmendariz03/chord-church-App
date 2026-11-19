// Valida el nombre de una iglesia al crearla o renombrarla (página Iglesias y su API)

const MAX_NAME_LENGTH = 80

export function parseChurchName(name: unknown): { error: string } | { error?: undefined; name: string } {
  // Los espacios de más se juntan en uno: "Iglesia  Centro " y "Iglesia Centro" son la misma
  const clean = typeof name === "string" ? name.replace(/\s+/g, " ").trim() : ""
  if (clean.length < 2) return { error: "Escribe el nombre de la iglesia" }
  if (clean.length > MAX_NAME_LENGTH) return { error: `El nombre puede tener hasta ${MAX_NAME_LENGTH} caracteres` }
  return { name: clean }
}
